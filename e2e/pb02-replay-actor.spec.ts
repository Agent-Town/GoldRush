import { mkdir } from 'node:fs/promises';
import { expect, test, type Page } from '@playwright/test';

// PB-02 — THE REPLAY ACTOR (specs/playbook-core/README.md, slice PB-02).
// A second actor replays a recorded stream on the same tile+seed through the
// SAME systems (no privileged paths: CombatSystem stays the sole damage
// resolver, Economy the sole gold writer). GATE — THE EVENT-PARITY PROOF:
// the replayed actor's semantic outcomes (kills, gold, builds, positions at
// probe ticks — normalized per the determinism audit's boundary) match the
// recording session's.

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };

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
  await expect(page.locator('#game-canvas')).toBeVisible();
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  return errors;
}

// Identical world prep for both sessions — mirrors the determinism audit's
// bounded scenario (manual stepping, clean same-seed reset, capped probe load).
async function prepDeterministicRun(page: Page): Promise<void> {
  await page.evaluate(() => window.__GR_TEST__?.setManualSim(true));
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))),
  );
  await page.evaluate(() => window.__GR_TEST__?.resetRun());
  await page.evaluate(() => window.__GR_TEST__?.setManualSim(true));
  await expect(page.evaluate(() => window.__GR_TEST__?.setBalance('enemy.contactDamage', 0))).resolves.toBe(true);
  await expect(page.evaluate(() => window.__GR_TEST__?.setBalance('waves.aliveCap', 12))).resolves.toBe(true);
  await page.evaluate(() => window.__GR_TEST__?.grantGold(400));
}

// The demonstrated job: a patrol circuit plus two builds — kills flow from the
// spark rig (CombatSystem), gold from Economy grants/spends, builds through
// BuildSystem. Movement uses only sim-space direction intents.
function jobScript(hx: number, hz: number) {
  const q3 = (value: number) => Math.round(value * 1000) / 1000;
  return [
    { t: 0, mx: 1, my: 0, a: [] },
    { t: 45, mx: 0, my: 1, a: [] },
    { t: 90, mx: -1, my: 0, a: [] },
    { t: 135, mx: 0, my: -1, a: [] },
    {
      t: 180,
      mx: 0,
      my: 0,
      a: [{ type: 'place_build', id: 'palisade', position: { x: q3(hx + 3), z: q3(hz) }, rotationSteps: 0 }],
    },
    {
      t: 240,
      mx: 0,
      my: 0,
      a: [{ type: 'place_build', id: 'palisade', position: { x: q3(hx + 3), z: q3(hz + 2) }, rotationSteps: 1 }],
    },
    { t: 300, mx: 0.5, my: -0.5, a: [] },
    { t: 420, mx: -0.5, my: 0.5, a: [] },
    { t: 540, mx: 0, my: 0, a: [] },
  ];
}

const PARITY_QUERY = '?debug&nolevel&seed=pb02-parity';
const PARITY_SECONDS = 45;

test.describe('PB-02 replay actor', () => {
  test('event parity — a second actor reproduces the recorded session', async ({ page }, testInfo) => {
    test.setTimeout(240_000);

    // SESSION R — record the demonstration.
    const errors = await openGame(page, PARITY_QUERY);
    await prepDeterministicRun(page);
    const hero = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.heroPos);
    const script = jobScript(hero.x, hero.z);
    const started = await page.evaluate((entries) => window.__GR_TEST__!.playbook.startRecording({ script: entries }), script);
    expect(started.ok).toBe(true);
    await page.evaluate((s) => window.__GR_TEST__?.advanceSim(s), PARITY_SECONDS);
    const recorded = await page.evaluate(() => window.__GR_TEST__!.playbook.stopRecording('pb02-tape'));
    expect(recorded.ok).toBe(true);
    expect(recorded.truncated).toBeNull();
    expect(recorded.saved).toBe(true);
    const outcomeR = await page.evaluate(() => window.__GR_TEST__!.playbook.outcome());

    // The demonstration must have produced real semantics to make parity
    // meaningful: combat kills and Economy-routed builds.
    expect(outcomeR.kills).toBeGreaterThan(0);
    expect(outcomeR.economy.buildingsBuilt).toBeGreaterThanOrEqual(2);
    expect(outcomeR.probes.length).toBeGreaterThanOrEqual(Math.floor((PARITY_SECONDS * 30) / 30));

    // SESSION P — fresh boot, same tile+seed; the tape drives a second actor.
    await openGame(page, PARITY_QUERY);
    await prepDeterministicRun(page);
    const replayStarted = await page.evaluate(() =>
      window.__GR_TEST__!.playbook.startReplay({ name: 'pb02-tape', hidePlayer: true }),
    );
    expect(replayStarted.ok).toBe(true);
    await page.evaluate((s) => window.__GR_TEST__?.advanceSim(s), PARITY_SECONDS);
    const replayStatus = await page.evaluate(() => window.__GR_TEST__!.playbook.status());
    expect(replayStatus.replay?.complete).toBe(true);
    expect(replayStatus.replay?.skippedActions).toEqual([]);
    expect(replayStatus.replay?.appliedActions).toBeGreaterThanOrEqual(2);
    const outcomeP = await page.evaluate(() => window.__GR_TEST__!.playbook.outcome());
    await mkdir('artifacts/pb02', { recursive: true });
    await page.screenshot({ path: `artifacts/pb02/${testInfo.project.name}-replay.png` });

    // THE EVENT-PARITY PROOF — normalized semantic outcomes match exactly.
    expect(outcomeP.probes).toEqual(outcomeR.probes);
    expect(outcomeP.kills).toBe(outcomeR.kills);
    expect(outcomeP.gold).toBe(outcomeR.gold);
    expect(outcomeP.wave).toBe(outcomeR.wave);
    expect(outcomeP.economy).toEqual(outcomeR.economy);
    expect(JSON.stringify(outcomeP)).toBe(JSON.stringify(outcomeR));

    // Same tile+seed law: a different seed refuses the tape.
    await openGame(page, '?debug&nolevel&seed=pb02-other');
    await page.evaluate(() => window.__GR_TEST__?.resetRun());
    const mismatch = await page.evaluate(() => window.__GR_TEST__!.playbook.startReplay({ name: 'pb02-tape' }));
    expect(mismatch.ok).toBe(false);
    expect(mismatch.reason).toBe('seed-mismatch');

    expect(errors.consoleErrors).toEqual([]);
    expect(errors.pageErrors).toEqual([]);
  });

  test('replay is debug-gated and validates its tape', async ({ page }) => {
    const errors = await openGame(page, '?debug&nolevel&seed=pb02-validate');
    await page.evaluate(() => window.__GR_TEST__?.resetRun());
    const missing = await page.evaluate(() => window.__GR_TEST__!.playbook.startReplay({ name: 'no-such-tape' }));
    expect(missing.ok).toBe(false);
    expect(missing.reason).toBe('not-found');
    const invalid = await page.evaluate(() =>
      window.__GR_TEST__!.playbook.startReplay({ text: '{"version":99}' }),
    );
    expect(invalid.ok).toBe(false);
    expect(invalid.reason).toBe('unsupported-version');
    expect(errors.consoleErrors).toEqual([]);
    expect(errors.pageErrors).toEqual([]);
  });
});
