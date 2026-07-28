# Task lane-c-eight-winds-rail-tough-row-settle: EIGHT WINDS — settle the Rail Tough `2v3` disagreement with a NON-SILHOUETTE instrument, so the E2 diagonal art batch can be sized in full (LANE-C, commit prefix "docs:")

**FIRE-AUTHORED s1190 (attended review welcome).**

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-c`.

READ FIRST:
- `AGENTS.md`
- `reviews/eight-winds-e2-row-order-survey.md` — **the review of the survey that produced this task. Its closing table and F-1189-2 are your brief.**
- `tasks/runs/20260729-010959-lane-c-eight-winds-e2-row-order-survey.md` — the survey's own report. **Its Rail Tough rows are the hypothesis you are testing; its Steam Wrecker method is the instrument you are borrowing.**
- `reviews/eight-winds-wiring-e2-enemies.md` — F-1188-1 and F-1188-2, the measurements this all rests on.
- `reviews/eight-winds-wiring-spec.md` — §2.2 (the sibling table, the do-not-resize rule) and the anti-mirror law. The authorizing spec.
- `tasks/lane-c-eight-winds-wiring-e2-enemies.md` — the blocked wiring slice all of this unblocks. **You are NOT executing it.**

CODEX: gpt-5.6-sol effort=high

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/e2-arsenal main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.

*(Measured by the authoring fire at 2026-07-29T01:58Z: `lane/e2-arsenal` was **1 ahead at `7a840663`** but `git diff --name-only --diff-filter=A main..lane/e2-arsenal` was **EMPTY** — its content landed on main as `b8ccf36c`, i.e. a FALSE-AHEAD SAFE DUPE. Re-derive it anyway; the board moves.)*

## Why (`reviews/eight-winds-e2-row-order-survey.md`, drained `b8ccf36c` 2026-07-29)

The survey did its job: it sized the E2 diagonal art batch for two of three sheets **exactly**, and it did so by validating each discriminator before using it. What it could not close is one specific conflict, and it stopped there honestly — which is why this task is narrow.

**What is SETTLED. Do not re-litigate; do not re-measure unless it is nearly free:**

1. **Coal Thief — 1 row.** Regenerate row 0 as `sw`; rows 1/2/3 (`se`/`nw`/`ne`) are correct.
2. **Steam Wrecker — 2 rows.** Row 1 as lawful `se`, row 2 as lawful `nw`; rows 0/3 preserve the validated tank side. ⚠️ Per **F-1189-2**, row 1 currently carries **two** cyan clusters in all four frames — the repair request must read *one* tank, not "the tank on the other side".
3. **The Rail Tough wears brass pauldrons on BOTH shoulders.** A one-pauldron tell is invalid and is not to be revived.
4. **Rail Tough rows 0/1 are front, rows 2/3 are back.** Front/back is not in question here.
5. **Rail Tough row 1 is a confirmed defect** — it changes heading inside the row (`c0–c1` read west, `c2–c3` read east) and must become one stable `se`.

**What is NOT settled, and is the entire task:**

6. **Rail Tough rows 2 and 3 disagree with themselves.** The survey's own table (report lines 105–106) records BOTH rows as `UNCERTAIN` with confidence `NONE`, for one reason: the **body** reads as a mirror pair (row 2 "head/boots travel screen-left", row 3 "head/boots travel screen-right" — i.e. `nw`/`ne`), while the **`2v3` silhouette IoU is direct-dominant (+0.248)**, which means *same heading*. Two opposite answers from the same run.

➡️ **Until that is resolved there is no honest all-sheet total, and a partial art batch is worthless** — the wiring slice needs all three sheets, so shipping Coal Thief and Steam Wrecker alone unblocks nothing. **One measurement closes the last gap and the whole batch becomes one request.** That is the entire value of this task.

## ⚠️ THE HYPOTHESIS YOU ARE TESTING — AND WHY THE SILHOUETTE MAY BE THE THING THAT IS WRONG

Read this before choosing a method; it is the reason this task exists rather than "measure it again, harder".

Every prior instrument on these sheets was a **silhouette** IoU. A silhouette discards everything except the outline — and the Rail Tough is **the one character of the three carrying a large one-hand prop** (the wrench). The survey validated that the wrench is a *stable body-side prop*: it holds screen-left across front rows 0/1 and screen-right across back rows 2/3.

That gives a concrete mechanism by which **both readings could be honest and one instrument simply blind**:

- If rows 2 and 3 are a **true mirror pair**, mirroring row 3 aligns the *bodies* — but a prop that stayed on the same **screen** side would then land on **opposite** sides, subtracting a large blob of mass from the mirrored score and inflating the direct one. A big asymmetric prop can invert an IoU verdict on a figure that is otherwise near-symmetric.
- If rows 2 and 3 are the **same heading** (the duplicate-row defect Coal Thief already has), the direct dominance is real and the visual body read is the thing that is wrong.

**Both are live. Do not assume either.** Your job is to pick an instrument that can tell them apart — and a silhouette provably cannot.

**THE BINDING RULE, inherited and unchanged: VALIDATE YOUR DISCRIMINATOR BEFORE YOU USE IT, and `UNCERTAIN` remains a legitimate, expected, SUCCESSFUL outcome.** Guessing is the failure mode. Admitting you cannot tell is not — and §"If you cannot settle it" below makes an honest failure productive.

## Scope

1. **Extract to a SCRATCH location — never into the shipped tree.**
   Subjects: `assets/raw/char-railtough-sheet-walkdiag4-a.png` (the question) and `assets/raw/char-railtough-sheet-walk4-a.png` (**the control**). Grid **4×4**, cell **313**, key `ff00ff`. Sheets are 1252×1252 against 1254² bases; spec §2.2 rules that correct and **forbids resizing, padding or normalising** them.
   `scripts/extract-alpha.mjs` **already has an `--out DIR` flag** (`:20` / `:60`) — the survey found it rather than adding one. Use it; write cells under `artifacts/`. **Do not edit that script**; it is firewalled. Prove `git status` is clean of `assets/` before you commit.

2. **Borrow the survey's own best idea: USE THE CARDINAL SHEET AS GROUND TRUTH.**
   This is the technique that converted the Steam Wrecker from unmeasurable to row-level, and it applies here directly. The cardinal sheet is shipped, wired and its row order is not in dispute.
   Establish from cardinal **`s` (front)** and **`n` (back)** which **screen** side the wrench occupies in each — that fixes the wrench's **body** side independently of any diagonal ordering. Report the frames you read and the screen-x evidence.
   ⚠️ **Re-derive the cardinal row order from the shipped frame data before you trust it** (`assets/processed/char-railtough-sheet-walk4-a.frames.json` and its consumer) — do not assume row 0 is `s`. Citing a row index you did not verify is the exact error class this whole thread exists to correct.

3. **Measure the wrench, not the outline.**
   Build a **non-silhouette** instrument that locates the wrench per frame and reports its position **relative to the body's own centroid** (a signed screen-x offset), for all four frames of diagonal rows 2 and 3 — and for rows 0 and 1 as a **control**, since the survey already published their wrench sides (`left` for 0/1) and you must reproduce that before your instrument is trusted.
   Any per-frame feature that isolates the wrench is acceptable — colour/luminance clustering of its metal against the coat, connected-component analysis on a masked band, whatever survives your own validation — but you must **prove it locates the wrench** (show it on frames where the wrench is unambiguous) before any row gets a verdict. **If your feature cannot be validated, the sheet stays `UNCERTAIN` and you say so.**

4. **Answer the one question, in one sentence, with the numbers under it.**
   > *Are Rail Tough diagonal rows 2 and 3 one heading, or two?*
   Report: the wrench's signed offset per frame per row; whether rows 2/3 place it on the **same** body side (⇒ same heading ⇒ duplicate-row defect, like Coal Thief) or **opposite** body sides (⇒ true `nw`/`ne` mirror pair ⇒ the silhouette verdict was prop-confounded and rows 2/3 are FINE).
   Then state which reading the evidence supports and **why the other one lost** — naming the specific number that killed it.

5. **Re-run the silhouette instrument ONCE, with the prop excluded, as a cross-check.**
   If step 3 locates the wrench, you can mask it out and re-run the same bounding-box-aligned direct-vs-mirrored IoU on rows `2v3` against the subject's own mirror floor (**0.452** for this sheet, per the survey — reproduce it as a control).
   **This is the decisive experiment for the confound hypothesis:** if removing the prop **flips** `2v3` from direct-dominant to mirror-dominant, the silhouette was measuring the wrench all along and the visual read was right. If it stays direct-dominant, the rows really are duplicates. Report the before/after pair either way — that number is the deliverable even if everything else is `UNCERTAIN`.

6. **Size the Rail Tough repair, and restate the whole batch.**
   Close with a table giving the **final** E2 diagonal art request across all three sheets: which rows regenerate, as which heading, with the Steam Wrecker row-1 **single-tank** correction (F-1189-2) carried through verbatim. Items 1 and 2 of "What is SETTLED" are re-stated, not re-derived.
   State the **all-sheet total** as one number, or state plainly that it still cannot be stated and why.

**If you cannot settle it — this outcome is pre-declared a SUCCESS, and it must still end in a sized batch.** If the wrench cannot be isolated, or steps 3 and 5 disagree, do NOT guess. Say so, and recommend the bounded fallback: **regenerate all four Rail Tough diagonal rows** as a clean `[sw, se, nw, ne]` set. That is at most three extra rows of art, it is guaranteed correct, and it costs far less than another measurement round or a wrong mapping shipped into the game. A stop that hands the owner a sized, safe request is worth more than a confident table that is wrong.

## Firewall

**TOUCH-ONLY:**
- `artifacts/eight-winds-rail-tough/**` (scratch cells, contact boards, any probe output)
- `logs/` — your probe scripts, if you write any (**commit them**; they must be re-runnable, per the RETENTION LAW)
- `tasks/runs/<your run report>` — the report IS the deliverable

**NO — do not touch, not even to tidy:**
- `assets/**` — **nothing**. Not raw, not processed. You generate **no art** in this task and you extract only to `artifacts/`.
- `scripts/extract-alpha.mjs` — use its existing `--out` flag; adding to it is a code change
- `src/**`, `e2e/**`, any contract or sibling table — **the wiring slice stays blocked and that is correct**
- `tasks/lane-c-eight-winds-wiring-e2-enemies.md` — not yours to unblock; a drain does that
- The Coal Thief and Steam Wrecker **verdicts** — re-state them, do not re-open them. If you believe one is wrong, **report it as a finding and change nothing.**

## Self-check before you report

- [ ] `git status` shows **zero** changes under `assets/` and **zero** under `src/`, `e2e/`, `scripts/`
- [ ] `npm run build` green (it must be — you changed no code)
- [ ] `npx tsc --noEmit` exit 0
- [ ] Cardinal row order **re-derived from the frame data**, not assumed — with the file and line cited
- [ ] Wrench-locator **validated on frames where the wrench is unambiguous**, shown before any verdict
- [ ] Rows 0/1 wrench side **reproduces the survey's published `left`** — if it does not, say so plainly and treat your whole table as suspect
- [ ] The `2v3` mirror floor **0.452** reproduced as a control on your own implementation
- [ ] Step 5's before/after IoU pair reported **whatever it shows**
- [ ] Every row carries a confidence word; every `UNCERTAIN` carries its reason
- [ ] Final table states the all-sheet total, or states why it cannot be stated
- [ ] Probe scripts committed and re-runnable

READY-FOR-GATES + report: the one-sentence answer to scope 4, the before/after IoU pair from scope 5, the final all-sheet art request table, and anything you had to leave `UNCERTAIN` with the reason.
