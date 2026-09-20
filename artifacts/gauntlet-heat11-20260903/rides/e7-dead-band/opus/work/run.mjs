#!/usr/bin/env node
// Gauntlet runner: rides gr-sim with a controller (or idle), writes the tape,
// and ALWAYS (over)writes gauntlet-outcome.json with the best outcome so far.
// Usage: node run.mjs <tapeName> [controllerPath|--idle] [--scored]
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const DIR = path.dirname(new URL(import.meta.url).pathname);
const REPO = '/private/tmp/heat11-5e7a7c0b';
const CONTRACT = 'e7-dead-band';
const SEED = 'e7-dead-band-01';
const WORLD_MODEL = 'sim-import';

const tapeName = process.argv[2];
const controllerArg = process.argv[3] || '--idle';
const scored = process.argv.includes('--scored');
const tapePath = path.join(DIR, tapeName);

const statePath = path.join(DIR, 'run-state.json');
const outcomePath = path.join(DIR, 'gauntlet-outcome.json');
const state = fs.existsSync(statePath)
  ? JSON.parse(fs.readFileSync(statePath, 'utf8'))
  : { runsSoFar: 0, scoredAttempts: 0, best: null };

const args = ['scripts/gr-sim.mjs', '--contract', CONTRACT, '--seed', SEED,
  '--difficulty', 'trail', '--tape', tapePath];
if (controllerArg === '--idle') args.push('--policy', 'idle');

const child = spawn('node', args, { cwd: REPO, stdio: ['pipe', 'pipe', 'pipe'] });

let controller = null;
if (controllerArg !== '--idle') {
  const mod = await import(path.resolve(controllerArg));
  controller = mod.default;
}

let stdoutBuf = '';
const lines = [];
const views = [];
let outcome = null;
const logPath = path.join(DIR, tapeName.replace(/\.json$/, '') + '.log');
const errChunks = [];

child.stderr.on('data', (d) => errChunks.push(d.toString()));

child.stdout.on('data', (d) => {
  stdoutBuf += d.toString();
  let idx;
  while ((idx = stdoutBuf.indexOf('\n')) >= 0) {
    const line = stdoutBuf.slice(0, idx);
    stdoutBuf = stdoutBuf.slice(idx + 1);
    if (!line.trim()) continue;
    lines.push(line);
    let obj;
    try { obj = JSON.parse(line); } catch { continue; }
    if (obj.schema === 'goldrush.view.v1') {
      views.push(obj);
      if (controller) {
        let orders;
        try { orders = controller(obj, views); } catch (e) {
          console.error('CONTROLLER THREW', e);
          orders = [];
        }
        // A blank line is a lawful answer that records NO tape entry (gr-sim.mjs:241) —
        // the only way to resolve the secure boundary without a terminal-instant order.
        if (orders === '__BLANK__') child.stdin.write('\n');
        else child.stdin.write(JSON.stringify(orders) + '\n');
      }
    } else if (obj.secured !== undefined || obj.endReason !== undefined) {
      outcome = obj;
    }
  }
});

child.on('close', (code) => {
  fs.writeFileSync(logPath, lines.join('\n') + '\n');
  fs.writeFileSync(logPath.replace(/\.log$/, '.err'), errChunks.join(''));
  state.runsSoFar += 1;
  if (scored) state.scoredAttempts += 1;

  let durationTicks = null, entries = null;
  try {
    const tape = JSON.parse(fs.readFileSync(tapePath, 'utf8'));
    durationTicks = tape.inputLog?.durationTicks ?? null;
    entries = tape.inputLog?.entries?.length ?? null;
  } catch { /* no tape */ }

  const rec = { outcome, tape: tapePath, scored, durationTicks, entries, views: views.length };
  const rank = (r) => {
    if (!r || !r.outcome) return [-1, -1, -1, -1];
    return [r.outcome.secured ? 1 : 0, r.outcome.waves || 0, r.outcome.timeMs || 0, r.outcome.gold || 0];
  };
  const cmp = (a, b) => {
    const ra = rank(a), rb = rank(b);
    for (let i = 0; i < ra.length; i++) { if (ra[i] !== rb[i]) return ra[i] - rb[i]; }
    return 0;
  };
  // Promote on strict improvement OR on a tie when the new run is the scored one.
  const c = cmp(rec, state.best);
  if (c > 0 || (c === 0 && scored && !state.best?.scored)) state.best = rec;

  fs.writeFileSync(statePath, JSON.stringify(state, null, 2));
  const best = state.best;
  fs.writeFileSync(outcomePath, JSON.stringify({
    ...(best?.outcome || {}),
    tape: best?.tape || null,
    scored: !!best?.scored,
    runsSoFar: state.runsSoFar,
    scoredAttempts: state.scoredAttempts,
    worldModel: WORLD_MODEL,
    durationTicks: best?.durationTicks ?? null,
    tapeEntries: best?.entries ?? null,
  }, null, 2) + '\n');

  console.log('EXIT', code, 'views', views.length, 'durationTicks', durationTicks, 'entries', entries);
  console.log('OUTCOME', JSON.stringify(outcome));
  if (errChunks.length) console.log('STDERR-TAIL', errChunks.join('').slice(-600));
});
