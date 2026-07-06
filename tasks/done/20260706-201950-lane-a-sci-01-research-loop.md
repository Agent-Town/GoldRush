# Task SCI-01: research loop v1 — picks, meter, first real nodes (LANE-A, branch lane/m3, commit prefix "sci:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-a. READ FIRST: AGENTS.md; specs/science-dimension/README.md (LAWS + vocabulary are binding — this is slice SCI-01); docs/VISION-EPOCHS.md pillars 3–4; docs/GOLD_RUSH_BRIEF.md §5 (voice) + §9.4 (naming).

## ⚠️ Pre-flight — queue-gated on the demo-profiles drain
This task may only run AFTER lane-a's demo-profiles output has been integrated to main. Check: if `git status --short` in this worktree shows uncommitted ProfileManager/ProfileStorage/DeathOverlay/Scoreboard changes — **STOP immediately and report "demo-profiles drain not landed"; do NOT reset, that would destroy finished work.** If clean: `git checkout lane/m3 && git reset --hard main && git clean -fd && npm install --no-audit --no-fund`; `npm run build` green before touching anything.

## Goal
The science meta-track exists as a zeroed skeleton. Build the v1 loop: after every run the Elder proposes 2 research nodes, the player picks 1, the pick persists, changes the NEXT run, and a meter shows progress toward the Steamworks epoch threshold. Playable checkpoint: die → pick → start a new run → the offer pool is visibly different.

## Scope
1. **NEW `src/meta/ResearchTree.ts`**: data-driven node definitions (epoch-1, three branches per spec: Prospecting Works / Arsenal Works / Assay Works — ship the tree STRUCTURE with 15 node slots but only the 3 launch nodes below need live effects); pure functions: `availablePicks(meta)`, `takeNode(meta, id)` (writes `tracks.science += 1` + node registry into the existing meta storage, versioned/migratable like MetaProgress); proposal roll = seeded 1-of-2 from unlocked-frontier nodes.
2. **Research overlay** (`src/ui/`): flows AFTER the Run Ledger (death AND victory paths); canon voice ("The Elder proposes…"); shows both proposals with one-sentence "what changes" text; keyboard + touch selectable; skippable (skip banks nothing — no pick hoarding v1). Victory grants +1 bonus pick (a second proposal round) per the spec's 027 principle.
3. **Science meter**: in the overlay + Run Ledger footer — "Science: N steps — M to the Steamworks (locked)"; threshold constant from the tree data (6 — owner pacing ruling 2026-07-06: epoch-1 turns over in ~4–6 runs).
4. **Three LIVE launch nodes** (one per branch, real effects, legible):
   - Prospecting: *Assay Grading* — seam/prospecting family cards additionally +stockpile cap (exact delta additive via Balance knob) AND the family's offer weight raised while ungated → the F5 dead-pick fix begins here.
   - Arsenal: *Chain Spark Primer* — unlocks ONE new epoch-gated card family (a single cross-family synergy card is enough for v1; mastery SYSTEM is SCI-02).
   - Assay: *Second Order Slot* — bench accepts 2 concurrent pending orders (UI copy only if 037/039 not yet merged — degrade gracefully, no hard dependency).
5. **Pool gating hook** in `src/game/Upgrades.ts`: additive `familyGate?: string` on defs + assembly filter vs unlocked nodes. Existing 14 defs stay ungated (epoch-1 baseline).
6. **e2e `e2e/sci-01-research-loop.spec.ts`**: seed meta via localStorage; die fast (debug) → overlay appears → pick persists across reload; victory path grants bonus pick (debug wave override); gated family absent before node / present after; meter math; zero console/page errors desktop + 390.

## Firewall
Touch ONLY: src/meta/ (new), src/ui/ (overlay + meter), Upgrades.ts (additive gate filter), Balance ADDITIVE knobs, Run Ledger flow hook in Game.ts (minimal, presentation-side), diagnostics + vite-env.d.ts additive, new spec. NO changes to: Economy (sole gold writer — research spends NOTHING in-run), CombatSystem, wave scheduler, sim timestep, existing e2e, MetaProgress.ts track semantics (extend via your own module's storage, keep tracks.science = step count).

Self-check: tsc/build; new spec green desktop+mobile; task-025 + m1-01 + m2-01 unmodified green both projects; overlay copy passes §5 voice + §9.4 naming; before/after screenshots (overlay, meter, a gated-family offer appearing) into artifacts/sci-01/. End: READY-FOR-GATES + files + results.
