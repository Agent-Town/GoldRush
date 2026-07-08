import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { Balance } from '../src/game/Balance';

type BuildableId = 'palisade' | 'sluice' | 'turret';
type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };
type HpEntry = {
  id: BuildableId;
  index: number;
  hp: number;
  maxHp: number;
  wrecked: boolean;
  position: { x: number; z: number };
};
type BaronSnapshot = {
  id: number;
  x: number;
  z: number;
  hp: number;
  maxHp: number;
  speed: number;
  contactDamage: number;
  buildingDamage: number;
  supportBuildingDamage: number;
  heroPursuitRange: number;
  hitRadius: number;
  scale: number;
  hasBanner: boolean;
  wrecker?: boolean;
  wreckState?: string;
};

const ARTIFACT_DIR = path.resolve('artifacts/054');
const BARON_OPTS = {
  eliteKind: 'baron' as const,
  hpScale: 160,
  speedMult: 0.75,
  visualScale: 4,
  banner: true,
  wrecker: true,
  contactDamageScale: 4.25,
  buildingDamageScale: 12,
  supportBuildingDamageScale: 8,
  heroPursuitRange: 45,
};
const KITE_CENTER = { x: 0, z: 8 };
const KITE_RADIUS = 28;
const KITE_ANGLE_SPEED = 0.16;

function collectErrors(page: Page): ErrorBucket {
  const bucket: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error' && !isDevServerTransportError(message.text())) bucket.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => bucket.pageErrors.push(error.message));
  return bucket;
}

function isDevServerTransportError(text: string): boolean {
  return text.includes("WebSocket connection to 'ws://127.0.0.1:5188/") || text === 'Failed to load resource: net::ERR_CONNECTION_REFUSED';
}

async function openGame(page: Page, query: string): Promise<ErrorBucket> {
  const errors = collectErrors(page);
  await page.goto(`/${query}`);
  await expect(page.locator('#game-canvas')).toBeVisible();
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  return errors;
}

async function setBalance(page: Page, key: string, value: number | boolean): Promise<void> {
  await expect(page.evaluate(([pathKey, next]) => window.__GR_TEST__?.setBalance(pathKey, next), [key, value] as const)).resolves.toBe(true);
}

async function setBalances(page: Page, values: Record<string, number | boolean>): Promise<void> {
  for (const [key, value] of Object.entries(values)) await setBalance(page, key, value);
}

async function setWave(page: Page, wave: number): Promise<void> {
  await page.evaluate((next) => window.__GR_TEST__?.setWave(next), wave);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.wave ?? 0)).toBeGreaterThanOrEqual(wave);
}

async function grantGold(page: Page, amount: number): Promise<void> {
  await page.evaluate((value) => window.__GR_TEST__?.grantGold(value), amount);
}

async function teleport(page: Page, x: number, z: number): Promise<void> {
  await page.evaluate((pos) => window.__GR_TEST__?.teleport(pos.x, pos.z), { x, z });
}

async function advanceSim(page: Page, seconds: number, stepSeconds = 1 / 20): Promise<void> {
  await page.evaluate(([total, step]) => window.__GR_TEST__?.advanceSim(total, step), [seconds, stepSeconds] as const);
}

async function shot(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, `${testInfo.project.name}-${name}.png`), fullPage: false });
}

async function hpEntries(page: Page, id: BuildableId): Promise<HpEntry[]> {
  return page.evaluate((family) => (window.__THREE_GAME_DIAGNOSTICS__?.build.hp.filter((entry) => entry.id === family) ?? []) as HpEntry[], id);
}

async function placeBuildableAt(page: Page, id: BuildableId, x: number, z: number): Promise<HpEntry> {
  const before = await hpEntries(page, id);
  const candidates = placementCandidates(x, z);
  let placed = false;
  for (const candidate of candidates) {
    placed =
      (await page.evaluate(({ buildableId, x, z }) => window.__GR_TEST__?.placeFree(buildableId, x, z) ?? false, {
        buildableId: id,
        x: candidate.x,
        z: candidate.z,
      })) === true;
    if (placed) break;
  }
  expect(placed, `${id} placement near ${x},${z}`).toBe(true);
  await expect.poll(() => hpEntries(page, id).then((entries) => entries.length), { timeout: 8_000 }).toBeGreaterThan(before.length);
  const entries = await hpEntries(page, id);
  return entries[before.length] ?? entries[entries.length - 1]!;
}

