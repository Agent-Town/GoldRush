# reviews/t9-ceremony.md

**Slice:** T9 — the Red Fields era door E9→E10 (THE GENERATION ARK), slice 4/5 of THE SAGA WALL (F-REH-01, P0 release-blocker).
**Branch/tip:** `lane/e2-arsenal` (worktrees/lane-c), runner commit `401770d2` `runner(lane-c): lane-t9-ceremony.md`.
**Base:** `82b74cdb` (the s-triage queue commit — an ancestor of main; main untouched T9's files since).
**Drained onto main:** path-scoped graft of the 3 code/contract files (`src/ceremony/scripts.ts`, `e2e/ceremony-framework.spec.ts`, `assets/contracts/epoch-9-redfields/manifest.json`).

## Verdict
**PASS — MERGED.** tsc clean · build green · `ceremony-framework` **26/26 both projects** (the two new T9 GENERATION ARK cases GREEN + all T3–T8 precedents still green) · zero console/page errors.

## What it does
Adds the fourth saga-wall door: the E9 (Red Fields) → E10 ceremony, THE GENERATION ARK. Per the played-not-watched law, idle arms nothing — the player's HAND drives it: carrying the tree seed alone arms E10, exactly once, through the single `activateEpoch` seam, and the armed era survives a reload. The `epoch-9-redfields/manifest.json` successor wiring is closed (`successor: null` → the real E10 successor), extending the saga chain past T8. Follows the T3/T4/T5 script grammar and the T6–T8 precedents (`src/ceremony/scripts.ts` +46). The spec extends `e2e/ceremony-framework.spec.ts` (+83) with the T9 cases per the T4/T5 grammar: door-ready, hand-gates, arms-exactly-once, kept-image, reload persistence, zero console, both projects.

## Evidence (real numbers, gated on the MERGED tree)
| Gate | Result |
|---|---|
| `npx tsc --noEmit` | clean (exit 0) |
| `npm run build` | green — built in 1.39s |
| `ceremony-framework.spec.ts`, both projects (`playwright.s931-scratch.config.ts`, port 5266, workers=1) | **26 passed (4.5m)** — 13 tests × 2 projects, zero console/page errors |

New T9 cases confirmed green both projects: `T9 THE GENERATION ARK: carrying the tree seed alone arms E10 and survives reload` (`ceremony-framework.spec.ts:702`). Precedent doors T3 (`:220`), T4 (`:306`), T5 (`:375`), T6 (`:436`), T7 (`:515`/`:529`), T8 (`:612`), the replay/derived-door invariant (`:782`), and the science-ceiling gate (`:805`) all remained green — no regression from the new script/manifest.

## Merge classification
Base `82b74cdb` is an ancestor of main; `git diff --name-only 82b74cdb main -- <the 3 files>` = empty (main never touched T9's files since base). All LANE-TOUCHED → clean path-scoped graft, no 3-way needed. The runner's 6 `artifacts/ceremony-framework/*t9*.png` were left on the lane branch (test outputs, not merged to main); the 26/26 pass on the merged tree is the authoritative evidence.

| File | Class | Resolution |
|---|---|---|
| `src/ceremony/scripts.ts` | LANE-TOUCHED only | clean graft |
| `e2e/ceremony-framework.spec.ts` | LANE-TOUCHED only | clean graft |
| `assets/contracts/epoch-9-redfields/manifest.json` | LANE-TOUCHED only | clean graft (successor wiring) |

## Findings
- **F-931-2 (advances F-REH-01):** T9 lands; the saga now arms E1→E10 **except** the E10 finale door (T10, slice 5/5) — F-REH-01 is NOT yet fully closed. T10 (the saga's last room / finale) remains laddered (`tasks/lane-t6-t10-ceremonies.md` T10 section), owner/design-flagged per prior handoffs. No blocker in this slice.
- No blocking findings. Played-not-watched, arm-once, and reload-persistence invariants all hold under the T4/T5 grammar assertions.
