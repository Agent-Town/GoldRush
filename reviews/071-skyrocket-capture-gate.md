# reviews/071-skyrocket-capture-gate.md — POST-HOC GATE (s286, 2026-07-10)

**Slice:** 071-skyrocket-capture-gate (main slot; from `F-SOL-PRODUCT-001 [P1]`, `reviews/sol-findings-product-content-accessibility.md`). CANON (lore/characters.md, ratified): beating the Baron *captures* the sky-rocket science into E2 — "pride's tuition." The old code named the node "Captured Baron science" but gated it on `powder_math` only, and the capture beat listened for a flag nothing set.
**Branch/tip:** main. **Merged at:** `277c22b` (see MERGE CLASSIFICATION — arrived UNGATED, mislabeled).
**Verdict:** ✅ **PASS (post-hoc).** The already-on-main code is correct and gated green after the fact.

## What it does
1. **Sky-Rocket Battery node is now genuinely GATED on the Baron capture.** The old `applyResearchUnlockFlags()` (which silently AUTO-*took* the node when `rocketCartCaptured`) is deleted and replaced by a real availability gate `nodeAvailable()` in `src/meta/ResearchTree.ts:445`: `if (node.id === SKY_ROCKET_BATTERY_NODE_ID && !state.unlocks?.rocketCartCaptured) return false;`. `unlocks` is now persisted on `ResearchState`. The node stays LOCKED (not researchable past `powder_math`) until the Baron is defeated. (Scope item 1.)
2. **The capture beat fires on the real signal.** `Game.ts:2950` calls `this.publishDiagnostics()` right after the Baron-defeat research reload so the capture propagates; `src/story/beats.ts` reads `hasRocketCartCaptured` (from `Medals`) and is retyped to `RuntimeStorySignal`. Defeat → capture flag (medal) → node available → beat. (Scope item 2.)
3. **Save-compat:** veterans who already banked the node keep it (the gate only blocks *availability* of an un-taken node; taken nodes remain in `state.taken`); the capture flag derives from the existing Baron medal on load. (Scope item 3 — verified by the veteran-migration e2e.)

## Evidence (post-hoc gate, s286)
| Check | Result |
|-------|--------|
| `npx tsc --noEmit` | clean |
| `npm run build` | green (561 modules, 400ms; only pre-existing chunk-size warning) |
| `e2e/057-baron-rocket-cart.spec.ts` (scratch 5199, `--workers=1`, desktop-chrome + mobile-chrome) | **10/10 PASS** |
| — `:345` "Sky-Rocket Battery requires Baron capture and preserves veteran profiles" | PASS both (the 071 core: gate + veteran migration) |
| — `:289` "defeating the Baron captures the cart, shows the medal line, and unlocks captured research" | PASS both (the capture beat) |
| — `:240` "kited Baron telegraphs and launches rockets … damage through CombatSystem" | PASS both |
| — `:264` melee suppression / `:374` deterministic volley targeting | PASS both |
| `e2e/research-chart.spec.ts` (both projects) | all PASS (:104 icon/reveal parity, :121 node states + pin, :186 pinned path, :210 fresh no false marks, :219 exhausted frontier) |
| `e2e/ss-02-beats.spec.ts` (both projects) | all PASS (:178 23 attributed two-line E1 beats, :193 full E1 thread once, :346 Tales-off silence) |

## Merge classification — ⚠ arrived UNGATED via runner broad-add
071's uncommitted main-slot src/e2e (`ResearchTree.ts`, `Game.ts`, `story/beats.ts` + `StoryRuntime.ts` + `story/index.ts`, `ui/ResearchChart.ts`, `e2e/057-baron-rocket-cart` + `research-chart` + `ss-02-beats`, `artifacts/057|060|ss-02`) was swept onto main **inside the runner's ART commit `277c22b` ("runner(art): art-kit-era-9-retake")** by a broad `git add`, comingled with 073 and the legit kit-era-9 art; NO gate battery, NO review, MISLABELED; the commit also deleted `tasks/queue/main/071-skyrocket-capture-gate.md`. Same recurring **F-en02-1 / F-058-1** runner defect. This s286 post-hoc gate is the retroactive drain; code intact and correct.

## Findings
- **F-071-1 = F-073-1 (recurring runner broad-add):** see `reviews/073-tier-param-crash.md` — the runner sweeps uncommitted main-slot src into art commits; third+ instance. Root fix in the runner (path-scoped per-slot adds), attended/runner-owner. Tracked in BACKLOG.
- **F-071-2 (env, non-blocking, PROVEN):** a first combined 6-worker run timed out on `057:240` + `057:289` (both projects) at `page.screenshot`/`waitForTimeout` — pure CPU contention (lane-d ed-01 codex + attended dev server on 5188 + my scratch server on 5199 + 6 workers). Re-run of the full 057 file at `--workers=1` → **10/10 green**. The 057 combat-sim tests need serial CPU under this load; not a regression.
