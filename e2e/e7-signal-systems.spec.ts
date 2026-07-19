import { expect, test, type Page } from '@playwright/test';

// Relay Valley's terrain descriptor is banked but not directly launchable yet;
// run the E7 seam on The Claim and exercise its authored mask through graphFor.
const QUERY = '/?debug&epoch=epoch-7-signal&contract=the-claim&nowaves&nolevel&nopause&seed=e7-signal';
const ANSWERS = ['first-relay-linked', 'first-playbook-recorded', 'contract:e7-relay-valley'] as const;
const SILENCES = ['contract:e7-echo-canyon', 'contract:e7-dead-band', 'contract:e7-relay-rush'] as const;

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };

async function open(page: Page): Promise<ErrorBucket> {
  const errors: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => message.type() === 'error' && errors.consoleErrors.push(message.text()));
  page.on('pageerror', (error) => errors.pageErrors.push(error.message));
  await page.goto(QUERY);
  await page.waitForFunction(() => window.__THREE_GAME_DIAGNOSTICS__?.e7Signal.enabled === true);
  const briefing = page.getByTestId('contract-briefing');
  if (await briefing.isVisible()) await page.getByTestId('contract-briefing-dismiss').click();
  return errors;
}

async function placeRidgeChain(page: Page): Promise<string> {
  const placed = await page.evaluate(() => {
    const game = window.__GR_TEST__!;
    game.setManualSim(true);
    const results = [-3, 3].map((x) => game.placeFree('turret', x, 8));
    game.advanceSim(0.1);
    return results;
  });
  expect(placed).toEqual([true, true]);
  return page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.e7Signal.graphHash);
}

test('S1 relay graph is stable, leaves the dead gap open, and a correctly placed tower bridges it', async ({ page }) => {
  const errors = await open(page);
  const firstHash = await placeRidgeChain(page);
  const first = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.e7Signal);
  expect(first.links).toEqual([{ from: 'turret-0', to: 'turret-1' }]);
  expect(first.linkedCoverage).toBe(true);
  expect(first.threatVisibilityBonus).toBe(true);
  expect(await page.evaluate(() => window.__GR_TEST__!.e7Signal.droneCanOperate(0, 8))).toBe(true);
  expect(await page.evaluate(() => window.__GR_TEST__!.e7Signal.droneCanOperate(40, 40))).toBe(false);
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.e7Signal.droneDropped)).toBe(true);

  const gap = await page.evaluate(() => window.__GR_TEST__!.e7Signal.graphFor([
    { id: 'west', x: -15, z: 30 },
    { id: 'east', x: 15, z: 30 },
  ]));
  expect(gap.links).toEqual([]);
  const bridged = await page.evaluate(() => window.__GR_TEST__!.e7Signal.graphFor([
    { id: 'west', x: -15, z: 30 },
    { id: 'bridge', x: 0, z: 30 },
    { id: 'east', x: 15, z: 30 },
  ]));
  expect(bridged.links).toEqual([
    { from: 'bridge', to: 'east' },
    { from: 'bridge', to: 'west' },
  ]);

  await page.reload();
  await page.waitForFunction(() => window.__THREE_GAME_DIAGNOSTICS__?.e7Signal.enabled === true);
  const secondHash = await placeRidgeChain(page);
  expect(secondHash).toBe(firstHash);
  expect(errors).toEqual({ consoleErrors: [], pageErrors: [] });
});

test('S2 jack-board milestones remain inert before the Signal Era', async ({ page }) => {
  const errors: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => message.type() === 'error' && errors.consoleErrors.push(message.text()));
  page.on('pageerror', (error) => errors.pageErrors.push(error.message));
  await page.goto('/?debug&epoch=epoch-6-atomic&contract=the-claim&nowaves&nolevel&nopause&seed=e7-signal-early');
  await page.waitForFunction(() => Boolean(window.__THREE_GAME_DIAGNOSTICS__?.e7Signal));
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.e7Signal.enabled)).toBe(false);
  expect(await page.evaluate(() => window.__GR_TEST__!.e7Signal.milestone('first-relay-linked'))).toBe(false);
  await expect(page.getByTestId('e7-jack-board')).toBeHidden();
  expect(errors).toEqual({ consoleErrors: [], pageErrors: [] });
});