function placementCandidates(x: number, z: number): Array<{ x: number; z: number }> {
  const offsets = [0, -2, 2, -4, 4, -6, 6];
  const candidates: Array<{ x: number; z: number }> = [];
  for (const dx of offsets) {
    for (const dz of offsets) candidates.push({ x: x + dx, z: z + dz });
  }
  return candidates;
}

async function upgrade(page: Page, entry: HpEntry): Promise<void> {
  await teleport(page, entry.position.x, entry.position.z);
  await expect(page.evaluate(([id, index]) => window.__GR_TEST__?.upgradeBuilding(id, index), [entry.id, entry.index] as const)).resolves.toBe(true);
}

async function spawnBaron(page: Page, radius: number): Promise<BaronSnapshot> {
  await page.evaluate(({ spawnRadius, opts }) => window.__GR_TEST__?.spawnPack(1, spawnRadius, opts), {
    spawnRadius: radius,
    opts: BARON_OPTS,
  });
  await expect.poll(() => page.evaluate(() => window.__GR_TEST__?.enemyPositions().some((enemy) => enemy.eliteKind === 'baron')), { timeout: 8_000 }).toBe(true);
  return baron(page);
}

async function baron(page: Page): Promise<BaronSnapshot> {
  return page.evaluate(() => {
    const found = window.__GR_TEST__?.enemyPositions().find((enemy) => enemy.eliteKind === 'baron');
    if (!found) throw new Error('missing Baron');
    return found as BaronSnapshot;
  });
}

async function waitForBaron(page: Page): Promise<BaronSnapshot> {
  await expect.poll(() => page.evaluate(() => window.__GR_TEST__?.enemyPositions().some((enemy) => enemy.eliteKind === 'baron') ?? false), { timeout: 10_000 }).toBe(true);
  return baron(page);
}

async function unlockAudio(page: Page): Promise<void> {
  await page.mouse.click(24, 24);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.audio.unlocked ?? false), { timeout: 8_000 }).toBe(true);
}

function assertNoErrors(errors: ErrorBucket): void {
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
}

test('wave 20 Baron spawns as epic-scale boss with anchored bar and one camera impulse', async ({ page }, testInfo) => {
  const errors = await openGame(page, '?debug&contract=e1-baron&timescale=1&nolevel&nokill&nosteal&nowreck&seed=054-baron-spawn');
  await setBalances(page, {
    'waves.waveInterval': 3.6,
    'waves.trickleInterval': 999,
    'waves.pulseBase': 0,
    'waves.pulsePerWave': 0,
    'waves.pulsesPerWave': 1,
    'waves.edgesPerPulse': 1,
    'waves.aliveCap': 80,
  });
  await setWave(page, 19);
  const spawned = await waitForBaron(page);
  const expectedHp = Balance.enemy.hp * Math.pow(Balance.waves.hpScalePerWave, 20) * 160;
  const expectedSpeed = Balance.enemy.speed * Balance.waves.speedScaleCap * 0.75;

  expect(spawned.maxHp).toBeCloseTo(expectedHp, 4);
  expect(spawned.hp).toBeCloseTo(expectedHp, 4);
  expect(spawned.speed).toBeCloseTo(expectedSpeed, 3);
  expect(spawned.scale).toBe(4);
  expect(spawned.contactDamage).toBeCloseTo(Balance.enemy.contactDamage * 4.25, 4);
  expect(spawned.buildingDamage).toBeCloseTo(Balance.wreck.damage * 12, 4);
  expect(spawned.supportBuildingDamage).toBeCloseTo(Balance.wreck.damage * 8, 4);
  expect(spawned.heroPursuitRange).toBe(45);
  expect(spawned.hitRadius).toBeCloseTo(Balance.enemy.touchRadius * 4, 4);
  expect(spawned.hasBanner).toBe(true);
  expect(spawned.wrecker).toBe(true);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.readability.bossHpBar)).toMatchObject({
    visible: true,
    ratio: 1,
    segments: 8,
  });
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.baronSpawnImpulses ?? 0)).toBe(1);
  await expect
    .poll(() => page.evaluate(() => window.__GR_TEST__?.enemyPositions().filter((enemy) => enemy.eliteKind !== 'baron').length ?? 0))
    .toBeGreaterThanOrEqual(8);
  await shot(page, testInfo, 'baron-scale-bar');
  assertNoErrors(errors);
});

