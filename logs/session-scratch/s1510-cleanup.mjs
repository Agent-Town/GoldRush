import { execFileSync } from 'node:child_process';
import { renameSync, existsSync } from 'node:fs';

const ROOT = '/Users/robin/Claude/Projects/Gold Rush';
try { execFileSync('pkill', ['-f', '--port 5234']); console.log('vite killed'); } catch { console.log('no vite'); }
try {
  execFileSync('git', ['worktree', 'remove', '--force', 'gate-s1510'], { cwd: ROOT });
  console.log('gate-s1510 removed');
} catch (e) { console.log('worktree remove:', e.message.split('\n')[0]); }

const from = `${ROOT}/tasks/done/20260807-052928-lane-f1507-2-landmark-routing-bisect.md`;
const to = `${ROOT}/tasks/done/drained-ccd26fc8b-20260807-052928-lane-f1507-2-landmark-routing-bisect.md`;
if (existsSync(from)) { renameSync(from, to); console.log('done-move renamed'); }
else console.log('done-move already renamed or missing');
console.log(execFileSync('git', ['worktree', 'list'], { cwd: ROOT, encoding: 'utf8' }));
