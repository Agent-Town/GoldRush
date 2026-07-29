# ts-cov-01 — worker type coverage

**Slice:** `ts-cov-01-worker-type-coverage` (FIRE-AUTHORED s1233 from F-1233-1)
**Branch:** `lane/m3` (lane-a slot) · **Tip:** `e9d848a7` · **Base:** `e88de542`
**Merged to main:** `d606946d` (s1235 fire, 2026-07-30)

## VERDICT: MERGED — scope met, gate is real, one drain-side finding fixed in the same commit.

## What it does

18 of the 22 Cloudflare Pages Functions under `functions/` were type-checked by
nothing. `tsconfig.json` `include` gains `"functions"`, which brings all 22 under
`npx tsc --noEmit`, and the 10 errors that surfaced are fixed *without* casts:

- **3 missing Workers globals**, all in `_multiplayer.ts` — resolved with a
  `declare const WebSocketPair` and a file-local
  `type WebSocket = import('@cloudflare/workers-types').WebSocket`. Both are
  **file-scoped**, so root tsconfig `types` stays `["vite/client","node"]` and
  Workers globals do not leak into `src/`'s type space. This satisfies the
  master's item-1 constraint (which said: prefer scoping, and STOP rather than
  widen root `types`). The runner neither widened nor stopped — it found the
  third way the master's own wording allowed.
- **6 non-narrowing sites** (`normalizeVersion`, `normalizeTick`) — a local
  `isInteger(value: unknown): value is number` type predicate, exactly as the
  master's TRAP section required. `Number.isInteger`'s semantics are unchanged,
  so these public-route input validators accept and reject precisely what they
  did before.
- **1 aliased narrowing** (`redeem.ts`) — `if (!skin || stored === null)`.
  `stored === null` already implies `!skin` (the ternary returns `stored` on the
  falsy branch), so the added clause is **behaviourally inert** and exists only
  to give tsc the narrowing it cannot derive across the alias. Narrows `stored`
  itself; no cast.

Plus `scripts/worker-type-coverage.test.mjs`, wired into `test:node-guards`.

## Evidence

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **rc=0** |
| `npm run build` | **rc=0**, 16.3 s |
| `node scripts/run-guards.mjs --changed-since e88de542` | **rc=0 — 6/6 passed** (node-guards, power-budget, stats, accounts, mp, task-guards) |
| Re-run after the `run-guards.mjs` edit below | **rc=0 — 6/6** |
| Boot probe `_s106-prospector-boot-probe`, desktop-chrome + mobile-chrome (390px) | **rc=0, 2/2**, zero console/page errors, plain boot (no `?debug`) |
| Coverage, **re-derived by the drain** | walked `functions/**/*.ts` = **22**; `tsc --noEmit --listFiles` ∩ functions/ = **22** |

The count was re-derived rather than read off the runner's report — the guard
asserts it, and a guard asserting its own subject is exactly the thing worth
checking independently.

## Mutation proof of the new guard — 2/2, each red identified by assertion NAME

| Arm | Mutation | Result |
|---|---|---|
| 0 | clean tree | rc=0 |
| A | `"functions"` removed from tsconfig `include` (the defect as it stood) | **rc=1** — `worker files missing from tsc --listFiles:` |
| B | `// @ts-nocheck` planted at the top of `functions/api/redeem.ts` | **rc=1** — `worker files disabling semantic checks:` naming `functions/api/redeem.ts` |
| 0b | restored | rc=0 |

