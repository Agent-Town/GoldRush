// Gold Rush heat-14 runner — spawns gr-sim, drives a controller, logs every view,
// writes gauntlet-outcome.json + all three envelope axes on every child exit.
// (This arena refuses shell redirection and compound `cd`; the runner is the cure.)
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = '/private/tmp/claude-501/-Users-robin-Claude-Projects-Gold-Rush/fe6b8d27-b064-40eb-934b-1d29d57a71db/scratchpad/arena-heat14-e3949bfa';
const WS = path.join(ROOT, 'artifacts/heat14/opus/e4-long-road');
const CONTRACT = 'e4-long-road';
const SEED = 'e4-long-road-01';

const label = process.argv[2] || 'probe-idle';
const ctrlPath = process.argv[3] || null;   // null => --policy idle

const tape = path.join(WS, `${label}-tape.json`);
const logPath = path.join(WS, `${label}-views.jsonl`);
const sumPath = path.join(WS, `${label}-summary.json`);

const args = ['scripts/gr-sim.mjs', '--contract', CONTRACT, '--seed', SEED, '--tape', tape];
if (!ctrlPath) args.push('--policy', 'idle');

let controller = null;
if (ctrlPath) {
  const mod = await import(path.isAbsolute(ctrlPath) ? ctrlPath : path.join(WS, ctrlPath));
  controller = mod.default ?? mod.decide;
}

const child = spawn('node', args, { cwd: ROOT, stdio: ['pipe', 'pipe', 'pipe'] });
const logFd = fs.openSync(logPath, 'w');
let buf = '';
let outcome = null;
const rows = [];
let n = 0;
let state = {};

child.stderr.on('data', d => {
  const s = d.toString();
  if (/rejected/i.test(s)) fs.appendFileSync(path.join(WS, `${label}-stderr.log`), s);
});

child.stdout.on('data', chunk => {
  buf += chunk.toString();
  let i;
  while ((i = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, i); buf = buf.slice(i + 1);
    if (!line.trim()) continue;
    let v; try { v = JSON.parse(line); } catch { continue; }
    if (v && v.schema === 'goldrush.view.v1') {
      n++;
      fs.writeSync(logFd, JSON.stringify(v) + '\n');
      rows.push(compact(v, n));
      if (controller) {
        let out;
        try { out = controller(v, state, n); } catch (e) {
          fs.appendFileSync(path.join(WS, `${label}-ctrl-error.log`), String(e && e.stack || e) + '\n');
          out = '';
        }
        // out: array of orders, or '' / null for a blank line (records no entry)
        if (Array.isArray(out)) child.stdin.write(JSON.stringify(out) + '\n');
        else child.stdin.write('\n');
      }
    } else if (v && typeof v.secured !== 'undefined') {
      outcome = v;
    }
  }
});

function compact(v, idx) {
  const now = v.now || {};
  const m = now.motor || {};
  const obj = m.objective || {};
  const cv = m.convoy || {};
  const f = m.fuel || {};
  const veh = m.vehicle || {};
  const w = now.works || {};
  const sc = now.score || {};
  const h = now.hero || {};
  return {
    i: idx, t: +( (now.timers && (now.timers.runSeconds ?? now.timers.simTimeSeconds)) ?? 0 ).toFixed(2),
    wave: now.wave,
    hp: h.hp != null ? +h.hp.toFixed(1) : null, maxHp: h.maxHp, hx: h.x != null ? +h.x.toFixed(2) : null, hz: h.z != null ? +h.z.toFixed(2) : null,
    gold: now.gold, pan: sc.goldPanned, stolen: sc.goldStolen,
    alive: now.threats && now.threats.alive, wreckers: now.threats && now.threats.wreckers,
    standing: w.standing, wrecked: w.wrecked, byKind: w.byKind,
    arrived: obj.arrived, stop: obj.stop, stopReach: obj.stopReach,
    lead: cv.leaderDistance, total: cv.total,
    tar: f.tar, stored: f.stored, drawn: f.drawn,
    nodes: (f.nodes || []).map(nd => (nd.harvested ? 1 : 0)).join(''),
    vx: veh.x != null ? +veh.x.toFixed(2) : null, vz: veh.z != null ? +veh.z.toFixed(2) : null, vs: veh.state,
    graded: (m.roads && (m.roads.corridors || []).filter(c => c.graded).map(c => c.id)) || [],
    phase: m.weather && m.weather.phase,
    offer: now.pendingOffer ? now.pendingOffer.map(o => o.id) : null,
    psec: !!now.pendingSecure,
    fails: (now.orders || []).filter(o => o.status === 'failed').map(o => `${o.order && o.order.verb}:${o.reason || ''}`).slice(0, 4),
  };
}

child.on('exit', code => {
  fs.closeSync(logFd);
  // envelope: all three axes, measured off the tape that exists
  let env = null;
  try {
    const tp = JSON.parse(fs.readFileSync(tape, 'utf8'));
    const il = tp.inputLog || {};
    const entries = il.entries || [];
    const lastTick = entries.length ? Math.max(...entries.map(e => e.t ?? e.tick ?? 0)) : 0;
    env = {
      durationTicks: il.durationTicks,
      lastEntryTick: lastTick,
      entries: entries.length,
      bytes: fs.statSync(tape).size,
    };
  } catch (e) { env = { error: String(e.message || e) }; }
  const summary = { label, code, outcome, env, views: n, rows };
  fs.writeFileSync(sumPath, JSON.stringify(summary, null, 1));
  // compact table
  const tbl = rows.map(r => `${String(r.i).padStart(3)} t=${String(r.t).padStart(7)} w${String(r.wave).padStart(2)} hp=${String(r.hp).padStart(5)}/${r.maxHp} @(${r.hx},${r.hz}) g=${String(r.gold).padStart(4)} pan=${String(r.pan).padStart(4)} al=${String(r.alive).padStart(2)} st=${r.standing} wr=${r.wrecked} arr=${r.arrived} lead=${r.lead}/${r.total} tar=${r.tar} dr=${r.drawn} nd=${r.nodes} v=(${r.vx},${r.vz})${r.vs} gr=[${r.graded}] ${r.phase||''} ${r.fails.length?'FAIL '+r.fails.join('|'):''}`).join('\n');
  fs.writeFileSync(path.join(WS, `${label}-table.txt`), tbl);
  console.log(JSON.stringify({ label, code, outcome, env, views: n }));
  console.log(tbl.split('\n').slice(-25).join('\n'));
});
