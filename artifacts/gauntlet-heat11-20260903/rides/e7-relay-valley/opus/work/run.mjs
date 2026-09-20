// Gauntlet runner: spawns gr-sim, drives a controller, writes outcome + view log.
// usage: node run.mjs <tapeName> <controllerPath|idle> [scored]
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const WS = '/private/tmp/heat11-5e7a7c0b/artifacts/heat11/opus/e7-relay-valley';
const SIM = '/private/tmp/heat11-5e7a7c0b/scripts/gr-sim.mjs';
const CONTRACT = 'e7-relay-valley';
const SEED = 'e7-relay-valley-01';

const tapeName = process.argv[2];
const ctrlPath = process.argv[3];
const scored = process.argv[4] === 'scored';
const tape = path.join(WS, tapeName);

let controller = null;
if (ctrlPath && ctrlPath !== 'idle') {
  controller = (await import(path.join(WS, ctrlPath) + '?t=' + Date.now())).default;
}

const args = ['--contract', CONTRACT, '--seed', SEED, '--difficulty', 'trail', '--tape', tape];
if (!controller) args.push('--policy=idle');

const child = spawn('node', [SIM, ...args], { cwd: '/private/tmp/heat11-5e7a7c0b', stdio: ['pipe', 'pipe', 'pipe'] });

const views = [];
let outcome = null;
let buf = '';
let err = '';
child.stderr.on('data', (d) => { err += d.toString(); });

const state = {};

child.stdout.on('data', (d) => {
  buf += d.toString();
  let i;
  while ((i = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, i);
    buf = buf.slice(i + 1);
    if (!line.trim()) continue;
    let msg;
    try { msg = JSON.parse(line); } catch { continue; }
    if (msg.schema === 'goldrush.view.v1') {
      views.push(msg);
      if (controller) {
        let orders;
        try { orders = controller(msg, state, views); } catch (e) { console.error('CTRL ERR', e); orders = []; }
        try { child.stdin.write(JSON.stringify(orders) + '\n'); } catch {}
      }
    } else {
      outcome = msg;
    }
  }
});

child.on('close', (code) => {
  fs.writeFileSync(path.join(WS, tapeName.replace(/\.json$/, '') + '-views.json'), JSON.stringify(views, null, 1));
  fs.writeFileSync(path.join(WS, tapeName.replace(/\.json$/, '') + '.err.txt'), err.slice(-20000));
  console.log('exit', code, 'views', views.length);
  console.log('OUTCOME', JSON.stringify(outcome));
  if (err) console.log('ERRTAIL', err.slice(-1500));

  // intermediate results law
  const outPath = path.join(WS, 'gauntlet-outcome.json');
  let prev = null;
  try { prev = JSON.parse(fs.readFileSync(outPath, 'utf8')); } catch {}
  const runs = (prev?.runsSoFar || 0) + 1;
  const sc = (prev?.scoredAttempts || 0) + (scored ? 1 : 0);
  const better = (a, b) => {
    if (!b) return true;
    if ((a?.secured ? 1 : 0) !== (b.secured ? 1 : 0)) return (a?.secured ? 1 : 0) > (b.secured ? 1 : 0);
    if ((a?.timeMs || 0) !== (b.timeMs || 0)) return (a?.timeMs || 0) > (b.timeMs || 0);
    return (a?.gold || 0) >= (b.gold || 0);
  };
  const prevScore = prev ? { secured: prev.secured, timeMs: prev.timeMs, gold: prev.gold } : null;
  let rec;
  if (outcome && better(outcome, prevScore)) {
    rec = { ...outcome, tape: tape, scored };
  } else {
    rec = { ...prev };
  }
  rec.runsSoFar = runs; rec.scoredAttempts = sc; rec.worldModel = 'sim-import';
  fs.writeFileSync(outPath, JSON.stringify(rec, null, 2));
});
