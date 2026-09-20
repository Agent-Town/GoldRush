# lane-f1510-3-inventory-revision-metadata — FIRE-AUTHORED (attended review welcome)

**Role:** Codex runner, lane-b. **Workdir:** `worktrees/lane-b` (branch `lane/b`).

## PRE-FLIGHT (STOP conditions — run these before you touch anything)

1. The lane must carry this fire's pricing commit, which is the freshness proof:
   `git merge-base --is-ancestor 17556e86f HEAD`
   → **non-zero = STOP.** Report `LANE STALE — missing 17556e86f` and do nothing else.
2. Prove each subject region is present and unmoved. All three greps are **file-scoped**, so nothing
   written in `tasks/**` — including this master — can move them (F-1310-1 / F-1425-2):
   - `grep -c "configured workers \*\*" scripts/suite-red-inventory.mjs` → must print exactly **1**
   - `grep -c "workers: isFireShell ? 1 : undefined," playwright.config.ts` → must print exactly **1**
   - `grep -c "reducer reports configured and actual workers distinctly" scripts/suite-red-inventory.test.mjs` → must print exactly **1**

   Any **0 = the lane drifted → STOP** and report `SUBJECT ABSENT` naming which one.
   (All three measured **1 on main** by s1516 at authoring time.)
3. **The line-50 bar, checked BEFORE you start so you know your own baseline:**
   `grep -n "workers: isFireShell ? 1 : undefined," playwright.config.ts` → must print **`50:`**.
   If it does not already print 50, **STOP and report** — the constraint in scope 1 is stated against
   50 and a different starting line means the ground moved under this master.
4. `git status --porcelain` must be clean of tracked dirt outside `logs/**`
   (`logs/**` churn is the standing FACTORY-CHURN EXCEPTION, F-1407-1). Tracked dirt elsewhere = STOP.

## READ FIRST (paths, not memory)

- `docs/bench/s1516-f1510-3-successor-pricing.md` — **read this first and in full.** It is the
  pricing this task was authored from: the probe output, the five-conjunct gate table, and the three
  constraints that would otherwise cost you a run. Its numbers are your orientation.
- `playwright.config.ts` — read `:45`-`:58` (the `defineConfig` head, `workers` at `:50`) and the
  comment block at `:5`-`:22` explaining why `workers` is load-bearing.
- `scripts/suite-red-inventory.mjs` — read `:9`-`:17` (how `input`/`runRoot` are resolved; the
  generator is a **reducer of a report produced in another checkout**) and the provenance header
  array around `:255`-`:265`.
- `scripts/suite-red-inventory.test.mjs` — read `fixture()` at `:14`-`:50` and the test
  `reducer reports configured and actual workers distinctly` at `:90`. You extend this file; do not
  add a new one.
- `tasks/BACKLOG.md`, the **F-1510-3** row — the gate sentence and its s1514 revision.

## WHY (evidence, quoted and dated)

**F-1510-3 (s1510, gate revised s1514)** — `logs/suite-red-inventory.md` records the *instrument*
(workers, parallelism, shard, Playwright version) and nothing identifying the *tree*, so its verdicts
cannot be re-measured without archaeology. s1510 needed a proven-green bisect endpoint and had to
recover it by pulling a per-test `startTime` out of the compact JSON and timestamp-matching it
against `git log`.

**GATE (revised s1514, verbatim):** *closes when `logs/suite-red-inventory.md` names the commit THE
SUITE RAN AT — which requires the revision to be captured BY the Playwright run and threaded
alongside the raw report, then copied verbatim by the reducer. Deriving a revision while reducing is
disqualified by construction.*

That revision matters: `e47354c6` (s1514) established as a **negative result** that
`git rev-parse HEAD` **at generation time names the wrong tree by construction** — the generator
reduces a raw report produced in a different checkout. The previous gate was not merely unmet, it
was *unmeetable as written*. Do not reintroduce a derive-while-reducing shortcut.

**What s1516 measured, and why this is now a small task.** The scope note warned that the cure
"reaches the run harness, not just the reducer". It does — and the run harness **already has a
metadata channel**. `report.config.metadata` exists in the tracked snapshot carrying
`{"actualWorkers":2}`, injected by Playwright itself
(`node_modules/playwright/lib/runner/index.js:6092`, which **mutates** the metadata object rather
than replacing it — that is why user-declared keys survive). Proven by probe outside the repo:

```
--- config.metadata as serialized by the json reporter ---
{ "revision": "e67840916ccc460081cff31696bd7f534096f54a",
  "s1516Probe": "threaded-from-config",
  "actualWorkers": 1 }
```

and `report.config.configFile` in the live snapshot is
`…/worktrees/lane-d/playwright.config.ts` — **the config is loaded FROM the tree under test**, so a
value computed at config-evaluation time is that tree's revision.

