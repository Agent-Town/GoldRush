// s1324 scratch: run a command in the detached probe worktree and tee interesting lines.
import { spawnSync } from 'node:child_process';

const cwd = '/tmp/gr-s1324-probe';
const args = process.argv.slice(2);
const r = spawnSync('npx', args, { cwd, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
const all = `${r.stdout ?? ''}\n${r.stderr ?? ''}`;
const keep = all
  .split(/\r?\n/)
  .filter((l) => /S1324CRASH|Total:|Error|error|✘|passed|failed/.test(l));
console.log(keep.join('\n'));
console.log(`--- exit ${r.status} · kept ${keep.length} lines of ${all.split(/\r?\n/).length} ---`);
