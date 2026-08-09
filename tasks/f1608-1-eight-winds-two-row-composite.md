# Task f1608-1: THE LAST TWO CROOKED WINDS — repair Coal Thief row 0 and Steam Wrecker row 1 by SINGLE-ROW COMPOSITE (ART SLOT)
FIRE-AUTHORED s1608 (attended review welcome)
You are Codex with image_gen, running in the ART slot. Workdir = repo root.
CODEX: model=gpt-5.6-sol effort=high

## Why — the owner funded a fourth premise BY NAME, and it is the only thing that has changed

F-1193-3 sat open for ~400 fires because three generation premises were already spent on each of these two rows (base prompt · `--retake-mirrored` · retake + cardinal-front-row control), and CLAUDE.md §7.5 forbids an identical retry. A fourth premise costs gpt-image-2 credits, which §7.3 reserves to the owner. **He ruled it on 2026-08-09, and the premise is his, quoted verbatim from `tasks/BACKLOG.md` (grep key: `Spend one more batch`):**

> **OWNER RULED 2026-08-09: "Spend one more batch" — fourth premise AUTHORIZED as the changed premise: generate each missing row as a STANDALONE SINGLE-ROW sheet and composite it in. ART-slot task authorable; the E2 content ladder unblocks when the rows land.**

**That sentence is the whole task.** The three failed premises all asked the generator to produce a row *in the context of a 4×4 sheet*, where it kept borrowing the neighbouring row's pose. This premise asks for **one row, alone, in its own image** — then joins it mechanically. You are not being asked to find a better prompt; you are being asked to change the container.

**THE DEFECT, re-verified at the bytes this fire (not inherited):**
- `char-coalthief-sheet-walkdiag4-a.png` **row 0** is a duplicate `se` — its **southwest row is missing outright**. `git log --oneline -- assets/raw/char-coalthief-sheet-walkdiag4-a.png` returns **exactly ONE commit, `7c0e8361a`** (THE EIGHT WINDS batch 3, 2026-07-28): never touched since minted.
- `char-steamwrecker-sheet-walkdiag4-a.png` **row 1** reads **2,2,2,2 cyan clusters** where a lawful `se` carries **one** tank (F-1189-2).

**UNSHIPPED PROOF (ART-SLOT LAW, F-1044-4 — required, not optional).** The BACKLOG row declaring F-1193-3 (grep key: `TWO E2 ENEMY SHEETS STILL CARRY A WRONG DIAGONAL ROW`) records that the s1193 batch `f61843c07` shipped an explicit **PARTIAL**: the 2 rows it landed were **Steam Wrecker row 2 `nw`** and **Rail Tough row 1 `se`**. These two rows are the ones it could not. s1608 confirmed the art queue is empty and no art run is live ⇒ the one-batch-in-flight law (`assets/LEDGER.md:7`) is clear.

⚠️ **A TRAP THE PREVIOUS MASTER WOULD NOW WALK INTO, AND THE REASON THIS PRE-FLIGHT IS DIFFERENT.** `tasks/art-e2-eight-winds-row-repairs.md` told its runner to *"confirm the three sheets are the shipped originals"*. **That is now FALSE for Steam Wrecker** — its sheet has TWO commits (`7c0e8361a` original + `f61843c07` the partial repair), because the partial batch legitimately landed row 2 into it. A pre-flight demanding "originals" would STOP on a healthy tree. Pin the CURRENT bytes instead; they are given below.

## READ FIRST (paths, all on main)
- `tasks/art-e2-eight-winds-row-repairs.md` — the predecessor master. **Read its scope item 1 and then DO NOT REPEAT IT** (see the firewall: the `cast.json` data fix already landed).
- `reviews/eight-winds-e2-row-order-survey.md` — the row verdicts and *why each row was judged*, including the left/right discriminator that was validated before any row was labelled.
- `reviews/eight-winds/runs/run-enemies-eight-winds.md` — LEDGER row 65's run: the geometry, **the self-QA table shape you must reproduce**, and F-EW-5 (the prop-side rule).
- `reviews/eight-winds/runs/run-town-eight-winds.md` line 23 — **"Prompts are built, not written."**
- `scripts/anim-pass-prompt.mjs` + `reviews/eight-winds/cast.json` — the prompt builder and its data. **You edit DATA, never prompt text by hand.**
- `scripts/anim-pass-graft.mjs` header (lines 1–18) — the mend arm. Read the three matching rules (scale / baseline / centre); they are why a grafted row cannot size-pop or bob.
- `assets/LEDGER.md` row 65 — including: *"The three E2 siblings are 1252×1252 where the bases are 1254×1254 and that is CORRECT… Do not 'fix' it to match — that would move the cuts."*
- `docs/GOLD_RUSH_BRIEF.md` §4 + §9, `docs/decisions/ADR-001` — canon. **No firearms ever. Illustrated, warm, never gory.**

