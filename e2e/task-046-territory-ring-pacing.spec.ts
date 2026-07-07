import { expect, test, type Page } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { Balance } from '../src/game/Balance';
import { META_PROGRESS_KEY } from '../src/game/MetaProgress';

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };
type ContactRecord = { wave: number; seconds: number };
type WallProbe = {
  crossedThrough: boolean;
  done: boolean;
  samples: number;
  last: { x: number; z: number } | null;
};

const ARTIFACT_DIR = path.resolve('artifacts/046');
const META_WITH_RING = { version: 1, tracks: { territory: 1, science: 0, hero: 0, agent: 0 } };
const QUERY_BASE = '?debug&timescale=30&nolevel&nokill&nopause&nosteal&nowreck';
const CONTACT_RADIUS = Balance.hero.radius + Balance.enemy.touchRadius;
const RING_CENTER = { x: 0, z: 12 };

const CONTACT_BALANCE: Array<[string, number]> = [
  ['enemy.contactDamage', 0],
  ['waves.graceSeconds', 0.2],
  ['waves.waveInterval', 18],
  ['waves.trickleInterval', 9999],
  ['waves.pulseBase', 1],
  ['waves.pulsePerWave', 0],
  ['waves.pulsesPerWave', 1],
  ['waves.edgesPerPulse', 1],
  ['waves.aliveCap', 8],
];
const TRICKLE_BALANCE: Array<[string, number]> = [
  ['enemy.contactDamage', 0],
  ['waves.graceSeconds', 0.1],
  ['waves.waveInterval', 999],
  ['waves.trickleInterval', 0.3],
  ['waves.aliveCap', 4],
];

function collectErrors(page: Page): ErrorBucket {
  const bucket: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') bucket.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => bucket.pageErrors.push(error.message));
  return bucket;
}

async function installMetaSwitch(page: Page): Promise<void> {
  await page.addInitScript(
    ({ key, meta }) => {
      localStorage.clear();
      if (new URLSearchParams(location.search).get('territoryRing') === '1') {
        localStorage.setItem(key, JSON.stringify(meta));
      }
    },
    { key: META_PROGRESS_KEY, meta: META_WITH_RING },
  );
}

async function openGame(page: Page, territoryRing: boolean, seed: string): Promise<void> {
  await page.goto(`${QUERY_BASE}&seed=${seed}&territoryRing=${territoryRing ? '1' : '0'}`);
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 2);
}

async function configureContactRun(page: Page, overrides: Array<[string, number]> = []): Promise<void> {
  const balance = new Map<string, number>(CONTACT_BALANCE);
  for (const [key, value] of overrides) balance.set(key, value);
  for (const [key, value] of balance) {
    await expect(page.evaluate(([path, next]) => window.__GR_TEST__?.setBalance(path, next), [key, value] as const)).resolves.toBe(
      true,
    );
  }
  await page.evaluate(() => window.__GR_TEST__?.resetRun());
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.wave ?? -1), { timeout: 8_000 }).toBe(0);
}

async function configureTrickleRun(page: Page): Promise<void> {
  for (const [key, value] of TRICKLE_BALANCE) {
    await expect(page.evaluate(([path, next]) => window.__GR_TEST__?.setBalance(path, next), [key, value] as const)).resolves.toBe(
      true,
    );
  }
  await page.evaluate(() => window.__GR_TEST__?.resetRun());
}

async function waitForRing(page: Page): Promise<void> {
  await expect
    .poll(
      () =>
        page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.hp.filter((entry) => entry.id === 'palisade').length ?? 0),
      { timeout: 8_000 },
    )
    .toBe(Balance.meta.territoryRing.length);
}

