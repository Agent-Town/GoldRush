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
    // RE-POINTED 2026-09-06 by `tasks/e8-air-wall-all-maps.md` (owner ruling: "yes, same air for
    // all space contracts"), from `fnv1a32:5c30efd5` and `required: 1`. Every outcome field is
    // unmoved — the idle floor still loses at wave 2 with 30 kills — and the hash moved because
    // the crossing block grew its window fields and the contract now authors the gate.
    // RE-POINTED AGAIN 2026-09-07 (`tasks/e8-air-logical.md`, owner directive 2026-09-07) from `fnv1a32:22c47125`. Every outcome field is STILL
    // unmoved: this map drops its hero INSIDE `far-side-landing-yard`, the one rectangle it
    // pressurises, so an idle human here never suffocates and the hash moved only because the
    // suit row grew `harmPerSecond`, `harmDealt` and `harmTicks` and its `body` became 'hero'.
    node: { eventLogHash: 'fnv1a32:05ae6272', secured: false, waves: 2, timeMs: 79_400, kills: 30 },
    gravity: { feelG: 0.6, lobArcDistanceMultiplier: 2.4, movement: 'floaty', vacuum: true },
    // The Far Side's idle HERO never leaves the landing yard, so she breathes the whole ride and
    // never reaches the crater: a full suit, no charge, and an empty crossing.
    air: {
      wall: 'suit-only',
      suit: { body: 'hero', seconds: 60, empty: false, drainedTotal: 0, harmPerSecond: 5, harmDealt: 0, harmTicks: 0 },
      crossing: {
        zones: ['listening-probe-crater'],
        required: 4,
        reached: [],
        credited: 0,
        breathlessEntries: 0,
        windowWaves: 4,
        window: 0,
        creditedThisWindow: 0,
        windowHeldEntries: 0,
        complete: false,
      },
    },
  },
  {
    contract: 'e8-low-orbit',
    seed: 'e8-low-orbit-01',
    // RE-POINTED 2026-09-06 (`tasks/e8-air-wall-all-maps.md`), from `fnv1a32:6e1931c2` and
    // `required: 3`. Outcome fields unmoved; the hash moved for the same two reasons.
    // RE-POINTED AGAIN 2026-09-07 (`tasks/e8-air-logical.md`, owner directive 2026-09-07) from `fnv1a32:088a929c`, and this row moved for TWO
    // reasons where the others moved for one. Outcome fields still unmoved (the hero starts inside
    // the carcass yard, which is now the map's only pressurised ground), but the FREE CREDIT IS
    // GONE: the yard has left the crossing list, so an idle ride banks nothing at all. That is
    // F-EAWA-2's cure showing up in the fixture — a rectangle that holds air is not a crossing,
    // and this map's wall is an air budget now rather than a schedule an idle ride part-pays.
    node: { eventLogHash: 'fnv1a32:e6813da3', secured: false, waves: 2, timeMs: 78_333, kills: 33 },
    gravity: { feelG: 0, lobArcDistanceMultiplier: 4.8, movement: 'free-fall', orbitalReturn: true, vacuum: true },
    air: {
      wall: 'suit-only',
      suit: { body: 'hero', seconds: 60, empty: false, drainedTotal: 0, harmPerSecond: 5, harmDealt: 0, harmTicks: 0 },
      crossing: {
        zones: ['west-scaffold-deck', 'east-scaffold-deck'],
        required: 4,
        reached: [],
        credited: 0,
        breathlessEntries: 0,
        windowWaves: 4,
        window: 0,
        creditedThisWindow: 0,
        windowHeldEntries: 0,
        complete: false,
      },
    },
  },
  {
    contract: 'e8-eclipse',
    seed: 'e8-eclipse-01',
    // RE-POINTED 2026-09-06 (`tasks/e8-air-wall-all-maps.md`), from `fnv1a32:466507ac` and
    // `required: 1`. Outcome fields unmoved; the Eclipse now authors the Mare Claim's own gate.
    // RE-POINTED AGAIN 2026-09-07 (`tasks/e8-air-logical.md`, owner directive 2026-09-07) from `fnv1a32:121b0402` / 81 800 ms / 32 kills, and
    // this row's OUTCOME moved: the hero is dropped at (0, 12), six world units north of every
    // dome, so her suit empties at t = 60 s and she is charged 5 hp a second after it. She dies
    // five seconds sooner. Attribution measured both ways in
    // `artifacts/e8-air-logical/floor-attribution.json`: with `harmPerSecond` struck, every
    // outcome field returns to the value above and only the hash differs.
    node: { eventLogHash: 'fnv1a32:9568f50b', secured: false, waves: 2, timeMs: 76_733, kills: 30 },
    gravity: { feelG: 0.6, lobArcDistanceMultiplier: 2.4, movement: 'floaty', vacuum: true },
    air: {
      wall: 'suit-timer',
      // The hero is outside every dome pad, so the idle floor suffocates exactly as the Mare
      // Claim's does: 60s of suit, all of it spent, and then sixteen seconds of being charged.
      suit: { body: 'hero', seconds: 0, empty: true, drainedTotal: 60, harmPerSecond: 5, harmDealt: 80, harmTicks: 16 },
      // The idle floor dies at wave 2 and the shadow is scheduled for wave 10, so an idle ride
      // must show it NOT arrived. `arrivedAtWave` stays null until it lands, because the contract
      // authors `firstRunWarning: false` and a countdown would be the warning it refuses to give.
      eclipse: { arrived: false, arrivedAtWave: null, reserve: 'dome-cluster-pad-center', solar: 'online' },
      regolith: { grounds: 6, required: 4, worked: [], windowWaves: 4, window: 0, creditedThisWindow: 0, windowHeldPans: 0 },
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
    // The eclipse row above WAS deliberately untouched by that slice, whose firewall forbade
    // changing `E8SuitAirSystem`; `tasks/e8-air-wall-all-maps.md` (2026-09-06 evening) carried the
    // ruling to all three siblings, and this control row is what proves the shared-window refactor
    // it made left the Mare Claim byte-identical.
    // RE-POINTED AGAIN 2026-09-07 (`tasks/e8-air-logical.md`, owner directive 2026-09-07) from `fnv1a32:32f62335` / 81 233 ms / 32 kills. This
    // row is still the CONTROL for the shared code — the Mare Claim still rides byte-identically
    // with `E8SuitAirSystem` composed and with it gone — and the master said in advance that it
    // might move ("they may move if the hero now breathes; say so"). It does, for exactly the
    // reason the Eclipse's does: the same (0, 12) drop, six world units outside the same domes.
    node: { eventLogHash: 'fnv1a32:271eabbb', secured: false, waves: 2, timeMs: 76_033, kills: 30 },
    gravity: { feelG: 0.6, lobArcDistanceMultiplier: 2.4, movement: 'floaty', vacuum: true },
    air: {
      wall: 'suit-timer',
      suit: { body: 'hero', seconds: 0, empty: true, drainedTotal: 60, harmPerSecond: 5, harmDealt: 80, harmTicks: 16 },
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
