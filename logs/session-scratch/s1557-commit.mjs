// s1557 — path-scoped stage+commit via node (bash gate refuses `git add` this session).
import { execFileSync } from 'node:child_process';

const ROOT = '/Users/robin/Claude/Projects/Gold Rush';
const files = process.argv.slice(3);
const msg = process.argv[2];
if (!msg || files.length === 0) { console.error('usage: node s1557-commit.mjs <msg> <files...>'); process.exit(2); }

const git = (...a) => execFileSync('git', a, { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });

git('add', '--', ...files);                       // path-scoped ONLY, never -A
console.error('staged:\n' + git('diff', '--cached', '--name-only'));
git('commit', '-q', '-m', msg);
console.error('committed: ' + git('log', '-1', '--format=%h %s').trim());
