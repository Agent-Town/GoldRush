import { expect, test, type Page } from '@playwright/test';
import { createServer, type ViteDevServer } from 'vite';

/**
 * A6 — THE CROSSING AND THE PROBE (`specs/agent-play/door-completion-sheet.md:18`,
 * RATIFIED 2026-08-20).
 *
 * Four things are under test, and the third is the one that keeps the mechanic honest:
 *   (a) the probe is a PLACE, not a flag — recovery refuses everywhere except the crater;
 *   (b) the playback is ONE-TIME and carries the E7 jack-board's own banked line;
 *   (c) the objective LATCH — a contract that declares a probe cannot secure until it is out,
 *       and `ProbeRecovery` does NOT arm on a trigger with no crater to stand in (F-1471-1:
 *       a declaration with no completion path once pinned a run unsecurable forever);
 *   (d) Mistake #10 — where the PLAYER sees it, in a plain boot with no `?debug`.
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

const DEBUG_URL = '/?debug&epoch=epoch-8-orbital&contract=e8-far-side&nowaves&nolevel&nopause&seed=e8-far-side-01';
/** `tileParams.probeRecoveryZones[0]` is x -14..14, z 38..52; the stake sits at (0,-36). */
const CRATER = { x: 0, z: 45 };

test('the Far Side probe is a place, and its playback fires once', async ({ page }) => {
  const errors = await open(page, DEBUG_URL);
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.contract.activeId)).toBe('e8-far-side');

  // The contract armed BOTH halves, so the objective is real.
  const armed = await page.evaluate(() => window.__GR_TEST__!.probe.diagnostics());
  expect(armed).toMatchObject({
    declared: true,
    trigger: 'probe-recovered',
    zones: ['listening-probe-crater'],
    recovered: false,
    playbackCount: 0,
  });

  // (a) A PLACE, NOT A FLAG. The landing yard is 80wu south of the crater and refuses.
  expect(await page.evaluate(() => window.__GR_TEST__!.probe.inReach(0, -36))).toBe(false);
  expect(await page.evaluate(() => window.__GR_TEST__!.probe.inReach(0, 45))).toBe(true);
  expect(await page.evaluate(() => window.__GR_TEST__!.probe.recover())).toBe(false);
  expect(await page.evaluate(() => window.__GR_TEST__!.probe.diagnostics().refusals.outOfReach)).toBe(1);
  expect(await page.evaluate(() => window.__GR_TEST__!.probe.diagnostics().recovered)).toBe(false);

  // Walk the crossing, then lift it.
  await page.evaluate((at) => window.__GR_TEST__!.teleport(at.x, at.z), CRATER);
  expect(await page.evaluate(() => window.__GR_TEST__!.probe.recover())).toBe(true);

  // (b) ONE-TIME, and the payload is the jack-board's own banked wrong-number hello.
  const after = await page.evaluate(() => window.__GR_TEST__!.probe.diagnostics());
  expect(after).toMatchObject({
    recovered: true,
    recoveredZoneId: 'listening-probe-crater',
    playbackCount: 1,
    playedFragment: 'First tower up. A wrong number answered, confused and kind. The line stays open.',
  });
  // A second press cannot replay it, and the refusal is counted rather than silent.
  expect(await page.evaluate(() => window.__GR_TEST__!.probe.recover())).toBe(false);
  expect(await page.evaluate(() => window.__GR_TEST__!.probe.diagnostics())).toMatchObject({
    playbackCount: 1,
    refusals: { outOfReach: 1, alreadyRecovered: 1 },
  });

  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

/**
 * (d) MISTAKE #10 — where does the PLAYER see this, in a plain boot?
 *
 * NO `?debug` anywhere below. `e8-far-side` is not a `LIVE_SAGA_FLAGSHIPS` entry
 * (`ContractFamilies.ts:837`), so a bare `?contract=` would fall back to The Claim; the board's
 * real route is a session launch key plus `?contract=` (`ContractFamilies.ts:1233`). Its row is
 * `unlock: "secured:e8-mare-claim"`, and the Mare Claim is itself admitted and playable — so
 * unlike the Dead Band (F-E7DB-2), a browser player CAN reach the Far Side by ordinary play.
 * That is seeded here through the game's own keys rather than asserted.
 */
