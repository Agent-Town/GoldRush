import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page, type TestInfo } from '@playwright/test';

const ARTIFACT_DIR = path.resolve('artifacts/fix-e2-railcar-read');
const QUERY = '/?debug&contract=e2-hill-mine&nolevel&nopause&nosteal&nowreck&timescale=1&seed=fix-e2-railcar-read';

async function railcars(page: Page) {
  return page.evaluate(() => window.__GR_TEST__?.enemyPositions().filter((enemy) => enemy.eliteKind === 'railcar') ?? []);
}

async function shot(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, `${testInfo.project.name}-${name}.png`) });
}

test('armored railcar enters on its wheels as rolling stock', async ({ page }, testInfo) => {
  test.setTimeout(45_000);
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(QUERY);
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 16);
  await page.getByTestId('contract-briefing-dismiss').click();
  await page.evaluate(() => {
    window.__GR_TEST__?.setManualSim(true);
    window.__GR_TEST__?.setBalance('waves.waveInterval', 0.35);
    window.__GR_TEST__?.setBalance('waves.trickleInterval', 999);
    window.__GR_TEST__?.setBalance('waves.pulseBase', 0);
    window.__GR_TEST__?.setBalance('waves.pulsePerWave', 0);
    window.__GR_TEST__?.setBalance('waves.aliveCap', 0);
    window.__GR_TEST__?.setBalance('enemy.contactDamage', 0);
    window.__GR_TEST__?.setBalance('sparkRig.range', 0);
    window.__GR_TEST__?.setWave(11);
    window.__GR_TEST__?.advanceSim(0.4);
  });
  await expect.poll(async () => (await railcars(page)).length).toBe(3);

  const approach = await railcars(page);
  expect(approach.every((enemy) => enemy.presentation.mesh)).toBe(true);
  expect(approach.some((enemy) => !enemy.presentation.visible)).toBe(true);
  await page.evaluate(() => window.__GR_TEST__?.teleport(-42, -2));
  await page.waitForTimeout(200);
  await shot(page, testInfo, 'approach');

  for (const seconds of [2, 8, 12]) {
    await page.evaluate((delta) => window.__GR_TEST__?.advanceSim(delta), seconds);
    const sample = await railcars(page);
    expect(sample).toHaveLength(3);
    for (const component of sample) {
      expect(component.presentation.mesh).toBe(true);
      expect(Math.abs(component.y - component.presentation.railY)).toBeLessThan(0.01);
    }
  }

  const inField = await railcars(page);
  expect(inField.every((enemy) => enemy.presentation.visible)).toBe(true);
  await page.evaluate(() => window.__GR_TEST__?.teleport(-18, -1));
  await page.waitForTimeout(200);
  await shot(page, testInfo, 'in-field');
  expect(errors).toEqual([]);
});
