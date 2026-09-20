#!/usr/bin/env node
/**
 * set-line1.mjs — replace STATUS.md line 1, optionally archiving the old line-1
 * as a `- **s<N> handoff (line-1 archive):** ...` bullet below the law bullets.
 *
 * usage: node set-line1.mjs <textfile> [--archive-as sNNNN]
 * The new line-1 is read from a FILE, never argv: line-1 routinely exceeds 60KB
 * and carries every shell metacharacter there is.
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(process.cwd());
const STATUS = path.join(ROOT, 'STATUS.md');
const textFile = process.argv[2];
if (!textFile) {
  console.error('usage: node set-line1.mjs <textfile> [--archive-as sNNNN]');
  process.exit(2);
}
const i = process.argv.indexOf('--archive-as');
const archiveAs = i === -1 ? null : process.argv[i + 1];
// "handoff (line-1 archive)" for a handoff line, "lock line (archived)" for a
// lock line — STATUS.md uses both and they must not be conflated.
const j = process.argv.indexOf('--archive-kind');
const archiveKind = j === -1 ? 'handoff (line-1 archive)' : process.argv[j + 1];

const newLine1 = fs.readFileSync(textFile, 'utf8').replace(/\n+$/, '');
const lines = fs.readFileSync(STATUS, 'utf8').split('\n');
const oldLine1 = lines[0];
lines[0] = newLine1;

if (archiveAs) {
  // Insert the archive bullet immediately above the newest existing archive
  // bullet, so the archive list stays newest-first.
  const at = lines.findIndex((l) => /^- \*\*s\d+ handoff \(line-1 archive\):\*\*/.test(l));
  if (at === -1) {
    console.error('set-line1: REFUSING — no existing "(line-1 archive)" bullet to anchor on.');
    process.exit(2);
  }
  lines.splice(at, 0, `- **${archiveAs} ${archiveKind}:** ${oldLine1}`);
  console.log(`archived old line-1 as ${archiveAs} at line ${at + 1}`);
}

fs.writeFileSync(STATUS, lines.join('\n'));
console.log(`STATUS.md line-1 rewritten (${newLine1.length} chars)`);
