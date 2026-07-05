import { expect, test, type Page, type TestInfo } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { Balance } from '../src/game/Balance';

type BuildableId = 'sentry_beacon' | 'palisade' | 'sluice' | 'stockpile' | 'turret';
type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };
type HpEntry = {
  id: BuildableId;
  index: number;
  hp: number;
  maxHp: number;
  wrecked: boolean;
};
type SelfHoldPulse = {
  wave: number;
  pulse: number;
  at: number;
  standing: number;
  stockpileAlive: boolean;
  wreckers: number;
  hitsResolved: number;
};
type SelfHoldState = {
  done: boolean;
  failure: string | null;
  armedAt: number;
  initialStanding: number;
  pulses: SelfHoldPulse[];
  final: SelfHoldPulse | null;
};
type TtkReport = {
  wave10: TtkSample;
  wave21: TtkSample;
  ratio: number;
};
type TtkSample = {
  wave: number;
  ttk: number;
  blastDamage: number;
  enemyHp: number;
  weaponSplit: Record<string, number | undefined>;
};

const reportDir = path.resolve('test-results/m2-07-base-self-hold');

function collectErrors(page: Page): ErrorBucket {
  const bucket: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') bucket.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => bucket.pageErrors.push(error.message));
  return bucket;
}

async function openGame(page: Page, query: string): Promise<ErrorBucket> {
  const errors = collectErrors(page);
  await page.goto(`/${query}`);
  await expect(page.locator('#game-canvas')).toBeVisible();
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  return errors;
}

async function setBalance(page: Page, pathKey: string, value: number): Promise<void> {
  await expect(page.evaluate(([key, next]) => window.__GR_TEST__?.setBalance(key, next), [pathKey, value] as const)).resolves.toBe(
    true,
  );
}

async function grantGold(page: Page, amount: number): Promise<void> {
  await page.evaluate((value) => window.__GR_TEST__?.grantGold(value), amount);
}

async function teleport(page: Page, x: number, z: number): Promise<void> {
  await page.evaluate((pos) => window.__GR_TEST__?.teleport(pos.x, pos.z), { x, z });
}

async function placeBuildableAt(page: Page, id: BuildableId, x: number, z: number): Promise<void> {
  const before = await page.evaluate((buildableId) => {
    const entries = window.__THREE_GAME_DIAGNOSTICS__?.build.buildables ?? [];
    return entries.find((entry) => entry.id === buildableId)?.count ?? 0;
  }, id);
  await teleport(page, x, z + 2);
  await page.evaluate((buildableId) => window.__GR_TEST__?.selectBuildable(buildableId), id);
  await expect
    .poll(() =>
      page.evaluate(
        (target) => {
          const build = window.__THREE_GAME_DIAGNOSTICS__?.build;
          if (!build?.ghostValid) return false;
          return Math.abs(build.ghostPos.x - target.x) < 0.05 && Math.abs(build.ghostPos.z - target.z) < 0.05;
        },
        { x, z },
      ),
    )
    .toBe(true);
  await expect(page.evaluate(() => window.__GR_TEST__?.confirmBuild())).resolves.toBe(true);
  await expect
    .poll(() =>
      page.evaluate((buildableId) => {
        const entries = window.__THREE_GAME_DIAGNOSTICS__?.build.buildables ?? [];
        return entries.find((entry) => entry.id === buildableId)?.count ?? 0;
      }, id),
    )
    .toBe(before + 1);
}

async function writeReport(testInfo: TestInfo, name: string, output: unknown): Promise<void> {
  const body = `${JSON.stringify(output, null, 2)}\n`;
  fs.mkdirSync(reportDir, { recursive: true });
  fs.writeFileSync(path.join(reportDir, `${name}.json`), body);
  await testInfo.attach(name, { body, contentType: 'application/json' });
}

