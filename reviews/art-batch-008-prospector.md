# Review — art-batch-008 Prospector body (hover4 sheets + portrait), s83 art drain

**Verdict: PROCESSING PASS.** All 3 raws extracted/processed and visually QA'd against
the batch criteria. Canon-clean. Contract-wiring + DORMANT→ACTIVE activation + in-world
render review are explicitly DEFERRED to a follow-up (see §Deferred).

## What landed (assets/processed/)
- `char-prospector-sheet-hover4-a.png` → 16 cells `-r{0..3}c{0..3}.png` + `.frames.json`
  (`--key ff00ff --grid 4x4`, auto-fit @scale=1, keyed 76.0%, 0 empty).
- `char-prospector-sheet-hover4-b.png` → 16 cells + `.frames.json` (keyed 78.0%, 0 empty).
- `char-prospector-portrait.png` → 768×768 full-bleed (parchment kept, matches townsfolk
  portrait size/framing).
- Montage evidence: `reviews/shots-art-batch-008/hover4-{a,b}-montage.png`.

## QA vs the batch's measured criteria (codex-art-run-005 self-QA map)
1. **16 distinct cells/sheet, grid aligned** — ✓ 16/16 both, 0 empty.
2. **Row directions match the map** — ✓ A rows s/se/e/ne, B rows n/nw/w/sw. Verified by
   eye on the montages: front-facing rows (s/se/sw/e) show the teal belly core-seam;
   the back rows (n/nw) correctly HIDE the front core — genuine 8-way rotation, not
   mirror-flips.
3. **Hover phases distinct** — ✓ the teal hover-jet + glow pulse read as a low→rise→high→fall
   cycle across the 4 columns of each row.
4. **Pan-arm side consistent** — the portrait fixes identity: pan is on the automaton's
   RIGHT (viewer's left), a gold-flecked prospector's pan. Sheet arms read consistent
   side-to-side at cell zoom (pan not individually resolvable at 200px thumb — acceptable,
   noted).
5. **Magenta clean for extraction** — ✓ keyed 76/78%, despilled, no magenta fringe on the
   dark-gray montage bg.
6. **Teal glow reads at scale** — ✓ core-seam + hover jet clearly legible at 200px thumbs.

**Design/canon (brief §9.2/§9.4, ADR-001):** a small, warm brass-and-copper lantern
automaton — miner's cap with an amber lamp, teal agent-glow core, articulated arms, hover
jet (no legs). Frontier-tech + agent-tech teal glow; NO firearms; NOT gory; charming.
Canon name "the Prospector". Fully compliant.

## Measurements (frames.json bbox heights)
- Sheet A: min 209 / max 220 / **avg 215**px (very tight — good hover-phase stability).
- Sheet B: min 196 / max 214 / **avg 203**px.
- Both sit a touch under the generator's 221–265 hero-band target (the gen already flagged
  B short after its 2-retry limit). This is NOT a defect: the automaton is meant to be a
  small ~70%-of-hero buddy, and final on-screen size is set by the sprite's world-scale at
  activation, not the in-cell fit (auto-fit capped at scale=1, never upscales).
- **Cross-sheet seam finding (F-008-1):** A avg 215 vs B avg 203 ≈ 6% larger on A. If both
  hemispheres render at one sprite scale this is a subtle size-pop when the companion turns
  front↔back. Fix at activation: re-extract sheet A `--scale 0.944` to match B, or apply a
  per-hemisphere world-scale compensation. Non-blocking for DORMANT processing.

## Deferred to a follow-up (NOT done this fire — reason: integration + quiet host)
Activation is integration design tied to lane-b `m4-re-land`'s embodiment (the M4-06
procedural automaton billboard), not a rote pipeline step, and its gate needs an in-world
screenshot of the companion actually rendering — which fights the current host contention
(SCI-01 is live). Remaining steps for the activation task/fire:
1. Add `char.prospector_agent` hover4 rows to `characters.v2.json` (8 dirs EXPLICIT, no
   mirrors, 4 hover-bob phases), DORMANT — mirror the walk4 block shape (row 32 s64).
2. Wire SpriteAnimator to read the hover clip on the embodied Prospector; scale-match A/B
   (F-008-1) and set world-scale to the 70%-of-hero band.
3. Boot the game with a Prospector present, screenshot desktop+390px, review the hovering
   companion in-world; then flip DORMANT→ACTIVE and mark Integrated ✓.
Best authored as a Codex task from `reviews/m4-re-land.md` + this review, or run attended
on a quiet host.
