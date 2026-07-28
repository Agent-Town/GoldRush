# Task art-gazette-engravings: THE CLAIM HERALD GETS ITS CUTS — seven reusable engraved spot illustrations, one per headline class (ART SLOT)
FIRE-AUTHORED s1182 (attended review welcome)
You are Codex with image_gen, running in the ART slot.
CODEX: model=gpt-5.6-sol effort=high

## Why — the owner asked for this, and the one law that was holding it back is now satisfied
**Owner directive, verbatim, 2026-07-28** (`tasks/BACKLOG.md:1650`):
> "for the news paper images would be amazing - not urgent but would add a lot the atmosphere"

The same ladder line specifies the shape and names the gate, verbatim:
> "THE CLAIM HERALD gains engraved spot illustrations — a small REUSABLE set by headline class (board/trail/river/schoolhouse/ledger/boss/town-growth), not per-item; gpt-image-2 art-slot batch, style-anchored to the plates; wire = tiny Herald renderer change mapping class→engraving. **Fire-authorable AFTER art-e7-town-icons completes (one batch in flight law).**"

**THE GATE IS SATISFIED — verified by ancestry, not by a message-grep (Mistake #16).** `art-e7-town-icons` shipped: done-move `tasks/done/shipped-7873eaee-20260728-100138-art-e7-town-icons.md`, and `git merge-base --is-ancestor 7873eaee main` returns **true** (s1182). Its LEDGER row is **62**. The sibling rungs E6/E8/E9 shipped too (`c7601082` / `1d25c5cf` / `f88ded97`). **The art queue is empty and no art run is live** (s1182: `tasks/queue/art/` empty, `tasks/running/` empty) — so the one-batch-in-flight law (`assets/LEDGER.md:7`) is clear.

⚠️ **This blocker had been carried forward as still-blocking for at least one fire after it died.** s1181's handoff lists GAZETTE-ART as "blocked behind art-e7-town-icons". It is not, and had not been for ~11 hours. Re-derived here rather than inherited.

**Unshipped proof (F-1044-4 art gate — the ART-SLOT LAW requires citing it).** `git ls-files | grep -i "herald.*\.png\|engrav"` returns exactly **two** files, and both are e2e screenshots from the GZ-H1 slice (`artifacts/gz-h1-newsie/{desktop,mobile}-chrome-herald-open.png`) — **zero** art assets. No `tasks/*gazette*` master exists. Nothing here has been generated before.

READ FIRST (paths, all on main):
- `assets/raw/plate-contract-the-claim.png` + `assets/raw/plate-contract-hill-mine.png` — **your style masters. Condition every prompt on these two files.**
- `tasks/art-batch-031-contract-plates.md` lines 5, 14, 16–18 — the plate law, the VARIETY LAW, the self-QA shape, the "no processing" rule.
- `assets/LEDGER.md` line 7 (one-batch-in-flight) + line 1–3 (pipeline v2, the 600 KB shipped-image cap) + rows 60–65 for house voice.
- `specs/gazette-house/README.md` — the Herald's spine, and the 063 in-world voice law.
- `src/news/heraldReader.ts:56-64` — `renderItem()`, the template these cuts will eventually sit in. **Read it to understand the size they render at. Do not modify it.**
- `news/herald.json` — the four live items; they are your reality check that these seven classes actually cover real headlines.
- `docs/GOLD_RUSH_BRIEF.md` §4 + §9, `docs/decisions/ADR-001` — canon. **No firearms, ever. Illustrated, warm, never gory.**

## THE CONVENTION (this batch establishes it — flagged NEW for attended review)
**Style anchor — paste this sentence VERBATIM into every prompt** (it is the plate law, quoted from `tasks/art-batch-031-contract-plates.md:20`, because the BACKLOG line says "style-anchored to the plates"):

> "Gold Rush hand-tinted engraving, the E1 plate law: warm sepia-gold etched linework with muted watercolor washes — teal-green water, golden-hour warm light, sage-dark pines, one small teal accent (ribbon/flag/glow) — full-bleed, no letters, no gore."

**Tier + canvas (NEW this batch — reasoned, and open to challenge):** a Herald cut is a **spot illustration in a newspaper column**, not a card plate and not a portrait bust. Canvas **1024×1024 RGB, no alpha** (gpt-image-2's native square — no resampling), **FULL-BLEED, NO `#ff00ff` key, processing: NONE**. Rationale, stated so a reviewer can overrule it: the plates are 1672×941 landscape because they are cards; a column cut is square-ish and renders small. `assets/raw/` is import-globbable from `src/` (precedent: `src/town/TownScene.ts:88` globs `plate-contract-*.png`), so no processing step is needed for these to reach the game later.

**Filenames — EXACT, all in `assets/raw/`:**
| # | class | file | subject |
|---|-------|------|---------|
| 1 | board | `herald-engraving-board.png` | the town contract board: a weathered plank board under a shingle roof, **blank** pinned papers curling at the corners, a hand reaching to pin one, two figures reading |
| 2 | trail | `herald-engraving-trail.png` | the wagon road out of town: deep ruts winding into dusty hills, a laden wagon small in the middle distance, sage-dark pines on the ridge |
| 3 | river | `herald-engraving-river.png` | the river bend past the claim: teal-green water over gravel, a timber sluice at the bank, the ford's shallows catching golden light |
| 4 | schoolhouse | `herald-engraving-schoolhouse.png` | the schoolhouse: clapboard, bell in its little cupola, door ajar, a **blank** chart/slate propped by the step (diagrammatic marks only — see the letters guard) |
| 5 | ledger | `herald-engraving-ledger.png` | the claim office desk: a heavy open ledger, **ruled lines only, no writing**, an inkwell, a steel pen, a brass lamp casting warm light |
| 6 | boss | `herald-engraving-boss.png` | a great frontier-tech machine looming over a work camp — riveted iron, a dredge boom and claw, steam plume, teal glow at its lamp. **A MACHINE. Not a person. No firearms. Menacing by scale, never gory.** |
| 7 | town-growth | `herald-engraving-town-growth.png` | a new building going up: a raised timber frame, scaffolding and ladders, townsfolk hauling a beam upright, a teal ribbon on the ridgepole |

**Plus one contact sheet:** `assets/contact-sheets/herald-engravings-sheet.png` — a 7-up review strip (single row or 4+3), each cut labelled **in the sheet only**, at 25% scale. The sheet is the review artefact; it is not shipped art.

### ⚠️ THE LETTERS GUARD — this batch's single most likely failure, by construction
Every other batch has been told "no letters". **This one is drawing a newspaper, a ledger, a school chart and a pinned notice board** — four subjects that beg the generator to write. **Any legible letter, numeral, word, signature or watermark anywhere in a shipped cut is a REJECT, not a touch-up.** Papers are blank or bear abstract ruled lines; the ledger shows rules and columns, never writing; the school chart carries a diagram (a curve, a triangle, a compass rose), never a caption. If a candidate comes back with writing, regenerate it — do not paint it out.

**Positive control before you accept the batch:** downscale every cut to **120 px** and look at it. This is the size a column cut actually renders at (the portrait convention pins the same legibility rule at ~120 px, `assets/LEDGER.md` row 60). If the subject does not read instantly at 120 px, the composition is too busy — regenerate simpler and closer. Report the 120 px verdict per cut.

### THE VARIETY LAW (owner 2026-07-20, binding — `tasks/art-batch-031-contract-plates.md:14`)
The seven must **not** look like a template set. Per cut choose a different camera distance and height — mix intimate ground-level (ledger, board), mid (schoolhouse, town-growth), and vista/low-angle (trail, river, boss) — its own moment within the warm range, and its own placement of the single teal accent. Each is its own small picture.

## Scope (numbered, each independently checkable)
1. Generate the **7 cuts** above into `assets/raw/` at the exact filenames, obeying the style anchor verbatim, the letters guard, and the variety law. Candidates are free (image_gen is native and costs the owner nothing — `AGENTS.md` IMAGE GENERATION LAW); ship the best one per class.
2. Build `assets/contact-sheets/herald-engravings-sheet.png` (7-up, 25%).
3. **Measured self-QA table, one row per cut**, reporting: pixel dimensions · file size in KB · letters/numerals found (must be **0** — say how you checked) · full-bleed (no border/frame) · palette within the two style masters' range · **the 120 px legibility verdict** · camera distance chosen (proving variety) · canon check (no firearms, no gore).
4. **Report — do not fix — any cut over 600 KB.** `assets/LEDGER.md:1` caps *shipped* images at 600 KB, and these are `assets/raw/` originals with no processing step, exactly like the plates (which are multi-MB on main today). That tension is real and is **not yours to resolve**: measure, report the number, and let the drain decide. Generator proposes, contract disposes.
5. Add **one row (66)** to `assets/LEDGER.md` in house voice, naming the new spot-cut tier, the canvas, the seven classes, and the fact that **no consumer exists yet**.
6. Write your run file under `tasks/runs/`.

## FIREWALL
**TOUCH-ONLY:**
- `assets/raw/herald-engraving-{board,trail,river,schoolhouse,ledger,boss,town-growth}.png` (the 7, all NEW)
- `assets/contact-sheets/herald-engravings-sheet.png` (NEW)
- `assets/LEDGER.md` (one new row, 66)
- your run file under `tasks/runs/`

**NO — do not touch, and do not "just wire it up":**
- **Zero `src/`.** The class→engraving map in `src/news/heraldReader.ts` and the `class` field on `HeraldItem` (`src/news/herald.ts:3-8`) are the **NEXT rung**, a lane task, not this batch. Placeholder-first works in both directions: the art lands first and waits for its wiring.
- **Zero `news/herald.json`.** Classifying the live items is part of that same wiring rung.
- Zero `e2e/`, zero `assets/processed*/`, zero extraction, zero `scripts/optimize-assets.mjs` — **processing is fire-side, and this tier has none.**
- Do not modify any existing `plate-contract-*.png` or `tf-*.png`. They are read-only style masters.
- Do not invent an eighth class. Seven are named by the owner's ladder line; if you believe one is missing, **report it, do not draw it** (Mistake #14 — generator proposes, contract disposes).
- No text rendering anywhere in a shipped cut (see the letters guard).

## Self-check before you report
- All 7 files exist at the exact paths, 1024×1024, RGB, no alpha, full-bleed, no `#ff00ff` anywhere.
- Zero letters/numerals in all 7 — stated with how you verified.
- 120 px legibility verdict recorded for all 7.
- Variety law demonstrably honoured (7 distinct camera distances/compositions, listed).
- Canon: no firearms in any cut; nothing gory; the boss cut is a machine.
- LEDGER row 66 added; run file written.
- `npx tsc --noEmit` clean and `npm run build` green — **you changed no code, so these must be untouched-green; if either fails, say so loudly, because it means something else is wrong on main.**

END: **READY-FOR-GATES** + the per-cut self-QA table + the 120 px verdicts + any cut over 600 KB named with its size + anything you had to reject and why.
