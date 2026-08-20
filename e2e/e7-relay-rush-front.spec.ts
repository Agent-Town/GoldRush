import { expect, test, type Page } from '@playwright/test';
import { createServer, type ViteDevServer } from 'vite';

/**
 * A5 — THE INTERFERENCE FRONT (`specs/agent-play/door-completion-sheet.md:16`,
 * RATIFIED 2026-08-20).
 *
 * Five things are under test, and the third and fourth are the ones that keep the mechanic
 * honest:
 *   (a) the front is a SCHEDULE, not a mood — it arrives every 90s, crosses west to east in 20s,
 *       and between fronts nothing anywhere is muted;
 *   (b) the mute is a PLACE — a work under the wall goes off the air, a work beside it does not,
 *       and a playbook refuses only while the actor asking for it stands in the band;
 *   (c) MUTED IS NEVER DAMAGED, which the ratification states in as many words: a wall passing
 *       over a turret must leave its hp, its slot and its standing count untouched;
 *   (d) the objective LATCH — 3 of the 4 relay sites lit before the third front, keyed on the
 *       sub-fields so a front with no corridor or no sites does NOT arm (F-1471-1: a declaration
 *       with no completion path once pinned a run unsecurable forever);
 *   (e) Mistake #10 — where the PLAYER sees it, in a plain boot with no `?debug`.
 */

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };

async function open(page: Page, query: string): Promise<ErrorBucket> {
  const errors: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => message.type() === 'error' && errors.consoleErrors.push(message.text()));
  page.on('pageerror', (error) => errors.pageErrors.push(error.message));
  await page.goto(query);
  await page.waitForFunction(() => window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId !== undefined);
  const briefing = page.getByTestId('contract-briefing');
  if (await briefing.isVisible()) await page.getByTestId('contract-briefing-dismiss').click();
  return errors;
}

/**
 * `&epoch=epoch-7-signal` is what RESOLVES this contract. Relay Rush's board row is locked behind
 * `secured:e7-dead-band`, so a bare `?contract=e7-relay-rush` falls back to The Claim — which is
 * exactly what `e2e/er01-e7-census.spec.ts` asserts and why it must be spelled out here.
 */
const DEBUG_URL = '/?debug&epoch=epoch-7-signal&contract=e7-relay-rush&nowaves&nolevel&nopause&seed=e7-relay-rush-01';

/** One legal pad inside each authored relay site (`tileParams.buildZones`, z 36..46). */
const PADS = {
  r1: { x: -45, z: 40 },
  r2: { x: -25, z: 40 },
  r3: { x: 25, z: 40 },
  r4: { x: 45, z: 40 },
};

const front = (page: Page) => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.interferenceFront!);
const advance = (page: Page, seconds: number) => page.evaluate((s) => window.__GR_TEST__!.advanceSim(s), seconds);

