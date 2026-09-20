// s1357 — land F-1357-1 and amend every LIVE copy of the rows it changes (s1351's lesson).
import fs from 'node:fs';

const P = 'tasks/BACKLOG.md';
const lines = fs.readFileSync(P, 'utf8').split('\n');

const ROW =
  '🟡 **F-1357-1 (s1357, EXECUTED + RE-DERIVED ON THE LIVE LEDGER — THE ONE ROW BLOCKING THE ' +
  'OPEN-CENSUS CURE IS RETIRED, AND THE BLINDNESS IT EXPOSED IS NARROWER THAN ITS OWN FINDING CLAIMED).** ' +
  'What was owed: F-1351-1 banked candidate (9) = F-1336-5 **STEP 1 ONLY** — *"retire/strike the stale F-1126-2 open row, then the cure"* — with the guard cure itself explicitly out of scope. ' +
  '✓ **RE-DERIVED, NOT INHERITED** (s1336’s arithmetic was 21 fires old): live narrow census **263 subjects / 189 closed / 74 open / 0 double-state**; the proposed bullet-stripped scan **353 / 250 / 104** with **exactly ONE** conflict — `F-1126-2`, closed@2194, open@2171. ' +
  's1336 measured 233→325 subjects, open 58→90, closed 175→236, one conflict; **the ledger grew ~30 subjects and the conflict set did not move.** ' +
  '⭐ **INDEPENDENT CROSS-CHECK BEFORE TRUSTING MY OWN RE-IMPLEMENTATION** (`findings-state-guard.mjs:38-40` warns that a re-implementation of a ledger rule once disagreed with the original on 4 of 14 rows): my probe’s closed count **250** is identical to the SHIPPED `blocker-panel-closed-guard` wide census, which I ran and read — **250**. The probe is not drifting from the one implementation of "closed". ' +
  '✅ **THE ACT:** `tasks/BACKLOG.md:2171` retired in place. **The original row is preserved VERBATIM inside the retirement** (retention law: retire, never delete), and `F-1128-1` + `F-1336-5` were deliberately kept OUT of the 90-char subject zone — **verified by printing that zone before writing it**, not after — so this retirement closes **NOTHING but F-1126-2**. F-1128-1’s own `deploy.sh:74` recommendation stays OPEN and owner-owed. ' +
  '📊 **RESULT: bullet-stripped double-state 1 → 0.** F-1336-5’s stated blocker — *"landing the one-line cure without first retiring [it] would turn `test:node-guards` RED and block the board"* — is **DISCHARGED**. The cure is now a one-line edit whose whole blast radius is open **74 → 103**. ' +
  '⚠️ **AND THE NUANCE, WHICH CORRECTS F-1336-5’S OWN WORDING:** it says a `- 🟡` row *"is admitted as neither open nor closed — it is not seen at all"*. **That is true of the MARKER path only.** `findings-state-guard.mjs:64` reads `if (!lead.startsWith(\'🟡\') && !lead.startsWith(\'✅\') && !struck && !bulletClosed) continue;` — `struck` short-circuits the bullet test entirely, and `struck` is computed from `subject` (`:59-62`), which **never looks at the bullet**. ' +
  '✓ MEASURED, not reasoned: my bullet-led retirement is visible to the **LIVE narrow guard today** — subjects **263→264**, closed **189→190**. ' +
  '🔑 **So the ledger has ALWAYS had a bullet-proof way to CLOSE a bullet-led row; what it lacks is any way to see one still OPEN.** The blindness is **one-directional**, which is precisely why the cure is an OPEN-axis change — the guard’s own header: *"Wide widens CLOSED ONLY, never open."* A fire that had reached for `✅ RETIRED` instead of a bare-marker rewrite could have retired any of these rows at any time. ' +
  '⛔ **NOT TAKEN, deliberately: the guard cure itself.** F-1336-5 (a)/(b) stays an owner/attended call (census correctives are owner-triage-gated, not fire-authorable) and nothing here pre-empts which of the two the owner picks. Probe: `logs/session-scratch/s1357-bullet-strip-census.mjs` (read-only, committed).';

// Insert as the newest row, immediately above F-1356-1.
const at = lines.findIndex((l) => l.startsWith('🟡 **F-1356-1'));
if (at === -1) throw new Error('SUBJECT ABSENT — F-1356-1 row not found; refusing');
lines.splice(at, 0, ROW, '');

// Amend the F-1336-5 row itself so the ledger's own copy records step 1 as done.
const i5 = lines.findIndex((l) => l.startsWith('🟡 **F-1336-5**'));
if (i5 === -1) throw new Error('SUBJECT ABSENT — F-1336-5 row not found; refusing');
lines[i5] += ' ✅ **STEP 1 LANDED s1357 (F-1357-1): the stale F-1126-2 open row is retired and the bullet-stripped double-state is 1 → 0, re-derived on the live ledger.** The blocker quoted above is discharged; **(a)/(b) remain the owner/attended call.** Note also that this row’s *"not seen at all"* is true of the MARKER path only — `struck` (`findings-state-guard.mjs:59-64`) is bullet-agnostic, so bullet-led rows have always been CLOSEABLE; only the OPEN axis is blind.';

// Amend F-1351-1's banked candidate list.
const i1 = lines.findIndex((l) => l.startsWith('🟡 **F-1351-1'));
if (i1 === -1) throw new Error('SUBJECT ABSENT — F-1351-1 row not found; refusing');
lines[i1] += ' 🔄 **CANDIDATE (9) DISCHARGED s1357 (F-1357-1) — step 1 of F-1336-5 landed; do NOT re-take it.** The banked list is now **(10) only** (F-1270-4).';

fs.writeFileSync(P, lines.join('\n'));
console.log(`inserted F-1357-1 at line ${at + 1}; amended F-1336-5 and F-1351-1`);
