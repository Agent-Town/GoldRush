# Long Road — HELD: graded approach still stops outside the railhead disc

The driver now rejoins the authored graded road's centreline, walks its forward convoyRoute waypoint at (136,0), and uses stopReach from deriveMechanicsManifest(contract), which publishes the runtime 2.5-unit radius. No hardcoded map radius or simulation rule changed. The relaxed distance also applies to the driver's dispatch/arrival observation on this map only.

| Project | Death wave | Sim seconds | HP | Browser errors |
| --- | ---: | ---: | ---: | --- |
| desktop-chrome | 3 | 113.200 | 0 | 0 console, 0 page |
| mobile-chrome | 3 | 101.733 | 0 | 0 console, 0 page |

Both rides grade the west stake, gather all three tar nodes, rejoin the centreline, and reach (136,0). Neither reaches the final disc. Desktop stalls at (188.167,5.086); exact phone coordinates and notes are in [rows](default/). Both Haulers remain idle at (-180,0), target null, distanceTravelled/roadDistance 0. No destination Confirm, objective completion, bank, Book return or reload proof.

The revised approach is measured and still insufficient. This is not a survival-only failure with a working objective: **no restore-ground ride is eligible**. Exactly one default per project; paired command exit 1. No additional iterative route probes. The railhead mount is authored at (188,0.1207,0), close to the stop (190,0); this suggests a collision/approach investigation, but neither bounded walker failure nor mount location proves the stop unreachable by a human. No F-ID or production/balance edit.

**Remaining owner QA/native route driver:** inspect the railhead's reachable boundary and choose an obstacle-aware final approach under a new ride allowance; HUD/map owner only if a human-facing obstruction is established. Full raw logs and dumps remain external under ~/.goldrush/play-proofs/run-18/default/e4-long-road/. [Default evidence](default/) retains direct command, exits, terminal images and frozen objective snapshots.
