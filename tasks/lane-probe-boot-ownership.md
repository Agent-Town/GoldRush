# Task lane-probe-boot-ownership: THE LAST HARDCODED PORT (LANE-C, commit prefix "fix:")

**FIRE-AUTHORED (attended review welcome) — s1090, 2026-07-26. This is F-1089-3, reported independently by BOTH rf-27's and rf-28's runners and confirmed by s1090 reading the file. It is the third instance of one defect class; rf-27 shipped the cure and rf-28 shipped the guard, so this task should REUSE both rather than invent anything. Small on purpose. Do not grow it.**

You are Codex (worktrees/lane-c).
CODEX: model=gpt-5.6-sol effort=high

> ⚠️ **Note for whoever authors the next master (F-1088-4):** the `CODEX:` line above is at **column 0 on its own line** deliberately. `scripts/lane-runner-v3.sh` parses `grep -m1 '^CODEX:'`, so an inline `CODEX:` on the role line is **silently ignored** and the run falls back to `effort=medium`. This was confirmed by experiment in s1089 (rf-28 dispatched at `effort=high`; 106 older masters did not).

## WHY (the evidence chain, dated)

**F-1077-3 (s1077) — the disease.** A rehearsal driver defaulted to a fixed port, that port was served by *another worktree*, and the run measured somebody else's code while attributing it to this branch. Mistake #12 wearing a play-session coat.

**rf-27 (s1089, merged `a9fccf755ab3bc7608110e62413d307db626a57e`) — the cure.** `rehearsal/base-url.mjs` exports `resolveBase(envVarName, { root, probeListener })`, which **throws unless** the env var is set **and** an `lsof` pid→cwd probe proves the listener was started from this checkout. Three hardcoded defaults were **deleted, not moved**. s1089 drove the four-case truth table live: `:5247` — still served by `gr-task-e1-gameplay`, the very worktree that caused s1077's false P0 — was **rejected by name**.

**rf-28 (s1089, merged `8fb9769198ce8f07716391084d4d7720c85c1636`) — the guard learned to fail.** The cure's own suite had no assertion for the **unset** branch, which is exactly where the hardcoded default had lived; a mutation control proved the guard stayed 4/4 green with the defect restored.

**F-1089-3 (this task) — one file still has the disease.** `scripts/probe-plain-boot-console.mjs:23` reads:

```js
const baseURL = process.argv[2] ?? 'http://127.0.0.1:5188';
```

It then opens a browser against that URL and prints console/page errors as **drain evidence**. With no argument it silently probes port 5188 **with no ownership check at all** — so if any other tree is serving 5188, this script reports a clean or dirty boot for *someone else's code* and a drain quotes it. That is precisely the failure rf-27 exists to prevent, one file over. Both rf-27's and rf-28's runners reported it instead of fixing it out of scope (correct, per §4.5).

**WHO CALLS IT — s1090 checked the whole repo, and the honest answer is more useful than a simple one.** A repo-wide grep finds **no automated caller**: not `package.json`, not CI, not a shell script — nothing executes it on a schedule, so no gate breaks when its interface changes. But it is **not** unused: **two shipped task masters invoke it positionally as a drain self-check step** — `tasks/lane-blocked-storage-boot-3.md:58` and `tasks/lane-blocked-storage-access-throw.md:75`, both of the form `node scripts/probe-plain-boot-console.mjs <baseURL>`. **That is exactly why scope 4 below says throw, not ignore.** The next author will copy that line out of habit; under a silent switch to an env var their positional URL would be **ignored** and the probe would quietly measure port 5188 — turning this task's own fix into a fresh instance of the defect it closes. A loud, directive error is the whole point.

## PRE-FLIGHT — verify by CONTENT, never by counting (SAFE-DUPE)

⚠️ **`git log main..lane/e2-arsenal` WILL PRINT ONE COMMIT (`756b895c runner(lane-c): lane-rehearsal-base-failclosed.md`), AND THAT IS EXPECTED — IT IS *NOT* A REASON TO STOP.**
s1090 verified the reset is **loss-free by content, not by counting**: that commit is rf-27, merged to main as `a9fccf75`, and the **full-tree** `git diff main lane/e2-arsenal` is **behind-only** — every hunk is something main HAS that the branch lacks (`reviews/rf-27.md`, `reviews/rf-28.md` and the rf-28 test are *deletions* in that direction). The branch carries **nothing main lacks**. It is **FALSE-AHEAD**; an ahead-count is not a drain signal (F-1066-1 / F-1073-1).