test('unkited Baron wrecks structures with boss hit counts and governed crack audio', async ({ page }, testInfo) => {
  test.setTimeout(60_000);
  const errors = await openGame(page, '?debug&contract=e1-baron&timescale=0.01&nolevel&nowaves&nosteal&seed=054-baron-rampage');
  await unlockAudio(page);
  await setBalances(page, {
    'sparkRig.range': 0,
    'turret.range': 0,
  });
  await setWave(page, 20);
  await grantGold(page, 5_000);
  const palisade = await placeBuildableAt(page, 'palisade', -16, 9);
  const turret = await placeBuildableAt(page, 'turret', -21, 12);
  const sluice = await placeBuildableAt(page, 'sluice', -16, 7);
  const secondTurret = await placeBuildableAt(page, 'turret', -11, 12);
  await upgrade(page, turret);
  await upgrade(page, secondTurret);

  await teleport(page, palisade.position.x, palisade.position.z + 4);
  const hitsBefore = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.wreck.hitsResolved ?? 0);
  await spawnBaron(page, 2);
  await teleport(page, 38, -38);
  let firstHitHp: number | null = null;
  let palisadeHitCount = 0;
  let lastHits = hitsBefore;
  for (let i = 0; i < 80; i += 1) {
    await advanceSim(page, 0.25, 1 / 30);
    const [entry] = (await hpEntries(page, 'palisade')).filter((next) => next.index === palisade.index);
    const hits = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.wreck.hitsResolved ?? 0);
    if (hits > lastHits) {
      palisadeHitCount = hits - hitsBefore;
      if (entry && !entry.wrecked) firstHitHp = entry.hp;
      lastHits = hits;
    }
    if (entry?.wrecked) break;
  }
  expect(firstHitHp).toBeCloseTo(palisade.maxHp - Balance.wreck.damage * BARON_OPTS.buildingDamageScale, 4);
  expect(palisadeHitCount).toBe(2);

  await advanceSim(page, 30);
  const wreck = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.wreck);
  expect(wreck?.wrecked ?? 0).toBeGreaterThanOrEqual(3);
  expect((await hpEntries(page, 'turret')).some((entry) => entry.index === turret.index && entry.wrecked)).toBe(true);
  expect((await hpEntries(page, 'sluice')).some((entry) => entry.index === sluice.index && entry.wrecked)).toBe(true);
  const audio = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.audio);
  expect(audio?.startedBySound['palisade-crack'] ?? 0).toBeGreaterThan(0);
  expect(audio?.concurrentVoices ?? 0).toBeLessThanOrEqual(audio?.voiceCap ?? 0);
  await shot(page, testInfo, 'baron-rampage');
  assertNoErrors(errors);
});

test('stationary unplated hero dies within three Baron contacts, while base-speed kite opens distance', async ({ page }, testInfo) => {
  test.setTimeout(45_000);
  const errors = await openGame(page, '?debug&contract=e1-baron&timescale=8&nolevel&nowaves&nosteal&nowreck&seed=054-baron-contact');
  await setBalance(page, 'sparkRig.range', 0);
  await page.evaluate(() =>
    window.__GR_TEST__?.spawnPack(1, 0.1, {
      eliteKind: 'baron',
      hpScale: 160,
      speedScale: 0,
      visualScale: 4,
      banner: true,
      contactDamageScale: 4.25,
    }),
  );
  const contactBaron = await waitForBaron(page);
  expect(Math.hypot(contactBaron.x, contactBaron.z - 12)).toBeLessThan(3);

  let contacts = 0;
  let lastHp = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.hp ?? 100);
  for (let i = 0; i < 30; i += 1) {
    await advanceSim(page, 0.2, 1 / 30);
    const hp = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.hp ?? 0);
    if (hp < lastHp) {
      contacts += 1;
      lastHp = hp;
    }
    if ((await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.runState)) === 'dead') break;
  }
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.runState)).toBe('dead');
  expect(contacts).toBeLessThanOrEqual(3);

  const kiteErrors = await openGame(page, '?debug&contract=e1-baron&timescale=8&nolevel&nowaves&nosteal&nowreck&seed=054-baron-kite');
  await setBalance(page, 'sparkRig.range', 0);
  await setWave(page, 20);
  await teleport(page, 0, 12);
  const first = await spawnBaron(page, 7);
  let prev = { x: 0, z: 12 };
  let maxStep = 0;
  for (let i = 1; i <= 8; i += 1) {
    const z = 12 + Balance.hero.speed * 0.5 * i;
    maxStep = Math.max(maxStep, Math.hypot(prev.x, z - prev.z));
    await teleport(page, 0, z);
    await advanceSim(page, 0.5);
    prev = { x: 0, z };
  }
  const later = await baron(page);
  const firstGap = Math.hypot(first.x, first.z - 12);
  const laterGap = Math.hypot(later.x - prev.x, later.z - prev.z);
  expect(maxStep).toBeLessThanOrEqual(Balance.hero.speed * 0.5 + 0.001);
  expect(laterGap).toBeGreaterThan(firstGap + 4);
  await shot(page, testInfo, 'baron-kite-gap');
  assertNoErrors(errors);
  assertNoErrors(kiteErrors);
});

