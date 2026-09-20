# F-1742-1 — bench-seeding Long Road + Gusher County, and the census red that blocked it

- **Slice:** F-1742-1 follow-through (bench seeds + null floors for `e4-long-road`, `e4-gusher-county`)
- **Branch:** `worktree-agent-ae099afce3741d363`, base `9e6c63197` (= `main` tip at session start)
- **Verdict:** PASS — with one adjacent pre-existing red CURED, declared below for attended veto.

## The finding did not reproduce — it was already cured, and that is now proven, not assumed

The task described an idle hero taking zero damage for 360 sim-seconds and "securing" at wave 12 on
these two tiles. **It does not reproduce at `9e6c63197`.** All four E4 idle runs end in honest
unsecured deaths with `defaultedSecure: 0`.

The cure is `08c7ffcf8` (s1745), which wired the browser's existing depenetration seam into the
headless hero update. Rather than infer that, causality was **measured** by temporarily disabling
that one option at `src/sim/HeadlessContractSim.ts:789-798` and re-running:

| `e4-long-road-01`, `--policy=idle` | secured | waves | timeMs | kills | defaultedSecure |
| --- | --- | --- | --- | --- | --- |
| depenetration DISABLED (pre-`08c7ffcf8` behaviour) | **true** | **12** | **360000** | 190 | **1** |
| depenetration enabled (current main) | false | 4 | 128767 | 41 | 0 |

The disabled row reproduces the reported symptom exactly — 360 sim-seconds, wave 12, secured via the
auto-secure default. `e4-dust-flats-01` was unchanged across the same probe (waves 2 both ways),
which is why the original measurement saw dust-flats kill correctly while these two did not. The
probe was reverted; `git diff` on that file is empty.

**Root cause (engine, already fixed):** `src/sim/HeadlessContractSim.ts:789-798` — the headless hero
update did not receive the `depenetrate` callback the browser supplies, so a hero whose start point
sits inside a landmark blocker stayed embedded and unreachable. Class: **ENGINE**, not tile data.
The contracts' spawn edges and hero starts are innocent.

## What this change does

Adds the two contracts to the bench registry and banks their null floors. The four measured tuples
are **identical to the ones the s1745 gate pinned** (`reviews/f1742-1-headless-landmark-depenetration.md`),
an independent re-derivation a week later on a different machine.

## Evidence

| Gate | Result |
| --- | --- |
| `tsc --noEmit` | green (re-run after every edit, including the spec) |
| `npm run build` | green, 1.89s |
| `null-floor-anchors.mjs` regenerate | 47 floors written |
| `null-floor-anchors.mjs --check` | **47/47 match**, run twice (145s, 96s) — deterministic |
| Pre-existing floor hashes moved | **NONE.** Only `eraStamp` `5dd670aa8 (archive: pruned by the A3 rewrite)` → `9e6c63197` (commit-keyed by design, F-1653-3) |
| New floors all `secured:false` | yes — AP-15 Law 2 satisfied |
| Full `npm run test:node-guards` — **final, on the committed tree, quiet board** | **466 pass / 0 fail / 2 skipped** of 468 |
| Full `npm run test:node-guards` (intermediate runs, board busy) | 464/2/2 and 465/1/2 — contention-class only, each red attributed below |
| `gr-sim.test.mjs` alone | **17 pass / 0 fail / 2 skipped** of 19 — the two contended reds green |
| `fixture-teardown.test.mjs` alone | **1/1** — the third contended red green |
| Targeted `bench-seeds` + `null-floor-anchors` + `skillmd-guard` | **8/8** |
| `er01-e4-census` + `ap16-4-contract-admission` | **10/10** desktop + 390px mobile, `--workers=1` |
| `task-025-bandits-dont-swim` + `m1-01-claim-jumpers-death` + `m2-01-build-menu` | **32/32** both projects |
| Boot probes (`_s2080-f1742-1-boot-probe`) | **6/6** both projects, zero console/page errors |

Idle outcomes, all four E4 contracts, before (= main) and after (unchanged by this change, which
touches no engine code):

| seed | secured | waves | timeMs | kills | eventLogHash |
| --- | --- | --- | --- | --- | --- |
| `e4-long-road-01` | false | 4 | 128767 | 41 | `fnv1a32:2b27b21d` |
| `e4-long-road-02` | false | 4 | 135167 | 48 | `fnv1a32:37ab9177` |
| `e4-gusher-county-01` | false | 5 | 155733 | 93 | `fnv1a32:95f5777c` |
| `e4-gusher-county-02` | false | 2 | 76233 | 29 | `fnv1a32:a9b7d153` |
| `e4-dust-flats-01` | false | 2 | 76567 | 33 | `fnv1a32:5d4aeff2` (= pinned floor, UNCHANGED) |
| `e4-boneyard-01` | false | 4 | 130567 | 41 | `fnv1a32:717f1001` (= pinned floor, UNCHANGED) |

## F-2080-1 — `er01-e4-census` has been RED ON MAIN since `e33af94ef` (CURED here)

