# E4 READINESS CENSUS — Motor before the owner's ride

Measured 2026-08-05 against all four board contracts in `epoch-4-motor`. Training/drill maps are excluded by the ratified ER-01 default. AP-11 admits a contract only when its signature mechanic is both declared and consumed by a booted system; a generic wave run that ignores the contract's objective is not a census result.

## EXECUTIVE SUMMARY

- **AGENT-READY: 0 of 4** — no Motor contract is cleanly admissible yet.
- **DATA-GAP: 4 of 4** — every contract declares one signature `engineDependencies[{ status: "missing" }]` consumer, and `HeadlessContractSim` consumes none of them.
- ~~**BROKEN: 0** — the authored bundles load and their missing dependencies are declared honestly.~~ **🔴 CORRECTED 2026-08-06 (milk/saga-surgeon) — BROKEN: 1 of 4 (also DATA-GAP). Original line struck in place, retained verbatim above.** The original sentence remains true as far as it goes — the bundles do load and the dependencies are declared honestly — but this census measured only load/declaration integrity and never compared the briefing's countable claims against the structured data. That comparison is the check that found E5's Regatta (`e5-readiness-census.md:9`, six beacon gates declared vs five in `raceCourse.beacons`). Run against E4, it finds **`e4-dust-flats`: the goal promises "four surveyed fields" while `tileParams.buildZones` holds the Motor Camp plus **three** fields.** See **F-MILK-SS-3**. Classified BROKEN on the E5 precedent, which marks the contradiction without deciding which side is wrong.
- **AMENDED 2026-08-06 (milk/motor-socket).** The 2026-08-05 sweep recorded all four Motor mechanics as unconsumed. **That is measurably wrong for one of them.** `tileParams.orbitSpawn` has a live browser consumer today: `Game.ts:808` constructs `LandYachtBossSystem` unconditionally and `Game.ts:2549` updates it every sim tick, and that system reads `orbitSpawn.center/radius/angularSpeed` at `LandYachtBossSystem.ts:256-277` to drive the boss around the ORBIT road. Under AP-11 — a mechanic is admitted when it is **both declared and consumed by a booted system** — the ORBIT road therefore belongs in the manifest, and now is there. The other three Motor mechanics were re-measured and the original finding holds: `convoyRoute`/`restStops`, `wildDerricks`/`outhouseGeyser`, and `salvageHulks`/`sleeper`/`unmarkedWagon` have **zero readers** in `src/` outside type declarations and the two string registries in `ContractFamilies.ts`.
- `e4-dust-flats`'s manifest now derives **five ORBIT rules** (`land_yacht_orbit`, `land_yacht_acts`, `land_yacht_head_loot`, `land_yacht_crane`, `land_yacht_dread`), every number read from the consumer or from real `twist`/`Balance` keys. **Zero operations were minted** — the Land Yacht is a thing the agent must survive and position around, not a lever it pulls, so `buildables` stays empty and no new verb was invented. The four `orbitSpawn` fields no booted system reads (`lapsBeforePeel`, `peelSpeed`, `telegraphSeconds`, `peelPoints`) stay **out** of the manifest, and the focused spec asserts their absence so a later author cannot mint them by accident. The other three contracts' manifests are unchanged.
- All four derived manifests still expose zero interactables, and **all four contracts remain rejected by the support gate** — the manifest half of the Dust Flats gap is cured, the headless half is not (see F-ER01-E4-5). *(Drain note, s1497: `milk/saga-surgeon` carried this bullet at its pre-ORBIT wording — "their generic build-zone, posting, and Baron entries do not express ORBIT/weather roads…" — which `milk/motor-socket` had already superseded on main by deriving the five ORBIT rules. Main's newer sentence is kept; the older one is not a competing claim, it is the same sentence at an earlier revision.)*
- `SUPPORTED_CONTRACTS` and `bench-seeds.json` remain unchanged: ER-01 pins two seeds per admitted contract, and this census admits none. The focused spec checks all four explicit rejections in both Playwright projects with zero captured console output.

## CENSUS

| Contract | Admitted? | Boots? | Verbs? | Determinism? | Naive Trail outcome | Verdict + reason |
|---|---|---|---|---|---|---|
| `e4-dust-flats` | **NO** — support gate rejects it | **BLOCKED** — `dust-flats-tile-consumer` is missing; `DustFlatsTile` has no boot caller. The ORBIT road is booted separately, by `LandYachtBossSystem` | **PARTIAL** — ORBIT now has consumer-derived manifest vocabulary (5 rules, 0 new ops); tar seams, roads, dry wash, and weather still have no action/view path | **N/A** — rejected before a bench-grade run | **NOT RUN** — a generic wave run would omit the named Motor tile mechanics | **DATA-GAP + BROKEN** — ORBIT is declared; admission still needs the headless socket, which is blocked by F-ER01-E4-5; separately, the briefing promises four surveyed fields while `buildZones` authors three (F-MILK-SS-3, owner decision) |
| `e4-long-road` | **NO** — support gate rejects it | **BLOCKED** — `convoy-claim-consumer` is missing | **FAIL** — Hauler-only basing, convoy advance, rest-stop anchorage, and lead-Hauler loss have no action/view path | **N/A** — rejected before a bench-grade run | **NOT RUN** — the current sim would defend a fixed stake instead of riding the claim | **DATA-GAP** — the moving-claim socket must own boot, verbs, and terminal rules |
| `e4-gusher-county` | **NO** — support gate rejects it | **BLOCKED** — `wild-derrick-consumer` is missing | **FAIL** — eruptions, cap-to-claim, blowout waves, and seam-spawned tar sprites have no action/view path | **N/A** — rejected before a bench-grade run | **NOT RUN** — generic waves cannot exercise or complete the derrick objective | **DATA-GAP** — add the derrick socket and consumer-derived cap vocabulary before admission |
| `e4-boneyard` | **NO** — support gate rejects it | **BLOCKED** — `salvage-race-consumer` is missing | **FAIL** — stripping hulks, rival salvage, disturbing the sleeper, and preserving it by abstaining have no action/view path | **N/A** — rejected before a bench-grade run | **NOT RUN** — wave survival would not resolve the salvage race or sleeper reward | **DATA-GAP** — the salvage socket needs explicit hidden and abstain vocabulary before admission |

## FINDINGS

### 🟡 PARTIALLY CURED — F-ER01-E4-1 — The Dust Flats tile is authored but never booted

The Dust Flats declares tar seams, road corridors, ORBIT spawning, a dry wash, weather, and the Land-Yacht, but its required `dust-flats-tile-consumer` remains `missing`; `createDustFlatsTile` has no caller, and the headless sim does not run it. The attended fix master must boot one real consumer, derive the resulting view/action vocabulary, and socket the same deterministic mechanic into `HeadlessContractSim` before this contract can receive seeds or an admission.

**CURE, PARTIAL (2026-08-06, milk/motor-socket):** the paragraph above is correct about `DustFlatsTile` and **wrong about ORBIT**. `createDustFlatsTile` is indeed dead code — re-verified with five distinct search patterns plus `git log -S`, which shows it was **never** wired into `Game.ts`, so this is not a regression to restore. But ORBIT spawning does not depend on it: `LandYachtBossSystem` is constructed unconditionally (`Game.ts:808`), updated every tick (`Game.ts:2549`), and reads `tileParams.orbitSpawn` (`LandYachtBossSystem.ts:256-277`). ORBIT was therefore **declared and consumed**, and AP-11 required it in the manifest. It is now derived there — five rules, no invented operation. What remains uncured, and what still blocks admission: the tile's own layers (tar seams, road corridors, dry wash, `twist.weather`) have no booted consumer, and the headless socket is blocked by **F-ER01-E4-5**. `SUPPORTED_CONTRACTS` is unchanged; the contract is still rejected.

### F-ER01-E4-2 — The Long Road has no moving-claim owner

The Long Road's contract is won and lost around a moving Hauler, brief rest-stop anchorage, and convoy progress, while the current headless path only knows a fixed hero start and generic secure wave. The declared `convoy-claim-consumer` is therefore correctly `missing`; the attended fix master must define one owner for convoy boot, Hauler-relative building/action vocabulary, and the lead-Hauler terminal condition before ER-01 can test determinism honestly.

### F-ER01-E4-3 — Gusher County's objective has no derrick consumer

Gusher County declares scheduled wild-derrick eruptions, capping, blowout waves, and tar sprites that spawn from seams, but none enters the mechanics manifest or headless loop because `wild-derrick-consumer` is `missing`. The attended fix master must add the deterministic derrick scheduler and a real cap operation to both the consumer-derived manifest and headless action path; ordinary survival waves are not a substitute for completing the contract.

### F-ER01-E4-4 — The Boneyard cannot express salvage or restraint

The Boneyard's objective compares the player's salvage against rival rustlers and hides a reward for leaving the sleeper undisturbed, yet `salvage-race-consumer` is `missing` and the manifest exposes neither a salvage operation nor AP-11's hidden/refrain vocabulary. The attended fix master must socket the salvage economy and terminal comparison, mark the sleeper as a designed secret, and expose a machine-readable abstain condition before admission.

### F-ER01-E4-5 — The Motor era's one real consumer cannot boot headless: it loads textures in a field initializer

**NEW 2026-08-06 (milk/motor-socket). This is the single blocker between `e4-dust-flats` and an admission, and it is one property of one file.**

`HeadlessContractSim` runs under Node (`vite.ssrLoadModule`, see any `er01-*-census.spec.ts`), where there is no `document`. `LandYachtBossSystem` builds its sprites eagerly — the `wreck` field initializer at `LandYachtBossSystem.ts:56` calls `sprite()` (`:341-353`), which calls `new THREE.TextureLoader().load(...)` → `ImageLoader.load` → `createElementNS` → **`ReferenceError: document is not defined`**. Measured directly: the module imports fine, construction throws.

**The control arm is what makes this precise.** `MothSwarm`, `CrawlerBossSystem`, and `PressureSystem` — the three systems the E2 and E3 era sockets wired — all construct cleanly under the same Node harness. The three sockets that succeeded happened to pick presentation-light systems. This is the first era socket whose consumer is presentation-eager, so the wall is new, not a repeat.

**Two cures were tested and one was refuted, so the next author does not have to re-derive it:**
- **Refuted — shim `document` from inside `src/sim`.** It works mechanically (construction succeeds, zero console output after settling). It is still wrong: `src/game/RunManager.ts:94` branches on `typeof document !== 'undefined'` and would then build a `RunSuspendController` that headless runs do not build today, changing behavior for **every** contract, not just this one. A narrow need does not justify that blast radius.
- **Recommended — the presentation split `CrawlerBossSystem` already uses, extended to the constructor.** That system is the exact precedent: its only DOM call is `document.querySelector` at `CrawlerBossSystem.ts:510`, inside `syncPresentation`, and it exposes `update()` = `step()` + `syncPresentation()` (`:144-149`) so that `HeadlessContractSim.ts:428` can call the sim-only `step()`. `LandYachtBossSystem` needs the same seam plus one thing the Crawler gets for free — a **constructor** that does no eager texture work (defer `sprite()` to first render, or gate it behind a `presentation: boolean` flag, the `E6TileConsumerSystem` construct-always/gate-internally shape). Browser behavior is unchanged either way.
- **Proven sufficient, not assumed:** with texture loading neutralised the system constructs, `update()` runs, and `diagnostics()` reports, with zero console output after settling. Its sim half is already deterministic — `grep -c Math.random src/systems/LandYachtBossSystem.ts` returns **0**, and the orbit route is a pure function of `orbitSpawn` plus component positions.

**A record correction this measurement forces.** The `F-1470-1` BACKLOG note states that `CrawlerBossSystem` "calls bare `document.querySelector` from its constructor and every `update()`". Both halves are inaccurate: its constructor is DOM-free (it constructs cleanly under the Node harness — measured), and the call is reachable only through `syncPresentation`, which `step()` bypasses. The conclusion drawn there — that the Crawler is not socketable — may still hold for its other stated reasons (the async GLB fetch, the tick budget), but not for this one. It matters because the era-socket ladder decides what to attempt next by exactly this criterion.

This finding is filed rather than fixed because `src/systems/**` is outside the milk/motor-socket firewall. Once it lands, the remaining socket work is the ordinary template: add `e4-dust-flats` to `SUPPORTED_CONTRACTS`, construct the system gated on `twist.baron.variantId === 'land_yacht'`, update it in browser tick order (after the boss block, before `syncStockpileHoldings`), and prove the determinism pair.

### F-ER01-E4-6 — `DECLARED_INERT_PATHS` lists `tileParams.orbitSpawn`, which is not inert

**NEW 2026-08-06 (milk/motor-socket).** `ContractFamilies.ts:1563` registers `tileParams.orbitSpawn` as a declared-inert path, which is what forces `e4-dust-flats` to carry an `engineDependencies` entry for it (`ContractFamilies.ts:1713-1718`). But `orbitSpawn` **is** consumed in a plain browser boot, by `LandYachtBossSystem`. The registry — the repo's own machine-readable record of "declared but consumed nowhere" — is therefore wrong about this one path, and the contract's own `engineDependencies` description ("Needs the booted DustFlatsTile consumer for the declared tar seams, roads, ORBIT spawn, and dry wash") over-claims by naming ORBIT among them.

Nothing is broken by this today: the registry only *requires a declaration*, so a false entry costs honesty, not behavior. It matters because `DECLARED_INERT_PATHS` is the assayer's evidence base for AP-11's "no undeclared mechanics" law — a path wrongly listed there is a mechanic the assayer will never ask anyone to declare. Recommended, both outside this shift's firewall: drop `'tileParams.orbitSpawn'` from `DECLARED_INERT_PATHS`, and narrow the `dust-flats-tile-consumer` description to the layers that really are unconsumed (tar seams, road corridors, dry wash, weather). The contract must keep its `engineDependencies` entry either way — those four are still genuinely inert.
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

**Re-derived at drain time (s1497), not inherited.** `e4-dust-flats.briefing.goals[0]` = *"Build from the Motor Camp into four surveyed fields."*; `buildZones` = `motor-camp, north-field, southwest-field, southeast-field`. Controls re-read from the same bundle: `e4-gusher-county` "three leases" → `county-camp, west-lease, east-lease, north-lease` (camp excluded, exactly 3); `e4-long-road` "three old way-stations" → 3 zones, **no camp zone at all**; `e4-boneyard` no count → `gate-camp` + 2 rows. The convention holds in all three controls and breaks only here.
