// Runner: spawns gr-sim with a controller module, logs every view, writes outcome.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const DIR = '/private/tmp/heat11-5e7a7c0b/artifacts/heat11/opus/e5-deepwater-claim';
const REPO = '/private/tmp/heat11-5e7a7c0b';

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const tapeName = opt('tape', 'probe-x.json');
const ctrlName = opt('ctrl', null);
const idle = args.includes('--idle');
const scored = args.includes('--scored');

const tapePath = path.join(DIR, tapeName);
const logPath = tapePath.replace(/\.json$/, '.log.json');

let controller = null;
if (ctrlName) controller = (await import(path.join(DIR, ctrlName) + '?t=' + Date.now())).default;

const simArgs = [
  'scripts/gr-sim.mjs',
  '--contract', 'e5-deepwater-claim',
  '--seed', 'e5-deepwater-claim-01',
  '--difficulty', 'trail',
  '--tape', tapePath,
];
if (idle) simArgs.push('--policy=idle');

const child = spawn('node', simArgs, { cwd: REPO, stdio: ['pipe', 'pipe', 'pipe'] });

let buf = '';
const views = [];
let outcome = null;
const stderrChunks = [];
child.stderr.on('data', d => stderrChunks.push(d.toString()));

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
        try { orders = controller(obj, views); } catch (e) { console.error('CTRL ERROR', e); orders = []; }
        if (orders) child.stdin.write(JSON.stringify(orders) + '\n');
      }
    } else if (obj.secured !== undefined || obj.endReason !== undefined) {
      outcome = obj;
    }
  }
});

child.on('close', (code) => {
  const stderr = stderrChunks.join('');
  fs.writeFileSync(logPath, JSON.stringify({ outcome, views, stderrTail: stderr.slice(-4000) }, null, 1));
  const rej = (stderr.match(/gr-sim rejected orders: .*/g) || []).slice(0, 5);
  console.log('EXIT', code, 'views', views.length);
  console.log('OUTCOME', JSON.stringify(outcome));
  if (rej.length) console.log('REJECTIONS', rej.join(' | '));
  // Intermediate-results law: write outcome file
  const outFile = path.join(DIR, 'gauntlet-outcome.json');
  let prev = null;
  try { prev = JSON.parse(fs.readFileSync(outFile, 'utf8')); } catch {}
  const runs = (prev?.runsSoFar || 0) + 1;
  const scoredN = (prev?.scoredAttempts || 0) + (scored ? 1 : 0);
  const better = !prev || (outcome?.secured && !prev.secured) ||
    (!!outcome?.secured === !!prev.secured && (outcome?.waves || 0) > (prev.waves || 0));
  const body = better
    ? { ...outcome, tape: tapePath, scored, runsSoFar: runs, scoredAttempts: scoredN, worldModel: 'sim-import' }
    : { ...prev, runsSoFar: runs, scoredAttempts: scoredN };
  fs.writeFileSync(outFile, JSON.stringify(body, null, 2));
  console.log('BEST', JSON.stringify(body).slice(0, 300));
});
