# Review: canyon-works-bank-cap-override — a per-contract bank cap, and the measurement that says the purse alone is not enough (scratch worktree, Claude Opus 5 implementer, attended drain 2026-09-06 morning)

**Slice/branch/tip:** `canyon-works-bank-cap-override` · `fix/canyon-works-bank-cap` · commit `da9aa7ec4` on base `ed57402e8` · merged to main: see the ledger row (first-parent merge; the only collision was the ledger).
**Verdict:** MERGED as the first of two levers, with the implementer's honesty-guard STOP honoured rather than tuned past. The owner's ruling ("(2) a per-contract cap override") is implemented exactly: an authored `twist.economy.bankCap`, honoured by `Economy` through its existing cap-source seam in both the browser game and the headless sim, set to 360 on `e3-canyon-works` only, published twice to riders (a `contract_bank_cap` mechanics rule and a briefing rule), and guarded. The headless proof then shows the map still misses its latch by income, not by purse: at the measured 1.33 g/s the 330 g tour plus its walks cannot finish before the latch fails at t = 210 s. The second lever is the owner's call (F-CWBC-5).

## What it does
`src/game/Economy.ts` gains `setContractBankCap`, a cap source the contract-load sites in `src/game/Game.ts` and `src/sim/HeadlessContractSim.ts` each call exactly once; `src/meta/ContractFamilies.ts` registers `economy` in `AUTHORED_TWIST_KEYS` and refuses eight malformed shapes; `src/agent/MechanicsManifest.ts` publishes the purse as a rule; the `e3-canyon-works` briefing states it. `Balance.economy.bankCap` is untouched, so every other map gets exactly 200 (proved on `e3-blackout-ridge` and `e1-dry-gulch`).

**The value, 360, and its arithmetic:** the latch is six beacons at `ceil(25 × 1.3^i / 5) × 5` = 25, 35, 45, 55, 75, 95 = 330 g (`src/game/buildables.ts:204`); a descent pans two live seams of 30 g (`Balance.goldSeam.capacity`, `activeMin 2`), and `Economy.canReceiveIncome` refuses a whole tick above the cap, so the purse carries one seam of headroom: 330 + 30.

## Evidence
| Gate | Where | Result |
|---|---|---|
| Headless ceiling proof (`artifacts/canyon-works-bank-cap/run.mjs ctrl-ceiling.mjs`, seed `e3-canyon-works-01`, 18,000 ticks) | worktree | PASS: peak gold held 360, first above 200 at t = 210.03, income refused above 360 from t = 302.87; tape `fnv1a32:fd4c2ce9`. The override is live in the headless engine |
| Headless one-descent proof (`ctrl-onedescent.mjs`) | worktree | FAIL, honestly: all six beacons up and `canyonConnect 2/2` at t = 270.03 against a latch that fails at t = 210.03; tape `fnv1a32:6b998cd6`. Cumulative income 240 g by 180 s, 310 g by 210 s, 1.33 g/s sustained (heat 12's generation 60 got 1.00 g/s); even at the blocker's optimistic 2.07 g/s the floor is 159.4 + 17.0 + 29.9 = 206.3 s |
| Floors | worktree, `null-floor-anchors.mjs --check` | no `e3-canyon-works` row moved (the idle policy never pans); the eleven differences seen were the stale rows the attended session regenerated in `5fc223c1a` minutes later |
| New guard `scripts/contract-bank-cap-override.test.mjs` | worktree, in `test:node-guards` | 5/5: both engines from one field, the default control, card-vs-engine drift, eight malformed purses refused, both engines call `setContractBankCap` exactly once |
| Named guards | worktree | 63/63 (`same-game-audit`, `e3-mask-tables`, `door-admission-ratchet`, `skillmd-contracts-guard`, `view-schema-guard`, `law-pointer-guard`); `law-pointer-guard.mjs` PASS (60 pointers); `no-emdash-guard` 1/1 |
| tsc / build | worktree | clean / green |
| `e2e/e3-canyon-works.spec.ts` | worktree, own dev server on 5307, both projects | 4/4 |
| `e2e/ap16-4-contract-admission.spec.ts` + `e2e/e3-blackout-ridge.spec.ts` | worktree, both projects | 12 passed |
| `e2e/er01-e3-census.spec.ts:171` | worktree | 2 failed on both projects, PRE-EXISTING: reproduced on a pristine `ed57402e8` tree (`Outcome requested before the contract terminated`), F-CWBC-3 |
| Plain-boot card, no `?debug` | worktree | 390×844 screenshot shows the purse rule; on desktop the card is gone within a second (F-CWBC-2), so the desktop evidence is the DOM read in `card-shots.log` (visible, purse rule present, zero console errors) |
| Engine era | worktree hash `c97559e6…` on the pre-floors tree | superseded by the merged-tree hash `8822c2f0`, pinned by the drain |
| Attended on the merged tree | see the drain commit and the ledger row | tsc, the nine guards, build, the three e2e suites at one worker on both projects |

Screenshots and tapes: `artifacts/canyon-works-bank-cap/` (848 KB, largest file 190 KB).

## Merge classification
Base `ed57402e8`; main moved by one commit (`5fc223c1a`, the null floors and a pin) that touches nothing this branch touches. `src/game/Economy.ts`, `src/game/Game.ts`, `src/sim/HeadlessContractSim.ts`, `src/meta/ContractFamilies.ts`, `src/agent/MechanicsManifest.ts`, `assets/contracts/epoch-3-voltage/contracts.json`, `package.json`: LANE-TOUCHED. `scripts/contract-bank-cap-override.test.mjs`, `artifacts/canyon-works-bank-cap/*`: NEW. `tasks/BACKLOG.md`: MAIN-MOVED, unioned.

## Findings
- **F-CWBC-1 (blocker corrected):** the latch closes at t = 210.03, not 180: `HeadlessContractSim.syncCanyonConnectObjective` (`src/sim/HeadlessContractSim.ts:2442-2445`) completes while `wave <= 6` and sets `failed` only once `wave > 6`, i.e. with wave 7. Heat 12's blocker file credits the map with 30 s less than it has.
- **F-CWBC-5 (OWNER'S DESK, the second lever):** with the purse fixed the binding constraint is 330 g of income against 210 s at 1.33 g/s. Cheapest levers, both owner calls: reprice the beacon ladder so six cost about 240 g, or widen `connect.byWave` 6 → 8 (270 s). The one-descent proof connected at t = 270.03, exactly on the byWave-8 boundary, so either lever alone is marginal; both together leave about 40 s of margin (240 g at 1.33 g/s = 180 s, plus 47 s of walking, against 270 s).
- **F-CWBC-2 (pre-existing UX defect, corrective owed):** on desktop the plain-boot contract card paints at ~250 ms and is hidden by ~750 ms, far inside its own 8 s timer (`src/ui/Hud.ts:360`), because a second HUD mount disposes the first (`Hud.dispose`, `src/ui/Hud.ts:308-320`); at 390px it stays up. A first-timer on desktop cannot read any card's rules. Fire-authorable, small.
- **F-CWBC-3 (pre-existing red):** `er01-e3-census.spec.ts:171` throws on `e3-canyon-works` on a pristine tree.
- **F-CWBC-4 (premise corrected):** the rider view publishes `now.gold` but no cap (`src/agent/View.ts:401`); only the browser diagnostics carry `economy.bankCap`. The master's "the view already carries it" was wrong for riders, which is why the number is published as a mechanics rule and on the card. Adding `now.bankCap` to the view is a one-field follow-up under the view schema guard.
