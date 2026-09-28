// map-play-proofs-1 item 4: write the playability cell of the eighteen pending rows of the campaign status doc,
// ONLY that cell, ONLY those rows (the doc is resolved by row key at the drain). Idempotent: a row whose cell no
// longer reads the pending text is left alone and reported.
import { readFileSync, writeFileSync } from 'node:fs';

const DOC = new URL('../../reviews/sol-map-art-current-status-20260909.md', import.meta.url);
const PENDING = 'pending authored terminal and persistence proof';
const C = 'docs/bench/playability-secure-census-2026-09-25.md';
const bankDefect = 'bank, board and reload unmeasured because the game banks the score at the secure tick and the spec counts only a row the Return to Town click writes';
const secured = (wave) => `play proof 2026-09-25: FAIL at banks, an instrument defect (F-MPP1-1), not the map: boots, secures (Claim Secured at wave ${wave}, desktop and mobile) and clean PASS; ${bankDefect} (${C})`;
const limit = (why) => `play proof 2026-09-25: instrument limit at secures: ${why}; boots and clean PASS on desktop and mobile (${C})`;
const CELLS = {
  'e1-baron': limit("the secure waits for the Baron's Rocket Cart to break, which the generic kit never does (it passed the Baron's wave 20 unsecured in three runs, to waves 21, 23 and 23; the re-runs died at 19 and 14; F-MPP1-2)"),
  'e2-pressure-garden': secured(12),
  'e2-incline': limit("the secure waits for the Baron's railcar to be stopped, which the generic kit never does (mobile reached waves 12 and 13 unsecured; desktop died at wave 9, first pass and re-run, F-MPP1-2)"),
  'e3-blackout-ridge': secured(12),
  'e3-canyon-works': limit('the secure is latched on connecting both cliff galleries by wave 8, which the generic kit never does (desktop outlived it to wave 79 unsecured, twice), and the kit raised 0 buildings (no turret on this build menu, the beacon never funded; F-MPP1-2, F-MPP1-3)'),
  'e3-fairground': limit('the secure also needs the three festival flocks escorted across the midway, not a kit verb, and the kit died at wave 11 or 12 in all four runs with beacons only (no turret on this build menu; F-MPP1-2)'),
  'e4-dust-flats': limit('the secure waits on the Motor haul errand and the wave-14 land-yacht Baron, and the kit never drives; it died at wave 6 (desktop) and 5 (mobile) (F-MPP1-2)'),
  'e4-gusher-county': limit('the secure waits on the Motor deliveries errand, and the kit never drives (reached wave 14 desktop and 15 mobile of 12 unsecured, F-MPP1-2)'),
  'e4-boneyard': limit('the secure waits on the Motor tow errand, and the kit never drives (reached wave 13 desktop and 14 mobile of 12 unsecured, F-MPP1-2)'),
  'e8-far-side': limit('the generic kit raised 0 buildings, panning never lifted the purse off 0, and it died at wave 3 on both projects; the secure also waits on probe recovery (F-MPP1-3)'),
  'e8-low-orbit': limit('the generic kit raised 0 buildings, panning never lifted the purse off 0, and it died at wave 2 (desktop) and 5 (mobile) (F-MPP1-3)'),
  'e8-eclipse': limit('the generic kit raised 0 buildings, panning never lifted the purse off 0, and it died at wave 2 (desktop) and 3 (mobile) (F-MPP1-3)'),
  'e9-dome-basin': limit("the kit's build ghost read invalid at its home ring (5 refusals, desktop) and the seams were out of reach with the turret unfunded (mobile): 2 and 3 buildings, dead at wave 9 and 7 of 20 (F-MPP1-3)"),
  'e9-seed-run': `play proof 2026-09-25: FAIL at secures on desktop (died at wave 14 of 20 with 7 buildings, F-MPP1-5) and at banks on mobile, an instrument defect (F-MPP1-1): mobile boots, secures (Claim Secured at wave 20) and clean PASS; desktop boots and clean PASS; ${bankDefect} (${C})`,
  'e9-devils-alley': `play proof 2026-09-25: FAIL at secures on mobile (died at wave 16 of 20 with 7 buildings, F-MPP1-5) and at banks on desktop, an instrument defect (F-MPP1-1): desktop boots, secures (Claim Secured at wave 20) and clean PASS; mobile boots and clean PASS; ${bankDefect} (${C})`,
  'e9-old-canal': limit('every placement the kit tried was refused at its home ring (18 and 17 refusals), 0 buildings, dead at wave 14 and 13 of 20; the secure also waits on the canal choices (F-MPP1-3)'),
  'e10-last-claim': secured(8),
  'e10-river': secured(20),
};
for (const [id, text] of Object.entries(CELLS)) if (text.includes('|')) throw new Error(`cell for ${id} contains a pipe`);
const lines = readFileSync(DOC, 'utf8').split('\n');
const done = [];
const skipped = [];
for (const [id, text] of Object.entries(CELLS)) {
  const index = lines.findIndex((line) => line.startsWith('| ') && line.includes(`(${id}) |`));
  if (index < 0) { skipped.push(`${id}: row not found`); continue; }
  const cells = lines[index].split(' | ');
  if (cells[1] !== PENDING) { skipped.push(`${id}: cell is not the pending text, left alone`); continue; }
  cells[1] = text;
  lines[index] = cells.join(' | ');
  done.push(`${id} @ line ${index + 1}`);
}
writeFileSync(DOC, lines.join('\n'));
console.log(`written ${done.length}: ${done.join(', ')}`);
if (skipped.length) console.log(`skipped ${skipped.length}: ${skipped.join('; ')}`);
