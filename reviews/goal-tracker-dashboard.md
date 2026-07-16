# reviews/goal-tracker-dashboard.md

- **Slice:** goal-tracker-dashboard (lane-b; "feat:") — the goal tree + REGISTRATION LAW (owner-authored 2026-07-16)
- **Branch/tip:** lane/m4 @ 18e09e7e (runner(lane-b) commit)
- **Base:** 270a96af; **Merge commit:** 3f31671c
- **Verdict:** ✅ SHIPPED — factory-internal tooling, gate green, goals.json git-truth verified.

## What it does
Answers the owner's ask ("big goals at the top, subgoals under, leaf tasks under those, graph kept updated so we don't miss anything"). Introduces `tasks/goals.json` — a goal → subgoal → leaf tree (leaf = `{id, title, taskFile?, mergeHash?, status}`), seeded from **git truth** (not memory): 5 goals (The Ten Eras / The 3D World / The Stream / Marketing / Factory Infra), 15 subgoals, 79 leaves. `scripts/dashboard-gen.sh` gains a collapsible-outline renderer with per-subgoal progress bars and **ancestry-verified** merged-detection (a leaf whose `taskFile` is in `tasks/done/` AND whose merge is an ancestor of main auto-reads "merged" — never hand-statused). The **GOAL REGISTRATION LAW** is appended to `scripts/fire.md` (duties D + E) and the BACKLOG header: every authored master adds its leaf same-commit; every drain flips the leaf's status + merge hash in the drain commit.

## Evidence
| Gate | Result |
|------|--------|
| `node --test scripts/goal-tracker.test.mjs` | **2/2 pass** — schema valid + 10 sampled merged leaves each have a done receipt AND ancestral merge (git-verified, ~8.7s) |
| `npx tsc --noEmit` | clean (exit 0) |
| `npm run build` | ✓ built in 650ms (goals.json/dashboard-gen are out-of-band; app unaffected) |
| goals.json truth spot-check | 3 independent sample hashes (`7af56d62`/`22af8fd9`/`0bb7c071`) confirmed `git merge-base --is-ancestor … main` ✓ |
| Rendered output | `artifacts/goal-tracker-dashboard/dashboard.html` + desktop/mobile screenshots committed by runner |
| Player visibility | none — internal factory dashboard tool, not in the game (no gazette) |

## Merge classification (base 270a96af)
| File | Class | Resolution |
|------|-------|-----------|
| `tasks/goals.json` | NEW | free (then s636 flipped 4 this-fire leaves building→merged w/ full hashes, per the new law) |
| `scripts/goal-tracker.test.mjs` | NEW | free |
| `artifacts/goal-tracker-dashboard/*` | NEW | free |
| `scripts/dashboard-gen.sh` | LANE-TOUCHED | clean (main untouched) |
| `scripts/fire.md` | LANE-TOUCHED | clean (main untouched; +1 registration-law line after §E) |
| `tasks/BACKLOG.md` | MAIN-MOVED | **auto-merged clean** — lane added the law at the top header (line ~6); s636's prior edits were at lines 317/336/341 (disjoint hunks) |

## Findings
- No blocking findings.
- **Registration law now in force**: s636 immediately applied it — the four leaves merged this fire (world-mask-tables `de9cbcc2`, world-era-anchors `561281a3`, factory-goal-tree `3f31671c`, e5-art `20e27ff6`) flipped building→merged with full 40-char hashes in the bookkeeping commit; e5-maps (deepwater-tile) flips when its drain lands next.
- F-goaltree-1 (non-blocking): the test enforces 40-char full mergeHash — future drains must use `git rev-parse` full hashes, not short. Noted for the next fire.
