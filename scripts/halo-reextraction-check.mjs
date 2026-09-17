#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { PNG } from 'pngjs';

const BASE = '89bfc10cda7e208589c7ad6304eb4c6aeae727bf';
const SWEEP = 'artifacts/f1450-4/halo-class-sweep.json';
const HELD_SHEETS = new Set([
  'char-bandit-thief-sheet-walk8',
  'char-baron-sheet-walk8',
  'char-e9-feral_terraformer-sheet-walk8',
  'char-elder-sheet-walk8',
  'char-hero-sheet-walk8',
  'char-newsie-mei-sheet-walk8',
  'char-storekeeper-sheet-walk8',
  'char-youngster-f-sheet-walk8',
  'char-youngster-m-sheet-walk8',
]);

// REGENERATED, NOT RE-EXTRACTED (task elder-walk8-regeneration, 2026-09-07; owner ruling A8,
// verbatim: "F-AGE1: has to be adapted to be woman"). A stem listed here is held out of `cured` for
// the same reason as any HELD_SHEETS member — its bytes are not expected to match BASE, so the
// alpha/opaque-RGB invariant below cannot apply to it — but its BASE residue is no longer EXPECTED,
// because the sheet was generated afresh by a pipeline that ends in the post-s1449 extractor and
// therefore carries the alpha bleed the 2026-07 sheets predate.
//
// MEASURED on this tree: all 32 `char-elder-sheet-walk8` cells are suspects at BASE (the bearded
// man, extracted 2026-07-11) and 0 of 32 are suspects now, with no cell of any other sheet becoming
// one. So the held residue moves 264 -> 232 and `cured` does not move (811): the Elder's cells were
// never in it. The assertion below is what makes this a claim rather than a subtraction — if a
// regenerated sheet came back haloed, its cells would appear in `current.suspects`, be absent from
// `expectedResidual`, and red the deepEqual.
//
// RE-EXTRACTED, NOT RE-GENERATED (task sprites-split-land, 2026-09-14; owner ruling A19, verbatim:
// "A19 - that is ok", 2026-09-13). The twenty-four stems below arrive from `sol/code-review-20260908`
// as stage 1 of that ruling: the non-payload half of Astra's sprite roster, landed for its violet-key
// fringe cure (`reviews/drain-review-sprites-roster.md` §7). They are NOT regenerated from a prompt the
// way the Elder was — the art is the same art — but they ARE new cutouts or new despills of it, so
// their bytes no longer match BASE and the alpha/opaque-RGB invariant below cannot apply to them.
// They join the Elder here for that reason, and on the same terms: their BASE residue stops being
// EXPECTED, so if any of them came back haloed its cells would appear in `current.suspects`, be absent
// from `expectedResidual`, and red the deepEqual. The declaration is a claim, not a subtraction.
//
// MEASURED before landing, main vs the branch, over every cell of every stem
// (`artifacts/sprites-split-land/family-pixel-census.json`, `edge-confinement-census.json`):
//   * twenty-two of the twenty-four are DESPILL ONLY — alpha byte-identical (0 differing pixels),
//     every changed opaque pixel within 3 px of a non-opaque one (max Chebyshev distance 3, 0 pixels
//     beyond), max channel delta 16-44, figure height unchanged to the pixel. They cannot have moved
//     the figure; only its rim colour.
//   * `char-railtough-sheet-walkdiag4-a` is a re-cut: 21,309 alpha-differing px (max 255), 743 changed
//     opaque px beyond 3 px of the edge, mean channel delta 15 (p99 58), figure height 290 -> 288 px.
//   * `char-baron-sheet-walk8` is a re-cut AND a re-downscale (256x256 cells): 80,090 alpha-differing
//     px, 463,133 changed opaque px of which 373,196 beyond 3 px, mean channel delta 30. Its mean
//     opaque RGB moves 81.8/51.0/36.7 -> 71.9/40.9/29.1 — the pale halo washed INTO the figure coming
//     back out, not a recolour: the hue holds and the eyes-on contact sheet
//     (`artifacts/sprites-split-land/contact-char-baron-sheet-walk8.png`) shows the same Baron with a
//     cream rim on main and none after. 16,822 visible violet-key px -> 0.
// What this ratifies is therefore NAMED, DATED and SEEN, which is the opposite of the branch's own
// answer to this guard (F-SPRDR-3: HELD_SHEETS narrowed 9 -> 1, expectedResidual 232 -> 0, and the
// invariant itself relaxed to permit an opaque-RGB change "within 3 px of alpha"). That relaxation is
// NOT taken: the invariant below is main's, unchanged, and still strict for all 459 remaining cured cells.
const REGENERATED_SHEETS = new Set([
  'char-elder-sheet-walk8',
  // stage 1 of A19 — landed 2026-09-14 by tasks/sprites-split-land.md
  'char-bandit-base-sheet-walk8',
  'char-bandit-base-sheet-walkdiag8',
  'char-bandit-thief-sheet-walk8',
  'char-bandit-thief-sheet-walkdiag8',
  'char-baron-sheet-walk4-a',
  'char-baron-sheet-walk4-b',
  'char-baron-sheet-walk8',
  'char-baron-sheet-walkdiag8',
  'char-coalthief-sheet-walk4-a',
  'char-e6-feral_toaster-sheet-walk8',
  'char-e6-glowjack-sheet-walk8',
  'char-e6-lawn_shepherd-sheet-walk8',
  'char-e7-data_rustler-sheet-walk8',
  'char-e7-rogue_automaton-sheet-walk8',
  'char-e8-scrap_corsair-sheet-walk8',
  'char-e8-sun_glare_shambler-sheet-walk8',
  'char-e9-claim_jump_prospect_drone-sheet-walk8',
  'char-e9-feral_terraformer-sheet-walk8',
  'char-jumper-sheet-walk4-a',
  'char-jumper-sheet-walk4-b',
  'char-jumper-sheet-walk8',
  'char-railtough-sheet-walk4-a',
  'char-railtough-sheet-walkdiag4-a',
  'char-steamwrecker-sheet-walk4-a',
  // RE-CUT WITH A HARD ALPHA EDGE (task town-cast-walk8-hard-alpha-recut, 2026-09-14; owner ruling
  // A19, verbatim "A19 - that is ok", 2026-09-13 = option (b) of reviews/drain-review-sprites-roster.md
  // F-SPRDR-2: re-cut the heavy town-cast sheets rather than raise the 35,000,000 B budget). Stage 2
  // of that ruling. Each stem below ships the branch's DESPILLED opaque RGB under a BINARISED alpha
  // (threshold 128, zero partial-alpha pixels, so the per-sheet partial count is 0 against main's
  // 12,394-21,962) and a single flat colour under every alpha=0 pixel. Main shipped #ff00ff in the
  // 1-px ring immediately outside the figure - MEASURED 1,207 px on char-youngster-m-sheet-walk8-r0c0,
  // 1,381 on char-storekeeper-sheet-walk8-r0c0, 704 on char-hero-sheet-walk8-r0c0 - which is the halo
  // this ruling is about; the branch's own answer was a full bleedEdges field whose 6,363 distinct
  // colours cost +26 kB per cell and blew the budget by 15,726,438 B.
  //
  // MEASURED on this tree before landing (artifacts/town-cast-walk8-hard-alpha-recut/report.md,
  // census-main-vs-branch.json, _census*.json), main -> re-cut, nine stems:
  //   * visible violet-key px (alpha >= 16, R-G >= 40, B-G >= 40): 88,438 -> 0.
  //   * key-coloured px under fully transparent px: 10,158,666 -> 0.
  //   * partial-alpha px: 161,618 -> 0. The edge is HARD, which is the whole of the ruling.
  //   * dist bytes: 16,031,224 -> 10,996,656 (-31.4 %); every family is BELOW main, none needed the
  //     +5 % the master allowed.
  //   * figure height (alpha >= 128), per-row mean, main -> re-cut: within +-2.9 px on seven stems;
  //     char-storekeeper-sheet-walk8 row 2 -11.8 px and row 3 +9.1 px is a re-extraction SCALE shift
  //     of the same art (eyes-on: artifacts/town-cast-walk8-hard-alpha-recut/contact-char-storekeeper-sheet-walk8.png),
  //     recorded as F-RECUT-3 for the owner's eye, not a recolour or a replacement.
  // char-schoolteacher-sheet-walk8-a is DELIBERATELY ABSENT: its row 2 on the branch is a different
  // generation of the character (a plain skirt where its own rows 0/1/3 and main's whole sheet wear a
  // tiered one), F-SPRDR-10's class, so it is HELD with main's cells and stays in `cured` - which is
  // why `cured` reads 395 and not 379 below.
  'char-youngster-m-sheet-walk8',
  'char-youngster-f-sheet-walk8',
  'char-storekeeper-sheet-walk8',
  'char-tavernkeeper-sheet-walk8',
  'char-newsie-mei-sheet-walk8',
  'char-assay-clerk-sheet-walk8-a',
  'char-preacher-sheet-walk8-a',
  'char-hero-sheet-walk8',
  // NEW FAMILIES, NEVER AT BASE (task sprite-roster-remainder, 2026-09-17; owner 2026-09-17, verbatim:
  // "Lets do them all." / "All on the Anthropic subscription"). The sixty stems below are the direction
  // art Astra cut on `sol/code-review-20260908` and left referenced by nothing (F-SPRDR-4b); this task
  // registers them in assets/layer-contracts/characters.v2.json, so they arrive with their wiring.
  // They are DECLARED here for provenance, not for arithmetic: none of them exists at BASE
  // (89bfc10cda7e), so none appears in `baseline.suspects`, and the three partition pins below
  // (0 / 680 / 395) DO NOT MOVE — verified on this tree. What does move is the denominator; see the
  // re-pin note at the `current.scanned` assertion.
  // MEASURED on this tree over all 612 new cells: 0 visible violet-key px, 0 key px under fully
  // transparent px, and `artifacts/f1450-4/halo-class-sweep.mjs` finds 0 suspects in the whole of
  // assets/processed — so the deepEqual below still asserts an EMPTY residue with these cells in it,
  // which is the claim: the new art came in clean.
  // F-SPR-07 reconciliations (36 cells):
  'char-baron-ne-clean-v2',
  'char-baron-w-clean-v2',
  'char-coalthief-north4-v2',
  'char-railtough-north4-v2',
  'char-steamwrecker-north4-v2',
  'char-thief-se-finish-v2',
  // F-SPR-06 per-direction walk8 art for the nine E6-E9 slots (576 cells):
  'char-e6-feral_toaster-sheet-walk8-a',
  'char-e6-feral_toaster-sheet-walk8-b',
  'char-e6-lawn_shepherd-sheet-walk8-a',
  'char-e6-lawn_shepherd-sheet-walk8-b',
  'char-e7-rogue_automaton-sheet-walk8-a',
  'char-e7-rogue_automaton-sheet-walk8-b',
  ...['e6-glowjack', 'e7-data_rustler', 'e8-scrap_corsair', 'e8-sun_glare_shambler', 'e9-feral_terraformer', 'e9-claim_jump_prospect_drone']
    .flatMap((slot) => ['s', 'sw', 'w', 'nw', 'n', 'ne', 'e', 'se'].map((d) => `char-${slot}-sheet-walk8-${d}`)),
]);

