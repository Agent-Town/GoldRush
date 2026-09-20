# OWED AT THE DRAIN: one engine-era pin (this branch reds 3 guards without it)

`assets/engine-era.json` is **outside this task's firewall** (TOUCH ONLY names
`scripts/reexport-pilot.sh`, the sidecars, `scripts/glb-contract-guard.*`, `package.json`,
`docs/3d/PIPELINE.md`, `artifacts/glb-export-contract/**`, `tasks/BACKLOG.md`). The re-pin is the
drain's act here, exactly as `30bab24b2` did for the asset-diet drain the same day.

## The coupling

`scripts/assay-replay-agent.mjs:42` puts the whole directory `assets/pilots/map-rebuild-spike` in
`ENGINE_SOURCE_INPUTS`, and `collectEngineFiles` (`scripts/assay-replay-agent.mjs:76`) collects every
`.json` under it. The 32 terrain export sidecars this task adds are `.json` files in that directory,
so they enter the engine identity corpus and move the hash. Nothing about the simulation changed:
the sidecars are Blender export metadata, never read by the game or the replay.

## The fix — append ONE pin to `assets/engine-era.json` `pins` (era stays 5)

```json
{
  "engineHash": "3c38c993fda488a95045297e012476484cbce9a62567a6ffbf0d9a524b7b4885",
  "pinnedAt": "2026-09-05",
  "cause": "corpus re-hash: glb-export-contract-and-validator drain — 32 terrain `*.export.json` Blender export sidecars added under assets/pilots/map-rebuild-spike, which ENGINE_SOURCE_INPUTS (assay-replay-agent.mjs:42) sweeps whole and collectEngineFiles (:76) collects by .json extension; pipeline metadata only, never loaded by the game or the replay worker; no src, sim or contract change; same era per F-1441-3",
  "aliases": []
}
```

and set the top-level `"engineHash"` to the same value.

## Guards that go green when it lands (all one root cause)

| Guard | Assertion |
| --- | --- |
| `scripts/bench-seeds.test.mjs:47` | `computeEngineHash(root) === engine-era.json engineHash` |
| `scripts/engine-era-guard.test.mjs:65` | "engine hash … is absent from era 5; append a same-era pin with its cause" |
| `scripts/fixture-teardown.test.mjs:24` | cascade only — it re-runs bench-seeds as a child |

## Reds that are NOT this branch's (measured on this same tree)

| Guard | Why it is environmental |
| --- | --- |
| `scripts/desk-declaration-guard.test.mjs:163` | The guard REFUSES from a linked worktree by design: "this is a linked worktree and its STATUS.md line-1 is NOT the one main carries … Re-run from the main worktree". Deterministic for any lane run; this task never touches STATUS.md. |
| `scripts/node-guards-contention.test.mjs:50` | `spawnSync ps ENOBUFS`. The machine held 1,624 processes during the run (concurrent implementers) and the call sets no `maxBuffer`. Reproduced standalone; unrelated to any file here. Filed as F-GLB-3. |
