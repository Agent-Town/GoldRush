import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { expectNoConsoleErrors, watchErrors } from './support/console-watch';

/**
 * E10S-3 — THE VENT, IN THE BROWSER (`specs/agent-play/e10-ember-shore-preserve.md` §3 "The vent",
 * §4 slice E10S-3). Three claims, in the order a player meets them:
 *
 *   1. THE PLAIN BOOT (no `?debug`, Mistake #10): a player who clicks the Ember Shore on the board
 *      sees the WARMTH METER on the ordinary HUD, full and holding, with the vent's own stake under
 *      him — no flag, no harness, no dev bridge. If the meter is not on that HUD the mechanic did
 *      not ship, whatever the guards say.
 *   2. THE STOKE, ON THE KEY EVERY OTHER CONTEXT ACTION USES. Standing in the disc and pressing
 *      confirm spends the authored gold for the authored warmth. It is measured against a purse the
 *      test GRANTS through the debug harness, because `e10-ember-shore` authors no harvest anchors
 *      until E10S-4 and therefore has no income of its own — F-E10S3-1, reported rather than cured.
 *   3. THE SQUALL AND THE LOSS: warmth falls while the squall blows and not before it, and an
 *      unstoked vent reaches zero inside that one squall and ends the run there, named.
 *
 * WHY (2) AND (3) CARRY `?debug` AND (1) DOES NOT — the same split `e10-ember-shore-squall.spec.ts`
 * makes. The flag buys the SIM CLOCK (`setManualSim`/`advanceSim`) and the purse (`grantGold`), not
 * the mechanic: the consumer runs in the ordinary update on the ordinary fixed step either way,
 * which is exactly what (1) proves under no flag at all. Without the clock this spec would have to
 * spend 93 real seconds to watch one vent go out.
 */

const CONTRACT_ID = 'e10-ember-shore';
const DEBUG_QUERY = `/?contract=${CONTRACT_ID}&nolevel&nopause&seed=preserve01&debug`;

/** The authored numbers, transcribed from the contract so a retune reds this spec too. */
const VENT = { stakeId: 'last-warm-vent', x: 3, z: -10, warmth: 100, decayPerSecond: 4, goldCost: 15, restore: 40, radius: 4 };

/**
 * The squall's own table (`scripts/e10-squall-scheduler.test.mjs`), in the SECONDS `advanceSim`
 * takes: calm 0-60, telegraph 60-68, squall 68-93, recover 93-101.
 */
const SQUALL_OPENS_AT_SECONDS = 68;
const SQUALL_CLOSES_AT_SECONDS = 93;

test.setTimeout(240_000);

test.beforeEach(async ({ page }, testInfo) => page.addInitScript((key) => {
  if (!sessionStorage.getItem(key)) {
    localStorage.clear();
    sessionStorage.setItem(key, '1');
  }
}, `e10-ember-shore-preserve-${testInfo.testId}`));

const vent = (page: Page) => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.preserveVent);
const squall = (page: Page) => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.squall);
const gold = (page: Page) => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.economy.gold);
const heroAt = (page: Page) => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.heroPos);

/** The four authored cooling-vein anchors (E10S-4), transcribed so a retune reds this spec too. */
const ANCHORS = [{ x: -6, z: -24 }, { x: -20, z: -34 }, { x: -38, z: -22 }, { x: -54, z: -12 }];
const reach = (point: { x: number; z: number }) => Math.hypot(point.x - VENT.x, point.z - VENT.z);
const inReach = async (page: Page) => reach(await heroAt(page)) <= VENT.radius;

/**
 * Walks the hero with the player's OWN keys, the `078-ux-hygiene` pattern. It stops inside 0.6wu,
 * which is comfortably inside both things this spec asks of it: the seam's 1.6wu channel range
 * (`Balance.goldSeam.channelRange`) and the vent's 4wu stoke disc.
 */
