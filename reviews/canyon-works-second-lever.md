# Review: canyon-works-second-lever — the deadline and the beacon ladder; the Canyon Works secures for the first time (scratch worktree, Claude Opus 5 implementer, attended drain 2026-09-06 morning)

**Slice/branch/tip:** `canyon-works-second-lever` · `fix/canyon-works-second-lever` · commit `057658676` on base `41b1e63cf` · merged to main: see the ledger row (first-parent merge; the only collision was the ledger).
**Verdict:** MERGED. With both levers the owner's "hard levels can be won" ruling holds for this map: `connect.byWave` 6 → 8 (the latch now fails with wave 9 at t = 270.03, measured by a tick-stepped probe with no beacons) and a per-contract beacon ladder `[25, 30, 35, 45, 50, 55]` = 240 g (default 330 g), priced at the one `buildableCostAt` seam (`src/game/buildables.ts:230`) that `BuildSystem.costFor` reaches in both engines and that `MechanicsManifest` prices from, the ladder travelling as an argument, never module state. The one-descent controller now connects `2/2` at t = 210.03 (60 s of margin) and **secures** (waves 15, gold 360, tape `fnv1a32:db8c1323`, repeated byte-identical), where the 330 g ladder connected at 270.03 and never secured. `Balance.beacon` is untouched: `e3-blackout-ridge` and `e1-dry-gulch` still price `[25,35,45,55,75,95]`.

## What it does
`twist.economy.beaconLadder` on the `e3-canyon-works` row (registered in `AUTHORED_TWIST_KEYS`, malformed shapes refused), applied once per engine (`Game.applyContractBeaconLadder`, `src/game/Game.ts:9485`; the `run_reset` line at `src/sim/HeadlessContractSim.ts:1325`); the card and the mechanics rule state the purse, the six prices and the deadline in one line ("the purse holds 360 gold, not the usual 200, and the six beacons cost 25+30+35+45+50+55 = 240 gold … by wave 8"). `scripts/contract-beacon-ladder-override.test.mjs` (5 tests, in `test:node-guards`) proves both engines read one field, the default control, the card-vs-engine drift (proven to bite on a one-digit drift), refusal of malformed ladders.

## Evidence
| Gate | Where | Result |
|---|---|---|
| Deadline probe (`artifacts/canyon-works-second-lever/deadline-probe.json`) | worktree | latch failure at wave 9, t = 270.03, with the full wave-start table |
| Proof tape, seed `e3-canyon-works-01` | worktree | `secured: true`, waves 15, gold 360, kills 101, 45 calls, `fnv1a32:db8c1323` twice; connect `2/2` first read at t = 210.03 (previous view 194.87 `1/2`), `failed` never appears |
| Floors | worktree, `null-floor-anchors.mjs --check` | idle still loses (waves 3, gold 0, every field byte-identical); the two canyon `eventLogHash` rows moved (`ac7eaf69 → 86bf5d8b`, `57229b1b → 249819fd`) and were re-pointed by hand, canyon rows only; attribution measured: the ladder moves nothing, the widened deadline alone moves both; after that `--check` shows only the eraStamp |
| Guards | worktree | 73/73 (the six named guards 63/63 baseline-identical, `contract-bank-cap-override` 5/5, the new ladder guard 5/5); `law-pointer-guard.mjs` PASS, 60 pointers, `Game.ts:2547` and `ContractFamilies.ts:1345` verified unmoved by reading |
| tsc / build | worktree | clean / green |
| e2e | worktree, own dev server on 5307, both projects | `e3-canyon-works` 4/4 (one literal re-pointed, F-CWSL-1), `e3-blackout-ridge` + `ap16-4-contract-admission` 6/6, `contract-briefings -g "only cite authored wave numbers"` 2/2, zero console errors; plain-boot card screenshots at 1280×800 and 390×844 |
| Known red | worktree | `er01-e3-census.spec.ts` on this map, pre-existing (F-CWBC-3 at `:171`), now failing earlier on its `byWave: 6` literals (F-CWSL-1) |
| Engine era | worktree hash `351b8690…` | pinned on the merged tree by the drain (the same tree: main had gained only bookkeeping) |
| Attended on the merged tree | see the drain commit and the ledger row | tsc, the ten guards, build, the three e2e suites at one worker on both projects |

## Merge classification
Base `41b1e63cf`; main moved by two bookkeeping commits touching nothing this branch touches. `assets/contracts/epoch-3-voltage/contracts.json`, `assets/contracts/null-floors.json` (two canyon rows), `src/game/buildables.ts`, `src/systems/BuildSystem.ts`, `src/game/Game.ts`, `src/sim/HeadlessContractSim.ts`, `src/meta/ContractFamilies.ts`, `src/agent/MechanicsManifest.ts`, `e2e/e3-canyon-works.spec.ts` (one literal), `package.json`: LANE-TOUCHED. `scripts/contract-beacon-ladder-override.test.mjs`, `artifacts/canyon-works-second-lever/*`: NEW. `tasks/BACKLOG.md`: MAIN-MOVED, unioned. Attended in the drain commit: `docs/bench/e3-readiness-census.md:74` re-pointed to wave 8 (F-CWSL-2).

## Findings
- **F-CWSL-1 (corrective owed, with F-CWBC-3):** `e2e/er01-e3-census.spec.ts` still asserts `byWave: 6` at `:69, :123, :129, :131, :134` and steps the failure case to waves 6/7 at `:127, :130`; it was already red at `:171` on a pristine tree. Re-point to 8/9 in the same commit as the F-CWBC-3 cure. Fire-authorable.
- **F-CWSL-3:** `scripts/f2086-canyon-census-player.mjs:6` and `scripts/f2135-canyon-census-player.mjs:9` hardcode the old ladder; stale analysis players, not guards.
- **F-CWSL-4 (owner-visible):** the two levers overlap: at 240 g the largest single descent is 185 g, under the default 200 purse, so the 360 purse is no longer load-bearing for the one-descent line (it still buys seam headroom). Left in place per the owner's "we can adjust things later".
- **F-CWSL-5 (evidence on F-CWBC-2):** the desktop plain-boot card is a race, not a hard invisibility: a poll-and-reload loop caught it readable at 1280×800. The fix stays with the story-signal-gaps slice.