test('the front keeps its schedule, mutes only what it covers, and never damages it', async ({ page }) => {
  const errors = await open(page, DEBUG_URL);
  // The contract really resolved — otherwise every assertion below would be about The Claim.
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.contract.activeId)).toBe('e7-relay-rush');
  await page.evaluate(() => window.__GR_TEST__!.setManualSim(true));

  // (a) THE DECLARATION, resolved. `relayTarget` is authored as the placeholder string "N"; the
  // ratified sheet supplies 3 of 4, and the consumer is where that resolution happens.
  const start = await front(page);
  expect(start).toMatchObject({
    declared: true,
    cadenceSeconds: 90,
    crossingSeconds: 20,
    relayTarget: 3,
    deadlineFront: 3,
    phase: 'waiting',
    frontsArrived: 0,
    centerX: null,
    litCount: 0,
    deadlineResolved: false,
    objectiveMet: false,
  });
  expect(start.sites.map(({ id }) => id)).toEqual(['relay-site-r1', 'relay-site-r2', 'relay-site-r3', 'relay-site-r4']);
  expect(start.sites.every(({ muted }) => muted === false)).toBe(true);

  // (b) LIGHT THREE OF THE FOUR. A sentry beacon is a `POWERED_RELAY_KIND`, so each one lights the
  // site it stands on — and the fourth site stays dark, which is what makes "3 of 4" a choice.
  const placed = await page.evaluate((pads) => [
    window.__GR_TEST__!.placeFree('sentry_beacon', pads.r2.x, pads.r2.z),
    window.__GR_TEST__!.placeFree('sentry_beacon', pads.r3.x, pads.r3.z),
    window.__GR_TEST__!.placeFree('turret', pads.r4.x, pads.r4.z),
  ], PADS);
  expect(placed).toEqual([true, true, true]);
  await advance(page, 0.2);
  const lit = await front(page);
  expect(lit.litCount).toBe(3);
  expect(lit.sites.filter(({ lit: on }) => on).map(({ id }) => id))
    .toEqual(['relay-site-r2', 'relay-site-r3', 'relay-site-r4']);
  expect(lit.sites.find(({ id }) => id === 'relay-site-r1')!.lit).toBe(false);
  // Lighting is not the deadline: the latch stays shut until the third front actually arrives.
  expect(lit.objectiveMet).toBe(false);

  // (a, cont.) THE SCHEDULE. Nothing is muted until the first front is due, and it is due at 90s.
  await advance(page, lit.secondsToNextFront - 2);
  const beforeArrival = await front(page);
  expect(beforeArrival.phase).toBe('waiting');
  expect(beforeArrival.frontsArrived).toBe(0);
  expect(beforeArrival.mutedWorkSteps).toBe(0);

  await advance(page, 3);
  const crossing = await front(page);
  expect(crossing.phase).toBe('crossing');
  expect(crossing.frontsArrived).toBe(1);
  // West to east: one second into a 20s crossing the wall is still in the corridor's west third.
  expect(crossing.centerX).not.toBeNull();
  expect(crossing.centerX!).toBeLessThan(-30);

  // (b) THE MUTE IS A PLACE. Walk the wall across the map a second at a time and record which
  // sites it covered and in what order. r1 is the westmost site, r4 the eastmost.
  const covered: string[] = [];
  const hpDuringCrossing: number[] = [];
  for (let tick = 0; tick < 22; tick += 1) {
    await advance(page, 1);
    const sample = await front(page);
    for (const site of sample.sites) {
      if (site.muted && !covered.includes(site.id)) covered.push(site.id);
    }
    hpDuringCrossing.push(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.build.hp
      .reduce((total: number, entry: { hp: number }) => total + entry.hp, 0)));
  }
  expect(covered).toEqual(['relay-site-r1', 'relay-site-r2', 'relay-site-r3', 'relay-site-r4']);

  // (c) MUTED IS NEVER DAMAGED. Total works hp never moved while the wall stood over all four.
  expect(new Set(hpDuringCrossing).size).toBe(1);
  const passed = await front(page);
  expect(passed.phase).toBe('waiting');
  expect(passed.sites.every(({ muted }) => muted === false)).toBe(true);
  expect(passed.litCount).toBe(3);
  // The mechanic actually ran: covered works were counted off the air, step by step.
  expect(passed.mutedWorkSteps).toBeGreaterThan(0);
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.build.turrets
    + window.__THREE_GAME_DIAGNOSTICS__!.build.beacons)).toBe(3);

  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('a playbook refuses under the wall and works the moment it passes', async ({ page }) => {
  const errors = await open(page, DEBUG_URL);
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.contract.activeId)).toBe('e7-relay-rush');
  await page.evaluate(() => window.__GR_TEST__!.setManualSim(true));

  // THE CONTROL, and it is the load-bearing half: a refusal that fires everywhere is not a gate.
  // Between fronts the Exchange answers exactly as it does on any other map.
  const beforeFront = await page.evaluate(() => window.__GR_TEST__!.playbook.startRecording());
  expect(beforeFront.reason).not.toBe('interference-muted');
  await page.evaluate(() => window.__GR_TEST__!.playbook.stopRecording?.());

  // A LINKED PAIR INSIDE r2, so the drone gate has a real "yes" to lose. `droneCanOperate` reads
  // relay COVERAGE on this epoch, which is false everywhere until two towers link — so without
  // this the wall's effect on it would be invisible against a background of "no" (measured).
  const pair = await page.evaluate(() => [
    window.__GR_TEST__!.placeFree('turret', -27, 40),
    window.__GR_TEST__!.placeFree('turret', -23, 40),
  ]);
  expect(pair).toEqual([true, true]);
  await advance(page, 0.2);
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.e7Signal.links.length)).toBeGreaterThan(0);
  expect(await page.evaluate(() => window.__GR_TEST__!.e7Signal.droneCanOperate(-25, 40))).toBe(true);

  // Walk the wall onto the towers at x = -25, one half-second at a time.
  const opening = await front(page);
  await advance(page, opening.secondsToNextFront + 0.5);
  expect(await stepUntilCentreNear(page, -25)).toBe(true);
  // THE SAME PLACE, THE SAME TOWERS, A DIFFERENT ANSWER — purely because the wall moved.
  expect(await page.evaluate(() => window.__GR_TEST__!.e7Signal.droneCanOperate(-25, 40))).toBe(false);

  // Now walk it onto the claim at (0,12), which is where the playbook gate asks its question:
  // the refusal is keyed on the ACTOR's position, not on the map.
  expect(await stepUntilCentreNear(page, 0)).toBe(true);
  // A5's own refusal, in A4's exact shape and with its own kebab reason.
  const beforeRefusals = (await front(page)).refusals.playbooks;
  expect(await page.evaluate(() => window.__GR_TEST__!.playbook.startRecording()))
    .toMatchObject({ ok: false, reason: 'interference-muted' });
  expect(await page.evaluate(() => window.__GR_TEST__!.playbook.startReplay({ name: 'anything' })))
    .toMatchObject({ ok: false, reason: 'interference-muted' });
  // The towers behind the wall are back on the air; only what it covers is muted.
  expect(await page.evaluate(() => window.__GR_TEST__!.e7Signal.droneCanOperate(-25, 40))).toBe(true);
  // And the refusals were COUNTED, not merely returned — asserted as a DELTA rather than an
  // absolute, because the harness's own control calls above also pass through the same gate.
  const counted = await front(page);
  expect(counted.refusals.playbooks).toBeGreaterThan(beforeRefusals);

  // The wall passes and the Exchange comes back. Nothing about this refusal is permanent.
  await advance(page, 22);
  const after = await front(page);
  expect(after.phase).toBe('waiting');
  const afterFront = await page.evaluate(() => window.__GR_TEST__!.playbook.startRecording());
  expect(afterFront.reason).not.toBe('interference-muted');

  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

