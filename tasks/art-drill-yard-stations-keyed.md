# art-drill-yard-stations-keyed — the three yard props need a key, or they can never be sprites
**FIRE-AUTHORED (attended review welcome)** — s1447, from a measurement taken this fire.

SLOT: art. WORKDIR: the art slot. Three files. One batch.

Style anchor (verbatim in every prompt): "engraved frontier illustration, warm sepia and umber, painted-storybook game prop, the Gold Rush plate style — never photoreal, no letters or numerals."

## WHY
All three Drill Yard station props are ACCEPTED on canon (LEDGER row 70, 3 of 3 after the
s1446 retake `90f938ad`) and **cannot be consumed by the wiring that is already on main.**

The consumer shipped at `646e2d31` (s1437, `lane-drill-yard-affordances`) and is dormant:
`src/game/DrillYard.ts:11-15` eagerly globs `../../assets/processed/prop-drill-faucet-station.png`,
`prop-drill-bell-post.png` and `prop-straw-man-stand.png`; `applyStationArt()` at
`src/game/DrillYard.ts:353` bails silently when the url is missing (`:355`), and on success builds
`new THREE.SpriteMaterial({ map: texture, transparent: true, alphaTest: 0.04, depthWrite: false })`
(`:363`) and then **hides the procedural station geometry** (`:365`).

**So the consumer needs a cut-out sprite with an alpha channel. The art was commissioned full-bleed
and opaque.** Measured s1447 on the raws themselves, not inferred:

| file | size | alpha channel | px with alpha<250 | border RGB spread |
|---|---|---|---|---|
| `prop-drill-faucet-station.png` | 1254×1254 | **NO** | **0** | 43,53,57 |
| `prop-straw-man-stand.png` | 1254×1254 | **NO** | **0** | 54,57,50 |
| `prop-drill-bell-post.png` | 1254×1254 | **NO** | **0** | 35,41,38 |
| `assets/raw/prop-baron-banner.png` (the one working precedent) | 1254×1254 | **YES** | many | **0,0,0 — exactly 255,0,255** |

The precedent is exact: same slot, same generator, same native 1254×1254, and it extracts to
`assets/processed/prop-baron-banner.png` (384×384 RGBA). **The only differing variable is the
background.** The baron banner was generated on flat `#ff00ff`; these three were generated on a
painted *"square full-bleed warm parchment-and-dirt ground"* with magenta explicitly forbidden in
every prompt's hard-constraints line (`assets/raw/codex-art-run-art-drill-yard-stations.md:43,56,69`).

`scripts/extract-alpha.mjs` keys a **flat chroma background by border flood-fill** at `--tol 26`
(header, lines 5-11). The measured border spread here is **35–57 per channel — roughly twice the
tolerance — and there is no key colour to name anyway.** `--full-bleed` skips keying entirely and
only resizes, which would emit an opaque RGBA square: each station would then become a ~3.4-unit
**opaque parchment billboard** with the procedural prop hidden behind it — strictly worse than the
placeholder that ships today.

**This is an art-contract/consumer-contract mismatch, not a bad render.** The request reused the
*contract-plate* convention (full-bleed, no magenta — correct for `plate-contract-e1-drill-yard.png`,
LEDGER row 69, which is drawn into a UI card) for something the code consumes as an *in-world
sprite*. Nothing is wrong with the drawings; the ground under them is wrong.

## READ-FIRST
- `assets/LEDGER.md` row 70 — the split verdict, the retake note, and "wiring remains the lane's"
- `assets/raw/codex-art-run-art-drill-yard-stations.md` — the three original prompts (lines 41-69)
  and the retake prompt (lines 99-101). **Reuse their subject wording verbatim.**
- `assets/raw/prop-baron-banner.png` — **open this one.** It is the target background treatment:
  a flat `#ff00ff` field with the prop sitting on it and generous padding all round.
- `src/game/DrillYard.ts:353-372` — the consumer you are feeding. Read it so you know why the
  alpha matters and why an opaque square is not acceptable.
- All three current raws — look at them before you touch them; the subjects are ACCEPTED and the
  bell post cost two retakes to clear a canon rejection.

## SCOPE
1. Produce a **`#ff00ff`-keyed version of each of the three props**, overwriting in place:
   - `assets/raw/prop-drill-faucet-station.png`
   - `assets/raw/prop-straw-man-stand.png`
   - `assets/raw/prop-drill-bell-post.png`

   Overwriting loses nothing: the accepted bytes are already in git history (`0c71b5ba` for the
   two, `90f938ad` for the bell post), which is where the RETENTION LAW keeps them.

