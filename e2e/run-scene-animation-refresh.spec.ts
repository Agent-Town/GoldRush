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
