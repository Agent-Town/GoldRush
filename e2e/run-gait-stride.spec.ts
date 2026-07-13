import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { Balance } from '../src/game/Balance';

const ARTIFACT_DIR = 'artifacts/run-gait-stride';

function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (message) => message.type() === 'error' && errors.push(message.text()));
  page.on('pageerror', (error) => errors.push(error.message));
  return errors;
}

async function sampleHeroFramesPerUnit(page: Page, speed: number): Promise<{ framesPerUnit: number; stride: number }> {
  await page.evaluate((value) => window.__GR_TEST__?.setBalance('hero.speed', value), speed);
  await page.keyboard.down('KeyS');
  await page.waitForFunction(
    (minimum) =>
      (window.__THREE_GAME_DIAGNOSTICS__?.speed ?? 0) > minimum &&
      window.__THREE_GAME_DIAGNOSTICS__?.spriteAnimations['char.hero']?.clip === 'walk',
    speed * 0.8,
  );
  const sample = await page.evaluate(async () => {
    const start = window.__THREE_GAME_DIAGNOSTICS__!.heroPos;
    let previous = window.__THREE_GAME_DIAGNOSTICS__!.spriteAnimations['char.hero']!.sourceFrameKey;
    let frames = 0;
    let distance = 0;
    const deadline = performance.now() + 8_000;
    while (distance < 10 && performance.now() < deadline) {
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      const diagnostics = window.__THREE_GAME_DIAGNOSTICS__!;
      const key = diagnostics.spriteAnimations['char.hero']!.sourceFrameKey;
      if (key !== previous) frames += 1;
      previous = key;
      distance = Math.hypot(diagnostics.heroPos.x - start.x, diagnostics.heroPos.z - start.z);
    }
    return {
      distance,
      frames,
      stride: window.__THREE_GAME_DIAGNOSTICS__!.spriteAnimations['char.hero']!.strideUnitsPerCycle ?? 0,
    };
  });
  await page.keyboard.up('KeyS');
  await page.waitForFunction(
    () =>
      (window.__THREE_GAME_DIAGNOSTICS__?.speed ?? 1) < 0.05 &&
      window.__THREE_GAME_DIAGNOSTICS__?.spriteAnimations['char.hero']?.clip === 'idle',
  );
  expect(sample.distance).toBeGreaterThanOrEqual(10);
  return { framesPerUnit: sample.frames / sample.distance, stride: sample.stride };
}

async function enemyFramesPerUnit(page: Page, visualScale: number): Promise<{ framesPerUnit: number; stride: number }> {
  await page.evaluate((scale) => {
    window.__GR_TEST__?.clearEnemies();
    window.__GR_TEST__?.spawnPack(1, 12, { speedScale: 3, visualScale: scale });
  }, visualScale);
  await page.waitForFunction(
    (minimumFps) => {
      const enemy = window.__GR_TEST__?.enemyPositions()[0];
      const sprite = window.__THREE_GAME_DIAGNOSTICS__?.spriteAnimations['char.bandit_base'];
      return enemy && Math.hypot(enemy.vx, enemy.vz) > 2 && sprite?.clip === 'walk' && (sprite.fps ?? 0) > minimumFps;
    },
    Balance.anim.walkMinFps,
  );
  return page.evaluate(() => {
    const enemy = window.__GR_TEST__!.enemyPositions()[0]!;
    const sprite = window.__THREE_GAME_DIAGNOSTICS__!.spriteAnimations['char.bandit_base']!;
    return {
      framesPerUnit: sprite.fps! / Math.hypot(enemy.vx, enemy.vz),
      stride: sprite.strideUnitsPerCycle ?? 0,
    };
  });
}

async function captureThreeSecondSeries(page: Page, testInfo: TestInfo): Promise<void> {
  mkdirSync(ARTIFACT_DIR, { recursive: true });
  await page.evaluate(() => window.__GR_TEST__?.setBalance('hero.speed', 6));
  await page.keyboard.down('KeyS');
  for (let second = 0; second <= 3; second += 1) {
    if (second > 0) await page.waitForTimeout(1_000);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, `${testInfo.project.name}-hero-${second}s.png`) });
  }
  await page.keyboard.up('KeyS');
}

test('run gait advances by distance and preserves the Baron cadence', async ({ page }, testInfo) => {
  test.setTimeout(60_000);
  const errors = collectErrors(page);
  await page.goto('/?debug&nowaves&nolevel&seed=run-gait-stride');
  await expect(page.locator('#game-canvas')).toBeVisible();
  await page.waitForFunction(() => Boolean(window.__GR_TEST__ && window.__THREE_GAME_DIAGNOSTICS__));
  const begin = page.getByRole('button', { name: 'Begin' });
  if (await begin.isVisible()) await begin.click();

  const start = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.heroPos);
  const fastHero = await sampleHeroFramesPerUnit(page, 6);
  await page.evaluate(({ x, z }) => window.__GR_TEST__?.teleport(x, z), start);
  const slowHero = await sampleHeroFramesPerUnit(page, 3);
  expect(slowHero.framesPerUnit / fastHero.framesPerUnit).toBeGreaterThan(0.9);
  expect(slowHero.framesPerUnit / fastHero.framesPerUnit).toBeLessThan(1.1);
  expect(fastHero.stride).toBeCloseTo(Balance.anim.strideUnits * 1.5, 1);
  await page.evaluate(({ x, z }) => window.__GR_TEST__?.teleport(x, z), start);
  await captureThreeSecondSeries(page, testInfo);

  const scaleOneEnemy = await enemyFramesPerUnit(page, 2 / 3);
  const scaleOnePointFiveEnemy = await enemyFramesPerUnit(page, 1);
  expect(scaleOnePointFiveEnemy.framesPerUnit / scaleOneEnemy.framesPerUnit).toBeCloseTo(1 / 1.5, 1);
  expect(scaleOneEnemy.stride).toBeCloseTo(Balance.anim.strideUnits, 1);
  expect(scaleOnePointFiveEnemy.stride).toBeCloseTo(Balance.anim.strideUnits * 1.5, 1);

  await page.evaluate(() => {
    window.__GR_TEST__?.clearEnemies();
    window.__GR_TEST__?.spawnPack(1, 12, { eliteKind: 'baron', speedScale: 3, visualScale: 4 });
  });
  await page.waitForFunction(
    () => {
      const enemy = window.__GR_TEST__?.enemyPositions()[0];
      return enemy && Math.hypot(enemy.vx, enemy.vz) > 2 && window.__THREE_GAME_DIAGNOSTICS__?.spriteAnimations['char.baron']?.clip === 'walk';
    },
  );
  const baron = await page.evaluate(() => {
    const enemy = window.__GR_TEST__!.enemyPositions()[0]!;
    const sprite = window.__THREE_GAME_DIAGNOSTICS__!.spriteAnimations['char.baron']!;
    return { framesPerUnit: sprite.fps! / Math.hypot(enemy.vx, enemy.vz), frameCount: sprite.frameCount! };
  });
  expect(baron.framesPerUnit).toBeCloseTo(Balance.anim.walkFpsPerSpeed * (baron.frameCount / 4), 5);

  writeFileSync(
    path.join(ARTIFACT_DIR, `${testInfo.project.name}-metrics.json`),
    JSON.stringify({ fastHero, slowHero, scaleOneEnemy, scaleOnePointFiveEnemy, baron }, null, 2),
  );
  expect(errors).toEqual([]);
});
