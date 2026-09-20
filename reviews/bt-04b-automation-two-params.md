# bt-04b — automation two params (repair-under / idle-seconds)

- **Slice:** `bt-04b-automation-two-params`
- **Branch / tip:** `lane/a` @ `d02ff4148` — `runner(lane-a): bt-04b-automation-two-params.md`
- **Base:** `main` @ `2e492fcff`
- **Gated by:** s2265, in a detached worktree (`gate-s2265`, §3.0b — undecided content never entered main's tree)
- **Master:** attended-dispatched at 10:47, re-authored to F-2261-1's measured width (forks (1)+(2) only, persistence seam inside the firewall)

## VERDICT: HOLD — NOT MERGED

> ⏭️ **SUPERSEDED s2269 — THIS HOLD IS DISCHARGED. The slice MERGED at `0d1f0b8cc838fb110537563ca5120d48e6672718`,
> verified BY ANCESTRY (`git merge-base --is-ancestor 0d1f0b8cc main` → yes).** The verdict above is kept VERBATIM
> under the Retention Law: it was correct when written, and the reasoning is the provenance. What changed is the
> evidence, not the judgement — the hold rested on the slice's own spec being uncertifiable on mobile-390, and it
> was lifted by s2268's pre-registered condition being met: 5/5 clean full-file mobile-chrome runs in a fire-shell
> detached worktree at `--workers=1`, on top of the implementer's 10 clean lane-shell runs. ⚠️ **Read the successor
> review before citing this one — the flake is CARRIED, not explained:** combined record 1 failure in 20 full-file
> mobile runs, and the load hypothesis is UN-PROBED (the clean runs ran at loadavg 8.89, the one failure at 13.51).
> Successor: `reviews/bt-04b-automation-two-params-s2269-merge.md`.

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


## s2266 — the owed battery, DISCHARGED (and the hold stands on its own merits)

**`npm run test:node-guards` was run on the MERGED tree** (detached worktree
`worktrees/gate-s2266`, base `70e336756`, `git merge --no-ff lane/a` clean — 8 files,
+214/-10, zero conflicts), fire shell, node **v26.4.0** matching `.nvmrc` (F-2166-2: a
red here is a question about WHICH INTERPRETER ran it before it is a question about the
slice). **rc=1, 3 failing tests — and NONE of them is a product objection to this slice.**

| failing test | file | attribution |
|---|---|---|
| "reds on the pre-strike ledger that manufactured the owner directive, greens on the struck one" | `scripts/blocker-panel-closed-guard.test.mjs` | **PRE-EXISTING ON MAIN** |
| "all 76 scripts/*.test.mjs fixture owners remove their temp directories" | `scripts/fixture-teardown.test.mjs` | **CASCADE of the above** — its own message names `blocker-panel-closed-guard.test.mjs child failed` |
| "THE REAL TREE: every law-surface pointer in this repo currently holds" | `scripts/law-pointer-guard.test.mjs` | **ATTRIBUTABLE — routine, predicted pointer rot (F-2266-3)** |

**The control is what makes this readable, and it was run rather than assumed:** the
same `blocker-panel-closed-guard.test.mjs` fails **on clean main** with the identical
`0 !== 1` at the identical assertion, so it is not this slice's (F-2266-2). And
`law-pointer-guard.test.mjs` is **GREEN on main and RED on the merged tree**, re-run
**ALONE** in both to rule out the contention that F-1537-1 warns of — so that one IS
the merge's, and it is the ordinary lifecycle rather than a defect.

⚠️ **THE ONE OWED ACT AT MERGE TIME (F-2266-3):** this slice moves
`src/game/Game.ts` and shifts the line `scripts/fire.md` cites for the
`placeBuilding`/`panAt` GHOST evidence. **Measured by RE-GREPPING the content, never by
remembering a delta:** `placeBuilding: (id, position, rotation = 0) => ...` sits at
**2477 on main** and at **2478 on the merged tree** — a shift of exactly **+1**, so the
law's `2477–2478` becomes `2478–2479`. **The landing drain must re-base that pointer in
its own commit**, exactly as the CLAUDE.md clause predicts for this coordinate family.
Note `src/game/Game.ts` carries a SECOND `placeBuilding` occurrence (3327 → 3328); the
law cites the FIRST — re-grep, do not count.

⚖️ **THE HOLD IS UNCHANGED AND IS NOT WEAKENED BY THIS RESULT.** The battery found no
product objection, but the F-2265-2 spec flake is untouched by it. **A green battery
does not certify a flaky spec** — and this battery was not green anyway.
