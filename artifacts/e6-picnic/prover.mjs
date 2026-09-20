#!/usr/bin/env node

/**
 * THE PICNIC PROVER — the run that admitted `e6-picnic` (2026-08-22).
 *
 * It drives the REAL door: it spawns `scripts/gr-sim.mjs --contract e6-picnic` and answers each
 * printed VIEW with a line of standing orders on stdin, exactly as any rider would. No admission
 * escape hatch, no private handles, no balance edits — every verb below is in the public grammar
 * (`src/agent/StandingOrders.ts`): HARVEST, HOLD, BUILD, CAPTURE, SECURE_CHOICE.
 *
 * ⚠️ THIS IS THE SECOND VERSION, AND THE FIRST IS WHY IT EXISTS. Before the owner's "flip the
 * stakes" ruling of 2026-08-22, all three `stakeMarkers` carried `heroStart: true`, the hero opened
 * standing inside the west disc, and its own auto-fire held that stake for free — so a leisurely
 * pan-then-turret opening was good enough (that version secured w20 on `fnv1a32:2cc17457` /
 * `fnv1a32:fee59bca`, and it is preserved in this file's git history at `8705c81a0`). With the
 * flip, the hero starts at (0,12) — outside all three discs — and the map is genuinely hostile:
 * the idle floor now loses at wave 2 and wave 1. A turret costs 50 and the first stake falls long
 * before the Prospector can pan that much, so the opening had to change.
 *
 * THE PLAY, in four beats:
 *   1. PAN. The Prospector starts beside the hero at (0,12); the nearest authored seam is (0,8),
 *      four world-units away. One HARVEST record = one pan tick, so each turn queues eight.
 *   2. FENCE THE SANDWICHES, CHEAPLY AND AT ONCE. A stake's 3wu disc is CONTESTED by ANY standing
 *      structure inside it (`PicnicHoldSystem.contested`) — it does not have to shoot. A palisade
 *      is 10 gold (`Balance.palisade.cost`) against a turret's 50, so the rider fences all three
 *      discs for the price of a fifth of one gun, which is the only opening the clock allows.
 *   3. GUN THE STAKES. With the discs held, gold accumulates; turrets then go up INSIDE the discs
 *      (range 16 covers the meadow) so the fence stops being the only thing between the sandwiches
 *      and the machines.
 *   4. REBUILD, AND CAPTURE. Machines break palisades; the rider simply buys another — the loop
 *      re-fences any disc that falls open — and CAPTUREs the appliances that have wound down,
 *      E6's defining verb, so `Balance.waves.aliveCap` does not fill with things that can be
 *      neither fought nor cleared.
 *
 * Usage: node artifacts/e6-picnic/prover.mjs --contract e6-picnic --seed e6-picnic-01 [--quiet]
 * Prints a per-turn trace on stderr and the gr-sim outcome JSON on stdout. Exit 1 if unsecured.
 */

import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));
const args = process.argv.slice(2);
const seed = valueOf('--seed') ?? 'e6-picnic-01';
const contract = valueOf('--contract') ?? 'e6-picnic';
const quiet = args.includes('--quiet');

/** `PICNIC_HOLD_RADIUS`, and the authored stake coordinates. */
const HOLD_RADIUS = 3;
const STAKES = [
  { id: 'sandwich-center', x: 0, z: 26 },
  { id: 'sandwich-west', x: -16, z: 18 },
  { id: 'sandwich-east', x: 16, z: 18 },
];
/** `Balance.palisade.cost` — flat, no growth curve, and the whole reason the opening survives. */
const PALISADE = 10;
/** `Balance.turret.costBase` 50 at `costGrowth` 1.35, rounded the way the board rounds. */
const turretPrice = (built) => Math.ceil((50 * 1.35 ** built) / 5) * 5;
/** `Balance.turret.maxCount`. */
const TURRET_CAP = 4;
/** Pads inside the 3wu disc, walked in order so two guns never contend for one square. */
const TURRET_RING = [{ x: 2, z: 0 }, { x: -2, z: 0 }, { x: 0, z: 2 }, { x: 0, z: -2 }];

const distance = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);

