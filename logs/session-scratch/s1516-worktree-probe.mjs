// s1516: verify the exact deployment condition for the F-1510-3 cure —
// does `git rev-parse HEAD` (and a dirty marker) work with cwd INSIDE a linked worktree,
// which is where the suite actually runs (report.config.configFile proved it).
import { execSync } from 'node:child_process';

const REPO = '/Users/robin/Claude/Projects/Gold Rush';
for (const wt of ['worktrees/lane-d', 'worktrees/lane-a', '.']) {
  const cwd = `${REPO}/${wt}`;
  try {
    const sha = execSync('git rev-parse HEAD', { cwd, encoding: 'utf8' }).trim();
    const branch = execSync('git rev-parse --abbrev-ref HEAD', { cwd, encoding: 'utf8' }).trim();
    const porcelain = execSync('git status --porcelain', { cwd, encoding: 'utf8' }).trim();
    console.log(`${wt.padEnd(18)} sha=${sha.slice(0, 12)} branch=${branch.padEnd(8)} dirty=${porcelain ? 'DIRTY' : 'clean'} (${porcelain ? porcelain.split('\n').length : 0} entries)`);
  } catch (err) {
    console.log(`${wt.padEnd(18)} FAILED: ${err.message.split('\n')[0]}`);
  }
}
