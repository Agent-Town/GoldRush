// Gen 106 runner: spawn gr-sim, drive a controller, log every view, write
// gauntlet-outcome.json + all three envelope axes on EVERY child exit.
// (This arena refuses shell redirection / compound cd; the runner is the cure.)
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const DIR = '/private/tmp/claude-501/-Users-robin-Claude-Projects-Gold-Rush/fe6b8d27-b064-40eb-934b-1d29d57a71db/scratchpad/arena-heat14-e3949bfa';
const OUT = path.join(DIR, 'artifacts/heat14/opus/e7-dead-band');
const CONTRACT = 'e7-dead-band';
const SEED = 'e7-dead-band-01';

const label = process.argv[2] || 'probe';
const ctrlPath = process.argv[3] || null;
const tape = path.join(OUT, `${label}-tape.json`);

const args = ['scripts/gr-sim.mjs', '--contract', CONTRACT, '--seed', SEED, '--tape', tape];
if (!ctrlPath) args.push('--policy', 'idle');

const ctrl = ctrlPath ? (await import(ctrlPath)).default : null;

const child = spawn('node', args, { cwd: DIR, stdio: ['pipe', 'pipe', 'pipe'] });
let buf = '';
let outcome = null;
const views = [];
const rows = [];
let lastView = null;

function logRow(v) {
  const n = v.now || {};
  const w = n.works || {};
  const pb = n.playbookUse || {};
  const r = {
    t: +(((n.timers && (n.timers.runSeconds ?? n.timers.simTimeSeconds)) ?? 0)).toFixed(1),
    wave: n.wave,
    gold: n.gold,
    pan: n.score && n.score.goldPanned,
    stolen: n.score && n.score.goldStolen,
    hp: n.hero && +(n.hero.hp || 0).toFixed(1),
    mx: n.hero && n.hero.maxHp,
    hx: n.hero && +(n.hero.x ?? 0).toFixed(1),
    hz: n.hero && +(n.hero.z ?? 0).toFixed(1),
    alive: n.threats && n.threats.alive,
    wr: n.threats && n.threats.wreckers,
    th: n.threats && n.threats.thieves,
    st: w.standing,
    wk: w.wrecked,
    kinds: w.byKind ? JSON.stringify(w.byKind) : '',
    pbMet: pb.objectiveMet,
    pbRef: pb.refusals ? JSON.stringify(pb.refusals) : '',
    sec: !!n.pendingSecure,
  };
  rows.push(r);
  return r;
}

function envelope() {
  try {
    const tp = JSON.parse(fs.readFileSync(tape, 'utf8'));
    const il = tp.inputLog || {};
    const entries = il.entries || [];
    const lastTick = entries.length ? Math.max(...entries.map((e) => e.t ?? e.tick ?? 0)) : 0;
    return {
      durationTicks: il.durationTicks,
      lastEntryTick: lastTick,
      entries: entries.length,
      bytes: fs.statSync(tape).size,
      tapeHash: tp.eventLogHash || (tp.meta && tp.meta.eventLogHash) || null,
    };
  } catch (e) { return { error: String(e.message || e) }; }
}

function writeOutcome() {
  const env = envelope();
  const summary = { label, outcome, envelope: env, rows: rows.length };
  fs.writeFileSync(path.join(OUT, `${label}-summary.json`), JSON.stringify(summary, null, 2));
  fs.writeFileSync(path.join(OUT, `${label}-views.json`), JSON.stringify(rows, null, 2));
  // Intermediate-results law: promote to gauntlet-outcome.json when this run is the best so far.
  const gpath = path.join(OUT, 'gauntlet-outcome.json');
  let prev = null;
  try { prev = JSON.parse(fs.readFileSync(gpath, 'utf8')); } catch {}
  const runs = (prev && prev.runsSoFar ? prev.runsSoFar : 0) + 1;
  const scored = /^attempt-/.test(label);
  const scoredN = (prev && prev.scoredAttempts ? prev.scoredAttempts : 0) + (scored ? 1 : 0);
  const better = !prev || !prev.secured
    || (outcome && outcome.secured && (!prev.secured
        || (outcome.waves || 0) > (prev.waves || 0)
        || ((outcome.waves || 0) === (prev.waves || 0) && (outcome.gold || 0) >= (prev.gold || 0))));
  const base = better && outcome ? { ...outcome, tape, scored } : (prev ? { ...prev } : { secured: false, tape, scored });
  fs.writeFileSync(gpath, JSON.stringify({
    ...base,
    runsSoFar: runs,
    scoredAttempts: scoredN,
    worldModel: 'sim-import',
    envelope: env,
  }, null, 2));
  console.log('ENVELOPE', JSON.stringify(env));
}

child.stdout.on('data', (d) => {
  buf += d.toString();
  let i;
  while ((i = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, i); buf = buf.slice(i + 1);
    if (!line.trim()) continue;
    let msg;
    try { msg = JSON.parse(line); } catch { continue; }
    if (msg.schema === 'goldrush.view.v1') {
      views.push(msg);
      lastView = msg;
      const r = logRow(msg);
      if (views.length === 1) fs.writeFileSync(path.join(OUT, `${label}-view0.json`), JSON.stringify(msg, null, 2));
      if (ctrl) {
        const orders = ctrl(msg, r);
        child.stdin.write(orders === null ? '\n' : JSON.stringify(orders) + '\n');
      }
    } else if (msg.secured !== undefined || msg.endReason !== undefined) {
      outcome = msg;
      console.log('OUTCOME', JSON.stringify(msg));
    }
  }
});
child.stderr.on('data', (d) => { const s = d.toString(); if (/reject/i.test(s)) process.stderr.write(s.slice(0, 400)); });
child.on('close', (code) => {
  writeOutcome();
  const tail = rows.slice(-6);
  console.log('ROWS', rows.length, 'code', code);
  console.log(tail.map((r) => JSON.stringify(r)).join('\n'));
});
