# Robin playtest — M1 visuals round (2026-07-04)

## Verbatim feedback

1. "We need sprite sheets to make the animations better."
2. "The tiles for the floor are highly repetitive, it is a bit boring but much better than before — we can use GPT Image 2.0 here again."

## Orchestrator reading

- Tone positive ("much better than before"). This is VISUAL feedback; it is **not yet the M1 milestone sign-off** — fun verdict on the full loop, Balance-defaults confirm (D2), camera 57°, split_spark same-vs-next-nearest, and beacon cost-curve feel remain open (tracked in STATUS "Robin owes").
- Directive 1 → `specs/visual-polish/slices/02-sprite-animation.md`. Approach: **pose-swap frames (2–4 per character), not dense sheet grids** — GPT Image 2.0 frame-to-frame consistency is the known weak point; few-frame pose swaps match the illustrated Frontier Ledger look (storybook flipbook) and are reliably generatable. Contract supports real N-frame sheets later without rework.
- Directive 2 → `specs/visual-polish/slices/03-terrain-variety.md` (code: variant sampler + rotation/mirror + macro tint — kills repetition even with ONE tile) + batch-003 art (2 extra bank variants + seamless-ified river check). Placeholder-first: code lands before art.
- Both routed to visual-polish (cosmetic, no rules change). Art queue: batch-002 (upgrade icons, already written) generates FIRST, batch-003 (terrain + poses) written and ready right behind it — Robin may run both in one sitting if he wants; do not write batch-004 until both land.

## Addendum — same day, M2-01 first touch + art directives (2026-07-04, s9c)

1. **M2-01 live feedback (relay lane landed, s10 gating):** "The palisades need to be rotateable — but I can place them, the bandits respect them." → **BINDING correction for the M2-01 round:** ghost rotation (R key 90° steps + a touch rotate control on the ghost), footprint/blocking must follow rotation, e2e-asserted. Route into the M2-01 correction task with the s10 review findings.
2. **Sprite pipeline directive (BINDING):** full animation sets per character as SHEETS in one image (in-image consistency beats cross-image; Robin is right — the s9c walk-A/B singles drifted, the 2x2 sheets did not), on flat distinct key color **magenta #ff00ff** for trivial cutting. Adopted; extract-alpha needs `--key` + `--grid CxR` + per-cell bbox-center-normalize mode.
3. **Directions/actions directive (BINDING, scales batch-004):** characters must animate in all movement directions (left/right/up/down + turning) and actions (shooting, getting hit, panning, building — extensible). Architecture: 3 generated orientations per character (side → mirrored for the 4th direction, front/toward-camera, back/away) × action cells, one orientation sheet per generation. VP-02 contract must model orientations + clips extensibly. Batch-004 buys the matrix only after the side sheets are proven in-game.
4. **"Would 3D models be better for the characters (it's three.js)?"** — orchestrator verdict: **no for characters, not now.** (a) The Frontier Ledger art direction is illustrated 2D engraving — batch-001 billboards already read exactly right in-game per Robin's own wave-10/18 sessions; 3D characters in this style would need an NPR-engraving shader + modeling/rigging pipeline we don't have. (b) Gen-3D tools (Tripo etc., keys we don't have) output generic PBR meshes, not ledger illustrations — art-direction mismatch. (c) The camera rig is FIXED oblique; sprites+orientations+mirroring cover every direction the player can ever see. (d) Billboards instance cheaper at swarm counts. 3D is the right call only if the camera ever becomes free-rotating or for later hero-scale showcase moments — that would be an art-direction bend needing an ADR + Robin sign-off (brief §4/§9 discipline). Buildings stay billboard/primitive hybrids for the same reason.
