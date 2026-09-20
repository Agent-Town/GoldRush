// s1516: the dirty marker's DESIGN question. A bare sha is a lie if the tree had
// uncommitted changes (s1513's scope note). But WHICH dirt counts? If untracked
// debris counts, every run is "dirty" and the marker carries no information.
import { execSync } from 'node:child_process';

const REPO = '/Users/robin/Claude/Projects/Gold Rush';
for (const wt of ['.', 'worktrees/lane-d', 'worktrees/lane-a']) {
  const cwd = `${REPO}/${wt}`;
  const all = execSync('git status --porcelain', { cwd, encoding: 'utf8' }).trim();
  const tracked = execSync('git status --porcelain --untracked-files=no', { cwd, encoding: 'utf8' }).trim();
  const n = (s) => (s ? s.split('\n').length : 0);
  console.log(
    `${wt.padEnd(18)} all=${String(n(all)).padStart(3)}  tracked-only=${String(n(tracked)).padStart(3)}  ` +
      `=> naive:${n(all) ? 'DIRTY' : 'clean'}  tracked:${n(tracked) ? 'DIRTY' : 'clean'}`,
  );
}
