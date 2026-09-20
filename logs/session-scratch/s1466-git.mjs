// s1466: run a git command with an explicit cwd (the bash gate intermittently refuses `cd && git`).
// Usage: node s1466-git.mjs <cwd> <arg>...
import { spawnSync } from 'node:child_process';
const [cwd, ...args] = process.argv.slice(2);
const r = spawnSync('git', args, { cwd, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
if (r.stdout) process.stdout.write(r.stdout);
if (r.stderr) process.stderr.write(r.stderr);
console.log('RC=' + r.status);
process.exit(r.status ?? 1);
