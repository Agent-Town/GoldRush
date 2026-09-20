// heat13 opus e7-echo-canyon runner: spawn gr-sim, drive a controller, log every view,
// write gauntlet-outcome.json on every child exit (the intermediate-results law).
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const DIR = '/private/tmp/heat13-569a41f9/artifacts/heat13/opus/e7-echo-canyon';
const CONTRACT = 'e7-echo-canyon';
const SEED = 'e7-echo-canyon-01';

const label = process.argv[2] || 'probe';
const mode = process.argv[3] || 'ctrl'; // 'idle' | 'ctrl'
const tape = path.join(DIR, `${label}-tape.json`);
const viewLog = path.join(DIR, `${label}-views.jsonl`);

let makeOrders = null;
if (mode !== 'idle') {
  const mod = await import(path.join(DIR, 'controller.mjs'));
  makeOrders = mod.makeOrders;
}

const args = ['scripts/gr-sim.mjs', '--contract', CONTRACT, '--seed', SEED, '--tape', tape];
if (mode === 'idle') args.push('--policy=idle');

const child = spawn('node', args, { cwd: '/private/tmp/heat13-569a41f9', stdio: ['pipe', 'pipe', 'pipe'] });

const viewFd = fs.openSync(viewLog, 'w');
let buf = '';
let outcome = null;
let views = 0;
let submissions = 0;
const state = {};
const rows = [];
let stderrTail = '';

child.stderr.on('data', (d) => { stderrTail = (stderrTail + d.toString()).slice(-4000); });

child.stdout.on('data', (d) => {
  buf += d.toString();
  let nl;
  while ((nl = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, nl);
    buf = buf.slice(nl + 1);
    if (!line.trim()) continue;
    let obj;
    try { obj = JSON.parse(line); } catch { continue; }
    if (obj.schema === 'goldrush.view.v1') {
      views += 1;
      fs.writeSync(viewFd, JSON.stringify(obj) + '\n');
      const n = obj.now || {};
      const pb = n.playbookUse || {};
      const bm = n.broadcastMirror || {};
      rows.push({
        v: views, t: n.timers?.runSeconds, w: n.wave, hp: n.hero?.hp, mx: n.hero?.maxHp,
        gold: n.gold, pan: n.score?.goldPanned, alive: n.threats?.alive,
        works: n.works?.standing, wrecked: n.works?.wrecked,
        objMet: pb.objectiveMet, fielded: bm.squadsFielded, uses: bm.recordedUses,
        pend: (bm.pending || []).length, sec: !!n.pendingSecure,
      });
      let orders = null;
      try { orders = makeOrders ? makeOrders(obj, state) : null; } catch (e) {
        fs.writeFileSync(path.join(DIR, `${label}-error.txt`), String(e && e.stack || e));
      }
      if (mode !== 'idle') {
        if (orders === null) child.stdin.write('\n');
        else { child.stdin.write(JSON.stringify(orders) + '\n'); submissions += 1; }
      }
    } else if (obj.secured !== undefined) {
      outcome = obj;
    }
  }
});

child.on('exit', (code) => {
  fs.closeSync(viewFd);
  fs.writeFileSync(path.join(DIR, `${label}-rows.json`), JSON.stringify(rows, null, 0));
  fs.writeFileSync(path.join(DIR, `${label}-stderr.txt`), stderrTail);
  let env = null;
  try {
    const t = JSON.parse(fs.readFileSync(tape, 'utf8'));
    env = {
      durationTicks: t.inputLog?.durationTicks,
      entries: t.inputLog?.entries?.length,
      lastEntryTick: t.inputLog?.entries?.length ? t.inputLog.entries[t.inputLog.entries.length - 1].tick : null,
      bytes: fs.statSync(tape).size,
    };
  } catch { /* no tape */ }
  const summary = { label, code, views, submissions, outcome, envelope: env };
  fs.writeFileSync(path.join(DIR, `${label}-summary.json`), JSON.stringify(summary, null, 1));
  console.log(JSON.stringify(summary));

  // intermediate-results law: best-so-far
  const outPath = path.join(DIR, 'gauntlet-outcome.json');
  let prev = null;
  try { prev = JSON.parse(fs.readFileSync(outPath, 'utf8')); } catch { /* first */ }
  const runsSoFar = (prev?.runsSoFar || 0) + 1;
  const scored = /^attempt-/.test(label);
  const scoredAttempts = (prev?.scoredAttempts || 0) + (scored ? 1 : 0);
  const better = !prev || !prev.secured
    ? (outcome ? true : false)
    : (outcome && outcome.secured && (outcome.waves > (prev.waves || 0)));
  const row = better && outcome
    ? { ...outcome, tape, scored, runsSoFar, scoredAttempts, worldModel: 'sim-import' }
    : { ...prev, runsSoFar, scoredAttempts };
  fs.writeFileSync(outPath, JSON.stringify(row, null, 1));
});