test('scaled Baron collider accepts weapon hits at the visible edge', async ({ page }) => {
  const errors = await openGame(page, '?debug&contract=e1-baron&timescale=0.01&nolevel&nowaves&nosteal&nowreck&seed=054-baron-edge-hit');
  await expect(page.evaluate(() => window.__GR_TEST__?.setManualSim(true))).resolves.toBe(true);
  await setBalances(page, {
    'sparkRig.range': 0,
    'blast.range': 20,
    'blast.damage': 5,
  });
  await setWave(page, 20);
  await teleport(page, KITE_CENTER.x, KITE_CENTER.z);
  const spawned = await spawnBaron(page, 6);
  const edgeOffset = Balance.enemy.touchRadius + Balance.blast.radius + 0.35;
  await page.evaluate(() => window.__GR_TEST__?.toggleWeapon());
  await page.evaluate(({ x, z }) => window.__GR_TEST__?.setBlastAim(x, z), { x: spawned.x + edgeOffset, z: spawned.z });
  await advanceSim(page, 1, 1 / 60);
  expect((await baron(page)).hp).toBeLessThan(spawned.hp);
  assertNoErrors(errors);
});

test('scripted wave-20 kite build survives 60 seconds, wins before 180, and is deterministic', async ({ page, browser }, testInfo) => {
  test.setTimeout(240_000);
  const first = await runKiteFight(page, '054-fight-a', testInfo, true);
  const secondContext = await browser.newContext({ viewport: page.viewportSize() ?? undefined });
  const secondPage = await secondContext.newPage();
  const second = await runKiteFight(secondPage, '054-fight-a', testInfo, false);
  await secondContext.close();
  expect(second.snapshot60).toEqual(first.snapshot60);
  expect(second.final).toEqual(first.final);
  assertNoErrors(first.errors);
  assertNoErrors(second.errors);
});

async function runKiteFight(
  page: Page,
  seed: string,
  testInfo: TestInfo,
  captureShot: boolean,
): Promise<{ errors: ErrorBucket; snapshot60: unknown; final: unknown }> {
  const errors = await openGame(page, `?debug&contract=e1-baron&timescale=0.01&nolevel&nowaves&nosteal&seed=${seed}`);
  await expect(page.evaluate(() => window.__GR_TEST__?.setManualSim(true))).resolves.toBe(true);
  await setBalances(page, {
    'sparkRig.damage': 8,
    'sparkRig.range': 24,
    'turret.range': 24,
  });
  await setWave(page, 20);
  await grantGold(page, 10_000);
  for (const [x, z] of [
    [-8, 8],
    [8, 8],
    [-8, 16],
    [8, 16],
  ] as const) {
    const turret = await placeBuildableAt(page, 'turret', x, z);
    await upgrade(page, turret);
  }
  const wallA = await placeBuildableAt(page, 'palisade', -20, 9);
  const wallB = await placeBuildableAt(page, 'palisade', -12, 9);
  await upgrade(page, wallA);
  await upgrade(page, wallB);
  await teleport(page, KITE_CENTER.x, KITE_CENTER.z);
  await spawnBaron(page, 6);

  const dt = 0.5;
  const firstHero = {
    x: KITE_CENTER.x + Math.cos(dt * KITE_ANGLE_SPEED) * KITE_RADIUS,
    z: KITE_CENTER.z + Math.sin(dt * KITE_ANGLE_SPEED) * KITE_RADIUS,
  };
  await teleport(page, firstHero.x, firstHero.z);
  const sixty = await kiteFor(page, 60, dt, dt, firstHero, 0, Number.POSITIVE_INFINITY);
  expect(sixty.bossHp).toBeGreaterThan(0);
  const snapshot60 = fightSnapshot(sixty.boss, sixty.heroHp, sixty.wrecked, sixty.maxHeroStep, sixty.minGap);
  if (captureShot) await shot(page, testInfo, 'baron-kite-chip-60s');
  const finalState = await kiteFor(page, 120, dt, sixty.elapsed, sixty.previousHero, sixty.maxHeroStep, sixty.minGap);
  expect(finalState.secured).toBe(true);
  expect(finalState.timeAlive).toBeLessThanOrEqual(180);
  expect(finalState.heroHp).toBeGreaterThan(0);
  expect(finalState.maxHeroStep).toBeLessThanOrEqual(Balance.hero.speed * dt + 0.001);
  expect(finalState.minGap).toBeGreaterThan(3.1);
  if (captureShot) await shot(page, testInfo, 'baron-kite-chip-win');
  return {
    errors,
    snapshot60,
    final: {
      secured: finalState.secured,
      wrecked: finalState.wrecked,
      maxHeroStep: Number(finalState.maxHeroStep.toFixed(3)),
      minGap: Number(finalState.minGap.toFixed(1)),
    },
  };
}

