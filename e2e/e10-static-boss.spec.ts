import { expect, test, type Page } from '@playwright/test';

const QUERY = '/?debug&e10static&epoch=epoch-10-deepsky&contract=the-claim&nowaves&nolevel&nokill&nopause&terrain2d&seed=e10-static';
const PLAIN_QUERY = '/?contract=e10-last-claim&nowaves&nolevel&nokill&nopause&terrain2d&seed=e10-last-claim';
const LIVE_QUERY = '/?debug&contract=e10-last-claim&nowaves&nolevel&nokill&nopause&terrain2d&seed=e10-static-live';

function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (message) => message.type() === 'error' && errors.push(message.text()));
  page.on('pageerror', (error) => errors.push(error.stack ?? error.message));
  return errors;
}

async function open(page: Page): Promise<string[]> {
  const errors = collectErrors(page);
  await page.goto(QUERY);
  await page.waitForFunction(() => Boolean(window.__GR_TEST__) && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  const briefing = page.getByTestId('contract-briefing-dismiss');
  if (await briefing.isVisible().catch(() => false)) await briefing.click();
  await page.evaluate(() => {
    const test = window.__GR_TEST__!;
    test.setManualSim(true);
    test.setBalance('e10Static.arrivalZ', 20);
    test.setBalance('e10Static.approachSeconds', 0.1);
    test.setBalance('e10Static.meaningDrainPerSecond', 0.4);
    test.setBalance('e10Static.preserveWindowSeconds', 2);
    test.setBalance('e10Static.recessionHoldSeconds', 0.25);
    test.setBalance('e10Static.recessionDecayPerSecond', 1);
  });
  return errors;
}

async function diagnostics(page: Page) {
  return page.evaluate(() => window.__GR_TEST__!.e10Static.diagnostics());
}

test('The Last Claim boots directly and the Static arrives without the e10static flag', async ({ page }, testInfo) => {
  test.setTimeout(120_000);
  const errors = collectErrors(page);
  await page.goto(PLAIN_QUERY);
  await page.waitForFunction(() => window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId === 'e10-last-claim');
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.contract.epochId)).toBe('epoch-10-deepsky');
  await page.waitForFunction(() => window.__THREE_GAME_DIAGNOSTICS__?.e10Finale.ark.loadState === 'ready');
  await expect(page.getByTestId('contract-briefing-name')).toHaveText('The Last Claim');
  await page.screenshot({ path: testInfo.outputPath('last-claim-plain-boot.png') });
  expect(await page.evaluate(async () => {
    const registry = await Function('return import("/src/meta/ContractFamilies.ts")')() as typeof import('../src/meta/ContractFamilies');
    registry.stagePlayerContractLaunch('e10-last-claim');
    return sessionStorage.getItem('gr.contract.launch.v1');
  })).toBe('e10-last-claim');
  await page.reload();
  await page.waitForFunction(() => window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId === 'e10-last-claim');
  await page.waitForFunction(() => window.__THREE_GAME_DIAGNOSTICS__?.e10Finale.ark.loadState === 'ready');

  await page.goto(LIVE_QUERY);
  await page.waitForFunction(() => Boolean(window.__GR_TEST__) && window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId === 'e10-last-claim');
  await page.getByTestId('contract-briefing-dismiss').click();
  await page.evaluate(() => {
    const test = window.__GR_TEST__!;
    test.setManualSim(true);
    test.setBalance('e10Static.arrivalZ', 20);
    test.setBalance('e10Static.approachSeconds', 0.01);
    test.teleport(0, 20);
    test.advanceSim(0.05);
  });
  expect(await diagnostics(page)).toMatchObject({ enabled: true, active: true, arrivalCount: 1, appetite: 'meaning' });
  await page.screenshot({ path: testInfo.outputPath('last-claim-static-arrival.png') });
  expect(errors).toEqual([]);
});

