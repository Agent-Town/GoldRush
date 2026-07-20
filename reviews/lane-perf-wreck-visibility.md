# Review — lane/perf wreck-visibility (drain)

**Slice/branch/tip:** lane/perf `0efc370a` (fix: make wreck rubble readable on sculpted ground) → merged to main `039af30d`
**Base:** merge-base `098d47f2` (on main — the attended "wreck visibility diagnosed" commit).
**Verdict:** ✅ MERGED (s756 fire, drain #2).

## What it does (player-visible)
Wrecked buildings now render as a cylinder-based rubble mound (`rubbleGeometry`) and keep their repair marker held above the mound, so a wreck sitting on sculpted/sloped ground reads clearly instead of sinking into the terrain slab. Closes the attended-diagnosed "wreck visibility on sculpted ground" finding (`098d47f2`).

## Merge classification (per file)
| File | Class | Handling |
|------|-------|----------|
| `e2e/wreck-visibility.spec.ts` | CLEAN-ADDITIVE (new) | checkout from lane/perf |
| `src/game/Balance.ts` (+6) | CLEAN-ADDITIVE | main untouched since base `098d47f2` (verified `git log 098d47f2..main -- Balance.ts` empty) → checkout |
| `src/systems/BuildSystem.ts` (+71) | 3-WAY | main's only delta vs base was the s756 `repairCount` getter (+4, from the collision drain `109e76cc`); checked out perf's version (rubble geometry + `ruinDetails` diagnostics, different regions) and manually re-added the getter before `get diagnostics` |

## Evidence
| Gate | Result |
|------|--------|
| `npx tsc --noEmit` | clean |
| `npm run build` | ✓ built in 1.13s |
| `e2e/wreck-visibility.spec.ts` | 4/4 desktop + mobile (single-worker, 16.3s) |
| `e2e/never-trap.spec.ts` (adjacent — same BuildSystem repair path) | 6/6 desktop + mobile (23.1s) |

## Findings
- None blocking. The BuildSystem 3-way is clean (wreck's rubble/ruinDetails hunks and the s756 repairCount getter are in disjoint regions; both compile + pass).
- No goal-tree leaf (ad-hoc playtest corrective).
