# Era-art truth table — E6–E10

Audit date: 2026-07-20  
Source of truth: `specs/epoch-saga/e{6,7,8,9,10}-*-bundle.md` §A, reconciled against `assets/LEDGER.md`, `assets/raw/`, the landed Sol prop/model assets, and the live art queue.

## Counting rule

- One count = one named §A manifest atom: a building, transform, enemy/boss, townsfolk role, aging pass, terrain/prop, or icon cell.
- **SHIPPED** means a usable asset/model/prop matching that atom exists in the repository. A full-bleed saga-library plate is valuable conditioning, but it is not a runtime sheet, keyed cutout, transform, atlas, or icon and therefore does not close those deliverables.
- **MISSING** includes an item currently in flight; its row names the reservation so the attended session does not duplicate it.
- **OBSOLETE** means a new art deliverable is intentionally replaced by a shipped engine/reuse path.
- The E6/E7 reference libraries are real and complete as references (`assets/LEDGER.md:248-249`); E8 is likewise a reference set (`assets/LEDGER.md:257`); E9 is explicitly partial (`assets/LEDGER.md:262`); E10's eleven plates complete the reference library but remain unprocessed references (`assets/LEDGER.md:268`).

## Executive truth

| Era | SHIPPED | MISSING | OBSOLETE | What actually closed |
| --- | ---: | ---: | ---: | --- |
| E6 Atomic Homestead | 1 | 34 | 1 | Homemaker-9000 production model; three roster sprites are in flight, not yet shipped |
| E7 Signal Era | 0 | 35 | 0 | Reference plates only; no §A runtime art atom is closed |
| E8 Orbital Frontier | 4 | 32 | 0 | Salvage Claw model; crater rim, lander legs, journey flag line |
| E9 Red Fields | 6 | 31 | 0 | Old Digger model; Ark yard/scaffold states; canal states, ice blocks, survey cairns |
| E10 Deep Sky | 8 | 18 | 0 | Ark/Long Table production spaces, three civic props, Pan Shrine seam, hull/deck treatment, engine-glow states, procedural Quiet presentation |
| **Total** | **19** | **150** | **1** | Reference plates are not double-counted as implementation assets |

## E6 — The Atomic Homestead

Bundle: `specs/epoch-saga/e6-atomic-bundle.md:8-15`. The shipped reference set includes the three enemy looks, Homemaker concept, Reactor Dome, Atomic Diner, and Isotope Kitchen (`assets/LEDGER.md:152-158`), but those full-bleed files remain `PENDING-CONSUMPTION`. The Homemaker is separately closed by `assets/pilots/homemaker-9000-3d/homemaker-9000.glb` and its verified component/chair contract.

