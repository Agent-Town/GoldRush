import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { expect, test } from '@playwright/test';

test('run boots on the approved female Hero walk8 and advances frames', async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on('console', (message) => message.type() === 'error' && errors.push(message.text()));
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/?debug&nowaves&nolevel&seed=run-animation-refresh');
  await expect(page.locator('#game-canvas')).toBeVisible();
  await page.keyboard.down('KeyS');
  await page.waitForFunction(() => {
    const sprite = window.__THREE_GAME_DIAGNOSTICS__?.spriteAnimations['char.hero'];
    return sprite?.frameCount === 8 && (sprite.sourceFrameKey ?? sprite.frameKey).startsWith('char-hero-sheet-walk8-');
  });
  const frames = await page.evaluate(async () => {
    const seen = new Set<string>();
    const until = performance.now() + 800;
    while (performance.now() < until) {
      const sprite = window.__THREE_GAME_DIAGNOSTICS__?.spriteAnimations['char.hero'];
      if (sprite) seen.add(sprite.sourceFrameKey ?? sprite.frameKey);
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    }
    return [...seen];
  });
  mkdirSync('artifacts/run-scene-animation-refresh', { recursive: true });
  await page.screenshot({
    path: path.join('artifacts/run-scene-animation-refresh', `${testInfo.project.name}-hero-walk8-new.png`),
    fullPage: true,
  });
  await page.keyboard.up('KeyS');
  expect(frames.length).toBeGreaterThan(1);
  expect(frames.every((frame) => frame.startsWith('char-hero-sheet-walk8-'))).toBe(true);
  expect(errors).toEqual([]);
});

test('E1 outlaw variants use their own walk8 sheets', async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on('console', (message) => message.type() === 'error' && errors.push(message.text()));
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/?debug&nowaves&nolevel&seed=e1-bandit-variants');
  await expect(page.locator('#game-canvas')).toBeVisible();
  await page.getByRole('button', { name: 'Begin' }).click();
  await page.evaluate(() => {
    window.__GR_TEST__?.spawnPack(1, 8, { speedScale: 0 });
    window.__GR_TEST__?.spawnThief('east');
  });
  await page.waitForFunction(() => {
    const sprites = window.__THREE_GAME_DIAGNOSTICS__?.spriteAnimations;
    return sprites?.['char.bandit_base']?.loaded && sprites?.['char.bandit_thief']?.loaded;
  });
  const keys = await page.evaluate(() => {
    const sprites = window.__THREE_GAME_DIAGNOSTICS__!.spriteAnimations;
    return {
      outlaw: sprites['char.bandit_base']!.sourceFrameKey ?? sprites['char.bandit_base']!.frameKey,
      thief: sprites['char.bandit_thief']!.sourceFrameKey ?? sprites['char.bandit_thief']!.frameKey,
    };
  });
  expect(keys.outlaw).toMatch(/^char-bandit-base-sheet-walk8-/);
  expect(keys.thief).toMatch(/^char-bandit-thief-sheet-walk8-/);
  expect(keys.outlaw).not.toContain('char-jumper');
  expect(keys.thief).not.toContain('char-jumper');
  await page.screenshot({
    path: path.join('artifacts/run-scene-animation-refresh', `${testInfo.project.name}-e1-bandit-trio-after.png`),
    fullPage: true,
  });
  expect(errors).toEqual([]);
});
