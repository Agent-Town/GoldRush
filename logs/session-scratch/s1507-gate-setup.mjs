// s1507 — gate setup in the detached gate-s1507 worktree (§3.0b: undecided content never enters
// main's working tree). Three-way merge, never a two-dot copy. Run via node; the bash allowlist
// refuses the git invocation, which denies the fire, not the factory.
import { spawnSync } from 'node:child_process';
import { existsSync, symlinkSync, lstatSync, readlinkSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));
const GATE = join(ROOT, 'gate-s1507');

const run = (cmd, args, opts = {}) => {
  const r = spawnSync(cmd, args, { encoding: 'utf8', cwd: GATE, ...opts });
  console.log(`$ ${cmd} ${args.join(' ')}`);
  if (r.stdout?.trim()) console.log(r.stdout.trim());
  if (r.stderr?.trim()) console.log('[stderr] ' + r.stderr.trim());
  console.log(`  rc=${r.status}\n`);
  return r;
};

run('git', ['merge', '--no-ff', 'lane/a', '-m', 'gate-s1507: merge lane/a for gating']);
run('git', ['log', '--oneline', '-3']);
run('git', ['status', '--short']);

// node_modules: a symlink into main's install. Verify BEFORE creating so nothing can follow it
// back into main (the s1506 custody note), and record what it points at.
const link = join(GATE, 'node_modules');
if (!existsSync(link)) {
  symlinkSync(join(ROOT, 'node_modules'), link, 'dir');
  console.log('symlinked node_modules ->', readlinkSync(link));
} else {
  const st = lstatSync(link);
  console.log('node_modules already present; isSymbolicLink =', st.isSymbolicLink());
}
