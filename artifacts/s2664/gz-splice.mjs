// s2664 GZ-01 splice — PREDICT THE SHIFT IN WRITING BEFORE THE SPLICE RUNS.
// Lives under artifacts/s2664/, NOT scripts/ (F-1665-1 / F-2663-2).
import { readFileSync, writeFileSync } from 'node:fs';

const FILE = 'marketing/outbox/gazette-queue.md';
const ANCHOR = 'ac51296d';
const ANCHOR_LINE = 2120; // measured this fire, and asserted below rather than trusted
const PREDICTED = 2; // DERIVED BY COUNTING MY OWN BLOCK (1 dismissal line + 1 blank
                     // separator) against the rule this list converged on: every value
                     // <=4 is a DISMISSAL and every value >=6 is an ITEM. NOT carried
                     // forward from recent history — the last shift was also +2, which
                     // is precisely when a remembered delta feels safest.

const DISMISSAL =
  '**NOT PLAYER-VISIBLE** — s2664 merged an instrument cure, its guard and two findings rows: ' +
  'the worktree registry ledger now declares in-flight trees on every run rather than as a baseline ' +
  'delta, and does so in a fixed number of git calls instead of one per tree. No src, assets, public, ' +
  'functions or site path moved, and the single real drain on the board was left to the attended ' +
  'session already holding it.';

const before = readFileSync(FILE, 'utf8').split('\n');

// --- pre-flight: refuse rather than corrupt -------------------------------
const hits = before.map((l, i) => (l.includes(ANCHOR) ? i + 1 : 0)).filter(Boolean);
if (hits.length !== 1) throw new Error(`anchor ${ANCHOR} is not unique (${hits.length} hits) — REFUSING`);
if (hits[0] !== ANCHOR_LINE) throw new Error(`anchor moved: expected ${ANCHOR_LINE}, found ${hits[0]} — REFUSING`);

// --- F-1613-1, enforced BY REGEX rather than by eye -----------------------
if (DISMISSAL.includes('\n')) throw new Error('a dismissal must be a SINGLE line — REFUSING');
if (!/NOT PLAYER-VISIBLE/.test(DISMISSAL)) throw new Error('the marker is missing — REFUSING');
// candidate count is ZERO this fire, so a hash-shaped token would falsely mark something
// REPORTED. (The rule INVERTS for a discharging dismissal — see s2626/s2641.)
const hashy = DISMISSAL.match(/\b[0-9a-f]{7,40}\b/);
if (hashy) throw new Error(`zero-candidate dismissal must carry NO hash-shaped token, found "${hashy[0]}" — REFUSING`);

const block = [DISMISSAL, ''];
if (block.length !== PREDICTED) throw new Error(`block is ${block.length} lines, predicted ${PREDICTED} — REFUSING`);

// --- splice: PREPEND AT LINE 0 (the s2443 trap: prepending spends the -----
// --- trailing '' on a real blank separator, not the file's final newline) --
const after = [...block, ...before];
writeFileSync(FILE, after.join('\n'));

// --- measure, and ROLL BACK if the prediction was wrong --------------------
const check = readFileSync(FILE, 'utf8').split('\n');
const newHits = check.map((l, i) => (l.includes(ANCHOR) ? i + 1 : 0)).filter(Boolean);
const shift = newHits[0] - ANCHOR_LINE;
if (shift !== PREDICTED || check.length - before.length !== PREDICTED) {
  writeFileSync(FILE, before.join('\n'));
  throw new Error(`measured shift ${shift} != predicted ${PREDICTED} — ROLLED BACK`);
}
console.log(`predicted +${PREDICTED}, measured +${shift}`);
console.log(`anchor ${ANCHOR}: ${ANCHOR_LINE} -> ${newHits[0]}`);
console.log(`lines ${before.length} -> ${check.length}`);
console.log('eye-check, line ' + newHits[0] + ': ' + check[newHits[0] - 1].slice(0, 120));
