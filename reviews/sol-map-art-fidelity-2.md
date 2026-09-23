# Drain review — `sol-map-art-fidelity-2`: run 9 of Astra's map-art campaign, the second fidelity pass — the art-owned residue on the other twenty-two maps, E1 → E9; landed in mid-run slices

**Run:** `sol-map-art-fidelity-2` · lane-c, gpt-6-astra xhigh on the owner's ChatGPT subscription · code branch `sol/map-art-campaign-2` · store branch `astra/fidelity-2` in `Agent-Town/GoldRush-assets`, committed from the lanes' own store worktree (`worktrees/GoldRush-assets`, since 2026-09-22) · authored and dispatched 2026-09-22 on the owner's wave word (verbatim: "There will be a reset in the next 24 hours. Lets hit it! Full Codex power."). The bar is the corrections campaign's; every clause is judged against its own run-6 number.

The run is split into legs by epoch on the owner's word of 2026-09-22 ("Can the work be split in E1, E2, E3 and so on and we start with E1 and E2? I have 9% left on the subscription and it is a reset I can use anytime when I want."): one store branch `astra/fidelity-2` across the legs, each leg its own master and leaf (`sol-map-art-fidelity-2-e1-e2`, `-e3`, `-e4`, `-e6`, `-e7`, `-e8`, `-e9`), queued one after another on his word.

**How it lands:** in slices while Astra keeps working, as run 4 did: per slice the store's main is fast-forwarded to the last finished map's store commit (no checkout; the lane store worktree keeps Astra's branch), the lane merged up to that map's commit in the detached chain worktree, the pin measured with `assets/pilots` resolving to the drains' scratch store worktree detached at the landed store commit; production and the all-epochs preview are both deployed per slice (since 2026-09-22 the primary store is no lane's: the lanes commit in their own store worktree). Each slice below carries its evidence table, merge classification and findings; the run verdict is written with the final slice.

## Slice 1 — LANDED `79faa20b0` (2026-09-23 01:07Z): the Pressure Garden

**Lane up to** `6e306d1a0` · **store main** `25fed85` (landed first, pushed) · **merge** `79faa20b0` · same-era pin #41 `39b444b4`

