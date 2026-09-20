# Frozen-lane classification — lanes a / c / d (s1272)

**Subject:** the three lanes s1271 left frozen (`lane-a`=`lane/m3`, `lane-c`=`lane/e2-arsenal`, `lane-d`=`lane/perf`), each `ahead=2` of main and queue-empty.
**Gated by:** s1272 fire, 2026-07-30.
**Verdict:** ✅ **ALL THREE ARE LOSS-FREE TO RESET — but for TWO DIFFERENT REASONS, and the difference is the whole finding.** lane-a and lane-d hold work main has fully absorbed. **lane-c holds 2 files of content main has NEVER seen**; it is safe only because that exact commit is preserved as the tip of `save/ap-06b-reland-s1218`.

## Why this needed doing at all

s1271 probed the same three lanes and stopped, correctly, at a **file-level** verdict: *"every differing file is `laneChanged=true mainChanged=true`, BOTH MOVED, 3-way-graft territory."* That is true and it is not a loss verdict.

➡️ **BOTH-MOVED is a statement about two blob hashes. It says nothing about whether main already contains what the lane added.** A file classifies BOTH-MOVED whenever main moved on *at all* — including when main moved on by absorbing the lane's own hunk and then adding more. Stopping at the file level therefore over-freezes: it cannot distinguish "main superseded this" from "this would be destroyed."

The question a reset actually asks is one-directional and line-level: **does main already contain every line the lane added?** Two committed probes now answer it.

## The instruments

| Script | Question it answers |
|---|---|
| `scripts/lane-freeze-classify.mjs <branch>` | Per path touched by the lane's ahead-commits: DUPLICATE / LANE-ONLY / MAIN-ONLY / BOTH-MOVED, comparing merge-base vs lane vs main blobs. Exit 1 if any path is unabsorbed. |
| `scripts/lane-absorbed-lines.mjs <branch> <path>...` | For a BOTH-MOVED path: are the lane's *added lines* all present in main? Exit 1 if not. |

Both record a missing path as an explicit `ABSENT` marker rather than a string sentinel — the exact defect s1271 caught in its own probe, where a `git rev-parse` failure scored any path absent at the merge-base as BOTH-MOVED trivially.

### The granularity trap, and the guard against it

`lane-absorbed-lines.mjs` first compares whole lines. That is too coarse for a long single-line record: lane-a's only unabsorbed path is `package.json`, where the lane appended `scripts/gr-sim.test.mjs` to the `test:node-guards` script — **main contains that token and several of its own besides**, so the line differs while the contribution is fully absorbed. The script therefore falls back to token containment.

🚫 **That fallback is deliberately gated at ≥8 distinct tokens, because an ungated token test manufactures false ABSORBED verdicts on exactly the case that matters.** A short code line (`return false;`) carries so few tokens that some unrelated main line contains them all by chance. **Validated on the defective case, not just the clean ones:** with the fallback live, lane-a's `package.json` flips to ABSORBED while **lane-c's `Game.ts` stays NOT ABSORBED at 36/46** — the discriminator discriminates.

## Measured

| Lane | Branch | ahead | paths | DUPLICATE | unabsorbed | verdict |
|---|---|---|---|---|---|---|
| lane-a | `lane/m3` @ `003ed46c` | 2 | 27 | 26 | 0 | ✅ absorbed |
| lane-c | `lane/e2-arsenal` @ `40ea99a4` | 2 | 14 | 10 | **2** | ⚠️ holds unmerged content |
| lane-d | `lane/perf` @ `f2a056c8` | 2 | 43 | 40 | 0 | ✅ absorbed |

**lane-a** — the one BOTH-MOVED path is `package.json`; ABSORBED (token-level, main is a strict superset). Its substantive work (`src/sim/HeadlessContractSim.ts`, `scripts/gr-sim.mjs`, `src/news/herald.ts`) is **byte-identical to main** — same blobs `b0e84bb3` / `c63afcbd` / `1a59ad7e`.

