#!/usr/bin/env node
/**
 * s2671 — the ledger edit, in one pass, in the same commit as the event:
 *   1. prepend F-2671-1 as BACKLOG line 1;
 *   2. half-discharge F-2668-2's GATE in place (the denominator half is done,
 *      the destination half is still owed) — retired by marking, never deleted.
 *
 * It refuses rather than guesses: if the old clause is not found EXACTLY once,
 * nothing is written.
 */
import { readFileSync, writeFileSync } from 'node:fs';

const FILE = new URL('../../tasks/BACKLOG.md', import.meta.url);
const ROW = readFileSync(new URL('./backlog-row.txt', import.meta.url), 'utf8').trim();

const OLD = '(1) `scripts/ledger-mirror-freshness.mjs` STILL takes its denominator from the corpus it audits, so its new "✅ WHOLE AND CURRENT — 32/32 day(s)" is true today only because the series is genuinely whole — it would say the identical thing over one surviving file, exactly as it did for s2668; the defect is untouched and now better hidden. (2) The ruling\'s named remainder is still owed: `scripts/ledger-backup-pull.mjs` still writes into the public working tree rather than the private archive. GATE: LB-01\'s destination points at the private archive, and the freshness guard takes its denominator from outside its own directory.';

const NEW = '(1) **CURED s2671 `308df91d4` — and the warning was exactly right, see F-2671-1 at the head of this file:** `scripts/ledger-mirror-freshness.mjs` did take its denominator from the corpus it audits, proved by manufacturing the wipe (one file on disk printed "1/1 day(s) present" with a clean verdict and rc 0) and now taken from `ops/ledger-series-anchor.json`, outside the directory it measures. (2) **STILL OWED:** the ruling\'s named remainder — `scripts/ledger-backup-pull.mjs` still writes into the public working tree rather than the private archive. GATE (HALVED s2671; the denominator half is discharged): LB-01\'s destination points at the private archive.';

const text = readFileSync(FILE, 'utf8');
if (ROW.includes('\n')) throw new Error('the row must be ONE line');

const hits = text.split(OLD).length - 1;
if (hits !== 1) throw new Error(`REFUSING: the F-2668-2 clause matched ${hits} times, expected exactly 1`);

const lines = text.split('\n');
if (!lines[0].startsWith('🗄️ **F-2668-2 DISCHARGED')) {
  throw new Error(`REFUSING: line 1 is not the F-2668-2 row, it is: ${lines[0].slice(0, 80)}`);
}

const out = [ROW, ...lines].join('\n').replace(OLD, NEW);
writeFileSync(FILE, out);

const after = readFileSync(FILE, 'utf8').split('\n');
console.log('line 1 now :', after[0].slice(0, 110));
console.log('line 2 now :', after[1].slice(0, 110));
console.log('lines      :', after.length, '(was', lines.length + ')');
console.log('gate halved:', after[1].includes('GATE (HALVED s2671'));
