# Review — f1581-1: a build confirm carries the position it was issued at

- **Slice:** `f1581-1-build-confirm-position` (LANE-C, fire-authored s1581)
- **Branch / tip:** `lane/c` @ `3c89944d7` (`runner(lane-c): lane-c-f1581-1-build-confirm-position.md`)
- **Merge-base:** `5528cab9e` · **Base at merge:** `main` @ `64342d4eb` (9 commits ahead of the merge-base)
- **Merge commit:** `5e32bcc5c187ea95e8c23d8944e028b91d0666dd`
- **Gated in:** detached worktree `worktrees/gate-s1583` (§3.0b custody — see "Custody" below)
- **Gated by:** s1583 fire, 2026-08-09

## VERDICT: MERGED — the defect is cured, and the regression assertion was proved to catch it.

## What it does

F-1581-1: `BuildSystem.confirm(at, position?)`, called with no explicit position, re-ran
`updateGhostPosition()` + `computeValid()` **at execution time**. Because `InputController` deliberately
retains a tap whose down+up fall inside one frame gap, a confirm **rejected at position A** was
re-evaluated one frame later at **position B** and succeeded there — buying a second buildable with no
second keypress.

The runner chose **cure (b)** of the two the master offered: *a confirm whose ghost was invalid at issue
time is discarded, not re-resolved*. Validity is now captured in the **event handler** at first press
(`InputController.onKeyDown` / `onConfirmDown` → injected `canConfirmAtIssue`), exposed as
`confirmAllowedAtIssue`, and consumed at the three confirm sinks in `Game.ts`.

**`tapped` retention is untouched** — the master's hard constraint. Fast taps still produce exactly one
intent; what changed is only whether that intent is *allowed to execute somewhere else*.

## Evidence

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | rc=0, clean |
| `npm run build` | green, `✓ built in 1.31s` |
| **Acceptance — target test, mobile** | **20/20 passed (1.1m)** `--project=mobile-chrome --workers=1 --repeat-each=20` |
| **Acceptance — target test, desktop** | **10/10 passed (35.2s)** `--project=desktop-chrome --workers=1 --repeat-each=10` |
| **Manufactured red (control)** | **5/5 FAILED** — new assertion vs **unfixed** `src/`, `Expected: 1 Received: 2` palisades |
| Full `m2-01-build-menu.spec.ts` | **14/14 passed (1.1m)**, both projects |
| Adjacent battery (9 specs, both projects) | **99 passed / 2 skipped / 0 failed (10.1m)** |
| `npm run test:node-guards` | **rc=0**, whole chain green (incl. `gr-sim` Baron pins) |
| Console / page errors | zero — the spec asserts `errors.consoleErrors`/`pageErrors` empty |
| Viewports | desktop 1280×800 + **mobile 390×844** (both playwright projects run) |

All playwright commands passed `--workers=1` (§3.1).

### The control is the load-bearing evidence

A regression test never seen red is not evidence. In the gate worktree the three `src/` files were
reverted to `main` while keeping the new spec: the assertion failed **5/5 deterministically**, with
`Expected: 1 Received: 2` — precisely F-1581-1's signature (two palisades bought for one press).

⭐ **This is strictly better than the original detector.** F-1581-1 reproduced at **2/10 on mobile,
0/10 on desktop** — an intermittent that a fire could wave away. The new assertion drives the
discontinuous hero move explicitly (`__GR_TEST__.teleport` between the synthetic keydown/keyup and the
next frame) and so fails **5/5, on demand**. A ~20% flake became a deterministic guard.

### Adjacent-suite list: WIDENED from the master's, deliberately

