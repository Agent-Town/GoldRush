// s1324 scratch: run git (or any cmd) inside the detached probe worktree.
import { spawnSync } from 'node:child_process';

const cwd = '/tmp/gr-s1324-probe';
const [cmd, ...args] = process.argv.slice(2);
const r = spawnSync(cmd, args, { cwd, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
console.log((r.stdout ?? '').trim());
console.error((r.stderr ?? '').trim().split(/\r?\n/).slice(-15).join('\n'));
console.log(`--- exit ${r.status} ---`);
