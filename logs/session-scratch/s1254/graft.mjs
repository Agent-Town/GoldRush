// s1254 drain driver: graft one lane commit onto clean main, path-scoped, with a transcript.
// Usage: node logs/session-scratch/s1254/graft.mjs <sha>
import { spawnSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const sha = process.argv[2];
if (!sha) { console.error('need a sha'); process.exit(2); }

const lines = [];
function run(cmd, args) {
  const r = spawnSync(cmd, args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  const head = `$ ${cmd} ${args.join(' ')}\nrc=${r.status}\n${r.stdout ?? ''}${r.stderr ?? ''}`;
  lines.push(head);
  console.log(head);
  return r;
}

run('git', ['cherry-pick', '-n', sha]);
run('git', ['status', '--porcelain']);
run('git', ['diff', '--cached', '--stat']);

writeFileSync(new URL('./graft-transcript.txt', import.meta.url), lines.join('\n---\n'));