| §A | Bundle atom(s) | Status | Evidence / exact debt |
| --- | --- | --- | --- |
| A1 | Reactor Dome | MISSING | `plate-e6-bld-reactor-dome.png` is reference-only (`assets/LEDGER.md:156`); owed `bld-reactor-dome.png` with humming/dormant cells. |
| A1 | Isotope Kitchen | MISSING | Reference exists (`assets/LEDGER.md:158`); owed `bld-isotope-kitchen.png`. |
| A1 | Appliance Pen; Decay Clock; Catalog Warehouse | MISSING ×3 | No matching raw or model. Owed `bld-appliance-pen.png`, `bld-decay-clock.png`, `bld-catalog-warehouse.png`. |
| A2 | Atomic Diner | MISSING | Poster reference exists (`assets/LEDGER.md:157`); owed silhouette-preserving `bld-tavern-e6.png` image edit. |
| A2 | Sunline Mount; Glow Fence; Isotope Institute | MISSING ×3 | Arsenal/reference dressing does not supply transforms. Owed `bld-signal-turret-e6.png`, `bld-palisade-e6.png`, `bld-schoolhouse-e6.png`. |
| A3 | Feral Toaster; Lawn Shepherd; Glowjack | MISSING ×3 — **IN FLIGHT** | Reference plates shipped (`assets/LEDGER.md:152-154`). Live master `tasks/running/art--20260720-061416-art-batch-roster-e6.md` owns one `char-e6-<enemy_id>-sheet-walk8.png` per enemy; do not commission duplicates. |
| A3 | Homemaker-9000 | SHIPPED | `assets/pilots/homemaker-9000-3d/homemaker-9000.glb`; the concept plate is ledgered at `assets/LEDGER.md:155`. The model supersedes the bundle's flat intact/damage pair. |
| A4 | Reactor Steward; Kitchen Chemist; Appliance Wrangler; Diner Carhop; Combine Defector | MISSING ×5 | No E6 townsfolk deliverables. Owed `tf-reactor-steward-e6.png`, `tf-kitchen-chemist-e6.png`, `tf-appliance-wrangler-e6.png`, `tf-diner-carhop-e6.png`, `tf-combine-defector-e6.png`. |
| A4 | +12y aging pass; Depot Clerk lineage | MISSING ×2 | Hero/Prospector codex plates do not cover the town cast. Owed `<existing-tf-id>-e6.png` edits plus `tf-depot-clerk-e6.png`. |
| A5 | Glow Mesa atlas; decay puddles; Combine crates | MISSING ×3 | Owed `ter-glowmesa-atlas.png`, `prop-decay-puddles.png`, `prop-crates.png`. |
| A5 | Night glow as separate art | OBSOLETE | Bundle itself assigns night to carried E3 tech; veins should use the light/emissive system, not a second terrain atlas. |
| A6 | 12 icons | MISSING ×12 | `icons-e6.png` is explicitly future work (`assets/LEDGER.md:307-309`): sunline, caltrops, glow-fence, sunline mount, starstone, half-life dial, decay-slow, Isotope/Tick/Herd crests, toast, defector catalog. |

**E6 count: SHIPPED 1 / MISSING 34 / OBSOLETE 1.** After the live roster batch lands cleanly: **4 / 31 / 1**.

## E7 — The Signal Era

Bundle: `specs/epoch-saga/e7-signal-bundle.md:7-13`. The ten-file saga library supplies seven relevant conditioning plates (`assets/LEDGER.md:163-169`, summary `assets/LEDGER.md:249`) but no keyed/runtime §A deliverable.

| §A | Bundle atom(s) | Status | Evidence / exact debt |
| --- | --- | --- | --- |
| A1 | Relay Tower; Exchange; Playbook Library | MISSING ×3 | Reference plates exist at `assets/LEDGER.md:167-169`; owed `bld-relay-tower.png`, `bld-exchange.png`, `bld-playbook-library.png`. |
| A1 | Drone Coop; Signal Refinery | MISSING ×2 | No matching raw/model. Owed `bld-drone-coop.png`, `bld-signal-refinery.png`. |
| A2 | Net Café; Beam-relay Turret; Signal Works; Tape-post | MISSING ×4 | Owed `bld-tavern-e7.png`, `bld-signal-turret-e7.png`, `bld-schoolhouse-e7.png`, `bld-rail-depot-e7.png`; all are image edits of their E6 owners. |
| A3 | Rogue Automaton; Data Rustler; Static Hare | MISSING ×3 | References are shipped (`assets/LEDGER.md:163-165`); runtime sheets remain the R-E7 debt named in `specs/enemy-rosters-e6-e10.md:120-127`. |
| A3 | The Echo | MISSING | Reference exists (`assets/LEDGER.md:166`), but §A still owes one reusable `boss-the-echo-mask-sheet.png`; no fixed boss body should be drawn. |
| A4 | Switchboard Chief; Playbook Librarian; Drone Keeper; Tape Courier Kid; first Made Townsfolk | MISSING ×5 | No E7 town-cast asset. Owed `tf-switchboard-chief-e7.png`, `tf-playbook-librarian-e7.png`, `tf-drone-keeper-e7.png`, `tf-tape-courier-e7.png`, `tf-civic-agent-e7.png`. |
| A4 | Aging pass | MISSING | Owed `<existing-tf-id>-e7.png` edits. |
| A5 | Relay Valley atlas; punch-tape ribbons; dish clusters; dead-zone fog markers | MISSING ×4 | Owed `ter-relay-valley-atlas.png`, `prop-punch-tape-ribbons.png`, `prop-dish-clusters.png`, `prop-dead-zone-markers.png`. |
| A6 | 12 icons | MISSING ×12 | `icons-e7.png` is explicitly future work (`assets/LEDGER.md:311-313`): jammer, drone, relay turret, playbook, signal, spectrum, record-dot, Echo/Static/Library crests, dead-zone, delegate-hand. |