## Pre-flight (ART slot — run these and STOP if any fails)
1. `git status --porcelain assets/raw/` must be **empty**. If not, STOP and report — someone else is mid-batch.
2. Pin the CURRENT bytes (measured s1608, both sheets **1252×1252**):
   - `c6ffee23de715a69756d754e314ca9777a9b7b8e3ddfdd94e5627a9a6ab1b034  assets/raw/char-coalthief-sheet-walkdiag4-a.png`
   - `465d92984c5dc498d756311e81a036941fd6f155420b3aebc71dacc1bcf0782b  assets/raw/char-steamwrecker-sheet-walkdiag4-a.png`
   If either differs, STOP and report — the tree moved under this master; do not guess which way.
3. Confirm the owner premise is still the live ruling: `grep -c "Spend one more batch" tasks/BACKLOG.md` must return **≥1**. If it returns 0, STOP — the ruling this task spends credits on is not where it was.

## The row map (canonical — do NOT reorder)
Both sheets are `4x4`, 1252×1252, one wind per row, cells 313×313:

| row | wind | hemisphere |
|---:|---|---|
| 0 | `sw` | front |
| 1 | `se` | front |
| 2 | `nw` | back |
| 3 | `ne` | back |

## Scope — numbered, each testable

**1. GENERATE COAL THIEF `sw` AS A STANDALONE SINGLE-ROW SHEET.**
Four frames of one walk cycle, **one row only**, `4x1`, on the `#ff00ff` key, same figure scale and framing language as the existing sheet. The wind is **southwest: front hemisphere, the figure moving toward the viewer's LEFT.** Its lawful contrast is row 1 (`se`, front, moving toward the viewer's RIGHT), which is correct on the sheet today and is your reference for identity, costume and weight.
**The coal sack is the discriminator and it is already pinned in data** — `reviews/eight-winds/cast.json` `coal-thief.props` reads `{"what":"the big black sack of coal hoisted over the shoulder","side":"R"}`. Build the prompt through `scripts/anim-pass-prompt.mjs`; do not hand-write it.
Write the raw to `worktrees/art/assets/raw/` under a name that says what it is, e.g. `char-coalthief-row-sw-single.png`.

**2. GENERATE STEAM WRECKER `se` AS A STANDALONE SINGLE-ROW SHEET.**
Same shape: `4x1`, `#ff00ff` key. The wind is **southeast: front hemisphere, moving toward the viewer's RIGHT.**
🔑 **THE NON-NEGOTIABLE CLAUSE (F-1189-2), because this is exactly how the row failed three times:** diagonal row 1 is the only row in all 32 frames of both Steam Wrecker sheets carrying **TWO** cyan clusters. An artist told *"put the tank on the other side"* delivers a row that **still has two tanks**. The request must read: **exactly ONE teal-lit gauge panel, on the lawful front-view side — never two.** That is already correct in data (`steam-wrecker.props` = `{"what":"the single teal-lit gauge panel on the flank — there is exactly ONE, never two","side":"L"}`), so build through the builder and **verify the emitted prompt actually contains the one-panel clause before you spend a credit.** If it does not, STOP and report — do not hand-patch the prompt.

**3. COMPOSITE EACH ROW IN WITH THE MEND ARM — never by hand, never by re-cutting the sheet.**
```
node scripts/anim-pass-graft.mjs --sheet char-coalthief-sheet-walkdiag4-a   --grid 4x4 --row 0 \
     --src <your single-row raw> --src-grid 4x1 --match-row 1
node scripts/anim-pass-graft.mjs --sheet char-steamwrecker-sheet-walkdiag4-a --grid 4x4 --row 1 \
     --src <your single-row raw> --src-grid 4x1 --match-row 0
```
`--match-row` is the **other front-hemisphere row** in each case, deliberately: a front row matched against a back row would inherit the wrong ground line. Run `--dry` first and record what it reports. The sheet keeps its filename, dimensions and grid; **only the named row's pixels change.**

