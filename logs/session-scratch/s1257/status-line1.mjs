#!/usr/bin/env node
// s1256 — rewrite STATUS.md line-1, archiving the previous line-1 as a bullet.
// Usage: node status-line1.mjs <newline1File> [--archive-label "s1255 handoff"]
// Without --archive-label the old line-1 is DISCARDED (only correct when it was our own ACTIVE lock).
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const repo = resolve(here, '../../..');
const statusPath = resolve(repo, 'STATUS.md');

const [newLineFile, ...rest] = process.argv.slice(2);
if (!newLineFile) {
  console.error('usage: status-line1.mjs <newline1File> [--archive-label "..."]');
  process.exit(2);
}
const labelIdx = rest.indexOf('--archive-label');
const archiveLabel = labelIdx >= 0 ? rest[labelIdx + 1] : null;

const newLine = readFileSync(resolve(process.cwd(), newLineFile), 'utf8').replace(/\n+$/, '');
if (!newLine || newLine.includes('\n')) {
  console.error('new line-1 must be exactly one non-empty line');
  process.exit(2);
}

const text = readFileSync(statusPath, 'utf8');
const lines = text.split('\n');
const old = lines[0];

let out;
if (archiveLabel) {
  const bullet = `- **${archiveLabel} (line-1 archive):** ${old}`;
  // insert the archive bullet where the previous archive bullets live: right after
  // the first blank line following line-1.
  let insertAt = 1;
  while (insertAt < lines.length && lines[insertAt].trim() === '') insertAt++;
  out = [newLine, '', bullet, '', ...lines.slice(insertAt)].join('\n');
} else {
  out = [newLine, ...lines.slice(1)].join('\n');
}
writeFileSync(statusPath, out);
console.log(`OK line-1 rewritten (${newLine.length} chars); archive=${archiveLabel ?? 'DISCARDED'} (old ${old.length} chars)`);