## SCOPE (each item testable)

1. **Capture the revision in `playwright.config.ts`, WITHOUT MOVING LINE 50.**
   Add a `metadata:` key to the `defineConfig({…})` object carrying at least:
   - `revision` — the tested tree's `git rev-parse HEAD`, computed with **cwd = `__dirname`**
     (the config sits in the tested tree; that is the whole point).
   - `dirty` — whether that tree had uncommitted **tracked** changes.

   ⚠️ **TRACKED-ONLY, and this is measured, not a preference.** Use
   `git status --porcelain --untracked-files=no`. s1516 measured main at **128** porcelain entries
   but only **8** tracked; a naive marker labels nearly every run DIRTY and the field carries no
   information.

   🚫 **HARD CONSTRAINT — `workers: isFireShell ? 1 : undefined,` MUST REMAIN ON LINE 50.**
   Three baselined law pointers cite `playwright.config.ts:50` (`scripts/fire.md`,
   `.claude/skills/drain/SKILL.md`, `tasks/goals.json[calibrate-suite-workers-v2]`), and
   `scripts/law-pointer-guard.mjs` fingerprints every one. **Any line inserted above :50 reds
   `test:node-guards`**, and the law surfaces it would rot are exactly the ones you may not edit.
   - ➡️ Put the `metadata:` key **below** the `workers:` line, and declare the helper as a
     **`function` declaration at the BOTTOM of the file** — function declarations are hoisted, so it
     is callable from the object literal above it. A `const helper = () => …` will NOT work
     (temporal dead zone) and would force the helper above :50.
   - Failure must degrade **loudly and safely**: wrap in try/catch and fall back to the string
     `'unrecorded'` (the house pattern already used for every other provenance field). A config that
     throws takes down every Playwright run in the repo — this must not be able to.

2. **Copy it verbatim in the reducer.** Extend the provenance header array in
   `scripts/suite-red-inventory.mjs` (around `:262`) with the revision and dirty flag, following the
   **exact** shape of the adjacent `Harness:` line, including `?? 'unrecorded'` for absent values.
   - 🚫 **The reducer must COPY, never DERIVE.** Do not call `git` from
     `scripts/suite-red-inventory.mjs` for any purpose. That is the precise thing `e47354c6` proved
     wrong, and a derive would silently reintroduce the defect while looking correct.
   - Old snapshots have no `metadata.revision`; they must render `unrecorded`, not crash and not
     blank.

3. **Guard it by MANUFACTURING THE DEFECT, in the existing test file.**
   Extend `scripts/suite-red-inventory.test.mjs` using the existing `fixture(t, config)` harness —
   it spreads `config` into `report.config`, and the test at `:90` already passes
   `metadata: { actualWorkers: 3 }`, so this is the same move.
   - An arm proving a fixture carrying `metadata: { revision: '<40-hex>', dirty: false }` renders
     that sha into the output markdown.
   - An arm proving a fixture with **no** `metadata` renders `unrecorded` — the degradation path.
   - An arm proving `dirty: true` is visible in the output (a dirty run must not read as clean).
   - ⚠️ **A green on the fixed code is not evidence.** Per the s1299/s1301 standard, prove each arm
     can go red — run it against the pre-change reducer (inline, or by temporarily reverting) and
     **quote the failure**. **Say how you proved it, not merely that you did.**
   - `scripts/suite-red-inventory.test.mjs` is **already rooted** in `test:node-guards` — verify by
     reading the roster in `package.json` and say so. You should not need to touch `package.json`.

4. **Prove you did not move line 50, and did not rot a law pointer.** Both are one command each:
   - `grep -n "workers: isFireShell ? 1 : undefined," playwright.config.ts` → must still print **`50:`**
   - `node scripts/law-pointer-guard.mjs` → must print **PASS**. Baseline measured by s1516 before
     any change: `PASS — every law-surface pointer still lands on the line it was written for`
     (26 pointers, 23 checked, 2 illustrative, 1 known-rotten).

## FIREWALL

**TOUCH-ONLY:** `playwright.config.ts` · `scripts/suite-red-inventory.mjs` ·
`scripts/suite-red-inventory.test.mjs` · your report under `docs/bench/`.

**NO:**
- ❌ **Do NOT edit `scripts/fire.md`, `CLAUDE.md`, `.claude/**`, or `tasks/goals.json`.** If your
  change rots a law pointer, that means scope 1's constraint was violated — **fix your change**, do
  not re-base the pointer. Re-basing law surfaces is a fire/attended act, not a runner act.
- ❌ **Do NOT edit `scripts/law-pointer-baseline.json`.** Regenerating a baseline to absorb your own
  drift is the F-1506-2 laundering class.
