// s1655 one-shot: splice the F-1655-1 row into BACKLOG.md's top finding block.
import fs from 'node:fs';

const PATH = 'tasks/BACKLOG.md';
const L = fs.readFileSync(PATH, 'utf8').split('\n');

if (!L[2].startsWith('🟢 **F-1654-1')) throw new Error('anchor row moved — re-read BACKLOG head before splicing');
if (L.some((l) => l.startsWith('🔵 **F-1655-1'))) throw new Error('F-1655-1 row already present');

const row = [
  '🔵 **F-1655-1 (s1655 2026-08-11, FOUND BY A LAWFUL STOP AND THEN RE-MEASURED TEN TIMES BIGGER. FACTORY-OPS, CORRECTIVE QUEUED — NOT AN OWNER QUESTION.)**',
  'The `f1643-2` dispatch of 11:42:59 ended in ~4 minutes with **zero diff** — its own master\'s STOP condition firing exactly as designed, not a failure, and not a Silent No-Op (Mistake #1: it wrote WHY, at length).',
  'Its finding, verbatim: *"[suite-red-inventory.mjs](scripts/suite-red-inventory.mjs:355) overwrites the report without preserving `## Corrections since the snapshot`… the reducer must be fixed in a separate authorized task first."*',
  '✅ **VERIFIED INDEPENDENTLY, NOT INHERITED (Mistake #4):** `scripts/suite-red-inventory.mjs` contains **zero** occurrences of `Corrections`, `readFileSync(output` and `existsSync(output`. No code path reads the existing report; the `lines` array is built fresh and written at `:355`.',
  '📊 **THE STOP FOUND ONE SECTION. THE AUTHORING RE-MEASUREMENT FOUND TEN.** The reducer emits six body headings; the live `logs/suite-red-inventory.md` carries **sixteen**. The other ten are hand-authored durable findings accumulated across ~14 fires (s1196 · 2026-07-29 harness provenance · F-1212-2 · s1216 · s1223 · s1224 · s1304 · F-1424-4/s1425 · the 2026-08-11 aborted-refresh record) totalling **291 of 844 lines — 34.5% of the file** — and the next legitimate reduce erases all of them.',
  '🔑 **IT IS LOAD-BEARING, AND THAT WAS CHECKED RATHER THAN ASSUMED:** `scripts/red-inventory-lookup.mjs:170` parses the corrections table by its exact header `| Spec file | Test title | Measured | Finding | Correction |`, and its `:161–167` comment states the doctrine in the codebase\'s own words — *"The snapshot is NOT rewritten (that would launder a real drift); corrections are additive and printed FIRST, where the misreading happens"* — and is **deliberately fail-closed**, because *"a guard that fails OPEN reports a clean board"*. The report\'s own preamble says the same: *"ADDITIVE ONLY… overwriting an observation that was true when taken launders history and hides the drift itself."*',
  '➡️ **So the file states a law, a live instrument depends on it, and the only tool that writes the file violates it.** ⓘ The sibling `scripts/suite-red-inventory-compact.mjs` was checked and is **NOT** affected (it compacts the raw JSON at `:51`, a different subject) — the master says so explicitly, to stop a well-meant fix-the-class edit.',
  '⚠️ **This is COMPACTION OF A TRACKED FILE, so it is not a RETENTION LAW violation** (git keeps every version) — but it is exactly the silent history-laundering the file\'s own prose forbids, and it happens at the moment nobody is watching: inside a routine refresh.',
  '**CURE QUEUED:** `tasks/lane-a-f1655-1-inventory-corrections-preservation.md` (lane-a, FIRE-AUTHORED s1655) rules the preservation contract rather than leaving it open — generated-set derived from the code being edited, non-generated sections preserved **byte-for-byte**, placement anchored on `## Failing tests`, absent-output = today\'s behaviour, and a **loss guard that fails CLOSED, writing nothing**. Tests land in the **existing** `scripts/suite-red-inventory.test.mjs` (already rooted in `test:node-guards`) — deliberately no new gate file, because a new one reds `gate-caller-audit` as a gate with no caller, the trap s1654 hit. Scope 3 demands RED-then-GREEN per test: a passing test never executes its violation path.',
  '🚫 Its firewall makes writing the live `logs/suite-red-inventory.md` a **hard STOP** — doing so would destroy the 291 lines before the fix protecting them has been reviewed.',
  '**GATE: closes when the corrective merges and a scratch re-reduce of `logs/suite-red-inventory-compact.json` over a copy of the live report still shows all ten non-generated headings, the literal `F-1587-1`, and the corrections table header.**',
].join(' ');

const knockOn = [
  '⏳ **F-1655-2 (s1655 2026-08-11, the knock-on — bookkeeping, no action owed beyond the sequence).**',
  '`f1643-2-suite-red-inventory-refresh` is recorded `status: "blocked"`, **`blockClass: "gate-side"`** — a fire-recorded readiness hold, **NOT an owner fork**, so per F-1383-1 it must **never** be carried to the OWNER\'S DESK, where it would park forever.',
  '⚖️ **It does NOT reverse the owner\'s THROTTLE LAW ruling** (line 1 of this file), which attended executed correctly at `19640717b`; the master\'s `nice -n 19 --workers=3` invocation is right and needs no edit. The run stopped for an unrelated technical reason discovered *during* its pre-flight.',
  '**TO RESUME, once F-1655-1 merges:** `cp tasks/lane-a-f1643-2-suite-red-inventory-refresh.md tasks/queue/lane-a/` and flip the leaf back to `queued`.',
  '💡 The sequence is the point: the refresh would have **rewritten** the very file whose ten addenda are the factory\'s accumulated knowledge about its own reds. It is worth the wait.',
].join(' ');

L.splice(3, 0, row, knockOn);
fs.writeFileSync(PATH, L.join('\n'));
console.log('OK — 2 rows spliced at BACKLOG line 4-5; file now', L.length, 'lines');
