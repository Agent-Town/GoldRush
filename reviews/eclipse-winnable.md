# Review: eclipse-winnable — the Eclipse is won by play, not by tuning (scratch worktree, Claude Opus 5 implementer, attended drain 2026-09-06 midnight)

**Slice/branch/tip:** `eclipse-winnable` · `fix/eclipse-winnable` · commit `e829e7bc4` on base `53d8552bd` · merged to main: see the ledger row (first-parent merge; collisions `package.json` (guard list) and the ledger).
**Verdict:** MERGED with NO LEVER SHIPPED, and the premise corrected (F-ECW-1). The master started from F-EAWA-1 ("the Eclipse has never been secured by any rider; survival-bound"). Measured tick for tick: heat 12's promoted attempt LOST w19 / 585.2 s with the full fort standing by t ≈ 449 s (four turrets all at tier 2 by 550 s), its purse pinned at 190 of the 200 cap from t = 435 s to death (150 s in which 314 kills' income was refused by `Economy.canReceiveIncome`, `src/game/Economy.ts:266`); the air-wall prover LOST w19 / 588.7 s with the hero untouched at 175 until wave 16. The binding constraint is the fort's damage ceiling over a purse smaller than its own last rung (`Balance.turret.maxCount` 4 at `Balance.ts:535`, `beacon.maxCount` 6 at `:519`, `tiers.turret[2].cost` 300 at `:757` against `economy.bankCap` 200 at `:824`), and the deficit was 11.3 s of a 600 s gate. Then the finding: `MOVE_HERO` landed the same day and the air-wall prover predates it, leaving the hero at (0, 12), six world units north of every gun the map allows. One `MOVE_HERO` to (0, 4), the centroid of the ten works the dome-cluster pad holds, SECURES seed -01 (w20 / 600 s / 80 g / 923 kills, 107.8 hp left, `fnv1a32:f1614ea6`, twice byte-identical); the falsifier at (0, 26) dies at w3 / 113.4 s; and seed -02 secures under the air-wall policy UNCHANGED (w20, 3.0 hp; nobody had run it). Both tapes replay through `assay-replay-agent.mjs` to their own hash with the air latch complete and `{4, 4}` untouched.

Every arm the master named was measured anyway (`artifacts/eclipse-winnable/LADDER.log`): `twist.economy.bankCap` 400 / 1200 are byte-identical no-ops for the prover (income-bound, not purse-bound); `seamYieldMult` 1.4 buys 0.6 s; `hero.maxHpBonus` 100 / 300 secure (71.8 / 271.8 hp); roster `hpScale` 0.8 secures untouched; the fort cap 4 → 5 secures with 10.2 hp (a Balance probe, because a per-contract cap needs five out-of-firewall consumers, F-ECW-3); a second build line secures with 115 hp. None shipped: the map is won by a rider that stands its hero in its own fort, which is the honest answer to "the hard levels can be won".

## Evidence
| Gate | Where | Result |
|---|---|---|
| Measurement | worktree | both rides replayed tick for tick, each reproducing its tape's hash |
| Provers | worktree | seed -01 with one `MOVE_HERO` and seed -02 unchanged, both twice byte-identical, tapes replay |
| Floors | worktree | both Eclipse idle rows byte-identical to the anchors; no engine input touched |
| Guard | worktree | new `eclipse-winnable` 5/5: no balance lever on the Eclipse row (each assertion names the ride the rejected arm bought), the four Balance globals unmoved, the wall `{4, 4}`, `hero_orders` published on this contract, and `MOVE_HERO` proven to steer this map's hero in a real sim drive against an idle control |
| Guards | worktree | eleven files 103/103; bookkeeping guards 123/123 |
| tsc / build | worktree | clean / green |
| e2e | worktree, port 5305, both projects | `e8-remaining-maps-parity` + `er01-e8-census` + `contract-briefings` 30 passed |
| Attended on the merged tree | see the drain commit and the ledger row | tsc clean; era guard 5/5 (no engine input touched, top pin unmoved); `eclipse-winnable` + `e8-crossing-gate-override` + `e8-remaining-maps` + `law-pointer` 44/44; e2e `er01-e8-census` + `contract-briefings` 22 passed (1.5 m) both projects |

## Merge classification
Base `53d8552bd`; main moved by the sprite-cell and audio merges (`package.json` guard list, unioned to 119). `scripts/eclipse-winnable.test.mjs`, `artifacts/eclipse-winnable/*`: NEW. `tasks/BACKLOG.md`: unioned. No `src/`, `assets/`, `e2e/` change.

## Findings
- **F-ECW-1 (corrects F-EAWA-1):** the Eclipse is not survival-broken; the air-wall measurement was one seed by a rider that predates `MOVE_HERO`.
- **F-ECW-2 (structural):** two riders hit two different walls at the same wave: heat 12 purse-bound (190/200 pinned, sink 300 g), the prover income-bound (peak 170 g); a purse raise is a no-op for the second.
- **F-ECW-3:** a per-contract fort cap needs `BuildSystem.ts:3232`, `LightRig.ts:653`, three arsenal systems, `RunSuspend.ts:2665`, `MechanicsManifest.ts:1094` (module-load pool sizing).
- **F-ECW-4 (OWNER'S DESK, design fork):** if the Eclipse should be EASIER than "winnable by a rider that stands its hero in its own fort", the cheapest honest picks are the second build line (pure data, 115 hp margin) or `twist.hero.maxHpBonus: 100` (Relay Valley's precedent, 71.8 hp margin); the default is that the map stays as hard as it is.
