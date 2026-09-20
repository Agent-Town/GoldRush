# needs-cells-codex-strips — the processing drain

**Slice** `art-needs-cells-codex-strips` (ART slot, main) · **done-move** `tasks/done/20260918-205411-art-needs-cells-codex-strips.md` · **drained** s2627, 2026-09-18 · **base** `ad387cbbf`

## Verdict

**LANDED 5 of 7 facings (20 cells), PARKED 2, WIRING DEFERRED BY DESIGN.** The Claim Jumper's `s`, `e`, `sw`, `ne` and `nw` walk rows are processed into `assets/processed` at the family's own measured band. The Claim Jumper's `se` is parked on intra-sheet height spread (F-2627-2) and the Steam Wrecker's `se` on scale (F-2627-1). No contract is rewired: the slot is runtime-dormant and the master says so in its own words (F-2627-3).

## What it does

The ART slot generated seven 1024×1024 2×2 sheets on Codex `image_gen` on 2026-09-18 (13:54–14:18Z) and its self-QA **parked all seven**. Its three bars were exact `#ff00ff` field purity, one foot line across both grid rows, and a 12-px height spread. The goal leaf recorded that park as a `gate-side` hold whose lift condition is *processing* — extract at the standard key tolerance, scale per row to the band, halo guard, LEDGER — and this drain executes exactly that. Two of the seven turn out to fail for reasons processing genuinely cannot reach, and they stay parked with measured numbers.

## Evidence

Extraction, identical for all six jumper sheets but for `--scale`:
`node scripts/extract-alpha.mjs --key ff00ff --tol 26 --feather 14 --grid 2x2 --cell 256 --scale <s> --out assets/processed`

**The band is MEASURED from the landed references, not taken from the task.** `char-jumper-sheet-walk4-b` rows 0 (north) and 2 (west) — the two rows this batch was told to match — are **146–156 px in a 256 cell (57.03–60.94 %)**, footY 200–205. The task master's stated band of 61–67 % does not describe the art that actually landed; the references are the truth, because the law that matters here is s37 anti-size-pop against the neighbours.

| facing | scale | heights px (256 cell) | mean | spread | footY range | band 146–156 | verdict |
|---|---:|---|---:|---:|---:|---|---|
| `s` | 0.4305 | 150, 146, 152, **158** | 151.5 | 12 | 6 | one cell +2 | **LANDED** |
| `e` | 0.4887 | 152, 150, 152, 152 | 151.5 | 2 | 1 | in band | **LANDED** |
| `sw` | 0.4719 | 152, 146, 152, 156 | 151.5 | 10 | 5 | in band | **LANDED** |
| `ne` | 0.4682 | 151, 148, 152, 152 | 150.8 | 4 | 2 | in band | **LANDED** |
| `nw` | 0.4604 | 150, 146, 152, 156 | 151.0 | 10 | 5 | in band | **LANDED** |
| `se` | 0.4760 | 144, 150, 150, **160** | 151.0 | **16** | 8 | two cells out | **PARKED** (F-2627-2) |
| wrecker `se` | 1.0 (max lawful) | 216, 220, 224, 230 | 222.5 | 14 | 7 | band 228–252 | **PARKED** (F-2627-1) |

**Cross-facing means: 150.8–151.5 px, a 0.7 px spread across all five landed facings** against a reference mean of ~150. There is no size-pop between the new rows and the two that landed on 2026-09-18.

**The three bars the runner parked on, re-measured after processing.** *Field purity*: the keyer took 84.1–85.9 % of each sheet with 2,373–3,255 spill-cleared and 4,790–5,478 despilled pixels — the ~210k–238k "near-not-pure" pixels per cell the runner counted are exactly what `--tol 26` plus the hue-targeted despill exist to absorb. *Foot line*: after bbox-centring, footY range within a sheet is **1–6 px** for every landed facing, where the runner measured 23–55 px on the raw grid. *Height spread*: 2–12 px for the five landed, i.e. inside the task's own 12-px bar.

**Halo, measured rather than assumed** (`assets/processed`, 20 landed cells): 1,151,824 pixels carry alpha < 250 and **0 of them carry magenta-dominant RGB** (`r ≥ 180 && b ≥ 180 && g ≤ 90`). Worst single cell 0 px. The post-s1449 extractor's alpha bleed is doing its job, so no cell can average its own key back in under bilinear filtering.

**Gates.** `npx tsc --noEmit` rc=0, no output · `npm run build` rc=0, `✓ built in 1.69s` · `scripts/character-direction-assets.test.mjs` **2/2** (contract direction files exist; aliases do not overwrite explicit directions) · halo residue 0/1,151,824 as above.

## Merge classification

