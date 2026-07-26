# Task lane-runsuspend-decoder-hoist: `npm test` HAS COLLECTED ZERO TESTS FOR NINE DAYS, AND ONE IMPORT EDGE IS WHY (LANE-A, commit prefix "fix:")

**FIRE-AUTHORED (attended review welcome) — s1094, 2026-07-27. This is F-1093-4's family, but it is NOT the `import.meta.glob` sweep that finding proposed. s1094 pointed rf-31's instrument at the whole suite and found something larger and worse: the project's headline test command is dead, and 50 tests in three specs have been silently uncollectable since 2026-07-18.**

You are Codex (worktrees/lane-a).
CODEX: model=gpt-5.6-sol effort=high

> ⚠️ The `CODEX:` line above is at **column 0 on its own line** deliberately (F-1088-4). `scripts/lane-runner-v3.sh` greps `^CODEX:`, so an inline copy is silently ignored and the run falls back to `effort=medium`.

## WHY (the evidence chain, dated — every number below was measured by s1094 on main at `d9facd86`)

rf-31 (`a222242f`, s1093) landed a guard proving four town specs collect. Its follow-up finding said:

> 📌 **F-1093-4 (follow-up rung, not queued):** the runner found and correctly left alone **27 other `import.meta.glob` sites across 17 source files** — any on a spec's static import graph is the same latent defect, and **the guard landed here is already the instrument to measure which.**

✓ **s1094 re-verified the count** (`28` glob sites across `18` files, minus the one rf-31 moved = **27 across 17** — the finding is accurate). But rather than trace 27 sites by hand, s1094 pointed the instrument at **the whole suite**, which answers the question directly. **It did not return the expected answer.**

### The measurement

```
npx playwright test --list          →  exit 1,  Total: 0 tests in 0 files
```

⚠️ **`package.json:11` defines `"test": "playwright test"`. So `npm test` — the project's headline command — collects nothing and exits 1.** It is the *only* caller of the unfiltered suite (✓ grepped: no script or CI path invokes it), which is exactly why nine days passed unnoticed: **every gate in this repo runs named specs**, and named specs mostly work.

The error is **not** `glob is not a function`. It is:

```
TypeError: Module ".../assets/layer-contracts/m1-core.layer-contract.v1.json?raw"
           needs an import attribute of "type: json"
```

⇒ **same family as F-1081-6, different Vite-only construct**: a `?raw` import (`src/world/Terrain.ts:2`) that node cannot parse when Playwright collects a spec whose **static** import graph reaches it.

### Which specs, and the chain

s1094 bisected all 331 specs (8 chunks → per-file). **Exactly three** fail to collect, and they fail **individually too**, not only in aggregate:

| spec | tests it should contribute |
|---|---|
| `e2e/m3-01-run-scaffold.spec.ts` | **8** |
| `e2e/m4-08-agent-attribution.spec.ts` | **6** |
| `e2e/restore-validation.spec.ts` | **36** |

All three share **one** chain, traced by static-import walk:

```
<spec> → src/game/RunManager.ts → src/game/RunSuspend.ts
       → src/systems/HomemakerBossSystem.ts → src/world/Terrain.ts  (?raw JSON)
```

(`restore-validation` enters at `RunSuspend` directly, skipping `RunManager`. Same edge.)

📌 **The load-bearing edge is `RunSuspend.ts:17`, and it is an anomaly on its own line.** `RunSuspend.ts` imports **four** other boss/system snapshot types — `CombatSystem`, `CrawlerBossSystem`, `WrangleSystem`, `HarvestSystem` (`:12–:16`) — and **every one of them is `import type`**, which erases at compile and drags nothing. Only Homemaker is a **value** import:

```ts
import {
  decodeHomemakerBossSuspend,          // ← the value; this is the edge
  type HomemakerBossSuspendSnapshot,
} from '../systems/HomemakerBossSystem';
```

`decodeHomemakerBossSuspend` is a **pure decoder** — no THREE, no Terrain, no DOM. It sits in an 840-line render-heavy system module that imports Terrain for `Terrain.visualY` at `:537`. **The decoder pays for the renderer's imports.**

### 🔬 MUTATION CONTROL — s1094 ran it, and it is the proof this slice rests on

s1094 temporarily replaced that value import with a type-only import plus a `() => null` stub, re-listed, then restored the file (✓ verified byte-identical afterward; `git status` showed `src/` clean):

| | before | after cutting the edge |
|---|---|---|
| `m3-01-run-scaffold` | exit 1, **0 tests** | exit 0, **8 tests** |
| `m4-08-agent-attribution` | exit 1, **0 tests** | exit 0, **6 tests** |
| `restore-validation` | exit 1, **0 tests** | exit 0, **36 tests** |
| **whole suite** | exit 1, **0 tests in 0 files** | exit 0, **2376 tests in 330 files** |