async function walkTo(page: Page, target: { x: number; z: number }): Promise<void> {
  for (let step = 0; step < 90; step += 1) {
    const at = await heroAt(page);
    if (Math.hypot(target.x - at.x, target.z - at.z) <= 0.6) return;
    const keys: string[] = [];
    if (Math.abs(target.x - at.x) > 0.6) keys.push(target.x > at.x ? 'KeyD' : 'KeyA');
    if (Math.abs(target.z - at.z) > 0.6) keys.push(target.z > at.z ? 'KeyS' : 'KeyW');
    for (const key of keys) await page.keyboard.down(key);
    await page.waitForTimeout(160);
    for (const key of [...keys].reverse()) await page.keyboard.up(key);
  }
  const settled = await heroAt(page);
  expect(Math.hypot(target.x - settled.x, target.z - settled.z)).toBeLessThanOrEqual(1.6);
}

/** E10S-3's shots stay in E10S-3's folder; the E10S-4 errand's land in this slice's own. */
async function shoot(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  const slice = name.startsWith('plain-boot-panning')
    || name.startsWith('plain-boot-squall-biting')
    || name.startsWith('plain-boot-vent-kept')
    ? 'e10s-4-door'
    : 'e10s-3-preserve';
  const body = await page.screenshot({ path: `artifacts/${slice}/shots/${testInfo.project.name}-${name}.png`, scale: 'css' });
  await testInfo.attach(name, { body, contentType: 'image/png' });
}

async function dismissBriefing(page: Page): Promise<void> {
  const dismiss = page.getByTestId('contract-briefing-dismiss');
  if (await dismiss.isVisible()) await dismiss.evaluate((button: HTMLButtonElement) => button.click());
}

/**
 * The player's own door, without `?debug` — the launch key the board itself writes, exactly as
 * `e10-ember-shore-squall.spec.ts` opens it.
 *
 * RE-POINTED BY E10S-4. This used to say the map was reachable "only because it declares
 * `twist.harvestFreeObjective` (F-E10L-1)". It is now reachable because it has SEAMS: the four
 * authored cooling-vein `harvestAnchors` land with this slice's admission, `harvestAnchors.length`
 * is no longer 0, and `src/meta/ContractFamilies.ts:1352` therefore never reaches its second
 * conjunct. The declaration was removed with the anchors that replaced it, because
 * `scripts/board-launchable-guard.test.mjs:98` refuses a map that carries both ("one of the two is
 * a lie"). A regression in EITHER still lands here as a fallback to The Claim.
 */
async function bootPlainFromTheBoard(page: Page): Promise<void> {
  await page.goto('/?nolevel&nopause');
  await page.waitForFunction(() => Boolean(window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId));
  await page.evaluate(() => {
    localStorage.setItem('gr.activeEpoch.v1', 'epoch-10-deepsky');
    sessionStorage.setItem('gr.contract.launch.v1', 'e10-ember-shore');
  });
  await page.goto(`/?contract=${CONTRACT_ID}&nolevel&nopause&seed=preserve01`);
  await page.waitForFunction((id) => window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId === id, CONTRACT_ID);
}

async function openDebugRun(page: Page): Promise<void> {
  await page.goto(DEBUG_QUERY);
  await page.waitForFunction((id) => window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId === id, CONTRACT_ID);
  await page.waitForFunction(() => Boolean(window.__GR_TEST__));
  await dismissBriefing(page);
  await page.evaluate(() => {
    const harness = window.__GR_TEST__!;
    harness.setManualSim(true);
    // This spec measures THE VENT, not the hero's survival: a run that ends at wave 3 on contact
    // damage would red the warmth assertions as a vent failure instead of the roster fact it is.
    harness.setBalance('enemy.contactDamage', 0);
  });
}

/**
 * Steps the sim forward by `seconds` in small chunks. `advanceSim` takes SECONDS (not ticks), and
 * the chunking matches `e10-ember-shore-squall.spec.ts`'s own loop so one call never asks the
 * browser for hundreds of fixed steps at once.
 */
async function advanceSeconds(page: Page, seconds: number, chunk = 4): Promise<void> {
  for (let spent = 0; spent < seconds; spent += chunk) {
    await page.evaluate((count) => window.__GR_TEST__!.advanceSim(count), Math.min(chunk, seconds - spent));
  }
}

