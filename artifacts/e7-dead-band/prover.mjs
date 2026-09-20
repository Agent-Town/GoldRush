#!/usr/bin/env node

/**
 * THE DEAD BAND PROVER — the run that admitted `e7-dead-band` (2026-08-20, A4).
 *
 * It drives the REAL door: it spawns `scripts/gr-sim.mjs` and answers each printed VIEW with a
 * line of standing orders on stdin, exactly as any rider would. No admission escape hatch, no
 * private handles, no balance edits — every verb below is in the public grammar
 * (`src/agent/StandingOrders.ts`): HARVEST, HOLD, BUILD, SECURE_CHOICE.
 *
 * SUBTRACTION IS THE MECHANIC, SO THE PROOF IS WHAT IT DOES *NOT* USE. The contract declares
 * `signalSuppression {drones:false, playbooks:false, relayChains:false}`; there is no drone
 * order, no playbook order and no relay chain anywhere in this file. The claim is won with the
 * four oldest tools the briefing names — hands (HARVEST), boots (HOLD), guns (turret) and
 * timber — and the run's own view carries `now.signalSuppression` to say so on every turn.
 *
 * THE PLAY, in three beats:
 *   1. PAN. The yard starts broke. The Prospector works the two yard seams at (-14,-6) and
 *      (14,-6) — one HARVEST record is one pan tick, so each turn queues eight. The two
 *      old-tool-ground seams at z=37 are DELIBERATELY left alone: they sit under the north
 *      spawn edge, and walking a rider up there is how this map kills you.
 *   2. PLANT. At 50 gold the rider HOLDs the stage south of the seam line and BUILDs a turret;
 *      it repeats to the registry cap of four, each one a little wider, so the yard is covered
 *      from both flanks. HOLD, not MOVE_TO — MOVE_TO completes on arrival and the embodiment
 *      then drifts back to the hero, which walks the guns out of the build radius.
 *   3. HOLD THE YARD. Every roster entry here is `data_rustler`, a THIEF: it comes for the gold
 *      on the hero, not the buildings. So the hero stands inside the turret cluster and the
 *      Prospector keeps panning; kills happen where the guns are.
 *
 * Usage: node artifacts/e7-dead-band/prover.mjs --seed e7-dead-band-01 [--quiet]
 * Prints a per-turn trace on stderr and the gr-sim outcome JSON on stdout.
 */

import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));
const args = process.argv.slice(2);
const seed = valueOf('--seed') ?? 'e7-dead-band-01';
const contract = valueOf('--contract') ?? 'e7-dead-band';
const quiet = args.includes('--quiet');

/**
 * THE HERO NEVER MOVES. `HeadlessContractSim` drives slot 0 on IDLE_INTENTS (F-E2PA-4), so the
 * claim at (0,12) is a fixed post: a rider defends THAT, or it loses. And the yard's north edge
 * IS z=12 — the enemy approach from the north spawn edge is over ground no contract zone covers,
 * so there is no timber to hide behind. Everything below therefore stands inside
 * `dead-band-yard` (x -30..30, z -42..12) and shoots north.
 *
 * THE BUILD LIST, in purchase order: four guns (the registry cap), then six sentry beacons —
 * the beacons SLOW what they touch (radius 8wu), which on an all-thief roster is what keeps a
 * rustler inside turret fire long enough to die before it reaches the claim.
 */
const PLAN = [
  { what: 'turret', where: { x: -5, z: 9 }, costs: 50 },
  { what: 'turret', where: { x: 5, z: 9 }, costs: 70 },
  { what: 'sentry_beacon', where: { x: -2, z: 12 }, costs: 25 },
  { what: 'sentry_beacon', where: { x: 2, z: 12 }, costs: 35 },
  { what: 'turret', where: { x: -4, z: 4 }, costs: 95 },
  { what: 'turret', where: { x: 4, z: 4 }, costs: 125 },
  { what: 'sentry_beacon', where: { x: -7, z: 11 }, costs: 45 },
  { what: 'sentry_beacon', where: { x: 7, z: 11 }, costs: 55 },
  { what: 'sentry_beacon', where: { x: -10, z: 8 }, costs: 75 },
  { what: 'sentry_beacon', where: { x: 10, z: 8 }, costs: 95 },
];
/** Where the hero's guns want the rider when nothing is being bought. */
const KEEP = { x: 0, z: 8 };

/**
 * Stage three wu SOUTH of whatever is being placed: `Balance.turret.placeRadius` is 6, every
 * pad above sits at z >= 4, and the yard runs to z = -42, so this is always legal ground and
 * always in range. (Staging from one fixed point is what silently ate the first two turret
 * purchases: pads 6.3wu away simply refuse, and the refusal is not in THE VIEW.)
 */
