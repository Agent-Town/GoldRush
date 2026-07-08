import { expect, test, type Browser, type Page, type TestInfo } from '@playwright/test';
import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };
type Point = { x: number; z: number };
type CombatState = {
  shots: Record<'bolt' | 'lob', number>;
  lastShotKind: 'bolt' | 'lob' | null;
  lastShotOwnerId: string | null;
};

const ARTIFACT_DIR = path.resolve('artifacts/gt-04');
const DEV_QUERY = '?debug&tile=gt-test-basin&nowaves&nolevel&nopause&nosteal&nowreck';
const WEST = { x: -10, z: 18 };
const EAST = { x: 14, z: 18 };
const LOB_WEST = { x: -4, z: 18 };
const LOB_EAST = { x: 5.5, z: 18 };
const RIDGE_TOP = { x: 2, z: 18 };
const HIGH_TARGET = { x: 20, z: 18 };
const IMPACT_Y = 0.08;

function collectErrors(page: Page): ErrorBucket {
  const bucket: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') bucket.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => bucket.pageErrors.push(error.message));
  return bucket;
}

async function waitForGame(page: Page): Promise<void> {
  await expect(page.locator('#game-canvas')).toBeVisible();
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 16);
}

async function openDevTile(page: Page, seed: string, extra = ''): Promise<ErrorBucket> {
  const errors = collectErrors(page);
  await loadDevTile(page, seed, extra);
  return errors;
}

async function loadDevTile(page: Page, seed: string, extra = ''): Promise<void> {
  await page.goto(`${DEV_QUERY}&seed=${seed}${extra}`);
  await waitForGame(page);
  await expect(page.evaluate(() => window.__GR_CONTRACT_REGISTRY__?.activeTileDescriptor().id)).resolves.toBe('gt-test-basin');
  await expect(page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.terrain.sim.flat)).resolves.toBe(false);
}

async function setBalance(page: Page, key: string, value: number): Promise<void> {
  await expect(page.evaluate(([pathKey, next]) => window.__GR_TEST__?.setBalance(pathKey, next), [key, value] as const)).resolves.toBe(true);
}

async function easyTargets(page: Page): Promise<void> {
  await setBalance(page, 'enemy.hp', 20);
  await setBalance(page, 'enemy.speed', 0);
  await setBalance(page, 'enemy.contactDamage', 0);
  await setBalance(page, 'sparkRig.range', 0);
}

async function placeFree(page: Page, id: 'turret', point: Point): Promise<void> {
  await expect(page.evaluate(([buildable, x, z]) => window.__GR_TEST__?.placeFree(buildable, x, z), [id, point.x, point.z] as const)).resolves.toBe(true);
}

async function parkHero(page: Page): Promise<void> {
  await page.evaluate(() => window.__GR_TEST__?.teleport(32, -28));
}

async function spawnEnemy(page: Page, point: Point): Promise<void> {
  await expect(page.evaluate((target) => window.__GR_TEST__?.spawnEnemyAt(target.x, target.z), point)).resolves.toBe(true);
}

async function combat(page: Page): Promise<CombatState> {
  return page.evaluate(() => window.__GR_TEST__?.state().combat as CombatState);
}

async function waitForBlockedLos(page: Page): Promise<void> {
  await expect
    .poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.terrain.sim.lastLos.blockedAt !== null), { timeout: 8_000 })
    .toBe(true);
}

async function screenshot(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, `${testInfo.project.name}-${name}.png`), fullPage: false });
}

async function visualY(page: Page, point: Point, base = 0): Promise<number> {
  return page.evaluate(([target, y]) => window.__GR_TEST__?.terrainVisualY(target.x, target.z, y) ?? Number.NaN, [point, base] as const);
}

