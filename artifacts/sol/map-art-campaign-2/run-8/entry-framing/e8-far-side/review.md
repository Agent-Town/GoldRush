# Far Side — run 8: entry, 2026-09-22

**FIXED offscreen entry / HELD full plate composition.** Both contract copies declare `earthrise-listening-array`: the isolated horizon dish establishes the far side of the empty basin opposite the landing compound. It sits at z 56 while the hero starts at z −36. The rig can visit this actual mount with its original offset, FOV and zoom; the hero start stays fixed. This map is **reachable**, not held for camera reach.

| View | Rest body pixels | Peak body pixels | Return body pixels | Observed time in frame |
| --- | ---: | ---: | ---: | --- |
| 1280 | 0 | 26,144 | 0 | 1.377–1.490 s |
| 390 | 0 | 28,996 | 0 | 1.375–1.491 s |

[Desktop board](board-1280.png) · [Phone board](board-390.png) · [Counts](metrics.json) · [Ordinary capture receipts](captures.json) · [Separate uninterrupted timing sample](duration.json). All boots report zero console/page errors. The before arm suppresses only the entry hook; the after arm records the live camera read-only. The duration census uses the final frozen scene and recorded poses at ≥50 ms intervals; the interval brackets the first and last visible samples. Normal HUD/story layers remain in every screenshot. Body counts deliberately exclude DOM coverage.

The long pan exposed a double-smoothing problem: ordinary tracking lag let the target overtake the camera, flipping the view midway. During the already-eased 2.5 s entry movement, the camera now follows the eased focus at its original offset directly. It retains the original tracking lag outside that window. The authored timing remains 0.7 s in, 1.1 s at the mount and 0.7 s out. [Camera proof](../rig-proof.json) verifies **600 entry frames** across four long pan directions without an orientation/offset change, exact return to the hero, unchanged caller vectors, cancellation and multiplayer precedence. It also compares **1,200 normal/replay-style poses** exactly with the frozen pre-task rig. Glow Mesa's boards/counts were refreshed on this same final source; both maps preserve their earlier captures under `before-lag-correction/`.

The current array model and warm basin do not reproduce the plate's distant lunar dish, material or compound architecture. The phone HUD overlaps the upper array and base; the camera-only task cannot clear those UI layers. Northern-rim hero occlusion, full vista, model/material fidelity and all prior gameplay holds remain with their existing owners. A nonzero body count establishes reach, not full art acceptance.

Only `entryLandmark` differs in both JSONs; other contract data and all GLB/texture/blend bytes are unchanged ([invariants](invariants.json)). The existing `probe_recovery` manifest rule gains one sentence naming the mount. All 42 manifests preserve every other field. No schema, `now`, input, collision or simulation changes; no assertion or engine pin edits.

TypeScript/default/full/E1 builds pass; payload **34,309,624 B**. Scoped guards **61/61**, named **3/3** pass. [Build receipts](build-gates.json) · [Guard receipts](guards-gates.json). Own Orbital batch **22 pass / two failures**. Both failures reproduce on the exact preceding engine at `e8-roster.spec.ts:183`: the ordinary Mare Claim profile reports `e8Arsenal.available=false`. Candidate source and both JSONs were restored byte-for-byte and the candidate engine hash reverified. Focused Far Side parity/census **6/6**, loading **8/8**, repeat **2/2** pass. [Own batch](e2e-own.json) · [Focused tests](e2e-parity-census.json) · [Exact-base attribution](exact-base-attribution.json). No assertion changed.

Engine `084df9fa71eef1eb63753addda63d7ee7b34a049e8394acfea11db36d284ae37` → `b3a86513d6b6511e4fa3049104211051d4cddac7fdda6c314a52144cdb98a288`; pin drain-owned. Store `2d1000357f06e44b42b7288ef8682b1919a66e05`, pushed on `astra/entry-framing`. READY-FOR-GATES with the two attributed baseline failures.

Final shared closeout: replay **2/2**, all agent-view **10/10**, shared total **28 pass / four opt-in skips**, ten uninstrumented boots with zero errors, byte-identical final `now` snapshots and unchanged audit semantics. [Task handoff and exact hash pairs](../handoff.md).
