#!/usr/bin/env node
/**
 * measure-desk-headers.mjs — what do REAL desk headers look like?
 *
 * The cure for F-1471-3 must match every spelling a fire has actually written
 * and refuse prose mentions. Guessing the separator would just swap a
 * fail-open for a fail-closed. So: take every line-1 the repo has ever had
 * (the live line 1 + every "(line-1 archive)" bullet), find the desk header in
 * each, and print the 18 characters that follow the desk word.
 */
import fs from 'node:fs';

const lines = fs.readFileSync('STATUS.md', 'utf8').split('\n');
const line1s = [];
if (lines[0]) line1s.push(['live line-1', lines[0]]);
lines.forEach((l, i) => {
  const m = l.match(/^- \*\*(s\d+) handoff \(line-1 archive\):\*\*/);
  if (m) line1s.push([m[1] + ' @' + (i + 1), l]);
});

const WORD = /OWNER(?:'S|’S|S)? DESK/g;
const tallies = new Map();
let withDesk = 0;
let withoutDesk = 0;
const noDesk = [];

for (const [label, text] of line1s) {
  const hits = [...text.matchAll(WORD)];
  if (!hits.length) {
    withoutDesk++;
    noDesk.push(label);
    continue;
  }
  withDesk++;
  // Record the separator that follows EVERY occurrence, so we can see whether
  // prose mentions ("on the owner's desk,") are common on line-1.
  for (const h of hits) {
    const after = text.slice(h.index + h[0].length, h.index + h[0].length + 18);
    const sep = after.slice(0, 3);
    tallies.set(sep, (tallies.get(sep) || 0) + 1);
  }
}

console.log(`line-1s examined      : ${line1s.length}`);
console.log(`  with a desk word    : ${withDesk}`);
console.log(`  with NO desk word   : ${withoutDesk}`);
console.log('\nfirst 3 chars AFTER the desk word, by frequency:');
[...tallies.entries()]
  .sort((a, b) => b[1] - a[1])
  .forEach(([sep, n]) => console.log(`  ${String(n).padStart(4)}  ${JSON.stringify(sep)}`));
console.log('\nline-1s with NO desk word at all:', noDesk.join(', ') || '(none)');