**E7 count: SHIPPED 0 / MISSING 35 / OBSOLETE 0.**

## E8 — The Orbital Frontier

Bundle: `specs/epoch-saga/e8-orbital-bundle.md:7-13`. `plate-e8-bld-set.png`, the enemy roster plate, and townsfolk plate are conditioning references (`assets/LEDGER.md:174-177`), not final sheets. The landed Sol branch `sol/e8-orbital-era-props@2f623b23` does close three exact prop atoms through `assets/pilots/plaza-props-3d/era-props.e8.json`.

| §A | Bundle atom(s) | Status | Evidence / exact debt |
| --- | --- | --- | --- |
| A1 | Dome Habitat; Airlock Gate; Launch Pad; Solar Lens Array; Mass-driver Rail; Regolith Works | MISSING ×6 | One combined reference plate exists (`assets/LEDGER.md:177`); owed `bld-dome-habitat.png`, `bld-airlock-gate.png`, `bld-launch-pad.png`, `bld-solar-lens-array.png`, `bld-mass-driver-rail.png`, `bld-regolith-works.png`. |
| A2 | Orbital Canteen; Lens Turret; Mission Archive; Comms Mast | MISSING ×4 | Owed `bld-tavern-e8.png`, `bld-signal-turret-e8.png`, `bld-schoolhouse-e8.png`, `bld-rail-depot-e8.png`. |
| A3 | Scrap Corsair; Debris Rain; Sun-glare Shambler | MISSING ×3 | Combined reference exists (`assets/LEDGER.md:174`); runtime sheets remain R-E8 debt (`specs/enemy-rosters-e6-e10.md:129-137`). |
| A3 | Salvage King's Claw | SHIPPED | `assets/pilots/salvage-claw-3d/salvage-claw.glb`; reference ledger row `assets/LEDGER.md:175`; full-bleed state plates are also banked at `assets/LEDGER.md:341`. No duplicate boss cutout batch. |
| A4 | Launch Master; Dome Gardener; Suit Fitter; He-3 Assayer; Moon-born Child; aging pass | MISSING ×6 | The single townsfolk plate is a reference (`assets/LEDGER.md:176`), not runtime cast art. Owed five `tf-*-e8.png` portraits/sheets plus the `<existing-tf-id>-e8.png` aging edit set. |
| A5 | Mare atlas | MISSING | Owed `ter-mare-atlas.png`; `kit-era-8.png` is an establishing plate, not a 2×2 atlas. |
| A5 | Crater Rim Set; Lander Legs; journey Flag Line | SHIPPED ×3 | `crater-rim-set.e8.glb`, `lander-legs.e8.glb`, `journey-flag-line.e8.glb`; all mounted by `assets/pilots/plaza-props-3d/era-props.e8.json` and verified in `artifacts/dome-orbital-era-props/e8-orbital-props-contract.json`. |
| A6 | 12 icon cells, including the reused air meter | MISSING ×12 | Owed in `icons-e8.png`; the placeholder debt is explicit at `assets/LEDGER.md:315-317`. The air cell must derive from E5's eventual dive-meter cell, but `icons-e5.png` is itself still unprocessed (`assets/LEDGER.md:303-305`), so the reuse is not yet shippable. |