test('E10S-3 plain boot: the Ember Shore shows the vent meter on the ordinary HUD', async ({ page }, testInfo) => {
  const watch = watchErrors(page);
  await bootPlainFromTheBoard(page);
  await dismissBriefing(page);

  // The map the player clicked, not the fallback. `fallbackReason` is the F-E10L-1 tell.
  const contract = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.contract);
  expect(contract.activeId).toBe(CONTRACT_ID);
  expect(contract.fallbackReason).toBeNull();

  const declared = await vent(page);
  expect(declared).not.toBeNull();
  expect(declared!.declared).toBe(true);
  expect({
    stakeId: declared!.stakeId,
    position: declared!.position,
    warmth: declared!.warmth,
    maxWarmth: declared!.maxWarmth,
    decayPerSecond: declared!.decayPerSecond,
    goldCost: declared!.stoke.goldCost,
    warmthRestore: declared!.stoke.warmthRestore,
    radius: declared!.stoke.radius,
  }).toEqual({
    stakeId: VENT.stakeId,
    position: { x: VENT.x, z: VENT.z },
    warmth: VENT.warmth,
    maxWarmth: VENT.warmth,
    decayPerSecond: VENT.decayPerSecond,
    goldCost: VENT.goldCost,
    warmthRestore: VENT.restore,
    radius: VENT.radius,
  });
  expect(declared!.alight).toBe(true);
  expect(declared!.guttered).toBe(false);
  expect(declared!.objectiveMet).toBe(false);

  // WHAT THE PLAYER HAS, WITH NO FLAG AT ALL: the meter, on the HUD, reading full.
  const meter = page.getByTestId('hud-warmth');
  await expect(meter).toBeVisible();
  await expect(meter).toHaveAttribute('data-state', 'alight');
  await expect(meter).toContainText(`${VENT.warmth}/${VENT.warmth}`);
  // The hero starts AT the vent (`heroStart: true` on `last-warm-vent`), so the price shows.
  await expect(meter.locator('[data-hud-warmth-stoke]')).toHaveText(`STOKE ${VENT.goldCost}g`);

  // ...and it is the Ember Shore's alone: The Claim's HUD carries no warmth panel at all.
  await shoot(page, testInfo, 'plain-boot-vent-alight');
  expectNoConsoleErrors(watch, 'e10-ember-shore plain boot');
});

test('E10S-3 the stoke: confirm at the vent spends the authored gold for the authored warmth', async ({ page }, testInfo) => {
  const watch = watchErrors(page);
  await openDebugRun(page);

  // THE PURSE IS GRANTED, AND WHY (F-E10S3-1, honest): `e10-ember-shore` declares
  // `harvestAnchors: []` until the E10S-4 door earns them, so a run on this map has NO income and
  // cannot afford a 15-gold stoke by playing. The grant buys the ECONOMY this map has not been
  // given yet; it does not buy the mechanic, which is what the rest of this test measures.
  await page.evaluate(() => window.__GR_TEST__!.grantGold(60));
  await page.evaluate((at) => window.__GR_TEST__!.teleport(at.x, at.z), { x: VENT.x, z: VENT.z });

  // Take some warmth off first, so a stoke has room: ride ten seconds into the squall.
  await advanceSeconds(page, SQUALL_OPENS_AT_SECONDS + 10);
  const bitten = await vent(page);
  expect(bitten!.decaying).toBe(true);
  expect((await squall(page))!.blowing).toBe(true);
  expect(bitten!.warmth).toBeLessThan(VENT.warmth);
  expect(bitten!.warmth).toBeGreaterThan(0);
  await shoot(page, testInfo, 'squall-draining-the-vent');

  const goldBefore = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.economy.gold);
  // THE PLAYER'S OWN KEY — the same confirm every other context action uses. No private handle.
  // The manual clock is released for the press because the confirm INTENT is read by the ordinary
  // update loop; a key pressed while the sim is frozen has no tick to be consumed on.
  await page.evaluate(() => window.__GR_TEST__!.setManualSim(false));
  await page.keyboard.press('Enter');
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__!.preserveVent?.stoke.uses ?? 0) >= 1);
  await page.evaluate(() => window.__GR_TEST__!.setManualSim(true));

  const stoked = await vent(page);
  const goldAfter = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.economy.gold);
  expect(stoked!.stoke.uses).toBe(1);
  expect(goldBefore - goldAfter).toBe(VENT.goldCost);
  // The warmth is the pre-press reading plus the authored restore, less whatever the squall took
  // during the real-time window the press needed — bounded above by the ideal and below by it
  // minus a couple of seconds of decay, which is what makes this an assertion rather than a hope.
  const ideal = Math.min(VENT.warmth, bitten!.warmth + VENT.restore);
  expect(stoked!.warmth).toBeLessThanOrEqual(ideal);
  expect(stoked!.warmth).toBeGreaterThan(ideal - VENT.decayPerSecond * 5);
  await expect(page.getByTestId('hud-warmth')).toContainText(`/${VENT.warmth}`);

  // AND IT SURVIVES THE SQUALL IT WOULD OTHERWISE HAVE DIED IN, which is the whole turn this map
  // teaches. Ride to the end of the authored squall and past it.
  await advanceSeconds(page, SQUALL_CLOSES_AT_SECONDS - SQUALL_OPENS_AT_SECONDS + 15);
  const after = await vent(page);
  expect(after!.guttered).toBe(false);
  expect(after!.alight).toBe(true);
  expect(after!.squallsSurvived).toBeGreaterThanOrEqual(1);
  expect(after!.objectiveMet).toBe(true);
  expect((await squall(page))!.blowing).toBe(false);
  await shoot(page, testInfo, 'stoked-vent-survived');

  expectNoConsoleErrors(watch, 'e10-ember-shore stoke');
});

