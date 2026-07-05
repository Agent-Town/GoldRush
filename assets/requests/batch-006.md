# batch-006 — invention icons tranche 2 + blast family + favicon (pipeline v2 / image_gen)

Style: EXACTLY batch-002 icon rules (style anchor, ONE centered object, bold small-size silhouette, generous margin, flat #8a8a8a bg, no text, brass/wood/ochre + teal accent only, no firearm shapes). Reference-condition on the six existing processed icons for family consistency.

- icon-panning.png (ui.upgrade.icon.panning): brass pan mid-swirl with water arc + three gold glints.
- icon-prospecting.png (.prospecting): hand pick crossed over a magnifying loupe, tiny nugget sparkle.
- icon-beacon.png (.beacon): miniature sentry-beacon tripod with radiant teal lantern rays.
- icon-gold.png (.gold): banded coin-sack with nugget spill, prosperity not greed.
- icon-mend.png (.mend): riveted patch plate over a heart-shaped timber knot, small hammer.
- icon-blast.png (.blast): round powder keg with a short sparking teal fuse, comic not menacing.
- favicon-source.png (NOT gray bg): a bold roundel that reads at 16px — gold pan seen top-down with three fat nuggets, thick sepia outline, parchment disc background, tiny teal glint; MAXIMUM silhouette boldness, minimal linework (favicons die by detail).

Wiring: icons → existing ui.upgrade.icon.<family> lazy glob (zero code); favicon-source → processing fire downscales (48/32/16) + adds <link rel="icon"> to index.html replacing the data:, placeholder (2-line §5 supervisor fix at the next gate).

Status: staged s9z; NOTE for the next fire — this file + tasks/019 are UNCOMMITTED (orchestrator sandbox disk-full); commit them with your docs sweep.
