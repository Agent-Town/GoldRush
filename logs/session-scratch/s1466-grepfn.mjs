// s1466: extract the `grep` shell-function definition from the Claude Code shell snapshot.
// (Reading it WITH grep would be circular — and the wrapper is the thing under test.)
import { readFileSync } from 'node:fs';
const snap = process.argv[2];
const src = readFileSync(snap, 'utf8');
const lines = src.split('\n');
for (let i = 0; i < lines.length; i++) {
  if (/^\s*(function\s+)?grep\s*\(\)/.test(lines[i])) {
    console.log(`--- ${snap}:${i + 1} ---`);
    console.log(lines.slice(i, i + 12).join('\n'));
    console.log('---');
  }
}
// Also report anything that could affect grep's behaviour globally.
for (let i = 0; i < lines.length; i++) {
  if (/GREP_OPTIONS|alias\s+grep|GREP_COLOR/.test(lines[i])) console.log(`[env] :${i + 1}  ${lines[i].trim()}`);
}
