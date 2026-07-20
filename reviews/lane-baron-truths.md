# reviews/lane-baron-truths.md — the Baron's body obeys the fort + his bar joins the book

- **Slice:** lane-baron-truths (E1 Baron playtest corrective #2 — LANE-D)
- **Branch / tip:** `lane/perf` @ `a56f0197`
- **Merge commit:** `e847c468` (`git merge --no-ff lane/perf` onto clean main `799f95a6`)
- **Base:** `bd27bd7f` (fresh — main moved ONLY `STATUS.md` since base → disjoint, clean merge, no 3-way)
- **Drained by:** s759 fire (merge committed 2026-07-20 12:57 local), **review authored + gates re-confirmed by s760** (dead-fire recovery: s759 committed the merge then its `claude -p` process exited before writing this review, the gazette entry, and its handoff — `main..lane/perf` is EMPTY = fully merged and immutable; s760 finished the owed deliverables and re-ran the gate on HEAD `e847c468` to substantiate an honest evidence table).

## Verdict: PASS — merged (recovered).

## What it does (one paragraph)
Closes OWNER PLAYTEST 2026-07-19 follow-ups on the Claim-Jumper Baron. (1) **The body now comes from the fort, not a compass string.** The previous slice threaded a `spawnEdge` datum so the *banner* announced the north; the owner then saw the Baron's *body* enter from the south — the announce and the physical spawn had diverged. baron-truths introduces a single source, `src/game/BaronFort.ts`: it reads the `fortified_far_bank` landmark mount's `(x,z)` from the e1-baron terrain contract and derives the edge **geometrically** — `|x|>|z| ? (x≥0?'east':'west') : (z≥0?'north':'south')`. Both the physical spawn (`WaveSystem.spawnBaron`) and the banner + boss-arrival story signal (`Game.ts`) now call `baronArrivalEdge(contract)`, so body and announcement agree **by construction** — no compass word that could flip between world-z and screen. (2) **The bar joins the book.** The Baron's bespoke 8-segment health bar (`BARON_HP_SEGMENTS`) is retired for the shared boss-bar component (`BOSS_HP_MAX_SEGMENTS`), object-anchored per the billboard law: the bar state now carries a `yaw`, and the renderer orients the bar to the Baron's `group.rotation.y` when yaw is present (camera-billboards only for the yaw-null grouped case). The canvas dataset exposes `bossBarComponent='shared'` + `bossBarAnchor='object'` for the spec. Bar height lifted +1.75→+2.45·visualScale so it clears the taller Baron model.

## Evidence (re-confirmed by s760 on merged HEAD `e847c468`)
| Gate | Result |
|---|---|
| `npx tsc --noEmit` | clean |
| `npm run build` | green, 911ms |
| slice spec `e2e/lane-boss-healthbar.spec.ts` | **2/2 passed** (desktop + mobile) — asserts shared component dataset + green-remaining/red-depleted + object anchor |
| slice spec `e2e/lane-baron-arrival.spec.ts:50` (NEW half-plane assertion) | **2/2 passed** (desktop + mobile) — "Baron body, motorcade, and arrival card derive their side from the fort" |
| adjacent `e2e/lane-baron-arrival.spec.ts:42` (boot economy, pre-existing) | contention-red in the concurrent 2-project batch (30s timeout), **GREEN isolated single-worker BOTH projects** (desktop 24.2s / mobile 23.1s — slow Baron-economy boot runs right up to the 30s cap, tips over only under concurrent load + the orphan vite :5207 / playwright.accounts pids loading the box). Fingerprint decisive: identical test, green alone, both viewports. |
| boot probe | the slice specs boot the e1-baron contract plain across desktop 1280×800 + mobile 390×844 and assert zero console/page errors |
| perf | no new entities; the bar swap reuses the shared boss-bar mesh (retires the bespoke Baron bar) — no draw-call/frame regression |
| bar screenshot | `reviews/shots-bossbar/desktop-chrome-mid-fight.png` + `mobile-chrome-mid-fight.png` (committed in `e847c468`) |

**Fort-side derivation in one sentence (task END):** the Baron's edge is computed from the `fortified_far_bank` landmark's `(x,z)` — `|x|>|z| ? (x≥0?east:west) : (z≥0?north:south)` — via the single `baronArrivalEdge()` source that feeds BOTH the spawn and the banner, so the body and the announcement can never disagree.

## Merge classification (base `bd27bd7f`)
`git diff bd27bd7f main -- <touched files>` = disjoint (main moved only `STATUS.md` since base) → clean `--no-ff` merge, no conflicts.

| File | Class | Note |
|---|---|---|
| `src/game/BaronFort.ts` | NEW (+18) | single fort-coord source + `baronArrivalEdge()` |
| `src/game/Game.ts` | LANE-TOUCHED (+3/−1) | banner + story-signal edge from `baronArrivalEdge` |
| `src/systems/WaveSystem.ts` | LANE-TOUCHED (+3/−1) | physical spawn edge from `baronArrivalEdge` |
| `src/entities/pools.ts` | LANE-TOUCHED (+13/−4) | bespoke bar → shared boss bar, `yaw` anchor, dataset flags, +2.45 height |
| `e2e/lane-boss-healthbar.spec.ts` | LANE-TOUCHED (+3) | shared-component/anchor assertions |
| `e2e/lane-baron-arrival.spec.ts` | LANE-TOUCHED (+18/−5) | half-plane spawn assertion (`:50`) |
| `e2e/e1-baron.spec.ts` | LANE-TOUCHED (+3/−1) | edge assertion aligned to fort derivation |
| `assets/contracts/epoch-1-frontier/contracts.json` | LANE-TOUCHED (−1) | drop stale spawnEdge literal (now derived) |
| `reviews/shots-bossbar/*.png` | ARTIFACT | mid-fight bar screenshots |

## Findings
- **F-1 (non-blocking, contention false-red — PROVEN):** `lane-baron-arrival.spec.ts:42 "Baron boot has no palisade tax and spends no repair gold"` timed out (30s) on both projects in the concurrent batch but passes isolated single-worker on both (24.2s / 23.1s). This test predates baron-truths (it's the prior arrival slice's economy assertion) and the drain edited the file only for the `:50` half-plane addition. The slow Baron-economy boot sits near the 30s cap; any concurrent load (2 playwright projects + the orphan vite :5207 + the orphan `playwright.accounts` pids) pushes it over. No regression — matches the documented gate-battery-contention pattern. A future ease could bump this spec's timeout or serialize it, but it is not owed by this slice.
- **F-2 (recovery note, non-blocking):** s759 died between the merge commit and its bookkeeping — this review, the gazette entry, and the leftover queue-file deletion (`tasks/queue/lane-d/lane-baron-truths.md`) were all owed and completed by s760. No goals.json leaf exists for baron-truths (it is a `fix:`-prefix playtest corrective, not a goal-tree ladder rung — grep `baron` in goals.json returns only the old `lane-b-054-baron-epic` taskFile), so no goal registration was owed. The e1-baron.spec.ts 8 stale reds documented as F-1 in `reviews/lane-baron-arrival.md` remain the standing pre-existing set (unchanged here; out of firewall) and still await their own snapshot-refresh corrective.
