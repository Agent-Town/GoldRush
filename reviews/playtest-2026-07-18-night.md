# Playtest intake — the 3D Claim, owner, 2026-07-18 night (verbatim + verdicts)
Owner (heading to bed): "I can't place the sluices next to the water. I can't preview buildings I build. I can walk through the buildings that are there as landmarks. [201] on load I had direclty this phaenomenon. Same thing happened after I won and went back to town [202]. [203] they are running into the river somehow after being freed at certain places. [204] - the map should continue similar to the playing field. This looks really bad. [205] there is something in the upper part of the screen, not sure why that is there."

| F-ID | Finding | Class | Corrective |
|---|---|---|---|
| F-N1 | Sluices won't place at water; no build previews | P0 — interaction layer not promoted with the render (ghosts buried at y=0; picking must stay PLANAR) | lane-run3d-interaction (d) |
| F-N2 | Freed walkers wade the river | P1 — edge-routing ignores water | lane-freed-water-routing (c) |
| F-N3 | Dark band across upper screen on boot + town return [201/202/205] + the flat wedge at map edge [204] | P1 — panorama/plate framing + edge continuation | lane-panorama-band-framing (b) |
| F-N4 | Walk-through landmarks | P2 — solidity by DATA (footprints), never by mesh implication (craftbook law honored) | lane-landmark-collision (a) |
Screenshots: owner's five (Desktop, 23:27-23:39). All four masters queued into the overnight machine.
