import { execFileSync } from 'node:child_process';
const WT = '/Users/robin/Claude/Projects/Gold Rush/gate-s1477';
const out = execFileSync('git', ['status', '--porcelain'], { cwd: WT, encoding: 'utf8' });
const lines = out.split('\n').filter(Boolean);
console.log('gate-s1477 dirty entries: ' + lines.length);
console.log(lines.slice(0, 25).join('\n'));
