// s1542 — inserts the two finding rows at the head of tasks/BACKLOG.md.
// Written as a file rather than a -e one-liner because the rows quote backticks.
import fs from 'node:fs';

const P = 'tasks/BACKLOG.md';
const lines = fs.readFileSync(P, 'utf8').split('\n');

const R1 =
  '✅ **F-1542-1 (s1542 2026-08-08, FOUND WHILE PRICING F-1541-2, CURED THE SAME FIRE — ONE BACKTICK MADE **BOTH** DESK GUARDS BLIND TO A WELL-FORMED DESK, AND EACH FAILED WITH A DIFFERENT WRONG DIAGNOSIS).** ' +
  's1529 (`aab5dfb3`) wrote its handoff desk as ``OWNER`S DESK — 8 awaiting a word.`` — a GRAVE ACCENT, **U+0060**, where the apostrophe goes. ' +
  "The s1472 cure enumerated four spellings (`OWNER DESK` 243 · `OWNER'S DESK` 484 · curly `OWNER’S DESK` 15 · `OWNERS DESK` 9); this is a fifth. " +
  '⚠️ **BOTH consumers of that literal went blind at once, in OPPOSITE directions** — REPLAYED on the real commit as a fixture, not argued: ' +
  '`desk-declaration-guard` **rc=2, "line-1 is a handoff with no desk header"** (there was one, of 8 correctly-formed items), and ' +
  '`desk-carryforward-guard` **rc=1, "this desk: 0 items · dropped: 7"** — `deskTail()` returns null, `deskItems(null)` returns `[]`, so `live` is empty and ' +
  '**the guard built to catch dropped items accused a fire of dropping its entire desk.** ' +
  'ⓘ **SIZED HONESTLY: both fail SAFE in direction — nothing was greened over and no owner item was lost.** What was broken is the DIAGNOSIS: ' +
  'an investigator who believes either message goes looking for a missing header or a careless fire, and never looks at the glyph. That is the ' +
  'false-first-blocker class, and it is why this sat unfound. ' +
  "🔍 **AND IT IS UNFINDABLE BY GREP, WHICH IS THE REUSABLE HALF: s1530 NORMALISED the character while archiving s1529's line-1**, so today's " +
  '`STATUS.md` contains **zero** backtick variants and the live file exonerates itself. It was recovered only by replaying the handoff commits. ' +
  '**A corpus that is rewritten as it is archived cannot be audited from its own latest state.** ' +
  '✅ **CURE (`a4ba9b0e`): the spelling set is five at ALL THREE sites** — `desk-declaration-guard.mjs`, `desk-carryforward-guard.mjs`, and the sibling ' +
  '`gate-caller-audit.mjs` `OWNER_ROUTE` (where a miss fails **OPEN** — an escalation simply not checked for a ledger row — which is why nothing ever ' +
  'complained; measured on the live baseline: widening matches **0 new entries**, so it is preventive and changes no verdict today). ' +
  '**Proved by MANUFACTURING the defect:** reverting both regexes reds exactly 3 arms (the two new GROUND-TRUTH replays + the widened spelling loop), ' +
  'files restored byte-identical; cured, **39/39** desk-guard arms and **19/19** gate-caller arms green. ' +
  '**GATE: closed — no live desk parser now misses a spelling a fire has actually written. If a sixth appears, add it; do NOT relax to a wildcard ' +
  'separator, which would let `OWNER-DESK` (41 occurrences, all prose) supply the desk tail.**';

const R2 =
  '✅ **F-1542-2 (s1542 2026-08-08) — F-1541-2 PRICED AS ITS GATE DEMANDED, THEN BUILT: `desk-birth-guard`, 0 FALSE POSITIVES OVER 25 HANDOFF WINDOWS.** ' +
  "F-1541-2's GATE read *\"the next non-dry fire PRICES it first — run the predicate over the last ~20 handoffs and report its hit list — and only builds " +
  'it if the false-positive count is 0."* **Discharged.** ' +
  '📊 **THE HIT LIST (25 windows, s1517..s1541, 96 rows added to `tasks/BACKLOG.md`): 2 hits — `F-AH-1` (s1538) and `F-BAL-1` (s1540) — and they are ' +
  'EXACTLY the two items s1541 had found by hand and desked.** An independent instrument reproducing a hand count on the nose is the strongest evidence ' +
  'the predicate is aimed correctly. **FALSE POSITIVES: 0.** ' +
  '🔬 **BUT THE PRICING DID NOT STOP AT YES — IT MEASURED THE 2×2 THE DESIGN LEFT UNSTATED**, because a sloppy membership test hides a loose selector: ' +
  '**loose/forgiving 20 qualifying → 2 hits (0 FP) · loose/STRICT 20 → 4 hits (2 FP: `F-FD3-1`, `F-ER02-11`) · tight/forgiving 15 → 2 (0 FP) · ' +
  'TIGHT/STRICT 15 → 2 (0 FP) ← BUILT.** The two false positives are rows gated on a DRAIN or on being fire-authorable whose prose merely CONTAINS the ' +
  'word owner — so the selector matches an owner **ACT** (`owner word|answers|rules|picks|verdict|…`, `GATE: OWNER`, `closes on an attended or owner ' +
  'ruling`), never the word. ' +
  "⚠️ **AND THE STRICT COLUMN ONLY BECAME USABLE BECAUSE OF F-1542-1, MEASURED THE SAME FIRE:** before that cure the backtick made s1529's desk " +
  'unreadable and produced a **third, phantom hit**. *A membership test is worth exactly what the desk parser under it is worth* — the right response ' +
  'was to teach the parser the header, not to loosen the test. ' +
  "ⓘ **s1533's REFUTATION MET, NOT IGNORED:** it rejected a ledger↔desk check at a 23% false-positive rate from KEY DRIFT across desks. This guard never " +
  're-keys an old item — it looks only at rows BORN in the window, which have no prior desk key to drift from — and s1533 measured **fire-authored** rows, ' +
  'while the population that actually leaks is **attended** sessions, who file rows and never compose a desk. ' +
  '✅ **BUILT (`b59aad1d`): `scripts/desk-birth-guard.mjs` + 14 arms, rooted as `npm run test:desk-birth` in `test:ledger-guards` (gate) and ' +
  '`test:node-guards` (arms), grandfathered in `gate-caller-baseline.json` with the F-1300-4 timing reason its three siblings carry.** ' +
  'Teeth proven by manufacturing the defect on a real git tree (**rc=1** naming the row, **rc=0** once desked) and by replaying the real s1540→s1541 ' +
  'event: of the seven attended rows filed 2026-08-08 it qualifies **exactly the two** that carried an owner word and leaves the six fire-actionable ones ' +
  'alone. Escape hatch `DESK-NOT-OWED: <id> — <reason>`, scoped 400 chars like `DESK-DROPPED`. ' +
  '**GATE: closed. The next attended-filed owner fork reaches a desk or reds the fire that missed it.**';

lines.splice(1, 0, R1, R2);
fs.writeFileSync(P, lines.join('\n'));
console.log('inserted:');
console.log('  ' + lines[1].slice(0, 78));
console.log('  ' + lines[2].slice(0, 78));
