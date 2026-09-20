import fs from 'node:fs';

const p = 'package.json';
const raw = fs.readFileSync(p, 'utf8');
const pkg = JSON.parse(raw);
const key = 'test:ledger-guards';
const before = pkg.scripts[key];

if (before.includes('nul-audit')) {
  console.log('already wired — no-op');
  process.exit(0);
}

// nul-audit must run LAST in this battery too: a fire's review/evidence prose is
// written late, and nul-audit is the only guard that reads it as bytes (F-1467-2).
const after = before + ' && node scripts/nul-audit.mjs';
pkg.scripts[key] = after;

// Write back preserving the file's exact 2-space style + trailing newline.
const out = JSON.stringify(pkg, null, 2) + '\n';
fs.writeFileSync(p, out);

// Prove the edit is surgical: exactly one line differs.
const diffLines = raw.split('\n').filter((l, i) => l !== out.split('\n')[i]);
console.log('changed lines:', diffLines.length);
console.log('wired nul-audit as the final leaf of', key);
