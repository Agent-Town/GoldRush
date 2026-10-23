# Assayer sync visibility — accepted drain

Slice: assayer-sync-visibility-1. Branch: sol/open-findings-astra. Lane tip: 4fe2becb802a78136f3a5e4256897c2c8154e563. Code merge: b5d6d3c3248fdf0c4f61c853c040b651c650cf4f. Fire: s3307, 2026-10-23.

## Verdict

ACCEPTED for integration. All functional gates passed, and the policy check on the live main board returned CLEAR. The original composite driver returned 1 because its policy job refused a linked worktree (rc 2); the documented live-root rerun returned 0. This is an instrument-location correction, not a policy waiver. No assertion was weakened and no control attribution was needed.

## Behavior

A failed rsync or remote sed/restart during assayer synchronization now prints its failing half, exit codes, and last ten scrubbed diagnostics. It records the build and UTC time in the local drift marker. Success clears the marker. The health watcher uses its existing alert mechanism immediately and at most once per hour while drift remains. Its status format and the current JSON-aware API health probe are retained.

This is an operations change: the player sees the existing game in a plain boot. It makes an out-of-date replay copy visible to operators; it does not change gameplay, the mirror allowlist, Pages publishing, or the existing missing-host/unreachable prechecks. No production deployment or remote write was performed for this drain.

## Evidence

All paths below are under `artifacts/assayer-sync-visibility-1/drain-s3307/`.

| Check | Measured result | Evidence |
|---|---|---|
| TypeScript | exit 0, 6.1 s | drain-gates.txt |
| Normal / E1 builds | exits 0 / 0, 26.4 / 9.9 s | drain-gates.txt |
| E1 first-town payload | 34,355,296 B < 52,000,000 B | drain-gates.txt |
| Slice and adjacent script guards | 126/126 passed; includes four new fixture tests | drain-gates.txt |
| Diff-selected batteries | 5/5 passed; full Node exit 0 in 2,453 s; power p95 0.326 ms | guard-stats.jsonl, drain-gates.txt |
| Shell syntax | both scripts exit 0 | shell-syntax.txt |
| Deploy contracts | 15 PASS checks including schedule; site contract seven scenarios | deploy-contract-gates.txt |
| Browser warm-up | 1/1 passed | browser-gates.txt |
| task-025, m1-01, m2-01 | 34/34 passed on desktop and mobile, 2.8 min | browser-gates.txt |
| Plain boots | 2/2 passed; 1280x800 and 390x844; zero console/page errors; no debug flag | browser-gates.txt, *-plain.json, *-plain.png |
| Engine identity | unchanged aa1435e29f312553b1fa9329ca6872bb1601a5b82b50741c400b95de8be895a3; already registered | engine-final.json |
| Sensitive output scan | 11 new/changed lane files; zero secret-pattern or configured-host hits | new-content-scan.json |

The permanent diff-selected runner retains each suite's actual exit and duration, not the full Node suite's test count; no unrecorded count is claimed. Tests use .nvmrc Node 26.4.0. The canonical production assay runtime is separately pinned to 26.12.1. Every Playwright command used --workers=1. The occupied 5297 port was left alone; this fire started and stopped only its own Vite on 5317.

## Merge classification and adaptations

Base 4cd9cfc6124c059dcee55f1e0d8860dcc45d7af0; initial main 231d1145d. package.json and health-watch.sh had also moved on main. The single package conflict was resolved by retaining main's entire roster and adding the new guard exactly once. Health merged additively, retaining main's JSON-aware probe. deploy.sh was lane-only; the guard and seven implementer evidence files were new. Full classification: classification.md. The later main merge brought only lock/dashboard bookkeeping; application and test sources stayed identical to the gated code merge.

The implementer and runner could not commit because an empty October 20 lane index lock remained. With no open handle and no live owner, the fire moved it aside into artifacts/s3307/lane-a-index-lock-20261020-preserved and committed only the task's paths as 4fe2becb802a78136f3a5e4256897c2c8154e563. No reset, deletion, retry, or dispatch occurred. Detached arena npm ci exited 0 and git status was clean before the merge. The scratch art store is at main 5793a967da46e8f00c0ba16f92f17dc10d36558d; no art changed.

The full diff-selected guard stage took 2,456.9 seconds and exceeded the fire's approximate 35-minute drain budget during its first drain. No additional drain was started. Since this diff changes no ENGINE_SOURCE_INPUTS, sim, system, or entity source, the fire protocol's conditional post-fast-forward Node rerun does not apply. The required full suite already passed on the merged code; the final ledger battery follows the actual ledger edits.

## Findings and remaining work

F-SRV-3 is resolved for the specified mid-step visibility defect. No new product finding or implementation remainder. The historical remote sync failure's exact cause is unavailable because the old script discarded it. Future authorized deployments use these diagnostics; this fire did not publish a build. The local done-move is terminal-renamed after the fast-forward, respecting .gitignore's runner-state policy.
