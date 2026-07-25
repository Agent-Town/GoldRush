# Review — ARC 1: Twin Banks re-cut as a true two-channel braid

**Slice:** opus5-3d-night ARC 1 (the braid)
**Branch:** `sculpt/opus5-3d-night`
**Tip at review:** `0b35eb08` + this commit
**Base:** `1914950b` (main at commission)
**Author:** dedicated Opus 5 session, solo-writer commission of 2026-07-25

## Verdict

**READY-FOR-GATES.** The sculpt is a true braid, it agrees with the shipped mask
in the bytes that actually ship, and it beats main's single-channel band at the
run camera. One integration finding (F-OP5-1) must be answered before the
production tile adopts it — that answer is a src/contract decision and therefore
outside this commission's firewall, not a defect in the sculpt.

## What it does

Twin Banks was a single dark water band ~15.6 m wide (`visualHalfWidth: 7.8`)
laid across the tile. It is now cut to the shipped braid mask
`twin-banks-true-braid-dev`: two polyline channels (halfWidth 1.5 m) that leave a
common source, bow apart to |z| = 4, pinch toward each other at midspan, bow out
again and rejoin — with a dry gravel **plait** island between them, two **ford**
pans that cross both cuts as one shallow shelf, and a west source pool.

The relief is derived FROM the mask table rather than eyeballed against it: bed
depth is driven by the mask's own signed distance, so the waterline necessarily
lands on the mask boundary. North runs deep (0.46 m) and fast — which is why the
fords exist; south runs shallower (0.33 m) over riffles. Natural levee lips draw
the mask boundary for the eye, haul lanes converge on the crossings, and two
abandoned braid scars give the empty shelves a reason to exist.

The mask itself was **not touched**: the `waterMask` block is semantically
identical to main (JSON-compared, not eyeballed). The sculpt conformed to the
sim; the sim was never bent toward the sculpt.

## Evidence

| Gate | Result |
| --- | --- |
| Mask agreement, **delivered GLB vertices** | dry-inside-mask **0** / water-outside-mask **0** over 25,921 exported vertices |
| Mask agreement, generator height field | dry-inside **0** / water-outside **0** over 410,881 grid samples |
| Transition-band audit (the 0.45 m exclusion) | worst dry rise inside mask **0.0318 m**; worst bank drop below water **0.0001 m** |
| Channel separation (|x| < 12, the independent reach) | north bed min **−0.4596**, south bed min **−0.3507**, ford mean **−0.0397**, plait mean **+0.5234** |
| Build-zone flatness (|z| ≥ 7) | p95 abs slope **0.144 /m**, mean Y 0.8398 |
| Triangle budget | **51,200** / 60,000 · 25,921 verts · 1 mesh / 1 primitive / 1 material |
| Bounds | min −0.4604 → max 1.9615 (was −0.338 → 1.9498) |
| Landmark mounts | all **5** byte-identical (ids + transforms); each re-grounded via `Terrain.visualY`, all in zone `bank` |
| Zone heights, delivered | river 1,674 verts (min −0.4604) · ford 810 · bank 23,437 (min **+0.0249**, above water plane) |

Boards in `artifacts/map-rebuild-spike/`:

- `twin-banks-braid-ab-run-camera.png` — **the A/B**: main's band (left) vs the
  braid (right), one identical camera, lighting rig and scene, bare relief on
  both sides so neither is flattered by dressing.
- `twin-banks-braid-mask-proof-ortho.png` — **the mask proof**: the mask boundary
  drawn as an evidence-only emissive ribbon over the delivered relief. The plait's
  dry gravel stops exactly at the line; the ford pans span both cuts as specified.
- `twin-banks-braid-ab-after-braid-masked.png` — the same proof draped on the
  relief at the run camera (draped, not floated, so it cannot parallax off the
  ground it is proving).
- `twin-banks-braid-plait.png`, `-west-ford.png`, `-low-angle.png`,
  `-panorama-mounted.png`, `-layout.png`, `-run-camera.png`, `-ortho-relief.png`.
- `twin-banks-braid-delivered-audit.json`, `twin-banks-braid-mask-agreement.json`.

## Merge classification

Base `1914950b`. All files LANE-TOUCHED only; no MAIN-MOVED file in this slice,
so no conflicts to resolve.

- `assets/pilots/map-rebuild-spike/twin-banks-terrain.{glb,blend}` + `-atlas.png` — regenerated.
- `…/twin-banks-terrain-contract.json` — `waterTruth` rewritten to the braid;
  `maskAgreement` + `sculptRecipe` added; **`maskTruth.waterMask` unchanged in value**.
- `…/build_twin_banks_braid.py` — new, the sculpt recipe.
- `…/render_twin_banks_braid_verdict.py` — new, the verdict/audit harness.
- `artifacts/map-rebuild-spike/twin-banks-braid-*` — boards + reports.

## Findings

**F-OP5-1 — the production tile does not declare this mask (BLOCKING for wiring,
not for this merge).** VERIFIED, not inherited: `src/world/Terrain.ts:104` reads
`ACTIVE_TILE.waterMask?.regions.length`, and the braid mask
`twin-banks-true-braid-dev` exists **only** as a `devTiles` entry
(`gt-water-mask-braid`) in `assets/contracts/epoch-1-frontier/manifest.json`. The
production Twin Banks tile therefore still runs legacy band water. If this relief
is wired to production as-is, the map renders a two-channel bed under a
single-band water plane — worse than what it replaces. The paired switch
(production tile adopts `waterMask` + the mask-driven water surface) is a
contract/src change, explicitly outside this commission's firewall.
**Owner/attended decision.** The sculpt is correct and merge-safe as an asset
either way; it simply must not be *promoted* to the production tile alone.

**F-OP5-2 — the builder gated the generator, not the delivery (CLOSED).** The
builder proved mask agreement against `braid_height()`, its own height function.
That is the recipe, not the shipped bytes — the same class of gap as the Silent
No-Op. `render_twin_banks_braid_verdict.py` now re-opens the exported GLB and
judges the 25,921 vertices that actually ship. Both agree at 0/0, so nothing was
hiding; the gate is now on the delivery.

**F-OP5-3 — the 0.45 m transition band was excluded but unexamined (CLOSED).**
The builder's gate excludes a declared 0.45 m band around the boundary from its
violation count. Declared is not audited. The delivered audit now reports the
worst excursion inside that band: 0.0318 m of dry rise (a levee lip legitimately
straddling the line) and 0.0001 m of bank drop. The exclusion was not concealing
a violation, and is now provable rather than assumed.

**F-OP5-4 — contract diff noise on the mask block (NON-BLOCKING).** The
regenerated contract re-serialises `maskTruth.waterMask` from compact to expanded
JSON. The values are byte-equal in meaning (verified by JSON comparison) but the
textual diff makes the protected mask block look edited. Cosmetic; flagged so a
gate reviewer is not misled into thinking the sculpt moved the sim's truth.

## What a gate should re-run

```
blender -b --factory-startup --python assets/pilots/map-rebuild-spike/render_twin_banks_braid_verdict.py
```

It re-derives the audit from the delivered GLB and exits non-zero if the shipped
mesh ever fights the mask. It needs main's baseline GLB at
`/tmp/twin-banks-main-baseline.glb` for the A/B half:

```
git show <main>:assets/pilots/map-rebuild-spike/twin-banks-terrain.glb > /tmp/twin-banks-main-baseline.glb
```
