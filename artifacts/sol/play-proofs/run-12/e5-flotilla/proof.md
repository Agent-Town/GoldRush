# The Flotilla — PASS, terminal journey on both screens

| Project / default | Secure wave | Sim seconds | HP | Gold banked | Kills | Hulls surviving |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| desktop-chrome | 12 | 272.133 | 100 | 0 | 33 | 2/3 |
| mobile-chrome | 12 | 272.133 | 100 | 0 | 33 | 2/3 |

Both real town/Book launches pass without debug or seed flags. Both native runs secure wave 12, bank a new 0-gold secured score, return directly to the Book, retain score storage byte for byte across a plain reload, and reopen the Book on foot. Zero console/page errors. Paired command exit 0, **2 passed**; one ride per project, no retry.

The kitchen scow is lost; turret raft and still-room barge survive. The contract explicitly allows continuation after a hull loss. This proves its wave terminal and persistence, not successful defense of every hull. No new buildings, no repairs, 0/0 ground defenses, and no deck buildings: the generic ground-ghost driver never exercises the separate deck context menu. Construction across all three hulls and an intentional reshape remain unproved; they are not silently inferred from this terminal PASS. No reproducible map defect and no F-ID.

The shared survival path is unchanged. [Default rows and command receipt](default/command.json) · [desktop row](default/row-desktop-chrome.json) · [phone row](default/row-mobile-chrome.json). Terminal/Book/bank triplet per project under `default/`. Direct desktop bank-cell inspection reads “Secured: wave 12, 0 gold”. Both score stores retain 7,223 bytes. Full rows/logs and redundant final images: `~/.goldrush/play-proofs/run-12/default/e5-flotilla/`.

Reproduce: `python3 artifacts/sol/play-proofs/run-12/run-map.py e5-flotilla` (one worker, desktop then 390×844 phone, existing progressed profile, public plain seed, timescale 4).
