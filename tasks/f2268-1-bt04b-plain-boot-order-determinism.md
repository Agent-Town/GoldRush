# f2268-1 — bt-04b's "plain boot" test is ORDER-DEPENDENT on mobile-390; make it deterministic (lane-a, prefix "fix:", BUILD-ON-PREDECESSOR)

**FIRE-AUTHORED (attended review welcome)** — s2268, from the gate evidence in
`reviews/f2265-2-bt04b-mobile-spec-determinism.md`.

**Role:** Codex runner, lane-a. **Workdir:** `worktrees/lane-a` (branch `lane/a`).

## Pre-flight — BUILD-ON-PREDECESSOR (F-2089-1 opt-in; this is NOT the safe-dupe template)
<!-- The two-line-family below is the MACHINE-READABLE opt-in the lane runner greps
     (`^LANE-SAFETY-OPT-IN: BUILD-ON-PREDECESSOR$` plus one `EXPECTED-HOLDS:` per held
     path). F-2257-1: a master that declared this opt-in in PROSE ONLY was refused 1,100
     times over ~5h, because the guard cannot read prose. The declaration IS the safety
     argument — held must be a SUBSET of declared, so every held path is named.
     VERIFIED AGAINST THE LIVE LANE THIS FIRE, NOT REMEMBERED: `lane-usable lane-a`
     reports paths=8 and `git diff --name-only main...lane/a` lists exactly these 8. -->
LANE-SAFETY-OPT-IN: BUILD-ON-PREDECESSOR
EXPECTED-HOLDS: e2e/bt-04b-automation.spec.ts
EXPECTED-HOLDS: reviews/shots-bt04b/desktop-chrome.png
EXPECTED-HOLDS: reviews/shots-bt04b/mobile-chrome.png
EXPECTED-HOLDS: src/agent/AgentConsent.ts
EXPECTED-HOLDS: src/game/Balance.ts
EXPECTED-HOLDS: src/game/Game.ts
EXPECTED-HOLDS: src/game/RunSuspend.ts
EXPECTED-HOLDS: src/ui/ProspectorPanel.ts

lane/a is DELIBERATELY ahead by exactly **two** commits — `8dc4ff173`
(`runner(lane-a): bt-04b-automation-two-params.md`) and `fa9a757f0`
(`runner(lane-a): f2265-2-bt04b-mobile-spec-determinism.md`) — 8 paths, undrained BY
DESIGN: the gate hold (F-2268-1) holds them, and **the file you are fixing lives ON that
second commit.** **Do NOT reset or refresh the lane; build ON that tip.** Verify first:
`git log --oneline main..lane/a` shows exactly those two and nothing else, and `git status`
is clean apart from the FACTORY-CHURN EXCEPTION classes (F-1407-1: `logs/**`,
`artifacts/**`, `reviews/shots-*`, `.png` — list them and proceed). Anything ELSE ahead or
dirty: **STOP and report.** Then `npm install --no-audit --no-fund` and `npm run build`
green before touching anything.

⚠️ **The lane is ~22 commits BEHIND main and must stay that way** (refreshing it would
destroy the two commits you are extending). So main-only files are NOT on your disk: read
them with `git show main:<path>`, never by opening the path.

**Citation check (F-1424-3 / F-1425-2 — run this BEFORE you edit anything):**
`git show main:reviews/f2265-2-bt04b-mobile-spec-determinism.md | grep -Fc "| own spec — test 3 alone, mobile ×6 | ✅ 6/6 | load 13.25–16.43 |"`
must print **1**. If it prints 0 the lane is reading a stale main — **STOP and report the
count**; do not proceed and do not "fix" the grep.

## READ FIRST
- **`git show main:reviews/f2265-2-bt04b-mobile-spec-determinism.md`** — this task's whole
  evidence base: the 5-run table, the isolated-run control, and the mechanism note.
  ⚠️ On MAIN ONLY; opening the bare path in your worktree will fail.
- **`git show main:reviews/bt-04b-automation-two-params.md`** — the predecessor hold and
  s2266's battery attribution.
- `e2e/bt-04b-automation.spec.ts` — the subject, in your worktree (all three tests).
- `src/ui/Hud.ts` — read `onKeyDown` and `setProspectorPanelOpen`. **READ ONLY.**
- `scripts/fire.md` §3.1 — why every gate here runs `--workers=1`, and why a red at
  default workers is not evidence.

## WHY (quoting the evidence, dated)

s2268 gated the lane/a stack on 2026-08-24 in a detached worktree. `tsc` (rc=0),
`npm run build` (rc=0) and the full desktop project (3/3) were clean, and **f2265-2's own
target test passed 5/5 on mobile — that cure WORKS and is not in question.** The stack was
held on a *different* test in the same file:

> The failing test is `plain boot exposes operable automation controls` — the *third* test,
> not the one f2265-2 was aimed at. It fails inside the `openPanel` helper:
> `expect(locator).toBeVisible() failed / Expected: visible / Error: element(s) not found`
> at `> 17 | await expect(page.getByTestId('prospector-panel')).toBeVisible();`

**1 failure in 5 full-file mobile runs; 0 failures in 6 ISOLATED runs of that same test at
loadavg 13.25–16.43 — equal to or HIGHER than the 13.51 of the full-file run that failed.**

