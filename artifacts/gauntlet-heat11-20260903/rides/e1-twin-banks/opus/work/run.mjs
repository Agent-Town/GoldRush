// Generic driver: spawns gr-sim, feeds it order arrays from a policy module.
// usage: node run.mjs <policyFile|idle> <tapePath> [outJson]
import { spawn } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import path from 'node:path';

const REPO = '/private/tmp/heat11-5e7a7c0b';
const WS = path.join(REPO, 'artifacts/heat11/opus/e1-twin-banks');

const policyArg = process.argv[2];
const tapePath = process.argv[3];
const outPath = process.argv[4] || path.join(WS, 'lastrun.json');

const idle = policyArg === 'idle';
let policy = null;
if (!idle) {
  policy = (await import(path.resolve(policyArg))).default;
}

const args = [
  'scripts/gr-sim.mjs',
  '--contract', 'e1-twin-banks',
  '--seed', 'e1-twin-banks-01',
  '--difficulty', 'trail',
  '--tape', tapePath,
];
if (idle) args.push('--policy=idle');

const child = spawn('node', args, { cwd: REPO, stdio: ['pipe', 'pipe', 'pipe'] });

let buf = '';
const lines = [];
let stderr = '';
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
    lines.push(obj);
    if (obj.schema === 'goldrush.view.v1') {
      if (!idle) {
        const orders = policy(obj, lines);
        if (orders) child.stdin.write(JSON.stringify(orders) + '\n');
      }
    }
  }
});

child.on('close', (code) => {
  const outcome = lines.filter(l => l && l.schema !== 'goldrush.view.v1').pop() || null;
  const views = lines.filter(l => l && l.schema === 'goldrush.view.v1');
  const result = { exit: code, outcome, viewCount: views.length, stderrTail: stderr.slice(-3000) };
  writeFileSync(outPath, JSON.stringify({ ...result, views }, null, 1));
  console.log(JSON.stringify({ exit: code, outcome, viewCount: views.length }, null, 1));
  if (stderr) console.log('STDERR_TAIL:\n' + stderr.slice(-2000));
});
