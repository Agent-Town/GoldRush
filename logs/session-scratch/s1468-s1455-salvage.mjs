// s1468: gate-s1455 holds 17 dirty tracked paths in a DETACHED worktree. Detached-HEAD dirt
// is in no branch and no object DB — it dies with the disk. Classify before ruling.
import { spawnSync } from 'node:child_process';
const WT = 'gate-s1455';
function git(args) {
  const r = spawnSync('git', args, { encoding: 'utf8', cwd: WT, maxBuffer: 32e6 });
  return (r.stdout || '') + (r.stderr || '');
}
console.log('=== full status ===');
console.log(git(['status', '--porcelain']).trim());
console.log('\n=== is each modified blob already in the object DB? ===');
for (const line of git(['status', '--porcelain']).trim().split('\n')) {
  if (!line.trim()) continue;
  const code = line.slice(0, 2), p = line.slice(3);
  const h = spawnSync('git', ['hash-object', p], { cwd: WT, encoding: 'utf8' }).stdout.trim();
  const known = spawnSync('git', ['cat-file', '-e', h], { cwd: WT }).status === 0;
  console.log(`${code} ${known ? 'IN-DB ' : 'AT-RISK'} ${h.slice(0, 8)} ${p}`);
}