➡️ **Two things follow, and the second is the one that aims this task.**
1. **The ambient/load reading is REFUTED for this failure** by that load-matched control.
   Do not re-open it. Raising a timeout is forbidden (see FIREWALL).
2. **The discriminator is FILE ORDER.** ⚠️ **And note carefully why that is a legitimate
   inference here when s2266 (F-2266-1) correctly refuted it for the previous flake:** that
   refutation rested on the failing test being the FIRST in the file, so nothing could
   precede it. **This test runs THIRD** — tests 1 and 2 both boot before it — so state or
   server-condition carried from them is exactly the live hypothesis. The reasoning that
   was wrong for test 1 is the right reasoning for test 3.

**The candidate mechanism, offered as a lead and NOT as a conclusion:** `openPanel` presses
`KeyG`, and `Hud.onKeyDown` handles it as an **ungated toggle**
(`setProspectorPanelOpen(!this.prospectorPanelOpen)`) with no assertion that the boot is
ready or that the panel is currently closed. The test's only precondition is
`frame > 10`. The failing run also logged `render demotion
{"reason":"pilot-load-failed:Failed to fetch"}`, i.e. a boot that had degraded. **Establish
the mechanism you can actually demonstrate and report it in one sentence** — if the carried
condition turns out to be something else, that is a better result than confirming my guess.

**Why it blocks:** a flaky spec merged into main hands every later drain a coin-flip red on
an adjacent suite, which is how a red gets excused into uselessness (F-1460-1).

## SCOPE (each item testable)

1. **Reproduce the order dependence before fixing it.** Run the full file on mobile at
   `--workers=1` until you have observed the failure at least once, and record how many
   runs it took. If you cannot reproduce it in 10 runs, **say so plainly and stop** — report
   the count rather than fixing a defect you never saw (a negative result is a real result,
   and my own rate was 1 in 5).
2. **Make the precondition explicit rather than assumed** — the pattern f2265-2 already
   proved on test 1. Before pressing `KeyG`, assert that play has actually started
   (the contract briefing dismissed/hidden, the agent chip present) and fail loudly with a
   named message if it is not. Prefer asserting the panel's *pre-state* over blind-toggling,
   so a lost or doubled keypress cannot read as a missing element.
3. **Fix the CLASS, not the instance.** Test 2 shares the same unasserted-boot shape and is
   only sheltered because it drives the sim through `page.evaluate` rather than the UI. If
   one shared helper can give all three tests the same explicit precondition, do that
   instead of patching test 3 alone — but **do not restructure the file** beyond what that
   requires.
4. **Do not weaken anything to make it green.** The two `toBe(false)` boundary cases in
   test 1 and every `toHaveValue` in test 3 are the behaviour the slice exists to pin.
   Raising a timeout until it passes, deleting an assertion, loosening a matcher, or
   `test.skip`-ing on mobile are all FORBIDDEN — a re-pin without a named cause is the
   standing prohibition (F-1441-3).
5. **Prove determinism, do not claim it.** Run the FULL file on mobile-chrome at
   `--workers=1` **five consecutive times** and report all five as a table. Five clean runs
   is the acceptance bar; anything less is not a fix, it is luck.
6. **Re-run desktop** (full file, `--workers=1`) and report it — the fix must not trade one
   project for the other. **And confirm test 1 still passes**, so this cure does not undo
   f2265-2's.

## FIREWALL

**TOUCH-ONLY:** `e2e/bt-04b-automation.spec.ts`.

**NO:** `src/ui/Hud.ts` · `src/agent/AgentConsent.ts` · `src/game/Balance.ts` ·
`src/game/Game.ts` · `src/game/RunSuspend.ts` · `src/ui/ProspectorPanel.ts` · any other
`e2e/*.spec.ts` · `e2e/support/**` · `scripts/**` · `tasks/**` · `STATUS.md` · `CLAUDE.md` ·
`reviews/**` · `playwright.config.ts`.

⚠️ **If the investigation shows the flake is caused by PRODUCT code rather than the spec —
for example if the panel genuinely fails to mount after a degraded boot, or if the `KeyG`
toggle needs gating in `Hud.ts` — STOP and report it. Do not fix it here.** That is a
different slice with a different firewall, and it would refute this task's whole premise
(that the feature is sound and only its spec is uncertifiable). **Reporting that is a
SUCCESS, not a failure** — and it is the outcome that would matter most, because it would
mean a player on a 390px screen can lose the panel too.

## SELF-CHECK (name the exact commands)

- `npx tsc --noEmit` → rc=0
- `npm run build` → rc=0
- `npx playwright test e2e/bt-04b-automation.spec.ts --project=mobile-chrome --workers=1`
  → **five consecutive runs, all rc=0**, all five reported as a table
- `npx playwright test e2e/bt-04b-automation.spec.ts --project=desktop-chrome --workers=1`
  → rc=0, 3/3
- zero console/page errors in the boot probes (the spec's own `expectNoConsoleErrors` calls
  already assert this — do not remove them)
- screenshots already exist at `reviews/shots-bt04b/`; refresh only if the spec's own
  captures change

**READY-FOR-GATES** — report: how many runs it took to reproduce (item 1), the mechanism you
established in one sentence, whether you cured the class or only test 3 and why, the five-run
mobile table, the desktop result, and whether anything outside the firewall would have needed
touching (report it, never fix it).
