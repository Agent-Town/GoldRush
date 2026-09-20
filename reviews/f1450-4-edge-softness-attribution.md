# F-1450-4 — attributing the Baron banner's `partial` 1845 → 121 edge-softness delta

**Slice:** F-1450-4 corrective (fire-side investigation, no code merge)
**Fire:** s1464 · **Date:** 2026-08-05
**Verdict:** ✅ **F-1450-4 CLOSED — the delta is ATTRIBUTED, and the finding's own premise is REFUTED.**
**Evidence:** `artifacts/f1450-4/` (probe, control battery, byte-level verifier, class sweep, comparison board)

---

## What it does

F-1450-4 recorded that `assets/processed/prop-baron-banner.png` measured `partial=1845`
when produced 2026-07-08 (`778cb197`) and `partial=121` when re-extracted 2026-08-04
(`77a22fc5`), and credited the difference to *"accumulated extractor drift across
[weeks and] many extractor revisions"*. Its gate: **"closes when a same-extractor
control attributes the `partial` delta, or an attended eye rules the edge-softness
change a non-issue at play scale."**

This is that control. It runs the arm the finding asked for, and three more.

## The premise, measured before any arm ran

| question | measured |
|---|---|
| extractor revisions between the two extractions | **exactly ONE** — `d2e69801` |
| what `d2e69801` changes | **pure addition** of `bleedEdges` + 2 call sites + log strings |
| alpha-affecting code changed in it | **none** |

`git log 778cb197..77a22fc5 -- scripts/extract-alpha.mjs` returns one commit, and it is
the bleed cure itself. So *"many revisions"* is false, and the two extractions were
produced by an extractor that is **alpha-identical**. The delta cannot be extractor
drift — which means it had to be something the finding never considered.

## The control battery

All arms extract from `assets/raw/prop-baron-banner.png`; nothing writes to `assets/`.

| arm | recipe | transparent | **partial** | opaque | key-RGB under α0 |
|---|---|---|---|---|---|
| shipped OLD (`778cb197`) | *unknown, 2026-07-08* | 85900 | **1845** | 59711 | 84770 |
| shipped NEW (`77a22fc5`) | current, `--size 384` | 86725 | **121** | 60610 | 0 |
| **A** | current extractor `--size 384` | 86725 | **121** | 60610 | 0 |
| **B** | pre-bleed extractor `--size 384` | 86725 | **121** | 60610 | 85609 |
| **C** | current, `bleedEdges` **stubbed** | 86725 | **121** | 60610 | 85609 |
| **D** | current, default 1024 → downsample 384 | 85900 | **1845** | 59711 | 0 |
| **E** | pre-bleed, default 1024 → downsample 384 | 85900 | **1845** | 59711 | 84770 |

Byte-level, not histogram-level (two counts agreeing is not the same set):

- **Q1 — does `bleedEdges` move any alpha?** A vs B: `alphaDiffPixels: 0`, `maxAlphaDelta: 0`,
  `rgbDiffPixels: 86725`. It rewrites RGB under exactly the transparent count and touches
  **zero** alpha. The docstring's "bit-for-bit the same shape" is now proven **by execution**.
- **Q1b — is the stub faithful?** C vs B: byte-identical (`d5a7d8e9…`). The arm F-1450-4
  asked for is a sound instrument, not an approximation.
- **Q2 — is the OLD file's alpha a downsample?** shipped OLD vs D: `alphaDiffPixels: 0`.
- **Q3 — full provenance reconstruction.** **ARM E is BYTE-IDENTICAL to the 2026-07-08
  shipped file** — `923f0acf4e6cb6004fac6c095d3c481373dc9de6211b1859db76b1905078ddc2`,
  both. The original production pipeline is *reconstructed*, not modelled.
- Reference: **A is byte-identical to shipped NEW**, so s1450's re-extraction reproduces exactly.

## The attribution

**The `partial` 1845 → 121 delta is a RESAMPLING-PROVENANCE artifact. It has nothing to
do with any extractor revision, and nothing to do with `bleedEdges`.**

- The 2026-07-08 file was keyed at the **default 1024** — which is exactly the bare
  `--key ff00ff` recorded at `tasks/lane-b-baron-presence.md:9`, the command s1450 read
  and then set aside because the artifact measured 384 — and **then downsampled to 384**.
  Bilinear downsampling blends α0 against α255, *manufacturing* partial pixels: 869 at
  1024 becomes 1845 at 384.
