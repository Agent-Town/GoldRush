#!/usr/bin/env node
// Runner: spawns gr-sim, drives it with a controller module, writes outcome file.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const WS = '/private/tmp/heat11-5e7a7c0b/artifacts/heat11/opus/e7-echo-canyon';
const REPO = '/private/tmp/heat11-5e7a7c0b';
const CONTRACT = 'e7-echo-canyon';
const SEED = 'e7-echo-canyon-01';

const args = process.argv.slice(2);
const tapeName = args[0] || 'probe-idle.json';
const controllerName = args[1] || null; // null => --policy idle
const scored = args[2] === 'scored';

const tapePath = path.join(WS, tapeName);
const logPath = tapePath.replace(/\.json$/, '.ndjson');
const viewsOut = [];

const simArgs = ['scripts/gr-sim.mjs', '--contract', CONTRACT, '--seed', SEED, '--tape', tapePath];
if (!controllerName) simArgs.push('--policy', 'idle');

let controller = null;
if (controllerName) {
  const mod = await import(path.join(WS, controllerName) + `?v=${Date.now()}`);
  controller = mod.default || mod.decide;
}

const child = spawn('node', simArgs, { cwd: REPO, stdio: ['pipe', 'pipe', 'pipe'] });
let stderr = '';
child.stderr.on('data', d => { stderr += d.toString(); });

let buf = '';
let outcome = null;
let viewCount = 0;
const state = {};

child.stdout.on('data', chunk => {
  buf += chunk.toString();
  let idx;
  while ((idx = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, idx);
    buf = buf.slice(idx + 1);
    if (!line.trim()) continue;
    let obj;
    try { obj = JSON.parse(line); } catch { continue; }
    viewsOut.push(obj);
    if (obj.schema === 'goldrush.view.v1') {
      viewCount++;
      if (controller) {
        let orders;
        try { orders = controller(obj, state, viewCount); } catch (e) {
          console.error('CONTROLLER ERROR', e);
          orders = [];
        }
        if (orders === 'BLANK') child.stdin.write('\n');
        else if (orders) child.stdin.write(JSON.stringify(orders) + '\n');
      }
    } else if (obj.secured !== undefined) {
      outcome = obj;
    }
  }
});

child.on('close', code => {
  fs.writeFileSync(logPath, viewsOut.map(v => JSON.stringify(v)).join('\n') + '\n');
  fs.writeFileSync(logPath.replace(/\.ndjson$/, '.err'), stderr);
  const summary = { rc: code, views: viewCount, outcome, stderrTail: stderr.slice(-1500) };
  console.log(JSON.stringify(summary, null, 1));
  // intermediate results law: update best-so-far outcome file
  const outFile = path.join(WS, 'gauntlet-outcome.json');
  let prev = null;
  try { prev = JSON.parse(fs.readFileSync(outFile, 'utf8')); } catch {}
  const runsFile = path.join(WS, '.runs.json');
  let counters = { runsSoFar: 0, scoredAttempts: 0 };
  try { counters = JSON.parse(fs.readFileSync(runsFile, 'utf8')); } catch {}
  counters.runsSoFar++;
  if (scored) counters.scoredAttempts++;
  fs.writeFileSync(runsFile, JSON.stringify(counters));
  const better = (a, b) => {
    if (!b) return true;
    if ((a?.secured ? 1 : 0) !== (b.secured ? 1 : 0)) return (a?.secured ? 1 : 0) > (b.secured ? 1 : 0);
    if ((a?.timeMs || 0) !== (b.timeMs || 0)) return (a?.timeMs || 0) > (b.timeMs || 0);
    return (a?.gold || 0) >= (b.gold || 0);
  };
  const row = {
    ...(outcome || { secured: false, note: 'no outcome line', rc: code }),
    tape: tapePath,
    scored,
    runsSoFar: counters.runsSoFar,
    scoredAttempts: counters.scoredAttempts,
    worldModel: 'sim-import',
  };
  if (!prev || better(outcome, prev)) {
    fs.writeFileSync(outFile, JSON.stringify(row, null, 1));
  } else {
    prev.runsSoFar = counters.runsSoFar;
    prev.scoredAttempts = counters.scoredAttempts;
    fs.writeFileSync(outFile, JSON.stringify(prev, null, 1));
  }
});
