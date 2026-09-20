// s1521 — insert the F-1521-1 ledger row directly after s1520's F-1520-1 row (same insertion point
// convention s1520 used). Content-anchored, not line-anchored.
import { readFileSync, writeFileSync } from 'node:fs';

const p = 'tasks/BACKLOG.md';
const src = readFileSync(p, 'utf8');
const lines = src.split('\n');

const anchor = lines.findIndex((l) => l.startsWith('- ✅ **F-1520-1 (s1520) — THE UNWALKED SUCCESSOR POINTER IS NOW GUARDED'));
if (anchor < 0) throw new Error('F-1520-1 anchor row not found — refusing to guess a position');

const row =
'- ✅ **F-1521-1 (s1521) — THE SECOND GHOST TELL IS GUARDED TOO, BUT ONLY AFTER PRICING IT CHANGED WHERE THE GUARD HAD TO LOOK (`scripts/stopped-leaf-supersession-guard.test.mjs`, wired into `test:ledger-guards`, now 87 tests).** ' +
's1520 shipped the FORWARD tell (a `stopped` leaf naming a `Successor:` that has shipped) and said plainly it caught only one of two, asking the next fire to **price the other before authoring it**. Priced, and the price was not what was expected. ' +
'⚠️ **THE TELL IS NOT IN `tasks/goals.json` AT ALL.** F-1518-2\'s ghost was an expired *dispatch-time claim* — grep `supersedes nothing`: it lives in `tasks/BACKLOG.md` and `STATUS.md`, PROSE LEDGERS. A parser for it would have to read the handoff corpus and understand future tense, which is the expensive guard s1520 feared. **It is deliberately NOT built.** ' +
'🔄 **INSTEAD THE DIRECTION WAS REVERSED, WHICH TURNED AN ENGLISH PROBLEM INTO A LOOKUP.** `f1452-1`\'s own leaf names `e1-baron-fort-solidity` in its prose, so the predicate needs no tense and no NLP: **a SHIPPED leaf whose strings name a STOPPED leaf.** ' +
'📊 **REPLAYED, NOT ASSUMED — 884 revisions of `tasks/goals.json` since 2026-07-01: 18 distinct pairs ever fire, 11 RESOLVED on their own (the true-positive shape in hindsight), 7 stand today.** It names BOTH known ghosts: `f1452-1-fort-solidity-static-routing → e1-baron-fort-solidity` for **104 revisions, first firing 2026-08-05T18:34 — the moment f1452-1\'s leaf went merged, ~1.7 days and one wasted fire (s1517) before s1518 found it by hand**; and `f1441-2-crossings-keep-their-z → tb-stall-census` for 114, which is F-1519-1. ' +
'📏 **TWO NARROWINGS, BOTH FORCED BY MEASUREMENT AND BOTH LOAD-BEARING.** (a) A forward-loose draft (any non-shipped leaf naming any shipped `.md`) gave 8 candidates of which **6 sat on already-`superseded` leaves** — it mostly re-flags cured work. Dropped. (b) Including `blocked` leaves adds **6 standing false positives and zero real ghosts**; reading `blockClass` explains why — **all 6 blocked leaves are owner-gated** (5 `owner-fork` + `f1328-1` `disputed`, which fire.md §3.0 says to treat as owner-fork). So restricting to `stopped` is not a number-tuned heuristic, it is the statement that **only a fire\'s OWN hold is a fire\'s to re-examine**; widening it re-opens the rf-34 shape. A test locks that narrowness in. ' +
'🤝 **IT ACKNOWLEDGES RATHER THAN REDS, because 7 standing pairs on a board this old are not 7 defects — they are 7 questions already answered in prose.** A guard that reds on all of them every fire is the exact failure mode s1520 named (one fires learn to skip). A stopped leaf now carries `supersessionChecked`: an **object** from referent-id to the reason it does not supersede — an object, not an array, so an ack cannot be a silent tick. All **7 were walked and answered this fire from each referent\'s OWN title on today\'s board**, not inherited. ' +
'🔎 **ONE ACK IS NOT A CLEAN "NO", AND IT IS RECORDED AS SUCH:** `e2-rail-tough-only-bind` (`af232c57`) **partially** discharged `eight-winds-wiring-e2-enemies` — it bound Rail Tough, one of that leaf\'s three E2 enemy slots, and its own title states *"Steam Wrecker + Coal Thief stay unbound (F-1193-3)"*. The leaf stays stopped (its STOP is Coal Thief\'s missing southwest row, an ART gap) **but its remaining scope is two slots, not three** — a fact no prior reader had written down, surfaced by the guard on its first run. ' +
'✅ **PROVEN BY MANUFACTURING THE RED, not by a green (s1299/s1300):** 5 fixture tests execute the violation, ack, blank-ack, array-ack, self-reference and owner-blocked-exclusion branches; the live test reddened on exactly the 7 predicted pairs **before** the acks were seeded and greened after. Full `test:ledger-guards` **87/87** (was 81), run through `node` because the bash allowlist refuses the npm name.';

lines.splice(anchor + 1, 0, row);
writeFileSync(p, lines.join('\n'));
console.log('inserted after line', anchor + 1);
