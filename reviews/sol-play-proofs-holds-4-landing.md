# Drain review (attended landing): `sol-play-proofs-holds-4`, the Archive World and the Deepwater Claim proved, the Long Road and the Showroom held, the phone Tape tap left as an instrument mismatch

**Branch** `sol/map-art-campaign-2` at `d40d657b9` · **merge** `eaf69bb1f` · engine hash unchanged (`2d180e6b`, no pin) · drained attended 2026-09-28 08:21Z in a detached chain worktree with the scratch store at `5793a96`; no deploy (scripts/attended/land.sh, config `sph4`).

**Verdict: LANDED.**

**Slice / branch / tip:** `sol-play-proofs-holds-4` (run 18 on disk), lane-c `sol/map-art-campaign-2`, six commits ending at `d40d657b9` (Astra, gpt-6-astra, 228,605 tokens, 07:13Z to 07:38Z 2026-09-28, under a host load average of 40 to 70). Attended landing under `land-held.sh` per the native-ride rule (13z-91).

**What it does.** The shared native-proof driver (`e2e/native-proofs/driver.ts`) learns to aim the Archive beacon against both predicates (valid placement and inside the site's runtime radius), to observe the Deepwater wreck's write at the ceremony and its restoration at a later birth, to approach the Long Road's far stop along the graded road, and to attempt the Showroom's survivable capture sequence; it records the phone Tape tap's hit-test evidence at the refused click. Five re-ride specs and the run-18 evidence carry the results; the complete 42-map campaign table is amended in `run-18/run-note.md`. No `src/**` change; no balance change.

**Evidence (real numbers).**

| Check | Result |
|---|---|
| Archive World, desktop / phone | PASS / PASS: beacon inside the west light disc, a completed light hold, wave 12 secured, bank, Book, byte-identical reload |
| Deepwater Claim, desktop / phone | PASS / PASS: boss beaten, wave 12, bank/Book/reload, the wreck written at the ceremony and restored on plain re-entry |
| Long Road, desktop / phone | HELD: the graded approach still stalls outside the authored stop radius before destination Confirm |
| Showroom, desktop / phone | HELD on survival: desktop 6/6 captures then death at wave 3; phone 5/6 then death at wave 4 |
| Relay Valley phone Tape tap | unresolved hit-testing mismatch: the plain-boot audit (lane-a) reaches the toggle, the in-ride click reports `#game-canvas`; the attempted driver correction failed and was reverted; no player-facing defect established |
| Flotilla / Regatta equivalence (desktop) | PASS, rows compared to run 12 |
| Rides, errors | 12 rides, zero console and page errors |
| Evidence budget | 3,480,604 B added, inside the 25 MB task budget and the 40 MB fire ceiling; the evidence audit PASS (raw rows preserved, plain URLs, restored wrecks, identical 42-map tables) |
| tsc / build / adjacent specs / ledger battery | measured by this landing's gates (see the gates log) |

**Merge classification.** Base: main at the chain cut. New: the re-ride specs' variants and `artifacts/sol/play-proofs/run-18/**`. Lane-touched: `e2e/native-proofs/driver.ts`, `run-17/run-note.md` (table amendment). No `src/**`, `scripts/**`, `functions/**` or `site/**` change, so `hash: unchanged`. Conflicts: none expected; the toolkit records any.

**Findings.**
- **F-PPH4: none.** No reproducible plain-boot map defect.
- **The campaign's instrument work is complete or named.** Four holds became proofs across holds-1 to holds-4 (Glow Mesa, the Ember Shore, the Archive World, the Deepwater Claim); every other objective the driver could not perform now works. Still open on the instrument side: the Long Road's final approach and the in-ride phone Tape tap (an instrument mismatch, not a player-facing defect: the audit's 40 plain-boot samples all reached the toggle). Everything else held is survival, the owner's under F-PP-CAMPAIGN; no balance change from a hold.
- **Owner's desk:** nothing new.

### Evidence (this drain's gates on the merged tree)
| Check | Result |
| --- | --- |
| tsc / build / e1 | `0 / 0 / 0` |
| law-pointer | `rc=0 law-pointer-guard — do the law surfaces still point at what they claim?` |
| named guards | `ℹ pass 137 ℹ fail 0` |
| the ledger battery | `rc=0 ℹ tests 1263 ℹ pass 1260 ℹ fail 0 ℹ skipped 3` |
| e2e both projects, --workers=1 | `rc=0   24 passed (1.8m)  08:02Z` |
| full npm run test:node-guards (before the pin) | `rc=0 ℹ tests 1040 ℹ pass 1035 ℹ fail 0 ℹ skipped 5 ℹ tests 87 ℹ pass 87 ℹ fail 0 ℹ skipped 0  08:21Z` |
| engine hash | `merged: 2d180e6bad6933ef15db2a006aaa0a1a3be8a97efdf9416cbc4646be71be4f6d (pinned 2d180e6bad6933ef15db2a006aaa0a1a3be8a97efdf9416cbc4646be71be4f6d)` |
