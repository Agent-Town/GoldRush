// Generation 35 runner: spawn gr-sim, drive it with a controller module, log everything,
// and (re)write gauntlet-outcome.json on every child exit — the intermediate-results law.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const WS = path.resolve('artifacts/heat11/opus/e8-low-orbit');
const REPO = path.resolve('.');
const CONTRACT = 'e8-low-orbit';
const SEED = 'e8-low-orbit-01';
const WORLD_MODEL = 'sim-import';

const label = process.argv[2] || 'probe';
const controllerPath = process.argv[3] || null; // null => --policy idle
const tape = path.join(WS, `${label}-tape.json`);

const args = ['scripts/gr-sim.mjs', '--contract', CONTRACT, '--seed', SEED,
  '--difficulty', 'trail', '--tape', tape];
if (!controllerPath) args.push('--policy', 'idle');

const controller = controllerPath ? (await import(path.resolve(controllerPath))).default : null;

const child = spawn('node', args, { cwd: REPO, stdio: ['pipe', 'pipe', 'pipe'] });

const views = [];
let outcome = null;
let stderrBuf = '';
let buf = '';

child.stderr.on('data', (d) => { stderrBuf += d.toString(); });

child.stdout.on('data', (d) => {
  buf += d.toString();
  let i;
  while ((i = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, i);
    buf = buf.slice(i + 1);
    if (!line.trim()) continue;
    let obj;
    try { obj = JSON.parse(line); } catch { continue; }
    if (obj && obj.schema && String(obj.schema).startsWith('goldrush.view')) {
      views.push(obj);
      if (controller) {
        let reply;
        try { reply = controller(obj, views); } catch (e) {
          console.error('controller threw', e);
          reply = [];
        }
        if (reply === null) child.stdin.write('\n');       // blank line: default the secure
        else child.stdin.write(JSON.stringify(reply) + '\n');
      }
    } else if (obj && ('secured' in obj)) {
      outcome = obj;
    }
  }
});

child.on('exit', (code) => {
  fs.writeFileSync(path.join(WS, `${label}-views.json`), JSON.stringify(views, null, 1));
  fs.writeFileSync(path.join(WS, `${label}-stderr.txt`), stderrBuf);
  const summary = { label, code, outcome, views: views.length };
  fs.writeFileSync(path.join(WS, `${label}-outcome.json`), JSON.stringify(summary, null, 1));
  console.log(JSON.stringify(summary));

  // --- intermediate results law: best-so-far ---
  const bestPath = path.join(WS, 'gauntlet-outcome.json');
  let best = null;
  try { best = JSON.parse(fs.readFileSync(bestPath, 'utf8')); } catch {}
  const runsSoFar = (best?.runsSoFar || 0) + 1;
  const scored = /^attempt-/.test(label);
  const scoredAttempts = (best?.scoredAttempts || 0) + (scored ? 1 : 0);
  const rank = (o) => o ? [(o.secured ? 1 : 0), o.waves || 0, o.timeMs || 0, o.gold || 0] : [0, 0, 0, 0];
  const better = (a, b) => { const A = rank(a), B = rank(b); for (let i = 0; i < A.length; i++) { if (A[i] !== B[i]) return A[i] > B[i]; } return false; };
  const prev = best && best.secured !== undefined ? best : null;
  const prevOutcome = prev ? { secured: prev.secured, waves: prev.waves, timeMs: prev.timeMs, gold: prev.gold } : null;
  let row;
  // a scored attempt that TIES the best is promoted (gen-23/25 lesson)
  if (!prevOutcome || better(outcome, prevOutcome) || (scored && !better(prevOutcome, outcome))) {
    row = { ...(outcome || {}), tape, scored };
  } else {
    row = { ...prev };
  }
  row.runsSoFar = runsSoFar;
  row.scoredAttempts = scoredAttempts;
  row.worldModel = WORLD_MODEL;
  fs.writeFileSync(bestPath, JSON.stringify(row, null, 1));
});