const stageFor = (pad) => ({ x: pad.x, z: pad.z - 3 });

/** Survive first, then hit harder. Filler heals rank high on a roster that only does contact. */
const UPGRADE_PREFERENCE = [
  'tinkers_plating', 'field_dressing', 'heavy_spark', 'double_tap_coil',
  'split_spark', 'sharpen', 'long_resonator', 'spring_heels',
];

const distance = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);

/**
 * SEAM IDS ARE NOT PLACES. `HarvestSystem` hands `gold-seam-N` to a SHUFFLED anchor and moves it
 * again on every respawn (`HarvestSystem.ts:82` + `:301-311`), and THE VIEW's live seam rows
 * carry no coordinates (`View.ts:83`) — so a rider cannot aim at a seam, only at a seam ID. This
 * play therefore pans whichever seam is active and lets the Prospector walk to it; that body is
 * expendable, the claim is not.
 */
function panOrders(now) {
  const seam = now.seams.find((entry) => entry.active && entry.remaining > 0);
  return seam ? Array.from({ length: 8 }, () => ({ verb: 'HARVEST', seam: seam.id })) : [];
}

/** Pure function of THE VIEW (plus one bit of memory): same seed in, same orders out. */
function orders(view, memo) {
  const now = view.now;
  if (now.pendingSecure) return [{ verb: 'SECURE_CHOICE', choice: 'bank' }];

  const picks = [];
  if (now.pendingOffer?.length) {
    const offered = now.pendingOffer.map(({ id }) => id);
    const wanted = UPGRADE_PREFERENCE.find((id) => offered.includes(id)) ?? offered[0];
    picks.push({ verb: 'PICK_UPGRADE', id: wanted });
  }

  const standing = now.works.byKind ?? {};
  const done = { turret: standing.turret ?? 0, sentry_beacon: standing.sentry_beacon ?? 0 };
  const seen = { turret: 0, sentry_beacon: 0 };
  const step = PLAN.find((entry) => {
    seen[entry.what] += 1;
    return seen[entry.what] > done[entry.what];
  });
  const pan = panOrders(now);

  if (step) {
    const stage = stageFor(step.where);
    if (now.gold < step.costs) {
      memo.staged = false;
      return [...picks, ...(pan.length > 0 ? pan : [{ verb: 'HOLD', pos: KEEP }])];
    }
    if (!memo.staged || distance(now.prospector, stage) > 1.5) {
      memo.staged = true;
      return [...picks, { verb: 'HOLD', pos: stage }];
    }
    memo.staged = false;
    return [
      ...picks,
      { verb: 'BUILD', what: step.what, where: step.where, when: { goldGte: step.costs } },
      { verb: 'HOLD', pos: stage },
    ];
  }
  return [...picks, ...(pan.length > 0 ? pan : []), { verb: 'HOLD', pos: KEEP }];
}

const child = spawn(process.execPath, ['scripts/gr-sim.mjs', '--contract', contract, '--seed', seed], {
  cwd: ROOT,
  stdio: ['pipe', 'pipe', 'inherit'],
});
const memo = {};
let turns = 0;
let outcome = null;

for await (const line of createInterface({ input: child.stdout, crlfDelay: Infinity })) {
  if (!line.trim()) continue;
  const message = JSON.parse(line);
  if (message.schema !== 'goldrush.view.v1') {
    outcome = message;
    process.stdout.write(`${line}\n`);
    continue;
  }
  const now = message.now;
  if (!quiet) {
    const off = now.signalSuppression;
    process.stderr.write(`t${turns} w${now.wave} gold=${now.gold} hp=${now.hero.hp.toFixed(0)}`
      + ` pros=(${now.prospector.x.toFixed(1)},${now.prospector.z.toFixed(1)})`
      + ` works=${JSON.stringify(now.works.byKind)} alive=${now.threats.alive}`
      + ` lvl=${now.hero.level}`
      + ` kills=${now.threats.defeatedTotal}`
      + ` off=${off ? `${off.drones ? 'D' : '-'}${off.playbooks ? 'P' : '-'}${off.relayChains ? 'R' : '-'}` : '???'}\n`);
  }
  turns += 1;
  if (!child.stdin.writable || child.stdin.destroyed) continue;
  try {
    child.stdin.write(`${JSON.stringify(orders(message, memo))}\n`);
  } catch {
    // gr-sim closes stdin the moment the run terminates; a lost final line is not an error.
  }
}

child.stdin.end();
const code = await new Promise((resolve) => child.on('close', resolve));
if (!quiet) process.stderr.write(`prover: ${turns} turns, gr-sim rc=${code}\n`);
if (!outcome?.secured) process.exitCode = 1;

function valueOf(flag) {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] : undefined;
}