All four must hold before you touch a file:
1. `git log --oneline main..lane/e2-arsenal` prints **exactly `756b895c` and nothing else.** A **second** commit would be undrained work — **only then STOP and report.**
2. `ls rehearsal/base-url.mjs` on main → **must exist.** If absent, rf-27 is not merged and this task has no cure to reuse — STOP and report.
3. `grep -n "5188" scripts/probe-plain-boot-console.mjs` on main → **must match line 23** (s1090 read it there). If it does not match at all, the defect is already gone and this task is already done — STOP and report.
4. `grep -c "^test(" scripts/rehearsal-base.test.mjs` on main → **must print exactly `5`** (rf-28 landed). Any other count means the ground moved — STOP and report.

If all four hold, start from fresh main (`git checkout -B lane/e2-arsenal main`) — `756b895c` is safe to leave behind.

## READ FIRST (in your worktree, before writing anything)

- `scripts/probe-plain-boot-console.mjs` — the whole file (~80 lines). Note that it is **sequential top-level code**: line 22 resolves the URL, then `const browser = await chromium.launch()`. That ordering matters in scope 3.
- `rehearsal/base-url.mjs` — all 43 lines. `resolveBase` is **exactly** the function you need and needs **no modification**: it already reads `process.env[name]`, already throws on unset, and already does the pid→cwd ownership probe. **Reuse it. Do not write a second `lsof` parser** — a duplicated parser would make this the *third* copy of a defect class the factory has now cured twice.
- `rehearsal/segments/e1-depth-play.mjs:21-27` — the house pattern for deriving `ROOT` (`path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..')`) and the comment style used to record *why* a resolver guards a port. Yours is one `'..'` shallower: the script lives in `scripts/`, so `ROOT` is `path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')`. **`path.resolve` yields no trailing slash, which is what the `lsof` cwd comparison requires** — do not append one.
- `scripts/rehearsal-base.test.mjs` — the house `node --test` guard shape, and specifically rf-28's first test (`rejects an unset base before probing ownership`): note it `delete`s a uniquely-named env var first, matches on **message content**, and asserts the probe was **never invoked**.

## SCOPE (numbered; each item is checkable)

