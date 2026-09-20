// Runner: spawns gr-sim, drives a controller module, logs every view, writes outcome on exit.
// Notebook law: shell redirection is refused in this arena; the runner is the only way the
// intermediate-results law gets satisfied automatically.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const DIR = '/tmp/heat13-569a41f9/artifacts/heat13/opus/e1-baron';
const REPO = '/private/tmp/heat13-569a41f9';
const CONTRACT = 'e1-baron';
const SEED = 'e1-baron-01';

const [, , ctrlPath, tapeName, ...rest] = process.argv;
const idle = rest.includes('--idle');
const tape = path.join(DIR, tapeName);

const optArg = rest.find((r) => r.startsWith('{')) || '{}';
const ctrl = idle ? null : await import(ctrlPath);
const make = ctrl?.default;
const policy = make ? make(JSON.parse(optArg)) : null;

const args = ['scripts/gr-sim.mjs', '--contract', CONTRACT, '--seed', SEED, '--tape', tape];
if (idle) args.push('--policy=idle');

const child = spawn('node', args, { cwd: REPO, stdio: ['pipe', 'pipe', 'pipe'] });

const viewLog = [];
let outcome = null;
let buf = '';
let stderrBuf = '';
let views = 0;
let submits = 0;

child.stderr.on('data', (d) => { stderrBuf += d.toString(); });

child.stdout.on('data', (d) => {
  buf += d.toString();
  let i;
  while ((i = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, i).trim();
    buf = buf.slice(i + 1);
    if (!line) continue;
    let msg;
    try { msg = JSON.parse(line); } catch { continue; }
    if (msg.schema === 'goldrush.view.v1') {
      views++;
      const row = policy ? policy.note(msg) : noteIdle(msg);
      if (row) viewLog.push(row);
      if (!idle) {
        let orders;
        try { orders = policy.decide(msg); } catch (e) { orders = { blank: true, err: String(e) }; }
        if (orders && orders.blank) { child.stdin.write('\n'); }
        else { child.stdin.write(JSON.stringify(orders) + '\n'); submits++; }
      }
    } else if (msg.secured !== undefined || msg.endReason !== undefined) {
      outcome = msg;
    }
  }
});

function noteIdle(v) {
  const n = v.now || {};
  return {
    t: +(n.timers?.runSeconds ?? 0).toFixed(2), w: n.wave,
    hp: +(n.hero?.hp ?? 0).toFixed(1), maxHp: n.hero?.maxHp, lvl: n.hero?.level,
    hx: +(n.hero?.x ?? 0).toFixed(1), hz: +(n.hero?.z ?? 0).toFixed(1),
    gold: n.gold, pan: n.score?.goldPanned,
    alive: n.threats?.alive, wr: n.threats?.wreckers, th: n.threats?.thieves,
    works: n.works?.standing, wrecked: n.works?.wrecked,
  };
}

child.on('exit', (code) => {
  const summary = {
    contract: CONTRACT, seed: SEED, tape, code,
    outcome, views, submits,
    stderrTail: stderrBuf.slice(-2500),
  };
  // envelope axes off the tape
  try {
    const t = JSON.parse(fs.readFileSync(tape, 'utf8'));
    const entries = t.inputLog?.entries ?? [];
    const ticks = entries.map((e) => e.t ?? e.tick ?? e.atTick).filter((x) => Number.isFinite(x));
    summary.envelope = {
      durationTicks: t.inputLog?.durationTicks,
      lastEntryTick: ticks.length ? Math.max(...ticks) : null,
      entries: entries.length,
      bytes: fs.statSync(tape).size,
      tapeHash: t.meta?.eventLogHash ?? t.eventLogHash ?? null,
    };
  } catch (e) { summary.envelope = { err: String(e) }; }

  fs.writeFileSync(path.join(DIR, tapeName.replace('.json', '') + '-views.json'), JSON.stringify(viewLog, null, 0));
  fs.writeFileSync(path.join(DIR, tapeName.replace('.json', '') + '-summary.json'), JSON.stringify(summary, null, 1));

  // INTERMEDIATE-RESULTS LAW: promote to gauntlet-outcome.json if this is the best so far.
  const outPath = path.join(DIR, 'gauntlet-outcome.json');
  let prev = null;
  try { prev = JSON.parse(fs.readFileSync(outPath, 'utf8')); } catch {}
  const score = (o) => o ? ((o.secured ? 1e9 : 0) + (o.waves ?? 0) * 1000 + (o.timeMs ?? 0) / 1000) : -1;
  const runsSoFar = (prev?.runsSoFar ?? 0) + 1;
  const scoredAttempts = (prev?.scoredAttempts ?? 0) + (tapeName.startsWith('attempt') ? 1 : 0);
  const better = !prev || score(outcome) >= score(prev.outcomeRaw ?? prev);
  const row = better
    ? { ...outcome, outcomeRaw: outcome, tape, scored: tapeName.startsWith('attempt'), runsSoFar, scoredAttempts, worldModel: 'sim-import', envelope: summary.envelope }
    : { ...prev, runsSoFar, scoredAttempts };
  fs.writeFileSync(outPath, JSON.stringify(row, null, 1));

  console.log(JSON.stringify({ outcome, views, submits, envelope: summary.envelope }, null, 1));
  console.log('stderrTail:', stderrBuf.slice(-900));
});