**lane-d** — `src/game/Game.ts` ABSORBED, all 18 added lines present in main (the trail-guide bark queue: `TRAIL_GUIDE_DWELL_MS`, `pendingTrailGuideLines`, `showTrailGuide`, verified by name at `main:src/game/Game.ts:316,1101,4641`). The other two BOTH-MOVED paths are **regenerated screenshots** (`artifacts/trail-guide-beat-priority/*-storm.png`), absent at the merge-base and present on both sides with different bytes — both arms generated them. Per standing law, never gate on the byte identity of a regenerated screenshot; main carries its own copy of the same slice's artifact.

**lane-c** — the two unabsorbed paths are `src/game/Game.ts` (**36 of 46 added lines absent from main**) and `e2e/ap-standing-orders.spec.ts` (**104 of 138**). This is the AP-06b agent-protocol orders surface — `placeBuilding`, `panAt`, `submit_orders`.

## F-1272-1 — lane-c's residue is a LAWFUL STOP, not an undrained drain

Both of lane-c's ahead commits were already triaged; neither is waiting for a gate.

| Commit | Task | Disposition |
|---|---|---|
| `40ea99a4` | `lane-mandatory-welcome.md` | **DRAINED** s1255, merge `bd4c5c18` — hence `e2e/gazette-welcome.spec.ts` + `e2e/release-build.spec.ts` classify ABSORBED |
| `6c44c6f3` | `lane-c-ap-06b-panel-ladder-and-voice.md` | **STOPPED** s1218, case (b) permission-ladder breach — `reviews/ap-06b-panel-ladder-and-voice.md`, finding F-1218-1 |

The AP-06b content is unmerged **on purpose**: the runner declared a ladder breach and stopped where its master told it to, and the cure is owner-gated (the F-1219-1 ruling standing on the desk). So lane-c must NOT be drained — there is nothing here a gate battery could approve.

**Preservation verified at the blob, not inherited from the review:** `save/ap-06b-reland-s1218` has tip `6c44c6f3` — *the lane's ahead commit itself* — and carries `src/game/Game.ts` @ `c9c5b057` and `e2e/ap-standing-orders.spec.ts` @ `4906d177`, identical to the lane's. Resetting lane-c destroys no unique bytes.

## F-1272-2 (low) — the AP-06b review points at the wrong salvage ref for `Game.ts`

`reviews/ap-06b-panel-ladder-and-voice.md` line 4 names the salvage as *"byte-identical to the salvage `save/ap-06b-adapter-wiring` @ `2f216af0`"*. That branch is still at `2f216af0`, but it is the **earlier** `ap-orders-adapter-wiring` commit and its `src/game/Game.ts` is `7b3c9ec5` — **not** the lane's `c9c5b057`. The ref that preserves the stopped tip exactly is `save/ap-06b-reland-s1218`. A future fire following the review's pointer would find a different file and could conclude the salvage had rotted. Non-blocking; corrected here and in the s1272 handoff.

## Retention

Nothing deleted. Each frozen tip was minted as a branch **before** any reset was requested:

| Ref | Tip |
|---|---|
| `archive/lane-a-s1272-frozen-tip` | `003ed46c` |
| `archive/lane-c-s1272-frozen-tip` | `40ea99a4` |
| `archive/lane-d-s1272-frozen-tip` | `f2a056c8` |

All three worktrees were verified to hold **0 uncommitted entries** (`git status --porcelain -uall`) before the reset was requested, so `git clean -fd` in the janitor route destroys nothing either. `save/ap-06b-reland-s1218` is deliberately **left named `save/`**: the salvage lifecycle promotes `save/` → `archive/` only when the re-land MERGES, and AP-06b has not merged.

## Route

Reset is requested through the runner's janitor op (`scripts/lane-runner-v3.sh:124`, `refresh-lane`), the route F-1271-1 established — a fire may not run `git reset --hard` itself, but it may ask the runner, which runs as Robin. One two-line `.req` per lane.
