import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import { Balance } from '../src/game/Balance';

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };
type EnemySnapshot = ReturnType<NonNullable<Window['__GR_TEST__']>['enemyPositions']>[number];

const ARTIFACT_DIR = path.resolve('artifacts/e2-enemies');
const BASE_QUERY = '?debug&nolevel&nopause&nosteal&nowreck';
const E2_QUERY = `${BASE_QUERY}&contract=e2-hill-mine`;
const BASE_BEHAVIOR_QUERY = '?debug&nolevel&nopause';
const E2_BEHAVIOR_QUERY = `${BASE_BEHAVIOR_QUERY}&contract=e2-hill-mine`;

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
  await page.waitForFunction(() => window.__GR_TEST__ && window.__GR_CONTRACT_REGISTRY__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 16);
  return errors;
}

async function setBalance(page: Page, key: string, value: number | boolean | string): Promise<void> {
  await expect(page.evaluate(([pathKey, next]) => window.__GR_TEST__?.setBalance(pathKey, next), [key, value] as const)).resolves.toBe(true);
}

async function setBalances(page: Page, values: Record<string, number | boolean | string>): Promise<void> {
  for (const [key, value] of Object.entries(values)) await setBalance(page, key, value);
}

async function refreshStats(page: Page): Promise<void> {
  await page.evaluate(() => window.__GR_TEST__?.setUpgradeStacks({}));
}

async function tuneSinglePulse(page: Page, budget: number, aliveCap = 40): Promise<void> {
  await setBalances(page, {
    'waves.waveInterval': 0.35,
    'waves.trickleInterval': 999,
    'waves.pulseBase': budget,
    'waves.pulsePerWave': 0,
    'waves.pulsesPerWave': 1,
    'waves.edgesPerPulse': 3,
    'waves.aliveCap': aliveCap,
    'sparkRig.range': 0,
  });
}

async function spawnWaveOne(page: Page): Promise<EnemySnapshot[]> {
  await tuneSinglePulse(page, 9);
  await page.evaluate(() => window.__GR_TEST__?.setManualSim(true));
  await page.evaluate(() => window.__GR_TEST__?.setWave(0));
  await page.evaluate(() => window.__GR_TEST__?.advanceSim(1.2));
  await expect.poll(() => page.evaluate(() => window.__GR_TEST__?.enemyPositions().length ?? 0), { timeout: 6_000 }).toBeGreaterThanOrEqual(9);
  return page.evaluate(() => window.__GR_TEST__?.enemyPositions() ?? []);
}

function byVariant(enemies: EnemySnapshot[], id: string): EnemySnapshot {
  const enemy = enemies.find((entry) => entry.variantId === id);
  if (!enemy) throw new Error(`missing variant ${id}`);
  return enemy;
}

function assertNoErrors(errors: ErrorBucket): void {
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
}

test('E2 enemy roster is manifest-gated and leaves E1 default spawns untagged', async ({ page }) => {
  const e1Errors = await openGame(page, `${BASE_QUERY}&nowaves&seed=e2-enemies-e1-gate`);
  const e1 = await page.evaluate(() => ({
    activeId: window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId,
    roster: window.__GR_TEST__?.activeContract().twist.enemyRoster,
    baron: window.__GR_TEST__?.activeContract().twist.baron,
  }));
  expect(e1.activeId).toBe('the-claim');
  expect(e1.roster).toBeUndefined();
  expect(e1.baron).toBeUndefined();
  await page.evaluate(() => window.__GR_TEST__?.spawnPack(3, 0.4, { speedScale: 0 }));
  await expect.poll(() => page.evaluate(() => window.__GR_TEST__?.enemyPositions().length ?? 0)).toBe(3);
  expect(await page.evaluate(() => window.__GR_TEST__?.enemyPositions().every((enemy) => !enemy.variantId && !enemy.eliteKind) ?? false)).toBe(true);
  assertNoErrors(e1Errors);

  const e2Errors = await openGame(page, `${E2_QUERY}&nowaves&seed=e2-enemies-e2-gate`);
  const e2 = await page.evaluate(() => {
    const contract = window.__GR_TEST__?.activeContract();
    return {
      activeId: window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId,
      rosterIds: contract?.twist.enemyRoster?.map((entry) => entry.id),
      bossKind: contract?.twist.baron?.bossKind,
      componentIds: contract?.twist.baron?.components?.map((entry) => entry.id),
      railRouteIndex: contract?.twist.baron?.railRouteIndex,
    };
  });
  expect(e2).toMatchObject({
    activeId: 'e2-hill-mine',
    rosterIds: ['rail_tough', 'steam_wrecker', 'coal_thief'],
    bossKind: 'railcar',
    componentIds: ['wheels', 'boiler', 'cabin'],
    railRouteIndex: 0,
  });
  assertNoErrors(e2Errors);
});

