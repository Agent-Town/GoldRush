#!/usr/bin/env node

/**
 * THE LOW ORBIT PROVER — the run that admitted `e8-low-orbit` (2026-08-20, A7).
 *
 * It drives the REAL door: it spawns `scripts/gr-sim.mjs` and answers each printed VIEW with a
 * line of standing orders on stdin, exactly as any rider would. No admission escape hatch, no
 * private handles, no balance edits — every verb below is in the public grammar
 * (`src/agent/StandingOrders.ts`): HARVEST, HOLD, BUILD, BLAST_AT, PICK_UPGRADE, SECURE_CHOICE.
 *
 * MOMENTUM IS COMMITMENT, so the proof is what it does with a MISS. The contract declares
 * `zeroGravity {projectiles:"orbital-return", roads:"handholds"}`; this play therefore uses the
 * blast deliberately and aims it ALONG the lane the wave is walking, due east or due west at
 * z = 12. Two things follow, and both are the mechanic:
 *   - a HIT is a hit, and the round is spent;
 *   - a MISS re-enters 12s later at the continuation of that same vector, roughly (+/-19, 12) —
 *     which is still in the lane, still in front of the guns, and (deliberately) outside the
 *     works, none of which stand beyond |x| = 13. That is the "exploit, don't be exploited"
 *     half of the ratified lesson: a missed lob is a future problem, so it is aimed where a
 *     future problem is welcome.
 *
 * THE PLAY, in three beats:
 *   1. PAN. The yard starts broke. Four seams sit on the three scaffold decks — two in the
 *      carcass yard at (-12,4)/(12,4) and one on each far deck at (-38,2)/(38,2). The
 *      Prospector walks the handhold spine to whichever is active; that walk IS the crossing
 *      the briefing asks for ("Cross the salvaged Claw scaffold by its central spine").
 *   2. PLANT. Four turrets and six sentry beacons, east and west of the claim, all inside the
 *      carcass-yard build zone. HOLD, not MOVE_TO — MOVE_TO completes on arrival and the
 *      embodiment then drifts back to the hero, which walks the guns out of the build radius.
 *   3. HOLD THE LANE. Waves enter from the west and east only, so the guns are paired on those
 *      two flanks and the hero stands at its fixed post between them.
 *
 * THE DEBRIS BANDS ARE NEVER ENTERED, and that is a choice the map makes easy: they run
 * z >= 24 and z <= -24, the claim is at (0,12), and every pad below is inside |z| <= 14. The
 * hazard is real (see the guard spec) — this play simply declines it.
 *
 * Usage: node artifacts/e8-low-orbit/prover.mjs --seed e8-low-orbit-01 [--quiet]
 * Prints a per-turn trace on stderr and the gr-sim outcome JSON on stdout.
 */

import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));
const args = process.argv.slice(2);
const seed = valueOf('--seed') ?? 'e8-low-orbit-01';
const contract = valueOf('--contract') ?? 'e8-low-orbit';
const quiet = args.includes('--quiet');

/**
 * THE HERO NEVER MOVES. `HeadlessContractSim` drives slot 0 on IDLE_INTENTS (F-E2PA-4), so the
 * claim at (0,12) is a fixed post: a rider defends THAT, or it loses. Every pad below therefore
 * stands inside `claw-carcass-yard` (x -18..18, z -14..14) and covers the two lanes.
 *
 * THE BUILD LIST, in purchase order — the cost column is the registry's Nth price for that kind
 * (turret 50/70/95/125, sentry_beacon 25/35/45/55/75/95), so the order below is also the order
 * the gold arrives in. Guns first on both flanks, then beacons to hold a corsair inside their
 * fire long enough to die.
 */
