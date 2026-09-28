# Glow Mesa — PASS on desktop and phone, authored wave-8 ending banked

| Project / default | Terminal wave | Sim seconds | HP | Purse | Repairs | Standing / total | Confirmed placements |
| --- | ---: | ---: | ---: | ---: | ---: | --- | ---: |
| desktop | 8 | 254.800 | 64.6 | 31 | 0 | 0/0 | 3 |
| 390 px phone | 8 | 260.667 | 69.4 | 20 | 0 | 3/4 | 4 |

Both native tests **PASS**, paired direct exit 0. Both begin at the town Book with the public plain seed, no debug/seed URL, and finish the Homemaker's authored early ending: act 3, DONE, `poweredDown=true`, `chairPlaced=true`, `kept=true`, Claim Secured. Both bank a fresh secured wave-8 score, return to the Book and preserve the score byte for byte through a plain reload (7,225 bytes). Both have zero console/page errors. Exactly one default ride per project; no restore-ground retry required.

The driver no longer rejects this real ending for being below the contract's generic wave-12 ceiling. It freezes `finalSnapshot` before the bank action, including wave, time, HP, purse, repairs and defenses. The evidence-only objective capture independently agrees with those terminal fields. Desktop's empty defense list is a genuine pre-bank result, not a reset: the boss records four unbuild events; the live counters retain 254.8 s / 64.6 HP / 31 gold. Driver placements and the boss's unbuild events are different counters. Phone retains three living pieces and one wreck out of four. The former finally-block overwrite cannot replace an existing terminal snapshot even if bank verification fails.

[Desktop row](default/row-desktop-chrome.json) · [Phone row](default/row-mobile-chrome.json) · [Desktop terminal state](default/objective-desktop-chrome.json) · [Phone terminal state](default/objective-mobile-chrome.json). Terminal/Book/bank JPEG triplets for each project live alongside these rows.

Command: `python3 artifacts/sol/play-proofs/run-15/run-map.py e6-glow-mesa`. [Exact argv/env](default/command.json), [direct exit](default/command.exit); `GR_NATIVE_PROOF=1`, desktop then phone, `--workers=1`. Full logs, rows and redundant last images: `~/.goldrush/play-proofs/run-15/default/e6-glow-mesa/`.

No F-ID, production change or balance change. This proves this task's terminal and score-persistence journey; it does not separately prove restored persistent Homemaker state on a later contract entry.
