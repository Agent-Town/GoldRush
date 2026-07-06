# Gameplay terrain — real elevation as a simulation citizen (epoch-class spec)

Status: DRAFT v1 for owner ratification (3 items at bottom). This is the fork BEYOND W1-07's visual maximum: terrain that *plays*, not just *reads*.
Owner directives (verbatim): 2026-07-07 morning — "not a flat surface but real terrain with ups and downs and nooks and crannies… a big step… it will really add a lot." Same day, GO: "**lets write that spec and think it through. I think it would offer many more options for future contracts/scenarios and it would make things better.**"

## Thesis
Elevation becomes something the SIM knows, not just the renderer: slopes change movement, ridges block sight, gullies channel waves, high ground matters for turrets, water has depth because the land dips. The payoff is exactly what the owner named: **contract/scenario variety** — ambush ravines, hilltop claims, terraced mines, a defensible pass — every future era-stamped tile becomes a spatial puzzle, authored as DATA in its epoch bundle.

## The First-Claim Law (protects everything already built)
**The original river claim stays on the flat simulation forever.** It is era-stamped (Replay Law), it is the tutorial, and it is the regression baseline — its determinism fingerprint must stay byte-identical through every GT slice. Elevation arrives only on NEW tiles that opt in via their epoch-bundle tile descriptor. No migration crisis, no re-balancing of everything we've tuned; W1-07's visual drama ships on the classic claim regardless (rendering-only), and this spec supplies the *physics* for the tiles that come after.

## Architecture (one authoritative source)
- **Heightfield `H(x,z)` per tile** — static data in the tile descriptor (authored grid + analytic modifiers), loaded by the epoch registry (SCI-04 socket). Static ⇒ deterministic ⇒ the fixed-timestep and event-log invariants survive untouched (positions stay (x,z); y derives from H everywhere, sim and render alike — the W1-01 `visualY` split collapses into one honest function on elevation tiles).
- **Movement**: per-step slope cost — uphill slows, steep is impassable (`slopeMax`), downhill slightly quickens. Routing/nav becomes an edge-cost graph over the height grid (enemy lanes follow valleys naturally — wave channeling becomes level design).
- **Sight & fire**: `canTarget` generalizes from 041's palisade check to terrain occlusion (ridge blocks turret and bandit alike); high ground grants range honestly (geometry, not a stat). Projectiles fly true 3D — the lob machinery generalizes.
- **Water**: river/lake depth = where H dips below waterline; wading/current/wet-powder rules read depth from the same field.
- **Building**: pads require slope ≤ buildableSlope; optional terracing (gold cost to flatten) as a BT-family interaction.
- **Agents**: the tool surface gains height-aware queries (`get_terrain`) — the Prospector and future recruits path and reason like everything else; no new authority.
- **Camera**: follow-height smoothing + occlusion nudge (small, but listed — it's where 3D terrain usually hurts first).

## Honest cost assessment (owner asked "how complicated")
Milestone-class, not slice-class: routing rewrite + per-tile balance + LOS integration + water depth + build rules + authoring/validation tooling (no unreachable pockets unless the tile INTENDS them) + an e2e battery per tile archetype. Rough shape: 7 slices, each independently gated, ~the size of the whole W1 pass combined. The mitigations that make it sane: the First-Claim Law (nothing existing re-tunes), the identity-preserving substrate slice (GT-01 proves zero behavior change before any behavior changes), and tiles as data (authoring cost amortizes across every epoch forever).

## Slices
- **GT-01 Substrate**: `H(x,z)` API + tile descriptor plumbing with H≡0 everywhere — ZERO behavior change, proven by determinism fingerprint + full suite identity on the classic claim. (Startable early; everything else waits.)
- **GT-02 Movement on slopes** — on a dev-only test tile, never the claim.
- **GT-03 Routing/nav** over the height grid (waves follow terrain).
- **GT-04 Sight & projectiles** (terrain occlusion, true-3D flight, high-ground range).
- **GT-05 Water depth** from the field (wading/current unified).
- **GT-06 Build pads & terracing** (slope limits, flatten cost, BT interlock).
- **GT-07 The first real elevation tile** — shipped as an era-stamped ADVENTURE on the tavern contract board (its debut IS a contract), with "high ground / ravine / pass" modifier vocabulary entering the epoch bundle. This is where the owner's "more options for future contracts/scenarios" lands as playable fact.

## Sequencing (recommendation)
GT-01 substrate: authorable soon (identity-preserving, cheap insurance). GT-02+ wait behind: M6 attempt-4 landing (actors foundation — in flight now), Town v1 spec (the contract board is where tiles become reachable), and the W1-07 visual max verdict (it may buy more feeling than expected and informs how dramatic the physical terrain should be). Realistic start of GT-02+: after the town stands.

## Ratification (Robin)
1. **First-Claim Law** — the original claim stays flat-sim forever (replay + regression anchor). Confirm?
2. **Sequencing** — GT-01 substrate soon; GT-02+ after Town v1 + W1-07 verdict. Confirm, or pull the whole ladder earlier?
3. **First elevation tile flavor** — what should GT-07's debut adventure be? (My pitch: a narrow mountain pass claim — "hold the high ground" — the most legible showcase of slopes, LOS, and channeling in one tile.)
