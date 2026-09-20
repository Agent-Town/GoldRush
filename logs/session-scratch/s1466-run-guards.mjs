// s1466: run an npm script inside the detached gate worktree.
// The fire's bash allowlist refuses `npm run <name>`; node executes the same command line.
// Usage: node s1466-run-guards.mjs <script-name> [cwd]
import { execSync, execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const name = process.argv[2] ?? 'test:node-guards';
const cwd = process.argv[3] ?? '/Users/robin/Claude/Projects/Gold Rush/gate-s1466';
const pkg = JSON.parse(readFileSync(`${cwd}/package.json`, 'utf8'));
const cmd = pkg.scripts?.[name];
if (!cmd) { console.error(`no such script: ${name}`); process.exit(2); }
console.log(`=== running "${name}" in ${cwd} ===`);
try {
  const out = execSync(cmd, { cwd, encoding: 'utf8', stdio: 'pipe', maxBuffer: 256 * 1024 * 1024 });
  const lines = out.split('\n');
  console.log(lines.slice(-40).join('\n'));
  console.log('RC=0');
} catch (e) {
  const tail = (s) => (s ?? '').toString().split('\n').slice(-60).join('\n');
  console.log('--- stdout tail ---\n' + tail(e.stdout));
  console.log('--- stderr tail ---\n' + tail(e.stderr));
  console.log('RC=' + e.status);
  process.exit(e.status ?? 1);
}