/** Advances the manual sim in half-seconds until the wall's centre stands over `x`. */
async function stepUntilCentreNear(page: Page, x: number): Promise<boolean> {
  for (let tick = 0; tick < 80; tick += 1) {
    const sample = await front(page);
    if (sample.centerX !== null && Math.abs(sample.centerX - x) <= 4) return true;
    await advance(page, 0.5);
  }
  return false;
}

/**
 * (e) Mistake #10 — where does the PLAYER see this, in a plain boot? The band is a scene object,
 * so the answer is "on the ground, when the wall is over it"; and the run carries the objective
 * without any harness at all.
 */
test('a plain boot fields the front and its objective without ?debug', async ({ page }) => {
  const problems: string[] = [];
  page.on('console', (message) => message.type() === 'error' && problems.push(message.text()));
  page.on('pageerror', (error) => problems.push(error.message));

  // THE PLAYER'S OWN ROUTE IN, staged exactly as the board stages it. Relay Rush is locked behind
  // `secured:e7-dead-band` and is not a `LIVE_SAGA_FLAGSHIP`, so a bare `?contract=` is refused
  // with `fallbackReason: 'debug-disabled'` (`ContractFamilies.ts:1322`). What opens it is a
  // player LAUNCH plus a scoreboard that satisfies the unlock — the A6 recipe, and the only
  // honest way to ask "where does the player see this" about a mid-ladder contract.
  await page.addInitScript(() => {
    sessionStorage.setItem('gr.contract.launch.v1', 'e7-relay-rush');
    localStorage.setItem('gr.activeEpoch.v1', 'epoch-7-signal');
    localStorage.setItem('gr.scores.v2', JSON.stringify([{
      waves: 20, kills: 1, gold: 1, timeAlive: 1, at: 1, secured: true, contractId: 'e7-dead-band',
    }]));
  });

  await page.goto('/?contract=e7-relay-rush');
  await expect(page.locator('canvas')).toBeVisible({ timeout: 30_000 });
  await expect
    .poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId), { timeout: 30_000 })
    .toBe('e7-relay-rush');
  // The briefing card the player actually reads names the map.
  await expect(page.getByTestId('contract-briefing-name')).toHaveText('Relay Rush', { timeout: 30_000 });

  // The objective is armed for a real player, not just under the harness.
  const armed = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.interferenceFront);
  expect(armed).toMatchObject({ declared: true, relayTarget: 3, deadlineFront: 3, objectiveMet: false });
  // The feature is live; the TEST SEAM is not. `__GR_TEST__` stays behind `?debug`.
  expect(await page.evaluate(() => window.__GR_TEST__ === undefined)).toBe(true);

  await page.waitForTimeout(4_000);
  expect(problems).toEqual([]);
});