const gitShow = (file) => execFileSync('git', ['show', `${BASE}:${file}`], { maxBuffer: 20 * 1024 * 1024 });
const baseline = JSON.parse(gitShow(SWEEP));
const stem = (file) => path.basename(file).replace(/-r\d+c\d+\.png$/, '').replace(/\.png$/, '');
const expectedResidual = baseline.suspects.filter(({ file }) => HELD_SHEETS.has(stem(file)) && !REGENERATED_SHEETS.has(stem(file)));
// A declared stem leaves `cured` whether or not it was ever HELD. Until sprites-split-land every
// REGENERATED_SHEETS member also sat in HELD_SHEETS (there was one, the Elder), so keying the
// exclusion off HELD_SHEETS alone was indistinguishable from keying it off both. Twenty-one of the
// twenty-four stems added above were never held, so it is distinguishable now: without this clause a
// declared re-extraction would still be measured against BASE's bytes and the declaration would mean
// nothing. The invariant is not weakened — it still runs, unchanged, over every undeclared cured cell.
const cured = baseline.suspects.filter(({ file }) => !HELD_SHEETS.has(stem(file)) && !REGENERATED_SHEETS.has(stem(file)));
const regenerated = baseline.suspects.filter(({ file }) => REGENERATED_SHEETS.has(stem(file)));