Main-slot art work, committed path-scoped to `main` — there is no lane branch and nothing is merged. Files added: 20 cells + 5 `.frames.json` under `assets/processed/` (1.37 MB), 7 raws under `assets/raw/` (7.44 MB). Nothing under `src/`, no contract edited, no existing asset touched. The two parked facings' processed output was **withdrawn** before commit (10 artefacts) so that no knowingly-failing cell lands; their raws are retained under `-parked` names, preserving the runner's own verdict in the filename.

The art staging tree was left byte-untouched: extraction read from `/tmp/s2627-raws/` copies, never from `worktrees/art/`.

## Findings

**F-2627-1 — the Steam Wrecker's `se` is parked a THIRD time, and for the first time the reason is not the lamp.** LEDGER row 67 parked it in 2026-07 after three attempts, and F-NCB-2 parked it again on 2026-09-18, both because the amber porthole lamp would not stay lit across four cells. **The lamp now passes**: 137 / 141 / 115 / 129 px of lit blob, all four above the 90-px bar. The blocker is now purely SCALE. Measured on my own extraction at `--scale 1.0` (the maximum the extractor allows): **216/220/224/230 px against the family's landed 246–248**, requiring a **×1.079 upscale**. `sliceGrid` caps scale at 1 by construction, and the `char.claim_jumper` contract note independently refuses the same act in the same words — *"source cells are 313x418 so native size caps there and upscaling is refused (linework quality)"*. The sheet is 1024² with a 2×2 grid, so each cell is 512 px of source and there is no more resolution to spend; the native 1254² take was normalised away before the sheet was written. **Cure: regenerate at a larger native cell (the rotation2 pattern the contract note already prescribes), not another 1024² 2×2 sheet.** A fourth identical retake would fail identically.

**F-2627-2 — the Claim Jumper's `se` fails on intra-sheet spread, which no pipeline transform can fix.** Source heights 315/303/313/338 px: the generator drew phase 4 about 11 % taller than phase 2. Grid mode applies **ONE shared scale across the four cells on purpose** — *"so frames don't breathe"* — so the spread survives scaling proportionally, landing at 144/150/150/160 against a band 11 px wide. Per-cell scaling would flatten it and would manufacture exactly the breathing the shared scale prevents, so this is reject-don't-stretch: the one sheet needs a retake, not a transform.

**F-2627-3 — the five landed facings are UNWIRED, by design and not by omission.** `char.claim_jumper` is runtime-dormant until enemy code sends 8-way directions (M2-04); its rotations block still aliases `sw→se` and `nw→ne` and still carries a documented SCALE DEBT against the side-sheet walk rows. The master scopes this explicitly — *"Nothing draws that slot at runtime today (F-NCB-3), so its strips are placeholder-first art: generate them now, wire them when the slot wakes."* Landing the cells now is the placeholder-first law working: the art waits in `assets/processed` at the right band, costs nothing (nothing references it, so it does not enter the first-town payload), and the wiring is one follow-on task when M2-04 lands. **Owed: a wiring task that replaces the two mirrors with the true `sw`/`nw` rows and re-reads the scale debt against these new figures.**

**F-2627-4 — a generation runner measured RAW sheets against PROCESSED-cell bars, and parked 7 of 7 work items of which 5 were fine.** The three bars it parked on — exact key purity, a single foot line across both grid rows, and a cross-cell height spread — are all properties the *extractor* establishes, not properties the *generator* can deliver: keying absorbs the field, bbox-centring sets the foot line per cell, and the shared scale sets the heights. Measured here, the same sheets read 23–55 px of foot scatter before processing and 1–6 px after, and ~210k–238k impure field pixels before and a fully keyed field after. The runner was diligent and its numbers were all correct; it simply applied the wrong stage's acceptance test, and the honest consequence was a 7/7 park on a batch that is 5/7 good. **Reusable: when a task splits generation from processing across two agents, state which bars belong to which stage — an acceptance bar quoted in the wrong stage's self-QA converts good work into a park, and the park then reads as a quality verdict rather than as a staging artefact.** This drain's goal leaf anticipated exactly this (*"PARKED all seven on bars the pipeline handles"*), which is why the hold was recorded as `gate-side` rather than as a failure.

**F-2627-5 (minor, owed) — the 20 landed cells are not lossless-re-encoded.** The previous batch's zopflipng pass recovered 9,676,796 → 4,879,950 B for zero changed pixels. `zopflipng`, `oxipng` and `pngcrush` are all absent from the fire shell (`which -a` → not found), so the pass could not run here. The cells are 1.37 MB and do not ship today (nothing references them), so nothing is urgent; fold the re-encode into the wiring task of F-2627-3, when the bytes first start to matter.
