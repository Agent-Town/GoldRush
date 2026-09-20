# envelope-fencepost-no-securewave — every contract keeps its terminal tick

**Slice:** `envelope-fencepost-no-securewave` (main slot)
**Merged to main:** `31853ab40a4ddf92722ffe003e4d7a0b718c1955` (drained s2501, 2026-09-04)
**Gate base:** `576fc65105bf13402220a45f087017ae053d360f`

## VERDICT: MERGE

The inclusive endpoint allowance now belongs to the shared door envelope rather than the
`secureWave` branch. Contracts without `twist.secureWave` therefore admit an order recorded on
tick 18,000 (`durationTicks = 18,001`) while retaining a finite 18,002-tick ceiling. One tick past
that ceiling is still refused as `reel_duration_exceeded`.

The fix is at the single derivation used by recorder sizing, local tape validation, assay validation,
and standings admission. No per-contract exception or new balance value was added.

## Evidence

All gates ran on the merged candidate in detached worktree `gate-s2501`. The append-only transcript
is `artifacts/envelope-fencepost-no-securewave-gate.txt`.

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | clean, rc 0 |
| `npm run build` | green, rc 0 (`vite` built in 4.41 s) |
| `npm run test:stats` on canonical Node 26.4.0 | rc 0 — 87 stats, 239 standings KV, 239 standings SQLite, 26 ledger-worker checks |
| Heat 11 assay replay | 3/3 exact: Half-Life Hollow `fnv1a32:356b8d34`, Picnic `fnv1a32:1df337a8`, Relay Rush `fnv1a32:f0fbaa92`; each secured through tick 18,001 with its recorded outcome |
| Desktop + 390px boot probe | 6/6 pass, one worker, zero console/page errors |
| `npm run test:node-guards` | 639 tests: 632 pass, 5 skip, 2 fail; both reports are the one pre-existing F-2499-2 goal-schema defect and its wrapper |
| Main known-red control | `scripts/goal-tracker.test.mjs` reproduces the identical invalid mergeHash `attended-evidence-commits-2026-09-04` outside this slice |
| Engine identity | `f9f634280279cacf4eb944ec92fc9022eaffdfb8841086fdd863c302097dbea0`, byte-identical to the latest era-5 pin; no new pin owed |

Two verification refusals are retained rather than hidden. `test:stats` first ran under Node 23.11.1
and correctly refused the assay worker's exact 26.4.0 runtime contract; the unchanged arm passed after
the canonical binary was selected. The first ad-hoc replay assertion compared the tape-only descriptive
`reason` field, which the replay API deliberately does not return; the corrected check asserts the
worker's actual four outcome fields plus the event-log hash, and all three reels passed.

## Merge classification

Main-slot runner output: exactly two tracked files, `+29/-10`, both licensed by the master. The
runner's envelope-test file is not an excursion: it implements both required acceptance arms and the
three banked-Heat-11 fixtures. Unrelated factory log and old screenshot churn stayed unstaged.

- `src/playbook/PlaybookFormat.ts` — moves the existing `+2` endpoint law to the shared default.
- `scripts/test-standings.mjs` — pins the no-`secureWave` boundary and exercises the real refused reels.

`public/skill.md` contains no numeric envelope ceiling, so the task's conditional documentation arm
was correctly untouched. No sim, ranking, worker, or balance code moved.

## Findings

- **F-2500-1 discharged:** `scripts/test-standings.mjs` is the master's named envelope-test surface,
  not a firewall excursion. The diff proves each hunk maps to scope item 2.
- **F-2500-2 recorded:** s2500's three concurrently-rotted law pointers were already re-grepped,
  corrected, and re-pinned before this drain; no further pointer edit was needed here.
- **F-2499-2 remains attended-owed:** this drain did not invent provenance for another session's
  multi-commit Heat 11 goal merely to make a guard green.
