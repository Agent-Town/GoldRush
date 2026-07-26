# Task lane-town-glob-collection: FOUR SPECS THAT CANNOT BE COLLECTED, AND AN ABORT THAT READS AS A QUIET RUN (LANE-A, commit prefix "fix:")

**FIRE-AUTHORED (attended review welcome) — s1092, 2026-07-26. This is F-1081-6, recorded by s1081 and RE-MEASURED PER-SPEC by s1092 before authoring — which corrected the recorded hazard list in BOTH directions (see WHY). It is a gate-integrity defect, the same family as rf-27..rf-30: a signal that misleads the reader.**

You are Codex (worktrees/lane-a).
CODEX: model=gpt-5.6-sol effort=high

> ⚠️ The `CODEX:` line above is at **column 0 on its own line** deliberately (F-1088-4). `scripts/lane-runner-v3.sh` greps `^CODEX:`, so an inline copy is silently ignored and the run falls back to `effort=medium`.

## WHY (the evidence chain, dated)

`src/town/townLayout.ts:53` holds a module-scope eager glob:

```ts
const townEraPropManifests = import.meta.glob('../../assets/pilots/plaza-props-3d/era-props.e*.json', {
  eager: true,
  import: 'default',
}) as Record<string, TownEraPropManifest>;
```

`import.meta.glob` is a **Vite** construct. Playwright transforms specs with its own Node-side TS
pipeline, where it does not exist. Any spec whose **static** import graph reaches `townLayout`
therefore dies at collection:

```
Total: 0 tests in 0 files
TypeError: (intermediate value).glob is not a function
   at ../src/town/townLayout.ts:53
Error: No tests found.
```

⚠️ **The reason this outranks four broken specs: the output carries NO `N passed` / `N failed` line
at all.** A gate that tails the log sees no failures and can read the run as green. s1081 hit
exactly this — a town battery printed nothing and only a raw-output read revealed why.

### ✓ s1092 re-measured this per spec, and the recorded list was wrong in both directions

s1081 recorded five specs. Measured on clean main at `b78234a3` with `npx playwright test --list`,
one spec at a time:

| Spec | Measured | Why |
|---|---|---|
| `e2e/cast-motion-wiring.spec.ts` | **ABORTS** (rc 1, 0 tests) | ⚠️ **NOT in s1081's list — new hazard since** |
| `e2e/ts-01-plaza-ground.spec.ts` | **ABORTS** (rc 1, 0 tests) | static `import { townPlazaLayout }` |
| `e2e/town-t5-townsfolk.spec.ts` | **ABORTS** (rc 1, 0 tests) | via `townsfolk.ts:5` → `townLayout` |
| `e2e/ts-04-living-pass.spec.ts` | **ABORTS** (rc 1, 0 tests) | static `import { townTrail }` |
| `e2e/safari-swap.spec.ts` | **✅ collects 4 tests, rc 0** | 📌 s1081 listed it as carrying the hazard. **It does not.** |
| `e2e/never-trap.spec.ts` | **✅ collects 6 tests, rc 0** | 📌 same — **it does not.** |

**The two false positives dodge it for a real reason worth preserving:** they reach `townLayout`
only through a **browser-side** `await Function('return import("/src/town/townLayout.ts")')()` —
which Vite serves, not Playwright's transform — plus a **type-only** `typeof import('...')`, which
erases at compile. That is the shape that already works; do not "fix" them.

**So the hazard set is FOUR, and one of the four is newer than the finding.** That is the point of
re-measuring rather than inheriting: the list rots in both directions.

### The fix is unusually contained — s1092 traced it

The glob feeds **exactly one** export, `townEraPropsForOrder` (`townLayout.ts:85`), whose only
reference to the glob is `townLayout.ts:87`. Its **only** consumers are two runtime-only modules:

- `src/town/TownScene.ts` (imported at `:72`, used at `:133`, `:2726`)
- `src/town/TownTavernPilot.ts` (imported at `:5`, used at `:44`, `:533`)

✓ **Verified: no spec imports either module statically** (`grep` over `e2e/` returned nothing).
And everything the four broken specs actually need — `townTrail`, `townPlazaLayout`,
`townEraPropFootprints`, the types — is **glob-independent**.

⇒ Moving the glob out of `townLayout` fixes all four without touching a single spec.

## PRE-FLIGHT — verify by CONTENT, never by counting (SAFE-DUPE)

