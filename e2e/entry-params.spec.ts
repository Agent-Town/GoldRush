import { mkdir } from 'node:fs/promises';
import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { PROFILE_KEY } from '../src/game/ProfileStorage';

/**
 * UX-1, UX-2, UX-4, UX-7 - the outside review of 2026-09-24, task `ux-entry-robustness-1`.
 *
 * Four separate ways in were broken and all four were reachable by a first-time player:
 *  - a tracking or share parameter skipped the start menu, minted a profile named after the OWNER,
 *    and spent the once-per-profile first-boot signal (UX-1);
 *  - a chunk that failed to load, or a browser refusing webgl2, left a BLANK PAGE (UX-2);
 *  - a tab switch left held keys down forever and let the level-up pick clock run out (UX-4);
 *  - the Tavernkeeper's opener arrived a load late, after the founding beat (UX-7).
 *
 * Every assertion below is on a FRESH profile store unless it says otherwise, because that is the
 * state a first-time player arrives in and the state every one of these defects needed.
 */

const SHOT_DIR = 'artifacts/ux-entry-robustness-1';

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };

function collectErrors(page: Page): ErrorBucket {
  const bucket: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') bucket.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => bucket.pageErrors.push(error.message));
  return bucket;
}

function assertNoErrors(errors: ErrorBucket): void {
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
}

async function clearStorage(page: Page): Promise<void> {
  await page.addInitScript(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
}

/** An existing profile, so a test about something other than naming is not stopped by the form. */
async function seedProfile(page: Page): Promise<void> {
  await page.addInitScript((profileKey) => {
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem(
      profileKey,
      JSON.stringify({
        version: 2,
        activeId: 'robin',
        profiles: [{ id: 'robin', name: 'Robin', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: [] }],
      }),
    );
  }, PROFILE_KEY);
}

async function shot(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  await mkdir(SHOT_DIR, { recursive: true });
  await page.screenshot({ path: `${SHOT_DIR}/${testInfo.project.name}-${name}.png`, fullPage: true });
}

/** The profile index itself: present means a profile was minted, which is the UX-1 defect. */
async function profileIndex(page: Page): Promise<string | null> {
  return page.evaluate((key) => localStorage.getItem(key), PROFILE_KEY);
}

// ── UX-1: THE MENU IS THE DEFAULT ──────────────────────────────────────────────────────────────
//
// Each of these used to call `startWithProfiles()` and drop the player into a run of The Claim.

const MENU_ROUTES: readonly { name: string; query: string }[] = [
  { name: 'tracking-utm-fbclid', query: '/?utm_source=x&fbclid=y' },
  { name: 'tracking-gclid', query: '/?gclid=z' },
  // A shared contract link with no staged board launch and no ?debug: a share link, not a launch.
  { name: 'shared-contract', query: '/?contract=e1-night-shift' },
];

for (const route of MENU_ROUTES) {
  test(`${route.query} shows the start menu and mints no profile`, async ({ page }, testInfo) => {
    await clearStorage(page);
    const errors = collectErrors(page);
    await page.goto(route.query);

    await expect(page.getByTestId('start-menu')).toBeVisible();
    // A fresh store means the menu's own naming form, exactly as `/` renders it.
    await expect(page.getByTestId('profile-title')).toContainText("Who's prospecting?");
    expect(await profileIndex(page)).toBeNull();
    await shot(page, testInfo, `menu-${route.name}`);
    assertNoErrors(errors);
  });
}

test('a staged board launch still launches the run through ?contract=', async ({ page }) => {
  // The other half of the rule: `launchContract` and `continueSavedRun` stage the launch in
  // sessionStorage before reloading, and that staged marker is what tells a real launch from a
  // pasted link. Without this assertion the allowlist could break every board click and look green.
  await seedProfile(page);
  await page.addInitScript(() => sessionStorage.setItem('gr.contract.launch.v1', 'the-claim'));
  await page.goto('/?contract=the-claim');
  await expect(page.getByTestId('start-menu')).toHaveCount(0);
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 5, undefined, { timeout: 60_000 });
});

