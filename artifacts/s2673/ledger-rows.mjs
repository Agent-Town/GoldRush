// s2673 — the ledger edit, in one auditable pass (CLAUDE.md §6: the event and its line
// land in one commit; superseded lines are marked, never deleted).
//
// Two writes:
//   1. F-2671-2's row moves from 🕳️📋 (open) to 🕳️🛠️ (cured) and gains its closure clause.
//      The GLYPH is the state cell — a closure claim added to a row body while the key still
//      reads "open" is a sentence nobody's sweep reads.
//   2. A new row, F-2673-1, at line 1.
import { readFileSync, writeFileSync } from 'node:fs';

const PATH = 'tasks/BACKLOG.md';
const lines = readFileSync(PATH, 'utf8').split('\n');

// --- 1. retire F-2671-2's open key -------------------------------------------------
const i = lines.findIndex((l) => l.startsWith('🕳️📋 **F-2671-2 (s2671 fire 2026-09-24'));
if (i === -1) throw new Error('F-2671-2 row not found under its open key — re-read before writing');

const TAIL = 'UNVERIFIED there and not re-run here.';
if (!lines[i].endsWith(TAIL)) throw new Error(`F-2671-2 row does not end as expected: ...${lines[i].slice(-90)}`);

lines[i] =
  lines[i].replace('🕳️📋 **F-2671-2 (s2671 fire 2026-09-24', '🕳️🛠️ **F-2671-2 — CURED s2673 `12ccef83a` (filed s2671 2026-09-24') +
  ' ✅ **GATE ANSWERED s2673, the first of the two branches it offered rather than the habit-only one:** `status-line1.mjs set` now REFUSES when all three hold — the displaced line carries a desk tail, the new line does not carry it forward intact, and no archive bullet below already holds the displaced line. Any one of those failing means nothing is lost, so the refusal cannot fire on lawful work: carrying the tail onto the lock line never sees it, and `handoff` preserves by construction and is not checked at all. `--allow-desk-drop` covers the one lawful shape the predicate cannot see (a ruled item leaving the tail, fire.md §4) and WARNS rather than going quiet. Both printed remedies ADD words and neither removes any, because this repo has twice been bitten by a guard whose remedy was to corrupt a correct file (`status-archive-audit.mjs:322`, F-2088-2). TEETH: `scripts/status-line1-desk-displacement-guard.test.mjs`, 10 arms / 10 pass, registered in `test:ledger-guards`; arm 1 asserts the CONTROL is valid before arms 2-3 are believed (F-2215-1 — the pre-cure subject accepts the drop and the desk leaves the fixture board), arm 3 asserts the refusal is ATOMIC, and arms 4-7 + 10 are the lawful shapes that must keep passing. Measured against the real 20.5 MB board in a copy (`artifacts/s2673/live-board-probe.mjs`): desk-less `set` rc 1 naming F-2671-2 with the board byte-identical, the same `set` carrying the tail rc 0 with all three items intact. 🔍 **AND THE ROW\'S OWN BLOCKER WAS FALSE — see F-2673-1:** `status-archive-audit.mjs` was never unable to run. Its battery leg answers this board in **5.8 s**. What cost s2670 nine minutes was the BARE invocation walking all 5,857 STATUS.md commits, priced here at 9.7 min; it was working, not hung, and was killed at roughly its own finishing time. This fire\'s archive chain was scored by the instrument, not structurally: CLEAN, 0 permanently absent.';

// --- 2. the new row ----------------------------------------------------------------
const row2673 =
  '🕳️🔍 **F-2673-1 (s2673 fire 2026-09-24, MEASURED — an inherited "the instrument is broken" that was never true, carried by three consecutive handoffs): `status-archive-audit.mjs` RUNS ON THE 20.5 MB STATUS.md IN 5.8 SECONDS. WHAT COST s2670 NINE MINUTES WAS THE *UNBOUNDED* WALK, AND IT WAS KILLED AT ROUGHLY ITS OWN FINISHING TIME.** s2670 reported it "burned nine minutes at 3.5% CPU and produced no verdict"; s2671 carried that forward as "still cannot run on a 20.5 MB STATUS.md"; s2672 carried it again as "unverified for three handoffs", and each reading hardened it from an observation into a property of the tool — the Stale Belief shape (CLAUDE.md §5.4), inherited rather than re-run. **MEASURED HERE, three numbers:** the battery leg `--limit 40 --quiet` answers in **5.8 s, rc 0, CLEAN** over 40 commits; one blob read costs **49.8 ms** at 20.1 MB; history holds **5,857** STATUS.md commits, so the bare invocation — `limit = Infinity` — projects to **9.7 min** of two reads per commit. That projection lands on s2670\'s "nine minutes" almost exactly, which is the evidence that the tool was not hung but WORKING, and was abandoned within a minute of answering. 🚫 **NO CODE CHANGE, AND THE RESTRAINT IS THE POINT:** the tool carries four guard files and its own `--limit` typo analysis (F-2278-1 at `:40-49`), which already records that the unbounded verdict is `rc=1` over **81 legacy drops from before §4\'s archive law had teeth** — known, measured and excused. So the bare run is not merely slow, it is the WRONG QUESTION, and "make it faster" would buy a ten-minute route to an answer already written down. A memo was considered and REFUTED by measurement rather than adopted on plausibility: consecutive STATUS.md commits are usually not parent and child, so over 300 examined commits only **99 of 600** reads repeat — 16.5%, not the 50% the idea assumed. ⚠️ **WHAT IS GENUINELY OPEN, and it is small:** the bare invocation states neither its price nor its known answer; it simply grinds. GATE: either the unbounded walk names its cost and its legacy-debt verdict before starting (or requires an explicit `--unbounded`), or this row is accepted as documented-in-comments-only and says so. Deliberately not cured here — the fire that finds a thing should not also reshape a tool with four guards over it while its own gate is elsewhere, and the correction above is the part that was actually costing anyone anything.';

lines.unshift(row2673);

writeFileSync(PATH, lines.join('\n'), 'utf8');
console.log('F-2671-2 row retired to 🕳️🛠️ at line', i + 2);
console.log('F-2673-1 prepended at line 1');
console.log('total lines now', lines.length);
