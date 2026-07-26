# Task art-batch-prospector-coats-hover8: THE COATS AT THE CADENCE THE GAME ACTUALLY READS (ART SLOT, release)
**FIRE-AUTHORED (attended review welcome) — s1098, 2026-07-27. This is F-1098-2. The coats were already minted once, beautifully, at the WRONG CADENCE. Nothing here is a criticism of that art; it is the same art, re-cut to the grid the runtime requests.**

You are Codex with image_gen, running in the ART slot (`worktrees/art`).

CODEX: model=gpt-5.6-sol effort=high

> ⚠️ The `CODEX:` line above is at **column 0 on its own line** deliberately (F-1088-4 / F-1097-5). `scripts/lane-runner-v3.sh:65-66` greps `^CODEX:` and **silently falls back to `effort=medium`** on no match. The predecessor master `art-batch-prospector-skins.md` carries it **inline** and therefore ran at medium.

## WHY (measured by s1098, 2026-07-27 — every number below was read off disk, not inherited)

`art-batch-prospector-skins` ran 2026-07-26 and produced **four excellent sheets that the game can never load**:

| minted (merged to `assets/raw/`) | what the runtime asks for |
|---|---|
| `char-prospector-complainant-sheet-hover4-a.png` | `char-prospector-complainant-sheet-**hover8**-rNcM.png` |
| `char-prospector-complainant-sheet-hover4-b.png` | *(hover4 is never requested)* |
| `char-prospector-gilded-sheet-hover4-a.png` | `char-prospector-gilded-sheet-**hover8**-rNcM.png` |
| `char-prospector-gilded-sheet-hover4-b.png` | *(hover4 is never requested)* |

**The contract, traced end to end:**
1. `src/town/town-actor-sheets.json:11` → `"prospector": "char-prospector-sheet-hover8"`.
2. `src/game/ProspectorSkin.ts:162-164` → `prospectorSkinSheetFile()` rewrites `char-prospector-` to `char-prospector-<skin>-`.
3. `src/assets/SpriteAnimator.ts:894/901` applies that to the sheet's grid file and every frame file.
4. ✓ **`grep -rn "hover4" src/` returns ZERO hits.** The string `hover4` appears nowhere in the runtime. Only `hover8` does.

**Root cause, so it cannot recur:** the predecessor master specified its outputs as a **glob** — `char-prospector-complainant-sheet-*.png` — never an exact filename, and told the generator "cell-for-cell identical grids to the shipped sheets". Both `hover4-{a,b}` and `hover8` are shipped sheets, so Codex picked the A/B pair and was *not wrong*. `CLAUDE.md` §6 requires art batches to carry **"exact filenames + absolute paths"**; that bar is what this master honours and the predecessor did not.

**Player-visible consequence today:** `SpriteAnimator.ts:884` resolves
`walkSheetHasProcessedCells(skinned) && (await walkSheetLoads(skinned)) ? skinned : stock` — so a missing skin sheet **silently falls back to stock, with no error**. The Complaint Desk grants The Complainant's Coat, the wardrobe rack lists it, the player selects it, and the Prospector **looks identical**. ✓ Verified: `ls assets/processed | grep -c "gilded\|complainant"` → **0**.

**Owner authority (BACKLOG:1163, F-1081-8, verbatim):**
> "**RECOMMENDED, no owner ruling needed: mint hover8 coats as image-EDITs of the shipped `assets/raw/char-prospector-sheet-hover8.png`.**"

This master is exactly that sentence, with the numbers filled in. **No owner ruling is pending on it.**

## READ FIRST (in `worktrees/art`, before generating anything)

- `assets/raw/char-prospector-sheet-hover8.png` — **THE ONE AND ONLY EDIT BASE.** ✓ Measured: **2240 × 1360 px**, 1,973,728 bytes, on disk since Jul 9.
- `assets/processed/char-prospector-sheet-hover8.frames.json` — the authoritative grid: **`"cols": 8, "rows": 4`**, `"cell": 512`, `"scale": 1`, **32 cells, every one `"empty": false`**. The source division is **2240/8 = 280 px wide × 1360/4 = 340 px tall** per cell.
- `assets/raw/char-prospector-gilded-sheet-hover4-a.png` and `char-prospector-complainant-sheet-hover4-a.png` — **the approved COLOUR AND COSTUME language.** Do not re-invent the coats; these two were accepted on their design. You are re-cutting them onto the hover8 grid, not redesigning them.
- `assets/raw/codex-art-run-art-batch-prospector-skins.md` — the predecessor's self-QA, including the documented residual (the Complainant sash is a **screen-space** sash, matching the shipped sheet's screen-space pan convention). **Preserve that decision; do not "fix" it.**

## THE RULING (decided by measurement — do not revisit)

**Mint exactly TWO sheets, each a single 8×4 sheet, as image-EDITs of `char-prospector-sheet-hover8.png`.**
Not four. The hover8 sheet is **one** sheet of 32 cells (the hover4 generation was split A/B because *those* sheets are 4×4); hover8 needs no A/B split. Re-using the A/B habit here is the exact error being corrected.

