#!/usr/bin/env node
// s1201 probe: run the 14-file node-guard battery exactly as package.json defines it,
// and report the REAL exit code plus the pass/fail tallies and every failing guard name.
// Written because the fire's bash gate refuses `npm run`, and because a green counter
// is not a green exit code (both must be reported).
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// NOTE: URL.pathname percent-encodes the space in "Gold Rush" — fileURLToPath is mandatory here.
const REPO = fileURLToPath(new URL('../../', import.meta.url));
const pkg = JSON.parse(readFileSync(new URL('../../package.json', import.meta.url), 'utf8'));
const cmd = pkg.scripts['test:node-guards'];
// The script is `node --test <files...> && node scripts/test-ticker-stats.mjs`.
const [guardPart, tickerPart] = cmd.split('&&').map((s) => s.trim());
const guardFiles = guardPart.split(/\s+/).slice(2); // drop `node --test`

const r = spawnSync(process.execPath, ['--test', ...guardFiles], {
  cwd: REPO,
  encoding: 'utf8',
  maxBuffer: 64 * 1024 * 1024,
});
const out = `${r.stdout}\n${r.stderr}`;
// node --test's default reporter prefixes tallies with `ℹ`, not TAP's `#`. Accept both,
// so a reporter change can never silently turn a real count into a reassuring '?'.
const num = (k) => (out.match(new RegExp(`^[ℹ#] ${k} (\\d+)$`, 'm')) || [])[1] ?? '?';

console.log(`FILES         ${guardFiles.length}`);
console.log(`EXIT          ${r.status}`);
console.log(`tests         ${num('tests')}`);
console.log(`pass          ${num('pass')}`);
console.log(`fail          ${num('fail')}`);
console.log('--- failing guard names ---');
for (const line of out.split('\n')) {
  if (/^not ok \d+ - /.test(line)) console.log(line.trim());
}
console.log('--- files owning failures ---');
for (const line of out.split('\n')) {
  if (/^# Subtest: /.test(line)) continue;
}
if (process.argv.includes('--ticker')) {
  const t = spawnSync(process.execPath, [tickerPart.split(/\s+/)[1]], {
    cwd: REPO,
    encoding: 'utf8',
  });
  console.log(`TICKER EXIT   ${t.status}`);
}
