import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { expect, test } from '@playwright/test';
import { RUN_CAST_SCALE } from '../src/entities/runCastScale';

const ARTIFACT_DIR = 'artifacts/run-cast-scale-up';

test('run cast is 50% larger while boss simulation scales stay unchanged', async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on('console', (message) => message.type() === 'error' && errors.push(message.text()));
  page.on('pageerror', (error) => errors.push(error.message));

  expect(RUN_CAST_SCALE).toBe(1.5);

  await page.goto('/?debug&nowaves&nolevel&seed=run-cast-scale-up');
  await expect(page.locator('#game-canvas')).toBeVisible();
  await page.getByRole('button', { name: 'Begin' }).click();
  const scales = await page.evaluate(() => {
    window.__GR_TEST__?.spawnPack(1, 8, { speedScale: 0, visualScale: 1 });
    window.__GR_TEST__?.spawnPack(1, 10, { speedScale: 0, visualScale: 4, eliteKind: 'baron' });
    window.__GR_TEST__?.spawnPack(1, 12, { speedScale: 0, visualScale: 2.4, eliteKind: 'railcar' });
    return window.__GR_TEST__?.enemyPositions().map(({ eliteKind, scale }) => ({ eliteKind, scale })) ?? [];
  });

  expect(scales.find(({ eliteKind }) => eliteKind === undefined)?.scale).toBe(1);
  expect(scales.find(({ eliteKind }) => eliteKind === 'baron')?.scale).toBe(4);
  expect(scales.find(({ eliteKind }) => eliteKind === 'railcar')?.scale).toBe(2.4);
  mkdirSync(ARTIFACT_DIR, { recursive: true });
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, `${testInfo.project.name}-after.png`),
    fullPage: true,
  });
  expect(errors).toEqual([]);
});
