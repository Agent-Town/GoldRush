# Review — cw-02-escort (tram escort on the gorge)

- **Slice:** cw-02-escort (lane-c #2, "feat:")
- **Branch/tip:** `lane/e2-arsenal` @ `17dba1ec`
- **Base:** `af7eaa79` (runner reset lane-c to main before running, per s587)
- **Drained by:** s589 fire — 3-way graft onto main `d2a886c9`
- **Verdict:** ✅ MERGE — all gates green; stale-base 3-way graft against the just-merged e4-06 Game.ts, verified complete.

## What it does (player-visible)
Extends escort mode with a **tram** vehicle (alongside the existing ore-cart) on the epoch-3-voltage **Canyon Works** contract. Boot with `?mode=escort` on the Canyon board: a tram carries **one capacitor crate** up the switchback rail toward the rim consumer; a **brown-out halts** it mid-route; saboteur wreckers preferentially strike the **feeder-beacon span ahead of the tram** (`preferredTramEscortSpanTarget`), and on repaired delivery it pays out gold at the rim with a "CAPACITOR CRATE DELIVERED" banner + float text. Cart destruction loses only the escort objective (escort-mode invariant preserved).

## Evidence
| Gate | Result |
|------|--------|
| `npx tsc --noEmit` | clean |
| `npm run build` | green, 745ms |
| `e2e/cw-02-escort.spec.ts` (own spec) | **2/2** desktop-chrome + mobile-chrome (26.9s) |
| `e2e/e2-escort-mode.spec.ts` (escort grammar) | pass (both projects) |
| `e2e/e4-landyacht-boss.spec.ts` (shares grafted Game.ts region) | pass — **confirms 3-way graft preserved e4-06** |
| `e2e/e3-blackout-ridge.spec.ts` + `e2e/e3-canyon-works.spec.ts` (epoch-3-voltage consumers) | pass |
| adjacent battery total | **18/18** (56.4s) |
| boot probe `_s106-prospector-boot-probe` + `profile-first-boot` (incl 390px picker) | **12/12** |
| Screenshots | `artifacts/cw-02-escort/{desktop,mobile}-chrome-{brown-out-halt,crate-delivered}.png` |

Zero console/page errors across all playwright boots (harness fails on uncaught page errors; none observed).

## Merge classification
Lane base `af7eaa79` predates main's e4-06 (LandYachtBoss) + e4-05 (DustFlats) + dust-flats typing merges. Per-file:

| File | Class | Resolution |
|------|-------|-----------|
| `e2e/cw-02-escort.spec.ts` | LANE-only (new) | `git checkout lane` — main==base |
| `src/entities/TramPath.ts` | LANE-TOUCHED, main==base | `git checkout lane` clean |
| `src/systems/WaveSystem.ts` | LANE-TOUCHED, main==base | `git checkout lane` clean |
| `assets/contracts/epoch-3-voltage/contracts.json` | LANE-TOUCHED, main==base | `git checkout lane` clean |
| `src/meta/ContractFamilies.ts` | **BOTH moved** (main +33 new tile types ~363; lane +2 escort fields ~454) | disjoint regions → surgical Edit: added `vehicle?`/`reverseRoute?` to `ContractEscortMode` |
| `src/game/Game.ts` | **BOTH moved** (main = e4-06 land-yacht boss wiring, disjoint; lane = 4 escort/tram hunks) | surgical Edit of all 4 cw-02 hunks onto main's e4-06 tree; verified graft complete (no cw-02 escort/tram lines dropped vs lane; e4-06 lines all retained) |

## Findings
- **F-1 (correction, non-blocking):** s588's handoff claimed cw-02's `epoch-3-voltage/contracts.json` "got swept to main via `git add assets/`." **VERIFIED FALSE** — main==base for that file; it was NOT on main. Landed here as a clean LANE-TOUCHED file. (VERIFY-DON'T-INHERIT.)
- No blocking findings. cw-02 firewall (canyon contract modes + spec + artifacts + the shared TramPath/WaveSystem/Game escort plumbing) respected.
