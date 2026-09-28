## What it does
Astra (gpt-6-astra on lane-c) replays the River ending the way a player reaches it, after `river-ending-score-1` landed: the real Last Claim wave-8 secure, the bank, the wait for the Charter Press, the real lever click, the quiet River, the first pan. On desktop and on the 390x844 phone the first player pan writes one completed `e10-river` score (5 gold, 5.200 s and 4.733 s), the Book shows it, a plain reload keeps it byte for byte, and a second pan and a second real earned lever leave the original score unchanged; zero county standings requests during the ceremony (the post is held), zero console and page errors. The shared driver's fabricated wave-30 `e10-river` row (F-RES1-2) is removed, so a real completion reads as new; the raw route's stray enemies (F-RES1-3) are measured at 2 and 2 on both projects and left for the owner's word. F-PP6-2 is closed for the player's ending; the county-board half waits on `river-assay-1`.

## Evidence (Astra's run 7, base `a9506add6`, commit `c4b01dc73`; the drain's own gates are appended below)
| Check | Result |
| --- | --- |
| desktop | PASS: first gold 5.200 s / 5 gold; ceremony standings requests 0; console/page errors 0/0; raw enemies 2 / 2 |
| phone 390x844 | PASS: first gold 4.733 s / 5 gold; standings requests 0; errors 0/0; raw enemies 2 / 2 |
| the seed (F-RES1-2) | old seed reads a fresh completion as not new; fixed seed reads it new (`seed-measure.log`) |
| honesty | the initial desktop attempt exited 1 at an unproved re-pull (the real re-pull needs another Last Claim secure, not browser history) and is preserved beside the passing run |
| evidence/scope verifier | PASS (`run-7/verify.py`, `verification.json`) |
| default battery | the new spec is gated by `GR_NATIVE_PROOF=1`; skipped when unset |

## Merge classification
Base `a9506add6`; the branch touches `e2e/native-proofs/driver.ts` (the seed), the new `e2e/native-proofs/e10-river-ending.spec.ts`, `artifacts/sol/play-proofs/run-7/**`; no `src/**` or `assets/**`; main moved on none of them. LANE-TOUCHED only; hash unchanged.

## Findings
- F-PP6-2: CLOSED for the player's ending by this proof; the county-board half is `river-assay-1` (to author).
- F-RES1-2: closed (the seed).
- F-RES1-3: measured, unchanged, on the owner's desk.
