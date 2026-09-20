#!/usr/bin/env node
/**
 * restore-s1471-archive.mjs — s1472 took the lock with a plain line-1 replace and
 * did NOT archive s1471's handoff line-1 as §4 requires. The text survives in
 * commit 393238484 (so no history was lost), but STATUS.md must carry the bullet
 * or the next fire reads a board with a fire missing from the archive.
 *
 * Insert it directly above the "s1471 lock line (archived)" bullet, which is the
 * chronologically correct slot: the handoff (03:51) is newer than the lock (03:28).
 */
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const prior = execFileSync('git', ['show', '393238484:STATUS.md'], {
  encoding: 'utf8',
  maxBuffer: 64 * 1024 * 1024,
}).split('\n')[0];

if (!/^Last updated: .*s1471 handoff/.test(prior)) {
  console.error('REFUSING — 393238484 line-1 is not the s1471 handoff:', prior.slice(0, 120));
  process.exit(2);
}

const lines = fs.readFileSync('STATUS.md', 'utf8').split('\n');
if (lines.some((l) => l.startsWith('- **s1471 handoff (line-1 archive):**'))) {
  console.log('already archived — nothing to do');
  process.exit(0);
}
const at = lines.findIndex((l) => l.startsWith('- **s1471 lock line (archived):**'));
if (at === -1) {
  console.error('REFUSING — cannot find the s1471 lock-line bullet to anchor on.');
  process.exit(2);
}
lines.splice(at, 0, `- **s1471 handoff (line-1 archive):** ${prior}`);
fs.writeFileSync('STATUS.md', lines.join('\n'));
console.log(`restored s1471 handoff archive at line ${at + 1} (${prior.length} chars)`);
