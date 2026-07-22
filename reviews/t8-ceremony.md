# Review — T8 THE COLONY SEED (era door E8→E9), SAGA WALL slice 3/5

**Slice/branch/tip:** lane-t8-ceremony · lane/perf · tip `c452c89c` (runner(lane-d))
**Base:** `8eccb2ea`. **Merged onto main after T6+T7** (d976837f) — real 3-way (main-with-T6-T7 and lane both grew `src/ceremony/scripts.ts`, `e2e/ceremony-framework.spec.ts`; lane also reworked `CeremonySystem.ts` in regions disjoint from T7's → auto-merged clean).
**Verdict:** MERGED (s896), `git merge --no-ff lane/perf`, conflicts resolved by UNION.

## What it does
Adds the eighth era-door ceremony, closing the Orbital Frontier and arming the Red Fields (E8→E9) — SAGA WALL slice 3/5 (F-REH-01). `T8_THE_COLONY_SEED` introduces a **new `typed-entry` hand kind**: the player TYPES the colony's name ("THE RIVERWARD") to arm the era — a wrong name (e.g. "THE DUSTWARD") does nothing; only the exact expected string submits. Canon: no countdown, radio silence, a long burn toward the red dot, the town goes back to work under the promise; frontier-tech, no firearms, illustrated. `CeremonySystem` gains the typed-entry form render (`ceremony-name-input`), submit/keyboard handling, focus/disable wiring, and a done-phase kept-image draw fix; `epoch-8-orbital` manifest successor `null → epoch-9-redfields`. T8 has no stages.ts painter yet → uses the existing `drawGenericStage` fallback (display-safe; a dedicated drawT8 is a fair non-blocking follow-up).

## Merge classification (3-way)
| File | Class | Resolution |
|---|---|---|
| `src/ceremony/CeremonySystem.ts` | BOTH-MOVED (T7 on main; T8 on lane) — **disjoint regions** | auto-merged clean |
| `assets/contracts/epoch-8-orbital/manifest.json` | LANE-TOUCHED | auto-merged clean |
| `src/ceremony/scripts.ts` | BOTH-MOVED | UNION — kept T6+T7 blocks + added T8; registry `[T3,T4,T5,T6,T7,T8]` |
| `e2e/ceremony-framework.spec.ts` | BOTH-MOVED | UNION — kept T6+T7 tests + added T8 test; consts `E7,E8,E9`+signal; registry assertion 6-up; **took lane/perf's hardened `openSchoolhouse`** (mouse.click on boundingBox + asserts `schoolhouse-view` — a deliberate flake-fix over the prior `.click()`) |

`typed-entry` hand kind is defined in scripts.ts:44 (CeremonyHand union) — tsc verified.

## Evidence (native macOS, self-server)
| Gate | Result |
|---|---|
| `npx tsc --noEmit` | clean |
| `npm run build` | green ✓ 1.23s |
| ceremony-framework.spec **desktop-chrome** | **12/12** — T6 ✓, T7×2 ✓, T8 ✓ (T5 flaked once on the new opener's boundingBox timing, recovered on retry #1) |
| ceremony-framework.spec **mobile-chrome** (390px) | see handoff (run below) |
| arm-exactly-once E9 + wrong-name-rejected + kept-image + reload persistence | asserted green (T8 test) |
| zero console/page errors | every ceremony test asserts `errors = {console:[],page:[]}` |
| screenshots | artifacts/ceremony-framework/{desktop,mobile}-chrome-t8-{door-ready,hand-waits,done}.png (this gate) |

## Canon check (§9)
Frontier-tech colony launch (Seed hull, domes, the red dot); no firearms; the town works under the promise; illustrated/warm, never gory; the naming is the player's hand (played-not-watched law). PASS.

## Findings
- **F-1 (non-blocking):** no dedicated `drawT8` painter — uses `drawGenericStage`. Display-safe; a follow-up art/stage task can add the Colony Seed staging.
- **F-2 (non-blocking):** the hardened `openSchoolhouse` still flakes occasionally (T5 rhythm test, boundingBox/`schoolhouse-view` timing) but self-recovers on retry — same class as the pre-existing cold-start flake, now with a correctness assertion. No corrective owed.

SAGA WALL slices T9/T10 remain (not yet queued this fire) — F-REH-01 not fully closed until the E9→E10 + E10 finale doors ship.
