# Drain review (attended landing): `sol-play-proofs-holds-3`, the Ember Shore proved by the Stoke fix, the Mare's air fixed with the hold moved to survival, Relay Valley's program lights its site, the Archive's beacon still misses its disc

**Branch** `sol/map-art-campaign-2` at `404583963` · **merge** `ee16b7954` · engine hash unchanged (`2d180e6b`, no pin) · drained attended 2026-09-28 06:05Z in a detached chain worktree with the scratch store at `5793a96`; no deploy (scripts/attended/land.sh, config `sph3`).

**Verdict: LANDED.**

**Slice / branch / tip:** `sol-play-proofs-holds-3` (run 17 on disk), lane-c `sol/map-art-campaign-2`, ten commits ending at `404583963` (Astra, gpt-6-astra, 223,826 tokens, 04:30Z to 05:06Z 2026-09-28). Attended landing under `land-held.sh` per the native-ride rule (13z-91): the fires' shell cannot re-ride these specs reliably, so they defer such landings to the attended session.

**What it does.** The shared native-proof driver (`e2e/native-proofs/driver.ts`) learns four more errands: the Mare's declared air consumer (`read()` takes `e8Atmosphere` when `e8SuitAir` is null) with dome braking before the suit empties and the four mining windows; the relay program (holds-2's Tape Reel demonstration placed so the running program's work stands inside a relay site); the Archive light hold (fund a beacon, carry it to the west wing's disc, hold through a warning); the Ember Stoke (reserve the cost, return inside the vent's disc, Stoke before warmth reaches zero). Four re-ride specs and the run-17 evidence carry the results. No `src/**` change; no balance change.

**Evidence (real numbers).**

| Check | Result |
|---|---|
| Ember Shore, desktop / phone | PASS / PASS: seven Stokes, three squalls survived, wave 12 secured, bank, Book back, reload byte-identical |
| Mare Claim, desktop / phone (default + restore) | objective works: 4/4 mining windows, zero air damage on all four rides; HELD on survival (hero death after the objective) |
| Relay Valley, desktop / phone | desktop: the program lights its relay site, `objectiveMet=true`, survival fails; phone: never reaches Record (the driver's own tap timing in the ride; the lane-a audit proved the toggle reachable at 390 px in a plain boot) |
| Archive World, desktop / phone | HELD, corrective incomplete: the beacon preview lands outside the west light disc, zero completed holds |
| Flotilla / Regatta equivalence (desktop) | PASS, rows compared to run 12 |
| Rides, errors | 13 rides, zero console and page errors |
| Evidence budget | 2,850,894 B added, inside the 25 MB task budget and the 40 MB fire ceiling |
| tsc / build / adjacent specs / ledger battery | measured by this landing's gates (see the gates log) |

**Merge classification.** Base: main at the chain cut. New files: the four re-ride specs' variants and `artifacts/sol/play-proofs/run-17/**`. Lane-touched: `e2e/native-proofs/driver.ts` (the four correctives), `run-16/run-note.md` (table amendment). No `src/**`, `scripts/**`, `functions/**` or `site/**` change, so `hash: unchanged`. Conflicts: none expected; the toolkit records any.

**Findings.**
- **F-PPH3: none.** No reproducible plain-boot map defect. The Mare's authored air damage behaves as declared; the hold is survival after a working objective.
- **Remaining driver work (candidate holds-4):** the Archive beacon placement inside the disc (read the site's centre and radius, place at the centre), the phone Tape control inside a ride (the audit says the toggle is reachable; the driver's tap moment is the fault), the Long Road far-stop approach, the Deepwater wreck re-entry, the Showroom survivable capture sequence. Survival ceilings (Mare, Relay desktop, plus the earlier list) stay on the owner's desk under F-PP-CAMPAIGN; no balance change.
- **Owner's desk:** nothing new.

### Evidence (this drain's gates on the merged tree)
| Check | Result |
| --- | --- |
| tsc / build / e1 | `0 / 0 / 0` |
| law-pointer | `rc=0 law-pointer-guard — do the law surfaces still point at what they claim?` |
| named guards | `ℹ pass 137 ℹ fail 0` |
| the ledger battery | `rc=0 ℹ tests 1263 ℹ pass 1260 ℹ fail 0 ℹ skipped 3` |
| e2e both projects, --workers=1 | `rc=0   24 passed (1.9m)  05:46Z` |
| full npm run test:node-guards (before the pin) | `rc=0 ℹ tests 1040 ℹ pass 1035 ℹ fail 0 ℹ skipped 5 ℹ tests 87 ℹ pass 87 ℹ fail 0 ℹ skipped 0  06:05Z` |
| engine hash | `merged: 2d180e6bad6933ef15db2a006aaa0a1a3be8a97efdf9416cbc4646be71be4f6d (pinned 2d180e6bad6933ef15db2a006aaa0a1a3be8a97efdf9416cbc4646be71be4f6d)` |