test('ridge blocks bolt acquisition from both sides', async ({ page }, testInfo) => {
  test.setTimeout(35_000);
  const errors = await openDevTile(page, `gt-04-denied-${testInfo.project.name}`, '&timescale=8&nokill');
  await easyTargets(page);
  await setBalance(page, 'turret.range', 40);
  await setBalance(page, 'turret.fireRate', 4);

  await placeFree(page, 'turret', WEST);
  await parkHero(page);
  await spawnEnemy(page, EAST);
  await waitForBlockedLos(page);
  await page.waitForTimeout(700);
  await screenshot(page, testInfo, 'turret-denied-through-ridge');
  expect((await combat(page)).shots).toEqual({ bolt: 0, lob: 0 });

  await loadDevTile(page, `gt-04-denied-reverse-${testInfo.project.name}`, '&timescale=8&nokill');
  await easyTargets(page);
  await setBalance(page, 'turret.range', 40);
  await setBalance(page, 'turret.fireRate', 4);
  await placeFree(page, 'turret', EAST);
  await parkHero(page);
  await spawnEnemy(page, WEST);
  await waitForBlockedLos(page);
  await page.waitForTimeout(700);
  const state = await combat(page);
  const lastLos = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.terrain.sim.lastLos);
  expect(state.shots).toEqual({ bolt: 0, lob: 0 });
  expect(lastLos).toMatchObject({ flat: false, clear: false, samples: 11 });
  expect(lastLos?.blockedAt).not.toBeNull();
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('lob arcs over ridge and detonates on target terrain height', async ({ page }, testInfo) => {
  test.setTimeout(35_000);
  const errors = await openDevTile(page, `gt-04-lob-${testInfo.project.name}`, '&timescale=4');
  await easyTargets(page);
  await setBalance(page, 'blast.cooldown', 0.25);
  await setBalance(page, 'blast.airTime', 0.6);
  await setBalance(page, 'blast.damage', 1);
  await page.evaluate((point) => window.__GR_TEST__?.teleport(point.x, point.z), LOB_WEST);
  await expect(page.evaluate(() => window.__GR_TEST__?.toggleWeapon())).resolves.toBe('blast');
  await page.evaluate((point) => window.__GR_TEST__?.setBlastAim(point.x, point.z), LOB_EAST);

  const before = await page.evaluate(() => window.__GR_TEST__?.state().arsenal.detonations ?? 0);
  await spawnEnemy(page, LOB_EAST);
  await expect.poll(() => page.evaluate(() => window.__GR_TEST__?.state().arsenal.blastsAlive ?? 0), { timeout: 10_000 }).toBeGreaterThan(0);
  await screenshot(page, testInfo, 'lob-clearing-ridge');
  await expect
    .poll(() => page.evaluate((start) => (window.__GR_TEST__?.state().arsenal.detonations ?? 0) - start, before), { timeout: 10_000 })
    .toBeGreaterThan(0);

  const expectedY = await visualY(page, LOB_EAST, IMPACT_Y);
  const report = await page.evaluate(() => ({
    combat: window.__GR_TEST__?.state().combat,
    arsenal: window.__GR_TEST__?.state().arsenal,
    los: window.__THREE_GAME_DIAGNOSTICS__?.terrain.sim.lastLos,
  }));
  await writeFile(path.join(ARTIFACT_DIR, `${testInfo.project.name}-lob-report.json`), `${JSON.stringify({ expectedY, report }, null, 2)}\n`);
  expect(report.combat?.shots.lob ?? 0).toBeGreaterThan(0);
  expect(report.combat?.lastShotKind).toBe('lob');
  expect(report.arsenal?.lastDetonation?.y).toBeCloseTo(expectedY, 2);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('high ground range bonus extends turret acquisition beyond base range', async ({ page }, testInfo) => {
  test.setTimeout(35_000);
  const errors = await openDevTile(page, `gt-04-range-${testInfo.project.name}`, '&timescale=8');
  await easyTargets(page);
  await setBalance(page, 'enemy.hp', 10);
  await setBalance(page, 'turret.range', 16);
  await setBalance(page, 'turret.fireRate', 4);
  await setBalance(page, 'gt.highGroundRangeBonus', 0);
  await placeFree(page, 'turret', RIDGE_TOP);
  await parkHero(page);
  await spawnEnemy(page, HIGH_TARGET);

  await page.waitForTimeout(800);
  expect((await combat(page)).shots.bolt).toBe(0);

  await setBalance(page, 'gt.highGroundRangeBonus', 1.5);
  await expect.poll(() => combat(page).then((state) => state.shots.bolt), { timeout: 10_000 }).toBeGreaterThan(0);
  const report = await page.evaluate(() => ({
    distance: Math.hypot(20 - 2, 18 - 18),
    height: window.__GR_TEST__?.terrainSim(2, 18).height,
    rangeBonus: window.__THREE_GAME_DIAGNOSTICS__?.terrain.sim.gt.highGroundRangeBonus,
    combat: window.__GR_TEST__?.state().combat,
    kills: window.__THREE_GAME_DIAGNOSTICS__?.build.killsByOwner,
  }));
  await writeFile(path.join(ARTIFACT_DIR, `${testInfo.project.name}-range-report.json`), `${JSON.stringify(report, null, 2)}\n`);
  expect(report.distance).toBeGreaterThan(16);
  expect(report.height ?? 0).toBeGreaterThan(1.5);
  expect(report.combat?.lastShotKind).toBe('bolt');
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('flat claim fingerprint keeps LOS fast path sample-free', async ({ browser }, testInfo) => {
  test.setTimeout(35_000);
  await mkdir(ARTIFACT_DIR, { recursive: true });
  const runA = await flatHash(browser, 'gt-04-flat');
  const runB = await flatHash(browser, 'gt-04-flat');
  await writeFile(path.join(ARTIFACT_DIR, `flat-fingerprint-${testInfo.project.name}.json`), `${JSON.stringify({ runA, runB }, null, 2)}\n`);
  expect(runB.hash).toBe(runA.hash);
  expect(runA.payload.sim.lastLos).toMatchObject({ flat: true, clear: true, samples: 0 });
  expect(runA.errors.consoleErrors).toEqual([]);
  expect(runA.errors.pageErrors).toEqual([]);
  expect(runB.errors.consoleErrors).toEqual([]);
  expect(runB.errors.pageErrors).toEqual([]);
});

test('terrain LOS is deterministic and 200-enemy basin stress stays in envelope', async ({ browser, page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chrome', 'stress proof is desktop-only');
  test.setTimeout(60_000);
  await mkdir(ARTIFACT_DIR, { recursive: true });

  const runA = await terrainHash(browser, 'gt-04-determinism');
  const runB = await terrainHash(browser, 'gt-04-determinism');
  expect(runB.hash).toBe(runA.hash);

  const errors = await openDevTile(page, 'gt-04-stress', '&timescale=3&stress=200&nokill');
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.frameMs.sampleCount ?? 0), { timeout: 12_000 }).toBeGreaterThan(60);
  const stress = await page.evaluate(() => ({
    stressCount: window.__THREE_GAME_DIAGNOSTICS__?.stressCount ?? 0,
    enemiesAlive: window.__THREE_GAME_DIAGNOSTICS__?.enemiesAlive ?? 0,
    frameMs: window.__THREE_GAME_DIAGNOSTICS__?.frameMs,
    renderer: window.__THREE_GAME_DIAGNOSTICS__?.renderer,
    los: window.__THREE_GAME_DIAGNOSTICS__?.terrain.sim.lastLos,
  }));
  await writeFile(path.join(ARTIFACT_DIR, 'determinism-stress-report.json'), `${JSON.stringify({ runA, runB, stress }, null, 2)}\n`);
  expect(stress.stressCount).toBe(200);
  expect(stress.enemiesAlive).toBeGreaterThan(0);
  expect(stress.frameMs?.p95 ?? Number.POSITIVE_INFINITY).toBeLessThanOrEqual(80);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

async function flatHash(browser: Browser, seed: string): Promise<{ hash: string; payload: { sim: NonNullable<ThreeGameDiagnostics['terrain']>['sim']; samples: unknown[] }; errors: ErrorBucket }> {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const errors = collectErrors(page);
  await page.goto(`/?debug&nowaves&nolevel&nokill&nopause&nosteal&nowreck&seed=${seed}`);
  await waitForGame(page);
  const payload = await page.evaluate(() => ({
    sim: window.__THREE_GAME_DIAGNOSTICS__!.terrain.sim,
    samples: [window.__GR_TEST__?.terrainSim(0, 12), window.__GR_TEST__?.terrainSim(2, 18), window.__GR_TEST__?.terrainSim(20, 18)],
  }));
  await page.close();
  return { hash: createHash('sha256').update(JSON.stringify(payload)).digest('hex'), payload, errors };
}

async function terrainHash(browser: Browser, seed: string): Promise<{ hash: string; payload: unknown; errors: ErrorBucket }> {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const errors = await openDevTile(page, seed, '&timescale=8&nokill');
  await easyTargets(page);
  await setBalance(page, 'turret.range', 40);
  await setBalance(page, 'turret.fireRate', 4);
  await placeFree(page, 'turret', WEST);
  await parkHero(page);
  await spawnEnemy(page, EAST);
  await waitForBlockedLos(page);
  const payload = await page.evaluate(() => ({
    los: window.__THREE_GAME_DIAGNOSTICS__?.terrain.sim.lastLos,
    combat: window.__GR_TEST__?.state().combat,
    samples: [window.__GR_TEST__?.terrainSim(-10, 18), window.__GR_TEST__?.terrainSim(2, 18), window.__GR_TEST__?.terrainSim(14, 18)],
  }));
  await page.close();
  return { hash: createHash('sha256').update(JSON.stringify(payload)).digest('hex'), payload, errors };
}
