// Gauntlet runner: drives gr-sim over NDJSON, logs views, writes outcome file.
// usage: node run.mjs <controllerFile|idle> <tapeName> [scored]
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const WS = '/tmp/heat11-b118c4d2/artifacts/heat11/opus/e8-mare-claim';
const REPO = '/tmp/heat11-b118c4d2';
const WORLD_MODEL = 'sim-import';

const ctrlArg = process.argv[2];
const tapeName = process.argv[3];
const scored = process.argv[4] === 'scored';
const tapePath = path.join(WS, tapeName);

let controller = null;
if (ctrlArg !== 'idle') {
  const mod = await import(path.join(WS, ctrlArg));
  controller = mod.default ?? mod.controller;
}

const args = ['scripts/gr-sim.mjs', '--contract', 'e8-mare-claim', '--seed', 'e8-mare-claim-01',
  '--difficulty', 'trail', '--tape', tapePath];
if (ctrlArg === 'idle') args.push('--policy', 'idle');

const child = spawn('node', args, { cwd: REPO, stdio: ['pipe', 'pipe', 'pipe'] });

const views = [];
let outcome = null;
let buf = '';
let stderr = '';
child.stderr.on('data', d => { stderr += d.toString(); });

const state = {};

child.stdout.on('data', d => {
  buf += d.toString();
  let i;
  while ((i = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, i).trim();
    buf = buf.slice(i + 1);
    if (!line) continue;
    let obj;
    try { obj = JSON.parse(line); } catch { continue; }
    if (obj.schema && obj.schema.startsWith('goldrush.view')) {
      views.push(obj);
      if (controller) {
        let orders;
        try { orders = controller(obj, state, views.length - 1); }
        catch (e) { console.error('CONTROLLER THREW', e); orders = []; }
        if (orders) child.stdin.write(JSON.stringify(orders) + '\n');
      }
    } else if (typeof obj.secured === 'boolean') {
      outcome = obj;
    }
  }
});

child.on('close', code => {
  fs.writeFileSync(path.join(WS, tapeName.replace(/-tape\.json$/, '') + '-views.json'), JSON.stringify(views, null, 1));
  fs.writeFileSync(path.join(WS, tapeName.replace(/-tape\.json$/, '') + '-stderr.txt'), stderr);
  const res = { exit: code, outcome };
  fs.writeFileSync(path.join(WS, tapeName.replace(/-tape\.json$/, '') + '-outcome.json'), JSON.stringify(res, null, 1));
  console.log('exit', code, 'views', views.length);
  console.log('OUTCOME', JSON.stringify(outcome));
  // update best-so-far gauntlet-outcome.json
  const gpath = path.join(WS, 'gauntlet-outcome.json');
  let prev = null;
  try { prev = JSON.parse(fs.readFileSync(gpath, 'utf8')); } catch {}
  const runsPath = path.join(WS, '.runs.json');
  let meta = { runs: 0, scored: 0 };
  try { meta = JSON.parse(fs.readFileSync(runsPath, 'utf8')); } catch {}
  meta.runs += 1;
  if (scored) meta.scored += 1;
  fs.writeFileSync(runsPath, JSON.stringify(meta));
  const rank = o => o ? [(o.secured ? 1 : 0), o.waves || 0, (o.timeMs || 0) / 1000, o.gold || 0] : [0, 0, 0, 0];
  const a = rank(outcome), b = prev ? [prev.secured ? 1 : 0, prev.waves || 0, prev.timeAlive || 0, prev.gold || 0] : [-1, -1, -1, -1];
  const better = (a[0] > b[0]) || (a[0] === b[0] && (a[1] > b[1] || (a[1] === b[1] && (a[2] > b[2] || (a[2] === b[2] && (a[3] > b[3] || (a[3] === b[3] && scored)))))));
  if (outcome && better) {
    const row = { ...outcome, timeAlive: (outcome.timeMs || 0) / 1000, tape: tapePath, scored, runsSoFar: meta.runs, scoredAttempts: meta.scored, worldModel: WORLD_MODEL };
    fs.writeFileSync(gpath, JSON.stringify(row, null, 1));
  } else if (prev) {
    prev.runsSoFar = meta.runs; prev.scoredAttempts = meta.scored;
    fs.writeFileSync(gpath, JSON.stringify(prev, null, 1));
  }
});