- The 2026-08-04 file was keyed **directly at 384**, so its only partial pixels are the
  extractor's own feather ramp: 121.

s1450's qualitative observation was right — the edge really did get harder — but the
cause is the recipe changing from two-step to one-step, not code drift. The 384 it
recovered from the artifact was correct as a *description of the output size* and
misleading as a *reconstruction of the command*.

## Confirmed by looking (F-1446-1)

`artifacts/f1450-4/edge-comparison-board.png` — 8× over the 48×48 window carrying the most
partial pixels (60,296), composited over a checker (top row) and as raw alpha (bottom row):

- **OLD** — the banner pole carries the **bright magenta fringe** down its left side. The
  F-1449-3 defect, plainly visible.
- **NEW (shipped)** — magenta gone, but a **residual hard dark rim** sits where the fringe was:
  despill neutralises the magenta, and at 384 each fringe pixel is a whole final texel.
- **D** — magenta gone **and** the dark rim is far softer; the staff reads as wood.
  Its alpha is byte-identical to OLD by construction.

## Findings

- ✅ **F-1450-4 — CLOSED.** Gate branch 1 satisfied: a same-extractor control attributes
  the delta. `bleedEdges` is exonerated by execution (0 alpha pixels moved); the extractor
  is exonerated (one intervening revision, a pure addition); the cause is the resample recipe.
- 🔺 **F-1464-1 — the F-1449-1 halo is NOT cured across the shipped roster; s1450's "THE
  LAST KEYED SPRITE" claim is refuted.** `artifacts/f1450-4/halo-class-sweep.mjs` measures
  **1075 of 1314** PNGs under `assets/processed/` carrying >5% key-magenta under
  transparency. The runtime loads that tree directly (`src/ui/BuildButton.ts:6`,
  `src/ui/Hud.ts:13-14`, `src/ui/EraBackdrop.ts:3` — there is no `public/`), and two
  provably-loaded examples are bad: `char-baron-sheet-walk4-a-r0c0.png` — **the Baron
  portrait in the HUD** — at **55.63%** with **447** key texels touching visible art, and
  `ui-title-emblem.png` at **99.17%** with **1307**. Instrument validated by four negative
  controls (the four sprites extracted after `d2e69801`), all reading exactly **0.00% / 0**.
  **The cure at `d2e69801` fixed the extractor, which cures FUTURE extractions only —
  already-shipped sprites were never re-extracted.** The ledger currently records the class
  as closed, which is what would stop the next reader looking. Not a drive-by fix: a
  roster-wide re-extraction is a batch art operation with visual consequences, and it is
  gated on F-1464-2 below. **GATE: closes when the loaded roster is re-extracted against
  the cured extractor, or an attended eye rules the residual halo acceptable per sprite class.**
- 🟡 **F-1464-2 — the extraction recipe is unsettled, and it must be settled BEFORE any
  roster re-extraction.** Arm D (key at 1024, then downsample) is halo-free *and* keeps the
  historical edge softness; the current one-step recipe (`--size N` directly) is halo-free
  with a harder, darker rim. D looks better in the 8× board, but "better at 8× on a checker"
  is not "better in game": these sprites render at roughly a 1-unit billboard under
  `alphaTest`, where more partial pixels can erode thin features instead of softening them.
  **Unmeasured, and I did not guess.** **GATE: closes when an attended eye rules the recipe
  at play scale, or an in-game A/B measures it.** This is F-1450-4's second gate branch,
  which remains genuinely open — the attended eye was never the redundant option.

## Reproduce

```
node artifacts/f1450-4/run-controls.mjs        # arms A-D + histograms + sha256
node artifacts/f1450-4/verify-attribution.mjs  # Q1/Q1b/Q2/Q3 byte-level, arm E
node artifacts/f1450-4/edge-comparison.mjs     # the 8x board
node artifacts/f1450-4/halo-class-sweep.mjs    # roster sweep (F-1464-1)
node artifacts/f1450-4/halo-loaded-check.mjs   # negative controls + loaded samples
```

Custody: every arm writes under `artifacts/f1450-4/`; `assets/processed/` was never
written to, and `git status` shows it unmodified.
