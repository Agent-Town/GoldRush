# TAPE-01 — every run leaves a tape

**Slice:** `lane-run-tape` (TAPE-01, `specs/agent-play/README.md` §AP-09)
**Branch:** `lane/perf` (lane-d slot) · **Tip:** `78c310db` · **Base:** `5bce2fbd` (ancestor of main, verified)
**Drained:** s1297, 2026-07-31 · **Gate custody:** detached worktree `worktrees/gate-s1297` (F-1295-1); main's tree held the arm only between the final apply and the commit.

## Verdict

**MERGE.** tsc clean, build green, subject spec 8/8 desktop+mobile, guards 7/8 with the single red proven pre-existing on clean main, and all five adjacent reds fingerprint to documented known-reds. The one ambiguous red was control-armed to a pooled **PRE 3/12 vs POST 3/12 — identical**.

## What it does

Every ended run now writes a tape — `{contract, seed, difficulty, simVersion, inputLog, eventLogHash, outcome}` — into a profile-scoped ring holding the latest ten plus anything the player flagged to keep. The input log reuses the existing lockstep serialization rather than minting a second format, so a recorded tape re-fed through a fresh boot reproduces its `eventLogHash` byte-identically; that determinism proof is the slice's real gate and it is asserted in-spec on both projects. The player meets this as one button on the run-summary overlay ("Keep this tape" → "Tape kept"), and a submitted county-standings score now carries its tape alongside the row, size-capped at 64 KiB. The replay *viewer* is deliberately absent — that is TAPE-02, and the runner correctly refused to build it.

## Evidence

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | rc=0, clean |
| `npm run build` | rc=0, built in 1.10s |
| `e2e/tape-01-run-tape.spec.ts` (subject) | **8/8 passed**, desktop+mobile, `1 worker`, 14.5s |
| `run-guards.mjs --changed-since 5bce2fbd` | **7/8** — `test:stats`, `test:accounts`, `test:mp`, `test:task-guards`, `test:gate-callers` + node-guards, power-budget all PASS; `test:citations` RED |
| `test:citations` on **clean main** | **RED, byte-identical 12 rows** → pre-existing (F-1296-2), merge touches **0** `.md` files |
| Adjacent battery (10 specs, both projects) | **113 passed / 5 failed**, 8.8m, `--workers=1`, scratch port 5249 |
| Plain-boot probe (no `?debug`) | **2/2 passed**, desktop + 390px, **zero console/page errors** |
| Screenshots | `reviews/shots-tape-01/plain-boot-{desktop,mobile}-chrome.png` |

Adjacent suites derived by grep over the touched surfaces (`DeathOverlay`, `standings`, `save-compat`, `profileStorage`, `runManager`), narrowed to the ten highest-signal, and including the skill minimum (`task-025`, `m1-01`, `m2-01`).

### The five adjacent reds, fingerprinted

| Red | Inventory row | Match |
|---|---|---|
| `restore-validation` "active megaproject wrecker…" desktop | 201 / 472 (88.1% flake) | title + suite ✅ |
| `restore-validation` "active megaproject wrecker…" mobile | 202 / 472 | title + suite ✅ |
| `tl-01-run-telemetry` "plain no-debug secure return…" desktop | 245 / 632 (**deterministic 100%**) | title + assertion line ✅ |
| `tl-01-run-telemetry` "plain no-debug secure return…" mobile | 246 / 633 (**deterministic 100%**) | title + assertion line ✅ |
| `restore-validation` "page-load restore materializes run-manager state…" **mobile** | 203 — scoped **DESKTOP-ONLY** | title ✅, **arm ❌** → control-armed below |

## The control arm (F-1297-1)

Row 203 scopes that title DESKTOP-ONLY, so a mobile red was an unmatched fingerprint sitting on `RunManager` — one of the files this slice edits. That is exactly the shape a real regression takes, so it was measured rather than argued. Arms were swapped in the gate worktree by `scripts/_s1297-arm.mjs`, which asserts **absolute blob hashes** every direction (never a clean `git status` — F-1295-1: a clean status is blind), interleaved, round 2 order-reversed, `--workers=1`.

| Arm | Full-file runs (`:186` instances) | Isolated `--repeat-each=4` | Pooled |
|---|---|---|---|
| PRE (main `a2204f39`) | 2/4 red | 1/8 red | **3/12** |
| POST (lane `78c310db`) | 3/4 red | 0/8 red | **3/12** |

