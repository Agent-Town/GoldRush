import { expect, test, type Page } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };
type SimProbe = { wave: number; kills: number; gold: number; timeAlive: number };

function collectErrors(page: Page): ErrorBucket {
  const errors: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') errors.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => errors.pageErrors.push(error.message));
  return errors;
}

async function waitForGame(page: Page): Promise<void> {
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
}

const SHOT_DIR = 'reviews/shots-freed-walkers';

async function simProbe(page: Page, cap: '0' | 'default'): Promise<SimProbe> {
  const capQuery = cap === '0' ? '&fwcap=0' : '';
  await page.goto(`/?debug&nowaves&nolevel&nopause&seed=freed-walkers-purity${capQuery}`);
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  await page.evaluate(() => {
    const test = window.__GR_TEST__!;
    test.setManualSim(true);
    test.resetRun();
    test.setManualSim(true);
  });
  await page.getByTestId('contract-briefing-dismiss').click();
  await expect(page.getByTestId('contract-briefing')).toBeHidden();
  await page.evaluate(() => {
    const test = window.__GR_TEST__!;
    test.teleport(20, 20);
    test.advanceSim(3);
    test.teleport(0, 0);
    test.setBalance('blast.damage', 1000);
    test.setBalance('blast.radius', 20);
    test.spawnPack(4, 3, {
      speedScale: 0,
      hpScale: 0.1,
      contactDamageScale: 0,
      variantId: 'steam_wrecker',
      variantLabel: 'Steam Wrecker',
      wrecker: true,
    });
  });
  await page.waitForTimeout(500);
  await page.evaluate(() => window.__GR_TEST__!.launchBlastAt(0, 0, 0.05));
  let kills = 0;
  for (let step = 0; step < 60 && kills < 4; step += 1) {
    kills = await page.evaluate(() => {
      window.__GR_TEST__!.advanceSim(0.1);
      return window.__THREE_GAME_DIAGNOSTICS__?.kills ?? 0;
    });
  }
  expect(kills).toBe(4);
  await page.evaluate(() => {
    window.__GR_TEST__!.advanceSim(1.4);
  });
  return page.evaluate(() => {
    const remaining = Math.max(0, 8 - window.__THREE_GAME_DIAGNOSTICS__!.timeAlive);
    window.__GR_TEST__!.advanceSim(remaining);
    const diagnostics = window.__THREE_GAME_DIAGNOSTICS__!;
    return {
      wave: diagnostics.wave,
      kills: diagnostics.kills,
      gold: diagnostics.economy.gold,
      timeAlive: diagnostics.timeAlive,
    };
  });
}

async function hideDebugPanel(page: Page): Promise<void> {
  await page.evaluate(() => {
    for (const panel of document.querySelectorAll<HTMLElement>('.lil-gui')) panel.style.display = 'none';
  });
}

async function captureRunOut(page: Page, projectName: string): Promise<void> {
  await page.goto('/?debug&nowaves&nolevel&nopause&seed=freed-walkers-shot');
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  await page.evaluate(() => {
    const test = window.__GR_TEST__!;
    test.setManualSim(true);
    test.resetRun();
    test.setManualSim(true);
  });
  await page.getByTestId('contract-briefing-dismiss').click();
  await page.evaluate(() => {
    const test = window.__GR_TEST__!;
    test.teleport(-20, -20);
    test.setBalance('blast.damage', 1000);
    test.setBalance('blast.radius', 20);
    test.spawnPack(4, 2, { speedScale: 1, hpScale: 0.1, contactDamageScale: 0 });
    test.launchBlastAt(-20, -20, 0.05);
  });
  await expect.poll(() => page.evaluate(() => {
    window.__GR_TEST__!.advanceSim(0.1);
    return window.__THREE_GAME_DIAGNOSTICS__?.kills ?? 0;
  })).toBe(4);
  await page.evaluate(() => {
    window.__GR_TEST__!.teleport(-16, -20);
    window.__GR_TEST__!.advanceSim(1.2);
  });
  await hideDebugPanel(page);
  await page.screenshot({
    path: `${SHOT_DIR}/${projectName === 'mobile-chrome' ? 'mobile' : 'desktop'}-run-out.png`,
    scale: 'css',
  });
}

