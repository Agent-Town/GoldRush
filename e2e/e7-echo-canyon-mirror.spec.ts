import { expect, test, type Page } from '@playwright/test';

/**
 * A3 — ECHO CANYON'S BROADCAST MIRROR (`specs/agent-play/door-completion-sheet.md:12`, RATIFIED
 * 2026-08-20). "Every playbook the player/agent USES this run is recorded; the NEXT wave fields
 * one corrupted copy per use."
 *
 * THIS IS WHERE THE MECHANIC IS PROVEN END TO END, and it has to be the browser: the headless
 * door declares no playbook verb (`src/agent/StandingOrders.ts`), so GR-SIM can prove the SPAWN
 * seam (`e2e/er01-e7-census.spec.ts` drives a real `WaveSystem` with a fed consumer) but can
 * never prove the RECORD half. Here both halves run in one run, against unmodified spawn balance:
 * play a tape back, advance to the next wave, and count the bodies that arrive because of it.
 *
 * It runs in BOTH viewport projects (desktop 1280x800 and mobile 390x844), so the admission also
 * answers Mistake #10 — where does the PLAYER see this? In plain enemies, on the map, on a phone.
 *
 * The CONTROL is the load-bearing half, as it was for A4: `e7-relay-valley` is the same epoch and
 * the same playbook system with no `twist.broadcastMirror`, and the identical tape use there
 * fields nothing at all. A mechanic that fires everywhere is not a contract gate.
 */

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };

/**
 * A SCRIPTED tape — `PlaybookRecorderSession` treats a script as the whole sample stream
 * ("scripted recordings replace the live sample entirely (deterministic e2e drive)",
 * `PlaybookSession.ts:110`), so the recorded habit is the same on every machine and in both
 * viewports. Movement only: it needs a SHAPE, not an economy.
 */
const HABIT = [
  { t: 0, mx: 1, my: 0, a: [] },
  { t: 3, mx: 0, my: 0, a: [] },
];

async function open(page: Page, contract: string): Promise<ErrorBucket> {
  const errors: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => message.type() === 'error' && errors.consoleErrors.push(message.text()));
  page.on('pageerror', (error) => errors.pageErrors.push(error.message));
  await page.goto(`/?debug&epoch=epoch-7-signal&contract=${contract}&nolevel&nopause&seed=e7-echo-canyon-mirror`);
  await page.waitForFunction(() => Boolean(window.__GR_TEST__ && window.__THREE_GAME_DIAGNOSTICS__));
  const briefing = page.getByTestId('contract-briefing');
  if (await briefing.isVisible()) await page.getByTestId('contract-briefing-dismiss').click();
  await page.evaluate(() => {
    window.__GR_TEST__!.setManualSim(true);
    // The subject is WHAT SPAWNS, not whether the hero survives 31 unarmed seconds of it. Spawn
    // balance — budgets, edges, the alive cap, the wave clock — is left exactly as shipped.
    window.__GR_TEST__!.setBalance('enemy.contactDamage', 0);
  });
  return errors;
}

/** Record the scripted habit and play it back. Returns the replay result verbatim. */
async function useTheHabit(page: Page, script: unknown): Promise<{ ok: boolean; reason?: string }> {
  return page.evaluate((entries) => {
    const game = window.__GR_TEST__!;
    const started = game.playbook.startRecording({ script: entries });
    if (!started.ok) return started;
    game.advanceSim(0.2);
    const tape = game.playbook.stopRecording('the habit');
    if (!tape.ok || !tape.text) return { ok: false, reason: 'recording-produced-no-tape' };
    return game.playbook.startReplay({ text: tape.text });
  }, script);
}

const mirrored = () => window.__THREE_GAME_DIAGNOSTICS__!.broadcastMirror;
const mirrorBodies = () => window.__GR_TEST__!.enemyPositions()
  .filter((enemy) => enemy.variantId === 'data_rustler_mirror');

test('a playbook used in Echo Canyon returns as a corrupted squad on the next wave', async ({ page }) => {
  const errors = await open(page, 'e7-echo-canyon');

  // The contract really RESOLVED — before A3 this same boot fell back to `the-claim`, so this one
  // line is the admission itself, asserted at both viewports.
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.contract.activeId)).toBe('e7-echo-canyon');

  // No habits yet, so no shadow. The ratified rule, stated before anything is used.
  expect(await page.evaluate(mirrored)).toMatchObject({
    declared: true,
    delay: 'next-wave',
    recordedUses: 0,
    pending: [],
    squadsFielded: 0,
    bodiesFielded: 0,
    lastFieldedWave: null,
    capPerWave: 3,
    hpPerRepeat: 0.1,
  });

  expect(await useTheHabit(page, HABIT)).toEqual({ ok: true });

  // ONE use, ONE mirror queued, and the shape read off the tape the rider actually played: it
  // moved and it built nothing, so the copy runs and comes for the gold.
  const queued = await page.evaluate(mirrored);
  expect(queued).toMatchObject({ recordedUses: 1, distinctPlaybooks: 1, maxRepeat: 0, squadsFielded: 0 });
  expect(queued!.pending).toEqual([
    { count: 2, wrecker: false, thief: true, roving: true, hunts: false, hpScale: 1, repeat: 0 },
  ]);
  // Nothing arrives EARLY: the delay the contract declares is "next-wave", and wave 1 is 30s out.
  expect(await page.evaluate(mirrorBodies)).toEqual([]);

  // Cross the wave-1 boundary at shipped cadence (`Balance.waves.waveInterval` = 30).
  await page.evaluate(() => window.__GR_TEST__!.advanceSim(31));

  const fielded = await page.evaluate(mirrored);
  expect(fielded).toMatchObject({
    recordedUses: 1,
    pending: [],
    squadsFielded: 1,
    bodiesFielded: 2,
    lastFieldedWave: 1,
    refusals: { cappedSquads: 0 },
  });

  // And they are really THERE — two bodies on the map, tinted, labelled, and thieves like the
  // roster entry they are a corrupted copy of.
  const bodies = await page.evaluate(mirrorBodies);
  expect(bodies).toHaveLength(2);
  for (const body of bodies) {
    expect(body.variantLabel).toBe('Mirrored Data-Rustler');
    expect(body.thief).toBe(true);
    expect(body.wrecker).toBe(false);
  }

  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('CONTROL — the Relay Valley, same epoch and same tape, casts no shadow', async ({ page }) => {
  const errors = await open(page, 'e7-relay-valley');
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.contract.activeId)).toBe('e7-relay-valley');
  // Absent, not merely empty: a contract that declares no mirror grows no row to read.
  expect(await page.evaluate(mirrored)).toBeNull();

  // The playbook system itself is ALIVE here — the tape records and replays exactly as it does in
  // the canyon, which is what makes the absence below a contract gate rather than a broken verb.
  expect(await useTheHabit(page, HABIT)).toEqual({ ok: true });
  await page.evaluate(() => window.__GR_TEST__!.advanceSim(31));

  expect(await page.evaluate(mirrored)).toBeNull();
  expect(await page.evaluate(mirrorBodies)).toEqual([]);
  // The wave really ran — otherwise the absence above would prove nothing at all.
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.wave)).toBeGreaterThanOrEqual(1);

  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});
