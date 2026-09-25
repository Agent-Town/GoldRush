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