const PLAN = [
  { what: 'turret', where: { x: -8, z: 12 }, costs: 50 },
  { what: 'turret', where: { x: 8, z: 12 }, costs: 70 },
  { what: 'sentry_beacon', where: { x: -12, z: 12 }, costs: 25 },
  { what: 'sentry_beacon', where: { x: 12, z: 12 }, costs: 35 },
  { what: 'turret', where: { x: -8, z: 8 }, costs: 95 },
  { what: 'turret', where: { x: 8, z: 8 }, costs: 125 },
  { what: 'sentry_beacon', where: { x: -13, z: 9 }, costs: 45 },
  { what: 'sentry_beacon', where: { x: 13, z: 9 }, costs: 55 },
  { what: 'sentry_beacon', where: { x: -11, z: 14 }, costs: 75 },
  { what: 'sentry_beacon', where: { x: 11, z: 14 }, costs: 95 },
];
/** Where the hero's guns want the rider when nothing is being bought. */
const KEEP = { x: 0, z: 8 };

/**
 * Stage three wu south of the pad: `Balance.turret.placeRadius` is 6, every pad above sits at
 * z >= 8, and the yard runs to z = -14, so this is always legal ground and always in range.
 */
const stageFor = (pad) => ({ x: pad.x, z: pad.z - 3 });

/** Survive first, then hit harder. */
const UPGRADE_PREFERENCE = [
  'tinkers_plating', 'field_dressing', 'heavy_spark', 'double_tap_coil',
  'split_spark', 'sharpen', 'long_resonator', 'spring_heels',
];

const distance = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);

/**
 * SEAM IDS ARE NOT PLACES. `HarvestSystem` hands `gold-seam-N` to a SHUFFLED anchor and moves it
 * again on every respawn, and THE VIEW's live seam rows carry no coordinates — so a rider cannot
 * aim at a seam, only at a seam ID. This play pans whichever seam is active and lets the
 * Prospector walk to it; that body is expendable, the claim is not.
 */
function panOrders(now) {
  const seam = now.seams.find((entry) => entry.active && entry.remaining > 0);
  return seam ? Array.from({ length: 8 }, () => ({ verb: 'HARVEST', seam: seam.id })) : [];
}

/**
 * THE BLAST, aimed along the lane the wave is walking. `Balance.blast.range` is 10, so 9.5 is
 * the furthest honest reach from the post; the miss then re-enters near (+/-19, 12), beyond
 * every pad in PLAN and still inside the lane. Fired only when there is something out there to
 * catch it, so the trace never shows a round thrown at an empty map.
 */
function blastOrders(now) {
  if ((now.blastReadyInMs ?? 1) > 0) return [];
  if ((now.threats?.alive ?? 0) < 3) return [];
  const edge = now.threats?.edge;
  if (edge !== 'east' && edge !== 'west') return [];
  return [{ verb: 'BLAST_AT', pos: { x: edge === 'east' ? 9.5 : -9.5, z: 12 } }];
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
  const blast = blastOrders(now);

  if (step) {
    const stage = stageFor(step.where);
    if (now.gold < step.costs) {
      memo.staged = false;
      return [...picks, ...blast, ...(pan.length > 0 ? pan : [{ verb: 'HOLD', pos: KEEP }])];
    }
    if (!memo.staged || distance(now.prospector, stage) > 1.5) {
      memo.staged = true;
      return [...picks, ...blast, { verb: 'HOLD', pos: stage }];
    }
    memo.staged = false;
    return [
      ...picks,
      ...blast,
      { verb: 'BUILD', what: step.what, where: step.where, when: { goldGte: step.costs } },
      { verb: 'HOLD', pos: stage },
    ];
  }
  return [...picks, ...blast, ...(pan.length > 0 ? pan : []), { verb: 'HOLD', pos: KEEP }];
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
    const orbit = now.lowOrbit;
    process.stderr.write(`t${turns} w${now.wave} gold=${now.gold} hp=${now.hero.hp.toFixed(0)}`
      + ` pros=(${now.prospector.x.toFixed(1)},${now.prospector.z.toFixed(1)})`
      + ` works=${JSON.stringify(now.works.byKind)} alive=${now.threats.alive}`
      + ` lvl=${now.hero.level}`
      + ` kills=${now.threats.defeatedTotal}`
      + ` orbit=${orbit ? `ret${orbit.returnsScheduled}/${orbit.returnsDetonated} debris${orbit.debrisDamageDealt}` : '???'}\n`);
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