assert.equal(baseline.scanned, 1314);
// F-PORT-4 (attended 2026-09-06): the portraits-e5-e10 batch added 21 full-bleed, fully opaque townsfolk portraits
// (no transparent pixels, so no halo candidates); the denominator is 1314 + 21 = 1335, measured on the tree.
assert.equal(baseline.suspects.length, 1075);
// 264 held cells - 104 of them now declared regenerated (32 Elder + 32 char-bandit-thief-sheet-walk8
// + 32 char-baron-sheet-walk8 + 8 char-e9-feral_terraformer-sheet-walk8, the three HELD_SHEETS members
// that sprites-split-land landed on 2026-09-14) = 160. What is left is exactly the five town-cast
// walk8 sheets stage 2 owns: char-hero, char-newsie-mei, char-storekeeper, char-youngster-f,
// char-youngster-m. Measured, not derived: 232 - 32 - 32 - 8 = 160 and the sum below still closes.
// RE-PINNED 2026-09-14 by town-cast-walk8-hard-alpha-recut: the five stems this number stood for
// (char-hero, char-newsie-mei, char-storekeeper, char-youngster-f, char-youngster-m walk8, 160 cells)
// are all declared above now, so NOTHING is held back from the invariant any more. 160 - 160 = 0,
// measured on this tree; the deepEqual below therefore asserts the sweep finds ZERO halo suspects in
// assets/processed, which is the strongest form this guard has ever taken. If a cell comes back
// haloed it is absent from a set that is empty and the deepEqual reds.
assert.equal(expectedResidual.length, 0);
// 456 + 224: the 160 cells just released from expectedResidual plus the 64 cells of the three stems
// re-cut here that were never HELD (32 char-tavernkeeper + 16 char-assay-clerk + 16 char-preacher).
// Was 456. Measured: artifacts/town-cast-walk8-hard-alpha-recut/_partition.mjs prints 0/680/395.
assert.equal(regenerated.length, 680);
// 459 - 64, the three never-HELD stems above leaving `cured` for `regenerated`. The 16
// char-schoolteacher-sheet-walk8-a cells STAY here: that family was held, its cells are main's, and
// the byte-for-byte invariant below still runs over them. Was 459.
assert.equal(cured.length, 395);
// The three partitions are disjoint and exhaust the BASE suspect roster; this closes the arithmetic
// above so a future re-pin cannot quietly drop a cell out of all three sets.
assert.equal(expectedResidual.length + regenerated.length + cured.length, baseline.suspects.length);

