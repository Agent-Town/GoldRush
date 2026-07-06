# art-run-004 walk4 — hero + claim-jumper 4-phase gait sheets (s64 drain)

**Verdict: PASS — processed + contract-wired DORMANT.** 4 raws → 64 processed cells, contract `walk4` blocks added to both slots (runtime-dormant), gates green. Gait WIRING + activation are a separate Codex task (031 follow-up), by owner directive (s9at) and s63 handoff.

## Scope
- Request: `assets/requests/codex-art-run-004.md` (Codex `image_gen`, raw-only; 4 sheets `char-{hero,jumper}-sheet-walk4-{a,b}.png`, 1700×1700, 4×4 @425, key `#ff00ff`).
- Rows = directions (a: s/se/e/ne; b: n/nw/w/sw), columns = gait phases contact/down/passing/up.
- This drain: extract-alpha, contract dormant rows, LEDGER. No `src/` logic, no gait wiring.

## Evidence

### Extraction
`node scripts/extract-alpha.mjs --key ff00ff --grid 4x4 <4 sheets>` → 16/16 cells each, keyed 80.6–81.8%, `@512px`, 4 frames.json. All four auto-fit to **scale=1** (capped) — no `--scale` override.

### Cross-sheet height (s37 no-size-pop law)
Output content = native bbox @ scale=1. Measured processed bbox heights:

| Sheet | height band | avg | target band | verdict |
|---|---|---|---|---|
| hero-walk4-a | 338–353 | 346.9 | rotation2 output 316–379 (avg 349.6) | ✓ in-band |
| hero-walk4-b | 336–372 | 355.0 | rotation2 output 316–379 | ✓ in-band |
| jumper-walk4-a | 311–349 | 329.0 | jumper-rotation walking 298–332 | ✓ in-band |
| jumper-walk4-b | 277–310 | 293.2 | jumper-rotation (back rows shorter) | ✓ consistent |

No cross-sheet size-pop vs the active 2-frame rotation. **Bonus:** these height-matched jumper cells also resolve the jumper-rotation SCALE DEBT (old rotation figures 296–331 vs side-sheet 409–439) flagged in `characters.v2.json` — walk4 lands in-band without upscaling.

### Code gates (contract feeds SpriteAnimator via `?raw` JSON.parse)
- JSON valid ✓
- `npx tsc --noEmit` clean ✓
- `npm run build` green (430ms) ✓
- `e2e/m1-01-claim-jumpers-death.spec.ts` **8/8** desktop-chrome + mobile-chrome (26.7s) — boot clean, zero console/page errors, active hero rotation animates, draw-call budget held. Dormant `walk4` block is parsed and ignored (SpriteAnimator reads only `rotations`/`orientations`; walk4 cell PNGs load lazily = not requested).

### Visual QA (montages `reviews/shots-art-run-004/*-montage.png`, cells composited on dark neutral to judge alpha edges)
- **Alpha:** clean flood-fill keyout, no magenta fringe/halo, figures centered feet-to-bottom.
- **Hero:** Frontier Ledger sepia/ochre duster, wide-brim hat, **teal chest accent** present and belt-tool side consistent across all 8 directions. Gait phases read distinct (longest stride on contact, bent knees on down, legs crossed on passing, lifted heel on up).
- **Jumper:** rust-red poncho, dusty hat, bandana, crouched sneak; gait distinct; **no weapons in any cell** (canon brief §9 satisfied — no firearms, not gory).
- Directions read correctly across a/b for full 8-way.

## Findings
- **F-004-1 (minor, non-blocking, QA-inherited):** `char-jumper-sheet-walk4-a` row 1 (se) first two cells lean more side-profile than ideal; hemisphere/direction still reads correctly. Request QA accepted without retry; concur — no regen owed.

## Contract wiring (dormant)
Added `walk4` block to `char.hero` and `char.claim_jumper` in `assets/layer-contracts/characters.v2.json`: 8 directions explicit (no mirrors), each `frames.files` = [contact,down,passing,up], `clips.walk` frames [0,1,2,3] fps 8 (placeholder). `status: RUNTIME-DORMANT`. SpriteAnimator's `Contract` type does not read `walk4`, so behavior is byte-identical at runtime until the gait-wiring task adds a reader.

## Next
Gait-wiring Codex task (031 follow-up): SpriteAnimator reads the `walk4` block for 4-frame walk clips (tune fps, optional frame crossfade per 031's animator work), then activate — closing the "walks not round" owner note (s9at). No new art owed.
