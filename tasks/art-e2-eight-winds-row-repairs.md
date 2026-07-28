# Task art-e2-eight-winds-row-repairs: THE FOUR CROOKED WINDS — repair 4 diagonal rows across the three E2 enemy sheets (ART SLOT)
FIRE-AUTHORED s1192 (attended review welcome)
You are Codex with image_gen, running in the ART slot. Workdir = repo root.
CODEX: model=gpt-5.6-sol effort=high

## Why — three fires of measurement sized this batch exactly, and the last unknown closed last night

The E2 diagonal enemy sheets ship four rows each (`sw`/`se`/`nw`/`ne`). Twelve rows were surveyed; **four are wrong and eight are correct and must not be touched.** That count is not an estimate — it is the product of three consecutive measured slices, each of which refused to guess:

**1. The survey (`reviews/eight-winds-e2-row-order-survey.md`, merge `b8ccf36c`)** validated a left/right discriminator *before* labelling any row, and sized the batch:

> | **Coal Thief** | (b) defective | **1 row** — row 0 as `sw` (rows 1/2/3 = `se`/`nw`/`ne` preserved) |
> | **Steam Wrecker** | (b) defective | **2 rows** — row 1 as lawful `se` **with a single cyan tank (F-1189-2)**; row 2 as lawful `nw` |
> | **Rail Tough** | (c) indeterminate | **≥1 row** — row 1 must become one stable `se` row; rows 2/3 remain `UNCERTAIN` |

**2. F-1189-2 corrected that survey's own repair spec** — the finding is quoted here because it is the one clause in this task that is non-negotiable:

> "**diagonal row 1 is the ONLY row in all 32 frames of BOTH Steam Wrecker sheets that carries TWO cyan clusters**… an artist told *'put the tank on the other side'* would deliver a row that **still has two tanks**. The row-1 request must read: *one* cyan tank, on the lawful front-view side."

**3. The Rail Tough `2v3` disagreement — the last open unknown — was SETTLED s1191** (`tasks/BACKLOG.md:40`, merge `8b9e8af2b3ee88decf6ef2d2098204c880422865`, review `reviews/eight-winds-rail-tough-row-settle.md`). Masking the one-hand wrench flipped `2v3` from `+0.250115` direct-dominant to `−0.127001` mirror-dominant, **one-sided** (direct moved `−0.001`, mirrored gained `+0.376`), and **9/9** sensitivity cases held. ⇒ **Rows 2/3 are a lawful `nw`/`ne` mirror pair, NOT a duplicate row.** So the Rail Tough's "≥1" resolves to **exactly 1**: row 1 only. Rows 0, 2 and 3 are correct and are **preserved byte-exact**.

