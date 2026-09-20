import { execSync } from 'node:child_process';
import fs from 'node:fs';

const run = (c) => {
  try {
    return { ok: true, out: execSync(c, { encoding: 'utf8', maxBuffer: 1024 * 1024 * 64, stdio: ['pipe', 'pipe', 'pipe'] }).trim() };
  } catch (e) {
    return { ok: false, out: ((e.stdout || '') + (e.stderr || '')).toString().trim() };
  }
};

const DIR = 'gate-s1467';

if (fs.existsSync(DIR)) {
  console.log(DIR + ' already exists — reusing');
} else {
  console.log('add worktree:', run(`git worktree add -b gate/s1467 ${DIR} main`).out);
}

// Merge the lane into the gate worktree. main's own tree is never touched.
const m = run(`git -C ${DIR} merge --no-ff lane/a -m "gate s1467: merge lane/a for evaluation"`);
console.log('\nMERGE ok=' + m.ok);
console.log(m.out.split('\n').slice(0, 15).join('\n'));

console.log('\nHEAD:', run(`git -C ${DIR} log -1 --format="%h %s"`).out);
console.log('conflicts:', run(`git -C ${DIR} diff --name-only --diff-filter=U`).out || '(none)');

// node_modules symlink so the battery can run without a reinstall.
const nm = `${DIR}/node_modules`;
if (!fs.existsSync(nm)) {
  fs.symlinkSync(fs.realpathSync('node_modules'), nm, 'dir');
  console.log('symlinked node_modules');
} else {
  console.log('node_modules already present');
}
