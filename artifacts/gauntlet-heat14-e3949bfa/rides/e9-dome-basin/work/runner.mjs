// Gold Rush gauntlet runner — generation 113, e9-dome-basin.
// Spawns gr-sim, drives a controller module, logs every view, and writes
// gauntlet-outcome.json + the three envelope axes on EVERY child exit.
// (The arena refuses shell redirection and compound `cd`; `timeout` is not on macOS.)
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const WS = '/private/tmp/claude-501/-Users-robin-Claude-Projects-Gold-Rush/fe6b8d27-b064-40eb-934b-1d29d57a71db/scratchpad/arena-heat14-e3949bfa/artifacts/heat14/opus/e9-dome-basin';
const REPO = '/private/tmp/claude-501/-Users-robin-Claude-Projects-Gold-Rush/fe6b8d27-b064-40eb-934b-1d29d57a71db/scratchpad/arena-heat14-e3949bfa';
const CONTRACT = 'e9-dome-basin';
const SEED = 'e9-dome-basin-01';

const label = process.argv[2] || 'probe';
const ctrlPath = process.argv[3] || null; // null => --policy idle
const tapePath = path.join(WS, `${label}-tape.json`);

let controller = null;
if (ctrlPath) controller = (await import(path.resolve(ctrlPath))).default;

const args = ['scripts/gr-sim.mjs', '--contract', CONTRACT, '--seed', SEED, '--tape', tapePath];
if (!ctrlPath) args.push('--policy', 'idle');

const child = spawn('node', args, { cwd: REPO, stdio: ['pipe', 'pipe', 'pipe'] });

const views = [];
const rows = [];
let outcome = null;
let buf = '';
let stderrTail = [];

function logRow(v) {
  const n = v.now || {};
  const sc = n.score || {};
  const w = n.works || {};
  const th = n.threats || {};
  const h = n.hero || {};
  rows.push({
    i: views.length,
    t: +(((n.timers && (n.timers.runSeconds ?? n.timers.simTimeSeconds)) ?? 0)).toFixed(2),
    wave: n.wave,
    gold: n.gold,
    pan: sc.goldPanned,
    stolen: sc.goldStolen,
    hp: h.hp != null ? +h.hp.toFixed(1) : null,
    maxHp: h.maxHp,
    hx: h.x != null ? +h.x.toFixed(1) : null,
    hz: h.z != null ? +h.z.toFixed(1) : null,
    stand: w.standing,
    wreck: w.wrecked,
    kinds: w.byKind ? JSON.stringify(w.byKind) : null,
    alive: th.alive,
    wr: th.wreckers,
    thv: th.thieves,
    offer: n.pendingOffer ? n.pendingOffer.length : 0,
    sec: n.pendingSecure ? 1 : 0,
  });
}

function writeArtifacts(reason) {
  try {
    fs.writeFileSync(path.join(WS, `${label}-views.json`), JSON.stringify(rows, null, 0));
    if (views.length) fs.writeFileSync(path.join(WS, `${label}-view0.json`), JSON.stringify(views[0], null, 1));
    if (views.length > 1) fs.writeFileSync(path.join(WS, `${label}-viewlast.json`), JSON.stringify(views[views.length - 1], null, 1));
  } catch (e) { /* best effort */ }

  // envelope axes off the tape that exists
  let env = null;
  try {
    const tape = JSON.parse(fs.readFileSync(tapePath, 'utf8'));
    const il = tape.inputLog || {};
    const entries = il.entries || [];
    const lastTick = entries.length ? Math.max(...entries.map((e) => e.t ?? e.tick ?? 0)) : 0;
    env = {
      durationTicks: il.durationTicks,
      lastEntryTick: lastTick,
      entries: entries.length,
      bytes: fs.statSync(tapePath).size,
      tapeHash: (tape.meta && tape.meta.eventLogHash) || tape.eventLogHash || null,
    };
  } catch (e) { env = { error: String(e).slice(0, 120) }; }

  const summary = { label, reason, outcome, envelope: env, views: views.length, tape: tapePath };
  fs.writeFileSync(path.join(WS, `${label}-summary.json`), JSON.stringify(summary, null, 1));
  console.log('ENVELOPE', JSON.stringify(env));
  console.log('OUTCOME', JSON.stringify(outcome));
  return summary;
}

