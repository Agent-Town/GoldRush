# Task save-slots: curated saves — the player decides what history keeps (LANE-A, branch lane/m3, commit prefix "feat:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-a. READ FIRST: AGENTS.md; the run-suspend implementation (the snapshot format + wave-boundary serialization = THIS TASK'S FOUNDATION — reuse the envelope verbatim); save-visibility (this lane, just ahead — its pause line/tick coexist); ProfileTransfer (Pack-the-ledger export — slots must ride the bundle); the pause overlay + StartMenu. Pre-flight: safe-dupe rule (ahead-merged lane commits → `git checkout -B lane/m3 main && git clean -fd`, proceed; STOP only on unmerged content or foreign edits); npm install; build green. SEQUENCING: after save-visibility (this lane's queue).

## OWNER RULING (2026-07-08 ~07:05, verbatim)
"I want to decide when I want to save. I would like to have an active option with save games I can curate and rename over time. Auto save is cute but it will overwrite the game state I choose to conserve."

## The model
- **MANUAL SLOTS are sacred**: player-created, named, renameable, deletable — NEVER touched by automation. The AUTO-SAVE lives in its own reserved slot ("The Ledger's Copy") that manual saves never collide with. Curation is the player's; continuity is the machine's.
- **Save point semantics (v1-honest)**: a manual save stores the LAST COMPLETED WAVE's snapshot (the same boundary serialization restore uses) — the copy says so: "Saved: <name> — as of wave 12's end." No mid-wave state capture (explicitly out, consistent with restore).

## Scope
1. **The slot store** (per-profile, versioned envelope reused): up to 12 manual slots + the reserved auto slot; each {name (2–24 chars, profanity-light filter), wave, contract id+name, town name, timestamp, snapshot}. Measure snapshot size; state total budget (localStorage headroom check with a warm warning at ~80%).
2. **SAVE (in-run)**: pause overlay gains "📒 Save this claim…" → name card (T2-naming styling; default name "<Town> — wave 12") → confirm chip. Ledger voice throughout.
3. **LOAD (menu)**: "Load a claim" screen — slot cards (name, wave, contract, town, age), actions per card: Load / Rename / Delete (delete confirms; rename inline). Continue remains the one-tap latest-auto path; loading a manual slot warns if it would abandon a live suspended run (names both).
4. **Slots ride the ledger bundle**: Pack/Unpack includes slots (bounded — if size demands, the 5 most recent + a note; state the choice); AC-02's future sync inherits automatically via the bundle format.
5. Mobile: full flow at 390px.

## Firewall
Touch ONLY: the slot store module (extends RunSuspend patterns), pause save UI, the Load screen, ProfileTransfer inclusion, e2e, artifacts. NO changes to: snapshot/restore internals (same envelope), auto-suspend behavior (it keeps its own slot), sim, contract state.

## Self-check
tsc/build; new `e2e/save-slots.spec.ts`: save→name→appears in Load with correct meta · load restores (determinism twin-check vs direct suspend-restore) · rename + delete persist · auto slot NEVER overwritten by manual flows (seeded collision attempt asserted) · 12-slot cap + storage warning path · slots survive Pack/Unpack round-trip · 390px; run-suspend + save-visibility + profile suites + m1-01 + m2-01 unmodified green both projects; zero console errors; screenshots (save card, the Load screen curated with 3 named slots, 390px) into artifacts/save-slots/. Commit on lane/m3. End: READY-FOR-GATES + snapshot-size/budget numbers + results.
