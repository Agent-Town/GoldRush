# Task SCI-02: epoch-gated families + mastery conversions (LANE-A, branch lane/m3, commit prefix "sci:") — FIRE-AUTHORED (attended review welcome)

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-a. READ FIRST: AGENTS.md; `specs/science-dimension/README.md` (LAWS + Vocabulary + "THE EPOCH-CONTRACT LAW" + Mechanics v1 are binding — this is slice **SCI-02**); `reviews/sci-01-research-loop.md` (what SCI-01 shipped and its F-SCI-01-1 note); `docs/GOLD_RUSH_BRIEF.md` §9.2 (frontier-tech, no firearms) + §9.4 (naming).

## ⚠️ Pre-flight — worktree-dirty guard (proven pattern; do NOT diff main↔lane)
The FIRE that queued this task already drained SCI-01 to main (graft-merge `6b6624c`) and verified lane-a carries no undrained work before refilling (§2E LANE-SAFETY is the fire's duty). Your only pre-flight job is to not clobber an in-progress run. **Do NOT use `git log main..lane/m3` or `git diff main lane/m3`** — graft-merge makes the lane tip a non-ancestor, and main moves ahead constantly (other lanes, attended edits), so BOTH false-positive and would make you wrongly STOP.
1. If `git status --short` in this worktree shows an **uncommitted implementation** (dirty tree from a live run) — STOP and report "worktree dirty; do not reset". Otherwise:
2. `git checkout lane/m3 && git reset --hard main && git clean -fd && npm install --no-audit --no-fund`; `npm run build` green before touching anything.
3. Confirm SCI-01 is present on the reset base: `src/meta/ResearchTree.ts` exists and `e2e/sci-01-research-loop.spec.ts` passes. If absent — STOP and report (means you're not on current main).

## Goal
SCI-01 shipped the research loop with THREE live launch nodes; the other 12 nodes read "prepare to…" placeholders. SCI-02 makes the **Arsenal Works** branch fully live and adds the **mastery-conversion** system: pool depth becomes combinatorial (empty-pool a + b from the spec) so the wave-30 wall can move **without stat inflation**. Playable checkpoint: take Arsenal nodes across runs → new epoch-gated card families enter the level-up offer pool; **max out a card family in a run → it converts to offering rare cross-family synergy cards** (e.g. firerate mastery feeds blast radius). Owner playtest gate afterward: does the wave-30 wall move? (that sign-off is Robin's, not this task's.)

## Scope
1. **Epoch-1 families bundle `assets/contracts/epoch-1-frontier/families.json`** (NEW — per THE EPOCH-CONTRACT LAW §2; the *registry* that loads it is SCI-04, so for now load it directly). Define, as data:
   - **Epoch-gated card families**: each family = { id, branch, unlockNodeId, cards[] } where cards are UpgradeDef-shaped additions that ONLY enter the run pool once `unlockNodeId` is taken. Ship the Arsenal families gated behind existing SCI-01 nodes (`chain_spark_primer` → the Chain Spark Arc family SCI-01 already stubs; wire it fully here) plus at least ONE more Arsenal family behind `beacon_cadence` or `powder_math` (your pick per spec branch text), and the **pact-card family** (Prospecting risk-trades) behind the Prospecting late node. Every existing 14 def stays ungated (epoch-1 baseline).
   - **Mastery-conversion rules**: `{ whenFamilyMaxed: <familyId>, offers: <synergyCardId[]> }` — when every card in a family is at maxStacks, that family's slot begins offering the named rare cross-family synergy cards. Ship the canonical one from the spec: **firerate/arsenal mastery → a blast-radius synergy card**, plus one economy-side synergy (prospecting mastery → a seam×stockpile synergy). Keep them legible ("what changed" fits one sentence).
2. **Pool assembly (`src/game/Upgrades.ts` + `src/game/Progression.ts`, additive only)**: extend SCI-01's `familyGate`/`isUpgradeUnlocked` path so the epoch-gated families' cards assemble into the offer pool when unlocked; add the **mastery-conversion offer step** in `Progression.eligibleDefs()`/offer assembly — additive, DEFAULTS OFF when no family is maxed and when no research callback is present (existing behavior byte-identical for a fresh profile). Do NOT rewrite SCI-01's gate; build on it.
3. **Synergy card effects**: implement each synergy card as a new UpgradeDef using EXISTING effect channels in `StatSheet.ts` where possible. If a genuinely new cross-family channel is required (firerate→blast coupling), add it **additively** in StatSheet (new optional field, zero effect when unset) — never alter existing stat math. Pool depth is combinatorial, NEVER inflationary: synergy cards recombine existing power, they do not exceed the era's stat caps (`assets/contracts/epoch-1-frontier/contract.v1.json` caps if present, else the current Balance caps).
4. **Node data**: flip the relevant Arsenal (and the one Prospecting late) node `effect` strings in `ResearchTree.ts` from "prepare to…" to live one-sentence descriptions matching what now actually happens. Leave Assay-branch + not-yet-built nodes as signposts (those are SCI-03).
5. **e2e `e2e/sci-02-families-mastery.spec.ts`** (seed via localStorage, both projects, zero console/page errors desktop+390):
   - a gated Arsenal family is ABSENT from offers before its node, PRESENT after (extends the SCI-01 assertion to the new families);
   - max a card family in-run via debug → a named mastery synergy card appears in the offer pool; before maxing it does not;
   - synergy card respects stat caps (no value exceeds the era cap — assert the computed stat stays ≤ cap);
   - SCI-01 loop still green (offer/pick/persist unchanged for a fresh profile).

## Firewall
Touch ONLY: `assets/contracts/epoch-1-frontier/` (new bundle data), `src/meta/` (families loader + ResearchTree node-text/registry data — NOT a new overlay), `src/game/Upgrades.ts` (family defs + gate, additive), `src/game/Progression.ts` (mastery + gated-family assembly, additive), `src/game/StatSheet.ts` (ONLY additive optional channels if unavoidable), `src/game/Balance.ts` (ADDITIVE knobs only), diagnostics + `src/vite-env.d.ts` (additive), the new spec. 
**NO changes to**: Economy (sole gold writer — research/mastery spend NOTHING in-run), CombatSystem, wave scheduler, sim timestep, determinism/event-log invariants, MetaProgress track semantics (science = step count, extend via your own storage), `src/ui/DeathOverlay.ts` overlay STRUCTURE (you may pass it new node data via existing props, but do not restructure the SCI-01 overlay), any existing e2e spec.

## Self-check (end with READY-FOR-GATES + files touched + results)
- `npx tsc --noEmit` clean; `npm run build` green.
- `e2e/sci-02-families-mastery.spec.ts` green desktop + mobile.
- Regression green both projects: `e2e/sci-01-research-loop.spec.ts`, `e2e/m1-06-level-up-choices.spec.ts` (offer pool), `e2e/m1-01-claim-jumpers-death.spec.ts`, `e2e/m2-01-build-menu.spec.ts`.
- Fresh-profile behavior byte-identical (no gated family, no mastery offer) — prove with the m1-06 pass.
- Canon: every new card/family/node name is frontier-tech, no firearms (§9.2), naming §9.4; synergy "what changed" copy in the Elder/ledger voice (§5).
- Before/after screenshots (a gated Arsenal family offer appearing; a mastery synergy card in the pool) → `artifacts/sci-02/`.
- Combinatorial-not-inflationary confirmed: note in your report which existing stat channels the synergy cards reuse and that no cap is exceeded.
