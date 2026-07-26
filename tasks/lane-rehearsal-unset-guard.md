# Task lane-rehearsal-unset-guard: THE GUARD LEARNS TO FAIL (LANE-A, commit prefix "test:")

**FIRE-AUTHORED (attended review welcome) — s1089, 2026-07-26. This is F-1089-1, found while draining rf-27 (`a9fccf755ab3bc7608110e62413d307db626a57e`). The gap below was proved by a mutation control s1089 actually ran, and the output is quoted so you inherit proof rather than opinion. This task is small on purpose. Do not grow it.**

You are Codex (worktrees/lane-a).
CODEX: model=gpt-5.6-sol effort=high

> ⚠️ **Note for whoever authors the next master (F-1088-4):** the `CODEX:` line above is at **column 0 on its own line** deliberately. `scripts/lane-runner-v3.sh` parses `grep -m1 '^CODEX:'`, so an inline `CODEX:` on the role line is **silently ignored** and the run falls back to `effort=medium`. 106 masters carry it inline, including rf-25/26/27.

## WHY (the evidence chain, dated)

**F-1089-1 (s1089, 2026-07-26, drain of rf-27) — the guard that just shipped would NOT catch the defect it was written to prevent.**

rf-27 replaced three hardcoded rehearsal port defaults with one fail-closed resolver, `rehearsal/base-url.mjs`, which throws on four branches: **env unset · foreign cwd · no listener · `lsof` unusable**. The resolver is correct — s1089 drove all four live on the merged tree, and `:5247` (still served by `gr-task-e1-gameplay`, the worktree that produced s1077's false P0) was rejected by name.

But its guard, `scripts/rehearsal-base.test.mjs`, asserts only **happy-path · foreign · no-listener · unusable-probe**. **There is no assertion for the UNSET branch — and the unset branch is exactly where the original defect lived** (`process.env.E1_BASE ?? 'http://127.0.0.1:5247'`).

**MEASURED, not inferred.** s1089 restored the defect — reintroduced the hardcoded default and disabled the unset branch — and re-ran the guard:

```
MUTATION APPLIED: hardcoded 5231 default restored, unset-branch dead
ℹ tests 4 · ℹ pass 4 · ℹ fail 0
>>> GUARD STAYED GREEN WHILE THE ORIGINAL DEFECT WAS RESTORED <<<
```

Reverted; `rehearsal/base-url.mjs` verified byte-identical (`7cde854c`). **The reason is structural: every existing test sets its own env var, so not one of them can ever observe a default being reintroduced.** The net has a hole precisely where the disease is.

## PRE-FLIGHT — verify by CONTENT, never by counting (SAFE-DUPE)

⚠️ **`git log main..lane/m3` WILL PRINT ONE COMMIT (`59e12d1f runner(lane-a): lane-entry-damage-net.md`), AND THAT IS EXPECTED — IT IS *NOT* A REASON TO STOP.**
s1089 verified the reset is **loss-free by content, not by counting**: that commit is rf-26, merged to main as `dc483d74927bcdd694c9aeb4c61144ecd225acb5`, and the full-tree `git diff main lane/m3` shows the branch is **behind-only** — it carries nothing main lacks. The branch is **FALSE-AHEAD**. An ahead-count is not a drain signal (F-1066-1 / F-1073-1).

All four must hold before you touch a file:
1. `git log --oneline main..lane/m3` prints **exactly `59e12d1f` and nothing else.** A **second** commit would be undrained work — **only then STOP and report.**
2. `ls rehearsal/base-url.mjs` on main → **must exist.** If absent, rf-27 is not merged and this task has no subject — STOP and report.
3. `grep -c "^test(" scripts/rehearsal-base.test.mjs` on main → **must print exactly `4`.** Any other count means the file moved under this task — STOP and report.
4. `grep -n "is unset" scripts/rehearsal-base.test.mjs` on main → **must print NOTHING.** If it matches, the unset assertion already exists and this task is already done — STOP and report.

If all four hold, start from fresh main (`git checkout -B lane/m3 main`) — `59e12d1f` is safe to leave behind.

## READ FIRST (in your worktree, before writing anything)

- `rehearsal/base-url.mjs` — the whole file (43 lines). Note `resolveBase`'s **first** branch: `const base = process.env[envVarName]; if (!base) { throw ... }`. That branch is your subject. Note also that the message interpolates **both** `envVarName` and `root`.
- `scripts/rehearsal-base.test.mjs` — all 38 lines, and specifically **how each test sets its own env var** (`process.env.REHEARSAL_BASE_TEST_OWN = BASE` etc.) and injects `probeListener`. This is why the unset branch is unreachable from the current suite.
- `scripts/entry-damage-table.test.mjs` — the house `node --test` guard pattern (`node:test` + `node:assert/strict`).
- `reviews/rf-27.md` §Findings — F-1089-1 (this task), F-1089-2 and F-1089-3 (explicitly **out of scope**, see NO list).

## SCOPE (numbered; each item is checkable)

1. **Add exactly one test** to `scripts/rehearsal-base.test.mjs` asserting that `resolveBase` **throws when the env var is unset.**
2. The test must **`delete process.env[<name>]` before calling**, and must use an env-var name **used by no other test in the file** — otherwise a leaked value from a sibling test decides the result and the assertion becomes vacuous, which is the very failure class this task exists to close.
3. The assertion must match on **message content**, not merely "it threw": it must require that the message names **the env var** and **the root path**. A bare `assert.throws(fn)` would still pass if the resolver threw for an unrelated reason (e.g. `new URL()` choking) — that is not the branch under test.
4. The test must **not** inject a `probeListener` that could be reached. The unset branch returns before any probe; if your test passes a stub that gets called, you have proved the wrong thing. Assert the stub was **never invoked** (a counter, or a stub that throws if called).
5. **MUTATION CONTROL — mandatory, and it is the deliverable's proof, not a formality.** Temporarily edit `rehearsal/base-url.mjs` to reintroduce the defect exactly as s1089 did:
   - change `const base = process.env[envVarName];` to `const base = process.env[envVarName] ?? 'http://127.0.0.1:5231';`
   - and neutralise the branch (`if (!base) {` → `if (false) {`).
   Re-run the guard. **Your new test MUST go RED** (and, note honestly in your report, the other four will stay green — that is the whole point). Then **revert**, and prove it with `git diff -- rehearsal/base-url.mjs` printing **EMPTY**. Quote both the red output and the empty diff in your report.
6. Re-run the full `npm run test:node-guards` and report the **`node --test` phase counts**. Expect **53 → 54, 54 pass**.
   ⚠️ **The overall command exits 1 on main today and that is NOT yours** — it is F-1088-1, `StatsEndpointReadError: could not read STATS_ENDPOINT from src/encyclopedia/liveStats.ts`, a pre-existing red measured on clean main by s1088 **and** s1089. **Judge yourself by the phase counts, not the overall rc.** Do not attempt to fix it; it is on the owner's desk.

## FIREWALL

**TOUCH-ONLY:**
- `scripts/rehearsal-base.test.mjs` — the one permanent edit.
- `rehearsal/base-url.mjs` — **TEMPORARY mutation only (scope 5), which MUST be reverted to byte-identical before you finish.** A permanent change to this file is a firewall violation.

**NO — do not touch, do not "improve", do not fix in passing:**
- `package.json` — the guard is **already wired** into `test:node-guards` by rf-27. Adding it again would double-run it.
- `rehearsal/lib.mjs`, `rehearsal/segments/**` — rf-27 shipped these; they are correct.
- `scripts/probe-plain-boot-console.mjs` — this **does** carry the same class of defect (port 5188, no ownership check; F-1089-3) and you will be tempted. **It is out of scope.** Report it, do not fix it.
- An integration test that binds a real port to exercise the actual `lsof` parsing (F-1089-2) — a known, recorded gap. **Out of scope**; it needs a decision this task does not carry.
- `src/`, `e2e/`, `functions/`, `scripts/deploy.sh` (forbidden off any lane, F-1073-1), `STATUS.md`, `tasks/`, `reviews/`.

## SELF-CHECK before you report

- [ ] `node --test scripts/rehearsal-base.test.mjs` → **5 tests, 5 pass.**
- [ ] `npm run test:node-guards` → `node --test` phase **54 tests, 54 pass**; overall rc 1 **only** from the documented `StatsEndpointReadError`. Any *other* red is yours.
- [ ] Mutation control run: new test **RED** under the restored defect, then reverted, `git diff -- rehearsal/base-url.mjs` **EMPTY**. Both quoted.
- [ ] `git diff --name-only` vs main lists **exactly one file**: `scripts/rehearsal-base.test.mjs`.
- [ ] `git diff --check` clean.
- [ ] **Do NOT run** `npx tsc --noEmit` as evidence for this slice. `tsconfig.json` includes only `src`/`e2e`/`playwright.config.ts` and **no tsconfig anywhere names `scripts/`** (F-1087-1, re-verified s1089) — it would be a green that proves nothing. Run it if you like; do not cite it.
- [ ] **No playwright, no screenshots, no boot probe, no rehearsal segment run** — this slice has zero runtime surface. Running a 12-minute segment is forbidden.

**READY-FOR-GATES** — report: the new test's exact name and assertion; the mutation-control red output verbatim + the empty revert diff; the `node --test` phase counts before and after; and **one plain sentence naming what is still unprotected** (F-1089-2's real `lsof` path, and F-1089-3's `probe-plain-boot-console.mjs`), so the drain cannot over-claim this net.
