# The Long Road — visual verdict, 2026-09-20

UNACCEPTED: road-to-horizon and roadside-stop hierarchy are not communicated at plain entry; smeared dark ground, a large left-edge surface and close wagon dominate; portrait and story overlays further restrict context.

The plate uses a long straight road, spaced service stops and a convoy to create distance. Desktop entry instead puts a tall wagon beside the actors, with a large diagonal surface at the left edge and blurred horizontal ground detail; phone frames the wagon tightly. The wagon is a useful local landmark, but the entry gives little evidence of the broader road composition. Existing native convoy progress is unchanged and is not judged by this art screenshot. Reworking ground projection and the route presentation needs an authored pass; camera and story UI are excluded owners. No production change was made.

[Desktop board](board-1280.png) · [Phone board](board-390.png). Both panels are fresh plain boots of **unchanged production bytes**, labelled A/B. They are not a claimed before/after improvement. Four runs per arm and viewport use a frozen diagnostic with normal HUD; all frames remain in [verdict-captures.json](verdict-captures.json). All four plain boots have zero console/page errors, correct active contract and no test hook.

| View | Draw calls A / B | p95 median A / B | A/B delta |
| --- | --- | --- | --- |
| 1280 | [63] / [63] | 9.65 / 9.30 ms | -3.63% |
| 390 | [54] / [54] | 10.15 / 10.10 ms | -0.49% |

Timing variation between identical arms measures the host, not an art regression or improvement. The full eight-run distributions are in [performance-summary.json](performance-summary.json); do not interpret a pooled median as a distinct mode. Triangle counts and each applicable authored cap are in asset-budgets.json (or the explicit fallback inventory).

No source or asset changes in this verdict. The latest tsc/default/full build and named-guard receipt from the unchanged runtime boundary remains applicable; no map-specific simulation success is inferred from a plain boot.

Engine before = after `32e59def741b8d0ce673e54dfa4714a7d824a50d2b08fbe806c09c3515e768bb`; pin untouched. No objective/persistence status is changed by this visual verdict.