### What it does (the run-6 HELD clauses answered FIXED / IMPROVED with a number against run 6 / HELD with the owner named)
**The Pressure Garden — IMPROVED / HELD (Astra's own verdict).** The river's dark rectangular blocks give way to engraved gravel and shorter, irregular current marks: the centre-to-margin contrast falls from 0.119 to 0.020 on desktop and 0.119 to 0.015 on the phone (−83.1% / −87.4%); seventy-eight grounded stones add 1,560 scenery triangles (panorama 2,112 → 3,672 of 4,000) while the ±6 m ford stays clear (closest vertex at |x| 8.33 m). The run-4 desktop ground RMS holds at 0.0233; the phone's rises 6.3% from the added silhouettes, which Astra names as such rather than a noise claim. Terrain, landmarks, atlas, collision, heights, masks, mounts and stations are unchanged; whole-body emission stays 0.45; frame p95 9.50 → 9.30 ms desktop and 8.85 → 9.20 ms phone, draws 90 / 58 unchanged; the E1 first-town payload reads 34,311,865 B (+2,035 B, no E1 art asset changes). HELD by art: the straight, slab-like shoreline, weak wet contact, and the greener, darker water with little reflection; the parallel geography and the boiler, terrace and HUD composition stay with their owners. A fresh independent review confirms the bounded improvement with no new readability regression. Astra measured the engine hash at `e300ac0f…` with the lane store at `25fed85`; the drain's own measurement on the merged tree is the pin below. **The leg's scope audit:** Night Shift, Twin Banks, the Claim-Jumper Baron and the Trestle are skipped by the master's own rule (their latest reviews hold no clause for an art owner, only contract, simulation, camera, UI, geography or excluded-file owners), so this leg is two maps; skipping does not promote a map's art or gameplay verdict.
Where the player sees it: the plain entry of these maps, on production and the all-epochs preview.

### Evidence (this slice's gates on the merged tree, the scratch store clean at the landed store main)
| Check | Result |
| --- | --- |
| the store landing | `25fed85` on `Agent-Town/GoldRush-assets` main, pushed; the scratch store worktree detached at it, clean, before any hash was measured (F-A3-2) |
| merge | `clean, no conflicts` |
| single-line law (F-CORR1-4) | `nothing to flatten` |
| tsc / build / e1 | `0 / 0 / 0` (rc) · payload `34316949 bytes` |
| engine hash | `39b444b44c8ea249…`; same-era pin #41 `39b444b4`, era guards in the chain `ℹ pass 9 ℹ fail 0` |
| halo / null floors / law-pointer | `rc=0 halo re-extraction PASS: 315 cured, 0 held, 760 regenerated-and-cured, 2127 scanned; alpha and opaque RGB unchanged` · `rc=0 83 of 83 null floors match assets/contracts/null-floors.json (316.2s).` · `rc=0 law-pointer-guard — do the law surfaces still point at what they claim?` |
| named guards | `ℹ pass 98 ℹ fail 0` |
| e2e both projects, `--workers=1` (the maps' own specs, landmark brightness/collision, fort collision, task-025, m2-01) | `rc=0   4 skipped   48 passed (5.9m)  01:00Z` |
| e2e reds | none<br>Attribution: Attribution: pre-attributed by a control of this slice's specs on main `4f1e62e2b` with the store's main at `d893817` before the merge (`drain-s1-e2e-control-main.log`: rc=0, 0 failure lines) — every red on the merged tree below matches a line of that control by file, test line and project; nothing in this slice's diff touches those tests' subjects. |
| full `npm run test:node-guards` (before the pin) | `rc=1 ℹ tests 955 ℹ pass 947 ℹ fail 3 ℹ skipped 5  01:07Z` |
| battery reds | `✖ all 152 scripts/*.test.mjs fixture owners remove their temp directories (166037.057625ms)`<br>`✖ failing tests:`<br>`✖ rotation registry stays outside the engine identity corpus (679.956625ms)`<br>`✖ the landed registry names the live engine and stays outside its hash corpus (176.2795ms)` (the engine-era, bench-seeds and fixture-sweep rows are the pre-pin hash class, cured by the pin above) |

### Merge classification
Code: `src/world/*` (render side, incl. `Water.ts`), the render-only presentation owners, `src/entities/*` pure visuals (the Motor vehicle), `reviews/sol-map-art-current-status-20260909.md`, `artifacts/sol/map-art-campaign-2/report.md` (a dated run-9 section) and `run-9/**`. Store: `pilots/map-rebuild-spike/**` for these maps, one commit per map, landed on the store's main first. Firewall: within the master's Touch ONLY plus the store. Base: the chain's previous tip; MAIN-MOVED files are fire bookkeeping taken as theirs at the main merge before the fast-forward.

### Findings
- **F-F2-1 (the master's rule applied, information):** the E1 three and the Trestle carry no art-owned clause in their latest reviews and no independent critique, so Astra skipped them with the owner audit in `run-9/run-note.md`; the E1 payload law therefore had nothing to bite on in this leg, and the leg is the Pressure Garden and the Incline.
- **F-F2-2 (pre-existing, attributed):** Astra's broad batch carries six registry failures reproduced on its exact base (its lane predates the test-truth landing, so it sees the three old rows); on the merged tree the drain's control expects the two rows F-TTRC-1 holds.
- **F-F2-3 (information):** the lane predates the two mirror cures on main (`214a54568`, `82c226185`), so Astra's own droplet-mirror gate stayed red while it proved the current main script passes in an isolated tree (`run-9/mirror-prerequisite-proof.json`); the drain's early mirror check on the merged tree is the proof that counts.

## Slice 2 — LANDED `5d2748f27` (2026-09-23 01:36Z): the Incline

**Lane up to** `84992f3bf` · **store main** `d76ee14` (landed first, pushed) · **merge** `5d2748f27` · same-era pin #42 `16c2576d`

### What it does (the run-6 HELD clauses answered FIXED / IMPROVED with a number against run 6 / HELD with the owner named)
**The Incline — IMPROVED / HELD (Astra's own verdict).** The upper ore cable house reads as a mechanism: a spoked sheave and hub, explicit cable returns and a wound drum replace the buried dark winch, which is removed as a whole component; a timber roof, an exhaust neck and a boarded platform with a 0.48 m fascia (from 0.24 m) replace the thin red-roof and sheet reading. The body grows 2,028 → 2,136 of 3,000 triangles with its bounds, mount, collision footprint and inspection station exact, the four sibling GLBs and every atlas pixel untouched; the body median rises against run 4 from 0.134 to 0.164 desktop and 0.137 to 0.166 phone at emission 0.375; the ground median is unchanged and its RMS moves under one percent with no noise claim. The phone's primary persistent HUD coverage falls 0.270% → 0.246%, the desktop's rises 0.008% → 0.059% and is reported as such; ordinary phone dialogue still hides the upper mechanism. HELD by art: the similar brown materials, the exposed pale base strips and the weak platform contact; the entry and offscreen terminal, the track connection, the cliffs and the UI stay with their owners. The independent critique prefers the cleared mechanism and finds no new geometry or depth-ordering defect. Frame p95 9.65 → 9.60 ms desktop and 9.80 → 9.55 ms phone, draws 76 / 58 unchanged; the E1 first-town payload reads 34,311,866 B (+1 B; +2,036 B across the leg, no E1 art changes). Astra measured the engine hash at `72968f9a…` with the lane store at `d76ee14`; the drain's own measurement on the merged tree is the pin below.

**Leg verdict (E1 and E2).** Two maps carried an art-owned clause and both are answered with numbers against their own earlier runs: the Pressure Garden's river and banks, the Incline's cable house and platform. Night Shift, Twin Banks, the Claim-Jumper Baron and the Trestle hold no clause for an art owner in their latest reviews and are skipped without promoting their verdicts; the E1 payload law had nothing to bite on. The run ended without a quota refusal; the next leg (E3, the Canyon Works) waits for the owner's word.
Where the player sees it: the plain entry of these maps, on production and the all-epochs preview.

### Evidence (this slice's gates on the merged tree, the scratch store clean at the landed store main)
| Check | Result |
| --- | --- |
| the store landing | `d76ee14` on `Agent-Town/GoldRush-assets` main, pushed; the scratch store worktree detached at it, clean, before any hash was measured (F-A3-2) |
| merge | `clean, no conflicts` |
| single-line law (F-CORR1-4) | `nothing to flatten` |
| tsc / build / e1 | `0 / 0 / 0` (rc) · payload `34316950 bytes` |
| engine hash | `16c2576d36273edf…`; same-era pin #42 `16c2576d`, era guards in the chain `ℹ pass 9 ℹ fail 0` |
| halo / null floors / law-pointer | `rc=0 halo re-extraction PASS: 315 cured, 0 held, 760 regenerated-and-cured, 2127 scanned; alpha and opaque RGB unchanged` · `rc=0 83 of 83 null floors match assets/contracts/null-floors.json (295.4s).` · `rc=0 law-pointer-guard — do the law surfaces still point at what they claim?` |
| named guards | `ℹ pass 98 ℹ fail 0` |
| e2e both projects, `--workers=1` (the maps' own specs, landmark brightness/collision, fort collision, task-025, m2-01) | `rc=0   4 skipped   48 passed (5.7m)  01:29Z` |
| e2e reds | none<br>Attribution: Attribution: pre-attributed by a control of this slice's specs on main `a07c0f251` with the store's main at `25fed85` before the merge (`drain-s2-e2e-control-main.log`: rc=0, 0 failure lines) — every red on the merged tree below matches a line of that control by file, test line and project; nothing in this slice's diff touches those tests' subjects. |
| full `npm run test:node-guards` (before the pin) | `rc=1 ℹ tests 955 ℹ pass 947 ℹ fail 3 ℹ skipped 5  01:36Z` |
| battery reds | `✖ all 152 scripts/*.test.mjs fixture owners remove their temp directories (185983.790292ms)`<br>`✖ failing tests:`<br>`✖ rotation registry stays outside the engine identity corpus (608.618ms)`<br>`✖ the landed registry names the live engine and stays outside its hash corpus (188.606833ms)` (the engine-era, bench-seeds and fixture-sweep rows are the pre-pin hash class, cured by the pin above) |

### Merge classification
Code: `src/world/*` (render side, incl. `Water.ts`), the render-only presentation owners, `src/entities/*` pure visuals (the Motor vehicle), `reviews/sol-map-art-current-status-20260909.md`, `artifacts/sol/map-art-campaign-2/report.md` (a dated run-9 section) and `run-9/**`. Store: `pilots/map-rebuild-spike/**` for these maps, one commit per map, landed on the store's main first. Firewall: within the master's Touch ONLY plus the store. Base: the chain's previous tip; MAIN-MOVED files are fire bookkeeping taken as theirs at the main merge before the fast-forward.

### Findings
- **F-F2-4 (pre-existing, attributed by Astra on the exact preceding code/store):** the Incline's own and pack browser batch carries six registry failures matched by fingerprint to the exact preceding engine (the three old registry rows, both projects; the lane predates the test-truth landing), outside this slice's gate; the drain's control on the current main expects the two rows F-TTRC-1 holds.
- **F-F2-5 (information, the leg's payload):** the E1 first-town payload moved +2,036 B across the leg with no E1 art asset changed (the render-side table edits for E2 maps), under the 52,000,000 B law by a wide margin.
- **F-F2-6 (the next leg):** `sol-map-art-fidelity-2-e3` (the Canyon Works, one map) is prepared with its leaf gate-side and queues on the owner's word; the remaining legs follow in epoch order.

## Slice 3 — LANDED `155a99214` (2026-09-23 09:55Z): the Canyon Works

**Lane up to** `2eb461562` · **store main** `b041416` (landed first, pushed) · **merge** `155a99214` · same-era pin #43 `0a23a542`

### What it does (the run-6 HELD clauses answered FIXED / IMPROVED with a number against run 6 / HELD with the owner named)
**The Canyon Works — IMPROVED / HELD (Astra's own verdict; the E3 leg is this one map).** The sub-hall dynamo house stops reading as a slab with wheel motifs: a supported dynamo drum and rotor, a framed hall, a seamed metal roof, ceramic terminals and a masonry-and-board foundation, at 2,552 of 3,000 triangles (from 1,768) with the original bounds, mount, collision footprint and 3 m station exact, the four sibling bodies and the landmark atlas untouched; the body median rises 2.55% desktop and 2.88% phone at whole-body emission 0.45, the phone station's HUD coverage rises 0.002% → 0.010% (disclosed) and the entry stays 26.6% covered. The blank panorama apron gains fourteen layered buttresses and fourteen irregular talus pieces outside the playable rectangle (panorama 2,496 → 3,980 of 4,000), the original apron keeps every triangle position including the seam-closing ring, the bright-seam count stays 0 / 0 and the strongest row step across those strips falls 75.8% / 83.2%; the playable ground's RMS is pixel-identical to run 4 between fresh arms, and terrain, heights, masks, routes, spawns, collision, stations and atlas pixels are exact. The independent final review prefers the candidate. HELD by art: fine engraving, uniform framing, weak contact shading, the sparse angular cliff detail and the four unchanged sibling bodies; the gorge's orientation and route hierarchy, the true powered-grid composition and the entry HUD stay with their owners. Frame p95 9.50 → 9.75 ms desktop and 9.65 → 9.65 ms phone, draws 72 → 74 / 54 → 56. The raw runtime GLBs grow by 15,677,584 B, almost all of it the three-atlas panorama (836,136 → 16,459,928 B), an explicit E3 download cost outside the E1 release; the E1 first-town payload reads 34,311,999 B (+133 B, no E1 art changes). Astra measured the engine hash at `c01ea77a…` with the lane store at `b041416`; the drain's own measurement on the merged tree is the pin below.

**Leg verdict (E3).** One map carried an art-owned clause and both of its held clauses (the straight textured floor and backdrop composition, the machinery's construction and contact fidelity) are answered with numbers against run 4; the remaining list is empty and the run ended without a quota refusal. The next leg (E4: the Dust Flats, the Long Road, Gusher County, the Boneyard) is queued by this drain on the owner's word.
Where the player sees it: the plain entry of these maps, on production and the all-epochs preview.

### Evidence (this slice's gates on the merged tree, the scratch store clean at the landed store main)
| Check | Result |
| --- | --- |
| the store landing | `b041416` on `Agent-Town/GoldRush-assets` main, pushed; the scratch store worktree detached at it, clean, before any hash was measured (F-A3-2) |
| merge | `clean, no conflicts` |
| single-line law (F-CORR1-4) | `nothing to flatten` |
| tsc / build / e1 | `0 / 0 / 0` (rc) · payload `34317083 bytes` |
| engine hash | `0a23a5425e7b47bb…`; same-era pin #43 `0a23a542`, era guards in the chain `ℹ pass 9 ℹ fail 0` |
| halo / null floors / law-pointer | `rc=0 halo re-extraction PASS: 315 cured, 0 held, 760 regenerated-and-cured, 2127 scanned; alpha and opaque RGB unchanged` · `rc=0 83 of 83 null floors match assets/contracts/null-floors.json (310.6s).` · `rc=0 law-pointer-guard — do the law surfaces still point at what they claim?` |
| named guards | `ℹ pass 98 ℹ fail 0` |
| e2e both projects, `--workers=1` (the maps' own specs, landmark brightness/collision, fort collision, task-025, m2-01) | `rc=1   2 failed   4 skipped   48 passed (5.9m)  09:47Z` |
| e2e reds | `1) [desktop-chrome] › e2e/er01-e3-census.spec.ts:16:3 › e3-canyon-works census support is explicit and deterministic `<br>`2) [mobile-chrome] › e2e/er01-e3-census.spec.ts:16:3 › e3-canyon-works census support is explicit and deterministic `<br>Attribution: Attribution: pre-attributed by a control of this slice's specs on main `5fffc1e68` with the store's main at `d76ee14` before the merge (`drain-s3-e2e-control-main.log`: rc=1, 2 failure lines) — every red on the merged tree below matches a line of that control by file, test line and project; nothing in this slice's diff touches those tests' subjects. |
| full `npm run test:node-guards` (before the pin) | `rc=1 ℹ tests 955 ℹ pass 947 ℹ fail 3 ℹ skipped 5  09:55Z` |
| battery reds | `✖ all 152 scripts/*.test.mjs fixture owners remove their temp directories (184530.439333ms)`<br>`✖ failing tests:`<br>`✖ rotation registry stays outside the engine identity corpus (584.342833ms)`<br>`✖ the landed registry names the live engine and stays outside its hash corpus (130.880917ms)` (the engine-era, bench-seeds and fixture-sweep rows are the pre-pin hash class, cured by the pin above) |

### Merge classification
Code: `src/world/*` (render side, incl. `Water.ts`), the render-only presentation owners, `src/entities/*` pure visuals (the Motor vehicle), `reviews/sol-map-art-current-status-20260909.md`, `artifacts/sol/map-art-campaign-2/report.md` (a dated run-9 section) and `run-9/**`. Store: `pilots/map-rebuild-spike/**` for these maps, one commit per map, landed on the store's main first. Firewall: within the master's Touch ONLY plus the store. Base: the chain's previous tip; MAIN-MOVED files are fire bookkeeping taken as theirs at the main merge before the fast-forward.

### Findings
- **F-F2-7 (for the owner's eye, no desk row):** the Canyon Works' panorama now weighs 16.5 MB of raw GLB where it weighed 0.8 MB, a 15.7 MB download on an E3 map that ships outside the E1 release; the owner's standing preference (2026-09-15, "animation quality over download") covers it and the first-town payload is untouched (+133 B), but it is the largest single asset the campaign has landed and the asset diet's ceilings should be read against it before E9's four maps land.
- **F-F2-8 (pre-existing, attributed by Astra on the exact preceding code/store/engine):** the Canyon Works' own and pack browser batch carries fourteen failures, all reproduced on the exact base: ten by exact assertion fingerprint, two slope tests with variable observed ratios, and two stale Crawler triangle-count bands that differ by exactly the authored +2,268 triangles (a test-truth row of the F-TTRC-1 class, fire-authorable); outside this slice's gate, where the map's own spec and the E3 census run on both projects.
- **F-F2-9 (information):** the store commit adds three corpus JSONs under `sources/` and two contracts; the early droplet-mirror check on the merged tree is the proof they ship (the lane itself predates the two mirror cures and says so).

## Slice 4 — LANDED `a47d8c5ad` (2026-09-23 10:58Z): the Dust Flats

**Lane up to** `47b47e43b` · **store main** `b1e2c12` (landed first, pushed) · **merge** `a47d8c5ad` · same-era pin #44 `7811cb66`

### What it does (the run-6 HELD clauses answered FIXED / IMPROVED with a number against run 6 / HELD with the owner named)
**The Dust Flats — IMPROVED / HELD (Astra's own verdict).** The two service landmarks read as what they are: the east-horizon fuel reserve becomes three connected tanks (2,380 → 2,224 of 3,000 triangles, its silhouette 24.65% less solid at unchanged bounds) and the north-railhead storm tower an open lattice lookout (628 → 826 of 3,000); the original bounds, atlas pixels, mount, collision and station declarations and the three sibling bodies are retained. The fixed-region ground RMS holds run 5's numbers to the sixth decimal (0.0165662 / 0.0206802 against 0.0165664 / 0.0206796, fresh A/B identical); emission 0.45; the declared post station's HUD coverage rises from 0% / 0.006% to 0.022% / 0.028% and is disclosed, the post's geometry and station unchanged. HELD: the missing outer-claim derrick mounts (art and contract coordination), the full entry and camera vista, the dark roof and cabin, stronger contact; the independent review prefers the bodies and withholds full fidelity. Frame p95 9.85 → 9.65 ms desktop and 9.65 → 9.60 ms phone over four runs per arm, draws 84 / 52 unchanged; no E1 art changes. Astra measured the engine hash at `7811cb66…` with the lane store at `b1e2c12`; the drain's own measurement on the merged tree is the pin below.
Where the player sees it: the plain entry of these maps, on production and the all-epochs preview.

### Evidence (this slice's gates on the merged tree, the scratch store clean at the landed store main)
| Check | Result |
| --- | --- |
| the store landing | `b1e2c12` on `Agent-Town/GoldRush-assets` main, pushed; the scratch store worktree detached at it, clean, before any hash was measured (F-A3-2) |
| merge | `clean, no conflicts` |
| single-line law (F-CORR1-4) | `nothing to flatten` |
| tsc / build / e1 | `0 / 0 / 0` (rc) · payload `34317083 bytes` |
| engine hash | `7811cb664727d4e4…`; same-era pin #44 `7811cb66`, era guards in the chain `ℹ pass 9 ℹ fail 0` |
| halo / null floors / law-pointer | `rc=0 halo re-extraction PASS: 315 cured, 0 held, 760 regenerated-and-cured, 2127 scanned; alpha and opaque RGB unchanged` · `rc=0 83 of 83 null floors match assets/contracts/null-floors.json (315.8s).` · `rc=0 law-pointer-guard — do the law surfaces still point at what they claim?` |
| named guards | `ℹ pass 98 ℹ fail 0` |
| e2e both projects, `--workers=1` (the maps' own specs, landmark brightness/collision, fort collision, task-025, m2-01) | `rc=1   4 failed   4 skipped   48 passed (4.1m)  10:49Z` |
| e2e reds | `1) [desktop-chrome] › e2e/e4-dust-flats.spec.ts:31:1 › fires the authored storm and peels a convoy off the ORBIT road `<br>`2) [desktop-chrome] › e2e/e4-dust-flats.spec.ts:97:1 › offers road grading and the hauler in a normal Motor-era run `<br>`3) [mobile-chrome] › e2e/e4-dust-flats.spec.ts:31:1 › fires the authored storm and peels a convoy off the ORBIT road `<br>`4) [mobile-chrome] › e2e/e4-dust-flats.spec.ts:97:1 › offers road grading and the hauler in a normal Motor-era run `<br>Attribution: Attribution: pre-attributed by a control of this slice's specs on main `452660f68` with the store's main at `b041416` before the merge (`drain-s4-e2e-control-main.log`: rc=1, 4 failure lines) — every red on the merged tree below matches a line of that control by file, test line and project; nothing in this slice's diff touches those tests' subjects. |
| full `npm run test:node-guards` (before the pin) | `rc=1 ℹ tests 955 ℹ pass 947 ℹ fail 3 ℹ skipped 5  10:58Z` |
| battery reds | `✖ all 152 scripts/*.test.mjs fixture owners remove their temp directories (233205.086833ms)`<br>`✖ failing tests:`<br>`✖ rotation registry stays outside the engine identity corpus (513.025792ms)`<br>`✖ the landed registry names the live engine and stays outside its hash corpus (260.49375ms)` (the engine-era, bench-seeds and fixture-sweep rows are the pre-pin hash class, cured by the pin above) |

### Merge classification
Code: `src/world/*` (render side, incl. `Water.ts`), the render-only presentation owners, `src/entities/*` pure visuals (the Motor vehicle), `reviews/sol-map-art-current-status-20260909.md`, `artifacts/sol/map-art-campaign-2/report.md` (a dated run-9 section) and `run-9/**`. Store: `pilots/map-rebuild-spike/**` for these maps, one commit per map, landed on the store's main first. Firewall: within the master's Touch ONLY plus the store. Base: the chain's previous tip; MAIN-MOVED files are fire bookkeeping taken as theirs at the main merge before the fast-forward.

### Findings
- **F-F2-11 (pre-existing, attributed by Astra on the exact base):** the Dust Flats' browser batch carries 20 base-red tests (16 exact fingerprints, two variable Claim-horizon samples, two opposite immediate E5 arsenal toggle phases), all distinguished by class in `run-9/e4-dust-flats/review.md`; outside this slice's gate, where the map's own spec and the E4 census run on both projects.
- **F-F2-12 (information):** the slice is store-only on the code side (one status-doc row; no source change), so the engine hash moves by the pack contract alone; the early droplet-mirror check on the merged tree proves the two corpus JSONs ship.

## Slice 5 — LANDED `8d3dd7b10` (2026-09-23 12:16Z): the Long Road

**Lane up to** `acdecff85` · **store main** `e33b812` (landed first, pushed) · **merge** `8d3dd7b10` · same-era pin #45 `8a51dec2`

### What it does (the run-6 HELD clauses answered FIXED / IMPROVED with a number against run 6 / HELD with the owner named)
**The Long Road — IMPROVED / HELD (Astra's own verdict).** The west way station's closed shed becomes an open service canopy with an elevated water tank, and the covered hull at the convoy start becomes an articulated static convoy; bounds, the original atlas, mounts, collision and stations are exact. The apron's boundary luminance difference falls from 0.0207 to 0.0021 (−89.8%) while the ground's fixed boxes are unchanged and the RMS moves from 0.0118 to 0.0123, reported separately as the new silhouettes; the phone stop's HUD coverage rises by 0.0015 percentage points. HELD: the entry's ownership and the UI limits. Frame p95 9.45 → 9.60 ms desktop and 9.90 → 9.90 ms phone, draws 61 / 51 unchanged; no E1 art. Astra measured the engine hash at `8a51dec2…` with the lane store at `e33b812`; the drain's own measurement on the merged tree is the pin below.
Where the player sees it: the plain entry of these maps, on production and the all-epochs preview.

### Evidence (this slice's gates on the merged tree, the scratch store clean at the landed store main)
| Check | Result |
| --- | --- |
| the store landing | `e33b812` on `Agent-Town/GoldRush-assets` main, pushed; the scratch store worktree detached at it, clean, before any hash was measured (F-A3-2) |
| merge | `clean, no conflicts` |
| single-line law (F-CORR1-4) | `nothing to flatten` |
| tsc / build / e1 | `0 / 0 / 0` (rc) · payload `34317219 bytes` |
| engine hash | `8a51dec200e748ad…`; same-era pin #45 `8a51dec2`, era guards in the chain `ℹ pass 9 ℹ fail 0` |
| halo / null floors / law-pointer | `rc=0 halo re-extraction PASS: 315 cured, 0 held, 760 regenerated-and-cured, 2127 scanned; alpha and opaque RGB unchanged` · `rc=0 83 of 83 null floors match assets/contracts/null-floors.json (334.7s).` · `rc=0 law-pointer-guard — do the law surfaces still point at what they claim?` |
| named guards | `ℹ pass 98 ℹ fail 0` |
| e2e both projects, `--workers=1` (the maps' own specs, landmark brightness/collision, fort collision, task-025, m2-01) | `rc=1   2 failed   4 skipped   52 passed (4.6m)  12:16Z` |
| e2e reds | `1) [desktop-chrome] › e2e/e4-roads-and-convoys.spec.ts:69:1 › every Motor reel replays to its claimed hash in Node and Chromium `<br>`2) [mobile-chrome] › e2e/e4-roads-and-convoys.spec.ts:69:1 › every Motor reel replays to its claimed hash in Node and Chromium `<br>Attribution: Attribution: pre-attributed by a control of this slice's specs on main `72a9da604` with the store's main at `b1e2c12` before the merge (`drain-s5-e2e-control-main.log`: rc=1, 5 failure lines) — every red on the merged tree below matches a line of that control by file, test line and project; nothing in this slice's diff touches those tests' subjects. |
| full `npm run test:node-guards` (before the pin) | `rc=1 ℹ tests 955 ℹ pass 947 ℹ fail 3 ℹ skipped 5  12:09Z` |
| battery reds | `✖ all 152 scripts/*.test.mjs fixture owners remove their temp directories (261532.4485ms)`<br>`✖ failing tests:`<br>`✖ rotation registry stays outside the engine identity corpus (702.45825ms)`<br>`✖ the landed registry names the live engine and stays outside its hash corpus (323.644625ms)` (the engine-era, bench-seeds and fixture-sweep rows are the pre-pin hash class, cured by the pin above) |

### Merge classification
Code: `src/world/*` (render side, incl. `Water.ts`), the render-only presentation owners, `src/entities/*` pure visuals (the Motor vehicle), `reviews/sol-map-art-current-status-20260909.md`, `artifacts/sol/map-art-campaign-2/report.md` (a dated run-9 section) and `run-9/**`. Store: `pilots/map-rebuild-spike/**` for these maps, one commit per map, landed on the store's main first. Firewall: within the master's Touch ONLY plus the store. Base: the chain's previous tip; MAIN-MOVED files are fire bookkeeping taken as theirs at the main merge before the fast-forward.

### Findings
- **F-F2-13 (pre-existing, attributed by Astra on the exact base):** the Long Road's browser batch carries ten base-red cases (eight exact fingerprints, two horizon-value variations), outside this slice's gate; the map's own spec and the E4 census run on both projects here.
- **F-F2-15 (drain infrastructure, cured in the prep):** the slice's first e2e run timed out on 46 of 58 tests across every spec: vite's dependency optimiser re-ran under the first tests and its "optimized dependencies changed. reloading" destroyed the page contexts (`Execution context was destroyed`, `Failed to fetch dynamically imported module …/Game.ts`), because the chain worktree's `node_modules` is a symlink to the primary checkout's and the shared `node_modules/.vite` cache had been rewritten by the battery on main running beside the gate. A curl of `/` loads no module, so it never warmed the optimiser. Cure: the store-slice prep now boots one cheap test twice with a pause before the gate, and the post-fast-forward battery on main is serialised under the drain lock rather than run beside a gate. This slice was re-gated on a warmed server; the numbers in the table are the re-gate's.

## Slice 6 — LANDED `6c5af175d` (2026-09-23 12:44Z): Gusher County

**Lane up to** `b981d2515` · **store main** `8ef0a03` (landed first, pushed) · **merge** `6c5af175d` · same-era pin #46 `e5acca19`

### What it does (the run-6 HELD clauses answered FIXED / IMPROVED with a number against run 6 / HELD with the owner named)
**Gusher County — IMPROVED / HELD (Astra's own verdict).** All eight lease derricks gain a coherent lattice, locally connected pipe dressing, gauges, bolted collars and exposed flywheels, at 2,108 to 2,252 of 3,000 triangles each, with their envelopes, mounts and atlas pixels exact; the camp and outhouse, the actors' visibility, the zero-red-paint rule and the ground are unchanged, and the small increases in the declared HUD masks are reported in full. HELD: the full field network, weathering, and the entry and UI. Frame p95 at entry 9.75 → 9.70 ms desktop and 9.70 → 9.80 ms phone, at the lease station 9.05 → 8.95 and 8.90 → 8.90, draws unchanged; no E1 art. Astra measured the engine hash at `e5acca19…` with the lane store at `8ef0a03`; the drain's own measurement on the merged tree is the pin below.
Where the player sees it: the plain entry of these maps, on production and the all-epochs preview.

### Evidence (this slice's gates on the merged tree, the scratch store clean at the landed store main)
| Check | Result |
| --- | --- |
| the store landing | `8ef0a03` on `Agent-Town/GoldRush-assets` main, pushed; the scratch store worktree detached at it, clean, before any hash was measured (F-A3-2) |
| merge | `clean, no conflicts` |
| single-line law (F-CORR1-4) | `nothing to flatten` |
| tsc / build / e1 | `0 / 0 / 0` (rc) · payload `34317219 bytes` |
| engine hash | `e5acca191da821a5…`; same-era pin #46 `e5acca19`, era guards in the chain `ℹ pass 9 ℹ fail 0` |
| halo / null floors / law-pointer | `rc=0 halo re-extraction PASS: 315 cured, 0 held, 760 regenerated-and-cured, 2127 scanned; alpha and opaque RGB unchanged` · `rc=0 83 of 83 null floors match assets/contracts/null-floors.json (305.2s).` · `rc=0 law-pointer-guard — do the law surfaces still point at what they claim?` |
| named guards | `ℹ pass 98 ℹ fail 0` |
| e2e both projects, `--workers=1` (the maps' own specs, landmark brightness/collision, fort collision, task-025, m2-01) | `rc=1   2 failed   4 skipped   52 passed (4.4m)  12:36Z` |
| e2e reds | `1) [desktop-chrome] › e2e/e4-roads-and-convoys.spec.ts:69:1 › every Motor reel replays to its claimed hash in Node and Chromium `<br>`2) [mobile-chrome] › e2e/e4-roads-and-convoys.spec.ts:69:1 › every Motor reel replays to its claimed hash in Node and Chromium `<br>Attribution: Attribution: pre-attributed by a control of this slice's specs on main `094ad5e1d` with the store's main at `e33b812` before the merge (`drain-s6-e2e-control-main.log`: rc=1, 3 failure lines) — every red on the merged tree below matches a line of that control by file, test line and project; nothing in this slice's diff touches those tests' subjects. |
| full `npm run test:node-guards` (before the pin) | `rc=1 ℹ tests 955 ℹ pass 947 ℹ fail 3 ℹ skipped 5  12:44Z` |
| battery reds | `✖ all 152 scripts/*.test.mjs fixture owners remove their temp directories (181253.107708ms)`<br>`✖ failing tests:`<br>`✖ rotation registry stays outside the engine identity corpus (537.994542ms)`<br>`✖ the landed registry names the live engine and stays outside its hash corpus (241.0435ms)` (the engine-era, bench-seeds and fixture-sweep rows are the pre-pin hash class, cured by the pin above) |

### Merge classification
Code: `src/world/*` (render side, incl. `Water.ts`), the render-only presentation owners, `src/entities/*` pure visuals (the Motor vehicle), `reviews/sol-map-art-current-status-20260909.md`, `artifacts/sol/map-art-campaign-2/report.md` (a dated run-9 section) and `run-9/**`. Store: `pilots/map-rebuild-spike/**` for these maps, one commit per map, landed on the store's main first. Firewall: within the master's Touch ONLY plus the store. Base: the chain's previous tip; MAIN-MOVED files are fire bookkeeping taken as theirs at the main merge before the fast-forward.

### Findings
- **F-F2-14 (pre-existing, attributed by Astra on the exact base):** Gusher County's browser batch carries six base-red cases (four exact fingerprints, two horizon-value variations), outside this slice's gate; the shared Motor spec and the E4 census run on both projects here.

## Slice 7 — LANDED `e99defc97` (2026-09-23 13:44Z): the Boneyard

**Lane up to** `23cd4988e` · **store main** `e62dbf9` (landed first, pushed) · **merge** `e99defc97` · same-era pin #47 `49242d17`

### What it does (the run-6 HELD clauses answered FIXED / IMPROVED with a number against run 6 / HELD with the owner named)
**The Boneyard — IMPROVED / HELD (Astra's own verdict).** The half-buried sleeper gains clearer pressure-engine detail and a partial wheel burial (1,842 → 2,926 of 3,000 triangles) and the two small flivver-row wrecks become distinct salvage silhouettes (512 → 1,370 and 512 → 1,250); a matte, non-emissive earth material replaces two rejected atlas-coloured mound treatments. The same-box ground RMS falls 25.12% desktop and 17.96% phone against run 6; bounds, collision, mounts and stations are unchanged, the nine sibling GLBs and the atlas pixels exact. Every small HUD increase is reported against its own earlier figure, and the historical phone reduction at the sleeper is not credited to this pass. HELD: full ground and metal fidelity, smooth terrain contact, the small wrecks' readability, and the entry and UI. Frame p95 at entry 9.70 → 9.70 ms desktop and 9.85 → 9.90 ms phone, at the sleeper view 10.05 → 9.90 and 9.80 → 10.00, draws within one; four boots, 24 stations and 32 timing runs with zero console or page errors; the runtime GLBs grow by 159,892 B; no E1 art. Astra measured the engine hash at `49242d17…` with the lane store at `e62dbf9`; the drain's own measurement on the merged tree is the pin below.

**Leg verdict (E4).** All four Motor maps carried art-owned clauses and each is answered with numbers against its own earlier run: the Dust Flats' service landmarks (tanks and a lattice tower), the Long Road's open service stop and articulated convoy, Gusher County's eight braced derricks, the Boneyard's buried salvage. Each landed as its own slice with its own control, pin and deploy; the remaining list is empty and the run ended without a quota refusal. The next leg (E6: the Glow Mesa, Half-Life Hollow, the Picnic) is queued by this drain on the owner's word.
Where the player sees it: the plain entry of these maps, on production and the all-epochs preview.

### Evidence (this slice's gates on the merged tree, the scratch store clean at the landed store main)
| Check | Result |
| --- | --- |
| the store landing | `e62dbf9` on `Agent-Town/GoldRush-assets` main, pushed; the scratch store worktree detached at it, clean, before any hash was measured (F-A3-2) |
| merge | `clean, no conflicts` |
| single-line law (F-CORR1-4) | `nothing to flatten` |
| tsc / build / e1 | `0 / 0 / 0` (rc) · payload `34317374 bytes` |
| engine hash | `49242d1713cb1c67…`; same-era pin #47 `49242d17`, era guards in the chain `ℹ pass 9 ℹ fail 0` |
| halo / null floors / law-pointer | `rc=0 halo re-extraction PASS: 315 cured, 0 held, 760 regenerated-and-cured, 2127 scanned; alpha and opaque RGB unchanged` · `rc=0 83 of 83 null floors match assets/contracts/null-floors.json (299.2s).` · `rc=0 law-pointer-guard — do the law surfaces still point at what they claim?` |
| named guards | `ℹ pass 98 ℹ fail 0` |
| e2e both projects, `--workers=1` (the maps' own specs, landmark brightness/collision, fort collision, task-025, m2-01) | `rc=1   2 failed   4 skipped   52 passed (4.4m)  13:36Z` |
| e2e reds | `1) [desktop-chrome] › e2e/e4-roads-and-convoys.spec.ts:69:1 › every Motor reel replays to its claimed hash in Node and Chromium `<br>`2) [mobile-chrome] › e2e/e4-roads-and-convoys.spec.ts:69:1 › every Motor reel replays to its claimed hash in Node and Chromium `<br>Attribution: Attribution: pre-attributed by a control of this slice's specs on main `ad20d8889` with the store's main at `8ef0a03` before the merge (`drain-s7-e2e-control-main.log`: rc=1, 2 failure lines) — every red on the merged tree below matches a line of that control by file, test line and project; nothing in this slice's diff touches those tests' subjects. |
| full `npm run test:node-guards` (before the pin) | `rc=1 ℹ tests 955 ℹ pass 947 ℹ fail 3 ℹ skipped 5  13:44Z` |
| battery reds | `✖ all 152 scripts/*.test.mjs fixture owners remove their temp directories (190371.051125ms)`<br>`✖ failing tests:`<br>`✖ rotation registry stays outside the engine identity corpus (518.8995ms)`<br>`✖ the landed registry names the live engine and stays outside its hash corpus (175.130334ms)` (the engine-era, bench-seeds and fixture-sweep rows are the pre-pin hash class, cured by the pin above) |

### Merge classification
Code: `src/world/*` (render side, incl. `Water.ts`), the render-only presentation owners, `src/entities/*` pure visuals (the Motor vehicle), `reviews/sol-map-art-current-status-20260909.md`, `artifacts/sol/map-art-campaign-2/report.md` (a dated run-9 section) and `run-9/**`. Store: `pilots/map-rebuild-spike/**` for these maps, one commit per map, landed on the store's main first. Firewall: within the master's Touch ONLY plus the store. Base: the chain's previous tip; MAIN-MOVED files are fire bookkeeping taken as theirs at the main merge before the fast-forward.

### Findings
- **F-F2-16 (pre-existing, attributed by Astra on the exact base):** the Boneyard's browser batch carries six base-red cases (four exact fingerprints, two variable Claim-horizon values), outside this slice's gate; the shared Motor spec and the E4 census run on both projects here.
- **F-F2-17 (information, the leg's payload):** across the E4 leg the runtime GLBs grew by about 0.5 MB in total (the Boneyard +159,892 B, the derricks about +300 KB, the Dust Flats and the Long Road net smaller); no E1 asset moved, and nothing approaches the Canyon Works' panorama (F-F2-7).

## Slice 8 — LANDED `75f94354d` (2026-09-23 14:50Z): Half-Life Hollow

**Lane up to** `d3e303842` · **store main** `92db3dc` (landed first, pushed) · **merge** `75f94354d` · same-era pin #48 `08353062`

### What it does (the run-6 HELD clauses answered FIXED / IMPROVED with a number against run 6 / HELD with the owner named)
**Half-Life Hollow — IMPROVED / HELD (Astra's own verdict); the Glow Mesa skipped by the master's rule.** The south countdown gate becomes an architectural clock arch at 1,956 of 3,000 triangles (from 508) with its envelope and passage exact, the original atlas and the four sibling bodies preserved; at its own run-6 station the luminance rises 0.252 → 0.297 desktop and 0.253 → 0.292 phone; the desktop HUD coverage rises 0.005% → 0.027% (reported) and the phone's falls 0.166% → 0.065%. HELD: full material, contact and lighting, and the existing camera, layout and UI holds. Frame p95 at entry 9.25 → 9.30 ms desktop and 9.55 → 9.65 ms phone, at the gate view 8.65 → 9.20 and 9.60 → 9.45, draws unchanged, zero capture errors; the runtime GLB grows by 92,996 B; no E1 art. The Glow Mesa's latest run-6 review holds no art-owned clause and no independent critique, so it is skipped without promoting its verdict (its contract, layout, camera, Atomic and UI holds stand). Astra measured the engine hash at `08353062…` with the lane store at `92db3dc`; the drain's own measurement on the merged tree is the pin below.
Where the player sees it: the plain entry of these maps, on production and the all-epochs preview.

### Evidence (this slice's gates on the merged tree, the scratch store clean at the landed store main)
| Check | Result |
| --- | --- |
| the store landing | `92db3dc` on `Agent-Town/GoldRush-assets` main, pushed; the scratch store worktree detached at it, clean, before any hash was measured (F-A3-2) |
| merge | `clean, no conflicts` |
| single-line law (F-CORR1-4) | `nothing to flatten` |
| tsc / build / e1 | `0 / 0 / 0` (rc) · payload `34317374 bytes` |
| engine hash | `083530624944acf7…`; same-era pin #48 `08353062`, era guards in the chain `ℹ pass 9 ℹ fail 0` |
| halo / null floors / law-pointer | `rc=0 halo re-extraction PASS: 315 cured, 0 held, 760 regenerated-and-cured, 2127 scanned; alpha and opaque RGB unchanged` · `rc=0 83 of 83 null floors match assets/contracts/null-floors.json (311.7s).` · `rc=0 law-pointer-guard — do the law surfaces still point at what they claim?` |
| named guards | `ℹ pass 98 ℹ fail 0` |
| e2e both projects, `--workers=1` (the maps' own specs, landmark brightness/collision, fort collision, task-025, m2-01) | `rc=0   4 skipped   68 passed (6.7m)  14:42Z` |
| e2e reds | none<br>Attribution: Attribution: pre-attributed by a control of this slice's specs on main `72bccc68b` with the store's main at `e62dbf9` before the merge (`drain-s8-e2e-control-main.log`: rc=0, 0 failure lines) — every red on the merged tree below matches a line of that control by file, test line and project; nothing in this slice's diff touches those tests' subjects. |
| full `npm run test:node-guards` (before the pin) | `rc=1 ℹ tests 955 ℹ pass 947 ℹ fail 3 ℹ skipped 5  14:50Z` |
| battery reds | `✖ all 152 scripts/*.test.mjs fixture owners remove their temp directories (202754.739708ms)`<br>`✖ failing tests:`<br>`✖ rotation registry stays outside the engine identity corpus (594.876875ms)`<br>`✖ the landed registry names the live engine and stays outside its hash corpus (184.596041ms)` (the engine-era, bench-seeds and fixture-sweep rows are the pre-pin hash class, cured by the pin above) |

### Merge classification
Code: `src/world/*` (render side, incl. `Water.ts`), the render-only presentation owners, `src/entities/*` pure visuals (the Motor vehicle), `reviews/sol-map-art-current-status-20260909.md`, `artifacts/sol/map-art-campaign-2/report.md` (a dated run-9 section) and `run-9/**`. Store: `pilots/map-rebuild-spike/**` for these maps, one commit per map, landed on the store's main first. Firewall: within the master's Touch ONLY plus the store. Base: the chain's previous tip; MAIN-MOVED files are fire bookkeeping taken as theirs at the main merge before the fast-forward.

### Findings
- **F-F2-19 (the master's rule applied, information):** the Glow Mesa is skipped (no art-owned clause in its latest review, no independent critique); the E6 leg is Half-Life Hollow and the Picnic.
- **F-F2-20 (pre-existing, attributed by Astra on the exact base):** Half-Life Hollow's browser batch carries four base-red cases (three exact fingerprints, one variable desktop horizon value; the first attribution receipt that wrongly included the new source-input JSON is kept beside the corrected one), outside this slice's gate.

## Slice 9 — LANDED `bd266495f` (2026-09-23 16:01Z): the Picnic

**Lane up to** `8f87f6042` · **store main** `9e33801` (landed first, pushed) · **merge** `bd266495f` · same-era pin #49 `e7c87a88`

### What it does (the run-6 HELD clauses answered FIXED / IMPROVED with a number against run 6 / HELD with the owner named)
**The Picnic — the painted cross marks FIXED, the props IMPROVED / HELD (Astra's own verdict).** The clause quoted from its own review ("the existing large cross-shaped ground shadow and primitive prop forms remain visible") is answered on both halves: a native ground pigment replaces the painted cross marks, and the west picnic blanket carries authored cloth props (cups, dishes, baskets, food, sagging canvas) on a native cloth-and-wicker atlas with the bench and the atom retained; every body stays at or under 3,000 triangles with bounds, mounts, collision and station authority exact. Against its own run 6 the ground RMS falls 43.96% desktop and 29.56% phone and the centre median rises 0.164 → 0.586 desktop and 0.168 → 0.583 phone at emission 0.45; the small desktop HUD rises and the inherited entry and UI holds are explicit, and the full ground, material and contact fidelity stays HELD. Frame p95 at entry 10.10 → 10.20 ms desktop and 10.00 → 10.05 ms phone, at the grouping 9.70 → 10.05 and 9.75 → 9.95, all within the bar; the raw runtime grows by 11.8 MB (the blanket's GLB 1.5 → 3.7 MB and two native textures of about 3 MB each under `sources/`), no E1 art. Astra measured the engine hash at `e7c87a88…` with the lane store at `9e33801`; the drain's own measurement on the merged tree is the pin below.

**Leg verdict (E6).** Two maps carried an art-owned clause and both are answered with numbers against their own run 6: Half-Life Hollow's countdown gate and the Picnic's props and ground; the Glow Mesa held no art-owned clause and was skipped without promoting its verdict. The remaining list is empty and the run ended without a quota refusal; the next leg (E7: the Dead Band, Relay Rush) is queued by this drain on the owner's word.
Where the player sees it: the plain entry of these maps, on production and the all-epochs preview.

### Evidence (this slice's gates on the merged tree, the scratch store clean at the landed store main)
| Check | Result |
| --- | --- |
| the store landing | `9e33801` on `Agent-Town/GoldRush-assets` main, pushed; the scratch store worktree detached at it, clean, before any hash was measured (F-A3-2) |
| merge | `clean, no conflicts` |
| single-line law (F-CORR1-4) | `nothing to flatten` |
| tsc / build / e1 | `0 / 0 / 0` (rc) · payload `34318148 bytes` |
| engine hash | `e7c87a88d08517d8…`; same-era pin #49 `e7c87a88`, era guards in the chain `ℹ pass 9 ℹ fail 0` |
| halo / null floors / law-pointer | `rc=0 halo re-extraction PASS: 315 cured, 0 held, 760 regenerated-and-cured, 2127 scanned; alpha and opaque RGB unchanged` · `rc=0 83 of 83 null floors match assets/contracts/null-floors.json (296.4s).` · `rc=0 law-pointer-guard — do the law surfaces still point at what they claim?` |
| named guards | `ℹ pass 98 ℹ fail 0` |
| e2e both projects, `--workers=1` (the maps' own specs, landmark brightness/collision, fort collision, task-025, m2-01) | `rc=0   4 skipped   74 passed (13.4m)  15:53Z` |
| e2e reds | none<br>Attribution: Attribution: pre-attributed by a control of this slice's specs on main `dc74cd4cf` with the store's main at `92db3dc` before the merge (`drain-s9-e2e-control-main.log`: rc=0, 0 failure lines) — every red on the merged tree below matches a line of that control by file, test line and project; nothing in this slice's diff touches those tests' subjects. |
| full `npm run test:node-guards` (before the pin) | `rc=1 ℹ tests 955 ℹ pass 947 ℹ fail 3 ℹ skipped 5  16:00Z` |
| battery reds | `✖ all 152 scripts/*.test.mjs fixture owners remove their temp directories (182213.880459ms)`<br>`✖ failing tests:`<br>`✖ rotation registry stays outside the engine identity corpus (584.113666ms)`<br>`✖ the landed registry names the live engine and stays outside its hash corpus (117.543708ms)` (the engine-era, bench-seeds and fixture-sweep rows are the pre-pin hash class, cured by the pin above) |

### Merge classification
Code: `src/world/*` (render side, incl. `Water.ts`), the render-only presentation owners, `src/entities/*` pure visuals (the Motor vehicle), `reviews/sol-map-art-current-status-20260909.md`, `artifacts/sol/map-art-campaign-2/report.md` (a dated run-9 section) and `run-9/**`. Store: `pilots/map-rebuild-spike/**` for these maps, one commit per map, landed on the store's main first. Firewall: within the master's Touch ONLY plus the store. Base: the chain's previous tip; MAIN-MOVED files are fire bookkeeping taken as theirs at the main merge before the fast-forward.

### Findings
- **F-F2-21 (for the owner's eye, with F-F2-7):** the Picnic adds 11.8 MB of raw runtime (a 3.7 MB blanket GLB and two native textures of about 3 MB each), the campaign's second-largest landing after the Canyon Works' panorama; both sit outside the E1 release and under the owner's 2026-09-15 preference, and the asset-diet ceilings are read against the sum before E9 lands.
- **F-F2-22 (pre-existing, attributed by Astra on the exact base):** the Picnic's browser batch carries four base-red cases (two exact fingerprints), outside this slice's gate.
- **F-F2-23 (information):** the two runtime-referenced textures live under `sources/e6-picnic-fidelity-2/`, the place the F-FID1-8 include ships images from; the early droplet-mirror check on the merged tree is the proof.

## Slice 10 — LANDED `114eb2b98` (2026-09-23 17:26Z): the Dead Band

**Lane up to** `b208f876c` · **store main** `892b7f6` (landed first, pushed) · **merge** `114eb2b98` · same-era pin #50 `6655ba75`

### What it does (the run-6 HELD clauses answered FIXED / IMPROVED with a number against run 6 / HELD with the owner named)
**The Dead Band — IMPROVED / HELD (Astra's own verdict); Relay Rush skipped by the master's rule.** The clause quoted from its own review ("these simple braced frames do not yet equal the plate's layered antenna architecture") is answered with layered pylons, socket feet, collars and truss headers on both silent frames: the iron-shadow warning frame 156 → 1,464 and the north silence gate 180 → 1,548 of 3,000 triangles, bounds exact. At the unchanged 3 m stations the run-6 luminance rises 0.104 → 0.189 desktop and 0.110 → 0.192 phone at the warning frame and 0.137 → 0.167 / 0.130 → 0.167 at the north gate, emission 0.45; both bodies stay under their run-6 station HUD figures, and every ground metric and source bound is exact. HELD: the full architecture, material and weathering, the buried north footing, the yard composition and the existing entry and UI. Frame p95 at entry 8.90 → 8.90 ms desktop and 9.80 → 9.45 ms phone, at the north gate 9.00 → 9.65 and 9.30 → 9.45, draws unchanged, zero errors across 56 captures; the raw GLBs grow by 183,916 B; no E1 art. Relay Rush holds no art-owned clause and no independent critique in the required runs and is skipped without promoting its verdict. Astra measured the engine hash at `6655ba75…` with the lane store at `892b7f6`; the drain's own measurement on the merged tree is the pin below.

**Leg verdict (E7).** One map carried an art-owned clause and it is answered with numbers against its own run 6; Relay Rush is skipped by the rule; the remaining list is empty and the run ended without a quota refusal. The next leg (E8: the Far Side, Low Orbit) is queued by this drain on the owner's word.
Where the player sees it: the plain entry of these maps, on production and the all-epochs preview.

### Evidence (this slice's gates on the merged tree, the scratch store clean at the landed store main)
| Check | Result |
| --- | --- |
| the store landing | `892b7f6` on `Agent-Town/GoldRush-assets` main, pushed; the scratch store worktree detached at it, clean, before any hash was measured (F-A3-2) |
| merge | `clean, no conflicts` |
| single-line law (F-CORR1-4) | `nothing to flatten` |
| tsc / build / e1 | `0 / 0 / 0` (rc) · payload `34318148 bytes` |
| engine hash | `6655ba7569775a52…`; same-era pin #50 `6655ba75`, era guards in the chain `ℹ pass 9 ℹ fail 0` |
| halo / null floors / law-pointer | `rc=0 halo re-extraction PASS: 315 cured, 0 held, 760 regenerated-and-cured, 2127 scanned; alpha and opaque RGB unchanged` · `rc=0 83 of 83 null floors match assets/contracts/null-floors.json (297.2s).` · `rc=0 law-pointer-guard — do the law surfaces still point at what they claim?` |
| named guards | `ℹ pass 98 ℹ fail 0` |
| e2e both projects, `--workers=1` (the maps' own specs, landmark brightness/collision, fort collision, task-025, m2-01) | `rc=0   4 skipped   60 passed (6.0m)  17:19Z` |
| e2e reds | none<br>Attribution: Attribution: pre-attributed by a control of this slice's specs on main `1e816ed6a` with the store's main at `9e33801` before the merge (`drain-s10-e2e-control-main.log`: rc=0, 0 failure lines) — every red on the merged tree below matches a line of that control by file, test line and project; nothing in this slice's diff touches those tests' subjects. |
| full `npm run test:node-guards` (before the pin) | `rc=1 ℹ tests 955 ℹ pass 947 ℹ fail 3 ℹ skipped 5  17:26Z` |
| battery reds | `✖ all 152 scripts/*.test.mjs fixture owners remove their temp directories (184714.791125ms)`<br>`✖ failing tests:`<br>`✖ rotation registry stays outside the engine identity corpus (798.816041ms)`<br>`✖ the landed registry names the live engine and stays outside its hash corpus (173.206667ms)` (the engine-era, bench-seeds and fixture-sweep rows are the pre-pin hash class, cured by the pin above) |

### Merge classification
Code: `src/world/*` (render side, incl. `Water.ts`), the render-only presentation owners, `src/entities/*` pure visuals (the Motor vehicle), `reviews/sol-map-art-current-status-20260909.md`, `artifacts/sol/map-art-campaign-2/report.md` (a dated run-9 section) and `run-9/**`. Store: `pilots/map-rebuild-spike/**` for these maps, one commit per map, landed on the store's main first. Firewall: within the master's Touch ONLY plus the store. Base: the chain's previous tip; MAIN-MOVED files are fire bookkeeping taken as theirs at the main merge before the fast-forward.

### Findings
- **F-F2-24 (the master's rule applied, information):** Relay Rush is skipped (no art-owned clause, no critique; `run-9/e7-scope-selection.json`); the E7 leg is the Dead Band alone.
- **F-F2-25 (pre-existing, attributed by Astra on the exact base):** the Dead Band's browser batch carries eleven base-red cases (nine exact fingerprints, two variable horizon values) and one mobile Charter Press case that passed 2 / 2 on the base and on the restored candidate, outside this slice's gate.

## Slice 11 — LANDED `a383a8d3d` (2026-09-23 18:33Z): the Far Side

**Lane up to** `aef5f1297` · **store main** `70b78b4` (landed first, pushed) · **merge** `a383a8d3d` · same-era pin #51 `b4eff9b0`

### What it does (the run-6 HELD clauses answered FIXED / IMPROVED with a number against run 6 / HELD with the owner named)
**The Far Side — IMPROVED / HELD (Astra's own verdict).** The landing frame's pressure vessel grows from 600 to 2,966 of 3,000 triangles on a native metal atlas, with the exact source bounds and the gameplay authority unchanged (the probe recovery cradle and the west comms shadow marker take the new atlas too); at its own run-6 station the luminance rises 0.296 → 0.348 desktop and 0.297 → 0.348 phone at emission 0.45, and the ground and stripe corrections of the earlier runs are retained. The declared desktop HUD rises by 0.024 percentage points and is reported; the phone's fall from 5.77% to 0.012% includes the wave's HUD cure and is not claimed for art. HELD: the full surface, mechanism and contact, and the compound, layout and UI. Frame p95 9.35 → 9.35 ms desktop and 9.35 → 9.70 ms phone, draws 63 / 50 unchanged, zero capture errors; the raw runtime grows by 3,330,124 B; no E1 art. Astra measured the engine hash at `b4eff9b0…` with the lane store at `70b78b4`; the drain's own measurement on the merged tree is the pin below.
Where the player sees it: the plain entry of these maps, on production and the all-epochs preview.

### Evidence (this slice's gates on the merged tree, the scratch store clean at the landed store main)
| Check | Result |
| --- | --- |
| the store landing | `70b78b4` on `Agent-Town/GoldRush-assets` main, pushed; the scratch store worktree detached at it, clean, before any hash was measured (F-A3-2) |
| merge | `clean, no conflicts` |
| single-line law (F-CORR1-4) | `nothing to flatten` |
| tsc / build / e1 | `0 / 0 / 0` (rc) · payload `34318148 bytes` |
| engine hash | `b4eff9b0b2c8df3d…`; same-era pin #51 `b4eff9b0`, era guards in the chain `ℹ pass 9 ℹ fail 0` |
| halo / null floors / law-pointer | `rc=0 halo re-extraction PASS: 315 cured, 0 held, 760 regenerated-and-cured, 2127 scanned; alpha and opaque RGB unchanged` · `rc=0 83 of 83 null floors match assets/contracts/null-floors.json (314.7s).` · `rc=0 law-pointer-guard — do the law surfaces still point at what they claim?` |
| named guards | `ℹ pass 98 ℹ fail 0` |
| e2e both projects, `--workers=1` (the maps' own specs, landmark brightness/collision, fort collision, task-025, m2-01) | `rc=1   2 failed   4 skipped   70 passed (9.0m)  18:26Z` |
| e2e reds | `1) [desktop-chrome] › e2e/er01-e8-census.spec.ts:75:3 › e8-mare-claim census pins the Orbital contract's door state `<br>`2) [mobile-chrome] › e2e/er01-e8-census.spec.ts:75:3 › e8-mare-claim census pins the Orbital contract's door state `<br>Attribution: Attribution: pre-attributed by a control of this slice's specs on main `0a4e4ca66` with the store's main at `892b7f6` before the merge (`drain-s11-e2e-control-main.log`: rc=1, 2 failure lines) — every red on the merged tree below matches a line of that control by file, test line and project; nothing in this slice's diff touches those tests' subjects. |
| full `npm run test:node-guards` (before the pin) | `rc=1 ℹ tests 955 ℹ pass 947 ℹ fail 3 ℹ skipped 5  18:33Z` |
| battery reds | `✖ all 152 scripts/*.test.mjs fixture owners remove their temp directories (169296.624084ms)`<br>`✖ failing tests:`<br>`✖ rotation registry stays outside the engine identity corpus (598.3245ms)`<br>`✖ the landed registry names the live engine and stays outside its hash corpus (116.311208ms)` (the engine-era, bench-seeds and fixture-sweep rows are the pre-pin hash class, cured by the pin above) |

### Merge classification
Code: `src/world/*` (render side, incl. `Water.ts`), the render-only presentation owners, `src/entities/*` pure visuals (the Motor vehicle), `reviews/sol-map-art-current-status-20260909.md`, `artifacts/sol/map-art-campaign-2/report.md` (a dated run-9 section) and `run-9/**`. Store: `pilots/map-rebuild-spike/**` for these maps, one commit per map, landed on the store's main first. Firewall: within the master's Touch ONLY plus the store. Base: the chain's previous tip; MAIN-MOVED files are fire bookkeeping taken as theirs at the main merge before the fast-forward.

### Findings
- **F-F2-26 (pre-existing, attributed by Astra on the exact base):** the Far Side's broad browser batch carries two exact-base failures; the affected set re-ran 22 pass / 4 skipped and the rider parity 6 / 6; outside this slice's gate.
- **F-F2-27 (information):** the pack's landmark atlas is now a corpus file under `landmarks/` (shipped by the existing include) and the native metal swatches live under `sources/` (shipped by F-FID1-8's include); the early droplet-mirror check on the merged tree is the proof.

## Slice 12 — LANDED `0f78c83a2` (2026-09-23 19:10Z): Low Orbit

**Lane up to** `47ddbdd43` · **store main** `4a2976f` (landed first, pushed) · **merge** `0f78c83a2` · same-era pin #52 `984a9f24`

### What it does (the run-6 HELD clauses answered FIXED / IMPROVED with a number against run 6 / HELD with the owner named)
**Low Orbit — IMPROVED / HELD (Astra's own verdict).** The salvage rig reads as one joined machine: an integrated recovery housing with an attached rim, pointed pressure towers, visible jaws, teal controls and native metal surfaces, at 2,964 of 3,000 triangles (from 2,972) with the exact full-body bounds and collision unchanged; the eight-sided visual base keeps its 29.29% corner-area reduction and is 1.5% smaller in plan area. At its own run-6 station the median rises 0.319 → 0.404 on both viewports and the dark-body share falls from 7.7% to 0%, emission 0.45; the station HUD coverage falls to 0% desktop and 0.020% phone, under the earlier ceilings. The ground values are exact with no improvement claimed. HELD: the fine material, contact and claw identity, the smooth ground, the full orbital composition and the phone UI. Frame p95 9.55 → 9.55 ms desktop and 9.80 → 9.60 ms phone, draws 77 / 55 unchanged, zero capture errors; the runtime GLBs grow by 3,195,408 B; no E1 art. Astra measured the engine hash at `984a9f24…` with the lane store at `4a2976f`; the drain's own measurement on the merged tree is the pin below.

**Leg verdict (E8).** Both maps carried art-owned clauses and both are answered with numbers against their own run 6: the Far Side's pressure vessel and Low Orbit's salvage rig, each on a native metal atlas. The remaining list is empty and the run ended without a quota refusal; the last leg (E9: the Dome Basin, the Seed Run, Devil's Alley, the Old Canal) is queued by this drain on the owner's word.
Where the player sees it: the plain entry of these maps, on production and the all-epochs preview.

### Evidence (this slice's gates on the merged tree, the scratch store clean at the landed store main)
| Check | Result |
| --- | --- |
| the store landing | `4a2976f` on `Agent-Town/GoldRush-assets` main, pushed; the scratch store worktree detached at it, clean, before any hash was measured (F-A3-2) |
| merge | `clean, no conflicts` |
| single-line law (F-CORR1-4) | `nothing to flatten` |
| tsc / build / e1 | `0 / 0 / 0` (rc) · payload `34318148 bytes` |
| engine hash | `984a9f2498c3445a…`; same-era pin #52 `984a9f24`, era guards in the chain `ℹ pass 9 ℹ fail 0` |
| halo / null floors / law-pointer | `rc=0 halo re-extraction PASS: 315 cured, 0 held, 760 regenerated-and-cured, 2127 scanned; alpha and opaque RGB unchanged` · `rc=0 83 of 83 null floors match assets/contracts/null-floors.json (297.5s).` · `rc=0 law-pointer-guard — do the law surfaces still point at what they claim?` |
| named guards | `ℹ pass 98 ℹ fail 0` |
| e2e both projects, `--workers=1` (the maps' own specs, landmark brightness/collision, fort collision, task-025, m2-01) | `rc=1   2 failed   4 skipped   74 passed (9.2m)  19:03Z` |
| e2e reds | `1) [desktop-chrome] › e2e/er01-e8-census.spec.ts:75:3 › e8-mare-claim census pins the Orbital contract's door state `<br>`2) [mobile-chrome] › e2e/er01-e8-census.spec.ts:75:3 › e8-mare-claim census pins the Orbital contract's door state `<br>Attribution: Attribution: pre-attributed by a control of this slice's specs on main `24d021da2` with the store's main at `70b78b4` before the merge (`drain-s12-e2e-control-main.log`: rc=1, 2 failure lines) — every red on the merged tree below matches a line of that control by file, test line and project; nothing in this slice's diff touches those tests' subjects. |
| full `npm run test:node-guards` (before the pin) | `rc=1 ℹ tests 955 ℹ pass 947 ℹ fail 3 ℹ skipped 5  19:10Z` |
| battery reds | `✖ all 152 scripts/*.test.mjs fixture owners remove their temp directories (178545.995459ms)`<br>`✖ failing tests:`<br>`✖ rotation registry stays outside the engine identity corpus (617.018667ms)`<br>`✖ the landed registry names the live engine and stays outside its hash corpus (212.726541ms)` (the engine-era, bench-seeds and fixture-sweep rows are the pre-pin hash class, cured by the pin above) |

### Merge classification
Code: `src/world/*` (render side, incl. `Water.ts`), the render-only presentation owners, `src/entities/*` pure visuals (the Motor vehicle), `reviews/sol-map-art-current-status-20260909.md`, `artifacts/sol/map-art-campaign-2/report.md` (a dated run-9 section) and `run-9/**`. Store: `pilots/map-rebuild-spike/**` for these maps, one commit per map, landed on the store's main first. Firewall: within the master's Touch ONLY plus the store. Base: the chain's previous tip; MAIN-MOVED files are fire bookkeeping taken as theirs at the main merge before the fast-forward.

### Findings
- **F-F2-28 (pre-existing, attributed by Astra on the exact base):** Low Orbit's browser batch carries two failures reproduced by exact fingerprint on the engine-verified base; outside this slice's gate, where the map's own spec, the E8 census, the E8 beats and the remaining-maps parity run on both projects.
- **F-F2-29 (information, the leg's payload):** the E8 leg adds about 6.5 MB of raw runtime (the Far Side +3.3 MB, Low Orbit +3.2 MB, native metal atlases in both packs); the running total for the owner's eye stands with F-F2-7 and F-F2-21.

## Slice 13 — LANDED `ce288f378` (2026-09-23 20:07Z): the Dome Basin

**Lane up to** `7cc23fb59` · **store main** `60c635c` (landed first, pushed) · **merge** `ce288f378` · same-era pin #53 `9103137b`

### What it does (the run-6 HELD clauses answered FIXED / IMPROVED with a number against run 6 / HELD with the owner named)
**The Dome Basin — IMPROVED / HELD (Astra's own verdict).** The three lock bodies (the dust-devil warning mast, the ice-quarry hoist, the seed-row weather station) take a native masonry-and-metal atlas with bounded bearing and footing detail, 1,580 → 2,308 of 3,000 triangles; the UV distortion falls from a median of 3.75 and a p95 of 38.52 to 1.00 and 1.08 with no collapsed face, and at the 5 m station the run-6 luminance rises 0.327 → 0.466 desktop and 0.325 → 0.460 phone; the ground is retained within 0.004% RMS and the station HUD's rise from 0% to 0.021% / 0.067% is reported. The independent critique keeps the real ground contact, the coarse courses, the dense joins, the railway integration and the full canal scale as held. Frame p95 9.65 → 9.55 ms desktop and 9.30 → 9.45 ms phone over four runs, draws 94 / 53 unchanged, zero capture errors; no E1 art. Astra measured the engine hash at `9103137b…` with the lane store at `60c635c`; the drain's own measurement on the merged tree is the pin below.
Where the player sees it: the plain entry of these maps, on production and the all-epochs preview.

### Evidence (this slice's gates on the merged tree, the scratch store clean at the landed store main)
| Check | Result |
| --- | --- |
| the store landing | `60c635c` on `Agent-Town/GoldRush-assets` main, pushed; the scratch store worktree detached at it, clean, before any hash was measured (F-A3-2) |
| merge | `clean, no conflicts` |
| single-line law (F-CORR1-4) | `nothing to flatten` |
| tsc / build / e1 | `0 / 0 / 0` (rc) · payload `34318148 bytes` |
| engine hash | `9103137b1b23675a…`; same-era pin #53 `9103137b`, era guards in the chain `ℹ pass 9 ℹ fail 0` |
| halo / null floors / law-pointer | `rc=0 halo re-extraction PASS: 315 cured, 0 held, 760 regenerated-and-cured, 2127 scanned; alpha and opaque RGB unchanged` · `rc=0 83 of 83 null floors match assets/contracts/null-floors.json (318.0s).` · `rc=0 law-pointer-guard — do the law surfaces still point at what they claim?` |
| named guards | `ℹ pass 98 ℹ fail 0` |
| e2e both projects, `--workers=1` (the maps' own specs, landmark brightness/collision, fort collision, task-025, m2-01) | `rc=0   4 skipped   58 passed (5.9m)  19:59Z` |
| e2e reds | none<br>Attribution: Attribution: pre-attributed by a control of this slice's specs on main `f969e9fe4` with the store's main at `4a2976f` before the merge (`drain-s13-e2e-control-main.log`: rc=0, 0 failure lines) — every red on the merged tree below matches a line of that control by file, test line and project; nothing in this slice's diff touches those tests' subjects. |
| full `npm run test:node-guards` (before the pin) | `rc=1 ℹ tests 955 ℹ pass 946 ℹ fail 4 ℹ skipped 5  20:07Z` |
| battery reds | `    actual: [ 'CONTENDED — 3 concurrent batteries', 'CONTENDED — 3 concurrent batteries' ],`<br>`    expected: [ 'CONTENDED — 2 concurrent batteries', 'CONTENDED — 2 concurrent batteries' ],`<br>`  +   'CONTENDED — 3 concurrent batteries'`<br>`  +   'CONTENDED — 3 concurrent batteries',`<br>`  -   'CONTENDED — 2 concurrent batteries'`<br>`  -   'CONTENDED — 2 concurrent batteries',`<br>`✖ all 152 scripts/*.test.mjs fixture owners remove their temp directories (190841.6065ms)`<br>`✖ contention is advisory, correctly counted, and absent when alone (3414.873667ms)`<br>`✖ failing tests:`<br>`✖ rotation registry stays outside the engine identity corpus (549.182416ms)`<br>`✖ the landed registry names the live engine and stays outside its hash corpus (206.434333ms)` (the engine-era, bench-seeds and fixture-sweep rows are the pre-pin hash class, cured by the pin above) |

### Merge classification
Code: `src/world/*` (render side, incl. `Water.ts`), the render-only presentation owners, `src/entities/*` pure visuals (the Motor vehicle), `reviews/sol-map-art-current-status-20260909.md`, `artifacts/sol/map-art-campaign-2/report.md` (a dated run-9 section) and `run-9/**`. Store: `pilots/map-rebuild-spike/**` for these maps, one commit per map, landed on the store's main first. Firewall: within the master's Touch ONLY plus the store. Base: the chain's previous tip; MAIN-MOVED files are fire bookkeeping taken as theirs at the main merge before the fast-forward.

### Findings
- **F-F2-30 (pre-existing, attributed by Astra on the exact base):** the Dome Basin's browser batch carries four exact-base failures, outside this slice's gate, where the E9 census, the E9 beats and the shared suites run on both projects (the Dome Basin has no spec of its own).
- **F-F2-31 (information):** the pack's landmark atlas and two native material swatches join the corpus (under `landmarks/` and `sources/`), shipped by the existing includes; the early droplet-mirror check on the merged tree is the proof.

## Slice 15 — LANDED `f3e95539c` (2026-09-23 20:38Z): the Seed Run, Devil's Alley

**Lane up to** `e0fa15426` · **store main** `03ccce8` (landed first, pushed) · **merge** `f3e95539c` · same-era pin #54 `fa80dda3`

### What it does (the run-6 HELD clauses answered FIXED / IMPROVED with a number against run 6 / HELD with the owner named)
This slice carries two maps: the lane range `87f218e98..e0fa15426` (the Seed Run, then Devil's Alley) and the store commits `0c64c93` and `03ccce8`; the two launchers were queued on the drain lock in order and the later one acquired it first (the lock is not first-in-first-out, F-F2-34), so the Seed Run's code and pack land here and its own slice stopped at its store precondition without touching anything.

**The Seed Run — IMPROVED / HELD (Astra's own verdict).** The west seed vault and the south caravan gate gain attached door hardware, framed windows and native surfaces at 2,828 of 3,000 triangles (from 2,148); the UV distortion falls from a median of 1.82 and a p95 of 15.05 to 1.00 and 1.24 and the collapsed area from 0.8% to 0%; at the run-6 station the body median rises 0.259 → 0.443 on both viewports. The convoy's ruts become quieter, tapered marks that keep all 110 centres and four rings (a render-only change in the caravan presentation), and the declared HUD stays at 0% on both viewports. HELD: weak contact, shallow panels, the material hierarchy and the repeated route spacing. Performance −1.0% / +0.5%, draws 126 / 72 unchanged, zero capture errors; no E1 art. Astra measured the engine hash at `bfa5e66d…` with the lane store at `0c64c93`; the drain's own measurement on the merged tree is the pin below.

**Devil's Alley — IMPROVED / HELD (Astra's own verdict).** The three wind anchors take native surfaces and connected fittings at 2,284, 2,628 and 2,972 of 3,000 triangles (the two anchor gates with them); at the run-6 upper stations the median rises 0.193 → 0.353 desktop and 0.192 → 0.352 phone, the dark share falls from 12.9% and 9.7% to 0%, and the UV p95 falls from 31 to 50 down to 1.44; the safety rings and all gameplay geometry are exact, and the raw phone station HUD's rise from 0.004% to 0.008% is reported. HELD: the full scale, the coil hierarchy, contact, texture crispness, and the landscape and VFX. Performance +1.6% / −0.5% over four runs, draws 88 / 58 unchanged, zero capture errors; no E1 art. Astra measured the engine hash at `fa80dda3…` with the lane store at `03ccce8`; the drain's own measurement on the merged tree is the pin below.
Where the player sees it: the plain entry of these maps, on production and the all-epochs preview.

### Evidence (this slice's gates on the merged tree, the scratch store clean at the landed store main)
| Check | Result |
| --- | --- |
| the store landing | `03ccce8` on `Agent-Town/GoldRush-assets` main, pushed; the scratch store worktree detached at it, clean, before any hash was measured (F-A3-2) |
| merge | `clean, no conflicts` |
| single-line law (F-CORR1-4) | `nothing to flatten` |
| tsc / build / e1 | `0 / 0 / 0` (rc) · payload `34318148 bytes` |
| engine hash | `fa80dda3304171f1…`; same-era pin #54 `fa80dda3`, era guards in the chain `ℹ pass 9 ℹ fail 0` |
| halo / null floors / law-pointer | `rc=0 halo re-extraction PASS: 315 cured, 0 held, 760 regenerated-and-cured, 2127 scanned; alpha and opaque RGB unchanged` · `rc=0 83 of 83 null floors match assets/contracts/null-floors.json (303.0s).` · `rc=0 law-pointer-guard — do the law surfaces still point at what they claim?` |
| named guards | `ℹ pass 98 ℹ fail 0` |
| e2e both projects, `--workers=1` (the maps' own specs, landmark brightness/collision, fort collision, task-025, m2-01) | `rc=0   4 skipped   62 passed (6.1m)  20:30Z` |
| e2e reds | none<br>Attribution: Attribution: pre-attributed by a control of this slice's specs on main `b750f46ba` with the store's main at `60c635c` before the merge (`drain-s15-e2e-control-main.log`: rc=0, 0 failure lines) — every red on the merged tree below matches a line of that control by file, test line and project; nothing in this slice's diff touches those tests' subjects. |
| full `npm run test:node-guards` (before the pin) | `rc=1 ℹ tests 955 ℹ pass 947 ℹ fail 3 ℹ skipped 5  20:38Z` |
| battery reds | `✖ all 152 scripts/*.test.mjs fixture owners remove their temp directories (189177.239209ms)`<br>`✖ failing tests:`<br>`✖ rotation registry stays outside the engine identity corpus (588.500375ms)`<br>`✖ the landed registry names the live engine and stays outside its hash corpus (126.088333ms)` (the engine-era, bench-seeds and fixture-sweep rows are the pre-pin hash class, cured by the pin above) |

### Merge classification
Code: `src/world/*` (render side, incl. `Water.ts`), the render-only presentation owners, `src/entities/*` pure visuals (the Motor vehicle), `reviews/sol-map-art-current-status-20260909.md`, `artifacts/sol/map-art-campaign-2/report.md` (a dated run-9 section) and `run-9/**`. Store: `pilots/map-rebuild-spike/**` for these maps, one commit per map, landed on the store's main first. Firewall: within the master's Touch ONLY plus the store. Base: the chain's previous tip; MAIN-MOVED files are fire bookkeeping taken as theirs at the main merge before the fast-forward.

### Findings
- **F-F2-32 (pre-existing, attributed by Astra on the exact base):** the Seed Run's browser batch carries two exact-base roster reds, outside this slice's gate, where the map's own caravan spec, the E9 census and the E9 beats run on both projects.
- **F-F2-33 (pre-existing, attributed by Astra on the exact base):** Devil's Alley's browser batch carries two exact-base roster failures, outside this slice's gate, where the map's relocation spec, the E9 census and the E9 beats run on both projects.
- **F-F2-34 (drain infrastructure):** the drain lock is a mkdir loop with no first-in-first-out order; two launchers queued for slices 14 and 15 raced and the later one won, so the Seed Run landed inside Devil's Alley's slice (its commits are ancestors of the lane commit merged here, its store commit an ancestor of the store main moved here) and the Seed Run's own launcher was stopped by hand before its store precondition could refuse it. Cure for the drains: queue one mid-run slice at a time, or make a launcher wait for the previous slice's landing marker before taking the lock.
