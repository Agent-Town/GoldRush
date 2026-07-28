# wardrobe-preview — see the coat before you wear it

**Slice:** `lane-wardrobe-preview` · **branch:** `lane/e2-arsenal` · **commit:** `84905654` · **base:** `ba4995eb`
**Drained:** s1181 fire, 2026-07-28 · **Verdict: MERGE**

## What it does

Owner, 2026-07-28, verbatim: *"I would like to see the different cosmetics before actually choosing
them in the wardrobe."* The Tailor's Wagon offered bare `<select>` dropdowns and no picture. Each
rack now carries a live preview card — a representative frame per skin, updating as the selection
changes, in house style (parchment card, engraved border, `town-ui` classes). The equip flow is
unchanged.

Preview frame provenance, as reported and visible in the shots:

| Rack | Option | Frame |
|---|---|---|
| Prospector | stock · complainant · gilded | each skin's own `…-sheet-hover8-r0c0` |
| Partner | stock | canonical female `char-hero-sheet-walk4-a-f-r0c0` |
| Partner | claim-day | stock frame shown as the **"at the tailor's"** placeholder |

## Evidence

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **clean** |
| `npm run build` | **green, 1.44 s** |
| `e2e/tailor-wagon.spec.ts` | **4/4 passed**, desktop + 390px mobile, 35.5 s |
| Zero console/page errors | collected and asserted by the spec |
| Merge classification | all three files **LANE-TOUCHED only** — `git log ba4995eb..main -- <spec, ProspectorSkin.ts, town.css>` **EMPTY** |
| Screenshots | `artifacts/wardrobe-preview/{desktop,mobile}-chrome-wardrobe-preview.png` |

Gated on **scratch port 5234, external server** (Mistake #12).

### I reviewed the surface in-game, not just the assertions

The 390px shot shows both racks rendering correctly inside the viewport: parchment cards with
engraved borders matching the surrounding town UI, the Prospector's brass figure and the Partner's
walking heroine each legible at preview size, and honest sub-labels — **"AT THE TAILOR'S · PREVIEW
ONLY"** and **"AT THE TAILOR'S · STOCK FIT SHOWN"** — where the cosmetic's own art has not landed.
That is the master's placeholder law satisfied in the way that matters to a player: it says *why*
the picture is a stand-in instead of showing a broken image. Canon clean (ADR-001/§9: frontier-tech,
illustrated, no firearms).

### The spec proves the deliverable rather than assuming it

`assertPreviewOptions` walks **every option in both racks** and, for each, asserts
`data-preview-skin`, `data-preview-state`, `data-preview-placeholder`, the image `src`, **and that
the image actually decoded** — `image.complete && image.naturalWidth > 0`. That last one is what
turns "never a broken-img" from a promise into a gate. `assertWardrobeFits` separately proves the
390px case: no horizontal overflow (`scrollWidth <= clientWidth`), the shell inside the viewport,
and the partner preview scrolled into view.

## Findings

- **F-1181-11 (non-blocking, readability).** The spec deleted its explicit
  `selectOption('claim-day')` line but still asserts `HERO_SKIN_STORAGE_KEY === 'claim-day'`. It
  passes because `assertPreviewOptions(…, 'partner', …)` happens to leave `claim-day` selected as
  its last iteration. Correct today, but the assertion's precondition is now an implicit side
  effect of a helper; a future reordering of that options array would break it in a confusing way.
- **F-1181-12 (bookkeeping).** No goal leaf existed for this master (§3.0 returned `? UNKNOWN`);
  registered in this drain commit. Fifth instance this fire.
- The screenshot artifact directory moved `artifacts/tailor-wagon` → `artifacts/wardrobe-preview`.
  The old shots remain on disk (Retention Law); nothing was deleted.
