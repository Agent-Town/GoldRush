import { createHash } from 'node:crypto';
import { expect, test, type Browser, type Page, type TestInfo } from '@playwright/test';
import { Balance } from '../src/game/Balance';

type Errors = { console: string[]; page: string[] };
type Palisade = { hp: number; maxHp: number; wrecked: boolean; position: { x: number; z: number } };

function errorsFor(page: Page): Errors {
  const errors: Errors = { console: [], page: [] };
  page.on('console', (message) => {
    if (message.type() === 'error' && !message.text().includes('WebSocket connection')) errors.console.push(message.text());
  });
  page.on('pageerror', (error) => errors.page.push(error.message));
  return errors;
}

async function openManual(page: Page, seed: string): Promise<Errors> {
  const errors = errorsFor(page);
  await page.goto(`/?debug&contract=e1-baron&timescale=1&nolevel&nowaves&nosteal&seed=${seed}`);
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  expect(await page.evaluate(() => window.__GR_TEST__?.setManualSim(true))).toBe(true);
  await page.evaluate(() => window.__GR_TEST__?.resetRun());
  for (const [key, value] of Object.entries({ 'sparkRig.range': 0, 'turret.range': 0, 'enemy.contactDamage': 0 })) {
    expect(await page.evaluate(([path, next]) => window.__GR_TEST__?.setBalance(path, next), [key, value] as const)).toBe(true);
  }
  await page.evaluate(() => window.__GR_TEST__?.setWave(20));
  return errors;
}

async function buildNorthBarricade(page: Page): Promise<void> {
  await page.evaluate(() => window.__GR_TEST__?.teleport(0, 20));
  for (const x of [-6, -3, 0, 3, 6]) {
    expect(await page.evaluate((at) => window.__GR_TEST__?.placeFree('palisade', at, 14, 1), x)).toBe(true);
  }
}

async function spawnBaron(page: Page, buildingDamageScale: number): Promise<void> {
  await page.evaluate((damageScale) => window.__GR_TEST__?.spawnPack(1, 12, {
    eliteKind: 'baron',
    hpScale: 240,
    speedMult: 0.75,
    visualScale: 4,
    banner: true,
    wrecker: true,
    contactDamageScale: 0,
    buildingDamageScale: damageScale,
    supportBuildingDamageScale: 12,
    heroPursuitRange: 18,
  }), buildingDamageScale);
  await expect.poll(() => page.evaluate(() => window.__GR_TEST__?.enemyPositions().some((enemy) => enemy.eliteKind === 'baron'))).toBe(true);
}

async function advance(page: Page, seconds: number): Promise<void> {
  await page.evaluate((duration) => window.__GR_TEST__?.advanceSim(duration), seconds);
}

async function palisades(page: Page): Promise<Palisade[]> {
  return page.evaluate(() => (window.__THREE_GAME_DIAGNOSTICS__?.build.hp ?? [])
    .filter((entry) => entry.id === 'palisade') as Palisade[]);
}

async function attach(testInfo: TestInfo, name: string, value: unknown): Promise<void> {
  await testInfo.attach(name, { body: `${JSON.stringify(value, null, 2)}\n`, contentType: 'application/json' });
}

test('north barricade makes the Baron melee the blocker and volley the fortification line', async ({ page }, testInfo) => {
  const meleeErrors = await openManual(page, 'f-bw-16-melee');
  await buildNorthBarricade(page);
  await page.evaluate(() => {
    const rocket = window.__GR_TEST__?.activeContract().twist.baron?.rocketVolley;
    if (rocket) rocket.damage = 0;
  });
  const meleeBefore = await palisades(page);
  await spawnBaron(page, 16);

  let meleeAfter = meleeBefore;
  let wreckState: string | undefined;
  for (let step = 0; step < 20; step += 1) {
    await advance(page, 0.1);
    meleeAfter = await palisades(page);
    wreckState = await page.evaluate(() => window.__GR_TEST__?.enemyPositions().find((enemy) => enemy.eliteKind === 'baron')?.wreckState);
    if (meleeAfter.some((entry, index) => entry.hp < meleeBefore[index]!.hp)) break;
  }
  const meleeDamage = Math.max(...meleeBefore.map((entry, index) => entry.hp - meleeAfter[index]!.hp));
  expect(wreckState).toBe('swinging');
  expect(meleeDamage).toBe(Balance.wreck.damage * 16);
  expect(meleeErrors).toEqual({ console: [], page: [] });

  const volleyErrors = await openManual(page, 'f-bw-16-volley');
  await buildNorthBarricade(page);
  const volleyBefore = await palisades(page);
  await spawnBaron(page, 0);
  await advance(page, 8);
  const volleyAfter = await palisades(page);
  const rocket = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.baronRocket);
  const damaged = volleyAfter.filter((entry, index) => entry.hp < volleyBefore[index]!.hp).length;
  const board = {
    blockedTunables: Balance.baron,
    melee: { damage: meleeDamage, state: wreckState },
    volley: {
      volleys: rocket?.volleys ?? 0,
      damagedPalisades: damaged,
      lastTarget: rocket?.lastTarget,
      remainingHp: volleyAfter.map(({ hp }) => hp),
    },
  };
  await attach(testInfo, 'f-bw-16-siege-probe-board', board);
  expect(rocket?.volleys ?? 0).toBeGreaterThanOrEqual(2);
  expect(damaged).toBeGreaterThanOrEqual(2);
  expect([-6, -3, 0, 3, 6]).toContain(rocket?.lastTarget.x);
  expect(rocket?.lastTarget.z).toBeCloseTo(14, 3);
  expect(volleyErrors).toEqual({ console: [], page: [] });
});

async function unblockedFingerprint(browser: Browser, seed: string): Promise<{ hash: string; payload: unknown; errors: Errors }> {
  const context = await browser.newContext();
  const page = await context.newPage();
  const errors = await openManual(page, seed);
  await page.evaluate(() => window.__GR_TEST__?.teleport(0, 20));
  await spawnBaron(page, 16);
  await advance(page, 4);
  const payload = await page.evaluate(() => ({
    hp: window.__THREE_GAME_DIAGNOSTICS__?.hp,
    rocket: window.__THREE_GAME_DIAGNOSTICS__?.baronRocket,
    baron: window.__GR_TEST__?.enemyPositions().find((enemy) => enemy.eliteKind === 'baron'),
  }));
  await context.close();
  return { hash: createHash('sha256').update(JSON.stringify(payload)).digest('hex'), payload, errors };
}

test('unblocked Baron fight keeps its deterministic baseline', async ({ browser }, testInfo) => {
  const first = await unblockedFingerprint(browser, 'f-bw-16-unblocked');
  const second = await unblockedFingerprint(browser, 'f-bw-16-unblocked');
  await attach(testInfo, 'f-bw-16-unblocked-determinism', { first, second });
  expect(second.payload).toEqual(first.payload);
  expect(second.hash).toBe(first.hash);
  expect(first.errors).toEqual({ console: [], page: [] });
  expect(second.errors).toEqual({ console: [], page: [] });
});
