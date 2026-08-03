# art-drill-bell-post-retake — the bell must stop looking like a gallows
**FIRE-AUTHORED (attended review welcome)** — s1445, from this fire's own drain QA verdict.

SLOT: art. WORKDIR: the art slot. One file. One batch.

Style anchor (verbatim in the prompt): "engraved frontier illustration, warm sepia and umber, painted-storybook game prop, the Gold Rush plate style — never photoreal, no letters or numerals."

## WHY
`prop-drill-bell-post.png` was **REJECTED at the s1445 drain** (`e4359441`, LEDGER row 70,
finding **F-1445-4**). The generated post is tall with a **long cantilevered overhanging arm**,
and the pull-rope hangs **free from the clapper to an open loop suspended at body height**. That
silhouette reads as a scaffold and the loop reads as a noose — hanging imagery, forbidden by
`docs/GOLD_RUSH_BRIEF.md` §9 ("illustrated, warm, never gory").

The first prompt **already named this hazard** — *"friendly civil practice bell, not an alarm
weapon or gallows"*, *"no … hanging imagery"* — and the output violated it anyway. The run's
measured self-QA table checked anchor, 96px silhouette, palette, `#ff00ff` and letters and
recorded *"PASS — post, bell, rope"*: every box it ticked was genuinely ticked, but the hazard
was not one of the boxes. **So this retake's QA must measure the hazard directly, not restate the
old checklist.**

## READ-FIRST
- `assets/LEDGER.md` row 70 — the split verdict and the retake brief
- `assets/raw/codex-art-run-art-drill-yard-stations.md` — the original three prompts and their
  measured self-QA (reuse the accepted files' prompt shape; it worked twice)
- `assets/raw/plate-contract-e1-drill-yard.png` — the style/palette/camera reference
- `assets/raw/prop-drill-faucet-station.png` and `prop-straw-man-stand.png` — the two ACCEPTED
  siblings. Match their weight, ground treatment and padding; this file must sit beside them.
- The rejected raw itself, `assets/raw/prop-drill-bell-post.png` — look at it before regenerating.

## SCOPE
1. Regenerate **`assets/raw/prop-drill-bell-post.png`** (overwrite; the rejected bytes are
   already preserved in git history, so overwriting loses nothing).
2. Geometry changes that remove the gallows read — both are required:
   - The bell hangs **over the post**, not cantilevered out from it. Either a short corbel/bracket
     no deeper than the bell's own width, or mount the bell in a **yoke between two short uprights**.
   - The rope is **short and coiled or tied back against the post**. **No free-hanging terminal
     loop, and no rope segment hanging in open air below the bell.**
3. Keep everything that passed: aged-bronze bell with visible clapper, dark walnut timber, hemp
   rope, warm sepia/umber engraved linework, 1254×1254 RGB, full-bleed warm parchment-and-dirt
   ground, no frame or border, generous padding, bold silhouette readable at 96px.
4. Update `assets/raw/codex-art-run-art-drill-yard-stations.md` with a retake section: new SHA-256,
   dimensions, luminance, saturation, `#ff00ff` count, and the prompt used.

## SELF-QA (measured, stated — and this time the hazard is a measured item)
- **THE GALLOWS CHECK, stated explicitly and answered in words, not a tick:** describe the
  silhouette in one sentence as a stranger would read it at 96px. If the words "scaffold",
  "gallows", "noose" or "hanging" can honestly be applied, **it fails — retake again.**
- No free-hanging rope loop anywhere in the frame; state where the rope terminates.
- Anchor match · silhouette readable at 96px · palette inside the reference plate's range
  (plate luminance 0.455) · exact `#ff00ff` count 0 · no letters, numerals or pseudo-writing
- Canon (brief §9): no firearms or weapons, no people, no gore, nothing that reads as a body
- Compare side by side against the two accepted siblings and say whether it looks like the same set

## FIREWALL
TOUCH-ONLY: `assets/raw/prop-drill-bell-post.png` · `assets/raw/codex-art-run-art-drill-yard-stations.md` · `assets/LEDGER.md` (row 70 retake note).
NO: the two accepted props · no extraction or processing · no contract wiring · no `src/` · no specs · no e2e · no other art batch.
**Wiring stays the lane's job** — this task generates and QAs only.

READY-FOR-GATES + report: the gallows check answered in words, the measured table, and a
one-line verdict on whether it now sits beside the faucet station and straw target as one set.
