# Drain review — `sol-map-art-corrections-3`: Astra's third corrections run, three maps, a clean capped stop — the second batch on the new subscription

**Slice/branch/tip:** `sol-map-art-corrections-3` · code `sol/map-art-campaign-2` @ `d00459be2` (three Astra commits, gpt-6-astra xhigh on the owner's Codex subscription, lane-c) · store `astra/corrections-3` @ `b959768` (three commits in `Agent-Town/GoldRush-assets`, landed on the store's main `b959768` FIRST) · **merge** `74083ce0d` · **drained** attended 2026-09-20 · **master** `tasks/sol-map-art-corrections-3.md` · **run** `tasks/runs/20260920-163046-lane-c-sol-map-art-corrections-3.md.log`, 694,270 tokens, rc0, done-move `20260920-163046-sol-map-art-corrections-3.md`.

## VERDICT: LANDED — the Dust Flats, the Long Road and Gusher County corrected IMPROVED / HELD; the run stopped at its cap with the remaining list written

The owner's words: "ok, then lets continue with the next batch of maps but don't let it run through all of them." The cap (three maps, then a clean stop with the remaining list) held: three maps completed and committed in order, the Boneyard not started, nothing reverted; the run cost 694,270 tokens (run 2: 657,906). The remaining order Astra wrote: Boneyard → Glow Mesa → Half-Life Hollow → Picnic → Dead Band → Relay Rush → Far Side → Low Orbit → Dome Basin → Seed Run → Devil's Alley → Old Canal → Last Claim (13 maps).

