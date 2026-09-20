#!/usr/bin/env node
// heat13 opus e7-dead-band runner: spawns gr-sim, drives a controller module,
// logs every view, measures the reel envelope, writes gauntlet-outcome.json on EVERY exit.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const WS = '/private/tmp/heat13-569a41f9/artifacts/heat13/opus/e7-dead-band';
const REPO = '/private/tmp/heat13-569a41f9';
const CONTRACT = 'e7-dead-band';
const SEED = 'e7-dead-band-01';

const label = process.argv[2] || 'probe-1';
const ctrlPath = process.argv[3] || null; // null => --policy idle
const tape = path.join(WS, `${label}-tape.json`);
const viewLog = path.join(WS, `${label}-views.jsonl`);
const outFile = path.join(WS, 'gauntlet-outcome.json');
const bestFile = path.join(WS, '.best.json');

const args = ['scripts/gr-sim.mjs', '--contract', CONTRACT, '--seed', SEED, '--tape', tape];
if (!ctrlPath) args.push('--policy', 'idle');

let controller = null;
if (ctrlPath) controller = (await import(ctrlPath)).default;

const child = spawn('node', args, { cwd: REPO, stdio: ['pipe', 'pipe', 'pipe'] });
const vlog = fs.createWriteStream(viewLog);

let buf = '';
let outcomeLine = null;
let views = 0;
let submissions = 0;
const rows = [];

child.stdout.on('data', (chunk) => {
  buf += chunk.toString();
  let i;
  while ((i = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, i).trim();
    buf = buf.slice(i + 1);
    if (!line) continue;
    let msg;
    try { msg = JSON.parse(line); } catch { continue; }
    if (msg && msg.schema === 'goldrush.view.v1') {
      views += 1;
      vlog.write(JSON.stringify(msg) + '\n');
      const n = msg.now || {};
      rows.push({
        v: views, t: n.timers?.runSeconds, w: n.wave, gold: n.gold,
        pan: n.score?.goldPanned, hp: n.hero?.hp, mx: n.hero?.maxHp,
        hx: n.hero?.x, hz: n.hero?.z, alive: n.threats?.alive,
        works: n.works?.standing, wr: n.works?.wrecked,
        pbMet: n.playbookUse?.objectiveMet, pbRef: JSON.stringify(n.playbookUse?.refusals || {}),
        offer: (n.pendingOffer || []).length, sec: !!n.pendingSecure,
      });
      if (!controller) continue;
      let reply;
      try { reply = controller(msg, views); } catch (e) { reply = null; console.error('CTRL ERR', e); }
      if (reply === null || reply === undefined) { child.stdin.write('\n'); }
      else { submissions += 1; child.stdin.write(JSON.stringify(reply) + '\n'); }
    } else if (msg && ('secured' in msg)) {
      outcomeLine = msg;
    }
  }
});

let stderrTail = [];
child.stderr.on('data', (d) => {
  const s = d.toString();
  for (const l of s.split('\n')) if (l.trim()) stderrTail.push(l.trim());
  if (stderrTail.length > 40) stderrTail = stderrTail.slice(-40);
});

child.on('exit', (code) => {
  vlog.end();
  const summary = { label, code, views, submissions, outcome: outcomeLine, tape };
  // envelope
  let env = null;
  try {
    const t = JSON.parse(fs.readFileSync(tape, 'utf8'));
    const entries = t.inputLog?.entries || [];
    const last = entries.length ? entries[entries.length - 1].t : null;
    env = {
      durationTicks: t.inputLog?.durationTicks,
      lastEntryTick: last,
      entries: entries.length,
      bytes: fs.statSync(tape).size,
    };
  } catch (e) { env = { error: String(e) }; }
  summary.envelope = env;
  fs.writeFileSync(path.join(WS, `${label}-summary.json`), JSON.stringify(summary, null, 2));
  // compact table
  const tbl = rows.map(r => `v${r.v} t=${r.t} w=${r.w} g=${r.gold} pan=${r.pan} hp=${r.hp}/${r.mx} hero=(${r.hx},${r.hz}) alive=${r.alive} works=${r.works}/wr${r.wr} pbMet=${r.pbMet} ref=${r.pbRef} offer=${r.offer} sec=${r.sec}`).join('\n');
  fs.writeFileSync(path.join(WS, `${label}-table.txt`), tbl);

  // intermediate-results law: best-so-far
  const scored = /^attempt-/.test(label);
  let best = null;
  try { best = JSON.parse(fs.readFileSync(bestFile, 'utf8')); } catch {}
  const o = outcomeLine || {};
  const rank = (x) => [x.secured ? 1 : 0, x.waves || 0, x.gold || 0, (x.timeMs || 0) / 1000];
  const better = (a, b) => {
    const ra = rank(a), rb = rank(b);
    for (let i = 0; i < ra.length; i++) { if (ra[i] !== rb[i]) return ra[i] > rb[i]; }
    return false;
  };
  let state = best;
  const runsSoFar = (best?.runsSoFar || 0) + 1;
  const scoredAttempts = (best?.scoredAttempts || 0) + (scored ? 1 : 0);
  if (!best || !best.outcome || better(o, best.outcome) || (scored && !better(best.outcome, o))) {
    state = { outcome: o, tape, scored };
  }
  const row = {
    ...(state?.outcome || {}),
    tape: state?.tape || tape,
    scored: !!state?.scored,
    runsSoFar,
    scoredAttempts,
    worldModel: 'sim-import',
  };
  fs.writeFileSync(bestFile, JSON.stringify({ ...state, runsSoFar, scoredAttempts }, null, 2));
  fs.writeFileSync(outFile, JSON.stringify(row, null, 2));
  console.log(JSON.stringify(summary, null, 2));
  console.log('--- last stderr ---\n' + stderrTail.slice(-8).join('\n'));
});