test('wave pulses spawn Rail Toughs, Steam Wreckers, and Coal Thieves from E2 data', async ({ page }) => {
  const errors = await openGame(page, `${E2_QUERY}&timescale=8&seed=e2-enemies-roster`);
  const enemies = await spawnWaveOne(page);
  const railTough = byVariant(enemies, 'rail_tough');
  const steamWrecker = byVariant(enemies, 'steam_wrecker');
  const coalThief = byVariant(enemies, 'coal_thief');
  const waveHp = Math.pow(Balance.waves.hpScalePerWave, 1);

  expect(new Set(enemies.map((enemy) => enemy.variantId).filter(Boolean))).toEqual(
    new Set(['rail_tough', 'steam_wrecker', 'coal_thief']),
  );
  expect(railTough).toMatchObject({ variantLabel: 'Rail Tough', boltDamageMult: 0.65, scale: 1.16 });
  expect(railTough.maxHp).toBeCloseTo(Balance.enemy.hp * waveHp * 1.35, 4);
  expect(steamWrecker).toMatchObject({ variantLabel: 'Steam Wrecker', wrecker: true, scale: 1.28 });
  expect(steamWrecker.maxHp).toBeCloseTo(Balance.enemy.hp * waveHp * 1.65, 4);
  expect(steamWrecker.buildingDamage).toBeCloseTo(Balance.wreck.damage * 1.35, 4);
  expect(coalThief).toMatchObject({ variantLabel: 'Coal Thief', thief: true, scale: 0.88 });
  expect(coalThief.maxHp).toBeCloseTo(Balance.enemy.hp * waveHp * 0.72, 4);
  expect(coalThief.contactDamage).toBeCloseTo(Balance.enemy.contactDamage * 0.65, 4);
  assertNoErrors(errors);
});

