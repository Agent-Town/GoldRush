#!/usr/bin/env node
// e5-deepwater-claim controller — Claude Fable 5, gen 18. worldModel: sim-import.
// Usage: node run-sim.mjs <absolute-tape-path> [viewdump-path]
import { spawn } from 'node:child_process';
import { appendFileSync, writeFileSync } from 'node:fs';
import { createInterface } from 'node:readline';

const REPO = '/private/tmp/heat11-5e7a7c0b';
const tapePath = process.argv[2];
const dumpPath = process.argv[3] || null;
if (!tapePath || !tapePath.startsWith('/')) {
  console.error('need absolute tape path');
  process.exit(2);
}

const UPGRADE_PREF = [
  'prospectors_luck', 'double_tap_coil', 'heavy_spark', 'quick_fuse', 'split_spark',
  'powder_charge', 'wide_ring', 'long_resonator', 'tinkers_plating', 'beacon_dynamo',
];

// Deck build sites for the two stockpiles (deck mask x -5..5, z 26..34; stake at 0,30).
const STOCK_SITES = [{ x: -3, z: 28 }, { x: 3, z: 28 }];
const STOCK_GOLD_TRIGGER = 170;
const STOCK_TIME_TRIGGER = 195;
const STOCK_DEADLINE = 235;

let sentCount = 0;
let lastKey = '';
let repeatCount = 0;
let outcome = null;

function decide(view) {
  const now = view.now ?? {};
  const t = now.timers?.runSeconds ?? 0;
  const gold = Math.floor(now.gold ?? 0);

  // Secure window: the ONLY accepted submission is a single SECURE_CHOICE.
  if (now.pendingSecure) return [{ verb: 'SECURE_CHOICE', choice: 'bank' }];

  const orders = [];

  // Free instant order first: convert any live draft.
  if (Array.isArray(now.pendingOffer) && now.pendingOffer.length > 0) {
    const ids = now.pendingOffer.map((o) => o.id);
    const pick = UPGRADE_PREF.find((p) => ids.includes(p)) ?? ids[0];
    orders.push({ verb: 'PICK_UPGRADE', id: pick });
  }

  const dq = now.deepwater?.dredgeQueenBoss ?? null;
  const bossDead = dq ? (dq.crewQuit === true || dq.hulkPresent === true) : false;
  const prosp = now.prospector?.position ?? now.prospector ?? { x: 0, z: 30 };
  const px = prosp.x ?? 0;
  const pz = prosp.z ?? 30;

  if (!bossDead) {
    // PHASE A — the hunt. Stand 6.5wu WEST of the boss's current wreck anchor:
    // claw (offset -3.2,0) is nearest -> sticky rig target; each claw hit resets the
    // dredge cycle so the boss pins itself; claw dead -> frozen forever, no act-2 swat.
    const ax = dq?.anchor?.x ?? 36;
    const az = dq?.anchor?.z ?? -20;
    orders.push({ verb: 'HOLD', pos: { x: ax - 6.5, z: az } });
    return orders;
  }

  // PHASE B — economy. Boss loot (+40g) already auto-banked by the spill.
  const entries = now.works?.entries ?? [];
  const stockpiles = entries.filter((e) => (e.id ?? e.kind) === 'stockpile').length;
  const wantStockTrip = stockpiles < 2 && t <= STOCK_DEADLINE
    && (gold >= STOCK_GOLD_TRIGGER || t >= STOCK_TIME_TRIGGER)
    && gold >= 60;
  if (wantStockTrip) {
    for (let i = stockpiles; i < 2; i += 1) {
      orders.push({ verb: 'BUILD', what: 'stockpile', where: STOCK_SITES[i], when: { goldGte: 60 } });
    }
  }

  // Harvest chain: nearest active seams to the prospector, then HOLD at the best one.
  const seams = (now.seams ?? []).filter((s) => s.active !== false && (s.remaining ?? 1) > 0);
  seams.sort((a, b) => Math.hypot(a.x - px, a.z - pz) - Math.hypot(b.x - px, b.z - pz));
  const best = seams[0] ?? null;
  for (const s of seams.slice(0, 3)) orders.push({ verb: 'HARVEST', seam: s.id });
  const holdAt = best ? { x: best.x, z: best.z } : { x: 0, z: -22 };
  orders.push({ verb: 'HOLD', pos: holdAt });

  // Gold-crossing alarm: BUILD on non-deck ground fails instantly (UNREACHABLE checked
  // before travel), buying a surprise view every +10g without moving the Prospector.
  if (!wantStockTrip) {
    orders.push({ verb: 'BUILD', what: 'sluice', where: { x: holdAt.x + 1.5, z: holdAt.z + 1.5 }, when: { goldGte: Math.min(1000000, gold + 10) } });
  }
  return orders;
}

const child = spawn('node', [
  'scripts/gr-sim.mjs',
  '--contract', 'e5-deepwater-claim',
  '--seed', 'e5-deepwater-claim-01',
  '--tape', tapePath,
], { cwd: REPO, stdio: ['pipe', 'pipe', 'pipe'] });

const rl = createInterface({ input: child.stdout });
let stderrTail = [];
child.stderr.on('data', (d) => {
  stderrTail.push(String(d));
  if (stderrTail.length > 40) stderrTail.shift();
});

rl.on('line', (line) => {
  let msg;
  try { msg = JSON.parse(line); } catch { return; }
  if (msg && msg.schema === 'goldrush.view.v1') {
    if (dumpPath) { try { appendFileSync(dumpPath, line + '\n'); } catch {} }
    const key = JSON.stringify([msg.now?.timers?.runSeconds, msg.now?.wave, msg.now?.gold, Boolean(msg.now?.pendingSecure)]);
    let orders = decide(msg);
    if (key === lastKey) {
      repeatCount += 1;
      // Rejection re-serve: degrade to the minimal legal array.
      if (repeatCount >= 1) {
        orders = msg.now?.pendingSecure
          ? [{ verb: 'SECURE_CHOICE', choice: 'bank' }]
          : [{ verb: 'HOLD', pos: { x: 0, z: -22 } }];
      }
    } else {
      repeatCount = 0;
    }
    lastKey = key;
    sentCount += 1;
    child.stdin.write(JSON.stringify(orders) + '\n');
    return;
  }
  if (msg && typeof msg.secured === 'boolean') {
    outcome = msg;
    console.log('OUTCOME ' + JSON.stringify(msg));
  }
});

child.on('close', (code) => {
  if (!outcome) {
    console.error('no outcome; exit', code);
    console.error(stderrTail.join('').slice(-3000));
    process.exit(1);
  }
  writeFileSync(tapePath + '.outcome.json', JSON.stringify({ outcome, sent: sentCount }, null, 1));
  process.exit(0);
});
