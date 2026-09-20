// Runner: spawns gr-sim, drives it with a controller module, writes tape + log + outcome.
// usage: node run.mjs <tapeName> [controllerFile] [--idle]
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const WS = '/private/tmp/heat11-5e7a7c0b/artifacts/heat11/opus/e10-last-claim';
const REPO = '/private/tmp/heat11-5e7a7c0b';
const CONTRACT = 'e10-last-claim';
const SEED = 'gold-rush';

const tapeName = process.argv[2];
const controllerFile = process.argv[3];
const idle = process.argv.includes('--idle');

const tapePath = path.join(WS, tapeName);
const logPath = tapePath.replace(/\.json$/, '.log');
const viewsPath = tapePath.replace(/\.json$/, '.views.jsonl');

const args = ['scripts/gr-sim.mjs', '--contract', CONTRACT, '--seed', SEED, '--tape', tapePath];
if (idle) args.push('--policy=idle');

let controller = null;
if (controllerFile && !idle) {
  controller = (await import(path.join(WS, controllerFile) + '?v=' + Date.now())).default;
}

const child = spawn('node', args, { cwd: REPO, stdio: ['pipe', 'pipe', 'pipe'] });
let buf = '';
let stderr = '';
let outcome = null;
const views = [];
let viewCount = 0;

child.stderr.on('data', (d) => { stderr += d.toString(); });

child.stdout.on('data', (d) => {
  buf += d.toString();
  let i;
  while ((i = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, i);
    buf = buf.slice(i + 1);
    if (!line.trim()) continue;
    let obj;
    try { obj = JSON.parse(line); } catch { continue; }
    if (obj.schema === 'goldrush.view.v1') {
      viewCount++;
      views.push(obj);
      if (controller) {
        let orders;
        try { orders = controller(obj, viewCount); } catch (e) {
          console.error('CONTROLLER ERROR', e);
          orders = [];
        }
        if (orders) child.stdin.write(JSON.stringify(orders) + '\n');
      }
    } else {
      outcome = obj;
    }
  }
});

child.on('close', (code) => {
  fs.writeFileSync(viewsPath, views.map((v) => JSON.stringify(v)).join('\n'));
  fs.writeFileSync(logPath, 'exit=' + code + '\nSTDERR:\n' + stderr.slice(-6000) + '\nOUTCOME:\n' + JSON.stringify(outcome, null, 1));
  console.log('EXIT', code, 'views', viewCount);
  console.log('OUTCOME', JSON.stringify(outcome));
  // intermediate results law
  const outPath = path.join(WS, 'gauntlet-outcome.json');
  const scored = /^attempt-/.test(tapeName);
  let prev = null;
  try { prev = JSON.parse(fs.readFileSync(outPath, 'utf8')); } catch {}
  const state = (() => {
    try { return JSON.parse(fs.readFileSync(path.join(WS, '.state.json'), 'utf8')); } catch { return { runsSoFar: 0, scoredAttempts: 0 }; }
  })();
  state.runsSoFar = (state.runsSoFar || 0) + 1;
  if (scored) state.scoredAttempts = (state.scoredAttempts || 0) + 1;
  fs.writeFileSync(path.join(WS, '.state.json'), JSON.stringify(state));
  const rank = (o) => (o && o.secured ? 1e9 : 0) + (o ? (o.waves || 0) * 1000 + (o.gold || 0) : 0);
  const better = !prev || rank(outcome) >= rank(prev) || (prev.secured !== true && outcome && outcome.secured);
  if (better && outcome) {
    fs.writeFileSync(outPath, JSON.stringify({
      ...outcome,
      tape: tapePath,
      scored,
      runsSoFar: state.runsSoFar,
      scoredAttempts: state.scoredAttempts,
      worldModel: 'sim-import',
    }, null, 1));
  } else if (prev) {
    prev.runsSoFar = state.runsSoFar;
    prev.scoredAttempts = state.scoredAttempts;
    fs.writeFileSync(outPath, JSON.stringify(prev, null, 1));
  }
});
