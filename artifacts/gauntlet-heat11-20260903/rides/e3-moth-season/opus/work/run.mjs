// Driver: spawn gr-sim, drive it with a controller module, capture everything.
// usage: node run.mjs <controllerPath|idle> <tapeName>
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const HERE = path.dirname(new URL(import.meta.url).pathname);
const REPO = '/private/tmp/heat11-5e7a7c0b';
const ctrlArg = process.argv[2] || 'idle';
const tapeName = process.argv[3] || 'probe';
const tapePath = path.join(HERE, `${tapeName}-tape.json`);
const logPath = path.join(HERE, `${tapeName}-views.ndjson`);

const args = [
  'scripts/gr-sim.mjs',
  '--contract', 'e3-moth-season',
  '--seed', 'e3-moth-season-01',
  '--difficulty', 'trail',
  '--tape', tapePath,
];
let controller = null;
if (ctrlArg === 'idle') args.push('--policy=idle');
else controller = (await import(path.resolve(ctrlArg))).default;

const child = spawn('node', args, { cwd: REPO, stdio: ['pipe', 'pipe', 'pipe'] });
const outLines = [];
let stderrBuf = '';
child.stderr.on('data', (d) => { stderrBuf += d.toString(); });

let buf = '';
let viewCount = 0;
const state = {};
child.stdout.on('data', (d) => {
  buf += d.toString();
  let i;
  while ((i = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, i);
    buf = buf.slice(i + 1);
    if (!line.trim()) continue;
    outLines.push(line);
    let msg;
    try { msg = JSON.parse(line); } catch { continue; }
    if (msg && msg.schema === 'goldrush.view.v1') {
      viewCount++;
      if (controller) {
        const orders = controller(msg, state, viewCount);
        if (orders) child.stdin.write(JSON.stringify(orders) + '\n');
      }
    }
  }
});

child.on('close', (code) => {
  fs.writeFileSync(logPath, outLines.join('\n') + '\n');
  fs.writeFileSync(path.join(HERE, `${tapeName}-stderr.txt`), stderrBuf);
  const last = outLines[outLines.length - 1];
  let outcome = null;
  try { outcome = JSON.parse(last); } catch {}
  console.log('EXIT', code, 'views', viewCount);
  console.log('OUTCOME', JSON.stringify(outcome));
  // intermediate-results law is handled by the caller (bank.mjs)
  fs.writeFileSync(path.join(HERE, `${tapeName}-outcome.json`), JSON.stringify({ outcome, tape: tapePath, views: viewCount }, null, 2));
});