The master named `m1-01-claim-jumpers-death`, `m4-06-embodiment`, `task-025-bandits-dont-swim` — that
list was written **before** the cure was chosen. Cure (b) gates `confirmAction()` and
`multiplayerSampleActions()`, which serve **every** confirm sink: build placement, assay office,
megaproject funding, demolish. So the battery added `bt-00-demolish`, `m1-05-sentry-beacon-build`,
`m2-02-sluice-and-stockpile`, `bt-01-tiers`, `lane-c-activations-assay-office`,
`task-037-assay-bench-ungate`. Two of those exercise exactly the paths most at risk and passed:
`bt-01-tiers:205` ("Enter tears down after clicking upgrade…") and `task-037:202` ("mobile touch
confirm opens and closes the bench…"). *A review's adjacent-suite list is perishable; the master's was
correct for the defect and incomplete for the fix.*

## Merge classification

Clean `--no-ff` merge, no conflicts, no graft needed. All four files **LANE-TOUCHED only** — `main`
moved **none** of them across its 9 commits since the merge-base (verified per-file with
`git log <base>..main -- <file>`), which is why the merge was conflict-free.

| File | Class |
|---|---|
| `e2e/m2-01-build-menu.spec.ts` | LANE-TOUCHED |
| `src/core/InputController.ts` | LANE-TOUCHED |
| `src/game/Game.ts` | LANE-TOUCHED |
| `src/systems/BuildSystem.ts` | LANE-TOUCHED |

Firewall respected exactly: 4 files, all on the TOUCH-ONLY list. No new `e2e/*.spec.ts` was created
(scope 3's explicit instruction — the assertion went into the existing spec).

## Custody (§3.0b)

A live attended session (`claude --resume … --dangerously-skip-permissions`, pid 14691) had **this repo
root as its cwd** for the whole gate. That is exactly the F-1295-1 hazard — a concurrent broad `git add`
can commit undecided content out from under a HOLD verdict, and no probe the gating fire holds can
detect it. So the merge was built and gated in detached worktree `worktrees/gate-s1583`, and `main`'s
working tree was never touched with undecided content. `main` was verified unmoved (`64342d4eb`) and the
gate branch's first parent verified identical to it immediately before a **`--ff-only`** fast-forward, so
the merged tree is byte-for-byte the tree that was gated.

## Findings

**F-1583-1 — NON-BLOCKING, no corrective owed.** Cure (b) moves two side effects out of the frame loop
into the DOM event handler: `captureConfirmValidity()` calls `updateGhostPosition()`, assigns
`this.valid`, and on rejection sets `lastConfirmFailure='invalid'` and calls `invalidBuild()`, which
plays the `'invalid'` sound. Net player-facing behaviour is unchanged and arguably improved — still
**exactly one** invalid cue per rejected press (the frame-side path now early-returns instead of
re-emitting it), delivered up to one frame *earlier*. Recorded because it is a real relocation of
audio/state work from the fixed-step loop into an input callback, and a future reader tracing an
`'invalid'` cue should know where it is now emitted from. No sim state is written on that path.

**Not a finding, stated to close it:** the gate on `multiplayerSampleActions` reads local input state,
but that function samples the **local** player only (it uses `this.localActor` and mints the action
before broadcast), so no remote intent is judged by local state and the serialized lockstep/replay shape
is unchanged. Verified by reading the function, not inferred from the diff.

**Left open by the slice, honestly:** the mobile-vs-desktop asymmetry (~20% vs 0/10) remains
**UNMEASURED**. The runner did not assert a cause, and neither does this review. The cure makes the
asymmetry moot for this defect; it does not explain it.

## Reporting caveat

`run-node-guards.mjs` writes no log file and its per-test tally did not survive this fire's capture, so
the chain's **rc=0** is what is claimed here — not a test count. The runner's report cites 410/410 on
pinned Node 26.4.0; that is *its* measurement and is not restated as mine. The gate signal is rc=0 for
`test:node-guards` end-to-end, including the chained ledger leaves (`findings-state`, `blocker-panel`,
`ruling-propagation`, `desk-declaration` SKIP-on-lock, `nul-audit` CLEAN).
