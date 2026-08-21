import { expect, test, type Page } from '@playwright/test';

/**
 * A4 — THE DEAD BAND'S SIGNAL SUPPRESSION (`specs/agent-play/door-completion-sheet.md:14`,
 * RATIFIED 2026-08-20). Subtraction is the mechanic, so this spec proves three ABSENCES and
 * — the load-bearing half — proves them against a CONTROL contract on the same tile where the
 * same three things still work. A refusal that fires everywhere is not a contract gate.
 *
 * `e7-dead-band` and `e7-relay-valley` share `tileId: e7-relay-valley`, so the control differs
 * from the subject in exactly one thing: `twist.signalSuppression`.
 */

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };

async function open(page: Page, contract: string): Promise<ErrorBucket> {
  const errors: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => message.type() === 'error' && errors.consoleErrors.push(message.text()));
  page.on('pageerror', (error) => errors.pageErrors.push(error.message));
  await page.goto(`/?debug&epoch=epoch-7-signal&contract=${contract}&nowaves&nolevel&nopause&seed=e7-dead-band`);
  await page.waitForFunction(() => window.__THREE_GAME_DIAGNOSTICS__?.e7Signal.enabled === true);
  const briefing = page.getByTestId('contract-briefing');
  if (await briefing.isVisible()) await page.getByTestId('contract-briefing-dismiss').click();
  return errors;
}

/**
 * Two towers 6wu apart inside `dead-band-yard`: well inside `Balance.e7Signal.linkRange` (28),
 * on clear ground, and crossing none of the relay-valley mask's three fog pockets. On the
 * control contract this same GEOMETRY links (asserted through `graphFor`, which runs the same
 * `buildRelayGraph`); here it must not.
 */
const PAIR = [{ id: 'west', x: -3, z: 8 }, { id: 'east', x: 3, z: 8 }];

async function placePair(page: Page): Promise<void> {
  const placed = await page.evaluate(() => {
    const game = window.__GR_TEST__!;
    game.setManualSim(true);
    const results = [-3, 3].map((x) => game.placeFree('turret', x, 8));
    game.advanceSim(0.1);
    return results;
  });
  expect(placed).toEqual([true, true]);
}

test('the Dead Band refuses drones, playbooks and relay chains', async ({ page }) => {
  const errors = await open(page, 'e7-dead-band');

  // The contract really resolved — otherwise every assertion below would be about The Claim.
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.contract.activeId)).toBe('e7-dead-band');

  // (c) RELAY CHAINS never link, even from a pair that WOULD link on the control below.
  await placePair(page);
  const signal = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.e7Signal);
  expect(signal.relayChainsSuppressed).toBe(true);
  expect(signal.dronesSuppressed).toBe(true);
  expect(signal.links).toEqual([]);
  expect(signal.linkedCoverage).toBe(false);
  expect(signal.threatVisibilityBonus).toBe(false);
  // The probe must agree with the run: this exact geometry links on the control and not here.
  const probed = await page.evaluate((pair) => window.__GR_TEST__!.e7Signal.graphFor(pair), PAIR);
  expect(probed.links).toEqual([]);

  // (a) DRONES never operate — anywhere, including on top of the towers just placed.
  expect(await page.evaluate(() => window.__GR_TEST__!.e7Signal.droneCanOperate(0, 8))).toBe(false);
  expect(await page.evaluate(() => window.__GR_TEST__!.e7Signal.droneCanOperate(-3, 8))).toBe(false);

  // (b) PLAYBOOKS refuse on BOTH halves of "record/use", with the suppression's own reason.
  expect(await page.evaluate(() => window.__GR_TEST__!.playbook.startRecording()))
    .toEqual({ ok: false, reason: 'signal-suppressed' });
  expect(await page.evaluate(() => window.__GR_TEST__!.playbook.startReplay({ name: 'anything' })))
    .toEqual({ ok: false, reason: 'signal-suppressed' });
  expect(await page.evaluate(() => window.__GR_TEST__!.playbook.status())).toEqual({ recording: null, replay: null });

  // Mistake #10 — where does the PLAYER see this? On the jack-board, in words, unprompted.
  await expect(page.getByTestId('e7-signal-status')).toHaveText('DEAD BAND · NO RELAY, NO DRONE, NO PLAYBOOK');

  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('CONTROL — Relay Valley, same tile, keeps all three', async ({ page }) => {
  const errors = await open(page, 'e7-relay-valley');
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.contract.activeId)).toBe('e7-relay-valley');

  const signal = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.e7Signal);
  expect(signal.relayChainsSuppressed).toBe(false);
  expect(signal.dronesSuppressed).toBe(false);
  // The SAME geometry the subject refused. Placement is not repeated here: Relay Valley's own
  // build zones sit on the north ridge (z 36-46), so a free placement at z=8 would be testing
  // the placement rule rather than the link rule. `graphFor` runs the identical
  // `buildRelayGraph`, which is the thing under test.
  const probed = await page.evaluate((pair) => window.__GR_TEST__!.e7Signal.graphFor(pair), PAIR);
  expect(probed.links).toEqual([{ from: 'east', to: 'west' }]);
  // Coverage is a link-derived property, so with no towers standing it is still false here —
  // what matters is that a drone is not refused OUT OF HAND the way the Dead Band refuses it.
  expect(await page.evaluate(() => window.__GR_TEST__!.e7Signal.diagnostics().dronesSuppressed)).toBe(false);
  // Recording is ALLOWED here; stop it again so the run is left as it was found.
  expect(await page.evaluate(() => window.__GR_TEST__!.playbook.startRecording())).toEqual({ ok: true });
  await page.evaluate(() => window.__GR_TEST__!.playbook.stopRecording('control'));
  await page.evaluate(() => window.__GR_TEST__!.playbook.remove('control'));

  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});
