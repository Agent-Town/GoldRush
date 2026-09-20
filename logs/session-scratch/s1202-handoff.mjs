// s1202 — rewrite STATUS.md line-1 as the handoff and archive s1201's line-1 as a bullet.
// Kept per the RETENTION LAW (committed, not deleted).
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const p = ROOT + 'STATUS.md';
const lines = fs.readFileSync(p, 'utf8').split('\n');
const prev = lines[0];

if (!prev.startsWith('ACTIVE')) {
  console.error('line-1 is not my ACTIVE lock — refusing to overwrite. Found: ' + prev.slice(0, 120));
  process.exit(1);
}

lines[0] = fs.readFileSync(new URL('./s1202-line1.txt', import.meta.url), 'utf8').trim();

// archive my own ACTIVE line only if s1201's archive bullet is already present (I inserted it at lock time)
const idx = lines.findIndex((l) => l.startsWith('- **s'));
if (idx < 0) {
  console.error('no law/archive bullet block found');
  process.exit(1);
}
console.log('line-1 rewritten (' + lines[0].length + ' chars); s1201 archive bullet already at line ' + (idx + 1));
fs.writeFileSync(p, lines.join('\n'));