test('armored railcar arrives as three rail-bound boss components and degrades as parts fail', async ({ page }) => {
  test.setTimeout(45_000);
  const errors = await openGame(page, `${E2_QUERY}&timescale=1&seed=e2-enemies-railcar`);
  await page.evaluate(() => window.__GR_TEST__?.setManualSim(true));
  await setBalances(page, {
    'waves.waveInterval': 0.35,
    'waves.trickleInterval': 999,
    'waves.pulseBase': 0,
    'waves.pulsePerWave': 0,
    'waves.pulsesPerWave': 1,
    'waves.edgesPerPulse': 1,
    'waves.aliveCap': 0,
    'enemy.contactDamage': 0,
    'sparkRig.range': 0,
    'sparkRig.damage': 9999,
    'sparkRig.fireRate': 0.2,
    'sparkRig.boltSpeed': 90,
  });
  await refreshStats(page);
  await page.evaluate(() => window.__GR_TEST__?.setWave(11));
  await page.evaluate(() => window.__GR_TEST__?.advanceSim(1.2));
  await expect
    .poll(() => page.evaluate(() => window.__GR_TEST__?.enemyPositions().filter((enemy) => enemy.eliteKind === 'railcar').length ?? 0), {
      timeout: 6_000,
    })
    .toBe(3);

  const initial = await page.evaluate(() => {
    const railcars = (window.__GR_TEST__?.enemyPositions() ?? [])
      .filter((enemy) => enemy.eliteKind === 'railcar')
      .sort((a, b) => (a.bossComponentId ?? '').localeCompare(b.bossComponentId ?? ''));
    return {
      railcars,
      bar: window.__THREE_GAME_DIAGNOSTICS__?.readability.bossHpBar,
      activeContract: window.__GR_TEST__?.activeContract(),
    };
  });
  expect(initial.railcars.map((enemy) => enemy.bossComponentId).sort()).toEqual(['boiler', 'cabin', 'wheels']);
  expect(initial.railcars.every((enemy) => enemy.bossGroupId === 'e2-hill-mine:wave-12:railcar')).toBe(true);
  expect(Math.min(...initial.railcars.map((enemy) => enemy.x))).toBeLessThan(-44);
  expect(Math.max(...initial.railcars.map((enemy) => enemy.x))).toBeLessThan(-39);
  expect(initial.railcars.every((enemy) => Math.abs(enemy.z + 2) < 2.5)).toBe(true);
  expect(initial.railcars.every((enemy) => enemy.wrecker === true && enemy.edge === 'west')).toBe(true);
  expect(initial.bar).toMatchObject({
    visible: true,
    ratio: 1,
    segments: 3,
    groupId: 'e2-hill-mine:wave-12:railcar',
    aliveComponents: 3,
    destroyedComponents: 0,
  });
  const initialSpeed = Math.max(...initial.railcars.map((enemy) => enemy.speed));
  const initialSpan = Math.max(...initial.railcars.map((enemy) => enemy.x)) - Math.min(...initial.railcars.map((enemy) => enemy.x));
  expect(initialSpan).toBeGreaterThan(2);
  await page.evaluate(() => window.__GR_TEST__?.advanceSim(1.5));
  const rolling = await page.evaluate(() =>
    (window.__GR_TEST__?.enemyPositions() ?? [])
      .filter((enemy) => enemy.eliteKind === 'railcar')
      .sort((a, b) => (a.bossComponentId ?? '').localeCompare(b.bossComponentId ?? '')),
  );
  expect(rolling).toHaveLength(3);
  expect(Math.min(...rolling.map((enemy) => enemy.x))).toBeGreaterThan(Math.min(...initial.railcars.map((enemy) => enemy.x)) + 1);
  expect(Math.max(...rolling.map((enemy) => enemy.x)) - Math.min(...rolling.map((enemy) => enemy.x))).toBeGreaterThan(2);
  await page.evaluate(() => window.__GR_TEST__?.teleport(-42, 8));
  await setBalance(page, 'sparkRig.range', 300);
  await refreshStats(page);
  for (let i = 0; i < 120; i += 1) {
    await page.evaluate(() => window.__GR_TEST__?.advanceSim(1 / 15));
    const alive = await page.evaluate(() => window.__GR_TEST__?.enemyPositions().filter((enemy) => enemy.eliteKind === 'railcar').length ?? 0);
    if (alive === 2) break;
  }
  await setBalance(page, 'sparkRig.range', 0);
  await refreshStats(page);
  const damaged = await page.evaluate(() => ({
    railcars: (window.__GR_TEST__?.enemyPositions() ?? []).filter((enemy) => enemy.eliteKind === 'railcar'),
    bar: window.__THREE_GAME_DIAGNOSTICS__?.readability.bossHpBar,
  }));
  expect(damaged.railcars.length).toBe(2);
  expect(damaged.bar).toMatchObject({ visible: true, segments: 3, aliveComponents: 2, destroyedComponents: 1 });
  expect(damaged.bar?.ratio ?? 1).toBeLessThan(1);
  expect(Math.max(...damaged.railcars.map((enemy) => enemy.speed))).toBeLessThan(initialSpeed * 0.9);

  await setBalances(page, {
    'sparkRig.range': 300,
    'sparkRig.fireRate': 8,
    'sparkRig.damage': 9999,
    'sparkRig.boltSpeed': 120,
  });
  await refreshStats(page);
  for (let i = 0; i < 165; i += 1) {
    await page.evaluate(() => window.__GR_TEST__?.advanceSim(1 / 15));
    const secured = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.run.secured === true);
    if (secured) break;
  }
  const secured = await page.evaluate(() => ({
    run: window.__THREE_GAME_DIAGNOSTICS__?.run,
    railcars: window.__GR_TEST__?.enemyPositions().filter((enemy) => enemy.eliteKind === 'railcar') ?? [],
    bar: window.__THREE_GAME_DIAGNOSTICS__?.readability.bossHpBar,
    ui: window.__THREE_GAME_DIAGNOSTICS__?.ui,
  }));
  expect(secured.run?.secured).toBe(true);
  expect(secured.run?.rush).toBe(true);
  expect(secured.railcars).toHaveLength(0);
  expect(secured.bar?.visible).toBe(false);
  expect(secured.ui?.announcementTitle).toBe('THE RAILCAR IS DISABLED');
  assertNoErrors(errors);
});

