// s1468 §3.0b: build a DETACHED gate worktree at main, cherry-pick the lane commit there.
// Undecided content never touches main's working tree.
import { spawnSync } from 'node:child_process';
import { existsSync, symlinkSync } from 'node:fs';

const WT = 'gate-s1468';
const LANE_TIP = '780d27e3';

function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, { encoding: 'utf8', ...opts });
  console.log(`$ ${cmd} ${args.join(' ')}  -> rc=${r.status}`);
  if (r.stdout && r.stdout.trim()) console.log(r.stdout.trim().slice(0, 2500));
  if (r.stderr && r.stderr.trim()) console.log('ERR:', r.stderr.trim().slice(0, 2500));
  return r;
}

if (!existsSync(WT)) {
  run('git', ['worktree', 'add', '--detach', WT, 'main']);
} else {
  console.log(`${WT} already exists`);
}

// node_modules symlink so the gate can run npm scripts
if (!existsSync(`${WT}/node_modules`)) {
  symlinkSync(process.cwd() + '/node_modules', `${WT}/node_modules`);
  console.log('linked node_modules');
}

// cherry-pick the lane's own commit (NOT a two-dot merge — the lane base is stale
// and a blind merge would revert s1467's drain as phantom deletions)
const cp = run('git', ['cherry-pick', '-x', LANE_TIP], { cwd: WT });
if (cp.status !== 0) {
  console.log('=== CHERRY-PICK CONFLICT — status ===');
  run('git', ['status', '--short'], { cwd: WT });
}
