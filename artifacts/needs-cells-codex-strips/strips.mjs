// Row table for the seven Codex strips. Bands are MEASURED from the LIVE registered cells of
// each family (artifacts/needs-cells-codex-strips/measure-live.mjs), never inherited:
//   char.claim_jumper.walk4, the six in-family rows (s/se/e/ne from sheet-a, n/w from the
//     2026-09-18 Higgsfield plates): 156-176 px in a 256 cell, per-row means 160.0-171.0,
//     grand mean 165.4. (The sheet-b nw/sw rows at 139-150 are the two this task REPLACES and
//     are excluded from the band by the contract note's own words: "OUT of this task's firewall".)
//   char.e2.steam_wrecker.walk4, seven live rows: 222-258 px in a 512 cell, per-row means
//     228.5 (n) - 246.5 (s).
export const ROWS = [
  { id: 'wrecker-se', family: 'steamwrecker', grid: '2x2', cell: 512, band: [228, 252], aim: 242,
    stem: 'char-steamwrecker-se4-v1', raw: 'assets/raw/char-steamwrecker-se4-v1.png',
    src: 'artifacts/needs-cells-codex-strips/native/char-steamwrecker-se4-v1.png', lamp: true },
  ...['s', 'e', 'se', 'sw', 'ne', 'nw'].map((d) => ({
    id: `jumper-${d}`, family: 'jumper', grid: '2x2', cell: 256, band: [156, 176], aim: 165,
    stem: `char-jumper-${d}4-codex-v1`, raw: `assets/raw/char-jumper-${d}4-codex-v1.png`,
    // The six jumper sources are the NATIVE 1254 Codex renders, swept and mirrored into assets/raw
    // under their final names, so this row table reproduces from tracked files alone.
    src: `assets/raw/char-jumper-${d}4-codex-v1.png`, lamp: false })),
];
