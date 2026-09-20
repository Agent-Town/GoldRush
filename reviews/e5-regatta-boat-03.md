# Drain review — `e5-regatta-boat-03`: rider parity for the Regatta boat (A14 slice 3)

**Slice/branch/tip:** `e5-regatta-boat-03` · `feat/e5-regatta-boat-03` @ `ca7130052` (eight commits by a Claude Opus 5 implementer on the owner's Anthropic subscription, scratch worktree, port 5336 — the first master registered and built in the PUBLIC repo) · **base** `45607635a` · **merge** `53f9b9436` · **drained** attended 2026-09-20 · **master** `tasks/e5-regatta-boat-03.md` · **spec** `specs/agent-play/e5-regatta-steerable-boat.md` slice 3 · **owner** 2026-09-20 "A14 - do it".

## VERDICT: LANDED — the rider's picture of the Regatta equals the human's; F-RB2-4 closed

## What it does
The view gains `now.regatta` on contracts with a `raceCourse`: the boat (id, position, heading, speed, aboard), the next buoy with its radius, the buoys passed, `state`, `finished`, `forfeited` and the contract's `fastWaterMultiplier`, published on BOTH engines through one compiler-pinned diagnostics key (`AgentRegattaSource`) and one reader; headless and browser samples are byte-identical on the boot door (only `atSeconds` differs once aboard, the run second the start beacon fell), and a boatless E5 map publishes nothing. View schema 2 → 3 (a bump the ratified spec's law 5 asks for; F-RB3-1 records that the master's precedent, F-HEAT14-3, had NOT bumped — `skill.md` now says so of both). `NOT_ABOARD` and `UNREACHABLE_WATER` join `HERO_ORDER_REFUSALS` (appended, no index moves; four pins re-pointed with cause). `public/skill.md` gains one Regatta paragraph beside the pressure gauge, the version-3 row and one clause in the `now` bullet; `MechanicsManifest` gains `regatta_race` and a new `regatta_boat`, both reading the contract (F-RB3-5: the manifest had published the deleted 1.35 and five gates). The same-game audit reads EQUAL on the Regatta with no table change. The E5 census is re-pointed with a dated cause, the block pinned by value, plus a boatless-map control on all four E5 contracts; a winning view tape is minted.

Where a rider meets it: the door's `now.regatta` on `e5-regatta`; a `MOVE_HERO` to water while ashore is refused `NOT_ABOARD`, to unreachable water `UNREACHABLE_WATER`, both in the published vocabulary.

## Evidence (the implementer's, re-run at the drain where marked)
| Check | Result |
| --- | --- |
| view block, both engines | byte-identical on the boot door (`{"boat":{"id":"claim-boat","x":-49,"z":0,…},"nextBuoy":{"id":"start-beacon",…,"radius":6},…,"fastWaterMultiplier":1.5}`); control map publishes `undefined` |
| refusal list | `HERO_NOT_YOURS, UNREACHABLE_TERRAIN, UNREACHABLE_APPROACH, HERO_UNAVAILABLE, NOT_ABOARD, UNREACHABLE_WATER` |
| same-game audit | controls equal 15 / 0 / 0; summary 0/511/1252/0 over 1,763 rows, identical to the pin |
| view tape (slice 3) / boat tape (slice 1) | `fnv1a32:9e79d1e9`, 137 samples, won in 137.90 s · `fnv1a32:dd4116bf` unchanged |
| null floors | 83 of 83 on the branch; at the drain: `rc=0 83 of 83 null floors match assets/contracts/null-floors.json (318.8s).` |
| named guards (drain) | `ℹ pass 109 ℹ fail 0` |
| e2e both projects, `--workers=1` (branch) | 52 tests, 52 passed after the F-RB2-3 re-point; at the drain: `rc=1   5 failed   67 passed (7.9m)  08:27Z` |
| e2e reds (drain) | `1) [desktop-chrome] › e2e/e5-flotilla-hulls.spec.ts:6:1 › the Flotilla keeps three losable hulls and secures both bench seeds deterministica`<br>`2) [desktop-chrome] › e2e/e5-flotilla-hulls.spec.ts:118:1 › idle Flotilla runs lose all hulls ────`<br>`3) [mobile-chrome] › e2e/e5-flotilla-hulls.spec.ts:6:1 › the Flotilla keeps three losable hulls and secures both bench seeds deterministical`<br>`4) [mobile-chrome] › e2e/e5-flotilla-hulls.spec.ts:118:1 › idle Flotilla runs lose all hulls ─────`<br>`5) [mobile-chrome] › e2e/e5-regatta-boat.spec.ts:122:1 › a human boards the Claim-Boat on the keys and sails her, in a plain boot `<br>**Attribution:** the flotilla rows of F-MAC2-1 (1107–1108), fingerprint-matched. |
| tsc / build / e1 (drain) | `0 / 0 / 0` (rc) · payload `34245019 bytes` |
| law-pointer (drain) | `rc=0 law-pointer-guard — do the law surfaces still point at what` — `367->371 (blank-excerpt entry re-pointed at the cited sentence)` (F-RB3-8) |
| halo (drain) | `rc=1` — rc 1 on the merged tree is F-A3-3, not this slice: the guard read its banked sweep with `git show BASE:artifacts/…`, a path the public repo's history no longer carries; cured on main the same hour (the guard reads the tracked copy, PASS 315/0/760/2127) and the chain's main-merge carries the cure |
| full `npm run test:node-guards` (drain, store mid-run) | `rc=1 ℹ tests 940 ℹ pass 932 ℹ fail 3 ℹ skipped 5  08:35Z` |
| battery reds | `✖ all 152 scripts/*.test.mjs fixture owners remove their temp directories (161922.190084ms)`<br>`✖ failing tests:`<br>`✖ rotation registry stays outside the engine identity corpus (723.8105ms)`<br>`✖ the landed registry names the live engine and stays outside its hash corpus (136.074875ms)`<br>**Attribution:** the era/registry guards read Astra's in-flight store (F-A3-2, F-RB3-9) and pass after the pin (the era row); the fixture-owner sweep nests them; the desk guard refuses linked worktrees by design; the contention advisory beside the factory's fires. |
| engine hash | measured with the art store clean on main after Astra's first set landed: `fd5fb81fed8b9a78…`; same-era pin `#21 `fd5fb81f``, era guards `ℹ pass 12 ℹ fail 0` |

Transcripts: `artifacts/e5-regatta-boat-03/drain-gates-summary.txt`, `drain-e2e-merged-tree.log`, `drain-battery-merged-tree.log`; the implementer's report `artifacts/e5-regatta-boat-03/report.md` (373 lines).

## Merge classification
Base `45607635a`; every touched file **LANE-TOUCHED only** (no main commit since the base): `src/agent/View.ts`, `src/agent/MechanicsManifest.ts`, `src/agent/StandingOrders.ts`, `src/game/Game.ts`, `src/sim/HeadlessContractSim.ts`, `src/vite-env.d.ts` (type-only, F-RB3-2), `public/skill.md`, `scripts/gr-sim.test.mjs`, `scripts/regatta-boat-steer.test.mjs`, `e2e/agent-view.spec.ts`, `e2e/e5-regatta-race.spec.ts` (its own comment named this slice, F-RB3-7), `e2e/er01-e5-census.spec.ts`, `e2e/fixtures/e1-mechanics-manifests.json` (F-RB3-3), `assets/engine-era.json` (`viewSchema` only; the pin is the drain's), `artifacts/e5-regatta-boat-03/**`. Drain-side: `scripts/fire.md`'s door-document pointers re-based by measurement (F-RB3-8), the pin. Main merged into the chain after Astra's first set landed: no conflicts.

## Findings
- **F-RB3-1 (recorded):** the master cited F-HEAT14-3 as a version-bump precedent; it was not one. The bump stands on spec law 5; `skill.md` now states both cases truthfully.
- **F-RB3-2 / -3 / -7 (accepted):** three files outside the firewall that the slice's own act necessarily moved: the type declaration a new published key cannot compile without, the manifest fixture in JSON, and the spec whose comment named slice 3 as its fixer.
- **F-RB3-4 (for a later slice):** no standing browser guard on `now.regatta`; measured here and shape-held by the compiler plus a source-text guard; the natural home is `e5-regatta-boat.spec.ts`.
- **F-RB3-5 (cured):** the manifest published a stale fast-water number and five gates; both now read from the contract and are asserted against it.
- **F-RB3-6 (for a later slice):** `REGATTA_GATE_RADIUS_FALLBACK` sits in `MechanicsManifest.ts` because the firewall forbade `RegattaRaceSystem.ts`; pinned by source text; move it when that file is next open.
- **F-RB3-8 (cured at the drain):** `scripts/fire.md → public/skill.md:367` rotted by the door document's growth; the banked baseline entry carried an EMPTY excerpt (a blank line was banked), so the pointer was re-pointed at the sentence it quotes ("closed rotations remain public history") by measurement, and the baseline re-banked.
- **F-RB3-9 (sequencing, F-A3-2):** this drain's gates ran while Astra's first corrections set held the shared art store on its branch; the era guards in the battery are attributed to that, and the pin was measured only after that set landed and the store was clean on main.
- **F-A3-3 (cured on main, first seen in this drain):** the first full battery on the PUBLIC repo found the halo guard reading its baseline from history at a filtered path; the cure reads the tracked copy and the pins keep it honest.
- **F-RB2-2 (still the owner's):** disembark by key direction near a rim.

## What was touched
Listed above; drain-side: `scripts/fire.md` + `scripts/law-pointer-baseline.json`, `assets/engine-era.json` (pin `#21 `fd5fb81f``), this review, the goal leaf, the BACKLOG row, the register's A14 entry, STATUS line 1.
