# Drain — THE MULTIPLAYER CHAIN: snapshot v2 + lockstep actions → main (2026-07-11) — VERDICT: MERGED, 36/36
Branches: `sol/mp-snapshot-completeness@bedda6c5` (round-3: 5/5 isolated + 6/6 suite on its tip) + `sol/lockstep-actions@b351fd4a` (first-ever browser execution at this drain). Implementer: Sol Session A. Orchestrator: merges, three composition fixes, gates.

## What the player gets
Complete future-state snapshots (full enemy identity, harvest RNG, transients) · TRUE desync convergence (apply-at-tick, rewind, pending-hash buffering) · **every action is a lockstep intent: build placement (quantized coords), upgrades, research picks, ceremony/death/pause — TWO PLAYERS CAN BUILD TOGETHER** · run-start shared-setup handshake (host-owned ephemeral setup per the owner ruling; per-rider payout to own profiles) · sealed-room honesty (`ride_started` rejection; reconnect = MP-RECONNECT slice).

## The three composition fixes (none visible to any single author)
1. **ResearchTree compose**: branch's `saveResearchRegistryState` made epoch-aware (077 keys); RunSuspend call site unchanged.
2. **The canonical-rejection bug**: every capture self-rejected ("research must already be canonical") — 071's `unlocks.rocketCartCaptured` flag is zeroed by `migrateResearchState`, so normalize was LOSSY. Fix: unlocks preserved through normalize + registry-save (also prevents restore silently wiping the Baron capture flag). Diagnosed live via instrumented rejection (string-diff at the exact byte).
3. **The pointerdown-eats-placement race**: BuildButton's outside-pointerdown close (polish-03 era) exits build mode BEFORE the canvas 'click' placement (lockstep-actions, never browser-run) fires → all mouse placement dead. Fix: outside-click COLLAPSES the menu but keeps placement mode (`collapseBuildMenu`); Escape/cancel still exits fully. Better UX than either feature alone intended.

## Evidence
Sealing battery **36/36 (5.3m)**: full mp-02 suite (incl. both-riders-build 300-tick hash equality, 2/2 isolated pre-seal) · run-suspend · sim-fixed-step 6/6 · town board · research-chart · 072 · m1-01 · 044 (Continue-button green — 081's fix confirmed in the same window). tsc + build green throughout. Weapon-pulse counter (7186984c) superseded by the branch's own action queue — deleted, noted.

## Consequences
MP-RECONNECT + MP-ARSENAL parks dissolve (Session A) · B7 E3-prototype unblocks (Session B) · MP-05 formal family playtest now needs only the remaining correctness ladder per masterplan v2 · DEPLOYED with this drain.
