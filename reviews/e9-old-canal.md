# e9-old-canal — A10, "inheritance is edited"

**Slice:** door-completion-sheet §A10 (RATIFIED 2026-08-20, owner verbatim: "Group 1: approved (with any tweaks)") · **Branch:** `worktree-agent-ac6a4904ef7986cff` · **Base:** `b9fd6fecb`

## Verdict

**MECHANIC SHIPPED. DOOR NOT OPENED — and this time the second half comes with a CONTROL rather than an argument.**

The three permanent verdicts, the derived flow, the ground veto and the objective latch are built, gated in both engines and proven. The contract still does **not** secure, so it lands in `CONTRACT_ADMISSION_EXEMPTIONS` with a measured reason and a re-admit condition, exactly as `e2-trestle`, `e6-showroom`, `e7-relay-rush` and `e9-seed-run` do. Bench seeds are minted and kept; the door baseline and the null floors are untouched.

What makes this row different from A8's is that the question "is the new mechanic what loses the map?" is answered by a **measurement**: the identical rider run with the objective never discharged (`--no-decide`) reaches **the same wave 17** on both seeds. The verdicts and the veto cost zero waves.

## What it does

Each of the Old Canal's three authored segments carries a decision stake, and each takes **one permanent verdict** for the life of the profile:

- **RE-DIG** (`CONTEXT_ACTION action=redig`, or the confirm key) — the band carries water forever. Works may never stand in it again, and from the **next tile birth** onward it is a no-spawn zone: outlaws do not wade up a live canal.
- **DEMOLISH** (`CONTEXT_ACTION action=backfill`, or the upgrade key) — the cut is filled and the ground is **permanently open** to build on, from the moment the verdict lands.
- **UNDECIDED** — the derelict ditch the Diggers left: it takes no works at all. This is the state "DEMOLISH → permanently *open* build ground" implies you move out of; without it the demolish half of the ratified mechanic would change nothing.

The final flow renders from the combined persisted choices — three bands painted water, filled ground or derelict cut, plus a post at each stake that glows while it is still asking. **Objective:** decide all three and survive to the contract's secure terms. The block declares no `secureWave`, so the default terminal law applies (`Balance.run.secureWave` = 20, no baron, wave ceiling 22); nothing was invented.

Nothing here was invented from outside the contract either. The segments are the authored `buildZones` that CONTAIN an authored stake — which is exactly the three `old-canal-segment-*` boxes the mask table already publishes as `canalDecisionZones` with `choice: "redig-or-demolish"` (`scripts/e3-mask-tables.test.mjs:383`); the two yards hold no stake, are therefore not segments, and can never be decided. The permanence rides TP-02's existing sim substrate (one new id prefix, no new entry kind). The only data this slice adds to the contract is `harvestAnchors`, which the door needs.

**One rename, stated plainly.** The wire word for DEMOLISH is `backfill`, because `CONTEXT_ACTION action=demolish` already means "tear down that turret" with a `{id,index}` target, and one wire word that means two things is Mistake #14. Every player-facing string still says DEMOLISH. `backfill` is the civil term for exactly what the sheet describes.

## Evidence

Battery: `artifacts/e9-old-canal/run-evidence.mjs`, twelve runs, **every repeat byte-identical**. The battery itself asserts determinism, Law 2, and that the played rider actually discharged the objective — it exits non-zero otherwise.

| policy | seed | secured | waves | kills | canal | event-log hash |
|---|---|---|---|---|---|---|
| public-verb, decide all three | 01 | **false** | 17 | 772 | 3/3 · flow a+c · open b | `fnv1a32:780aca7f` |
| public-verb, decide all three | 02 | **false** | 17 | 755 | 3/3 · flow a+c · open b | `fnv1a32:a6119428` |
| **control: same rider, no verdicts** | 01 | false | **17** | 763 | 0/3 | `fnv1a32:75319793` |
| **control: same rider, no verdicts** | 02 | false | **17** | 767 | 0/3 | `fnv1a32:f244ae2e` |
| idle floor (Law 2) | 01 | false | 3 | 51 | 0/3 | `fnv1a32:3a24c4b3` |
| idle floor (Law 2) | 02 | false | 2 | 33 | 0/3 | `fnv1a32:ea5e1d49` |

**The mechanic is not what loses this map, and that is the control's whole job.** Decide all three or decide none: wave 17 either way, on both seeds. The walk to the two far stakes (46 wu and 34 wu off the claim) costs nothing because it is taken once the gun line is up, and the ground veto costs nothing because the plan's pads never needed the closed bands.

