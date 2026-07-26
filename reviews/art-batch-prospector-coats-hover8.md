# Review — art-batch-prospector-coats-hover8 (F-1098-2)

**Slice:** `art-batch-prospector-coats-hover8` · **Slot:** ART · **Runner commit:** `90a7b358` (`runner(art): art-batch-prospector-coats-hover8.md`) · **Drained:** s1099, 2026-07-27

## VERDICT: MERGED — the coats are on the Prospector's back in a plain boot.

The corrective landed exactly as authored. Two hover8 sheets, extracted to 64 cells, and the Complaint Desk's promise is now true on camera: selecting a coat changes what the player sees. F-1098-2 CLOSED.

## What it does

`art-batch-prospector-skins` (2026-07-26) minted four beautiful sheets at `hover4`, a cadence the runtime never requests — so `SpriteAnimator.ts:884` silently fell back to stock and every granted coat looked identical to no coat. This batch re-cut the same accepted costume language onto the `hover8` grid the game actually reads, as image-EDITs of the shipped stock sheet. The fire-side drain then extracted the cells and proved the runtime picks them up.

**No `src/` change was required** — `SpriteAnimator.ts:170` discovers cells through `import.meta.glob('../../assets/processed/char-*.png')`, a build-time glob, so the new files wire themselves. That was the whole point of matching the existing contract, and it held.

## Evidence — every number re-measured on the merged tree, not inherited

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **clean (0)** |
| `npm run build` | **green**, `✓ built in 1.13s`; asset-diet 235 GLBs + 53 plate PNGs cut as usual |
| `cosmetic-grants.spec.ts` (own spec) | **10/10 pass** desktop+mobile, incl. the live Wrangler worker redeem tests |
| Adjacent: `tailor-wagon`, `m4-06-embodiment` | **green** |
| Adjacent: `066-walk8-engine` | 4 failed — **pre-existing, fingerprinted (below)** |
| Console/page errors | **zero** — asserted by every cosmetic-grants test on both projects |

**Art QA — my numbers matched the run report exactly, to the pixel:**

| Sheet | Dimensions | Exact `#ff00ff` | Near-key (5%) non-exact | bbox band | Frames |
|---|---|---|---|---|---|
| stock hover8 (base, untouched) | 2240×1360 | 2,322,237 / 76.2289% | **0** | w 190–256 · h 186–220 | 32/32 |
| complainant hover8 | 2240×1360 | 2,305,303 / 75.6730% | **0** | w 190–256 · h 186–220 | 32/32 distinct, 0 mirrors |
| gilded hover8 | 2240×1360 | 2,315,788 / 76.0172% | **0** | w 190–256 · h 186–220 | 32/32 distinct, 0 mirrors |

Both coats' bbox bands are **identical to the stock base's** ⇒ the seam law holds, no cross-sheet size-pop.

**Extraction (fire-side):** `node scripts/extract-alpha.mjs --key ff00ff --grid 8x4` → `32/32 cells @512px + frames.json` per skin; 64 cell files. Post-extract parity is exact across all three sheets: **`cell=512 scale=1 maxDim=256`**. The 512px skin cells beside 256px stock cells match the **already-shipped hero `claimday` precedent** (skin 512 / stock 256), so this is the house convention, not a new one.

**Despill:** spill-cleared 13,809 / 28,421 px (complainant), 14,533 / 28,652 px (gilded). Residual magenta-ish pixels in the processed cells: complainant **0.89%**, gilded **0.69%** — both *cleaner* than the shipped stock cell's **3.38%**.

## The proof that mattered: I ran the guard before touching it, and watched it flip

`e2e/cosmetic-grants.spec.ts:153` carried a test named **"a named coat falls back to the stock sheet _while its art is absent_"**, asserting `data-prospector-sheet` **`toBe('stock')`** — a test that encoded the bug as the contract.

1. **Before any edit**, with the new cells on disk: that test **FAILED on both desktop and mobile.** That red is the merge's own evidence — it proves the art landed and the runtime consumes it.
2. Its premise ("while its art is absent") is precisely what this merge deliberately falsifies, and the fallback is no longer reachable by any real skin (`ProspectorSkin.ts:6` = `'stock' | 'complainant' | 'gilded'`; both non-stock skins now have art). **Intended supersession, not a regression.** Asserting `'stock'` today would re-encode the defect.
3. Rewritten as a loop over both coats asserting the sheet **resolves to its own skin** → **4/4 green** desktop+mobile, with screenshots. A comment records what it used to assert and why that changed.

**In-world proof (Mistake #10 — "where does the PLAYER see this, in a plain boot?"):** a throwaway probe (run, captured, deleted — not committed) booted `?nowaves&nolevel`, **no `?debug`**, and read the diagnostics frame key actually driving the sprite:

| Skin | `sourceFrameKey` on camera |
|---|---|
| stock | `char-prospector-sheet-hover8-r0c0.png` |
| complainant | `char-prospector-**complainant**-sheet-hover8-r0c1.png` |
| gilded | `char-prospector-**gilded**-sheet-hover8-r0c1.png` |

Screenshots in `artifacts/coat-probe/` show all three side by side at gameplay zoom: the teal sash and the gold leaf are both plainly readable. **The coats are visible to the player.**

## Merge classification

Pure ADD plus one superseded test. The runner had already committed its own raws/LEDGER/contact-sheet at `90a7b358` (path-scoped, firewall respected: base sheet and all four hover4 raws hash-identical — RETENTION LAW intact). This drain adds only `assets/processed/` cells + the two `frames.json`, the LEDGER status flip, and the `cosmetic-grants` supersession. No conflicts, no graft.

**Retention verified by hash** — the four superseded hover4 raws and the edit base are byte-for-byte unchanged:
`8160fe2a…` · `a9ad8049…` · `08af6936…` · `c0a4a0a3…` · base `7e0c3cac…` (all match the run report).

## Findings

- **F-1099-1 (non-blocking, attribution proven).** `066-walk8-engine.spec.ts:194` + `:208` fail (×2 projects). **Fingerprinted, not assumed:** I moved all 66 new files out of `assets/processed/`, re-ran both tests, and they **failed identically** with my work absent ⇒ pre-existing. Independently corroborated by `reviews/run-gait-stride.md`, which documents these exact two line numbers as known reds. Both concern `char.hero`, not the Prospector.
- **F-1099-2 (informational, pre-existing).** The Prospector carries a faint magenta rim at gameplay zoom on the **stock** sheet (3.38% magenta-ish pixels in `r0c0`). The new coats are markedly cleaner (0.89% / 0.69%), so this drain **improves** the situation, but the stock sheet could use a despill pass someday. Not owed by this slice.
- **F-1099-3 (informational, closed on sight).** The predecessor's root cause is now structurally cured for this asset family: the master specified **exact filenames**, and the filenames are what the runtime resolves. The general lesson — an art master specifying a **glob** where the runtime needs one exact token — is worth carrying into every future art batch (`CLAUDE.md` §6 already demands it).