async function captureMachineSlump(page: Page): Promise<void> {
  await page.goto('/?debug&nowaves&nolevel&nopause&seed=freed-walkers-machine-shot');
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  await page.evaluate(() => {
    const test = window.__GR_TEST__!;
    test.setManualSim(true);
    test.resetRun();
    test.setManualSim(true);
  });
  await page.getByTestId('contract-briefing-dismiss').click();
  await page.evaluate(() => {
    const test = window.__GR_TEST__!;
    test.teleport(-20, -20);
    test.setBalance('blast.damage', 1000);
    test.setBalance('blast.radius', 20);
    test.spawnPack(4, 2.5, {
      speedScale: 0,
      hpScale: 0.1,
      contactDamageScale: 0,
      variantId: 'steam_wrecker',
      variantLabel: 'Steam Wrecker',
      wrecker: true,
    });
  });
  await page.waitForTimeout(500);
  await page.evaluate(() => window.__GR_TEST__!.launchBlastAt(-20, -20, 0.05));
  await expect.poll(() => page.evaluate(() => {
    window.__GR_TEST__!.advanceSim(0.1);
    return window.__THREE_GAME_DIAGNOSTICS__?.kills ?? 0;
  })).toBe(4);
  await page.evaluate(() => {
    window.__GR_TEST__!.teleport(-15, -20);
    window.__GR_TEST__!.advanceSim(1.4);
  });
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.freedWalkers?.active ?? 0)).toBe(4);
  await hideDebugPanel(page);
  await page.screenshot({ path: `${SHOT_DIR}/machine-slump.png`, scale: 'css' });
}

test('plain seeded boot turns defeated claim jumpers into walkers that leave', async ({ page }, testInfo) => {
  const errors = collectErrors(page);
  await mkdir(SHOT_DIR, { recursive: true });
  await page.goto('/?nowaves&nolevel&nopause&timescale=4&seed=freed-walkers-plain');
  await waitForGame(page);
  await page.getByTestId('contract-briefing-dismiss').click();
  await expect(page.getByTestId('contract-briefing')).toBeHidden();
  await page.keyboard.down('KeyS');
  await page.waitForTimeout(900);
  await page.keyboard.up('KeyS');
  await page.waitForTimeout(100);
  await page.keyboard.press('KeyT');

  await expect
    .poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.kills ?? 0), { timeout: 15_000 })
    .toBeGreaterThanOrEqual(1);
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.freedWalkers?.spawned ?? 0)).toBeGreaterThanOrEqual(1);
  await expect
    .poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.freedWalkers?.spawned ?? 0), { timeout: 15_000 })
    .toBeGreaterThanOrEqual(3);
  await expect
    .poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.enemiesAlive ?? -1), { timeout: 15_000 })
    .toBe(0);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.freedWalkers?.active ?? 0)).toBeGreaterThan(0);
  await expect
    .poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.freedWalkers?.active ?? -1), { timeout: 5_000 })
    .toBe(0);
  await captureRunOut(page, testInfo.project.name);

  expect(errors).toEqual({ consoleErrors: [], pageErrors: [] });
});

test('fwcap=0 changes presentation only at the same simulation timestamp', async ({ page }, testInfo) => {
  const errors = collectErrors(page);
  await mkdir(SHOT_DIR, { recursive: true });
  const disabled = await simProbe(page, '0');
  const enabled = await simProbe(page, 'default');
  if (testInfo.project.name === 'desktop-chrome') await captureMachineSlump(page);

  expect(enabled.timeAlive).toBe(disabled.timeAlive);
  expect({ wave: enabled.wave, kills: enabled.kills, gold: enabled.gold }).toEqual({
    wave: disabled.wave,
    kills: disabled.kills,
    gold: disabled.gold,
  });
  expect(errors).toEqual({ consoleErrors: [], pageErrors: [] });
});