2. **PREFER AN IMAGE-EDIT OF THE EXISTING FILE OVER A REGENERATION.** This is the important
   instruction in this master. Edit each accepted image so that **only the ground changes**: the
   painted parchment-and-dirt field is replaced by a flat, uniform `#ff00ff` field, and the prop
   itself — every line, proportion, colour and shadow — is preserved. CLAUDE.md §8's consistency
   law already prefers edits; here there is a second, sharper reason:

   ⚠️ **A from-scratch regeneration risks re-introducing the two canon defects this batch already
   paid for.** `prop-drill-bell-post.png` was REJECTED at s1445 as a **gallows** (F-1445-4) and
   took two retakes to clear; `prop-straw-man-stand.png` only passed because it carries **no head,
   face, limbs or human anatomy** (the effigy read, brief §9). Those properties are held by the
   current pixels. Do not re-roll them for a background change.

3. **Keep the prop's own footprint away from the frame edge** — generous padding of flat key on all
   four sides, so `extract-alpha.mjs`'s border flood-fill reaches the whole background. Keep
   1254×1254 RGB(A), the engraved warm sepia/umber finish, the palette, the elevated
   three-quarter gameplay camera, and the bold 96px-readable silhouette.

4. **Do not let magenta touch the subject.** No magenta rim-light, no magenta bounce on the prop's
   shadow side, no magenta inside enclosed gaps you intend to keep opaque. (Enclosed background
   pockets — e.g. the space framed by the bell yoke's two uprights — SHOULD be flat key so they
   cut out; say in your report which pockets you keyed.)

5. **FALLBACK, only if editing cannot produce a flat field after 2 attempts on a given file:**
   regenerate that file from scratch **using the current accepted image as the visual reference**,
   and carry these constraints verbatim into the prompt —
   - bell post: *"compact symmetric two-upright yoke, short non-projecting top crossbar, centered
     aged-bronze bell, visible clapper, rope coiled tight against the upright; no one-sided post,
     cantilever, projecting beam, scaffold shape, rope in open air, dangling cord, terminal loop,
     loop-shaped rope, or hanging imagery"*
   - straw target: *"preserve the simple cylindrical bundle and broad braced base; no head, face,
     limbs, clothes, hat, human anatomy, scarecrow, effigy, victim, or hanging imagery"*
   - all three: *"no people, text, letters, numerals, pseudo-writing, labels, signs, logos,
     watermark, firearms, weapons, gore, photorealism, decorative border, or additional scenery"*
   **State clearly in the run file which files were edited and which were regenerated.**

6. Update `assets/raw/codex-art-run-art-drill-yard-stations.md` with a KEYED section: per file, the
   new SHA-256, dimensions, mode, the measured table below, and the exact prompt used.

## SELF-QA (measured — and the measurement IS the acceptance criterion)
The thing that failed last time was a background property no one measured. So measure it directly,
per file, and put the numbers in the run file:

- **BORDER FLATNESS — the decisive number.** Sample the outermost ring of pixels and report
  min/max RGB per channel. **It must be exactly `255,0,255` with spread `0,0,0`**, matching
  `assets/raw/prop-baron-banner.png`. Any spread means the field is not flat and the extractor
  will not key it cleanly — **that is a fail, retake.**
- **Exact `#ff00ff` count.** It was **0** on all three; it must now be a large fraction of the
  frame. Report the count and the percentage.
- **No `#ff00ff` pixel inside the prop's own silhouette** (other than deliberately keyed enclosed
  pockets, which you must name). Magenta on the subject becomes a hole.
- **THE SUBJECT IS UNCHANGED:** put the pre-edit and post-edit versions side by side at full size
  and state in one sentence, per file, that the prop's geometry and palette are the same drawing.
- **THE GALLOWS CHECK, carried forward from the retake and answered in words, not a tick:**
  describe the bell post's silhouette in one sentence as a stranger would read it at 96px. If
  "scaffold", "gallows", "noose" or "hanging" can honestly be applied, **it fails — retake.**
- **THE EFFIGY CHECK:** confirm the straw target still has no head, face, limbs, clothes or human
  anatomy.
- Canon (brief §9): no firearms or weapons, no people, no gore, no letters/numerals/pseudo-writing.

## FIREWALL
TOUCH-ONLY: the three `assets/raw/prop-drill-*.png` / `prop-straw-man-stand.png` files ·
`assets/raw/codex-art-run-art-drill-yard-stations.md` · `assets/LEDGER.md` (row 70 keyed note).
NO: **no extraction and no processing** — do not run `extract-alpha.mjs` and do not write anything
into `assets/processed/` (extraction is fire-side, CLAUDE.md §8, and the drain does it) · no
`src/**` (in particular **do not edit `DrillYard.ts`** — the wiring is correct and already merged;
it is the art that must meet it) · no specs · no e2e · no contract JSON · no other art batch ·
no commits.

## NO-OP GUARD
If you are about to exit without changing the three files, **write why into your report first** —
a silent no-op wastes a queue slot and a gate.

READY-FOR-GATES + report: the per-file measured table (border min/max RGB and spread, `#ff00ff`
count and %, SHA-256), which files were EDITED vs REGENERATED, which enclosed pockets you keyed,
the gallows check and the effigy check answered in words, and a one-line verdict on whether the
three still read as one set beside `plate-contract-e1-drill-yard.png`.