➡️ **One edge. 50 tests, and the entire suite listing, restored by cutting it.** This is not a guess about the fix direction — the fix direction is measured.

### When it broke

Both edges (`RunSuspend → HomemakerBossSystem` **and** `HomemakerBossSystem → Terrain`) landed in **one commit, `c93fffd6`, 2026-07-18T02:37+07:00, `runner(lane-a): lane-a-e6-boss-homemaker.md`** (✓ `git log -G`, both files). **Nine days.** M4-08 agent attribution is a signed-off milestone surface per `CLAUDE.md` §9; its spec has contributed zero tests since.

⚠️ **Collection is not greenness.** These three specs have not *run* in nine days and may have rotted independently. **Newly-revealed reds are a FINDING to report and attribute — never something to fix by editing `e2e/`.** (Same standing warning rf-31 carried; it proved correct there, and F-1093-3 turned three of those specs into F-1084-1 members.)

## PRE-FLIGHT — verify by CONTENT, never by counting (SAFE-DUPE)

⚠️ **`git log main..lane/m3` WILL PRINT ONE COMMIT (`37712b82 runner(lane-a): lane-town-glob-collection.md`), AND THAT IS EXPECTED — IT IS *NOT* A REASON TO STOP.** ✓ s1094 re-measured it per file this fire: that commit **is rf-31**, which merged to main as `a222242f`. Its two-dot diff vs main is **9 files, and not one of them is under `src/` or `e2e/`** — they are `STATUS.md`, four `logs/*`, `reviews/rf-31.md`, `tasks/BACKLOG.md`, `tasks/goals.json`, and the rf-32 master, i.e. **bookkeeping that main owns and has moved past**. The `worktrees/lane-a` tree is ✓ **clean**. The branch is **FALSE-AHEAD**; a reset is **loss-free**. An ahead-count is not a drain signal (F-1066-1 / F-1073-1 — it misled on three separate lanes in one week).

⚠️⚠️ **ORDER MATTERS (F-1093-5, s1093, learned the hard way one fire ago).** The premise checks below describe **main's** content. Running them on an un-reset lane measures a stale tree and STOPs the run for the wrong reason. **So: lane-safety first, then the reset, then the premise checks on the fresh tree.**

### STEP 1 — lane safety (on the branch as it stands, BEFORE any reset)

`git log --oneline main..lane/m3` must print **exactly `37712b82` and nothing else.** A **second** commit would be undrained work — **only then STOP and report.**

### STEP 2 — reset to fresh main

`git checkout -B lane/m3 main`. `37712b82` is safe to leave behind, per the loss-free measurement above.

### STEP 3 — premise checks, **on the freshly-reset tree** (all four must hold; each describes **main**)

If any fails **now**, the ground genuinely moved under this master — **STOP and report.**

1. `npx playwright test --list` → must exit **1** and print **`Total: 0 tests in 0 files`**. ⚠️ **This is the defect itself. If it already collects 2376 tests, someone landed this and the premise is gone.**
2. `grep -n "decodeHomemakerBossSuspend" src/game/RunSuspend.ts` → must print **`17`** and **`1183`**. ⚠️ If line 17 reads `import type {` rather than a bare `import {`, you are on a tree where this is already fixed.
3. `grep -n "^import \* as Terrain" src/systems/HomemakerBossSystem.ts` → must print **`19`**. That is the import the decoder is paying for.
4. `grep -n "^const COMPONENT_IDS" src/systems/HomemakerBossSystem.ts` → must print **`23`**. ⚠️ **This one is the trap — read the scope-2 warning before you touch it.**

## READ FIRST (in your worktree, before writing anything)

- `src/systems/HomemakerBossSystem.ts` — **`:22–:24`** (`ACT1_IDS`, `COMPONENT_IDS`, `type ComponentId`), **`:43–:61`** (`HomemakerBossSuspendSnapshot`), and **`:673–:760`** — the decoder plus its six private helpers, one contiguous block at the end of the file.
- `src/game/RunSuspend.ts:12–20` — the import cluster. **Note that all four sibling boss/system snapshots are `import type` and only Homemaker is a value import.** That asymmetry is the whole defect.
- `src/game/RunSuspend.ts:87` and `:1183` — the only two use sites in the file.
- `reviews/rf-31.md` — the precedent. This slice is the same shape (hoist a small pure thing out of a Vite-heavy module), and its rulings about back-references and one-sided assertions apply here verbatim.

## SCOPE (numbered; each item is checkable)

