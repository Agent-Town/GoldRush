import { expect, test, type Page, type TestInfo } from '@playwright/test';

/**
 * A10 — THE OLD CANAL, in the browser (`specs/agent-play/door-completion-sheet.md:26`, RATIFIED
 * 2026-08-20). Three claims, in the order a player meets them:
 *
 *   1. THE REACH (no `?debug`, Mistake #10): what a real player gets is the Old Canal itself once
 *      Devil's Alley is secured, and the prompt on the stake is the whole interface — two named
 *      buttons and two keys, in an ordinary boot, with no harness anywhere near it.
 *   2. THE TRADE: an undecided band takes no works; DEMOLISH opens it; RE-DIG floods it and closes
 *      it forever. Measured through the ordinary confirm and upgrade keys, and NOTHING is
 *      persisted mid-run.
 *   3. THE PERSISTENCE LAW: the verdict lands at run END — whatever ended it, including a death —
 *      and the next tile birth carries the water and its no-spawn zone. A run that decides nothing
 *      writes nothing.
 *
 * THIS IS WHERE A10's PERSISTENCE IS PROVEN AT ALL. `HeadlessContractSim` deliberately hands the
 * consumer a fresh EMPTY tile store so no bench run can inherit a verdict (which is what keeps the
 * null floors honest), so the headless engine cannot demonstrate the round trip even in principle.
 * The browser can, and does, here.
 */

const CONTRACT_ID = 'e9-old-canal';
const DEBUG_QUERY = '/?contract=e9-old-canal&nolevel&nopause&seed=oc01&debug';
/** `decide-segment-b`, the near stake — 12.2wu off the claim and inside `old-canal-segment-b`. */
const NEAR_STAKE = { x: 2, z: 0 };
/** `decide-segment-a`, the west stake — the one this spec re-digs, so the two verdicts differ. */
const WEST_STAKE = { x: -30, z: -23 };
const WEST_ENTRY_ID = 'canal-choice:decide-segment-a';

test.setTimeout(240_000);

/**
 * The storage wipe runs ONCE per test, not once per navigation. `addInitScript` fires on every
 * load including `reload()`, so an unguarded `localStorage.clear()` here would erase the very
 * write the persistence test exists to observe. Same sessionStorage latch TP-02 and A8 use.
 */
test.beforeEach(async ({ page }, testInfo) => page.addInitScript((key) => {
  if (!sessionStorage.getItem(key)) {
    localStorage.clear();
    sessionStorage.setItem(key, '1');
  }
}, `e9-old-canal-${testInfo.testId}`));

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };

function collectErrors(page: Page): ErrorBucket {
  const errors: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => message.type() === 'error' && errors.consoleErrors.push(message.text()));
  page.on('pageerror', (error) => errors.pageErrors.push(error.message));
  return errors;
}

const canal = (page: Page) => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.canalChoices);
const flow = (page: Page) => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.canalFlow);

async function waitForBoot(page: Page, debug: boolean): Promise<void> {
  await page.waitForFunction((id) => window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId === id, CONTRACT_ID);
  if (debug) await page.waitForFunction(() => Boolean(window.__GR_TEST__));
  const dismiss = page.getByTestId('contract-briefing-dismiss');
  if (await dismiss.isVisible()) await dismiss.evaluate((button: HTMLButtonElement) => button.click());
}

/** Manual sim + no contact damage: this spec measures the VERDICTS, not the hero's survival. */
async function takeManualControl(page: Page): Promise<void> {
  await page.evaluate(() => {
    const harness = window.__GR_TEST__!;
    harness.setManualSim(true);
    harness.setBalance('enemy.contactDamage', 0);
  });
}

/**
 * The plain-boot door into the Old Canal, WITHOUT `?debug`. `activeContractSelection` honours
 * `?contract=` with no debug flag whenever the id is a STAGED PLAYER LAUNCH, and
 * `reverifyStagedContractLaunch` keeps that launch only while the row is unlocked — so the honest
 * way in is to be a player who has already secured Devil's Alley (`boardRow.unlock`). That is one
 * scoreboard row, written through the app's own profile-scoped storage, and nothing else: no
 * harness, no flag, no private handle.
 */
async function bootPlainAsUnlockedPlayer(page: Page): Promise<void> {
  await page.goto('/?nolevel&nopause');
  await page.waitForFunction(() => Boolean(window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId));
  await page.evaluate(() => {
    localStorage.setItem('gr.activeEpoch.v1', 'epoch-9-redfields');
    localStorage.setItem('gr.scores.v2', JSON.stringify([{
      waves: 20, kills: 400, gold: 500, timeAlive: 600, at: 1, secured: true, contractId: 'e9-devils-alley',
    }]));
    sessionStorage.setItem('gr.contract.launch.v1', 'e9-old-canal');
  });
  await page.goto('/?contract=e9-old-canal&nolevel&nopause&seed=oc01');
}

