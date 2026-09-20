// runner: spawn gr-sim, drive it with a controller module, write tape + log + outcome file.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const W = '/private/tmp/heat11-5e7a7c0b/artifacts/heat11/opus/e6-half-life-hollow';
const REPO = '/private/tmp/heat11-5e7a7c0b';
const CONTRACT = 'e6-half-life-hollow';
const SEED = 'e6-half-life-hollow-01';
const WORLD_MODEL = 'sim-import';

const name = process.argv[2];               // e.g. probe-idle / tune-1 / attempt-1
const controllerPath = process.argv[3] || null; // null => --policy=idle
const scored = process.argv[4] === 'scored';

const tape = path.join(W, `${name}-tape.json`);
const args = ['scripts/gr-sim.mjs', '--contract', CONTRACT, '--seed', SEED,
  '--difficulty', 'trail', '--tape', tape];
let controller = null;
if (controllerPath) {
  controller = (await import(controllerPath + `?v=${Date.now()}`)).default;
} else {
  args.push('--policy=idle');
}

const child = spawn('node', args, { cwd: REPO, stdio: ['pipe', 'pipe', 'pipe'] });
const views = [];
let outcome = null;
let buf = '';
let errBuf = '';
child.stderr.on('data', (d) => { errBuf += d.toString(); });

child.stdout.on('data', (d) => {
  buf += d.toString();
  let i;
  while ((i = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, i); buf = buf.slice(i + 1);
    if (!line.trim()) continue;
    let msg;
    try { msg = JSON.parse(line); } catch { continue; }
    if (msg.schema === 'goldrush.view.v1') {
      views.push(msg);
      if (controller) {
        let orders;
        try { orders = controller(msg, views); } catch (e) { orders = []; console.error('CTRL ERR', e); }
        child.stdin.write(JSON.stringify(orders) + '\n');
      }
    } else if (Object.prototype.hasOwnProperty.call(msg, 'secured')) {
      outcome = msg;
    }
  }
});

const rc = await new Promise((res) => child.on('close', res));

fs.writeFileSync(path.join(W, `${name}-views.json`), JSON.stringify(views, null, 1));
fs.writeFileSync(path.join(W, `${name}-stderr.txt`), errBuf);
fs.writeFileSync(path.join(W, `${name}-outcome.json`), JSON.stringify(outcome, null, 1));

// intermediate-results law: keep gauntlet-outcome.json at the BEST so far
const OUT = path.join(W, 'gauntlet-outcome.json');
let state = { runsSoFar: 0, scoredAttempts: 0 };
try { state = JSON.parse(fs.readFileSync(OUT, 'utf8')); } catch {}
const runsSoFar = (state.runsSoFar || 0) + 1;
const scoredAttempts = (state.scoredAttempts || 0) + (scored ? 1 : 0);
const better = (a, b) => {
  if (!b) return true;
  if ((a?.secured ? 1 : 0) !== (b.secured ? 1 : 0)) return (a?.secured ? 1 : 0) > (b.secured ? 1 : 0);
  if ((a?.waves || 0) !== (b.waves || 0)) return (a?.waves || 0) > (b.waves || 0);
  return (a?.timeMs || 0) > (b.timeMs || 0);
};
const prevBest = state.secured !== undefined
  ? { secured: state.secured, waves: state.waves, timeMs: state.timeMs } : null;
// a scored SECURE always wins the slot; otherwise strict improvement
const take = (outcome?.secured && scored) || better(outcome, prevBest);
const next = take
  ? { ...outcome, tape, scored, runsSoFar, scoredAttempts, worldModel: WORLD_MODEL }
  : { ...state, runsSoFar, scoredAttempts, worldModel: WORLD_MODEL };
fs.writeFileSync(OUT, JSON.stringify(next, null, 1));

console.log(name, 'rc=' + rc, JSON.stringify(outcome));
console.log('views:', views.length);
if (errBuf.trim()) console.log('STDERR tail:', errBuf.slice(-600));