**4 rows. Not 5, not 12.** Every row not named below is evidence-backed correct, and regenerating one would spend a good row (that already happened once — LEDGER row 65's F-EW-5 retook two good jumper rows for nothing because of one wrong letter in a data file).

**UNSHIPPED PROOF (ART-SLOT LAW, F-1044-4 — the citation is required, not optional).** `tasks/BACKLOG.md:40` is the ✅ SHIPPED line for the *row-settle*, which shipped **measurement only** — its own review records "**39 files / 1110 insertions**… zero paths outside `artifacts/eight-winds-rail-tough/`", i.e. **no `assets/` bytes**. The three sheets on main are still the LEDGER row 65 originals, untouched since 2026-07-28. **No repair batch has ever been generated.** The art queue is empty and no art run is live (s1192: `tasks/queue/art/` empty, `tasks/running/` empty) ⇒ the one-batch-in-flight law (`assets/LEDGER.md:7`) is clear.

## READ FIRST (paths, all on main)
- `reviews/eight-winds-e2-row-order-survey.md` — the row verdicts and **why each row was judged**, including which discriminator was validated first.
- `reviews/eight-winds-rail-tough-row-settle.md` — the settle that closes rows 2/3. **Read its confidence table: the `nw`/`ne` *pair* is HIGH confidence, the individual *labels* are MEDIUM (F-1191-1).** You are not asked to resolve that; you are asked not to disturb it.
- `reviews/eight-winds/runs/run-enemies-eight-winds.md` — LEDGER row 65's run: the geometry, the self-QA table shape you must reproduce, and **F-EW-5, the prop-side rule that governs step 1 below**.
- `reviews/eight-winds/runs/run-town-eight-winds.md` line 23 — **"Prompts are built, not written."**
- `scripts/anim-pass-prompt.mjs` + `reviews/eight-winds/cast.json` — the prompt builder and its data. **You edit the DATA, never the prompt text by hand.**
- `scripts/anim-pass-graft.mjs` header (lines 1–18) — the mend arm you will use. Read the three matching rules (scale / baseline / centre).
- `assets/LEDGER.md` row 65 — and specifically: *"The three E2 siblings are 1252×1252 where the bases are 1254×1254 and that is CORRECT… Do not 'fix' it to match — that would move the cuts."*
- `docs/GOLD_RUSH_BRIEF.md` §4 + §9, `docs/decisions/ADR-001` — canon. **No firearms ever. Illustrated, warm, never gory.**

## Pre-flight (ART slot — run these and STOP if either fails)
1. `git status --porcelain assets/raw/` must be **empty**. If it is not, STOP and report — someone else is mid-batch.
2. Confirm the three sheets are the shipped originals before you touch them, and record the hashes in your report:
   `shasum -a 256 assets/raw/char-coalthief-sheet-walkdiag4-a.png assets/raw/char-steamwrecker-sheet-walkdiag4-a.png assets/raw/char-railtough-sheet-walkdiag4-a.png`
   Each must read **1252×1252**. If any is 1254×1254 you are looking at a cardinal base, not a diagonal sibling — **STOP.**

## The row map (canonical, and the reason you must not reorder it)
All three sheets are `4x4`, one wind per row, in this order — confirmed against the survey and the settle:

| row | wind | hemisphere |
|---:|---|---|
| 0 | `sw` | front |
| 1 | `se` | front |
| 2 | `nw` | back |
| 3 | `ne` | back |

## Scope — numbered, each testable

**1. FIX THE DATA BEFORE YOU GENERATE ANYTHING (this is the whole reason row 1 came back two-tanked).**
`reviews/eight-winds/cast.json` gives `steam-wrecker` **`"props": []`** — an empty list. The builder therefore emits **no prop-side clause at all** for this character; verify that yourself by reading `reviews/eight-winds/prompts/steam-wrecker-se.txt`, whose "WHICH SIDE EVERY ASYMMETRIC DETAIL GOES ON" section contains only the generic key-light and no-firearms bullets. Its `who` string says the gauge panel sits **"on one flank"** without naming which. **A generator told "one flank" and given no side is free to draw the panel on either side — or, as row 1 proves, on both.** Meanwhile the entry's own `propNote` already says *"the **single** teal gauge panel"* — the canon is one panel, and that fact has never reached a prompt.

Add the prop as **data**, and only this one entry:
```
{"what":"the single teal-lit gauge panel on the flank — there is exactly ONE, never two","side":"L"}
```
**`side: "L"` is MEASURED, not chosen.** F-1189-2's cardinal probes established the tank's body side from the shipped cardinal sheet: cardinal `s` (front view) puts it **screen-right**, cardinal `n` (back view) puts it **screen-left**. A front view mirrors the body, so screen-right-in-front ⇒ the character's **LEFT**; a back view does not, so screen-left-in-back ⇒ the character's **LEFT**. **Both views agree**, which is exactly the front-row-AND-back-row confirmation that LEDGER row 65's F-EW-5 rule demands before a `side` may be written. Cite both readings in your report.
**If your own reading of the base sheet contradicts `L`, STOP and report it — do not generate.** A wrong `side` inverts every downstream verdict; that is the documented F-EW-5 failure and it is worth more to catch it than to ship a batch.

**2. Rebuild the four prompts from the builder — do not hand-write or hand-edit prompt text.**
Re-run `scripts/anim-pass-prompt.mjs` for exactly these four, and save each into `reviews/eight-winds/prompts/` at its existing filename:
`coal-thief-sw` · `steam-wrecker-se` · `steam-wrecker-nw` · `rail-tough-se`
The house style anchor is emitted by the builder verbatim — that is the mechanism the style-anchor law relies on here, so **do not paste it by hand.** Diff each regenerated prompt against the copy already on disk and put the diff in your report: for `steam-wrecker-se` and `steam-wrecker-nw` a new prop bullet must appear; for `coal-thief-sw` and `rail-tough-se` the text should be **unchanged**, which is itself a check that your `cast.json` edit touched only the one entry.

**3. Generate the four rows.** Candidates are free (`AGENTS.md` IMAGE GENERATION LAW — image_gen is native and costs the owner nothing); ship the best one per row. Condition every generation on the character's own **cardinal base sheet** as the reference image, exactly as LEDGER row 65 did.
Native canvas will come back at whatever gpt-image-2 returns — **do not resample it, and do not declare a canvas here.** (F-1184-2 burned a previous master for asserting a native size instead of measuring one; step 4 removes the question entirely, because the graft matches the figure to the sheet.)

**4. Graft each row in, leaving every cell boundary untouched:**
```
node scripts/anim-pass-graft.mjs --sheet char-coalthief-sheet-walkdiag4-a   --grid 4x4 --row 0 --src <sw.png> --src-grid 2x2 --match-row 1
node scripts/anim-pass-graft.mjs --sheet char-steamwrecker-sheet-walkdiag4-a --grid 4x4 --row 1 --src <se.png> --src-grid 2x2 --match-row 0
node scripts/anim-pass-graft.mjs --sheet char-steamwrecker-sheet-walkdiag4-a --grid 4x4 --row 2 --src <nw.png> --src-grid 2x2 --match-row 3
node scripts/anim-pass-graft.mjs --sheet char-railtough-sheet-walkdiag4-a    --grid 4x4 --row 1 --src <se.png> --src-grid 2x2 --match-row 0
```
**Every `--match-row` is deliberate: each grafted row is matched to a known-good row of its OWN hemisphere** (front rows match a front row, back rows match a back row), because figure height and ground line differ between hemispheres and a cross-hemisphere match would re-introduce the size-pop the tool exists to prevent. Run each with `--dry` first and put the reported scale/baseline/centre numbers in your report.

**5. Prove the rows you did NOT touch are byte-identical.** After all grafts, for each sheet extract every row and compare the untouched rows against the same rows extracted from `git show HEAD:<sheet>`. **8 of the 12 rows must be bit-for-bit unchanged.** Report the count. Anything less than 8 is a failure, not a note.

**6. Self-QA, measured — reproduce LEDGER row 65's table shape** (`reviews/eight-winds/runs/run-enemies-eight-winds.md` line 73) for the three sheets: dims/grid · cells extracted at pinned scale · base height band vs composed heights · **drift %** · components crossing a cut (**must be 0**) · key bg% / halo% · duplicate pairs flagged→real (**must be 0 real** — a mirrored row is the exact defect this batch repairs). Plus, per row repaired:
   - **Coal Thief row 0:** the coal sack is on the character's `R`, so in `sw` (front) it must read **screen-LEFT**, partly behind the head and torso.
   - **Steam Wrecker row 1:** **exactly ONE cyan cluster** in all 4 frames — count them, do not eyeball — and in `se` (front) the panel must read **screen-RIGHT** (body-left mirrored by the front view). Report the per-frame cluster count; **2 in any frame is a REJECT and a retake.**
   - **Steam Wrecker row 2:** exactly ONE cyan cluster; in `nw` (back) it must read **screen-LEFT**.
   - **Rail Tough row 1:** the wrench is in the character's `R` hand ⇒ in `se` (front) it reads **screen-LEFT**, matching row 0. Row 1 must be one *stable* row — the same hand in all 4 frames.

**7. Write the run report** to `reviews/eight-winds/runs/run-e2-row-repairs.md` and add a LEDGER row to `assets/LEDGER.md` in the house voice. **Do not process, downscale or optimise any sheet.** Report any sheet over the 600 KB shipped cap rather than fixing it — generator proposes, contract disposes.

## TOUCH-ONLY
- `assets/raw/char-{coalthief,steamwrecker,railtough}-sheet-walkdiag4-a.png` — **and only the 4 named rows within them**
- `reviews/eight-winds/cast.json` — **the `steam-wrecker` entry's `props` array only**
- `reviews/eight-winds/prompts/{coal-thief-sw,steam-wrecker-se,steam-wrecker-nw,rail-tough-se}.txt`
- `reviews/eight-winds/runs/run-e2-row-repairs.md` (NEW) + any crops/contact sheets you cite, under `reviews/eight-winds/crops/`
- `assets/LEDGER.md` — append one row
- `tasks/runs/<stamp>-art-e2-eight-winds-row-repairs.md`

## NO — STOP and report instead of doing any of these
- **Any `src/`, `e2e/`, contract, manifest or `Balance.*` byte.** This batch ships pixels and one data field. Wiring is a later slice.
- **The cardinal `walk4-a` / `walk4-b` sheets of any character.** They are the references and the controls; if one looks wrong, that is a finding.
- **`scripts/extract-alpha.mjs`, `scripts/anim-pass-graft.mjs`, `scripts/anim-pass-prompt.mjs`.** If a tool lacks a flag you need, report it — do not add one.
- **Rows 1/2/3 of Coal Thief, rows 0/3 of Steam Wrecker, rows 0/2/3 of Rail Tough.** These are evidence-backed correct. Regenerating one is the F-EW-5 mistake repeated.
- **Re-litigating the `nw`/`ne` labels on Rail Tough rows 2/3.** F-1191-1 records those labels as MEDIUM confidence pending an on-camera check; if wrong, the cure is a one-line contract swap and **no regeneration**. Generating art against your own re-reading would spend two good rows to fix a label that costs one line.
- **Changing sheet dimensions to 1254×1254.** LEDGER row 65 explains why 1252 is correct; "fixing" it moves every cut.
- **Any other `cast.json` entry**, including the `rail-tough` and `coal-thief` props, which are confirmed.
- **Mirroring or flipping any frame** to fill a row. That is the defect, not the repair.

## Self-check before you report READY-FOR-GATES
- [ ] Pre-flight hashes + `1252×1252` recorded for all three sheets.
- [ ] `cast.json` diff is **one entry, one array**; `git diff --stat reviews/eight-winds/cast.json` shows nothing else.
- [ ] Four prompt diffs shown; the two non-steam-wrecker prompts are **unchanged**.
- [ ] `--dry` scale/baseline/centre numbers reported for all four grafts.
- [ ] **8 of 12 rows proven bit-for-bit unchanged.**
- [ ] Measured QA table for all three sheets: drift %, **0 components crossing a cut**, **0 real duplicate pairs**, cells extracted at pinned scale.
- [ ] **Per-frame cyan cluster counts for Steam Wrecker rows 1 and 2 — all must be exactly 1.**
- [ ] Prop screen-sides confirmed per row against the table in scope 6.
- [ ] `npx tsc --noEmit` rc=0 and `npm run build` rc=0 (they must be — you touched no code; run them anyway so the drain has the pair).
- [ ] Run report + LEDGER row written. No sheet processed, downscaled or optimised.
- [ ] Every residual and every failed take stated by name. **A parked row reported honestly is a PASS; a silent retake is not.**

READY-FOR-GATES + report: the four repaired rows with their measured evidence, the 8-of-12 untouched proof, the cyan cluster counts, the `cast.json` side-measurement you confirmed or contradicted, and any row you parked after three attempts with changed premises (CLAUDE.md §7.5).
