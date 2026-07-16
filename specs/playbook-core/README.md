# PLAYBOOK CORE — record a job once, hand it to an agent (E7's crown jewel, the Charter Press's sibling)
STATUS: DRAFT 2026-07-17 (attended-authored at owner order: "author the hard parts already so we can start working on them and find out if there are issues with them or we nail them quickly"). Ratification questions batched at bottom. The e7-signal bundle §C owns the era design; this spec owns the ENGINE substrate and may ship eras early (inert law).

## What this is
Programming by demonstration: the player performs a job (a panning circuit, a patrol, a build order); the game records it as a named PLAYBOOK; an agent replays it. E7 makes it the era mechanic; the Charter Press (E10) is its grown-up sibling — **recording IS programming, and the kids' builder is being taught to the town first.** The Echo (E7's boss) replays YOUR playbooks against you — the format must serve both.

## The laws (each earned by an existing law or a known failure mode)
1. **SIM-TRUTH ONLY.** A playbook is a sequence of sim-level INTENTS (move-to(x,z), build(kind,site), fire-at-zone, pan-at, wait-until(condition)) — never raw inputs, never camera/screen coordinates, never wall-clock times. (Rendering-only law §4.6 applied to recording: if it isn't sim truth, it isn't recordable.)
2. **THE DETERMINISM CONTRACT.** Replaying the same playbook from the same sim state yields the identical event-log outcome. The fixed timestep + event-log discipline (month-one laws) make this possible; slice PB-00 (the audit) PROVES the substrate before anything is built on it. E6's DecayScheduler must register on the same clock (its master already gates on this).
3. **NO PRIVILEGED PATHS.** A replaying agent is a second ACTOR routing intents through the exact systems the player uses (CombatSystem stays sole damage resolver; Economy sole gold writer). The multi-actor substrate already exists (Game's actors array — multiplayer built it); playbooks ride it, never around it.
4. **CONSENT-SCOPED (the rung ladder).** Recording requires nothing; ASSIGNING a playbook to an agent is an autonomy grant on the M4 permission ladder — logged, revocable, rung-gated. The consent law is the constitution of a species (E7 chapter); the engine enforces it from the first slice.
5. **CORRUPTIBLE BY DESIGN.** The Echo and the data-rustlers field GLITCHED playbooks — same schema, perturbed parameters (mirrored routes, offset timings). Corruption is a first-class transform over valid playbooks, never a special enemy format. (One format to test; the era's enemies come nearly free.)
6. **BOUNDED.** v1: one playbook = one tile, one actor, ≤10 minutes of sim-time, ≤2,000 intents. Exceeding bounds truncates LOUDLY at record time (no silent caps law).

## The slices (each independently gateable; PB-00/01/02 shippable INERT before E7 arms — the e5-03 precedent)
- **PB-00 — THE DETERMINISM AUDIT** (task authored, lane-d): prove/repair the substrate. Static sweep for non-determinism in sim paths (Date.now, unseeded Math.random, performance.now, Map/Set iteration order, unstable sorts, render-dt leaking into sim); harness A/B across seeds; findings classified sim-critical vs render-only; trivial sim-critical fixed, the rest reported. EXIT: identical hashes across 3 seeds × 2 runs each + the findings table.
- **PB-01 — INTENT CAPTURE** (?debug-gated): the recorder taps the player-intent layer (where input becomes sim commands), serializes {tick, intent, params} to a profile-scoped store. Zero live consumers. GATE: a recorded session's intent stream byte-stable across identical same-seed sessions.
- **PB-02 — THE REPLAY ACTOR** (?debug-gated): a second actor replays a recorded stream on the same tile/seed; GATE: event-log parity for the replayed actor's outcomes (the determinism contract, demonstrated end-to-end). This is the moment we know we nailed it — or find the issue early.
- **PB-03 — THE LIBRARY** (E7-arming work): name/save/assign UX, the tape-reel iconography, rung-gated assignment.
- **PB-04 — THE CORRUPTION TRANSFORM** (E7-arming work): the glitch operator over valid playbooks; feeds Echo Canyon + the boss.

## Integration map
Touches: a new intent-capture seam at the input→sim boundary, new PlaybookStore (profile-scoped), a replay driver on the existing actor substrate. Reuses: src/spikes/playbook/PlaybookLab (evaluate in PB-01 — harvest or retire, report which). NEVER touches: sim semantics, damage/gold single-writers, existing e2e assertions.

## Ratification questions (owner, batched — none block PB-00/01)
Q1. Intent granularity: high-level verbs (recommended: readable, robust, mutation-friendly) or waypoint-dense traces?
Q2. Cross-tile playbooks: v1 per-tile only (recommended) — expand later?
Q3. Recording UI verb: dedicated "tape reel" toggle (recommended, E7-flavored) vs automatic always-recording?
Q4. Playbook count/profile quota (recommend 24 slots v1 — a drawer, not a database)?