test('Coal Thief and Steam Wrecker behavior runs through E2 roster variants', async ({ page }) => {
  test.setTimeout(45_000);
  const errors = await openGame(page, `${E2_BEHAVIOR_QUERY}&timescale=1&nowaves&seed=e2-enemies-behavior`);
  await page.evaluate(() => window.__GR_TEST__?.setManualSim(true));
  await setBalances(page, {
    'enemy.contactDamage': 0,
    'sparkRig.range': 0,
    'wreck.damage': 1,
    'wreck.hitCooldown': 0.2,
    'steal.grabSeconds': 0.15,
  });
  await expect(page.evaluate(() => window.__GR_TEST__?.placeFree('stockpile', 36, 24))).resolves.toBe(true);
  await expect(page.evaluate(() => window.__GR_TEST__?.placeFree('palisade', 24, 42))).resolves.toBe(true);
  await page.evaluate(() => window.__GR_TEST__?.grantGold(160));
  const rosterOptions = await page.evaluate(() => {
    const roster = window.__GR_TEST__?.activeContract().twist.enemyRoster ?? [];
    const pack = (id: string) => {
      const variant = roster.find((entry) => entry.id === id);
      if (!variant) throw new Error(`missing roster variant ${id}`);
      return {
        variantId: variant.id,
        variantLabel: variant.label,
        hpScale: variant.hpScale,
        speedMult: variant.speedMult,
        visualScale: variant.visualScale,
        tint: variant.tint,
        boltDamageMult: variant.boltDamageMult,
        thief: variant.thief,
        wrecker: variant.wrecker,
        contactDamageScale: variant.contactDamageScale,
        buildingDamageScale: variant.buildingDamageScale,
        supportBuildingDamageScale: variant.supportBuildingDamageScale,
        heroPursuitRange: variant.heroPursuitRange,
      };
    };
    return { coal: pack('coal_thief'), steam: pack('steam_wrecker') };
  });
  await page.evaluate((coal) => {
    window.__GR_TEST__?.teleport(36, 24);
    window.__GR_TEST__?.spawnPack(1, 0.1, coal);
  }, rosterOptions.coal);
  await page.evaluate((steam) => {
    window.__GR_TEST__?.teleport(24, 42);
    window.__GR_TEST__?.spawnPack(1, 0.1, steam);
  }, rosterOptions.steam);
  const seenVariants = new Set<string>();
  let behavior = await page.evaluate(() => ({
    stolen: window.__THREE_GAME_DIAGNOSTICS__?.steal.stolenTotal ?? 0,
    hits: window.__THREE_GAME_DIAGNOSTICS__?.wreck.hitsResolved ?? 0,
    variants: [...new Set((window.__GR_TEST__?.enemyPositions() ?? []).map((enemy) => enemy.variantId).filter(Boolean))],
  }));
  for (const variant of behavior.variants) {
    if (variant) seenVariants.add(variant);
  }
  for (let i = 0; i < 540 && (behavior.stolen <= 0 || behavior.hits <= 0); i += 1) {
    await page.evaluate(() => window.__GR_TEST__?.advanceSim(1 / 15));
    behavior = await page.evaluate(() => ({
      stolen: window.__THREE_GAME_DIAGNOSTICS__?.steal.stolenTotal ?? 0,
      hits: window.__THREE_GAME_DIAGNOSTICS__?.wreck.hitsResolved ?? 0,
      variants: [...new Set((window.__GR_TEST__?.enemyPositions() ?? []).map((enemy) => enemy.variantId).filter(Boolean))],
    }));
    for (const variant of behavior.variants) {
      if (variant) seenVariants.add(variant);
    }
  }
  expect([...seenVariants]).toEqual(expect.arrayContaining(['coal_thief', 'steam_wrecker']));
  expect(behavior.stolen).toBeGreaterThan(0);
  expect(behavior.hits).toBeGreaterThan(0);
  assertNoErrors(errors);
});

