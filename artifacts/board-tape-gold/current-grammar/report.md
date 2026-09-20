# Board tape gold — current grammar recordings

Recorded locally from main `48628dd094342e323072a95de5bf85f618bf8d7f` with Node v26.4.0. No live county request was made and these fixtures have no live verified slip.

## Lineage

- `e3-moth-season`: committed floor orders from `scripts/fixtures/moth-season-orders.json`, recorded with `jq -c '.[]' scripts/fixtures/moth-season-orders.json | node scripts/gr-sim.mjs --contract e3-moth-season --seed e3-moth-season-01 --policy=stdin --tape <scratch>/e3-moth-season.tape.json`.
- `e8-mare-claim`: committed post-ADR-005 prover `artifacts/rider-parity-grammar/e8-prover-1to1.mjs`, recorded with `node artifacts/rider-parity-grammar/e8-prover-1to1.mjs --contract e8-mare-claim --seed e8-mare-claim-01 --runs 1 --tape <scratch>/e8-mare-claim.tape.json`.
- `e7-relay-rush`: committed deduplicating controller `artifacts/gauntlet-heat12-20260905/rides/e7-relay-rush/work/ctrl-v2.mjs`, copied outside the repo and run as `node <scratch>/relay-controller.mjs <scratch>/e7-relay-rush.tape.json <scratch>/e7-relay-rush.controller-log.json` after replacing only its final retired `HOLD` with current `MOVE_HERO` at `{-25,41}`. It submitted 69 times and retained 68 input-log entries. A valid 1.38 MB current-grammar replay from the non-deduplicating prover was discarded because its 190.198 s isolated replay left too little margin under the fixture-owner sweep; no gameplay code was tuned.

## Measurements

| Contract | Tape bytes / entries | Tape SHA-256 | Replayed event hash | Secured | Purse held | Lifetime panned | Waves | Time |
| --- | ---: | --- | --- | --- | ---: | ---: | ---: | ---: |
| Moth Season | 64,665 / 137 | `62d62fe1223a602186d12791064200964acf710b10d59b11862a489ebe18a2d5` | `fnv1a32:c29ee8f0` | yes | 0 | 90 | 12 | 360 s |
| Mare Claim | 222,357 / 76 | `ece08b3a0bdc528fa81965198a977da9c8c1405babc1883003e92004b72d11cd` | `fnv1a32:873acbae` | yes | 140 | 810 | 20 | 600 s |
| Relay Rush | 242,456 / 68 | `874e1bef19df8d30a8b47121d2fb73608f3346fb18164c09f644e7a2b14f7ad6` | `fnv1a32:c845e51c` | yes | 200 | 870 | 20 | 600 s |

All three recordings use only current grammar. Their replayed event hashes equal the hashes embedded in the tapes, their replayed outcomes equal the declarations in `manifest.json`, and their secure snapshots carry the purse held rather than lifetime panning.

Before editing, the historical fixtures reproduced 0/3 with `assay replay failed: malformed tape` in 7.906 s on Node v26.4.0. Their SHA-256 values remained `6b8ab5c1…d822` (Mare Claim), `0f5b07df…d55b` (Moth Season), and `a476ab95…2988` (Relay Rush); those files and their verdict slips were not changed.

## Verification

- Relay Rush compact-reel proof: 1/1 passed in 34.465 s on Node v26.4.0, with the replayed event hash equal to the tape's `fnv1a32:c845e51c`.
- `node --test --test-reporter=spec scripts/board-tape-gold.test.mjs`: 4/4 passed in 106.459 s. Headless timings were 30.114 s (Mare Claim), 14.628 s (Moth Season), and 34.389 s (Relay Rush); the browser arm passed in 27.082 s with its standings request intercepted locally. Full output is in `board-gold.txt`.
- `node --test --test-reporter=spec scripts/rider-parity-retirement.test.mjs`: 2/2 passed in 0.278 s. `tsc --noEmit` passed with no output. `npm run build` passed; Vite built in 2.23 s and the asset-diet herald path measured 1,158,214 bytes below its 1,500,000-byte ceiling. Full outputs are retained beside this report.
- Biting mutation: in a detached scratch checkout, `HeadlessContractSim.ts` secure-snapshot gold was changed from `Math.floor(this.economy.gold)` to `event.summary.goldPanned`. The Moth Season positive case failed 0/1 in 12.658 s specifically at snapshot equality: actual `{ waves: 12, gold: 90, timeAlive: 360 }`, expected `{ waves: 12, gold: 0, timeAlive: 360 }`. Full output is in `mutation-test.txt`.
- The scratch source was restored byte-identical before its checkout was removed: SHA-256 `72004a7e7587f52844c9908acee00a14d4866dd7996adea29de4e764207b23d9`, equal to main.
- A scoped `codex review --uncommitted` on the exact task base found no actionable introduced defects. Its isolated reruns passed all four board-gold cases, the retirement guard, and typechecking; the transcript is in `codex-review.txt`.
- Final `npm run test:node-guards`, run through the repo's fire-shell serialization on Node v26.4.0: first group 742 tests, 735 pass, 2 fail, 5 skipped, 0 cancelled in 1,698.991 s. Both failures are the same `scripts/node-guards-contention.test.mjs` `spawnSync ps ENOBUFS`: once directly and once as the child that stopped `fixture-teardown.test.mjs`. The scheduled s2546 FIRE began during this otherwise isolated 28-minute run with its full protocol in the process command line; the contention probe's default `spawnSync` buffer could not hold `ps -o command=`. The fixture sweep therefore visited only subjects 1–98 of 128, stopping on contention; board-gold was subject 20 and passed in that nested sweep. The chained tail did not run because the first group exited nonzero. Full output is in `node-guards.txt`; this limitation is retained, not excused as a green.