async function installSelfHoldTracker(page: Page, targetWave: number): Promise<void> {
  await page.evaluate((wave) => {
    const standing = () => {
      const entries = window.__THREE_GAME_DIAGNOSTICS__?.build.hp ?? [];
      return entries.filter((entry) => entry.hp > 0 && !entry.wrecked).length;
    };
    const stockpileAlive = () => {
      const entries = window.__THREE_GAME_DIAGNOSTICS__?.build.hp ?? [];
      return entries.some((entry) => entry.id === 'stockpile' && entry.hp > 0 && !entry.wrecked);
    };
    const sample = (): SelfHoldPulse | null => {
      const diagnostics = window.__THREE_GAME_DIAGNOSTICS__;
      if (!diagnostics) return null;
      return {
        wave: diagnostics.wave,
        pulse: diagnostics.pulse,
        at: diagnostics.timeAlive,
        standing: standing(),
        stockpileAlive: stockpileAlive(),
        wreckers: diagnostics.wreck.wreckers,
        hitsResolved: diagnostics.wreck.hitsResolved,
      };
    };
    const initial = sample();
    window.__M2_07_SELF_HOLD__ = {
      done: false,
      failure: null,
      armedAt: initial?.at ?? 0,
      initialStanding: initial?.standing ?? 0,
      pulses: [],
      final: null,
    };
    let lastPulseAt = window.__THREE_GAME_DIAGNOSTICS__?.lastPulseAt ?? Number.NEGATIVE_INFINITY;
    const tick = () => {
      const diagnostics = window.__THREE_GAME_DIAGNOSTICS__;
      const state = window.__M2_07_SELF_HOLD__!;
      if (!diagnostics || state.done) return;
      if (diagnostics.lastPulseAt !== lastPulseAt) {
        lastPulseAt = diagnostics.lastPulseAt;
        if (Number.isFinite(lastPulseAt) && diagnostics.wave === wave) {
          const pulse = sample();
          if (pulse) state.pulses.push(pulse);
        }
      }
      const second = state.pulses[1];
      if (second && diagnostics.timeAlive >= second.at + 20) {
        state.final = sample();
        state.done = true;
        return;
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, targetWave);
}

async function hpEntries(page: Page): Promise<HpEntry[]> {
  return page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.hp ?? []);
}

async function spawnClusterAtHero(page: Page, wave: number): Promise<void> {
  const enemyHp = Balance.enemy.hp * Balance.waves.hpScalePerWave ** wave;
  await setBalance(page, 'enemy.hp', enemyHp);
  await page.evaluate(() => window.__GR_TEST__?.clearEnemies());
  await page.evaluate(() => {
    const hero = window.__THREE_GAME_DIAGNOSTICS__?.heroPos ?? { x: 0, z: 0 };
    for (let i = 0; i < 6; i += 1) {
      const angle = (i / 6) * Math.PI * 2;
      window.__GR_TEST__?.spawnEnemyAt(hero.x + Math.cos(angle) * 0.35, hero.z + Math.sin(angle) * 0.35);
    }
  });
}

async function measureBlastTtk(page: Page, targetWave: number): Promise<TtkSample> {
  await page.evaluate((wave) => window.__GR_TEST__?.setWave(wave), targetWave);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.wave ?? -1)).toBe(targetWave);
  const wave = targetWave;
  await page.evaluate(() => window.__GR_TEST__?.clearEnemies());
  const active = await page.evaluate(() => window.__GR_TEST__?.state().arsenal.active);
  if (active !== 'blast') await expect(page.evaluate(() => window.__GR_TEST__?.toggleWeapon())).resolves.toBe('blast');
  await expect.poll(() => page.evaluate(() => window.__GR_TEST__?.state().arsenal.active)).toBe('blast');
  await page.evaluate(() => {
    const hero = window.__THREE_GAME_DIAGNOSTICS__?.heroPos ?? { x: 0, z: 0 };
    window.__GR_TEST__?.setBlastAim(hero.x, hero.z);
  });
  await spawnClusterAtHero(page, wave);
  const start = await page.evaluate(() => ({
    time: window.__THREE_GAME_DIAGNOSTICS__?.timeAlive ?? 0,
    wave: window.__THREE_GAME_DIAGNOSTICS__?.wave ?? 0,
    kills: window.__GR_TEST__?.state().arsenal.blastKills ?? 0,
    split: { ...(window.__THREE_GAME_DIAGNOSTICS__?.build.killsByOwner ?? {}) },
  }));
  expect(start.wave).toBe(wave);
  await expect
    .poll(() => page.evaluate((kills) => (window.__GR_TEST__?.state().arsenal.blastKills ?? 0) - kills, start.kills), {
      timeout: 20_000,
    })
    .toBeGreaterThanOrEqual(6);
  const done = await page.evaluate(() => ({
    time: window.__THREE_GAME_DIAGNOSTICS__?.timeAlive ?? 0,
    wave: window.__THREE_GAME_DIAGNOSTICS__?.wave ?? 0,
    split: { ...(window.__THREE_GAME_DIAGNOSTICS__?.build.killsByOwner ?? {}) },
    damage: window.__GR_TEST__?.state().arsenal.blastDamage ?? 0,
  }));
  expect(done.wave).toBe(wave);
  await expect(page.evaluate(() => window.__GR_TEST__?.toggleWeapon())).resolves.toBe('rig');
  await page.evaluate(() => window.__GR_TEST__?.clearEnemies());
  await setBalance(page, 'waves.waveInterval', 12); // restore the test's fast advancement interval
  return {
    wave,
    ttk: Number((done.time - start.time).toFixed(2)),
    blastDamage: Number(done.damage.toFixed(2)),
    enemyHp: Number((Balance.enemy.hp * Balance.waves.hpScalePerWave ** wave).toFixed(2)),
    weaponSplit: weaponSplitDelta(start.split, done.split),
  };
}