`e2e/er01-e4-census.spec.ts:34` asserted `benchSeeds[contract.id]).toBeUndefined()` for every Motor
contract. But `e33af94ef` ("bank six idle-safe benchmark floors") bench-seeded `e4-dust-flats` and
`e4-boneyard`, so that assertion has been false on main ever since.

Attribution is measured, not argued: with `assets/contracts/bench-seeds.json` reverted to main's
byte-identical content (`git diff` empty), the spec runs **4 failed / 4 passed** — dust-flats and
boneyard on both projects. That commit updated the **e7, e8 and e9** censuses for exactly this
situation and simply missed e4; its message claims "Playwright 62/62", so e4's census was not in
that count.

The fix here is `e33af94ef`'s **own** pattern, and it is **stricter** than what it replaces — the
exact seed list is pinned rather than merely forbidden. Net effect: **-4 pre-existing reds, +0 new.**

## Findings for attended

1. **F-2080-1 (cured here, veto window open).** Touching `e2e/er01-e4-census.spec.ts` is outside the
   literal firewall of this task. It was unavoidable: the instructed deliverable (bench-seeding two
   Motor contracts) is precisely what that stale line forbids. The alternative was landing 4 fresh
   reds on top of 4 existing ones. Reverse the spec hunk with one word if attended prefers to rule
   on E4 bench-seeding separately — the bench-seed/null-floor half stands on its own.
2. **F-2080-2 (NOT fixed, out of scope, no owner word owed).** All four Motor contracts — including
   the long-shipped `e4-dust-flats` — refuse the board-launch path (`gr.contract.launch.v1`) with
   `stagedLaunchClear.reason: 'staged-contract-locked'`, falling back to The Claim. Measured s2080 on
   all four, so this is a pre-existing property of E4 board reachability, identical for the tiles
   added here and the two already on main. It is not a regression from this change and is not
   something this change should decide.
3. **A vacuous-probe near-miss, recorded because it nearly shipped.** Draft 1 of the boot probe used
   a bare `?contract=e4-long-road`, went green, and exercised nothing — that URL resolves to
   `fallbackReason: 'debug-disabled'` and opens The Claim (`ContractFamilies.ts:1322`). It was caught
   by reading the screenshot, which showed "The Claim". Every contract boot in the committed probe
   now asserts the resolved `contract.activeId`, so it cannot recur silently.

## Merge classification

Base `9e6c63197`; main has not moved. All five paths are LANE-TOUCHED, no MAIN-MOVED files, no
conflicts. `artifacts/056/*.png` were rewritten by the `m2-01-build-menu` gate run as ordinary
screenshot churn and are deliberately **not** staged. The gate used scratch port 5240 via a
gitignored `playwright.s2080.config.ts`, because a concurrent battery held the default 5188 —
Mistake #12 (Gate Contamination) forbids sharing that server, and `reuseExistingServer: false` would
have failed to bind.

**On the node-guards reds — all contention, and the final run is clean.** This box ran a concurrent
battery for most of the session (lane-b gating `f2078-1`), and `test:node-guards` is documented as
needing to be gated ALONE — the s2079 handoff line records "~181 s, contends — s1536 hung ~19 min
overlapping it". **The final battery, run on the committed tree once the board was genuinely quiet,
is 466 pass / 0 fail / 2 skipped.** The intermediate contended runs produced *different* red sets
each time, which is itself the signature of load rather than logic: first the contention meta-test +
`fixture-teardown`, then `gr-sim.test.mjs`'s Twin Banks and Night Shift, then `fixture-teardown`
again (whose own nested contention meta-test also fired — it spawns 34 test files as children).
Every one of those was then run ALONE and passed. The two sim reds were additionally attributed at
the CLI, which needs no quiet board:

| case | test wall time | its timeout | same work run directly at the CLI |
| --- | --- | --- | --- |
| Twin Banks | 96,088 ms | 45,000 ms (inner spawn 30,000 ms) | **1.5 s**, clean terminal |
| Night Shift | 60,500 ms | — | **7.4 s**, clean terminal |

A 45 s test that takes 96 s while the work inside it takes 1.5 s is starved, not broken. The
attribution was then closed outright: **`node --test scripts/gr-sim.test.mjs` run ALONE gives 19
tests, 17 pass / 0 fail / 2 skipped** — both Twin Banks and Night Shift green, and exactly the
"17 passed / 2 explicit skips" baseline the s1745 review records — while the other battery was
*still running*. The variable was the full-battery load, not the file. Neither
test reads anything this change touches: `gr-sim.test.mjs` imports `bench-seeds.json` only for
`the-claim`, `e1-baron`, and one skipped E2 case (`:622`, `:808`, `:843`) — no path reaches
`e4-long-road` or `e4-gusher-county`. The contended run also exercised the e2e collection guards
with both new/edited spec files present, and every one of them passed.

## Ledger

Not written here — `tasks/BACKLOG.md` is heavily concurrent and a worktree edit would conflict. The
drain should record: F-1742-1 confirmed cured by `08c7ffcf8` with a measured causal probe; both
contracts bench-seeded; F-2080-1 opened-and-closed; F-2080-2 opened.