1. **Create `src/systems/homemakerBossSuspend.ts`** and MOVE into it, wholesale and byte-identical in body:
   - `ACT1_IDS` and `COMPONENT_IDS` (`:22–:23`) and `type ComponentId` (`:24`);
   - `export type HomemakerBossSuspendSnapshot` (`:43–:61`);
   - the six private helpers `isRecord`, `finitePoint`, `integerBetween`, `timer`, `componentArray`, `stringArray` (`:723–:760`);
   - `export function decodeHomemakerBossSuspend` (`:673–:721`).

   ✓ **s1094 verified this block is self-contained:** all six helpers are referenced **only** by the decoder (measured per-helper across the whole file — every non-definition reference falls inside `673–760`), and the block's only external dependency is `Balance` (`Balance.steal.pickupCap`, `Balance.homemaker.partsStackCap`). ✓ **`src/game/Balance.ts` does NOT reach `Terrain.ts`** — s1094 walked its static graph. So the new module imports `Balance` and **nothing else**.

2. ⚠️ **`COMPONENT_IDS` MUST MOVE, NOT BE IMPORTED BACK — THIS IS THE TRAP THAT WOULD MAKE THE WHOLE SLICE A NO-OP.** `componentArray` uses `COMPONENT_IDS` as a **runtime value** (`:741`, `:742`), not just as a type. If the new module imports it *from* `HomemakerBossSystem.ts`, the new module back-imports the render-heavy module, **re-drags `Terrain.ts`, and collection stays broken while `tsc` and `build` both stay green.** rf-31 hit this exact class and solved it by making its back-reference `import type`; **here the value is a runtime const, so `import type` is not available and the constant must MOVE.**

   ⇒ Direction of dependency after this slice: `HomemakerBossSystem.ts` **imports from** `homemakerBossSuspend.ts`. **Never the reverse.** (`HomemakerBossSystem` may keep a value import — it already drags Terrain for its own rendering and no spec collects it statically.)

3. **Update `src/systems/HomemakerBossSystem.ts`** to import back what it still uses: `ACT1_IDS`, `COMPONENT_IDS`, `ComponentId` (used at `:222`, `:244`, `:374`, `:495`, `:508`, `:616`, `:665`, `:751` and in several field types) and `HomemakerBossSuspendSnapshot` (`:282`, `:306`). **Re-export `decodeHomemakerBossSuspend` and `HomemakerBossSuspendSnapshot` from `HomemakerBossSystem.ts`** so no other consumer can break.
   - ✓ s1094 measured that **`src/game/RunSuspend.ts` is the only external consumer of either export** (`grep -rn` across `src/` and `e2e/`), so the re-export is belt-and-braces, not load-bearing. Keep it anyway; it costs one line and makes the move invisible to future callers.

4. **Re-point `src/game/RunSuspend.ts:17–20`** at `'../systems/homemakerBossSuspend'`. Leave the four sibling `import type` lines exactly as they are. **Change no logic** — `:87` and `:1183` keep their current text.