async function kiteFor(
  page: Page,
  seconds: number,
  dt: number,
  elapsedStart: number,
  heroStart: { x: number; z: number },
  maxHeroStepStart: number,
  minGapStart: number,
): Promise<{
  boss?: { hp: number; x: number; z: number };
  bossHp: number;
  heroHp: number;
  wrecked: number;
  secured: boolean;
  timeAlive: number;
  elapsed: number;
  previousHero: { x: number; z: number };
  maxHeroStep: number;
  minGap: number;
}> {
  return page.evaluate(
    ({
      seconds: total,
      dt: stepSeconds,
      elapsedStart: start,
      heroStart: startHero,
      maxHeroStepStart: maxStart,
      minGapStart: minStart,
      kiteCenter,
      kiteRadius,
      kiteAngleSpeed,
    }) => {
      let elapsed = start;
      let previousHero = startHero;
      let maxHeroStep = maxStart;
      let minGap = minStart;
      let lastBoss = window.__GR_TEST__?.enemyPositions().find((enemy) => enemy.eliteKind === 'baron');
      for (let remaining = total; remaining > 0; remaining -= stepSeconds) {
        if (window.__THREE_GAME_DIAGNOSTICS__?.run.secured) break;
        const boss = window.__GR_TEST__?.enemyPositions().find((enemy) => enemy.eliteKind === 'baron');
        if (!boss) break;
        elapsed += stepSeconds;
        const angle = elapsed * kiteAngleSpeed;
        const hero = {
          x: kiteCenter.x + Math.cos(angle) * kiteRadius,
          z: kiteCenter.z + Math.sin(angle) * kiteRadius,
        };
        maxHeroStep = Math.max(maxHeroStep, Math.hypot(hero.x - previousHero.x, hero.z - previousHero.z));
        window.__GR_TEST__?.teleport(hero.x, hero.z);
        window.__GR_TEST__?.advanceSim(stepSeconds, 1 / 20);
        previousHero = hero;
        lastBoss = window.__GR_TEST__?.enemyPositions().find((enemy) => enemy.eliteKind === 'baron');
        if (lastBoss) minGap = Math.min(minGap, Math.hypot(lastBoss.x - hero.x, lastBoss.z - hero.z));
      }
      return {
        boss: lastBoss ? { hp: lastBoss.hp, x: lastBoss.x, z: lastBoss.z } : undefined,
        bossHp: lastBoss?.hp ?? 0,
        heroHp: window.__THREE_GAME_DIAGNOSTICS__?.hp ?? 0,
        wrecked: window.__THREE_GAME_DIAGNOSTICS__?.wreck.wrecked ?? 0,
        secured: window.__THREE_GAME_DIAGNOSTICS__?.run.secured ?? false,
        timeAlive: window.__THREE_GAME_DIAGNOSTICS__?.timeAlive ?? 0,
        elapsed,
        previousHero,
        maxHeroStep,
        minGap,
      };
    },
    {
      seconds,
      dt,
      elapsedStart,
      heroStart,
      maxHeroStepStart,
      minGapStart,
      kiteCenter: KITE_CENTER,
      kiteRadius: KITE_RADIUS,
      kiteAngleSpeed: KITE_ANGLE_SPEED,
    },
  );
}

function fightSnapshot(
  boss: { hp: number; x: number; z: number } | undefined,
  heroHp: number,
  wrecked: number,
  maxHeroStep: number,
  minGap: number,
): unknown {
  return {
    bossHp: Math.round((boss?.hp ?? 0) * 100) / 100,
    bossX: Math.round((boss?.x ?? 0) * 100) / 100,
    bossZ: Math.round((boss?.z ?? 0) * 100) / 100,
    heroHp,
    wrecked,
    maxHeroStep: Number(maxHeroStep.toFixed(3)),
    minGap: Number(minGap.toFixed(3)),
  };
}
