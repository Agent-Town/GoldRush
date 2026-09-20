import { readFileSync, writeFileSync } from 'node:fs';

const p = 'STATUS.md';
const lines = readFileSync(p, 'utf8').split('\n');
const prev = lines[0];
const stamp = '2026-08-05T20:54Z';

const line1 = [
  `Last updated: ${stamp} s1460 handoff, lock CLEARED —`,
  'TOOK OVER s1459 DEAD LOCK (Execution error, no FIRE END in logs/fire-20260805.log; its drain 0c7ddcf7 + bookkeeping 378bf61a were COMPLETE and verified, nothing stranded).',
  'NO DRAIN EXISTED — board drain-dry at lock time, all six queues empty.',
  '🟥 **F-1460-1: the Baron gr-sim red is NOT the cross-engine class — it is a REAL unpinned sim change, still RED on main.**',
  'The row it corrects closes "= the F-1403-1/F-1404-2 cross-engine class". PRE-EXISTING is CONFIRMED (re-measured RED at 57097d8a — s1458 was RIGHT that 3b7abe4e did not cause it), but CROSS-ENGINE is REFUTED:',
  'that class MEANS two engines disagreeing, and they do not — Node 26.4.0 AND Node 23.11.1 both return kills 861 / fnv1a32:36004eab BYTE-IDENTICAL, both disagreeing with the PIN (869 / b9566c6d).',
  'Bisected with an instrument validated on a known-GREEN and a known-RED commit FIRST: first bad = **e788002c** (runner output of f1452-1 fort-solidity — gates the stuck-watchdog on route.blocker in src/entities/Enemy.ts, +139/-31 src/systems/BuildSystem.ts).',
  'Changed routing, changed engagement, 8 fewer kills over 20 waves — so **861 is very probably CORRECT and merely unpinned**; f1452-1 was deliberate and spec-green but reached main via the recovered-orphan drain 8e5b5608 whose evidence reads "4/4 own specs both projects", a cross-cutting sim change gated only on its own specs.',
  'A red wearing an excused class label is a red nobody investigates: test:node-guards has been red on every fire since 2026-08-04.',
  '**F-1460-2 (my own bug, kept as the lesson):** my FIRST bisect probe tested grep -E for pass-1 against node:test output whose marker is a 3-byte UTF-8 glyph, so under the fire locale it matched NOTHING, every commit reported BAD, and bisect converged on a commit touching only artifacts/ + tasks/ + goals.json with an EMPTY src/ diff.',
  'Caught only because that answer was impossible; the broken probe is retained beside the good one as an epitaph.',
  '✅ **s1454-(C) stale-HOLD guard: VERIFIED DISCHARGED, NOT OWED** — s1455 built AND wired it before dying (519b9722; scripts/stale-hold-verdict-guard.test.mjs, registered in test:ledger-guards, 6/6 green here). THREE fires carried it forward as STILL OWED — do NOT rebuild it.',
  'Also landed: 5 verified-shipped done-moves ghost-renamed (ancestry + file-probe, not message-grep), dashboard/stats churn + three queue consumptions committed.',
  '⚙️ **RUNNER IS LIVE — lane-a (e2-pressure-socket), lane-b (er01-e6-census), lane-d (er01-e5-census) BUSY; an attended session queued an ER e3–e6 census batch DURING this fire. All queues empty by consumption, NOT by starvation — do NOT refill over them.**',
  'NEXT: **(A)** the F-1460-1 corrective, fire-authorable — re-pin scripts/gr-sim.test.mjs:393 to 861 / fnv1a32:36004eab with a comment citing e788002c (the cause is NAMED, so this is not a blind re-pin), AND add npm run test:node-guards to the drain battery for any slice touching src/entities, src/systems or src/sim;',
  '**(B)** drain the four ER census runs (e3/e4/e5/e6) as they land;',
  '**(C)** ER-02 stays gated on (A) — specs/e2-readiness/README.md makes it depend on ER-00 determinism, and the Baron driver pin is currently the thing failing.',
  'Full write-up + both probes: artifacts/s1460/README.md.',
].join(' ');

lines[0] = line1;
lines.splice(1, 0, `- **s1460 lock line (archived):** ${prev}`);
writeFileSync(p, lines.join('\n'));
console.log('handoff written, line-1 length', line1.length);
