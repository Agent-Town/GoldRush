// Node runner: spawns gr-sim, drives a controller module, logs every view,
// writes gauntlet-outcome.json + envelope axes on every child exit.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const WS = '/private/tmp/heat13-569a41f9/artifacts/heat13/opus/e2-trestle';
const REPO = '/private/tmp/heat13-569a41f9';

const tag = process.argv[2] || 'probe';
const ctrlPath = process.argv[3] || null;
const tape = path.join(WS, `${tag}-tape.json`);
const logPath = path.join(WS, `${tag}-views.jsonl`);

let controller = null;
if (ctrlPath) controller = (await import(ctrlPath)).default;

const args = ['scripts/gr-sim.mjs', '--contract', 'e2-trestle', '--seed', 'e2-trestle-01',
  '--difficulty', 'trail', '--tape', tape];
if (!controller) args.push('--policy', 'idle');

const child = spawn('node', args, { cwd: REPO, stdio: ['pipe', 'pipe', 'pipe'] });
let buf = '';
let stderr = '';
let last = null;
const rows = [];
fs.writeFileSync(logPath, '');

child.stderr.on('data', d => { stderr += d.toString(); });

child.stdout.on('data', d => {
  buf += d.toString();
  let i;
  while ((i = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, i); buf = buf.slice(i + 1);
    if (!line.trim()) continue;
    let msg;
    try { msg = JSON.parse(line); } catch { continue; }
    if (msg.outcome || msg.secured !== undefined && msg.now === undefined && msg.waves !== undefined) {
      last = msg; continue;
    }
    if (msg.now) {
      fs.appendFileSync(logPath, line + '\n');
      const n = msg.now;
      rows.push({ t: n.timers?.runSeconds ?? n.timers?.simTimeSeconds ?? 0, w: n.wave, hp: n.hero?.hp,
        mhp: n.hero?.maxHp, hx: n.hero?.x, hz: n.hero?.z, g: n.gold, pan: n.score?.goldPanned,
        alive: n.threats?.alive, wr: n.works?.wrecked, st: n.works?.standing });
      let out = '\n';
      if (controller) {
        try { out = controller(n, msg) ?? '\n'; } catch (e) { stderr += 'CTRL ERR ' + e.stack + '\n'; out = '\n'; }
      }
      child.stdin.write(out.endsWith('\n') ? out : out + '\n');
    }
  }
});

child.on('exit', (code) => {
  const summary = { tag, code, outcome: last, rows: rows.length, stderrTail: stderr.slice(-2000) };
  // envelope
  try {
    const t = JSON.parse(fs.readFileSync(tape, 'utf8'));
    const il = t.inputLog || {};
    const entries = il.entries || [];
    const lastTick = entries.length ? Math.max(...entries.map(e => e.t ?? e.tick ?? 0)) : 0;
    summary.envelope = { durationTicks: il.durationTicks, lastEntryTick: lastTick,
      entries: entries.length, bytes: fs.statSync(tape).size };
  } catch (e) { summary.envelope = { err: String(e) }; }
  fs.writeFileSync(path.join(WS, `${tag}-summary.json`), JSON.stringify(summary, null, 1));
  console.log(JSON.stringify(summary.outcome));
  console.log('ENV ' + JSON.stringify(summary.envelope));
  console.log('ROWS');
  const step = Math.max(1, Math.floor(rows.length / 40));
  rows.filter((_, i) => i % step === 0 || i === rows.length - 1).forEach(r =>
    console.log(`t=${(r.t ?? 0).toFixed(1)} w=${r.w} hp=${r.hp}/${r.mhp} @(${(r.hx ?? 0).toFixed(1)},${(r.hz ?? 0).toFixed(1)}) g=${r.g} pan=${r.pan} alive=${r.alive} works=${r.st}/wr${r.wr}`));
  if (stderr) console.log('STDERR ' + stderr.slice(-1500));
  // intermediate-results law: promote best-so-far
  const outFile = path.join(WS, 'gauntlet-outcome.json');
  let prev = null;
  try { prev = JSON.parse(fs.readFileSync(outFile, 'utf8')); } catch {}
  const runsSoFar = (prev?.runsSoFar ?? 0) + 1;
  const scoredAttempts = (prev?.scoredAttempts ?? 0) + (tag.startsWith('attempt') ? 1 : 0);
  const better = !prev || (last?.secured && !prev.secured) ||
    (!!last?.secured === !!prev.secured && (last?.timeMs ?? 0) > (prev.timeMs ?? 0));
  const base = better && last ? { ...last, tape, scored: tag.startsWith('attempt') } : prev;
  fs.writeFileSync(outFile, JSON.stringify({ ...base, runsSoFar, scoredAttempts,
    worldModel: 'sim-import' }, null, 1));
});
