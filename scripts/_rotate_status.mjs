import { readFileSync, writeFileSync } from 'node:fs';
const path = 'STATUS.md';
const newLine1 = process.argv[2];
const archivePrefix = process.argv[3]; // e.g. "s135 handoff (line-1 archive):"
const txt = readFileSync(path, 'utf8');
const lines = txt.split('\n');
const old1 = lines[0];
// rebuild: newLine1, blank, archive bullet of old1, then rest (from line index 2 which was the blank... )
// Original layout: [0]=line1, [1]=blank, [2..]=bullets
const rest = lines.slice(2).join('\n');
const out = newLine1 + '\n\n- **' + archivePrefix + '** ' + old1 + '\n' + rest;
writeFileSync(path, out);
console.log('rotated. old line1 len=', old1.length, ' new head:', newLine1.slice(0, 80));
