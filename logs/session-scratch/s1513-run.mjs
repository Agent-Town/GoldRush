// s1513: run a command in a chosen cwd and report rc + output honestly.
import { spawnSync } from 'node:child_process';

const cwd = process.argv[2];
const cmd = process.argv[3];
const args = process.argv.slice(4);

const r = spawnSync(cmd, args, { cwd, encoding: 'utf8', maxBuffer: 1024 * 1024 * 64 });
if (r.stdout) process.stdout.write(r.stdout);
if (r.stderr) process.stderr.write(r.stderr);
console.log(`\n=== rc=${r.status} (${cmd} ${args.join(' ')}) cwd=${cwd} ===`);
