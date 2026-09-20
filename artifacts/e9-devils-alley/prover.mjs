#!/usr/bin/env node

/**
 * THE DEVIL'S ALLEY PROVER — the run that admitted `e9-devils-alley` (2026-08-21, A9).
 *
 * It drives the REAL door: it spawns `scripts/gr-sim.mjs` and answers each printed VIEW with a
 * line of standing orders on stdin, exactly as any rider would. No admission escape hatch, no
 * private handles, no balance edits — every verb below is in the public grammar
 * (`src/agent/StandingOrders.ts`): HARVEST, HOLD, BUILD, BLAST_AT, PICK_UPGRADE, SECURE_CHOICE.
 *
 * THE SKILL THIS PROVES IS ANCHORED PLACEMENT, which is the whole of A9's ratified lesson
 * ("anchor what matters and adapt when the wind replans the rest"). The contract publishes three
 * anchors and the hold each exerts, straight into THE VIEW
 * (`now.devilsAlley.anchors[].holdRadius`), and every pad in the plan below stands INSIDE the
 * centre anchor's hold. The centre devil sweeps z = 0 every third wave and passes bodily through
 * this fort — and takes nothing, which the run records as `refusals.anchored`, not as luck.
 *
 * Run it with `--policy unanchored` to see the other half: the SAME ten works, shifted two world
 * units out of the hold, on the same seeds. That control is what makes the anchored numbers mean
 * something (see `artifacts/e9-devils-alley/summary.json`).
 *
 * THE PLAY, in three beats:
 *   1. PAN. The alley starts broke. Four seams sit in the two sheltered lanes between corridors
 *      — (-14,12)/(14,12) north of the centre bay and (-14,-12)/(14,-12) south of it — none of
 *      them inside a sweep. The Prospector walks to whichever is active.
 *   2. PLANT THE FORT INSIDE THE HOLD. Six sentry beacons on the north arc of the centre
 *      anchor's 8wu circle, where their own 8wu radius still covers the claim at (0,12); four
 *      turrets behind them on the same circle, where 16wu of reach covers both lanes.
 *   3. HOLD THE LANE. Waves enter from the west and east only, so the hero's fixed post at the
 *      claim is the thing being defended and the Prospector stands just south of the guns.
 *
 * Usage: node artifacts/e9-devils-alley/prover.mjs --seed e9-devils-alley-01 [--policy unanchored] [--quiet]
 * Prints a per-turn trace on stderr and the gr-sim outcome JSON on stdout.
 */

import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));
const args = process.argv.slice(2);
const seed = valueOf('--seed') ?? 'e9-devils-alley-01';
const contract = valueOf('--contract') ?? 'e9-devils-alley';
const policy = valueOf('--policy') ?? 'anchored';
const quiet = args.includes('--quiet');

/**
 * THE HERO NEVER MOVES. `HeadlessContractSim` drives slot 0 on IDLE_INTENTS (F-E2PA-4), so the
 * claim at (0,12) is a fixed post: a rider defends THAT, or it loses.
 *
 * EVERY PAD BELOW IS INSIDE THE CENTRE ANCHOR'S HOLD — `anchor-center` at (0,0), hold radius 8,
 * which is the circle inscribed in the 20x16 `center-anchor-bay`. The farthest pad here is
 * exactly 8.00 from the stake and the nearest is 7.62, so the whole fort sits on the hold's north
 * arc: as close to the claim as the anchor reaches, and not one world unit further.
 *
 * THE BUILD LIST, in purchase order — the cost column is the registry's Nth price for that kind
 * (turret 50/70/95/125, sentry_beacon 25/35/45/55/75/95), so the order below is also the order
 * the gold arrives in. Guns first on both flanks, then beacons to hold a drone inside their fire.
 */
const ANCHORED_PLAN = [
  { what: 'turret', where: { x: -7, z: 3 }, costs: 50 },
  { what: 'turret', where: { x: 7, z: 3 }, costs: 70 },
  { what: 'sentry_beacon', where: { x: -3, z: 7 }, costs: 25 },
  { what: 'sentry_beacon', where: { x: 3, z: 7 }, costs: 35 },
  { what: 'turret', where: { x: -8, z: 0 }, costs: 95 },
  { what: 'turret', where: { x: 8, z: 0 }, costs: 125 },
  { what: 'sentry_beacon', where: { x: 0, z: 8 }, costs: 45 },
  { what: 'sentry_beacon', where: { x: -5, z: 6 }, costs: 55 },
  { what: 'sentry_beacon', where: { x: 5, z: 6 }, costs: 75 },
  { what: 'sentry_beacon', where: { x: 6, z: 5 }, costs: 95 },
];

