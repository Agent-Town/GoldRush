// Opus 5 gen-13 driver: spawns gr-sim, drives it with a controller module, logs everything.
import { spawn } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import path from 'node:path';

const REPO = '/private/tmp/heat11-5e7a7c0b';
const WS = path.join(REPO, 'artifacts/heat11/opus/e3-fairground');

const tapeName = process.argv[2] ?? 'probe.json';
const controllerName = process.argv[3] ?? null; // null => idle
const logName = process.argv[4] ?? tapeName.replace(/\.json$/, '') + '.log.json';

const tapePath = path.join(WS, tapeName);

const args = ['scripts/gr-sim.mjs', '--contract', 'e3-fairground', '--seed', 'e3-fairground-01',
  '--difficulty', 'trail', '--tape', tapePath];
if (!controllerName) args.push('--policy', 'idle');

let decide = null;
if (controllerName) {
  const mod = await import(path.join(WS, controllerName));
  decide = mod.decide;
}

const child = spawn('node', args, { cwd: REPO, stdio: ['pipe', 'pipe', 'pipe'] });
let outBuf = '';
let errBuf = '';
const views = [];
let outcome = null;
let n = 0;

child.stderr.on('data', (d) => { errBuf += d.toString(); });

child.stdout.on('data', (d) => {
  outBuf += d.toString();
  let idx;
  while ((idx = outBuf.indexOf('\n')) >= 0) {
    const line = outBuf.slice(0, idx);
    outBuf = outBuf.slice(idx + 1);
    if (!line.trim()) continue;
    let msg;
    try { msg = JSON.parse(line); } catch { continue; }
    if (msg.schema === 'goldrush.view.v1') {
      views.push(msg);
      n += 1;
      if (decide) {
        let orders;
        try { orders = decide(msg, views); } catch (e) { orders = []; console.error('CONTROLLER THREW', e); }
        child.stdin.write(JSON.stringify(orders) + '\n');
      }
    } else {
      outcome = msg;
    }
  }
});

child.on('close', (code) => {
  const summary = {
    exitCode: code,
    outcome,
    viewCount: views.length,
    tape: tapePath,
    stderrTail: errBuf.split('\n').slice(-25).join('\n'),
  };
  writeFileSync(path.join(WS, logName), JSON.stringify({ summary, views }, null, 1));
  console.log(JSON.stringify(summary, null, 1));
});
