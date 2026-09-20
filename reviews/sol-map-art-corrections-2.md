# Drain review — `sol-map-art-corrections-2`: Astra's second corrections run, three maps, a clean capped stop — the first drain in the public repo under the art-store law

**Slice/branch/tip:** `sol-map-art-corrections-2` · code `sol/map-art-campaign-2` @ `319d3c917` (three Astra commits, gpt-6-astra xhigh on the owner's NEW Codex subscription, lane-c) · store `astra/corrections-2` @ `068c0db` (three commits in `Agent-Town/GoldRush-assets`, landed on the store's main `068c0db` FIRST) · **merge** `4be40ccb2` · **drained** attended 2026-09-20 · **master** `tasks/sol-map-art-corrections-2.md` · **run** `tasks/runs/20260920-140907-lane-c-sol-map-art-corrections-2.md.log`, 657,906 tokens, rc0, done-move `20260920-140907-sol-map-art-corrections-2.md`.

## VERDICT: LANDED — the Pressure Garden, the Incline and the Canyon Works corrected IMPROVED / HELD; the run stopped at its cap with the remaining list written

The owner's words: "Ok, lets start with a first set of maps and Astra - I want to keep this going. Can you work from E2 over E3 etc. up so I can test things?" and, on the new subscription, "with that one we have to be more careful." The cap (three maps, then a clean stop with the remaining list) held: no fourth map was started, nothing was reverted, and the run cost 657,906 tokens against the 1.2–1.5 M projected from run 1's per-map spend. The remaining order Astra wrote: Dust Flats → Long Road → Gusher County → Boneyard → Glow Mesa → Half-Life Hollow → Picnic → Dead Band → Relay Rush → Far Side → Low Orbit → Dome Basin → Seed Run → Devil's Alley → Old Canal → Last Claim (16 maps).

