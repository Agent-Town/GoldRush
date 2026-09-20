import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
const out = execFileSync(process.execPath, ['logs/.goal-tree.mjs'], {
  cwd: '/Users/robin/Claude/Projects/Gold Rush',
  encoding: 'utf8',
  maxBuffer: 64 * 1024 * 1024,
});
fs.writeFileSync('/Users/robin/Claude/Projects/Gold Rush/logs/.goal-tree.html', out);
const hit = (out.match(/fire-shell-cpu-ceiling-control/g) || []).length;
console.log(`goal-tree regenerated, ${out.length} bytes, leaf mentions: ${hit}`);
