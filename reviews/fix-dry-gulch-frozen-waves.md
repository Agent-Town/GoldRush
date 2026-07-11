# Review — fix-dry-gulch-frozen-waves

**Slice/branch/tip:** fix-dry-gulch-frozen-waves · lane/perf · tip `8ba5f224` (runner lane-d) → landed on main as `074618e6`
**Drained by:** s378 fire, 2026-07-12 (idle-attended wave drain #1 of 3)
**Verdict:** ✅ MERGED (tip-graft, not branch-merge)

## What it does
Dry Gulch waves could leave living enemies frozen at the map edge because `WaveSystem.clampSpawn` clamped spawn coordinates to a hard-coded ±38, wider than the actual walkable claim (CLAIM_HALF = CLAIM_SIZE/2 = 32 for the default 64-tile claim). Enemies clamped to ±33..38 landed outside the claim's navigable terrain and stalled. The fix narrows the clamp to the contract-aware `THREE.MathUtils.clamp(value, -Terrain.CLAIM_HALF, Terrain.CLAIM_HALF)`, so spawns always sit inside the real claim regardless of contract tile size. One-line change; the new e2e drives Dry Gulch to wave 18 and asserts no living enemy is left frozen.

## Evidence
| Gate | Result |
|------|--------|
| tsc --noEmit | clean |
| npm run build | green (built in 529ms) |
| e2e/fix-dry-gulch-frozen-waves.spec.ts | 2 passed (desktop-chrome + mobile-chrome, 8.7s) — spec collects console+page errors, none |
| adjacent | no e2e depends on the old ±38 spawn bound (054-baron `teleport(38,-38)` is hero-side, unrelated to enemy `clampSpawn`) |
| boot errors | zero (spec's error buckets empty on both viewports) |

## Merge classification
- **Base:** lane/perf is 44 commits behind main (stale, over superseded Motor `42c4c87a`). NOT branch-merged (would drag Motor + others onto main). Merge-base with main = `46129d4d`.
- **src/systems/WaveSystem.ts** — MAIN-MOVED (main's file is newer than the branch's). Grafted **surgically via Edit**: main's `clampSpawn` body matched the branch pre-image byte-for-byte (`Math.max(-38, Math.min(38, value))`), and both `THREE` (L1) + `Terrain` (L14) imports + `Terrain.CLAIM_HALF` (Terrain.ts:75) already present on main → applied only the one-line hunk. No whole-file checkout (would have reverted main's evolution).
- **e2e/fix-dry-gulch-frozen-waves.spec.ts, artifacts/fix-dry-gulch-frozen-waves/** — LANE-TOUCHED new files → `git checkout 8ba5f224 -- <paths>` (no main version to clobber).

## Findings
None blocking. Contract-aware clamp is strictly safer than the magic number; no gameplay convention changed beyond the bug fix.
