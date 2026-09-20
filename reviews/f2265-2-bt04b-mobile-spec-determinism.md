# f2265-2 — bt-04b's mobile spec determinism (and the bt-04b stack behind it)

- **Slice:** `f2265-2-bt04b-mobile-spec-determinism` riding on `bt-04b-automation-two-params`
- **Branch / tip:** `lane/a` @ `431367d10` — a two-commit stack (`d02ff4148` bt-04b, `431367d10` f2265-2)
- **Base:** `main` @ `e7397787d` (lane was `ahead=2 behind=22`, `tracked-dirt=0`, `untracked=0`)
- **Gated by:** s2268, in a detached worktree (`.gate-s2268`, §3.0b — undecided content never entered main's tree)
- **Predecessor review:** `reviews/bt-04b-automation-two-params.md` (s2265 HOLD, s2266 node-guards discharge)

## VERDICT: HOLD — NOT MERGED

**f2265-2 did its job, and the number that matters says so: its target test passed 5/5
on mobile where s2265 measured 2 failures in 3.** The stack is nevertheless held, because
**the F-2265-2 flake class is not discharged — it MOVED.** The spec's *third* test is
non-deterministic on mobile-390, so §6's drain gate ("its own spec green desktop+mobile")
is still unmet. Nothing here says the feature is wrong; what still cannot be said is that
its spec is green.

## What it does

`f2265-2` makes the spec's first test state its precondition instead of assuming it: it
dismisses the contract briefing and asserts it is hidden (with a named failure message)
before the boundary assertions, replaces a raw `evaluate`+`dispatchEvent` input write with
an actionability-aware `fill()`, and adds console/page-error watching to all three tests.
**It respected its firewall exactly** — `git show 431367d10` touches `e2e/bt-04b-automation.spec.ts`
and nothing else — and **it did not weaken a single assertion**: both `toBe(false)` boundary
cases the slice exists to pin are intact, verified by reading the diff rather than by trusting
the report.

## Evidence

All playwright runs `--workers=1` (§3.1). loadavg is quoted per run because the box was hot
(13–17 of 16 cores) throughout, and F-2166-2 makes load attribution a precondition for
reading a red rather than an excuse offered after one.

| Gate | Result | Detail |
|---|---|---|
| merge into `.gate-s2268` | ✅ clean | three-way `ort`, zero conflicts, 8 files, +220/−10 |
| `npx tsc --noEmit` | ✅ rc=0 | silent |
| `npm run build` | ✅ rc=0 | `✓ built in 3.25s`, asset-diet within ceiling (Herald 1,158,214 B of 1,500,000 B) |
| own spec — desktop-chrome, full file | ✅ rc=0 | 3/3 passed, 14.8 s, load 13.76 |
| own spec — mobile-chrome, full file ×5 | ❌ **4/5** | see below |
| own spec — test 3 alone, mobile ×6 | ✅ 6/6 | load 13.25–16.43 |
| `npm run test:node-guards` | ✅ discharged by s2266 | see "Battery attribution" |

**Raw transcripts (mirrored into git, per the Retention Law — these are the numbers above,
not a summary of them):** `artifacts/s2268-bt04b-gate-battery.txt` (desktop + the five
mobile runs, with the failure excerpt) and `artifacts/s2268-bt04b-test3-isolated.txt` (the
six isolated runs that form the load control).

### The residual flake — measured, with the control that repriced it

| Run | Scope | Result | loadavg |
|---|---|---|---|
| 1 | full file, mobile-chrome | ❌ 1 failed / 2 passed (26.0 s) | 13.51 |
| 2 | full file, mobile-chrome | ✅ 3 passed (21.7 s) | 14.39 |
| 3 | full file, mobile-chrome | ✅ 3 passed (19.5 s) | 13.33 |
| 4 | full file, mobile-chrome | ✅ 3 passed (17.7 s) | 13.09 |
| 5 | full file, mobile-chrome | ✅ 3 passed (18.1 s) | 12.83 |

The failing test is **`plain boot exposes operable automation controls`** — the *third* test,
not the one f2265-2 was aimed at. It fails inside the `openPanel` helper:

> `Error: expect(locator).toBeVisible() failed / Expected: visible / Error: element(s) not found`
> `> 17 | await expect(page.getByTestId('prospector-panel')).toBeVisible();`

**f2265-2's own target test — `repair and idle boundaries update the live loop on the next
sim tick` — passed in all five full-file mobile runs and on desktop.** That is a real,
measured improvement and should not be discounted by the hold.

### The load control is the new information

s2265's master proposed an AMBIENT reading (dev-server warmth, machine load) for the
original flake and asked the runner to say plainly if that was what it found. **For the
residual flake that reading is now REFUTED by a load-matched control: six isolated runs of
the failing test passed 6/6 at loadavg 13.25–16.43 — equal to or HIGHER than the 13.51 of
the full-file run that failed.** Load is therefore not the discriminator. **File order is.**

### F-2266-1 is affirmed, and its scope is exactly right

s2266 corrected s2265 for inferring inter-test leakage, on the ground that the failing test
was the FIRST in the file and nothing can leak into a test that runs first. **That argument
is sound and it does not extend to this failure**, because the test failing now is the
THIRD — tests 1 and 2 have both booted before it. The reasoning that was wrong for test 1
is the right reasoning for test 3, and the isolated-vs-file-order split measured above is
what a real ordering dependence looks like.

## Merge classification

Not merged, so no per-file resolution was committed. For the landing fire: the merge itself
is clean and was performed in `.gate-s2268` — 8 paths, all **LANE-TOUCHED**, main has moved
none of them since the lane branched (`lane-usable lane-a` reports all 8 as `HELD LANE-ONLY`).
`e2e/bt-04b-automation.spec.ts` and both `reviews/shots-bt04b/*.png` are new files; the five
`src/` files are additive. The stack must be merged at its **tip** (`431367d10`) — merging
`d02ff4148` alone would land the pre-cure spec.

## Battery attribution

`npm run test:node-guards` was **not re-run this fire, deliberately and with a stated reason
rather than by omission.** s2266 ran it on bt-04b's merged tree (rc=1, three failures, all
three attributed away from the slice — two pre-existing on main with a control run on clean
main, one routine law-pointer rot). The only delta this fire adds on top of that tree is
`431367d10`, which touches **`e2e/` alone**; `test:node-guards` runs `scripts/*.test.mjs`
plus `gr-sim` and reads nothing under `e2e/`, so the f2265-2 delta is structurally incapable
of moving it. **The ~530 s battery was not worth spending to re-derive a result its own
inputs cannot have changed** — but that is an argument, not a measurement, and a fire that
merges this stack should re-run it on the actual merged tree.

## Findings

- **F-2268-1 (BLOCKING, spawns a corrective):** the spec's third test,
  `plain boot exposes operable automation controls`, is order-dependent on mobile-390 —
  **1 failure in 5 full-file runs, 0 failures in 6 isolated runs at equal-or-higher load.**
  It fails in `openPanel`, whose `KeyG` press is an **ungated toggle** (`src/ui/Hud.ts`
  `onKeyDown` → `setProspectorPanelOpen(!open)`) fired against a boot whose readiness the
  test never asserts — the *same* class of missing precondition that f2265-2 cured one test
  over. Merging it would hand every future drain that runs adjacent suites a coin-flip red,
  which is precisely how a red gets excused into uselessness (F-1460-1). **The corrective is
  scoped to the SPEC, not the feature**, and it is queued as
  `tasks/f2268-1-bt04b-plain-boot-order-determinism.md`.
- **NOT a finding — f2265-2 is a SUCCESS, recorded so the next fire does not re-litigate it:**
  it cured the test it was aimed at (5/5 mobile), respected its firewall, and weakened
  nothing. The hold is about a *different* test in the same file.
- **NOT a finding — no product objection:** `tsc`, the build and the whole desktop project
  are clean, and every mobile failure observed in two fires is in the spec's boot/ordering
  scaffolding, never in an automation assertion. **No evidence was found that the shipped
  behaviour is wrong.** The hold is about certifiability, not correctness.

## The owed act this fire deliberately did NOT perform

F-2266-3 requires the **landing** drain to re-base `scripts/fire.md`'s
`src/game/Game.ts:2477–2478` pointer, because this slice shifts `placeBuilding`/`panAt` by
exactly +1. **Re-measured this fire and confirmed: 2477→2478 on the merged tree, and the
second `placeBuilding` occurrence 3327→3328 (the law cites the first).** ⚠️ **Because there
is no merge, that pointer is still CORRECT on main and must NOT be touched.** Applying the
owed act without the merge would corrupt a correct citation and red `law-pointer-guard` for
the next fire. The duty travels with the merge, not with the finding.
