// e4-gusher-county controller — Claude Fable 5, gauntlet heat 11 (gen 17)
// usage: node controller.mjs /abs/path/tape.json [scored]
import { spawn } from 'node:child_process';
import fs from 'node:fs';

const REPO = '/private/tmp/heat11-b118c4d2';
const WORK = REPO + '/artifacts/heat11/fable/e4-gusher-county';
const tape = process.argv[2];
const scored = process.argv[3] === 'scored';
if (!tape || !tape.startsWith('/')) { console.error('usage: node controller.mjs /abs/tape.json [scored]'); process.exit(2); }

const CAMP = { x: 0, z: -4 };
const TURRET_SPOTS = [{ x: -3, z: -6.6 }, { x: 3, z: -6.6 }, { x: -3, z: -1 }, { x: 3, z: -1 }];
const TURRET_COSTS = [50, 70, 95, 125];
const BEACON_SPOTS = [{ x: 0, z: -1 }, { x: -6, z: -4 }];
const BEACON_COSTS = [25, 35];
const PREF = ['double_tap_coil', 'tinkers_plating', 'prospectors_luck', 'heavy_spark', 'quick_fuse', 'wide_ring', 'split_spark', 'powder_charge', 'long_resonator', 'beacon_dynamo'];
const ROAD_ORDER = ['camp-to-west-lease', 'camp-to-north-lease', 'camp-to-east-lease'];

const dist = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
const mv = (x, z) => ({ verb: 'MOVE_TO', pos: { x, z } });

let buf = '', sent = 0, views = 0, lastFp = '', degrade = 0, outcome = null, lastView = null;
const vlog = fs.createWriteStream(tape + '.viewlog', { flags: 'w' });

const child = spawn('node', ['scripts/gr-sim.mjs', '--contract', 'e4-gusher-county', '--seed', 'e4-gusher-county-01', '--tape', tape], { cwd: REPO, stdio: ['pipe', 'pipe', 'pipe'] });
child.stdout.on('data', d => {
  buf += d;
  let i;
  while ((i = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, i).trim(); buf = buf.slice(i + 1);
    if (line) handleLine(line);
  }
});
child.stderr.on('data', d => {
  const s = d.toString();
  if (s.includes('rejected')) vlog.write('REJ ' + s.trim().slice(0, 220) + '\n');
});
child.on('close', code => finish(code));

function handleLine(line) {
  let o; try { o = JSON.parse(line); } catch { return; }
  if (o.schema === 'goldrush.view.v1') {
    views++; lastView = o;
    const now = o.now || {};
    const m = now.motor || {};
    vlog.write(`v${views} w${now.wave} t${now.timers && now.timers.runSeconds} g${now.gold} hp${now.hero && now.hero.hp} thr${now.threats && now.threats.alive} rem${m.objective ? (m.objective.remaining || []).length : '?'} arr${m.objective ? m.objective.arrived : '?'} fuel${m.fuel ? Math.round(m.fuel.stored) : '?'} closed${m.roads ? JSON.stringify(m.roads.closed) : '?'}\n`);
    let orders;
    try { orders = decide(o); } catch (e) { vlog.write('DECIDE-ERR ' + e.message + '\n'); orders = [{ verb: 'HOLD', pos: { x: 0, z: -6 } }]; }
    child.stdin.write(JSON.stringify(orders) + '\n'); sent++;
  } else if (o.secured !== undefined) {
    outcome = o;
    console.log('OUTCOME ' + JSON.stringify(o));
  }
}

