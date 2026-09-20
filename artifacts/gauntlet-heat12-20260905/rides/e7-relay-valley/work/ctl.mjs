#!/usr/bin/env node
// gen 59 controller for e7-relay-valley / seed e7-relay-valley-01 / trail
// Runner + controller in one file (shell redirection is refused in this arena).
//
// Named change from generation 38 (which reached w15/460.3s):
//   1. TWO stockpiles (west r2 + east r3) instead of one -> split both thief lanes.
//   2. NEVER build a sentry_beacon: beacon_dynamo stays out of the eligible draft
//      pool (Progression.eligibleDefs:314), so the fillers open two picks sooner.
//      The relay light is a TURRET.
//   3. Draft policy = RETIRE THE POOL. field_dressing (the only unbounded heal)
//      is only offered when fewer than three NON-FILLER cards remain eligible
//      (Progression.rollOffer:253/267), so every pick is chosen to max out a card
//      TYPE as fast as possible. Plating first (heal is 0.3 x maxHp).
//   4. Small arrays + BLAST_AT every view: a failing HARVEST tail buys surprise
//      views, and each view is another blast window. Arrays are ~10 orders so the
//      reel byte ceiling is never in play.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const DIR = '/tmp/heat12-038cc280/artifacts/heat12/opus/e7-relay-valley';
const REPO = '/private/tmp/heat12-038cc280';
const label = process.argv[2] || 'tune-1';
const tape = path.join(DIR, `${label}-tape.json`);
const logPath = path.join(DIR, `${label}-views.jsonl`);
const scored = process.argv[3] === 'scored';

const MAX_STACKS = {
  double_tap_coil: 3, heavy_spark: 3, long_resonator: 2, split_spark: 2,
  tinkers_plating: 3, spring_heels: 3, pan_legend: 2, auto_pan: 1,
  prospectors_luck: 2, beacon_dynamo: 2, powder_charge: 2, wide_ring: 2, quick_fuse: 2,
};
// usefulness tiebreak when two cards are equally close to retiring
const USEFUL = { tinkers_plating: 9, heavy_spark: 8, double_tap_coil: 7, split_spark: 6,
  powder_charge: 5, quick_fuse: 5, wide_ring: 4, long_resonator: 3,
  prospectors_luck: 2, pan_legend: 1, spring_heels: 0, auto_pan: 0, beacon_dynamo: -1 };

const CLAIM = { x: 0, z: 12 };
// relay-site build zones (authored): r1 x-50..-40, r2 x-30..-20, r3 x20..30, r4 x40..50, z36..46
const RELAY_TURRET = { x: -25, z: 41 };   // relay-site-r2  -> the secure latch
const STOCK_W = { x: -28, z: 38 };        // relay-site-r2  -> west thief lane
const STOCK_E = { x: 25, z: 41 };         // relay-site-r3  -> east thief lane

const stacks = {};
let picks = 0, playbookName = 0, lastLog = null;
const state = { blasts: 0, fillersSeen: 0, dressings: 0 };

function pickUpgrade(offer) {
  const ids = offer.map((o) => o.id);
  if (ids.includes('field_dressing')) return 'field_dressing';
  // plating first while it is not maxed: the heal scales with maxHp
  if (ids.includes('tinkers_plating') && (stacks.tinkers_plating ?? 0) < 3) return 'tinkers_plating';
  const nonFiller = ids.filter((id) => MAX_STACKS[id] !== undefined);
  if (nonFiller.length) {
    // retire the type that is closest to maxed; tiebreak on usefulness
    nonFiller.sort((a, b) => {
      const ra = MAX_STACKS[a] - (stacks[a] ?? 0), rb = MAX_STACKS[b] - (stacks[b] ?? 0);
      if (ra !== rb) return ra - rb;
      return (USEFUL[b] ?? 0) - (USEFUL[a] ?? 0);
    });
    return nonFiller[0];
  }
  if (ids.includes('sharpen')) return 'sharpen';
  return ids[0];
}

function build(what, where, goldGte) {
  return { verb: 'BUILD', what, where, when: { goldGte } };
}