/**
 * THE CONTROL. The same ten works, each pushed just outside the hold and still inside the
 * `center-anchor-bay` (x -10..10, z -8..8) so every one of them is a LEGAL placement — the only
 * thing that changed is that the anchor no longer reaches them. Distances from (0,0) run 8.25 to
 * 10.30, EVERY ONE strictly greater than the 8.00 hold. This is the measurement that proves the
 * hold is what saves the anchored fort.
 *
 * ⚠️ THE BOUNDARY IS INCLUSIVE AND IT BIT THIS FIXTURE ONCE. `anchored()` tests `d² <= r²`, so a
 * pad at exactly 8.00 is HELD, not exposed. The seventh row below was first written (0,-8) —
 * exactly 8.00 — which would have made one tenth of a control labelled "unanchored" anchored in
 * fact. It is (2,-8), 8.246, for that reason and no other.
 */
const UNANCHORED_PLAN = [
  { what: 'turret', where: { x: -9, z: 3 }, costs: 50 },
  { what: 'turret', where: { x: 9, z: 3 }, costs: 70 },
  { what: 'sentry_beacon', where: { x: -4, z: 8 }, costs: 25 },
  { what: 'sentry_beacon', where: { x: 4, z: 8 }, costs: 35 },
  { what: 'turret', where: { x: -10, z: 0 }, costs: 95 },
  { what: 'turret', where: { x: 10, z: 0 }, costs: 125 },
  { what: 'sentry_beacon', where: { x: 2, z: -8 }, costs: 45 },
  { what: 'sentry_beacon', where: { x: -7, z: 6 }, costs: 55 },
  { what: 'sentry_beacon', where: { x: 7, z: 6 }, costs: 75 },
  { what: 'sentry_beacon', where: { x: 9, z: 5 }, costs: 95 },
];

const PLAN = policy === 'unanchored' ? UNANCHORED_PLAN : ANCHORED_PLAN;

/** Where the guns want the rider when nothing is being bought — inside the hold, behind the line. */
const KEEP = { x: 0, z: 4 };

/**
 * Stage three wu south of the pad: `Balance.turret.placeRadius` is 6 and every pad above sits at
 * z >= -8, so this is always in range and never inside the claim's own footprint.
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
 * THE BLAST, aimed along the lane the wave is walking. `Balance.blast.range` is 10, so 9.5 is the
 * furthest honest reach from the claim's row. Fired only when there is something out there to
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
/**
 * THE WIND'S OWN NUMBERS, carried out of the run so the evidence battery can read them without
 * keeping 70 megabytes of VIEW lines. Emitted as its own line JUST BEFORE the outcome, so
 * `lines.at(-1)` is still the gr-sim outcome every other reader expects.
 */
let wind = null;

for await (const line of createInterface({ input: child.stdout, crlfDelay: Infinity })) {
  if (!line.trim()) continue;
  const message = JSON.parse(line);
  if (message.schema !== 'goldrush.view.v1') {
    outcome = message;
    if (wind) process.stdout.write(`${JSON.stringify({ schema: 'goldrush.a9-wind.v1', policy, ...wind })}\n`);
    process.stdout.write(`${line}\n`);
    continue;
  }
  const now = message.now;
  if (now.devilsAlley) {
    wind = {
      sweepsStarted: now.devilsAlley.sweepsStarted,
      sweepsCompleted: now.devilsAlley.sweepsCompleted,
      relocations: now.devilsAlley.relocations,
      anchoredRefusals: now.devilsAlley.refusals.anchored,
      lastRelocation: now.devilsAlley.lastRelocation,
      works: now.devilsAlley.works,
    };
  }
  if (!quiet) {
    const wind = now.devilsAlley;
    process.stderr.write(`t${turns} w${now.wave} gold=${now.gold} hp=${now.hero.hp.toFixed(0)}`
      + ` pros=(${now.prospector.x.toFixed(1)},${now.prospector.z.toFixed(1)})`
      + ` works=${JSON.stringify(now.works.byKind)} alive=${now.threats.alive}`
      + ` lvl=${now.hero.level}`
      + ` kills=${now.threats.defeatedTotal}`
      + ` wind=${wind ? `${wind.routeId ?? 'wait'} sweeps${wind.sweepsCompleted} moved${wind.relocations}`
        + ` held${wind.refusals.anchored} air${wind.carried.length}` : '???'}\n`);
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