test('PLAIN BOOT — a player reaches the Far Side and the probe is live for them', async ({ page }) => {
  test.setTimeout(90_000);
  const problems: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error' || message.type() === 'warning') problems.push(`${message.type()}: ${message.text()}`);
  });
  page.on('pageerror', (error) => problems.push(`pageerror: ${error.message}`));

  await page.addInitScript(() => {
    sessionStorage.setItem('gr.contract.launch.v1', 'e8-far-side');
    localStorage.setItem('gr.activeEpoch.v1', 'epoch-8-orbital');
    localStorage.setItem('gr.scores.v2', JSON.stringify([{
      waves: 20, kills: 1, gold: 1, timeAlive: 1, at: 1, secured: true, contractId: 'e8-mare-claim',
    }]));
  });

  await page.goto('/?contract=e8-far-side');
  await expect(page.locator('canvas')).toBeVisible({ timeout: 30_000 });
  await expect
    .poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId), { timeout: 30_000 })
    .toBe('e8-far-side');
  // The briefing card the player actually reads names the map.
  await expect(page.getByTestId('contract-briefing-name')).toHaveText('The Far Side', { timeout: 30_000 });

  // The objective is armed for a real player, not just under the harness.
  const probe = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.probeRecovery);
  expect(probe).toMatchObject({ declared: true, recovered: false, playbackCount: 0 });
  // The feature is live; the TEST SEAM is not. `__GR_TEST__` stays behind `?debug`.
  expect(await page.evaluate(() => window.__GR_TEST__ === undefined)).toBe(true);

  await page.waitForTimeout(4_000);
  expect(problems).toEqual([]);
});

/**
 * (c) THE LATCH AND ITS SAFETY CATCH, read straight off the consumer both engines share. A
 * trigger with no crater must NOT arm — otherwise it would pin `objectiveAllowsSecure` false
 * for a run that has nowhere to discharge it, which is precisely the F-1471-1 casualty.
 */
test('the objective latch arms only when a crater exists to stand in', async () => {
  const vite: ViteDevServer = await createServer({
    root: process.cwd(), appType: 'custom', logLevel: 'silent', server: { middlewareMode: true },
  });
  try {
    const { ProbeRecovery } = await vite.ssrLoadModule('/src/systems/ProbeRecovery.ts');
    const zone = { id: 'crater', minX: -14, maxX: 14, minZ: 38, maxZ: 52 };
    const playback = { description: 'x', trigger: 'probe-recovered' as const };

    // Both halves declared: armed, and it withholds the secure until recovery.
    const armed = ProbeRecovery.create({ twist: { probePlayback: playback }, tileParams: { probeRecoveryZones: [zone] } });
    expect(armed.declared).toBe(true);
    expect(armed.objectiveAllowsSecure).toBe(false);
    expect(armed.recover({ x: 0, z: 45 }).ok).toBe(true);
    expect(armed.objectiveAllowsSecure).toBe(true);

    // Trigger, no crater: NOT armed, and the run is not held hostage to it.
    const noCrater = ProbeRecovery.create({ twist: { probePlayback: playback }, tileParams: { probeRecoveryZones: [] } });
    expect(noCrater.declared).toBe(false);
    expect(noCrater.objectiveAllowsSecure).toBe(true);

    // Crater, no trigger: likewise inert. Neither half means anything alone.
    const noTrigger = ProbeRecovery.create({ twist: {}, tileParams: { probeRecoveryZones: [zone] } });
    expect(noTrigger.declared).toBe(false);
    expect(noTrigger.objectiveAllowsSecure).toBe(true);

    // And a contract that declares neither is untouched — every other map in the saga.
    expect(ProbeRecovery.create({ twist: {}, tileParams: {} }).objectiveAllowsSecure).toBe(true);
  } finally {
    await vite.close();
  }
});
