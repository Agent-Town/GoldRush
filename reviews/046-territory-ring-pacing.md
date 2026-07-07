# Review — 046 territory-ring pacing (main slot) — attended drain (s61, 2026-07-07 ~12:35)

**Verdict: PASS — merged.** Owner finding F-0707-13 ("the robbers take ages to get to you") resolved without touching the reward economy.

## What it does
Territory-ring segments now place with gaps ALIGNED to the wave spawn lanes (reads the same lane constants routing uses — `WAVE_SPAWN_EDGES`/`TERRITORY_RING_SIDES` in Balance); waves 1–3 bias spawn selection toward gap lanes when a ring is present (additive Balance knob). The earned ring becomes a funnel/kill-zone feature instead of a detour generator. Ledger copy hints the tactic.

## Evidence
- Runner self-check: own spec 2/2 + carried regression **32/32** (task-025, m1-01, m2-01, task-027; both projects); `codex review` P2 found+fixed (moved-hero assertion covers it).
- Attended drain battery: tsc clean · build green · task-046 + task-025 + m2-01 **24/24** both projects (scratch 5231, workers=1). Contact-time assertion ("waves 1-3 contact time paced") green on both projects.

## Merge classification
Runner output in main working tree (main-slot pattern): Balance.ts / Game.ts / RunManager.ts / WaveSystem.ts + new e2e — all task-firewall files, no foreign edits. Committed path-scoped.

## Findings
None blocking. Note for 021/012 balance loop: the gap-bias knob is a new tuning surface — include it in the overwhelm-valves audit.
