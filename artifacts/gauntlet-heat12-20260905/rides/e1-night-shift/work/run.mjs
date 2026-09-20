// Gold Rush heat 12 — e1-night-shift runner + controller (gen 56)
// Spawns gr-sim, drives the NDJSON door, logs every view, writes gauntlet-outcome.json on exit.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const DIR = '/tmp/heat12-038cc280/artifacts/heat12/opus/e1-night-shift';
const REPO = '/private/tmp/heat12-038cc280';
const CONTRACT = 'e1-night-shift';
const SEED = 'e1-night-shift-01';
const WORLD_MODEL = 'sim-import';

const tapeName = process.argv[2] || 'tune-1-tape.json';
const TAPE = path.join(DIR, tapeName);

// ---------- controller ----------
const CLAIM = { x: 0, z: 12 };
const d2 = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);

// Ladder: interleaved turret/beacon, cumulative-gated so a cheap rung can never
// steal gold an expensive one is waiting for. Prices come from the view.
// Beacon rungs 5 and 6 (75g, 95g) are dropped: a turret tier-2 at 150g buys ~37 dps
// against a beacon's ~20, and the 7 pre-placed WRECKED lantern posts already fill
// 7 of lantern_post's 8 slots, so lantern rungs can never retire.
const LADDER = [
  { id: 'turret' }, { id: 'sentry_beacon' },
  { id: 'turret' }, { id: 'sentry_beacon' },
  { id: 'turret' }, { id: 'sentry_beacon' },
  { id: 'turret' }, { id: 'sentry_beacon' },
];

// More candidates than slots; ring the welded hero at the claim (0,12).
const SPOTS = {
  turret: [
    { x: -5, z: 12 }, { x: 5, z: 12 }, { x: 0, z: 17 }, { x: 0, z: 8 },
    { x: -6, z: 17 }, { x: 6, z: 17 }, { x: -6, z: 8 }, { x: 6, z: 8 },
    { x: -9, z: 14 }, { x: 9, z: 14 }, { x: 0, z: 21 }, { x: -10, z: 10 },
    { x: 10, z: 10 }, { x: 3, z: 20 }, { x: -3, z: 20 },
  ],
  sentry_beacon: [
    { x: -3, z: 15 }, { x: 3, z: 15 }, { x: -3, z: 9 }, { x: 3, z: 9 },
    { x: 0, z: 19 }, { x: -8, z: 12 }, { x: 8, z: 12 }, { x: -7, z: 18 },
    { x: 7, z: 18 }, { x: 0, z: 6 }, { x: -8, z: 7 }, { x: 8, z: 7 },
    { x: -12, z: 15 }, { x: 12, z: 15 },
  ],
  lantern_post: [
    { x: -11, z: 12 }, { x: 11, z: 12 }, { x: 0, z: 24 }, { x: 0, z: 2 },
    { x: -13, z: 18 }, { x: 13, z: 18 }, { x: -13, z: 6 }, { x: 13, z: 6 },
    { x: -16, z: 12 }, { x: 16, z: 12 },
  ],
  stockpile: [
    { x: -4, z: 22 }, { x: 4, z: 22 }, { x: -8, z: 22 }, { x: 8, z: 22 },
    { x: 0, z: 26 }, { x: -12, z: 22 },
  ],
};

const GROUND_REASONS = /out_of_zone|out_of_reach|collision|cap_reached|UNREACHABLE|outside buildable/i;
const blacklist = new Set(); // "id@x,z" — GROUND refusals only, never insufficient_gold
const attempts = new Map();

const key = (id, p) => `${id}@${p.x},${p.z}`;

function priceOf(view, id, standingCount) {
  const def = (view.stablePrefix.mechanics.buildables || []).find((b) => b.id === id);
  if (!def) return Infinity;
  const costs = def.costs || [def.cost];
  if (standingCount < costs.length) return costs[standingCount];
  // ceil-to-5 continuation of the curve
  let c = costs[costs.length - 1];
  for (let i = costs.length; i <= standingCount; i++) c = Math.ceil((c * 1.3) / 5) * 5;
  return c;
}
function maxCountOf(view, id) {
  const def = (view.stablePrefix.mechanics.buildables || []).find((b) => b.id === id);
  return def ? (def.maxCount ?? 99) : 0;
}

const PLATING = /plating|dressing|hearty|vital|health|armor|armour|tough|constitution/i;
const DAMAGE = /spark|damage|coil|tap|volley|power|pierce|blast/i;
function scoreUpgrade(o) {
  const t = `${o.id} ${o.name} ${o.effectText || ''}`;
  if (PLATING.test(t)) return 100;
  if (DAMAGE.test(t)) return 50;
  return 10;
}

