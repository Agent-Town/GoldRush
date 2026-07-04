import { expect, test, type Page } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { Balance } from '../src/game/Balance';
import { initialEconomyState, reduce, type EconomyEvent } from '../src/game/Economy';

type BuildableId = 'sentry_beacon' | 'palisade' | 'sluice' | 'stockpile';
type ErrorBucket = {
  consoleErrors: string[];
  pageErrors: string[];
};
type Rect = { x: number; y: number; width: number; height: number };

const shotDir = path.resolve('reviews/shots-m2-02');

function collectErrors(page: Page): ErrorBucket {
  const bucket: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') bucket.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => bucket.pageErrors.push(error.message));
  return bucket;
}

async function openGame(page: Page, query = '?debug&timescale=6&nowaves&nolevel&seed=m2-02'): Promise<ErrorBucket> {
  const errors = collectErrors(page);
  await page.goto(`/${query}`);
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  return errors;
}

async function shot(page: Page, name: string): Promise<void> {
  fs.mkdirSync(shotDir, { recursive: true });
  await page.screenshot({ path: path.join(shotDir, `${name}.png`), fullPage: false });
}

async function grantGold(page: Page, amount: number): Promise<void> {
  const before = await gold(page);
  await page.evaluate((value) => window.__GR_TEST__?.grantGold(value), amount);
  await expect.poll(() => gold(page)).toBe(before + amount);
}

async function gold(page: Page): Promise<number> {
  return page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.economy.gold ?? 0);
}

async function teleport(page: Page, x: number, z: number): Promise<void> {
  await page.evaluate((pos) => window.__GR_TEST__?.teleport(pos.x, pos.z), { x, z });
}

async function selectBuildable(page: Page, id: BuildableId): Promise<void> {
  await page.evaluate((buildableId) => window.__GR_TEST__?.selectBuildable(buildableId), id);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.selectedBuildable)).toBe(id);
}

async function buildableCount(page: Page, id: BuildableId): Promise<number> {
  return page.evaluate(
    (buildableId) => window.__THREE_GAME_DIAGNOSTICS__?.build.buildables.find((entry) => entry.id === buildableId)?.count ?? 0,
    id,
  );
}

async function placeBuildableAt(page: Page, id: BuildableId, x: number, z: number, rotated = false): Promise<void> {
  await teleport(page, x, z + 2);
  await selectBuildable(page, id);
  if (rotated) await page.evaluate(() => window.__GR_TEST__?.rotateBuildGhost());
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.ghostValid ?? false)).toBe(true);
  const before = await buildableCount(page, id);
  await page.evaluate(() => window.__GR_TEST__?.confirmBuild());
  await expect.poll(() => buildableCount(page, id)).toBe(before + 1);
}

async function economyLog(page: Page): Promise<EconomyEvent[]> {
  return page.evaluate(() => [...(window.__GR_TEST__?.economyLog() ?? [])] as EconomyEvent[]);
}

async function waitForSim(page: Page, seconds: number): Promise<void> {
  const start = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.timeAlive ?? 0);
  await page.waitForFunction(
    (target) => (window.__THREE_GAME_DIAGNOSTICS__?.timeAlive ?? 0) >= target,
    start + seconds,
    { timeout: 15_000 },
  );
}

