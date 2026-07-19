import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { expect, test } from '@playwright/test';

const ARTIFACT_DIR = path.resolve('artifacts/pause-goal-progress');

test('Twin Banks pause goals show the win wave and live progress', async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));

  await page.goto('/?debug&contract=e1-twin-banks&nowaves&nolevel&seed=pause-goal-progress');
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  await page.getByTestId('contract-briefing-dismiss').click();
  await page.evaluate(() => window.__GR_TEST__?.setWave(13));
  await page.keyboard.press('KeyP');

  await expect(page.getByTestId('pause-contract-goal-progress')).toHaveText('Secure the claim at wave 20 — wave 13/20');
  await expect(page.getByTestId('pause-contract-goals')).toHaveText('Build on either bank and watch both fords.');
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, `${testInfo.project.name}-wave-13.png`) });
  expect(errors).toEqual([]);
});
