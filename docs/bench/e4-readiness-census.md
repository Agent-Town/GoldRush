# E4 READINESS CENSUS — Motor before the owner's ride

Measured 2026-08-05 against all four board contracts in `epoch-4-motor`. Training/drill maps are excluded by the ratified ER-01 default. AP-11 admits a contract only when its signature mechanic is both declared and consumed by a booted system; a generic wave run that ignores the contract's objective is not a census result.

## EXECUTIVE SUMMARY

- **AGENT-READY: 0 of 4** — no Motor contract is cleanly admissible yet.
- **DATA-GAP: 4 of 4** — every contract declares one signature `engineDependencies[{ status: "missing" }]` consumer, and `HeadlessContractSim` consumes none of them.
- ~~**BROKEN: 0** — the authored bundles load and their missing dependencies are declared honestly.~~ **🔴 CORRECTED 2026-08-06 (milk/saga-surgeon) — BROKEN: 1 of 4 (also DATA-GAP). Original line struck in place, retained verbatim above.** The original sentence remains true as far as it goes — the bundles do load and the dependencies are declared honestly — but this census measured only load/declaration integrity and never compared the briefing's countable claims against the structured data. That comparison is the check that found E5's Regatta (`e5-readiness-census.md:9`, six beacon gates declared vs five in `raceCourse.beacons`). Run against E4, it finds **`e4-dust-flats`: the goal promises "four surveyed fields" while `tileParams.buildZones` holds the Motor Camp plus **three** fields.** See **F-MILK-SS-3**. Classified BROKEN on the E5 precedent, which marks the contradiction without deciding which side is wrong.
- All four derived mechanics manifests expose zero interactables. Their generic build-zone, posting, and Baron entries do not express ORBIT/weather roads, the moving Hauler claim, wild-derrick capping, or the salvage/sleeper rules.
- `SUPPORTED_CONTRACTS` and `bench-seeds.json` remain unchanged: ER-01 pins two seeds per admitted contract, and this census admits none. The focused spec checks all four explicit rejections in both Playwright projects with zero captured console output.

## CENSUS

| Contract | Admitted? | Boots? | Verbs? | Determinism? | Naive Trail outcome | Verdict + reason |
|---|---|---|---|---|---|---|
| `e4-dust-flats` | **NO** — support gate rejects it | **BLOCKED** — `dust-flats-tile-consumer` is missing; `DustFlatsTile` has no boot caller | **FAIL** — tar seams, roads, ORBIT, dry wash, and weather have no admitted action/view path | **N/A** — rejected before a bench-grade run | **NOT RUN** — a generic wave run would omit the named Motor tile mechanics | **DATA-GAP + BROKEN** — boot the Dust Flats consumer and derive its vocabulary before admission; separately, the briefing promises four surveyed fields while `buildZones` authors three (F-MILK-SS-3, owner decision) |
| `e4-long-road` | **NO** — support gate rejects it | **BLOCKED** — `convoy-claim-consumer` is missing | **FAIL** — Hauler-only basing, convoy advance, rest-stop anchorage, and lead-Hauler loss have no action/view path | **N/A** — rejected before a bench-grade run | **NOT RUN** — the current sim would defend a fixed stake instead of riding the claim | **DATA-GAP** — the moving-claim socket must own boot, verbs, and terminal rules |
| `e4-gusher-county` | **NO** — support gate rejects it | **BLOCKED** — `wild-derrick-consumer` is missing | **FAIL** — eruptions, cap-to-claim, blowout waves, and seam-spawned tar sprites have no action/view path | **N/A** — rejected before a bench-grade run | **NOT RUN** — generic waves cannot exercise or complete the derrick objective | **DATA-GAP** — add the derrick socket and consumer-derived cap vocabulary before admission |
| `e4-boneyard` | **NO** — support gate rejects it | **BLOCKED** — `salvage-race-consumer` is missing | **FAIL** — stripping hulks, rival salvage, disturbing the sleeper, and preserving it by abstaining have no action/view path | **N/A** — rejected before a bench-grade run | **NOT RUN** — wave survival would not resolve the salvage race or sleeper reward | **DATA-GAP** — the salvage socket needs explicit hidden and abstain vocabulary before admission |

## FINDINGS

### F-ER01-E4-1 — The Dust Flats tile is authored but never booted

