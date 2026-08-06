# E5 READINESS CENSUS — Deepwater before the owner's ride

> ## 🩺 RE-MEASURED 2026-08-06 — `milk/deepwater-surgery`. **BROKEN is now 0 of 4.**
>
> Two content defects this census named are **CURED at the mechanism it named**, content-only, with
> **zero sim change**: the Regatta's six-vs-five beacon contradiction, and the Deepwater Claim's
> missing dependency declaration. Both cures are pinned by new asserts in `e2e/er01-e5-census.spec.ts`,
> **each proven by manufacturing the old defect and watching the spec go red** (arms below).
>
> **Admission is UNMOVED at 0 of 4, and that is the correct answer, not a shortfall.** Every remaining
> blocker needs a *headless consumer* — `SUPPORTED_CONTRACTS` in `src/sim/HeadlessContractSim.ts` — which
> is sim code, out of this shift's firewall. Per reject-don't-stretch the shift STOPPED at that line
> rather than admitting a contract the engine cannot run. See **F-ER01-E5-5** for the socket-shape stub.
>
> **All eight forced-diagnostic hashes below reproduced to the digit** on the re-run, each on its own
> determinism pair — which is the evidence that these cures are behaviour-neutral. The old verdicts are
> retained verbatim below, bannered, never deleted.
>
> ⚠️ **PREMISE CORRECTION.** The shift order said this census marks *two* contracts BROKEN. It marked
> **one** (`e5-regatta`); `e5-deepwater-claim` was **DATA-GAP**, carrying the undeclared-dependency
> defect as prose inside F-ER01-E5-1. Both were cured anyway, so the order's intent is met — but the
> count it asserted was wrong, and a later reader must not inherit it.

Measured 2026-08-05 against all four board contracts in `epoch-5-deepwater`. Training/drill maps are excluded by the ratified ER-01 default. No contract can be admitted without inventing an E5 mechanic: the flagship's live boat, storm, arsenal, and Dredge-Queen consumers do not run headlessly, while the three variants declare their defining consumers missing. Forced generic GR-SIM runs were used only to record the idle Trail baseline below; each hash reproduced on a second run, but none is an acceptance pin because the support gate correctly rejects these contracts.

## EXECUTIVE SUMMARY

- **AGENT-READY: 0 of 4.** (Unmoved 2026-08-06 — admission needs the socket; see the banner.)
- **DATA-GAP: 4 of 4** — the E5 signature systems have no complete manifest vocabulary or headless consumer. ~~Regatta, Stillwater, and Flotilla declare their missing consumer; the Deepwater Claim does not yet declare its missing headless dependencies.~~ ✅ **CURED 2026-08-06 — all four now declare it.** The Claim declares `deepwater-claim-consumer`, naming the browser-only `DeepwaterClaimTile` / `DeepwaterArsenal` / `DredgeQueenBossSystem` path. Re-measured: the derived manifests still expose **0 buildables · 0 interactables · 0 operations** (Claim 3 rules — `twist.baron`, `tileParams.buildZones`, `tileParams.waterSources`; the other three 2 rules each), so the declaration added **no vocabulary** — it only stopped the contract lying by omission.
- ~~**BROKEN: 1 of 4 (also DATA-GAP)** — Regatta's briefing promises six beacon gates, but `raceCourse.beacons` and the terrain contract contain five.~~ ✅ **BROKEN: 0 of 4 — CURED 2026-08-06.** The briefing now reads *"Five beacon gates mark the out-and-back course."* **Five was the load-bearing number on four independent surfaces** (`contracts.json` `raceCourse.beacons`, the mask table `maskTruth.raceCourse.beacons`, `regatta-terrain-contract.json`, and that file's own `maskAgreement.beacons`: *"five submerged foundation rises follow the published checkpoint centers and radii"*) against **one** prose string — and the E5 bundle spec, `lore/STORYBOOK.md:282`, and every owner directive are **silent on the count**, so nothing ruled six. Six would have required inventing a beacon position with no terrain mount and re-baking the mesh. The authored bundles otherwise load without console/page errors. Regatta and Flotilla deliberately remain unavailable (`harvestAnchors: []`), so active contract selection falls back to the Claim rather than booting a false contract.
- All four derived manifests expose zero interactable operations and omit `tileParams.deepwater` plus their variant fields. The seven standing-order grammar forms therefore cannot express the defining mechanics; generic verb acceptance would not be coverage. **Re-measured 2026-08-06 and unchanged** — `0 buildables / 0 interactables / 0 operations` on all four; rule sources are only `twist.baron` (Claim), `tileParams.buildZones`, `tileParams.waterSources`.
- Both diagnostic seeds were forced through the generic path and repeated byte-identically. They remain outside the production bench registry because no E5 contract was admitted. The focused spec passed 8/8 across desktop and mobile projects, including both-seed support rejection and zero captured `console.error`/`console.warn` output. **Still 8/8 on 2026-08-06** with the two new admission-gate asserts added.
- **The forced diagnostic is a temporary, reverted probe, not a code path.** `SUPPORTED_CONTRACTS` was patched in a scratch copy to let `gr-sim` construct these contracts, then `src/sim/HeadlessContractSim.ts` was restored and **verified byte-identical by sha256** (`a455db64…1098` both sides). Nothing about the support gate shipped.

