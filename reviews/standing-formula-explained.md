# standing-formula-explained — s2503 gate hold

**Slice:** `tasks/standing-formula-explained.md`  
**Branch/tip:** `lane/a` @ `d3814a1af`  
**Gate base:** `be0c5aec6`  
**Candidate:** clean three-way merge in detached `/tmp/gold-rush-gate-s2503`

## Verdict

**HOLD — NOT MERGED.** The comparator, shared public rule and county-answer UI are coherent, but the candidate does not implement the task's governing trust-boundary requirement: the assay must derive the standing at the `run_secured` event so no rider can declare it.

## F-2503-1 — the first submitted score is still the authority

The candidate freezes the first ranked row for a tape in `functions/api/standings.ts`:

```ts
const securedSnapshot = tape && current.find((row) => sameStanding(row) && row.tape?.id === tape.id && isRankedRow(row));
```

That prevents a second post for the same tape from moving a standing, but it does not establish the first post's values. A rider may submit one overtime score with its tape and make those client-declared final values the frozen standing.

The assay does not repair that boundary. `scripts/assay-worker.mjs` compares the posted score with the replay's final `outcome`; `scripts/assay-replay.mjs` and `src/replay/AgentTapeReplay.ts` return only final waves, gold and time; and the `/api/standings/assay-verdict` body can mark a row verified but carries no goal snapshot and rewrites none of its score fields. `HeadlessContractSim` observes the canonical `run_secured` event and records `securedWave`, but does not retain gold or time at that event, and its replay result discards even `securedWave`.

The browser-side snapshot is honest for a continuous run, but `Game.ts` keeps it only in memory. It is not part of the run-suspend envelope, so a resumed Rush run can also lose the official-goal values before submission.

This is exactly the owner concern the revised master answers at the root: overtime may continue, but it must never move the board, and the rider must not be the source of the snapshot. The runner independently disclosed both missing pieces in its READY-FOR-GATES report.

## Why the existing tests pass

The standings fixture posts the secure score first and an overtime score second for the same tape. It proves first-write retention, not assayer derivation. There is no one-shot overtime submission whose verified replay rewrites the row to the secure-event values, and no suspend/resume proof.

## Evidence

| Gate | Result |
|---|---|
| clean three-way merge | `git merge-tree --write-tree main lane/a` succeeded; no conflicts |
| `npx tsc --noEmit` | clean |
| `npm run build` | green; asset-diet green |
| `npm run test:stats` | 87 stats; 245 standings KV; 245 standings SQLite; 26 ledger-worker checks |
| source trace | first client row is retained; replay and verdict transports carry final outcome only |

Visual e2e was not re-run after the blocking source trace. Its UI evidence cannot satisfy the missing assayer authority.

## Disposition

`lane/a` remains intact at `d3814a1af`. Corrective `tasks/f2503-1-standing-goal-snapshot-source.md` is a BUILD-ON-PREDECESSOR task: preserve the candidate's finished comparator and UI work, add the one authoritative secure-event snapshot path, then re-gate the combined result.
