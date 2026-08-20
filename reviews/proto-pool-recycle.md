# Attended review — the pool-recycle evidence prototype (owner fork F-CAP-2, priced)

**Branch:** `worktree-agent-ab5c2b2f3528ad4c3` (4 commits, ~60-line diff in 2 source files + evidence jsonl/probes). **NOT MERGED — expressly owner-gated** (owner 2026-08-20, verbatim: "I am not sure about the details for pressure and recylcing. But keep pushing"). This review records the prototype's measurements so the fork is decidable with one word. Raw evidence lives on the branch; keep the branch under the salvage lifecycle (`save/` → `archive/` on ruling) — RETENTION LAW.

## Verdict: ADOPT-WITH-TWEAK recommended (attended concurrence)
The mechanic: `EnemyPool.spawn()` falls back to reclaiming the oldest SELF-NEUTRALISED body when the pool is full and no `preferredSlot` was requested (suspend-restore never reclaims). `WrangleSystem` seats itself on the pool it is constructed with (`enabled ? this : null`), so **outside E6 the branch is unreachable by construction**.

## The measurements that decide it
1. **The Hollow is FIXED** — idle `e6-half-life-hollow-01` flips from a wave-20 FALSE SECURE (`c3f13eda`, the exact Law-2 stop that parked b3) to an honest death at wave 19 (`e41a66db`, kills 210→463). Seed -02 bit-identical (pool never filled).
2. **Blast radius ≈ zero** — all 53 non-E6 floor rows byte-identical; pin battery 20/0/2 (skips pre-existing, owner-ruled F-E2S-3); cross-engine hash pins 7/7; non-E6 secure replays byte-identical (`44aaf528`, `81a6fbcb`).
3. **Glow-mesa was quietly sick** (F-PROTO-4) — the ADMITTED map's idle run rode the harness anti-hang ceiling (`endReason: "wave-ceiling"`, pool 96/96 from wave 7); it satisfied Law 2 by the ceiling, not by play. Under recycling it dies ON the map (waves 15/14). The "tweak" = accepting these two moved floor rows — an HONESTER floor.
4. **Showroom is NOT fixed** (F-PROTO-2) — a second independent cause: with pressure restored, the idle hero's auto-attack outpaces the Showroom's flow. Collides with the sheet's own ruling ("difficulty stands") — its own desk question, not a recycle question.
5. **The Picnic never had this disease on main** (F-PROTO-3) — idle already loses honestly (w5/w4, pool never above 40/96); the b4 review's wave-20 false-green was measured on lane/b's tree. Its real blocker is F-2085-1 (enemy-to-stake routing). **Corollary F-PROTO-5:** b4's recorded prover hashes are stale glow-mesa hashes (the prover defaulted to `--contract e6-glow-mesa`) — b4's prover evidence must be re-derived, never inherited.
6. **One priced limitation** (F-PROTO-6) — `spawnOrder` absent from `EnemyPoolSuspendSnapshot`: after browser save/resume, "oldest" degrades to "lowest slot". Nothing reds today; ~10 lines + a schema-version call if adopted.

## Fidelity control
The probe driver (`idle-probe.mjs`) mirrors `gr-sim.mjs --policy=idle` line-for-line (+`admissionProbe:true` for the refused maps) and reproduced three known terminals byte-exact before measuring anything: the b3 runner's Hollow (`c3f13eda`/210), the regenerated glow-mesa floor (`0ae65b8e`), HEAD's committed glow-mesa floor (`35d13711`).

## What one owner word buys (corrects s2085's F-2085-2 "gates three maps")
- **"adopt"** → merge the mechanic + accept 2 glow-mesa floor rows → **re-run b3 Half-Life Hollow** (its Law-2 stop is cured) → the Hollow admits on its own evidence.
- Showroom stays a difficulty question (already leaned: "difficulty stands" → its idle false-green needs its OWN ruling or stays exempt).
- Picnic stays parked on F-2085-1 (enemy-to-stake) regardless of this ruling.
- **"reject"** → Hollow stays parked; glow-mesa keeps passing Law 2 via the harness ceiling rather than by play — recorded either way.
