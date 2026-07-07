# Review — e1c-night-shift (E1 contract C5, "The Night Shift")

**Slice:** e1c-night-shift · **Branch:** lane/polish · **Lane tip:** `375c919` ("feat: add night shift contract") · **Base:** parent `e8462f7` (s134 lock, main-ancestor) · **Merged onto:** main `b31f7ce` → merge commit this drain · **Drained by:** s137 fire, 2026-07-07.

## Verdict: SHIP ✅ (one semantic-merge orphan caught + fixed, F-S137-1; adjacent battery clean bar one confirmed load-flake).

## What it does
Adds the E1 "Night Shift" contract (`?contract=e1-night-shift`): a shorter claim run where **sight is the resource**. A light-ramp schedule drives the map full→dusk (wave 5)→true-dark (wave 10+)→**dawn victory at wave 25**. A **render-only fog-of-dark** dims enemies toward black by distance-to-nearest-light while the **sim stays untouched** — turrets still acquire, route, and damage dimmed enemies (the spec proves the split). Light sources: beacons ×1.5 radius under this contract, turret muzzle glow, hero lantern, and a contract-gated **lantern-post buildable** (cheap, light-only, reusing the build-menu machinery). Board-row metadata (vein-hunter tag, science≥3 unlock) is data for Town T3. Additive knobs in `Balance.contracts.nightShift`; LightRig gains the ramp + dimming pass; BuildSystem gains the gated lantern-post entry.

## Evidence
| Gate | Result |
|------|--------|
| `npx tsc --noEmit` | clean (after F-S137-1 fix) |
| `npm run build` | green, 590ms |
| `e2e/e1-night-shift.spec.ts` | **10/10** (desktop+mobile), 49.5s — ramp at specced waves · dimmed-but-still-targeted proof · lantern-post only here · dawn victory @25 · seeded determinism · dark render budget stable |
| Adjacent battery (single-worker) | **77/78** — 044-start-screen · bt-01-tiers · m2-01-build-menu · m4-10-agent-actions-integrity · sci-04-contract-registry · e1-dry-gulch · gt-02-slope · town-t1-square · w1-03-light |
| — the 1 red | `bt-01-tiers:249 sluice tier … out-earns two tier-1 rates` (mobile only) — 8s `.poll` on yield accumulation timed out under 7.8min-battery + live lane-b-runner load; **passed isolated single-worker in 4.3s** → confirmed load-flake, NOT a regression (merged sluice economics correct) |
| Plain boot | 044 "plain boot shows the Storybook start menu" green both projects (clean console/page) |
| Screenshots | `artifacts/e1-night-shift/{dusk-wave-5,dawn-wave-25,true-dark-lantern-ring}` × desktop+mobile (in commit) |

## Merge classification (base `e8462f7` → onto main `b31f7ce`)
`git merge --no-ff --no-commit lane/polish` (lane/polish exactly 1 ahead = just night-shift; cherry-pick is permission-blocked headless). 18 files:
- **NIGHT-SHIFT-ONLY (main untouched since base — clean auto-apply):** `assets/contracts/epoch-1-frontier/contracts.json` (+30) · `e2e/e1-night-shift.spec.ts` (new) · `src/assets/generated.ts` · `src/entities/pools.ts` (+115) · `src/game/RunManager.ts` · `src/game/buildables.ts` (+21, lantern-post def) · `src/world/LightRig.ts` (+69) · `artifacts/e1-night-shift/*` (6 pngs).
- **MAIN-MOVED overlap (3-way auto-merged textually clean):** `src/game/Balance.ts` · `src/game/Game.ts` · `src/meta/ContractFamilies.ts` · `src/systems/BuildSystem.ts` · `src/vite-env.d.ts`. Main's drift = 050/m4-10/gt-02/town-t1. All auto-merged without conflict markers.

## Findings
- **F-S137-1 (RESOLVED, non-blocking) — semantic-merge orphan in Game.ts import.** The textually-clean 3-way left `Game.ts` broken (`tsc TS2304: Cannot find name 'buildableDefs'`). Cause: night-shift removed `buildableDefs` from the `./buildables` import because it refactored its only usage (`selectBuildableByIndex` → `this.buildSystem.buildableSnapshots[index]`); that refactor correctly won the merge. But **main independently added** `buildableIdFromString` (m4-10 lineage) which still calls `buildableDefs.some(...)`. Textual merge kept both sides → orphaned symbol. **Fix:** restored the import to the union `import { buildableDefs, type BuildableId } from './buildables';` — the correct reconciliation (merged code needs both). Confirmed `buildableDefs` still exported (buildables.ts:28) and used by merged Game.ts + BuildSystem.ts. This is a textbook Mistake #15 catch (textual-clean, semantically-broken merge) — logged so twin-banks (next drain, also touches Game-adjacent shared files) gets the same tsc-first scrutiny.
- No blocking findings. Firewall respected (contract data + render dimming + additive light knobs + gated lantern-post + e2e/artifacts; sim/CombatSystem/WaveSystem/default-claim untouched — verified via the dimmed-but-still-targeted spec + gt-02/m4-10/e1-dry-gulch adjacent greens).