**What loses it is income against a three-door map.** The claim stands at (0,12) and waves enter from the **north, west AND east** (`lanes.spawnEdges` — one more door than the Seed Run's two) against a roster half made of `feral_terraformer` (hpScale 1.7, buildingDamageScale 1.4). The economy ceiling is literal: gold plateaus at **123** for whole waves while turret #4 costs **125**, so the top of the build list is unbuyable at any income until 60 gold goes into a stockpile the same wave then wants back in repairs. Best measured board at the end: five beacons and two turrets standing.

**Ten distinct policies were measured before this was called**, and each is a fact a later rider should not have to re-buy: guns-first **16** · beacons-first **17** · timber-before-the-third-gun **11** · two stockpiles at plan positions 3-4 **10** · repair gate 35/60/80 → **17/17/16** · blast-always **17** · prospector holding on the claim **17** · yard seams answered **12** · far stakes walked at wave 2 **2** · no-decide control **17**. The spread is fifteen waves wide and its ceiling never moves off 17.

The floors live in the battery rather than in `assets/contracts/null-floors.json`, because `scripts/null-floor-anchors.mjs` walks `supportedContractIds()` and an exempt contract has no row there. Law 2 is still asserted, by the battery, on every run.

### Browser (`e2e/e9-old-canal-choices.spec.ts`, 8/8 both projects)

| claim | how it is proven |
|---|---|
| plain boot, no `?debug` | a player who has secured Devil's Alley launches the row it unlocks; three derelict bands render; walking to the stake raises the two-button prompt |
| the trade | an undecided band refuses a palisade; DEMOLISH opens it and the same pad takes one; RE-DIG floods a different band and closes it forever |
| nothing mid-run | `tileStateKey(...)` is still `null` after two verdicts |
| write-at-end, **even on a lost run** | the run is ended, the entry lands, the next birth reads `flow: ['decide-segment-a']` and `noSpawnZones: [{x:-30,z:-23,radius:9}]` |
| one-time, across runs | the inherited verdict refuses a second one |
| nothing writes on boot (Mistake #7) | standing ON a stake for 20 s and ending the run writes nothing |

Screenshots: `artifacts/e9-old-canal/shots/{desktop-chrome,mobile-chrome}-*.png` (four each).

## Findings

**🔺 F-A10-1 (REAL, PRE-EXISTING, AND IT CHANGES HOW EVERY HEADLESS DOOR MEASUREMENT SHOULD BE READ).** `Terrain`'s `ACTIVE_CONTRACT` is a **module-level** const resolved from `location` at import time, and under SSR there is no location — so `activeContract()` returns **`the-claim`** and `Terrain.isBuildable` tests every placement against **The Claim's** ground, not the contract under test. Measured directly (grid probe, `bounds ±32`): a river band across z −6..6 and two landmark blockers at (x −12..−4, z 16..18) and (x 8..12, z 12..16), on a contract that declares `size: 128`, `river: false` and five buildZones spanning z −54..54. **Consequences, all real:** a contract's authored `buildZones` are NOT enforced in `HeadlessContractSim`; its authored terrain is not either; and the door's difficulty is therefore a hybrid of one contract's rules with another's ground. This is not caused by A10 — it long predates it — but A10 is the first slice to measure it, and it means `reviews/e9-seed-run.md`'s and `reviews/e7-relay-rush.md`'s "the only buildZone within 30 wu" reasoning describes the BROWSER map rather than the bench they were measured on. **Recommend a fire-authorable corrective**: either thread the born contract into `Terrain` for the headless engine, or state the limitation in `HeadlessContractSim`'s header so no future exemption reason is written against a map the bench never played. NOT fixed here: it is engine-wide, far outside this slice's firewall, and fixing it would silently re-price every existing exemption row.

**🔺 F-A10-2 (truth, non-blocking, the E7/A8 precedent — but improved on).** The contract's `engineDependencies` still names `persistent-canal-choice-consumer` as `missing`, which is now false. The schema **cannot** express anything else: `validateEngineDependencies` requires `status === 'missing'`, and removing the block outright fails `engine_dependency_required` because `twist.persistentCanalChoices` is in `DECLARED_INERT_PATHS` (`ContractFamilies.ts:1607`). A8 left its equivalent silently stale (F-A8-3); this slice instead **rewrites the one writable field**, so the row now says in as many words that the dependency is satisfied and why the row survives. The census asserts `dep` + `status` through `objectContaining`, so nothing pinned moved. **Recommend a one-line schema slice**: add a `satisfied` status and let the three E9 rows retire honestly.

**🔺 F-A10-3 (the brief's phrasing corrected by the engine, deliberately).** The build brief said "lost runs stage nothing". The engine's actual law is stated at `Game.ts:1764`: *"Write-at-end law: staged tile-state entries land when the run ends, **whatever ended it**"* — a `run_ended` event commits regardless of outcome. That is also the right law for THIS mechanic: the sheet's word is "permanently", and a canal you re-dug does not un-dig itself because you died. The e2e asserts the engine's law explicitly, on a lost run. What IS true is the honest half: a run that takes no verdict writes nothing, and that is asserted too.

**🔺 F-A10-4 (owner fork, open — the A8 F-A8-4 shape, one map over).** Re-admitting the Old Canal needs one of: **(a)** an authored `twist.secureWave` below 20 for this map (17 would admit it today), **(b)** more `harvestAnchors` or a richer economy so the build list is reachable — the measured ceiling is a 123-gold pocket against a 125-gold turret, **(c)** fewer spawn edges (it is the only E9 contract with three), or **(d)** accept it as an elite map and leave the exemption standing. All four are contract data or a ruling; none is engine work. **Recommendation: (d) for now**, with (a) as the cheap alternative if the owner wants E9 door-complete this wave — the mechanic is already earning its keep in the browser and the exemption is honest.

**🔺 F-A10-5 (anchors: the brief's "yards-adjacent" lost to a measurement, recorded rather than quietly done).** The first authored `harvestAnchors` put one seam in each yard, 45 wu off the claim, as the build brief suggested. Measured: turns 1, 2, 5, 6, 11, 21 and 22 of the first full probe were spent standing at (10,45) and (−10,−45) with the wave chewing the claim, and the run died at **wave 12**. Moving all five onto the claim's own ground and the near canal line took the same rider to **16**. The yards remain surveyed build grounds — the briefing's own words — they simply carry no gold. This is the Seed Run's own measured lesson (BACKLOG:83) reproduced on the next map.

**🔺 F-A10-6 (one new placement seam in `BuildSystem`, and why it is not a Terrain change).** The consumer needs a **per-position** build veto that changes mid-run; `Terrain.isBuildable` answers from module-level authored data and cannot. Rather than install a global mutable into `Terrain` (the `installVisualHeightSource` shape — which would leak across the several sims a single census process constructs), `BuildSystem` gained one optional constructor predicate, `isGroundOpen`, defaulting to `() => true` and consulted at the head of `matchesPlacement`. Both engines pass the consumer's own `worksAllowed`. Every contract that declares no canal choices gets the identical answer it always got, and the seam is per-instance rather than per-module.

## Gates (Node 26.4.0)

| gate | result |
|---|---|
| `tsc --noEmit` | clean |
| `npm run build` | rc=0, built in 1.20s |
| `e9-old-canal-choices`, both projects | **8/8** |
| `er01-e9-census`, both projects | **8/8** |
| adjacent: `task-025-bandits-dont-swim` | **10/10** |
| adjacent: `m1-01-claim-jumpers-death` | **8/8** |
| adjacent: `m2-01-build-menu` | **14/14** |
| adjacent: `tp02-green-waypoint` | **5/6**, the sixth proven a FLAKE (below) |
| node guards (targeted 7 files): same-game audit + report guard, door ratchet, bench seeds, skill.md fences, mask tables, null-floor anchors | **45/45** |
| `null-floor-anchors --check` | **53 rows byte-identical**; the ONLY difference is the git-derived `eraStamp` (`1817cb273` → `b9fd6fecb`), which is the A8 convention's own proof that this slice moved no floor. Log: `artifacts/e9-old-canal/null-floors-check.log` |
| `npx playwright test --list` | **2936 tests in 422 files** — the suite still COLLECTS, which is the F-A8-7 check that matters for a slice whose consumer is reached by `MechanicsManifest` (a render import there once collapsed the whole list to `Total: 0`). Neither new module imports `world/Terrain`. |
| battery determinism | 12 runs, every repeat byte-identical |

**The one red, attributed rather than absorbed.** `tp02-green-waypoint:162` (mobile) failed with `THREE.GLTFLoader: Couldn't load texture blob:...` — **7 such errors on the first run, 4 on the second, and a clean PASS on the third, all on the identical tree.** A non-deterministic count is the signature of a texture-decode flake under a loaded dev server, and this slice touches no loader, no GLB and no texture path. Recorded as an environmental flake, not absorbed as noise.

**The full 70-file node-guard battery was NOT run, and that is stated rather than implied.** A sibling agent held the machine for the whole window (its own `run-node-guards.mjs` alive on the same seven files, confirmed by reading the matched command lines rather than trusting a count — F-A8-6's cure applied). The seven guards this diff can possibly move were run instead and are 45/45, plus the collection check above and the floors check. The drain should run the full battery once on the merged tree.

**Contention, stated:** the targeted node-guard run reported `CONTENDED — 2 concurrent batteries` (a sibling agent is building `e9-devils-alley` from the same base). All 45 are deterministic file-comparison guards rather than load-sensitive ones, so the result stands; the four browser adjacents were re-run **solo, one spec at a time**, after a first batched run produced 27 context-closed timeouts that solo runs did not reproduce.

## Same-game audit — the pin move, attributed apart

Two independent moves landed together and were separated by **revert-and-reproduce**, not arithmetic:

| tree | rows | agent-lacks | equal | not-offered | exemptions |
|---|---|---|---|---|---|
| pre-slice pin | 1446 | 463 | 977 | 6 | 7 |
| **anchors emptied, everything else in place** | **1446** | **463** | **977** | **6** | 8 |
| exemption row removed, anchors in place | 1485 | 473 | 1007 | 5 | 7 |
| **this slice, whole** | **1485** | **494** | **986** | **5** | **8** |

Row 2 reproduces the pre-slice pin EXACTLY, so the anchors own the whole +39/−1 shape (the familiar +10/+30/−1/+39). Row 3 differs from row 4 by exactly **21 rows flipping `equal` → `agent-lacks`** — the same 21-per-contract cost every admission move before it recorded.

⚠️ **RE-MEASURE AT THE DRAIN (F-2084-1, eight recurrences).** A sibling agent is landing `e9-devils-alley` from this same base. Two lanes that each admit a different contract write **different correct digits and git reports no conflict**. Whoever merges must re-run `node scripts/same-game-audit.mjs --json` on the MERGED tree and pin its output verbatim — and regenerate `docs/bench/same-game-audit.md` from the same run.

## Merge classification

Base `b9fd6fecb`. Every file below is LANE-TOUCHED only.

- **New:** `src/systems/CanalChoiceSystem.ts`, `src/systems/CanalFlowPresentation.ts`, `e2e/e9-old-canal-choices.spec.ts`, `playwright.a10.config.ts`, `artifacts/e9-old-canal/*`, `reviews/e9-old-canal.md`
- **Consumer seams:** `src/game/TileStateStore.ts` (one new sim id prefix + one `applyAtBirth` branch — no new entry kind), `src/systems/BuildSystem.ts` (one optional ctor predicate + one line in `matchesPlacement`), `src/game/Game.ts` (construct/mount/tick/reset/dispose, the two verdicts in `confirmAction` and `confirmUpgrade`, the rider dispatch, the latch in `autoSecureWaveForRun` + the baron expression, diagnostics), `src/sim/HeadlessContractSim.ts` (same, plus the view row, the two context actions and the exemption row), `src/agent/StandingOrders.ts` (two union members + two validator branches), `src/agent/MechanicsManifest.ts` (one rule, sourced from the consumer), `src/ui/BuildingContextPrompt.ts` (two buttons of its own), `src/vite-env.d.ts`
- **Data:** `assets/contracts/epoch-9-redfields/contracts.json` + `mask-tables/e9-old-canal.json` (`harvestAnchors` + the dependency description), `assets/contracts/bench-seeds.json` (+2), `public/skill.md` (grammar fence + seeds fence + prose), `e2e/er01-e9-census.spec.ts` (per-id, additive), `scripts/same-game-audit.test.mjs` (pins), `docs/bench/same-game-audit.md` (regen)
- **Untouched, and deliberately so:** `scripts/door-admission-baseline.json` · `assets/contracts/null-floors.json` · skill.md's door-contracts fence · `scripts/gr-sim.test.mjs`'s refusal probe (still correctly aimed at `e5-stillwater`) · `e9-dome-basin`, `e9-seed-run`, `e9-devils-alley` data and behaviour.

**⚠️ SIBLING-MERGE NOTE.** `e2e/er01-e9-census.spec.ts`, `assets/contracts/bench-seeds.json`, `public/skill.md`, `scripts/same-game-audit.test.mjs` and `src/sim/HeadlessContractSim.ts`'s exemption table are all edited per-id and additively, exactly so the concurrent `e9-devils-alley` slice can union with this one. The census's per-id shape exists for this. Expect the drain to union both and re-measure the audit stack once.
