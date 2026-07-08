# Review — 054 THE BARON, EPIC (lane/m4)

**Slice/branch/tip:** 054-baron-epic · `lane/m4` · `493d251` "balance: make Baron an epic boss"
**Merge base:** `ecc3155` (33 commits behind main at drain time)
**Merged onto:** main `795909c` (s186 lock) via 3-way `--no-ff`
**Drained:** s186 fire, 2026-07-08
**Verdict:** ✅ PASS — merge clean, full battery green, firewall honored.

## What it does
Turns the wave-20 Baron from an unremarkable elite into an epic first boss per the owner's 2026-07-08 ~06:45 ruling ("4x as big… 4 times as much [health/power]… rampages the structures and the player has to run and kite it… really epic and difficult"). Manifest stats scale up; the Baron adopts the wrecker structure-targeting path at boss scale (rampage when no hero in pursuit range); a chunky always-on world-anchored boss HP bar rides the existing object-frame bar machinery; his hits reuse blast-class vfx at scale + the palisade-crack sound; his spawn fires one subtle camera impulse (the single owner-granted camera-feel exception). Contact/building damage now flow through the SAME `CombatSystem` resolver via per-enemy values — no damage-path fork.

## Stat table AS SHIPPED (`assets/contracts/epoch-1-frontier/contracts.json` → baron)
| field | was | now | intent |
|---|---|---|---|
| hpScale | 40 | **160** | ×4 health |
| scale | 1.4 | **4** | ×4 visual (~2.8× hero); collider scales with visual |
| speedScale | 0.8 | **0.75** | kite viable (hero base speed opens gap) |
| contactDamageScale | — | **4.25** | 2 hits drop plated hero, 3 unplated |
| buildingDamageScale | — | **12** | palisade in ~2 hits |
| supportBuildingDamageScale | — | **8** | turret/sluice in ~3 hits |
| pursuitRange | — | **45** | rampage re-targets structures outside this |
| escortCount | 8 | 8 | unchanged (now spawn-ring escort) |

## Evidence
| gate | result |
|---|---|
| `npx tsc --noEmit` | clean |
| `npm run build` | green (252ms; 1.28MB chunk warning is PRE-EXISTING, not introduced) |
| `e2e/054-baron-epic.spec.ts` | **10/10** (5 scenarios × desktop+mobile), 2.6m — spawn+bar+1-impulse, unkited wreck hit-counts, stationary-dies-≤3 + kite-opens-gap, scaled-collider-accepts-edge-hits, wave-20 kite build survives 60s + wins <180s + deterministic |
| adjacent `e1-baron` + `m1-01` + `m2-01` + `task-025` | **52/52** both projects, 1.9m — incl. task-025:145 wet-powder GREEN (F-181-1 resolved on main) |
| plain-boot probe `044-start-screen` + `profile-first-boot` | **22/22** both projects, 9.9s — zero console/page errors, desktop + 390px |
| screenshots | `artifacts/054/` (baron scale-bar, rampage, kite-gap, kite-chip-60s, kite-chip-win) desktop+mobile |

## Merge classification
Base `ecc3155` IS an ancestor of main (`merge-base --is-ancestor 493d251^ main` = true); 493d251 is a single commit on top. `git merge --no-ff` auto-merged with **zero conflicts**. Files needing 3-way (both lane and main moved since base) and resolved automatically: `contracts.json`, `Enemy.ts`, `Game.ts`, `ContractFamilies.ts`, `vite-env.d.ts`. Staged set == 493d251's 33 files exactly (10 new 054 shots + 10 re-rendered baron-presence shots + 13 src/e2e/assets). No conflict markers. The misleading `git diff main..lane/m4` two-way (158 files, -3845) is an artifact of the 33-commit-stale base, NOT deletions this merge makes — verified via single-commit `git show --stat`.

## Findings
- **F-054-1 (non-blocking, owner FYI):** `CombatSystem` generalized enemy hit detection from global constants (`Balance.enemy.touchRadius`, `sparkRig.boltRadius+touchRadius`) to per-enemy `enemy.hitRadius`. This is the correct enabler for the ×4 collider accepting edge hits, but it touches hit detection for ALL enemies, not just the Baron. Covered green by `m1-01` stress-120, `m2-01` draw-call budgets, and `task-025`. Extension, not a fork — one-writer/damage-resolver law preserved.
- **F-054-2 (OWNER VERDICT REQUESTED):** the single Baron-spawn camera impulse is the ONLY camera-feel exception ever granted (task ruling, owner-implied by "epic"). Shipped subtle (`CameraRig.impulse` clamps amount to ≤0.15). Robin: confirm the shake feels right or ask to cut it — reversible one-liner.
