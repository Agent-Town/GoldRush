import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { expect, test } from '@playwright/test';

const ARTIFACT_DIR = path.resolve('artifacts/f1297-2-plain-boot-tape-button');

test('the keep-run-tape button reaches the player on a plain boot with no debug flags', async ({ page }, testInfo) => {
  test.setTimeout(60_000);
  const consoleErrors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => consoleErrors.push(error.message));

  await page.goto('/?nolevel&timescale=8&seed=f1297-2-plain');
  const button = page.getByTestId('keep-run-tape');
  await expect(button).toBeVisible({ timeout: 45_000 });
  await button.scrollIntoViewIfNeeded();
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, `${testInfo.project.name}.png`) });
  expect(consoleErrors).toEqual([]);
});
