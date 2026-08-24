import { mkdirSync } from 'node:fs';
import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { META_PROGRESS_KEY } from '../src/game/MetaProgress';

const FIXED_TICK = 1 / 60;
const SHOT_DIR = 'reviews/shots-bt04b';

async function grantAgentLevel(page: Page): Promise<void> {
  await page.addInitScript((key) => {
    localStorage.setItem(key, JSON.stringify({ version: 1, tracks: { territory: 0, science: 0, hero: 0, agent: 2 } }));
  }, META_PROGRESS_KEY);
}

async function openPanel(page: Page): Promise<void> {
  await page.keyboard.press('KeyG');
  await expect(page.getByTestId('prospector-panel')).toBeVisible();
}

async function setNumber(page: Page, testId: string, value: number): Promise<void> {
  await page.getByTestId(testId).evaluate((input, next) => {
    const field = input as HTMLInputElement;
    field.value = String(next);
    field.dispatchEvent(new Event('change', { bubbles: true }));
  }, value);
}

async function activeTask(page: Page): Promise<boolean> {
  return page.evaluate(() => {
    const agent = window.__THREE_GAME_DIAGNOSTICS__?.agent.embodiment;
    return Boolean(agent?.moving || agent?.working);
  });
}

test.beforeEach(async ({ page }) => {
  await grantAgentLevel(page);
});

test('repair and idle boundaries update the live loop on the next sim tick', async ({ page }) => {
  await page.goto('/?debug&nowaves&nolevel&nokill&seed=bt04b-boundaries');
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  await expect(page.evaluate(() => window.__GR_TEST__!.placeFree('palisade', 0, 9))).resolves.toBe(true);
  await page.evaluate(() => {
    const snapshot = window.__GR_TEST__!.captureSuspend() as any;
    snapshot.buildings[0].hp = snapshot.buildings[0].maxHp * 0.6;
    snapshot.buildings[0].wrecked = false;
    if (!window.__GR_TEST__!.restoreSuspend(snapshot)) throw new Error('failed to prepare damaged building');
    window.__GR_TEST__!.setManualSim(true);
  });

  await openPanel(page);
  await setNumber(page, 'prospector-idle-seconds', 0);
  await setNumber(page, 'prospector-repair-under', 60);
  await page.evaluate(() => window.__GR_TEST__!.advanceSim(0.2));
  expect(await activeTask(page)).toBe(false);
  const damaged = await page.evaluate(() => window.__GR_TEST__!.captureSuspend());

  await setNumber(page, 'prospector-repair-under', 61);
  await page.evaluate((seconds) => window.__GR_TEST__!.advanceSim(seconds), FIXED_TICK);
  expect(await activeTask(page)).toBe(true);

  await expect(page.evaluate((snapshot) => window.__GR_TEST__!.restoreSuspend(snapshot), damaged)).resolves.toBe(true);
  await setNumber(page, 'prospector-repair-under', 61);
  await setNumber(page, 'prospector-idle-seconds', 1);
  await page.evaluate(() => window.__GR_TEST__!.advanceSim(0.98));
  expect(await activeTask(page)).toBe(false);
  await page.evaluate(() => window.__GR_TEST__!.advanceSim(0.2));
  expect(await activeTask(page)).toBe(true);
});

test('automation tunables survive suspend restore and old saves receive defaults', async ({ page }) => {
  await page.goto('/?debug&nowaves&nolevel&seed=bt04b-suspend');
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  await page.evaluate(() => window.__GR_TEST__!.setManualSim(true));
  await openPanel(page);
  await setNumber(page, 'prospector-repair-under', 47);
  await setNumber(page, 'prospector-idle-seconds', 1.3);

  const saved = await page.evaluate(() => window.__GR_TEST__!.captureSuspend());
  expect(saved.agent?.consent).toMatchObject({ repairUnderPct: 47, idleSeconds: 1.3 });
  await setNumber(page, 'prospector-repair-under', 90);
  await setNumber(page, 'prospector-idle-seconds', 5);
  await expect(page.evaluate((snapshot) => window.__GR_TEST__!.restoreSuspend(snapshot), saved)).resolves.toBe(true);
  expect((await page.evaluate(() => window.__GR_TEST__!.captureSuspend())).agent?.consent).toMatchObject({
    repairUnderPct: 47,
    idleSeconds: 1.3,
  });

  const legacy = structuredClone(saved) as any;
  delete legacy.agent.consent.repairUnderPct;
  delete legacy.agent.consent.idleSeconds;
  await expect(page.evaluate((snapshot) => window.__GR_TEST__!.restoreSuspend(snapshot), legacy)).resolves.toBe(true);
  expect((await page.evaluate(() => window.__GR_TEST__!.captureSuspend())).agent?.consent).toMatchObject({
    repairUnderPct: 60,
    idleSeconds: 0.8,
  });
});

test('plain boot exposes operable automation controls', async ({ page }, testInfo: TestInfo) => {
  await page.goto('/?nowaves&nolevel&seed=bt04b-plain');
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  await openPanel(page);
  await expect(page.getByTestId('prospector-repair-under')).toHaveValue('60');
  await expect(page.getByTestId('prospector-idle-seconds')).toHaveValue('0.8');
  await setNumber(page, 'prospector-repair-under', 55);
  await setNumber(page, 'prospector-idle-seconds', 1.2);
  await expect(page.getByTestId('prospector-repair-under')).toHaveValue('55');
  await expect(page.getByTestId('prospector-idle-seconds')).toHaveValue('1.2');
  if (testInfo.project.name === 'mobile-chrome') await page.getByTestId('prospector-idle-seconds').scrollIntoViewIfNeeded();

  mkdirSync(SHOT_DIR, { recursive: true });
  await page.screenshot({ path: `${SHOT_DIR}/${testInfo.project.name}.png`, fullPage: true });
});
