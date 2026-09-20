// s1251 — run the E1 release gate that nothing automated calls (F-1126-1 attempt).
// Usage: node logs/session-scratch/s1251/run-release-gate.mjs <outfile> [extra playwright args...]
import { spawnSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const [outFile, ...extra] = process.argv.slice(2);
const args = ['run', 'test:release', ...(extra.length ? ['--', ...extra] : [])];
const started = Date.now();
const r = spawnSync('npm', args, {
  cwd: process.cwd(),
  encoding: 'utf8',
  maxBuffer: 1024 * 1024 * 128,
  env: { ...process.env },
});
const secs = ((Date.now() - started) / 1000).toFixed(1);
writeFileSync(
  outFile,
  `CMD=npm ${args.join(' ')}\nRC=${r.status}\nSECONDS=${secs}\n` +
    `=== STDOUT ===\n${r.stdout ?? ''}\n=== STDERR ===\n${r.stderr ?? ''}\n`,
);
console.log(`RC=${r.status} SECONDS=${secs} -> ${outFile}`);
