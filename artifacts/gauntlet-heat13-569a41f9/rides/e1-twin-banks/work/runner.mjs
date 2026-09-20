// Runner: spawns gr-sim, drives a controller module, logs every view, writes
// gauntlet-outcome.json + envelope axes on every child exit (intermediate-results law).
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const WS = '/tmp/heat13-569a41f9/artifacts/heat13/opus/e1-twin-banks';
const REPO = '/tmp/heat13-569a41f9';
const CONTRACT = 'e1-twin-banks';
const SEED = 'e1-twin-banks-01';
const WORLD_MODEL = 'sim-import';

const label = process.argv[2] || 'probe';
const ctrlPath = process.argv[3] || null;   // controller module path, or null => idle
const tapePath = path.join(WS, `${label}-tape.json`);
const logPath = path.join(WS, `${label}-views.jsonl`);

let controller = null;
if (ctrlPath) controller = (await import(ctrlPath)).default;

const args = ['scripts/gr-sim.mjs', '--contract', CONTRACT, '--seed', SEED, '--tape', tapePath];
if (!ctrlPath) args.push('--policy=idle');

const child = spawn('node', args, { cwd: REPO, stdio: ['pipe', 'pipe', 'pipe'] });
const logFd = fs.openSync(logPath, 'w');

let buf = '';
let views = 0;
let outcome = null;
const rows = [];

child.stdout.on('data', (d) => {
  buf += d.toString();
  let i;
  while ((i = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, i); buf = buf.slice(i + 1);
    if (!line.trim()) continue;
    let msg; try { msg = JSON.parse(line); } catch { continue; }
    if (msg.schema === 'goldrush.view.v1') {
      views++;
      fs.writeSync(logFd, JSON.stringify(msg) + '\n');
      const n = msg.now || {};
      rows.push({
        v: views, t: +(n.timers?.runSeconds ?? n.timers?.simTimeSeconds ?? 0).toFixed(1),
        w: n.wave, hp: n.hero?.hp, mhp: n.hero?.maxHp,
        hx: n.hero?.x != null ? +n.hero.x.toFixed(1) : null,
        hz: n.hero?.z != null ? +n.hero.z.toFixed(1) : null,
        gold: n.gold, pan: n.score?.goldPanned,
        works: n.works?.byKind ? JSON.stringify(n.works.byKind) : null,
        wrk: n.works?.wrecked, alive: n.threats?.alive,
        off: n.pendingOffer ? n.pendingOffer.length : 0,
        sec: !!n.pendingSecure,
      });
      if (controller) {
        let out;
        try { out = controller(msg, { views }); } catch (e) { out = null; console.error('CTRL ERR', e.message); }
        if (out === null || out === undefined) child.stdin.write('\n');
        else child.stdin.write(JSON.stringify(out) + '\n');
      }
    } else if (msg.secured !== undefined || msg.waves !== undefined) {
      outcome = msg;
    }
  }
});

let stderrTail = '';
child.stderr.on('data', (d) => { stderrTail = (stderrTail + d.toString()).slice(-4000); });

child.on('exit', (code) => {
  fs.closeSync(logFd);
  const summary = { label, code, views, outcome, stderrTail: stderrTail.slice(-1200) };
  // envelope axes
  let env = {};
  try {
    const tape = JSON.parse(fs.readFileSync(tapePath, 'utf8'));
    const il = tape.inputLog || {};
    const entries = il.entries || [];
    const last = entries.length ? entries[entries.length - 1] : null;
    env = {
      durationTicks: il.durationTicks,
      entries: entries.length,
      lastEntryTick: last ? (last.t ?? last.tick) : null,
      bytes: fs.statSync(tapePath).size,
      eventLogHash: tape.eventLogHash || tape.meta?.eventLogHash,
    };
  } catch (e) { env = { error: e.message }; }
  summary.envelope = env;
  fs.writeFileSync(path.join(WS, `${label}-summary.json`), JSON.stringify(summary, null, 1));
  fs.writeFileSync(path.join(WS, `${label}-table.json`), JSON.stringify(rows, null, 0));

  // intermediate-results law: promote best-so-far
  const outPath = path.join(WS, 'gauntlet-outcome.json');
  let prev = null;
  try { prev = JSON.parse(fs.readFileSync(outPath, 'utf8')); } catch {}
  const runsSoFar = (prev?.runsSoFar || 0) + 1;
  const scored = /^attempt-/.test(label);
  const scoredAttempts = (prev?.scoredAttempts || 0) + (scored ? 1 : 0);
  const better = !prev || !prev.secured
    ? true
    : (outcome?.secured && (outcome.waves > (prev.waves || 0) ||
       (outcome.waves === prev.waves && (outcome.gold || 0) >= (prev.gold || 0))));
  const base = better && outcome ? outcome : (prev || {});
  const row = {
    ...base,
    tape: better && outcome ? tapePath : (prev?.tape || tapePath),
    scored: better && outcome ? scored : (prev?.scored ?? false),
    runsSoFar, scoredAttempts, worldModel: WORLD_MODEL,
    envelope: better && outcome ? env : prev?.envelope,
  };
  fs.writeFileSync(outPath, JSON.stringify(row, null, 1));
  console.log(JSON.stringify({ label, code, views, outcome, env }, null, 1));
  console.log('TAIL', JSON.stringify(rows.slice(-6)));
});
