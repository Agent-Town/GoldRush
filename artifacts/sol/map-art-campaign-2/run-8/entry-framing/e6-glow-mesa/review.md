# Glow Mesa — run 8: entry, 2026-09-22

**FIXED offscreen entry landmark / HELD full plate composition.** Declared `mesa-starstone-derrick` in both pack copies: the plate anchors its raised cap with the tall derrick and working compound. The opening camera now visits that mounted silhouette, without moving the hero or changing the cap, terrain, collision, gameplay, FOV, yaw offset, or zoom.

| View | Rest body pixels | Peak body pixels | Return body pixels | Observed time in frame |
| --- | ---: | ---: | ---: | --- |
| 1280 | 0 | 38,176 | 0 | 1.499–1.600 s |
| 390 | 0 | 42,461 | 0 | 1.342–1.458 s |

[Desktop board](board-1280.png) · [Phone board](board-390.png) · [Measurements](metrics.json) · [Live-pose capture receipts](captures.json) · [Independent timing pass](duration.json).

The authored camera window is 2.5 presentation seconds: 0.7 s ease in, 1.1 s at the mount, 0.7 s ease out, followed by the existing 0.15 s tracking lag. The existing rig moves its position as well as its look target; no extra reach, FOV or hero-start adjustment is introduced. The body is reachable in both viewports. The mesa's full silhouette, facility grouping, state-dependent node ring, HUD overlap and the gap between current model art and the plate remain held; this is entry framing, not full concept acceptance.

Ordinary boots use seed `map-art-campaign-2`, DPR1, normal HUD and no debug/test hook. Read-only route instrumentation records camera poses; the before arm suppresses only the new hook. Body counts compare black/white opaque target materials under the scene's real depth test at drawing-buffer resolution, separately from HUD coverage. Duration is measured in a separate ordinary boot with no screenshot or readback during the glance; its recorded poses are censused against the final frozen scene at intervals of at least 50 ms. Bounds bracket the first/last visible samples. Both desktop and phone have zero console/page errors. Normal screenshots retain all HUD/story layers.

The trigger checks once after the briefing closes, the run is live and models are mounted. A visible body is a no-op; an offscreen or wholly depth-occluded body triggers. Multiplayer and boot/runtime tape replays bypass the hook. `snapTo` cancels a timed glance, and the existing multiplayer glance takes precedence. The rig does not mutate either input vector. The manifest adds one sentence to `night_vein_ring`, sourced from this pack, and `public/skill.md` explains that sentence. No `now` field or view schema changes.

Only `entryLandmark` differs in the two JSONs; all previous contract data and all model/atlas/blend bytes are unchanged ([invariants](invariants.json)). The `Game.ts` change is exactly six added lines. Final TypeScript/default/full/E1 builds pass ([receipts](../e6-glow-mesa-final/build-gates.json)); E1 payload **34,309,246 B**, below 52,000,000. Final scoped guards **61/61**, named guards **3/3** pass. Own Atomic batch: 38/40 initially passed; the two new-rule census failures were corrected by putting the sentence on the existing rule, then all eight unchanged census cases passed. No assertion changed. Effective own coverage is green. Shared/replay/view: **28 pass / four opt-in skips**, including the exact Regatta tape test and all agent-view tests on both projects. Loading **8/8**, repeat **2/2** pass.

[Camera parity](../rig-proof.json): 1,200 exact baseline poses, including replay-style pan targets, impulses, zoom and multiplayer. [Visibility proof](../visibility-proof.json): visible/no-op, offscreen, fully occluded, undeclared/no-op, one-shot and resource/state restoration. [Headless parity](../parity-summary.json): 30 `now` snapshots, 109,496 bytes, byte-identical across these five maps and The Claim; the audit's semantic output is unchanged, with only shifted source-line citations.

Engine `b7113b37c1a7e10b10f504947a660147c581c22b667aa1df2feb695bbb96100c` → `b13e44ed083d03e30fee4cf9d6e3702ff8b6e167ddb88f20a7d24eae36cd7427`; pin remains drain-owned. Store commit is recorded in `commit.json`.
