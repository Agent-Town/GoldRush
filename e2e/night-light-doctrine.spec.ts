import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { META_PROGRESS_KEY } from '../src/game/MetaProgress';

const ARTIFACT_DIR = path.resolve('artifacts/night-doctrine');

test.setTimeout(60_000);

async function shot(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, `${testInfo.project.name}-${name}.png`) });
}

test('honest night lights reveal only carried lamps, watch paint, consent, and shots', async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.addInitScript(({ key }) => {
    localStorage.clear();
    localStorage.setItem(key, JSON.stringify({ version: 1, tracks: { territory: 0, science: 0, hero: 0, agent: 1 } }));
  }, { key: META_PROGRESS_KEY });
  await page.goto('/?debug&contract=e1-night-shift&nowaves&nolevel&nodamage&seed=night-light-doctrine');
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  const briefing = page.getByTestId('contract-briefing');
  if (await briefing.isVisible()) await page.getByTestId('contract-briefing-dismiss').click();
  await page.evaluate(() => window.__GR_TEST__?.setWave(10));
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.lighting?.nightShift.phase)).toBe('dark');

  await page.evaluate(() => window.__GR_TEST__?.spawnPack(1, 12, { hpScale: 100, speedScale: 0, carriedLantern: true }));
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.lighting?.enemyLanterns ?? 0)).toBe(1);
  expect(await page.evaluate(() => window.__GR_TEST__?.activeContract().twist.enemyLanternClasses)).toEqual(['rusher', 'thief']);
  await shot(page, testInfo, 'enemy-lantern-approach');

  await page.evaluate(() => {
    window.__GR_TEST__?.clearEnemies();
    window.__GR_TEST__?.spawnPack(1, 12, { hpScale: 100, speedScale: 0, wrecker: true });
  });
  await expect.poll(() => page.evaluate(() => window.__GR_TEST__?.enemyPositions()[0]?.watchPainted)).toBe(false);
  await shot(page, testInfo, 'watch-paint-off');
  const enemy = await page.evaluate(() => window.__GR_TEST__?.enemyPositions()[0]);
  expect(enemy).toBeTruthy();
  await expect(page.evaluate((position) => window.__GR_TEST__?.placeFree('sentry_beacon', position.x, position.z), enemy!)).resolves.toBe(true);
  await expect.poll(() => page.evaluate(() => window.__GR_TEST__?.enemyPositions()[0]?.watchPainted)).toBe(true);
  await shot(page, testInfo, 'watch-paint-on');

  await page.keyboard.press('KeyG');
  const lightDuty = page.getByTestId('prospector-ability-light_duty');
  await expect(lightDuty).toBeVisible();
  await expect(lightDuty).not.toBeChecked();
  await lightDuty.check();
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.lighting?.prospectorLights ?? 0)).toBe(1);
  await page.keyboard.press('KeyG');
  await shot(page, testInfo, 'light-duty-path');

  const flashesBefore = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.lighting?.muzzleFlashCount ?? 0);
  await expect.poll(
    () => page.evaluate((before) => (window.__THREE_GAME_DIAGNOSTICS__?.lighting?.muzzleFlashCount ?? 0) - before, flashesBefore),
    { timeout: 8_000, intervals: [20, 50, 100] },
  ).toBeGreaterThan(0);
  await expect.poll(
    () => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.lighting?.muzzleFlashes ?? 0),
    { timeout: 8_000, intervals: [10, 20, 30] },
  ).toBeGreaterThan(0);
  await shot(page, testInfo, 'muzzle-strobe');
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.lighting?.billboardLights)).toBe(0);

  await page.evaluate(() => {
    window.__GR_TEST__?.clearEnemies();
    window.__GR_TEST__?.grantGold(500);
  });
  const hero = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.heroPos);
  expect(hero).toBeTruthy();
  await expect(page.evaluate((position) => window.__GR_TEST__?.placeFree('turret', position.x + 1, position.z), hero!)).resolves.toBe(true);
  await page.evaluate((position) => window.__GR_TEST__?.teleport(position.x + 1, position.z), hero!);
  const prompt = page.getByTestId('building-context-prompt');
  await expect(prompt).toBeVisible();
  await expect(prompt).toContainText('Upgrade to T2');
  await page.keyboard.press('KeyU');
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.hp.find((entry) => entry.id === 'turret')?.tier)).toBe(2);
  await shot(page, testInfo, 'darkest-night-upgrade');

  await page.evaluate(() => window.__GR_TEST__?.resetRun());
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.lighting?.muzzleFlashes ?? -1)).toBe(0);
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.lighting?.muzzleFlashCount)).toBe(0);

  expect(errors).toEqual([]);
});
