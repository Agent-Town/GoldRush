import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { META_PROGRESS_KEY } from '../src/game/MetaProgress';
import { FIRST_CLAIM_DONE_KEY, PROFILE_KEY, TOWN_NAME_KEY, profileDataKey } from '../src/game/ProfileStorage';
import { ACTIVE_EPOCH_KEY } from '../src/meta/ContractFamilies';

type Blocker = { id: string; x: number; z: number; halfX: number; halfZ: number };
type Errors = { console: string[]; page: string[] };
const ARTIFACT_DIR = path.resolve('artifacts/lane-landmark-collision');

function collectErrors(page: Page): Errors {
  const errors: Errors = { console: [], page: [] };
  page.on('console', (message) => { if (message.type() === 'error') errors.console.push(message.text()); });
  page.on('pageerror', (error) => errors.page.push(error.message));
  return errors;
}

async function bootRun(page: Page, contractId: string): Promise<void> {
  await page.goto(`/?debug&contract=${contractId}&nowaves&nolevel&nopause&nosteal&nowreck&seed=landmark-collision-${contractId}`);
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 16);
  await expect(page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId)).resolves.toBe(contractId);
}

async function blocker(page: Page, id: string): Promise<Blocker> {
  const found = await page.evaluate(async (target) => {
    const terrain = await Function('return import("/src/world/Terrain.ts")')() as typeof import('../src/world/Terrain');
    return terrain.landmarkBlockers().find((entry) => entry.id.endsWith(`:${target}`)) ?? null;
  }, id);
  expect(found).not.toBeNull();
  return found!;
}

async function hold(page: Page, key: string, ms: number): Promise<void> {
  await page.keyboard.down(key);
  await page.waitForTimeout(ms);
  await page.keyboard.up(key);
}

async function expectHeroStoppedBy(page: Page, landmark: Blocker): Promise<void> {
  const collisionPad = 0.42;
  await page.evaluate(({ x, z }) => window.__GR_TEST__?.teleport(x, z), {
    x: landmark.x,
    z: landmark.z - landmark.halfZ - collisionPad - 0.45,
  });
  await hold(page, 'KeyS', 1_600);
  const hero = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.heroPos);
  expect(hero.z).toBeLessThanOrEqual(landmark.z - landmark.halfZ - collisionPad + 0.08);
  await expect(page.evaluate(({ x, z }) => window.__GR_TEST__?.terrainSample(x, z).walkable, hero)).resolves.toBe(true);
}

test('authored footprints stop the hero on The Claim and a county map while an unfootprinted mount stays walkable', async ({ page }) => {
  test.setTimeout(60_000);
  const errors = collectErrors(page);

  await bootRun(page, 'the-claim');
  const claimHouse = await blocker(page, 'maintained_claim_house');
  await expect(page.evaluate(({ x, z }) => window.__GR_TEST__?.terrainSample(x, z).walkable, claimHouse)).resolves.toBe(false);
  await expectHeroStoppedBy(page, claimHouse);
  await expect(page.evaluate(() => window.__GR_TEST__?.terrainSample(6.5, 10.5).walkable)).resolves.toBe(true);

  await bootRun(page, 'e1-dry-gulch');
  const farmhouse = await blocker(page, 'abandoned_farmhouse');
  await expectHeroStoppedBy(page, farmhouse);
  expect(errors).toEqual({ console: [], page: [] });
});

test('enemy blocker routing is deterministic and goes around a county landmark', async ({ page }) => {
  const errors = collectErrors(page);
  await bootRun(page, 'e1-dry-gulch');
  const landmark = await blocker(page, 'ruined_mining_operation');

  const run = () => page.evaluate((target) => {
    const testApi = window.__GR_TEST__!;
    testApi.setManualSim(true);
    testApi.clearEnemies();
    testApi.teleport(28, 28);
    testApi.setBalance('sparkRig.range', 0);
    testApi.scriptEnemyAt(target.x, target.z - target.halfZ - 1.2, target.x, target.z + target.halfZ + 1.2, 4);
    const path: Array<{ x: number; z: number }> = [];
    testApi.advanceSim(6, () => {
      const enemy = testApi.enemyPositions()[0];
      if (enemy) path.push({ x: Number(enemy.x.toFixed(3)), z: Number(enemy.z.toFixed(3)) });
    });
    return path;
  }, landmark);

  const first = await run();
  const second = await run();
  expect(second).toEqual(first);
  expect(first.some(({ x }) => Math.abs(x - landmark.x) > landmark.halfX)).toBe(true);
  expect(first.at(-1)!.z).toBeGreaterThan(landmark.z + landmark.halfZ);
  expect(first.every(({ x, z }) => Math.abs(x - landmark.x) > landmark.halfX || Math.abs(z - landmark.z) > landmark.halfZ)).toBe(true);
  expect(errors).toEqual({ console: [], page: [] });
});

