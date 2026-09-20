// s1542 handoff writer. The desk is carried forward VERBATIM from the s1541
// archive bullet (extracted at /tmp/s1541-desk.txt) rather than retyped, because
// desk-carryforward-guard compares desk N -> desk N+1 by id and a retyped desk is
// where drops come from. I add no owner item: everything this fire found was
// fire-authorable and is closed, so the count stays 24.
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const stamp = execFileSync('date', ['+%Y-%m-%dT%H:%MZ'], { encoding: 'utf8' }).trim();
const desk = fs.readFileSync('/tmp/s1541-desk.txt', 'utf8');

const narrative =
  '\u{1F3AF} **THE BOARD WAS DRY AND THE WALL WAS UP, SO I TOOK THE ONE JOB s1541 LEFT WITH AN EXPLICIT GATE — AND PRICING IT TURNED UP A LIVE DEFECT IN THE GUARD THAT WOULD HAVE JUDGED IT.** ' +
  '\u{1F4CB} **BOARD ON ARRIVAL:** lock CLEARED (s1541 ended 05:30, judged by OWNING COMMIT per §1.3) · **six queues EMPTY** · zero undrained done-moves (newest is still `drained-51b0bc35c`) · `tasks/failed/` all old labelled dispositions · assayer `pending/` EMPTY · **NO DRAIN EXISTED.** ' +
  'Ref sweep run BEFORE accepting the dry verdict (memory law: a dry board can be an unregistered pile): **373 local refs, nothing ahead of main but `archive/*`, `save/*`, `sol/*`, `beauty2/*` and the two legacy `lane/m3`+`lane/m4`** — lanes a/b/c/d all `ahead=0` USABLE. ' +
  '⛔ **CODEX-WALL ACTIVE until 11:00 — no refills, and I did NOT run §2.0’s probe**, same reason as s1538–s1541: the wall is OWNER-WORDED with a fixed lift time, not the rolling-window kind a probe retires early. ' +
  '\u{1F464} **ATTENDED QUIET** since 04:40; the 5 dirty files (`artifacts/agent-seat/*`, 4 generated `logs/*`) are the same regeneration churn s1538–s1541 all declined to bank, and **I declined it too.** ' +
  '✅ **F-1542-2 — s1541’s NEXT(D) DISCHARGED: F-1541-2 PRICED, THEN BUILT (`0dd7a5d0`).** Its GATE demanded the predicate be run over the corpus first and built only at zero false positives. ' +
  '**25 handoff windows (s1517..s1541), 96 rows added to `tasks/BACKLOG.md`, 2 hits — `F-AH-1` and `F-BAL-1` — which are EXACTLY the two items s1541 had found BY HAND and desked. False positives: 0.** ' +
  'An independent instrument reproducing a hand count on the nose is the strongest evidence the predicate is aimed correctly. ' +
  '\u{1F52C} **I did not stop at “yes”: I measured the 2×2 the design left unstated, because a sloppy membership test hides a loose selector.** ' +
  '`loose/forgiving` 20 qualifying → 2 hits (0 FP) · `loose/STRICT` 20 → **4 hits (2 FP)** · `tight/forgiving` 15 → 2 (0 FP) · **`TIGHT/STRICT` 15 → 2 (0 FP) ← BUILT.** ' +
  'The two false positives (`F-FD3-1`, `F-ER02-11`) are rows gated on a DRAIN whose prose merely CONTAINS the word owner — so the selector matches an owner **ACT**, never the word. ' +
  '`scripts/desk-birth-guard.mjs` + 14 arms, rooted as `npm run test:desk-birth` in `test:ledger-guards` and `test:node-guards`, grandfathered with the F-1300-4 timing reason its three siblings carry. ' +
  '\u{1F50E} **F-1542-1 — AND THE PRICING FOUND A LIVE DEFECT I WAS NOT LOOKING FOR: ONE BACKTICK BLINDED **BOTH** DESK GUARDS AT ONCE, IN OPPOSITE DIRECTIONS (`49aa6cfb`).** ' +
  's1529 wrote its desk as ``OWNER`S DESK — 8 awaiting a word.`` — a GRAVE ACCENT, **U+0060**, where the apostrophe goes. Replayed on the real commit (`62586985`) as a fixture, not argued: ' +
  '`desk-declaration-guard` **rc=2 “line-1 is a handoff with no desk header”** (there was one, of 8 correctly-formed items) and `desk-carryforward-guard` **rc=1 “this desk: 0 items · dropped: 7”** — ' +
  '**the guard built to catch dropped items accusing a fire of dropping its entire desk.** ' +
  'ℹ **Sized honestly: both fail SAFE — nothing greened over, no owner item lost.** What was broken is the DIAGNOSIS: an investigator who believes either message never looks at the glyph. That is the false-first-blocker class. ' +
  '\u{1F50D} **AND IT IS UNFINDABLE BY GREP, WHICH IS THE REUSABLE HALF: s1530 NORMALISED the character while archiving s1529’s line-1**, so today’s `STATUS.md` holds **zero** backtick variants and the live file exonerates itself. ' +
  '**A corpus that is rewritten as it is archived cannot be audited from its own latest state.** Cured at **all three** sites incl. `gate-caller-audit.mjs`’s `OWNER_ROUTE` (where the same miss fails **OPEN**; measured first — widening matches **0** live entries, so it is preventive). ' +
  '⚠ **The two findings are coupled, and the order matters: the STRICT column only became usable BECAUSE of F-1542-1** — before that cure the backtick produced a **third, phantom hit**. ' +
  '*A membership test is worth exactly what the desk parser under it is worth*, so the right move was to teach the parser the header, not to loosen the test. ' +
  '\u{1F9FE} **DUTIES, each re-derived.** `test:node-guards` **rc=0, 379 tests / 376 pass / 0 fail / 3 skipped, 181.5s**, run ALONE (s1536’s contamination lesson) · desk-guard arms **39/39**, gate-caller **19/19**, new guard **14/14** · ' +
  '**teeth proven by MANUFACTURING the defect, never by a green**: reverting both regexes reds exactly 3 arms and the files were restored **byte-identical**; the new guard reds **rc=1** naming the row on a real git tree and **rc=0** once desked · ' +
  '**`tasks/goals.json` edited through a serializer PROVED byte-identical on the untouched file first** — a naive `JSON.stringify` reformats it by ~10 KB (the file ASCII-escapes non-ASCII and has no trailing newline), which would have buried a 2-line change in an 850-line diff; the real diff is **+18/-0** · ' +
  '**no playwright, no tsc, stated not skipped silently** — this fire merged no `src/`, so the §3 code battery has no subject · **GZ-01 NO ITEM, deliberately**: guards and ledger rows render nothing to a player · ' +
  '**TK-01 NOT DUE** — `ticker-digest-2026-08-07.md` exists (s1541, `a68da642f`); 08-07 is closed and no merge has landed into it since · **ASSAYER 0** by listing · **ART slot untouched, no audit claimed** · **DEPLOY SKIPPED, not denied** (bookkeeping-only fire; the law exempts it) · **BACKUP PUSHED.** ' +
  'ℹ **One thing I found and did NOT chase, so the next fire does not re-derive it:** `gate-caller-audit` advises “1 baselined orphan now has a caller — `npm:test:release`”. **Pre-existing and not mine** — reproduced at **rc=0 PASS** against the committed `package.json` before any edit of this fire. A baseline-tightening chore, not a defect. ' +
  '➡ **NEXT (A) 11:00, THE WALL LIFTS — REFILL `mp-07a`→lane-b and `mp-07b`→lane-d, ONE PER LANE** (F-1540-1), then f-door-1/f-e2s-1 only after their predecessors DRAIN; both notes sit in the MP-07 ladder itself. ' +
  '**(B) THE DRAIN FIRE SHOULD EXPECT `BOTH-MOVED` on `scripts/gr-sim.mjs` and `public/skill.md` and 3-way graft them, never blind-copy** (F-1541-1, Mistake #15). ' +
  '**(C) LANES a AND c WILL SIT IDLE AT 11:00** while three masters wait behind mp-07a in lane-b’s ladder — s1541 measured the re-homing safe but declined it as an **attended call**, and I agree: it overrides an attended grouping decision made with full circuit context. **Unchanged, still owed to a human.** ' +
  '**(D) THE NEW GUARD HAS NEVER RUN ON A REAL HANDOFF** — it SKIPs on an ACTIVE lock by design, so this fire’s own `test:ledger-guards` is its **first live firing**. If it reds on a future fire for a row that is genuinely not owed to Robin, the escape hatch is `DESK-NOT-OWED: <id> — <reason>`; **prefer that over widening the selector**, and record which row forced it. ';

const lines = fs.readFileSync('STATUS.md', 'utf8').split('\n');
const lock = lines[0];
if (!/^ACTIVE .*s1542 fire/.test(lock)) throw new Error('line-1 is not my lock: ' + lock.slice(0, 80));

lines[0] = 'Last updated: ' + stamp + ' s1542 handoff, lock CLEARED — ' + narrative + desk;
lines.splice(1, 0, '- **s1542 lock line (archived):** ' + lock);

const out = lines.join('\n');
fs.writeFileSync('STATUS.md', out);

// §4's explicit check: the PRIOR handoff must still be archived, exactly once.
const archived = (out.match(/s1541 handoff \(line-1 archive\)/g) || []).length;
console.log('stamp                        : ' + stamp);
console.log('s1541 handoff archive bullets: ' + archived + '  (expect 1)');
console.log('desk items carried           : ' + ((desk.match(/🔺/g) || []).length));
console.log('line-1 length                : ' + lines[0].length);
if (archived !== 1) throw new Error('ARCHIVE DUTY FAILED');