5. **Add a node guard `scripts/whole-suite-collection.test.mjs`**, modelled on `scripts/town-spec-collection.test.mjs` (rf-31's, which is the house pattern), and register it in `package.json`'s `test:node-guards` list.

   ⚠️ **THE ASSERTION MUST BE TWO-SIDED, AND THIS IS WHY (F-1091-1, rf-29's guard went blind on exactly this).** Assert **all three**:
   - `result.status === 0`;
   - `result.stdout` matches `/Total: [1-9]\d* tests/` — a **non-zero collected total**, never merely rc 0;
   - `result.stderr` does **not** match `/needs an import attribute|glob is not a function/`.

   Run it as `npx playwright test --list` with **no spec arguments** — the whole suite is the point. ⚠️ **Do NOT hard-code the number 2376.** It changes every time anyone adds a test, and a guard that must be edited on every unrelated merge gets deleted. Assert non-zero.

6. **Mutation control (mandatory, and you must watch it go RED).** After the guard is green: temporarily revert scope 4 — put the value import in `RunSuspend.ts` back to `'../systems/HomemakerBossSystem'` — re-run **only** your new guard, and confirm it **fails**. Then restore, and confirm the file is byte-identical to your fixed version (`git diff` empty against your own commit-in-progress) and the guard is green again.

   ⚠️ **The red must be on the collection assertion** — `Total: 0 tests in 0 files` and/or the `needs an import attribute` stderr match — **not** a timeout, not a missing-binary error. If it reddens for a different reason, your guard is measuring something else; say so.

## TOUCH-ONLY

- `src/systems/homemakerBossSuspend.ts` (new)
- `src/systems/HomemakerBossSystem.ts`
- `src/game/RunSuspend.ts`
- `scripts/whole-suite-collection.test.mjs` (new)
- `package.json` (the `test:node-guards` line **only**)

## NO (firewall — report, do not fix)

- ❌ **Do NOT edit anything under `e2e/`.** Not one file, not one line. The three specs have not run in nine days; if they are red once they collect, that is a **finding to attribute**, not a thing to repair here. (rf-31's identical firewall held and was the reason its attribution was clean.)
- ❌ **Do NOT touch `src/world/Terrain.ts` or its `?raw` import.** The `?raw` import is legitimate under Vite. The defect is the *chain*, not the construct.
- ❌ **Do NOT change the Playwright config to transform `src/` through Vite.** rf-31 ruled explicitly for the module-boundary fix over that alternative; this slice inherits the ruling. It is bigger, adds tooling, and would mask the class rather than fix it.
- ❌ **Do NOT touch the other 27 `import.meta.glob` sites.** F-1093-4's sweep is a separate rung. If your new whole-suite guard is green, **none of them is currently on a spec's static graph** — which is itself the answer F-1093-4 asked for, and worth one sentence in your report.
- ❌ **Do NOT "harmonise" the four sibling `import type` lines in `RunSuspend.ts:12–16`.** They are already correct and are the reference shape.
- ❌ **Do NOT fix any unrelated red** you meet. Report it with evidence.

## SELF-CHECK (run these exact things; report real numbers)

1. `npx tsc --noEmit` → **exit 0.** ✅ **Cite it — it is real coverage here.** `tsconfig.json` includes `src`, and this slice's source changes are entirely `src/`. ⚠️ **But say plainly that it does NOT cover your new `scripts/*.test.mjs`** — `scripts/` is outside tsconfig (F-1087-1). Do not let `tsc` stand as evidence for the guard.
2. `npm run build` → **exit 0**, report the time.
3. **The headline number**: `npx playwright test --list` → report **exit code and the full `Total:` line**. Expect **exit 0** and **~2376 tests in 330 files** (s1094's measured figure on `d9facd86`; a small drift is fine and expected, zero is not).
4. **The three recovered specs — LIST then RUN.** For each of `e2e/m3-01-run-scaffold.spec.ts`, `e2e/m4-08-agent-attribution.spec.ts`, `e2e/restore-validation.spec.ts`: report the collected count (expect **8 / 6 / 36**), then **actually run them**, both projects (desktop + mobile-390), `--workers=1`, and report passed/failed. ⚠️ **These have not run in nine days. Reds here are EXPECTED-POSSIBLE and are a FINDING** — attribute each one (pre-existing-and-exposed vs slice-caused) with evidence, and **do not fix them by editing `e2e/`.**
5. **Adjacent suites** — run and report, both projects: `e2e/run-suspend.spec.ts` (the suite that covers the `RunSuspend` decode path you re-pointed) and `e2e/e6-boss-homemaker.spec.ts` (the module you split). A red in either is a **real regression** and must be attributed, not waved through.
6. **Plain-boot console probe**, desktop 1280×800 **and** mobile 390×844 → **0 errors / 0 warnings / 0 pageErrors**. Use `scripts/probe-plain-boot-console.mjs`; ⚠️ it **requires `PROBE_BASE`** and proves the listener was started from this checkout (rf-27..rf-30) — a bare positional argument **throws a directive error** by design. Set the env var.
7. `npm run test:node-guards` → report the **`node --test` phase** count. It is **58 on main today**; expect **59** with your guard added. Report your guard's own pass/fail and its duration.
   ⚠️ **The command's OVERALL exit code is `1` on main today and that is NOT your slice** — the pre-existing ticker `StatsEndpointReadError` (F-1088-1) fires in a separate step after the node phase. **Judge by the phase count, never the overall rc.** This has now misled five drains in a row.
8. **Quote the scope-6 mutation control in full**: the red (naming which assertion failed and the exact `Total:` line it saw), and the restore.
9. **State the dependency direction explicitly**, in one line: confirm by `grep` that `src/systems/homemakerBossSuspend.ts` imports **only** `Balance`, and that it contains **no** import from `HomemakerBossSystem`. This is the scope-2 trap; prove you did not fall into it.

READY-FOR-GATES + report: the whole-suite `Total:` line before and after, the three recovered specs' collected counts **and** their run results with attributions, the scope-6 mutation control's red and restore, the scope-9 dependency-direction grep, the `node --test` phase count (58 → 59), the adjacent suites, and — as a follow-up rung, not an edit — whether your green whole-suite guard means F-1093-4's remaining 27 glob sites are now provably clear, or whether some are reachable in a way `--list` does not exercise.