**E8 count: SHIPPED 4 / MISSING 32 / OBSOLETE 0.**

## E9 — The Red Fields

Bundle: `specs/epoch-saga/e9-redfields-bundle.md:7-13`. The E9 reference run was interrupted and explicitly left Dome Commons, Seed Vault, and townsfolk plates absent (`assets/LEDGER.md:185-187`, summary `assets/LEDGER.md:262`). `sol/e9-redfields-era-props@dda2e3ed` closes the progression props named below.

| §A | Bundle atom(s) | Status | Evidence / exact debt |
| --- | --- | --- | --- |
| A1 | Dome Commons; Ice Quarry Rig; Weather Spire; Seed Vault | MISSING ×4 | Dome Commons and Seed Vault reference plates are explicitly `PENDING-ART` (`assets/LEDGER.md:185-186`); no implementation asset exists for any of the four. Owed `bld-dome-commons.png`, `bld-ice-quarry-rig.png`, `bld-weather-spire.png`, `bld-seed-vault.png`. |
| A1 | Canal Works | MISSING | `plate-e9-bld-canal-works.png` is a shipped reference (`assets/LEDGER.md:184`); owed `bld-canal-works.png`. |
| A1 | Ark Yards / visible growth | SHIPPED | Three production scaffold stages ship as `ark-scaffold-stage-{1,2,3}.e9.glb`; declared in `assets/pilots/plaza-props-3d/era-props.e9.json`. |
| A2 | Dome Commons Annex; Storm-lance; Areology Hall; World-band Tower | MISSING ×4 | Owed `bld-tavern-e9.png`, `bld-signal-turret-e9.png`, `bld-schoolhouse-e9.png`, `bld-rail-depot-e9.png`. |
| A3 | Dust Devil; Feral Terraformer; Claim-jump Prospect Drone | MISSING ×3 | Dust and Claim Crow references exist (`assets/LEDGER.md:181-182`); the crow is the accepted look for the named prospect drone (`specs/enemy-rosters-e6-e10.md:139`). Runtime sheets remain R-E9 debt; the terraformer has no standalone reference. |
| A3 | Old Digger | SHIPPED | `assets/pilots/old-digger-3d/old-digger.glb` with intact/gentle state; concept row `assets/LEDGER.md:183` and state plates `assets/LEDGER.md:341`. No duplicate boss cutouts. |
| A4 | Canal Reeve; Ice Quarry Chief; Greenkeeper; Weather Warden; grown Moon-born Child; aging pass | MISSING ×6 | `plate-e9-townsfolk-era.png` is explicitly absent (`assets/LEDGER.md:187`). Owed five named `tf-*-e9.png` outputs plus `<existing-tf-id>-e9.png` edits. |
| A5 | Red Fields atlas | MISSING | Current `kit-era-9.png` is the correct-world establishing reference, not the required atlas. Owed `ter-redfields-atlas.png`; the old valley endpoint is superseded, not usable (`assets/LEDGER.md:262-263`). |
| A5 | Canal segments dry/wet/flowing; Ice Blocks; Survey Cairns; Ark scaffold stages | SHIPPED ×4 | Eight GLBs are banked and progression-separated in `assets/pilots/plaza-props-3d/era-props.e9.json`; contract evidence: `artifacts/basin-redfields-era-props/e9-redfields-props-contract.json`. |
| A6 | 12 icons | MISSING ×12 | Owed `icons-e9.png`; placeholder debt is explicit at `assets/LEDGER.md:319-321`. |

**E9 count: SHIPPED 6 / MISSING 31 / OBSOLETE 0.**

## E10 — The Deep Sky

Bundle: `specs/epoch-saga/e10-deepsky-bundle.md:7-13`. The reference batch covers every major look (`assets/LEDGER.md:268`). Unlike earlier eras, several Ark requirements also have production 3D fulfillment. `sol/e10-ark-era-props@f2425759` closes the remaining civic fixtures and banks engine states.

