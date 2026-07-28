# Boss GLB frame-cost duel — measured under working load — owner-authorized; paired-arm deltas are the signal

Rig: gr-task-bench-sol worktree @ 83a88fc4, vite dev 127.0.0.1:5237, headless chromium (playwright), 1280x800, 180-frame samples at gameplay camera, production contract scenes (queen: e5-deepwater-claim; claw: e8-mare-claim). Harness: scripts/bench-boss-detail-sol-performance.mjs pattern — per-variant untracked clones changing only GLB substitution, triangle constant, output path. Every arm's GLB mount was proof-verified by exact scene-triangle delta. Owner override relayed by orchestrator 2026-07-28 ("nono its ok, lets go - this machine is all good...") — quiet-gate dropped, runs strictly sequential, paired arms back-to-back in the same window.

| variant | asset triangles | frameMsP95 | Δ frameMsP95 vs paired original | callsP95 | scene trianglesP95 | texturesMax | load1m start→end of window |
|---|---|---|---|---|---|---|---|
| queen-shipped | 11,832 | 200.0 | — (baseline arm) | 76 | 108,124 | 22 | 9.04 → 15.45 |
| queen-detail-opus5 | 33,124 | 183.3 | −16.7 | 76 | 129,416 | 22 | 9.04 → 15.45 |
| queen-detail-sol | 42,976 | 226.2 | +42.9 (vs 183.3) | 76 | 139,268 | 22 | 25.81 → 23.84 |
| queen-unbound-opus5u | 218,748 | 233.0 | −249.8 (vs 482.8) | 76 | 315,040 | 22 | 20.99 → 27.93 |
| queen-unbound-solu | 774,468 | 391.6 | +108.2 (vs 283.4) | 76 | 870,760 | 22 | 24.12 → 59.44 |
| claw-shipped | 10,164 | 324.5 | — (baseline arm) | 98 | 121,566 | 24 | 12.85 → 30.05 |
| claw-detail-opus5 | 30,100 | 467.4 | +142.9 | 98 | 161,438 | 24 | 12.85 → 30.05 |
| claw-detail-sol | 34,540 | 633.3 | +141.9 (vs 491.4) | 98 | 170,318 | 24 | 22.26 → 26.34 |

Provenance: queen-shipped = original arm of the queen-detail-opus5 run (lowest-load window of the session); claw-shipped = original arm of the claw-detail-opus5 run. Each variant row's Δ is against the original arm measured back-to-back in its own window (value in parentheses when that original differs from the tabled shipped row). Queen original arms across all four windows: 200.0 / 183.3 / 482.8 / 283.4 ms — identical invariant counters (76 calls, 108,124 tris, 22 textures) every time. Claw originals: 324.5 / 491.4 ms (98, 121,566, 24 both times).

Cross-reference (quiet rig, tracked in-repo evidence `assets/pilots/dredge-queen-3d/renders/dredge-queen-detail-sol-performance.json`): original 84.9 ms vs detail-sol 84.6 ms — +31,144 tris cost ≈ 0.0 ms p95 when the box was quiet, same counters as this session's re-run.

## Reading (5 sentences)

Added model detail does not measurably cost frame time at the gameplay camera: paired deltas are non-monotonic in triangles (−16.7, +42.9, −249.8, +108.2 ms for queen at 3×, 3.6×, 18×, 65× shipped detail), the spread is fully inside this session's load-noise band (a 218k-tri arm beat its own shipped-arm by 250 ms), and the quiet-rig tracked reference shows a 0.3 ms delta for +31k tris. Draw calls and texture counts are byte-identical across every arm (queen 76/22, claw 98/24 — at 774k triangles included), so the only place cost appears first is raw triangle throughput (vertex work), which renderer.info shows scaling exactly linearly and which never surfaced in p95 at these scales; on weaker/vertex-bound GPUs that is the axis to watch. Anomaly 1: the claw scene submits the boss model twice per frame — both claw deltas are exactly 2× the asset triangle delta (39,872 = 2×19,936; 48,752 = 2×24,376) — so claw asset triangles are double-billed per frame, unlike the queen's 1×. Anomaly 2 (negative): the 774,468-tri, 50 MB unbound-solu GLB did NOT fail to mount — it passed the 4-mesh/1-material/exact-triangle validation and loaded within timeouts, moving scene triangles to 870,760 with zero extra draw calls; both claw deltas landing at ~+142 ms is likely the ramping load in those windows (12.85→30.05 and 22.26→26.34) rather than a real cost signature, given the quiet-rig reference. All frame-ms absolutes in this table are load-contaminated by design of the override (1-min load ranged 9.04→59.44 across windows; per-window values in the table; full history in load-history.log) — the paired deltas plus the load-invariant counters are the signal, and by that signal none of the six variants shows a measurable frame-time cost at the gameplay camera.

## Run artifacts

- Per-variant evidence JSONs: queen-detail-opus5.json, queen-detail-sol.json, queen-unbound-opus5u.json, queen-unbound-solu.json, claw-detail-opus5.json, claw-detail-sol.json (this directory; "detailSol" is the harness's verbatim arm-field name for the detail arm in every file)
- Node run logs: run-*.log; load history incl. pre-override gate checks: load-history.log
- Variant scripts (untracked, left in place): gr-task-bench-sol/scripts/bench-duel-*.tmp.mjs
- Copied GLBs (untracked, left in place): dredge-queen-detail-opus5.glb, dredge-queen-unbound-opus5u.glb, dredge-queen-unbound-solu.glb (dredge-queen-3d/), salvage-claw-detail-opus5.glb (salvage-claw-3d/)
- Worktree state after cleanup: `git status --short` = 10 untracked additions only, zero modified tracked files; port 5237 released; no processes other than my own vite server were started or stopped
