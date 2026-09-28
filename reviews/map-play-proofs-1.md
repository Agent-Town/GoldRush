# Drain review: `map-play-proofs-1`, the generic play census of the eighteen pending maps, and why banking was never broken (Opus implementers; owner 2026-09-25 light effort)

**Branch** `test/map-play-proofs-1` at `3ca8aa4df` · **merge** `0b1cfa4a5` · engine hash unchanged (`c63def1b`, no pin) · drained attended 2026-09-25 06:55Z in a detached chain worktree with the scratch store at `5793a96`; no deploy (scripts/attended/land.sh, config `mpp1`).

**Verdict: LANDED.**

### What it does
The owner asked for the play proofs "but don't use too much effort here", so this run widened the existing secure-playability instrument by one environment variable (`GR_SECURE_CONTRACTS`, a comma list or `all`; unset, the spec is byte-for-byte what it was, still gated behind `GR_PLAYABILITY_SECURE`) and played the eighteen maps that read "pending authored terminal and persistence proof" on both projects, one worker, under the attended drain lock: 48 rows in all, counting the smoke, four re-runs and four controls. The result is a census of what a dumb generic kit can and cannot do on these maps, written to `docs/bench/playability-secure-census-2026-09-25.md` and into the eighteen rows' second column of the campaign status doc. Every one of the 36 map-and-project pairs boots the requested contract and stays free of console and page errors. Four maps reach their secure wave on both projects (the Pressure Garden, Blackout Ridge, the Last Claim, the River), two on one project (Devil's Alley on desktop, the Seed Run on phone). Twelve are instrument limits: seven need an objective verb the generic kit does not have (the Baron, the Incline, the Canyon Works, the Fairground, the Dust Flats, Gusher County, the Boneyard) and five could not build their opening defences from where the kit walks (the Far Side, Low Orbit, the Eclipse, the Dome Basin, the Old Canal). Two single-project deaths remain unexplained by load (the Seed Run on desktop at wave 14 of 20, Devil's Alley on phone at 16, both with every defence built). Where the player sees it: nowhere; this is a measurement, and it says the maps boot and run clean and that a smarter player than this kit is needed to prove them, which is the Astra campaign queued from this landing.

### The banks question, attributed by control
Banking failed on every row that secured, and it looked like a regression. It is the instrument. On the tree from before `ux-entry-robustness-1` landed, the Dry Gulch secured at wave 20 and failed banks with the identical detail string; the Last Claim secured at wave 8 on both trees and failed the same way; the only historical "pass" (2026-09-17, the Dry Gulch) was a seeded row that the spec's own report already struck. The cause: since `07248387a` (2026-07-22, "lock Claim wins") the game writes the secured score the moment the claim secures, before any click, and the Return to Town click rewrites the same row in place; the spec counts only a row the click itself adds, so it can never pass, and `locked-win.spec.ts` asserts the real behaviour green on both trees. The board and reload cells run only after banks, so neither was measured on any row.

### Merge classification
Test and ledger only: `e2e/playability-secure.spec.ts` (the env override, one hunk), `docs/bench/playability-secure-census-2026-09-25.md` (new), `reviews/sol-map-art-current-status-20260909.md` (the eighteen rows' second column, resolved by row key at the drain), `artifacts/open-maps-acceptance-e1-e4/secure-rows.jsonl` (48 rows), `artifacts/map-play-proofs-1/**` (the report, the batch logs and drivers kept under the Retention Law, the two generator scripts). No `src/**`, no contract, no balance; the engine hash did not move.

### Findings
- **F-MPP1-1 (open, fire-authorable, the instrument):** the banks step counts a row the click adds; the score is written at secure time. Cure: snapshot the scoreboard at boot and compare after the click. With F-MPP1-4 cured, re-run only the ten secured pairs (about 40 minutes) to measure banks, board and reload for the first time.
- **F-MPP1-4 (open, fire-authorable, the instrument):** the spec reads `secureWave 0` from the manifest for three maps while the engine secures them at wave 20 (the Balance default), which makes the secure cell vacuous and the banks threshold meaningless there.
- **F-MPP1-2 (open, the Astra campaign):** seven maps need an objective the generic kit has no verb for; the hand-driven proofs of `sol-play-proofs-1` are the answer.
- **F-MPP1-3 (open, the Astra campaign):** five maps where the kit could not fund its opening defences from its circuit.
- **F-MPP1-5 (open, for Astra to tell):** two single-project deaths with every defence built, four or more waves short.
- **F-MPP1-6 (noted):** the harness stopped the first batch mid-play on the Canyon Works phone row; the spec's finally wrote a partial row and complete rows replaced it. The first implementer died with the session that spawned it; the second finished from the rows on disk.

### Evidence (this drain's gates on the merged tree)
| Check | Result |
| --- | --- |
| tsc / build / e1 | `0 / 0 / 0` |
| law-pointer | `rc=0 law-pointer-guard — do the law surfaces still point at what they claim?` |
| named guards | `ℹ pass 137 ℹ fail 0` |
| e2e both projects, --workers=1 | `rc=0   12 skipped   24 passed (1.8m)  06:37Z` |
| full npm run test:node-guards (before the pin) | `rc=1 ℹ tests 1018 ℹ pass 1012 ℹ fail 1 ℹ skipped 5  06:55Z` |
| engine hash | `merged: c63def1bfc493e243f31b9b115344ec6e3aacd57075554ec6a2ce872dfd90bef (pinned c63def1bfc493e243f31b9b115344ec6e3aacd57075554ec6a2ce872dfd90bef)` |
