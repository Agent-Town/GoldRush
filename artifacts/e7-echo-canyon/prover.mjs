#!/usr/bin/env node

/**
 * THE ECHO CANYON PROVER — the run that admitted `e7-echo-canyon` (2026-08-20, A3).
 *
 * It drives the REAL door: it spawns `scripts/gr-sim.mjs` and answers each printed VIEW with a
 * line of standing orders on stdin, exactly as any rider would. No admission escape hatch, no
 * private handles, no balance edits — every verb below is in the public grammar
 * (`src/agent/StandingOrders.ts`): HARVEST, HOLD, BUILD, PICK_UPGRADE, SECURE_CHOICE.
 *
 * ⚠️ IT USES NO PLAYBOOK, AND CANNOT. The sheet allows either arm — "the prover MAY use playbooks
 * (eating the mirror pressure is the point) or avoid them; report which" — and this one avoids
 * them because the door has no playbook verb to use: `src/agent/StandingOrders.ts` declares none
 * (measured 2026-08-20; the same measurement A4 recorded for the Dead Band). So this run casts NO
 * shadow, the canyon fields NO mirrors, and `now.broadcastMirror` reads `recordedUses: 0` on every
 * turn of every run below — which IS the ratified rule ("no playbook use -> no mirrors"), stated
 * rather than hidden. The mirror itself is proven where playbooks exist, in the browser
 * (`e2e/e7-echo-canyon-mirror.spec.ts`), on the same consumer and the same wave seam.
 *
 * THE MAP, and why the play is shaped this way. `canyon-floor-yard` runs x -30..30, z -42..10 —
 * and the claim stands at (0,12), two world units NORTH of its own build zone, so every gun must
 * stand south of the body it defends. Waves enter from BOTH ends (`lanes.spawnEdges: north,
 * south`) at a 26wu ring: the north pack lands at z=38 and walks down, the south pack lands at
 * z=-14, already INSIDE the yard. So the guns go on the middle of the floor, not on its lip,
 * where a 16wu turret can answer both mouths of the canyon at once.
 *
 * THE PLAY, in three beats:
 *   1. PAN. The yard starts broke. The Prospector works whichever seam is live — the two floor
 *      seams at (+/-14,-6) are the near ones; the two shelf seams at (+/-42,8) are a long walk
 *      across the canyon and get worked only when they are what the world offers.
 *   2. PLANT. At 50 gold the rider HOLDs three units south of the pad and BUILDs; it repeats to
 *      the registry caps (4 turrets, 6 beacons), alternating flanks. HOLD, not MOVE_TO — MOVE_TO
 *      completes on arrival and the embodiment then drifts back to the hero, which walks the guns
 *      out of the build radius.
 *   3. HOLD THE CANYON. Half the roster is `data_rustler` (a thief, which comes for the gold on
 *      the hero) and half is `rogue_automaton` (hpScale 1.2, which comes for the hero itself), so
 *      the hero stands inside the turret cluster and the Prospector keeps panning.
 *
 * Usage: node artifacts/e7-echo-canyon/prover.mjs --seed e7-echo-canyon-01 [--quiet]
 * Prints a per-turn trace on stderr and the gr-sim outcome JSON on stdout.
 */

import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));
const args = process.argv.slice(2);
const seed = valueOf('--seed') ?? 'e7-echo-canyon-01';
const contract = valueOf('--contract') ?? 'e7-echo-canyon';
const quiet = args.includes('--quiet');

/**
 * THE BUILD LIST, in purchase order: guns first to the registry cap of four, then beacons to six.
 * Every pad sits inside `canyon-floor-yard` (x -30..30, z -42..10) and inside a turret's 16wu
 * reach of BOTH canyon mouths. The beacons slow what they touch (radius 8wu), which is what keeps
 * a rustler inside turret fire long enough to die before it reaches the claim.
 */
const PLAN = [
  { what: 'turret', where: { x: -5, z: 8 }, costs: 50 },
  { what: 'turret', where: { x: 5, z: 8 }, costs: 70 },
  { what: 'sentry_beacon', where: { x: -2, z: 9 }, costs: 25 },
  { what: 'sentry_beacon', where: { x: 2, z: 9 }, costs: 35 },
  { what: 'turret', where: { x: -4, z: 2 }, costs: 95 },
  { what: 'turret', where: { x: 4, z: 2 }, costs: 125 },
  { what: 'sentry_beacon', where: { x: -7, z: 9 }, costs: 45 },
  { what: 'sentry_beacon', where: { x: 7, z: 9 }, costs: 55 },
  { what: 'sentry_beacon', where: { x: -8, z: 3 }, costs: 75 },
  { what: 'sentry_beacon', where: { x: 8, z: 3 }, costs: 95 },
];
/** Where the guns want the rider when nothing is being bought: inside the cluster, on the floor. */
const KEEP = { x: 0, z: 6 };

/**
 * Stage three wu SOUTH of whatever is being placed: `Balance.turret.placeRadius` is 6, every pad
 * above sits at z >= 2, and the yard runs to z = -42, so this is always legal ground and always
 * in range. (Staging from one fixed point is what silently ate the Dead Band prover's first two
 * turret purchases: pads 6.3wu away simply refuse, and the refusal is not in THE VIEW.)
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
 * again on every respawn (`HarvestSystem.ts:82` + `:301-311`), and THE VIEW's live seam rows carry
 * no coordinates (`View.ts:83`) — so a rider cannot aim at a seam, only at a seam ID. This play
 * therefore pans whichever seam is active and lets the Prospector walk to it; that body is
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
    const mirror = now.broadcastMirror;
    process.stderr.write(`t${turns} w${now.wave} gold=${now.gold} hp=${now.hero.hp.toFixed(0)}`
      + ` pros=(${now.prospector.x.toFixed(1)},${now.prospector.z.toFixed(1)})`
      + ` works=${JSON.stringify(now.works.byKind)} alive=${now.threats.alive}`
      + ` lvl=${now.hero.level}`
      + ` kills=${now.threats.defeatedTotal}`
      + ` mirror=${mirror ? `${mirror.recordedUses}u/${mirror.pending.length}p/${mirror.bodiesFielded}b` : '???'}\n`);
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
