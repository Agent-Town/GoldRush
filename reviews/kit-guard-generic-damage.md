# kit-guard-generic-damage — drain review (s2466)

**Slice:** `kit-guard-generic-damage` (F-WIN-2 option (b), ruled attended 2026-09-03)
**Branch:** `lane/a` · **lane tip:** `76b987a9a9b2bf98142f03660c3ba4681c774150` (`runner(lane-a): kit-guard-generic-damage.md`)
**Base:** `412836942df3ebc6fb25544fc07be741fd4b5d09` · **Merge:** `adacf5e131fcec6df1496671129961e0468a1a46`
**Gated in:** detached worktree `gate-s2466` (§3.0b — undecided content never entered main's tree)
**Tree identity:** the gate's trial-merge tree and main's merge tree are the same object,
`b436a743aea78c3759a9b4ad459c3383af0c7915` — what shipped is byte-identical to what was measured.

## Verdict

**MERGE.** The slice does exactly what the attended ruling asked: it replaces an invariant the runtime
could not support (an arsenal *grant* floor) with one it can state from code (*generic projectile
damage reaches every fielded boss/elite class*), and it guards that. The guard is not a
re-implementation — it lifts the real `CombatSystem.resolveBlastDamage`, `CombatSystem.resolveBoltHits`
and `Enemy.takeDamage` out of the shipped sources through the TypeScript AST, transpiles them, and runs
them against a synthetic enemy per kind. So it measures the damage path that actually ships, and it
rots the moment that path does.

One non-blocking coverage finding (F-2466-1) and one informational finding about the runner's own
headline (F-2466-2) are recorded below. Neither blocks: the guard is a strict improvement over no
guard, and F-2466-1 narrows a claim rather than falsifying one.

## What it does

`scripts/kit-guard.test.mjs` reads the 36 door contracts published by `public/skill.md`, derives every
enemy kind each one fields (`twist.enemyRoster`, `twist.baron` and its components, plus the three
scripted boss systems), and for each kind fires a rig bolt and a blast charge through the real combat
code, asserting `bolt > 0 || blast > 0`. It prints a `kind | bolt | blast | evidence` table with
`file:line` provenance per row. Today: **36 door contracts, 84 fielded contract-kind paths, 46 distinct
damage rows**; the table is uniform `yes/yes` except the authored non-zero scales
(`baron_railcar:boiler ×0.7`, `:wheels ×0.8`, `:cabin ×0.85`, `rail_tough ×0.65` on bolt, and
`old_digger:hull ×0.05` on both). Wired into `test:node-guards`.

The header states its own boundary, correctly: this is a generic-damage guard, not an arsenal guard.
E2 railcars pass because ordinary bolts reach them; the 2026-08 incident was a **locked** pressure
arsenal, which this guard does not and cannot measure.

## Evidence

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | rc=0, 4.8 s |
| `npm run build` | rc=0, 16.7 s |
| `scripts/kit-guard.test.mjs` (focused) | **36 tests / 36 pass / 0 fail**, 0.26 s |
| `npm run test:node-guards` (merged tree, run ALONE) | **607 tests / 602 pass / 0 fail / 5 skipped**, rc=0, **1264.8 s** |
| `test:power-budget` | PASS, p95 **0.329 ms** (cap 0.500) |
| `test:task-guards` | PASS |
| Rendering / boot probe | **not taken, and here is why:** the diff is a new test file, a `package.json` scripts-line wire, and one BACKLOG row. Zero runtime code, zero assets, zero e2e. `npm run build` green is the whole surface a player could reach. |

`test:node-guards` was run **alone** (F-2462-1: a contended battery manufactures findings). Load
average at start 4.15, no other battery or lane runner active.

### Teeth — re-derived independently of the runner (F-2462-3)

Each defect was manufactured on the merged tree, measured, then reverted, with the tree confirmed
clean afterwards. The control asserts its own validity first (F-2215-1).

| Arm | Result |
|---|---|
| CONTROL (unmutated) | 36 tests / **36 pass** / 0 fail |
| `Enemy.takeDamage` → no-op (total immunity) | **31 of 36 red** |
| `rail_tough` immune to both bolt and blast | **exactly 4 red**: `e2-hill-mine`, `e2-incline`, `e2-pressure-garden`, `e2-trestle` |

Arm B reproduces the runner's claimed mutation proof **exactly**, contract for contract, which is the
strongest evidence available that its report describes the artifact it shipped. Arm A is what surfaced
F-2466-1.

## Merge classification

Base `412836942`, one ahead-commit, three files. Merged with `git merge --no-ff` as a single act — never
`--no-commit` (F-1589-5: a merge left staged on main is swept by concurrent writers).

| File | Class | Resolution |
|---|---|---|
| `scripts/kit-guard.test.mjs` | **NEW / LANE-ONLY** (251 lines) | free |
| `package.json` | **BOTH-MOVED** (1 added line) | auto-merged (`ort`), then verified by **set difference**: main 90 guard leaves, lane 91, merged 91 — **zero lost from either side**, exactly one addition (`scripts/kit-guard.test.mjs`) |
| `tasks/BACKLOG.md` | **BOTH-MOVED** (1 changed line) | auto-merged, verified by **F-ID set difference**: main 2451, lane 2446, merged 2451 — **zero lost from either side**, lane's row edit present |

Both BOTH-MOVED files were checked by set difference rather than by eyeballing the hunks, because "both
sides kept" is a claim about *content*, and a union-shaped row check scores lawful retirements as loss.

## Findings

### F-2466-1 — five of the guard's 36 door-contract tests assert nothing, and pass. NON-BLOCKING; coverage is 31, not 36.

Surfaced by teeth arm A: under **total** immunity (`Enemy.takeDamage` made a no-op) the guard reds only
**31 of 36** contracts. The five survivors are `e1-drill-yard`, `e1-dry-gulch`, `e1-night-shift`,
`e1-twin-banks` and `the-claim` — and they survive because they field **zero** kinds through
`twist.enemyRoster` / `twist.baron`. `e1-drill-yard`'s entire twist is `{"secureWave":0}`. So
`fieldedKinds()` returns `[]`, the inner loop registers **no assertion at all**, and `node --test`
reports the test as passing. Measured directly against the manifests: exactly those five door
contracts field zero kinds by that key, matching the five survivors one for one.

⚖️ **Severity stated honestly and deliberately not inflated.** This is **not** a false green about
damage: those contracts do field enemies at runtime, through a default roster their manifest simply
does not express, and nothing is broken. Realised cost is **zero**. What earns it an F-ID is the
**direction and the declaration**: the guard's own footer prints *"36 door contracts"*, and the BACKLOG
row it ships says *"all 36 door contracts"* — both overstate the asserting set by five, and a future
contract that fields kinds through some third key would join the silent set without anyone being told.
This is the shape this factory has spent twenty fires curing (F-2208-1, F-2217-1): a subject set that
empties without throwing, in a test that reports success.

🛠️ **Cure (unclaimed, small, and deliberately not done here):** assert `doorIds.length > 0` so an empty
door list refuses rather than passes vacuously, and have the after-hook **declare** the per-contract
kind counts — naming any contract that contributed zero — on the happy path too (F-2208-1: a
declaration that appears only on failure re-creates the ambiguity it removes). ⚠️ **Do NOT make a
zero-kind contract a hard red.** It is a lawful state today for five of them, so that guard would fire
on ordinary correct operation and be excused into uselessness inside a week (F-1460-1, the
`cross-engine` fate). Declare, do not refuse.

🚫 Not fixed in this drain on purpose: the master is attended-authored, its firewall scopes the guard
to what the ruling asked for, and a fire widening another writer's fresh slice mid-drain is the
firewall violation the house law names. It is one small slice for whoever picks it up.

### F-2466-2 — the runner reported two battery failures; neither reproduces on the merged tree. NON-BLOCKING, informational.

The run log's headline reads *"607 tests; 603 passed, 2 skipped, 2 unrelated failures"*, attributing one
to a fix already on newer main (`abd341f84`, art-staging teardown) and one to a load-sensitive Moth
test. Re-run on the **merged** tree, **alone**: **607 tests, 602 pass, 0 fail, 5 skipped, rc=0.** Both
reds were the lane's shell — one staleness (cured by merging onto current main), one contention.

⚖️ No action owed and no criticism implied: the runner diagnosed both correctly and said so. It is
recorded because it is a second live confirmation of **F-2462-3** — contention inflates red counts on
*both* sides of a handoff, so the drain's own re-run is a free control on a runner's headline, and a
runner's reds are a claim (Mistake #4) exactly as its greens are.

### Declared boundaries (not defects)

- The probe stubs `canDamageEnemy: () => true`. That is the **shipped default** — `CombatSystem.ts:178`
  declares it as an injected constructor dependency defaulting to `() => true` — so the stub matches
  the baseline rather than masking a per-kind refusal. A phase-gated injection from `Game.ts` would sit
  outside this guard, which its header already scopes out.
- The guard measures damage *reachability*, never balance, range, aim, grants or unlocks. Its header
  says so. F-WIN-2 option (a) — a standalone pressure-arsenal floor — remains a separate, later slice
  and is unaffected by this merge.
