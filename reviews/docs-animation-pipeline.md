# Review — lane-c docs: animation-pipeline (DOCS-ONLY)

- **Slice:** lane-c-docs-animation-pipeline (FIRE-AUTHORED s233, drained s234)
- **Branch/tip:** `lane/polish` runner commit `bb35479` ("runner(lane-c): lane-c-docs-animation-pipeline.md")
- **Base:** lane/polish reset to `f489f86` (safe-dupe of main at author time); merged onto main `c22ffe2` → `9dcc0d4` (lock).
- **Verdict:** PASS — clean single-file add, merged.

## What it does
Adds `docs/pipelines/animation-pipeline.md` (272 lines / ~2004 words): the standing process for animating any new character/companion/enemy/prop. Distills the art-pipeline law that is easy to lose reading only code — the Frontier Ledger style anchor (verbatim), canon guardrails (no firearms/gore/Native-American imagery/text per brief §9), the cell-map templates actually used (rotation 4×3, completion 4×2, action sheets) with the real raw/native pixel dimensions, the `#ff00ff` magenta key + `node scripts/extract-alpha.mjs --key ff00ff --grid CxR` extraction surface, the explicit-cells-over-mirrors law for asymmetric characters, contract-wiring steps to `characters.v2.json`, and DONE/evidence gates for an art batch. Ends with a genuinely blank fill-in-the-blanks worksheet (blank cell-map + prompt skeleton + QA table) for a brand-new character. Both scope items present.

## Evidence
| Gate | Result |
|---|---|
| `npx tsc --noEmit` | clean (no output) — proves zero `.ts` touched |
| `npm run build` | ✓ built in 289ms (pre-existing >900kB chunk warning only, not an error) |
| Byte-verify `git diff lane/polish -- docs/pipelines/animation-pipeline.md` | EMPTY (merged == lane) |
| File on main pre-drain | ABSENT (`git cat-file -e main:…` → does not exist) → clean add, no 3-way |
| Canon QA | style anchor verbatim; no-firearms/no-gore/no-Native-imagery rules present; references real files (`SpriteAnimator.ts`, `characters.v2.json`, `extract-alpha.mjs`, `assets/requests/batch-00*`) |
| Content QA | commands copy-pasteable; worksheet genuinely blank-to-fill; dimensions match LEDGER-era raws (1254², 1700² walk4) |

No e2e/spec gate — DOCS-ONLY task (master §SELF-CHECK: "docs task, no build/e2e needed"); tsc+build run anyway to prove the tree stays green.

## Merge classification
- `docs/pipelines/animation-pipeline.md` — **LANE-TOUCHED** (new file, added by `bb35479`); absent on main → clean `git checkout lane/polish -- <path>` add, byte-verified.
- `STATUS.md`, `tasks/BACKLOG.md` — appeared in `git diff --name-only main lane/polish` as **MAIN-MOVED-ONLY** (lane base `f489f86` is behind main `c22ffe2`; s233's later commits advanced them). **NOT copied** — copying would revert s233's handoff/BACKLOG edits. Only the docs file grafted.

## Findings
None blocking. The doc self-marks any unknowns as "UNVERIFIED — confirm with <source>" per its firewall; no such markers were needed — all referenced sources exist in-repo.
