# Drain review — `e5-regatta-boat-01`: the Claim-Boat is the steerable body both species sail (A14 slice 1)

**Slice/branch/tip:** `e5-regatta-boat-01` · `feat/e5-regatta-boat-01` @ `34257a71c (archive: pruned by the A3 rewrite)` (four commits by a Claude Opus 5 implementer on the owner's Anthropic subscription, scratch worktree, port 5321) · **base** `65f8efafe` · **merge** `e417e71df` · **drained** attended 2026-09-20 · **master** `tasks/e5-regatta-boat-01.md` · **spec** `specs/agent-play/e5-regatta-steerable-boat.md` slice 1 · **owner** 2026-09-20 "A14 - do it" (the four recommendations ratified 2026-09-19).

## VERDICT: LANDED — all seven scope items, the null floors byte-identical, one tape hash on both engines

## What it does
The Claim-Boat on `e5-regatta` gains a motion state (position, heading, speed, who is aboard) and a deterministic fixed-step steer clamped to the contract's navigable water; its physics live in the contract (`tileParams.deepwater.claimBoat.physics`: top speed 1.65, acceleration 0.55, turn rate π rad/s, drag 0.8, fast water ×1.5), never in `Balance`. Embark and disembark are positions owned by one helm rule in `DeepwaterClaimTile`, called by both engines (`HeadlessContractSim.sailClaimBoat`, `Game.sailClaimBoat`): a human's keys and a rider's `MOVE_HERO` are the same intent, no new verb. Two refusals, `NOT_ABOARD` and `UNREACHABLE_WATER`, ride the status channel only; the pinned `HERO_ORDER_REFUSALS` list is untouched (publishing them is slice 3's censused act). `reanchor` still teleports for the storm rules. The race, the view schema, `skill.md` and the census are untouched (slices 2–3).

Where the player meets it: boot `e5-regatta`, walk onto the boat's port rail, and the keys sail the hull; a rider's `MOVE_HERO` to a water point sails the same hull to the same place.

## Evidence (the implementer's, re-run at the drain where marked)
| Check | Result |
| --- | --- |
| turn / crossing (headless, asserted) | full turn **2.001 s** (3.140 rad/s); the 98 m line **59.394 s** at top speed, 61.033 s from rest; fast water ×1.500 |
| both-engine tape | `fnv1a32:dd4116bf` over 42 samples, identical element for element headless vs browser, desktop and mobile |
| null floors | **83 of 83** on the branch; at the drain: `rc=0 83 of 83 null floors match assets/contracts/null-floors.json (295.2s).` |
| `regatta-boat-steer` (new, in `test:node-guards`) | 5/5; drain named guards: `ℹ pass 68 ℹ fail 0` |
| frame p95 on `e5-regatta` | +3.0 % (10.200 vs 9.900 ms control, four runs per arm) |
| tsc / build / e1 (drain) | `0 / 0 / 0` (rc) · payload `34237118 bytes` |
| law-pointer / halo (drain) | `re-based in the chain (Game.ts:2671 -> :2692, +21; baseline re-banked)` · `rc=0 halo re-extraction PASS: 315 cured, 0 held, 760 regenerated-and-cured, 2127 scanned; alpha` |
| engine hash | `2ad0aa1e…` on main → `8eb7e135ef6c707d…` on the merged tree; same-era pin `#17 `8eb7e135`` appended, era guards `ℹ pass 9 ℹ fail 0` |
| e2e both projects, `--workers=1`, port 5324 (drain) | `rc=1   8 failed   48 passed (4.0m)  00:21Z` |
| e2e reds | `✖ Claim Boat candidate preserves its pinned source, export and clear authored pad contract (7.481875ms)`<br>`✖ Flotilla exports match three authored hull identities with compliant textures and clear pads (8.753292ms)`<br>`✖ all 152 scripts/*.test.mjs fixture owners remove their temp directories (145782.822708ms)`<br>`✖ failing tests:`<br>`✖ published mask tables exactly track authored contract data (8.313292ms)`<br>`✖ rotation registry stays outside the engine identity corpus (558.230583ms)`<br>`✖ the landed registry names the live engine and stays outside its hash corpus (323.736666ms)`<br>`✖ the live board is green under this guard (baseline is honest) (264.198625ms)`<br>**Attribution:** every red is F-MAC2-1 (the era-6 E5 fixture reds, inventory rows 1107–1113), fingerprint-matched; none is this slice's. |
| full `npm run test:node-guards` on the merged tree (drain) | `rc=1 ℹ tests 934 ℹ pass 922 ℹ fail 7 ℹ skipped 5  00:28Z` |
| battery reds | `✖ Claim Boat candidate preserves its pinned source, export and clear authored pad contract (7.481875ms)`<br>`✖ Flotilla exports match three authored hull identities with compliant textures and clear pads (8.753292ms)`<br>`✖ all 152 scripts/*.test.mjs fixture owners remove their temp directories (145782.822708ms)`<br>`✖ failing tests:`<br>`✖ published mask tables exactly track authored contract data (8.313292ms)`<br>`✖ rotation registry stays outside the engine identity corpus (558.230583ms)`<br>`✖ the landed registry names the live engine and stays outside its hash corpus (323.736666ms)`<br>`✖ the live board is green under this guard (baseline is honest) (264.198625ms)`<br>**Attribution:** the contention advisory reddens beside the factory's own fires (green alone); the fixture-owner sweep nests it. |
| after the pin: `engine-era-guard`, `bench-seeds`, `claim-boat-asset`, `e3-mask-tables` | `ℹ pass 41 ℹ fail 0` |