**Identical.** `:186` is a ~25% flake living on **both** arms; the merge does not move it. Two independent facts fell out:

- It is **red on clean main** (desktop redded in 2/2 PRE full-file runs), so it cannot be a failure this slice introduces.
- Its DESKTOP-ONLY qualifier is **false** — mobile redded twice. The pooled rates being equal means the arm asymmetry that first raised the alarm was sampling noise, not a project-specific fault.

## Merge classification

Base `5bce2fbd`, confirmed an ancestor of main. `lane-freeze-classify lane/perf` → `ahead=1 paths=9`, **LANE-ONLY 9 · DUPLICATE 0 · MAIN-ONLY 0 · BOTH-MOVED 0**. Main's blob equals the base blob on all seven pre-existing paths; two are new files absent from both base and main. **No 3-way graft needed** — an exact path-scoped apply, every blob hash-asserted equal to the lane tip on landing.

| Path | Class |
|---|---|
| `e2e/lb-01-county-standings.spec.ts` | LANE-TOUCHED |
| `e2e/tape-01-run-tape.spec.ts` | LANE-TOUCHED (new) |
| `functions/api/standings.ts` | LANE-TOUCHED |
| `src/game/Game.ts` | LANE-TOUCHED |
| `src/game/ProfileStorage.ts` | LANE-TOUCHED |
| `src/game/RunManager.ts` | LANE-TOUCHED |
| `src/game/RunTape.ts` | LANE-TOUCHED (new) |
| `src/ui/DeathOverlay.ts` | LANE-TOUCHED |
| `src/vite-env.d.ts` | LANE-TOUCHED |

The two-dot `main..lane/perf` diff is not the content here; the commit's own `--stat` is: **9 files, +875/−52**.

## Findings

**F-1297-1 — `suite-red-inventory` row 203's DESKTOP-ONLY scope is measured false.** `restore-validation.spec.ts` "page-load restore materializes run-manager state after manager assignment" redded on **mobile** in 2 of 4 POST full-file runs while the row says desktop-only. A scope qualifier is an unaudited claim, and a wrong one costs a drain a full control arm — as it cost this one. The pooled rate (3/12 both arms) is the honest replacement for both the qualifier and the row's silence on a rate. **Fire-authorable, mechanical:** widen row 203 to BOTH and record ~25%. *Non-blocking.*

**F-1297-2 — the slice's player-facing button has no plain-boot e2e (Mistake #10 shape).** `keep-run-tape` is asserted only under `?debug&nolevel&nowaves` (`tape-01-run-tape.spec.ts:136`). What saves this from blocking is a **control-flow guarantee rather than a measurement**: all three `deathOverlay.show(...)` call sites (`Game.ts:1477`, `:1529`, `:6307`) spread `keepTapeOptions()` **unconditionally**, and that helper always returns an `onKeepTape` function, while `DeathOverlay.ts:212` renders the button iff `onKeepTape` is defined. So the button is present on every death overlay a player can reach, on any boot, by construction. The gap is that no test would notice if someone put a debug gate in front of it later. **Fire-authorable:** one no-`?debug` assertion. *Non-blocking.*

**F-1297-3 — this drain's own probe was wrong twice, and both drafts are recorded in the probe's header rather than dropped.** Draft 1 waited on `__THREE_GAME_DIAGNOSTICS__.frame > 10`, which only advances inside a run — 60s timeout, 2 reds. Draft 2 waited on `start-menu-enter-town`, borrowed from `openBoardAndLaunchPlain` (`tl-01-run-telemetry.spec.ts:71`), but that helper only reaches a start menu because its spec **seeds a profile** (`tl-01:34-47`); with no profile the boot lands on profile creation and the testid never exists. Four reds total, all the instrument's. *Recorded, not actionable.*

**F-1297-4 — neither pile item has a goal leaf.** `drain-block-check` returned **UNKNOWN** (default rc=0, `--strict` rc=2) for both `lane-run-tape` and `lane-prime-env`: no leaf matched either master. That is the Goal Registration Law unmet at authoring time, not a clearance. This drain registers TAPE-01's leaf as `merged` with its full hash; `lane-prime-env`'s remains owed by whoever drains it. *Non-blocking, but it means the board's goal tree under-counts live work.*