1. **Delete the hardcoded default from `scripts/probe-plain-boot-console.mjs`.** `?? 'http://127.0.0.1:5188'` goes away — **deleted, not moved to a constant, not moved to a fallback chain.**
2. **Resolve through the shipped cure**: `const baseURL = resolveBase('PROBE_BASE', { root: ROOT });`, importing `resolveBase` from `../rehearsal/base-url.mjs` and deriving `ROOT` as described above. No new `lsof` code.
3. **Resolution must happen BEFORE `chromium.launch()`.** Put the `resolveBase` call above the launch. This is not cosmetic: it is what makes an unset/foreign base fail *without* leaking a browser process, and it is what makes the scope-5 assertion actually prove ordering (the file is sequential top-level code, so if the resolver's message is on stderr, the launch provably never ran).
4. **`process.argv[2]` must not become a silent second path.** Today the URL comes from argv. After this change it comes from the env var, so a caller who passes a URL positionally would otherwise be **silently ignored** — a *new* instance of the exact class this task closes. **If `process.argv[2]` is present, throw** a message telling the caller to use `PROBE_BASE=<url>` instead. Do not accept it, and do not ignore it.
5. **Update the usage comment (currently line 17, `Usage: node scripts/probe-plain-boot-console.mjs <baseURL>`)** to the env-var form. A stale usage line is a lie that outlives the fix.
6. **Add a guard `scripts/probe-base.test.mjs`** with **exactly two** tests, both driving the real script as a **subprocess** (`node:child_process` `execFileSync`/`spawnSync`), because this script's contract is its CLI behaviour:
   - **the unset branch** — spawn with `PROBE_BASE` **removed from the child env** (build the child env explicitly; do not rely on it being absent from yours, or a leaked value makes the assertion vacuous — *the same failure class rf-28 closed*). Assert **non-zero exit** AND that stderr **names `PROBE_BASE`**. A bare "it exited non-zero" would pass on a syntax error, which is not the branch under test.
   - **the argv branch** (scope 4) — spawn with a positional URL argument. Assert **non-zero exit** and a message that names the positional argument or directs the caller to `PROBE_BASE`.
   - Both must return **fast** (no browser). If either test takes tens of seconds, your resolution is happening after the launch — go fix scope 3.
7. **Wire the new guard into `test:node-guards` in `package.json`** — add `scripts/probe-base.test.mjs` to the existing `node --test` file list (keep the list's order tidy; this is the **only** permitted `package.json` edit).
8. **MUTATION CONTROL — mandatory, and it is this task's proof, not a formality.** Temporarily restore the defect in `scripts/probe-plain-boot-console.mjs` exactly as it exists on main today (`const baseURL = process.argv[2] ?? 'http://127.0.0.1:5188';`, bypassing the resolver). Re-run your new guard. **Your unset test MUST go RED** — and note honestly in your report whether the argv test also flips, since under the restored defect argv is *accepted*. Then **revert**, and prove it with `git diff -- scripts/probe-plain-boot-console.mjs` showing **only your intended change** (quote it). Quote the red output too. **A guard you have not watched fail is not evidence.**
9. Re-run `npm run test:node-guards` and report the **`node --test` phase counts**. Expect **54 → 56, 56 pass**.
   ⚠️ **The overall command exits 1 on main today and that is NOT yours** — it is F-1088-1, `StatsEndpointReadError: could not read STATS_ENDPOINT from src/encyclopedia/liveStats.ts`, a pre-existing red measured on clean main by s1088 **and** s1089. **Judge yourself by the phase counts, not the overall rc.** Do not attempt to fix it; it is on the owner's desk.

## FIREWALL

**TOUCH-ONLY:**
- `scripts/probe-plain-boot-console.mjs` — the fix (plus the TEMPORARY scope-8 mutation, which MUST be reverted).
- `scripts/probe-base.test.mjs` — new file.
- `package.json` — **the `test:node-guards` line ONLY.**

**NO — do not touch, do not "improve", do not fix in passing:**
- `rehearsal/base-url.mjs` — shipped and gated by rf-27/rf-28. It needs **no** change for this task. If you become convinced it does, **STOP and report** — that is a design decision, not a fix.
- `rehearsal/lib.mjs`, `rehearsal/segments/**` — correct as shipped.
- An integration test that binds a real port to exercise the actual `lsof` parsing (**F-1089-2**) — a known, recorded gap awaiting an owner decision. **Out of scope.**
- `src/encyclopedia/liveStats.ts` and the ticker stats red (**F-1088-1**) — owner's desk.
- `src/`, `e2e/`, `functions/`, `scripts/deploy.sh` (**forbidden off any lane, F-1073-1**), `STATUS.md`, `tasks/`, `reviews/`.

## SELF-CHECK before you report

- [ ] `node --test scripts/probe-base.test.mjs` → **2 tests, 2 pass**, and completes in **seconds** (proving no browser launched).
- [ ] `npm run test:node-guards` → `node --test` phase **56 tests, 56 pass**; overall rc 1 **only** from the documented `StatsEndpointReadError`. Any *other* red is yours.
- [ ] Mutation control run: unset test **RED** under the restored defect, then reverted. Both the red output and the post-revert `git diff` quoted.
- [ ] `grep -n 5188 scripts/probe-plain-boot-console.mjs` → **no match.** The default is gone from the file, not relocated.
- [ ] `git diff --name-only` vs main lists **exactly three** files: the probe, the new test, `package.json`.
- [ ] `git diff --check` clean.

**READY-FOR-GATES.** Report: the diff of the probe's resolution block, both guard tests' output, the mutation control's red + revert proof, the `node --test` phase counts, and — honestly — anything you found that is still unprotected but out of scope.
