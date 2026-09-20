#!/usr/bin/env node
/**
 * s1487 pre-authoring measurement #2 — what did the ACCEPTED cure (the 774 cells) do
 * about `assets/processed-full/` masters?
 *
 * The halo gate scans and judges `assets/processed/` only. But every held sheet also has
 * a full-resolution master under `assets/processed-full/`, and the F-1486-1 harness resizes
 * the re-extracted full-size output down to the display cell whenever a master exists.
 * If the accepted precedent rewrote the masters too, the new master must; if it did not,
 * the new master must NOT — either way the answer is in git, not in reasoning.
 *
 * Read-only.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const BASE = '0d989bdc2096213e6775a5978cb6fe56fa8ea988';
const SWEEP = 'artifacts/f1450-4/halo-class-sweep.json';
const HELD = new Set([
  'char-bandit-thief-sheet-walk8', 'char-baron-sheet-walk8', 'char-e9-feral_terraformer-sheet-walk8',
  'char-elder-sheet-walk8', 'char-hero-sheet-back-f', 'char-hero-sheet-front-f',
  'char-hero-sheet-rotation2-f', 'char-hero-sheet-side-actions-f', 'char-hero-sheet-side-f',
  'char-hero-sheet-walk8', 'char-newsie-mei-sheet-walk8', 'char-storekeeper-sheet-walk8',
  'char-youngster-f-sheet-walk8', 'char-youngster-m-sheet-walk8', 'ter-rail-elements',
]);
const gitShow = (f) => execFileSync('git', ['show', `${BASE}:${f}`], { maxBuffer: 20 * 1024 * 1024 });
const stem = (f) => path.basename(f).replace(/-r\d+c\d+\.png$/, '').replace(/\.png$/, '');
const baseline = JSON.parse(gitShow(SWEEP));
const cured = baseline.suspects.filter(({ file }) => !HELD.has(stem(file)));

const changedSince = (file) => {
  try {
    const out = execFileSync('git', ['diff', '--name-only', BASE, 'HEAD', '--', file], { encoding: 'utf8' });
    return out.trim().length > 0;
  } catch { return null; }
};

let procChanged = 0, fullExists = 0, fullChanged = 0;
const sample = [];
for (const { file } of cured) {
  if (changedSince(file)) procChanged++;
  const full = file.replace('assets/processed/', 'assets/processed-full/');
  if (!fs.existsSync(full)) continue;
  fullExists++;
  const ch = changedSince(full);
  if (ch) fullChanged++;
  if (sample.length < 6) sample.push(`${path.basename(full)} changed=${ch}`);
}

console.log(`ACCEPTED CURE (the 774 cells that reached main):`);
console.log(`  assets/processed/      changed since BASE: ${procChanged} / ${cured.length}`);
console.log(`  assets/processed-full/ master exists for:  ${fullExists} / ${cured.length}`);
console.log(`  assets/processed-full/ changed since BASE: ${fullChanged} / ${fullExists}`);
for (const s of sample) console.log(`    e.g. ${s}`);
console.log(fullChanged === 0
  ? `\nPRECEDENT: the accepted cure rewrote the DISPLAY cells ONLY and left every full-res master untouched.\nThe new master must do the same — touching processed-full/ would exceed the accepted class.`
  : `\nPRECEDENT: the accepted cure ALSO rewrote ${fullChanged} full-res masters. The new master must match that.`);

fs.writeFileSync('artifacts/f1487-1/master-precedent.json', JSON.stringify({
  base: BASE, curedCells: cured.length, procChanged, fullExists, fullChanged,
}, null, 2) + '\n');
