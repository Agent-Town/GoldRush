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
