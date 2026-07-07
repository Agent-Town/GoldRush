import { expect, test, type Page, type TestInfo } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { Balance } from '../src/game/Balance';

type Scenario = 'pure-spark' | 'pure-blast' | 'rapid-cycle';
type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };
type ProbeRow = {
  scenario: Scenario;
  run: number;
  sampleSeconds: number;
  toggles: number;
  togglesPerMinute: number;
  sparkDamage: number;
  blastDamage: number;
  totalDamage: number;
  sparkDps: number;
  blastDps: number;
  totalDps: number;
  boltHits: number;
  detonations: number;
};

const artifactPath = path.resolve('artifacts/053/weapon-cycling-audit.json');
const resultPath = path.resolve('test-results/053-weapon-cycling-audit.json');
const scenarios: Scenario[] = ['pure-spark', 'pure-blast', 'rapid-cycle'];
const targetWall = [
  { x: -0.9, z: 6 },
  { x: -0.3, z: 6 },
  { x: 0.3, z: 6 },
  { x: 0.9, z: 6 },
];
const durationSeconds = 60;
const debugTimeScale = 12;
const fixedSimStepSeconds = 1 / 5;
const ownerToggleCadencePerMinute = 85;
const ownerToggleIntervalSeconds = 60 / ownerToggleCadencePerMinute;

function collectErrors(page: Page): ErrorBucket {
  const bucket: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') bucket.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => bucket.pageErrors.push(error.message));
  return bucket;
}

test.setTimeout(120_000);

test('task-053 seeded weapon cycling DPS probe', async ({ page }, testInfo: TestInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chrome', 'DPS audit probe runs once');

  const rows: ProbeRow[] = [];
  for (let run = 1; run <= 2; run += 1) {
    for (const scenario of scenarios) rows.push(await probe(page, scenario, run));
  }

  const summary = scenarios.map((scenario) => {
    const matches = rows.filter((row) => row.scenario === scenario);
    return {
      scenario,
      dps: round1(avg(matches.map((row) => row.totalDps))),
      sparkDps: round1(avg(matches.map((row) => row.sparkDps))),
      blastDps: round1(avg(matches.map((row) => row.blastDps))),
      togglesPerMinute: round1(avg(matches.map((row) => row.togglesPerMinute))),
    };
  });
  const report = {
    seed: 'task-053-weapon-cycling-audit',
    durationSeconds,
    ownerToggleCadencePerMinute,
    ownerToggleIntervalSeconds: round3(ownerToggleIntervalSeconds),
    targetWall,
    constants: {
      sparkDamage: Balance.sparkRig.damage,
      sparkFireRate: Balance.sparkRig.fireRate,
      blastDamage: Balance.blast.damage,
      blastCooldown: Balance.blast.cooldown,
      blastAirTime: Balance.blast.airTime,
      blastRadius: Balance.blast.radius,
    },
    rows,
    summary,
  };

  const body = `${JSON.stringify(report, null, 2)}\n`;
  for (const file of [artifactPath, resultPath]) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, body);
  }
  await testInfo.attach('task-053-weapon-cycling-audit', { body, contentType: 'application/json' });

  for (const scenario of scenarios) {
    const [first, second] = rows.filter((row) => row.scenario === scenario);
    expect(first).toBeDefined();
    expect(second).toBeDefined();
    expect(first!.totalDps, `${scenario} run-to-run DPS`).toBe(second!.totalDps);
  }

  const dps = Object.fromEntries(summary.map((entry) => [entry.scenario, entry.dps])) as Record<Scenario, number>;
  expect(dps['rapid-cycle']).toBeGreaterThan(dps['pure-spark']);
  expect(dps['rapid-cycle']).toBeGreaterThan(dps['pure-blast']);
});