## What it does (Astra's own bar: every clause of the row answered FIXED / IMPROVED with a number / HELD with the owner named)
1. **The Dust Flats** (`f6eb64d1b`, store `d316da2`: ground RMS −79.89 % desktop / −73.89 % phone with no new geometry or draws; the road paint follows the existing 24 m ring and four corridors; the declared 5 m charting-post station takes phone persistent HUD from 31.57 % to 0.006 % (desktop 0 %). HELD: entry landmark context and the central-derrick concept (camera/layout and art owners). p95 9.30 → 9.25 / 9.50 → 9.20 ms, draws 77/52. Six own reds reproduce on the exact base; the story flake passed its 2/2 retry)
2. **The Long Road** (`c258a41df`, store `0f6ef32`: ground RMS −85.41 % / −54.02 %, apron RMS −61.72 %; the same road truth, a quieter ground, a 97-vertex panorama-join underlap with no extra triangles; the wagon's 5 m inspection station takes phone HUD from 27.35 % to 0.011 % (west stop 0.016 %). HELD: the entry wagon still 12.369 %, the horizon/stop vista, the remaining body art. p95 8.80 → 8.85 / 9.00 → 8.90 ms, draws 59/49)
3. **Gusher County** (`d00459be2`, store `b959768`: actor occlusion 100 % → 2.00 % desktop / 2.27 % phone (the tall cabin narrowed within unchanged bounds, heights and footprint, 126 vertices); rust-sheet UVs reuse the existing iron paint, camp red-body share 57.6 % → 0 %; ground RMS −44.27 % / −38.98 %; the camp's 5 m station takes phone HUD from 60.135 % to 0.010 %. HELD: phone entry still crops at 19.097 % persistent coverage, the oil-channel/lease vista, the connected pipe art. p95 9.35 → 9.25 / 8.80 → 8.75 ms, draws 73/54. An initial ground-detail regression was caught against the exact base and corrected to satisfy the unchanged panorama matrix; final own batch 9 pass / one navigation red, the isolated errand retry 2/2)
Where the player sees it: the plain entry of the three maps, on the all-epochs preview.

## Evidence (this drain's gates on the merged tree, the store clean on its main)
| Check | Result |
| --- | --- |
| the store landing | `b959768` on `Agent-Town/GoldRush-assets` main, pushed; clean before any hash was measured (F-A3-2) |
| merge | `clean, no conflicts` |
| single-line law (F-CORR1-4) | `nothing to flatten` |
| tsc / build / e1 | `0 / 0 / 0` (rc) · payload `34255826 bytes` |
| engine hash | `491f2a917b0e360f…`; same-era pin `#22 `491f2a91``, era guards `ℹ pass 9 ℹ fail 0` |
| halo / null floors / law-pointer | `rc=0 halo re-extraction PASS: 315 cured, 0 held, 760 regenerated-and-cured, 2127 scanned; alpha and opaque RGB unchanged` · `rc=0 83 of 83 null floors match assets/contracts/null-floors.json (295.6s).` · `rc=0 law-pointer-guard — do the law surfaces still point at what they claim?` |
| named guards | `ℹ pass 95 ℹ fail 0` |
| e2e both projects, `--workers=1` (the three maps' own specs, landmark brightness/collision, fort collision, task-025, m2-01) | `rc=1   4 failed   4 skipped   42 passed (5.1m)  10:54Z` |
| e2e reds | `1) [desktop-chrome] › e2e/e4-dust-flats.spec.ts:31:1 › fires the authored storm and peels a convoy off the ORBIT road `<br>`2) [desktop-chrome] › e2e/e4-dust-flats.spec.ts:97:1 › offers road grading and the hauler in a normal Motor-era run `<br>`3) [mobile-chrome] › e2e/e4-dust-flats.spec.ts:31:1 › fires the authored storm and peels a convoy off the ORBIT road `<br>`4) [mobile-chrome] › e2e/e4-dust-flats.spec.ts:97:1 › offers road grading and the hauler in a normal Motor-era run `<br>Attribution: all four are `e2e/e4-dust-flats.spec.ts:31` ("fires the authored storm and peels a convoy off the ORBIT road") and `:97` ("offers road grading and the hauler in a normal Motor-era run"), both projects — `logs/suite-red-inventory.md` rows 170–173 (pre-existing; those rows record 90 s timeouts where the tests now fail fast, the `:46` `toMatchObject` receiving undefined and the `:97` `roads.segments` poll staying at 0), and a control run of the same spec on main `f7f855438` before this batch reproduced the identical four (rc=1, 4 failed / 2 passed, 49.4 s; transcript `artifacts/sol/map-art-campaign-2/run-5/drain-e2e-control-main.log`). The batch touched no Dust Flats gameplay file; the reds are main's. |
| full `npm run test:node-guards` (before the pin) | `rc=1 ℹ tests 940 ℹ pass 932 ℹ fail 3 ℹ skipped 5  11:02Z` |
| battery reds | `✖ all 152 scripts/*.test.mjs fixture owners remove their temp directories (178086.321125ms)`<br>`✖ failing tests:`<br>`✖ rotation registry stays outside the engine identity corpus (532.124417ms)`<br>`✖ the landed registry names the live engine and stays outside its hash corpus (419.91175ms)` |

Astra's own gates per map: builds, final plain captures, shared lighting/collision, loading/repeat and the scoped guards per map; the atlas-census base red and the six Dust Flats own reds reproduce on the exact base (Astra's controls); the Last Claim verdict re-stated UNACCEPTED (its sculpt pack stays on the list)

## Merge classification
Code: `src/world/*` (render side), `reviews/sol-map-art-current-status-20260909.md`, `artifacts/sol/map-art-campaign-2/report.md` (fifth section) and `run-5/**`. Store: `pilots/map-rebuild-spike/**` for the three maps, three commits, landed on the store's main first. Firewall: within the first master's Touch ONLY plus the store law. Blob law: no blob over 50 MB.

## Findings
- **F-CORR3-1 (information):** the run's cost, 694,270 tokens for three maps (run 2: 657,906); the cap of three per run stands.
- **F-CORR3-2:** Astra again reports the master's `run-guards --changed-since` expanding to the forbidden full battery and ran the scoped guards instead; the continuation master should name the scoped set outright
- **F-CORR3-3 (structural, F-A3-2, unchanged):** the store's working tree is shared by every checkout, so this run's in-flight pilot edits reddened the era guards elsewhere until the store landed; one store worktree per lane remains owed.

## What was touched
Store: `pilots/map-rebuild-spike/**` (three maps). Code: `src/world/Terrain3dClaimPilot.ts`, `src/world/Water.ts` (render side), the status doc, the campaign report and `run-5/**`. Drain-side: `assets/engine-era.json` (pin `#22 `491f2a91``), this review, the goal leaf, the BACKLOG row, STATUS line 1.
