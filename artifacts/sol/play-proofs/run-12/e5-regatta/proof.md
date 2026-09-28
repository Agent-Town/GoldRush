# The Regatta — PASS, boat course and full terminal journey

| Project / default survival | Gates | Course finish, sim s | Secure wave | Secure sim s | HP | Gold banked | Kills |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| desktop-chrome | 6/6 | 147.733 | 12 | 272.133 | 100 | 0 | 28 |
| mobile-chrome | 6/6 | 148.133 | 12 | 272.133 | 100 | 0 | 28 |

Both real town/Book launches, six boat-scored gates (including the return to the Claim-Boat start), `race.finished=true`, `forfeited=false`, wave-12 secure, new banked score, Book return and byte-identical plain reload PASS. Both stores retain 7,223 bytes. Both projects have zero console/page errors, zero new buildings/repairs and 0/0 ground defenses. One ride per project; command exit 0, **2 passed**. No restoration retry and no F-ID.

## The permitted movement adaptation

The shared driver had no Regatta sailing route. Added only `regattaJourney` and an `e5-regatta`-guarded call before its existing opening kit. First it uses the existing `journey` helper to walk out over the port rail and back aboard. It then reads the public Regatta diagnostics and steers with real WASD keys through the heat-15 route: outgoing offsets of 4.5 units, clamped inside ±44, then the return gate. No rider verbs, reanchor shortcuts, debug bridge, teleport, seed pin or sim writes. The authored boat is the only racer. Native course success is checked again in the new spec's afterEach.

The default survival loop, kit, funding, upgrades, maintenance and every pre-existing map path are byte-identical to base. [Executable byte comparison](../verify-driver.py) removes only this helper and its guarded call and reproduces the entire base file; [result and hashes](../driver-equivalence.json). No existing assertions were changed. This is the only shared-driver change in the task. Course completion does not prove deck building; none was attempted through the separate boat menu.

[Desktop row](default/row-desktop-chrome.json) · [Phone row](default/row-mobile-chrome.json) · [Desktop race](default/objective-desktop-chrome.json) · [Phone race](default/objective-mobile-chrome.json). Terminal/Book/bank triplets under `default/`. Full rows/logs under `~/.goldrush/play-proofs/run-12/default/e5-regatta/`.

Command: `python3 artifacts/sol/play-proofs/run-12/run-map.py e5-regatta`; [exact argv/env](default/command.json), [direct exit](default/command.exit). Desktop then 390×844 phone, one worker, default survival strategy, timescale 4, traces off.