function decide(view, st) {
  const now = view.now;
  const orders = [];

  // 0. Secure boundary: answer with a blank line so the configured `bank` default
  //    fires without recording a terminal-tick entry (F-HEAT11-1 insurance).
  if (now.pendingSecure) return null;

  // 1. Draft first — replace semantics mean the pick must own the array's head.
  if (Array.isArray(now.pendingOffer) && now.pendingOffer.length) {
    const best = [...now.pendingOffer].sort((a, b) => scoreUpgrade(b) - scoreUpgrade(a))[0];
    orders.push({ verb: 'PICK_UPGRADE', id: best.id });
  }

  // 2. Learn from refusals: GROUND poisons the coordinate, ECONOMY poisons nothing.
  for (const rec of now.orders || []) {
    const o = rec.order || rec;
    if (rec.status !== 'failed' || o.verb !== 'BUILD' || !o.where) continue;
    const reason = `${rec.reason || ''} ${rec.detail || ''}`;
    if (GROUND_REASONS.test(reason)) blacklist.add(key(o.what, o.where));
    else if (/insufficient_gold/i.test(reason)) { /* transient — retry */ }
    else {
      const k = key(o.what, o.where);
      attempts.set(k, (attempts.get(k) || 0) + 1);
      if ((attempts.get(k) || 0) >= 5) blacklist.add(k);
    }
  }

  const byKind = now.works.byKind || {};
  const entries = now.works.entries || [];
  const occupied = entries.map((e) => e.position).filter(Boolean);
  const free = (id, p) => !blacklist.has(key(id, p)) && !occupied.some((q) => d2(q, p) < 2.6);

  // 3. Build ladder — plan-time affordable, cumulative gated.
  const built = { ...byKind };
  const reserved = [];
  const batch = [];
  let cum = 0;
  for (const rung of LADDER) {
    const have = (built[rung.id] || 0);
    if (have >= maxCountOf(view, rung.id)) continue;
    const price = priceOf(view, rung.id, have);
    const spot = (SPOTS[rung.id] || []).find(
      (p) => free(rung.id, p) && !reserved.some((q) => d2(q, p) < 2.6),
    );
    if (!spot) continue;
    cum += price;
    if (cum > now.gold) break; // only emit what one trip can already pay for
    built[rung.id] = have + 1;
    reserved.push(spot);
    batch.push({ verb: 'BUILD', what: rung.id, where: spot, when: { goldGte: cum } });
    if (batch.length >= 6) break;
  }
  orders.push(...batch);

  // Retire the ladder per-id against what is actually PLACEABLE: pre-placed works
  // already occupy slots, so "wanted" must be clamped by the live cap.
  const wanted = {};
  for (const r of LADDER) wanted[r.id] = (wanted[r.id] || 0) + 1;
  const ladderDone = Object.entries(wanted).every(([id, n]) =>
    (byKind[id] || 0) >= Math.min(n, maxCountOf(view, id)))
    // ...or the ladder is genuinely stuck: nothing emittable while the purse is full.
    || (batch.length === 0 && now.gold >= 190);

  // 4. Late cap-raisers: stockpiles lift the 200 bank cap by 150 each. Bought late so
  //    the thief window is short, and only once the fort stands.
  if (ladderDone && now.wave >= 17) {
    const have = byKind.stockpile || 0;
    if (have < maxCountOf(view, 'stockpile')) {
      const price = priceOf(view, 'stockpile', have);
      const spot = SPOTS.stockpile.find((p) => free('stockpile', p) && !reserved.some((q) => d2(q, p) < 2.6));
      if (spot && now.gold >= price) {
        orders.push({ verb: 'BUILD', what: 'stockpile', where: spot, when: { goldGte: price } });
        reserved.push(spot);
      }
    }
  }

  // 5. The live gold sink: turret tier upgrades. CONTEXT_ACTION does not travel,
  //    so it needs a MOVE_TO in front of it. Gate on STATE (tier), not a gold instant.
  if (ladderDone && orders.filter((o) => o.verb === 'BUILD').length === 0) {
    const TIER_COST = [0, 150, 300];
    const t = entries.find((e) => e.id === 'turret' && !e.wrecked && (e.tier ?? 1) < 2);
    if (t && t.position) {
      const cost = TIER_COST[Math.max(1, t.tier ?? 1)];
      if (now.gold >= cost) {
        orders.push({ verb: 'MOVE_TO', pos: { x: t.position.x, z: t.position.z } });
        orders.push({ verb: 'CONTEXT_ACTION', action: 'upgrade', target: { id: 'turret', index: t.index } });
      }
    }
  }

  // 6. Mend only when there is something damaged AND money to pay for it —
  //    a travelling verb that fails is not a free decision point.
  const wrecked = now.works.wrecked || 0;
  const hurt = (now.works.hp ?? 0) < (now.works.maxHp ?? 0) * 0.8;
  if ((wrecked > 0 || hurt) && now.gold >= 40) orders.push({ verb: 'REPAIR_UNDER', pct: 70 });

  // 7. Free supplementary damage.
  if (now.blastReadyInMs === 0) {
    orders.push({ verb: 'BLAST_AT', pos: { x: CLAIM.x, z: CLAIM.z + 4 } });
  }

  // 8. The economy tail: drain the nearest live seam in a block before walking on.
  //    Emitted unconditionally — a HARVEST that fails costs nothing (the Prospector
  //    is already standing there) and buys the decision point.
  const live = (now.seams || []).filter((s) => s.active !== false);
  const ranked = [...live].sort((a, b) => d2(a, CLAIM) - d2(b, CLAIM));
  const chain = ranked.length ? ranked : (now.seams || []);
  let slot = orders.length;
  outer: for (let round = 0; round < 6; round++) {
    for (const s of chain.slice(0, 3)) {
      for (let i = 0; i < 3; i++) {
        if (slot >= 31) break outer;
        orders.push({ verb: 'HARVEST', seam: s.id });
        slot++;
      }
    }
  }

  // 9. Terminal anchor that can never be filtered away.
  if (orders.length < 32) orders.push({ verb: 'HOLD', pos: { x: CLAIM.x - 1, z: CLAIM.z + 2 } });
  return orders.slice(0, 32);
}

