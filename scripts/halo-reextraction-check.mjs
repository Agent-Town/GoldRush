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
  'char-hero-sheet-back-f',
  'char-hero-sheet-front-f',
  'char-hero-sheet-rotation2-f',
  'char-hero-sheet-side-actions-f',
  'char-hero-sheet-side-f',
  'char-hero-sheet-walk8',
  'char-newsie-mei-sheet-walk8',
  'char-storekeeper-sheet-walk8',
  'char-youngster-f-sheet-walk8',
  'char-youngster-m-sheet-walk8',
  'ter-rail-elements',
]);

const gitShow = (file) => execFileSync('git', ['show', `${BASE}:${file}`], { maxBuffer: 20 * 1024 * 1024 });
const baseline = JSON.parse(gitShow(SWEEP));
const stem = (file) => path.basename(file).replace(/-r\d+c\d+\.png$/, '').replace(/\.png$/, '');
const expectedResidual = baseline.suspects.filter(({ file }) => HELD_SHEETS.has(stem(file)));
const cured = baseline.suspects.filter(({ file }) => !HELD_SHEETS.has(stem(file)));

assert.equal(baseline.scanned, 1314);
assert.equal(baseline.suspects.length, 1075);
assert.equal(expectedResidual.length, 301);
assert.equal(cured.length, 774);

const savedSweep = fs.readFileSync(SWEEP);
let current;
try {
  execFileSync('node', ['artifacts/f1450-4/halo-class-sweep.mjs'], { stdio: 'pipe' });
  current = JSON.parse(fs.readFileSync(SWEEP, 'utf8'));
} finally {
  fs.writeFileSync(SWEEP, savedSweep);
}

assert.equal(current.scanned, 1314, 'processed PNG denominator moved');
assert.deepEqual(
  current.suspects.map(({ file }) => file).sort(),
  expectedResidual.map(({ file }) => file).sort(),
  'halo residue differs from the 301 cells held to preserve shipped mends/geometry',
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
console.log(`halo re-extraction PASS: ${cured.length} cured, ${expectedResidual.length} held, ${current.scanned} scanned; alpha and opaque RGB unchanged`);