function weaponSplitDelta(
  before: Record<string, number | undefined>,
  after: Record<string, number | undefined>,
): Record<string, number | undefined> {
  const split: Record<string, number | undefined> = {};
  for (const owner of new Set([...Object.keys(before), ...Object.keys(after)])) {
    const delta = (after[owner] ?? 0) - (before[owner] ?? 0);
    if (delta !== 0) split[owner] = delta;
  }
  return split;
}

test('SELF-HOLD reference base survives two wave-15 pulse cycles without hero intervention', async ({ page }, testInfo) => {
  test.setTimeout(60_000);
  const errors = await openGame(page, '?debug&timescale=24&nolevel&nopause&nosteal&seed=m2-07-self-hold');
  await setBalance(page, 'enemy.contactDamage', 0);
  await setBalance(page, 'sparkRig.range', 0);
  await setBalance(page, 'waves.trickleInterval', 9999);
  await setBalance(page, 'wreck.minWave', 15);
  await page.evaluate(() => window.__GR_TEST__?.setBeaconWave(14));
  await grantGold(page, 2_000);

  for (const placement of [
    ['stockpile', -8, 12],
    ['sentry_beacon', -4, 12],
    ['sentry_beacon', 4, 12],
    ['turret', -3, 15],
    ['turret', 3, 15],
    ['palisade', -3, 9],
    ['palisade', -2, 9],
    ['palisade', -1, 9],
    ['palisade', 0, 9],
    ['palisade', 1, 9],
    ['palisade', 2, 9],
  ] as const) {
    await placeBuildableAt(page, placement[0], placement[1], placement[2]);
  }

  const built = await hpEntries(page);
  expect(built).toHaveLength(11);
  expect(built.filter((entry) => entry.id === 'palisade').every((entry) => entry.maxHp > Balance.wreck.hp.palisade)).toBe(true);
  expect(built.filter((entry) => entry.id === 'turret').every((entry) => entry.maxHp > Balance.wreck.hp.turret)).toBe(true);
  expect(built.filter((entry) => entry.id === 'sentry_beacon').every((entry) => entry.maxHp > Balance.wreck.hp.sentry_beacon)).toBe(
    true,
  );

  await page.evaluate(() => window.__GR_TEST__?.clearEnemies());
  await page.evaluate(() => window.__GR_TEST__?.setWave(14));
  await teleport(page, 22, -22);
  await installSelfHoldTracker(page, 15);

  await expect.poll(() => page.evaluate(() => window.__M2_07_SELF_HOLD__?.done ?? false), { timeout: 35_000 }).toBe(true);
  const report = await page.evaluate(() => window.__M2_07_SELF_HOLD__);
  await writeReport(testInfo, 'self-hold', { report, errors });
  expect(report).toBeTruthy();
  if (!report?.final) throw new Error('self-hold probe produced no final sample');
  expect(report.failure).toBeNull();
  expect(report.initialStanding).toBe(11);
  expect(report.pulses).toHaveLength(2);
  expect(report.pulses.some((pulse) => pulse.wreckers > 0)).toBe(true);
  expect(report.final.stockpileAlive).toBe(true);
  expect(report.final.standing).toBeGreaterThanOrEqual(Math.ceil(report.initialStanding * 0.6));
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('SELF-HOLD reference base keeps half standing through wave-25 pulse cycles', async ({ page }, testInfo) => {
  test.setTimeout(80_000);
  const errors = await openGame(page, '?debug&timescale=36&nolevel&nopause&nosteal&seed=m2-07-self-hold-wave25');
  await setBalance(page, 'enemy.contactDamage', 0);
  await setBalance(page, 'sparkRig.range', 0);
  await setBalance(page, 'waves.trickleInterval', 9999);
  await setBalance(page, 'wreck.minWave', 25);
  await page.evaluate(() => window.__GR_TEST__?.setBeaconWave(24));
  await grantGold(page, 2_000);

  for (const placement of [
    ['stockpile', -8, 12],
    ['sentry_beacon', -4, 12],
    ['sentry_beacon', 4, 12],
    ['turret', -3, 15],
    ['turret', 3, 15],
    ['palisade', -3, 9],
    ['palisade', -2, 9],
    ['palisade', -1, 9],
    ['palisade', 0, 9],
    ['palisade', 1, 9],
    ['palisade', 2, 9],
  ] as const) {
    await placeBuildableAt(page, placement[0], placement[1], placement[2]);
  }

  const built = await hpEntries(page);
  expect(built).toHaveLength(11);
  expect(built.filter((entry) => entry.id === 'stockpile').every((entry) => entry.maxHp > Balance.wreck.hp.stockpile)).toBe(true);
  expect(built.filter((entry) => entry.id === 'palisade').every((entry) => entry.maxHp > Balance.wreck.hp.palisade * 2)).toBe(true);

  await page.evaluate(() => window.__GR_TEST__?.clearEnemies());
  await page.evaluate(() => window.__GR_TEST__?.setWave(24));
  await teleport(page, 22, -22);
  await installSelfHoldTracker(page, 25);

  await expect.poll(() => page.evaluate(() => window.__M2_07_SELF_HOLD__?.done ?? false), { timeout: 35_000 }).toBe(true);
  const report = await page.evaluate(() => window.__M2_07_SELF_HOLD__);
  await writeReport(testInfo, 'self-hold-wave25', { report, errors });
  expect(report).toBeTruthy();
  if (!report?.final) throw new Error('wave-25 self-hold probe produced no final sample');
  expect(report.failure).toBeNull();
  expect(report.initialStanding).toBe(11);
  expect(report.pulses).toHaveLength(2);
  expect(report.pulses.some((pulse) => pulse.wreckers > 0)).toBe(true);
  expect(report.final.stockpileAlive).toBe(true);
  expect(report.final.standing).toBeGreaterThanOrEqual(Math.ceil(report.initialStanding * 0.5));
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('blast clump TTK at wave 20+ stays within 2x wave-10', async ({ page }, testInfo) => {
  test.setTimeout(45_000);
  const errors = await openGame(page, '?debug&timescale=12&nowaves&nolevel&nopause&nosteal&nowreck&seed=m2-07-blast-ttk');
  await setBalance(page, 'enemy.speed', 0);
  await setBalance(page, 'enemy.contactDamage', 0);
  await setBalance(page, 'sparkRig.range', 0);
  await setBalance(page, 'waves.aliveCap', 0);
  await setBalance(page, 'waves.waveInterval', 12);
  await setBalance(page, 'waves.trickleInterval', 9999);
  await setBalance(page, 'waves.pulseBase', 1);
  await setBalance(page, 'waves.pulsePerWave', 0);
  await setBalance(page, 'waves.pulsesPerWave', 1);
  await setBalance(page, 'waves.edgesPerPulse', 1);

  const wave10 = await measureBlastTtk(page, 10);
  const wave21 = await measureBlastTtk(page, 21);
  const report: TtkReport = {
    wave10,
    wave21,
    ratio: Number((wave21.ttk / wave10.ttk).toFixed(2)),
  };
  await writeReport(testInfo, 'blast-ttk', { report, errors });
  expect(report.ratio).toBeLessThanOrEqual(2);
  expect(wave10.weaponSplit.hero ?? 0).toBe(0);
  expect(wave21.weaponSplit.hero ?? 0).toBe(0);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

declare global {
  interface Window {
    __M2_07_SELF_HOLD__?: SelfHoldState;
  }
}