## CENSUS

| Contract | Admitted? | Boots? | Verbs? | Determinism? | Naive Trail outcome | Verdict + reason |
|---|---|---|---|---|---|---|
| `e5-deepwater-claim` | **NO** — support gate rejects it (re-verified 2026-08-06: `gr-sim` throws `AP-07 supports only …; received e5-deepwater-claim`) | **BLOCKED** — `DeepwaterClaimTile`, `DeepwaterArsenal`, and `DredgeQueenBossSystem` are browser-only here; ~~headless dependencies are undeclared~~ ✅ **now DECLARED** as `deepwater-claim-consumer` | **FAIL** — no boat, reanchor, storm, depth, arsenal, or Dredge-Queen operation is exposed (re-measured 2026-08-06: **0 operations**, 3 generic rules) | **N/A for admission** — forced hashes repeated twice; **both reproduced 2026-08-06** | Forced generic diagnostic: `01` **died**, wave 3, 0 calls, `fnv1a32:9d449cc4`;<br>`02` **died**, wave 3, 0 calls, `fnv1a32:96c6e567`<br>✅ **both re-run 2026-08-06, identical** | **DATA-GAP** — ~~the era socket and dependency declaration must land~~ ✅ **declaration CURED 2026-08-06**; the era socket alone still gates admission (F-ER01-E5-5) |
| `e5-regatta` | **NO** — support gate rejects it (re-verified 2026-08-06) | **BLOCKED** — the declared race consumer is missing, and empty harvest anchors make active selection fall back to `the-claim` | **FAIL** — no checkpoint, race, fast-water, or racer-loot operation is exposed (re-measured 2026-08-06: **0 operations**, 2 generic rules) | **N/A for admission** — forced hashes repeated twice; **both reproduced 2026-08-06** | Forced generic diagnostic: `01` **died**, wave 2, 0 calls, `fnv1a32:348721b8`;<br>`02` **died**, wave 2, 0 calls, `fnv1a32:3a51716f`<br>✅ **both re-run 2026-08-06, identical** | ~~**DATA-GAP + BROKEN** — the consumer is missing and the briefing says six gates while both data surfaces define five~~<br>✅ **BROKEN CURED 2026-08-06** — briefing now says five, matching all four data surfaces. **Verdict is now DATA-GAP only**: the race consumer still gates admission |
| `e5-stillwater` | **NO** — support gate rejects it | **BLOCKED** — `noise-hunt-consumer` is declared missing | **FAIL** — no quiet/noise, permanent-fog, storm-suppression, or leviathan-hunt operation is exposed | **N/A for admission** — forced hashes repeated twice | Forced generic diagnostic: `01` **died**, wave 3, 0 calls, `fnv1a32:5eb24494`;<br>`02` **died**, wave 3, 0 calls, `fnv1a32:92ce69e7` | **DATA-GAP** — reject-don't-stretch until noise hunting is consumed and derivable |
| `e5-flotilla` | **NO** — support gate rejects it | **BLOCKED** — the declared distributed-base consumer is missing, and empty harvest anchors make active selection fall back to `the-claim` | **FAIL** — no hull ownership, formation, straggler, hull-loss, or rider-assignment operation is exposed | **N/A for admission** — forced hashes repeated twice | Forced generic diagnostic: `01` **died**, wave 2, 0 calls, `fnv1a32:eb38173a`;<br>`02` **died**, wave 3, 0 calls, `fnv1a32:18ddc919` | **DATA-GAP** — reject-don't-stretch until the distributed-base consumer exists |

## FINDINGS

### F-ER01-E5-1 — The Deepwater Claim has no honest headless socket

