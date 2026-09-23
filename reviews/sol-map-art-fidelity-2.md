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
