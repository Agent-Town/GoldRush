# Task lane-d-collection-guards-spawnsync-truncation: the collection guards capture Playwright's listing with `spawnSync`, which silently returns PARTIAL stdout under load — the battery is now ~36% red on a race that reports success (LANE-D, commit prefix "fix:")

**FIRE-AUTHORED (attended review welcome)** — s1202, 2026-07-29.

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-d`.

READ FIRST: `AGENTS.md`; `scripts/whole-suite-collection.test.mjs` (17 lines — the primary subject); `scripts/town-spec-collection.test.mjs` (25 lines — **the sibling carrying the identical latent defect; fix the CLASS, not the instance**); `scripts/collection-guards-cwd-invariance.test.mjs` (the meta-guard that exposed this — **you do not change it**, you make it stop flaking); `reviews/collection-guards-root-invariance.md` (**finding F-1202-1 — every number below was measured there, including the cure**); `tasks/BACKLOG.md` (F-1202-1 verbatim).

CODEX: gpt-5.6-sol effort=medium

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main OR is preserved on another ref (verify via git log/diff/for-each-ref), it is a SAFE DUPE → `git checkout -B lane/perf main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main and NOT on any other ref (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.

> ✅ **THE AUTHORING FIRE MEASURED `lane/perf`'s STATE: PLAIN SAFE DUPE — RESET AND PROCEED.** `lane/perf` is **1 ahead** at `278ad24c` "runner(lane-d): lane-d-collection-guards-root-invariance.md" — that is the work this fire merged to main as **`fbefb903`**. Verified by content, not by commit count: `git diff fbefb903 lane/perf --` over the five merge paths (`package.json`, `scripts/collection-guards-cwd-invariance.test.mjs`, `scripts/suite-red-inventory.test.mjs`, `scripts/town-spec-collection.test.mjs`, `scripts/whole-suite-collection.test.mjs`) is **empty — byte-exact**. Nothing is lost by resetting. ⚠️ **Confirm that diff is still empty in one command before resetting**; if it is not, STOP and report — the premise of this paragraph has changed. ⚠️ **The merge hash is `fbefb903`, whose commit MESSAGE is about goal-tree bookkeeping and does not mention this slice** — that is F-1202-2, not a mistake on your part; do not go looking for a better-named commit.

## Why (F-1202-1, measured during the s1202 drain of `fbefb903`)

The slice that just landed made both collection guards root-invariant. Gating it revealed that the same guards have a **second, older defect**: they capture Playwright's `--list` output with `spawnSync`, and **`spawnSync` silently returns truncated stdout under load while reporting `status` 0.**

### 🔑 WHAT THE DRAINING FIRE MEASURED. DO NOT RE-DERIVE FROM MEMORY; DO REPRODUCE IN SCOPE 1.

1. 🚨 **THE BATTERY IS NOW FLAKY, AND IT WAS NOT BEFORE.** Same machine, same session, `npm run test:node-guards`:

   | Arm | Battery | Red rate |
   |---|---|---|
   | pre-merge main (13 files, `spawnSync`) | 72 tests | **0/6** |
   | merged (15 files, `spawnSync`) | 74 tests | **4/11** |
   | merged + the cure below | 74 tests | **0/8** |

   Every failure is `whole suite collects without loading Vite-only modules` — twice directly, twice nested inside `whole-suite collection guard is cwd-invariant`.

2. 🔬 **THE MECHANISM, VERIFIED AT THE CAPTURED BYTES.** The failing assertion is `assert.match(result.stdout, /Total: [1-9]\d* tests/)`, but `result.status` is **0** and the listing is present and well-formed. The capture is truncated before the trailing `Total:` line:
   - full solo capture: **296,028 bytes**, `Total: 2430 tests in 338 files` present, byte-identical across runs
   - failing capture #1: **≈153,474 chars**, ending mid-line (`… assay-ledger-page.spec.ts:80:1 › locks the recor`)
   - failing capture #2: **≈156,216 chars**

   Two *different* truncation points ⇒ a **race**, not a boundary. **It is not `maxBuffer`:** 296 KB is well under the 1 MB default, and on overflow `spawnSync` sets `error = ENOBUFS` with a null status — here `status` is 0 and the first assertion passes. Four concurrent **`execFile`** listings return the full 296,028 bytes every time, so the defect follows the **synchronous capture**, not Playwright and not concurrency as such.

3. ⚠️ **THE OLD GREEN WAS A FALSE GREEN.** This defect did not arrive with the meta-guard; the meta-guard raised process load enough to lose a race that was always there. Do not "fix" this by making the battery lighter.

4. ⛔ **DO NOT TOUCH EITHER `/Total: [1-9]\d* tests/` REGEX.** Both are correct — one backslash, the right digit class. A previous run escalated them as broken; that claim was refuted at source in s1201 (F-1201-1). If you find yourself editing a `\d`, stop: you are curing a phantom for the second time.

### ✅ THE CURE, PROTOTYPED AND MEASURED BY THE AUTHORING FIRE (0/8), NOT PROPOSED FROM THEORY

Replace the synchronous capture with promisified `execFile`, **preserving the `{ status, stdout, stderr }` shape** so the scope-3 diagnostic and all three assertions survive unchanged:

```js
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const runAsync = promisify(execFile);

async function collect(args, cwd) {
  try {
    const { stdout, stderr } = await runAsync('npx', args, { cwd, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
    return { status: 0, stdout, stderr };
  } catch (error) {
    return { status: error.code ?? 1, stdout: error.stdout ?? '', stderr: error.stderr ?? '' };
  }
}
```

The `test()` callback becomes `async` and the call becomes `const result = await collect([...], fileURLToPath(new URL('../', import.meta.url)));`. Everything below that line — the `tail()` diagnostic, all three assertions — is unchanged. This is the authoring fire's prototype verbatim; you may improve it, but **any change to its shape must keep the three assertions and the scope-3 diagnostic intact**, and must be justified by a measurement, not by taste.

## Scope

### 1. Observe-first gate — reproduce the flake before changing anything (MANDATORY; a STOP here is a SUCCESS)

**1a.** Run the full battery from the repo root **8 times** and record exit code + `tests/pass/fail` for each. Expect **74 tests** and **roughly 2–4 reds out of 8**, every red being the whole-suite guard.

⚠️ **If you get 8/8 green, do NOT conclude the premise is gone** — this is a load-dependent race and a quiet machine can hide it. Re-run under load (e.g. concurrently with `npm run build`) and say so in your report. **Only if it stays green under load do you STOP and report** — and even then, proceed to scope 2 anyway, because the truncation mechanism in §2 above is verified independently of the flake rate.

**1b.** Prove the mechanism yourself, once: on a failing run, confirm `result.status === 0` while `result.stdout` lacks `Total:` and ends mid-line, and record the captured length against the full **296,028** bytes. If instead you find a non-zero status or an `ENOBUFS` error, **STOP and report** — you are looking at a different defect than this task's.

### 2. Convert both collection guards to the async capture (the actual fix)

Apply the cure above to **both** `scripts/whole-suite-collection.test.mjs` and `scripts/town-spec-collection.test.mjs`. Keep the `fileURLToPath(new URL('../', import.meta.url))` root resolution exactly as it is — this repo's path contains a space and `.pathname` yields `Gold%20Rush`. Keep the `tail()` diagnostic. Change no assertion.

### 3. Guard the completeness of the capture

The three existing assertions cannot distinguish "Playwright collected nothing" from "we captured only half the output" — that ambiguity is what made this defect cost a full drain to diagnose. Add **one** assertion per guard that pins the capture as complete, and make its failure message say so in words. `Total:` appearing on the **last non-empty line** of stdout is the house-simplest form; a byte-count floor is acceptable but must not hard-code 296,028 (the suite grows).

State in your report which form you chose and why.

### 4. Mutation control — prove the new assertion can fail on its own subject

- **m1** — truncate the captured stdout artificially inside the guard (e.g. `result.stdout = result.stdout.slice(0, 150000)` immediately after `collect`, mimicking the measured 153,474-char failure). Scope 3's assertion must **FAIL**, and its message must name truncation rather than an empty collection. Restore and confirm byte-identical.

### 5. Re-measure the rate — this task is not done until the flake is gone

Run the full battery **10 times** from the repo root. Required: **10/10 exit 0, 74 tests / 74 pass / 0 fail.** Quote all ten. Report the battery's new median wall-time against the pre-cure **16–21s** (the authoring fire measured the cure at **12–15s** — *faster*, because the async child no longer blocks the test runner's event loop). If any run is red, **do not paper over it** — report it with its full assertion text.

