// s1588 scratch: rewrite STATUS.md line-1 and archive the prior line-1 as a bullet.
// Usage: node artifacts/s1588-status-edit.mjs <newLine1File> <prevSessionNumber>
import fs from 'node:fs';

const [, , newLineFile, prevSession] = process.argv;
if (!newLineFile || !prevSession) {
  console.error('usage: node s1588-status-edit.mjs <newLine1File> <prevSessionNumber>');
  process.exit(2);
}

const path = 'STATUS.md';
const raw = fs.readFileSync(path, 'utf8');
const lines = raw.split('\n');
const old = lines[0];
const next = fs.readFileSync(newLineFile, 'utf8').replace(/\n+$/, '');

const archiveTag = `- **s${prevSession} handoff (line-1 archive):** `;
const already = raw.includes(archiveTag);

lines[0] = next;

if (!already) {
  let idx = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].startsWith('- **s') && lines[i].includes('handoff (line-1 archive)')) { idx = i; break; }
  }
  if (idx === -1) { console.error('no archive anchor found'); process.exit(2); }
  lines.splice(idx, 0, archiveTag + old);
  console.log(`archived prior line-1 as s${prevSession} bullet at line ${idx + 1}`);
} else {
  console.log(`s${prevSession} archive bullet already present — line-1 replaced only`);
}

fs.writeFileSync(path, lines.join('\n'));
