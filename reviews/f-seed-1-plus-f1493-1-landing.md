# f-seed-1 + f1493-1 — gate review and LANDING (s1494)

**Slice:** `lane-f-seed-1-front-door-parity` (F-SEED-1 parity cure) **+** `lane-f1493-1-parity-repin` (F-1493-1 adjacent-assertion repair), gated and merged as **ONE slice**
**Branch:** `lane/a` · **Tip:** `472cce4d3` "test: repin front-door parity assertions" (over `1e19a7d58` "fdoor: align headless progression and panning")
**Base (merge-base with main):** `22d73f2ec` · **Main at gate:** `84d2076f7`
**Gate tree:** detached worktree `gate-s1494` at merge commit `1711af799` (§3.0b — nothing undecided ever entered main's working tree)
**Merged to main:** `ff628a132`
**Date:** 2026-08-06T19:20Z

## VERDICT: MERGED

This is route (a) of **F-1492-1**, executed exactly as that finding prescribed: the cure and its adjacent-assertion repair extended on the same lane and re-gated as one slice, because the repair depends on the unmerged sim change and a fresh lane would have computed the old numbers and "fixed" them wrongly.

**The one number that decides this drain: `test:node-guards` is `rc=0` on the merged tree.** s1492 held the cure because it left eight reds in two adjacent suites (six `gr-sim.test.mjs` pins + the `e2-hill-mine` census row, desktop and mobile). All eight are green here.

## What it does

**F-SEED-1 half** — gives the headless (`gr-sim` stdin) hero the progression the browser hero already had: deterministic first-offer upgrades, panning paid at the browser's immediate rate. Before it, no model had ever secured any contract through the public stdin door (every run dead at wave 2, `timeMs 81767` exactly, policy-invariant). After it, a committed pure-stdin fixture secures The Claim at wave 10 in 13 calls while an idle run still dies at wave 3 — the door is **winnable and still losable**, which is the property that makes it a fair bench.

**F-1493-1 half** — repairs what the cure moved, and repairs it *correctly* rather than by re-pinning to make a red go away:

- `e2e/er01-e2-census.spec.ts:109` asserted `waves === contract.twist.secureWave` unconditionally. s1493 measured `autoSecureWaveForRun()` in both engines (`src/game/Game.ts:4844`, `src/sim/HeadlessContractSim.ts:325-328`) and found it returns `Number.MAX_SAFE_INTEGER` while `twist.baron && !baronBeaten` — **a baron contract never secures at its declared `secureWave` at all; it secures when the Baron dies.** The equality was structurally guaranteed on exactly one of the four E2 contracts and a combat-speed coincidence on the other three. It is now `secured: true` + `calls: 0` unconditionally, strict equality **without** a baron, `waves >= secureWave` **with** one — the engine's actual guarantee, with the reason at the call site.
- The six `gr-sim` pins moved with a **named cause** comment each (`F-1493-1: headless progression parity, s1493.`), per the standing prohibition F-1441-3. `git diff 1e19a7d58..472cce4d3 -- scripts/gr-sim.test.mjs` carries 7 such markers.

**`contract.twist.secureWave` was NOT edited.** s1493 rejected the 12 → 14 change by name: the threshold is already bypassed on a baron map, so the edit would change no behaviour it appears to describe while widening the sim's tick budget and rewriting the player-facing "secured wave N" line. F-1492-2 is retired by that measurement; what is left of it is a non-blocking tuning question (F-1493-3, on the desk).

## Evidence — merged tree `1711af799`, which is byte-identical to main at `ff628a132`

`git diff --stat 1711af799 ff628a132` is **empty**, and `git log main..lane/a` is **0** — so this evidence is about exactly what is on main, not about a tree that resembles it.

| Gate | Result | Wall |
|---|---|---|
| `npx tsc --noEmit` | **rc=0** | 4.2s |
| `npm run build` | **rc=0**, asset-diet ceilings respected (Herald dev-path 1,158,214 / 1,500,000 bytes) | 15.2s |
| **`npm run test:node-guards` (FULL)** | **rc=0 — 340 tests / 337 pass / 0 fail / 3 skipped** | 145.1s |
| `e2e/front-door-parity.spec.ts` (own spec) | **4/4** desktop + mobile | 22.1s |
| `e2e/er01-e2-census.spec.ts` (adjacent — the suite that was red) | **8/8** desktop + mobile | 67.7s |
| `e2e/f1297-2-plain-boot-tape-button.spec.ts` (plain boot, no debug flags) | **2/2**, zero console/page errors | 24.4s |

All arms driven through `scripts/gate-battery.mjs` (`--cwd gate-s1494`), transcript `artifacts/s1494-drain-gate.txt`. Every playwright job `--workers=1` per §3.1 (injected by the driver). Ports 5188/5192/5199/5231/5234 probed free before gating.

⚠️ **The runner's own report said `test:node-guards` was `rc=1`, `334/336`** — `node-guards-timeout`'s explicit-budget test timing out at 1000ms, and `fixture-teardown` repeating that child failure. That did **not** reproduce here: same battery, fire shell, `rc=0`, 0 fail. It reads as lane-shell load on a 1000ms budget, not a defect — but it is recorded rather than waved away, and if a later fire sees the same pair red the budget is the thing to look at, not the parity cure.

## Merge classification

Base `22d73f2ec`; six paths touched by the lane.

| Path | Class | Resolution |
|---|---|---|
| `src/sim/HeadlessContractSim.ts` | LANE-TOUCHED (+169/-…) | taken from lane; main never moved it in the window |
| `e2e/front-door-parity.spec.ts` | LANE-ONLY (new, 79 lines) | taken from lane |
| `e2e/er01-e2-census.spec.ts` | LANE-TOUCHED | taken from lane |
| `scripts/gr-sim.test.mjs` | LANE-TOUCHED | taken from lane |
| `docs/bench/e2-readiness-census.md` | LANE-TOUCHED | taken from lane |
| `tasks/BACKLOG.md` | **BOTH-MOVED → resolved to MAIN** | the lane's F-SEED-1 row (1,800 chars) was written mid-run and predates s1492's HOLD; main's row (3,056 chars) already records `⛔ HELD s1492` and the review pointer. Main's is strictly newer and supersedes the lane's. Only the f-seed-1 commit touched this file; `472cce4d3` did not. Row updated to MERGED in the drain bookkeeping commit. |

## Findings

- **F-1492-1 — CLOSED.** The eight adjacent assertions the cure moved are repaired and land with it. `test:node-guards` rc=0 and `er01-e2-census` 8/8 on the merged tree, both measured after the merge, not inherited.
- **F-1492-3 — CLOSED by registration.** `lane-f-seed-1-front-door-parity.md` had no goal leaf (`drain-block-check` returned UNKNOWN / exit 0, which per §3.0 is a bookkeeping finding and never a clearance). A leaf is registered in this drain's bookkeeping commit alongside the `f1493-1-parity-repin` leaf.
- **F-1493-2 — CONFIRMED ON THE MERGED TREE, still declared-not-fixed (non-blocking).** The census assertion is now weaker on baron contracts *by design*: it asserts `secured: true`, `calls: 0`, hash determinism and `waves >= secureWave`, so a regression that made a baron fight *longer* would pass. s1493 declared this when it authored the repair; this drain confirms it is what shipped. It is the honest expressible bound — the engine genuinely does not promise a wave there, and the old equality only ever caught drift by accident on 3 of 4 contracts. If the E2 corpus is ever to detect combat-speed drift, that detector is a **new deliverable** (a pinned outcome, not a contract equality), not a repair to this row. No action owed this fire.
- **F-1493-3 stays on the desk, still non-blocking:** is the Railcar taking until wave 14 to die, under a test rig with 100,000 HP, acceptable tuning for Hill Mine? Nothing gates on it. REC unchanged: accept.

## Player-visible? No — deliberately, and stated so the GZ-01 filter is not silently skipped

The diff touches the headless sim, two test files and a bench doc. The browser game is byte-unchanged (`src/game/`, `src/ui/`, `src/systems/`, `src/entities/` untouched). Under the GZ-01 filter law this merge names **no** player-visible change, so **no gazette item is appended**. What it changes is who can *play* — a model at the public stdin door now meets the same game a human meets in the browser. That is a bench/marketing story for the AP-10d ablation when it reports, not a county news item today.