async function tileStateSnapshot(page: Page): Promise<string | null> {
  return page.evaluate(async (contractId) => {
    const profiles = (await Function('return import("/src/game/ProfileStorage.ts")')()) as typeof import('../src/game/ProfileStorage');
    return localStorage.getItem(profiles.tileStateKey(profiles.activeProfile(localStorage).id, contractId));
  }, CONTRACT_ID);
}

/** Evidence that survives the run (Convention 1): desktop AND 390px, both attached. */
async function shoot(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  const body = await page.screenshot({ path: `artifacts/e9-old-canal/shots/${testInfo.project.name}-${name}.png` });
  await testInfo.attach(name, { body, contentType: 'image/png' });
}

/** The ordinary context action — Space, the same key that funds a megaproject or plants a vault. */
async function pressKey(page: Page, code: string, key: string): Promise<void> {
  await page.evaluate(({ code: c, key: k }) => {
    window.dispatchEvent(new KeyboardEvent('keydown', { code: c, key: k, bubbles: true }));
    window.dispatchEvent(new KeyboardEvent('keyup', { code: c, key: k, bubbles: true }));
  }, { code, key });
  // One frame, so the intent edge is consumed before the next assertion reads diagnostics.
  await page.evaluate(() => window.__GR_TEST__!.advanceSim(0.2));
}

