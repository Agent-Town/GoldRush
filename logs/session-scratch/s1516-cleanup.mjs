// s1516: post-drain cleanup + absorption verification.
import { execSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';

const REPO = '/Users/robin/Claude/Projects/Gold Rush';
const GATE = `${REPO}/gate-s1516`;
const sh = (c, cwd = REPO) => execSync(c, { cwd, encoding: 'utf8' }).trim();

// 1. done-move rename to the house drained-<hash>- form
const from = 'tasks/done/20260807-090732-lane-f1515-1-citation-scan-nondestructive.md';
const to = 'tasks/done/drained-8b853308-20260807-090732-lane-f1515-1-citation-scan-nondestructive.md';
if (fs.existsSync(`${REPO}/${from}`)) { fs.renameSync(`${REPO}/${from}`, `${REPO}/${to}`); console.log('done-move renamed ->', to.split('/').pop()); }
else console.log('done-move already renamed or absent');

// 2. gate worktree teardown — unlink the node_modules symlink FIRST (it points into main's)
try { fs.unlinkSync(`${GATE}/node_modules`); console.log('gate node_modules symlink unlinked (pointed into main)'); } catch (e) { console.log('symlink:', e.code); }
const rm = spawnSync('git', ['worktree', 'remove', '--force', GATE], { cwd: REPO, encoding: 'utf8' });
console.log('worktree remove rc =', rm.status, (rm.stderr || '').trim().slice(0, 120));
console.log('gate dir still present?', fs.existsSync(GATE));

// 3. absorption: is lane/a's content now fully on main? (tip-graft leaves it FALSELY ahead)
console.log('\nmain..lane/a commits ahead:', sh('git rev-list --count main..lane/a'));
const diff = sh('git diff main lane/a --stat');
console.log('content diff main vs lane/a:', diff ? '\n' + diff : '(EMPTY — fully absorbed)');
