# Lane C / DOCS: animation-pipeline process doc — DOCS ONLY (lane-c, prefix "polish:")
**FIRE-AUTHORED (s233, attended review welcome).** Enhanced the bare s9-era stub with a house pre-flight + explicit gates. DOCS-ONLY task — writes one markdown file, touches ZERO source/spec/test.

## Role + workdir
You are Codex on the **lane-c** slot = `worktrees/lane-c` (branch `lane/polish`). Auto-commit on the lane branch (runner does this). Do NOT touch STATUS.md, other lanes, or any src.

## READ-FIRST (the evidence trail this doc distills)
- `assets/LEDGER.md` (pipeline v2 header + batch entries)
- `assets/requests/` batch logs (batch-003 … batch-005R3) + any `codex-art-run-*.md` run files
- `specs/` VP-02 sprite-animation slices (rotation/completion/action cell conventions)
- `scripts/extract-alpha.mjs` (the magenta-key + `--grid CxR` extraction command surface)

## PRE-FLIGHT (LANE-SAFETY — safe-dupe reset, s233-verified loss-free)
`lane/polish` tip `197ac37` (night-shift) is a **content-merged safe-dupe** — its content is on main as `c2d8062` (VERIFIED s233: `git merge-base --is-ancestor c2d8062 main` = true). So bringing the lane current is loss-free:
1. Run `git checkout -B lane/polish main` to reset the lane worktree to current main (drops only the `197ac37` night-shift dupe, whose content is already on main).
2. GUARD: if `git rev-list --count main..lane/polish` is > 1 BEFORE the reset, STOP and report — do NOT reset (an undrained predecessor may be present). As of authoring it is exactly 1 (safe).

## SCOPE (numbered, each testable)
1. Create `docs/pipelines/animation-pipeline.md` — the standing process for animating ANY new character/thing, distilled from the READ-FIRST trail:
   - cell-map template (rotation 4×3 + completion 4×2 + action sheets), with the pixel dimensions actually used;
   - prompt skeleton: style-anchor sentence + consistency clauses + reference-conditioning rule;
   - magenta `#ff00ff` key + `node scripts/extract-alpha.mjs --key ff00ff --grid CxR` extraction commands;
   - per-cell QA checklist (heights vs existing bands, colour purity, no letters/mirrors);
   - the **explicit-cells-over-mirrors law** for asymmetric characters (why, with the failure it prevents);
   - contract-wiring steps (how the extracted sheet reaches an in-game slot);
   - gate/evidence requirements for an art batch to be DONE.
2. End the doc with a **fill-in-the-blanks worksheet** for a brand-new character (blank cell-map + blank prompt skeleton + blank QA table).

## TOUCH-ONLY
- `docs/pipelines/animation-pipeline.md` (new file — the ONLY write).

## NO (firewall)
- NO source/spec/test/asset edits. NO code. NO changes to `scripts/extract-alpha.mjs` or any existing doc.
- Do NOT invent pipeline steps not in the evidence trail — if a detail is unknown, write "UNVERIFIED — confirm with <source>" rather than guessing.

## SELF-CHECK (gates — docs task, no build/e2e needed)
- `npx tsc --noEmit` still clean (should be untouched — proves you edited no `.ts`).
- `git status` shows exactly ONE new file (`docs/pipelines/animation-pipeline.md`) and nothing else.
- The doc renders as valid markdown; every command in it is copy-pasteable; the worksheet is genuinely blank-to-fill.

READY-FOR-GATES + report: the new file path, word count, and which READ-FIRST sources were actually available vs missing (so a drain can spot gaps). DOCS review only — no product diff.
