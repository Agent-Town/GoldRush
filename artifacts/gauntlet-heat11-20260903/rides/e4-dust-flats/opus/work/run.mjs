// Driver: spawn gr-sim, feed order arrays from a controller module, log everything.
import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';
import { writeFileSync } from 'node:fs';

const args = process.argv.slice(2);
const tape = args[0];                       // tape path
const controllerPath = args[1] || null;     // ESM module exporting decide(view, state)
const logPath = args[2] || tape.replace(/\.json$/, '.log.json');

const child = spawn('node', [
  'scripts/gr-sim.mjs',
  '--contract', 'e4-dust-flats',
  '--seed', 'e4-dust-flats-01',
  '--difficulty', 'trail',
  '--tape', tape,
  ...(controllerPath ? [] : ['--policy', 'idle']),
], { cwd: process.cwd(), stdio: ['pipe', 'pipe', 'pipe'] });

let decide = null;
if (controllerPath) {
  const mod = await import(controllerPath);
  decide = mod.decide;
}

const views = [];
const sent = [];
let outcome = null;
let stderrBuf = '';
child.stderr.on('data', (d) => { stderrBuf += d.toString(); });

const state = {};
const rl = createInterface({ input: child.stdout });
rl.on('line', (line) => {
  if (!line.trim()) return;
  let obj;
  try { obj = JSON.parse(line); } catch { return; }
  if (obj.schema && obj.now) {
    views.push(obj);
    if (decide) {
      let orders;
      try { orders = decide(obj, state, views.length - 1); }
      catch (e) { orders = []; state.err = String(e && e.stack || e); }
      sent.push(orders);
      child.stdin.write(JSON.stringify(orders) + '\n');
    }
  } else {
    outcome = obj;
  }
});

child.on('close', (code) => {
  writeFileSync(logPath, JSON.stringify({ code, outcome, views, sent, state, stderr: stderrBuf.slice(-8000) }, null, 1));
  console.log('EXIT', code);
  console.log('OUTCOME', JSON.stringify(outcome));
  console.log('VIEWS', views.length);
  if (stderrBuf) console.log('STDERR_TAIL', stderrBuf.slice(-2000));
});
