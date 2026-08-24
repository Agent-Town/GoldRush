# bt-04b — automation two params (repair-under / idle-seconds)

- **Slice:** `bt-04b-automation-two-params`
- **Branch / tip:** `lane/a` @ `8dc4ff173` — `runner(lane-a): bt-04b-automation-two-params.md`
- **Base:** `main` @ `1163f8013`
- **Gated by:** s2265, in a detached worktree (`gate-s2265`, §3.0b — undecided content never entered main's tree)
- **Master:** attended-dispatched at 10:47, re-authored to F-2261-1's measured width (forks (1)+(2) only, persistence seam inside the firewall)

## VERDICT: HOLD — NOT MERGED

The implementation gates clean on every deterministic check. **It is held on ONE
finding: the slice's own new spec is FLAKY on mobile-390 — non-deterministic across
identical serial runs.** Nothing here says the feature is wrong; what cannot be said
is that its spec is green, and §6's drain gate requires exactly that ("its own spec
green desktop+mobile").

## What it does

Adds two player-set automation boundaries to the Prospector's consent model —
`repairUnderPct` (repair a building below this % of maxHp) and `idleSeconds` (wait
this long before self-tasking). Both are surfaced as operable controls in the
Prospector panel, both ride the suspend/restore seam, and old saves receive defaults
rather than `undefined`. The live loop picks up a changed boundary on the next sim
tick rather than at the next task boundary.

## Evidence

| Gate | Result | Detail |
|---|---|---|
| `npx tsc --noEmit` | ✅ rc=0 | 4.6 s |
| `npm run build` | ✅ rc=0 | 18.1 s, `✓ built in 1.47s`, asset-diet within ceiling |
| own spec — desktop-chrome | ✅ rc=0 | 3/3 passed (9.0 s), `--workers=1` |
| own spec — mobile-chrome | ❌ **FLAKY** | see below |
| merge into detached gate worktree | ✅ clean | three-way, no conflicts |

### The mobile flake — measured, not inferred

All runs `--workers=1` (§3.1: a red at default workers is not evidence until it
reproduces serially — this one did, so the parameterisation is honest).

| Run | Scope | Result |
|---|---|---|
| 1 | full file, mobile-chrome | ❌ 1 failed / 2 passed (12.9 s) |
| 2 | `:38` alone, mobile-chrome | ✅ 1 passed (3.6 s) |
| 3 | `:38` alone, mobile-chrome | ✅ 1 passed (3.5 s) |
| 4 | full file, mobile-chrome | ✅ 3 passed (7.9 s) |
| 5 | full file, mobile-chrome | ❌ 1 failed / 2 passed (13.5 s) |
| 6 | full file, desktop-chrome | ✅ 3 passed (11.0 s) |

**2 failures in 3 full-file mobile runs; 0 failures in 2 isolated runs of the same
test.** The failing test is `repair and idle boundaries update the live loop on the
next sim tick` (`e2e/bt-04b-automation.spec.ts:38`), and the failure is
`expect(received).toBe(expected) // Expected: false, Received: true` — one of the two
`toBe(false)` boundary assertions (`:54`, the at-exactly-60% non-repair case, or
`:65`, the sub-1s idle case).

**It passes in isolation and fails in file order, so this is inter-test state
leakage or a timing dependency, NOT a viewport logic bug.** The captured page
snapshot from the failed run shows the contract screen with its `Begin` button still
present — i.e. the run under test had not entered play — which points at the
`beforeEach` / `grantAgentLevel` + `goto` sequence racing the boot on the slower
mobile profile rather than at the automation logic itself.

## Merge classification

Not merged, so no per-file resolution was committed. For the next fire: the merge
itself is clean and was performed in `gate-s2265` — one runner commit, 8 files,
+214/−10 (`e2e/bt-04b-automation.spec.ts` new, `reviews/shots-bt04b/*.png` new,
`src/agent/AgentConsent.ts`, `src/game/Balance.ts`, `src/game/Game.ts`,
`src/game/RunSuspend.ts`, `src/ui/ProspectorPanel.ts`). All five `src/` files are
LANE-TOUCHED; main has not moved any of them since the lane branched.

## Findings

- **F-2265-2 (BLOCKING, spawns a corrective):** the slice's own spec is flaky on
  mobile-390 at ~50% across identical serial full-file runs, while green in
  isolation and green on desktop. **Merging it would hand every future drain that
  runs adjacent suites a coin-flip red**, which is precisely how a red gets excused
  into uselessness (F-1460-1, the `cross-engine` fate). The corrective is scoped to
  the SPEC's determinism, not to the feature.
- **NOT a finding — recorded so the next fire does not re-derive it:** `tsc`, the
  build, and the desktop project are all clean, and the isolated mobile run is clean
  twice. **No evidence was found that the shipped behaviour is wrong.** The hold is
  about certifiability, not correctness.

## Owed measurement (NOT run — stated rather than implied)

`npm run test:node-guards` is owed by §3 because the diff touches `src/game/` and
`src/agent/`, and it was **not run** — the slice was held on the spec flake before
the ~530 s battery was worth spending. **The next fire owes that battery before any
merge**; do not read this review's greens as covering it.
