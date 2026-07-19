import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import { PNG } from 'pngjs';
import { Balance } from '../src/game/Balance';

const SHOT_DIR = path.resolve('reviews/shots-night');

async function boot(page: Page, query: string): Promise<string[]> {
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(`/?debug&contract=e1-night-shift&nolevel&nopause&nokill&seed=night-mode-truth${query}`);
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  const briefing = page.getByTestId('contract-briefing');
  if (await briefing.isVisible().catch(() => false)) await page.getByTestId('contract-briefing-dismiss').click();
  return errors;
}

async function terrainLuminance(page: Page, x: number, z: number): Promise<number> {
  const point = await page.evaluate(([worldX, worldZ]) => {
    const game = window.__GR_TEST__!;
    return game.screenPoint(worldX!, worldZ!, game.terrainVisualY(worldX!, worldZ!, 0.03));
  }, [x, z] as const);
  expect(point.inView).toBe(true);
  const canvas = page.locator('#game-canvas');
  const [box, buffer] = await Promise.all([canvas.boundingBox(), canvas.screenshot()]);
  expect(box).toBeTruthy();
  const png = PNG.sync.read(buffer);
  const centerX = Math.round(point.x * png.width / box!.width);
  const centerY = Math.round(point.y * png.height / box!.height);
  const samples: number[] = [];
  for (let py = centerY - 4; py <= centerY + 4; py += 1) {
    for (let px = centerX - 4; px <= centerX + 4; px += 1) {
      const offset = (py * png.width + px) * 4;
      samples.push((0.2126 * png.data[offset]! + 0.7152 * png.data[offset + 1]! + 0.0722 * png.data[offset + 2]!) / 255);
    }
  }
  samples.sort((a, b) => a - b);
  return samples[Math.floor(samples.length / 2)] ?? 0;
}

async function setCanvasOnly(page: Page, enabled: boolean): Promise<void> {
  await page.evaluate((hide) => {
    const canvas = document.querySelector<HTMLCanvasElement>('#game-canvas');
    if (!canvas) return;
    for (const element of document.querySelectorAll<HTMLElement>('body *')) {
      if (element === canvas || element.contains(canvas) || canvas.contains(element)) continue;
      element.style.visibility = hide ? 'hidden' : '';
    }
  }, enabled);
}

test('hero pool brightens mesh terrain at the sim radius and lantern carriers read as figures', async ({ page }, testInfo) => {
  const errors = await boot(page, '&nowaves');
  await page.evaluate(() => {
    window.__GR_TEST__!.setWave(10);
    window.__GR_TEST__!.teleport(12, 12);
  });
  await page.waitForFunction(() => {
    const canvas = document.querySelector<HTMLCanvasElement>('#game-canvas');
    return canvas?.dataset.terrain3dPilotState === 'ready' && canvas.dataset.terrain3dPilotNightPools === 'world-shader';
  });

  await setCanvasOnly(page, true);
  await page.evaluate(() => window.__GR_TEST__!.setBalance('contracts.nightShift.heroLightRadius', 0));
  await page.waitForTimeout(100);
  const unlit = await terrainLuminance(page, 14.5, 12);
  const falloffUnlit = await terrainLuminance(page, 17.3, 12);
  await page.evaluate((radius) => window.__GR_TEST__!.setBalance('contracts.nightShift.heroLightRadius', radius), Balance.contracts.nightShift.heroLightRadius);
  await page.waitForTimeout(100);
  const lit = await terrainLuminance(page, 14.5, 12);
  const falloffLit = await terrainLuminance(page, 17.3, 12);
  await setCanvasOnly(page, false);

  const truth = await page.evaluate(({ radius, falloff }) => ({
    inside: window.__GR_TEST__!.lightCoverage(14.5, 12),
    outside: window.__GR_TEST__!.lightCoverage(12 + radius + falloff + 0.5, 12),
    shaderSources: Number(document.querySelector<HTMLCanvasElement>('#game-canvas')?.dataset.terrain3dPilotNightPoolSources ?? 0),
  }), { radius: Balance.contracts.nightShift.heroLightRadius, falloff: Balance.contracts.nightShift.lightFalloff });
  expect(lit - unlit).toBeGreaterThan(0.015);
  expect(falloffLit - falloffUnlit).toBeGreaterThan(0.003);
  expect(truth.inside).toBeGreaterThan(0.95);
  expect(truth.outside).toBeLessThan(0.1);
  expect(truth.shaderSources).toBeGreaterThan(0);

  expect(await page.evaluate(() => window.__GR_TEST__!.placeFree('sentry_beacon', -12, -12))).toBe(true);
  await page.waitForTimeout(100);
  expect(await page.evaluate(() => window.__GR_TEST__!.lightCoverage(-12, -12))).toBeLessThan(0.1);

  await page.evaluate(() => {
    const game = window.__GR_TEST__!;
    game.teleport(18, -18);
    game.spawnPack(5, 10, { hpScale: 100, speedScale: 0, carriedLantern: true });
  });
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.lighting?.enemyLanternCones ?? 0)).toBe(5);
  await mkdir(SHOT_DIR, { recursive: true });
  await setCanvasOnly(page, true);
  await page.locator('#game-canvas').screenshot({ path: path.join(SHOT_DIR, `${testInfo.project.name}-after.png`) });
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.lighting?.enemyLanterns)).toBe(5);
  expect(errors).toEqual([]);
});

test('the natural dark-wave wrecker assault reaches and damages the wall', async ({ page }) => {
  const errors = await boot(page, '');
  const placed = await page.evaluate(() => {
    const game = window.__GR_TEST__!;
    game.setWave(10);
    game.setManualSim(true);
    game.setBalance('sparkRig.range', 0);
    game.grantGold(1_000);
    return [-1, 0, 1].map((x) => game.placeFree('palisade', x, 9));
  });
  expect(placed).toEqual([true, true, true]);

  await page.evaluate(() => {
    const game = window.__GR_TEST__!;
    game.setBalance('waves.waveInterval', 10);
    game.setBalance('waves.lullSeconds', 1);
    game.setBalance('waves.trickleInterval', 9999);
    game.setWave(9);
    game.advanceSim(24);
  });
  const report = await page.evaluate(() => ({
    wave: window.__THREE_GAME_DIAGNOSTICS__?.wave,
    wreck: window.__THREE_GAME_DIAGNOSTICS__?.wreck,
    walls: window.__THREE_GAME_DIAGNOSTICS__?.build.hp.filter((entry) => entry.id === 'palisade') ?? [],
    wreckerPressure: window.__GR_TEST__?.enemyPositions()
      .filter((enemy) => enemy.wrecker)
      .map((enemy) => enemy.nightSpeedMultiplier) ?? [],
  }));
  expect(report.wave).toBeLessThanOrEqual(11);
  expect(report.wreck?.wreckers ?? 0).toBeGreaterThan(0);
  expect(report.wreckerPressure).toContain(Balance.contracts.nightShift.nightSpeedOutsideLight);
  expect(report.wreck?.hitsResolved ?? 0).toBeGreaterThan(0);
  expect(report.walls.some((wall) => wall.hp < wall.maxHp)).toBe(true);
  expect(errors).toEqual([]);
});