function decide(v) {
  const now = v.now;
  const fp = [now.wave, now.timers && now.timers.runSeconds, now.gold, (now.motor && now.motor.eventCount) || 0, now.threats && now.threats.alive].join('|');
  const rejected = (fp === lastFp && sent > 0);
  lastFp = fp;
  const seams = (now.seams || []).filter(s => s.active && s.x != null);
  const P = now.prospector || CAMP;

  if (now.pendingSecure) return [{ verb: 'SECURE_CHOICE', choice: 'bank' }];
  if (rejected) {
    degrade++;
    vlog.write('DEGRADE ' + degrade + '\n');
    if (degrade >= 2 || !seams.length) return [{ verb: 'HOLD', pos: { x: 0, z: -6 } }];
    const o = [{ verb: 'REPAIR_UNDER', pct: 55 }];
    for (let k = 0; k < 4; k++) o.push({ verb: 'HARVEST', seam: seams[0].id });
    o.push({ verb: 'HOLD', pos: { x: seams[0].x, z: seams[0].z } });
    return o;
  }
  degrade = 0;

  const orders = [];
  if (now.pendingOffer && now.pendingOffer.length) {
    const ids = now.pendingOffer.map(o => o.id);
    orders.push({ verb: 'PICK_UPGRADE', id: PREF.find(p => ids.includes(p)) || ids[0] });
  }
  if (now.blastReadyInMs === 0 && now.threats && now.threats.alive >= 4 && now.hero) {
    orders.push({ verb: 'BLAST_AT', pos: { x: now.hero.x, z: now.hero.z } });
  }

  const m = now.motor;
  const arrived = m && m.objective && m.objective.arrived;
  if (!arrived && m) {
    // opportunistic pans near current ground come before errand legs
    const near = seams.filter(s => dist(P, s) <= 18).sort((a, b) => dist(P, a) - dist(P, b));
    for (const s of near) for (let k = 0; k < 6; k++) orders.push({ verb: 'HARVEST', seam: s.id });
    // tar + grade tour
    const nodes = (m.fuel && m.fuel.nodes) || [];
    const nodeAt = (x, z) => nodes.find(n => Math.abs(n.x - x) < 0.6 && Math.abs(n.z - z) < 0.6);
    const graded = new Set((m.roads && m.roads.graded) || []);
    const jig = (x, z) => { orders.push(mv(x, z), mv(x + 0.6, z), mv(x, z)); };
    const n0 = nodeAt(0, -8); if (n0 && !n0.harvested) jig(0, -8);
    const nW = nodeAt(-12, -8); if (nW && !nW.harvested) jig(-12, -8);
    if (!graded.has('camp-to-west-lease')) { orders.push(mv(-12, -8), { verb: 'GRADE' }, { verb: 'HAUL' }); }
    const nE = nodeAt(12, -8); if (nE && !nE.harvested) jig(12, -8);
    if (!graded.has('camp-to-east-lease')) { orders.push(mv(12, -8), { verb: 'GRADE' }); }
    if (!graded.has('camp-to-north-lease')) { orders.push(mv(0, 8), { verb: 'GRADE' }); }
    // deliveries: one hauler leg per view; off-road stage legs only in a checked clear window
    const cors = (m.roads && m.roads.corridors) || [];
    const byId = Object.fromEntries(cors.map(c => [c.id, c]));
    const rem = (m.objective.remaining || []);
    const delivered = (m.objective.delivered || []);
    const closed = (m.roads && m.roads.closed) || [];
    const veh = m.vehicle;
    const wx = m.weather || {};
    const fuelDead = m.fuel && m.fuel.drawn >= 35.5 && m.fuel.stored < 1;
    const stageOk = legT => (wx.phase === 'clear' && (wx.nextPhaseInSeconds || 0) + 4 > legT + 2.5)
      || (wx.phase === 'telegraph' && (wx.nextPhaseInSeconds || 0) > legT + 2.5);
    if (rem.length && veh && !fuelDead && veh.state !== 'driving') {
      const cands = rem.filter(id => !closed.includes(id));
      cands.sort((a, b) => ROAD_ORDER.indexOf(a) - ROAD_ORDER.indexOf(b));
      const t = byId[cands[0]];
      const dispatched = p => veh.dispatch && dist(veh.dispatch, p) < 3;
      const homeCor = cors.find(c => delivered.includes(c.id) && dist(veh, c.end) < 4);
      if (t && !(dist(veh, t.end) < 3 || dispatched(t.end))) {
        if (dist(veh, t.start) < 4) {
          // staged on the target road: ride out (road leg, storm-tolerant)
          orders.push(mv(t.end.x, t.end.z), { verb: 'HAUL' });
        } else if (homeCor) {
          // hauler rests at a delivered head: bring it home along its own road, pre-walk to next stake
          orders.push(mv(homeCor.start.x, homeCor.start.z), { verb: 'HAUL' }, mv(t.start.x, t.start.z), { verb: 'HOLD', pos: { x: t.start.x, z: t.start.z } });
        } else {
          // hauler at rest off the target road (e.g. old corridor start): off-road stage leg, timed
          const legT = dist(veh, t.start) / 9;
          if (dist(P, t.start) > 2.5) {
            orders.push(mv(t.start.x, t.start.z), { verb: 'HOLD', pos: { x: t.start.x, z: t.start.z } });
          } else if (stageOk(legT)) {
            orders.push({ verb: 'HAUL' }, mv(t.end.x, t.end.z), { verb: 'HAUL' });
          } else {
            orders.push({ verb: 'HOLD', pos: { x: t.start.x, z: t.start.z } });
          }
        }
      } else if (!t) {
        // every remaining lease is washed out: wait at the first one's stake
        const w = byId[rem[0]];
        if (w) orders.push(mv(w.start.x, w.start.z), { verb: 'HOLD', pos: { x: w.start.x, z: w.start.z } });
      }
    }
  }

  // fort ladder (gates keep them inert until funded; travel home is implied)
  const byKind = (now.works && now.works.byKind) || null;
  const entries = (now.works && now.works.entries) || [];
  const count = id => byKind && byKind[id] !== undefined ? byKind[id] : entries.filter(e => (e.id || e.kind) === id).length;
  const tN = count('turret'), bN = count('sentry_beacon');
  if (tN < 4) orders.push({ verb: 'BUILD', what: 'turret', where: TURRET_SPOTS[tN], when: { goldGte: TURRET_COSTS[tN] } });
  if (tN >= 1 && bN < 2) orders.push({ verb: 'BUILD', what: 'sentry_beacon', where: BEACON_SPOTS[bN], when: { goldGte: BEACON_COSTS[bN] } });
  orders.push({ verb: 'REPAIR_UNDER', pct: 55 });
  // sluice-at-own-feet alarm (waterless map: always fails, fires a view per +10g)
  orders.push({ verb: 'BUILD', what: 'sluice', where: { x: Math.round(P.x * 10) / 10, z: Math.round(P.z * 10) / 10 }, when: { goldGte: Math.min(999999, Math.floor(now.gold || 0) + 10) } });
  // harvest chain
  const scored2 = seams.map(s => ({ s, sc: dist(P, s) + 0.7 * dist(CAMP, s) })).sort((a, b) => a.sc - b.sc);
  for (const { s } of scored2) {
    if (orders.length >= 30) break;
    for (let k = 0; k < 6 && orders.length < 31; k++) orders.push({ verb: 'HARVEST', seam: s.id });
  }
  if (scored2.length) orders.push({ verb: 'HOLD', pos: { x: scored2[0].s.x, z: scored2[0].s.z } });
  else orders.push({ verb: 'HOLD', pos: { x: 0, z: -6 } });
  return orders.slice(0, 32);
}

