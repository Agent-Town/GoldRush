# Echo fidelity preflight — existing reference and rendering sources

Status: read-only investigation while the E5 suite finishes. E6 adoption remains ahead of E7 implementation. No E7 source, assets, game parameters or registry entries changed; no browser or renderer launched. The inspected file hashes are in `read-only-preflight-sha256.json`.

The reference `assets/raw/plate-e7-boss-the-echo.png` depicts a recognizable settlement answered by a teal, translucent copy: distinct towers, round central buildings, low works, enclosing walls and broad signal contours. Its identity comes from matched building forms and layout. Lore `STORYBOOK.md:442–446` and the E7 bundle require the player's actual base, not a fixed illustrated city or a new monster body. The kept result is a bright signal mote in a jar; no enemy HP or kill path may be introduced.

Confirmed current gaps:

- `EchoBossSystem.ts:303–311` instantiates the same shared box for every building type. `Balance.ts:475–477` fixes every copy at 0.9 × 1.4 × 0.9; walls, turrets and works lose their silhouettes and footprints.
- `Game.ts:1172–1175` passes only building ID and X/Z. Instance identity, rotation and tier are discarded before rendering. Layout centers are mirrored and approach already; those progression rules are part of the behavior to preserve.
- `EchoBossSystem.ts:363–408` provides a single flat perimeter ring and a simple open cylinder/sphere jar. The reference's layered signal lines and varied building tops are absent from that geometry. Actual visibility and terrain fit still require runtime captures.

Reuse investigation:

`BuildSystem.group` contains the existing building pools, with distinct walls, masts, wheels and roofs. Their instanced geometry preserves rotation/tier, but cloning the entire BuildSystem would also copy unrelated build ghosts, HP visuals and other presentation. Do not create another BuildSystem or introduce simulation owners for an echo.

`Run3dPilot.ts:137–175` already maintains keyed GLB building instances from those same live diagnostics, including palisade rotation and tint. Full-tier buildings can therefore differ from the fallback pool meshes. Any reuse must inspect the active presentation and preserve the actual rendered building identity, support fallback/lite and late loading, avoid altering source materials, and dispose only resources owned by the echo. A copy of fallback shells alone would not prove full-tier fidelity.

Next after E6: capture the existing Echo with a deliberately varied player base, including rotated walls, an upgraded turret and a low work, on desktop/mobile and full/lite. Verify which rendered objects are active. Implement the smallest render-only snapshot/reuse seam that can retain their forms, then add the restrained teal outline/signal treatment and a legible kept jar. Keep source-layout sampling time, mirrored X/Z, approach duration, pressure damage, replay novelty, confidence, capture and persistence unchanged.

Existing `e2e/e7-boss.spec.ts` covers enabled arrival, two-building counts, traffic lag, recorded patrols, replay damage, novelty scoring, no-kill capture and kept-jar reload. It does not verify copied building shape, orientation, terrain contact, transparent sorting, render-resource ownership or visual correspondence. Those need focused visual/runtime evidence; do not infer fidelity from that test passing.

## Historical screenshots are orientation only

The tracked rehearsal frames `reviews/shots-rehearsal/e7-02-echo-mirror.png` and `e7-03-echo-jar.png` were visually inspected during the E6 wait. Their last change is commit `8229d6e0c` (2026-07-25); they are not current runtime captures. The mirror frame shows a perimeter ring and little recognizable copied settlement. The jar frame is covered by an upgrade menu, so it cannot prove jar shape or legibility. Do not use either as an accepted current baseline. The raw plate visibly depends on varied roofs/towers/walls, luminous edge structure and layered signal contours around a recognizable counterpart settlement.

The E5 full-run E7 screenshots preserve plain Relay Valley boot and dread arrival only; the unchanged test deliberately captures before mirror anatomy appears. Fresh E7 evidence therefore must deliberately build a varied base, reach the mirror phase, frame source and counterpart, and dismiss normal overlays before the kept-jar capture. No new browser or render workload was launched during E6 regression. `reviews/e7-echo-canyon-broadcast-mirror.md` concerns the separate corrupted-squad mechanic, not this final boss's geometry; it is not substitute evidence.
