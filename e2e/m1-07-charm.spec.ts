import { expect, test, type Page } from '@playwright/test';

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };
type Diagnostics = NonNullable<Window['__THREE_GAME_DIAGNOSTICS__']>;

function collectErrors(page: Page): ErrorBucket {
  const bucket: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') bucket.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => bucket.pageErrors.push(error.message));
  return bucket;
}

async function openGame(page: Page, query: string): Promise<ErrorBucket> {
  const errors = collectErrors(page);
  await page.goto(`/${query}`);
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  return errors;
}

async function diagnostics(page: Page): Promise<Diagnostics> {
  return page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!);
}

async function assertNoErrors(errors: ErrorBucket): Promise<void> {
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
}

async function installCharmTracker(page: Page): Promise<void> {
  await page.evaluate(() => {
    const w = window as unknown as {
      __charmTrack: { sawPause: boolean; sawImpulse: boolean; minDelta: number; lastTime: number; runningAfter: boolean };
    };
    w.__charmTrack = { sawPause: false, sawImpulse: false, minDelta: Number.POSITIVE_INFINITY, lastTime: -1, runningAfter: false };
    const tick = () => {
      const state = window.__THREE_GAME_DIAGNOSTICS__;
      if (state) {
        if (state.charmPause) w.__charmTrack.sawPause = true;
        if (state.camImpulseActive) w.__charmTrack.sawImpulse = true;
        if (w.__charmTrack.lastTime >= 0) {
          w.__charmTrack.minDelta = Math.min(w.__charmTrack.minDelta, state.timeAlive - w.__charmTrack.lastTime);
        }
        if (!state.charmPause && state.kills > 0 && state.timeAlive > w.__charmTrack.lastTime) {
          w.__charmTrack.runningAfter = true;
        }
        w.__charmTrack.lastTime = state.timeAlive;
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

test('debug exposes GUI and setBalance mutates rig tuning echo', async ({ page }) => {
  const errors = await openGame(page, '?debug&nowaves&seed=m1-07-gui');

  expect(await page.evaluate(() => Boolean(window.__GR_GUI__))).toBe(true);
  expect(await page.evaluate(() => window.__GR_TEST__?.setBalance('rig.fireRate', 3.25))).toBe(true);
  expect(await page.evaluate(() => window.__GR_TEST__?.state().balance.rig.fireRate)).toBe(3.25);

  await assertNoErrors(errors);
});

test('enemy kill triggers hit-pause and then sim time resumes', async ({ page }) => {
  const errors = await openGame(page, '?debug&nowaves&seed=m1-07-pause');
  await installCharmTracker(page);

  await page.evaluate(() => window.__GR_TEST__?.spawnPack(1, 8));
  await expect.poll(async () => (await diagnostics(page)).kills, { timeout: 10_000 }).toBeGreaterThan(0);
  await expect
    .poll(async () => page.evaluate(() => (window as unknown as { __charmTrack: { sawPause: boolean } }).__charmTrack.sawPause))
    .toBe(true);
  await expect
    .poll(async () => page.evaluate(() => (window as unknown as { __charmTrack: { runningAfter: boolean } }).__charmTrack.runningAfter), {
      timeout: 1_000,
    })
    .toBe(true);

  await assertNoErrors(errors);
});

test('nopause disables hit-pause and camera impulse on kills', async ({ page }) => {
  const errors = await openGame(page, '?debug&nowaves&nopause&seed=m1-07-nopause');
  await installCharmTracker(page);

  await page.evaluate(() => window.__GR_TEST__?.spawnPack(1, 8));
  await expect.poll(async () => (await diagnostics(page)).kills, { timeout: 10_000 }).toBeGreaterThan(0);
  await page.waitForTimeout(250);
  const track = await page.evaluate(
    () => (window as unknown as { __charmTrack: { sawPause: boolean; sawImpulse: boolean } }).__charmTrack,
  );
  expect(track.sawPause).toBe(false);
  expect(track.sawImpulse).toBe(false);

  await assertNoErrors(errors);
});

async function overwhelm(page: Page): Promise<void> {
  await page.evaluate(() => {
    for (let pack = 0; pack < 6; pack += 1) window.__GR_TEST__?.spawnPack(5, 0.4);
  });
}

async function waitForDeath(page: Page): Promise<void> {
  await expect.poll(async () => (await diagnostics(page)).runState, { timeout: 15_000 }).toBe('dead');
}

test('death overlay shows flavor line and Try Again restarts', async ({ page }) => {
  const errors = await openGame(page, '?debug&nowaves&nolevel&seed=m1-07-death');
  await page.evaluate(() => window.__GR_TEST__?.setBalance('enemy.contactDamage', 999));

  await overwhelm(page);
  await waitForDeath(page);
  await expect(page.getByTestId('death-overlay')).toBeVisible();
  await expect(page.locator('.death-overlay__flavor')).toContainText('The claim was overrun. The gold remembers.');
  await expect(page.getByTestId('stake-again')).toContainText('Try Again');
  await page.getByTestId('stake-again').click();
  await expect.poll(async () => (await diagnostics(page)).runState).toBe('playing');

  await assertNoErrors(errors);
});

test('wave banner rotation avoids immediate repeats', async ({ page }) => {
  const errors = await openGame(page, '?debug&timescale=3&seed=m1-07-banners');
  await page.evaluate(() => {
    window.__GR_TEST__?.setBalance('waves.waveInterval', 6);
    window.__GR_TEST__?.resetRun();
  });
  const banner = page.getByTestId('hud-wave');

  await expect.poll(async () => (await diagnostics(page)).wave, { timeout: 15_000 }).toBeGreaterThanOrEqual(1);
  const first = (await banner.textContent())?.trim();
  await expect.poll(async () => (await diagnostics(page)).wave, { timeout: 15_000 }).toBeGreaterThanOrEqual(2);
  const second = (await banner.textContent())?.trim();
  expect(first).toBeTruthy();
  expect(second).toBeTruthy();
  expect(second).not.toBe(first);

  await assertNoErrors(errors);
});

test('upgrade cards show concrete effects and procedural icon slots', async ({ page }) => {
  const errors = await openGame(page, '?debug&nowaves&seed=m1-07-upgrades');

  await page.evaluate(() => window.__GR_TEST__?.grantXp(12));
  await expect(page.getByTestId('upgrade-overlay')).toBeVisible();
  const cards = page.locator('[data-testid^="upgrade-card-"]');
  await expect(cards).toHaveCount(3);
  for (let i = 0; i < 3; i += 1) {
    const card = cards.nth(i);
    await expect(card.locator('.upgrade-card__effect')).toContainText(/\d/);
  }

  await assertNoErrors(errors);
});

test('scoreboard records two deaths and highlights current run', async ({ page }) => {
  const errors = await openGame(page, '?debug&nowaves&nolevel&seed=m1-07-scores');
  await page.evaluate(() => window.__GR_TEST__?.setBalance('enemy.contactDamage', 999));
  await page.evaluate(() => window.__GR_TEST__?.clearScores());

  await overwhelm(page);
  await waitForDeath(page);
  await page.getByTestId('stake-again').click();
  await expect.poll(async () => (await diagnostics(page)).runState).toBe('playing');
  await page.waitForTimeout(350);
  await overwhelm(page);
  await waitForDeath(page);

  const rows = page.getByTestId('best-claim-row');
  await expect(rows).toHaveCount(2);
  await expect(page.locator('[data-current-run="true"]')).toHaveCount(1);
  const waveValues = await rows.evaluateAll((items) => items.map((item) => Number((item.textContent ?? '').match(/^\d+/)?.[0] ?? 0)));
  expect(waveValues[0]).toBeGreaterThanOrEqual(waveValues[1]);
  await expect(page.getByTestId('stake-again')).toContainText('Try Again');

  await assertNoErrors(errors);
});
