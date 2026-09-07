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
const REGENERATED_SHEETS = new Set([
  'char-elder-sheet-walk8',
]);

const gitShow = (file) => execFileSync('git', ['show', `${BASE}:${file}`], { maxBuffer: 20 * 1024 * 1024 });
const baseline = JSON.parse(gitShow(SWEEP));
const stem = (file) => path.basename(file).replace(/-r\d+c\d+\.png$/, '').replace(/\.png$/, '');
const expectedResidual = baseline.suspects.filter(({ file }) => HELD_SHEETS.has(stem(file)) && !REGENERATED_SHEETS.has(stem(file)));
const cured = baseline.suspects.filter(({ file }) => !HELD_SHEETS.has(stem(file)));
const regenerated = baseline.suspects.filter(({ file }) => REGENERATED_SHEETS.has(stem(file)));

assert.equal(baseline.scanned, 1314);
// F-PORT-4 (attended 2026-09-06): the portraits-e5-e10 batch added 21 full-bleed, fully opaque townsfolk portraits
// (no transparent pixels, so no halo candidates); the denominator is 1314 + 21 = 1335, measured on the tree.
assert.equal(baseline.suspects.length, 1075);
// 264 - 32 regenerated Elder cells; see REGENERATED_SHEETS above.
assert.equal(expectedResidual.length, 232);
assert.equal(regenerated.length, 32);
assert.equal(cured.length, 811);

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
