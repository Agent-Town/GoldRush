#!/usr/bin/env node
// s1351 — the instrument behind F-1351-1.
//
// Takes the `Carried:` F-ID list out of a STATUS.md line-1 handoff (that list IS the
// desk as the handoff represents it — see F-1351-1's honest denominator note), locates
// each ID's DEFINING row in tasks/BACKLOG.md, and splits them into N chunks for reading.
//
// The chunks themselves are deliberately NOT committed: they are 158 KB of verbatim
// duplication of a tracked file, i.e. exactly the regenerable class s1350 taught the
// factory to sort last. This script is the part that cannot be regenerated from them.
//
// Usage: node logs/session-scratch/s1351-desk-extract.mjs [statusLineIndex] [chunks]

import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

// fileURLToPath, not URL.pathname — the repo path contains a space ("Gold Rush") and
// pathname would hand back "Gold%20Rush", which fs cannot open.
const REPO = fileURLToPath(new URL('../../', import.meta.url));
const statusLineIndex = Number(process.argv[2] ?? 1); // 1 = the s1350 archive bullet
const chunkCount = Number(process.argv[3] ?? 6);

const statusLines = fs.readFileSync(REPO + 'STATUS.md', 'utf8').split('\n');
const line = statusLines[statusLineIndex];
if (!line || !line.includes('Carried:')) {
  console.error(`line ${statusLineIndex} of STATUS.md carries no "Carried:" list`);
  process.exit(2);
}

const ids = [...new Set(line.slice(line.indexOf('Carried:')).match(/F-\d+-\d+/g) ?? [])];
const backlog = fs.readFileSync(REPO + 'tasks/BACKLOG.md', 'utf8').split('\n');

// A "defining" row is one where the ID appears in the row's opening ~220 chars — i.e. the
// row is ABOUT that finding, rather than merely citing it. Cap at 2 to bound the read.
const seen = new Set();
const chunks = Array.from({ length: chunkCount }, () => []);

ids.forEach((id, idx) => {
  const defining = [];
  backlog.forEach((s, i) => { if (s.slice(0, 220).includes(id)) defining.push(i); });
  const use = defining.slice(0, 2);
  let out = `===== ${id} ===== (BACKLOG.md lines ${use.map((i) => i + 1).join(',')})\n`;
  for (const i of use) {
    if (seen.has(i)) { out += `[line ${i + 1} already shown for an earlier ID]\n`; continue; }
    seen.add(i);
    out += backlog[i] + '\n';
  }
  chunks[idx % chunkCount].push(out);
});

const dir = REPO + 'logs/session-scratch/';
chunks.forEach((c, i) => {
  const path = `${dir}s1351-desk-chunk-${i + 1}.txt`;
  fs.writeFileSync(path, c.join('\n'));
  console.log(`chunk${i + 1}  ${String(c.length).padStart(2)} rows  ${fs.statSync(path).size} bytes`);
});
console.log(`\n${ids.length} distinct F-IDs from STATUS.md line ${statusLineIndex}`);
