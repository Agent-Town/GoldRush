import { expect, test, type Page, type TestInfo } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

type BuildableId = 'palisade';
type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };
type Point = { x: number; z: number };

const shotDir = path.resolve('artifacts/vfx-layering');

function collectErrors(page: Page): ErrorBucket {
  const bucket: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') bucket.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => bucket.pageErrors.push(error.message));
  return bucket;
}

async function openGame(page: Page): Promise<ErrorBucket> {
  const errors = collectErrors(page);
  await page.goto('/?debug&timescale=1&nowaves&nolevel&nopause&nosteal&seed=vfx-layering');
  await expect(page.locator('#game-canvas')).toBeVisible();
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
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
  await teleport(page, x, z + 2);
  await expect(page.evaluate((buildableId) => window.__GR_TEST__?.selectBuildable(buildableId), id)).resolves.toBe(true);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.ghostValid ?? false)).toBe(true);
  await expect(page.evaluate(() => window.__GR_TEST__?.confirmBuild())).resolves.toBe(true);
  await page.evaluate(() => window.__GR_TEST__?.setBuildMode(false));
}

async function wreck(page: Page, id: BuildableId, index = 0): Promise<void> {
  await expect(page.evaluate(([family, i]) => window.__GR_TEST__?.wreck(family, i), [id, index] as const)).resolves.toBe(true);
  await expect
    .poll(() =>
      page.evaluate(
        ([family, i]) =>
          window.__THREE_GAME_DIAGNOSTICS__?.build.hp.find((entry) => entry.id === family && entry.index === i)?.wrecked ?? false,
        [id, index] as const,
      ),
    )
    .toBe(true);
}

async function toggleBlast(page: Page): Promise<void> {
  await expect(page.evaluate(() => window.__GR_TEST__?.toggleWeapon())).resolves.toBe('blast');
  await expect.poll(() => page.evaluate(() => window.__GR_TEST__?.state().arsenal.active)).toBe('blast');
}

async function screenshot(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  fs.mkdirSync(shotDir, { recursive: true });
  await page.screenshot({
    path: path.join(shotDir, `${testInfo.project.name}-${name}.png`),
    fullPage: false,
  });
}

function distance(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.z - b.z);
}

test('blast VFX renders above rubble ground decals', async ({ page }, testInfo) => {
  const errors = await openGame(page);
  const layers = await page.evaluate(() => ({
    groundDecals: window.__THREE_GAME_DIAGNOSTICS__?.renderLayers.groundDecals,
    impactVfx: window.__THREE_GAME_DIAGNOSTICS__?.renderLayers.impactVfx,
    worldUi: window.__THREE_GAME_DIAGNOSTICS__?.renderLayers.worldUi,
  }));
  expect(layers).toEqual({ groundDecals: 1, impactVfx: 3, worldUi: 4 });
  const groundDecals = layers.groundDecals ?? Number.NEGATIVE_INFINITY;
  const impactVfx = layers.impactVfx ?? Number.NEGATIVE_INFINITY;
  const worldUi = layers.worldUi ?? Number.NEGATIVE_INFINITY;
  expect(impactVfx).toBeGreaterThan(groundDecals);
  expect(worldUi).toBeGreaterThan(impactVfx);

  await setBalance(page, 'enemy.hp', 10);
  await setBalance(page, 'enemy.speed', 0);
  await setBalance(page, 'enemy.contactDamage', 0);
  await setBalance(page, 'blast.airTime', 1.2);
  await setBalance(page, 'blast.cooldown', 0.25);
  await grantGold(page, 40);

  const rubble = { x: 0, z: 9 };
  await placeBuildableAt(page, 'palisade', rubble.x, rubble.z);
  await wreck(page, 'palisade');
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.ruins ?? 0)).toBeGreaterThan(0);

  await teleport(page, 0, 6);
  await toggleBlast(page);
  const expected = await page.evaluate((point) => window.__GR_TEST__?.setBlastAim(point.x, point.z) ?? { x: 999, z: 999 }, rubble);
  expect(distance(expected, rubble)).toBeLessThan(0.2);

  const before = await page.evaluate(() => window.__GR_TEST__?.state().arsenal.detonations ?? 0);
  await expect(page.evaluate((point) => window.__GR_TEST__?.spawnEnemyAt(point.x, point.z), rubble)).resolves.toBe(true);
  await expect.poll(() => page.evaluate(() => window.__GR_TEST__?.state().arsenal.blastsAlive ?? 0), { timeout: 12_000 }).toBe(1);
  await screenshot(page, testInfo, 'blast-charge-over-rubble');
  await expect
    .poll(() => page.evaluate((start) => (window.__GR_TEST__?.state().arsenal.detonations ?? 0) - start, before), {
      timeout: 12_000,
    })
    .toBe(1);

  const detonation = await page.evaluate(() => window.__GR_TEST__?.state().arsenal.lastDetonation ?? null);
  expect(detonation).not.toBeNull();
  expect(distance(detonation!, rubble)).toBeLessThan(0.35);
  await screenshot(page, testInfo, 'blast-detonation-over-rubble');

  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});
