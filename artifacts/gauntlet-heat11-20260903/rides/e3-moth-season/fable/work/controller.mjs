// e3-moth-season deterministic controller — Claude Fable 5, gen 14
// Strategy: build ZERO lights (moths only damage lantern/decoy light sources and
// idle with no target when none exist; baseline 4 moths/wave are 0-damage bodies).
// Real threat is the Fevered Runners + 2.4s trickle: ring the fixed hero at (0,12)
// with 4 turrets + 2 beacons in the dark corridor, blast weapon, Prospector chases
// the published seam anchors and channels by HOLDing at them. Bank at wave 12.
import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';
import { writeFileSync, appendFileSync } from 'node:fs';

const args = process.argv.slice(2);
const flag = (name, dflt) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : dflt;
};
const tape = flag('--tape', 'tune-tape.json');
const seed = flag('--seed', 'e3-moth-season-01');
const REPO = '/private/tmp/heat11-5e7a7c0b';

const sim = spawn('node', ['scripts/gr-sim.mjs', '--contract', 'e3-moth-season', '--seed', seed, '--tape', tape], {
  cwd: REPO,
  stdio: ['pipe', 'pipe', 'pipe'],
});
sim.stderr.on('data', (d) => process.stderr.write(d));

// Build ladder in the dark corridor around the hero stake (0,12); all sites in-zone
// (x -6..6, z -34..34), pairwise >=2.5 apart and >=2.5 from the claim at (0,12).
const TURRETS = [
  { x: 3, z: 9, cost: 50 },
  { x: -3, z: 15, cost: 70 },
  { x: -3, z: 9, cost: 95 },
  { x: 3, z: 15, cost: 125 },
];
const BEACONS = [
  { x: 0, z: 9, cost: 25 },
  { x: 0, z: 15, cost: 35 },
];
// Interleaved intent order: T1, B1, T2, B2, T3, T4
const PLAN = [
  { what: 'turret', ...TURRETS[0] },
  { what: 'sentry_beacon', ...BEACONS[0] },
  { what: 'turret', ...TURRETS[1] },
  { what: 'sentry_beacon', ...BEACONS[1] },
  { what: 'turret', ...TURRETS[2] },
  { what: 'turret', ...TURRETS[3] },
];

const PICK_PREF = [
  /^prospectors_luck$/, /^tinkers_plating$/, /^beacon_dynamo$/,
  /heavy_spark|double_tap|quick_fuse|split_spark|powder_charge|wide_ring|long_resonator/,
  /.*/,
];

let sent = 0;
let lastKey = null;
let sameKeyCount = 0;

function pickUpgrade(offer) {
  for (const re of PICK_PREF) {
    const hit = offer.find((o) => re.test(o.id));
    if (hit) return hit.id;
  }
  return offer[0].id;
}

function bestSeam(view) {
  const p = view.now.prospector ?? view.now.hero;
  const live = (view.now.seams ?? []).filter((s) => s.active && s.x != null && (s.remaining ?? 0) > 0);
  live.sort((a, b) => Math.hypot(a.x - p.x, a.z - p.z) - Math.hypot(b.x - p.x, b.z - p.z));
  return live[0] ?? null;
}

function ordersFor(view) {
  const now = view.now;
  // Secure window accepts ONLY a single-element SECURE_CHOICE array.
  if (now.pendingSecure) return [{ verb: 'SECURE_CHOICE', choice: 'bank' }];

  const orders = [];
  if (Array.isArray(now.pendingOffer) && now.pendingOffer.length > 0) {
    orders.push({ verb: 'PICK_UPGRADE', id: pickUpgrade(now.pendingOffer) });
  }
  orders.push({ verb: 'SET_WEAPON', weapon: 'blast' });

  const byKind = now.works?.byKind ?? {};
  const builtT = byKind.turret ?? 0;
  const builtB = byKind.sentry_beacon ?? 0;
  let seenT = 0, seenB = 0, queued = 0;
  for (const step of PLAN) {
    const isT = step.what === 'turret';
    if (isT) { seenT += 1; } else { seenB += 1; }
    const alreadyBuilt = isT ? seenT <= builtT : seenB <= builtB;
    if (alreadyBuilt) continue;
    if (queued >= 2) break; // keep the frontier tight: next two rungs only
    orders.push({ verb: 'BUILD', what: step.what, where: { x: step.x, z: step.z }, when: { goldGte: step.cost } });
    queued += 1;
  }

  if ((now.works?.standing ?? 0) > 0) orders.push({ verb: 'REPAIR_UNDER', pct: 60 });

  const seam = bestSeam(view);
  const wave = now.wave ?? 0;
  if (seam && wave < 11 && sameKeyCount === 0) {
    // Drain-alarm probe: out-of-zone BUILD in the dead band x=+/-7, near the seam,
    // gated so it fails (order_failure surprise view) the moment the held seam drains.
    const px = seam.x <= 0 ? -7 : 7;
    if (Math.hypot(px - seam.x, 0) <= 5.6) {
      const gate = Math.max(1, Math.floor(now.gold + Math.min(12, seam.remaining ?? 12)));
      orders.push({ verb: 'BUILD', what: 'palisade', where: { x: px, z: seam.z }, when: { goldGte: gate } });
    }
  }
  if (seam) {
    orders.push({ verb: 'HARVEST', seam: seam.id });
    orders.push({ verb: 'HOLD', pos: { x: seam.x, z: seam.z } });
  } else {
    orders.push({ verb: 'HOLD', pos: { x: 0, z: 9 } });
  }
  return orders;
}

const rl = createInterface({ input: sim.stdout });
rl.on('line', (line) => {
  let msg;
  try { msg = JSON.parse(line); } catch { return; }
  if (process.env.GR_VIEWDUMP) {
    try { appendFileSync(process.env.GR_VIEWDUMP, line + '\n'); } catch {}
  }
  if (msg.schema === 'goldrush.view.v1') {
    const key = `${msg.now?.timers?.runSeconds}|${msg.now?.wave}|${msg.now?.gold}|${msg.now?.works?.standing}`;
    if (key === lastKey) { sameKeyCount += 1; } else { sameKeyCount = 0; lastKey = key; }
    let orders;
    if (sameKeyCount >= 2) {
      // Degraded minimal legal array after repeated re-serves (rejection loop guard).
      orders = msg.now?.pendingSecure
        ? [{ verb: 'SECURE_CHOICE', choice: 'bank' }]
        : [{ verb: 'HOLD', pos: { x: 0, z: 9 } }];
    } else {
      orders = ordersFor(msg);
    }
    sim.stdin.write(JSON.stringify(orders) + '\n');
    sent += 1;
  } else if (typeof msg.secured === 'boolean') {
    console.log('OUTCOME ' + line);
    writeFileSync(tape + '.outcome.json', line + '\n');
    console.log('sent ' + sent + ' submissions');
  }
});
sim.on('close', (code) => process.exit(code ?? 0));
