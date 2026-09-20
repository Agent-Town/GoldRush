// s1318 — repair my own closure rows. findings-state-guard reads the F-ID out of the first 90
// characters of a line (SUBJECT_CHARS). I prepended "✅ **SHIPPED s1318 at `hash`, review `...`"
// to the existing rows, which pushed each row's F-ID past char 90 — so F-1297-2 went from `open`
// to NOT COUNTED AT ALL rather than to CLOSED. A closed finding must READ closed, not vanish.
// Cure: lead the closure with the F-ID so the subject zone carries it.
import { readFileSync, writeFileSync } from 'node:fs';

const path = 'tasks/BACKLOG.md';
let lines = readFileSync(path, 'utf8').split('\n');

const fixes = [
  { id: 'F-1316-1', from: '✅ **SHIPPED s1318 at `efa3b252`,', to: '✅ **F-1316-1 CLOSED — SHIPPED s1318 at `efa3b252`,' },
  { id: 'F-1297-2', from: '✅ **SHIPPED s1318 at `2871c127`,', to: '✅ **F-1297-2 CLOSED — SHIPPED s1318 at `2871c127`,' },
];

for (const { id, from, to } of fixes) {
  const i = lines.findIndex((l) => l.startsWith(from));
  if (i < 0) throw new Error(`closure row for ${id} not found`);
  lines[i] = to + lines[i].slice(from.length);
  const zone = lines[i].slice(0, 90);
  if (!zone.includes(id)) throw new Error(`${id} still outside the 90-char subject zone: ${zone}`);
  console.log(`${id}: subject zone now reads -> ${zone}`);
}

writeFileSync(path, lines.join('\n'));
console.log('closure rows repaired');
