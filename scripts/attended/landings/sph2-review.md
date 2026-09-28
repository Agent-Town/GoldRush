**Slice / branch / tip:** `sol-play-proofs-holds-2` (run 16 on disk), lane-c `sol/map-art-campaign-2`, fourteen commits ending at `6b891fabd` (Astra, gpt-6-astra, 359,232 tokens, 02:03Z to 03:06Z 2026-09-28). Attended landing after the s2730 fire stopped at "PARTIAL GATES, ATTRIBUTION PENDING": its non-native gates passed (builds and E1, adjacent and plain boots 42/42) and its native re-ride failed 10/10, the class the 13z-91 rule assigns to the attended session.

**What it does.** The shared native-proof driver (`e2e/native-proofs/driver.ts`) learns three more errands: the Picnic stake hold (the kit placed inside each stake's authored radius, read from the contract at runtime), the Showroom capture (leave the house by its doorway, approach exhausted machines, confirm outside build mode, stop confirming at death), and the Tape Reel demonstration (record a short movement-and-build demonstration on the plain-boot Tape Reel, use it at the next wave; observe the county's refusal on the Dead Band, the fielded mirror on Echo Canyon, the muted use and three lit sites on Relay Rush; keep upgrade keys out of the tape-name field; keep the drawer closed while waiting). Five re-ride specs and the run-16 evidence carry the results. No `src/**` change; no balance change.

**Evidence (real numbers).**

| Check | Result |
|---|---|
| Picnic, desktop / phone (run 16) | HELD on survival: all three stakes held inside their radius, hero died |
| Showroom, desktop / phone (run 16) | 6/6 captures reported on both screens, hero died; the capture loop's post-death confirms fixed in the final commit, not re-ridden (two-ride allowance exhausted) |
| Dead Band, desktop / phone (run 16) | refusal latch proved (`objectiveMet=true` after the signal-suppressed refusal); deaths at waves 19 and 12 |
| Echo Canyon, desktop / phone (run 16) | desktop: mirror proved; phone: never reached Record, the tap on the visible Tape toggle intercepted by the canvas, then the Patent Office overlay, then the death ledger; the unbounded action consumed the 840,000 ms timeout |
| Relay Rush, desktop / phone (run 16) | desktop: 3/3 sites lit and the muted use proved; phone: same Tape control block |
| Flotilla / Regatta equivalence (desktop) | PASS, rows compared to run 12 |
| Rides, errors | zero console and page errors on every ride |
| Evidence budget | 2,691,128 B added, inside the 25 MB task budget and the 40 MB fire ceiling |
| s2730 fire gate on the detached candidate `2a6ccc4e0` | builds/E1 PASS; adjacent and plain boots 42/42; native re-ride 0/10; Showroom captures 0/6 desktop, 1/6 phone against the source's 6/6; unattributed; candidate saved at `save/sol-play-proofs-holds-2-s2730` |
| tsc / build / adjacent specs (incl. `e7-playbook-surface`) / ledger battery | measured by this landing's gates (see the gates log) |

**Merge classification.** Base: main at the chain cut. New files: the re-ride specs' variants and `artifacts/sol/play-proofs/run-16/**`. Lane-touched: `e2e/native-proofs/driver.ts` (the three correctives plus the Tape Reel drawer and text-field guards), `run-15/run-note.md` (table amendment). No `src/**`, `scripts/**`, `functions/**` or `site/**` change, so `hash: unchanged`. Conflicts: none expected; the toolkit records any.

**Findings.**
- **F-SPH2-1 (recorded, non-blocking for this landing).** The s2730 fire's native re-ride of the candidate could not reproduce Showroom's captures (0/6 and 1/6 against run 16's 6/6) and failed all ten native specs, while the same fire's plain boots and builds passed. This is the F-2725-1 class again (real-time rides under the fire shell's per-job CPU ceiling), now with a larger gap than a survival wave: the capture sequence is timing-sensitive. Showroom's capture claim therefore stands as run 16's measurement with the fire's non-reproduction beside it, not as a both-instrument proof. Owed: the next lane task on the Showroom (candidate holds-4) re-rides it desktop in the lane shell as its own control; the fires do not re-ride native specs of this class (13z-91).
- **The phone Tape toggle (instrument today, possibly player-facing).** Audited by `e7-tape-toggle-phone-hit-target-1` on lane-a (`elementFromPoint` at the toggle's centre in a plain boot at 390 px); a player-facing interception becomes an F-TAPE finding with a layering fix in its own engine-pinned landing.
- **F-PPH2: none.** No reproducible plain-boot map defect. Survival ceilings (Picnic, Dead Band, Echo desktop, Relay desktop) stay on the owner's desk under F-PP-CAMPAIGN; no balance change from these deaths.
