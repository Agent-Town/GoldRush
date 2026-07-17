import { mkdir } from 'node:fs/promises';
import { expect, test, type Page, type TestInfo } from '@playwright/test';

const URL = '/?debug&epoch=epoch-6-atomic&contract=e6-glow-mesa&nowaves&nolevel&nopause&seed=e6-wrangle';
const SHOT = 'reviews/shots-wrangle/exhausted-capture.png';

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };

function collectErrors(page: Page): ErrorBucket {
  const errors: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => message.type() === 'error' && errors.consoleErrors.push(message.text()));
  page.on('pageerror', (error) => errors.pageErrors.push(error.message));
  return errors;
}

test('patient kiting exhausts, captures, persists, and pays through Economy', async ({ page }, testInfo) => {
  test.setTimeout(90_000);
  const errors = collectErrors(page);
  await page.goto(URL);
  await page.waitForFunction(() => Boolean(window.__GR_TEST__ && window.__THREE_GAME_DIAGNOSTICS__));
  const briefing = page.getByTestId('contract-briefing');
  if (await briefing.isVisible()) await page.getByTestId('contract-briefing-dismiss').click();
  await expect(briefing).toBeHidden();

  const start = await page.evaluate(() => {
    const test = window.__GR_TEST__!;
    test.setManualSim(true);
    test.resetRun();
    test.setManualSim(true);
    test.setBalance('sparkRig.damage', 0);
    test.spawnPack(1, 20, { variantId: 'feral_toaster', variantLabel: 'Feral Toaster', speedScale: 0.001, hpScale: 100 });
    test.advanceSim(1 / 30);
    return test.wrangle.diagnostics();
  });
  if (await briefing.isVisible()) await page.getByTestId('contract-briefing-dismiss').click();
  await expect(briefing).toBeHidden();
  expect(start.enabled).toBe(true);
  expect(start.active).toEqual([
    expect.objectContaining({ variantId: 'feral_toaster', state: 'winding-down', remainingTicks: start.windDownTicks, resets: 0 }),
  ]);

  const beforeDamage = await page.evaluate((seconds) => {
    window.__GR_TEST__!.advanceSim(seconds - 1);
    return window.__GR_TEST__!.wrangle.diagnostics().active[0]!;
  }, start.windDownSeconds);
  expect(beforeDamage.state).toBe('winding-down');
  expect(beforeDamage.remainingTicks).toBeLessThan(start.windDownTicks);

  const afterDamage = await page.evaluate(() => {
    const test = window.__GR_TEST__!;
    const enemy = test.enemyPositions()[0]!;
    test.launchBlastAt(enemy.x, enemy.z, 0.01);
    test.advanceSim(0.2);
    return test.wrangle.diagnostics().active[0]!;
  });
  expect(afterDamage.resets).toBe(1);
  expect(afterDamage.state).toBe('winding-down');
  expect(afterDamage.remainingTicks).toBeGreaterThan(beforeDamage.remainingTicks);

  const resumed = await page.evaluate(() => {
    const test = window.__GR_TEST__!;
    const before = test.wrangle.diagnostics().active[0]!;
    const snapshot = test.captureSuspend();
    return {
      snapshot: snapshot.wrangle,
      restored: test.restoreSuspend(snapshot),
      before,
      after: test.wrangle.diagnostics().active[0]!,
    };
  });
  expect(resumed.restored).toBe(true);
  expect(resumed.snapshot?.active[0]?.remainingTicks).toBe(resumed.before.remainingTicks);
  expect(resumed.after).toEqual(resumed.before);

  const exhausted = await page.evaluate((seconds) => {
    const test = window.__GR_TEST__!;
    test.advanceSim(seconds + 0.25);
    return {
      wrangle: test.wrangle.diagnostics(),
      enemy: test.enemyPositions()[0]!,
      hp: window.__THREE_GAME_DIAGNOSTICS__!.hp,
    };
  }, start.windDownSeconds);
  expect(exhausted.wrangle.active[0]).toEqual(expect.objectContaining({ state: 'exhausted', remainingTicks: 0, resets: 1 }));
  expect(exhausted.wrangle.exhaustedSpeedMultiplier).toBeLessThan(1);
  expect(exhausted.enemy.wrangleState).toBe('exhausted');
  expect(exhausted.hp).toBe(100);
  const protectedState = await page.evaluate(({ x, z }) => {
    const test = window.__GR_TEST__!;
    const hp = test.enemyPositions()[0]!.hp;
    test.launchBlastAt(x, z, 0.01);
    test.advanceSim(0.2);
    return { wrangle: test.wrangle.diagnostics().active[0]!, hp, afterHp: test.enemyPositions()[0]!.hp };
  }, exhausted.enemy);
  expect(protectedState.wrangle).toEqual(expect.objectContaining({ state: 'exhausted', remainingTicks: 0, resets: 1 }));
  expect(protectedState.afterHp).toBe(protectedState.hp);
  await page.evaluate(({ x, z }) => {
    const test = window.__GR_TEST__!;
    test.teleport(x - 3.5, z);
    test.advanceSim(1 / 30);
  }, exhausted.enemy);

  await page.evaluate(({ x, z }) => window.__GR_TEST__!.teleport(x - 2, z), exhausted.enemy);
  await page.keyboard.press('Space');
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.wrangle.pen.total)).toBe(1);
  await page.evaluate(() => window.__GR_TEST__!.advanceSim(0.1));
  await saveShot(page, testInfo);
  expect(await page.evaluate(() => ({
    enemies: window.__THREE_GAME_DIAGNOSTICS__!.enemiesAlive,
    kills: window.__THREE_GAME_DIAGNOSTICS__!.kills,
    xpDeaths: window.__THREE_GAME_DIAGNOSTICS__!.xpAudit.deaths,
    roster: window.__THREE_GAME_DIAGNOSTICS__!.wrangle.pen.roster,
  }))).toEqual({
    enemies: 0,
    kills: 0,
    xpDeaths: 0,
    roster: [{ variantId: 'feral_toaster', count: 1 }],
  });

  await page.reload();
  await page.waitForFunction(() => Boolean(window.__GR_TEST__ && window.__THREE_GAME_DIAGNOSTICS__));
  const persisted = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.wrangle.pen);
  expect(persisted.roster).toEqual([{ variantId: 'feral_toaster', count: 1 }]);
  expect(persisted.total).toBe(1);

  const income = await page.evaluate(() => {
    const test = window.__GR_TEST__!;
    test.setManualSim(true);
    test.resetRun();
    test.setManualSim(true);
    const pen = test.wrangle.diagnostics().pen;
    test.advanceSim(pen.tickSeconds + 1 / 30);
    return {
      gold: window.__THREE_GAME_DIAGNOSTICS__!.economy.gold,
      pen: test.wrangle.diagnostics().pen,
      grants: test.economyLog().filter((event) => {
        const candidate = event as { type?: string; source?: string };
        return candidate.type === 'gold_granted' && candidate.source === 'appliance_pen';
      }),
    };
  });
  expect(income.gold).toBe(income.pen.goldPerMachine);
  expect(income.pen.incomeGranted).toBe(income.pen.goldPerMachine);
  expect(income.grants).toEqual([
    expect.objectContaining({ type: 'gold_granted', source: 'appliance_pen', amount: income.pen.goldPerMachine }),
  ]);

  const recycled = await page.evaluate(() => {
    const test = window.__GR_TEST__!;
    test.resetRun();
    test.setManualSim(true);
    test.spawnPack(1, 20, { variantId: 'lawn_shepherd', variantLabel: 'Lawn Shepherd', speedScale: 0.001, hpScale: 0.1 });
    test.advanceSim(1 / 30);
    test.launchBlastAt(test.enemyPositions()[0]!.x, test.enemyPositions()[0]!.z, 0.01);
    test.advanceSim(0.2);
    test.spawnPack(1, 20, { speedScale: 0.001, hpScale: 100 });
    test.advanceSim(1 / 30);
    return { wrangle: test.wrangle.diagnostics().active, enemy: test.enemyPositions()[0]! };
  });
  expect(recycled.wrangle).toEqual([]);
  expect(recycled.enemy.wrangleState).toBeUndefined();
  expect(errors).toEqual({ consoleErrors: [], pageErrors: [] });
});

async function saveShot(page: Page, testInfo: TestInfo): Promise<void> {
  if (testInfo.project.name !== 'desktop-chrome') return;
  await mkdir('reviews/shots-wrangle', { recursive: true });
  await page.screenshot({ path: SHOT, fullPage: true });
}
