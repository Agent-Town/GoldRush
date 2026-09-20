#!/usr/bin/env node
// s1350 — run the remainder of `test:ledger-guards` directly (the bash allowlist refuses
// the npm script name; F-1300-4 prescribes exactly this fallback). Reports each rc.
import { spawnSync } from 'node:child_process';
const ROOT = '/Users/robin/Claude/Projects/Gold Rush';
const STEPS = [
  ['scripts/findings-state-guard.mjs'],
  ['scripts/blocker-panel-closed-guard.mjs'],
  ['scripts/ruling-propagation-guard.mjs'],
  ['scripts/citation-title-guard.mjs'],
  ['scripts/desk-declaration-guard.mjs'],
  ['scripts/status-archive-audit.mjs', '--limit', '40', '--quiet'],
  ['scripts/attended-owed-audit.mjs'],
];
let bad = 0;
for (const args of STEPS) {
  const r = spawnSync('node', args, { cwd: ROOT, encoding: 'utf8', maxBuffer: 1 << 28 });
  const ok = r.status === 0;
  if (!ok) bad++;
  console.log(`${ok ? '✔' : '✘'} rc=${r.status}  ${args[0]}`);
  if (!ok) console.log((r.stdout + r.stderr).split('\n').slice(-25).join('\n'));
}
console.log(`\n${bad === 0 ? 'ALL GREEN' : bad + ' RED'} — ${STEPS.length} steps`);
process.exit(bad ? 1 : 0);