/**
 * E10S-4 — THE ERRAND, IN A PLAIN BOOT AND ON THE PLAYER'S OWN CLOCK.
 *
 * This is the test E10S-3 could not write. Its stoke test had to GRANT a purse through the debug
 * harness and said so (F-E10S3-1: "`e10-ember-shore` authors no harvest anchors until E10S-4 and
 * therefore has no income of its own"). The four cooling-vein anchors are that income, so the whole
 * loop is now playable with no flag, no harness, no granted coin: walk out to a vein, pan until the
 * purse holds a stoke, walk back inside the disc, and answer the squall when it bites.
 *
 * IT RUNS IN REAL SECONDS ON PURPOSE. `advanceSim` lives behind `?debug`, and a clock a player does
 * not have would prove the wrong thing here — the claim is that the errand FITS between the
 * squalls at the authored cadence (60 s of calm to earn 15 gold in, a 25 s squall to spend it in),
 * and that claim is only true if nobody is fast-forwarding. Hence the ~110 s budget and the
 * generous polls; `test.setTimeout(240_000)` above covers it.
 */
test('E10S-4 plain boot: panning a cooling vein pays for the stoke that keeps the vent', async ({ page }, testInfo) => {
  const watch = watchErrors(page);
  await bootPlainFromTheBoard(page);
  await dismissBriefing(page);

  const contract = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.contract);
  expect(contract.activeId).toBe(CONTRACT_ID);
  expect(contract.fallbackReason).toBeNull();

  // THE SEAMS ARE ON THE BOARD, and they are the authored anchors rather than the engine default:
  // every live node sits on one of the four cooling-vein coordinates this slice authored.
  const seams = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.harvest.activeNodes
    .filter((node) => node.active)
    .map((node) => ({ id: node.id, x: node.position.x, z: node.position.z, remaining: node.remaining })));
  expect(seams.length).toBeGreaterThan(0);
  for (const seam of seams) expect(ANCHORS).toContainEqual({ x: seam.x, z: seam.z });
  expect(await gold(page)).toBe(0);

  // OUT TO THE NEAREST VEIN, on the player's own keys, and pan until the purse can pay a stoke.
  const vein = [...seams].sort((a, b) => reach(a) - reach(b))[0];
  await walkTo(page, vein);
  await expect.poll(() => gold(page), { timeout: 60_000, intervals: [500] }).toBeGreaterThanOrEqual(VENT.goldCost);
  const earned = await gold(page);
  await shoot(page, testInfo, 'plain-boot-panning-the-vein');

  // BACK INSIDE THE DISC. `walkTo` stops within 0.6wu of its target and the stand is 2.5wu south of
  // the stake, well inside the authored 4wu radius and off the vent altar's own footprint.
  await walkTo(page, { x: VENT.x, z: VENT.z - 2.5 });
  expect(await inReach(page)).toBe(true);

  // WAIT FOR THE SQUALL TO BITE. The stoke is capped at 100, so pressing while the vent is full
  // throws the difference away; the errand is only honest once the weather has taken more than the
  // restore is worth. At the authored cadence that is ten seconds into the squall, ~78 s in.
  await expect.poll(async () => (await vent(page))!.warmth, { timeout: 120_000, intervals: [1_000] })
    .toBeLessThanOrEqual(VENT.warmth - VENT.restore);
  const bitten = await vent(page);
  expect(bitten!.guttered).toBe(false);
  expect((await squall(page))!.blowing).toBe(true);
  await shoot(page, testInfo, 'plain-boot-squall-biting');

  // THE PLAYER'S OWN KEY, paying with the player's own gold.
  await page.keyboard.press('Enter');
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__!.preserveVent?.stoke.uses ?? 0) >= 1, undefined, { timeout: 15_000 });
  const stoked = await vent(page);
  expect(stoked!.stoke.uses).toBe(1);
  expect(earned - (await gold(page))).toBeGreaterThanOrEqual(VENT.goldCost);
  expect(stoked!.warmth).toBeGreaterThan(bitten!.warmth);

  // AND THE VENT IS STILL ALIGHT WHEN THE SQUALL LETS GO, which is the whole turn: the run that
  // would have ended at 93.0 s unstoked (the idle floor, `fnv1a32:1b73c4b7`) is still going.
  await expect.poll(async () => (await squall(page))!.blowing, { timeout: 60_000, intervals: [1_000] }).toBe(false);
  const survived = await vent(page);
  expect(survived!.guttered).toBe(false);
  expect(survived!.alight).toBe(true);
  expect(survived!.squallsSurvived).toBeGreaterThanOrEqual(1);
  expect(survived!.objectiveMet).toBe(true);
  await expect(page.getByTestId('hud-warmth')).toHaveAttribute('data-state', 'alight');
  await shoot(page, testInfo, 'plain-boot-vent-kept-on-panned-gold');

  expectNoConsoleErrors(watch, 'e10-ember-shore plain-boot errand');
});