test('S2 seeded progress lights each jack once, persists, and keeps player copy frontier-clean', async ({ page }) => {
  const errors = await open(page);
  const results = await page.evaluate((milestones) => milestones.map((milestone) => window.__GR_TEST__!.e7Signal.milestone(milestone)), ANSWERS);
  expect(results).toEqual([true, true, true]);
  expect(await page.evaluate(() => window.__GR_TEST__!.e7Signal.milestone('first-relay-linked'))).toBe(false);

  const board = page.getByTestId('e7-jack-board');
  await expect(board).toBeVisible();
  await expect(board.locator('[data-jack-state="lit"]')).toHaveCount(3);
  await expect(board).toContainText('The ford table');
  await expect(page.getByTestId('hud-wave').locator('[data-hud-wave-title]')).toHaveText('THE EXCHANGE');
  await expect(page.getByTestId('hud-wave').locator('[data-hud-wave]')).toContainText('bright season');
  expect((await board.textContent()) ?? '').not.toMatch(/\b(API|backend|server|debug)\b/i);

  const before = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.e7Signal);
  expect(before.jacks.map((jack) => jack.state)).toEqual(['lit', 'lit', 'lit']);
  expect(before.fragmentEvents).toBe(3);
  await page.reload();
  await page.waitForFunction(() => window.__THREE_GAME_DIAGNOSTICS__?.e7Signal.enabled === true);
  const after = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.e7Signal);
  expect(after.jacks).toEqual(before.jacks);
  expect(after.fragmentEvents).toBe(3);
  expect(errors).toEqual({ consoleErrors: [], pageErrors: [] });
});

test('S3 silences wait for midpoint, darken in canon order, and arm the last beat exactly once', async ({ page }) => {
  const errors = await open(page);
  expect(await page.evaluate(() => window.__GR_TEST__!.e7Signal.milestone('contract:e7-echo-canyon'))).toBe(false);
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.e7Signal.jacks)).toEqual([]);

  await page.evaluate((milestones) => milestones.forEach((milestone) => window.__GR_TEST__!.e7Signal.milestone(milestone)), ANSWERS);
  const beforeLast = await page.evaluate((silences) => {
    const signal = window.__GR_TEST__!.e7Signal;
    signal.milestone(silences[0]);
    signal.milestone(silences[1]);
    return signal.diagnostics();
  }, SILENCES);
  expect(beforeLast.jacks.map((jack) => jack.state)).toEqual(['lit', 'dark', 'dark']);
  expect(beforeLast.lastBeatCount).toBe(0);

  const activationBefore = await page.evaluate(async () => {
    const contracts = (await Function('return import("/src/meta/ContractFamilies.ts")')()) as typeof import('../src/meta/ContractFamilies');
    const megaproject = (await Function('return import("/src/meta/Megaproject.ts")')()) as typeof import('../src/meta/Megaproject');
    localStorage.setItem(megaproject.MEGAPROJECT_STATE_KEY, JSON.stringify({ version: 1, projects: { [contracts.loadEpoch('epoch-7-signal').megaproject.id]: { complete: true } } }));
    return contracts.activateEpoch('epoch-8-orbital');
  });
  expect(activationBefore).toBe(false);

  expect(await page.evaluate((milestone) => window.__GR_TEST__!.e7Signal.milestone(milestone), SILENCES[2])).toBe(true);
  expect(await page.evaluate((milestone) => window.__GR_TEST__!.e7Signal.milestone(milestone), SILENCES[2])).toBe(false);
  const final = await page.evaluate(() => window.__GR_TEST__!.e7Signal.diagnostics());
  expect(final.jacks.map((jack) => jack.state)).toEqual(['dark', 'dark', 'dark']);
  expect(final.jacks[0]).toMatchObject({ id: 'lighthouse-keeper', patched: true });
  expect(final.lastBeatCount).toBe(1);
  expect(final.e8ExitBeatReady).toBe(true);

  expect(await page.evaluate(async () => {
    const contracts = (await Function('return import("/src/meta/ContractFamilies.ts")')()) as typeof import('../src/meta/ContractFamilies');
    return contracts.activateEpoch('epoch-8-orbital');
  })).toBe(true);
  expect(errors).toEqual({ consoleErrors: [], pageErrors: [] });
});