⚠️ **`git log main..lane/m3` WILL PRINT ONE COMMIT (`1c68c68f runner(lane-a): lane-rehearsal-unset-guard.md`), AND THAT IS EXPECTED — IT IS *NOT* A REASON TO STOP.** That commit is rf-28, **drained to main as `8fb97691`**. ✓ s1092 re-verified it independently: `1c68c68f` changed exactly one file, `scripts/rehearsal-base.test.mjs`, and `git diff main lane/m3 -- scripts/rehearsal-base.test.mjs` is **empty** — byte-identical. The branch carries nothing main lacks. It is **FALSE-AHEAD**; an ahead-count is not a drain signal (F-1066-1 / F-1073-1, and s1091 caught this same illusion on three separate lanes in one week).

All four must hold before you touch a file:
1. `git log --oneline main..lane/m3` prints **exactly `1c68c68f` and nothing else.** A **second** commit would be undrained work — **only then STOP and report.**
2. `grep -c "import.meta.glob" src/town/townLayout.ts` on main → **must print `1`.** If it prints `0`, someone has already landed this and the premise is gone — STOP and report.
3. `npx playwright test --list e2e/ts-04-living-pass.spec.ts` on main → **must fail with `glob is not a function`.** If it collects, the ground moved — STOP and report.
4. `grep -rn "townEraPropsForOrder" src e2e scripts` → **must show consumers ONLY in `townLayout.ts`, `TownScene.ts`, `TownTavernPilot.ts`.** A fourth consumer means a wider blast radius than this master scoped — STOP and report.

If all four hold, start from fresh main (`git checkout -B lane/m3 main`) — `1c68c68f` is safe to leave behind.

## READ FIRST (in your worktree, before writing anything)

- `src/town/townLayout.ts` — at minimum lines 36–92. Note `TownEraPropManifest` (`:39`) is **module-private, not exported**, so it moves wholesale with the glob. `TownEraPropDescriptor` (`:45`) **is** exported and is used elsewhere — it **stays**.
- `src/town/TownScene.ts:72` and `src/town/TownTavernPilot.ts:5` — the two import sites you will re-point.
- `e2e/safari-swap.spec.ts:40` and `e2e/never-trap.spec.ts:107` — read these to understand the pattern that *already works*, so you do not disturb it.

## SCOPE (numbered; each item is checkable)

1. **Create `src/town/townEraProps.ts`.** Move into it, unchanged in behaviour: the private
   `TownEraPropManifest` type (`townLayout.ts:39`), the `import.meta.glob` block (`:53`), and the
   `townEraPropsForOrder` function (`:85`). Keep the glob pattern string **byte-identical** — the
   keys at `:87` are literal paths and a changed relative depth silently yields an empty manifest
   map and **no error**. ⚠️ If the new file sits at the same directory depth the pattern is
   unchanged; **verify that, do not assume it.**

2. **Import the types it needs from `townLayout` with `import type`.** `TownEraPropDescriptor` is
   the one you need. A **type-only** import erases at compile, so this creates **no runtime import
   cycle** even though `townLayout` and `townEraProps` reference each other conceptually. Do not
   use a value import here.

3. **Delete the glob, the private type, and `townEraPropsForOrder` from `townLayout.ts`.** Leave
   every other export untouched — `townEraPropFootprints` (`:58`) in particular **stays**, it is a
   plain literal with no glob dependency. After this, `grep -c "import.meta.glob" src/town/townLayout.ts` → **0**.

4. **Re-point the two consumers** (`TownScene.ts:72`, `TownTavernPilot.ts:5`) to import
   `townEraPropsForOrder` from `./townEraProps`. Both files import **other** things from
   `townLayout` as well — those imports **stay where they are**; split the import statement, do not
   move unrelated names.

5. **Add a guard so this cannot regress silently, in the house style** (`scripts/*.test.mjs`,
   subprocess, wired into `test:node-guards` — the rf-28/29/30 pattern). Create
   `scripts/town-spec-collection.test.mjs` with **one** test that spawns
   `npx playwright test --list` over the **four** specs named in the WHY table and asserts:
   - exit status **0**, and
   - stdout matches `/Total: [1-9]\d* tests/` (a **non-zero** total — `Total: 0 tests` is the bug), and
   - stderr does **not** match `/glob is not a function/`.

   ⚠️ **Assert the non-zero total, not merely rc 0.** A one-sided assertion is exactly how rf-29's
   guard went blind (F-1091-1) and this task's whole family is about guards that do not check the
   claim they are named for.

6. **`package.json`: wire the new guard into `test:node-guards` if and only if it is not picked up
   automatically.** Check how `scripts/probe-base.test.mjs` is wired before editing — if the script
   globs `scripts/*.test.mjs`, **change nothing** and say so. Report the `node --test` phase count
   before and after (it is **57** on main today).

