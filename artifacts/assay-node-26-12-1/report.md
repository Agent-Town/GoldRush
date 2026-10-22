# Node 26.12.1 replay migration

Pre-task HEAD: d8ecd33569ac18cee0aba7c28763f35c0f195c1e. Branch: art/portraits-e5-e10-generated.
Preflight: no ahead commits, no source edits; expected untracked node_modules symlink retained. No evidence discarded. Baseline npm run build under usual Node 23.11.1 exited 0 (tsc, Vite, asset-diet). Explicit prohibition on npm install/npm ci overrides the contradictory generic preflight install line; shared dependencies untouched.

Installed Node 26.12.1 using nvm install 26.12.1; nvm verified SHA-256. Node 26.4.0 retained; default runtime unchanged.

Sources checked: https://nodejs.org/en/blog/vulnerability/july-2026-security-releases and https://nodejs.org/en/blog/vulnerability/october-2026-security-releases (October fixed release 26.12.1).

Pre-change engine hash: 2d180e6bad6933ef15db2a006aaa0a1a3be8a97efdf9416cbc4646be71be4f6d.

Corpus selection: original retained watch-reel.json with a sibling verified verdict-slip.json matching both tape ID and eventLogHash; heat 14 followed by heat 13, first 24 eligible paths sorted within each heat, supplemented by five verified heat-13/14/15 probe and Regatta tapes because nine original candidates cannot complete on the baseline engine. corpus.json names all inputs, slips, engine eras and input SHA-256. No tape is altered. compare.py invokes scripts/assay-replay.mjs separately under each runtime and compares the entire parsed replay (only wallMs excluded), plus a replay-level verdict derived from the worker's hash/outcome comparison. Historical VERIFIED provenance does not imply present-day verification: old-era tapes may differ from their original recording on today's engine. The worker's era admission gate is not bypassed or changed; this direct instrument measurement isolates runtime drift.

No SSH, deploy or live service change. PINNED landing registration in assets/engine-era.json remains attended integration work outside this task's firewall. Obsidian was read; the task's strict TOUCH ONLY firewall precludes an external vault write.

## Replay proof

**20 complete replay pairs; zero runtime disagreements.** All 29 selected inputs have retained VERIFIED slips matching their IDs and recorded hashes. Twenty produce full replay results under both runtimes; the other nine fail identically and are NOT counted as complete replay proof. Full replay objects, including the immutable securedSnapshot, final outcome, ticks, engine and any mechanic fields, compare byte-for-byte after deterministic JSON serialization; only wallMs is excluded. The table's values apply to BOTH Node 26.4.0 and Node 26.12.1.

Of the 20 full replays, 18 still match the historical claim and two are rejected identically: heat-14 Twin Banks originally claimed 556 gold but now replays 389; heat-13 Dry Gulch originally claimed 198 and now replays 199. These are pre-existing source/recording drift, not introduced by the runtime upgrade; their deeper cause is outside this slice. Era-5 tapes are also retired by the worker's admission policy regardless of their instrument-level result.