async function probe(page: Page, scenario: Scenario, run: number): Promise<ProbeRow> {
  const errors = collectErrors(page);
  await page.goto(`/?debug&timescale=${debugTimeScale}&nowaves&nolevel&nopause&nosteal&nowreck&seed=task-053-${scenario}-${run}`);
  await expect(page.locator('#game-canvas')).toBeVisible();
  await page.waitForFunction(() => Boolean(window.__GR_TEST__) && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);

  const row = await page.evaluate(
    ({ scenario, targetWall, durationSeconds, fixedSimStepSeconds, ownerToggleCadencePerMinute, ownerToggleIntervalSeconds }) => {
      const round1InPage = (value: number): number => Math.round(value * 10) / 10;
      const round3InPage = (value: number): number => Math.round(value * 1000) / 1000;
      const testHarness = window.__GR_TEST__;
      if (!testHarness) throw new Error('__GR_TEST__ missing');
      testHarness.setBalance('enemy.hp', 1_000_000);
      testHarness.setBalance('enemy.speed', 0);
      testHarness.setBalance('enemy.contactDamage', 0);
      testHarness.clearEnemies();
      testHarness.teleport(0, 12);
      testHarness.setBlastAim(0, 6);
      const toggleBaseline = testHarness.state().arsenal.weaponToggles;
      if (scenario !== 'pure-spark') testHarness.toggleWeapon();
      for (const target of targetWall) {
        if (!testHarness.spawnEnemyAt(target.x, target.z)) throw new Error(`failed to spawn target at ${target.x},${target.z}`);
      }

      const first = window.__THREE_GAME_DIAGNOSTICS__;
      if (!first) throw new Error('__THREE_GAME_DIAGNOSTICS__ missing');
      const start = first.timeAlive;
      const startDamage = { ...(first.build.damageByOwner ?? {}) };
      const startHits = (testHarness.state().combat.hits ?? 0) as number;
      const startDetonations = first.arsenal.detonations;
      let nextToggleAt = start + ownerToggleIntervalSeconds;
      let scheduledRapidToggles = 0;
      const scheduledRapidToggleLimit = ownerToggleCadencePerMinute - 1;

      const readDamage = (owner: string): number => Number(window.__THREE_GAME_DIAGNOSTICS__?.build.damageByOwner?.[owner] ?? 0);
      while ((window.__THREE_GAME_DIAGNOSTICS__?.timeAlive ?? start) < start + durationSeconds) {
        const diagnostics = window.__THREE_GAME_DIAGNOSTICS__;
        const now = diagnostics?.timeAlive ?? start;
        const next = Math.min(start + durationSeconds, now + fixedSimStepSeconds);
        if (scenario === 'rapid-cycle') {
          while (next >= nextToggleAt && scheduledRapidToggles < scheduledRapidToggleLimit) {
            testHarness.toggleWeapon();
            scheduledRapidToggles += 1;
            nextToggleAt += ownerToggleIntervalSeconds;
          }
        }
        testHarness.advanceSim(next - now, fixedSimStepSeconds);
      }

      const diagnostics = window.__THREE_GAME_DIAGNOSTICS__;
      const now = diagnostics?.timeAlive ?? start;
      const sparkDamage = readDamage('hero') - Number(startDamage.hero ?? 0);
      const blastDamage = readDamage('hero_blast') - Number(startDamage.hero_blast ?? 0);
      const sampleSeconds = now - start;
      const toggles = testHarness.state().arsenal.weaponToggles - toggleBaseline;
      return {
        scenario,
        run: 0,
        sampleSeconds: round3InPage(sampleSeconds),
        toggles,
        togglesPerMinute: round1InPage((toggles / durationSeconds) * 60),
        sparkDamage: round1InPage(sparkDamage),
        blastDamage: round1InPage(blastDamage),
        totalDamage: round1InPage(sparkDamage + blastDamage),
        sparkDps: round1InPage(sparkDamage / durationSeconds),
        blastDps: round1InPage(blastDamage / durationSeconds),
        totalDps: round1InPage((sparkDamage + blastDamage) / durationSeconds),
        boltHits: (testHarness.state().combat.hits ?? 0) - startHits,
        detonations: (diagnostics?.arsenal.detonations ?? 0) - startDetonations,
      };
    },
    { scenario, targetWall, durationSeconds, fixedSimStepSeconds, ownerToggleCadencePerMinute, ownerToggleIntervalSeconds },
  );

  row.run = run;
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
  return row;
}

function avg(values: number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

function round3(value: number): number {
  return Math.round(value * 1000) / 1000;
}
