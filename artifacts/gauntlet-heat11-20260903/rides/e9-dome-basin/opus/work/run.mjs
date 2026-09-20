#!/usr/bin/env node
// Runner: spawns gr-sim, drives it with a controller module, writes outcome file after EVERY run.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const WS = '/private/tmp/heat11-5e7a7c0b/artifacts/heat11/opus/e9-dome-basin';
const SIM = '/private/tmp/heat11-5e7a7c0b/scripts/gr-sim.mjs';
const OUTCOME = path.join(WS, 'gauntlet-outcome.json');
const STATE = path.join(WS, '.runstate.json');
const WORLD_MODEL = 'sim-import';

const args = process.argv.slice(2);
const tapeName = args[0];                 // e.g. probe-idle.json
const controllerPath = args[1] || null;   // null => --policy idle
const scored = args.includes('--scored');

const tape = path.join(WS, tapeName);
const logPath = tape.replace(/\.json$/, '.ndjson');
const viewsPath = tape.replace(/\.json$/, '.views.json');

const simArgs = ['--contract', 'e9-dome-basin', '--seed', 'e9-dome-basin-01',
  '--difficulty', 'trail', '--tape', tape];
if (!controllerPath) simArgs.push('--policy', 'idle');

let decide = null;
if (controllerPath) {
  const mod = await import(path.resolve(WS, controllerPath) + '?t=' + Date.now());
  decide = mod.decide;
}

const child = spawn('node', [SIM, ...simArgs], { cwd: '/private/tmp/heat11-5e7a7c0b', stdio: ['pipe', 'pipe', 'pipe'] });

let buf = '';
let stderrBuf = '';
const lines = [];
const views = [];
let outcome = null;
let ctx = {};

child.stderr.on('data', d => { stderrBuf += d.toString(); });

child.stdout.on('data', (d) => {
  buf += d.toString();
  let idx;
  while ((idx = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, idx).trim();
    buf = buf.slice(idx + 1);
    if (!line) continue;
    lines.push(line);
    let obj;
    try { obj = JSON.parse(line); } catch { continue; }
    if (obj.schema === 'goldrush.view.v1') {
      views.push(obj);
      if (decide) {
        let orders;
        try { orders = decide(obj, ctx, views); } catch (e) {
          console.error('CONTROLLER THREW:', e.stack); orders = [];
        }
        child.stdin.write(JSON.stringify(orders) + '\n');
      }
    } else if (obj.secured !== undefined || obj.endReason !== undefined) {
      outcome = obj;
    }
  }
});

child.on('close', (code) => {
  fs.writeFileSync(logPath, lines.join('\n'));
  fs.writeFileSync(viewsPath, JSON.stringify(views, null, 1));
  if (stderrBuf) fs.writeFileSync(tape.replace(/\.json$/, '.err'), stderrBuf);
  if (!outcome) {
    // try last line
    for (let i = lines.length - 1; i >= 0; i--) {
      try { const o = JSON.parse(lines[i]); if (o.secured !== undefined) { outcome = o; break; } } catch {}
    }
  }
  // state
  let st = { runsSoFar: 0, scoredAttempts: 0, best: null };
  if (fs.existsSync(STATE)) st = JSON.parse(fs.readFileSync(STATE, 'utf8'));
  st.runsSoFar++;
  if (scored) st.scoredAttempts++;
  const rank = (o) => o ? (o.secured ? 1e9 : 0) + (o.timeMs || 0) / 1000 : -1;
  const cand = outcome ? { ...outcome, tape: tape, scored } : null;
  if (cand && (!st.best || rank(cand) >= rank(st.best))) st.best = cand;
  fs.writeFileSync(STATE, JSON.stringify(st, null, 1));

  const b = st.best || {};
  const outObj = { ...b, tape: b.tape || null, scored: !!b.scored,
    runsSoFar: st.runsSoFar, scoredAttempts: st.scoredAttempts, worldModel: WORLD_MODEL };
  fs.writeFileSync(OUTCOME, JSON.stringify(outObj, null, 1));

  console.log('EXIT', code, 'views', views.length);
  console.log('OUTCOME', JSON.stringify(outcome));
  if (stderrBuf) console.log('STDERR(tail)', stderrBuf.slice(-1200));
});