> 🟡 **PARTIALLY CURED 2026-08-06 (`milk/deepwater-surgery`).** The **declaration half is CLOSED**: `e5-deepwater-claim` now carries
> `engineDependencies: [{ dep: 'deepwater-claim-consumer', status: 'missing', … }]`, naming the browser-only path verbatim, in the exact
> AP-11 shape `ContractFamilies.ts:1702` requires (`exactRecord(['dep','status','description'])`). Pinned by `er01-e5-census.spec.ts`
> ADMISSION GATE 1, **proven by deleting the declaration again → exactly the 2 Claim tests red, 6 green**.
> The **socket half stays OPEN and is deliberately untouched** — it edits `SUPPORTED_CONTRACTS` and `HeadlessContractSim`, which this
> shift's firewall forbids. Its shape is now written down as **F-ER01-E5-5** so the next author does not have to re-derive it.

The browser boots the flagship through `DeepwaterClaimTile`, disables generic scheduled waves, advances its storm and corsair scheduler, fastens builds to Claim-Boat pads, runs the E5 arsenal, and resolves the Dredge-Queen through its dedicated boss system. `HeadlessContractSim` runs none of those consumers, while the mechanics manifest advertises only generic build zones, spring cells, and a Baron row; the contract also lacks the `engineDependencies` declaration AP-11 requires for this gap. The attended fix master needs a Deepwater consumer socket plus consumer-derived boat/storm/depth/arsenal/boss vocabulary and the missing dependency declaration; ER-01 must not certify the generic WaveSystem diagnostic as the same contract.

### F-ER01-E5-2 — The Regatta facade has no consumer and disagrees on its gate count

> 🟡 **PARTIALLY CURED 2026-08-06 (`milk/deepwater-surgery`) — the BROKEN half is CLOSED.** `briefing.rules[0]` now reads
> *"Five beacon gates mark the out-and-back course."* **The direction was decided by counting surfaces, not by taste:** four say five
> (`contracts.json` `raceCourse.beacons`, `mask-tables/e5-regatta.json`, `regatta-terrain-contract.json`, and that file's
> `maskAgreement.beacons` — *"five submerged foundation rises"*, i.e. the mesh is physically built at five), one prose string said six,
> and **canon is silent**: the E5 bundle spec never mentions the Regatta at all, and `lore/STORYBOOK.md:282` describes the course with no
> count. Pinned by ADMISSION GATE 2, which derives the expected count *word* from `beacons.length` so it cannot rot the way the prose did,
> and cross-checks the mask table beacon-for-beacon. **Proven twice: restoring "Six" → 2 Regatta tests red; dropping one mask-table beacon
> → 2 Regatta tests red.**
> 🔻 **VETO WINDOW — Robin, one word reverses this.** If the course is *meant* to have six gates, the fix is not the prose: it is a sixth
> beacon position plus a terrain re-bake, which is an art/terrain job, not a content edit.
> The **consumer, course vocabulary, and selectability stay OPEN** — all three are sim work. See **F-ER01-E5-5**.

Regatta declares `regatta-race-consumer` missing for checkpoint progress and competing-racer loot, and its derived manifest exposes neither those mechanics nor its fast-water course. Its empty harvest-anchor list also makes normal active-contract selection return the Claim fallback, so a forced GR-SIM run combines Regatta diagnostics with the wrong global mechanics manifest. Separately, the player-facing briefing promises six beacon gates while `raceCourse.beacons` and `regatta-terrain-contract.json` define five. The attended fix master must reconcile that count, land the race consumer, derive the course vocabulary from it, and make the contract selectable before headless admission.

### F-ER01-E5-3 — Stillwater's quiet hunt is data without a consumer

Stillwater declares `noise-hunt-consumer` missing for permanent fog, storm suppression, machine-noise emission, and leviathan attraction. The current headless path can generically fight an enemy roster, but the manifest exposes none of the quiet/noise choices that define the contract, so a deterministic death on both seeds is not playability evidence. The attended fix master must provide the consuming system and its agent/headless action surface before ER-01 can admit the map.

### F-ER01-E5-4 — The Flotilla has no distributed-base owner

Flotilla declares `distributed-base-consumer` missing for three-hull ownership, straggler targeting, nonfatal hull loss, formation reshaping, and one-hull-per-rider assignment. Those fields are absent from the derived manifest, and the empty harvest-anchor list makes active selection fall back to the Claim instead of booting Flotilla. The attended fix master must land that consumer, derive its hull/formation vocabulary, and make the contract selectable; a generic two-edge holdout is not an admissible substitute.

