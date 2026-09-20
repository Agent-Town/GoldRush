#!/usr/bin/env node

/**
 * THE GLOW MESA PROVER — the run that re-admitted `e6-glow-mesa` (2026-08-20).
 *
 * It drives the REAL door: it spawns `scripts/gr-sim.mjs` and answers each printed VIEW with a
 * line of standing orders on stdin, exactly as any rider would. No admission escape hatch, no
 * private handles, no balance edits — every verb below is in the public grammar
 * (`src/agent/StandingOrders.ts`): HARVEST, HOLD, BUILD, CAPTURE, SECURE_CHOICE.
 *
 * THE PLAY, in four beats:
 *   1. PAN. The Isotope Kitchen starts broke, so the Prospector walks the seam ring and pans it
 *      (one HARVEST record = one pan tick, so each turn queues eight). Two seams ~= 65 gold.
 *   2. PLANT. Gold in hand, it HOLDs the pad at (0,-13.5) for a full turn — HOLD, not MOVE_TO,
 *      because MOVE_TO completes on arrival and the embodiment then drifts back to the hero —
 *      and BUILDs a turret at (0,-12). That is 4wu from the Homemaker's anchor at (0,-8) and
 *      inside the `base-flat` build zone; the rig on the hero's own hip can never reach the
 *      machine, which parks 24wu away and never pursues (`pursuitRange: 0`).
 *   3. WRANGLE. With the gun planted the Prospector walks back into the herd and CAPTUREs the
 *      appliances that have wound down — E6's defining verb, and the only thing that keeps
 *      `Balance.waves.aliveCap` from filling with exhausted machines that can be neither fought
 *      nor cleared (the `e6-showroom` pathology, `reviews/milk-twin-sockets.md`).
 *   4. REBUILD, AND REBUILD AGAIN. From wave 8 the Homemaker unbuilds the town one structure at
 *      a time — starting with the turret. The rider simply buys another. Breaking VAC opens act
 *      two and the CORE spawns; breaking the CORE ends it: one chair, and the run secures.
 *
 * Usage: node artifacts/e6-glow-mesa/prover.mjs --seed e6-glow-mesa-01 [--quiet]
 * Prints a per-turn trace on stderr and the gr-sim outcome JSON on stdout.
 */

import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));
const args = process.argv.slice(2);
const seed = valueOf('--seed') ?? 'e6-glow-mesa-01';
const contract = valueOf('--contract') ?? 'e6-glow-mesa';
const quiet = args.includes('--quiet');

/** The turret pad: inside `base-flat` (z <= -10) and 4wu from the Homemaker's anchor. */
const TURRET = { x: 0, z: -12 };
/** Where the Prospector stands to place it — `Balance.turret.placeRadius` is 6. */
const STAGE = { x: 0, z: -13.5 };
/** Where the machines are: they walk at the hero, and the hero never leaves the Kitchen. */
const SWARM = { x: 0, z: -30 };
/** One turret is 50; hold a little over so a rebuild after an unbuild is never a coin flip. */
const BUDGET = 60;

const distance = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);

/** Pure function of THE VIEW (plus one bit of memory): same seed in, same orders out. */
function orders(view, memo) {
  const now = view.now;
  if (now.pendingSecure) return [{ verb: 'SECURE_CHOICE', choice: 'bank' }];

  const turrets = now.works.byKind?.turret ?? 0;
  const seam = now.seams.find((entry) => entry.active && entry.remaining > 0);

  if (turrets < 1) {
    if (now.gold < BUDGET) {
      memo.staged = false;
      return seam
        ? Array.from({ length: 8 }, () => ({ verb: 'HARVEST', seam: seam.id }))
        : [{ verb: 'HOLD', pos: SWARM }];
    }
    if (!memo.staged || distance(now.prospector, STAGE) > 1.5) {
      memo.staged = true;
      return [{ verb: 'HOLD', pos: STAGE }];
    }
    return [{ verb: 'BUILD', what: 'turret', where: TURRET, when: { goldGte: 50 } }, { verb: 'HOLD', pos: STAGE }];
  }
  return [{ verb: 'CAPTURE' }, { verb: 'HOLD', pos: SWARM }];
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
  const boss = now.atomic?.homemakerBoss;
  if (!quiet) {
    process.stderr.write(`t${turns} w${now.wave} gold=${now.gold} hp=${now.hero.hp.toFixed(0)}`
      + ` pros=(${now.prospector.x.toFixed(1)},${now.prospector.z.toFixed(1)})`
      + ` works=${JSON.stringify(now.works.byKind)} alive=${now.threats.alive}`
      + ` pen=${now.atomic?.wrangle.pen.total ?? 0}`
      + ` boss=${boss ? `act${boss.act}/[${boss.liveComponents}]/unbuilds${boss.unbuilds}/down${boss.poweredDown ? 1 : 0}` : '-'}\n`);
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
