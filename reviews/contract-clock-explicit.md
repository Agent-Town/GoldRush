# Review — contract-clock-explicit

**Slice:** `contract-clock-explicit` — every registry contract owns one tape clock source
**Slot:** main · **base:** `7681136dd` · **drained:** s2507, 2026-09-04

## VERDICT: READY TO MERGE

The implementation is scope-correct and behavior-neutral. The 24 contracts with a positive
`secureWave` keep the existing derived clock; the other 18 now declare `clockTicks: 18000`.
`runTapeEnvelopeForContract` takes the authored or derived clock, keeps 18,000 ticks as its floor,
and applies the existing two-tick endpoint slack once. Unknown ids remain at 18,002 ticks.

## Evidence

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | rc=0 |
| `npm run build` | green, 2.11 s |
| `npm run test:stats` under Node 26.4.0 | 87 stats + 252 KV + 252 SQLite + 26 ledger; census 42 / 24 derived / 18 explicit / 0 missing |
| Mutation proof | removing `e10-archive-world.clockTicks` reds the exactly-one-source guard and names the contract |
| `engine-era-guard.test.mjs` | 5/5 pass; same-era pin `3d0f567d…adb58` |
| plain boot, desktop + 390 px mobile | 2/2 pass in 3.4 s |
| full `test:node-guards` | 635 pass / 2 fail / 5 skip; both failures are the pre-existing F-2499-2 goal receipt, direct and fixture-teardown wrapper |
| independent Codex review in the runner | no contract-clock finding |

The first changed-diff wrapper hit its 900 s outer timeout and reported the performance budget at
0.904 ms under load; the focused budget rerun passed at 0.427 ms. Neither is a slice regression.

## Merge classification

This is main-slot runner output, so there is no stale lane or merge conflict. All changed task files
map to the master's TOUCH-ONLY set; the drain-owned `assets/engine-era.json` pin and this review are
the only additions.

| Files | Class |
|---|---|
| `src/meta/ContractFamilies.ts`, `src/playbook/PlaybookFormat.ts` | task source |
| six `assets/contracts/epoch-*/contracts.json` manifests | 18 explicit clocks |
| `scripts/test-standings.mjs` | permanent census and exactly-one-source guard |
| `tasks/BACKLOG.md` | runner evidence row |
| `assets/engine-era.json` | drain-owned same-era pin |

## Findings

- No new finding from this slice.
- F-2499-2 remains pre-existing and attended-owed: `gauntlet-heat11-unclaimed-sweep` uses prose in
  `mergeHash`, so the goal-schema test and its fixture-teardown wrapper red. It is outside this
  firewall and was re-measured as the only full-node-guard failure source.
- The runner's review also mentioned two pre-existing untracked Higgsfield skill directories. They
  are host debris outside the task firewall and were left untouched.
