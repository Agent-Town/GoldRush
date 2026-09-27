# Campaign fixtures clean up after failure and retain nested diagnostics

**READY-FOR-GATES WITH A GATE HOLD.** Implementation, campaign cleanup proofs, all-owner cleanup, TypeScript/build, adjacent suites and plain boots pass. The full Node command is RED on live-board and host-contention guards outside this task firewall. The corrected clean-base control passes, and all original chained checks were measured independently; only the desk-declaration CLI also refuses the stale linked-worktree handoff.

## Change and preserved behavior

Every campaign fixture now registers `t.after` immediately after allocation. The test owns both deterministic-run directories even if the second helper fails before returning. Contract helpers also transfer ownership before starting a child. The resume test registers a close promise immediately after spawn; its teardown signals a still-running child and awaits close before removing the checkpoint directory. Startup and early-exit errors remain failures, with child stderr retained.

The sweep emits nonzero children's status, signal, spawn error, stdout and stderr through test diagnostics, including when the child cleans up and the sweep passes. Its survivor verdict and existing executed-test check remain intact. A final diagnostic records owner count, survivor count and reported-only child failures.

All existing campaign assertion statements, expected hashes, child command arrays and timeouts are unchanged (`semantic-preservation.json`). No runtime, dependency, asset, e2e assertion or watchdog changes. Performance impact is not expected from this test-only change.

## Pre-flight and runtime

Initial lane HEAD `36d3905f6d8c3d1cabe373b83ce9ca27f229e5ae`, branch `sol/open-findings-astra`, clean worktree, zero commits ahead of main. That report-only commit was already merged. The lane was refreshed using the task-authorized `git checkout -B sol/open-findings-astra main` to `4be0b47dad74f21041ffc2fafafb77d0185f7279`. No evidence was discarded; no `git clean` was needed. The earlier blocker report is retained as `attempt-1-report.md` and in git.

`PATH=/opt/homebrew/bin:$PATH`; `/opt/homebrew/bin/node` resolves to `/opt/homebrew/Cellar/node/26.4.0/bin/node`, version `v26.4.0`. Install and build exited 0 before source edits; build includes TypeScript. No lockfile changed. Receipts: `preflight.json`, `preflight-install.txt`, `preflight-build.txt`.

## Before-edit clean-source control

Detached arena: `control-arena`, at `1d34e71fcc33c3a83cd02b2f9bee41cd749a9482`, prepared with `npm ci --no-audit --no-fund` (exit 0). Its `assets/pilots` link was repointed exactly as the task requests. The scripts remained byte-identical to that commit.

Exact command, from the arena with the same Node/PATH:

```sh
CAMPAIGN_SWEEP_CAPTURE="$PWD/../control-children.jsonl" /opt/homebrew/bin/node --require ../capture-sweep.cjs --test --test-reporter=spec scripts/fixture-teardown.test.mjs
```

The read-only preload records each nested command, exit, stdout/stderr and scratch entries before cleanup. All **162 owners** ran in **950.123 seconds**, outer **exit 1**. The campaign passed **6/6**, exit 0, **zero survivors**, in **21.416 seconds**. The historical `gr-campaign-resume-TH7ZuT` failure did **not** reproduce; its exact assertion remains **UNVERIFIED**, and source equality is not claimed as attribution.

This first arena control had setup failures distinct from the historical fingerprint. A remaining relative `assets/raw` link was unresolved; an alias in this task's evidence directory fixed it before the campaign owner ran. The arena also lacked `.env.local`: four ledger children failed, and `ledger-mirror-freshness-guard.test.mjs` left `s2672-dest-iJVSNT` at its assertion “the pull must write to the destination in force”. `node-guards-contention` separately reported a nonquiet host and left no fixture. Node/Playwright caches do not count as fixture-prefix survivors. Full records: `control-result.txt`, `control-sweep.txt`, `control-children.jsonl`, `control-summary.json`.

After linking the existing lane `.env.local` without copying or logging its values, the five asset/environment-affected owners passed **42/42**, exit 0, in **5.8 seconds** (`control-environment-recheck.txt`). **Corrected complete control:** the unchanged pre-landing source ran all **162 owners**, **zero fixture survivors**, **exit 0**, in **928.750 seconds**. Its campaign passed **6/6**, exit 0, in **21.775 seconds**, with no survivors. Only the host-contention child failed and cleaned up (reported-only under the original sweep rule). Full corrected command, child outputs, counts and exit are in `control-corrected-result.txt`, `control-corrected-sweep.txt`, `control-corrected-children.jsonl`, and `control-corrected-summary.json`. The earlier setup-red run remains retained; it is not relabeled as green.

## Failure and diagnostic proofs

`verify-cleanup.py` injected failures only in the detached scratch copy, then restored its exact original bytes. Seven cases each exited **1** with **zero campaign survivors**: first helper after allocation, second helper after allocation, resume assertion, live asynchronous child, child startup failure, child exit before checkpoint, and contract helper after allocation. Both scratch restoration and untouched candidate source are SHA-256 verified in `injection-results.json`; individual failing transcripts are retained, and `injection-fingerprint-check.json` confirms every intended failure actually fired. The real campaign spec then passed **6/6**, exit 0, **27.0 seconds**.

