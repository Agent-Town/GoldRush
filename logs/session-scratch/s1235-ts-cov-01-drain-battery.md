# s1235 — ts-cov-01 drain battery (mirrored per RETENTION LAW)

Merge: `f8eddce8` (lane/m3 tip `e9d848a7`, base `2d4692f5`). Bookkeeping `b89dc692`.
Pushed `4e46394e`; deployed + VERIFIED at https://gold-rush-3in.pages.dev.

## Independent re-derivation of the coverage claim (not read off the report)

```
npx tsc --noEmit --listFiles   -> rc 0 | functions/*.ts in listFiles: 22
walk functions/**/*.ts         -> 22
```

## Gates

| Command | rc |
|---|---|
| `npx tsc --noEmit` | 0 (3.6 s) |
| `npm run build` | 0 (16.3 s) |
| `node scripts/run-guards.mjs --changed-since 2d4692f5` | 0 — **6/6** |
| same, re-run after the `run-guards.mjs` edit | 0 — **6/6** |
| `npx playwright test e2e/_s106-prospector-boot-probe.spec.ts --project desktop-chrome --project mobile-chrome` | 0 — 2/2, zero console/page errors |
| `--only test:task-guards,test:node-guards` after each ledger edit | 0 — 2/2 |

Battery selection printed by `--changed-since`:
```
base gate: test:node-guards, test:power-budget, test:task-guards
+ test:stats, test:accounts, test:mp <- 3 file(s) in functions/**
```

## Mutation proof of scripts/worker-type-coverage.test.mjs — 2/2

| Arm | Mutation | rc | Red identified by assertion NAME |
|---|---|---|---|
| 0 | clean tree | 0 | — |
| A | `"functions"` removed from tsconfig `include` | **1** | `worker files missing from tsc --listFiles:` |
| B | `// @ts-nocheck` prepended to `functions/api/redeem.ts` | **1** | `worker files disabling semantic checks:` naming `functions/api/redeem.ts` |
| 0b | restored | 0 | — |

Arm B is the drain's addition. The master asked only for arm A ("delete-or-exclude
one worker file"), so the guard's **second** assertion had never been seen to fail.

Byte-identical restore (`shasum`/`git hash-object` are gated for fires, so the
house method): `git status --porcelain functions/api/redeem.ts` shows only the
staged `M` from the merge itself, and `git ls-files -s` gives
`100644 35f7f2ed2b8073f99daab226b4a21f517f172004` — the lane's committed blob,
matching the `index a71d665c..35f7f2ed` header of the runner's own diff.

## F-1235-1 — the five falsified sentences in scripts/run-guards.mjs

The master NO-listed that file (*"its comment is already corrected; do not
re-edit it"*). True of the pre-cure tree; false the moment the slice landed:

1. header — "the worker code, which `tsc` does NOT type check"
2. header — "tsconfig `include` is [src, e2e, playwright.config.ts]"
3. `PATH_RULES` — "The other 18 are type-checked by NOTHING, and that is the live gap"
4. `PATH_RULES` — "it is a task, not a drive-by: tasks/ts-cov-01-worker-type-coverage.md"
5. the `PATH_RULES` **label**, which is not a comment — it printed to stdout in
   this drain's own first gate run, one command after the merge that made it false:
   `functions/** (Cloudflare Pages Functions -- outside tsconfig include)`

All corrected in place; the F-1233-1 measurement is preserved and the path
rule's surviving justification is restated (types are not behaviour).

## Bookkeeping note worth keeping

`tasks/goals.json` was first written with a **short** merge hash. `test:node-guards`
went RED: `goal-tree.mjs` schema check, `The input did not match /^[0-9a-f]{40}$/`.
The guard caught the drain's own error — mergeHash is a guard INPUT, not prose.
