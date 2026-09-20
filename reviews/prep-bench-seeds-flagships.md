# prep-bench-seeds-flagships drain review

## Verdict — PASS

Main-slot output landed on `main` as `e33af94ef524196a0671b371453f312a054f1718`.

## What changed

Six already admitted, idle-unsafe benchmark contracts gained public seed pairs and pinned null floors: `e4-dust-flats`, `e4-boneyard`, `e7-relay-valley`, `e8-mare-claim`, `e8-eclipse`, and `e9-dome-basin`. The E7/E8/E9 census specs now distinguish those admitted rows from the still-rejected rows instead of asserting the stale all-rejected state. No `src/**`, admission exemption, contract map, economy, or gameplay path changed.

## Evidence

| Gate | Result |
| --- | --- |
| Policy | `drain-block-check --strict`: CLEAR |
| Null floors | 41/41 match under Node 26.4.0; 29 existing outcomes unchanged |
| New Law-2 rows | 12/12 `secured:false` |
| Focused Node guards | 8/8 passed |
| TypeScript / build | green / green |
| Own census before → after | 10/24 → 24/24 in the runner; fire rerun included below |
| Fire Playwright | 62/62, desktop + 390 px mobile, `--workers=1` |
| Boot probes | 2/2 plain boot, zero errors, Prospector visible |
| Diff | `git diff --check` clean; seven declared paths only |

New `-01` hashes: dust flats `fnv1a32:5d4aeff2`; boneyard `fnv1a32:717f1001`; relay valley `fnv1a32:1c8a5f74`; mare claim `fnv1a32:ee2f7c14`; eclipse `fnv1a32:fac5d558`; dome basin `fnv1a32:85282db9`.

The runner's full Node-23 battery reported 455 pass / 3 fail. Two failures were the known Node-23 timeout semantics and passed under the repository-pinned Node 26.4.0. The remaining `site/news.html → index.html#teaser` anchor failure reproduced under Node 26 with every site path untouched; it is pre-existing and outside this task's firewall.

## Merge classification

The main-slot runner wrote directly onto author base `647703b83`; s1742's only concurrent main move was the STATUS-only lock `564627206`. All seven committed paths were runner-owned and matched the master firewall. Five screenshots changed only as Playwright churn and were restored from `HEAD`. Logs remain separate bookkeeping; the untracked attended railcar-v2 master and `.claude/cache/` were not touched.

The generated `eraStamp` is `564627206`, the exact generation/check base. The commit that records the artifact necessarily advances `HEAD`; F-1653-3 already tracks replacing commit-keyed stamps with a sim-content key.

## Findings

- **F-1742-1 — report-only:** `e4-long-road` and `e4-gusher-county` idle-secure at wave 12 without hero movement or damage, so Law 2 forbids seeding them pending targeting diagnosis.
- **F-1742-2 — non-blocking factory-ops:** the completed main-slot task waited on the fire lock and had to be released by terminating only its task child; the done-move and output were preserved.
- **F-1742-3 — non-blocking adjacent master defect:** the untracked railcar-v2 master has an unrunnable first probe and a screenshot/firewall conflict; do not dispatch it yet.
