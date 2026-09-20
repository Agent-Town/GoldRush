// s1251 — ARM B of the harness experiment.
// Same spec file, DEFAULT playwright config (testDir './e2e', webServer `npm run dev`, port 5188).
// ARM A (control) = playwright.release.config.ts, already measured: 25/26.
// Hypothesis: under the default harness the E1 release-door assertions cannot pass, and the
// failures reproduce the signatures already enshrined in logs/suite-red-inventory.md.
import { spawnSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const outFile = process.argv[2];
const extra = process.argv.slice(3);
const args = ['playwright', 'test', 'e2e/release-build.spec.ts', ...extra];
const started = Date.now();
const r = spawnSync('npx', args, {
  cwd: process.cwd(),
  encoding: 'utf8',
  maxBuffer: 1024 * 1024 * 128,
  env: { ...process.env },
});
const secs = ((Date.now() - started) / 1000).toFixed(1);
writeFileSync(
  outFile,
  `CMD=npx ${args.join(' ')}\n(no --config: uses playwright.config.ts)\nRC=${r.status}\nSECONDS=${secs}\n` +
    `=== STDOUT ===\n${r.stdout ?? ''}\n=== STDERR ===\n${r.stderr ?? ''}\n`,
);
console.log(`RC=${r.status} SECONDS=${secs} -> ${outFile}`);