// ---------- runner ----------
const log = [];
let lastSig = null;
let calls = 0;
let lastOutcome = null;
let lastView = null;

const child = spawn('node', [
  path.join(REPO, 'scripts/gr-sim.mjs'),
  '--contract', CONTRACT, '--seed', SEED, '--difficulty', 'trail', '--tape', TAPE,
], { cwd: REPO, stdio: ['pipe', 'pipe', 'pipe'] });

let buf = '';
child.stdout.on('data', (chunk) => {
  buf += chunk.toString();
  let nl;
  while ((nl = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, nl); buf = buf.slice(nl + 1);
    if (!line.trim()) continue;
    let j; try { j = JSON.parse(line); } catch { continue; }
    if (!j.schema) { lastOutcome = j; continue; }
    lastView = j;
    const n = j.now;
    log.push({
      t: n.timers?.runSeconds, w: n.wave, hp: n.hero.hp, mx: n.hero.maxHp, g: n.gold,
      pan: n.score?.goldPanned, stolen: n.score?.goldStolen, alive: n.threats?.alive,
      wr: n.threats?.wreckers, th: n.threats?.thieves, works: JSON.stringify(n.works.byKind),
      wrecked: n.works.wrecked, lvl: n.hero.level,
    });
    const orders = decide(j, {});
    if (orders === null) { child.stdin.write('\n'); continue; }
    const sig = JSON.stringify(orders);
    if (sig === lastSig && !n.pendingOffer) { child.stdin.write('\n'); continue; }
    lastSig = sig; calls++;
    child.stdin.write(sig + '\n');
  }
});
child.stderr.on('data', (d) => { const s = d.toString(); if (/rejected/.test(s)) console.error('STDERR', s.slice(0, 300)); });

child.on('exit', () => {
  fs.writeFileSync(path.join(DIR, tapeName.replace('-tape.json', '-viewlog.json')), JSON.stringify(log, null, 0));
  console.log('--- view log ---');
  for (const r of log) console.log(`w${r.w} t${(r.t ?? 0).toFixed(1)} hp${(r.hp ?? 0).toFixed(0)}/${r.mx} g${r.g} pan${r.pan} stole${r.stolen} alive${r.alive} wr${r.wr} th${r.th} wreck${r.wrecked} ${r.works}`);
  console.log('OUTCOME', JSON.stringify(lastOutcome));
  console.log('calls(arrays sent)', calls);
  // envelope
  let env = null;
  try {
    const tape = JSON.parse(fs.readFileSync(TAPE, 'utf8'));
    const il = tape.inputLog || tape;
    const entries = il.entries || [];
    env = {
      durationTicks: il.durationTicks,
      lastEntryTick: entries.length ? entries[entries.length - 1].t : null,
      entries: entries.length,
      bytes: fs.statSync(TAPE).size,
    };
    console.log('ENVELOPE', JSON.stringify(env));
  } catch (e) { console.log('tape read failed', e.message); }

  // intermediate-results law: write the best-so-far row after EVERY run
  const OUT = path.join(DIR, 'gauntlet-outcome.json');
  let prev = null;
  try { prev = JSON.parse(fs.readFileSync(OUT, 'utf8')); } catch {}
  const runs = (prev?.runsSoFar || 0) + 1;
  const scored = /^attempt-/.test(tapeName);
  const scoredAttempts = (prev?.scoredAttempts || 0) + (scored ? 1 : 0);
  const better = !prev || (lastOutcome?.secured && !prev.secured)
    || (!!lastOutcome?.secured === !!prev.secured
        && ((lastOutcome?.waves ?? 0) > (prev.waves ?? 0)
            || ((lastOutcome?.waves ?? 0) === (prev.waves ?? 0) && (lastOutcome?.gold ?? 0) > (prev.gold ?? 0))));
  const row = better
    ? { ...lastOutcome, tape: TAPE, scored, envelope: env }
    : { ...prev };
  row.runsSoFar = runs; row.scoredAttempts = scoredAttempts; row.worldModel = WORLD_MODEL;
  fs.writeFileSync(OUT, JSON.stringify(row, null, 2));
  console.log('wrote gauntlet-outcome.json', JSON.stringify(row).slice(0, 300));
});