test('E10S-3 the loss: an unstoked vent gutters inside the first squall and ends the run', async ({ page }, testInfo) => {
  const watch = watchErrors(page);
  await openDebugRun(page);

  // The calm costs the vent nothing — measured before the squall, so the decay cannot be a clock.
  await advanceSeconds(page, 50);
  const calm = await vent(page);
  expect((await squall(page))!.phase).toBe('calm');
  expect(calm!.warmth).toBe(VENT.warmth);
  expect(calm!.decaying).toBe(false);
  expect(calm!.warmthLost).toBe(0);

  // Then the whole authored squall, unanswered.
  await advanceSeconds(page, SQUALL_CLOSES_AT_SECONDS - 50 + 2);
  const cold = await vent(page);
  expect(cold!.guttered).toBe(true);
  expect(cold!.alight).toBe(false);
  expect(cold!.warmth).toBe(0);
  expect(cold!.stoke.uses).toBe(0);
  expect(cold!.objectiveMet).toBe(false);
  await expect(page.getByTestId('hud-warmth')).toHaveAttribute('data-state', 'cold');

  // THE RUN IS OVER, AND IT IS NAMED — the fairground wheel-loss surfacing class, not a silent
  // unsecurable state: the browser reports `vent_guttered` as the reason the claim ended.
  await page.waitForFunction(
    () => window.__THREE_GAME_DIAGNOSTICS__!.run.lastRunEndedReason === 'vent_guttered'
      || window.__THREE_GAME_DIAGNOSTICS__!.runState === 'dead',
    undefined,
    { timeout: 30_000 },
  );
  await shoot(page, testInfo, 'vent-guttered');

  expectNoConsoleErrors(watch, 'e10-ember-shore vent guttered');
});
