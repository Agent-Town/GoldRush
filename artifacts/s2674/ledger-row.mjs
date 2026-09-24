// Retire F-2673-1's row to CURED in place: the row stays (nothing is deleted -- the RETENTION
// LAW), its GATE sentence is answered, and the answer names which branch was taken and why.
import fs from 'node:fs';

const P = 'tasks/BACKLOG.md';
const src = fs.readFileSync(P, 'utf8');

const OLD_HEAD = '\u{1F573}\u{FE0F}\u{1F50D} **F-2673-1 (s2673 fire 2026-09-24, MEASURED';
const NEW_HEAD = '\u{1F573}\u{FE0F}\u{1F6E0}\u{FE0F} **F-2673-1 — CURED s2674 (filed s2673 fire 2026-09-24, MEASURED';
if (!src.startsWith(OLD_HEAD)) throw new Error('row head not where expected -- STOP, do not write');

const OLD_GATE =
  'GATE: either the unbounded walk names its cost and its legacy-debt verdict before starting ' +
  '(or requires an explicit `--unbounded`), or this row is accepted as documented-in-comments-only and says so.';
if (!src.includes(OLD_GATE)) throw new Error('gate sentence not found verbatim -- STOP, do not write');

const NEW_GATE =
  'GATE (SATISFIED s2674, `cdcb52a0a`): the unbounded walk now names its cost and its legacy-debt ' +
  'verdict BEFORE starting. **MEASURED AFTER THE CURE: 247 ms to the price tag, against ~10 min of ' +
  'silence before it** — and the preamble is SELF-TIMING, so it re-derived s2673’s numbers ' +
  'independently rather than hardcoding them (5,859 commits vs 5,857; 51 ms per blob read vs 49.8; ' +
  '~10.0 min projected vs 9.7). ⚡ **THE GATE’S OTHER BRANCH — "or requires an explicit ' +
  '`--unbounded`" — WAS DECLINED ON MEASUREMENT, NOT TASTE, AND THE MEASUREMENT IS THE POINT: the ' +
  'BARE form is the TEST SUITE’S OWN CONTRACT.** `status-archive-empty-corpus-guard` drives the ' +
  'tool bare in eight of its nine arms (including all three CANNOT VERIFY route arms) and ' +
  '`status-archive-arg-guard` arm 7 does the same, so a newly required flag would have redded TEN ARMS ' +
  'ACROSS TWO GUARDS to fix a diagnostic that costs nothing to print — F-1460-1’s road, where a ' +
  'guard that reds on lawful use gets excused into uselessness. Announcing is strictly additive and arm ' +
  '12 PROVES it additive: strip the announcement and rc and the verdict line stay byte-equal. ' +
  '⚠️ **ONE TRAP FOUND WHILE CURING, and it is the shape this file keeps teaching: the sample ' +
  'read that times the projection must NOT go through `blobOf`,** because `blobOf` increments ' +
  '`blobFailures`, which is the discriminator for the `blobs-unreadable` refusal route — timing a ' +
  'read through it would let a diagnostic change the REFUSAL ROUTE the walk reports, an instrument’s ' +
  'own instrumentation moving its verdict. It swallows its failure into a local null and prints the ' +
  'price as UNKNOWN instead of guessing. 📍 **AND THE FILE’S OWN POINTER NOTE CAME TRUE A ' +
  'FOURTH TIME:** the insertion moved the `:221`/`:322` pair, `source-pointer-guard` flagged only the ' +
  'FIRST member (a range is two pointers and one is guarded), and the second moved TWICE MORE while the ' +
  'note about it was being written — 403 → 406 → 407. Both re-based by RE-GREPPING, never by a ' +
  'remembered delta; the note now records the fourth instance. EVIDENCE: 12/12 `status-archive-arg-guard` ' +
  '(arms 10-12 new: ordering by position in stdout, the bounded leg NOT lectured, and the strip-it ' +
  'mutation), 39/39 across the four archive guards = the pre-cure baseline exactly, `source-pointer-guard` ' +
  'PASS, ledger battery green before the clearing commit (F-E1T-2). Preamble transcript: ' +
  '`artifacts/s2674/prove-preamble.mjs`.';

let out = src.replace(OLD_HEAD, NEW_HEAD).replace(OLD_GATE, NEW_GATE);

// The row's closing sentence deferred the cure to a later fire. That fire arrived; say so rather
// than leaving a promise that reads as still-open.
const OLD_TAIL = 'Deliberately not cured here — the fire that finds a thing should not also reshape a tool with four guards over it while its own gate is elsewhere, and the correction above is the part that was actually costing anyone anything.';
if (!out.includes(OLD_TAIL)) throw new Error('tail sentence not found verbatim -- STOP, do not write');
out = out.replace(
  OLD_TAIL,
  OLD_TAIL +
    ' ✅ **s2674 WAS THAT LATER FIRE and the deferral was vindicated:** curing it took a full read of ' +
    'the four guards over the tool BEFORE touching a line, and that read is exactly what turned the ' +
    '`--unbounded` branch from the obvious choice into the measurably wrong one. A fire in a hurry would ' +
    'have taken it.',
);

if (out === src) throw new Error('no change written -- STOP');
fs.writeFileSync(P, out);
console.log('rewrote', P, src.length, '->', out.length);
