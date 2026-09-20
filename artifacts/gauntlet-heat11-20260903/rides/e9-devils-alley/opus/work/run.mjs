// Runner: spawn gr-sim, drive it with a controller module, log views, write outcome file.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const WS = '/private/tmp/heat11-5e7a7c0b/artifacts/heat11/opus/e9-devils-alley';
const REPO = '/private/tmp/heat11-5e7a7c0b';

const args = process.argv.slice(2);
const opt = (k, d) => {
  const i = args.indexOf('--' + k);
  return i >= 0 ? args[i + 1] : d;
};
const tapeName = opt('tape', 'probe-x.json');
const ctrlPath = opt('ctrl', null);
const idle = args.includes('--idle');
const scored = args.includes('--scored');
const extra = opt('extra', '');

const tape = path.join(WS, tapeName);
const logPath = tape.replace(/\.json$/, '.views.jsonl');
const logFd = fs.openSync(logPath, 'w');

if (args.includes('--silent-secure')) process.env.GR_SECURE_MODE = 'silent';
let controller = null;
if (ctrlPath) {
  const mod = await import(path.join(WS, ctrlPath) + '?t=' + Date.now());
  controller = mod.default;
}

const simArgs = [
  'scripts/gr-sim.mjs',
  '--contract', 'e9-devils-alley',
  '--seed', 'e9-devils-alley-01',
  '--difficulty', 'trail',
  '--tape', tape,
];
if (idle) simArgs.push('--policy=idle');
if (extra) simArgs.push(...extra.split(' ').filter(Boolean));

const child = spawn('node', simArgs, { cwd: REPO, stdio: ['pipe', 'pipe', 'pipe'] });

let buf = '';
let lastLine = null;
let viewCount = 0;
const t0 = Date.now();
let errBuf = '';
child.stderr.on('data', (d) => { errBuf += d.toString(); });

child.stdout.on('data', (chunk) => {
  buf += chunk.toString();
  let idx;
  while ((idx = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, idx);
    buf = buf.slice(idx + 1);
    if (!line.trim()) continue;
    lastLine = line;
    fs.writeSync(logFd, line + '\n');
    let obj;
    try { obj = JSON.parse(line); } catch { continue; }
    if (obj.schema === 'goldrush.view.v1') {
      viewCount++;
      if (!idle && controller) {
        let orders;
        try { orders = controller(obj, viewCount); } catch (e) {
          fs.writeSync(logFd, JSON.stringify({ CTRL_ERROR: String(e && e.stack || e) }) + '\n');
          orders = [];
        }
        if (orders === null) { /* deliberate silence: hangs, do not use */ }
        else if (orders === '') child.stdin.write('\n'); // blank line: accepted, records nothing
        else child.stdin.write(JSON.stringify(orders) + '\n');
      }
    }
  }
});

child.on('close', (code) => {
  const wall = ((Date.now() - t0) / 1000).toFixed(1);
  let outcome = null;
  try { outcome = JSON.parse(lastLine); } catch {}
  fs.writeFileSync(path.join(WS, tapeName.replace(/\.json$/, '.outcome.json')),
    JSON.stringify({ code, wall, viewCount, outcome, stderrTail: errBuf.slice(-3000) }, null, 2));
  console.log('exit', code, 'wall', wall, 's views', viewCount);
  console.log('OUTCOME:', JSON.stringify(outcome));
  console.log('STDERR tail:', errBuf.slice(-800));

  // intermediate-results law: keep gauntlet-outcome.json at best-so-far
  const gpath = path.join(WS, 'gauntlet-outcome.json');
  let prev = null;
  try { prev = JSON.parse(fs.readFileSync(gpath, 'utf8')); } catch {}
  const runsSoFar = (prev?.runsSoFar || 0) + 1;
  const scoredAttempts = (prev?.scoredAttempts || 0) + (scored ? 1 : 0);
  const rank = (o) => o ? ((o.secured ? 1e9 : 0) + (o.timeMs || 0) / 1000) : -1;
  const better = !prev || rank(outcome) >= rank(prev);
  const row = better
    ? { ...(outcome || {}), tape: tape, scored, runsSoFar, scoredAttempts, worldModel: 'sim-import' }
    : { ...prev, runsSoFar, scoredAttempts };
  fs.writeFileSync(gpath, JSON.stringify(row, null, 2));
  fs.closeSync(logFd);
});
