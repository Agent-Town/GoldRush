// s1251 — drive the duty battery from spawnSync with argv arrays (the shell gate rejects chains).
import { spawnSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const jobs = [
  ['tsc', 'npx', ['tsc', '--noEmit']],
  ['build', 'npm', ['run', 'build']],
  ['test:node-guards', 'npm', ['run', 'test:node-guards']],
  ['test:task-guards', 'npm', ['run', 'test:task-guards']],
  ['test:guards (run-guards)', 'npm', ['run', 'test:guards']],
];

const out = [];
for (const [label, cmd, args] of jobs) {
  const started = Date.now();
  const r = spawnSync(cmd, args, { cwd: process.cwd(), encoding: 'utf8', maxBuffer: 1024 * 1024 * 128 });
  const secs = ((Date.now() - started) / 1000).toFixed(1);
  const body = `${r.stdout ?? ''}${r.stderr ?? ''}`;
  out.push(`\n########## ${label}\nCMD=${cmd} ${args.join(' ')}\nRC=${r.status}  SECONDS=${secs}\n${body}`);
  const tail = body.trimEnd().split('\n').slice(-4).join(' | ');
  console.log(`${label}: rc=${r.status} (${secs}s) :: ${tail.slice(0, 300)}`);
}
writeFileSync(process.argv[2], out.join('\n'));
