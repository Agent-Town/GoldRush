#!/usr/bin/env node
/**
 * s1487 pre-authoring measurement (F-1483-1: run a gate's predicate before writing scope).
 *
 * F-1486-1 measured its opaque-preserving composite against the SHIPPED bytes on disk
 * (`assets/processed/<cell>.png` as they are today). The gate that will judge the merge —
 * `scripts/halo-reextraction-check.mjs:64-91` — compares each newly-cured cell against the
 * BASE bytes (`git show 89bfc10c:<file>`), NOT against the shipped bytes.
 *
 * Those are the same object ONLY IF the held cells have never been rewritten since BASE.
 * That is plausible (they are held precisely because they were never re-extracted) but it
 * was never measured, and the entire acceptance of the master rests on it: if the shipped
 * bytes have drifted from BASE, the composite preserves the WRONG side's opaque RGB and the
 * check reds on its own success — the exact failure mode s1486 warned the master must avoid.
 *
 * Writes nothing. Read-only.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const BASE = '89bfc10cda7e208589c7ad6304eb4c6aeae727bf';
const SWEEP = 'artifacts/f1450-4/halo-class-sweep.json';

// the 6 sheets F-1486-1 found OUT OF the pocket detector's scope (37 cells)
const SIX = new Set([
  'char-hero-sheet-back-f', 'char-hero-sheet-front-f', 'char-hero-sheet-rotation2-f',
  'char-hero-sheet-side-actions-f', 'char-hero-sheet-side-f', 'ter-rail-elements',
]);
// verbatim from scripts/halo-reextraction-check.mjs:10-26
const HELD = new Set([
  'char-bandit-thief-sheet-walk8', 'char-baron-sheet-walk8', 'char-e9-feral_terraformer-sheet-walk8',
  'char-elder-sheet-walk8', 'char-hero-sheet-back-f', 'char-hero-sheet-front-f',
  'char-hero-sheet-rotation2-f', 'char-hero-sheet-side-actions-f', 'char-hero-sheet-side-f',
  'char-hero-sheet-walk8', 'char-newsie-mei-sheet-walk8', 'char-storekeeper-sheet-walk8',
  'char-youngster-f-sheet-walk8', 'char-youngster-m-sheet-walk8', 'ter-rail-elements',
]);

const gitShow = (f) => execFileSync('git', ['show', `${BASE}:${f}`], { maxBuffer: 20 * 1024 * 1024 });
const baseline = JSON.parse(gitShow(SWEEP));
const stem = (f) => path.basename(f).replace(/-r\d+c\d+\.png$/, '').replace(/\.png$/, '');

const resid = baseline.suspects.filter(({ file }) => HELD.has(stem(file)));
const cured = baseline.suspects.filter(({ file }) => !HELD.has(stem(file)));
const six = baseline.suspects.filter(({ file }) => SIX.has(stem(file)));

console.log(`baseline: scanned ${baseline.scanned}, suspects ${baseline.suspects.length}`);
console.log(`today's pins: residual ${resid.length} (check :36), cured ${cured.length} (check :37)`);
console.log(`the SIX out-of-scope sheets contribute ${six.length} suspect cells`);
console.log(`=> re-pin to: residual ${resid.length - six.length}, cured ${cured.length + six.length}`);

const sha = (b) => crypto.createHash('sha256').update(b).digest('hex');
let same = 0;
const differ = [];
for (const { file } of six) {
  if (!fs.existsSync(file)) { differ.push(`${file} (MISSING ON DISK)`); continue; }
  if (sha(gitShow(file)) === sha(fs.readFileSync(file))) same++; else differ.push(file);
}
console.log(`\nBASE bytes vs SHIPPED disk bytes over the ${six.length} cells: identical ${same}, differing ${differ.length}`);
for (const f of differ.slice(0, 12)) console.log(`  DIFFERS: ${f}`);

const per = {};
for (const { file } of six) per[stem(file)] = (per[stem(file)] || 0) + 1;
console.log(`\nper-sheet suspect cells: ${JSON.stringify(per)}`);

console.log(differ.length === 0
  ? '\nVERDICT: BASE === SHIPPED on every cell. F-1486-1’s measurement transfers to the gate unchanged.'
  : '\nVERDICT: DRIFT FOUND — F-1486-1 measured against the wrong side; the master must be re-measured against BASE.');

fs.writeFileSync('artifacts/f1487-1/base-vs-shipped.json', JSON.stringify({
  base: BASE,
  baselineScanned: baseline.scanned,
  baselineSuspects: baseline.suspects.length,
  currentResidualPin: resid.length,
  currentCuredPin: cured.length,
  sixSheetCells: six.length,
  repinResidual: resid.length - six.length,
  repinCured: cured.length + six.length,
  identical: same,
  differing: differ.length,
  differingFiles: differ,
  perSheet: per,
}, null, 2) + '\n');
