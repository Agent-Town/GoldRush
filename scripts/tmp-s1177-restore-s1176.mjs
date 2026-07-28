import fs from 'fs';
import { execFileSync } from 'child_process';

// §4 requires the previous line-1 to be archived as a bullet. When s1177 took the
// lock it overwrote s1176's handoff line without archiving it. Recover it from the
// commit that wrote it (306cde23) and insert it after this fire's lock archive.
const prev = execFileSync('git', ['show', '306cde23:STATUS.md'], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
  .split('\n')[0];

if (!prev.startsWith('Last updated: 2026-07-28T17:42Z s1176')) {
  throw new Error('unexpected s1176 line-1: ' + prev.slice(0, 120));
}

const p = 'STATUS.md';
const lines = fs.readFileSync(p, 'utf8').split('\n');

if (lines.some((l) => l.startsWith('- **s1176 handoff (line-1 archive):**'))) {
  console.log('already archived — no change');
  process.exit(0);
}

const bullet = '- **s1176 handoff (line-1 archive):** ' + prev.replace(/^Last updated: /, '');
// insert after line-1 + the s1177 lock archive bullet at index 1
lines.splice(2, 0, bullet);
fs.writeFileSync(p, lines.join('\n'));
console.log('s1176 handoff archive restored, ' + bullet.length + ' chars');