test('a plain boot puts the canal, its three undecided bands and the stake prompt in front of the player', async ({ page }, testInfo) => {
  const errors = collectErrors(page);
  // NO `?debug` ANYWHERE IN THIS TEST, which is the point (Mistake #10): this is a real player who
  // has secured Devil's Alley, launching the row it unlocks.
  await bootPlainAsUnlockedPlayer(page);
  await waitForBoot(page, false);

  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.contract.activeId)).toBe(CONTRACT_ID);
  // THE FLOW RENDERS FROM THE COMBINED CHOICES, and with none taken that is three derelict cuts.
  expect(await flow(page)).toMatchObject({
    wetBands: [],
    filledBands: [],
    derelictBands: ['decide-segment-a', 'decide-segment-b', 'decide-segment-c'],
  });
  expect(await canal(page)).toMatchObject({ declared: true, decided: 0, total: 3, allDecided: false });
  await shoot(page, testInfo, 'plain-boot-derelict-canal');

  // THE PROMPT IS THE INTERFACE, and it appears in ordinary play with no build mode and no flag.
  // The two buttons are how touch and mouse reach both halves of a two-way choice.
  await expect(page.getByTestId('canal-redig')).toBeHidden();
  // WALKED, NOT TELEPORTED. `page.keyboard` needs focus the canvas may not hold, so the hold is
  // dispatched the way the A8 spec dispatches its confirm — a synthetic `keydown` on `window`,
  // which is exactly the event `InputController` binds. The stake is 12wu south of the claim.
  // KeyW, not KeyS: `moveUp` walks toward DECREASING z on this projection, and the stake sits 12wu
  // south-in-world-coordinates of the claim at (0,12). Measured, not assumed — the first draft held
  // KeyS and marched the player to z=63.5, the north edge of a 128wu tile.
  await page.evaluate(() => window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyW', key: 'w', bubbles: true })));
  await expect(page.getByTestId('canal-redig')).toBeVisible({ timeout: 60_000 });
  await page.evaluate(() => window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyW', key: 'w', bubbles: true })));
  await expect(page.getByTestId('canal-demolish')).toBeVisible();
  await expect(page.getByTestId('canal-redig')).toContainText('Re-dig');
  await expect(page.getByTestId('canal-demolish')).toContainText('Demolish');
  await shoot(page, testInfo, 'plain-boot-stake-prompt');

  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('the two verdicts do opposite things to the same ground, and neither reaches the profile mid-run', async ({ page }, testInfo) => {
  const errors = collectErrors(page);
  await page.goto(DEBUG_QUERY);
  await waitForBoot(page, true);
  await takeManualControl(page);

  // AN UNDECIDED BAND TAKES NO WORKS. Proven through the ordinary build path rather than by
  // reading the predicate: the ghost simply refuses to validate inside the cut.
  await page.evaluate(({ x, z }) => window.__GR_TEST__!.teleport(x, z), NEAR_STAKE);
  await page.evaluate(() => window.__GR_TEST__!.grantGold(400));
  expect(await page.evaluate(({ x, z }) => window.__GR_TEST__!.placeFree('palisade', x, z), NEAR_STAKE)).toBe(false);

  // DEMOLISH — the upgrade key, named on the prompt's second button. The ground opens at once.
  await pressKey(page, 'KeyU', 'u');
  expect(await canal(page)).toMatchObject({
    decided: 1,
    openGround: ['decide-segment-b'],
    flow: [],
    decidedThisRun: ['decide-segment-b'],
    allDecided: false,
  });
  expect(await flow(page)).toMatchObject({ filledBands: ['decide-segment-b'], wetBands: [] });
  expect(await page.evaluate(({ x, z }) => window.__GR_TEST__!.placeFree('palisade', x, z), NEAR_STAKE)).toBe(true);
  await shoot(page, testInfo, 'segment-b-backfilled');

  // ONE-TIME FOR THE LIFE OF THE PROFILE: the confirm key at the same stake changes nothing.
  await pressKey(page, 'Space', ' ');
  expect((await canal(page))!.choices.find((entry) => entry.id === 'decide-segment-b')!.choice).toBe('demolish');

  // RE-DIG — the confirm key, at a different stake. The water arrives in the same frame, and the
  // band closes to works forever.
  await page.evaluate(({ x, z }) => window.__GR_TEST__!.teleport(x, z), WEST_STAKE);
  await pressKey(page, 'Space', ' ');
  expect(await canal(page)).toMatchObject({ decided: 2, flow: ['decide-segment-a'], openGround: ['decide-segment-b'] });
  expect(await flow(page)).toMatchObject({ wetBands: ['decide-segment-a'], filledBands: ['decide-segment-b'] });
  expect(await page.evaluate(({ x, z }) => window.__GR_TEST__!.placeFree('palisade', x, z), WEST_STAKE)).toBe(false);
  await shoot(page, testInfo, 'segment-a-re-dug');

  // NOTHING HAS REACHED THE PROFILE. TP-02's law, unchanged: a verdict is STAGED until run end.
  expect(await tileStateSnapshot(page)).toBeNull();

  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('a verdict lands at run end — even a lost run — and the next birth is born wet', async ({ page }, testInfo) => {
  const errors = collectErrors(page);
  await page.goto(DEBUG_QUERY);
  await waitForBoot(page, true);
  await takeManualControl(page);

  await page.evaluate(({ x, z }) => window.__GR_TEST__!.teleport(x, z), WEST_STAKE);
  await pressKey(page, 'Space', ' ');
  expect((await canal(page))!.flow).toEqual(['decide-segment-a']);
  expect(await tileStateSnapshot(page)).toBeNull();

  // THE RUN IS LOST, NOT WON, and the verdict survives it. That is the engine's own write-at-end
  // law stated where a reader will look for it (`Game.ts`: "staged tile-state entries land when
  // the run ends, WHATEVER ended it") — and it is the right law for this mechanic, because the
  // sheet's word is "permanently". A canal you re-dug does not un-dig itself because you died.
  await page.evaluate(() => window.__GR_TEST__!.endRunForTest());
  await page.evaluate(() => window.__GR_TEST__!.advanceSim(2));
  await expect.poll(async () => tileStateSnapshot(page), { timeout: 30_000 }).not.toBeNull();
  const snapshot = JSON.parse((await tileStateSnapshot(page))!);
  expect(snapshot.entries).toEqual([{
    kind: 'sim',
    id: WEST_ENTRY_ID,
    payload: { choice: 'redig', minX: -42, maxX: -18, minZ: -32, maxZ: -14 },
    schemaVersion: 1,
  }]);

  // THE NEXT BIRTH IS BORN WET, and born carrying the no-spawn zone the water buys: the inscribed
  // disc of the authored band, on the same substrate TP-02 and A8 use.
  await page.goto(DEBUG_QUERY);
  await waitForBoot(page, true);
  expect(await canal(page)).toMatchObject({
    decided: 1,
    flow: ['decide-segment-a'],
    decidedBefore: ['decide-segment-a'],
    decidedThisRun: [],
    allDecided: false,
  });
  expect(await flow(page)).toMatchObject({ wetBands: ['decide-segment-a'] });
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.tilePersistence.noSpawnZones))
    .toEqual([{ x: -30, z: -23, radius: 9 }]);
  await shoot(page, testInfo, 'second-run-born-wet');

  // AND IT IS STILL ONE-TIME: the inherited verdict refuses a second one.
  await takeManualControl(page);
  await page.evaluate(({ x, z }) => window.__GR_TEST__!.teleport(x, z), WEST_STAKE);
  await pressKey(page, 'KeyU', 'u');
  expect((await canal(page))!.openGround).toEqual([]);

  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('a run that decides nothing writes nothing', async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto(DEBUG_QUERY);
  await waitForBoot(page, true);
  await takeManualControl(page);

  // The Prospector stands ON a stake and never presses anything. Mistake #7's rule, asserted:
  // nothing writes on boot, on arrival, or on proximity — only on an explicit player action.
  await page.evaluate(({ x, z }) => window.__GR_TEST__!.teleport(x, z), NEAR_STAKE);
  await page.evaluate(() => window.__GR_TEST__!.advanceSim(20));
  expect((await canal(page))!.decided).toBe(0);

  await page.evaluate(() => window.__GR_TEST__!.endRunForTest());
  await page.evaluate(() => window.__GR_TEST__!.advanceSim(1));
  expect(await tileStateSnapshot(page)).toBeNull();

  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});
