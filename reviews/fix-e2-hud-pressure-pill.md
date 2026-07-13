# Review — fix-e2-hud-pressure-pill (lane-b)

- **Slice:** fix-e2-hud-pressure-pill (Steamworks pressure HUD "×N uses" pill column)
- **Branch/tip:** `lane/m4` @ `648cf3d2` (runner auto-commit; MIDDLE of the stack main→`648cf3d2`→`bf310dfb` promote-era-kit), base `cf006883` (STALE — pre `96d49eb4` run-cast-scale-up)
- **Drained by:** s458 fire, 2026-07-13, via TIP-GRAFT of the `648cf3d2^..648cf3d2` delta onto main `f9e411f8`
- **Verdict:** ✅ MERGE — own spec 4/4 green both projects; the one adjacent red fingerprint-matched identically to pre-existing main.

## What it does
The in-run pressure gauge now carries a small rounded "×N" uses-pill next to the label, where N is the required pressurize count parsed from the contract objective (`/\d+\/(\d+)/`). The verbose objective text moves off the label into the panel's `title` tooltip ("Pressurize windows open waves 8–12"), keeping the gauge readable. The resource panel grid gains a third `max-content` column (desktop + mobile media query) and shifts right to fit the pill. Presentation-only — no pressure sim/economy change.

## Merge classification — TIP-GRAFT (stale base, mid-stack)
`main..lane/m4` is 2-ahead (`648cf3d2` pressure-pill THEN `bf310dfb` promote-era-kit) off stale `cf006883`; a blind merge would revert run-cast AND comingle promote. Grafted the isolated `648cf3d2^..648cf3d2` delta only. Per-file:
| File | Class | Method |
|------|-------|--------|
| `src/ui/Hud.ts` | LANE-TOUCHED (+15/-1) | whole-file cp from idle worktrees/lane-b (main untouched vs cf006883 — verified empty `git diff cf006883..HEAD`; promote-era-kit `bf310dfb` disjoint, does not touch this file) |
| `src/ui/theme.css` | LANE-TOUCHED (+16/-3) | whole-file cp |
| `e2e/e2-pressure-in-run.spec.ts` | LANE-TOUCHED (+20/-3) | whole-file cp |
| `artifacts/e2-pressure-in-run/{desktop,mobile}-chrome-{gauge-safe-band,vent-plume}.png` | MODIFIED | cp |
promote-era-kit (`bf310dfb`, kit-era backdrops + LEDGER + ui-era-dressing spec) left on lane/m4 as a separate undrained item.

## Evidence
| Gate | Result |
|------|--------|
| `npx tsc --noEmit` | clean |
| `npm run build` | green (Game 527.33 kB / index 1177.31 kB, built 1.46s) |
| own spec `e2-pressure-in-run` | **4/4 PASS** (desktop-chrome 2/2 + mobile-chrome 2/2) — coal feeds boilers / pressure vents / PRESSURIZE completes; boilers remain Hill Mine-only |
| boot / console | zero console/page errors (exercised by the passing full-boot scenarios) |
| adjacent `e2-pressure-economy` | 4/6 pass; **:94 (×2) fingerprint-matched to CLEAN main** |

## Findings
- **F-1 (non-blocking, PRE-EXISTING on main):** `e2-pressure-economy:94` "debug Steamworks epoch override shows pressure chip and exchange rows" fails on desktop AND mobile — `hud-pressure` section stays `hidden` under `?debug&epoch=epoch-2-steamworks&nowaves&nolevel`. Proven pre-existing: reverting Hud.ts + theme.css to clean main `f9e411f8` and re-running yields the IDENTICAL 2 failures, same hidden-section error. It is a pre-existing E2 epoch-override pressure-chip visibility drift, unrelated to the pill column — corrective owed (separate task), does NOT block this merge.
