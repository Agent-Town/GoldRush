import fs from 'node:fs';
const p = 'docs/bench/e5-readiness-census.md';
const lines = fs.readFileSync(p, 'utf8').split('\n');
// 0-indexed: 66 = "<<<<<<< HEAD", 67..70 = HEAD rows, 71 = "=======", 72..75 = branch rows, 76 = ">>>>>>>"
const headRows = lines.slice(67, 71);
const brRows = lines.slice(72, 76);
if (!lines[66].startsWith('<<<<<<<') || !lines[71].startsWith('=======') || !lines[76].startsWith('>>>>>>>')) {
  throw new Error('hunk2 boundaries moved — refusing to write');
}

// Row 1 (the Claim): take the BRANCH row (newer: the socket exists) and fold in the surgery pass's
// declaration cure, which the branch row is silent about.
const claim = brRows[0].replace(
  '**PARTIAL** — `DeepwaterClaimTile` and `DeepwaterArsenal` run headlessly; `DredgeQueenBossSystem` cannot be constructed',
  '**PARTIAL** — `DeepwaterClaimTile` and `DeepwaterArsenal` run headlessly; `DredgeQueenBossSystem` cannot be constructed. ✅ Its dependency is **DECLARED** as `deepwater-claim-consumer` (surgery pass, `45f54b88`) — the declaration cure stands and is orthogonal to the socket',
);
if (claim === brRows[0]) throw new Error('claim-row fold failed — the target sentence moved');

// Rows 2-4 (Regatta, Stillwater, Flotilla): take the MAIN rows. Regatta's is strictly newer (BROKEN
// cured); Stillwater's and Flotilla's carry the surgery pass's re-measurement notes and are otherwise
// identical in substance to the branch's.
const merged = [...lines.slice(0, 66), claim, ...headRows.slice(1), ...lines.slice(77)];
fs.writeFileSync(p, merged.join('\n'));
console.log('markers left:', (merged.join('\n').match(/^(<<<<<<<|=======|>>>>>>>)/gm) || []).length);
