CODEX: model=gpt-5.6-sol effort=high

# lane-b-fd3-1-submitted-at-projection — give the county board's "when" column its data (F-FD3-1)

**FIRE-AUTHORED s1521 (attended review welcome).** Firewall lifted by exactly ONE file versus its
predecessor — the `e1-seam-yield-single-source-lift` precedent, where a STOP caused by a too-narrow
firewall was cured by re-authoring with the one file added, not by widening the runner's discretion.

ROLE: implementer on lane-b. WORKDIR: worktrees/lane-b (branch lane/b). Commit prefix `fd3-1:`. Never touch STATUS.md, reviews/, tasks/queue/, other lanes.
PRE-FLIGHT (LANE-SAFETY INVARIANT): `git branch --show-current` = `lane/b`; dirty tracked blob not reachable in git → STOP. `git checkout -B lane/b origin/main` ONLY when clean. SAFE-DUPE: READ the body of `boardRow()` in `functions/api/standings.ts`; if it ALREADY emits `submittedAt` → STOP and report (the cure has landed). ⚠️ Do NOT decide this with a bare `grep -c 'submittedAt: row.submittedAt'` — that returns **1** on today's main from a DIFFERENT projection near `:270`, and would STOP you on work that is not done. Read the function, not the file.
CITATION CHECK (run BEFORE any edit; 0 means your lane is stale, not that the work is done):
`grep -c 'function boardRow(row: StoredRow, index: number): JsonRecord {' functions/api/standings.ts`
→ expect **1**. If 0, STOP and report "lane stale — refresh requested".

## WHY (drain evidence, s1521, `reviews/lane-fd3-boards-pass.md`)
FD-3 shipped the "when" column and its tests at merge `9b7c530a5`, and the column is **empty in
production** — every real row renders an em-dash. The runner that built it ended its report with
**"Not `READY-FOR-GATES`"** and filed F-FD3-1, because FD-3's master said *"NO: API/ranking/storage
changes"* and the missing piece is an API projection. It refused correctly (Mistake #14:
reject-don't-stretch). This master exists to lift that one restriction and nothing else.

The data is already there. `StoredRow.submittedAt: number` is a required field
(`functions/api/standings.ts:70`), it is already persisted at submit time (`:363`), it is already
projected by the *other* projection (`:270`), and the UI already validates and renders it
defensively — `src/encyclopedia/reader.ts` treats `submittedAt` as OPTIONAL and falls back to
`<span class="county-standings__when-missing" aria-label="Submission time unavailable">&mdash;</span>`.
**So this is a one-line additive projection, and the client needs no change at all.**

## READ-FIRST
- `reviews/lane-fd3-boards-pass.md` — the drain that found this; F-FD3-1 is its first finding.
- `functions/api/standings.ts` — `StoredRow` (`:61-70`), `boardRow()` (the citation-check line above), the sibling projection near `:270`, and the stack-blindness comment INSIDE `boardRow` ("Names only. A rider's declared stack stays out of the board by construction").
- `src/encyclopedia/reader.ts` — the consuming validator + renderer, so you can see the field is already optional-tolerant. **Do not change it.**
- `e2e/lb-01-county-standings.spec.ts` — the board's contract tests.

## SCOPE
1. In `boardRow()`, project `submittedAt` **additively and defensively**, in the same style as the
   existing `...(row.defaulted ? { defaulted: true } : {})` spread — emit the key only when the
   value is a finite non-negative number, so a legacy row without it still serialises cleanly.
2. Do **not** change ranking, ordering, storage, or the stack-blindness rule. `compareScores` already
   reads `submittedAt` as optional (`:440-446`) and must keep behaving byte-identically.
3. Extend `e2e/lb-01-county-standings.spec.ts` with a test asserting the **public** board row carries
   `submittedAt` for a freshly submitted row, and that a row lacking it still renders the em-dash
   fallback rather than throwing. Both projects.
4. Report the "when" column rendering real relative times, desktop + 390px, with screenshots.

## TOUCH-ONLY
`functions/api/standings.ts` (the ONE lifted file) · `e2e/lb-01-county-standings.spec.ts` · `tasks/BACKLOG.md` (goal-leaf row only).

## NO
`src/encyclopedia/reader.ts` or its css — the client is already correct and its fallback must stay
proven · ranking/ordering/compare logic · new endpoints · any other `functions/` file · the FD-1
card (lane-a owns it).

## SELF-CHECK
`npx tsc --noEmit` clean · `npm run build` green · `npm run test:accounts` and `npm run test:mp`
green (this edits `functions/`, which `tsc` and `vite build` do NOT cover — F-1229-1: worker code
has no other gate) · `e2e/lb-01-county-standings.spec.ts` + `e2e/field-book.spec.ts` green **both
projects, `--workers=1`** · zero console/page errors · before/after screenshots of the county board
desktop + 390px → `reviews/shots-fd3-1/`.

⚠️ KNOWN ENVIRONMENT RED, do not chase it: three tests in `lb-01-county-standings.spec.ts`
(`secure submits the county row…`, `secure skips county submission…`, `offline standings failure…`)
fail with `Failed to load resource: the server responded with a status of 429 ()` under repeated
local runs. s1521 proved by control worktree that they fail identically on pre-merge main, so they
are **not yours** (F-1521-2). Report them as observed; do not "fix" them in this slice.

READY-FOR-GATES. Report: the diff of `boardRow()`, the new test's assertions, the three gate counts
above, and the screenshot pair showing real times where em-dashes used to be.
