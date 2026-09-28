# Drain review: `door-tape-grammar-4`, the last two client-judged ids (Opus 5.5 implementer at max effort; F-DTG3-1, F-DTG3-5)

**Branch** `fix/door-tape-grammar-4` at `6e08d452c` · **merge** `df691d8b1` · engine hash unchanged (`755400f8`, no pin) · drained attended 2026-09-25 21:40Z in a detached chain worktree with the scratch store at `5793a96`; deployed (scripts/attended/land.sh, config `dtg4`).

**Verdict: LANDED.**

### What it does
The fourth door-grammar slice (Opus 5.5 implementer at max effort, the grammar-3 agent continued on a stacked branch; F-DTG3-1, F-DTG3-5) closes the last two ids the door judged looser than the client: `research_pick` ids and `context_action` target ids that trim to nothing or name no building join `CLIENT_JUDGED_ACTIONS`, so the door refuses them `400 bad_payload` (RED first: all six shapes were stored and ranked 1 to 6 on the base) and an already-stored row of each shape is retired at read, never dropped (RED 2: it ranked; now board 0, `retiredCount` 1). The 79-row door-versus-client probe: door accepts what the client refuses 6 to 0, door refuses what the client accepts 14 to 14, equal 59 to 65; only the six targeted rows moved, all in the door-at-POST column. The comment above `validateTape` now describes the door as it is. `src/` byte-identical; the same-game audit unchanged. Where the player sees it: every reel the door ranks can be loaded by the Lantern and the assayer, for every action the recorder writes.

### Measured
`scripts/test-standings.mjs` 514 to 576 per backend (26 client-judged rows and 36 retirement rows; every existing row green); 14 of 14 mutations red (dropping each verb from the set reds exactly its answers; exempting each shape at the door only or at read only reds exactly that shape). tsc and build green; test:accounts, test:mp, test:stats green under the lock; node-guards 1,009 of 1,018 with the worktree reds identical on the base (two backup-pull rows and the sweep's fill-gaps child needing `.env.local`, contention while another battery ran); the browser-door row passed in this battery and alone on both trees.

### Merge classification
Stacked on `fix/door-tape-grammar-3` (lands first); LANE-TOUCHED: `functions/api/standings.ts` (`CLIENT_JUDGED_ACTIONS`, the `validateTape` comment; the drain's cure fixes the gate comment inside `validTapeAction`, F-DTG4-1), `scripts/test-standings.mjs`, `artifacts/door-tape-grammar-4/**`. Dry merges clean with main, kv2 and the audit slice.

### Findings
- **F-DTG4-1 (fixed by the drain's cure):** the gate comment inside `validTapeAction` named only three verbs.
- **F-DTG4-2 (pointer):** the client's normalizer lives in `LockstepClient.ts`, not `RunTape.ts`.
- **F-DTG4-3 with F-DTG3-3 (a slice before any building is ever removed):** a solo recording can carry building upgrades and demolitions; a stored row that upgrades a removed building in its own entries would retire, one that does so inside an embedded recording would be silently dropped. Not reachable today: no building id has ever been removed.
- **F-DTG3-2 (a slice):** the assay queue still serves pending rows the grammar retired. **F-DTG4-4:** the probe's zero covers the actions it samples.

### Evidence (this drain's gates on the merged tree)
| Check | Result |
| --- | --- |
| tsc / build / e1 | `0 / 0 / 0` |
| law-pointer | `rc=0 law-pointer-guard — do the law surfaces still point at what they claim?` |
| named guards | `ℹ pass 140 ℹ fail 0` |
| the ledger battery | `rc=0 ℹ tests 1263 ℹ pass 1260 ℹ fail 0 ℹ skipped 3` |
| the three functions gates | `accounts rc=0 / mp rc=0 / stats rc=0` |
| full npm run test:node-guards (before the pin) | `rc=0 ℹ tests 1025 ℹ pass 1020 ℹ fail 0 ℹ skipped 5 ℹ tests 82 ℹ pass 82 ℹ fail 0 ℹ skipped 0  21:40Z` |
| engine hash | `merged: 755400f89e096800cd8fa08e2bde744d15cca76e74d17f59c87d2f20468b89fa (pinned 755400f89e096800cd8fa08e2bde744d15cca76e74d17f59c87d2f20468b89fa)` |
