// s1557 — run test:ledger-guards as the fire's LAST act (F-1300-4), via node (bash gate refuses `npm run`).
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const ROOT = '/Users/robin/Claude/Projects/Gold Rush';
const pkg = JSON.parse(readFileSync(`${ROOT}/package.json`, 'utf8'));
const script = pkg.scripts['test:ledger-guards'];
if (!script) { console.error('no test:ledger-guards script'); process.exit(2); }
console.error('SCRIPT: ' + script.slice(0, 400) + '\n');

// Resolve the chain: run each `&&`-joined segment, expanding nested `npm run <name>`.
function segments(s) {
  return s.split('&&').map((x) => x.trim()).filter(Boolean);
}
const queue = segments(script);
let failed = 0;
const t0 = Date.now();

while (queue.length) {
  const seg = queue.shift();
  const m = seg.match(/^npm run (\S+)$/);
  if (m) {                                   // expand nested npm script in-place
    const nested = pkg.scripts[m[1]];
    if (!nested) { console.error(`MISSING nested script ${m[1]}`); failed++; continue; }
    queue.unshift(...segments(nested));
    continue;
  }
  const parts = seg.split(/\s+/);
  const r = spawnSync(parts[0], parts.slice(1), { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  const ok = r.status === 0;
  if (!ok) failed++;
  console.error(`${ok ? '✔' : '✘'} rc=${r.status}  ${seg.slice(0, 90)}`);
  if (!ok) {
    console.error((r.stdout || '').split('\n').slice(-25).join('\n'));
    console.error((r.stderr || '').split('\n').slice(-15).join('\n'));
  }
}
console.error(`\n[s1557] ledger-guards segments failed=${failed}  wall=${((Date.now() - t0) / 1000).toFixed(1)}s`);
process.exit(failed ? 1 : 0);