async function measureContactTimes(page: Page): Promise<ContactRecord[]> {
  return page.evaluate(
    async ({ radius }) => {
      const radiusSq = radius * radius;
      const records: ContactRecord[] = [];
      let activeWave = 0;
      let spawnAt = 0;
      let waiting = false;

      return await new Promise<ContactRecord[]>((resolve) => {
        const tick = () => {
          const diagnostics = window.__THREE_GAME_DIAGNOSTICS__;
          const now = diagnostics?.timeAlive ?? 0;
          if (diagnostics && !waiting && diagnostics.wave > activeWave && diagnostics.wave <= 3) {
            activeWave = diagnostics.wave;
            spawnAt = diagnostics.lastPulseAt;
            waiting = true;
          }
          if (diagnostics && waiting) {
            const hero = diagnostics.heroPos;
            const hit = window.__GR_TEST__?.enemyPositions().some((enemy) => {
              const dx = enemy.x - hero.x;
              const dz = enemy.z - hero.z;
              return dx * dx + dz * dz <= radiusSq;
            });
            if (hit) {
              records.push({ wave: activeWave, seconds: Number((now - spawnAt).toFixed(2)) });
              waiting = false;
              window.__GR_TEST__?.clearEnemies();
            }
          }
          if (records.length >= 3 || now > 90) resolve(records);
          else requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
    },
    { radius: CONTACT_RADIUS },
  );
}

async function captureRingScreenshots(page: Page): Promise<void> {
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await waitForRing(page);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'ring-gaps.png'), fullPage: true });
  await page.waitForFunction(
    ({ gapHalf }) => {
      const diagnostics = window.__THREE_GAME_DIAGNOSTICS__;
      if (!diagnostics) return false;
      const hero = diagnostics.heroPos;
      return window.__GR_TEST__?.enemyPositions().some((enemy) => {
        const dx = enemy.x - hero.x;
        const dz = enemy.z - hero.z;
        const nearNorthSouthGap = Math.abs(dx) <= gapHalf && Math.abs(Math.abs(dz) - 4) <= 2.5;
        const nearEastWestGap = Math.abs(dz) <= gapHalf && Math.abs(Math.abs(dx) - 5) <= 2.5;
        return nearNorthSouthGap || nearEastWestGap;
      });
    },
    { gapHalf: Balance.meta.territoryRingGapHalfWidth + 0.35 },
    { timeout: 15_000 },
  );
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'wave-funnel.png'), fullPage: true });
}

async function assertRingSegmentBlocks(page: Page): Promise<void> {
  await page.evaluate(() => window.__GR_TEST__?.clearEnemies());
  await page.evaluate(() => {
    window.__TASK_046_RING_BLOCK__ = { crossedThrough: false, done: false, samples: 0, last: null };
    const startAt = window.__THREE_GAME_DIAGNOSTICS__?.timeAlive ?? 0;
    const segment = { minX: 1.5, maxX: 4.5, innerZ: 15.5 };
    const tick = () => {
      const probe = window.__TASK_046_RING_BLOCK__!;
      const enemy = window.__GR_TEST__?.enemyPositions()[0];
      const now = window.__THREE_GAME_DIAGNOSTICS__?.timeAlive ?? startAt;
      if (enemy) {
        const last = probe.last;
        if (last && last.z >= segment.innerZ && enemy.z < segment.innerZ && enemy.x >= segment.minX && enemy.x <= segment.maxX) {
          probe.crossedThrough = true;
        }
        probe.last = { x: enemy.x, z: enemy.z };
        probe.samples += 1;
      }
      if (now - startAt < 10) requestAnimationFrame(tick);
      else probe.done = true;
    };
    requestAnimationFrame(tick);
  });
  await page.evaluate(() => window.__GR_TEST__?.scriptEnemyAt(3, 20, 3, 12, 3));
  await expect.poll(() => page.evaluate(() => window.__TASK_046_RING_BLOCK__?.done ?? false), { timeout: 8_000 }).toBe(true);
  const probe = await page.evaluate(() => window.__TASK_046_RING_BLOCK__);
  expect(probe?.samples).toBeGreaterThan(0);
  expect(probe?.crossedThrough).toBe(false);
}

async function assertPreWaveTrickleUsesGap(page: Page): Promise<void> {
  await expect
    .poll(
      () =>
        page.evaluate(({ center }) => {
          const diagnostics = window.__THREE_GAME_DIAGNOSTICS__;
          const enemy = window.__GR_TEST__?.enemyPositions()[0];
          if (!diagnostics || !enemy?.edge) return null;
          return enemy.edge === 'north' || enemy.edge === 'south' ? enemy.x - center.x : enemy.z - center.z;
        }, { center: RING_CENTER }),
      { timeout: 8_000 },
    )
    .not.toBeNull();
  const lateral = await page.evaluate(({ center }) => {
    const enemy = window.__GR_TEST__!.enemyPositions()[0]!;
    return enemy.edge === 'north' || enemy.edge === 'south' ? enemy.x - center.x : enemy.z - center.z;
  }, { center: RING_CENTER });
  expect(Math.abs(lateral)).toBeLessThanOrEqual(Balance.meta.territoryRingGapHalfWidth);
}