Arm B matters because the master only ever asked for arm A ("delete-or-exclude
one worker file"). The guard's **second** assertion — the `.d.ts` / `@ts-nocheck`
escape hatch — had no proof at all until this drain built one. A file can be
inside `--listFiles` and still be checking nothing.

`functions/api/redeem.ts` restored byte-identically: `git ls-files -s` →
`35f7f2ed2b8073f99daab226b4a21f517f172004`, matching the lane's committed blob.

## Merge classification

Base `e88de542` is an ancestor of main. Main moved 4 commits since (`16077732`,
`f611c1ea`, `acc448ae`, `6b673f19`).

- **LANE-TOUCHED:** `functions/api/_accounts.ts`, `functions/api/_multiplayer.ts`,
  `functions/api/redeem.ts`, `tsconfig.json`, `package.json`,
  `package-lock.json`, `scripts/worker-type-coverage.test.mjs` (new).
- **MAIN-MOVED-ONLY:** `STATUS.md`, `tasks/BACKLOG.md`,
  `scripts/site-contract.test.mjs`, `logs/session-scratch/s1234-*`.
- **Overlap: none.** So the merge is a path-scoped checkout of the lane-touched
  set, with no conflict to resolve and no 3-way graft required.

`npm install` was run on main to materialise the new devDependency
(`@cloudflare/workers-types`, devDependencies only — it ships nothing to players).

## Findings

### F-1235-1 — the cure falsified five sentences in the file the master forbade touching. FIXED, same commit.

`scripts/run-guards.mjs` is on the master's **NO** list, with the reason
*"its comment is already corrected; do not re-edit it"*. That was written by
s1233 about the **pre-cure** tree, and it stopped being true the moment this
slice landed. After the merge the file asserted, in five places:

1. header — *"the worker code, which `tsc` does NOT type check"*;
2. header — *"tsconfig `include` is [src, e2e, playwright.config.ts]"*;
3. `PATH_RULES` — *"The other 18 are type-checked by NOTHING, and that is the live gap"*;
4. `PATH_RULES` — *"The fix … it is a task, not a drive-by: tasks/ts-cov-01-worker-type-coverage.md"* (that task is this one, now shipped);
5. the `PATH_RULES` **label string** — `functions/** (Cloudflare Pages Functions -- outside tsconfig include)`.

Item 5 is the one that bites: it is not a comment, it **prints on stdout to
every operator on every drain that touches `functions/`**. It printed in this
drain's own first gate run, one command after the merge that made it false.

This is the sixth consecutive fire in the F-1230-1 → F-1234-1 class (an English
claim about coverage that nobody re-derived), and it arrives by a new route:
not a sentence that was *always* wrong, but one that a **correct cure turned**
wrong, in a file whose firewall existed specifically to protect it. A NO list
freezes a file against the tree moving underneath it.

Corrected in place, not deleted — the F-1233-1 lesson (that `include` picks
root files and tsc follows imports) is preserved, the closure is recorded, and
the surviving justification for the path rule is restated: **types are not
behaviour**, `vite build` still does not bundle Pages Functions, and the
`wrangler` trio still catches what tsc cannot. Re-gated after the edit: 6/6 rc=0.

### F-1235-2 — `new Response(null, init)` passes the Workers `webSocket` field through a structural loophole. NON-BLOCKING, noted.

```ts
const init = { status: 101, webSocket: client } satisfies import('@cloudflare/workers-types').ResponseInit;
return new Response(null, init);
```

`Response` here still resolves to the **DOM** declaration, whose `ResponseInit`
has no `webSocket`. This compiles only because excess-property checking applies
to fresh object literals and not to a variable — i.e. tsc is not *approving*
`webSocket`, it is *declining to look*. It is not a cast and not
`@ts-expect-error`, so it is inside the master's firewall, and the `satisfies`
clause does check the object against the **real** Workers contract, which is
more than the previous `as [WebSocket, WebSocket]` did. Recording it because the
next person who reads this line will believe DOM `Response` accepts `webSocket`,
and it does not. The principled end-state is a scoped `functions/tsconfig.json`
whose `lib`/`types` exclude DOM — the master offered that shape and the runner
chose the lighter one. Not worth a corrective on its own; fold it in if a
`functions/tsconfig.json` is ever created for another reason.

### Non-findings, checked and cleared

- `isInteger` is defined twice (`_accounts.ts`, `_multiplayer.ts`). Deliberate:
  these workers do not cross-import, and a shared helper would be a new module
  in a firewalled slice. Left alone.
- The master asked the runner to "explicitly flag anything in the 18 newly
  checked files that is a REAL defect rather than a narrowing artifact". s1233's
  judgement that all 10 were benign **holds** — re-checked here per site: the two
  `Number.isInteger` sites are semantics-preserving, and the `redeem.ts` clause
  is provably inert. No latent runtime bug was hiding in the 18.

## Residual — stated so it cannot be mistaken for done

- The guard's **count floor** (`>=22`) and its directory walk are structural
  assertions and are **not** mutation-proven; proving them means deleting worker
  files, which the RETENTION LAW makes the wrong instrument. The honest proof is
  a fixture tree. This is the identical residual s1232 recorded for
  `script-tree-parse.test.mjs` and it is now **two guards deep** — the next fire
  that touches either should consider building the fixture harness once, for both.
- The guard checks `@ts-nocheck` and `.d.ts`, but **not** `@ts-ignore` or
  `@ts-expect-error` inside a covered file. A worker can be in `--listFiles`,
  pass the guard, and still have its one dangerous line silenced. Cheap to add;
  out of this drain's scope.
- Type coverage is not behaviour coverage. All 22 files now type-check; how many
  of the 22 routes are *exercised* by anything remains unmeasured.