| §A | Bundle atom(s) | Status | Evidence / exact debt |
| --- | --- | --- | --- |
| Ark | Deck sections per lineage | SHIPPED | Ark production plaza/deck plus the ten lineage inlays; production record in `reviews/sol-3d-c-findings.md:580-617`; reference `kit-era-10.png` is ledgered at `assets/LEDGER.md:268`. |
| Ark | Long Table mess + profile portrait-wall seam | SHIPPED | Production Long Table Hall with ten blank compositor anchors; `reviews/sol-3d-c-findings.md:618-641`; `plate-e10-long-table.png` supplies the reference. Fixed likenesses are intentionally not baked. |
| Ark | Bridge School | SHIPPED | `assets/pilots/plaza-props-3d/bridge-school.e10.glb`. |
| Ark | Charter Press hall/function | SHIPPED | `assets/pilots/plaza-props-3d/charter-press.e10.glb`; child-height lever is contract-verified in `artifacts/ark-era-props-e10/e10-ark-props-contract.json`. |
| Ark | Pan Shrine | SHIPPED | Long Table Hall production seam plus `plate-e10-pan-shrine.png` (`assets/LEDGER.md:268`); it reuses the original handled E1 pan rather than regenerating it. |
| Ark | Hull exterior/deck treatment | SHIPPED | The Ark production plaza supplies the walkable hull/deck and exterior silhouette; `kit-era-10.png` supplies the cutaway reference. |
| Ark | Engine-glow idle/cruise/ward | SHIPPED | `engine-glow-{idle,cruise,ward}.e10.glb`, declared as progression siblings in `assets/pilots/plaza-props-3d/era-props.e10.json`. |
| Worlds | Ember World; Glass Steppe; Sea Moon implementation families | MISSING ×3 | `plate-e10-worlds.png` is a combined reference only. Each still owes atlas + prop sheet; Ember Shore may reuse its shipped 3D landmark pack, while Glass Steppe and Sea Moon also owe one authored landmark set. |
| Enemies | Static Motes | MISSING | `plate-e10-enemy-static-motes.png` is reference-only; owed `char-e10-static_mote-sheet-walk8.png`. |
| Enemies | Unraveled Machines | MISSING | Owed only `fx-static-unravel-mask.png`. Per-enemy redraws are deliberately excluded: one reusable mask over existing sheets is the art-efficiency law (`specs/enemy-rosters-e6-e10.md:100,145-151`). |
| Enemies | The Quiet | SHIPPED | Procedural Static/re-ink presentation is shipped with the finale system; `plate-e10-boss-the-quiet.png` is the verified reference (`assets/LEDGER.md:268`). A duplicate creature body would violate the absence-of-ink design. |
| Weapon | Starlight Pan animation sheet | MISSING | `plate-e10-starlight-pan.png` and `plate-arsenal-e10.png` are references (`assets/LEDGER.md:261,268`); owed `wpn-starlight-pan-sheet.png` using E1 timing. |
| Townsfolk | Living cast final aging pass; Charter-Keeper runtime/history portrait | MISSING ×2 | `plate-e10-townsfolk-era.png` proves the look only. Owed `<existing-tf-id>-e10.png` edits and a compositor-ready `tf-charter-keeper-e10.png` frame/slot with profile-owned content left blank. |
| Icons | 10 icons | MISSING ×10 | Owed `icons-e10.png`; placeholder debt is explicit at `assets/LEDGER.md:323-325`. |

**E10 count: SHIPPED 8 / MISSING 18 / OBSOLETE 0.** New fixed portrait likenesses and duplicate unraveled-enemy sheets are excluded from the batch plan by design, not counted as manifest atoms.

## THE REMAINING BATCH PLAN

One batch in flight remains binding. The live E6 roster batch owns `char-e6-feral_toaster-sheet-walk8.png`, `char-e6-lawn_shepherd-sheet-walk8.png`, and `char-e6-glowjack-sheet-walk8.png`; wait for its ledgered output before authoring another roster master. Bosses with production models stay out of all sprite batches.