child.stderr.on('data', (d) => {
  const s = String(d);
  for (const line of s.split('\n')) if (line.trim()) stderrTail.push(line.slice(0, 200));
  if (stderrTail.length > 40) stderrTail = stderrTail.slice(-40);
});

child.stdout.on('data', (chunk) => {
  buf += String(chunk);
  let nl;
  while ((nl = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, nl);
    buf = buf.slice(nl + 1);
    if (!line.trim()) continue;
    let obj;
    try { obj = JSON.parse(line); } catch { continue; }
    if (obj.schema === 'goldrush.view.v1') {
      views.push(obj);
      logRow(obj);
      if (controller) {
        let arr;
        try { arr = controller(obj, views); } catch (e) {
          console.log('CONTROLLER THREW', String(e), (e && e.stack || '').slice(0, 400));
          arr = [];
        }
        if (arr === null || arr === undefined) child.stdin.write('\n');
        else child.stdin.write(JSON.stringify(arr) + '\n');
      }
    } else if (obj.secured !== undefined || obj.endReason !== undefined) {
      outcome = obj;
    }
  }
});

child.on('exit', (code) => {
  const s = writeArtifacts(`exit ${code}`);
  fs.writeFileSync(path.join(WS, `${label}-stderr.txt`), stderrTail.join('\n'));
  // compact table
  const tbl = rows.map((r) => `${String(r.i).padStart(3)} t=${String(r.t).padStart(7)} w${String(r.wave).padStart(2)} gold=${String(r.gold).padStart(4)} pan=${String(r.pan).padStart(5)} stol=${String(r.stolen).padStart(4)} hp=${String(r.hp).padStart(6)}/${r.maxHp} @(${r.hx},${r.hz}) st=${r.stand} wr=${r.wreck} alive=${r.alive} w/t=${r.wr}/${r.thv} off=${r.offer} sec=${r.sec}`);
  fs.writeFileSync(path.join(WS, `${label}-table.txt`), tbl.join('\n'));
  console.log(tbl.filter((_, i) => i % Math.max(1, Math.ceil(rows.length / 40)) === 0).join('\n'));
  console.log('rows', rows.length, 'stderrTail', stderrTail.slice(-3).join(' | '));
  promoteOutcome(s);
});

function promoteOutcome(s) {
  // Intermediate-results law: best-so-far, written after EVERY run.
  const outPath = path.join(WS, 'gauntlet-outcome.json');
  let prev = null;
  try { prev = JSON.parse(fs.readFileSync(outPath, 'utf8')); } catch { }
  const scored = /^attempt-/.test(label);
  const cur = outcome || { secured: false, waves: 0, timeMs: 0, gold: 0, calls: 0 };
  const runsSoFar = (prev && prev.runsSoFar ? prev.runsSoFar : 0) + 1;
  const scoredAttempts = (prev && prev.scoredAttempts ? prev.scoredAttempts : 0) + (scored ? 1 : 0);
  const better = !prev || !prev.secured
    ? (cur.secured || !prev || (cur.waves || 0) > (prev.waves || 0) || ((cur.waves || 0) === (prev.waves || 0) && (cur.timeMs || 0) > (prev.timeMs || 0)))
    : (cur.secured && ((cur.waves || 0) > (prev.waves || 0) || ((cur.waves || 0) === (prev.waves || 0) && (cur.gold || 0) >= (prev.gold || 0))));
  const base = better ? { ...cur, tape: tapePath, scored } : { ...prev };
  const row = {
    ...base,
    runsSoFar,
    scoredAttempts,
    worldModel: 'sim-import',
    envelope: better ? s.envelope : (prev && prev.envelope),
  };
  fs.writeFileSync(outPath, JSON.stringify(row, null, 1));
  console.log('OUTCOME FILE', JSON.stringify({ secured: row.secured, waves: row.waves, gold: row.gold, tape: path.basename(row.tape || ''), runsSoFar, scoredAttempts }));
}
