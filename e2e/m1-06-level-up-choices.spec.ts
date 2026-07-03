import { expect, test, type Page } from '@playwright/test';

type ErrorBucket = {
  consoleErrors: string[];
  pageErrors: string[];
};

type Diagnostics = NonNullable<Window['__THREE_GAME_DIAGNOSTICS__']>;

function collectErrors(page: Page): ErrorBucket {
  const bucket: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') bucket.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => bucket.pageErrors.push(error.message));
  return bucket;
}

async function openGame(page: Page, query = '?debug&timescale=3&nowaves&seed=m1-06'): Promise<ErrorBucket> {
  const errors = collectErrors(page);
  await page.goto(`/${query}`);
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  return errors;
}

async function diagnostics(page: Page): Promise<Diagnostics> {
  return page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!);
}

async function pressChoice(page: Page, index: number): Promise<void> {
  await page.keyboard.press(`Digit${index + 1}`);
}

async function debugLevel(page: Page): Promise<void> {
  // need(L) grows past a single 50-XP grant at higher levels: press X until
  // the threshold crosses (bounded; deterministic for a fixed seed).
  for (let press = 0; press < 8; press += 1) {
    await page.keyboard.press('KeyX');
    await page.waitForTimeout(120);
    if ((await diagnostics(page)).runState === 'levelup') break;
  }
  await expect(page.getByTestId('upgrade-overlay')).toBeVisible();
  await expect.poll(async () => (await diagnostics(page)).runState).toBe('levelup');
}

async function drainChoices(page: Page): Promise<void> {
  for (let i = 0; i < 8; i += 1) {
    const state = await diagnostics(page);
    if (state.runState === 'playing') return;
    await pressChoice(page, 0);
  }
  expect((await diagnostics(page)).runState).toBe('playing');
}

async function offerIds(page: Page): Promise<string[]> {
  return page.$$eval('[data-testid^="upgrade-card-"]', (cards) =>
    cards.map((card) => (card as HTMLElement).dataset.upgradeId ?? ''),
  );
}

async function pickOfferId(page: Page, id: string): Promise<boolean> {
  const ids = await offerIds(page);
  const index = ids.indexOf(id);
  if (index < 0) return false;
  await pressChoice(page, index);
  return true;
}

async function assertNoErrors(errors: ErrorBucket): Promise<void> {
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
}

test('X opens level-up and freezes sim clocks while enemies are alive', async ({ page }) => {
  const errors = await openGame(page);
  await page.evaluate(() => window.__GR_TEST__?.spawnPack(3, 3));
  await expect.poll(async () => (await diagnostics(page)).enemiesAlive).toBeGreaterThan(0);

  await debugLevel(page);
  const frozenA = await diagnostics(page);
  await page.waitForTimeout(500);
  const frozenB = await diagnostics(page);

  expect(frozenA.runState).toBe('levelup');
  expect(frozenA.enemiesAlive).toBe(frozenB.enemiesAlive);
  expect(frozenA.nextWaveInSim).toBeCloseTo(frozenB.nextWaveInSim, 2);
  expect(frozenA.timeAlive).toBeCloseTo(frozenB.timeAlive, 2);
  await assertNoErrors(errors);
});

test('picking a card applies stacks and resumes after pending choices without wave drift', async ({ page }) => {
  const errors = await openGame(page);
  const before = await diagnostics(page);
  await debugLevel(page);
  const ids = await offerIds(page);
  const picked = ids[1];

  await pressChoice(page, 1);
  await expect.poll(async () => (await diagnostics(page)).progression.stacks[picked] ?? 0).toBe(1);
  await drainChoices(page);
  const after = await diagnostics(page);

  expect(after.runState).toBe('playing');
  // Un-drift invariant: the wave clock advances exactly with sim time spent
  // playing — the frozen overlay period contributes zero drift.
  expect(before.nextWaveInSim - after.nextWaveInSim).toBeCloseTo(after.timeAlive - before.timeAlive, 1);
  await assertNoErrors(errors);
});

test('first offer is deterministic for a fixed seed and has no duplicates', async ({ browser }) => {
  const pageA = await browser.newPage();
  const pageB = await browser.newPage();
  const errorsA = await openGame(pageA, '?debug&timescale=3&nowaves&seed=m1-06-determinism');
  const errorsB = await openGame(pageB, '?debug&timescale=3&nowaves&seed=m1-06-determinism');

  await debugLevel(pageA);
  await debugLevel(pageB);
  const a = await offerIds(pageA);
  const b = await offerIds(pageB);

  expect(a).toEqual(b);
  expect(new Set(a).size).toBe(3);
  await assertNoErrors(errorsA);
  await assertNoErrors(errorsB);
  await pageA.close();
  await pageB.close();
});

