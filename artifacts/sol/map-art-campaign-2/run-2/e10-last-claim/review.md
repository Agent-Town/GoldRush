# The Last Claim — visual verdict, 2026-09-20

UNACCEPTED: the circular orbital deck, central orrery, ornate rim and three preserve stations are absent from the plain entry; grey fallback ground and a large vent glow dominate desktop, while portrait offers no architectural landmark and communicates the preserves only through HUD text.

Astra's own inspection, 2026-09-20, task sol-map-art-corrections-1 item 0. I inspected both retained boards against their concept plate. The concept has a legible circular brass-and-stone platform, a small central instrument, a bounded rim and a sequence of distinct lit and framed stations. Neither plain view communicates that place. Desktop is an unbounded grey surface with scattered small props and a conspicuous heart-shaped vent glow; portrait crops that glow away and leaves the heroine, the Prospector, the stake and interface cards over dust. The three preserves are described by a card rather than represented as recognisable architecture in these views. Merely brightening the fallback would not correct this missing spatial hierarchy.

The budget inventory explicitly reports a failed sculpt state and zero mounted sculpt triangles. The contract diagnostics still identify e10-last-claim, so this is an art-pack absence, not evidence that the wrong gameplay contract booted. Correction therefore requires a terrain, landmark and panorama pack mounted through the existing E10 pipeline within the contract budget. Gameplay hazards and preserve rules retain their current owners. HUD layout remains the UI owner's work; the missing landmark cannot be excused as HUD coverage.

These are the original run-2 captures and eight timing runs per viewport. I agree with their missing-pack evidence and do not re-capture or claim a correction here. This assessment replaces the drain-authored text; the drain's historical role remains recorded in reviews/sol-map-art-campaign-2b.md F-MAC2B-1.

[Desktop board](board-1280.png) · [Phone board](board-390.png). Both panels are fresh plain boots of **unchanged production bytes**, labelled A/B. They are not a claimed before/after improvement. Four runs per arm and viewport use a frozen diagnostic with normal HUD; all frames remain in [verdict-captures.json](verdict-captures.json). All four plain boots have zero console/page errors, correct active contract and no test hook.

| View | Draw calls A / B | p95 median A / B | A/B delta |
| --- | --- | --- | --- |
| 1280 | [83] / [83] | 9.95 / 13.30 ms | +33.67% |
| 390 | [57] / [57] | 13.00 / 10.20 ms | -21.54% |

Timing variation between identical arms measures the host, not an art regression or improvement. The full eight-run distributions are in [performance-summary.json](performance-summary.json); do not interpret a pooled median as a distinct mode. Triangle counts and each applicable authored cap are in asset-budgets.json (or the explicit fallback inventory).

No source or asset changes in this verdict. Fresh run-3 tsc/default/full builds and named task/citation/gate-caller guards passed; no map-specific simulation success is inferred from a plain boot.

Engine before = after `2ad0aa1e14a1b7f639bc9c797ae5e14839d11c7b34b70f3f7ac7ca9479fbf6f4`; pin untouched. No objective/persistence status is changed by this visual verdict.