function decide(view) {
  const now = view.now || {};
  const sp = view.stablePrefix || {};
  // 1. secure boundary -> blank line: no tape entry, the configured bank default fires
  if (now.pendingSecure) return null;

  const orders = [];
  if (Array.isArray(now.pendingOffer) && now.pendingOffer.length) {
    const id = pickUpgrade(now.pendingOffer);
    stacks[id] = (stacks[id] ?? 0) + 1;
    picks += 1;
    if (id === 'field_dressing') state.dressings += 1;
    orders.push({ verb: 'PICK_UPGRADE', id });
  }

  // 2. the era gate: a relay site lit by a RUNNING PROGRAM.
  const pb = now.playbookUse || {};
  const works = now.works || {};
  const entries = Array.isArray(works.entries) ? works.entries : [];
  const turretInZone = entries.some(
    (e) => e.id === 'turret' && !e.wrecked && e.position && e.position.z >= 36 && e.position.z <= 46,
  );
  if (now.playbookUse && pb.objectiveMet !== true && turretInZone) {
    // a fresh name records every array already submitted and runs it; the program
    // holds the wheel until my next submission, which is the window syncProgramRelays reads.
    playbookName += 1;
    const arr = [{ verb: 'PLAYBOOK_USE', name: `valley-${playbookName}` }];
    if (orders.length) return [...orders, ...arr];
    return arr;
  }

  // 3. blast: free damage, and a failed throw buys a surprise view (another window)
  orders.push({ verb: 'BLAST_AT', pos: { x: CLAIM.x, z: CLAIM.z } });
  state.blasts += 1;

  // 4. the ladder: relay turret first (it IS the secure), then both thief decoys.
  //    Plan-time affordability only; never a pending gate that drags the worker.
  const byKind = works.byKind || {};
  const gold = now.gold ?? 0;
  const nTurret = byKind.turret ?? 0;
  const nStock = byKind.stockpile ?? 0;
  const costs = {};
  for (const b of sp.mechanics?.buildables ?? []) costs[b.id] = b.costs || [];
  const priceOf = (id, count) => {
    const c = costs[id];
    if (!c || !c.length) return id === 'turret' ? 50 : 60;
    return c[Math.min(count, c.length - 1)];
  };
  if (nTurret < 1) {
    const p = priceOf('turret', nTurret);
    if (gold >= p) orders.push(build('turret', RELAY_TURRET, p));
  } else if (nStock < 2) {
    const p = priceOf('stockpile', nStock);
    if (gold >= p) orders.push(build('stockpile', nStock === 0 ? STOCK_W : STOCK_E, p));
  }

  // 5. the economy tail. Drain the nearest live seam in a block, then the next.
  //    Failures are free (the Prospector already stands there) and they are the clock.
  // now.seams publishes x/z as NULL for an inactive seam: admit only finite ones,
  // and NEVER let the chain go empty (an empty tail stops the clock AND the purse).
  const live = (now.seams || []).filter(
    (s) => s.active === true && Number.isFinite(s.x) && Number.isFinite(s.z),
  );
  const d = (s) => Math.hypot(s.x - CLAIM.x, s.z - CLAIM.z);
  live.sort((a, b) => d(a) - d(b));
  const chain = live.slice(0, 2);
  const room = 31 - orders.length;
  if (chain.length) {
    // drain the nearest seam in a block before walking to the next
    const per = Math.max(1, Math.floor(room / chain.length));
    for (const s of chain) for (let i = 0; i < per; i += 1) orders.push({ verb: 'HARVEST', seam: s.id });
  } else {
    // every seam depleted: name the authored ids anyway. They fail where the
    // Prospector already stands, which costs nothing and buys surprise views.
    const ids = (now.seams || []).map((s) => s.id).filter((x) => typeof x === 'string');
    for (let i = 0; i < room && ids.length; i += 1) orders.push({ verb: 'HARVEST', seam: ids[i % ids.length] });
  }
  // terminal anchor that can never be filtered away, with hardcoded finite numbers
  orders.push({ verb: 'HOLD', pos: { x: 12, z: 18 } });
  // last line of defence: refuse to send anything non-finite (a refused array
  // silently leaves the previous, already-drained order set in force)
  const ok = (v) => typeof v !== 'number' || Number.isFinite(v);
  const clean = orders.filter((o) => JSON.stringify(o) !== undefined && Object.values(o).every(
    (v) => (v && typeof v === 'object' ? Object.values(v).every(ok) : ok(v)),
  ));
  return clean.length ? clean : [{ verb: 'HOLD', pos: { x: 12, z: 18 } }];
}

// ---- runner ----
const args = ['scripts/gr-sim.mjs', '--contract', 'e7-relay-valley', '--seed', 'e7-relay-valley-01',
  '--difficulty', 'trail', '--tape', tape];
const child = spawn('node', args, { cwd: REPO, stdio: ['pipe', 'pipe', 'pipe'] });
let buf = '', outcome = null, views = 0, lastView = null;
const logFh = fs.createWriteStream(logPath);
child.stderr.on('data', (d) => { const s = d.toString(); if (/reject/i.test(s)) process.stderr.write(s); });
child.stdout.on('data', (chunk) => {
  buf += chunk.toString();
  let nl;
  while ((nl = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, nl); buf = buf.slice(nl + 1);
    if (!line.trim()) continue;
    let msg; try { msg = JSON.parse(line); } catch { continue; }
    if (msg.schema === 'goldrush.view.v1') {
      views += 1; lastView = msg;
      const n = msg.now || {};
      logFh.write(JSON.stringify({ v: views, t: n.timers?.runSeconds, w: n.wave, hp: n.hero?.hp,
        mx: n.hero?.maxHp, lv: n.hero?.level, g: n.gold, pan: n.score?.goldPanned,
        alive: n.threats?.alive, th: n.threats?.thieves, wk: n.works?.byKind,
        pbMet: n.playbookUse?.objectiveMet, lit: n.playbookUse?.relaysLitByProgram,
        off: (n.pendingOffer || []).map((o) => o.id), picks }) + '\n');
      const orders = decide(msg);
      child.stdin.write(orders === null ? '\n' : JSON.stringify(orders) + '\n');
    } else if (msg.secured !== undefined) {
      outcome = msg;
    }
  }
});
child.on('close', () => {
  logFh.end();
  let env = {};
  try {
    const t = JSON.parse(fs.readFileSync(tape, 'utf8'));
    const il = t.inputLog || {};
    env = { durationTicks: il.durationTicks, entries: (il.entries || []).length,
      lastEntryTick: (il.entries || []).length ? il.entries[il.entries.length - 1].tick : null,
      bytes: fs.statSync(tape).size, tapeHash: t.eventLogHash || (t.meta && t.meta.eventLogHash) };
  } catch (e) { env = { error: String(e) }; }
  const row = { ...(outcome || { secured: false, note: 'no outcome line' }), tape,
    scored, runsSoFar: null, worldModel: 'sim-import', label, views, picks,
    stacks, envelope: env, state };
  fs.writeFileSync(path.join(DIR, `${label}-result.json`), JSON.stringify(row, null, 2));
  console.log(JSON.stringify({ label, ...(outcome || {}), env, picks, stacks, views }, null, 1));
});
