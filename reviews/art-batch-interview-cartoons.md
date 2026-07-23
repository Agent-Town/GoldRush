---
source: claude-code
project: Gold Rush
date: 2026-07-23
type: art-drain-review
---

# Review — art-batch-interview-cartoons (THE ANNOUNCEMENT CARTOONS)

**Slice/batch:** art-batch-interview-cartoons — the co-founder interview, drawn (ART SLOT, OWNER-PRIORITY)
**Drained by:** s952 fire · 2026-07-23
**Base:** main `96e31202` (raws sat uncommitted in `worktrees/art/assets/raw/`; done-move `tasks/done/20260723-115847-art-batch-interview-cartoons.md`)

## Verdict — ACCEPT (land raws as marketing collateral; owner publication approval still required)

Nine full-bleed marketing cartoon panels of the co-founder interview. This is a **marketing raw** batch (like the `mkt.*` and `kit.valley_master` LEDGER rows): NO extraction, NO processing, NO in-game wiring — the panels land in `assets/raw/` as `PENDING-THREAD-STAGING`, and the attended session stages them (with captions) into the interview thread. Publication stays owner-only.

## What it is
One panel per interview exchange (nine, per owner directive: "not too many images for each question/answer pair, but cover everything important"). Robin (warm human gentleman-prospector) and Fable (the round brass Prospector agent machine) appear as equals in every panel. The set narrates the factory, the storybook saga, the Calculating House, the freed-walker mission, the frontier release, the Trail of Eras, and a sign-off.

## Evidence — measured QA (independent, this drain)

| # | Dims (`file`) | Letters/numbers | Both cast on-model | Palette | Scene beat | Verdict |
|---|---|---|---|---|---|---|
| 01 sit-down | 1672×941 | none (pan pictogram bubbles) | Robin human / Fable brass | warm+teal | hand-to-pan, candle row, ledger stacks | PASS |
| 02 factory | 1672×941 | none (pictogram board) | ✓ / ✓ | warm+teal | sequenced fire-lanterns, four ore-cart lanes | PASS |
| 03 storybook | 1672×941 | none | ✓ / ✓ | warm+teal | ten era smoke-vignettes rise from the book | PASS |
| 04 Calculating House | 1672×941 | none | ✓ / ✓ | warm+teal | teal dial (ADR-003), brass made-minds emerge | PASS |
| 05 riding together | 1672×941 | none | ✓ / ✓ | moonlit warm+teal | crossed-pans banner, freed walkers over ridge | PASS (F-1) |
| 06 frontier release | 1672×941 | none (blank ticket/sign) | ✓ / ✓ | warm+teal | E1 lit + 9 misty future silhouettes, bellows cam | PASS (F-2) |
| 07 Trail of Eras (signature) | 1672×941 | none | ✓ / ✓ | warm→teal→red→star | one road, ten era-stations, pair walks small | PASS |
| 08 what it's for | 1672×941 | none | ✓ / ✓ | golden warm | Fable heart-dial, elder guides child at wheel | PASS |
| 09 sign-off | 1672×941 | none | ✓ / ✓ | golden dusk | hat/pan tipped to reader, pan-heart bubble | PASS |

- Dimensions confirmed via `file` on the landed copies (all nine 1672×941 RGB, incl. panel 06 after the run's one-pixel width normalization).
- Codex run note (`assets/raw/codex-art-run-art-batch-interview-cartoons.md`) supplies per-panel SHA-256, mean-luminance/edge-SD measurements, prompt set, native job dir `019f8d57-2b7e-7ae0-8714-0206cb96b239`, and caption suggestions. Its PASS verdicts match my independent full-res + thumbnail inspection.
- Canon (CLAUDE.md §9 / brief §9): no firearms (ADR-001) ✓; illustrated warm, never gory ✓; freed walkers depicted warmly and with dignity, never as enemies/peoples ✓; the agent is "the Prospector"/Fable, drawn as the brass machine, never humanoid ✓; agents originate at the Calculating House with the teal dial (ADR-003) ✓; ten-era saga content accurate ✓.

## Findings (both non-blocking; owner-review welcome)
- **F-1** — panel 05 renders Robin and Fable side-by-side rather than literally "back to back" as the master worded it. Composition still reads (shared crossed-pans banner between them, freed walkers leaving over the ridge). Non-blocking; owner may request a redraw if the back-to-back framing matters for the thread.
- **F-2** — panel 06 carries one empty speech bubble instead of an object pictogram. Still zero letters, canon-safe. Non-blocking.

## Merge classification
Pure additive marketing raws — no source, no processed output, no existing file touched. Landed onto clean main (`96e31202`) via `cp` from the art worktree, path-scoped `git add` of the nine PNGs + run note + LEDGER + this review. No conflicts possible (all new paths). No gameplay code changed → no gazette item (GZ-01 filter = player-visible in-game change; this is marketing collateral) and no deploy.

## Owner's desk
- Publication approval for the interview cartoons + captions (stage into the co-founder interview thread). Captions are in the run note, staging-only, not baked into images.
- Optional: F-1 back-to-back redraw of panel 05 if desired.