async function assertMovedHeroUsesFixedGap(page: Page): Promise<void> {
  await page.evaluate(() => window.__GR_TEST__?.teleport(4, 16));
  await expect
    .poll(
      () =>
        page.evaluate(({ center }) => {
          const diagnostics = window.__THREE_GAME_DIAGNOSTICS__;
          const enemy = window.__GR_TEST__?.enemyPositions()[0];
          if (!diagnostics || !enemy?.edge || diagnostics.wave < 1) return null;
          const fixedLateral =
            enemy.edge === 'north' || enemy.edge === 'south' ? enemy.x - center.x : enemy.z - center.z;
          const heroLateral =
            enemy.edge === 'north' || enemy.edge === 'south' ? enemy.x - diagnostics.heroPos.x : enemy.z - diagnostics.heroPos.z;
          return { fixedLateral, heroLateral };
        }, { center: RING_CENTER }),
      { timeout: 12_000 },
    )
    .not.toBeNull();
  const lane = await page.evaluate(({ center }) => {
    const diagnostics = window.__THREE_GAME_DIAGNOSTICS__!;
    const enemy = window.__GR_TEST__!.enemyPositions()[0]!;
    const fixedLateral = enemy.edge === 'north' || enemy.edge === 'south' ? enemy.x - center.x : enemy.z - center.z;
    const heroLateral =
      enemy.edge === 'north' || enemy.edge === 'south' ? enemy.x - diagnostics.heroPos.x : enemy.z - diagnostics.heroPos.z;
    return { fixedLateral, heroLateral };
  }, { center: RING_CENTER });
  expect(Math.abs(lane.fixedLateral)).toBeLessThanOrEqual(Balance.meta.territoryRingGapHalfWidth);
  expect(Math.abs(lane.heroLateral)).toBeGreaterThan(Balance.meta.territoryRingGapHalfWidth + 1);
}

test('territory ring gaps keep waves 1-3 contact time paced', async ({ page }) => {
  test.setTimeout(60_000);
  const errors = collectErrors(page);
  await installMetaSwitch(page);

  await openGame(page, true, 'task-046-shots');
  await configureContactRun(page);
  await captureRingScreenshots(page);

  await openGame(page, true, 'task-046-trickle');
  await configureTrickleRun(page);
  await waitForRing(page);
  await assertPreWaveTrickleUsesGap(page);

  await openGame(page, true, 'task-046-moved-hero');
  await configureContactRun(page, [
    ['waves.waveInterval', 60],
    ['enemy.speed', 0],
  ]);
  await waitForRing(page);
  await assertMovedHeroUsesFixedGap(page);

  await openGame(page, false, 'task-046-measure');
  await configureContactRun(page);
  const noRing = await measureContactTimes(page);

  await openGame(page, true, 'task-046-measure');
  await configureContactRun(page);
  await waitForRing(page);
  const ring = await measureContactTimes(page);
  await assertRingSegmentBlocks(page);

  expect(noRing).toHaveLength(3);
  expect(ring).toHaveLength(3);
  const ratios = ring.map((record, index) => {
    const baseline = noRing[index]!;
    expect(record.wave).toBe(baseline.wave);
    const ratio = record.seconds / baseline.seconds;
    expect(ratio).toBeGreaterThanOrEqual(0.75);
    expect(ratio).toBeLessThanOrEqual(1.25);
    return { wave: record.wave, ratio: Number(ratio.toFixed(3)) };
  });

  await mkdir(ARTIFACT_DIR, { recursive: true });
  await writeFile(path.join(ARTIFACT_DIR, 'contact-times.json'), JSON.stringify({ noRing, ring, ratios }, null, 2));
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

declare global {
  interface Window {
    __TASK_046_RING_BLOCK__?: WallProbe;
  }
}
