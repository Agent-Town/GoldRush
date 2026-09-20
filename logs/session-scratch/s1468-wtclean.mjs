// s1468: remove finished gate worktrees. These are git's own scratch, NOT factory history —
// the RETENTION LAW protects artifacts, not detached checkouts of commits main already has.
// Refuse to remove any that holds unique commits or tracked dirt.
import { spawnSync } from 'node:child_process';

function git(args, cwd) {
  const r = spawnSync('git', args, { encoding: 'utf8', cwd });
  return { rc: r.status, out: (r.stdout || '').trim(), err: (r.stderr || '').trim() };
}

for (const wt of ['gate-s1455', 'gate-s1468']) {
  const head = git(['rev-parse', 'HEAD'], wt);
  if (head.rc !== 0) { console.log(`${wt}: not a worktree / already gone`); continue; }
  const dirt = git(['status', '--porcelain'], wt).out
    .split('\n').filter(l => l.trim() && !l.startsWith('??'));
  const unique = git(['log', '--oneline', `main..${head.out}`], wt).out;

  console.log(`\n${wt}: HEAD=${head.out.slice(0, 8)} tracked-dirt=${dirt.length} unique-commits=${unique ? unique.split('\n').length : 0}`);
  if (dirt.length) { console.log('  REFUSING — tracked dirt:', dirt.slice(0, 5)); continue; }
  if (unique) {
    console.log('  unique commits present:', unique.slice(0, 300));
    // gate-s1468 holds my cherry-pick, whose content is already on main as 8e3c1491
    const eq = git(['diff', '--stat', `main..${head.out}`], wt).out;
    if (eq) { console.log('  REFUSING — content differs from main:', eq.slice(0, 300)); continue; }
    console.log('  content identical to main (diff empty) — safe to remove');
  }
  const rm = git(['worktree', 'remove', '--force', wt]);
  console.log(`  worktree remove -> rc=${rm.rc} ${rm.err.slice(0, 200)}`);
}
console.log('\n=== remaining gate worktrees ===');
console.log(git(['worktree', 'list']).out.split('\n').filter(l => /gate-/.test(l)).join('\n') || '(none)');
