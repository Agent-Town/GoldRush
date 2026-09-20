# E3 shipped atlas recipes restored — 2026-09-19

F-OMB-5's atlas reproducibility gap is FIXED. The tracked `assets/pilots/map-rebuild-spike/build_landmark_packs.py` now owns the current E3 plate inputs, per-pack palettes and an atlas-only CLI. **All four shipped atlases reproduce byte-for-byte; maximum 8-bit pixel delta is zero.** [Proof](proof.json), [input hashes](recipe-inputs.json), [production-file preservation](production-preserved.json).

| Pack | Current recipe | Rebuilt SHA256 |
| --- | --- | --- |
| Blackout Ridge | Pylon plate, lifted E3 palette with current stone (0.115,0.098,0.078) and brass (0.78,0.5,0.12) repair | dc090249aa8337a4eac43bf45480b577917466fa961e6b36700afd4c5ab6a1d7 |
| Canyon Works | Canyon plate and distinct 07bcf8834 palette | 5819f8eec12371756a0b2b36342bdbf8560ee3c4e99c16f35fe2cae28c1bbd5b |
| Fairground | Arc-lamp plate, lifted palette from 7b930acc1 | 3573fb688b1ae37ff45b00f7be6dbc6b3e08e797c0b84e875c9edda1be560f40 |
| Moth Season | Mothswarm plate, lifted palette from 75beb002c | 1875cfcfacc69ea7ebc872225861f04a0ef754cfd412d94ee445d06b89e146c3 |

All use the existing era-3 kit and unchanged grain/ink/hatch construction. The public command is:

```sh
/Applications/Blender.app/Contents/MacOS/Blender --background --python-exit-code 1 \
  --python assets/pilots/map-rebuild-spike/build_landmark_packs.py -- \
  --atlas-only blackout-ridge --out artifacts/sol/map-art-campaign-2/_raw/run-2/e3-recipes/rebuilt
```

Substitute any of the four pack names. Output is `<out>/<pack>/<pack>-landmarks-atlas.png`. `--out` is mandatory; pointing it at production `landmarks/` is rejected with exit 1. The recipes reproduce the **atlas**. Historical PACKS/SPECS geometry was not resurrected: it predates reviewed geometry and could overwrite later receiver/wheel/UV repairs. Bare E3 geometry rebuild requests now explain the atlas command; reviewed `.blend` files and existing pack-specific scripts remain the geometry sources. No GLB, blend, atlas, mount table or runtime source changed.

## Newly measured provenance discrepancy

Moth's current pack contract names `moth-season-landmark-material-atlas-v1.png` and `retexture_moth_landmarks.py`, but its PNG **and the embedded image in `north-migration-watch-gate.glb`** hash to the older procedural atlas above. The raw native material source has SHA256 `16f91896aa57adbb97c49201165c417e86d5ecc2cdd2f2ad547f2df00fc59fc9`. A resize of it is visibly different and has a maximum channel delta of 172, so it cannot honestly be called a reproduction. The first native-source attempts and their images/logs are preserved in `_raw/run-2/e3-recipes/attempt-1` and `attempt-2`.

The restored recipe deliberately reproduces shipped pixels. Whether to promote native Moth materials or correct that older provenance declaration remains an explicit follow-up, with no new visual acceptance here. Blender 5.1.2 also invalidated resized file-image data when its color-space setter ran afterward; the diagnostic failure is retained, and `--python-exit-code 1` prevents Blender's default zero status from hiding Python errors.

Engine before = after `32e59def741b8d0ce673e54dfa4714a7d824a50d2b08fbe806c09c3515e768bb`; pin untouched. This is recipe repair with exact production-byte preservation, not another art grading pass.

Final validation: tsc, default build and full build PASS; named task/citation/gate-caller guards 3/3 PASS; invalid production output request rejected before writing. All 32 inventoried shipped pack files are unchanged. No full node battery.