function finish(code) {
  vlog.end();
  if (lastView) { try { fs.writeFileSync(tape + '.lastview.json', JSON.stringify(lastView, null, 1)); } catch { } }
  const statePath = WORK + '/runs.json';
  let st = { runsSoFar: 0, scoredAttempts: 0 };
  try { st = JSON.parse(fs.readFileSync(statePath, 'utf8')); } catch { }
  st.runsSoFar++; if (scored) st.scoredAttempts++;
  fs.writeFileSync(statePath, JSON.stringify(st));
  const outPath = WORK + '/gauntlet-outcome.json';
  let prev = null; try { prev = JSON.parse(fs.readFileSync(outPath, 'utf8')); } catch { }
  const better = !prev || !prev.secured && (outcome && (outcome.secured || (outcome.waves || 0) > (prev.waves || 0)));
  const rec = outcome && (better) ? outcome : (prev || outcome || { secured: false, note: 'no outcome line; exit ' + code });
  const record = { ...rec, tape: (outcome && better) ? tape : (prev && prev.tape) || tape, scored: (outcome && better) ? scored : (prev && prev.scored) || scored, runsSoFar: st.runsSoFar, scoredAttempts: st.scoredAttempts, worldModel: 'sim-import' };
  fs.writeFileSync(outPath, JSON.stringify(record, null, 1));
  console.log('exit', code, 'views', views, 'sent', sent);
  process.exit(0);
}
