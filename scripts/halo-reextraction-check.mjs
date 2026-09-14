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
assert.equal(expectedResidual.length, 160);
// 32 Elder + 424 cells across the 23 stems sprites-split-land declared above. Was 32.
assert.equal(regenerated.length, 456);
// 811 - 352, the cells of the 21 declared stems that were never HELD. Was 811.
assert.equal(cured.length, 459);
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
assert.equal(current.scanned, 1400, 'processed PNG denominator moved');
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
