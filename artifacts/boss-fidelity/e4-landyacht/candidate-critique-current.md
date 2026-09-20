# Land Yacht — current independent visual critique

2026-09-08. Fresh unprimed reviewer `/root/e4_current_asset_critique` inspected both source plates, all five current model states/views, and all six exact 2x crops. Asset SHA-256: `3b1d1f8d961eca86de34d37e9378c23da24314cb8552546bb9733fec80721a29`.

No clear floating parts, z-fighting or broken shading artifacts were established. Remaining high-confidence gaps:

- Wheels tilt/deform and crane ropes sag, but damage lacks the reference's strong torn plating and dangling-cable read at full-view size.
- Glazing damage reads as a dark missing pane with one triangular remnant; surrounding fractured glass remains simplified.
- Wheel axles/suspension are visually obscured. This does not prove detached geometry.
- Hull and accommodation decks remain compact and simplified relative to the long, layered source vessel. Crane gears, chains and articulated grab mechanics are schematic.
- Brown metal values and opaque mottled teal provide less material separation than the source; deep lower shadows hide mountings and damage.

One medium-confidence crop observation was possible crowding/intersection of the damaged grab with the bow railing. Root checked actual saved-Blend vertices and the exported byte-identical asset: the lowest damaged grab is 0.13335 units above the highest wheel/deck/rail vertex. Therefore this pose does not intersect that assembly; perspective still compresses the visible gap. The new assertion lives in `verify-candidate.py` and passed.

Root agrees with the remaining fidelity/readability limits. The next useful check is the actual game camera, lighting and component-target fit, followed by focused corrections where those limits affect play. This is an asset candidate ready for that integration check, not final E4 visual acceptance.