**4. MEASURED SELF-QA — numbers, not adjectives.** Reproduce the run-file table shape from `run-enemies-eight-winds.md`, and include at minimum:
   - **Dimensions unchanged**: both sheets still exactly **1252×1252**.
   - **Untouched rows byte-identical**: for Coal Thief, rows 1/2/3; for Steam Wrecker, rows 0/2/3. Prove it per-row (cell-diff or per-row hash), not by eye. **Any non-zero delta outside the target row is a STOP.**
   - **Cyan cluster count per frame, Steam Wrecker row 1: must be exactly 1 in all 4 frames.** State the count you measured for each frame. This is the acceptance criterion the last three attempts failed.
   - **Coal Thief row 0 is no longer a duplicate of row 1**: run `scripts/anim-pass-dupecheck.mjs` (or the celldiff arm) and report the figure.
   - **Height band**: grafted median figure height vs the reference row's, and the ground-line offset — both should be ~0 by construction; report the actual numbers so a size-pop cannot hide.
   - **Purity**: `#ff00ff` key intact, no letters/watermarks anywhere in the generated frames.
5. Write the run file to `reviews/eight-winds/runs/` and add the LEDGER entry per the ART batch law.

## Firewall
**TOUCH-ONLY:** `assets/raw/char-coalthief-sheet-walkdiag4-a.png` (row 0 pixels) · `assets/raw/char-steamwrecker-sheet-walkdiag4-a.png` (row 1 pixels) · new single-row raws under `worktrees/art/assets/raw/` · `reviews/eight-winds/runs/<your run file>` · `assets/LEDGER.md`.

**NO — each of these has a reason:**
- ❌ **`reviews/eight-winds/cast.json` — DO NOT EDIT.** The predecessor master's scope item 1 (add the steam-wrecker prop) **already landed**; s1608 read the file and both entries are correct today. Re-applying it is how a good data fix gets doubled.
- ❌ **`char-railtough-sheet-walkdiag4-a.png` — do not touch.** Its rows were settled by measurement (`reviews/eight-winds-rail-tough-row-settle.md`); rows 2/3 are a lawful `nw`/`ne` mirror pair, and the individual labels are only MEDIUM confidence (F-1191-1). You are not asked to resolve that; you are asked not to disturb it.
- ❌ **Any row not named in scope.** Eight of the twelve E2 diagonal rows are evidence-backed correct. Regenerating a good row has already cost this project once (LEDGER row 65's F-EW-5 retook two good jumper rows over one wrong letter in a data file).
- ❌ **No mirroring** to manufacture a row (`--retake-mirrored` is a SPENT premise — that is premise #2 of the three that failed).
- ❌ **Do not change sheet dimensions or the grid.** 1252×1252 is CORRECT and differs from the 1254×1254 cardinal bases on purpose; "fixing" it moves every cut.
- ❌ **No `src/` or `e2e/` edits.** The diagonal raws are referenced nowhere in `src/` or `e2e/` today (established from source at the s1193 drain, Mistake #10) — wiring is the `eight-winds-wiring-e2-enemies` leaf's job, not this batch's.
- ❌ **No firearms, ever** (ADR-001). Illustrated, warm, never gory.

## If a row fails again
This is the **fourth** premise. If the single-row container also yields a two-tanked `se` or a duplicate `sw`, **STOP and report it as a finding — do not spend a fifth premise.** Say exactly what the generator returned and what you measured. §7.5 forbids the identical retry, and a fifth premise is another owner call, not yours. **A truthful negative result here is a successful run**: it would establish that the container was never the variable, which is worth knowing and is the one thing three previous attempts never established.

## Self-check before you report
- [ ] Pre-flight hashes matched, or STOPPED.
- [ ] Emitted prompts built through `anim-pass-prompt.mjs`, and the Steam Wrecker one **verified to contain the one-panel clause before spending a credit**.
- [ ] Both grafts run with `--dry` first, then for real.
- [ ] Both sheets still 1252×1252; every untouched row proven byte-identical per-row.
- [ ] Steam Wrecker row 1: cyan cluster count stated **per frame**, all four = 1.
- [ ] Coal Thief row 0 measured non-duplicate of row 1.
- [ ] Run file written + LEDGER entry added.
- [ ] `git status --porcelain` shows nothing outside TOUCH-ONLY.

READY-FOR-GATES + report: the two grafted rows with their measured self-QA table, the per-frame cyan counts, the dupecheck figure, the height/ground-line deltas, the pre/post hashes of both sheets, and — if either row failed a fourth time — the finding, with what the generator actually returned.
