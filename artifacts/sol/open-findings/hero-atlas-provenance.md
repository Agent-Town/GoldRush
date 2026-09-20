# Hero gameplay atlas provenance

Native `image_gen` generation on 2026-09-19, referencing the existing pilot's painted atlas and turntable. No paid image service was used.

Requested art: a simpler square gameplay diffuse atlas, warm frontier heroine palette, clean material regions, no lettering, no lighting baked into the swatches; leather, linen, hair, ochre coat, trouser cloth, boots, skin, brass, teal and iron. Native output is retained as `hero-atlas-native.png` (1254 × 1254). The tool did not deliver the requested exact 1024 dimensions; a deterministic Lanczos resize creates the actual 1024-square gameplay texture.

The model uses the material swatches. Its geometric eyes, nose and mouth retain the face's readable features; the unused portrait region is not projected onto side/back surfaces. UVs are generated for every authored component, including cap, side and rear faces, with eight pixels of padding from painted region boundaries. Material regions are reused intentionally across disconnected parts; this is not a nonoverlapping bake atlas.

The builder preserves the authored silhouette, skin weights and the existing walk choreography, switches the texture to Principled base color, and removes emission. `build-gameplay-atlas.py` is idempotent on the committed blend. `hero-3d.export.json` remains the export selection/rig contract.

Walk completion also bakes vertical sole grounding into the existing action and resamples at 128 fps, preserving its half-second duration and joint motions. The exported skin is independently checked by `validate-export.mjs`.