function intersects(a: Rect, b: Rect): boolean {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

test('river-adjacent placement rejects away from river and accepts near the bank', async ({ page }) => {
  const errors = await openGame(page, '?debug&timescale=6&nowaves&nolevel&seed=m2-02-adjacency');
  await grantGold(page, 120);

  await page.keyboard.press('KeyB');
  await expect(page.getByTestId('hud-build-menu')).toBeVisible();
  await shot(page, 'menu-desktop');

  await teleport(page, 0, 14);
  await selectBuildable(page, 'sluice');
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.ghostValid ?? true)).toBe(false);
  await page.evaluate(() => window.__GR_TEST__?.confirmBuild());
  await expect.poll(() => buildableCount(page, 'sluice')).toBe(0);
  expect(await gold(page)).toBe(120);

  await placeBuildableAt(page, 'sluice', 0, 7);
  expect(await gold(page)).toBe(80);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('sluice income follows Balance cadence and replays to the HUD balance', async ({ page }) => {
  const errors = await openGame(page, '?debug&timescale=8&nowaves&nolevel&seed=m2-02-income');
  await grantGold(page, 120);
  await placeBuildableAt(page, 'sluice', 0, 7);
  await waitForSim(page, Balance.sluice.cycleSeconds * 2 + 0.3);
  await shot(page, 'working-sluice');

  const log = await economyLog(page);
  const sluiced = log.filter((event) => event.type === 'gold_sluiced');
  expect(sluiced.length).toBeGreaterThanOrEqual(2);
  expect(sluiced.every((event) => event.amount === Balance.sluice.goldPerCycle)).toBe(true);

  const replay = log.reduce(reduce, initialEconomyState);
  const diagnostics = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__);
  expect(diagnostics?.economy.gold).toBe(replay.gold);
  expect(diagnostics?.ui?.gold).toBe(replay.gold);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('contested sluice pauses its timer and resumes after the threat is cleared', async ({ page }) => {
  const errors = await openGame(page, '?debug&timescale=8&nowaves&nolevel&nokill&seed=m2-02-contested');
  await grantGold(page, 120);
  await placeBuildableAt(page, 'sluice', 0, 7);

  await page.evaluate(() => window.__GR_TEST__?.spawnEnemyAt(0, 7.2));
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.sluicesState[0]?.contested ?? false)).toBe(true);
  await waitForSim(page, Balance.sluice.cycleSeconds * 1.4);
  await shot(page, 'contested-sluice');
  expect((await economyLog(page)).filter((event) => event.type === 'gold_sluiced')).toHaveLength(0);

  await page.evaluate(() => window.__GR_TEST__?.clearEnemies());
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.enemiesAlive ?? 1)).toBe(0);
  await waitForSim(page, Balance.sluice.cycleSeconds + 0.5);
  expect((await economyLog(page)).filter((event) => event.type === 'gold_sluiced').length).toBeGreaterThan(0);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('bank cap blocks panning and sluicing until a stockpile raises capacity', async ({ page }) => {
  const errors = await openGame(page, '?debug&timescale=8&nowaves&nolevel&seed=m2-02-cap');
  await page.evaluate(() => window.__GR_TEST__?.setBalance('stockpile.cost', 0));
  await grantGold(page, 120);
  await placeBuildableAt(page, 'sluice', 0, 7);
  await grantGold(page, Balance.economy.bankCap - (await gold(page)));
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.economy.banked)).toBe(Balance.economy.bankCap);

  await waitForSim(page, Balance.sluice.cycleSeconds + 0.5);
  expect(await gold(page)).toBe(Balance.economy.bankCap);
  expect((await economyLog(page)).some((event) => event.type === 'gold_capped' && event.amount === 0)).toBe(true);
  expect((await economyLog(page)).filter((event) => event.type === 'gold_sluiced')).toHaveLength(0);

  const node = await page.evaluate(() => {
    const nodes = window.__THREE_GAME_DIAGNOSTICS__?.harvest.activeNodes.filter((entry) => entry.active) ?? [];
    return nodes[0];
  });
  expect(node).toBeTruthy();
  await teleport(page, node!.position.x, node!.position.z);
  const remainingBefore = node!.remaining;
  await waitForSim(page, Balance.goldSeam.tickSeconds + 0.5);
  const remainingAfter = await page.evaluate(
    (nodeId) => window.__THREE_GAME_DIAGNOSTICS__?.harvest.activeNodes.find((entry) => entry.id === nodeId)?.remaining,
    node!.id,
  );
  expect(remainingAfter).toBe(remainingBefore);
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.vfx.activeFloatTexts ?? 0)).toBeGreaterThan(0);

  await placeBuildableAt(page, 'stockpile', 3, 12);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.economy.bankCap)).toBe(
    Balance.economy.bankCap + Balance.stockpile.capBonus,
  );
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.pileStep ?? 0)).toBeGreaterThanOrEqual(2);
  await shot(page, 'stockpile-step2');
  await expect.poll(() => economyLog(page).then((log) => log.filter((event) => event.type === 'gold_sluiced').length)).toBeGreaterThan(0);
  expect(await gold(page)).toBeLessThanOrEqual(Balance.economy.bankCap + Balance.stockpile.capBonus);
  await expect(page.getByTestId('hud-gold')).toContainText(`${await gold(page)}/${Balance.economy.bankCap + Balance.stockpile.capBonus}`);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('R rotates the palisade footprint and the rotated AABB blocks on that axis', async ({ page }) => {
  const errors = await openGame(page, '?debug&timescale=5&nowaves&nolevel&nokill&seed=m2-02-rotation');
  await grantGold(page, 120);
  await teleport(page, 0, 11);
  await selectBuildable(page, 'palisade');
  const before = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.ghostFootprint);
  await page.keyboard.press('KeyR');
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.ghostRotationSteps ?? 0)).toBe(1);
  const after = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.ghostFootprint);
  expect(after).toEqual({ w: before?.d, d: before?.w });

  for (const z of [7, 8, 9, 10, 11]) {
    await placeBuildableAt(page, 'palisade', 0, z);
  }
  await shot(page, 'rotated-palisade-line');
  await page.evaluate(() => window.__GR_TEST__?.setBuildMode(false));
  await teleport(page, 4, 9);
  await page.evaluate(() => window.__GR_TEST__?.spawnEnemyAt(-5, 9));
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.enemiesAlive ?? 0)).toBe(1);

  await page.evaluate(() => {
    window.__M2_02_ROTATION__ = { crossedThrough: false, reached: false, done: false, samples: 0, last: null };
    const start = window.__THREE_GAME_DIAGNOSTICS__?.timeAlive ?? 0;
    const tick = () => {
      const tracker = window.__M2_02_ROTATION__!;
      const enemy = window.__GR_TEST__?.enemyPositions()[0];
      const now = window.__THREE_GAME_DIAGNOSTICS__?.timeAlive ?? start;
      if (enemy) {
        const last = tracker.last;
        if (last && last.x <= 2.18 && enemy.x > 2.18 && Math.abs(enemy.z - 9) <= 2.7) {
          tracker.crossedThrough = true;
        }
        const dx = enemy.x - 4;
        const dz = enemy.z - 9;
        tracker.reached ||= dx * dx + dz * dz <= 1.25 * 1.25;
        tracker.last = { x: enemy.x, z: enemy.z };
        tracker.samples += 1;
      }
      if (!tracker.reached && now - start < 20) requestAnimationFrame(tick);
      else tracker.done = true;
    };
    requestAnimationFrame(tick);
  });

  await expect.poll(() => page.evaluate(() => window.__M2_02_ROTATION__?.done ?? false), { timeout: 8_000 }).toBe(true);
  const tracker = await page.evaluate(() => window.__M2_02_ROTATION__);
  expect(tracker?.samples).toBeGreaterThan(0);
  expect(tracker?.crossedThrough).toBe(false);
  expect(tracker?.reached).toBe(true);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('390px build menu has four tappable tiles and keyboard slots 1-4 select them', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const errors = await openGame(page, '?debug&timescale=6&nowaves&nolevel&seed=m2-02-mobile');
  await grantGold(page, 300);

  await page.getByTestId('hud-build').click();
  const menu = page.getByTestId('hud-build-menu');
  await expect(menu).toBeVisible();
  await shot(page, 'menu-mobile-390');
  const menuBox = await menu.boundingBox();
  expect(menuBox).not.toBeNull();
  if (!menuBox) return;

  for (const id of ['sentry_beacon', 'palisade', 'sluice', 'stockpile'] as const) {
    const box = await page.getByTestId(`hud-build-tile-${id}`).boundingBox();
    expect(box).not.toBeNull();
    expect(box?.width).toBeGreaterThanOrEqual(44);
    expect(box?.height).toBeGreaterThanOrEqual(44);
  }

  for (const locator of [
    page.getByTestId('hud-vitals'),
    page.getByTestId('hud-gold'),
    page.getByTestId('hud-xp'),
    page.locator('#touch-stick'),
    page.locator('#confirm-button'),
    page.locator('#rotate-button'),
  ]) {
    const box = await locator.boundingBox();
    if (box) expect(intersects(menuBox, box)).toBe(false);
  }

  const ids = ['sentry_beacon', 'palisade', 'sluice', 'stockpile'] as const;
  for (let i = 0; i < ids.length; i += 1) {
    if (i > 0) {
      await page.keyboard.press('Escape');
      await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.mode ?? true)).toBe(false);
      await page.getByTestId('hud-build').click();
    }
    await page.keyboard.press(`Digit${i + 1}`);
    await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.selectedBuildable)).toBe(ids[i]);
  }
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

declare global {
  interface Window {
    __M2_02_ROTATION__?: {
      crossedThrough: boolean;
      reached: boolean;
      done: boolean;
      samples: number;
      last: { x: number; z: number } | null;
    };
  }
}
