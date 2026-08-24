# f2265-2 — bt-04b's own spec is flaky on mobile-390; make it deterministic

**FIRE-AUTHORED (attended review welcome)** — s2265, from the gate evidence in
`reviews/bt-04b-automation-two-params.md`.

**Role:** Codex runner, lane-a. **Workdir:** `worktrees/lane-a` (branch `lane/a`).

## READ FIRST
- `reviews/bt-04b-automation-two-params.md` — the gate evidence and the measured flake table.
- `e2e/bt-04b-automation.spec.ts` — the subject. Written by the bt-04b run itself.
- `scripts/fire.md` §3.1 — why every gate here runs `--workers=1`, and why a red at
  default workers is not evidence.

## WHY (quoting the evidence, dated)

s2265 gated `bt-04b` on 2026-08-24 in a detached worktree. `tsc` (rc=0), `npm run
build` (rc=0) and the desktop project (3/3) were all clean. The mobile-390 project
was **flaky**, measured across six serial `--workers=1` runs:

> 2 failures in 3 full-file mobile runs; 0 failures in 2 isolated runs of the same
> test; desktop full-file green.

The failing test is `repair and idle boundaries update the live loop on the next sim
tick` (`e2e/bt-04b-automation.spec.ts:38`). The failure is
`expect(received).toBe(expected) // Expected: false, Received: true`. The captured
page snapshot of a failed run **still showed the contract screen and its `Begin`
button**, i.e. that run had not entered play when the assertion was evaluated.

**The slice was held, not merged, solely on this.** A flaky spec merged into main
hands every later drain a coin-flip red on an adjacent suite, which is how a red gets
excused into uselessness (F-1460-1).

## SCOPE (each item testable)

1. **Find the leak.** The test passes ALONE and fails in FILE ORDER, so the cause is
   state or timing carried between tests in this file — not the mobile viewport's
   logic. Establish which, and write the mechanism into the run report in one
   sentence. Candidate: the `beforeEach` `grantAgentLevel(page)` plus the per-test
   `page.goto(...)` racing boot on the slower mobile profile, so the game is still on
   the contract screen when the first assertion runs.
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