async function seedTown(page: Page, epoch?: string): Promise<void> {
  await page.addInitScript(({ profile, town, meta, guide, epochKey, activeEpoch }) => {
    localStorage.clear();
    localStorage.setItem(profile, JSON.stringify({ version: 2, activeId: 'robin', profiles: [{ id: 'robin', name: 'Robin', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: [] }] }));
    localStorage.setItem(town, 'Quartz Hill');
    localStorage.setItem(meta, JSON.stringify({ version: 1, tracks: { territory: 3, science: 0, hero: 0, agent: 0 } }));
    localStorage.setItem(guide, '1');
    if (activeEpoch) localStorage.setItem(epochKey, activeEpoch);
  }, {
    profile: PROFILE_KEY,
    town: profileDataKey('robin', TOWN_NAME_KEY),
    meta: profileDataKey('robin', META_PROGRESS_KEY),
    guide: profileDataKey('robin', FIRST_CLAIM_DONE_KEY),
    epochKey: profileDataKey('robin', ACTIVE_EPOCH_KEY),
    activeEpoch: epoch,
  });
}

async function openTown(page: Page): Promise<void> {
  await page.goto('/');
  await page.getByTestId('start-menu-enter-town').click();
  await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 40);
}

test('Town chapel and Pan Monument are solid and default 3D renders exactly one monument', async ({ page }, testInfo: TestInfo) => {
  test.setTimeout(60_000);
  const errors = collectErrors(page);
  await seedTown(page);
  await openTown(page);
  await expect(page.locator('canvas')).toHaveAttribute('data-town3d-pan-monument-instances', '1');
  await expect(page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.propRing.panMonument.legacyPrimitive)).resolves.toBe(false);

  await hold(page, 'KeyW', 1_200);
  expect((await page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__!.player)).z).toBeGreaterThan(1);

  await openTown(page);
  await hold(page, 'KeyA', 1_200);
  await hold(page, 'KeyS', 1_600);
  const chapelApproach = await page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__!.player);
  expect(chapelApproach.z).toBeLessThan(7.1);
  await expect.poll(() => page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.activePrompt)).toBe('chapel');

  await mkdir(ARTIFACT_DIR, { recursive: true });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, `${testInfo.project.name}-town-solids.png`) });
  expect(errors).toEqual({ console: [], page: [] });
});

test('a failed 3D prop load keeps the legacy Pan Monument visible and solid', async ({ page }) => {
  const errors = collectErrors(page);
  await page.route(/water_trough\.glb/, (route) => route.fulfill({ body: 'bad glb', contentType: 'model/gltf-binary' }));
  await seedTown(page);
  await openTown(page);
  await expect(page.locator('canvas')).toHaveAttribute('data-town3d-plaza-props-state', 'error');
  await expect(page.locator('canvas')).toHaveAttribute('data-town3d-pan-monument-instances', '0');
  await expect.poll(() => page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.propRing.panMonument.legacyPrimitive)).toBe(true);
  await hold(page, 'KeyW', 1_200);
  expect((await page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__!.player)).z).toBeGreaterThan(1);
  expect(errors).toEqual({ console: [], page: [] });
});

test('later-era modeled plaza props use their authored Town footprints', async ({ page }) => {
  const errors = collectErrors(page);
  await seedTown(page, 'epoch-2-steamworks');
  await openTown(page);
  await expect(page.locator('canvas')).toHaveAttribute('data-town3d-plaza-props-state', 'loaded');
  await expect(page.locator('canvas')).toHaveAttribute('data-town3d-era-prop-ids', /e2-pressure-manifold-plaza-edge/);
  await hold(page, 'KeyD', 350);
  await hold(page, 'KeyS', 1_200);
  const hero = await page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__!.player);
  expect(hero.x).toBeGreaterThan(1.2);
  expect(hero.z).toBeLessThan(6.5);
  expect(errors).toEqual({ console: [], page: [] });
});
