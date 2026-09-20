# Night Shift — visual verdict, 2026-09-20

UNACCEPTED: lantern sequence and warm light pools are not communicated in the plain entry view; the river and foreground rig lose dark detail, the rig is cropped, and phone story/HUD cards cover the player-facing space.

No cheap material-only correction was promoted: the dominant problems are the entry composition, local light hierarchy and foreground framing. The desktop capture includes the real automatic quality-reduction notice under host load; it is not hidden or counted as an art improvement. The phone story card is also retained in evidence. Camera/HUD and character assets are excluded.

[Desktop board](board-1280.png) · [Phone board](board-390.png). Both panels are fresh plain boots of **unchanged production bytes**, labelled A/B. They are not a claimed before/after improvement. Four runs per arm and viewport use a frozen diagnostic with normal HUD; all frames remain in [verdict-captures.json](verdict-captures.json). All four plain boots have zero console/page errors, correct active contract and no test hook.

| View | Draw calls A / B | p95 median A / B | A/B delta |
| --- | --- | --- | --- |
| 1280 | [75] / [75] | 35.05 / 27.95 ms | -20.26% |
| 390 | [63] / [63] | 17.25 / 17.05 ms | -1.16% |

Timing variation between identical arms measures the host, not an art regression or improvement. The full eight-run distributions are in [performance-summary.json](performance-summary.json); do not interpret a pooled median as a distinct mode. Triangle counts and each applicable authored cap are in asset-budgets.json (or the explicit fallback inventory).

The standard landmark-brightness checks already passed for Night Shift on both projects in the final Echo gate. No Night Shift source/assets changed afterward. Latest E3 recipe tsc/default/full builds and named guards pass; production pixels are unchanged. The wide early p95 samples settle downward in both viewports; identical arms and all samples are retained, with no causal performance claim.

Engine before = after `32e59def741b8d0ce673e54dfa4714a7d824a50d2b08fbe806c09c3515e768bb`; pin untouched. No objective/persistence status is changed by this visual verdict.