| Tape file | Engine era | Replay verdict (both) | Secured | Final gold | Final wave | Secure snapshot (gold / wave / seconds) | Replay content hash (both) | Identical |
|---|---:|---|---|---:|---:|---|---|---|
| `artifacts/gauntlet-heat14-e3949bfa/rides/e1-dry-gulch/watch-reel.json` | 6 | verified | True | 328 | 20 | 328 / 20 / 600 | `fnv1a32:314a9b3c` | yes |
| `artifacts/gauntlet-heat14-e3949bfa/rides/e1-twin-banks/watch-reel.json` | 6 | rejected | True | 389 | 20 | 389 / 20 / 600 | `fnv1a32:cd66d82b` | yes |
| `artifacts/gauntlet-heat14-e3949bfa/rides/e10-ember-shore/watch-reel.json` | 6 | verified | True | 60 | 12 | 60 / 12 / 360 | `fnv1a32:d3959e47` | yes |
| `artifacts/gauntlet-heat14-e3949bfa/rides/e2-pressure-garden/watch-reel.json` | 6 | verified | True | 227 | 12 | 227 / 12 / 360 | `fnv1a32:395a7a37` | yes |
| `artifacts/gauntlet-heat14-e3949bfa/rides/e3-blackout-ridge/watch-reel.json` | 6 | verified | True | 499 | 12 | 499 / 12 / 360 | `fnv1a32:88d63803` | yes |
| `artifacts/gauntlet-heat14-e3949bfa/rides/e3-fairground/watch-reel.json` | 6 | verified | True | 62 | 12 | 62 / 12 / 360 | `fnv1a32:092d72d8` | yes |
| `artifacts/gauntlet-heat14-e3949bfa/rides/e3-moth-season/watch-reel.json` | 6 | verified | True | 455 | 12 | 455 / 12 / 360 | `fnv1a32:ce9c8f35` | yes |
| `artifacts/gauntlet-heat14-e3949bfa/rides/e5-deepwater-claim/watch-reel.json` | 6 | verified | True | 200 | 12 | 200 / 12 / 272 | `fnv1a32:217967af` | yes |
| `artifacts/gauntlet-heat14-e3949bfa/rides/e6-glow-mesa/watch-reel.json` | 6 | verified | True | 109 | 15 | 109 / 12 / 460.5 | `fnv1a32:b8a19332` | yes |
| `artifacts/gauntlet-heat14-e3949bfa/rides/e6-picnic/watch-reel.json` | 6 | verified | True | 500 | 20 | 500 / 20 / 600 | `fnv1a32:fd3af43b` | yes |
| `artifacts/gauntlet-heat14-e3949bfa/rides/e7-relay-rush/watch-reel.json` | 6 | verified | True | 200 | 20 | 200 / 20 / 600 | `fnv1a32:56e85b88` | yes |
| `artifacts/gauntlet-heat14-e3949bfa/rides/e7-relay-valley/watch-reel.json` | 6 | verified | True | 200 | 20 | 200 / 20 / 600 | `fnv1a32:ea3d1acc` | yes |
| `artifacts/gauntlet-heat14-e3949bfa/rides/e8-mare-claim/watch-reel.json` | 6 | verified | True | 260 | 20 | 260 / 20 / 600 | `fnv1a32:ddf3c5c6` | yes |
| `artifacts/gauntlet-heat14-e3949bfa/rides/the-claim/watch-reel.json` | 6 | verified | True | 498 | 10 | 498 / 10 / 300 | `fnv1a32:79bb2437` | yes |
| `artifacts/gauntlet-heat13-569a41f9/rides/e1-dry-gulch/watch-reel.json` | 5 | rejected | True | 199 | 20 | 199 / 20 / 600 | `fnv1a32:036a109a` | yes |
| `artifacts/gauntlet-heat14-e3949bfa/probe/watch-reel.json` | 6 | verified | True | 335 | 10 | 335 / 10 / 300 | `fnv1a32:b131e18e` | yes |
| `artifacts/gauntlet-heat15-cd24d12d/rides/r1/watch-reel.json` | 6 | verified | True | 0 | 12 | 0 / 12 / 272 | `fnv1a32:f3a9c00c` | yes |
| `artifacts/gauntlet-heat15-cd24d12d/rides/r2/watch-reel.json` | 6 | verified | True | 200 | 12 | 200 / 12 / 272 | `fnv1a32:b92da1bf` | yes |
| `artifacts/gauntlet-heat13-569a41f9/probe/watch-reel.json` | 5 | verified | True | 335 | 10 | 335 / 10 / 300 | `fnv1a32:b131e18e` | yes |
| `artifacts/gauntlet-heat15-cd24d12d/probe/watch-reel.json` | 6 | verified | True | 335 | 10 | 335 / 10 / 300 | `fnv1a32:b131e18e` | yes |

### Additional candidates, excluded from the twenty

| Tape file | Engine era | Result under BOTH runtimes |
|---|---:|---|
| `artifacts/gauntlet-heat14-e3949bfa/rides/e8-far-side/watch-reel.json` | 6 | exit 1: assay replay failed: the run ended before tick 8793 of the order stream |
| `artifacts/gauntlet-heat13-569a41f9/rides/e1-twin-banks/watch-reel.json` | 5 | exit 1: assay replay failed: the run ended before tick 17614 of the order stream |
| `artifacts/gauntlet-heat13-569a41f9/rides/e2-incline/watch-reel.json` | 5 | exit 1: assay replay failed: declared runStart is not installable by this door |
| `artifacts/gauntlet-heat13-569a41f9/rides/e3-blackout-ridge/watch-reel.json` | 5 | exit 1: assay replay failed: declared runStart is not installable by this door |
| `artifacts/gauntlet-heat13-569a41f9/rides/e3-canyon-works/watch-reel.json` | 5 | exit 1: assay replay failed: declared runStart is not installable by this door |
| `artifacts/gauntlet-heat13-569a41f9/rides/e3-moth-season/watch-reel.json` | 5 | exit 1: assay replay failed: declared runStart is not installable by this door |
| `artifacts/gauntlet-heat13-569a41f9/rides/e4-gusher-county/watch-reel.json` | 5 | exit 1: assay replay failed: declared runStart is not installable by this door |
| `artifacts/gauntlet-heat13-569a41f9/rides/e7-dead-band/watch-reel.json` | 5 | exit 1: assay replay failed: declared runStart is not installable by this door |
| `artifacts/gauntlet-heat13-569a41f9/rides/e7-echo-canyon/watch-reel.json` | 5 | exit 1: assay replay failed: declared runStart is not installable by this door |

