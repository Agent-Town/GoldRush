# E10 archive world — independent visual review

Reviewed 2026-09-22. Fresh visual inspection of the six supplied full frames, then the five supplied enlarged crops, and the reference plate. Used the screenshot-critique workflow. No implementation, project history, or earlier reviews were inspected.

**Verdict: visible presentation defects remain.** The gate silhouette and teal accents read clearly in the desktop station frame. The mobile framing, overlay collisions, terrain boundaries, and weak structural contact need attention before visual acceptance. This is a still-image review, not a runtime or interaction pass.

## Findings

### V1 — Mobile HUD obscures the gate's identifying upper structure

- **Confidence: high. Evidence: full frame.** In `station-after-archive-entry-gate-10-390-normal.png`, the HP/XP panels hide much of the left capital and column, while the objective/weapon panels hide the right capital, plaque, and shaft. The gate occupies roughly the top 60–330 px, which is also the HUD's busiest area. It reads as separated pillar fragments around cards instead of an entry landmark.
- In `after-plain-390.png`, the gate crosses the image around the player's legs, its pillars extend beyond the narrow viewport, and the bottom overlays cover most of its lower structure. The corresponding desktop plain frame also puts much of the gate behind the dialog and bottom HUD.
- **Action:** check the ordinary entry camera and station framing at 390 px with the actual HUD visible. Place the landmark's distinguishing geometry in a usable world area, or reduce/reflow panels while introducing it. A clean isolated crop does not resolve the full-frame occlusion.

### V2 — Dialog layering leaves overlapping, ghosted interface text

- **Confidence: high. Evidence: full frames and `crop-phone.png`.** In `after-plain-390.png`, the Tavernkeeper card covers the Claim Stake panel and overlaps the underlying Build/Weapon controls. Its translucent background allows their text and circular shapes to show through the dialog body. The Claim Stake heading is cut across by the dialog's top edge. The same ghosted controls remain visible in the station phone frame.
- The desktop plain frame also overlays the Claim Stake card: the dialog covers its title and left side while part of the explanatory sentence remains visible below/right, creating two competing message surfaces.
- The dialog's own body text is readable; the defect is the simultaneous overlay stack and partially exposed controls. Still frames cannot establish whether those obscured controls remain clickable.
- **Action:** present one foreground message surface at a time or explicitly hide/reposition the covered panels. Give the dialog an opaque enough background to remove underlying text contamination.

### V3 — Archive ground exposes a hard polygon boundary and repetitive surface treatment

- **Confidence: high for the boundary, medium for repetition severity. Evidence: full frames; texture character confirmed in `crop-ground.png`.** `viewpoint-after-west-wing-1280.png` shows the gray archive ground as a large, nearly featureless quadrilateral with straight diagonal sides against the brown world at the upper left and right. The desktop station view shows similarly abrupt gray cut-ins along the bottom edge. The border has no visible curb, broken paving, debris, or gradual transition to explain the join.
- Across the large empty foreground, evenly repeated small rectangular ground marks remain visible as a regular grid. The crop confirms their repetitive, low-detail character, but the distracting large-scale uniformity is most apparent in the full frames.
- The gray-versus-brown difference may intentionally encode restoration state. That does not explain the visibly raw edge treatment. The staged restored material frame does not establish how an ordinary mixed-state boundary will look.
- **Action:** preserve any required state distinction while giving its terrain edge a deliberate visual transition. Break up the dominant ground repetition near the entry and stack using existing paving/debris forms or restrained surface variation.

### V4 — Large structures have weak contact with the ground and inconsistent shadow cues

- **Confidence: medium-high for weak grounding; medium for lighting inconsistency. Evidence: full frames and `crop-gate.png`, `crop-stack.png`, `crop-pool.png`.** The gate bases terminate in clean, bright rectangular edges with little visible surrounding contact darkening. There is no clearly readable gate-sized cast shadow, although the small object between the pillars casts a conspicuous long diagonal shadow in the same frame.
- The shelf's slab also meets the ground with a thin clean edge and little visible contact shadow. In the restored-state crop, the player has a distinct dark oval below the feet, while the much larger shelf/slab has substantially weaker ground contact. The shelf therefore reads more like a placed model than a heavy structure rooted in the terrain.
- These images do not prove that meshes float, nor do they establish the actual light setup. The observable problem is the relative absence of weight/contact cues.
- **Action:** inspect cast-shadow coverage and add or strengthen appropriate contact at the pillar bases and slab perimeter. Verify in both gray and restored material states without making the whole foreground darker.

### V5 — Shelf materials and shallow book detail weaken archive recognition at play scale

- **Confidence: medium. Evidence: full frames and `crop-stack.png`; state comparison uses the explicitly staged restored frame.** In the gray west-wing frame, the posts, roof, slab, scattered fragments, and many book-like uprights share similar pale mottling and value. The uprights read partly as a barred rack of rectangular blocks. Enlarging the crop reveals the intended books, but their spines/page boundaries and the shelf divisions remain visually simple against the coarse stone grain.
- The restored-state frame improves recognition through red, cream, and gold separation. It retains the same clean rectangular slab and similarly textured stone pieces. This is useful material-state evidence only; it is not evidence that ordinary entry already has these restored colors.
- **Action:** prioritize readable book/shelf material separation at the normal camera scale, including the unrestored state if books must be identifiable there. A few stronger spine/page cues and darker shelf recesses would help more than additional fine surface noise.

## Reference comparison and limits

- The reference plate uses dense layered shelving, broken edges, strong recess darkness, and small localized light sources to create an excavated archive. The supplied local views establish a recognizable ruined gate and a shelf landmark, but their large empty, uniformly tiled surroundings do not yet convey that density or depth. **Confidence: high for these frames; no claim about unshown portions of the map.**
- The gate's split central beam is not filed as a defect: the reference also contains a broken gate span. Its teal panels appear attached to their ledges in the crop, and no definite detached trim or mesh penetration is visible.
- The restored screenshot contains a broad warm light pool. Its falloff is smooth in `crop-pool.png`; I do not see a hard circular seam. A clearly readable lamp source is not apparent in that frame, but the supplied evidence does not establish whether the glow is intended to be environmental or magical.
- The provided crops were inspected at their enlarged dimensions after the full frames. Crop-only softness was not treated as a rendering defect, since these are enlargements of raster screenshots. No runtime zoom, animation, collision, or unshown camera coverage was tested.

## Suggested review order

1. Resolve the phone overlay collision and landmark occlusion in ordinary entry/station frames.
2. Verify terrain joins and structure grounding in normal mixed material states.
3. Reassess shelf recognition and reference atmosphere at play scale after those changes.
