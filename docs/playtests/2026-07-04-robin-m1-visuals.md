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
## Addendum 2 — M1 VERDICT + feel correction (2026-07-04, s9d)

**M1 MILESTONE: SIGNED OFF.** Robin: "M1 is ok." Per CLAUDE.md §9 this closes M1 (played + signed off). The queued 07-gate items (camera 57°, split_spark same-target, beacon cost curve, D2 balance defaults) are RESOLVED-AS-SHIPPED by this verdict — current values stand unless Robin reopens one explicitly.

**Correction (BINDING, ride in tasks/005 with M2-02 + palisade rotation):** Robin: "weird that there seems to be a kind of recoil from the weapon and the camera shakes." That's m1-07's kill feedback (camera impulse + hit-pause) reading as weapon recoil. Fix: default `Balance` camera-impulse amplitude to 0 (or near-0) and soften hit-pause; keep both as ?debug knobs so the feel can be A/B'd later; update any e2e that asserts the impulse (m1-07-charm suite) to assert knob-driven behavior, not default-on. Acceptance: kills feel clean at defaults, no camera displacement on ordinary kills; Robin re-verdicts in the next playtest.

**Weapon-language question answered (no canon change):** Robin asked why an electric weapon in the frontier vs a period gun. Answer: ADR-001 (decided by Robin 2026-07-03, accepted) — frontier-tech, no realistic firearms ever, tech develops toward sci-fi across the epoch arc; plus brief §9.2 brand rule (no gun-as-genre-signal, illustrated never gory). Orchestrator recommendation: KEEP. Period flavor arrives with M2-06 Blast Charge (powder-keg-flavored frontier-tech mortar). If Robin wants to reopen, it's an ADR-001 amendment — his call, one paragraph, but it would point the tech arc backwards and bend the 2026-06-01 brand rule.

4. **"Would 3D models be better for the characters (it's three.js)?"** — orchestrator verdict: **no for characters, not now.** (a) The Frontier Ledger art direction is illustrated 2D engraving — batch-001 billboards already read exactly right in-game per Robin's own wave-10/18 sessions; 3D characters in this style would need an NPR-engraving shader + modeling/rigging pipeline we don't have. (b) Gen-3D tools (Tripo etc., keys we don't have) output generic PBR meshes, not ledger illustrations — art-direction mismatch. (c) The camera rig is FIXED oblique; sprites+orientations+mirroring cover every direction the player can ever see. (d) Billboards instance cheaper at swarm counts. 3D is the right call only if the camera ever becomes free-rotating or for later hero-scale showcase moments — that would be an art-direction bend needing an ADR + Robin sign-off (brief §4/§9 discipline). Buildings stay billboard/primitive hybrids for the same reason.
