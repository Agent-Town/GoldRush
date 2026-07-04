# Review — M2-06 arsenal-blast-charge (tasks/007, relay lane chained after 006, gated s23 2026-07-04)

**Verdict: PASS — integrated, no blocking findings.**

## Gates

- tsc/build clean; zero console/page errors desktop + 390px.
- New e2e `m2-06-arsenal-blast-charge.spec.ts`: **7/7** — toggle default-off neutrality (default rig, pre-06 sims byte-identical), AOE single-attribution (kill delta == frozen cluster size, one `killEnemy` path), friendly-fire zero (hero + buildables intact, beacon keeps firing), turret LOS blocked-nearest→clear-second (nearest-ELIGIBLE semantics), menu slot 5 + spend-once + replay == HUD, real-wave neutrality without toggling/turrets, `?stress` blast pool cap.
- Canaries green: m1-01, m1-02, m1-05 6/6 (beacon shooter registration untouched), m2-01 6/6 (menu grew to 5 — 390px menu suite green), m2-02, feedback-fx. FULL regression rides the chain gate (see m2-04 review): all 19 files green.
- Screenshots: `reviews/shots-m2-06/` — chip default (Spark Rig), arc telegraph + charge in flight with radius ring + Blast Charge chip, detonation dust-ring, turret behind palisade line, 390px with touch toggle. Teal `#83ded7` family telegraph per brief §4; illustrated, no gore (§9.2).

## Code review notes

- **CombatSystem bolt path preserved**: additive `ShooterHandle` fields (`kind`/`enabled`/`canTarget`/`aoe`); `findNearest` predicate is optional with sticky-target re-check (correct nearest-ELIGIBLE, not nearest-then-reject — TargetingSystem default path byte-identical when no predicate).
- Detonation resolves in CombatSystem via pooled `BlastChargePool` update callback; enemies-only by construction (prosperity framing honored).
- **KeyQ collision-free** (verified against the KeyR double-map lesson: restart stays KeyR, no second KeyQ consumer); edge-triggered intent + touch button built on the rotate-button pattern with full listener teardown in dispose.
- lil-gui `blast`/`turret` sections ride the data-driven group list (3-line DebugTools diff is the complete harness surface — the builder generates controls from Balance sections).
- Turret def is data + ghost + pool + place/count branches per the registry pattern; icons lazy-glob with parchment fallback (no slots.ts/contract edits, as scoped).

## Findings

None blocking. Shared-file sections (Game/Balance/TargetingSystem/DebugTools/vite-env) interleave with 006 per the chained delivery — attribution recorded here and in the m2-04 review; commit message on the 006 commit carries the shared files.
