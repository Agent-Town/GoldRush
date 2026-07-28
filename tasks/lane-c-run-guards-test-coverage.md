# Task lane-c-run-guards-test-coverage: give `scripts/run-guards.mjs` its first test file (LANE-C, commit prefix "test:")

**FIRE-AUTHORED (attended review welcome)** — s1196, 2026-07-29.

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-c`.

READ FIRST: `AGENTS.md`; `scripts/run-guards.mjs` (all 79 lines — it is short, read every branch); `scripts/probe-base.test.mjs` (**the house pattern you will copy: black-box `spawnSync` of the script under test, `node:test` + `node:assert/strict`, one `test()` per claim**); `tasks/BACKLOG.md:93` (the finding this task discharges); `package.json` (the `test:node-guards` line — it is an EXPLICIT ENUMERATED LIST of 12 files, not a glob).

CODEX: gpt-5.6-sol effort=medium

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/e2-arsenal main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.

> **Lane state as the authoring fire measured it at 04:4xZ (re-derive anyway, the board moves):** `lane/e2-arsenal` is **1 ahead**; its **39** own changed paths (`git diff --name-only main...lane/e2-arsenal`) are **ALL byte-identical to main** — `git diff --name-only main lane/e2-arsenal -- <those 39>` returned **empty**. Worktree dirt: **none**. That is a textbook SAFE DUPE; the pre-flight should resolve to PROCEED without argument.

## Why (F-1173-3, `tasks/BACKLOG.md:93`, raised s1173, unactioned since)

Verbatim from the ledger:

> 🔻 **F-1173-3 (s1173, non-blocking) — `scripts/run-guards.mjs` STILL HAS NO TEST FILE**, and scope 2 added a small defensive branch to it. Failure mode is benign (`?.[1]` → `undefined` → the suffix is simply omitted) and **both branches were observed live in this drain's own battery**, which is why this is a note and not a blocker. ➡️ **If a fourth mechanism is ever attempted on F-1160-2, a `run-guards` test is its prerequisite** — it is the one file on the board built on the law that *a gate is its exit code, not its printed counter*, and it is untested.

Verified at source by the authoring fire, not inherited:
- `ls scripts/*.test.mjs` → **12 files**, and `run-guards.test.mjs` is **absent**. `package.json`'s `test:node-guards` enumerates exactly those 12 by name.
- `scripts/run-guards.mjs:4-13` states the file's whole reason for existing: `test:node-guards` once "printed 61/61 pass and then exited 1 … Two fires in a row read the counter, never read `$?`, and recorded a green" (F-1125-1, F-1126-1). **This file is the factory's answer to that class of failure, and nothing checks that it still answers it.**
- `scripts/run-guards.mjs:15-17`: `scripts/**` is **not** type-checked (`tsconfig` `include` is `[src, e2e, playwright.config.ts]`), so for this file the guards are the only gate there is — and it has none.

## The mechanism, ALREADY MEASURED — do not re-derive it, and do not invent a different one

The authoring fire proved the whole approach in **one second** before writing this task. `run-guards.mjs:50` calls `spawnSync('npm', ['run','--silent', guard])`, and **`npm run` resolves scripts from the nearest `package.json` to the CURRENT WORKING DIRECTORY.** So: run the REAL script with `cwd` set to a **temp fixture directory holding its own `package.json`**, and every guard name resolves to a trivial fake you control. Zero production edits, no browsers, no recursion, sub-second.

Measured output of `node <repo>/scripts/run-guards.mjs` with `cwd` = a fixture whose 8 scripts are trivial `node -e` one-liners, `test:stats` being `process.exit(3)` and `test:power-budget` printing `power-graph-budget: p95=12.5ms`:

```
PASS  rc=0  0s  test:node-guards
PASS  rc=0  0s  test:power-budget  p95=12.5ms
FAIL  rc=3  0s  test:stats
PASS  rc=0  0s  test:accounts
...
guards: 7/8 passed -- RED: test:stats
```
…with **process exit code 1**, elapsed **1s**.

Also measured, all reachable black-box:
- `--only bogus-guard` → **exit 2**, stderr `run-guards: no guard named "bogus-guard". Known: …`
- `--only test:node-guards` → **exit 0**, exactly **1** row
- a fixture guard that self-`SIGKILL`s → row `FAIL  rc=signal:SIGKILL`, overall **exit 1**

⚠️ **THE ONE HAZARD, AND IT IS A FORK BOMB IF YOU GET IT WRONG.** `GUARDS[0]` is `test:node-guards` — the very script this new test file will be added to. If the test ever spawns `run-guards.mjs` with `cwd` = the **repo root**, the real `test:node-guards` runs the new test, which spawns `run-guards.mjs`, which runs `test:node-guards`… unbounded. **The fixture `cwd` is what makes this safe, and it is non-negotiable.** Every `spawnSync` of `run-guards.mjs` in your test file MUST pass an explicit `cwd` pointing at a fixture dir you created under `os.tmpdir()` via `fs.mkdtempSync`. **Never** spawn it with the default cwd, and **never** with `cwd` inside the repo. The authoring fire verified the shadowing works: the fixture's `test:node-guards` ran, the repo's did not.

## Scope

1. **Create `scripts/run-guards.test.mjs`** in the house style of `scripts/probe-base.test.mjs`: `import test from 'node:test'`, `import assert from 'node:assert/strict'`, resolve the script under test with `fileURLToPath(new URL('./run-guards.mjs', import.meta.url))`. Add a single fixture helper that `fs.mkdtempSync`es a temp dir, writes a `package.json` with the scripts that test needs, and returns the path. **Every** spawn passes that dir as `cwd` and a `timeout` (60 s is generous — the measured battery is 1 s).
2. **Test — the central claim (F-1125-1/F-1126-1): a red guard makes the RUNNER red.** All-green fixture → exit code **0** and the summary line reads `8/8 passed`. Then a fixture where one guard exits **3** → exit code **1**, the summary contains `RED: test:stats`, and the row for it reads `rc=3`. **Assert on `result.status`, not on the printed counter** — that is the entire point of the file.
3. **Test — the `--only` contract.** Unknown name → exit **2** and stderr matches `/no guard named/`. Known name → exit **0** and exactly **one** `PASS`/`FAIL` row (count them with a `/^(PASS|FAIL)/gm` match).
4. **Test — F-1173-3's own defensive branch, BOTH arms.** A guard printing `power-graph-budget: p95=12.5ms` on its first line → its row ends `p95=12.5ms`. A guard printing nothing → its row has **no** `p95=` suffix and still **passes**. This is the `?.[1]` the finding names.
5. **Test — a signal-killed guard is never a PASS** (`run-guards.mjs:55-56`). Fixture guard self-`SIGKILL`s → overall exit **1** and its row starts `FAIL`. ⚠️ **Assert the CONTRACT, not the string:** require `FAIL` and a non-zero/`signal:` rc; do **not** hard-assert the literal `signal:SIGKILL`, which may vary with npm/OS. The claim under test is *"a signal-killed child is a failure, not a pass"* — write the assertion so it tests exactly that.
6. **Wire it into the gate, or it is an unread verdict.** Append `scripts/run-guards.test.mjs` to the enumerated file list in `package.json`'s `test:node-guards`. **Report the guard count before and after** (it is **61** on current main). An added test file that no npm script names is invisible to every future fire.

## Firewall

**Touch ONLY:** `scripts/run-guards.test.mjs` (new) · `package.json` (the `test:node-guards` line **only** — one line, adding one filename).

**NO changes to:**
- ⛔ **`scripts/run-guards.mjs` — ZERO bytes.** This is the central firewall. It gates everything; a "small refactor to make it testable" is exactly the risk this task exists to avoid. If you find a branch you believe is unreachable black-box, **report it as a finding — do not edit the subject to reach it.** (The authoring fire expected the signal branch to be unreachable and was refuted by measurement; check before concluding.)
- ⛔ Any **other** `scripts/*.mjs`, any `src/**`, any `e2e/**`, any other `package.json` script, `playwright.config.ts`, `tsconfig.json`.
- ⛔ **No fixture written inside the repo tree** — `os.tmpdir()` only, and clean up with `fs.rmSync(dir,{recursive:true,force:true})` in the test itself.
- ⛔ Do not "fix" anything F-1173-3 mentions beyond adding tests. Diagnosis-and-cover only.

## Self-check (evidence, not vibes)

- `node --test scripts/run-guards.test.mjs` → **exit 0**, and report the test count. Run it **twice** and report both wall times (it must stay ~seconds; a minutes-long run means a fixture leaked to the real cwd — investigate before reporting green).
- `npm run test:node-guards` → **exit 0** with the **new** count. **Print `echo $?` explicitly** — this repo's own history (F-1125-1) is a counter that lied while the exit code was 1. Report the number before (61) and after.
- `node scripts/run-guards.mjs --only test:node-guards` → **exit 0** from the repo root. This is the one deliberate real-cwd invocation, and it proves the wiring did not create a loop. **If it does not return within 3 minutes, kill it, and report a recursion finding — do not retry.**
- `npx tsc --noEmit` → 0 errors. `npm run build` → green, report the seconds.
- **No playwright, and that is proportionate, not thinned** — this slice adds zero `src/` and zero `e2e/` bytes and renders nothing, so Mistake #10's "where does the PLAYER see this?" answers *nowhere, by construction*. Say so in your report rather than leaving it implied.
- Show the **full `git diff --stat`** of your commit. It must be exactly two files.

## No-op guard

If you find yourself about to exit without changes, WRITE WHY into your report first — a silent no-op wastes a queue slot and a gate.

End: **READY-FOR-GATES** + report: the test count and both wall times · the node-guards count **before and after** · the exit code of each self-check command, stated as a number · whether all five claims (scope 2–5) proved reachable black-box, and **which if any did not** · the final `git diff --stat`.
