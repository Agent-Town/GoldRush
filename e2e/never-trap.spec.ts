import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { META_PROGRESS_KEY } from '../src/game/MetaProgress';
import { FIRST_CLAIM_DONE_KEY, PROFILE_KEY, TOWN_NAME_KEY, profileDataKey } from '../src/game/ProfileStorage';

type Blocker = { x: number; z: number; halfX: number; halfZ: number };
type TownTarget = Blocker & { id: string };
const TOWN_COLLIDER_ARTIFACTS = path.resolve('artifacts/town-colliders');

function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(error.message));
  return errors;
}

async function bootRun(page: Page, contract = 'the-claim'): Promise<void> {
  await page.goto(`/?debug&contract=${contract}&nowaves&nolevel&nopause&nosteal&nowreck&seed=never-trap`);
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 16);
}

async function hold(page: Page, key: string, ms: number): Promise<void> {
  await page.keyboard.down(key);
  await page.waitForTimeout(ms);
  await page.keyboard.up(key);
}

function inside(point: { x: number; z: number }, blocker: Blocker, pad = 0): boolean {
  return Math.abs(point.x - blocker.x) <= blocker.halfX + pad && Math.abs(point.z - blocker.z) <= blocker.halfZ + pad;
}

test('repairing a wall releases the repairer and an enemy on its line immediately', async ({ page }) => {
  const errors = collectErrors(page);
  await bootRun(page);
  const result = await page.evaluate(() => {
    const api = window.__GR_TEST__!;
    api.setManualSim(true);
    api.grantGold(100);
    api.placeFree('palisade', 0, 8);
    api.wreck('palisade', 0);
    api.teleport(0, 8);
    api.spawnEnemyAt(0, 8);
    const repaired = api.repair('palisade', 0);
    return {
      repaired: Boolean(repaired),
      hero: window.__THREE_GAME_DIAGNOSTICS__!.heroPos,
      enemy: api.enemyPositions()[0],
    };
  });
  const wall = { x: 0, z: 8, halfX: 0.5, halfZ: 1.5 };
  expect(result.repaired).toBe(true);
  expect(inside(result.hero, wall, 0.42)).toBe(false);
  expect(result.enemy && inside(result.enemy, wall, 0.58)).toBe(false);
  expect(errors).toEqual([]);
});

test('hero and enemies escape a run landmark center within bounded ticks', async ({ page }) => {
  const errors = collectErrors(page);
  await bootRun(page, 'e1-baron');
  const blocker = await page.evaluate(async () => {
    const terrain = await Function('return import("/src/world/Terrain.ts")')() as typeof import('../src/world/Terrain');
    return terrain.landmarkBlockers().find((entry) => entry.id.endsWith(':rocket_cart'))!;
  });

  await page.evaluate(({ x, z }) => window.__GR_TEST__!.teleport(x, z), blocker);
  const heroStartTick = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.simulation.tick);
  await hold(page, 'KeyD', 1_200);
  const heroResult = await page.evaluate(() => ({ position: window.__THREE_GAME_DIAGNOSTICS__!.heroPos, tick: window.__THREE_GAME_DIAGNOSTICS__!.simulation.tick }));
  expect(inside(heroResult.position, blocker, 0.42)).toBe(false);
  expect(heroResult.tick - heroStartTick).toBeLessThanOrEqual(90);

  const enemies = await page.evaluate(({ x, z }) => {
    const api = window.__GR_TEST__!;
    api.setManualSim(true);
    api.clearEnemies();
    api.teleport(-24, -24);
    for (let index = 0; index < 6; index += 1) api.spawnEnemyAt(x, z);
    api.advanceSim(2.5);
    return api.enemyPositions();
  }, blocker);
  expect(enemies).toHaveLength(6);
  // M = 150 fixed simulation ticks (2.5 seconds).
  expect(enemies.every((enemy) => !inside(enemy, blocker, 0.58))).toBe(true);
  expect(errors).toEqual([]);
});

