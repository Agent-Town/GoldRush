#!/usr/bin/env node
// Runner: spawns gr-sim with a controller (or idle), captures everything, and
// writes gauntlet-outcome.json (best-so-far) on EVERY child exit.
// usage: node run.mjs <label> [controllerPath|--idle] [--scored]
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const DIR = '/private/tmp/heat12-038cc280/artifacts/heat12/opus/e3-moth-season';
const REPO = '/private/tmp/heat12-038cc280';
const CONTRACT = 'e3-moth-season';
const SEED = 'e3-moth-season-01';
const WORLD_MODEL = 'sim-import';

const label = process.argv[2];
const ctrl = process.argv[3];
const scored = process.argv.includes('--scored');
if (!label) { console.error('need label'); process.exit(2); }

const tape = path.join(DIR, `${label}-tape.json`);
const args = ['scripts/gr-sim.mjs', '--contract', CONTRACT, '--seed', SEED, '--tape', tape];
if (ctrl === '--idle') args.push('--policy', 'idle');

const statePath = path.join(DIR, 'runner-state.json');
let state = { runs: 0, scoredAttempts: 0, best: null };
try { state = JSON.parse(fs.readFileSync(statePath, 'utf8')); } catch {}

const child = spawn('node', args, { cwd: REPO, stdio: ['pipe', 'pipe', 'pipe'] });

let stderrBuf = '';
child.stderr.on('data', d => { stderrBuf += d.toString(); });

// Controller module: exports decide(view, ctx) -> array | string("\n" blank) | null
let controller = null;
if (ctrl && ctrl !== '--idle') {
  controller = await import(ctrl.startsWith('/') ? ctrl : path.resolve(ctrl));
}

const views = [];
let outcome = null;
let buf = '';
const ctx = { views, log: [] };

child.stdout.on('data', chunk => {
  buf += chunk.toString();
  let i;
  while ((i = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, i); buf = buf.slice(i + 1);
    if (!line.trim()) continue;
    let obj;
    try { obj = JSON.parse(line); } catch { ctx.log.push({ unparsed: line.slice(0, 200) }); continue; }
    if (obj.schema === 'goldrush.view.v1') {
      views.push(obj);
      if (controller) {
        let reply;
        try { reply = controller.decide(obj, ctx); }
        catch (e) { ctx.log.push({ controllerError: String(e && e.stack || e) }); reply = null; }
        if (reply === '\n' || reply === 'BLANK') child.stdin.write('\n');
        else if (Array.isArray(reply)) child.stdin.write(JSON.stringify(reply) + '\n');
        else child.stdin.write('\n');
      }
    } else if (obj.secured !== undefined || obj.endReason !== undefined) {
      outcome = obj;
    } else {
      ctx.log.push({ other: obj });
    }
  }
});

child.on('close', code => {
  state.runs += 1;
  if (scored) state.scoredAttempts += 1;
  fs.writeFileSync(path.join(DIR, `${label}-views.json`), JSON.stringify(views, null, 1));
  fs.writeFileSync(path.join(DIR, `${label}-stderr.txt`), stderrBuf.slice(-40000));
  if (ctx.log.length) fs.writeFileSync(path.join(DIR, `${label}-ctrl.log`), JSON.stringify(ctx.log.slice(-400), null, 1));

  // tape envelope measurement
  let env = null;
  try {
    const t = JSON.parse(fs.readFileSync(tape, 'utf8'));
    const entries = t.inputLog?.entries || [];
    const last = entries.length ? entries[entries.length - 1].tick : null;
    env = {
      durationTicks: t.inputLog?.durationTicks ?? null,
      entries: entries.length,
      lastEntryTick: last,
      bytes: fs.statSync(tape).size,
    };
  } catch {}

  const row = {
    label, scored, outcome, envelope: env,
    views: views.length, exitCode: code,
  };
  // best-so-far: secured beats unsecured; then waves; then timeMs; then gold
  const score = r => {
    const o = r.outcome || {};
    return [o.secured ? 1 : 0, o.waves || 0, o.timeMs || 0, o.gold || 0];
  };
  const better = (a, b) => {
    const A = score(a), B = score(b);
    for (let i = 0; i < A.length; i++) { if (A[i] !== B[i]) return A[i] > B[i]; }
    return false;
  };
  if (!state.best || better(row, state.best)) state.best = row;
  fs.writeFileSync(statePath, JSON.stringify(state, null, 1));

  const b = state.best;
  const out = {
    ...(b.outcome || {}),
    tape: path.join(DIR, `${b.label}-tape.json`),
    scored: !!b.scored,
    runsSoFar: state.runs,
    scoredAttempts: state.scoredAttempts,
    worldModel: WORLD_MODEL,
    envelope: b.envelope,
    note: `best-so-far = run "${b.label}"`,
  };
  fs.writeFileSync(path.join(DIR, 'gauntlet-outcome.json'), JSON.stringify(out, null, 1));
  console.log(JSON.stringify({ label, exitCode: code, outcome, envelope: env, views: views.length }, null, 1));
  if (stderrBuf.trim()) console.log('STDERR-tail:', stderrBuf.slice(-1200));
});
