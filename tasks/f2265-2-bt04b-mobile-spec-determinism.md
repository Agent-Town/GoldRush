# f2265-2 — bt-04b's own spec is flaky on mobile-390; make it deterministic (lane-a, prefix "fix:", BUILD-ON-PREDECESSOR)

**FIRE-AUTHORED (attended review welcome)** — s2265, from the gate evidence in
`reviews/bt-04b-automation-two-params.md`. **Pre-flight + citation route added s2266**
(the master was BANKED, not dispatchable, until a fire picked the route).

**Role:** Codex runner, lane-a. **Workdir:** `worktrees/lane-a` (branch `lane/a`).

## Pre-flight — BUILD-ON-PREDECESSOR (F-2089-1 opt-in; this is NOT the safe-dupe template)
<!-- s2266: the two lines below are the MACHINE-READABLE opt-in that
     lane-runner-v3.sh:339-347 actually greps (`^LANE-SAFETY-OPT-IN: BUILD-ON-PREDECESSOR$`
     plus one `EXPECTED-HOLDS:` per held path). F-2257-1: a master that declared this
     opt-in in PROSE ONLY was refused 1,100 times over ~5h, because the guard cannot
     read prose. The declaration IS the safety argument (held must be a subset of
     declared): every held path is named. VERIFIED AGAINST THE LIVE LANE THIS FIRE,
     NOT REMEMBERED — `lane-usable lane-a` reports paths=8 and `git diff --name-only
     main...lane/a` (tip 8dc4ff173) lists exactly these 8. -->
LANE-SAFETY-OPT-IN: BUILD-ON-PREDECESSOR
EXPECTED-HOLDS: e2e/bt-04b-automation.spec.ts
EXPECTED-HOLDS: reviews/shots-bt04b/desktop-chrome.png
EXPECTED-HOLDS: reviews/shots-bt04b/mobile-chrome.png
EXPECTED-HOLDS: src/agent/AgentConsent.ts
EXPECTED-HOLDS: src/game/Balance.ts
EXPECTED-HOLDS: src/game/Game.ts
EXPECTED-HOLDS: src/game/RunSuspend.ts
EXPECTED-HOLDS: src/ui/ProspectorPanel.ts

lane/a is DELIBERATELY ahead by exactly one commit: `8dc4ff173`
(`runner(lane-a): bt-04b-automation-two-params.md`), 8 paths, undrained BY DESIGN —
the gate hold (F-2265-2) holds it, and **the file you are fixing lives ON that commit**.
**Do NOT reset or refresh the lane; build ON that commit.** Verify first:
`git log --oneline main..lane/a` shows exactly `8dc4ff173` and nothing else, and
`git status` is clean apart from the FACTORY-CHURN EXCEPTION classes (F-1407-1:
`logs/**`, `artifacts/**`, `reviews/shots-*`, `.png` — list them and proceed).
Anything ELSE ahead or dirty: **STOP and report.** Then `npm install --no-audit --no-fund`
and `npm run build` green before touching anything.

⚠️ **The lane is ~13 commits BEHIND main and must stay that way** (refreshing it would
destroy the very commit you are extending). So main-only files are NOT on your disk:
read them with `git show main:<path>`, never by opening the path.

## READ FIRST
- **`git show main:reviews/bt-04b-automation-two-params.md`** — the gate evidence and the
  measured flake table. ⚠️ This file is on MAIN ONLY and is NOT in your worktree; opening
  the bare path will fail. Use the `git show` form.
- `e2e/bt-04b-automation.spec.ts` — the subject, in your worktree. Written by the bt-04b run itself.
- `scripts/fire.md` §3.1 — why every gate here runs `--workers=1`, and why a red at
  default workers is not evidence.

## WHY (quoting the evidence, dated)

s2265 gated `bt-04b` on 2026-08-24 in a detached worktree. `tsc` (rc=0), `npm run
build` (rc=0) and the desktop project (3/3) were all clean. The mobile-390 project
was **flaky**, measured across six serial `--workers=1` runs:

> 2 failures in 3 full-file mobile runs; 0 failures in 2 isolated runs of the same
> test; desktop full-file green.