/** Pure function of THE VIEW (plus one bit of memory): same seed in, same orders out. */
function orders(view, memo) {
  const now = view.now;
  if (now.pendingSecure) return [{ verb: 'SECURE_CHOICE', choice: 'bank' }];

  const standing = (now.works.entries ?? []).filter((entry) => !entry.wrecked && entry.hp > 0);
  const fenced = (stake) => standing.some((entry) => distance(entry.position, stake) <= HOLD_RADIUS);
  const seams = now.seams.filter((entry) => entry.active && entry.remaining > 0);

  // THE VIEW publishes each stake's own hold timer, so the rider defends WHAT IS ABOUT TO FALL
  // rather than what is closest. A claimed stake is gone for good (`PicnicHoldSystem` never
  // un-claims), so spending a palisade on one is spending it on nothing.
  const holdState = new Map((now.atomic?.picnicHold ?? []).map((entry) => [entry.id, entry]));
  const live = STAKES.filter((stake) => holdState.get(stake.id)?.claimed !== true);
  const open = live.filter((stake) => !fenced(stake))
    .sort((left, right) => (holdState.get(right.id)?.timer ?? 0) - (holdState.get(left.id)?.timer ?? 0)
      || distance(now.prospector, left) - distance(now.prospector, right));

  // Pan the seam nearest the STAKE BEING DEFENDED, not the one nearest the Prospector. The two
  // differ by a whole wave of walking on this map: with five anchors spread over 44 world-units and
  // three discs to reach, a rider that chases the closest gold ends the opening on the far side of
  // the meadow from the sandwich that is about to fall. Coupling the economy to the defence is what
  // makes the fence arrive in time.
  const panNear = (place) => {
    if (seams.length === 0) return [];
    const seam = seams.reduce((nearest, entry) => (distance(place, entry) < distance(place, nearest) ? entry : nearest));
    return Array.from({ length: 8 }, () => ({ verb: 'HARVEST', seam: seam.id }));
  };
  const pan = panNear(now.prospector);

  // WALK FIRST, THEN BUILD. `Balance.turret.placeRadius` is 6, so a BUILD issued from across the
  // meadow is refused on arrival at the order queue rather than on arrival at the pad — measured on
  // an earlier revision, which burned its retry budget standing 20wu away and then gave up. HOLD is
  // the stage, not MOVE_TO: MOVE_TO completes on arrival and the embodiment drifts back to the hero.
  const plant = (what, pad, price) => {
    const key = `${what}@${pad.x},${pad.z}`;
    if (memo.stagedFor !== key) {
      memo.stagedFor = key;
      return [{ verb: 'HOLD', pos: pad }];
    }
    if (distance(now.prospector, pad) > 2) return [{ verb: 'HOLD', pos: pad }];
    return [{ verb: 'BUILD', what, where: pad, when: { goldGte: price } }, { verb: 'HOLD', pos: pad }];
  };

  // BEAT 2/4 — a live disc standing open is the emergency, whether it is turn one or turn forty.
  if (open.length > 0) {
    const target = open[0];
    if (now.gold >= PALISADE) return plant('palisade', { x: target.x, z: target.z }, PALISADE);
    const towards = panNear(target);
    return towards.length > 0 ? towards : [{ verb: 'HOLD', pos: { x: target.x, z: target.z } }];
  }

  // BEAT 3 — every live disc fenced; buy the guns. The pad is offset ALONG X, not Z: the palisade
  // is 1 wide by 3 deep centred on the stake, so a pad 1.5wu south sits inside its footprint and
  // the placement is silently refused (measured — the first version of this prover stalled there
  // for thirty turns holding a spot it could never build on). `memo.stall` gives up after three
  // turns of trying and goes back to panning, so a refusal can never freeze the run again.
  const turrets = now.works.byKind?.turret ?? 0;
  if (turrets < TURRET_CAP && live.length > 0 && now.gold >= turretPrice(turrets)) {
    if (memo.turretsSeen !== turrets) {
      memo.turretsSeen = turrets;
      memo.stall = 0;
    }
    if (memo.stall < 8) {
      memo.stall += 1;
      // Spend to the cap on whatever sandwiches are STILL ALIVE, ringing each in turn. A rider that
      // stops at one gun per stake banks 200 gold doing nothing while the machines chew the fence —
      // measured on the previous revision of this file, and the reason the cap is the bound here.
      const stake = live[turrets % live.length];
      const ring = TURRET_RING[Math.floor(turrets / live.length) % TURRET_RING.length];
      return plant('turret', { x: stake.x + ring.x, z: stake.z + ring.z }, turretPrice(turrets));
    }
  }

  // BEAT 4 — hold the line: keep the pen clear and keep panning for the next rebuild.
  return [{ verb: 'CAPTURE' }, ...pan];
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
  const hold = now.atomic?.picnicHold;
  if (!quiet) {
    process.stderr.write(`t${turns} w${now.wave} gold=${now.gold} hp=${now.hero.hp.toFixed(0)}`
      + ` pros=(${now.prospector.x.toFixed(1)},${now.prospector.z.toFixed(1)})`
      + ` works=${JSON.stringify(now.works.byKind)} alive=${now.threats.alive}`
      + ` pen=${now.atomic?.wrangle.pen.total ?? 0}`
      + ` stakes=${hold ? hold.map((s) => `${s.id.replace('sandwich-', '')}:${s.claimed ? 'CLAIMED' : s.contested ? 'held' : `t${s.timer.toFixed(1)}`}`).join(',') : '-'}\n`);
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
