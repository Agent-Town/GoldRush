#!/usr/bin/env node
// Generation 122 runner — e1-baron. Spawns gr-sim, drives the controller, logs every view,
// writes gauntlet-outcome.json + all three envelope axes on every child exit.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const WS = '/private/tmp/claude-501/-Users-robin-Claude-Projects-Gold-Rush/fe6b8d27-b064-40eb-934b-1d29d57a71db/scratchpad/arena-heat14-e3949bfa/artifacts/heat14/opus/e1-baron';
const REPO = '/private/tmp/claude-501/-Users-robin-Claude-Projects-Gold-Rush/fe6b8d27-b064-40eb-934b-1d29d57a71db/scratchpad/arena-heat14-e3949bfa';

const label = process.argv[2] || 'probe';
const mode = process.argv[3] || 'idle'; // 'idle' | 'ctrl'
const tape = path.join(WS, `${label}-tape.json`);
const logPath = path.join(WS, `${label}-views.jsonl`);

const args = ['scripts/gr-sim.mjs', '--contract', 'e1-baron', '--seed', 'e1-baron-01', '--tape', tape];
if (mode === 'idle') args.push('--policy', 'idle');

let controller = null;
if (mode === 'ctrl') {
  const mod = await import(path.join(WS, 'controller.mjs'));
  controller = mod.makeController();
}

const child = spawn('node', args, { cwd: REPO, stdio: ['pipe', 'pipe', 'pipe'] });
const logFd = fs.openSync(logPath, 'w');
let buf = '';
let views = 0;
let outcome = null;
const rows = [];

child.stdout.on('data', (chunk) => {
  buf += chunk.toString();
  let nl;
  while ((nl = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, nl);
    buf = buf.slice(nl + 1);
    if (!line.trim()) continue;
    let msg;
    try { msg = JSON.parse(line); } catch { continue; }
    if (msg.schema === 'goldrush.view.v1') {
      views += 1;
      fs.writeSync(logFd, JSON.stringify(msg) + '\n');
      const n = msg.now || {};
      rows.push({
        v: views, t: +(n.timers?.runSeconds ?? 0).toFixed(1), w: n.wave,
        gold: n.gold, pan: n.score?.goldPanned, stolen: n.score?.goldStolen,
        hp: +(n.hero?.hp ?? 0).toFixed(1), mx: n.hero?.maxHp,
        hx: +(n.hero?.x ?? 0).toFixed(1), hz: +(n.hero?.z ?? 0).toFixed(1),
        alive: n.threats?.alive, wr: n.threats?.wreckers, th: n.threats?.thieves,
        st: n.works?.standing, wk: n.works?.wrecked,
        kinds: n.works?.byKind ? JSON.stringify(n.works.byKind) : '',
      });
      if (controller) {
        const reply = controller.onView(msg);
        child.stdin.write(reply === null ? '\n' : JSON.stringify(reply) + '\n');
      }
    } else if (msg.secured !== undefined || msg.endReason !== undefined) {
      outcome = msg;
    }
  }
});

let stderrTail = '';
child.stderr.on('data', (c) => { stderrTail = (stderrTail + c.toString()).slice(-4000); });

child.on('close', () => {
  fs.closeSync(logFd);
  // envelope: all three axes, measured off the tape that exists
  let env = { ok: false };
  try {
    const t = JSON.parse(fs.readFileSync(tape, 'utf8'));
    const entries = t.inputLog?.entries ?? [];
    const lastTick = entries.length ? Math.max(...entries.map((e) => e.t ?? e.tick ?? 0)) : 0;
    env = {
      durationTicks: t.inputLog?.durationTicks,
      lastEntryTick: lastTick,
      entries: entries.length,
      bytes: fs.statSync(tape).size,
      tapeHash: t.meta?.eventLogHash ?? t.eventLogHash ?? null,
      ok: true,
    };
  } catch (e) { env.err = e.message; }

  const summary = { label, mode, outcome, envelope: env, views, rows: rows.slice(-14), stderrTail: stderrTail.slice(-600) };
  fs.writeFileSync(path.join(WS, `${label}-summary.json`), JSON.stringify(summary, null, 1));

  // INTERMEDIATE-RESULTS LAW: (over)write best-so-far after EVERY run, including failures.
  const outPath = path.join(WS, 'gauntlet-outcome.json');
  let prev = null;
  try { prev = JSON.parse(fs.readFileSync(outPath, 'utf8')); } catch { }
  const runsSoFar = (prev?.runsSoFar ?? 0) + 1;
  const scored = /^attempt-/.test(label);
  const scoredAttempts = (prev?.scoredAttempts ?? 0) + (scored ? 1 : 0);
  const better = !prev || !prev.secured
    ? true
    : (outcome?.secured === true && (outcome.waves ?? 0) > (prev.waves ?? 0));
  const row = better && outcome
    ? { ...outcome, tape, scored, runsSoFar, scoredAttempts, worldModel: 'sim-import', envelope: env }
    : { ...prev, runsSoFar, scoredAttempts };
  fs.writeFileSync(outPath, JSON.stringify(row, null, 1));

  console.log(JSON.stringify({ label, outcome, envelope: env, views }, null, 1));
  console.log('ROWS');
  for (const r of rows.filter((_, i) => i % Math.max(1, Math.ceil(rows.length / 28)) === 0 || _.w >= 19)) {
    console.log(JSON.stringify(r));
  }
  if (stderrTail.includes('rejected')) console.log('STDERR', stderrTail.slice(-500));
});
