// Runner: spawns gr-sim, drives it with a controller module, writes outcome + ndjson log.
// usage: node run.mjs <controllerFile|idle> <tapeName> [scored]
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const DIR = '/private/tmp/heat11-5e7a7c0b/artifacts/heat11/opus/e6-glow-mesa';
const REPO = '/private/tmp/heat11-5e7a7c0b';
const CONTRACT = 'e6-glow-mesa';
const SEED = 'e6-glow-mesa-01';
const WORLD_MODEL = 'sim-import';

const controllerFile = process.argv[2];
const tapeName = process.argv[3];
const scored = process.argv[4] === 'scored';
const tapePath = path.join(DIR, tapeName);
const logPath = tapePath.replace(/\.json$/, '.ndjson');

let controller = null;
if (controllerFile !== 'idle') {
  const mod = await import(path.resolve(DIR, controllerFile) + '?t=' + Date.now());
  controller = mod.default;
}

const args = ['scripts/gr-sim.mjs', '--contract', CONTRACT, '--seed', SEED,
  '--difficulty', 'trail', '--tape', tapePath];
if (controllerFile === 'idle') args.push('--policy', 'idle');

const child = spawn('node', args, { cwd: REPO, stdio: ['pipe', 'pipe', 'pipe'] });
const views = [];
let outcome = null;
let buf = '';
let stderr = '';
child.stderr.on('data', d => { stderr += d.toString(); });

child.stdout.on('data', chunk => {
  buf += chunk.toString();
  let i;
  while ((i = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, i).trim();
    buf = buf.slice(i + 1);
    if (!line) continue;
    let obj;
    try { obj = JSON.parse(line); } catch { continue; }
    if (obj.schema === 'goldrush.view.v1') {
      views.push(obj);
      if (controller) {
        let orders;
        try { orders = controller(obj, views); } catch (e) {
          console.error('CONTROLLER ERROR', e.stack); orders = [];
        }
        if (orders) child.stdin.write(JSON.stringify(orders) + '\n');
      }
    } else if (obj.secured !== undefined || obj.endReason !== undefined) {
      outcome = obj;
    }
  }
});

child.on('close', code => {
  fs.writeFileSync(logPath, views.map(v => JSON.stringify(v)).join('\n') + '\n' +
    (outcome ? JSON.stringify(outcome) : ''));
  fs.writeFileSync(tapePath.replace(/\.json$/, '.err.txt'), stderr);
  const summary = { exitCode: code, outcome, views: views.length };
  console.log(JSON.stringify(summary));

  // INTERMEDIATE RESULTS LAW: keep best-so-far on disk after every run.
  const statePath = path.join(DIR, 'runstate.json');
  let st = { runsSoFar: 0, scoredAttempts: 0, best: null };
  if (fs.existsSync(statePath)) st = JSON.parse(fs.readFileSync(statePath, 'utf8'));
  st.runsSoFar += 1;
  if (scored) st.scoredAttempts += 1;
  const better = (a, b) => {
    if (!b) return true;
    if ((a.secured ? 1 : 0) !== (b.secured ? 1 : 0)) return a.secured;
    if ((a.timeMs || 0) !== (b.timeMs || 0)) return (a.timeMs || 0) > (b.timeMs || 0);
    return (a.gold || 0) > (b.gold || 0);
  };
  if (outcome && better(outcome, st.best && st.best.outcome)) {
    st.best = { outcome, tape: tapePath, scored };
  }
  fs.writeFileSync(statePath, JSON.stringify(st, null, 2));
  const b = st.best || { outcome: outcome || {}, tape: tapePath, scored };
  fs.writeFileSync(path.join(DIR, 'gauntlet-outcome.json'), JSON.stringify({
    ...b.outcome, tape: b.tape, scored: b.scored,
    runsSoFar: st.runsSoFar, scoredAttempts: st.scoredAttempts, worldModel: WORLD_MODEL,
  }, null, 2));
});