const savedSweep = fs.readFileSync(SWEEP);
let current;
try {
  execFileSync('node', ['artifacts/f1450-4/halo-class-sweep.mjs'], { stdio: 'pipe' });
  current = JSON.parse(fs.readFileSync(SWEEP, 'utf8'));
} finally {
  fs.writeFileSync(SWEEP, savedSweep);
}

// F-PORT-4 again (2026-09-06, portraits-e5-e10-generated-batch): ten more full-bleed, fully opaque
// townsfolk portraits (the E5 cast, the He-3 assayer, and four of the E10 cast) - 0 transparent px
// apiece, so still no halo candidates - move the denominator 1335 + 10 = 1345, measured on the tree.
// F-PORT-4 a third time (2026-09-06, portraits-era-aging-batch): eighteen more of the same tier -
// the E2, E3 and E4 aged cast - again 0 transparent px apiece and no halo candidates, so the
// denominator moves 1345 + 18 = 1363, measured on the tree. NINETEEN plates were generated; the
// nineteenth (tf-old-digger-e10) is deliberately NOT processed into assets/processed (F-AGE-3, see
// src/story/speakers.ts), which is why this is +18 and not +19.
// F-PORT-4 a fourth time (2026-09-07, portraits-era-aging-2-batch): thirty-one more of the same tier
// - the five trades across E5-E10 and the Salvage King - again 0 transparent px apiece and no halo
// candidates, so the denominator moves 1363 + 31 = 1394, measured on the tree. THIRTY-SIX plates were
// generated; the five youngster plates are deliberately NOT processed into assets/processed
// (F-AGE2-1: their faces do not descend from the shipped E1 youngsters - see src/story/speakers.ts
// and assets/LEDGER.md row 75), which is why this is +31 and not +36.
// F-PORT-4 a fifth time (2026-09-07, canon-calls-a8): ONE more of the same tier - the Old Digger's
// machine plate, 0 transparent px and no halo candidate - so the denominator moves 1394 + 1 = 1395,
// measured on the tree. THREE plates were processed in that batch; the other two REPLACE
// assets/processed/townsfolk-elder{,-e2}.png in place (owner ruling F-AGE-1, the Elder is a woman),
// so they add no file and move no denominator. The replacement is also invisible to the invariant
// below: townsfolk-elder.png is a full-frame keyed cutout with clean alpha and has never been a halo
// suspect, so it appears in neither `cured` nor `expectedResidual` at the BASE sweep, and swapping it
// for a fully opaque plate cannot break the alpha/opaque-RGB comparison.
// F-PORT-4 a sixth time (2026-09-07, youngsters-rechain-batch): FIVE more of the same tier - the two
// youngsters across E2, E4 and (for A) E8, re-minted against the shipped E1 portraits after the
// identity break above - 0 transparent px apiece and no halo candidates, so the denominator moves
// 1395 + 5 = 1400, measured on the tree. This is the +5 the note four paragraphs up said batch 2
// could not add: the five plates it withheld are still withheld and still unprocessed (their raws
// keep their batch-2 names - assets/raw/tf-youngster-a-e{2,4,8}.png and tf-youngster-b-e{2,4}.png),
// and these five are the batch-4 re-chain under the same names with a `b` suffix. Nothing was
// un-withheld; five new files exist. There is no B E8 plate in either batch.
// RE-MEASURED 2026-09-14 (sprites-split-land) and UNCHANGED at 1400, which is itself the finding:
// this stage takes only files the branch MODIFIES, never one it ADDS, so no PNG enters or leaves
// assets/processed and the denominator cannot move. The branch's own re-pin to 2082 (F-SPRDR-3, the
// +682 PNGs it adds) is NOT taken here and must not be: those 682 files are not on this tree. If this
// ever reads 2082 on main, a payload/new-family land leaked past item 4 of that master.
// maps-campaign-land-era6 + sprites-split-land drained together (attended 2026-09-14): the map campaign adds 1 processed
// PNG (assets/processed/terrain-e5-open-sea-tile.png), so the denominator the sprite drain re-measured at 1400 reads 1401 on the combined tree.
// RE-PINNED 2026-09-17 by tasks/sprite-roster-remainder.md: 1401 -> 2059, and the arithmetic has TWO
// terms, only one of which is this task's.
//   * THIS TASK adds 612 PNGs to assets/processed — the 576 per-direction E6-E9 walk8 cells that cure
//     F-SPR-06 and the 36 cells that cure F-SPR-07 (Baron NE/W, the three E2 norths, the thief's SE),
//     all declared in REGENERATED_SHEETS above and all referenced by characters.v2.json in the same
//     commit. 1447 + 612 = 2059, measured with `find assets/processed -name '*.png' | wc -l`.
//   * THE OTHER 46 ARE NOT MINE, AND THE PIN WAS ALREADY WRONG WITHOUT THEM. main at f431b878c holds
//     1447 PNGs under assets/processed (`git ls-tree -r --name-only HEAD -- assets/processed | grep -c
//     '\.png$'`) against a pin of 1401, so this guard was RED on clean main before this task touched it
//     — 46 PNGs landed since the 2026-09-14 re-pin without moving the denominator with them. Recorded
//     as F-SRR-3 in artifacts/sprite-roster-remainder/report.md, because a re-pin that quietly absorbs
//     someone else's red is how a guard stops being a guard. Re-pinning here cures the stale number;
//     it does not excuse whatever landed those 46 without their line.
assert.equal(current.scanned, 2059, 'processed PNG denominator moved');
assert.deepEqual(
  current.suspects.map(({ file }) => file).sort(),
  expectedResidual.map(({ file }) => file).sort(),
  // F-1489-2: this message hardcoded "301" and survived the 301 -> 264 re-pin, handing a future
  // reader the wrong denominator from the instrument itself. Derived from the same array the
  // assertion compares, so it cannot rot away from the pin again.
  `halo residue differs from the ${expectedResidual.length} cells held to preserve shipped mends/geometry`,
);