The Dust Flats declares tar seams, road corridors, ORBIT spawning, a dry wash, weather, and the Land-Yacht, but its required `dust-flats-tile-consumer` remains `missing`; `createDustFlatsTile` has no caller, and the headless sim does not run it. The attended fix master must boot one real consumer, derive the resulting view/action vocabulary, and socket the same deterministic mechanic into `HeadlessContractSim` before this contract can receive seeds or an admission.

### F-ER01-E4-2 — The Long Road has no moving-claim owner

The Long Road's contract is won and lost around a moving Hauler, brief rest-stop anchorage, and convoy progress, while the current headless path only knows a fixed hero start and generic secure wave. The declared `convoy-claim-consumer` is therefore correctly `missing`; the attended fix master must define one owner for convoy boot, Hauler-relative building/action vocabulary, and the lead-Hauler terminal condition before ER-01 can test determinism honestly.

### F-ER01-E4-3 — Gusher County's objective has no derrick consumer

Gusher County declares scheduled wild-derrick eruptions, capping, blowout waves, and tar sprites that spawn from seams, but none enters the mechanics manifest or headless loop because `wild-derrick-consumer` is `missing`. The attended fix master must add the deterministic derrick scheduler and a real cap operation to both the consumer-derived manifest and headless action path; ordinary survival waves are not a substitute for completing the contract.

### F-ER01-E4-4 — The Boneyard cannot express salvage or restraint

The Boneyard's objective compares the player's salvage against rival rustlers and hides a reward for leaving the sleeper undisturbed, yet `salvage-race-consumer` is `missing` and the manifest exposes neither a salvage operation nor AP-11's hidden/refrain vocabulary. The attended fix master must socket the salvage economy and terminal comparison, mark the sleeper as a designed secret, and expose a machine-readable abstain condition before admission.

### F-MILK-SS-3 — Dust Flats promises four surveyed fields and authors three

**OWNER DECISION — the contradiction is measured and certain; the CURE is a design fork, so this shift filed it rather than picking a side.**

`e4-dust-flats.briefing.goals[0]` reads *"Build from the Motor Camp into four surveyed fields."* `tileParams.buildZones` holds **four** entries, one of which is the camp itself:

```
motor-camp, north-field, southwest-field, southeast-field   ->  camp + 3 fields
```

**The camp is not one of the counted grounds.** Measured against all three siblings in the same bundle, the convention is unbroken:

| Contract | Countable goal claim | Non-camp grounds | Match? |
|---|---|---|---|
| `e4-gusher-county` | "across the **three** leases" | 3 (`west/east/north-lease`) | ✅ camp excluded |
| `e4-long-road` | "between **three** old way-stations" | 3 | ✅ |
| `e4-boneyard` | "into the dead-machine rows" (no count) | 2 (`west/east-rows`) | ✅ |
| `e4-dust-flats` | "into **four** surveyed fields" | **3** | ❌ **off by one** |

`e4-gusher-county` is the decisive control: same bundle, same author, the same *"Build from the &lt;X&gt; Camp <verb> the &lt;N&gt; &lt;grounds&gt;"* template, and its count excludes the camp exactly.

Every other countable claim in this bundle checks out — twelve derrick claims = `harvestAnchors` 12, four tar seams = `tarSeams` 4, four horizons = `spawnEdges` 4, eight derricks = `wildDerricks` 8, ten harvest grounds = `salvageHulks`/`harvestAnchors` 10, the four-hundred-unit road = `size` 400, and Long Road's/Boneyard's spawn-edge directions match their briefings verbatim. This is the single mismatch in E4.

**Why this shift did not cure it.** The two cures are not equivalent and the choice is not a data repair:

- **(a) Author a fourth field** — the map is genuinely missing playable ground. This adds a build zone: gameplay and balance surface, firewalled out of this shift (`NO sim code, no Balance`), and owner/design territory.
- **(b) Correct the prose to "three surveyed fields"** — one word, reversible, matches the data today.

Cure (b) is cheaper and looks obviously right, **which is exactly why it is dangerous**: if the author's intent was four fields, editing the prose permanently erases the only surviving evidence that a field was dropped, converting a live map defect into "working as intended". A briefing is the only place that intent was recorded. **Recommendation: the owner picks; if the Dust Flats plays well as three fields, take (b).** The `four horizons` / `four tar seams` motif elsewhere in the same briefing is weak evidence for (a) and is noted, not relied on.
