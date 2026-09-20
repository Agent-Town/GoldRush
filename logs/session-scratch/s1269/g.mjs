import { execFileSync } from 'node:child_process';
// usage: node g.mjs <cwd> <git args...>
const [cwd, ...args] = process.argv.slice(2);
try {
  process.stdout.write(execFileSync('git', args, { cwd, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }));
} catch (e) {
  process.stdout.write((e.stdout || '') + (e.stderr || '') + `\n[rc=${e.status}]\n`);
}
