# Task lane-probe-launch-ordering: THE GUARD THAT NAMES AN ORDERING IT DOES NOT CHECK (LANE-C, commit prefix "test:")

**FIRE-AUTHORED (attended review welcome) — s1091, 2026-07-26. This is F-1091-1, found and MEASURED by s1091 while draining rf-29. It is the fourth beat of one defect class and the second time the *guard* — not the code — was the thing that was blind. Tiny on purpose: ONE added test plus, if needed, one import move. Do not grow it.**

You are Codex (worktrees/lane-c).
CODEX: model=gpt-5.6-sol effort=high

> ⚠️ The `CODEX:` line above is at **column 0 on its own line** deliberately (F-1088-4). `scripts/lane-runner-v3.sh` greps `^CODEX:`, so an inline copy is silently ignored and the run falls back to `effort=medium`.

## WHY (the evidence chain, dated)

**The class so far.** `F-1077-3` (s1077): a rehearsal driver defaulted to a fixed port, another worktree served it, and the run measured someone else's code. **rf-27** (`a9fccf75`) shipped the cure — `resolveBase()` in `rehearsal/base-url.mjs`, which throws unless the env var is set *and* an `lsof` pid→cwd probe proves the listener belongs to this checkout. **rf-28** (`8fb97691`) shipped the guard's missing half after a mutation control proved the cure's own suite stayed 4/4 green with the defect restored. **rf-29** (`46db455cbd4c13e4c31def7fed3f59f3130d90bc`, s1091) closed the last hardcoded port, in `scripts/probe-plain-boot-console.mjs`.

**F-1091-1 (this task) — rf-29's guard proves fail-closed, but NOT the ordering it is cited for.** rf-29's master made resolve-before-launch a numbered deliverable, with a stated reason: an unset base must not leak a browser process. The goal leaf repeats it. And the test is *named* for it:

```js
test('rejects an unset PROBE_BASE before launching a browser', () => { ... })
```

But the body asserts only `status !== 0` and `stderr =~ /PROBE_BASE/`. **Neither is sensitive to ordering.** s1091 measured this rather than arguing it — moving `const browser = await chromium.launch();` to sit *above* the `resolveBase` call and re-running the guard gave:

```
--- ORDERING MUTATION: chromium.launch() now runs BEFORE resolveBase ---
rc = 0
✔ rejects an unset PROBE_BASE before launching a browser (206ms)
✔ rejects a positional base URL with a PROBE_BASE directive (149ms)
ℹ tests 2  ℹ pass 2  ℹ fail 0
```

**2/2 green while a browser leaks before every throw** — including the test whose name forbids exactly that. The script still fails closed, and ordering on main is correct *today* (verified by reading: resolve is line 28, launch is line 34, sequential top-level code). **This is not a live defect. It is an undefended invariant** — the next edit to that file reintroduces the leak in silence, and the test name will keep asserting otherwise.

**Why timing is NOT the answer.** The obvious assertion — "the child returns in under N ms, so no browser can have started" — is a load-sensitive threshold, and load-sensitive suites are already an open complaint (F-1084-1). Do not introduce another. Scope 2 gives a deterministic alternative.

## PRE-FLIGHT — verify by CONTENT, never by counting (SAFE-DUPE)

⚠️ **`git log main..lane/e2-arsenal` WILL PRINT ONE COMMIT (`71abbdf9 runner(lane-c): lane-probe-boot-ownership.md`), AND THAT IS EXPECTED — IT IS *NOT* A REASON TO STOP.** That commit is rf-29, **drained to main as `46db455c` by s1091, the same fire that authored this task** — the three files were verified byte-identical to the lane tip before committing. The branch carries nothing main lacks. It is **FALSE-AHEAD**; an ahead-count is not a drain signal (F-1066-1 / F-1073-1).

All four must hold before you touch a file:
1. `git log --oneline main..lane/e2-arsenal` prints **exactly `71abbdf9` and nothing else.** A **second** commit would be undrained work — **only then STOP and report.**
2. `grep -c "5188" scripts/probe-plain-boot-console.mjs` on main → **must print `0`.** If the literal is back, rf-29 has been reverted and this task's premise is gone — STOP and report.
3. `grep -c "^test(" scripts/probe-base.test.mjs` on main → **must print exactly `2`** (rf-29 landed both). Any other count means the ground moved — STOP and report.
4. In `scripts/probe-plain-boot-console.mjs` on main, the line matching `resolveBase(` must appear **BEFORE** the line matching `chromium.launch()`. If it does not, the invariant is already broken and this is a *fix*, not a guard — STOP and report, because that changes the task.

If all four hold, start from fresh main (`git checkout -B lane/e2-arsenal main`) — `71abbdf9` is safe to leave behind.

## READ FIRST (in your worktree, before writing anything)