The batches below are ordered, sized to 3–8 primary outputs, and reuse every shipped plate/model as conditioning. Aging edits resolve `<existing-tf-id>` from the live cast registry when the master is authored; do not freeze stale cast names here.

### E6

1. **`art-e6-buildings-terrain-a` — 7 files:** `bld-reactor-dome.png`, `bld-isotope-kitchen.png`, `bld-appliance-pen.png`, `bld-decay-clock.png`, `bld-catalog-warehouse.png`, `ter-glowmesa-atlas.png`, `prop-decay-puddles.png`.
2. **`art-e6-buildings-terrain-b` — 5 files:** `prop-crates.png`, `bld-tavern-e6.png`, `bld-signal-turret-e6.png`, `bld-palisade-e6.png`, `bld-schoolhouse-e6.png`. All four buildings after crates are image edits, not fresh generations.
3. **`art-e6-town-icons` — 7 portraits + 1 sheet:** `tf-reactor-steward-e6.png`, `tf-kitchen-chemist-e6.png`, `tf-appliance-wrangler-e6.png`, `tf-diner-carhop-e6.png`, `tf-combine-defector-e6.png`, `tf-depot-clerk-e6.png`, `<existing-tf-id>-e6.png` edit set, `icons-e6.png`.

### E7

1. **`art-e7-buildings-terrain-a` — 7 files:** `bld-relay-tower.png`, `bld-exchange.png`, `bld-playbook-library.png`, `bld-drone-coop.png`, `bld-signal-refinery.png`, `ter-relay-valley-atlas.png`, `prop-punch-tape-ribbons.png`.
2. **`art-e7-buildings-terrain-b` — 6 files:** `prop-dish-clusters.png`, `prop-dead-zone-markers.png`, `bld-tavern-e7.png`, `bld-signal-turret-e7.png`, `bld-schoolhouse-e7.png`, `bld-rail-depot-e7.png`.
3. **`art-roster-e7` — 4 slots / 6 files:** `enm-rogue-automaton-sheet-a.png`, `enm-rogue-automaton-sheet-b.png`, `enm-data-rustler-sheet-a.png`, `enm-data-rustler-sheet-b.png`, `enm-static-hare-sheet.png`, `boss-the-echo-mask-sheet.png`. These are the exact R-E7 names in `specs/enemy-rosters-e6-e10.md`; reuse the four shipped reference plates and draw no Echo body.
4. **`art-e7-town-icons` — 6 portraits + 1 sheet:** `tf-switchboard-chief-e7.png`, `tf-playbook-librarian-e7.png`, `tf-drone-keeper-e7.png`, `tf-tape-courier-e7.png`, `tf-civic-agent-e7.png`, `<existing-tf-id>-e7.png` edit set, `icons-e7.png`.

### E8

1. **`art-e8-buildings` — 6 files:** `bld-dome-habitat.png`, `bld-airlock-gate.png`, `bld-launch-pad.png`, `bld-solar-lens-array.png`, `bld-mass-driver-rail.png`, `bld-regolith-works.png`.
2. **`art-e8-transforms-terrain` — 5 files:** `bld-tavern-e8.png`, `bld-signal-turret-e8.png`, `bld-schoolhouse-e8.png`, `bld-rail-depot-e8.png`, `ter-mare-atlas.png`. Do not regenerate the three shipped Sol props.
3. **`art-roster-e8` — 3 slots / 5 files:** `enm-scrap-corsair-sheet-a.png`, `enm-scrap-corsair-sheet-b.png`, `enm-debris-rain-sheet.png`, `enm-sun-glare-shambler-sheet-a.png`, `enm-sun-glare-shambler-sheet-b.png`. These are the exact R-E8 names; no Salvage Claw cutout because its production GLB owns the boss asset.
4. **`art-e8-town-icons` — 6 portraits + 1 sheet:** `tf-launch-master-e8.png`, `tf-dome-gardener-e8.png`, `tf-suit-fitter-e8.png`, `tf-he3-assayer-e8.png`, `tf-moon-born-child-e8.png`, `<existing-tf-id>-e8.png` edit set, `icons-e8.png`. Copy/reskin the air cell from `icons-e5.png` only after that source sheet lands; do not independently redesign it.

