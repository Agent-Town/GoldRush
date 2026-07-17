# Review — CP-04 the child-height lever

- **Slice:** CP-04 (charter-press spec, law 3 "THE CHILD-HEIGHT LEVER") — the kids' Press mode
- **Branch/tip:** lane/perf @ `ba436d1b5b31faab07e4fb97d793055d3e1df876` (runner commit `ba436d1b`, done-move `20260717-200849-lane-d-cp04-child-height-lever.md`)
- **Base:** clean descendant of `5e40ae6d` (pre-lock main) — verified `git merge-base --is-ancestor 5e40ae6d lane/perf` = YES
- **Drained by:** s723 fire, 2026-07-17
- **Verdict:** ✅ MERGE — gate clean; 13 initial adjacent failures all fingerprint-cleared as contention false-reds.

## What it does
Adds a second face to the already-shipped Charter Press engine (CP-01..03) — **"The Lever"**, a mode toggle inside the `?editor` Press panel. Per the spec's law 3 ("choose-not-configure"), a child operates three picture-card choices and one big press: **PICK A LAND** (the five E1 tiles), **PICK A STORY** (three pre-tuned template charters — defend / explore-quiet / big-build), **PICK WHO VISITS** (three wave-flavor presets — gentle / classic / busy). Then the lever stamps through the *same* validator-gated `stampCharter` path and launches. No blank canvas, no numbers, no reachable failure state: all 5×3×3 = 45 combinations are proven to stamp and boot. New face, same ratified machine — no changes to compile/stamp/import logic.

## Evidence
| Gate | Result |
|------|--------|
| `npx tsc --noEmit` | clean |
| `npm run build` | green (built in 1.21s; all `?raw` imports resolved) |
| `e2e/cp04-lever.spec.ts` (own spec) | **24/24** desktop-chrome + mobile-chrome — 45-combination stamp/round-trip + 9 seeded boots + inert plain boot, zero validator rejections |
| `e2e/cp03-press-loop.spec.ts` (PressPanel-adjacent) | **6/6** desktop+mobile (single-worker, scratch 5234) |
| `e2e/cp02-charter-boot.spec.ts` + `e2e/task-025-*.spec.ts` (adjacent) | **28/28** desktop+mobile (single-worker) |
| Boot probe (zero console/page errors, desktop 1280 + mobile 390) | green via cp04 inert-boot + cp03 plain-boot specs |
| Screenshots | `reviews/shots-cp04/{lever-mode,land-cards,stamped-launch}.png` |

## Merge classification
Clean additive graft onto current main. cp04 = `5e40ae6d` + 7 files (2 modified, 5 new); main since only added the s723 STATUS lock (`d0db7610`, disjoint). Per-file:
- **NEW (no conflict):** `e2e/cp04-lever.spec.ts`, `src/charter/templates/LeverTemplates.ts`, `src/charter/press-panel.css`, 3× `reviews/shots-cp04/*.png`
- **MODIFIED (LANE-TOUCHED only, main untouched):** `src/charter/PressPanel.ts` (mode toggle + Lever face; +135/−20)

## Findings
- **F-1 (non-blocking, resolved-as-contention):** the full 5-spec × 2-project × 2-worker gate battery threw 13 reds (cp02-boot mutants ×5, cp03-press-loop ×2, task-025 ×2, plus mobile dupes) while a live codex exec (press-edit-visibility on lane-c) + attended's multiplayer wrangler dev-servers hammered the box. Fingerprinted: every failing spec passed **single-worker in isolation** (cp03 6/6, task-025+cp02 28/28). Two of the three suites (cp02-boot, task-025) provably cannot be cp04-caused — neither imports PressPanel/LeverTemplates/press-panel. Textbook "gate-battery contention false-reds."
- **F-2 (HANDOFF FLAG, not a cp04 defect):** `press-edit-visibility` was **running live on lane-c** during this drain and edits the SAME `src/charter/PressPanel.ts`. Its future drain is a **3-way graft, NOT blind-copy** — blind-copying its PressPanel.ts would clobber cp04's Lever face. Flagged in STATUS handoff.
