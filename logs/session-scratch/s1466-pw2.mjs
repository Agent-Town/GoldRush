// s1466: same as s1466-pw.mjs but with an explicit --timeout, so the heavy 5-contract census rig
// gets a fair run in the fire shell (whose per-job CPU ceiling, F-1269-1, blows the 30s default —
// proven by a control run on the PRE-cure tree that failed identically).
import { spawnSync } from 'node:child_process';
const cwd = process.argv[2];
const specs = process.argv[3].split(',');
const projects = process.argv[4].split(',');
const timeout = process.argv[5] ?? '180000';
const env = { ...process.env, ...Object.fromEntries(
  (process.argv[6] ?? '').split(',').filter(Boolean).map((kv) => kv.split('=')),
) };
const args = ['playwright', 'test', ...specs, ...projects.map((p) => `--project=${p}`),
  '--workers=1', `--timeout=${timeout}`, '--reporter=line'];
console.log('=== npx', args.join(' '), '===');
const t0 = Date.now();
const r = spawnSync('npx', args, { cwd, env, encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 });
const tail = (s, n) => (s ?? '').split('\n').slice(-n).join('\n');
console.log(tail(r.stdout, 45));
if ((r.stderr ?? '').trim()) console.log('--- stderr tail ---\n' + tail(r.stderr, 12));
console.log(`RC=${r.status}  wall=${((Date.now() - t0) / 1000).toFixed(1)}s`);
process.exit(r.status ?? 1);