The failing test is `e2e/bt-04b-automation.spec.ts` ("repair and idle boundaries
update the live loop on the next sim tick"). ⓘ **That coordinate is unresolvable on
main by construction — the spec exists only on lane/a's undrained commit — so the
TITLE is the durable key here, not the line number (F-1310-1).** The failure is
`expect(received).toBe(expected) // Expected: false, Received: true`. The captured
page snapshot of a failed run **still showed the contract screen and its `Begin`
button**, i.e. that run had not entered play when the assertion was evaluated.

**The slice was held, not merged, solely on this.** A flaky spec merged into main
hands every later drain a coin-flip red on an adjacent suite, which is how a red gets
excused into uselessness (F-1460-1).

## SCOPE (each item testable)

1. **Find the mechanism — and do NOT hunt inter-test leakage, which is ruled out.**
   ⚠️ **s2266 CORRECTION (F-2266-1, measured by reading the file): the failing test at
   `:38` is the FIRST of the three tests in this spec** (`:38`, `:70`, `:98`; only
   `test.beforeEach` at `:34` precedes it). At `--workers=1` the first test runs first
   whether or not the rest of the file runs, so **nothing can leak into it from tests
   that have not executed yet.** s2265's stated inference — *"passes ALONE and fails in
   FILE ORDER, so the cause is state carried between tests in this file"* — **does not
   hold for this test, and chasing it would burn the dispatch.**
   ➡️ **What the evidence DOES support is a BOOT RACE, and that is the thing to establish.**
   The captured snapshot of a failed run still showed the contract screen and its `Begin`
   button — i.e. `window.__GR_TEST__` existed and frames were advancing (`frame > 10`, the
   spec's only precondition at `:39`) **while play had not started.** So the wait at `:39`
   does not imply the precondition the assertions need. The full-file/isolated difference
   is therefore most likely AMBIENT (dev-server warmth, machine load), not ordering.
   **Report the mechanism you actually establish in one sentence, and say so plainly if
   the ambient reading is what you find** — a negative result here is a real result.
2. **Make the precondition explicit rather than assumed.** The test already waits for
   `window.__GR_TEST__ && frame > 10`; if the real precondition is "play has started"
   (contract screen dismissed, sim live), assert THAT before the first boundary
   assertion, and fail loudly with a named message if it is not reached.
3. **Do not weaken the assertions to make it green.** The two `toBe(false)` boundary
   cases (`:54` at exactly 60% hp, `:65` the sub-1s idle case) are the behaviour the
   slice exists to pin. Raising a timeout until it passes, deleting an assertion, or
   `test.skip`-ing on mobile are all FORBIDDEN — a re-pin without a named cause is the
   standing prohibition (F-1441-3).
4. **Prove determinism, do not claim it.** Run the FULL file on mobile-chrome at
   `--workers=1` **five consecutive times** and report all five results as a table.
   Five clean runs is the acceptance bar; anything less is not a fix, it is luck.
5. **Re-run desktop** (full file, `--workers=1`) and report it — the fix must not
   trade one project for the other.

## FIREWALL

**TOUCH-ONLY:** `e2e/bt-04b-automation.spec.ts`.

**NO:** `src/agent/AgentConsent.ts` · `src/game/Balance.ts` · `src/game/Game.ts` ·
`src/game/RunSuspend.ts` · `src/ui/ProspectorPanel.ts` · any other `e2e/*.spec.ts` ·
`scripts/**` · `tasks/**` · `STATUS.md` · `CLAUDE.md` · `reviews/**`.

⚠️ **If the investigation shows the flake is caused by PRODUCT code rather than the
spec, STOP and report it — do not fix it here.** That is a different slice with a
different firewall, and this task's whole premise (the feature is sound, the spec is
not certifiable) would be refuted. Reporting that is a SUCCESS, not a failure.

## SELF-CHECK (name the exact commands)

- `npx tsc --noEmit` → rc=0
- `npm run build` → rc=0
- `npx playwright test e2e/bt-04b-automation.spec.ts --project=mobile-chrome --workers=1`
  → **five consecutive runs, all rc=0**, all five reported
- `npx playwright test e2e/bt-04b-automation.spec.ts --project=desktop-chrome --workers=1`
  → rc=0
- zero console/page errors in the boot probes
- screenshots already exist at `reviews/shots-bt04b/`; refresh only if the spec's own
  captures change

**READY-FOR-GATES** — report: the mechanism you found in one sentence, the five-run
mobile table, the desktop result, and whether anything outside the firewall would have
needed touching (report it, never fix it).
