# Drain review: `sol-play-proofs-3`, the play-proofs campaign run 3: the three E4 vehicle maps held, the campaign's yield question (Astra)

**Branch** `sol/map-art-campaign-2` at `986d717a7` · **merge** `3447c5334` · engine hash unchanged (`c63def1b`, no pin) · drained attended 2026-09-25 10:46Z in a detached chain worktree with the scratch store at `5793a96`; no deploy (scripts/attended/land.sh, config `pp3`).

**Verdict: LANDED.**

### What it does
Run 3 of the play-proofs campaign: the three E4 vehicle maps, two honest native attempts each, desktop then phone, twenty-one minutes, no new full proof and no map defect claimed. The Dust Flats: a haul-first route delivered the Hauler at 43.9 s but died at wave 2; defense-first built two defences and never dispatched, dying at wave 4; the Land-Yacht was not reached (F-PP3-1). Gusher County: desktop missed the north dispatch and died at wave 14; the phone completed all three deliveries by 94.4 s on 27.6 fuel and died at wave 4 while funding its first defence (F-PP3-2). The Boneyard: the boiler-edge route failed on desktop (wave 4); the phone stopped 1.112 units from the road head, outside the driver's walking tolerance though inside the objective's 2.5-unit radius, so the hitch stayed unproved despite four defences (wave 10) (F-PP3-3). Every new row boots and stays free of console and page errors; the shared driver grew E4 vehicle verbs (grade, call, dispatch, hitch) and the Incline proof re-ran green on both projects against it. The findings describe route and survival limits of the driver, not impossibilities; the Boneyard one names its own fix (accept a road-head approach within the objective's radius). Where the player sees it: nowhere; the campaign has now tried eleven maps with one full proof, and run 4 opens with a control that tells whether the holds are about the maps or about the player the driver is.

### The gate stays closed
With the environment unset the native-proof folder collects twenty tests and skips all twenty in an actual invocation; the default battery's collection is unchanged; `locked-win.spec.ts` green beside it.

### Merge classification
Tests and evidence only: `e2e/native-proofs/driver.ts` (the E4 vehicle verbs), three new gated specs, `artifacts/sol/play-proofs/run-3/**` (the run note, three findings with rows and terminal boards, the gate and adjacent logs, the verification manifest), three rows' second column in the campaign status doc (resolved by row key), one dated campaign-report section. No `src/**`, no contract, no balance, no store; the engine hash did not move.

### Findings
- **F-PP3-1, F-PP3-2, F-PP3-3 (open, holds):** the three E4 maps under the driver's routes; the Boneyard's approach tolerance is a general driver fix (an objective's own radius, not the driver's walking tolerance) for run 4.
- **F-PP3-4 (this drain, the campaign's yield):** eleven maps attempted over three runs, one full proof (the Incline), one partial (Blackout Ridge), one map defect (the Canyon Works), eight holds. Run 4 begins with a control on the Claim, a map with a native proof and the simplest objective: if the shared driver cannot finish the Claim, the holds measure the driver and the campaign pauses for the owner; if it can, they measure the maps.

### One battery row attributed by the drain
`board-tape-gold.test.mjs` "the browser door submits the purse held at the secure tick, not the run's lifetime panning" was red in the chain's battery: a 120 second `page.waitForFunction` timeout while six implementers, an Astra play run and this landing shared the machine (load average 61 at the time). The branch touches only evidence and gated specs, nothing the door reads, and the row passed alone in the same chain worktree a minute later (rc 0). Allowed for this landing only; the row stays out of the default allow list on purpose.

### Evidence (this drain's gates on the merged tree)
| Check | Result |
| --- | --- |
| tsc / build / e1 | `0 / 0 / 0` |
| law-pointer | `rc=0 law-pointer-guard — do the law surfaces still point at what they claim?` |
| named guards | `ℹ pass 137 ℹ fail 0` |
| e2e both projects, --workers=1 | `rc=0   2 skipped   30 passed (2.4m)  10:35Z` |
| full npm run test:node-guards (before the pin) | `rc=1 ℹ tests 1018 ℹ pass 1011 ℹ fail 2 ℹ skipped 5  10:44Z` |
| engine hash | `merged: c63def1bfc493e243f31b9b115344ec6e3aacd57075554ec6a2ce872dfd90bef (pinned c63def1bfc493e243f31b9b115344ec6e3aacd57075554ec6a2ce872dfd90bef)` |
