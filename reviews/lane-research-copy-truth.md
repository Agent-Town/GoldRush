# Review — lane-research-copy-truth (Twin Banks playtest corrective, MQ-7)

- **Slice:** lane-research-copy-truth — research nodes tell the truth: no meta-copy, no purchasable stubs
- **Branch/tip:** lane/e2-arsenal @ `a6488a68` "runner(lane-c): lane-research-copy-truth.md"
- **Base:** `87452497` (2026-07-19 21:19, ~8h stale)
- **Drained by:** s748 fire → main merge `39a6dfb0` (parents `fbb29235` main, `a6488a68` lane)

## Verdict
**MERGE — clean 3-way (ort auto-merge, no conflicts).** Despite the 8h-stale base, the merge-base 3-way resolved every file with no conflict markers; the one Game.ts hunk (line 3894) is disjoint from this fire's two prior Game.ts drains (pause-goal ~6924, crossing-armed ~1129–6330). All 8 research specs green both projects.

## What it does
Answers the owner's Twin Banks note — a research node leaked meta-copy *"Arrives with a future Frontier update"* (owner: *"does that mean another epoch?"* — no, it was a placeholder stub). The fix makes every visible research node **speak in-world truth and only sell what's implemented**: removes the `FUTURE_RESEARCH_ARRIVALS` / `FUTURE_RESEARCH_ARRIVAL_OVERRIDES` meta-copy tables ("a future Frontier update", "the Motor Frontier", …) and the "Unlocks: … Arrives with {era}." reveal line. Uncertified/unimplemented nodes now read `The Assay Office has not certified this technique yet.` (scope THE TOWN, non-purchasable); live nodes show their real `node.effect` (scope EVERY RUN). The purchasable-frontier picker no longer offers a lone unimplemented stub (falls back to a Continued Study pick). Touches the chart UI, ResearchTree copy/gating, and 6 epoch contract manifests + Voice/CharterSchema/BuildSystem alignment.

## Evidence
| Check | Result |
|-------|--------|
| `npx tsc --noEmit` | clean |
| `npm run build` | green, 1.06s |
| `research-impact-law.spec.ts` (incl. `:43` "only implemented nodes are purchasable and every visible node speaks in-world truth", `:83` Schoolhouse/Elder same impact law) | **PASS** both projects |
| `research-chart.spec.ts` (7 tests: unlock icon key, node states/pins, no false marks, retired-research, exhausted-frontier Continued Study) | PASS both projects |
| `e3/e4/e5/e7/e10-research-tree.spec.ts` (uncertified bank renders without purchasable picks) | PASS both projects |
| `e8-arsenal.spec.ts` (storybook grid gating + nonlethal grapple) | PASS both projects |
| Battery total | **30 passed / 0 failed** (1.5m) |
| src grep `future Frontier update` / `Arrives with a future` | zero hits (meta-copy fully removed) |

## Merge classification (base `87452497`, 3-way)
- **Game.ts** — MAIN-MOVED this fire (pause-goal + crossing-armed) + LANE-TOUCHED; single lane hunk @ 3894 disjoint → ort auto.
- **ResearchChart.ts / ResearchTree.ts / Voice.ts / CharterSchema.ts / BuildSystem.ts** — main did not move them since base → clean lane apply.
- **6 epoch manifest.json + 8 research specs** — clean lane apply (main untouched since base).
- **22 artifact PNGs** — regenerated baseline screenshots, merged as lane evidence.
- No STATUS comingle, no conflict markers, tsc confirms coexistence with the two prior same-fire Game.ts drains.

## Findings
- **F-1 (carried, non-blocking):** the fire-wide pre-existing `m1-01:70` / `m2-01:322` reds (see `reviews/lane-pause-goal-progress.md` F-1) not re-run here; unrelated to research copy.
- No new findings. Firewall held: chart copy + node gating; sim untouched.