// ── UX-2: A FAILED BOOT GETS A CARD, NOT A BLANK PAGE ──────────────────────────────────────────

test('a chunk that never arrives gets the parchment card, not a blank page', async ({ page }, testInfo) => {
  await clearStorage(page);
  // The start menu's own chunk: the one module a plain `/` boot cannot do without.
  await page.route('**/ui/menu/StartMenu.ts*', (route) => route.abort());
  await page.goto('/');

  await expect(page.getByTestId('boot-failure-card')).toBeVisible();
  await expect(page.getByTestId('boot-failure-title')).toHaveText('The trail washed out.');
  await expect(page.getByTestId('boot-failure-reload')).toBeVisible();
  // "Not blank" measured, not assumed: there is readable text on the page.
  expect((await page.evaluate(() => document.body.innerText.trim().length)) ?? 0).toBeGreaterThan(20);
  await shot(page, testInfo, 'card-chunk-failure');
  // No zero-console assertion here: the forced abort is this test's own instrument, and the guard
  // deliberately files one console.error so a real failure stays diagnosable.
});

test('a browser refusing webgl2 gets the parchment card, not a blank page', async ({ page }, testInfo) => {
  await seedProfile(page);
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    // Only the 3D contexts are refused; 2D keeps working, so this tests the probe and nothing else.
    HTMLCanvasElement.prototype.getContext = function patched(this: HTMLCanvasElement, id: string, ...rest: unknown[]) {
      if (id === 'webgl2' || id === 'webgl' || id === 'experimental-webgl') return null;
      return (original as (...args: unknown[]) => unknown).call(this, id, ...rest);
    } as typeof HTMLCanvasElement.prototype.getContext;
  });
  await page.goto('/');

  await expect(page.getByTestId('start-menu-enter-town')).toBeVisible();
  await page.getByTestId('start-menu-enter-town').click();

  await expect(page.getByTestId('boot-failure-card')).toBeVisible();
  await expect(page.getByTestId('boot-failure-title')).toHaveText('This window cannot see the valley.');
  await expect(page.getByTestId('boot-failure-card')).toHaveAttribute('data-boot-failure-kind', 'webgl');
  await shot(page, testInfo, 'card-webgl-refused');
});

// ── UX-4: FOCUS LOSS ───────────────────────────────────────────────────────────────────────────

test('losing the window clears every held key and re-arms the next press', async ({ page }) => {
  await seedProfile(page);
  const errors = collectErrors(page);
  await page.goto('/');
  await expect(page.getByTestId('start-menu')).toBeVisible();

  // The controller is exercised directly, through a module script the way every other harness spec
  // reaches into `src/`: a browser sends no keyup for a key held while the window loses focus, and no
  // amount of Playwright keyboard driving can reproduce that. Only the event the browser really
  // sends instead can, and that event is `blur`.
  await page.addScriptTag({
    type: 'module',
    content: `
      import('/src/core/InputController.ts').then(({ InputController }) => {
        const stick = document.createElement('div');
        const knob = document.createElement('div');
        const confirm = document.createElement('button');
        document.body.append(stick, knob, confirm);
        const input = new InputController(stick, knob, confirm);
        const press = (code) => window.dispatchEvent(new KeyboardEvent('keydown', { code }));

        press('KeyD');
        const heldRight = input.readIntents().move.x;
        window.dispatchEvent(new Event('blur'));
        const afterBlur = input.readIntents().move.x;

        press('Space');
        const confirmAfterBlur = input.readIntents().confirm;

        press('KeyD');
        const movesAgain = input.readIntents().move.x;
        Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'hidden' });
        document.dispatchEvent(new Event('visibilitychange'));
        const afterHidden = input.readIntents().move.x;
        Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'visible' });

        input.dispose();
        stick.remove();
        knob.remove();
        confirm.remove();
        window.__UX_ENTRY_INPUT__ = { heldRight, afterBlur, confirmAfterBlur, movesAgain, afterHidden };
      });
    `,
  });
  const handle = await page.waitForFunction(
    () => (window as unknown as { __UX_ENTRY_INPUT__?: Record<string, number | boolean> }).__UX_ENTRY_INPUT__,
    undefined,
    { timeout: 30_000 },
  );
  const readings = (await handle.jsonValue()) as Record<string, number | boolean>;

  expect(readings.heldRight).toBe(1);
  expect(readings.afterBlur).toBe(0);
  // The half that is easy to miss: without re-arming the edge detectors the first press after
  // coming back is eaten as a repeat, and the player's confirm does nothing.
  expect(readings.confirmAfterBlur).toBe(true);
  expect(readings.movesAgain).toBe(1);
  expect(readings.afterHidden).toBe(0);
  assertNoErrors(errors);
});

