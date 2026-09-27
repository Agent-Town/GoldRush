# e3-moth-season — HELD

One default ride per project: desktop death wave 12 (378.000s), phone wave 13 (406.000s). CONNECT stays 0/1, complete=false; phone records failed=true after the wave-12 deadline. The kit asks for unavailable turrets, builds west-yard beacons instead of the corridor pylon at (0,-14), and never buys an offered decoy_shed. This is a specific default-driver objective-coverage gap, not a map defect. No restore-ground ride: the task permits it only for a survival hold with the objective working; that prerequisite is absent. A future driver/QA owner would need a scoped native pylon/decoy opening, not a balance change. Both commands exit 1 on secure with zero browser errors. No F-ID.

| Project / strategy | Wave | Sim seconds | HP | Gold | Repairs | Pieces standing | Checks | Evidence |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| desktop-chrome / default | 12 | 378.000 | 0.00 | 78 | 1 | 0/5 | secures: HELD; banks: HELD; board: HELD; reload: HELD; clean: PASS | [row](default/driver/e3-moth-season/row-desktop-chrome.json) |
| mobile-chrome / default | 13 | 406.000 | 0.00 | 10 | 4 | 0/7 | secures: HELD; banks: HELD; board: HELD; reload: HELD; clean: PASS | [row](default/driver/e3-moth-season/row-mobile-chrome.json) |

Each invocation retains its command, exit code and log in the strategy directory; screenshots and full diagnostics sit beside each row. Terminal/last images on failed rides are actual loss or held-objective screens, not secured terminals. Bank/Book/reload images exist only for successful journeys; no replacement or reconstructed bank evidence is supplied for a hold. Standing counts use the final actual build snapshot, not just acknowledged purchases.

Method: real town-board launch, the application's own mode URL, campaign timescale 4, public plain seed, existing progressed profile, native keyboard/HUD actions and read-only diagnostics. Shared driver unchanged. No production, contract, art or balance changes. This proves desktop/390px browser journeys, not hardware-device touch-only play.