/**
 * (d) THE LATCH AND ITS SAFETY CATCH, read straight off the consumer both engines share, plus the
 * placeholder's resolution. A front with no corridor to cross or no relay sites to light must NOT
 * arm — otherwise it would pin `objectiveAllowsSecure` false for a run that has nowhere to
 * discharge it, which is precisely the F-1471-1 casualty.
 */
test('the deadline latch arms only on a front that can be discharged', async () => {
  const vite: ViteDevServer = await createServer({
    root: process.cwd(), appType: 'custom', logLevel: 'silent', server: { middlewareMode: true },
  });
  try {
    const { InterferenceFrontSystem } = await vite.ssrLoadModule('/src/systems/InterferenceFrontSystem.ts');
    const corridor = [{ id: 'corridor', minX: -54, maxX: 54, minZ: -54, maxZ: 54 }];
    const sites = [
      { id: 'relay-site-r1', minX: -50, maxX: -40, minZ: 36, maxZ: 46 },
      { id: 'relay-site-r2', minX: -30, maxX: -20, minZ: 36, maxZ: 46 },
      { id: 'relay-site-r3', minX: 20, maxX: 30, minZ: 36, maxZ: 46 },
      { id: 'relay-site-r4', minX: 40, maxX: 50, minZ: 36, maxZ: 46 },
    ];
    const declaration = { description: 'a wall of static', relayTarget: 'N', visual: 'creeping-desaturation' };
    const make = (twist: unknown, tileParams: unknown) => InterferenceFrontSystem.create({ twist, tileParams });
    const work = (family: string, x: number, z: number) => ({ family, position: { x, z }, active: true, hp: 10 });
    /** 90 whole seconds of 1/30 steps, exactly as both engines feed it. */
    const run = (system: { update: (s: number, w: unknown[]) => void }, seconds: number, works: unknown[]) => {
      for (let step = 0; step < Math.round(seconds * 30); step += 1) system.update(1 / 30, works);
    };

    // Both halves declared: armed, and it withholds the secure until the deadline is met.
    const armed = make({ interferenceFront: declaration }, { interferenceFrontZones: corridor, buildZones: sites });
    expect(armed.isDeclared).toBe(true);
    // THE PLACEHOLDER, RESOLVED: `"N"` is not a number, so the sheet's ratified 3 stands in.
    expect(armed.relayTarget).toBe(3);
    expect(armed.objectiveAllowsSecure).toBe(false);

    // Front no. 1 arrives at 90s and the wall really moves west to east across the corridor.
    run(armed, 89, []);
    expect(armed.diagnostics.frontsArrived).toBe(0);
    run(armed, 2, []);
    expect(armed.diagnostics).toMatchObject({ frontsArrived: 1, phase: 'crossing' });
    const early = armed.diagnostics.centerX as number;
    run(armed, 8, []);
    expect(armed.diagnostics.centerX as number).toBeGreaterThan(early);
    // ...and clears the ground entirely inside its 20 seconds.
    run(armed, 12, []);
    expect(armed.diagnostics).toMatchObject({ phase: 'waiting', centerX: null, frontsCompleted: 1 });

    // THE DEADLINE, MET. Three lit sites standing when front no. 3 arrives closes the latch.
    const lit = [work('sentry_beacon', -25, 40), work('sentry_beacon', 25, 40), work('turret', 45, 40)];
    run(armed, 181, lit);
    expect(armed.diagnostics).toMatchObject({ frontsArrived: 3, deadlineResolved: true, litAtDeadline: 3, objectiveMet: true });
    expect(armed.objectiveAllowsSecure).toBe(true);
    // Latched: losing a relay afterwards does not retroactively lose the run.
    run(armed, 90, []);
    expect(armed.objectiveAllowsSecure).toBe(true);

    // THE DEADLINE, MISSED. Two lit sites is one short, and the miss is FINAL — the run cannot
    // secure at any later wave, which is what makes the schedule a deadline.
    const short = make({ interferenceFront: declaration }, { interferenceFrontZones: corridor, buildZones: sites });
    run(short, 271, [work('sentry_beacon', -25, 40), work('sentry_beacon', 25, 40)]);
    expect(short.diagnostics).toMatchObject({ deadlineResolved: true, litAtDeadline: 2, objectiveMet: false });
    run(short, 200, lit);
    expect(short.objectiveAllowsSecure).toBe(false);

    // A PALISADE IS NOT A RELAY. "Powered" is derived from the mute — only a kind the front can
    // switch off can light a site — so timber standing on the ground lights nothing.
    const timber = make({ interferenceFront: declaration }, { interferenceFrontZones: corridor, buildZones: sites });
    run(timber, 1, [work('palisade', -25, 40), work('palisade', 25, 40), work('palisade', 45, 40)]);
    expect(timber.diagnostics.litCount).toBe(0);
    // Neither does a wrecked beacon: lighting reads live state, not the build receipt.
    const wrecked = make({ interferenceFront: declaration }, { interferenceFrontZones: corridor, buildZones: sites });
    run(wrecked, 1, [{ family: 'sentry_beacon', position: { x: -25, z: 40 }, active: true, hp: 0 }]);
    expect(wrecked.diagnostics.litCount).toBe(0);

    // Front, no corridor: NOT armed, and the run is not held hostage to it.
    const noCorridor = make({ interferenceFront: declaration }, { interferenceFrontZones: [], buildZones: sites });
    expect(noCorridor.isDeclared).toBe(false);
    expect(noCorridor.objectiveAllowsSecure).toBe(true);

    // Front, no relay sites: likewise inert — a deadline no rider could ever discharge.
    const noSites = make({ interferenceFront: declaration }, { interferenceFrontZones: corridor, buildZones: [] });
    expect(noSites.isDeclared).toBe(false);
    expect(noSites.objectiveAllowsSecure).toBe(true);

    // Corridor and sites, no declaration: inert. Neither half means anything alone.
    const noTwist = make({}, { interferenceFrontZones: corridor, buildZones: sites });
    expect(noTwist.isDeclared).toBe(false);
    expect(noTwist.objectiveAllowsSecure).toBe(true);

    // And a contract that declares none of it is untouched — every other map in the saga.
    const none = make({}, {});
    expect(none.objectiveAllowsSecure).toBe(true);
    expect(none.muted(0, 0)).toBe(false);
    expect(none.refuse('playbooks', { x: 0, z: 0 })).toBe(false);

    // AN AUTHORED NUMERAL BEATS THE RATIFICATION, and is clamped to the sites that exist — the
    // sheet filled a hole, it did not seize the field.
    expect(make({ interferenceFront: { ...declaration, relayTarget: '2' } },
      { interferenceFrontZones: corridor, buildZones: sites }).relayTarget).toBe(2);
    expect(make({ interferenceFront: { ...declaration, relayTarget: '9' } },
      { interferenceFrontZones: corridor, buildZones: sites }).relayTarget).toBe(4);
  } finally {
    await vite.close();
  }
});
