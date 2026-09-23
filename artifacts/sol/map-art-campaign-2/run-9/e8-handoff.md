# E8 fidelity — ready for the drain

2026-09-24. **READY-FOR-GATES. Remaining E8 list: none.** Both maps were processed in order with separate game and store commits. Their remaining art limitations are retained below; this is not full concept acceptance or a shipping claim.

| Map | Earlier clause and result |
| --- | --- |
| Far Side | “The simple existing frame and base do not equal the plate's detailed pressure vessel.” **IMPROVED / HELD**: domed vessel, collars, spindle, supported feet and mast brace, **600→2,966/3,000** triangles. Own run-6 3 m luminance **0.29577→0.34839 desktop /0.29660→0.34811 phone**; dark share **4.699→0% /3.856→0%**. Fine metal, bearing/mechanism, teal contrast and contact remain held by landmark art. The mixed “HELD the plate's pressure vessel and richer compound by contract/collision and art/layout owners.” is improved for the vessel; broader compound/layout stays held. [Full clause table and evidence](e8-far-side/review.md). |
| Low Orbit | “material refinement remains with art.” and “low reference fidelity, stretched material detail, competing hoops”: **IMPROVED** joined housing, bolted rim, pressure towers, teal controls and native surface atlas; **FIXED** competing structural hoops. **2,972→2,964/3,000** triangles; own run-6 3 m luminance **0.319293→0.403809 /0.319482→0.403760**, dark share **7.737→0% /7.833→0%**. “Smooth ground and weak contact remain an art refinement.” stays **HELD by terrain/landmark art**: medians **0.255275/0.256109**, RMS **0.00254449/0.00999197**, exactly unchanged. Fine material, blunt claws, full orbital composition and phone UI remain held. [Every retained critique clause and evidence](e8-low-orbit/review.md). |

Both retain emission **0.45**, exact full-body bounds, mounts, stations, collision, terrain/height/mask truth, routes, spawns and gameplay code. Four sibling meshes per pack are exact; their common atlas is updated. Later owner-approved Far Side solidity and relocation remain intact. Low Orbit's visual deck is **1.535% smaller**, while the full-body bounds and collision footprint are exact; it retains the earlier **29.2893%** chamfer reduction relative to its rectangle.

**HUD ceiling exception:** Far Side's 3 m desktop coverage rises **0.047327→0.071424% (+0.024096 percentage points)** against run 6, explicitly reported. Phone is **5.768185→0.011646%**. Low Orbit remains below both earlier station ceilings: **0.002498→0% /0.997591→0.019548%**. Historical phone improvements include already-landed run-8 UI work and are not credited to art. Ordinary phone panels/tooltips remain visibly obstructive.

**Gates:** per map, TypeScript/default/full builds, **34+3** scoped guards, mirror allowlist, source and recipe re-export proofs, loading **8/8**, repeat **2/2**, six dedicated mount/dispose cycles and parity/census **6/6** pass. Far Side broad browser batch **48 pass /4 skip /2 fail**, final affected rerun **22 pass /4 skip**. Low Orbit final browser batch **58 pass /4 skip /2 fail**. In each map, both arsenal failures reproduce on that map's exact engine-verified baseline with identical fingerprints; no assertions were changed. Capture console/page errors are zero.

Four timing runs per arm and viewport: Far Side p95 **9.35→9.35 /9.35→9.70 ms**, unchanged draws **63/50**; Low Orbit **9.55→9.55 /9.80→9.60 ms**, unchanged draws **77/55**. Single modes, all within **15%**. E1 byte deltas **N/A**; raw E8 runtime GLBs add **3,330,124 B** and **3,195,408 B**, respectively.

| Map | Game commit | Store commit on astra/fidelity-2 |
| --- | --- | --- |
| Far Side | `aef5f1297ecdcde580bfcad7420df7e613ac9c13` | `70b78b433ff926b3552fc3d201970d101edf4906` |
| Low Orbit | The `art: Low Orbit salvage-rig fidelity and E8 handoff` commit carrying this file | `4a2976f52ae92d17da23d883d0bf5756e75c9f74` |

Far Side engine: `6655ba7569775a529216d58cf8f288556ca9fc19cfd7bbeae41dbeb9a99adf33` → `b4eff9b0b2c8df3dcd53fdca0bfbdefdc15f04a241db2293628deeca13b4d4df`.

Low Orbit engine: `b4eff9b0b2c8df3dcd53fdca0bfbdefdc15f04a241db2293628deeca13b4d4df` → `984a9f2498c3445a6fe7f4e9b600f9334b4e7a394d0f3b284493b76dc39ba1a5`.

The engine pin is untouched. Store pushes and remote readback are recorded per map. Game branch is **sol/map-art-campaign-2**; store worktree is `/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets`. The primary store checkout was not repointed. Initial preflight was clean except allowed `logs/guard-stats.jsonl`; regenerated test evidence was restored, with receipts/raw retention. No main reset, rebase or force push occurred mid-run.

Later epoch maps, outside this task, in order: **e9-dome-basin → e9-seed-run → e9-devils-alley → e9-old-canal**.