### F-ER01-E5-5 — SOCKET-SHAPE STUB: what the E5 era socket must do (filed 2026-08-06, `milk/deepwater-surgery`)

**Filed instead of stretched.** The shift order allowed content/config cures only and required a STOP plus this stub the moment a cure needed a SIM change. Both E5 cures hit that line, so here is the shape, measured rather than guessed, so the socket author starts from facts:

- **The gate is one `Set`.** `src/sim/HeadlessContractSim.ts:41` lists 12 ids, none E5; `:184` throws `AP-07 supports only …`. Verified live 2026-08-06 by running `gr-sim` against `e5-deepwater-claim` and reading the throw. The `mode` bypass at `:183` is **not** a second door here — **no E5 contract declares `modes`** (checked all four), which is the exact jointly-unsatisfiable wall that cost the `e3-fairground` socket run 124k tokens (F-1475-1). Adding ids without a consumer would admit a contract the engine cannot simulate.
- **Three browser-only consumers must move or gain headless twins**, verified to exist at these paths: `src/world/DeepwaterClaimTile.ts`, `src/entities/DeepwaterArsenal.ts`, `src/systems/DredgeQueenBossSystem.ts`.
- **The vocabulary must be consumer-derived, not data-scraped.** `src/agent/MechanicsManifest.ts` reads **none** of `tileParams.deepwater`, `raceCourse`, `stillwater`, `flotilla`, `engineDependencies` (grep-verified against a validated instrument: the file is 339 grep-readable lines and a positive control hits). That absence is *why* `FORBIDDEN_SOURCE` in the census spec passes today; a socket that scraped the data surface instead of deriving from the running consumer would satisfy the letter of the census and none of its intent.
- **Precedent to copy:** the ERA-SOCKET template — `e2-pressure-socket` (`24c6600f`), then `e3-moth-socket`, `e3-canyon-environment`, `e3-crawler-socket` (`a172eed0`). The E3 census spec shows the admission-assert shape a socket must earn: constructor `.not.toThrow()`, a `toMatchObject` on the derived vocabulary, and a determinism pair asserting `secured: true` with matching `eventLogHash`.
- **Order of operations if only one lands:** the Regatta additionally needs non-empty `harvestAnchors` to become selectable at all. **Do not do that first.** While the consumer is missing, the empty list is load-bearing — it is what makes active selection fall back to the Claim instead of booting a false contract. Selectability is the *last* step of that cure, not the first.

### F-ER01-E5-6 — AP-11 never demanded the Claim's declaration, because `tileParams.deepwater` is not a declared-inert path

The census recorded that the Claim alone failed to declare its missing dependencies, and read it as an authoring omission. It is also a **mechanism hole, and the mechanism hole is the more durable half.** `validateEngineDependencies` (`src/meta/ContractFamilies.ts:1713`) only requires a declaration when the contract carries a path listed in `DECLARED_INERT_PATHS` (`:1560`). That list contains `tileParams.raceCourse`, `tileParams.stillwater`, `tileParams.flotilla`, `tileParams.description`, `tileParams.objectives`, `tileParams.teachingIntent` — **and not `tileParams.deepwater`.**

So the three variants were caught by their *variant* fields, never by the deepwater block itself, and the flagship — which carries `deepwater` and none of the listed fields — was structurally invisible to the guard. **The three siblings' honesty was an accident of which fields they happened to also carry, not the guard working.** `tileParams.deepwater` is inert for all four contracts (no consumer reads it, per F-ER01-E5-5), so it belongs on that list.

**Not fixed here: `src/meta/ContractFamilies.ts` is outside this shift's firewall.** But the sweep the fix would need **has already been run, so the next author does not have to.** Measured 2026-08-06 across all ten `assets/contracts/*/contracts.json`: `tileParams.deepwater` occurs in **exactly four contracts, all of them E5, and after today's cure all four declare `engineDependencies`.** So adding `tileParams.deepwater` to `DECLARED_INERT_PATHS` **reds nothing today** — it is a one-line change with a measured zero-fallout window, and that window closes the moment an E11+ epoch or a new variant authors a `deepwater` block. Land it soon and it is free; land it late and it is a migration.

⚠️ **Do not read the zero-fallout as "the guard was fine."** The order matters: the content cure came first and made the corpus clean, so the guard would now pass **because of** the fix rather than because it was ever watching. That is precisely the shape of a guard that passes by reading a subject that has already been repaired.
