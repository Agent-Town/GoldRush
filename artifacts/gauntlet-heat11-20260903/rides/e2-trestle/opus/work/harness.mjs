// Rider harness: spawn gr-sim, speak the NDJSON door, drive it with a policy module.
// Usage: node harness.mjs <policyFile|idle> <tapePath> <logPath>
import { spawn } from 'node:child_process';
import { writeFileSync, appendFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(HERE, '../../../..');

const [policyArg, tapePath, logPath] = process.argv.slice(2);
const CONTRACT = 'e2-trestle';
const SEED = 'e2-trestle-01';

const idle = policyArg === 'idle';
let policy = null;
if (!idle) {
  const mod = await import(resolve(HERE, policyArg));
  policy = mod.default ?? mod.policy;
}

const args = ['scripts/gr-sim.mjs', '--contract', CONTRACT, '--seed', SEED];
if (tapePath) args.push('--tape', resolve(HERE, tapePath));
if (idle) args.push('--policy=idle');

const child = spawn('node', args, { cwd: REPO, stdio: ['pipe', 'pipe', 'pipe'] });

const log = logPath ? resolve(HERE, logPath) : null;
if (log) writeFileSync(log, '');
const rec = (o) => { if (log) appendFileSync(log, JSON.stringify(o) + '\n'); };

let buf = '';
let outcome = null;
let views = 0;
const errs = [];

child.stderr.on('data', (d) => { const s = String(d); errs.push(s); if (/rejected/.test(s)) process.stderr.write(s); });
child.stdin.on('error', () => {});

child.stdout.on('data', (d) => {
  buf += String(d);
  let i;
  while ((i = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, i);
    buf = buf.slice(i + 1);
    if (!line.trim()) continue;
    let obj;
    try { obj = JSON.parse(line); } catch { continue; }
    if (obj.schema === 'goldrush.view.v1') {
      views += 1;
      rec({ kind: 'view', n: views, view: obj });
      if (!idle) {
        let orders;
        try { orders = policy(obj, views); } catch (e) { orders = []; rec({ kind: 'policy-error', msg: String(e && e.stack) }); }
        if (orders) {
          rec({ kind: 'orders', n: views, orders });
          child.stdin.write(JSON.stringify(orders) + '\n');
        }
      }
    } else {
      outcome = obj;
      rec({ kind: 'outcome', outcome: obj });
    }
  }
});

child.on('close', (code) => {
  const res = { exit: code, views, outcome, stderrTail: errs.join('').split('\n').slice(-6).join('\n') };
  process.stdout.write(JSON.stringify(res, null, 1) + '\n');
});
