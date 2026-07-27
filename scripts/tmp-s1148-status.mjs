#!/usr/bin/env node
// s1148 status line-1 rewriter. The bash gate rejects heredocs/expansions and STATUS.md
// line-1 is far too long for a reliable Edit match, so line-1 surgery goes through node.
// Usage: node scripts/tmp-s1148-status.mjs <path-to-newline1-file> <archive-label>
import fs from 'node:fs';

const [, , newLinePath, archiveLabel] = process.argv;
if (!newLinePath || !archiveLabel) {
  console.error('usage: tmp-s1148-status.mjs <newline1file> <archive-label>');
  process.exit(2);
}
const newLine = fs.readFileSync(newLinePath, 'utf8').replace(/\n+$/, '');
const lines = fs.readFileSync('STATUS.md', 'utf8').split('\n');
const old = lines[0];
lines[0] = newLine;
lines.splice(1, 0, `- **${archiveLabel} (line-1 archive):** ${old}`);
fs.writeFileSync('STATUS.md', lines.join('\n'));
console.log(`line-1 replaced; archived as "${archiveLabel}"; file now ${lines.length} lines`);
