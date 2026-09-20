// s1516 gate setup — §3.0b CUSTODY: undecided content never enters main's working tree.
// Detached worktree INSIDE the repo root, lane/a merged there, node_modules symlinked from main.
import { execSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';

const REPO = '/Users/robin/Claude/Projects/Gold Rush';
const GATE = `${REPO}/gate-s1516`;
const sh = (c, cwd = REPO) => execSync(c, { cwd, encoding: 'utf8' }).trim();

if (fs.existsSync(GATE)) { console.error('gate-s1516 already exists — refusing'); process.exit(2); }

const mainSha = sh('git rev-parse HEAD');
console.log('main HEAD =', mainSha.slice(0, 9));

// detached worktree at main's tip
const add = spawnSync('git', ['worktree', 'add', '--detach', GATE, mainSha], { cwd: REPO, encoding: 'utf8' });
console.log('worktree add rc =', add.status, (add.stderr || add.stdout).trim().split('\n').pop());
if (add.status !== 0) process.exit(2);

// node_modules symlink into main's (sibling-worktree pattern)
fs.symlinkSync(`${REPO}/node_modules`, `${GATE}/node_modules`, 'dir');

// merge the lane THREE-WAY (never a two-dot diff / never a blind copy)
const merge = spawnSync('git', ['merge', '--no-ff', 'lane/a', '-m', 'gate-s1516: merge lane/a for gating'], {
  cwd: GATE, encoding: 'utf8',
});
console.log('merge rc =', merge.status);
console.log((merge.stdout || merge.stderr).trim().split('\n').slice(-4).join('\n'));
if (merge.status !== 0) process.exit(2);

console.log('\nfiles differing from main in the gate tree:');
console.log(sh(`git diff --stat ${mainSha} HEAD`, GATE));