async function openTown(page: Page): Promise<void> {
  await page.addInitScript(({ profile, town, meta, guide }) => {
    localStorage.clear();
    localStorage.setItem(profile, JSON.stringify({ version: 2, activeId: 'robin', profiles: [{ id: 'robin', name: 'Robin', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: [] }] }));
    localStorage.setItem(town, 'Quartz Hill');
    localStorage.setItem(meta, JSON.stringify({ version: 1, tracks: { territory: 0, science: 0, hero: 0, agent: 0 } }));
    localStorage.setItem(guide, '1');
  }, {
    profile: PROFILE_KEY,
    town: profileDataKey('robin', TOWN_NAME_KEY),
    meta: profileDataKey('robin', META_PROGRESS_KEY),
    guide: profileDataKey('robin', FIRST_CLAIM_DONE_KEY),
  });
  await page.goto('/?tier=high');
  await page.getByTestId('start-menu-enter-town').click();
  await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 40);
  await expect.poll(
    () => page.locator('canvas').getAttribute('data-town3d-pilot-loaded-ids'),
    { timeout: 15_000 },
  ).toContain('general_store');
  await expect.poll(
    () => page.locator('canvas').getAttribute('data-town3d-pilot-loaded-ids'),
    { timeout: 15_000 },
  ).toContain('chapel');
}

async function expectNorthFaceSolid(page: Page, target: TownTarget): Promise<void> {
  const pad = 0.42;
  await page.evaluate(({ x, z }) => window.__GR_TOWN_DIAGNOSTICS__!.teleport(x, z), {
    x: target.x,
    z: target.z - target.halfZ - pad - 0.3,
  });
  await hold(page, 'KeyS', 700);
  const player = await page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__!.player);
  expect(inside(player, target, pad), `${target.id} north face`).toBe(false);
}

async function expectTownDepenetrates(page: Page, target: TownTarget): Promise<void> {
  await page.evaluate(({ x, z }) => window.__GR_TOWN_DIAGNOSTICS__!.teleport(x, z), target);
  await expect.poll(
    () => page.evaluate(({ blocker, pad }) => {
      const player = window.__GR_TOWN_DIAGNOSTICS__!.player;
      return Math.abs(player.x - blocker.x) <= blocker.halfX + pad &&
        Math.abs(player.z - blocker.z) <= blocker.halfZ + pad;
    }, { blocker: target, pad: 0.42 }),
    { message: `${target.id} never-trap`, timeout: 3_000 },
  ).toBe(false);
}

test('town building and Pan Monument centers always release movement input', async ({ page }, testInfo: TestInfo) => {
  test.setTimeout(60_000);
  const errors = collectErrors(page);
  await openTown(page);
  const targets = await page.evaluate(async () => {
    const layout = await Function('return import("/src/town/townLayout.ts")')() as typeof import('../src/town/townLayout');
    return {
      buildings: layout.townBuildings.map((building) => {
        const footprint = building.collisionFootprint ?? building.footprint;
        return { id: building.id, x: building.position.x, z: building.position.z, halfX: footprint.w / 2, halfZ: footprint.d / 2 };
      }),
      pan: { x: 0, z: 0, halfX: layout.townPropRing.panMonument.footprint.radius, halfZ: layout.townPropRing.panMonument.footprint.radius },
    };
  });

  for (const building of targets.buildings) {
    await expectNorthFaceSolid(page, building);
    await expectTownDepenetrates(page, building);
  }

  await page.evaluate(({ x, z }) => window.__GR_TOWN_DIAGNOSTICS__!.teleport(x, z), targets.pan);
  const panStartFrame = await page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__!.frame);
  await hold(page, 'KeyD', 800);
  const panResult = await page.evaluate(() => ({ player: window.__GR_TOWN_DIAGNOSTICS__!.player, frame: window.__GR_TOWN_DIAGNOSTICS__!.frame }));
  expect(inside(panResult.player, targets.pan, 0.42)).toBe(false);
  expect(panResult.frame - panStartFrame).toBeLessThanOrEqual(120);
  await mkdir(TOWN_COLLIDER_ARTIFACTS, { recursive: true });
  await page.screenshot({ path: path.join(TOWN_COLLIDER_ARTIFACTS, `${testInfo.project.name}-walk-probe.png`) });
  expect(errors).toEqual([]);
});
