# Review — lane-board-era-chapters (THE BOOK: Contract Board → era chapters)

- **Slice/branch/tip:** `lane-board-era-chapters` · lane/m4 · board-era commit `1cf4b57b` (bottom of the lane/m4 stack; e8-physics `1bafa1b4` sits on top) · merge-base `ecae0676`
- **Verdict:** **REJECT — partial (surface redesign landed, dependent board specs not migrated).** Gate battery ran on the grafted tree; the slice's own code + spec are green, but 7 adjacent board specs (×2 projects = 14 reds) regress because the change renames/removes the board's testable surface and migrates none of the suites that drive it.
- **Reviewed by:** s755 fire (headless), 2026-07-20.

## What it does
Reworks `TownScene.renderBoard()` from the flat 1/41 contract carousel into **era chapters** per the owner directive (2026-07-18, verbatim in the master): contracts group under a per-epoch chapter (era name + `townEraAccent` styling), navigation becomes per-chapter **tabs** (`contract-chapter-tab-*`) instead of per-contract **dots** (`contract-page-dot-*`), the title becomes **"The Book"** (`contract-board-title`), and — the load-bearing law — **epochs beyond the profile's reached frontier are absent from the DOM entirely** (no upcoming/successor preview cards; `renderUpcomingContractCard` deleted). `?debug` shows all chapters. Clean, faithful to the directive; the code itself is well-formed.

## Evidence (grafted onto clean main `e9b8b410` via manual 3-way — see classification)
| Check | Result |
|---|---|
| `tsc --noEmit` | ✓ clean |
| `npm run build` | ✓ built in 1.11s |
| `e2e/board-era-chapters.spec.ts` (own spec) | ✓ **6/6** desktop-chrome + mobile-chrome (14.1s) |
| **adjacent: `town-t3-board.spec.ts`** | ✗ **6 FAILED** desktop (asserts `contract-page-count` "1 / 41", `contract-page-dot-*`, per-contract nav — all removed) |
| **adjacent: `board-upcoming-surveys.spec.ts`** | ✗ **1 FAILED** desktop (asserts `contract-upcoming-*` + `contract-next-epoch` — deleted by design) |
| grep-confirmed at-risk (not yet run) | `board-gating-and-profiles`, `board-card-images`, `contract-briefings`, `fresh-scene-render-state`, `072-era-activation` all drive `contract-page-dot-*` / `contract-page-nav` / `contract-page-count` → will regress the same way |

## Merge classification (for the eventual clean re-land)
- `src/town/TownScene.ts` — **3-WAY** (main moved it +89/−29 since fork; lane moved it +93/−54). Hunks are genuinely **non-overlapping** (main @64–543 + @1938 + @2271-renderContractArt; lane @30-imports + @1498-renderBoard + @1575-selectBoardPage + @2231-boardPageIndexForContract). Manual weave applied cleanly, tsc+build green — the merge mechanics are NOT the problem.
- `src/town/town.css` (+96), `e2e/board-era-chapters.spec.ts` (new), 8 screenshots — **CLEAN ADDITIVE** (main == fork for town.css; rest new).

## Findings
- **F-1 (BLOCKING): the board surface redesign strands its dependent spec suite.** The master's firewall said *"TOUCH-ONLY the board render/nav in TownScene (+ its css) + your spec. NO contract data changes…"* and its self-check promised only *"your spec + wd02-barks + a tavern boot."* But renaming `contract-page-*`→`contract-chapter-*`, retitling the board, and **deleting the upcoming/successor preview** (an owner-directed removal) breaks every spec that navigates by per-contract dots, asserts the "N / 41" count, or asserts the pending-survey / next-epoch cards. Those specs test **now-superseded behavior** — this is the same shape as the s751 fix-town-spec-flow partial (shipped `READY-FOR-GATES` without running the adjacent surface). It cannot merge until the dependent suites are migrated to the chapter model (and `board-upcoming-surveys` retired/rewritten, since "secrets kept" reverses its entire premise).
  - **Corrective authored + queued:** `tasks/board-era-chapters-v2.md` (FIRE-AUTHORED) — same redesign, firewall **widened** to migrate the dependent board specs to the chapter surface and retire the obsolete upcoming-survey assertions, self-check names the full board-spec set both projects.

## Disposition
- Graft **REVERTED** — main tracked tree back to `e9b8b410` (TownScene.ts / town.css `git diff HEAD` EMPTY). No merge, no gazette, no deploy.
- Salvage preserved: **lane/m4 `1bafa1b4`** untouched (holds board-era `1cf4b57b` + e8-physics; do NOT reset lane-b).
- The lane's own spec + 8 review screenshots remain staged in the main-worktree index (fire cannot `rm`/`reset`/`restore --staged` — all sandbox-gated); harmless, path-scoped commits only; owner/attended cleanup.
