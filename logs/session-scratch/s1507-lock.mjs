// s1507 lock: replace line-1 with the ACTIVE stamp, archive s1506's handoff line-1 as a bullet.
import { readFileSync, writeFileSync } from 'node:fs';

const PATH = 'STATUS.md';
const lines = readFileSync(PATH, 'utf8').split('\n');
const prev = lines[0];

if (!prev.startsWith('Last updated: 2026-08-07T03:24Z s1506 handoff')) {
  throw new Error(`unexpected line-1: ${prev.slice(0, 120)}`);
}

const active = 'ACTIVE 2026-08-07T03:35Z (s1507 fire) — lane-a bisect live (f1506-2, culprit found + cure written); re-measuring F-1506-1 shell divergence while it finishes.';
const archived = `- **s1506 handoff (line-1 archive):** ${prev}`;

lines.splice(0, 1, active, archived);
writeFileSync(PATH, lines.join('\n'));
console.log('line1:', active);
console.log('archived bullet chars:', archived.length);
