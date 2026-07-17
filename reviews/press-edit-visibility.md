# reviews/press-edit-visibility — the editor must SHOW what it edits (P1 owner playtest)

- **Slice:** lane-c-press-edit-visibility (OWNER PLAYTEST P1 — "I used Raise twice, the map did not change… I placed a Spring Pond, but I could not see it")
- **Branch / tip:** lane/e2-arsenal @ `e7ad52fa5f5e84f8a7ca423cf1d95e9e442d9229` (runner done-move `20260717-200849-lane-c-press-edit-visibility.md`)
- **Drain commit:** `a1253934f600a69c697308ae9e9c8b30935878b2` (stale-base 3-way graft onto main; ⚠ comingled into the s726 lock commit — see F-3)
- **Fire:** s724 staged the graft + wrote this review (died before commit); s726 gated + landed it · 2026-07-17

## Verdict
**MERGE (green).** The engine was sound; the mirror was missing. This slice wires the render-side consumers so the editor's raise/pond edits are visible live and survive a stamped launch, and adds THE HONESTY LAW UI (dirty hint + a launch-only tag) so a tool that edits invisibly is no longer indistinguishable from a broken one. Directly answers Robin's playtest flow.

## What it does (one paragraph)
In the `?editor` inspector, brush raises and Spring Pond placements now update the editor's ground view within the gesture (the render-side delta consumer is refreshed on edit), the pond gets a minimal render-only water-disc consumer, and both channels are verified to carry through `compileCharter` so a stamped charter's raises + ponds render in the launched run. The Press panel gains three optional hooks (`nameDraft`, `onNameDraftChanged`, `onStamped`) so the inspector can keep a live name draft and react to a stamp; a DIRTY indicator warns "un-stamped edits are lost on reload" whenever edits exist. Plain boot stays byte-identical inert (the feature is `?editor`-only — this is the correct answer to Mistake #10's "where does the PLAYER see this in a plain boot?": nowhere, by design, and the spec asserts inertness).

## Evidence (real numbers, isolated scratch server 5231, single-worker, both projects)
| Suite | Result |
|---|---|
| `npx tsc --noEmit` | clean |
| `npm run build` | green, 898ms |
| `press-edit-visibility.spec.ts` (own spec) | **6/6** (3 desktop + 3 mobile): raise+pond live→survive launch · dirty-draft warns+lost-on-reload · plain boot inert |
| `cp04-lever` + `cp03-press-loop` (s726 re-gate, single-worker 5231, both projects) | **36/36 green** — cp04-lever **24/24** (the Lever face survives the 3-way graft, positively confirmed), press-edit own spec 6/6, cp03-press-loop 6/6 |

Isolation: dedicated `playwright.s724-scratch.config.ts` self-booting dev server on 5231, away from attended's live MP/vite servers (Mistake #12 avoidance).

## Merge classification (base `5e40ae6d123a3865353c91d8d82f95cac34e0e7b`, 3-way graft — lane forked far behind main)
| File | Class | Resolution |
|---|---|---|
| `src/charter/PressPanel.ts` | **MAIN-MOVED (cp03+cp04, +135 lines)** | 3-way: applied the lane's 9-line delta (3 optional opts `nameDraft`/`onNameDraftChanged`/`onStamped` + input listener + `onStamped?.()` after stamp) ON TOP of main's current file — **cp04's Lever face fully preserved** (verified: cp04-lever suite green + Lever markup intact). |
| `src/editor/DescriptorInspector.ts` | LANE-TOUCHED only (main did not move it since base) | took lane version wholesale; it wires the 3 new PressPanel opts. |
| `src/editor/TerrainBrush.ts` | LANE-TOUCHED only | took lane version wholesale. |
| `src/editor/descriptor-inspector.css` | LANE-TOUCHED only | took lane version wholesale. |
| `src/world/Terrain.ts` | LANE-TOUCHED only | took lane version wholesale (render-side delta consumer refresh + pond disc). |
| `e2e/press-edit-visibility.spec.ts` | NEW | free. |
| `reviews/shots-press-visibility/*.png` (4) | NEW | free (dirty-hint, pond-in-run, pond-preview, raise-before-after). |

Only PressPanel.ts required 3-way judgment; the other four src files were clean lane-takes (confirmed `git diff <base> main -- <file>` EMPTY for each = main never touched them since the lane's fork).

## Findings
- **F-1 (non-blocking, resolved-in-merge):** The lane's base (`5e40ae6d`) predates cp03/cp04, so its PressPanel.ts was the pre-Lever shape. A blind copy would have clobbered cp04's child-height Lever (F-2 warning carried from s723). Resolved by hand-applying only the lane's additive 9-line hook delta; cp04-lever suite proves the Lever survives.
- **F-2 (housekeeping):** `playwright.s724-scratch.config.ts` is a tracked-avoided scratch config left in the working tree for reproducibility; a permitted session may delete it (rm is fire-gated). Same class as the carried `playwright.s723-scratch.config.ts`.
- **F-3 (cosmetic, comingle — non-blocking):** s726 took the lock with `git add STATUS.md && git commit` while s724's graft was already staged in the index → the plain `git commit` swept the full graft into the lock commit `a1253934` (the `plain-commit-sweeps-staged-index` hazard). `git reset --soft` to split is sandbox-gated, so the content stays under a lock-message commit. Correctness is unaffected: the graft was gated GREEN post-commit (tsc/build/36-spec) before any push. Same accepted pattern as s721's F-1. Drain bookkeeping (this review + goal leaf + gazette) lands in the following commit.
