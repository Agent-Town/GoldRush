# Railcar damage keeps the painted metal

The old damaged boiler set a flat cyan emission across the entire mesh. The actual gameplay comparison in `material-comparison/` shows this replacing panel detail with a solid bright block. The wheels had the same issue with stronger orange emission.

The new runtime uses the existing base-color texture as the emission map. It creates no new texture object, image, or light. Every component retains its own material clone, so a damage accent affects only the selected component. White emission preserves the painted iron, brass, and teal; damaged components retain a small amount of their previous warning tint.

Matched, frozen-pose comparisons were captured at intact fill levels .14, .55, and .90, with .65 and 1.0 damage fill in the stronger alternatives. Every crop is extracted from its saved full PNG. The .14 version kept the surface texture but remained nearly black. An independent visual reader considered .55 the lowest readable alternative and also accepted .90; the orchestrator selected .90 intact and 1.0 damaged to provide more margin in the dark gameplay scene. This is a visual judgment, not a measured universal optimum. The teal lamps remain small at the model's roughly 90-pixel native footprint.

The full sweeps are in `material-comparison/` and `fill-sweep/`. `after-before-steam-uv/` captures the selected runtime material before the asset's final deterministic steam-UV correction. The final `after/` batch is regenerated against the final asset hash.

The standalone runtime check verifies that the emission map is the same texture object as the base map, that the three component materials share one atlas, that damage preserves that mapping and stays component-local, and that fill strength does not exceed the authored texture range. Existing lifecycle tests remain responsible for actual texture disposal and renderer counts.
