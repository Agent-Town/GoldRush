import fs from 'node:fs';

const PATH = 'tasks/BACKLOG.md';
const L = fs.readFileSync(PATH, 'utf8').split('\n');
if (!L[3].startsWith('🔵 **F-1655-1')) throw new Error('anchor moved — re-read the BACKLOG head');

const f3 = [
  '🟢 **F-1655-3 (s1655 2026-08-11, CAUGHT BY MY OWN CLOSING `test:ledger-guards` RUN — CURED THIS FIRE. A GUARD DEFECT, NOT THE MASTER\'S. FACTORY-OPS, NOT AN OWNER QUESTION.)**',
  '`banked-master-preflight-guard` reddened the board naming attended\'s `art-jumper-rotation-regen.md` and instructing *"Retro-fit the FACTORY-CHURN EXCEPTION… before dispatching"*.',
  '🎯 **THE MASTER IS CORRECT AND THE REMEDY WOULD HAVE MADE IT WRONG.** Its line 3 reads *"You are Codex in the ART slot… **No git pre-flight**; no commits; no `src/` edits"* — and the guard\'s predicate was a bare substring test, `/PRE-FLIGHT/i.test(body)`, so **a disclaimer read as a declaration**. The ART slot has no git worktree at all (`worktrees/art/` is absent from `git worktree list` — `scripts/fire.md` §2E ART-SLOT LAW), so a FACTORY-CHURN EXCEPTION about `git status --short` in a lane worktree is a **category error** for it. Retro-fitting the paragraph as instructed would have corrupted a right file to satisfy a wrong test.',
  '📐 **It is F-1551-4\'s shape in a second guard** — *"a NEGATED owner gate is a disclaimer and must NOT flag"* — a lesson `desk-birth-guard` learned and this one never did. **When a guard\'s remedy text tells you to edit someone else\'s correct file, read the predicate before you obey it.**',
  '⚠️ **THE OBVIOUS NARROWING WAS MEASURED AND REJECTED, which is the reusable half.** Requiring the word at line-start drops the art master **and also** `lane-e3-fairground-socket.md`, a genuine banked LANE master whose pre-flight is the heading `## PRE-FLIGHT — DO THESE IN ORDER`: denominator 5 → 3, **one false positive removed and one real subject silently lost** — the F-1539-2 vacuity trap, in the very guard whose header warns about it. The cure scopes the **negation** instead (`/\\bno\\s+(?:git\\s+)?pre-?flight\\b/gi` stripped before the test), keeping every affirmative mention in any form. **Denominator after: 4 checked, 1 excluded** — `lane-e3-fairground-socket` retained.',
  '✅ **Predicate extracted as an exported `declaresPreflight()` and proved by MANUFACTURING each arm, never by a green** (s1299/s1300 standard): the disclaimer arm asserts the OLD predicate still matches *"else this proves nothing"* · affirmative heading/inline/blockquote forms all still declare · a mixed body keeps its affirmative half · and an affirmative pre-flight **without** the cure is still an offender, so the narrowing did not disarm the guard. **6/6 green, in the existing file — no new gate topology.**',
].join(' ');

const f4 = [
  '🟢 **F-1655-4 (s1655 2026-08-11, the second red from the same battery run — CURED THIS FIRE. BOOKKEEPING.)**',
  '`ruling-propagation-guard` reported *"an owner ruling has been recorded but not propagated into tasks/goals.json — `vp-02e-jumper-8way-activation` cites F-1166-1"*.',
  'The owner **RULED F-1166-1 as option (b)** this morning — verbatim *"this is not too much to do, lets fix things when we can"* — recorded as ruling (3) of three in line 1 of this file, and attended executed it well: the leaf was flipped to `superseded` and **both** successors authored (`art-jumper-rotation-regen` in the ART slot, `lane-c-jumper-8way-wiring` banked art-gated).',
  '**What did not land is the leaf\'s own refusal:** it kept `blockClass: "owner-fork"` + a `blockedReason` citing the finding the owner had just answered. **A stale refusal is not cosmetic** — a fire reading that leaf would refuse authorable work as an unanswered owner fork, the exact cost F-1383-1 describes, and it would do so on the very work the owner had just greenlit.',
  '**CURED:** both refusal keys retired into `note_s1655`, with the prior class and reason **preserved verbatim** (nothing deleted — RETENTION LAW; and the `note_s*` family is a first-class closure key for `drain-block-check` / `goal-closure-reason`). Guard now: *"4 findings recorded RULED · 32 goal leaves still refuse work · **0 stale**"*.',
  '💡 **THE PATTERN, and it is the third surface of the same law: an owner ruling lands on EVERY surface the question had.** Attended landed it on BACKLOG and on two new masters and on the leaf\'s `status` — and the leaf\'s *reason* was a fourth surface nobody was looking at. **The s1301 law is what caught it:** the battery runs after the bookkeeping, so it sees what the bookkeeping missed.',
  '➡️ **CONSEQUENCE FOR THE DESK: F-1166-1 is RULED and LEAVES the owner\'s desk (19 → 18).** It is not dropped silently — this row is its closure record.',
].join(' ');

L.splice(5, 0, f3, f4);
fs.writeFileSync(PATH, L.join('\n'));
console.log('OK — F-1655-3 and F-1655-4 spliced; BACKLOG now', L.length, 'lines');
