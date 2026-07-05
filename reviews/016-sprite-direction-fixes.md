# Review: tasks/016 8-way direction fixes — GATED + INTEGRATED (s30)

Robin's QA repro (S/N cycle; SE/W/NE frozen; SW/E/NW unflipped+frozen) is closed with root-cause fixes, not patches. Firewall respected exactly: SpriteAnimator + characters.v2.json (2 lines) + e2e/vp-02 only.

## The three fixes
1. **Walk-cycle freeze**: `createRuntimeOrientation` only injected a fallback idle when BOTH idle and walk were missing — walk-only direction blocks (SE/W/NE) stalled. Now idle falls back whenever missing and a real walk pair is never replaced → every direction cycles. NEW e2e closes the s26 test gap: per-direction frameKey-alternation assert across all 8 held headings (with s26-pattern bounded reload-retry for lazy cells).
2. **Mirror rendering**: root cause — THREE.Sprite billboarding derives scale from vector LENGTH, so `scale.x = -1` never flipped pixels. Transform scale now stays positive; mirroring moved to a lazily-baked, cached horizontal-flip CanvasTexture per mirrored cell (`mirroredRuntimeFrame`, one per cell ever, fade path carries the flag). e2e: E heading = W files + mirrored flag + pixel probe.
3. **Explicit-override contract**: explicit direction blocks now beat the mirror table (`hasExplicitDirection`) — batch-005R2's asymmetric-hero cells land with ZERO code change; mirrors stay as fallback + for enemies. Contract notes de-DORMANTed (accurate: resolver landed with vp-02b).

## Gates (desktop-chrome serial, /tmp/gr-s30, healthy VM)
- tsc/build clean.
- **vp-02 11/11** including the two new 016 tests (per-direction cycling 25.1s, mirrored pixels 11.5s).
- **vp-02b 4/4** functional (resolves-all-8, hysteresis, idle hemispheres, coarse-action-cells) — the resolver surface 016 renders for. (The 60s scale-pulse SHOTS test is an evidence generator and exceeds the sandbox wall — visual half covered by the fresh 8-direction contact strip below.)
- **m1-05 6/6** after one A/B-proven harness modernization (below); reset test ×3 stable.
- Evidence: `reviews/shots-016-directions/` — fresh 8-direction contact strip (rightward-facing cells now genuinely mirrored — satchel side flips; pre-016 these rendered unflipped), vp-02 desktop + 390px.

## The m1-05 A/B (the one failure this gate, root-caused)
m1-05 reset test failed textures 22→24 — the s28 signature, but NOT env this time: **pure HEAD passes on this VM; HEAD+016-only fails** (fingerprint-verified A/B, s25 law). Mechanism: 016 doubled the lazy sprite-cell matrix (all directions now cycle BOTH stride cells for hero AND jumpers; mirrored cells additionally bake their flip texture on first render) — which cell is on-screen when a heading crosses is phase-dependent, so ONE warm cycle no longer deterministically saturates uploads. **Not a leak**: uploads are bounded and cached; vp-02's warmed memory gate is green under 016. Harness modernized per the s27 law (global renderer counters are not pure functions of the SUT): geometries stay EXACT from first baseline (beacon meshes are the actual reset surface); textures now warm → grace cycle → ZERO-growth measured cycle. A real per-cycle leak (s27 pinned-overlay class) still fails. s28's "retire the 22→24 exception with a real pass" is hereby RETIRED — it was this, one lane early.

## Watch item (non-blocking)
Mirror-bake doubles GPU memory per mirrored cell (hero-scale today: 6 cells). Fine now; if enemy rotation sheets ever go mirror-based instead of explicit-sided (batch-005R3 bandit is explicit-sided — good), revisit with a texture-budget probe.