test('the Static pressures meaning, three preserves make the Quiet recede, and nothing is killed', async ({ page }) => {
  test.setTimeout(120_000);
  const errors = await open(page);
  const killsBefore = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.kills);

  expect(await diagnostics(page)).toMatchObject({
    enabled: true,
    active: false,
    act: 0,
    appetite: 'meaning',
    arrivalCount: 0,
    victory: null,
    damageAccepted: 0,
    killPath: false,
  });

  await page.evaluate(() => {
    window.__GR_TEST__!.teleport(0, 20);
    window.__GR_TEST__!.advanceSim(0.2);
  });
  expect(await diagnostics(page)).toMatchObject({ active: true, act: 2, arrivalCount: 1, appetite: 'meaning' });

  await page.evaluate(() => window.__GR_TEST__!.advanceSim(0.5));
  const pressured = await diagnostics(page);
  expect(pressured.pressureSeconds).toBeGreaterThan(0);
  expect(pressured.aura).toBeGreaterThan(0);
  expect(pressured.musicGain).toBeLessThan(1);
  expect(pressured.sites).toEqual([
    expect.objectContaining({ id: 'last-lantern', kind: 'light', verb: 'relight', held: false, meaning: expect.any(Number) }),
    expect.objectContaining({ id: 'pan-theme-song', kind: 'song', verb: 'keep-playing', held: false, meaning: expect.any(Number) }),
    expect.objectContaining({ id: 'last-portrait', kind: 'memory', verb: 're-ink', held: false, meaning: expect.any(Number) }),
  ]);
  expect(pressured.sites.every((site) => site.meaning < 1)).toBe(true);

  for (const [x, z] of [[-10, 50], [0, 50], [10, 50]] as const) {
    await page.evaluate(({ x, z }) => {
      window.__GR_TEST__!.teleport(x, z);
    }, { x, z });
    await page.keyboard.down('Enter');
    await page.evaluate(() => window.__GR_TEST__!.advanceSim(1 / 30));
    await page.keyboard.up('Enter');
    await page.evaluate(() => window.__GR_TEST__!.advanceSim(1 / 30));
  }
  expect(await diagnostics(page)).toMatchObject({
    allPreserved: true,
    sites: [
      expect.objectContaining({ interactions: 1 }),
      expect.objectContaining({ interactions: 1 }),
      expect.objectContaining({ interactions: 1 }),
    ],
  });

  await page.evaluate(() => window.__GR_TEST__!.advanceSim(0.35));
  const receded = await diagnostics(page);
  expect(receded).toMatchObject({
    active: false,
    act: 3,
    aura: 0,
    musicGain: 1,
    recessionProgress: 1,
    victory: 'receded',
    jarredMote: true,
    damageAccepted: 0,
    killPath: false,
  });
  expect(await page.evaluate(() => ({
    kills: window.__THREE_GAME_DIAGNOSTICS__!.kills,
    secured: window.__THREE_GAME_DIAGNOSTICS__!.run.secured,
    staticEnemies: window.__GR_TEST__!.enemyPositions().filter((enemy) => /static|quiet/i.test(enemy.variantId ?? '')).length,
    filter: document.querySelector('canvas')?.style.filter,
  }))).toEqual({ kills: killsBefore, secured: true, staticEnemies: 0, filter: 'grayscale(0)' });
  expect(errors).toEqual([]);
});

test('the Static stays unarmed without the E10 contract or explicit debug seam', async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto(QUERY.replace('&e10static', ''));
  await page.waitForFunction(() => Boolean(window.__GR_TEST__) && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  expect(await diagnostics(page)).toMatchObject({ enabled: false, active: false, act: 0, killPath: false });
  expect(errors).toEqual([]);
});

test('recession hands the secured claim to the existing T10 re-inking finale', async ({ page }) => {
  test.setTimeout(120_000);
  const errors = collectErrors(page);
  await page.goto(LIVE_QUERY.replace('&nopause', ''));
  await page.waitForFunction(() => Boolean(window.__GR_TEST__) && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  const briefing = page.getByTestId('contract-briefing-dismiss');
  if (await briefing.isVisible().catch(() => false)) await briefing.click();
  await page.evaluate(() => {
    const test = window.__GR_TEST__!;
    test.setManualSim(true);
    test.setBalance('e10Static.arrivalZ', 20);
    test.setBalance('e10Static.approachSeconds', 0.01);
    test.setBalance('e10Static.preserveWindowSeconds', 2);
    test.setBalance('e10Static.recessionHoldSeconds', 0.05);
    test.setBalance('e10Finale.reinkSeconds', 0.05);
    test.setBalance('e10Finale.offerDelaySeconds', 0);
    test.teleport(0, 20);
    test.advanceSim(0.05);
    for (const [x, z] of [[-10, 50], [0, 50], [10, 50]] as const) {
      test.teleport(x, z);
      if (!test.e10Static.interact()) throw new Error(`Preserve interaction failed at ${x},${z}`);
    }
    test.advanceSim(0.1);
  });

  await expect(page.getByTestId('bank-secured-claim')).toBeVisible();
  await page.getByTestId('bank-secured-claim').click();
  await expect(page.getByTestId('e10-river-lever')).toBeVisible();
  expect(await page.evaluate(() => ({
    staticVictory: window.__GR_TEST__!.e10Static.diagnostics().victory,
    finale: window.__GR_TEST__!.e10Finale.diagnostics().reink.state,
    filter: document.querySelector('canvas')?.style.filter,
  }))).toEqual({ staticVictory: null, finale: 'offered', filter: 'grayscale(0)' });
  expect(errors).toEqual([]);
});
