# Review — SCI-01 research loop v1 (lane-a / lane/m3)

**Verdict: PASS — merged to main (s84 fire).**
Slice: `specs/science-dimension/` SCI-01. Implementer: Codex (worktrees/lane-a, branch `lane/m3`, commit `18e8021`). Drained by s84.

## Merge mechanics
- Lane base: `9a6909c` (s82 end — already contains profiles + m4 embodiment + agent globals). Main at drain time: `b1d5af2`→bookkeeping.
- **Clean drain, no 3-way graft.** `git diff --name-only 9a6909c main` shows main touched only assets/tasks/reviews/STATUS since the lane's base — **zero source files moved on main**. Every lane-touched `src/` file was MAIN-MOVED-ONLY=NO, so the lane versions grafted directly (`git checkout lane/m3 -- <files>`) with no conflict.
- Files landed: `src/meta/ResearchTree.ts` (new), `src/ui/DeathOverlay.ts`, `src/ui/theme.css`, `src/game/{Balance,Game,Progression,Upgrades,ProfileStorage}.ts`, `src/vite-env.d.ts`, `e2e/sci-01-research-loop.spec.ts` (new), `artifacts/sci-01/*` (impl screenshots).

## Firewall check
- All changes additive / within scope. Two files not name-listed in the task firewall but legitimate and in-spirit:
  - **Progression.ts** — the "assembly filter vs unlocked nodes" hook lives here (offer assembly). Adds `hasResearchNode?` option, `isUpgradeUnlocked` gate in `eligibleDefs()`, and the Assay-Grading offer-weight bonus. Defaults to unlocked when no callback → existing 14 defs stay ungated. `maxCoreForTest()` now iterates `eligibleDefs()` (test-harness safe).
  - **ProfileStorage.ts** (+2) — registers `RESEARCH_STATE_KEY` in `PROFILE_DATA_KEYS` so research state persists per-profile. Research uses its OWN storage module (RESEARCH_STATE_KEY), `tracks.science` = step count only — MetaProgress track semantics untouched, per firewall.
- No Economy / CombatSystem / wave scheduler / sim-timestep changes. Confirmed by diff.

## Gates (evidence)
- `npx tsc --noEmit`: **clean**.
- `npm run build`: **green** (423ms; pre-existing >900kB chunk warning only).
- `e2e/sci-01-research-loop.spec.ts`: **10/10** (desktop-chrome + mobile-chrome, 12.7s) — death→offer→pick persists across reload; victory bonus round; launch-node live effects; Chain Spark family absent-before/present-after; research registry follows active profile. Each test asserts `consoleErrors==[] && pageErrors==[]` on both viewports → boot probe (desktop 1280 + 390) folded in.
- Adjacent suites: `m1-01` + `m2-01` + `task-025`: **30/30** both projects (26.5s).
- **Total 40/40 green.** No env exceptions needed (host quiet; lane-b m4-07 was mid-run but did not perturb these isolated runs).

## Canon review — §5 voice / §9.2 / §9.4 naming — PASS
- Overlay voice: "The Elder proposes…", "Science Banked / The Elder folds the note into the town ledger.", "Research pick N of M", "Skip banks nothing." — matches the Run Ledger parchment tone (§5).
- Meter copy: "Science: N steps — M to the Steamworks (locked)" — epoch naming per VISION-EPOCHS (§9.4).
- Node vocabulary is frontier-tech, no firearms (§9.2): Assay Grading, Chain Spark Primer→"Chain Spark Arc cards", Second Order Slot, Powder Math / Blast mastery (mining charges, canon since m2-06 arsenal-blast-charge), Brass Coil Standards, Beacon Cadence, Prospector Lessons. The agent is "the Prospector" throughout.
- Screenshots (impl-produced, corroborated by my green e2e of the same flows): `reviews/shots-sci-01/` — research overlay, meter-after-pick, gated-family-offer × desktop + mobile.

## Findings
- **F-SCI-01-1 (note, non-blocking):** node `effect` strings for the 12 not-yet-live nodes read "… prepare to …" — intentional v1 signposting (only 3 launch nodes have live effects per spec). Wire real effects in SCI-02+ as families come online. No action this slice.

## Playable checkpoint
die → Elder proposes 2 nodes → pick 1 → persists → next run's offer pool visibly shifts (gated family appears / prospecting weight rises); meter advances toward the 6-step Steamworks threshold; victory grants a bonus pick round. Verified via the SCI-01 e2e.
