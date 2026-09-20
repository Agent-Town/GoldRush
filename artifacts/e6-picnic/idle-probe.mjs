#!/usr/bin/env node

/**
 * THE PICNIC IDLE PROBE — the Law-2 floor, measured through the `admissionProbe` seam.
 *
 * Why a probe and not `scripts/null-floor-anchors.mjs`: the floors regen only visits contracts
 * inside `supportedContractIds()`, and `e6-picnic` is outside it until its `harvestAnchors` are
 * authored. This probe measures the SAME thing on either side of that line, so the pre-anchor and
 * post-anchor idle terminals are directly comparable — which is the whole point of running it
 * before touching the contract at all (VERIFY-DON'T-INHERIT: the b4v3 review reports idle SECURING
 * at wave 20, `fnv1a32:b9f476a6`, and that claim is re-measured here rather than quoted).
 *
 * Orders submitted: NONE, ever. `--policy=idle` in the real floors driver means exactly this.
 *
 * Usage: node artifacts/e6-picnic/idle-probe.mjs [contractId] [--repeats N]
 * Prints one JSON row per (seed, repeat) on stdout.
 */

import { createServer } from 'vite';

const args = process.argv.slice(2);
const contractId = args.find((arg) => !arg.startsWith('--')) ?? 'e6-picnic';
const repeats = Number(valueOf('--repeats') ?? 2);
const noOrders = args.includes('--no-orders');
const seeds = [`${contractId}-01`, `${contractId}-02`];

/**
 * ⚠️ F-E6PA-2, AND IT IS THE WHOLE REASON THIS FILE CARRIES A WARNING. `src/world/Terrain.ts:78`
 * binds `ACTIVE_CONTRACT = activeContract()` AT MODULE LOAD, off `globalThis.location`'s search —
 * and the tile's size, water, fords, landmark blockers and `nodeAnchors` all derive from it. A probe
 * that sets only `?debug` therefore runs the requested contract's MANIFEST on **The Claim's
 * terrain**, silently, and reports a number that belongs to no map. `scripts/gr-sim.mjs:36-38` sets
 * `contract` and `seed` on the URL before any game module is imported; this probe must too, and the
 * seed is set per run below by reloading the module graph.
 */
const location = new URL('http://gr-sim.local/?debug');
location.searchParams.set('contract', contractId);
globalThis.location = location;
globalThis.window = { location };

const vite = await createServer({ root: process.cwd(), appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } });
const { HeadlessContractSim } = await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');

for (const seed of seeds) {
  for (let repeat = 1; repeat <= repeats; repeat += 1) {
    const sim = new HeadlessContractSim({ contractId, seed, admissionProbe: true });
    let turn = sim.currentTurn();
    let error;
    for (let turns = 0; !turn.terminal && turns < 400; turns += 1) {
      // F-E6PA-2: `--no-orders` mirrors `gr-sim --policy=idle` EXACTLY (`scripts/gr-sim.mjs:114`
      // never calls submitOrders in idle mode). Without the flag this probe submits an empty order
      // array each turn — which is NOT a no-op and produces a different run on the same seed.
      if (!noOrders) sim.submitOrders([]);
      try {
        turn = sim.advanceToTurn();
      } catch (cause) {
        error = cause.message;
        break;
      }
    }
    const outcome = turn.terminal ? sim.outcome() : null;
    // THE VIEW nests the hold under the epoch-6 socket (`HeadlessContractSim.ts:1485`), not at the
    // root. Reading it at the root returns `undefined` and would silently report "no stakes" on a
    // run where the hold is fully live — the F-2135-1 shape, so the path is cited, not guessed.
    const stakes = turn.view.now.atomic?.picnicHold ?? null;
    console.log(JSON.stringify({
      contractId,
      policy: 'idle',
      seed,
      repeat,
      terminal: turn.terminal,
      secured: outcome?.secured ?? false,
      waves: outcome?.waves ?? turn.view.now.wave,
      timeMs: outcome?.timeMs ?? null,
      gold: outcome?.gold ?? null,
      kills: outcome?.kills ?? null,
      // F-E6PA-2: the field that told the two instruments apart. `gr-sim --policy=idle` never calls
      // submitOrders, so its upgrade offers DEFAULT; this probe calls it with `[]` every turn.
      calls: outcome?.calls ?? null,
      defaultedPicks: outcome?.defaultedPicks ?? null,
      eventLogHash: outcome?.eventLogHash ?? null,
      heroDead: turn.view.now.hero?.hp <= 0,
      stakes: stakes ? stakes.map(({ id, claimed, contested, timer }) => ({ id, claimed, contested, timer: Number(timer.toFixed(2)) })) : null,
      error,
    }));
  }
}

await vite.close();

function valueOf(flag) {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] : undefined;
}
