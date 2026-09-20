// Runner: spawns gr-sim, drives it with a controller module, writes gauntlet-outcome.json on EVERY exit.
// usage: node run.mjs <controllerFile|idle> <tapeName> [scored]
import { spawn } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';

const WS = '/tmp/heat11-5e7a7c0b/artifacts/heat11/opus/e5-stillwater';
const SIM = '/tmp/heat11-5e7a7c0b/scripts/gr-sim.mjs';
const CONTRACT = 'e5-stillwater';
const SEED = 'e5-stillwater-01';
const WORLD_MODEL = 'sim-import';

const [, , ctrlArg, tapeName, scoredArg] = process.argv;
const scored = scoredArg === 'scored';
const tapePath = path.join(WS, tapeName);

const idle = ctrlArg === 'idle';
let controller = null;
if (!idle) controller = (await import(path.join(WS, ctrlArg))).default;

const args = ['--contract', CONTRACT, '--seed', SEED, '--difficulty', 'trail', '--tape', tapePath];
if (idle) args.push('--policy=idle');

const child = spawn('node', [SIM, ...args], { cwd: '/tmp/heat11-5e7a7c0b', stdio: ['pipe', 'pipe', 'pipe'] });

const views = [];
let outcome = null;
let buf = '';
let err = '';
child.stderr.on('data', d => { err += d.toString(); });

child.stdout.on('data', d => {
  buf += d.toString();
  let i;
  while ((i = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, i).trim();
    buf = buf.slice(i + 1);
    if (!line) continue;
    let msg;
    try { msg = JSON.parse(line); } catch { continue; }
    if (msg.schema === 'goldrush.view.v1') {
      views.push(msg);
      if (!idle && controller) {
        let orders;
        try { orders = controller(msg, views); } catch (e) { console.error('CTRL ERROR', e); orders = []; }
        if (orders) child.stdin.write(JSON.stringify(orders) + '\n');
      }
    } else if (typeof msg.secured === 'boolean') {
      outcome = msg;
    }
  }
});

child.on('exit', (code) => {
  writeFileSync(path.join(WS, tapeName.replace(/\.json$/, '') + '-views.json'), JSON.stringify(views, null, 1));
  if (err.trim()) writeFileSync(path.join(WS, tapeName.replace(/\.json$/, '') + '.err'), err);

  // --- INTERMEDIATE RESULTS LAW: best-so-far outcome file, every run ---
  const statePath = path.join(WS, 'runstate.json');
  const st = existsSync(statePath) ? JSON.parse(readFileSync(statePath, 'utf8')) : { runsSoFar: 0, scoredAttempts: 0, best: null };
  st.runsSoFar += 1;
  if (scored) st.scoredAttempts += 1;
  const rank = o => o ? [o.secured ? 1 : 0, o.waves || 0, o.timeMs || 0, o.gold || 0] : [0, 0, 0, 0];
  const cur = { outcome, tape: tapePath, scored };
  const better = !st.best || rank(outcome).join(',') > rank(st.best.outcome).join(',') ||
    (JSON.stringify(rank(outcome)) === JSON.stringify(rank(st.best.outcome)) && scored && !st.best.scored);
  const cmp = (a, b) => { const A = rank(a), B = rank(b); for (let i = 0; i < 4; i++) { if (A[i] !== B[i]) return A[i] - B[i]; } return 0; };
  if (!st.best || cmp(outcome, st.best.outcome) > 0 || (cmp(outcome, st.best.outcome) === 0 && scored && !st.best.scored)) st.best = cur;
  writeFileSync(statePath, JSON.stringify(st, null, 1));

  const b = st.best;
  writeFileSync(path.join(WS, 'gauntlet-outcome.json'), JSON.stringify({
    ...(b.outcome || { secured: false, note: 'no outcome line produced' }),
    tape: b.tape, scored: b.scored,
    runsSoFar: st.runsSoFar, scoredAttempts: st.scoredAttempts,
    worldModel: WORLD_MODEL,
  }, null, 1));

  console.log('EXIT', code, 'views', views.length);
  console.log('OUTCOME', JSON.stringify(outcome));
  if (err.trim()) console.log('STDERR', err.trim().slice(0, 1200));
});
