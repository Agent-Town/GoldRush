import { expect, test } from '@playwright/test';

/**
 * BOTH ENGINES, ONE SEED, ONE EVENT-LOG HASH (`tasks/e8-mare-claim-physics.md` §1).
 *
 * "Both engines" is not browser-vs-headless as two DIFFERENT simulations: the browser runs this
 * very module too — `src/replay/AgentTapeReplay.ts` imports `HeadlessContractSim` and the browser
 * replays every agent tape through it. The two engines are the two RUNTIMES that execute it: node
 * (the door, `scripts/gr-sim.mjs`) and chromium (the page). The browser's OTHER hash,
 * `runTapeEventLogHash` (`src/game/RunTape.ts:278`), hashes a human tape's probe log — a different
 * function over a different log, which can never equal the sim's; the honest cross-engine claim is
 * the one this file makes.
 *
 * IN A WORKER, and not on the page's own thread — the app's own arrangement
 * (`src/replay/BrowserAgentTapeHarness.ts:15` boots `BrowserAgentTapeWorker.ts` for exactly this).
 * MEASURED here first: run the sim on the page thread and the page's live `RunManager`, subscribed
 * to the shared EventBus, answers THIS sim's `wave_started` by trying to snapshot ITS OWN absent
 * run — `SyntaxError: "undefined" is not valid JSON` out of `RunSuspend`'s deep clone. One engine
 * per thread.
 *
 * THE CONTROL, run before believing any of this (`artifacts/e8-mare-claim-physics/parity-control-probe.spec.ts.txt`):
 * `the-claim` hashes identically in both runtimes on this tree, so the harness itself is sound and
 * a divergence here would be about THIS contract.
 */

const CONTRACT = 'e8-mare-claim';
const SEED = 'e8-mare-claim-01';
// Measured in node on this tree (`scripts/e8-mare-claim-physics.test.mjs`; the idle ride of
// `artifacts/e8-mare-claim-physics/mare-claim.log`).
//
// RE-POINTED 2026-09-06 by `tasks/mare-claim-air-prevalent.md` (owner ruling: "no, this has to be
// more prevalent"), from `fnv1a32:1a62757f`. The idle ride is UNCHANGED in every outcome field —
// still lost, still wave 2, still 81 233 ms, still 32 kills — and only its hash moved, because
// `atmosphere.diagnostics` rides `eventLogHash` and that block gained the authored gate (1 -> 4)
// and the four window fields. Attribution measured both halves separately:
// `artifacts/mare-claim-air-prevalent/floor-attribution.json` (fields alone -> `fnv1a32:4d17c659`,
// fields plus numbers -> the value below). The same two rows moved in
// `assets/contracts/null-floors.json` and nowhere else.
const NODE = {
  eventLogHash: 'fnv1a32:32f62335',
  secured: false,
  waves: 2,
  timeMs: 81_233,
  kills: 32,
};

test('the Mare Claim rides to the same event-log hash in the browser as in node', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (message) => message.type() === 'error' && errors.push(message.text()));
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await page.waitForFunction(() => document.readyState === 'complete');

  const ride = await page.evaluate(async ({ contract, seed }) => {
    const search = `?debug&contract=${contract}&seed=${seed}`;
    const source = `
      // BOTH bindings, and that is load-bearing. \`ContractFamilies.ts:2382\` reads
      // \`globalThis.location?.search\` while \`:2416\` reads \`window.location.search\`; a worker's own
      // \`globalThis.location\` is the script URL and carries NO search, so setting only \`window\`
      // (what \`src/replay/BrowserAgentTapeWorker.ts:15\` does) leaves the contract read falling back
      // to the DEFAULT contract. MEASURED: with \`window\` alone this ride built the-claim's terrain
      // (Terrain.bounds +/-32 instead of the Mare Claim's +/-64, sample(0,0).speedMul 0.85 vs 1)
      // and hashed fnv1a32:d0e71d2a — a harness artefact that would have read as an engine
      // divergence. See F-E8MC-3 in artifacts/e8-mare-claim-physics/report.md.
      const rideLocation = new URL('http://gr-sim.local/' + ${JSON.stringify(search)});
      Object.defineProperty(globalThis, 'location', { value: rideLocation, configurable: true, writable: true });
      Object.assign(globalThis, { window: { location: rideLocation } });
      self.onmessage = async () => {
        try {
          const { HeadlessContractSim } = await import(${JSON.stringify(`${location.origin}/src/sim/HeadlessContractSim.ts`)});
          const sim = new HeadlessContractSim({ contractId: ${JSON.stringify(contract)}, seed: ${JSON.stringify(seed)} });
          let turn = sim.currentTurn();
          for (let decisions = 0; decisions < 400 && !turn.terminal; decisions += 1) turn = sim.advanceToTurn();
          const outcome = sim.outcome();
          self.postMessage({
            terminal: turn.terminal,
            outcome: {
              eventLogHash: outcome.eventLogHash,
              secured: outcome.secured,
              waves: outcome.waves,
              timeMs: outcome.timeMs,
              kills: outcome.kills,
            },
            air: turn.view.now.air ?? null,
            gravity: turn.view.now.gravity ?? null,
          });
        } catch (error) {
          self.postMessage({ error: String((error && error.stack) || error) });
        }
      };
    `;
    const worker = new Worker(URL.createObjectURL(new Blob([source], { type: 'text/javascript' })), { type: 'module' });
    try {
      return await new Promise<Record<string, unknown>>((resolve, reject) => {
        worker.onmessage = ({ data }) => resolve(data);
        worker.onerror = ({ message }) => reject(new Error(message));
        worker.postMessage('ride');
      });
    } finally {
      worker.terminate();
    }
  }, { contract: CONTRACT, seed: SEED });

  expect(ride.error ?? null).toBeNull();
  expect(ride.terminal).toBe(true);
  expect(ride.outcome).toEqual(NODE);
  // The era, as the browser runtime sees it: 0.6g, 2.4x arcs, and a suit that empties outside the
  // domes on a ride that never goes back inside.
  expect(ride.gravity).toMatchObject({ feelG: 0.6, lobArcDistanceMultiplier: 2.4, movement: 'floaty', vacuum: true });
  // `required` re-pointed 1 -> 4 with the hash above: the gate is now authored per contract as
  // `twist.atmosphere.regolithRequired`. `worked` stays empty because an idle ride pans nothing.
  expect(ride.air).toMatchObject({ suit: { drainedTotal: 60, empty: true }, regolith: { grounds: 6, required: 4, worked: [] } });
  expect(errors).toEqual([]);
});