- ❌ **Do NOT change the `workers` line itself, or delete it** (F-1270-3 / F-1275-2 — deleting it
  silently re-opens F-1270-1 and returns every fire-side gate to a known-unreliable instrument).
  Do not pin `workers` unconditionally.
- ❌ Do NOT call `git` from `scripts/suite-red-inventory.mjs` (scope 2).
- ❌ Do NOT attempt to regenerate `logs/suite-red-inventory.md` or `-compact.json`, and do not edit
  them. **`logs/suite-red-inventory-raw.json` does not exist on disk** — the reducer's real input is
  untracked, and a genuine regeneration is a ~3 h Playwright suite run, not a lane task. Fixtures are
  the proof path. Editing the tracked snapshot by hand would be fabricating evidence.
- ❌ Do NOT re-pin `scripts/gr-sim.test.mjs` (F-1441-3). Do NOT touch `src/`.

## SELF-CHECK before you report

- [ ] All four pre-flight probes quoted with raw output (`is-ancestor` rc, three `grep -c` = 1, and
      the `grep -n` showing `50:`).
- [ ] The `metadata` block you landed, quoted, **with the hoisted-function placement visible** —
      show that nothing was inserted above `:50`.
- [ ] `grep -n "workers: isFireShell ? 1 : undefined," playwright.config.ts` → `50:` **after** your
      change, pasted not retyped (F-1513-1: a transcribed tally is a wrong tally).
- [ ] `node scripts/law-pointer-guard.mjs` → PASS, pasted.
- [ ] The provenance line the reducer now emits, quoted from actual fixture output — **not** from
      your source.
- [ ] Each of the three new arms quoted **RED against the old behaviour and GREEN against the new**,
      with the method named.
- [ ] Proof you called no `git` from the reducer: `grep -n "git" scripts/suite-red-inventory.mjs`
      with its output shown and explained.
- [ ] `git status --porcelain logs/` — proof the tracked inventory snapshots are untouched.
- [ ] `npm run test:node-guards` — **full raw tally** (`tests/pass/fail/cancelled/skipped`), and say
      how you verified your new arms actually RAN, not merely that the suite passed.
      ⓘ **Expect `rc=1` with exactly 2 reds if your shell is Node 23.11.1** — the standing F-1507-1
      timeout-semantics split, not your change. `.nvmrc` pins **26.4.0**, where the suite was
      **rc=0, 348 tests / 345 pass / 0 fail / 3 skipped** (measured s1515 on the merged tree).
      **Report the tally you got and name your Node version.** Do not bend a test to go green, and do
      not claim a green you did not see. A supervisor reruns this on 26.4.0.
- [ ] `npx tsc --noEmit` rc quoted. ⚠️ You edited `playwright.config.ts`, so this one genuinely
      matters — it is TypeScript, and a config that fails to compile breaks every suite in the repo.
- [ ] **Sanity-run any one spec** (e.g. `npx playwright test e2e/<something-small>.spec.ts
      --workers=1 --reporter=json`) and **confirm `config.metadata.revision` appears in the report**.
      This is the one end-to-end check available to you and it is cheap. Quote the metadata object.
      Any Playwright command passes `--workers=1` (§3.1).
- [ ] **`npm run build` is NOT owed** — this task touches no run surface under `src/`. Say so
      explicitly rather than skipping silently.

**READY-FOR-GATES + report:** the `metadata` block and hoisted helper you landed · the `50:` proof
before and after · `law-pointer-guard` PASS · the emitted provenance line from fixture output · how
you proved each of the three arms can go red · the `grep -n "git"` proof the reducer derives nothing ·
the single-spec end-to-end `config.metadata` capture · the `test:node-guards` raw tally **with your
Node version**.

⚠️ **A NEGATIVE RESULT IS LICENSED, and there is a specific way this could go.** If capturing the
revision at config-evaluation time turns out **not** to name the tested tree — for instance if the
runner resolves the config from a different root than the one it tests, or if `__dirname` under the
TypeScript config loader does not point where this master assumes — **say so with the measurement and
STOP.** That would be a real finding about the harness (it would mean the revision has to ride in the
raw report from a reporter rather than the config), and it is worth more than a field that names the
wrong tree. The precedent is `e47354c6`, whose refusal to manufacture guard arms for output it had
proved false was the correct call: **hardening a defect behind a green test is strictly worse than
shipping nothing.**

ⓘ **Scope note on what "done" means here, so the drain does not over-claim.** This task ships the
MECHANISM. `logs/suite-red-inventory.md` will only *name* a commit at the **next real regeneration**
of the inventory, which no lane task can perform. The F-1510-3 row should therefore be marked
**cured-pending-regeneration, not closed** — the same discipline that correctly kept it open at
s1513 rather than closing it on a cure that met its purpose but not its predicate.
