# Review — M2-01 buildable-registry-and-menu

**Verdict: PASS — integrated.** Implemented via §6.3 relay (tasks/001, Codex on Robin's Mac); gated s10 (scheduled, 2026-07-04T01:2xZ).
Lanes 002 (M2-03) and 003 (VP-03) had NOT landed at gate time — tree contained lane 001 only (verified by file scope).

## Evidence

- `npx tsc` clean, `npm run build` green (237ms) on linux ~/gr rebuild.
- **New e2e `m2-01-build-menu.spec.ts`: 5/5** — palisade via menu w/ `build_palisade` sink + gold −10; beacon cost curve 25→35→45 through menu; single-enemy wall-line rAF tracker (no pass-through, hero reached <20s sim); 390px menu tiles ≥44px, no HUD-control overlap; stress draw calls ≤200 with 12 palisades + 6 beacons (instancing proof).
- **m1-05 suite 6/6 UNMODIFIED** — def #1 refactor is behavior-preserving.
- **Full regression green: 58/58** desktop-chrome, --workers=1, batched <35s/call (m1-01 4, m1-02 3*, m1-03 5, m1-04 4, m1-05 6, m1-06 8, m1-07 7, m1-08 6, feedback-fx 3, visual-polish 2, visual 5, m2-01 5).
- Screenshots: `shots-m2-01/desktop-menu-open.png`, `desktop-palisade-line.png`, `mobile-390-menu.png`.

## Code review notes

- Registry is data-only; no behavior switch-cases in Game.ts (menu index → def id lookup only). Sink literal `build_sentry_beacon` preserved via `buildSink()`; `BuildSink` template-literal widening per spec. Economy remains sole gold writer.
- Avoidance is a velocity post-process with substeps (≤8 × 0.25), entry-face resolution + deterministic slide side (enemy id parity), interior fallback pushes to nearest face. **No-blocker path is bit-identical to old movement** (steps=1, same addScaledVector) — regression confirms.
- Palisade placeholder uses light timber (#c99a61/#d9b77d + brass) — the dark-wood-reads-black carry does NOT recur. InstancedMesh ×3 parts mirrors beacon pool.
- `confirm()` now recomputes ghost position/validity at confirm time (hardening, covered by m1-05).

## Orchestrator fix during gates (not Codex's defect)

- **m1-02 "run reset recycles" failed 20→21 textures on CLEAN pre-diff HEAD too** — pre-existing env-dependent gate weakness, not the slice. Root cause: baseline taken before any spawn/kill cycle; on slow VMs deeper float-text pool slots upload first-time during cycles and read as a leak (retained after 3s settle; geometries stable 40/40). Fix: warm one full identical cycle before baselining (documented m1-05 pattern), committed separately. 3/3 green after.

## Scope strays

- Codex's local test runs regenerated `reviews/shots-visual-polish-01/{desktop,mobile}-batch001-assets.png` (evidence files of a closed slice). **Restored, not committed.**

## Carried minors (new)

1. **No palisade rotation** — segments are fixed 1×3 along z; a wall built along x reads as parallel slats (see desktop-palisade-line.png). Functionally fine (AABBs+pad merge into a solid band). Fold rotation into M2-02 build-UX or later; Robin call on priority.
2. **390px: "P - catch your breath" chip overlaps the XP panel** — pre-existing mobile HUD debt (menu itself is clean); belongs to the dedicated mobile layout pass already carried.
3. **Sequential blocker resolution**: a slide off blocker A within a substep isn't re-checked against earlier-array blockers — theoretical corner pass-through with dense adjacent walls. Bounded by 0.25 substeps; e2e wall-line green. Watch at M2-04 (thieves) / pathing-v2.
4. `ui.build.icon.*` slots referenced by defs but not yet in a layer contract — add with batch-004 (icons tranche 2).