## SCOPE (numbered; each item is checkable)

1. **`assets/raw/char-prospector-complainant-sheet-hover8.png`** — THE COMPLAINANT'S COAT. The brass Prospector wearing a clerk's teal ribbon + a compact stamped brown satchel; modest, charming, a civic thank-you. Match the accepted `char-prospector-complainant-sheet-hover4-a.png` costume language.
2. **`assets/raw/char-prospector-gilded-sheet-hover8.png`** — THE GILDED PROSPECTOR. Selective matte gold-leaf panels, aged dark-brass borders, stronger starstone-teal dial. Top-three prize; unmistakably special at gameplay zoom, **never gaudy-neon**. Match `char-prospector-gilded-sheet-hover4-a.png`.
3. Both sheets: **exactly 2240 × 1360 px, 8 columns × 4 rows, 32 cells**, `#ff00ff` flat background, **cell-for-cell identical** to the base in pose, facing, frame order, pan hand, hover flame, arm articulation and padding. **The silhouette is binding; only the cloth changes.**
4. **Style anchor — paste this sentence verbatim into every prompt:**
   > "Gold Rush house sprite: the brass Prospector agent re-dressed, engraved-warm frontier illustration, identical silhouette and grid, #ff00ff flat background, no letters, no gore."
5. Write the run file `assets/raw/codex-art-run-art-batch-prospector-coats-hover8.md` (front-matter + per-sheet measured QA table, same shape as the predecessor's) and add the two LEDGER rows.

## FIREWALL

**TOUCH-ONLY:** `assets/raw/char-prospector-complainant-sheet-hover8.png` (new) · `assets/raw/char-prospector-gilded-sheet-hover8.png` (new) · `assets/raw/codex-art-run-art-batch-prospector-coats-hover8.md` (new) · `assets/LEDGER.md` (append two rows) · `assets/contact-sheets/` (evidence strips only).

**NO — do not, for any reason:**
- **Touch `assets/raw/char-prospector-sheet-hover8.png`** — it is the edit BASE and the shipped stock sheet. Read-only.
- **Delete, move, or overwrite the four shipped `*-hover4-*` skin raws.** They are merged art and the **RETENTION LAW** (CLAUDE.md §10b) forbids removing factory history. They are superseded in place, not garbage.
- **Run extraction.** No `scripts/extract-alpha.mjs`, no `optimize-assets.mjs`. Extraction is **fire-side** (§8) and happens at the drain.
- **Touch anything under `src/`, `e2e/`, `tasks/`, `reviews/`, `STATUS.md`.** This is a raws-only batch; the wiring already exists and needs no change — that is the whole point of matching the existing contract.
- **Rename the skins.** The ids are fixed by `ProspectorSkin.ts:6` (`'stock' | 'complainant' | 'gilded'`); a filename must match `char-prospector-<id>-sheet-hover8.png` **exactly**, lowercase, no `-a`/`-b` suffix.

## CANON (binding — CLAUDE.md §9, brief §9)

Frontier-tech only, **NO firearms ever** · illustrated and warm, **never gory** · no letters, numbers, logos or watermarks in any cell · the agent is **"the Prospector"** · no extra characters, no crops, no reordered or mirrored cells.

## SELF-CHECK (measured, not asserted — paste real numbers)

1. For **each** of the two sheets: pixel dimensions read off the file → must be **2240 × 1360**.
2. Cell division: **8 × 4**; state the per-cell size you used (**280 × 340**) and confirm no frame is clipped by it.
3. **Exact-`#ff00ff` key purity %** per sheet, plus a **5% near-key probe** (the predecessor's near-key count equalled its exact count on all four sheets — match that discipline).
4. **Visible-bbox band per sheet vs the stock hover8 base.** The heights must land in the base's band — this is the seam law; a cross-sheet size-pop is a FAIL, not a note.
5. **32/32 distinct frames, 0 exact mirrors**, per sheet.
6. A same-machine **25% zoom** comparison proving complainant ≠ gilded ≠ stock (report normalized RMSE, as the predecessor did).
7. Confirm by listing the directory that the four `*-hover4-*` raws are **still present and unmodified**.
8. `git status` shows **only** the TOUCH-ONLY paths.

**READY-FOR-GATES** — report: the two exact filenames with their measured dimensions, the key-purity and near-key numbers, the bbox bands against the stock base, the RMSE separations, and a three-coat lineup strip (stock / complainant / gilded) at hover8 for the owner.

> **NEXT FIRE (drain-side, do not do it here):** extract with `node scripts/extract-alpha.mjs --key ff00ff --grid 8x4` → expect **32 cells + a frames.json per skin**, named `char-prospector-<skin>-sheet-hover8-rNcM.png` for r0..r3 / c0..c7. Then the in-game proof is already wired and needs no new code: `SpriteAnimator.ts:886-887` sets **`#game-canvas[data-prospector-sheet]`** to the skin id when the skinned sheet resolves, and to `"stock"` when it falls back — so the e2e assertion is `data-prospector-sheet="gilded"`, and it is **red today**.
