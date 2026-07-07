import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { Balance } from '../src/game/Balance';
import { META_PROGRESS_KEY } from '../src/game/MetaProgress';

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };
type EnemySnapshot = {
  id: number;
  x: number;
  z: number;
  vx: number;
  vz: number;
  spreadOffset: number;
  zone?: string;
};
type FormationMetrics = {
  count: number;
  lateralSpread: number;
  maxSameFile: number;
  fullOverlapPairs: number;
  deepRiverCount: number;
};

const ARTIFACT_DIR = path.resolve('artifacts/048');
const META_WITH_RING = { version: 1, tracks: { territory: 1, science: 0, hero: 0, agent: 0 } };
const QUERY = '?debug&timescale=6&nowaves&nolevel&nokill&nopause&nosteal&nowreck';

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
      localStorage.setItem(key, JSON.stringify(meta));
    },
    { key: META_PROGRESS_KEY, meta: META_WITH_RING },
  );
}

async function openGame(page: Page, seed: string): Promise<ErrorBucket> {
  const errors = collectErrors(page);
  await page.goto(`${QUERY}&seed=${seed}`);
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 4);
  await expect
    .poll(
      () =>
        page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.hp.filter((entry) => entry.id === 'palisade').length ?? 0),
      { timeout: 8_000 },
    )
    .toBe(Balance.meta.territoryRing.length);
  return errors;
}

async function setBalance(page: Page, key: string, value: number): Promise<void> {
  await expect(page.evaluate(([path, next]) => window.__GR_TEST__?.setBalance(path, next), [key, value] as const)).resolves.toBe(
    true,
  );
}

async function spawnNorthFile(page: Page): Promise<void> {
  await page.evaluate(() => {
    window.__GR_TEST__?.clearEnemies();
    window.__GR_TEST__?.teleport(0, 12);
    for (let i = 0; i < 24; i += 1) {
      window.__GR_TEST__?.scriptEnemyAt(0, 24 + i * 0.42, 0, 12, 2.7);
    }
  });
}

async function captureFormation(page: Page, name: string): Promise<FormationMetrics> {
  await expect
    .poll(() => readFormationMetrics(page).then((metrics) => metrics.count), { timeout: 10_000 })
    .toBeGreaterThanOrEqual(14);
  const metrics = await readFormationMetrics(page);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, `${name}.png`), fullPage: true });
  return metrics;
}

async function determinismHash(page: Page, seed: string): Promise<{ hash: string; errors: ErrorBucket }> {
  const errors = await openGame(page, seed);
  await spawnNorthFile(page);
  const payload = await page.evaluate(() =>
    (window.__GR_TEST__?.enemyPositions() ?? []).map((enemy) => ({
      id: enemy.id,
      offset: Number(enemy.spreadOffset.toFixed(4)),
    })),
  );
  return { hash: createHash('sha256').update(JSON.stringify(payload)).digest('hex'), errors };
}

async function readFormationMetrics(page: Page): Promise<FormationMetrics> {
  return page.evaluate(() => {
    const enemies = (window.__GR_TEST__?.enemyPositions() ?? []) as EnemySnapshot[];
    const inFunnel = enemies.filter((enemy) => enemy.z >= 15 && enemy.z <= 25);
    const xs = inFunnel.map((enemy) => enemy.x);
    const lateralSpread = xs.length > 0 ? Math.max(...xs) - Math.min(...xs) : 0;
    const bins = new Map<number, number[]>();
    let fullOverlapPairs = 0;
    for (let i = 0; i < inFunnel.length; i += 1) {
      const enemy = inFunnel[i]!;
      const bin = Math.round(enemy.x / 0.35);
      const lane = bins.get(bin) ?? [];
      lane.push(enemy.z);
      bins.set(bin, lane);
      for (let j = i + 1; j < inFunnel.length; j += 1) {
        const other = inFunnel[j]!;
        if (Math.hypot(enemy.x - other.x, enemy.z - other.z) < 0.18) fullOverlapPairs += 1;
      }
    }
    let maxSameFile = 0;
    for (const zs of bins.values()) {
      zs.sort((a, b) => a - b);
      let run = 0;
      let last = Number.NEGATIVE_INFINITY;
      for (const z of zs) {
        run = z - last <= 0.75 ? run + 1 : 1;
        last = z;
        maxSameFile = Math.max(maxSameFile, run);
      }
    }
    return {
      count: inFunnel.length,
      lateralSpread: Number(lateralSpread.toFixed(3)),
      maxSameFile,
      fullOverlapPairs,
      deepRiverCount: enemies.filter((enemy) => enemy.zone === 'river').length,
    };
  });
}

test('funnel formation spread breaks nose-to-tail files', async ({ page }, testInfo: TestInfo) => {
  test.setTimeout(45_000);
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await installMetaSwitch(page);

  const errors = await openGame(page, 'task-048-formation');
  await setBalance(page, 'enemy.formationSpreadWidth', 0);
  await setBalance(page, 'enemy.formationSeparationStrength', 0);
  await spawnNorthFile(page);
  const before = await captureFormation(page, `${testInfo.project.name}-before-single-file`);

  await openGame(page, 'task-048-formation');
  await spawnNorthFile(page);
  const after = await captureFormation(page, `${testInfo.project.name}-after-staggered-gap-assault`);

  const report = { project: testInfo.project.name, before, after };
  await writeFile(path.join(ARTIFACT_DIR, `formation-report-${testInfo.project.name}.json`), `${JSON.stringify(report, null, 2)}\n`);
  expect(after.lateralSpread).toBeGreaterThan(Math.max(before.lateralSpread + 0.7, 1.4));
  expect(after.maxSameFile).toBeLessThanOrEqual(4);
  expect(after.fullOverlapPairs).toBe(0);
  expect(after.deepRiverCount).toBe(0);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('formation offsets are deterministic for the m6 seed', async ({ browser }, testInfo: TestInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chrome', 'one deterministic hash proof is enough');
  test.setTimeout(30_000);
  await mkdir(ARTIFACT_DIR, { recursive: true });

  const pageA = await browser.newPage();
  await installMetaSwitch(pageA);
  const runA = await determinismHash(pageA, 'm6-r3a-determinism');
  await pageA.close();

  const pageB = await browser.newPage();
  await installMetaSwitch(pageB);
  const runB = await determinismHash(pageB, 'm6-r3a-determinism');
  await pageB.close();

  const report = { seed: 'm6-r3a-determinism', hashA: runA.hash, hashB: runB.hash };
  await writeFile(path.join(ARTIFACT_DIR, 'determinism-report.json'), `${JSON.stringify(report, null, 2)}\n`);
  expect(runA.hash).toBe(runB.hash);
  expect(runA.errors.consoleErrors).toEqual([]);
  expect(runA.errors.pageErrors).toEqual([]);
  expect(runB.errors.consoleErrors).toEqual([]);
  expect(runB.errors.pageErrors).toEqual([]);
});
