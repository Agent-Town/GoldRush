// s2681 — retire the stale F-2676-1 OPEN row (Ghost Line) and file F-2681-1.
// Run once. Refuses if row 6 is not the row it expects.
import fs from 'node:fs';

const p = 'tasks/BACKLOG.md';
const lines = fs.readFileSync(p, 'utf8').split('\n');
const orig = lines[5];

if (!orig.startsWith('🧰 **F-2676-1 (s2676, 2026-09-25) — OPEN, fire-authorable')) {
  console.error('ROW 6 IS NOT THE EXPECTED ROW — ABORT, nothing written.');
  console.error('saw: ' + orig.slice(0, 120));
  process.exit(1);
}
if (!lines[6].startsWith('🧰🛠️ **F-2676-1 — CURED s2677')) {
  console.error('ROW 7 IS NOT THE CURE ROW — ABORT, nothing written.');
  process.exit(1);
}

const retired =
  '🧰 ✅ RETIRED s2681 (fire, 2026-09-25) — F-2676-1 is CURED (s2677) and this duplicate row is superseded by the cure row directly below; kept, never deleted (Retention Law, CLAUDE.md §4.10b). ' +
  '**WHY IT MATTERED:** it sat at BACKLOG line 6 — the first screen every fire reads — advertising a cured defect as fire-authorable work, the Ghost Line shape (CLAUDE.md §5.5); the next fire to trust it would have spent its cycle re-curing a guard that is already correct. ' +
  '**VERIFIED IN CODE THIS FIRE, NOT INHERITED:** `scripts/status-line1.mjs:140` reads `const ownStamp = (line) => (line.match(ISO_MIN) ?? [])[0] ?? null` — the FIRST ISO match only — and `assertNoFutureStamp` (`scripts/status-line1.mjs:142`-`157`) checks that single stamp, so this row body’s central claim ("walks EVERY full-ISO match in the line") is FALSE of current main; the cure’s prescribed two-arm test exists as `scripts/status-line1-future-stamp-scope-guard.test.mjs`. ' +
  'The row’s own coordinate had rotted as well — it cites `status-line1.mjs:118`-`126` while the function now lives at 142-157: judge a guard by its CODE, never by a line number. ' +
  '**Prior record (verbatim):** ' +
  orig;

const filed =
  '🧰🔍 **F-2681-1 (s2681 fire, 2026-09-25) — OPEN, fire-authorable: `findings-state-guard.mjs` CANNOT SEE THE GHOST LINES THIS LEDGER ACTUALLY WRITES, AND WAS GREEN OVER A LIVE ONE.** ' +
  'The guard exists for exactly one defect — "a finding cannot be declared both open and closed", because "a reader following the open rows would spend a lane re-fixing shipped work" (its own header) — but `rowState` (`scripts/findings-state-guard.mjs:86`-`97`) admits a row ONLY when its lead is 🟡 (or, in the wide vocabulary, one of 🟠/🔬/🔴/🟢/🟣 plus the word OPEN), or ✅, struck, or bullet-✅. ' +
  'The ledger’s living habit is neither: findings are written 🧰-led and their cures 🧰🛠️-led, with the state in PROSE ("— OPEN, fire-authorable" / "— CURED s2677"). ' +
  '**MEASURED this fire:** the guard returns rc=0 with `double-state: 0` over 664 declared subjects while F-2676-1 sat double-stated at lines 6 and 7 — and F-2676-1 appears NOWHERE in its census, so this is not a missed conflict but an invisible row. ' +
  'A probe reusing the guard’s own exported `rowState()` and `FINDING` (never a re-implementation — F-1261-1) counts **310 state-declaring rows the guard cannot see against 449 it can**, so the blind set is 41% of the corpus (`artifacts/s2681/prose-state-probe.mjs`, output `artifacts/s2681/prose-state-probe.txt`). ' +
  '**THE HONEST RESIDUE, because a probe that over-reports must say so:** of the 6 F-IDs my prose scan flagged as double-stated, only ONE was a true Ghost Line (F-2676-1, retired in this same commit). ' +
  'Three are my probe’s own false positives — F-1131-4 and F-1132-2 say "NEITHER SHIPPED NOR OPEN", a NEGATION the regex read as both claims, and F-2298-1 matched "LANDED" inside "FRESHLY-LANDED"; F-1529-2’s closure actually belongs to the neighbouring F-1531-2 row that merely CITES it (the incidental-F-ID trap the guard’s header already warns about); and F-E3CF-4 is a DELIBERATE documented successor fork ("GIVEN ITS OWN ROW s2087"), owner-gated, not a defect. ' +
  'So the true population is small — but it was not zero, and the guard reported zero. ' +
  '**CURE (fire-authorable, small):** admit 🧰 into the OPEN set and a prose `CURED s<N>` form into the CLOSED set, both behind the EXISTING wide vocabularies so the default narrow census stays byte-comparable with every reported figure; add the two discriminators my probe lacked (skip a state word governed by NEITHER/NOT, and require the F-ID to be the row’s SUBJECT id rather than any id in the 90-char zone); two-arm test beside the existing guard tests. ' +
  '**DO NOT widen CLOSED blindly** — the guard’s header warns that widening CLOSED needs triage, and a false CLOSED silently buries open work, which is the failure direction that costs. ' +
  '**GATE:** the narrow census still reads 664/480/184 after the change.';

lines[5] = retired;
lines.splice(7, 0, filed);
fs.writeFileSync(p, lines.join('\n'));
console.log('row 6 RETIRED   : ' + retired.length + ' chars (original ' + orig.length + ' preserved inside)');
console.log('F-2681-1 FILED  : line 8, ' + filed.length + ' chars');
console.log('total lines     : ' + lines.length);