### 6. Confirm root-invariance did not regress

The previous slice's whole point. Both guards must still exit 0 when run from a non-root cwd:

```
cd scripts && node --test whole-suite-collection.test.mjs
cd scripts && node --test town-spec-collection.test.mjs
```

Plus `node scripts/run-guards.mjs --only test:node-guards` → `PASS rc=0`.

## Firewall

**TOUCH-ONLY:**
- `scripts/whole-suite-collection.test.mjs`
- `scripts/town-spec-collection.test.mjs`

**NO:**
- ❌ `scripts/collection-guards-cwd-invariance.test.mjs` — the meta-guard is the *detector*; it is not the defect. Making it quieter would be curing the instrument instead of the fault.
- ❌ `package.json` — the battery list is already correct at 15 files; the guard count stays **74**.
- ❌ Either `/Total: [1-9]\d* tests/` regex (Why §4).
- ❌ `playwright.config.*` — the guards adapt to the config, never the reverse.
- ❌ `scripts/suite-red-inventory.mjs` and `scripts/suite-red-inventory.test.mjs` — untouched by this task.
- ❌ `logs/suite-red-inventory.md` — **do not regenerate it.**
- ❌ `src/**` and `e2e/**` — this task changes no player-facing byte and no spec.
- ❌ Any other file under `scripts/`.

Report adjacent problems; do not fix them.

## Self-check before READY-FOR-GATES

1. `npx tsc --noEmit` clean; `npm run build` green.
2. Scope 1's eight observations quoted verbatim, with the mechanism confirmation from 1b.
3. Scope 5's **ten consecutive green batteries** quoted, with the new median wall-time.
4. Scope 6's four results quoted (`scripts/` × 2, `run-guards`, guard count still **74**).
5. Control m1 recorded with its verdict and the subject restored + confirmed byte-identical.
6. `git status` shows **only** the two permitted paths.
7. Zero `src/` and zero `e2e/` bytes ⇒ no browser run and no screenshots are required; say so explicitly rather than silently omitting them.

**READY-FOR-GATES** + report: the scope-1 rate and mechanism, the scope-3 assertion form you chose and why, the m1 verdict, the scope-5 ten-run result with wall-time, and anything you found that this master got wrong.
