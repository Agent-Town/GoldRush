#!/usr/bin/env node
// Heat 12 · e2-hill-mine · opus-5 runner.
// Spawns gr-sim, drives a controller module, logs every view, and writes
// gauntlet-outcome.json on EVERY child exit (the intermediate-results law).
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const DIR = '/tmp/heat12-038cc280/artifacts/heat12/opus/e2-hill-mine';
const REPO = '/tmp/heat12-038cc280';
const OUTCOME = path.join(DIR, 'gauntlet-outcome.json');
const WORLD_MODEL = 'sim-import';

const tag = process.argv[2] || 'tune-1';
const ctrlPath = process.argv[3] || path.join(DIR, 'ctrl.mjs');
const scored = process.argv[4] === 'scored';

const tape = path.join(DIR, `${tag}-tape.json`);
const viewLog = path.join(DIR, `${tag}-views.jsonl`);
const ctrl = await import(ctrlPath + '?v=' + Date.now());

const args = [
  'scripts/gr-sim.mjs',
  '--contract', 'e2-hill-mine',
  '--seed', 'e2-hill-mine-01',
  '--tape', tape,
];
if (process.env.GR_IDLE === '1') args.push('--policy=idle');

const child = spawn('node', args, { cwd: REPO, stdio: ['pipe', 'pipe', 'pipe'] });
const vlog = fs.createWriteStream(viewLog);

let buf = '';
let outcome = null;
const rows = [];
let calls = 0;
let blanks = 0;
const state = { firstDumped: false };

child.stdout.on('data', (d) => {
  buf += d.toString();
  let i;
  while ((i = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, i);
    buf = buf.slice(i + 1);
    if (!line.trim()) continue;
    let msg;
    try { msg = JSON.parse(line); } catch { continue; }
    if (msg && msg.schema === 'goldrush.view.v1') {
      handleView(msg);
    } else if (msg && typeof msg.secured === 'boolean') {
      outcome = msg;
    }
  }
});

let stderrBuf = '';
child.stderr.on('data', (d) => { stderrBuf += d.toString(); });

function handleView(view) {
  const now = view.now || {};
  if (!state.firstDumped) {
    state.firstDumped = true;
    fs.writeFileSync(path.join(DIR, `${tag}-view0.json`), JSON.stringify(view, null, 1));
  }
  const row = {
    t: +(now.timers?.runSeconds ?? 0).toFixed(1),
    w: now.wave,
    hp: Math.round(now.hero?.hp ?? 0),
    mx: Math.round(now.hero?.maxHp ?? 0),
    g: Math.round(now.gold ?? 0),
    pan: Math.round(now.score?.goldPanned ?? 0),
    al: now.threats?.alive ?? 0,
    st: now.works?.standing ?? 0,
    wr: now.works?.wrecked ?? 0,
    T: now.works?.byKind?.turret ?? 0,
    B: now.works?.byKind?.sentry_beacon ?? 0,
  };
  rows.push(row);
  vlog.write(JSON.stringify({ row, orders: now.orders, seams: now.seams, offer: now.pendingOffer, sec: now.pendingSecure }) + '\n');

  let orders;
  try { orders = ctrl.decide(view, state); } catch (e) {
    vlog.write(JSON.stringify({ ERR: String(e && e.stack || e) }) + '\n');
    orders = null;
  }
  if (orders === null || orders === undefined) {
    blanks++;
    child.stdin.write('\n');
  } else {
    calls++;
    child.stdin.write(JSON.stringify(orders) + '\n');
  }
}

function envelope() {
  try {
    const t = JSON.parse(fs.readFileSync(tape, 'utf8'));
    const entries = t.inputLog?.entries || [];
    const last = entries.length ? entries[entries.length - 1].tick : 0;
    return {
      durationTicks: t.inputLog?.durationTicks,
      lastEntryTick: last,
      entries: entries.length,
      bytes: fs.statSync(tape).size,
    };
  } catch { return null; }
}

child.on('close', (code) => {
  vlog.end();
  const env = envelope();
  const table = rows.map(r => `t${r.t} w${r.w} hp${r.hp}/${r.mx} g${r.g} pan${r.pan} alive${r.al} works${r.st}(wr${r.wr}) T${r.T} B${r.B}`).join('\n');
  fs.writeFileSync(path.join(DIR, `${tag}-table.txt`), table);
  const summary = { tag, code, outcome, envelope: env, calls, blanks, views: rows.length };
  fs.writeFileSync(path.join(DIR, `${tag}-summary.json`), JSON.stringify(summary, null, 1));
  fs.writeFileSync(path.join(DIR, `${tag}-stderr.txt`), stderrBuf.slice(-4000));

  // ---- intermediate-results law: best-so-far, honestly ----
  let prev = null;
  try { prev = JSON.parse(fs.readFileSync(OUTCOME, 'utf8')); } catch {}
  const runsSoFar = (prev?.runsSoFar ?? 0) + 1;
  const scoredAttempts = (prev?.scoredAttempts ?? 0) + (scored ? 1 : 0);
  const better = (a, b) => {
    if (!a) return false; if (!b) return true;
    if (a.secured !== b.secured) return a.secured;
    if (a.waves !== b.waves) return a.waves > b.waves;
    if (a.gold !== b.gold) return a.gold > b.gold;
    return (a.timeMs ?? 0) > (b.timeMs ?? 0);
  };
  const prevOut = prev && prev.secured !== undefined ? {
    secured: prev.secured, waves: prev.waves, timeMs: prev.timeMs, gold: prev.gold,
  } : null;
  let row;
  if (outcome && better(outcome, prevOut)) {
    row = { ...outcome, tape, scored, worldModel: WORLD_MODEL, envelope: env };
  } else if (prev) {
    row = { ...prev };
  } else {
    row = { secured: false, note: 'no outcome line', tape, scored, worldModel: WORLD_MODEL, envelope: env };
  }
  row.runsSoFar = runsSoFar;
  row.scoredAttempts = scoredAttempts;
  row.worldModel = WORLD_MODEL;
  fs.writeFileSync(OUTCOME, JSON.stringify(row, null, 1));

  console.log(JSON.stringify(summary));
  console.log(table.split('\n').slice(-14).join('\n'));
});
