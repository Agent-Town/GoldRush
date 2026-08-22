import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page, type TestInfo } from '@playwright/test';

const QUERY = '?debug&contract=e1-night-shift&nowaves&nolevel&nosteal&nowreck&seed=c3-hero-move-pin';
const YARD_PAD = 0.58;

async function boot(page: Page): Promise<void> {
  await page.goto(`/${QUERY}`);
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  expect(await page.evaluate(() => window.__GR_TEST__?.setManualSim(true))).toBe(true);
}

async function yard(page: Page) {
  return page.evaluate(async () => {
    const terrain = await Function('return import("/src/world/Terrain.ts")')() as typeof import('../src/world/Terrain');
    return terrain.landmarkBlockers().find((entry) => entry.id.endsWith(':lampworks_yard'))!;
  });
}

async function drive(page: Page, keys: string[], seconds: number): Promise<void> {
  await page.evaluate(({ down, duration }) => {
    for (const code of down) window.dispatchEvent(new KeyboardEvent('keydown', { code, bubbles: true }));
    window.__GR_TEST__!.advanceSim(duration);
    for (const code of down) window.dispatchEvent(new KeyboardEvent('keyup', { code, bubbles: true }));
  }, { down: keys, duration: seconds });
}

async function position(page: Page) {
  return page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.heroPos);
}

async function expectWalkable(page: Page): Promise<void> {
  const hero = await position(page);
  expect(await page.evaluate(({ x, z }) => window.__GR_TEST__!.terrainSample(x, z).walkable, hero)).toBe(true);
}

async function expectCardinalMovement(page: Page, origin: { x: number; z: number }): Promise<void> {
  for (const key of ['KeyW', 'KeyA', 'KeyS', 'KeyD']) {
    await page.evaluate(({ x, z }) => window.__GR_TEST__!.teleport(x, z), origin);
    const before = await position(page);
    await drive(page, [key], 1);
    const after = await position(page);
    expect(Math.hypot(after.x - before.x, after.z - before.z), key).toBeGreaterThanOrEqual(0.5);
  }
}

async function expectMovementAwayFrom(page: Page, origin: { x: number; z: number }, blocker: { x: number; z: number }): Promise<void> {
  const key = Math.abs(origin.x - blocker.x) >= Math.abs(origin.z - blocker.z)
    ? origin.x < blocker.x ? 'KeyA' : 'KeyD'
    : origin.z < blocker.z ? 'KeyW' : 'KeyS';
  const before = await position(page);
  await drive(page, [key], 1);
  const after = await position(page);
  expect(Math.hypot(after.x - before.x, after.z - before.z)).toBeGreaterThanOrEqual(0.5);
}

test('the Lampworks Yard corner never admits or pins the hero', async ({ page }, testInfo: TestInfo) => {
  await boot(page);
  const blocker = await yard(page);
  const corner = {
    x: blocker.x + blocker.halfX + YARD_PAD + 0.005,
    z: blocker.z + blocker.halfZ + YARD_PAD + 0.005,
  };
  await page.evaluate(({ x, z }) => window.__GR_TEST__!.teleport(x, z), corner);
  await drive(page, ['KeyW', 'KeyA'], 1 / 60);
  await expectWalkable(page);
  await drive(page, ['KeyW', 'KeyA'], 3);
  const escapedCorner = await position(page);
  await expectCardinalMovement(page, escapedCorner);

  await mkdir('reviews/shots-c3', { recursive: true });
  await page.screenshot({ path: path.join('reviews/shots-c3', `${testInfo.project.name}-yard-corner.png`) });
});

test('forced footprint placement and a poisoned restore relocate to walkable ground', async ({ page }) => {
  await boot(page);
  const blocker = await yard(page);

  await page.evaluate(({ x, z }) => window.__GR_TEST__!.teleport(x, z), blocker);
  await page.evaluate(() => window.__GR_TEST__!.advanceSim(1));
  await expectWalkable(page);
  await expectMovementAwayFrom(page, await position(page), blocker);

  const restored = await page.evaluate(({ x, z }) => {
    const snapshot = window.__GR_TEST__!.captureSuspend();
    snapshot.hero.position = { x, y: 100, z };
    snapshot.hero.velocity = { x: 0, y: 0, z: 0 };
    return window.__GR_TEST__!.restoreSuspend(snapshot);
  }, blocker);
  expect(restored).toBe(true);
  await expectWalkable(page);
  expect((await position(page)).y).toBeLessThan(5);
  await expectMovementAwayFrom(page, await position(page), blocker);
});

test('full terrain escape frees a hero placed in deep water', async ({ page }) => {
  await boot(page);
  await page.evaluate(() => window.__GR_TEST__!.teleport(12, 0));
  expect(await page.evaluate(() => window.__GR_TEST__!.terrainSample(12, 0).walkable)).toBe(false);
  await page.evaluate(() => window.__GR_TEST__!.advanceSim(1));
  await expectWalkable(page);
  await expectMovementAwayFrom(page, await position(page), { x: 12, z: 0 });
});

test('movement watchdog records one self-describing pin entry', async ({ page }) => {
  await page.goto('/?debug&contract=e8-low-orbit&nowaves&nolevel&nosteal&nowreck&seed=c3-watchdog');
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  expect(await page.evaluate(() => window.__GR_TEST__?.setManualSim(true))).toBe(true);
  const edge = await page.evaluate(async () => {
    const terrain = await Function('return import("/src/world/Terrain.ts")')() as typeof import('../src/world/Terrain');
    return { x: terrain.bounds.maxX - 0.5, z: 24 };
  });
  await page.evaluate(({ x, z }) => window.__GR_TEST__!.teleport(x, z), edge);
  await drive(page, ['KeyD'], 0.5);
  await page.evaluate(() => window.__GR_TEST__!.advanceSim(3));
  expect(await page.evaluate(() => (window.__THREE_GAME_DIAGNOSTICS__ as any).movePin)).toBeNull();
  await drive(page, ['KeyD'], 2.1);
  const diagnostic = await page.evaluate(() => (window.__THREE_GAME_DIAGNOSTICS__ as any).movePin as {
    x: number;
    z: number;
    sample: { walkable: boolean };
    sinceSeconds: number;
  });
  expect(diagnostic).toMatchObject({ x: edge.x, z: edge.z, sample: { walkable: true } });
  expect(diagnostic!.sinceSeconds).toBeGreaterThan(2);
});

test('plain boot stays free of console and page errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/?contract=e1-night-shift&nowaves&nolevel&seed=c3-plain-boot');
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  expect(errors).toEqual([]);
});