- `scripts/probe-base.test.mjs` — all 24 lines. You are adding a **third** test in the same shape; match its style exactly (subprocess via `spawnSync`, explicit child env, `assert.match` on stderr).
- `scripts/probe-plain-boot-console.mjs` — the whole file. Note it is **sequential top-level code** and that `import { chromium } from '@playwright/test'` is a *static* import that does **not** itself start a browser. Only `chromium.launch()` does. That distinction is the whole task.
- `rehearsal/base-url.mjs` — `resolveBase` needs **no modification**. Do not touch it.

## SCOPE (numbered; each item is checkable)

1. **Add exactly ONE test to `scripts/probe-base.test.mjs`** proving that an unset `PROBE_BASE` fails **without ever launching a browser**. Do not modify the two existing tests.

2. **Make the assertion deterministic by sabotaging the browser, not by timing it.** Spawn the script with `PROBE_BASE` deleted from the child env **and** `PLAYWRIGHT_BROWSERS_PATH` pointed at a directory that does not exist. Then:
   - correct ordering → `resolveBase` throws first → stderr **names `PROBE_BASE`**;
   - broken ordering → `chromium.launch()` runs first and fails on the missing browser → stderr carries **playwright's** launch error and **does not name `PROBE_BASE`**.

   Assert **both** directions: stderr **matches** `/PROBE_BASE/` **and does NOT match** playwright's executable-missing message. One-sided assertions are how rf-29's guard ended up blind.

   ⚠️ **VERIFY THE SABOTAGE ACTUALLY BITES BEFORE YOU RELY ON IT.** Run the script once by hand with `PROBE_BASE` set to a *valid owned* URL and `PLAYWRIGHT_BROWSERS_PATH=/nonexistent-<something>`, and confirm the launch really does fail with a distinctive message. **Quote that message in your report and use it to build the negative assertion.** If the env var does **not** break launch on this machine, say so plainly and fall back to scope 2b rather than inventing a threshold.

   **2b (fallback, only if 2 is proven unworkable):** convert the `@playwright/test` import in `scripts/probe-plain-boot-console.mjs` to a **dynamic `await import()` placed after the resolve**, and assert the unset run's stderr contains no playwright frame at all. This is a real improvement in its own right — an unset base then cannot even load the browser module — but it edits the shipped script, so prefer scope 2 and take 2b only with your reasoning written down.

3. **Do not touch `package.json`.** `scripts/probe-base.test.mjs` is already wired into `test:node-guards`; a third test rides in free. The `node --test` phase count must go **56 → 57**.

4. **MUTATION CONTROL — mandatory, and it is this task's entire proof.** Temporarily move `const browser = await chromium.launch();` to sit **above** the `resolveBase(...)` line in `scripts/probe-plain-boot-console.mjs`. Re-run the guard.
   - **Your NEW test MUST go RED.**
   - **Report honestly what the two existing tests do** — s1091 measured them staying **GREEN** under exactly this mutation (that is the finding). If they now flip too, say so; if they stay green, say that, because it is the evidence that the new test is carrying the ordering invariant alone.
   Then **revert**, prove it with `git diff -- scripts/probe-plain-boot-console.mjs` showing your intended change only (or an empty diff under scope 2), and re-run to green. **Quote the red output.** A guard you have not watched fail is not evidence — that is the lesson of rf-28 and it is why this task exists.

## TOUCH-ONLY

- `scripts/probe-base.test.mjs` (the added test)
- `scripts/probe-plain-boot-console.mjs` — **only** under scope 2b, and only the import/ordering change

## NO (firewall — report, do not fix)

- ❌ `package.json` (scope 3 — nothing to wire)
- ❌ `rehearsal/base-url.mjs` and `scripts/rehearsal-base.test.mjs` — rf-27/rf-28 are settled
- ❌ Any `src/`, `e2e/`, or spec file. This slice has **zero player-visible surface** and needs **no playwright run**.
- ❌ The real-`lsof` port-binding integration test (**F-1089-2**) — still owner-gated, still out of scope. Report it, do not write it.
- ❌ The ticker `StatsEndpointReadError` (**F-1088-1**) — see self-check.

## SELF-CHECK (run these exact things; report real numbers)

1. `npm run test:node-guards` → **`node --test` phase must read 57 tests, 57 pass, 0 fail.**
   ⚠️ **The command's OVERALL exit code is `1` on main today and that is NOT your slice** — it is the pre-existing ticker `StatsEndpointReadError` (F-1088-1), which fires after the `node --test` phase and is structurally disjoint from the files you touch. **Judge by the phase counts, never by the overall rc.**
2. `npm run build` → must be green.
3. **Do NOT cite `npx tsc --noEmit` as evidence for this slice.** F-1087-1: `tsconfig.json` includes only `src` and `e2e`, so tsc never reads `scripts/`. Run it if you like as a regression check; do not quote it as coverage.
4. **No playwright, desktop or mobile.** Nothing here renders. Say so explicitly rather than leaving a blank.
5. Quote the scope-4 mutation control in full: the red, what the two existing tests did, and the revert.

READY-FOR-GATES + report: the phase count 56 → 57, the exact sabotage message you built the negative assertion from (or why you took 2b), the mutation control's red output and the behaviour of the two pre-existing tests under it, and any finding you had to leave alone.