test('the hero stops walking when the window loses focus mid-stride', async ({ page }) => {
  test.setTimeout(120_000);
  await seedProfile(page);
  await page.addInitScript(() => sessionStorage.setItem('gr.contract.launch.v1', 'the-claim'));
  const errors = collectErrors(page);
  await page.goto('/?debug&contract=the-claim&nowaves&nokill&nosteal&nowreck&nolevel&seed=ux-entry-blur');
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10, undefined, { timeout: 60_000 });

  await page.keyboard.down('KeyD');
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.speed ?? 0), { timeout: 10_000 }).toBeGreaterThan(0.1);

  // The browser's own answer to "the window went away": no keyup, just blur.
  await page.evaluate(() => window.dispatchEvent(new Event('blur')));
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.speed ?? 99), { timeout: 10_000 }).toBeLessThan(0.05);

  const before = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.heroPos.x);
  await page.waitForTimeout(800);
  const after = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.heroPos.x);
  expect(Math.abs(after - before)).toBeLessThan(0.05);
  await page.keyboard.up('KeyD');
  assertNoErrors(errors);
});

test('the solo pick clock freezes while the tab is hidden and resumes with the time left', async ({ page }, testInfo) => {
  test.setTimeout(180_000);
  await seedProfile(page);
  await page.addInitScript(() => sessionStorage.setItem('gr.contract.launch.v1', 'the-claim'));
  const errors = collectErrors(page);
  // Level-ups ON (no ?nolevel): the offer and its clock are the subject.
  await page.goto('/?debug&contract=the-claim&nowaves&nokill&nosteal&nowreck&seed=ux-entry-pick-clock');
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10, undefined, { timeout: 60_000 });

  // ?debug's X key grants 50 XP straight into Progression; need(L) can want more than one grant.
  for (let press = 0; press < 8; press += 1) {
    await page.keyboard.press('KeyX');
    await page.waitForTimeout(140);
    if ((await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.runState)) === 'levelup') break;
  }
  await expect(page.getByTestId('upgrade-overlay')).toBeVisible();
  const countdown = page.getByTestId('upgrade-countdown');
  await expect(countdown).toContainText('files automatically in');

  // Let the clock run down to the task's stated 10 s, so the freeze is measured against a number a
  // player would recognise rather than against the top of the budget.
  await expect.poll(() => readSeconds(countdown), { timeout: 30_000, intervals: [250] }).toBeLessThanOrEqual(10);
  const atFreeze = await readSeconds(countdown);
  await shot(page, testInfo, 'pick-clock-before-hide');

  await page.evaluate(() => {
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'hidden' });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await page.waitForTimeout(3_200);
  const whileHidden = await readSeconds(countdown);
  await page.evaluate(() => {
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'visible' });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await page.waitForTimeout(200);
  const afterReturn = await readSeconds(countdown);
  await shot(page, testInfo, 'pick-clock-after-return');

  // 3.2 s of absence must cost the player nothing. One second of slack for the frame the freeze
  // began on; before the fix this read 7 while hidden and the offer auto-picked index 0 at zero.
  expect(whileHidden).toBeGreaterThanOrEqual(atFreeze - 1);
  expect(afterReturn).toBeGreaterThanOrEqual(atFreeze - 1);
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.runState)).toBe('levelup');
  assertNoErrors(errors);
});

async function readSeconds(locator: ReturnType<Page['getByTestId']>): Promise<number> {
  const text = (await locator.textContent()) ?? '';
  const match = /in (\d+)s/.exec(text);
  return match ? Number(match[1]) : Number.NaN;
}
