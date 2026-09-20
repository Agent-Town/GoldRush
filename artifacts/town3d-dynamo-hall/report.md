# Town 3D — Dynamo Hall

- Blender 5.1.2 source and GLB: one mesh, one primitive, one material, one embedded 1024px painted atlas.
- Contract: 2,612 triangles; bounds 5.380 × 4.148 × 3.239; grounded/base-centered; zero cameras, lights, animations, emissive texture, or emissive strength.
- Visual identity: paired flywheels, brick-and-timber hall, raised clerestory, copper bus bars, teal door lamp, authored side/back openings.
- Runtime: additive `town3dPilot=dynamo_hall`; `all` includes it; complete stage only; LITE, flag-off, pre-T2, and load failure preserve the existing vignette and interaction.
- Tone: fixed non-ground TS-04 samples differ by 4.81% (5% gate passes).
- Performance: desktop p95 ratio 1.0471; mobile p95 ratio 0.9271; both below 1.15.
- Browser gate: 12/12 across desktop Chrome and mobile-390; zero console/page errors, including delayed-load disposal.
- Adjacent gates: Tavern + General Store 14/14 across both projects.