7. **MUTATION CONTROL — mandatory.** Temporarily restore the `import.meta.glob` line into
   `townLayout.ts` (a one-line paste is enough to reproduce the abort; you do **not** need to move
   the whole function back). Re-run your new guard.
   - **Your guard MUST go RED**, and the failure must be the collection abort, not a timeout.
   - **Quote the red output.**
   Then **revert**, prove it with `git diff -- src/town/townLayout.ts` showing your intended change
   only, and re-run to green. **A guard you have not watched fail is not evidence** — that is the
   lesson of rf-28, and F-1091-1 is what happens when it is skipped.

8. ⚠️ **THE FOUR SPECS HAVE NEVER RUN. EXPECT THEM TO FAIL, AND REPORT IT — DO NOT FIX IT.**
   They have been uncollectable, so nothing has been exercising them and they may have rotted
   against the current town code. **Run all four** and report each one's real pass/fail counts.
   - Specs that **pass**: say so with numbers.
   - Specs that **FAIL**: this is a **FINDING, not your scope.** Write down the spec, the assertion,
     and the error. **Do NOT edit any `e2e/` file to make it pass**, and do **not** edit `src/town/`
     beyond scopes 1–4 to accommodate them. A failing newly-collectable spec is a *discovery* this
     task paid for; bending scope to hide it would waste it.
   - Merging is **still correct** with newly-revealed reds, provided they are honestly reported and
     attributed — they are pre-existing conditions this task merely *exposed*, not regressions it
     caused. Say which is which, with evidence.

## TOUCH-ONLY

- `src/town/townEraProps.ts` (new)
- `src/town/townLayout.ts` (scope 3 removals only)
- `src/town/TownScene.ts` (the import line only)
- `src/town/TownTavernPilot.ts` (the import line only)
- `scripts/town-spec-collection.test.mjs` (new)
- `package.json` — **only** under scope 6, and only if the guard is not auto-globbed

## NO (firewall — report, do not fix)

- ❌ **Any file under `e2e/`.** Including the four broken specs (scope 8) and *especially*
  `safari-swap.spec.ts` / `never-trap.spec.ts`, which already work.
- ❌ `src/town/townsfolk.ts` — its `townLayout` import is legitimate and stays.
- ❌ Any other `import.meta.glob` in the repo. If you find more, **list them in your report** as a
  follow-up rung; do not migrate them here.
- ❌ Playwright config changes. The finding named a Vite-transforming config as an *alternative*
  fix; this master rules for the module-boundary fix instead, because it is smaller, needs no new
  tooling, and leaves the two already-working specs alone.
- ❌ The ticker `StatsEndpointReadError` (**F-1088-1**) — see self-check.

## SELF-CHECK (run these exact things; report real numbers)

1. `npx tsc --noEmit` → **exit 0.** ✅ **Cite it — it is real coverage here**, unlike rf-30: `tsconfig.json` includes `src`, and this slice is entirely `src/` plus one script (F-1087-1 only bites for `scripts/`-only slices).
2. `npm run build` → **exit 0.** The glob must still resolve under Vite — a build that succeeds but yields **empty** era props would be a silent regression, so also confirm the era props still appear (scope 9).
3. `npm run test:node-guards` → report the **`node --test` phase** count (57 on main → 58 expected with your guard).
   ⚠️ **The command's OVERALL exit code is `1` on main today and that is NOT your slice** — the pre-existing ticker `StatsEndpointReadError` (F-1088-1) fires after the node phase. **Judge by the phase counts, never the overall rc.**
4. **The four specs, run for real**, per scope 8, with honest per-spec numbers.
5. **The adjacent town battery** — the suites that already pass must stay passing. Run `safari-swap` and `never-trap` explicitly (4 and 6 tests respectively on main today) and confirm they are **unchanged**.
6. Quote the scope-7 mutation control in full: the red, and the revert.

9. **Prove the era props still render.** The glob's whole job is loading era prop manifests; a
   wrong relative path yields an empty map **with no error**, so tsc and build would both stay
   green while the town quietly lost its props. Assert `townEraPropsForOrder(10).length > 0`
   (or an equivalent measured check) and **report the number**, before and after.

READY-FOR-GATES + report: the `node --test` phase count 57 → 58, the four specs' real pass/fail numbers with any newly-revealed reds clearly attributed as pre-existing-and-exposed, the mutation control's red and revert, the era-prop count from scope 9, whether `package.json` needed touching, and any further `import.meta.glob` sites you found and left alone.