test('sampled offers never contain duplicate ids', async ({ page }) => {
  const errors = await openGame(page, '?debug&timescale=3&nowaves&seed=m1-06-duplicates');

  for (let sample = 0; sample < 5; sample += 1) {
    await debugLevel(page);
    const ids = await offerIds(page);
    expect(new Set(ids).size).toBe(ids.length);
    await drainChoices(page);
  }

  await assertNoErrors(errors);
});

test('maxed upgrades leave the offer pool', async ({ page }) => {
  const errors = await openGame(page, '?debug&timescale=3&nowaves&seed=m1-06-maxed');

  for (let guard = 0; guard < 30; guard += 1) {
    const stacks = (await diagnostics(page)).progression.stacks.double_tap_coil ?? 0;
    if (stacks >= 3) break;
    await debugLevel(page);
    if (!(await pickOfferId(page, 'double_tap_coil'))) await pressChoice(page, 0);
    await drainChoices(page);
  }

  expect((await diagnostics(page)).progression.stacks.double_tap_coil).toBe(3);
  for (let sample = 0; sample < 3; sample += 1) {
    await debugLevel(page);
    expect(await offerIds(page)).not.toContain('double_tap_coil');
    await drainChoices(page);
  }

  await assertNoErrors(errors);
});

test('Beacon Dynamo is gated until a beacon stands', async ({ page }) => {
  const errors = await openGame(page, '?debug&timescale=3&nowaves&seed=m1-06-beacon');

  for (let sample = 0; sample < 3; sample += 1) {
    await debugLevel(page);
    expect(await offerIds(page)).not.toContain('beacon_dynamo');
    await drainChoices(page);
  }
  expect((await diagnostics(page)).progression.eligibility).not.toContain('beacon_dynamo');

  await page.evaluate(() => window.__GR_TEST__?.grantGold(30));
  await page.evaluate(() => window.__GR_TEST__?.setBuildMode(true));
  await expect.poll(async () => (await diagnostics(page)).build.ghostValid).toBe(true);
  await page.evaluate(() => window.__GR_TEST__?.placeBeacon());
  await expect.poll(async () => (await diagnostics(page)).build.beacons).toBe(1);
  expect((await diagnostics(page)).progression.eligibility).toContain('beacon_dynamo');

  await assertNoErrors(errors);
});

test('Split Spark visibly increases volley stats and live bolts', async ({ page }) => {
  const errors = await openGame(page, '?debug&timescale=3&nowaves&seed=m1-06-split');

  for (let guard = 0; guard < 30; guard += 1) {
    await debugLevel(page);
    if (await pickOfferId(page, 'split_spark')) break;
    await pressChoice(page, 0);
    await drainChoices(page);
  }

  await expect.poll(async () => (await diagnostics(page)).progression.stats.volleyBonus).toBeGreaterThanOrEqual(1);
  await drainChoices(page);
  // Single-enemy rounds: a 4-pack on the hero is a swarm-death coin flip vs the
  // rig; one Jumper shows the volley-2 double bolt without endangering the run.
  // Bolts live ~1 headless frame, so track the max inside the page via rAF
  // instead of polling across the protocol gap.
  await page.evaluate(() => {
    const w = window as unknown as { __boltMax: number };
    w.__boltMax = 0;
    const tick = () => {
      const bolts = window.__THREE_GAME_DIAGNOSTICS__?.boltsAlive ?? 0;
      if (bolts > w.__boltMax) w.__boltMax = bolts;
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
  let sawDouble = false;
  for (let round = 0; round < 5 && !sawDouble; round += 1) {
    await page.evaluate(() => window.__GR_TEST__?.spawnPack(1, 8));
    await page.waitForTimeout(2_500);
    sawDouble = (await page.evaluate(() => (window as unknown as { __boltMax: number }).__boltMax)) >= 2;
  }
  expect(sawDouble).toBe(true);

  await assertNoErrors(errors);
});

test('resetRun clears progression and HUD XP truth', async ({ page }) => {
  const errors = await openGame(page, '?debug&timescale=3&nowaves&seed=m1-06-reset');
  await debugLevel(page);
  await pressChoice(page, 0);
  await drainChoices(page);
  expect((await diagnostics(page)).progression.level).toBeGreaterThan(1);

  await page.evaluate(() => window.__GR_TEST__?.resetRun());
  await expect.poll(async () => (await diagnostics(page)).runState).toBe('playing');
  const state = await diagnostics(page);

  expect(state.progression.level).toBe(1);
  expect(state.progression.xpInto).toBe(0);
  expect(state.progression.xpNeed).toBe(12);
  expect(state.progression.stacks).toEqual({});
  expect(state.progression.stats.fireRateMult).toBe(1);
  expect(state.progression.stats.volleyBonus).toBe(0);
  expect(state.ui?.level).toBe(1);
  expect(state.ui?.xp).toBe(0);
  expect(state.ui?.xpNeed).toBe(12);
  await expect(page.getByTestId('hud-xp')).toContainText('0 / 12 XP');

  await assertNoErrors(errors);
});
