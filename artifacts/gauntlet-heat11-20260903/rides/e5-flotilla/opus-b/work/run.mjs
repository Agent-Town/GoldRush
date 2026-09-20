// Runner: drives gr-sim over NDJSON with a controller module, writes tape + log + outcome file.
// usage: node run.mjs <tapeName> <controllerFile|idle> [scored]
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const WS = '/tmp/heat11-5e7a7c0b/artifacts/heat11/opus/e5-flotilla-b';
const REPO = '/tmp/heat11-5e7a7c0b';
const CONTRACT = 'e5-flotilla';
const SEED = 'e5-flotilla-01';
const WORLD_MODEL = 'sim-import';

const tapeName = process.argv[2];
const controllerFile = process.argv[3];
const scored = process.argv[4] === 'scored';

const tapePath = path.join(WS, tapeName + '.json');
const logPath = path.join(WS, tapeName + '.log.json');

const args = ['scripts/gr-sim.mjs', '--contract', CONTRACT, '--seed', SEED,
  '--difficulty', 'trail', '--tape', tapePath];
let controller = null;
if (controllerFile === 'idle') args.push('--policy=idle');
else controller = (await import(path.join(WS, controllerFile) + '?t=' + Date.now())).default;

const child = spawn('node', args, { cwd: REPO, stdio: ['pipe', 'pipe', 'pipe'] });

const views = [];
let outcome = null;
let buf = '';
let stderrBuf = '';
child.stderr.on('data', d => { stderrBuf += d.toString(); });

const state = {};

child.stdout.on('data', (d) => {
  buf += d.toString();
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
        try { orders = controller(obj, state, views); }
        catch (e) { console.error('CONTROLLER THREW', e); orders = []; }
        if (orders) child.stdin.write(JSON.stringify(orders) + '\n');
      }
    } else if (obj.secured !== undefined || obj.endReason !== undefined) {
      outcome = obj;
    }
  }
});

child.on('close', (code) => {
  fs.writeFileSync(logPath, JSON.stringify({ views, outcome, stderr: stderrBuf.slice(-4000), code }, null, 1));
  const runsFile = path.join(WS, 'runs.json');
  let runs = [];
  try { runs = JSON.parse(fs.readFileSync(runsFile, 'utf8')); } catch {}
  runs.push({ tape: tapePath, scored, outcome });
  fs.writeFileSync(runsFile, JSON.stringify(runs, null, 1));

  // best outcome so far: secured wins; then waves; then timeMs
  const rank = (r) => r.outcome ? [r.outcome.secured ? 1 : 0, r.outcome.waves || 0, r.outcome.timeMs || 0] : [0, -1, -1];
  let best = runs[0];
  for (const r of runs) {
    const a = rank(r), b = rank(best);
    if (a[0] > b[0] || (a[0] === b[0] && (a[1] > b[1] || (a[1] === b[1] && a[2] > b[2])))) best = r;
  }
  const scoredCount = runs.filter(r => r.scored).length;
  fs.writeFileSync(path.join(WS, 'gauntlet-outcome.json'), JSON.stringify({
    ...(best.outcome || {}),
    tape: best.tape,
    scored: best.scored,
    runsSoFar: runs.length,
    scoredAttempts: scoredCount,
    worldModel: WORLD_MODEL,
  }, null, 1));
  console.log('OUTCOME', JSON.stringify(outcome));
  console.log('views', views.length, 'exit', code);
  if (stderrBuf) console.log('STDERR tail:', stderrBuf.slice(-800));
});
