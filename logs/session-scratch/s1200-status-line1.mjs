// s1200 — STATUS.md line-1 rewriter (lock + handoff), committed per the RETENTION LAW.
// Usage: node logs/session-scratch/s1200-status-line1.mjs "<new line-1>" "<archive label>"
import fs from 'node:fs';

const p = 'STATUS.md';
const [, , newLine, archiveLabel] = process.argv;
if (!newLine || !archiveLabel) {
  console.error('usage: node s1200-status-line1.mjs "<new line-1>" "<archive label>"');
  process.exit(2);
}

const lines = fs.readFileSync(p, 'utf8').split('\n');
const old = lines[0];
lines[0] = newLine;
lines.splice(1, 0, `- **${archiveLabel} (line-1 archive):** ${old}`);
fs.writeFileSync(p, lines.join('\n'));
console.log(`new line-1: ${newLine.length} chars | archived "${archiveLabel}": ${old.length} chars`);
