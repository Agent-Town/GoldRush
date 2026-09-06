import { expect, test } from '@playwright/test';

/**
 * BOTH ENGINES, ONE SEED, ONE EVENT-LOG HASH, THREE MAPS AND A CONTROL
 * (`tasks/e8-remaining-maps.md` common laws).
 *
 * The arrangement is `e2e/e8-mare-claim-physics-parity.spec.ts`'s, unchanged, and its header
 * explains why: "both engines" is not browser-vs-headless as two DIFFERENT simulations. The
 * browser runs this very module (`src/replay/AgentTapeReplay.ts` imports `HeadlessContractSim`);
 * the two engines are the two RUNTIMES that execute it, node and chromium. It rides IN A WORKER
 * because a sim on the page thread meets the page's own live `RunManager` on the shared EventBus.
 *
 * THE CONTROL IS IN THIS FILE rather than beside it: `e8-mare-claim` rides here too, and its hash
 * must come back byte-identical to the value `reviews/e8-mare-claim-physics.md` pinned before this
 * slice existed. A divergence in the three new rows with the control still matching is about THIS
 * diff; a divergence in all four is about the harness.
 *
 * BOTH `location` BINDINGS ARE SET, and that is load-bearing: `ContractFamilies.ts` reads
 * `globalThis.location?.search` at one site and `window.location.search` at another, so a worker
 * that sets only `window` falls back to the DEFAULT contract and builds the wrong terrain
 * (F-E8MC-3, `artifacts/e8-mare-claim-physics/report.md`).
 */

// MEASURED IN NODE on this tree, 2026-09-05, idle policy, 400-decision bound. Hashes and
// outcomes: `artifacts/e8-remaining-maps/armed.json` (the control row also equals
// `artifacts/e8-remaining-maps/control.json`, taken from a detached worktree of main). The `air`
// rows below are the TERMINAL view, `artifacts/e8-remaining-maps/terminal-air.json`, because that
// is the turn this ride reports: an idle Prospector never leaves the hero, so where it idles
// decides whether the suit drains at all. That is itself the evidence the wall is live.
const RIDES = [
  {
    contract: 'e8-far-side',
    seed: 'e8-far-side-01',
    node: { eventLogHash: 'fnv1a32:5c30efd5', secured: false, waves: 2, timeMs: 79_400, kills: 30 },
    gravity: { feelG: 0.6, lobArcDistanceMultiplier: 2.4, movement: 'floaty', vacuum: true },
    // The Far Side's idle Prospector never leaves the landing yard, so it breathes the whole
    // ride and never reaches the crater: a full suit and an empty crossing.
    air: {
      wall: 'suit-only',
      suit: { seconds: 60, empty: false, drainedTotal: 0 },
      crossing: { zones: ['listening-probe-crater'], required: 1, reached: [], breathlessEntries: 0, complete: false },
    },
  },
  {
    contract: 'e8-low-orbit',
    seed: 'e8-low-orbit-01',
    node: { eventLogHash: 'fnv1a32:6e1931c2', secured: false, waves: 2, timeMs: 78_333, kills: 33 },
    gravity: { feelG: 0, lobArcDistanceMultiplier: 4.8, movement: 'free-fall', orbitalReturn: true, vacuum: true },
    // Low Orbit's claim sits ON the middle deck, so an idle ride banks that one deck for free
    // and neither of the two the spine has to be crossed for.
    air: {
      wall: 'suit-only',
      suit: { seconds: 60, empty: false, drainedTotal: 0 },
      crossing: {
        zones: ['west-scaffold-deck', 'claw-carcass-yard', 'east-scaffold-deck'],
        required: 3,
        reached: ['claw-carcass-yard'],
        breathlessEntries: 0,
        complete: false,
      },
    },
  },
  {
    contract: 'e8-eclipse',
    seed: 'e8-eclipse-01',
    node: { eventLogHash: 'fnv1a32:466507ac', secured: false, waves: 2, timeMs: 81_800, kills: 32 },
    gravity: { feelG: 0.6, lobArcDistanceMultiplier: 2.4, movement: 'floaty', vacuum: true },
    air: {
      wall: 'suit-timer',
      // The claim is outside every dome pad, so the idle floor suffocates exactly as the Mare
      // Claim's does: 60s of suit, all of it spent.
      suit: { seconds: 0, empty: true, drainedTotal: 60 },
      // The idle floor dies at wave 2 and the shadow is scheduled for wave 10, so an idle ride
      // must show it NOT arrived. `arrivedAtWave` stays null until it lands, because the contract
      // authors `firstRunWarning: false` and a countdown would be the warning it refuses to give.
      eclipse: { arrived: false, arrivedAtWave: null, reserve: 'dome-cluster-pad-center', solar: 'online' },
      regolith: { grounds: 6, required: 1, worked: [] },
    },
  },
  {
    // THE CONTROL. Pinned by `reviews/e8-mare-claim-physics.md` before this slice, and unmoved by
    // it: no `crossing` block, no `eclipse` block, the same hash.
    contract: 'e8-mare-claim',
    seed: 'e8-mare-claim-01',
    // RE-POINTED 2026-09-06 by `tasks/mare-claim-air-prevalent.md` (owner ruling: "no, this has
    // to be more prevalent"), from `fnv1a32:1a62757f` and `required: 1`. Every outcome field is
    // unmoved — the idle floor still loses at wave 2 with 32 kills — and only the hash moved,
    // because the Mare Claim's `atmosphere` block now carries the authored gate and the window.
    // The eclipse row above is DELIBERATELY untouched: it runs `E8SuitAirSystem`, which this
    // slice's firewall forbids changing, and its gate is still the shared default of one.
    node: { eventLogHash: 'fnv1a32:32f62335', secured: false, waves: 2, timeMs: 81_233, kills: 32 },
    gravity: { feelG: 0.6, lobArcDistanceMultiplier: 2.4, movement: 'floaty', vacuum: true },
    air: {
      wall: 'suit-timer',
      suit: { seconds: 0, empty: true, drainedTotal: 60 },
      regolith: { grounds: 6, required: 4, worked: [] },
    },
  },
] as const;

for (const ride of RIDES) {
  test(`${ride.contract} rides to the same event-log hash in the browser as in node`, async ({ page }) => {
    test.setTimeout(180_000);
    const errors: string[] = [];
    page.on('console', (message) => message.type() === 'error' && errors.push(message.text()));
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto('/');
    await page.waitForFunction(() => document.readyState === 'complete');

    const result = await page.evaluate(async ({ contract, seed }) => {
      const search = `?debug&contract=${contract}&seed=${seed}`;
      const source = `
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
    }, { contract: ride.contract, seed: ride.seed });

    expect(result.error ?? null).toBeNull();
    expect(result.terminal).toBe(true);
    expect(result.outcome).toEqual(ride.node);
    expect(result.gravity).toMatchObject(ride.gravity);
    expect(result.air).toMatchObject(ride.air);
    // The two blocks are CONTRACT-SCOPED: a map that declares no crossing must not grow one, and
    // only the Eclipse carries a shadow. Silence has to keep meaning "nothing out there".
    expect('crossing' in (result.air as Record<string, unknown>)).toBe('crossing' in ride.air);
    expect('eclipse' in (result.air as Record<string, unknown>)).toBe('eclipse' in ride.air);
    expect(errors).toEqual([]);
  });
}