## What it does (Astra's own bar: every clause of the row answered FIXED / IMPROVED with a number / HELD with the owner named)
1. **The Pressure Garden** (`14f55b33b`, store `9fa06cc`): worked-ground RMS −46.73 % desktop / −43.72 % phone; manifold body median +21.64 % / +21.36 % at emission 0.45; short river flow lines; the declared 5 m manifold station fits the phone with 0.008 % persistent HUD coverage (44.90 % at 14 m). HELD: the manifold off-screen at plain entry on phone, the pump 44.78 % / east header 31.97 % phone HUD (UI/camera owners). p95 9.20 → 9.25 ms desktop / 9.05 → 9.05 phone, draws 90/58 unchanged. The saved Pressure Garden patch of run 1 was read and superseded by fresh work.
2. **The Incline** (`500c950f0`, store `213e677`): rail-bed and yard RMS −37.86 % / −33.85 %; two return cables and eight wheels complete the service-bin details within the original bounds (+392 triangles); primary body median +56.2 % / +50.4 % at emission 0.375; the 5 m station fits the phone at 0.27 % HUD (38.70 % at 14 m), all five stations below 0.34 %. p95 9.00 → 8.85 / 9.15 → 9.15, draws 76/58. Atlas, terrain, panorama, mounts and body UVs unchanged; all five bodies re-export exactly.
3. **The Canyon Works** (`319d3c917`, store `068c0db`): FIXED the exposed-background seam (a 1 m panorama gap closed through 97 render-only inner-ring vertices, seam bright pixels 734/110 → 0/0); ground RMS −41.42 % / −32.83 %; dynamo body median +35.28 % / +33.51 % at 0.45; FIXED the 3 m primary-body inspection framing on phone (HUD 57.27 % → 0.002 %); the tracked atlas recipe reproduces base and candidate exactly (F-OMB-5's checkpoint holds). HELD: phone entry 27.305 % HUD and the canyon vista (UI/camera/layout), the live pylon chain (needs built beacons), the straight apron and machine construction (campaign art gaps). p95 9.75 → 9.80 / 9.85 → 9.75, draws 72/54.
Where the player sees it: the plain entry of the three maps, on the all-epochs preview.

## Evidence (this drain's gates on the merged tree, the store clean on its main)
| Check | Result |
| --- | --- |
| the store landing | `068c0db` on `Agent-Town/GoldRush-assets` main, pushed; clean before any hash was measured (F-A3-2) |
| merge | `clean, no conflicts` |
| single-line law (F-CORR1-4) | `nothing to flatten` |
| tsc / build / e1 | `0 / 0 / 0` (rc) · payload `34250832 bytes` |
| engine hash | `8544c803bfa47d4f…`; same-era pin `#20 `8544c803``, era guards `ℹ pass 9 ℹ fail 0` |
| halo / null floors / law-pointer | `rc=0 halo re-extraction PASS: 315 cured, 0 held, 760 regenerated-and-cured, 2127 scanned; alpha and opaque RGB unchanged` · `rc=0 83 of 83 null floors match assets/contracts/null-floors.json (295.5s).` · `rc=0 law-pointer-guard — do the law surfaces still point at what they claim?` |
| named guards | `ℹ pass 95 ℹ fail 0` |
| e2e both projects, `--workers=1` (the three maps' own specs, landmark brightness/collision, fort collision, task-025, m2-01) | `rc=0   4 skipped   48 passed (5.2m)  08:48Z` |
| e2e reds | none |
| full `npm run test:node-guards` (before the pin) | `rc=1 ℹ tests 938 ℹ pass 930 ℹ fail 3 ℹ skipped 5  08:56Z` |
| battery reds | `✖ all 152 scripts/*.test.mjs fixture owners remove their temp directories (216233.490792ms)`<br>`✖ failing tests:`<br>`✖ rotation registry stays outside the engine identity corpus (371.997334ms)`<br>`✖ the landed registry names the live engine and stays outside its hash corpus (270.412334ms)` |

Astra's own gates per map: builds, its own spec, focused census and shared render checks, shared brightness/collision (16 pass, four skips), loading/repeat, 34 render guards and three named guards; the escort HP 39/40 and headless census deadline 6/8 reds reproduce on the exact base (Astra's control), as do the shoreline and atlas-census reds. Transcripts: `artifacts/sol/map-art-campaign-2/run-4/drain-gates-summary.txt`, `drain-e2e-merged-tree.log`, `drain-battery-merged-tree.log`.

## Merge classification
Code: pilot sources are no longer in this repo (the store carries them); this branch touches `src/world/*` (render side), `reviews/sol-map-art-current-status-20260909.md`, `artifacts/sol/map-art-campaign-2/report.md` (fourth section) and `run-4/**`. Store: `pilots/map-rebuild-spike/**` for the three maps, three commits, fast-forwarded or merged onto the store's main first. Firewall: within the first master's Touch ONLY plus the store law. Blob law: no blob over 50 MB.

## Findings
- **F-CORR2-1 (information):** the run's cost, 657,906 tokens for three maps, is about half the projection; the cap of three per run stands unless the owner says otherwise.
- **F-CORR2-2 (for the drain's law):** Astra reported that the master's `run-guards --changed-since` expands to the forbidden full battery; it ran the named guards instead and recorded the conflict. The full battery remains the drain's.
- **F-CORR2-3 (structural, F-A3-2):** the store's working tree is shared by every checkout, so this run's in-flight pilot edits reddened the era guards on other checkouts until the store landed; one store worktree per lane is owed before the next run if the fires are to stay green during it.
- **F-A3-3 (cured on main during this drain window):** the halo guard read its banked sweep at a filtered path in history; it now reads the tracked copy.

## What was touched
Store: `pilots/map-rebuild-spike/**` (three maps). Code: `src/world/Terrain3dClaimPilot.ts`, `src/world/Water.ts` (render side), the status doc, the campaign report and `run-4/**`. Drain-side: `assets/engine-era.json` (pin `#20 `8544c803``), this review, the goal leaf, the BACKLOG row, STATUS line 1.
