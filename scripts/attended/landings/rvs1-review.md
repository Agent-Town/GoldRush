## What it does
The River's authored ending (the finale lever opens a no-wave Claim and the player pans once in the quiet) wrote no completed score (F-PP6-2). Now the first gold the player's own pan lands is the win: `Game.ts` records one completed `e10-river` score (secured, wave 0, 5 gold, time at the pan) through the ordinary `recordRunScore` path and keeps the reel in the tape ring; a second pan, a reload or a re-pull writes nothing more, and nothing writes on boot or on the lever alone (no seam lies within 6.4 m of the spawn). The Book reads "Secured: wave 0, 5 gold". The county post is HELD behind `RIVER_STANDING_POSTS_ENABLED = false` because the assay cannot yet replay a River reel (F-RES1-1, F-RES1-6): a posted standing would rank while pending and then be rejected, which is worse than no row; the follow-up slice `river-assay-1` flips that one line. Alongside, F-RES1-4: the replay guard, the agent rider's guard and the recorder's label use `scoredContractId()`, so a Claim playbook can no longer spoil a River reel. No door change: the door's outcome grammar admits `secured`, which the ceremony rides.

## Evidence (the implementer's runs on `7cadf417a`, base `be37d83cf`; the drain's own gates are appended below)
| Check | Result |
| --- | --- |
| the event | first gold landed: sim 4.867 s desktop, 4.767 s phone on the run-6 driver's own walk; the swing (3.4 s) can decay to nothing, the Book's return is not an event of the run |
| the run-6 assertion | red on base (2 failed at "run 6 banks cell", 4 passed), green on the branch, both projects |
| `e2e/river-ending-score.spec.ts`, no `?debug` | 6/6 both projects: the row, the reel, zero county POSTs through pan, second pan, reload, re-pull and the Book; the kept reel door-shaped (`validateRunTape` whole; the door's `onRequest` on the body the post would build answers 200); no player action writes nothing through 12 s; a plain `?contract=e10-river` boot and the Book's raw River boot write nothing |
| adjacents | task-025 10/10, m2-01 14/14, charter-press-totality (28/28 in the re-run, both projects); the wider first-round set had 22 reds all red on a detached base checkout (assay-auto-tape:55, cp03:25, cp04-lever eight tests, cp05-river:27) |
| tsc, build | rc 0 / `EXIT=0` |
| node-guards | 1026 of 1037: the two pre-pin registry rows (cured by the pin), ledger-backup-pull x2 and desk-declaration (scratch worktree), the sweep's one survivor (identical on base) |
| engine hash | `642edcf6` (pin #66) -> `29324ba8…` (`Game.ts` only); two agent-arm tapes and two browser-arm reels replay byte-identical on base and tip (`wallMs` excluded); law and source pointers PASS |
| F-RES1-4 probe (`?debug`, both projects) | before: a Claim playbook accepted in the River, the reel holds two `the-claim` pages; after: refused `contract-mismatch`, a River-recorded playbook labelled `e10-river` still replays |

## Merge classification
Base `be37d83cf`; the branch touches `src/game/Game.ts`, `e2e/river-ending-score.spec.ts`, `artifacts/river-ending-score-1/**`; main moved on none of them. LANE-TOUCHED only. Pinned same-era.

## Findings
- **F-RES1-1 and F-RES1-6 (slice to author, `river-assay-1`):** the assay replays the reel's own contract (the raw River, no seams), reads a RunManager secure the ceremony never sets, rounds `timeAlive`, and browser seams follow the `?seed=` pin; the county post stays held until it lands.
- **F-RES1-2 (Astra harness note):** the run-6 driver seeds a fabricated `e10-river` row; the next native proof must not.
- **F-RES1-3 (OWNER'S DESK, by the cure):** the raw River route has no seams yet spawns enemies.
- **F-RES1-4 (fixed here):** the playbook guard compared against the played contract.
- **F-RES1-5 (OWNER'S DESK, by the cure):** the ending is silent in the run; the Run Ledger never lists it.
- **F-RES1-7 (ledger, pre-existing, every contract):** a playbook replay that stops early leaves an empty stream and the reel is refused; a small `RunTape.ts` slice.
- The implementer's report file was refused by a hook on its own write and committed by the attended session from its final message, verbatim (bea0a4dcb); the follow-up addendum is the implementer's own (7cadf417a).
