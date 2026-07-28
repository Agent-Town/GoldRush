import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { expect, test, type Page, type TestInfo } from '@playwright/test';

const shotDir = path.resolve('artifacts/eight-winds-enemies');

function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (message) => message.type() === 'error' && errors.push(message.text()));
  page.on('pageerror', (error) => errors.push(error.message));
  return errors;
}

async function saveShot(page: Page, testInfo: TestInfo, slot: string): Promise<void> {
  mkdirSync(shotDir, { recursive: true });
  await page.screenshot({ path: path.join(shotDir, `${testInfo.project.name}-${slot}.png`), fullPage: true });
}

test('plain boot sends an outlaw runner southwest on walkdiag row 0', async ({ page }, testInfo) => {
  test.setTimeout(60_000);
  const errors = collectErrors(page);
  await page.goto('/?contract=the-claim&timescale=4&nolevel&nopause&nokill&seed=eight-winds-enemy-plain');
  expect(await page.evaluate(() => window.__GR_TEST__)).toBeUndefined();
  await page.getByTestId('contract-briefing-dismiss').click();
  await page.keyboard.down('KeyS');
  await page.keyboard.down('KeyA');
  await page.waitForFunction(() => {
    const sprite = window.__THREE_GAME_DIAGNOSTICS__?.spriteAnimations['char.bandit_base'];
    const key = sprite?.sourceFrameKey ?? sprite?.frameKey ?? '';
    return sprite?.clip === 'walk' && sprite.direction === 'sw'
      && /^char-bandit-base-sheet-walkdiag8-r0c[0-7]\.png$/.test(key);
  }, undefined, { timeout: 45_000 });
  await saveShot(page, testInfo, 'char-bandit-base');
  await page.keyboard.up('KeyS');
  await page.keyboard.up('KeyA');
  expect(errors).toEqual([]);
});

test('diagnostics drive thief northeast and Baron southwest on their correct rows', async ({ page }, testInfo) => {
  test.setTimeout(60_000);
  const errors = collectErrors(page);
  await page.goto('/?debug&contract=e1-baron&nowaves&nolevel&nopause&nokill&seed=eight-winds-enemy-diagnostics');
  await page.getByTestId('contract-briefing-dismiss').click();

  await page.evaluate(() => {
    window.__GR_TEST__?.spawnThief('west');
    const enemy = window.__GR_TEST__?.enemyPositions()[0];
    if (enemy) window.__GR_TEST__?.teleport(enemy.x + 8, enemy.z - 8);
  });
  await page.waitForFunction(() => {
    const sprite = window.__THREE_GAME_DIAGNOSTICS__?.spriteAnimations['char.bandit_thief'];
    const key = sprite?.sourceFrameKey ?? sprite?.frameKey ?? '';
    return sprite?.clip === 'walk' && sprite.direction === 'ne'
      && /^char-bandit-thief-sheet-walkdiag8-r3c[0-7]\.png$/.test(key);
  });
  await saveShot(page, testInfo, 'char-bandit-thief');

  await page.evaluate(() => {
    window.__GR_TEST__?.clearEnemies();
    window.__GR_TEST__?.spawnPack(1, 8, { eliteKind: 'baron', speedScale: 1 });
    const enemy = window.__GR_TEST__?.enemyPositions()[0];
    if (enemy) window.__GR_TEST__?.teleport(enemy.x - 8, enemy.z + 8);
  });
  await page.waitForFunction(() => {
    const sprite = window.__THREE_GAME_DIAGNOSTICS__?.spriteAnimations['char.baron'];
    const key = sprite?.sourceFrameKey ?? sprite?.frameKey ?? '';
    return sprite?.clip === 'walk' && sprite.direction === 'sw'
      && /^char-baron-sheet-walkdiag8-r0c[0-7]\.png$/.test(key);
  });
  await saveShot(page, testInfo, 'char-baron');
  expect(errors).toEqual([]);
});
