#!/usr/bin/env node
// Gold Rush — e2-incline rider. Claude Opus 5, generation 8.
// Objective: survive to wave 12 (secureWave 12; maybeSecureRun gates on wave only,
// there is no boss-defeat requirement). Hero is a FIXED shooter on the loss stake
// (-24,-18); the standing-order actor is the Prospector.
//
// Usage: node rider.mjs --tape <path> [--plan <name>]

import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';
import fs from 'node:fs';
import path from 'node:path';

const argv = process.argv.slice(2);
const arg = (k, d) => {
  const i = argv.indexOf(k);
  return i >= 0 ? argv[i + 1] : d;
};

const TAPE = arg('--tape', 'probe-run.json');
const PLAN = arg('--plan', 'A');
const OUTDIR = '/tmp/heat11-5e7a7c0b/artifacts/heat11/opus/e2-incline';
const REPO = '/tmp/heat11-5e7a7c0b';

// ---------------------------------------------------------------- the plan
// Loss stake / hero: (-24,-18). Build zone "lower-yard": x -36..36, z -30..-7.
const STAKE = { x: -24, z: -18 };

// Turrets (range 16, 57 dps) ring the stake close enough to cover every approach
// but spread so their collision boxes never touch. Beacons (range 8) sit inside.
const LADDERS = {
  // A: turrets first, then beacons — gen-7's dps-per-gold ordering.
  A: [
    { what: 'turret', where: { x: -20, z: -14 }, cost: 50 },
    { what: 'turret', where: { x: -28, z: -22 }, cost: 70 },
    { what: 'turret', where: { x: -20, z: -22 }, cost: 95 },
    { what: 'turret', where: { x: -28, z: -14 }, cost: 125 },
    { what: 'sentry_beacon', where: { x: -24, z: -13 }, cost: 25 },
    { what: 'sentry_beacon', where: { x: -24, z: -23 }, cost: 35 },
    { what: 'sentry_beacon', where: { x: -19, z: -18 }, cost: 45 },
    { what: 'sentry_beacon', where: { x: -29, z: -18 }, cost: 55 },
  ],
  // B: one turret, then a cheap palisade shell (10g x N) to soak contact, then more turrets.
  B: [
    { what: 'turret', where: { x: -20, z: -14 }, cost: 50 },
    { what: 'sentry_beacon', where: { x: -24, z: -13 }, cost: 25 },
    { what: 'turret', where: { x: -28, z: -22 }, cost: 70 },
    { what: 'sentry_beacon', where: { x: -24, z: -23 }, cost: 35 },
    { what: 'turret', where: { x: -20, z: -22 }, cost: 95 },
    { what: 'sentry_beacon', where: { x: -19, z: -18 }, cost: 45 },
    { what: 'turret', where: { x: -28, z: -14 }, cost: 125 },
    { what: 'sentry_beacon', where: { x: -29, z: -18 }, cost: 55 },
  ],
};
const LADDER = LADDERS[PLAN] ?? LADDERS.A;

// Upgrade preference. gen-6 measured tinkers_plating (+maxHp) as the single
// biggest survival lever on a starved economy; damage next, then utility.
const UPGRADE_RANK = [
  'tinkers_plating', 'field_dressing', 'heavy_spark', 'double_tap_coil',
  'split_spark', 'long_barrel', 'spring_heels',
];

const dist = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);

function chooseUpgrade(offer) {
  for (const id of UPGRADE_RANK) {
    const hit = offer.find((o) => o.id === id);
    if (hit) return hit.id;
  }
  return offer[0].id;
}

// Which ladder rung is still missing, given what stands.
function nextRung(view) {
  const byKind = view.now.works.byKind ?? {};
  const seen = {};
  for (const rung of LADDER) {
    seen[rung.what] = (seen[rung.what] ?? 0) + 1;
    if ((byKind[rung.what] ?? 0) < seen[rung.what]) return rung;
  }
  return null;
}

