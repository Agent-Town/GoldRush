# Task assay-auto-tape: a qualifying run's tape saves itself (lane-b, prefix "fix:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-b.
READ FIRST: AGENTS.md; **`specs/agent-play/assay-worker.md` slice 1b (owner ruling Q1, verbatim inside)**; `src/game/Game.ts:6495-6543` (the standings POST — `runTapeRecorder?.snapshot(...)` → `...(submittedTape ? { tape } : {})`), `:6425-6434` (`startRunTape()` constructs the recorder), `:1134`; `src/game/RunTape.ts` (recorder, `submittedRunTape`, 64KB shape).

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: content already on main (verify git log/diff) = SAFE DUPE → `git checkout -B lane/lane-b main && git clean -fd`, PROCEED. STOP only if an ahead commit is NOT on main or the worktree holds uncommitted edits you did not make. EVIDENCE-ARTIFACT EXCEPTION (F-1266-1): `artifacts/**`/`reviews/shots-*`/`.png` never a STOP — discard, list, proceed. Then `npm install --no-audit --no-fund`; `npm run build` green. Cleanliness line with the FACTORY-CHURN EXCEPTION (F-1407-1): (a) `logs/**`; (b) `artifacts/**`/`reviews/shots-*`/`.png` — expected, proceed; STOPs: modified tracked `src/**`,`scripts/**`,`e2e/**`,`tasks/**`,`specs/**`,`reviews/*.md`.

## Why (owner ruling, 2026-08-15, verbatim)
*"well, the creation of a tape is still a button press at the end of the human play, so if someone forgets to press it, then they are out? I think we then will have to include logic to save the tape automatically if the run qualifies for the leaderboard."* Under the new assay law (no tape → no rank), a forgotten button must never cost a legitimate rank. VERIFIED so far (attended): the POST already attaches a tape WHEN `runTapeRecorder` produced one (`Game.ts:6510-6537`); `startRunTape()` (`:6425`) arms the recorder — what is NOT yet verified is when `startRunTape` runs (every run? behind a setting/action?) and what the owner's "button" actually gates (recording? the local shelf save? the submission?).

## Scope
1. **MEASURE FIRST (report before changing anything):** find every caller of `startRunTape()`; determine for a plain browser run (a) whether the recorder is armed without any player action, (b) whether the standings POST would carry a tape without any button press, (c) what the end-of-run "save tape" button actually does (local reel shelf vs submission). Name file:line for each.
2. **Close the gap the measurement exposes**: whatever the trigger topology, the OUTCOME the ruling requires is — **every run whose score would enter the county board carries its tape in the standings POST automatically, zero player action**. If the recorder is conditionally armed, arm it unconditionally for board-eligible play; if snapshotting is button-gated, snapshot automatically at the qualifying run's end. The manual button keeps its current behavior for the local shelf. Non-qualifying runs: unchanged behavior.
3. **Honesty + bounds unchanged**: the existing 64KB cap and `submittedRunTape` shape untouched; the player-facing copy about what is sent (anonymous input-log) stays accurate wherever it appears.
4. **e2e** — `e2e/assay-auto-tape.spec.ts` (new): with the network stubbed, a secured qualifying run POSTs a body WHOSE `tape` IS PRESENT with no button interaction (the owner's exact scenario); the recorder-off/non-qualifying path posts without a tape and without errors.

## Firewall
Touch ONLY: `src/game/Game.ts` (recorder arming + submit path), `src/game/RunTape.ts` ONLY if a snapshot hook genuinely requires it (prefer not), the new e2e spec.
NO changes to: `functions/api/**` (the server law is assay-cf-lifecycle's job); the tape schema/cap; the local reel shelf UX beyond keeping the button working; scoring/ranking; existing e2e assertions.

## Self-check
tsc + build green. New spec green desktop+mobile at `--workers=1`. Adjacent `task-025` + `m1-01` + `m2-01` unmodified-green. Zero console/page errors plain boot. Report the §1 measurement table (callers, trigger topology, what the button really did) BEFORE the diff summary.
End: READY-FOR-GATES + report: measurement table, the gap found, the minimal change made, spec counts.

## No-op / honesty guard
If §1 proves the tape ALREADY auto-attaches for every qualifying browser run (the button is only the local shelf), WRITE WHY, add the e2e that pins it (the regression guard is still owed), and make no product change — the measurement + guard IS the deliverable then.
