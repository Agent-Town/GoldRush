// Runner: spawns gr-sim, drives it with a controller module, writes outcome file.
// usage: node run.mjs <tapeName> [controllerPath] [--scored]
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const WS = '/private/tmp/heat11-5e7a7c0b/artifacts/heat11/opus/e5-regatta';
const REPO = '/private/tmp/heat11-5e7a7c0b';
const WORLD_MODEL = 'sim-import';

const tapeName = process.argv[2] || 'probe-idle';
const controllerPath = process.argv[3] && process.argv[3] !== 'idle' ? process.argv[3] : null;
const scored = process.argv.includes('--scored');

const tape = path.join(WS, tapeName + '.json');
const args = ['scripts/gr-sim.mjs', '--contract', 'e5-regatta', '--seed', 'e5-regatta-01',
  '--difficulty', 'trail', '--tape', tape];
if (!controllerPath) args.push('--policy', 'idle');

let ctrl = null;
if (controllerPath) ctrl = (await import(controllerPath)).default;

const child = spawn('node', args, { cwd: REPO, stdio: ['pipe', 'pipe', 'pipe'] });
let stderrBuf = '';
child.stderr.on('data', d => { stderrBuf += d.toString(); });

const views = [];
let outcome = null;
let buf = '';
child.stdout.on('data', d => {
  buf += d.toString();
  let i;
  while ((i = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, i); buf = buf.slice(i + 1);
    if (!line.trim()) continue;
    let obj; try { obj = JSON.parse(line); } catch { continue; }
    if (obj.schema === 'goldrush.view.v1') {
      views.push(obj);
      if (ctrl) {
        let orders;
        try { orders = ctrl(obj, views); } catch (e) { console.error('CTRL ERROR', e); orders = []; }
        if (orders) child.stdin.write(JSON.stringify(orders) + '\n');
      }
    } else if (obj.secured !== undefined) {
      outcome = obj;
    }
  }
});

child.on('close', (code) => {
  fs.writeFileSync(path.join(WS, tapeName + '-views.json'), JSON.stringify(views));
  fs.writeFileSync(path.join(WS, tapeName + '.err.txt'), stderrBuf.slice(-40000));
  console.log('exit', code, 'views', views.length);
  console.log('OUTCOME', JSON.stringify(outcome));
  if (outcome) {
    // intermediate results law
    const outFile = path.join(WS, 'gauntlet-outcome.json');
    let prev = null;
    try { prev = JSON.parse(fs.readFileSync(outFile, 'utf8')); } catch {}
    const statePath = path.join(WS, '.runstate.json');
    let st = { runsSoFar: 0, scoredAttempts: 0 };
    try { st = JSON.parse(fs.readFileSync(statePath, 'utf8')); } catch {}
    st.runsSoFar += 1;
    if (scored) st.scoredAttempts += 1;
    fs.writeFileSync(statePath, JSON.stringify(st));
    const better = !prev || (outcome.secured && !prev.secured) ||
      (outcome.secured === !!prev.secured && ((outcome.waves || 0) > (prev.waves || 0) ||
        ((outcome.waves || 0) === (prev.waves || 0) && (outcome.timeMs || 0) > (prev.timeMs || 0))));
    const best = better ? { ...outcome, tape: tape, scored } : { ...prev };
    best.runsSoFar = st.runsSoFar;
    best.scoredAttempts = st.scoredAttempts;
    best.worldModel = WORLD_MODEL;
    fs.writeFileSync(outFile, JSON.stringify(best, null, 2));
    console.log('BEST', JSON.stringify(best));
  }
});
