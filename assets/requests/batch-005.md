# batch-005 — decoration props + one-shot FX flourish sheets (LEDGER queue 6)

**Order:** runs AFTER batch-007 (jumper regen outranks decoration, §7; one batch in flight at a time). Decoration tier — lowest gameplay impact in the queue; do not bump it above enemy/hero work.

**Scope note:** this is the REMAINDER of the original batch-005 plan — the icons-tranche-2 half shipped via batch-006 (s38). What's left: 3 scatter props (existing claim-terrain contract rows, filenames pinned since batch-001 era) + 2 NEW one-shot FX flourish sheets (m1-core contract rows added s40, DORMANT — CombatVfx procedural puffs/ticks/rings remain the live FX until a wiring slice; placeholder-first law).

Style anchor (in every prompt): *"Antique frontier expedition ledger map style — the style of a Wild-West survey map: fine sepia engraved linework and hatching, subtle aged-paper texture, muted warm colors, illustrated — not photorealistic, not saturated."*

**Candidates:** 2 per prompt (10 image calls); a 3rd only if both fail QA. Decoration budget stays small.

---

## Part A — scatter props (single cutouts)

**Format (every Part A prompt):** ONE single centered object, flat solid uniform gray #8a8a8a background everywhere, no cast shadow on the ground, no text/letters/numbers/watermarks, soft light from upper left, generous margin, bold silhouette that reads at small size. Style anchor above. Processing: `extract-alpha.mjs` default gray key (+ `--deshadow` if any shadow sneaks in).

### prop-rock.png (prop.rock, 512×512 target)
A weathered granite boulder cluster for a riverside gold claim — one large rounded stone leaning on two smaller ones, fine sepia engraved hatching for shading, a few ochre lichen patches, tiny quartz vein glint. Sturdy, mossless, sun-bleached frontier rock. [+ format block + style anchor]

### prop-stump.png (prop.stump, 512×512 target)
An axe-hewn tree stump, cut low — visible growth rings on the cut face, bark peeling on one side, two axe chips in the rim, a single wood chip on the ground beside it. Warm sepia and ochre, engraved-linework grain. [+ format block + style anchor]

### prop-claim-post.png (prop.claim_post, 512×512 target)
A frontier mining claim marker post — a stout squared wooden stake driven at a slight angle, top whittled to a blunt point, a small BLANK tin tag nailed near the top (no lettering of any kind), one wrap of cord below the tag, small teal glint on the tag edge (the only cool color). [+ format block + style anchor]

---

## Part B — one-shot FX flourish sheets

**Format (every Part B prompt):** ONE image, 3 columns × 2 rows grid of equal cells, NO borders/labels/text, flat solid uniform bright magenta #ff00ff background everywhere, no magenta spill/reflections, the SAME effect at identical scale and lighting evolving frame-to-frame across cells, centered in every cell, crisp illustrated ink edges — NO soft translucent gradient fringes (keying law), soft light from upper left. Cells read r0c0,r0c1,r0c2,r1c0,r1c1,r1c2 = frames 1–6 of a one-shot animation. Style anchor above. Effects must read against parchment-sand terrain: mid-value sepia/umber cloud tones + gold + restrained teal, never white-on-white. Processing: `extract-alpha.mjs --key ff00ff --grid 3x2` → cells + frames.json.

### vfx-death-poof-sheet.png (vfx.death_poof, 3x2, 6 frames)
An illustrated dust-poof burst — the comic, bloodless "defeated" puff (canon §9.2: never gory; pure dust and ink, no skulls, no bones, no body parts). Frames: r0c0 tight small dust kernel just bursting · r0c1 expanding billow with curling edges · r0c2 full cloud, 2–3 tiny gold glints escaping · r1c0 cloud breaking into separate curls · r1c1 thinning wisps drifting up · r1c2 last faint wisp + two drifting motes. Sepia/umber dust with engraved-hatch shading. [+ format block + style anchor]

### vfx-levelup-flourish-sheet.png (vfx.levelup_flourish, 3x2, 6 frames)
A prosperity level-up flourish — celebratory, not magical-fantasy: engraved-linework rays, not lens flare. Frames: r0c0 single small teal-gold spark at center · r0c1 spark blooms, thin ring forming, first gold motes · r0c2 full radial burst — short engraved sepia rays, one thin teal ring, a fan of rising gold motes · r1c0 ring expanding + fading, motes rising · r1c1 rays gone, scattered drifting gold glints · r1c2 last two faint motes. Gold dominant, teal only in the ring/spark. [+ format block + style anchor]

---

## QA gate (per asset, measured — batch-007 discipline)

1. Props: single object, figure bbox height 55–85% of canvas, bg uniform gray (no gradient/vignette), zero text, silhouette readable at 64px.
2. Sheets: 6 equal cells; effect present and centered in EVERY cell; effect scale consistent across cells (no cross-cell size pop — s37 height-seam law); frame order reads as one continuous one-shot left-to-right, top-to-bottom; zero text; no magenta painted INSIDE the effect (interior-spill check, s15 lesson).
3. Canon: death poof contains no gore signifiers; claim tag is blank; teal stays the only cool accent.

## Wiring

- Props → existing `claim-terrain.layer-contract.v1.json` rows (`prop-rock.png`/`prop-stump.png`/`prop-claim-post.png` → `prop.rock`/`prop.stump`/`prop.claim_post`, scatter billboards). `src/assets/slots.ts` already mirrors these ids.
- Flourishes → `m1-core.layer-contract.v1.json` rows `vfx.death_poof`/`vfx.levelup_flourish` (added s40, DORMANT — no consumer until a wiring slice swaps CombatVfx's procedural puff/ring for the sheets behind the same call sites; slots.ts mirror deferred until consumption, bld.portrait precedent).

## Status log

- Prompts written 2026-07-05 (s40, orchestrator doc lane). Queued behind batch-007. Generation: next art-idle run after the jumper regen lands — Codex `image_gen` (run-log format `codex-art-run-00N`) or ChatGPT-web fallback.
