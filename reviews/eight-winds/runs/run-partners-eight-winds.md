# Art run — THE EIGHT WINDS, batch 2: the three half-hemisphere townsfolk, the Partner, the hero
**Date:** 2026-07-28 · **Arm:** Codex `image_gen` (gpt-image-2) via `codex exec -m gpt-5.6-sol` · **Session:** attended Opus 5, branch `anim/opus5-pass` · **Slot:** new sibling sheets only

14 generations. Method, geometry and the wind→screen-side table are in `run-town-eight-winds.md` and are not repeated here; this file records what is different about these five.

## F-EW-3 — the inherited row map for the three `-a` sheets is wrong, and it saved six generations

`reviews/anim-pass-2026-07-25.md` §M3.5 (F-M3-3) records the preacher / schoolteacher / assay clerk `-a` sheets as `s / sw / w / nw` and concludes: *"their union covers `s, sw, w, nw, n` and contains no east frame, so there is nothing to graft from."* §1 (F-A1) says the same in the other direction: *"STILL OWED: an east row (row 2 faces west)."*

**Row 2 of all three `-a` sheets is an EAST-facing profile.** Read at 820–900 px per cell:

| sheet | row 2 at magnification | evidence |
|---|---|---|
| `char-preacher-sheet-walk8-a` | pure profile, hat brim / nose / beard / leading boot all to the **screen right** | `../crops/ew-preacher-r2.png` (left tile) |
| `char-assay-clerk-sheet-walk8-a` | pure profile facing **screen right** | `../crops/ew-abc-r2-decide.png` (middle) |
| `char-schoolteacher-sheet-walk8-a` | pure profile facing **screen right** | `../crops/ew-abc-r2-decide.png` (right) |
| `char-preacher-sheet-walk8-b` | pure profile facing **screen left** — the true west row, on the B sheet as F-M3-3 says | `../crops/ew-abc-r2-decide.png` (left) |

This is not my reading against theirs: **the predecessor's own crop shows it.** `reviews/anim-pass-2026-07-25/crops/m3-a-partners-rows.png` renders all three `-a` sheets row by row, and column 2 shows all three facing screen-right. The written conclusion and the image on disk disagree, and the image is right.

`src/town/TownScene.ts:2511` maps `e|se|ne → row 2` and east is screen-right, so **row 2 of these three is CORRECT against the contract.** The corrected picture:

| row | contract asks for | art actually draws | verdict |
|---|---|---|---|
| 0 | s | s | ✅ correct |
| 1 | w | **sw** | 45° off |
| 2 | e | **e** | ✅ correct — not 180° wrong, and not missing |
| 3 | n | **nw** | 45° off |

The true `-a` order is `s / sw / e / nw`; `-b` stays `n / nw / w / sw`. Their union covers `s sw e nw n w` and is missing exactly **se and ne** — which is precisely what this batch generated. Two consequences worth the ink:
- **Six generations were not spent.** sw and nw already exist as shipped art, so they are lifted byte-for-byte instead of regenerated; only se and ne were bought.
- **A future session will not spend three more.** "Generate an east row for the three town actors" is on the record as owed work in two places in the previous review. It is not owed. It exists.

What *is* owed for these three is unchanged and is not diagonal work: rows 1 and 3 sit 45° off what `directionRow()` asks of them. Once the diagonal siblings are bound, that stops mattering — a resolver that can address `sw` and `nw` directly no longer needs row 1 to be west.

## Composition — lifted rows are byte copies, not re-renders

`anim-pass-diag.mjs --copy-row` copies the base cells into the sibling **byte-for-byte**: no rescale, no reseat, no resample. A lifted wind cannot drift from the art the game already ships, and the `0.0% / -1.0% / -0.3%` drift figures below are therefore measuring only the two generated rows in each sheet.

| sheet | sw | se | nw | ne |
|---|---|---|---|---|
| `char-preacher-sheet-walkdiag4-a` | lifted, base row 1 | generated | lifted, base row 3 | generated |
| `char-schoolteacher-sheet-walkdiag4-a` | lifted, base row 1 | generated | lifted, base row 3 | generated |
| `char-assay-clerk-sheet-walkdiag4-a` | lifted, base row 1 | generated | lifted, base row 3 | generated |

These three keep **4 frames**, matching their base. The task allows extending to 8 "if craft allows"; it is refused here on purpose, because a sheet whose two lifted rows are 4-frame and whose two generated rows are 8-frame would animate at two different cadences depending on which way the actor walked.

## F-EW-4 — the Prospector needed a size correction the walkers did not

Every walker landed inside its base band on the first composition. The Prospector did not: **−6.0% wide and −6.3% short**. The cause is in the seating rule. `anim-pass-diag` matches FOOT-LINE heights — the lowest scanline carrying a run of ≥12% of the figure's width — which for a hovering machine is the bottom of the *body*, because the jet plume is too narrow to qualify. `extract-alpha`'s bbox, however, swallows the plume. Matching bodies therefore did not match shipped cells.