test('same seed keeps the E2 roster wave deterministic', async ({ browser }) => {
  const first = await e2WaveHash(browser, 'e2-enemies-deterministic');
  const second = await e2WaveHash(browser, 'e2-enemies-deterministic');
  expect(second.hash).toBe(first.hash);
  expect(second.count).toBe(first.count);
});

test('E2 enemies survive the 200-stress draw-call envelope', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chrome', 'one desktop stress proof is enough');
  test.setTimeout(60_000);
  await mkdir(ARTIFACT_DIR, { recursive: true });
  const errors = await openGame(page, `${E2_QUERY}&timescale=3&stress=200&nowaves&nokill&seed=e2-enemies-stress`);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.frameMs.sampleCount ?? 0), { timeout: 12_000 }).toBeGreaterThan(60);
  const stress = await page.evaluate(() => ({
    stressCount: window.__THREE_GAME_DIAGNOSTICS__?.stressCount ?? 0,
    enemiesAlive: window.__THREE_GAME_DIAGNOSTICS__?.enemiesAlive ?? 0,
    enemyPoolSize: window.__THREE_GAME_DIAGNOSTICS__?.enemyPoolSize ?? 0,
    variants: [...new Set((window.__GR_TEST__?.enemyPositions() ?? []).map((enemy) => enemy.variantId).filter(Boolean))],
    frameMs: window.__THREE_GAME_DIAGNOSTICS__?.frameMs,
    renderer: window.__THREE_GAME_DIAGNOSTICS__?.renderer,
  }));
  await writeFile(path.join(ARTIFACT_DIR, 'stress-report.json'), `${JSON.stringify(stress, null, 2)}\n`);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, `${testInfo.project.name}-stress.png`), fullPage: false });
  expect(stress.stressCount).toBe(200);
  expect(stress.enemiesAlive).toBeGreaterThan(0);
  expect(stress.enemiesAlive).toBeLessThanOrEqual(stress.enemyPoolSize);
  expect(stress.variants).toEqual(expect.arrayContaining(['rail_tough', 'steam_wrecker', 'coal_thief']));
  expect(stress.frameMs?.p95 ?? Number.POSITIVE_INFINITY).toBeLessThanOrEqual(100);
  expect(stress.renderer?.calls ?? Number.POSITIVE_INFINITY).toBeLessThanOrEqual(220);
  assertNoErrors(errors);
});

async function e2WaveHash(browser: import('@playwright/test').Browser, seed: string): Promise<{ hash: string; count: number }> {
  const page = await browser.newPage();
  try {
    const errors = await openGame(page, `${E2_QUERY}&timescale=8&seed=${seed}`);
    const enemies = await spawnWaveOne(page);
    assertNoErrors(errors);
    const payload = enemies
      .map((enemy) => ({
        variantId: enemy.variantId,
        edge: enemy.edge,
        x: Number(enemy.x.toFixed(2)),
        z: Number(enemy.z.toFixed(2)),
        hp: Number(enemy.maxHp.toFixed(2)),
        speed: Number(enemy.speed.toFixed(3)),
      }))
      .sort((a, b) => `${a.variantId}:${a.edge}:${a.x}:${a.z}`.localeCompare(`${b.variantId}:${b.edge}:${b.x}:${b.z}`));
    return { hash: createHash('sha256').update(JSON.stringify(payload)).digest('hex'), count: payload.length };
  } finally {
    await page.close();
  }
}
