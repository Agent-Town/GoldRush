// Build s2674's handoff line 1: the report, then the OWNER'S DESK tail carried VERBATIM.
// The tail is sliced from the live line 1 (my lock line, which already carries it), never
// retyped -- a composed desk drops what a carried desk keeps.
import fs from 'node:fs';

const s = fs.readFileSync('STATUS.md', 'utf8');
const line1 = s.slice(0, s.indexOf('\n'));
const deskIdx = line1.indexOf('\u{1F53A} **OWNER' + String.fromCharCode(39) + 'S DESK');
if (deskIdx < 0) throw new Error('desk header not found in line 1 -- STOP, do not write');
const deskTail = line1.slice(deskIdx);

const body = [
  'Last updated: {STAMP} s2674 handoff, lock CLEARED —',
  '\u{1F6E0}️ **THE OLDEST OPEN GATE IS CLOSED: THE UNBOUNDED `status-archive-audit` WALK NOW STATES ITS PRICE BEFORE IT SPENDS IT — 247 ms TO THE PRICE TAG, AGAINST ~10 MINUTES OF SILENCE THAT COST THREE HANDOFFS.**',
  'F-2673-1 CURED (`cdcb52a0a`), the gate my predecessor named as next and small.',
  '① **THE CURE:** a bare run (no `--limit`) now prints its corpus, a SELF-TIMED price and the answer already written down, before reading a commit — `5,859 commits; 20.1 MB; ~51 ms per blob read x 2 = ~10.0 min; ends rc=1 over ~81 legacy drops predating §4’s archive law, known and EXCUSED`.',
  'Because it times ITSELF it re-derived s2673’s three numbers independently instead of hardcoding them (5,859 vs 5,857 commits, 51 vs 49.8 ms, 10.0 vs 9.7 min) — an inherited measurement CONFIRMED by re-running, not carried.',
  '② **THE GATE OFFERED A SECOND BRANCH AND I DECLINED IT ON MEASUREMENT: "requires an explicit `--unbounded`" WOULD HAVE REDDED TEN ARMS ACROSS TWO GUARDS.**',
  'The BARE form is the test suite’s own contract — `status-archive-empty-corpus-guard` drives the tool bare in 8 of its 9 arms (including all three CANNOT VERIFY route arms) and `status-archive-arg-guard` arm 7 does the same.',
  'A required flag would have broken lawful callers to fix a diagnostic that costs nothing to print: F-1460-1’s road, where a guard that reds on lawful use gets excused into uselessness. Announcing is additive and arm 12 PROVES it — strip the announcement and rc and the verdict line stay byte-equal.',
  '③ **ONE TRAP FOUND WHILE CURING, and it is this repo’s own shape:** the sample read that times the projection must NOT go through `blobOf`, because `blobOf` increments `blobFailures`, the discriminator for the `blobs-unreadable` refusal route — timing a read through it would let a DIAGNOSTIC move the instrument’s VERDICT. It swallows its failure into a local null and prints UNKNOWN rather than guessing.',
  '④ **THE FILE’S OWN POINTER NOTE CAME TRUE A FOURTH TIME, exactly as written:** my insertion moved the `:221`/`:322` pair; `source-pointer-guard` flagged only the FIRST member (a range is two pointers and one of them is guarded); the second moved TWICE MORE while I wrote the note about it (403 → 406 → 407). Both re-based by RE-GREPPING after the last edit, never by a remembered delta.',
  '\u{1F6A8} **AND A REAL DROP WAS PREVENTED IN THIS FIRE, BY THE TOOL’S OWN DOCUMENTATION:** my lock commit used `status-line1.mjs set`, which does NOT archive, so **s2673’s 5,757-char handoff line survived this fire in git alone** and would have been PERMANENTLY LOST had I died mid-run.',
  'Recovered from `7d44378d2^` and put back on the board as a bullet before this handoff (`artifacts/s2674/recover-s2673.mjs`, verified absent first with the tool’s own `archivedBelow` predicate). ⚠️ **NEXT FIRE: at LOCK time prefer `handoff <file> "s<N-1> handoff"` over `set`** — `status-line1.mjs:186-188` prescribes exactly this and I did not take it; carrying the desk tail (which I did do) protects the DESK but not the predecessor’s LINE.',
  '\u{1F4CB} **EVIDENCE:** ledger battery rc 0 in 205.8 s BEFORE this commit (F-E1T-2); 12/12 `status-archive-arg-guard` (arms 10-12 new); 39/39 across the four archive guards = the pre-cure baseline exactly; `source-pointer-guard` PASS. Preamble transcript `artifacts/s2674/prove-preamble.mjs`.',
  '\u{1F4CA} **BOARD, and the word earned before it was used:** `dry-board-probe` **0 real drains** / 13 closed / 49 cosmetic ghosts; `lane-usable --all` every lane `ahead=0` (a, b, c, d); all six queues empty; `tasks/running/` empty; `tasks/CODEX-WALL` still UP (mtime 09-24 12:14) so §2E refill stayed suspended and I dispatched, re-queued and refilled NOTHING.',
  '\u{1F5D3}️ **DUTIES:** LB-01 discharged (`ledger-2026-09-24.db` already present for the UTC coverage day; exposure gate CLEAN over 1,486 keys in 32 mirrors, 0 account-class; archive branch UNCHANGED, no push owed). FM-01 discharged (fire-memory mirror unchanged). RT-01 NOT DUE — r2026w39 is the live rotation (opens 09-21, closes 09-28) and w40’s window opens Sunday 2026-09-27 00:00 UTC. GZ-01 ticker digest NOT DUE — digests run unbroken to 2026-09-23 and the 09-24 digest is owed by the first fire after 06:00 local today (it is 00:5x local now). GZ-01 news: my landing is SCRIPTS-ONLY, so no candidate and no dismissal is owed. Assayer queue EMPTY; ART-SLOT not owed.',
  '✅ **VERIFIED, NOT INHERITED (Mistake #4):** the lock I took was free (line 1 read `lock CLEARED`, `tasks/.fire.lock` mtime 00:48 was THIS fire’s own dir, `logs/fire-20260925.log` shows `FIRE START` at 00:48:26 and s2673’s `FIRE END rc=0` at 23:48:22); s2673’s claim that CODEX-WALL is up — re-checked, file present; s2673’s three F-2673-1 numbers — re-derived by the cure itself.',
  '➡️ **NEXT FIRE:** board is DRY and the wall is UP, so there is no drain and no refill to take — keep the heartbeat duties and DO NOT invent scope (§2F). The 09-24 ticker digest is the first real duty after 06:00 local. The oldest open gates now sit with the owner, not with us: the desk below is unchanged at 3 items, none ruled this fire. ',
].join(' ');

fs.writeFileSync('artifacts/s2674/handoff-line.txt', body + deskTail + '\n');
console.log('deskTail bytes', deskTail.length, 'total', (body + deskTail).length);
