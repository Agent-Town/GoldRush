# Task 046: the territory ring must reward without boring (MAIN slot, commit prefix "fix:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in the repo root (main slot). READ FIRST: AGENTS.md; src/game/RunManager.ts (~226: the territory "palisade ring ready" reward) + the ring placement code it triggers; WaveSystem early-wave spawn logic; docs/playtests/2026-07-07-robin-playtest-02.md F-0707-13. Pre-flight: zero staged/modified TRACKED files (`??` untracked expected — list briefly, proceed).

## Owner finding (2026-07-07 ~12:11, screenshot, live build)
"Now this initial barrier is in place. That results in the robbers taking ages to get to you." The earned territory ring (M3 meta + 027 victory payouts — KEEP the reward, it's the claim remembering wins) makes early waves crawl: enemies path around the enclosure, time-to-first-contact balloons, waves 1–3 turn boring.

## Ruling (design intent)
An earned head-start should make the player STRONGER, never the game SLOWER. The ring stays; the tempo returns.

## Scope
1. **Measure first**: instrument time-to-first-contact (spawn → first enemy within engagement range of hero/base) for waves 1–3, ring vs no-ring (seeded, both runs recorded in the report). This number is the acceptance metric.
2. **Lane-aligned openings**: the ring's gaps must align with the wave spawn lanes (enemies FUNNEL through openings — which makes the ring a tactical feature: kill-zones at the gaps — instead of a detour generator). Placement reads the same lane constants routing uses; no hardcoded magic positions.
3. **Early-spawn adaptation**: when a territory ring is present, waves 1–3 bias spawn points toward the gap lanes (Balance ADDITIVE knob) so contact time normalizes.
4. **Acceptance**: ring-present time-to-first-contact within ±25% of ring-absent baseline for waves 1–3 (e2e-asserted with seeded runs); the ring's defensive value preserved (enemies still cannot walk through segments).
5. Ledger-voice copy check: the "palisade ring ready" line should hint the tactic ("the gaps are your kill-lanes").

## Firewall
Touch ONLY: ring placement geometry, early-wave spawn biasing (additive knob), the copy line, e2e. NO changes to: territory meta earning/payout math (the reward economy is 027's, untouched), palisade stats, routing core, wave counts/compositions.

## Self-check
tsc/build; new/extended e2e with the contact-time metric both configurations; task-025 + m1-01 + m2-01 + task-027 unmodified green both projects; zero console errors; screenshots (ring with lane-aligned gaps, a wave funneling) into artifacts/046/. End: READY-FOR-GATES + the before/after contact-time numbers + results.
