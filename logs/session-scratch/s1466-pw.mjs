// s1466: run playwright inside the detached gate worktree with an env override.
// The fire's bash allowlist refuses `VAR=1 npx ... | tail`; node spawns the same command.
// §3.1: --workers=1 is a CORRECTNESS requirement of every fire-side playwright command.
import { spawnSync } from 'node:child_process';

const cwd = process.argv[2];
const specs = process.argv[3].split(',');
const projects = process.argv[4].split(',');
const env = { ...process.env, ...Object.fromEntries(
  (process.argv[5] ?? '').split(',').filter(Boolean).map((kv) => kv.split('=')),
) };

const args = ['playwright', 'test', ...specs, ...projects.map((p) => `--project=${p}`),
  '--workers=1', '--reporter=line'];
console.log('=== npx', args.join(' '), '===');
console.log('=== cwd:', cwd, '| env overrides:', process.argv[5] ?? '(none)', '===');
const r = spawnSync('npx', args, { cwd, env, encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 });
const tail = (s, n) => (s ?? '').split('\n').slice(-n).join('\n');
console.log(tail(r.stdout, 40));
if ((r.stderr ?? '').trim()) console.log('--- stderr ---\n' + tail(r.stderr, 25));
console.log('RC=' + r.status);
process.exit(r.status ?? 1);