### E9

1. **`art-e9-buildings-a` — 5 files:** `bld-dome-commons.png`, `bld-canal-works.png`, `bld-ice-quarry-rig.png`, `bld-weather-spire.png`, `bld-seed-vault.png`. Do not regenerate Ark scaffold states.
2. **`art-e9-transforms-terrain` — 5 files:** `bld-tavern-e9.png`, `bld-signal-turret-e9.png`, `bld-schoolhouse-e9.png`, `bld-rail-depot-e9.png`, `ter-redfields-atlas.png`. Do not regenerate canal/ice/cairn props.
3. **`art-roster-e9` — 3 slots / 4 files:** `enm-dust-devil-sheet.png`, `enm-feral-terraformer-sheet-a.png`, `enm-feral-terraformer-sheet-b.png`, `enm-claim-jump-prospect-drone-sheet.png`. These are the exact R-E9 names. Condition the last on `plate-e9-enemy-claim-crow.png`; no Old Digger cutout.
4. **`art-e9-town-icons` — 6 portraits + 1 sheet:** `tf-canal-reeve-e9.png`, `tf-ice-quarry-chief-e9.png`, `tf-greenkeeper-e9.png`, `tf-weather-warden-e9.png`, `tf-moon-born-grown-e9.png`, `<existing-tf-id>-e9.png` edit set, `icons-e9.png`.

### E10

1. **`art-e10-world-ember` — 2 files:** `ter-ember-world-atlas.png`, `prop-ember-world.png`; reuse the shipped Ember Shore landmark pack.
2. **`art-e10-world-glass` — 3 files:** `ter-glass-steppe-atlas.png`, `prop-glass-steppe.png`, `landmark-glass-steppe.png`.
3. **`art-e10-world-sea` — 3 files:** `ter-sea-moon-atlas.png`, `prop-sea-moon.png`, `landmark-sea-moon.png`.
4. **`art-roster-e10` — 2 files:** `enm-static-mote-sheet.png`, `fx-static-unravel-mask.png`. These are the exact R-E10 names. Do not redraw prior-era enemies or the procedural Quiet.
5. **`art-e10-pan-town` — 3 deliverables:** `wpn-starlight-pan-sheet.png`, `<existing-tf-id>-e10.png` edit set, `tf-charter-keeper-e10.png` compositor frame. The Keeper frame must contain no fixed family likeness.
6. **`art-e10-icons` — 1 sheet:** `icons-e10.png` with starlight, Pan, static ward, re-ink, preserve seal, world charter, Ark, Press, Quiet crest, ten-era ribbon.

## Do-not-commission list

- E6 Homemaker, E8 Salvage Claw, and E9 Old Digger 2D boss replacements: production GLBs already own those silhouettes and states.
- E8 crater rim, lander legs, and journey flag line; E9 canal/ice/cairn/scaffold props; E10 Bridge School, Charter Press, preserve rack, and engine-glow states: landed Sol packs own them.
- E8 air-meter redesign: reuse E5 once `icons-e5.png` exists; until then the E8 icon cell remains missing.
- E10 per-enemy unraveled variants: one mask over existing sheets.
- E10 fixed player-family portraits: compositor-owned, profile-derived.
- Any new saga-library/reference plate for E6–E10: that shelf is already complete; spend art slots on the implementation files above.

READY-FOR-GATES

Per-era totals: **E6 1/34/1 · E7 0/35/0 · E8 4/32/0 · E9 6/31/0 · E10 8/18/0** (SHIPPED/MISSING/OBSOLETE).
