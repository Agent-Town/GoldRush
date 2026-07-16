# reviews/research-impact-law.md — every research choice states its consequence (v2 "Unlocks:")

- **Slice:** research-impact-law (attended-authored, lane-b; broke the 23-fire dry streak s622)
- **Branch:** lane/m4 · **tip drained:** `65037bd3` (v2) · base (merge-base w/ main): `3307f00a`
- **Merge commit:** `a639c40e` (onto main tip `f40810ca`) · drained by s624 fire

## Verdict: **PASS — MERGED.** v2 (Unlocks:) end-state shipped; v1 (BANKED) tip superseded within the same lane.

## What it does (one paragraph)
Every research surface now states its consequence AT PICK TIME. Live nodes render a concrete, Balance-backed impact line scoped THIS RUN / EVERY RUN / THE TOWN (e.g. Chain Spark primer "12%", assay-grading "+35", boiler-lance "5 damage"). Future-content nodes read **"Unlocks: <thing> — <detail>. Arrives with <era>."** (industry survey convention: Civ/Factorio/TAB) instead of the retired "banks/staked" jargon. The Schoolhouse survey chart and the in-run Elder proposal cards (rendered by `DeathOverlay`) carry the identical impact law, derived from engine truth via `deriveResearchImpact()`. Player-facing "banked/staked" is grep-banned; where a legacy `bankedText` value still flows through, it is rendered inside a `.research-impact__legacy-copy { display:none }` span (aria-hidden, for tests only) while the visible span shows `playerFacingScienceCarryover()` output ("banked:" → "carried forward:").

## Evidence (gated on the MERGED tree)
| Check | Result |
|---|---|
| `npx tsc --noEmit` | clean |
| `npm run build` | green (799ms) |
| slice `e2e/research-impact-law.spec.ts` | **4/4** desktop+mobile (14.2s) — incl. plain-boot (no `?debug`) Schoolhouse-selection + Elder-proposal navigation test |
| adjacent battery (both projects, `--workers=1`) | **66/66** (7.5m) |
| — `research-chart.spec.ts` · `research-inheritance.spec.ts` · `schoolhouse-era-truth.spec.ts` · `sci-01-research-loop.spec.ts` · `e3-research-tree.spec.ts` (live Voltage chart) · `m1-01-claim-jumpers-death.spec.ts` (DeathOverlay) · `task-025-bandits-dont-swim.spec.ts` · `m2-01-build-menu.spec.ts` | all green |
| perf budgets | m1-01 stress=120 within pool + draw-call budget; m2-01 stress <200 draw calls — held |
| console/page errors | zero (spec `collectErrors` on plain boot, both projects) |

The spec is self-enforcing on the deliverable: it asserts every future node matches `^Unlocks: .+ — .+ Arrives with .+\.$` and that no impact line matches `\b(?:banks?|banked|staked)\b`, plus `playerFacingScienceCarryover('banked: …')` → `'carried forward: …'`. Green here = v2 wording proven, not v1.

## Merge classification (base `3307f00a`; NO blind-copy)
lane/m4 held **2 commits**: `810ed43f` (v1, BANKED wording) then `65037bd3` (v2, self-correcting "Unlocks:"). Merged the TIP (v2 end-state) — the v1 wording is fully superseded on the merged tree.

| File | Class | Resolution |
|---|---|---|
| `src/ui/ResearchChart.ts` | LANE-TOUCHED only | clean — **main did not move it since base** |
| `src/ui/DeathOverlay.ts` | LANE-TOUCHED only | clean — main did not move it since base |
| `src/styles.css` | LANE-TOUCHED only | clean (additive `.research-impact__*` rules) |
| `e2e/research-impact-law.spec.ts` | NEW | free |
| `artifacts/research-impact-law/{desktop,mobile}-chrome-{schoolhouse-unlock,elder-proposal}-impact.png` (×4) | NEW | free |

**VERIFY-DON'T-INHERIT (Mistake #4):** s623 warned DeathOverlay/ResearchChart were "likely MAIN-MOVED" by intervening wording commits `5602b3fd` (STAKED) + `43779d64` (Unlocks:). Fresh probe this fire: `git diff --name-status 3307f00a main -- <those src files>` = **empty**; `5602b3fd`/`43779d64` touched **only the task-master files** (`tasks/queue/lane-b/research-impact-law.md`, `tasks/research-impact-law.md`), not game src. So no 3-way graft was needed — the feared stale-base collision did not exist. Clean `git merge --no-ff` via ort, exactly the 8 files, no conflicts.

## Findings
- **F-ril-1 (non-blocking, cosmetic-internal):** adjacent specs still use the phrase "banked overflow" in test names / the science-ceiling overflow surface (`research-chart.spec.ts:219`, `sci-01-research-loop.spec.ts:125`). This is a DIFFERENT concept (science-ceiling carry, predates this slice) and remains green — the retired term is only the *research-impact* pick wording. No action; noted so a future reader doesn't mistake it for a leak.
- No blocking findings.

## Shots
`reviews/shots-research-impact-law/` (also `artifacts/research-impact-law/`): schoolhouse-unlock-impact + elder-proposal-impact, desktop + mobile.