function buildOrders(view, state) {
  const out = [];
  const now = view.now;

  // 1. The draft owns the tick when it is live. REPLACE semantics mean the rest
  //    of the array must still be resent underneath it (gen-5's lesson).
  if (Array.isArray(now.pendingOffer) && now.pendingOffer.length > 0) {
    out.push({ verb: 'PICK_UPGRADE', id: chooseUpgrade(now.pendingOffer) });
  }

  // 2. Bank the moment the county offers.
  if (now.pendingSecure) {
    out.unshift({ verb: 'SECURE_CHOICE', choice: 'bank' });
    return out;
  }

  // 3. Mend before the wreckers finish anything. Conditional: falls through
  //    when nothing qualifies, so it costs no tick while the works are healthy.
  if ((now.works.standing ?? 0) > 0) out.push({ verb: 'REPAIR_UNDER', pct: 60 });

  // 4. Exactly one gated BUILD per array — gen-7's fix for cheap-rung starvation.
  const rung = nextRung(view);
  if (rung) {
    out.push({
      verb: 'BUILD', what: rung.what, where: rung.where,
      when: { goldGte: rung.cost },
    });
  }

  // 5. Everything left is throughput: pan the nearest live seam, chained.
  const active = (now.seams ?? []).filter(
    (s) => s.active && Number.isFinite(s.x) && Number.isFinite(s.z),
  );
  const pros = now.prospector ?? STAKE;
  active.sort((a, b) => dist(pros, a) - dist(pros, b));
  const room = 32 - out.length;
  if (active.length > 0) {
    // Weight the nearest seam heavily; give the runner-up a tail so a depletion
    // mid-wave does not idle the Prospector.
    const nearest = active[0];
    const second = active[1];
    const nTail = second && dist(pros, second) < 40 ? 4 : 0;
    for (let i = 0; i < room - nTail; i += 1) out.push({ verb: 'HARVEST', seam: nearest.id });
    for (let i = 0; i < nTail; i += 1) out.push({ verb: 'HARVEST', seam: second.id });
  }
  state.lastSeam = active[0]?.id ?? null;
  return out.slice(0, 32);
}

// ---------------------------------------------------------------- transport
const tapePath = path.isAbsolute(TAPE) ? TAPE : path.join(OUTDIR, TAPE);
const child = spawn('node', [
  'scripts/gr-sim.mjs',
  '--contract', 'e2-incline',
  '--seed', 'e2-incline-01',
  '--difficulty', 'trail',
  '--tape', tapePath,
], { cwd: REPO, stdio: ['pipe', 'pipe', 'pipe'] });

const state = { lastSeam: null };
const trace = [];
let outcome = null;
let calls = 0;
let stderrTail = [];

child.stderr.on('data', (d) => {
  const s = String(d);
  stderrTail.push(s);
  if (stderrTail.length > 40) stderrTail.shift();
  if (s.includes('rejected orders')) process.stderr.write('REJECT: ' + s);
});

const rl = createInterface({ input: child.stdout });
rl.on('line', (line) => {
  if (!line.startsWith('{')) return;
  let msg;
  try { msg = JSON.parse(line); } catch { return; }

  if (msg.schema === 'goldrush.view.v1') {
    const n = msg.now;
    trace.push({
      wave: n.wave, t: Math.round(n.timers.runSeconds), gold: n.gold,
      hp: `${Math.round(n.hero.hp)}/${n.hero.maxHp}`, lvl: n.hero.level,
      works: n.works.standing, wrecked: n.works.wrecked,
      byKind: n.works.byKind, alive: n.threats.alive,
      spawned: n.threats.spawnedTotal, killed: n.threats.defeatedTotal,
      panned: n.score.goldPanned, stolen: n.score.goldStolen,
      needsRider: n.needsRider,
      offer: (n.pendingOffer ?? []).map((o) => o.id).join('|') || null,
      secure: n.pendingSecure ? JSON.stringify(n.pendingSecure) : null,
    });
    const orders = buildOrders(msg, state);
    calls += 1;
    child.stdin.write(JSON.stringify(orders) + '\n');
    return;
  }
  if (typeof msg.secured === 'boolean') outcome = msg;
});

child.on('close', () => {
  const result = { outcome, calls, plan: PLAN, tape: tapePath, trace };
  fs.writeFileSync(path.join(OUTDIR, 'last-run.json'), JSON.stringify(result, null, 1));
  console.log('=== TRACE ===');
  for (const t of trace) {
    console.log(
      `w${String(t.wave).padStart(2)} t=${String(t.t).padStart(3)}s gold=${String(t.gold).padStart(3)}` +
      ` hp=${t.hp.padStart(7)} lvl=${t.lvl} works=${t.works}/w${t.wrecked} ${JSON.stringify(t.byKind)}` +
      ` alive=${t.alive} sp=${t.spawned} k=${t.killed} pan=${t.panned} stolen=${t.stolen}` +
      (t.offer ? ` OFFER[${t.offer}]` : '') + (t.secure ? ` SECURE${t.secure}` : '') +
      (t.needsRider ? ' !RIDER' : ''),
    );
  }
  console.log('=== OUTCOME ===');
  console.log(JSON.stringify(outcome));
  if (!outcome) console.log('stderr tail:\n' + stderrTail.slice(-8).join(''));
});