Transcripts: `artifacts/e5-regatta-boat/drain-gates-summary.txt`, `drain-e2e-merged-tree.log`, `drain-battery-merged-tree.log`; the implementer's report `artifacts/e5-regatta-boat/report.md`.

## Merge classification
Base `65f8efafe`; every touched file is **LANE-TOUCHED only** (no main commit since the base): `src/entities/ClaimBoat.ts`, `src/sim/DeepwaterSocket.ts`, `src/sim/HeadlessContractSim.ts`, `src/game/Game.ts`, `src/world/ClaimBoatView.ts`, `src/world/DeepwaterClaimTile.ts`, `src/agent/StandingOrders.ts`, `assets/contracts/epoch-5-deepwater/contracts.json`, `package.json` (the guard's entry); NEW `e2e/e5-regatta-boat.spec.ts`, `scripts/regatta-boat-steer.test.mjs`, `artifacts/e5-regatta-boat/**`. Inside the master's firewall; `RegattaRaceSystem`, the view, `skill.md`, `Balance` untouched.

## Findings
- **F-RB1-1 (for slice 2):** `DeepwaterSocket.advanceRace` still passes `[hero, boat.anchor]`; the anchor is now the mooring and no longer follows the sailing hull (the live point is `boat.motion`). The course scores right for a sailing boat only because the hero rides the hull's point; a swimming hero still passes gates. Slice 2 makes the boat the racer and closes the swimming-hero path.
- **F-RB1-2 (for slice 2):** two fast-water numbers now exist on the Regatta — 1.35 on foot (`RegattaRaceSystem`) and 1.5 for the hull; one must win. The buoys are point triggers a 8.8 × 28.5 hull passes through; the boarding lane is the port rail (the start buoy stands on the boat's own mooring).
- **F-RB1-3 (non-blocking, known):** `e5-regatta-race.spec.ts` `:35` and `:141` are the F-MAC2-1 era-6 fixture reds (rows 1109–1110); `:141`'s received hash `fnv1a32:d461683d` equals `null-floors.json`'s own pin for `e5-regatta-01`, which proves the stale number is the spec's. Re-point with cause is still owed under F-MAC2-1.
- **F-RB1-5 (cured at the drain):** the contract's new `claimBoat.physics` block reddened three guards the master's firewall could not let the implementer touch: `e3-mask-tables` ("published mask tables exactly track authored contract data" — the published mirror `assets/contracts/epoch-5-deepwater/mask-tables/e5-regatta.json` had the old `deepwater` block) and the two `claim-boat-asset` tests (the Claim-Boat and Flotilla pilot contracts pin the contracts file's sha256 as a source). Mirror republished, the two pins re-pointed, the three guards re-run 32/0; the engine hash was re-measured after the cure and pinned from that measurement. The same class F-E3MS-2 foretold for mask mirrors — a contract-touching master should list its published mirror and the pilots that pin the file.
- **F-RB1-4 (environmental):** `node-guards-contention` reddened inside the implementer's `run-guards` beside the factory's own fires and was green alone.

## What was touched
Listed under merge classification; drain-side: `assets/engine-era.json` (pin `#17 `8eb7e135``), this review, the goal leaf, the BACKLOG row, the register's A14 entry, STATUS line 1.
