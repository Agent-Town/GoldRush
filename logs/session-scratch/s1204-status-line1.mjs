#!/usr/bin/env node
// s1204 — rewrite STATUS.md line-1, archiving the previous line-1 as a bullet at line 2.
// Usage: node s1204-status-line1.mjs <new-line-1-file> <archive-label>
//   e.g. node ... s1204-line1.txt "s1203 handoff"
// Written per the RETENTION LAW (probe/utility scripts are committed, not discarded).
import { readFileSync, writeFileSync } from 'node:fs';

const [, , newLineFile, archiveLabel] = process.argv;
if (!newLineFile || !archiveLabel) {
  console.error('usage: node s1204-status-line1.mjs <new-line-1-file> <archive-label>');
  process.exit(2);
}

const STATUS = 'STATUS.md';
const lines = readFileSync(STATUS, 'utf8').split('\n');
const oldFirst = lines[0];
const newFirst = readFileSync(newLineFile, 'utf8').replace(/\n+$/, '');

if (!newFirst) {
  console.error('refusing to write an empty line-1');
  process.exit(2);
}

const archived = `- **${archiveLabel} (line-1 archive):** ${oldFirst}`;
const out = [newFirst, archived, ...lines.slice(1)].join('\n');
writeFileSync(STATUS, out);

console.log(`line-1 replaced (${newFirst.length} chars); previous archived as "${archiveLabel}" (${oldFirst.length} chars)`);