## Changes and integration boundary

- scripts/assay-replay-agent.mjs: canonical constant only, 26.4.0 → 26.12.1; replay logic unchanged.
- ops/droplet/goldrush-assay.service and ops/droplet/goldrush-ledger-backup.service: ExecStart runtime paths only.
- docs/ops/agenttown-server.md: six version/path lines updated, keeping the exact-version law.
- scripts/assay-worker.test.mjs: canonical-version fixture now refuses 26.4.0 and expects 26.12.1.
- artifacts/assay-node-26-12-1/: proof harness, corpus/provenance, raw replay outputs, comparison JSON, logs and this report.

New computed engine hash: `b813de7b3a094a20ff8bc245bdbe7dddb4eb96c42a8c95b2312ee57455ddc932`.

This is a PINNED landing in the SAME era (6). assets/engine-era.json was not changed because it is outside TOUCH ONLY. Attended integration must register the new hash in the existing lineage before using it for newly stamped tapes; otherwise the worker will refuse an unknown pin. The live ledger service, assay service and backup runtime switch remain attended operations, with no deployment performed here.

## Reproduction

`python3 artifacts/assay-node-26-12-1/compare.py --fresh` re-runs all 29 candidates using the two absolute nvm runtime paths; default mode resumes retained results. Four independent headless replay processes at most, 240-second per-process limit. The initial sequential comparison was replaced with the bounded concurrent harness after its first pair completed; only this task's Python PID 4839 and child PID 9981 were stopped, preserving the completed first result. No replay logic or original tape was changed.

Tests: `DEVELOPER_DIR=/Library/Developer/CommandLineTools ~/.nvm/versions/node/v<VERSION>/bin/node --test scripts/assay-replay.test.mjs scripts/assay-worker.test.mjs scripts/river-assay.test.mjs`. Baseline 26.4.0 ran before the pin changed; 26.12.1 runs after the pin changed, so worker subprocesses use the respective canonical runtime.

Actual refusal check: `~/.nvm/versions/node/v26.4.0/bin/node scripts/assay-worker.mjs --once --dry-run` exits 1 before API configuration/access, with `assay worker requires Node 26.12.1 exactly; found 26.4.0`. Raw capture: wrong-runtime.json.

## Validation and status

| Check | Runtime | Result |
|---|---|---|
| Preflight npm run build (tsc + Vite + asset-diet) | usual 23.11.1 | exit 0 |
| Three assay suites, original pin | 26.4.0 | 24 tests passed, 0 failed, exit 0 |
| Three assay suites, new pin | 26.12.1 | 24 tests passed, 0 failed, exit 0 |
| Actual wrong-runtime worker startup | 26.4.0 | expected exit 1; exact required/actual versions proven |
| npx tsc --noEmit | usual 23.11.1 | exit 0 |
| Final npm run build (includes tsc) | usual 23.11.1 | exit 0 |
| git diff --check | n/a | exit 0 |

Build warnings are existing Vite native-config/import-extension and large-chunk notices, plus asset-diet UV/tier notices; no failed check. Replay stderr contains Node's experimental localStorage warning. The River suite exercises real browser replay and fails on console/page errors. No standalone UI change or Playwright spec is part of this runtime-pin slice.

READY-FOR-GATES: 20 full replay pairs, 0 disagreements; 9 further identical failures documented; both runtime test runs 24/24 green. Evidence below 1 MB (25 MB ceiling). Only the five authorized source/doc/unit/fixture files and this evidence directory changed; expected shared node_modules symlink remains untracked. No original tape edited, no evidence discarded, no dependency installation, default runtime unchanged.

REMAINING LIST IN ORDER (attended integration/operations, outside this lane task):
1. Register the computed hash as a PINNED same-era landing and integrate this lane commit.
2. On the owner's authorization, switch the droplet's ledger, assay and backup runtimes and perform live service checks. This task made no server change.

Commit identity is supplied in the final lane report; retrieve the implementation commit with `git log -1 --format=%H -- scripts/assay-replay-agent.mjs`.