const loaded = execFileSync('node', ['artifacts/f1450-4/halo-loaded-check.mjs'], { encoding: 'utf8' });
const controls = loaded.split('=== NEGATIVE CONTROLS')[1]?.split('=== PROVABLY LOADED')[0] ?? '';
const controlLines = controls.split('\n').filter((line) => line.includes('assets/processed/'));
assert.equal(controlLines.length, 4, 'negative-control roster moved');
for (const line of controlLines) {
  assert.match(line, /0\.00%\s+keyPx\s+0\s+touching-art\s+0/, `negative control moved: ${line.trim()}`);
}

const failures = [];
for (const { file } of cured) {
  const before = PNG.sync.read(gitShow(file));
  const after = PNG.sync.read(fs.readFileSync(file));
  if (before.width !== after.width || before.height !== after.height) {
    failures.push(`${file}: ${before.width}x${before.height} -> ${after.width}x${after.height}`);
    continue;
  }

  let alphaDiffPixels = 0;
  let maxAlphaDelta = 0;
  let opaqueRgbDiffPixels = 0;
  for (let i = 0; i < before.width * before.height; i++) {
    const offset = i << 2;
    const alphaDelta = Math.abs(before.data[offset + 3] - after.data[offset + 3]);
    if (alphaDelta) {
      alphaDiffPixels++;
      maxAlphaDelta = Math.max(maxAlphaDelta, alphaDelta);
    }
    if (before.data[offset + 3] === 255 && (
      before.data[offset] !== after.data[offset]
      || before.data[offset + 1] !== after.data[offset + 1]
      || before.data[offset + 2] !== after.data[offset + 2]
    )) opaqueRgbDiffPixels++;
  }
  if (alphaDiffPixels || opaqueRgbDiffPixels) {
    failures.push(`${file}: alpha ${alphaDiffPixels} (max ${maxAlphaDelta}), opaque RGB ${opaqueRgbDiffPixels}`);
  }
}

assert.equal(failures.length, 0, `re-extraction invariant failed:\n${failures.join('\n')}`);
console.log(`halo re-extraction PASS: ${cured.length} cured, ${expectedResidual.length} held, ${regenerated.length} regenerated-and-cured, ${current.scanned} scanned; alpha and opaque RGB unchanged`);
