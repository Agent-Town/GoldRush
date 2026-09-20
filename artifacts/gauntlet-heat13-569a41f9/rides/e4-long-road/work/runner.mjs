// Runner: spawns gr-sim, drives a controller module, logs every view, writes outcome file.
// Usage: node runner.mjs <controllerPath|idle> <tapePath> [label]
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const WS = '/private/tmp/heat13-569a41f9/artifacts/heat13/opus/e4-long-road';
const CONTRACT = 'e4-long-road';
const SEED = 'e4-long-road-01';
const WORLD_MODEL = 'sim-import';

const ctrlPath = process.argv[2];
const tapePath = process.argv[3];
const label = process.argv[4] || path.basename(tapePath, '.json');

const idle = ctrlPath === 'idle';
let controller = null;
if (!idle) {
  const mod = await import(ctrlPath.startsWith('/') ? ctrlPath : path.resolve(ctrlPath));
  controller = mod.default || mod.controller;
}

const args = ['scripts/gr-sim.mjs', '--contract', CONTRACT, '--seed', SEED, '--tape', tapePath];
if (idle) args.push('--policy=idle');

const child = spawn('node', args, { cwd: '/private/tmp/heat13-569a41f9', stdio: ['pipe', 'pipe', 'pipe'] });

const viewLog = [];
const logPath = path.join(WS, `${label}.views.jsonl`);
fs.writeFileSync(logPath, '');
let stderrBuf = '';
child.stderr.on('data', d => { stderrBuf += d.toString(); });

let buf = '';
let outcome = null;
let nviews = 0;
const state = {};

child.stdout.on('data', d => {
  buf += d.toString();
  let i;
  while ((i = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, i); buf = buf.slice(i + 1);
    if (!line.trim()) continue;
    let obj;
    try { obj = JSON.parse(line); } catch { continue; }
    if (obj.schema === 'goldrush.view.v1') {
      nviews++;
      handleView(obj);
    } else if (obj.secured !== undefined || obj.waves !== undefined) {
      outcome = obj;
    }
  }
});

function summarize(v) {
  const n = v.now || {};
  const m = n.motor || {};
  const o = m.objective || {};
  const veh = m.vehicle || {};
  const cv = m.convoy || {};
  const f = m.fuel || {};
  return {
    t: +(n.timers?.runSeconds ?? 0).toFixed(2),
    w: n.wave,
    hp: n.hero ? +(n.hero.hp).toFixed(1) : null,
    mhp: n.hero?.maxHp,
    hx: n.hero ? +(n.hero.x).toFixed(1) : null,
    hz: n.hero ? +(n.hero.z).toFixed(1) : null,
    px: n.prospector ? +(n.prospector.x).toFixed(1) : null,
    pz: n.prospector ? +(n.prospector.z).toFixed(1) : null,
    g: n.gold,
    pan: n.score?.goldPanned,
    alive: n.threats?.alive,
    works: n.works?.standing,
    wrk: n.works?.wrecked,
    arrived: o.arrived,
    lead: cv.leaderDistance !== undefined ? +cv.leaderDistance.toFixed(1) : undefined,
    total: cv.total,
    vst: veh.state,
    vx: veh.x !== undefined ? +veh.x.toFixed(1) : undefined,
    fuel: f.stored !== undefined ? +f.stored.toFixed(2) : undefined,
    tar: f.tar,
    drawn: f.drawn !== undefined ? +f.drawn.toFixed(2) : undefined,
    graded: (m.roads?.corridors || []).filter(c => c.graded).map(c => c.id),
    wx: m.weather?.phase,
    ps: n.pendingSecure ? true : undefined,
    po: n.pendingOffer ? n.pendingOffer.map(o2 => o2.id) : undefined,
  };
}

function handleView(v) {
  const s = summarize(v);
  viewLog.push(s);
  fs.appendFileSync(logPath, JSON.stringify(s) + '\n');
  if (idle) return;
  let orders;
  try { orders = controller(v, state); } catch (e) {
    console.error('CONTROLLER THREW', e.stack);
    orders = null;
  }
  if (orders === null || orders === undefined) {
    child.stdin.write('\n');
  } else {
    child.stdin.write(JSON.stringify(orders) + '\n');
  }
}

child.on('exit', (code) => {
  const res = { label, code, views: nviews, outcome };
  fs.writeFileSync(path.join(WS, `${label}.result.json`), JSON.stringify(res, null, 2));
  fs.writeFileSync(path.join(WS, `${label}.stderr.txt`), stderrBuf.slice(-20000));
  // envelope
  let env = null;
  try {
    const tape = JSON.parse(fs.readFileSync(tapePath, 'utf8'));
    const il = tape.inputLog || {};
    const entries = il.entries || [];
    const lastTick = entries.length ? Math.max(...entries.map(e => e.t ?? e.tick ?? 0)) : 0;
    env = {
      durationTicks: il.durationTicks,
      lastEntryTick: lastTick,
      entries: entries.length,
      bytes: fs.statSync(tapePath).size,
      eventLogHash: tape.eventLogHash || tape.meta?.eventLogHash,
    };
  } catch (e) { env = { error: String(e) }; }
  res.envelope = env;
  fs.writeFileSync(path.join(WS, `${label}.result.json`), JSON.stringify(res, null, 2));
  console.log(JSON.stringify({ label, code, views: nviews, outcome, envelope: env }, null, 1));

  // intermediate-results law: write best-so-far
  const opath = path.join(WS, 'gauntlet-outcome.json');
  let best = null;
  try { best = JSON.parse(fs.readFileSync(opath, 'utf8')); } catch {}
  const runsSoFar = (best?.runsSoFar || 0) + 1;
  const scored = /^attempt-/.test(label);
  const scoredAttempts = (best?.scoredAttempts || 0) + (scored ? 1 : 0);
  const better = (a, b) => {
    if (!b) return true;
    if ((a?.secured ? 1 : 0) !== (b?.secured ? 1 : 0)) return (a?.secured ? 1 : 0) > (b?.secured ? 1 : 0);
    if ((a?.waves || 0) !== (b?.waves || 0)) return (a?.waves || 0) > (b?.waves || 0);
    return (a?.timeMs || 0) > (b?.timeMs || 0);
  };
  let row;
  if (outcome && better(outcome, best?.outcomeRaw)) {
    row = { ...outcome, outcomeRaw: outcome, tape: tapePath, scored, worldModel: WORLD_MODEL };
  } else {
    row = best ? { ...best } : { ...(outcome || {}), outcomeRaw: outcome, tape: tapePath, scored, worldModel: WORLD_MODEL };
  }
  row.runsSoFar = runsSoFar;
  row.scoredAttempts = scoredAttempts;
  row.worldModel = WORLD_MODEL;
  fs.writeFileSync(opath, JSON.stringify(row, null, 2));
});
