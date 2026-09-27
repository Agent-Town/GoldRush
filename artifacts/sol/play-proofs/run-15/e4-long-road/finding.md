# The Long Road — HELD at the far-stop approach

| Project / strategy | Wave | Sim seconds | HP | Purse | Repairs | Standing / total |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| desktop / default | 3 | 103.333 | 0 | 0 | 0 | 0/0 |
| 390 px phone / default | 3 | 118.800 | 0 | 0 | 0 | 0/0 |

Both native Book boots succeed; both tests fail the unchanged secure assertion; paired command exit 1. Both have zero console/page errors. No bank, Book return or reload proof exists.

The corrected driver calls its existing `motorOpening` and `motorStop` helpers. It resolves the convoy corridor through `twist.motorFrontier.convoy.corridorId`, grades its west survey stake, and gathers all three tar nodes on foot (24 stored fuel and 3 unrefined tar). The Hauler reports `onRoad=true`, but the route stalls BEFORE destination Confirm: the 0.8-unit approach to the authored road end `(190,0)` cannot finish. Desktop stops at `(187.774,5.199)` and phone at `(185.281,3.600)`. Both then lose during generic gathering. The Hauler remains idle at `(-180,0)`, target null, distanceTravelled/roadDistance 0; arrival is false.

This replaces run 12's missing-helper diagnosis with the exact observed approach failure. It does not demonstrate that a human cannot reach the stop: the native walker has a bounded local steering heuristic, not a general pathfinder. **Owner: QA/native route driver.** Recommended follow-up: inspect the surveyed railhead approach and add an obstacle-aware native route before another authorized ride. No map F-ID and no balance recommendation.

Exactly one default ride per project. No restore-ground retry: the objective never completes, so this is not an eligible survival retry with a working objective. The run allowance does not authorize iterative route probes.

[Desktop row](default/row-desktop-chrome.json) · [Phone row](default/row-mobile-chrome.json) · [Desktop objective](default/objective-desktop-chrome.json) · [Phone objective](default/objective-mobile-chrome.json) · [Desktop terminal](default/terminal-desktop-chrome.jpg) · [Phone terminal](default/terminal-mobile-chrome.jpg).

Command: `python3 artifacts/sol/play-proofs/run-15/run-map.py e4-long-road`. Exact argv/environment/direct exit: [command](default/command.json), [exit](default/command.exit). `GR_NATIVE_PROOF=1`, desktop then mobile, `--workers=1`, public plain seed, no debug URL, native keys/HUD and read-only diagnostics. Full rows and log live at `~/.goldrush/play-proofs/run-15/default/e4-long-road/`.
