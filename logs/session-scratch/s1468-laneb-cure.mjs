// s1468: hand-rule on lane/b's HOLDS verdict — proven absorbed (0 lines, 0 files absent).
// HISTORY FIRST: archive the tip to a durable ref, THEN reset. Never the other way round.
import { spawnSync } from 'node:child_process';

function run(args, opts = {}) {
  const r = spawnSync('git', args, { encoding: 'utf8', ...opts });
  console.log(`$ git ${args.join(' ')} -> rc=${r.status}`);
  if (r.stdout && r.stdout.trim()) console.log(r.stdout.trim().slice(0, 800));
  if (r.stderr && r.stderr.trim()) console.log('ERR:', r.stderr.trim().slice(0, 800));
  return r;
}

const ARCHIVE = 'archive/lane-b-s1468-absorbed-780d27e3';
run(['branch', ARCHIVE, '780d27e3']);

// reset the lane worktree to main
const WT = 'worktrees/lane-b';
run(['checkout', '-B', 'lane/b', 'main'], { cwd: WT });
run(['status', '--short'], { cwd: WT });

console.log('\n=== verify ===');
const ahead = spawnSync('git', ['log', '--oneline', 'main..lane/b'], { encoding: 'utf8' });
console.log('main..lane/b:', JSON.stringify((ahead.stdout || '').trim()) || '(empty = clean)');
const arch = spawnSync('git', ['log', '-1', '--format=%h %s', ARCHIVE], { encoding: 'utf8' });
console.log('archive ref holds:', (arch.stdout || '').trim());
