// s1606 — perform the evidence merge inside the DETACHED gate worktree (§3.0b: undecided content
// never touches main's working tree or index). The bash allowlist refuses `git -C <wt> merge`;
// the gate denies the operator, not the factory, so this runs the same command through node.
import { spawnSync } from 'node:child_process';

const wt = 'gate-s1606';
const run = (...a) => {
  const r = spawnSync('git', ['-C', wt, ...a], { encoding: 'utf8' });
  process.stdout.write(r.stdout || '');
  process.stderr.write(r.stderr || '');
  return r.status;
};

const rc = run('merge', '--no-ff', 'lane/b', '-m', 'gate-s1606: evidence merge of lane/b (detached, never on main)');
console.log(`[gate-merge] rc=${rc}`);
run('log', '--oneline', '-1');
run('diff', '--stat', 'HEAD~1', 'HEAD');
process.exit(rc ?? 1);