Width and height drifted by the same 6%, so this was a real shrink of the machine and not a plume artefact — the companion would have lost 6% of itself every time it turned 45°, which is exactly the size-pop the s21 rotation note tells this repo to watch for. Fixed with `--scale-mul 1.065`, a knob added for this case and used **only** here: re-measured drift **0.0%** (median 208 against the base's 208). Walkers use no multiplier.

## Measured self-QA

<!-- generated by scripts/anim-pass-windtable.mjs — do not hand-edit -->

| sibling sheet | base | dims / grid decl·art | cells @scale | base height band | composed heights | drift | components / crossing a cut | key bg% / halo% | dup flagged→real |
|---|---|---|---|---|---|---|---|---|---|
| `char-preacher-sheet-walkdiag4-a` | `char-preacher-sheet-walk8-a` | 1120x1360 / 4x4·4x4 | 16/16 @1 | 281-302 (med 298) | 293-303 (med 298) | **0.0%** | 16 / **0** | 75.54 / 0.339 | 0→0 |
| `char-schoolteacher-sheet-walkdiag4-a` | `char-schoolteacher-sheet-walk8-a` | 1120x1360 / 4x4·4x4 | 16/16 @1 | 300-336 (med 311) | 300-315 (med 308) | **-1.0%** | 24 / **0** | 74.54 / 0.433 | 0→0 |
| `char-assay-clerk-sheet-walkdiag4-a` | `char-assay-clerk-sheet-walk8-a` | 1120x1360 / 4x4·4x4 | 16/16 @1 | 313-318 (med 317) | 308-318 (med 316) | **-0.3%** | 19 / **0** | 73.58 / 0.419 | 0→0 |
| `char-prospector-sheet-hoverdiag8` | `char-prospector-sheet-hover8` | 2240x1360 / 8x4·8x4 | 32/32 @1 | 185-219 (med 208) | 172-250 (med 208) | **0.0%** | 39 / **0** | 75.45 / 1.141 | 9→0 |
| `char-hero-sheet-walkdiag8` | `char-hero-sheet-walk8` | 2240x1360 / 8x4·8x4 | 32/32 @1 | 313-327 (med 322) | 315-325 (med 321) | **-0.3%** | 34 / **0** | 75.67 / 0.798 | 0→0 |

## Facing and props by eye at magnification

| sheet | facing 4/4 | prop tracking | evidence |
|---|---|---|---|
| hero | ✅ | ✅ **4/4 on BOTH props** — gold pan in the RIGHT hand (screen left in sw/se, screen right in nw/ne) and satchel on the LEFT hip (screen right in sw/se, screen left in nw/ne) | `../crops/ew-prospector-props.png` bottom row |
| assay clerk | ✅ | ✅ 4/4 on both — ledger in the LEFT hand, pen in the RIGHT, across lifted and generated rows alike | `../crops/ew-abc-winds.png` bottom row |
| preacher | ✅ | ✅ book in the LEFT hand in all four (occluded by the coat in nw) | `../crops/ew-abc-winds.png` top row |
| schoolteacher | ✅ | ✅ satchel on the LEFT hip; chalk hand consistent | `../crops/ew-abc-rows13.png`, sheet rows |
| Prospector | ✅ (see residual) | ✅ 4/4 — assay pan on the LEFT arm, gripper claw on the RIGHT | `../crops/ew-prospector-props.png` top row |

The hero is the strongest result of the pass: two independent asymmetric props, both tracking correctly through all four winds, on a character with a base sheet that already had the same two props in the same places.

**Residuals, stated:**
- The generated **se** frames for the preacher and the assay clerk read as a *shallow* south-east — closer to south than to a true 45°. Their sw counterparts (lifted, hand-drawn) are steeper. Not retaken: the facing is unambiguously right-of-south and the props are correct, and the honest cost of a retake is better spent on the enemy rosters.
- The **Prospector is close to rotationally symmetric**, so its "three-quarter front" vs "three-quarter back" reads through the porthole eye and the arms rather than through a face. The north winds do show the rear aspect (vent grille rather than the big porthole), but this is the weakest facing evidence in the pass and is reported as such.

## The hero four ages — a finding, not a batch

`char-hero-{claimday,midlife,silver,elder}-sheet-walk4-{a,b}` were in scope as "the hero four ages". **They need no generation: they already carry all eight winds.**

The `walk4-a/b` hemisphere convention puts `s / se / e / ne` on the A sheet and `n / nw / w / sw` on the B sheet, and the previous review measured these eight sheets without ever eyeballing their row order. Row 1 at thumbnail size is genuinely ambiguous — my own first read had silver and elder in the *west* hemisphere. The decisive instrument is the pure profile in **row 2**, which cannot be misread:

`../crops/ew-age-profiles.png` — ten tiles, row 2 column 0 of every age sheet plus the main hero's `walk4-a-f`/`-b-f` as the control. **All five `-a` sheets face screen-right (east); all five `-b` sheets face screen-left (west).** So every age sheet follows the same convention as the live hero walk4 block, and the four ages have explicit `se / ne / nw / sw` art today.

No sibling sheet was built for them, deliberately. Duplicating art that already exists creates a second source of truth for the same pixels and a maintenance trap. The wiring spec binds them where they are.

## Gates
`npx tsc --noEmit` rc=0 · `npm run build` rc=0, asset-diet clean · no `src/` file touched · no existing sheet modified.
