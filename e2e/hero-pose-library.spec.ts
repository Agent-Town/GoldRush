import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { expect, test } from '@playwright/test';
import { PNG } from 'pngjs';

const artifactDir = 'artifacts/hero-poses';

test('hero pans, fires, and returns to walk with curated pose frames', async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on('console', (message) => message.type() === 'error' && errors.push(message.text()));
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/?debug&nowaves&nolevel&seed=hero-pose-library');
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);

  const seam = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.harvest.activeNodes.find((node) => node.active)?.position);
  expect(seam).toBeTruthy();
  await page.evaluate((position) => position && window.__GR_TEST__?.teleport(position.x, position.z), seam);
  await page.waitForFunction(() => {
    const sprite = window.__THREE_GAME_DIAGNOSTICS__?.spriteAnimations['char.hero'];
    return sprite?.clip === 'pan' && sprite.frameKey.startsWith('char-hero-sheet-work8-');
  });
  mkdirSync(artifactDir, { recursive: true });
  const work = await page.locator('#game-canvas').screenshot({
    path: path.join(artifactDir, `${testInfo.project.name}-hero-work.png`),
    scale: 'device',
  });
  expect(magentaPixels(work)).toBe(0);

  await page.evaluate(() => {
    window.__GR_TEST__?.teleport(0, 0);
    window.__GR_TEST__?.spawnPack(1, 8, { speedScale: 0 });
  });
  await page.waitForFunction(() => (window.__GR_TEST__?.enemyPositions().length ?? 0) === 1);
  await page.evaluate(() => {
    const enemy = window.__GR_TEST__?.enemyPositions()[0];
    if (enemy) window.__GR_TEST__?.teleport(enemy.x - 3, enemy.z);
  });
  await page.waitForFunction(() => {
    const sprite = window.__THREE_GAME_DIAGNOSTICS__?.spriteAnimations['char.hero'];
    return sprite?.clip === 'attack' && sprite.direction === 'e' && sprite.frameKey.startsWith('char-hero-sheet-attack8-r2');
  });
  const attack = await page.locator('#game-canvas').screenshot({
    path: path.join(artifactDir, `${testInfo.project.name}-hero-attack.png`),
    scale: 'device',
  });
  expect(magentaPixels(attack)).toBe(0);

  await page.keyboard.down('KeyD');
  await page.waitForFunction(() => {
    const sprite = window.__THREE_GAME_DIAGNOSTICS__?.spriteAnimations['char.hero'];
    return sprite?.clip === 'walk' && (sprite.sourceFrameKey ?? sprite.frameKey).startsWith('char-hero-sheet-walk8-');
  });
  await page.keyboard.up('KeyD');
  expect(errors).toEqual([]);
});

function magentaPixels(buffer: Buffer): number {
  const png = PNG.sync.read(buffer);
  let count = 0;
  for (let index = 0; index < png.data.length; index += 4) {
    const red = png.data[index] ?? 0;
    const green = png.data[index + 1] ?? 0;
    const blue = png.data[index + 2] ?? 0;
    const alpha = png.data[index + 3] ?? 0;
    if (alpha >= 89 && red > 180 && blue > 120 && green < 100) count += 1;
  }
  return count;
}
