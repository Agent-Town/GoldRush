# Epoch-1 Contract Roster — rounding out the Frontier
Status: **RATIFIED 2026-07-07 ~15:25** (owner: "the other contracts for epoch 1, can you spec them out fully with art and everything and add them to the queue" — roster confirmed, Baron approved, Night Shift stays in E1). Board rows mount on Town T3's manifest socket; until T3 lands every contract is loadable via `?contract=<id>` (debug-gated, the gt-02 pattern) so build tasks run NOW.

## Laws (all contracts)
- A contract = manifest data (tile params + twist knobs + board row) + at most ONE twist mechanic. Core loop (pan/sluice/build/waves) intact everywhere. All knobs Balance-additive.
- Loadable standalone via `?contract=<id>` for dev/e2e; the classic claim stays default; determinism preserved per contract (seeded runs hash stable).
- Scoreboard/best-claims per contract id (existing per-contract results socket). Difficulty tags map to existing presets.
- Canon: warm frontier satire; the Baron is a stage-melodrama outlaw (ADR-001, never gory, no peoples).
- Art per the pipeline law: {ANCHOR} = the style-anchor sentence verbatim from assets/LEDGER.md header; magenta #ff00ff sheets; explicit grids; NO mirrors.

## C3 — THE DRY GULCH (`e1-dry-gulch`) · tag: trail · unlock: reach wave 10 on The Claim
**Twist: water is scarce.** Tile: the river band REMOVED; one spring pond (~6-tile water zone, SW quadrant, `prop-spring-pond` decal + reeds). Sluices require water adjacency — the existing river-adjacency check generalizes to a `waterSource` predicate (pond qualifies); placement becomes the puzzle. Seams +40% yield (`Balance.contracts.dryGulch.seamYieldMult: 1.4`) to keep economy pace. No river barrier → four open spawn lanes (046's ring/lane constants read per-contract). Waves: standard schedule.
**Gate/e2e (`e1-dry-gulch.spec.ts`):** loads via param · no river collision anywhere · sluice placement rejected away from pond + accepted beside it · seam yield multiplier measured · 4-lane spawns confirmed · seeded determinism · both projects.

## C4 — TWIN BANKS (`e1-twin-banks`) · tag: vein-hunter · unlock: first SECURED claim (wave-20 victory)
**Twist: a split homestead.** Tile: today's river layout but build zones on BOTH banks (build-zone manifest per side; the claim stake sits south, a second stake-marker north); TWO fords (west + east thirds). Spawns from all four edges — north spawns pressure the north plot. One economy, two fronts; ford control is everything. Stockpiles/sluices work identically on either bank.
**Gate/e2e:** build accepted both banks · both fords route enemies (025's ford logic × 2 asserted) · north-plot loss ≠ run loss (claim stake south remains THE loss condition — north is expansion, risk/reward) · seeded determinism · both projects.

## C5 — THE NIGHT SHIFT (`e1-night-shift`) · tag: vein-hunter · unlock: science ≥ 3 steps
**Twist: sight is the resource.** Light rig ramps: full light → dusk at wave 5 → dark from wave 10; enemies outside any light radius render dimmed-to-black (render-only fog-of-dark: sprite dimming by distance-to-nearest-light, NO sim change — targeting unchanged, turrets still acquire; the PLAYER loses sight, not the machines). Light sources: beacons (existing glow, radius ×1.5 here via `Balance.contracts.nightShift.beaconLightMult`), turret muzzle glow, the hero's lantern (small personal radius), `prop-lantern-post` buildable (cheap, light-only building — this contract only). DAWN at wave 25 = the victory bell (shorter, tenser run). Banks E3's night-grid learnings per the saga engine ladder.
**Gate/e2e:** ramp fires at the specced waves · dimming shader-state asserted on out-of-radius enemies while turret acquisition stays unchanged (the sim/render split PROVEN) · lantern-post buildable only here · dawn-victory at 25 · zero-console · both projects · perf p95 within envelope (dimming must be cheap).

## C6 — THE CLAIM-JUMPER BARON (`e1-baron`) · tag: vein-hunter · unlock: frontier science tree COMPLETE
**Twist: a named enemy.** Standard claim tile, compressed tempo (+15% wave cadence). Ledger taunts at waves 5/12/18 ("The Baron sends his regards. The claim won't hold."). WAVE 20: the Baron — elite claim-jumper: HP ×40, speed ×0.8, scale ×1.4, escort squad, carries `prop-baron-banner`; CombatSystem remains sole damage resolver (elite = stat block + banner attachment, no new combat paths). Defeat beat: "Dragged off by his own men, swearing revenge." → ceremony line + double science payout + board medal (`baronBeaten` per profile). This is E1's graduation — the beat that makes building the Steamworks feel earned. (Foreshadow: his revenge is an E2 board contract later.)
**Gate/e2e:** taunts at specced waves · Baron spawns wave 20 with stats/banner · standard weapons kill him (no special-case damage) · defeat beat + payout + medal persist · loss to him = normal overrun copy · seeded determinism · both projects.

## Art manifest (batch-011, ART slot — prompt-ready; {ANCHOR} verbatim per LEDGER header)
1. `char-baron-sheet-walk4-a.png` — 4×4 walk cycle grid (down/left/right/up rows, 4 frames each), #ff00ff background, NO mirrored frames. The Claim-Jumper Baron: stout outlaw in a long oxblood greatcoat with brass buttons, stage-villain waxed mustache, tall black hat with a playing card in the band, 1.4× the height of existing claim-jumper sprites (measure against char-jumper-sheet cells). {ANCHOR}
2. `char-baron-sheet-walk4-b.png` — same grid/character, banner-bearer pose variant (left hand hoisting a short standard). {ANCHOR}
3. `prop-baron-banner.png` — single cell, #ff00ff: tattered oxblood banner, crossed pickaxes sigil in faded gold, wind-torn edge. {ANCHOR}
4. `prop-spring-pond.png` — full-bleed square tile decal: small desert spring pond, teal-green water matching the river palette band, reed clusters, damp-earth ring. {ANCHOR}
5. `prop-lantern-post.png` — single cell, #ff00ff: wooden lantern post with brass-and-glass lantern, UNLIT (warm glow is engine-side), slight lean, frontier-made. {ANCHOR}
QA per sheet: heights vs existing bands measured · magenta purity · grid alignment · no letters/numbers.

## Sequencing (fires: refill-on-merge, 1–2 per lane)
art-batch-011 (art, NOW) → C3 Dry Gulch (lane-d, NOW — terrain-variant domain) → C5 Night Shift (lane-c after its current queue) → C4 Twin Banks (lane-d after C3) → C6 Baron (lane-b after town-T1 chain; needs batch-011 processed for the sheets, placeholder-first if not). Board rows activate with Town T3; until then `?contract=` is the test door. Full roster live BEFORE the first epoch transition (Replay Law: E1 stays playable forever).