`verify-sweep.mjs` proves the existing verdict distinction: a failed assertion with cleanup yields sweep exit **0** while preserving the assertion text; a leaked fixture yields exit **1**; a controlled child result with no executed-test summary yields exit **1** and retains both output streams. Final results: `diagnostic-gates.txt`, `diagnostic-results.json`. The first proof draft had a syntax error in its deliberately leaky fixture; its receipt remains `diagnostic-leak-attempt-1.txt`. Node 26 reports a crashed file as one synthetic test, so the no-summary probe uses an explicit spawn-result fixture. This observation does not change the sweep's existing verdict rule.

The paired negative control (`verify-before-after.py`) inserts the **same** `CONTROLLED_SAME_ASSERTION` immediately after the resume checkpoint path is constructed. Original source: **exit 1, one survivor** (`gr-campaign-resume-fTIrUY`). Fixed source: **exit 1, zero survivors**. The scratch source is restored byte-for-byte afterward. `same-assertion-results.json`, `same-assertion-gates.txt`, `same-assertion-before.txt`, `same-assertion-after.txt`. This directly proves cleanup changed without converting a failing assertion into a pass. The deliberately leaked original fixture stays in its disk-local negative-control directory, outside the fixture sweep's temporary root.

## Final gate results

| Gate | Result | Evidence |
| --- | --- | --- |
| Seven injected failures | 7 expected failures; all exit 1, zero survivors | `injection-results.json` |
| Diagnostic/verdict probes | 3/3 expectations pass | `diagnostic-gates.txt` |
| Ordinary campaign | 6/6, exit 0, 27.0 s | `focused-gates.txt` |
| TypeScript | Exit 0, 6.0 s | `focused-gates.txt` |
| Build | Exit 0, 19.2 s | `focused-gates.txt` |
| Named adjacent suites, both projects | 34/34, exit 0, 168.7 s | `browser-gates.txt` |
| Full `npm run test:node-guards` | Exit 1; 1040 tests, 1033 pass, 5 skip, 2 fail; 1155.197 s | `full-node.txt`, `full-node-summary.json` |
| Candidate fixture sweep inside full Node | 162 owners, zero survivors; 1101.544 s | `full-node.txt` |
| Corrected plain menu and gameplay boots | 4/4, zero console/page errors, exit 0, 6.8 s | `plain-recheck.txt`, `plain-boots.json`, `plain-*.png` |
| Corrected all-162-owner clean-base control | Exit 0; 162 owners, zero survivors; 928.750 s | `control-corrected-summary.json` |
| Independent original npm tail | 6 of 7 legs exit 0; desk CLI exit 2; final 87/87 pass | `chained-gates.txt` |
| Identical assertion on old/fixed source | Both exit 1; survivors 1 → 0; exact restoration | `same-assertion-gates.txt` |

Browser commands use the permanent gate battery and `--workers=1`, under `scripts/attended/dlock.sh`, on scratch port 5317. One server is started at a time and only that child is stopped, by its owned process handle. The initial plain-boot probe waited for gameplay diagnostics at `/`, which correctly opens the menu; that probe timeout is retained in `browser-gates.txt`. The corrected probe checks the real menu and a seeded gameplay route without `debug`, on desktop and 390px mobile. No source or gate timeout was relaxed.

## Full Node gate hold

The original full npm command exited 1 with two failing top-level tests: `desk-declaration-guard.test.mjs` rejects the lane because its tracked handoff differs from the live main handoff, and `node-guards-contention.test.mjs` could not observe a quiet host for 300 ms. Neither is a campaign assertion or fixture survivor. The nested sweep reports those same two failing children while correctly passing with **162 owners and zero survivors**. All campaign tests also pass in the full battery. The longest TAP silence was **915.3 s** against the unchanged **2700 s** watchdog.

Because its first leg failed, npm's original `&&` tail did not run. Every original tail leg was then run independently through the permanent battery, preserving its command and its own verdict. Six of seven legs passed: ticker statistics, findings state, blocker panel, ruling propagation, NUL audit, and the final **87/87** review/guard tests. The desk-declaration CLI exited **2** on the same stale linked-worktree handoff. The independent tail battery exits **1**, and the original full command remains RED (`chained-gates.txt`). No board files, test guards, limits or runtime source were changed to bypass these failures.

## Remaining list in order

1. Orchestrator: run the complete Node command against a current authoritative handoff and an exclusive host. The linked-worktree desk refusal and host-contention failure remain gate blockers; their owners are outside this task firewall.
2. Integrate through the normal drain only after those broader gates are satisfied. No cleanup implementation or focused verification remains owed.

## Commits and custody

Source commit: `a3764d3a3b97b6d6c02e265eeaccdfa1a016f499` (`test: guarantee campaign fixture cleanup and retain child failures`). Evidence commit is the final lane tip; resolve it with `git log -1 --format=%H -- artifacts/gr-campaign-fixture-cleanup-1/report.md`. No main files, other lanes, or runtime source were changed. No server remains from this task; only owned Vite child processes were signaled. Detached control source is restored, and its only tracked difference is the task-prescribed art link.

The task firewall permits only the two test scripts and this evidence directory. Durable handoff knowledge is therefore retained here rather than writing an out-of-scope vault note. The detached arena, art-store alias and local environment link are disk-local fixtures, not commit inputs.
