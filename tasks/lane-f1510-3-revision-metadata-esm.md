# lane-f1510-3-revision-metadata-esm — FIRE-AUTHORED (attended review welcome)

**Role:** Codex runner, lane-b. **Workdir:** `worktrees/lane-b` (branch `lane/b`).

This is the successor to `lane-f1510-3-inventory-revision-metadata.md`, which merged `f9c0e498` as a
**negative result**. That task was right about everything except one line. **The line is now measured
and this master hands you the answer** — see READ FIRST. Your job is smaller than it looks.

## PRE-FLIGHT (STOP conditions — run these before you touch anything)

1. The lane must carry this fire's evidence commit, which is the freshness proof:
   `git merge-base --is-ancestor 263ee338c HEAD`
   → **non-zero = STOP.** Report `LANE STALE — missing 263ee338c` and do nothing else.
2. Prove each subject region is present and unmoved. All three greps are **file-scoped**, so nothing
   written in `tasks/**` or `docs/**` — including this master — can move them (F-1310-1 / F-1425-2):
   - `grep -c "configured workers \*\*" scripts/suite-red-inventory.mjs` → must print exactly **1**
   - `grep -c "workers: isFireShell ? 1 : undefined," playwright.config.ts` → must print exactly **1**
   - `grep -c "reducer reports configured and actual workers distinctly" scripts/suite-red-inventory.test.mjs` → must print exactly **1**

   Any **0 = the lane drifted → STOP** and report `SUBJECT ABSENT` naming which one.
   (All three measured **1 on main** by s1517 at authoring time.)
3. **The line-50 bar, checked BEFORE you start so you know your own baseline:**
   `grep -n "workers: isFireShell ? 1 : undefined," playwright.config.ts` → must print **`50:`**.
   If it does not already print 50, **STOP and report** — scope 1's constraint is stated against 50
   and a different starting line means the ground moved under this master.
4. **Confirm the module system you are actually in** — this is the whole reason the last run stopped:
   `grep -n '"type"' package.json` → must show `"type": "module"`.
   If it does not, **STOP and report** — the ESM premise below is false and the cure changes.
5. `git status --porcelain` must be clean of tracked dirt outside `logs/**`
   (`logs/**` churn is the standing FACTORY-CHURN EXCEPTION, F-1407-1). Tracked dirt elsewhere = STOP.

## READ FIRST (paths, not memory)

- **`docs/bench/s1517-f1510-3-esm-dirname-proof.md` — read this first and in full.** It contains the
  measured answer to the question that stopped the previous run, the discriminating run that proves
  the value is config-anchored rather than cwd-shaped, a real JSON-reporter capture, and the
  **exact file arrangement** that keeps `workers:` on line 50. Its diff block is the shape you are
  landing. Treat its §5 caveat as binding: it says plainly which one thing it did **not** re-run.
- `docs/bench/f1510-3-inventory-revision-metadata-negative-result.md` — the previous run's report.
  Its "Manufactured reducer REDs" section already proved scope 3's three arms red-then-green; you are
  re-walking a path someone surveyed, not cutting a new one.
- `docs/bench/s1516-f1510-3-successor-pricing.md` — the five-conjunct gate table. ⓘ It was corrected
  in place after `f9c0e498`; read it for the conjuncts, not for the `__dirname` claim.
- `playwright.config.ts` — read `:45`–`:58` (the `defineConfig` head, `workers` at `:50`) and the
  comment block at `:5`–`:22` explaining why `workers` is load-bearing.
- `scripts/suite-red-inventory.mjs` — read `:9`–`:17` (the generator is a **reducer of a report
  produced in another checkout**) and the provenance header array around `:255`–`:265`.
- `scripts/suite-red-inventory.test.mjs` — read `fixture()` at `:14`–`:50` and the test
  `reducer reports configured and actual workers distinctly` at `:90`. You extend this file.
- `tasks/BACKLOG.md`, the **F-1510-3** row — the gate sentence and its s1514 revision.

## WHY (evidence, quoted and dated)

**F-1510-3 (s1510, gate revised s1514)** — `logs/suite-red-inventory.md` records the *instrument*
(workers, parallelism, shard, Playwright version) and nothing identifying the *tree*, so its verdicts
cannot be re-measured without archaeology.

**GATE (revised s1514, verbatim):** *closes when `logs/suite-red-inventory.md` names the commit THE
SUITE RAN AT — which requires the revision to be captured BY the Playwright run and threaded
alongside the raw report, then copied verbatim by the reducer. Deriving a revision while reducing is
disqualified by construction.*

Two negative results stand behind this task and both are load-bearing:

- **`8134ec30` (s1514):** `git rev-parse HEAD` **at generation time names the wrong tree by
  construction** — the generator reduces a raw report produced in a different checkout. Do not
  reintroduce a derive-while-reducing shortcut.
- **`f9c0e498` (s1516):** Playwright loads this repo's TS config as **ESM**, so **`__dirname` is
  undefined**; `captureRevision` threw and the fallback serialised `revision: "unrecorded"`. The
  runner correctly refused to ship guards around output it had proved false.

**What s1517 measured, in a worktree of THIS repository** (`docs/bench/s1517-f1510-3-esm-dirname-proof.md`):

```text
S1517_PROBE import.meta.dirname=/Users/robin/Claude/Projects/Gold Rush/gate-s1517
S1517_PROBE typeof __dirname=undefined
S1517_PROBE cwd=/Users/robin/Claude/Projects/Gold Rush        ← run from the repo root, config elsewhere
```

and, with the full mechanism in place, a real single-spec run:

```text
config.metadata = {"revision":"cb276b780de1628e003b9178435e622d253c798b","dirty":true,"actualWorkers":1}
```

**All five gate conjuncts are now proved, and the fifth was proved in the subject tree rather than
next to it** — that distinction is [F-1516-1], the finding that cost the last lane run.

## SCOPE (each item testable)

1. **Capture the revision in `playwright.config.ts`, WITHOUT MOVING LINE 50.**
   Add a `metadata:` key to the `defineConfig({…})` object carrying:
   - `revision` — the tested tree's `git rev-parse HEAD`, computed with **cwd = `import.meta.dirname`**.
   - `dirty` — whether that tree had uncommitted **tracked** changes.

   ✅ **USE `import.meta.dirname`. Do NOT use `__dirname`** — it is undefined here and that is exactly
   what stopped `f9c0e498`. It is available on the pinned Node 26.4.0 (`.nvmrc`) and was measured
   resolving to the config's own directory under Playwright's TS loader.
   - If you prefer `fileURLToPath(import.meta.url)` it also works, but read the proof doc's §2 trap
     first: this repo's path contains a **space**, `import.meta.url` is percent-encoded
     (`Gold%20Rush`), and a hand-rolled `.replace('file://','')` produces a path that does not exist.
   - 🚫 Do **not** substitute `process.cwd()`. It was measured differing from the config's directory
     in the ordinary case of running from the repo root — it would name the wrong tree.

   ⚠️ **TRACKED-ONLY, and this is measured, not a preference.** Use
   `git status --porcelain --untracked-files=no`. s1517 measured main at **142** porcelain entries but
   only **6** tracked (s1516: 128 / 8); a naive marker labels nearly every run DIRTY and the field
   carries no information.

   🚫 **HARD CONSTRAINT — `workers: isFireShell ? 1 : undefined,` MUST REMAIN ON LINE 50.**
   Three baselined law pointers cite `playwright.config.ts:50` (`scripts/fire.md`,
   `.claude/skills/drain/SKILL.md`, `tasks/goals.json[calibrate-suite-workers-v2]`), and
   `scripts/law-pointer-guard.mjs` fingerprints every one. **s1517 demonstrated the failure rather
   than predicting it:** a top-of-file placement pushed `workers:` to `:69` and produced
   `FAIL — 3 pointer problem(s)`.
   - ➡️ Put the `metadata:` key **below** the `workers:` line, and place the `import` **and** a
     **`function` declaration** at the **BOTTOM of the file**. ESM `import` declarations are hoisted
     and legal anywhere at module top level; `function` declarations hoist too, so the helper is
     callable from the object literal above it. **A `const helper = () => …` will NOT work**
     (temporal dead zone) and would force the helper above `:50`.
   - Failure must degrade **loudly and safely**: wrap in try/catch and fall back to the string
     `'unrecorded'`. A config that throws takes down every Playwright run in the repo.

2. **Copy it verbatim in the reducer.** Extend the provenance header array in
   `scripts/suite-red-inventory.mjs` (around `:262`) with the revision and dirty flag, following the
   **exact** shape of the adjacent `Harness:` line, including `?? 'unrecorded'` for absent values.
   - 🚫 **The reducer must COPY, never DERIVE.** Do not call `git` from
     `scripts/suite-red-inventory.mjs` for any purpose. That is the precise thing `8134ec30` proved
     wrong, and a derive would silently reintroduce the defect while looking correct.
   - Old snapshots have no `metadata.revision`; they must render `unrecorded`, not crash and not blank.

3. **Guard it by MANUFACTURING THE DEFECT, in the existing test file.**
   Extend `scripts/suite-red-inventory.test.mjs` using the existing `fixture(t, config)` harness — it
   spreads `config` into `report.config`, and the test at `:90` already passes
   `metadata: { actualWorkers: 3 }`, so this is the same move.
   - An arm proving a fixture carrying `metadata: { revision: '<40-hex>', dirty: false }` renders that
     sha into the output markdown.
   - An arm proving a fixture with **no** `metadata` renders `unrecorded` — the degradation path.
   - An arm proving `dirty: true` is visible in the output (a dirty run must not read as clean).
   - ⚠️ **A green on the fixed code is not evidence.** Per the s1299/s1301 standard, prove each arm can
     go red against the pre-change reducer and **quote the failure**. **Say how you proved it, not
     merely that you did.** ⓘ `f9c0e498` already did this once and got
     `tests 10 / pass 7 / fail 3`; you may cite that as corroboration but you must **re-run it
     yourself** — that tally was taken on a tree that no longer exists.
   - `scripts/suite-red-inventory.test.mjs` is **already rooted** in `test:node-guards` — verify by
     reading the roster in `package.json` and say so. You should not need to touch `package.json`.

4. **Prove you did not move line 50, and did not rot a law pointer.** One command each:
   - `grep -n "workers: isFireShell ? 1 : undefined," playwright.config.ts` → must still print **`50:`**
   - `node scripts/law-pointer-guard.mjs` → must print **PASS**. Baseline measured by s1517 before any
     change: `PASS` (26 pointers, 23 checked, 2 illustrative, 1 known-rotten).

## FIREWALL

**TOUCH-ONLY:** `playwright.config.ts` · `scripts/suite-red-inventory.mjs` ·
`scripts/suite-red-inventory.test.mjs` · your report under `docs/bench/`.

**NO:**
- ❌ **Do NOT edit `scripts/fire.md`, `CLAUDE.md`, `.claude/**`, or `tasks/goals.json`.** If your change
  rots a law pointer, that means scope 1's constraint was violated — **fix your change**, do not
  re-base the pointer. Re-basing law surfaces is a fire/attended act, not a runner act.
- ❌ **Do NOT edit `scripts/law-pointer-baseline.json`.** Regenerating a baseline to absorb your own
  drift is the F-1506-2 laundering class.
- ❌ **Do NOT change the `workers` line itself, or delete it** (F-1270-3 / F-1275-2 — deleting it
  silently re-opens F-1270-1 and returns every fire-side gate to a known-unreliable instrument). Do
  not pin `workers` unconditionally.
- ❌ Do NOT call `git` from `scripts/suite-red-inventory.mjs` (scope 2).
- ❌ Do NOT attempt to regenerate `logs/suite-red-inventory.md` or `-compact.json`, and do not edit
  them. **`logs/suite-red-inventory-raw.json` does not exist on disk** — a genuine regeneration is a
  ~3 h Playwright suite run, not a lane task. Fixtures are the proof path. Editing the tracked
  snapshot by hand would be fabricating evidence.
- ❌ Do NOT re-pin `scripts/gr-sim.test.mjs` (F-1441-3). Do NOT touch `src/`.

## SELF-CHECK before you report

- [ ] All five pre-flight probes quoted with raw output (`is-ancestor` rc, three `grep -c` = 1, the
      `grep -n` showing `50:`, and the `"type": "module"` line).
- [ ] The `metadata` block you landed, quoted, **with the bottom-of-file placement visible** — show
      that nothing was inserted above `:50`.
- [ ] `grep -n "workers: isFireShell ? 1 : undefined," playwright.config.ts` → `50:` **after** your
      change, pasted not retyped (F-1513-1: a transcribed tally is a wrong tally).
- [ ] `node scripts/law-pointer-guard.mjs` → PASS, pasted.
- [ ] The provenance line the reducer now emits, quoted from actual fixture output — **not** from your
      source.
- [ ] Each of the three new arms quoted **RED against the old behaviour and GREEN against the new**,
      with the method named.
- [ ] Proof you called no `git` from the reducer: `grep -n "git" scripts/suite-red-inventory.mjs` with
      its output shown and explained.
- [ ] `git status --porcelain logs/` — proof the tracked inventory snapshots are untouched.
- [ ] `npm run test:node-guards` — **full raw tally** (`tests/pass/fail/cancelled/skipped`), and say
      how you verified your new arms actually RAN, not merely that the suite passed.
      ⓘ **Expect `rc=1` with exactly 2 reds if your shell is Node 23.11.1** — the standing F-1507-1
      timeout-semantics split, not your change. `.nvmrc` pins **26.4.0**, where the suite was
      **rc=0, 351 tests / 348 pass / 0 fail / 3 skipped** (measured s1516 on the merged tree).
      **Report the tally you got and name your Node version.** Do not bend a test to go green, and do
      not claim a green you did not see. A supervisor reruns this on 26.4.0.
- [ ] `npx tsc --noEmit` rc quoted. ⚠️ You edited `playwright.config.ts`, so this genuinely matters — a
      config that fails to compile breaks every suite in the repo.
- [ ] **The end-to-end capture, WITH the tracked-only flag in place.** Run one small spec:
      `npx playwright test _s106-prospector-boot-probe.spec.ts --project=desktop-chrome --workers=1 --reporter=json`
      and **quote `config.metadata`**. It must show a real 40-hex `revision`, a boolean `dirty`, and
      Playwright's `actualWorkers` alongside them.
      🎯 **This is the check s1517 explicitly did NOT run with `--untracked-files=no` and flagged as
      unproved** — it is your job, not a formality. s1517's capture with the bare flag was
      `{"revision":"cb276b780de1628e003b9178435e622d253c798b","dirty":true,"actualWorkers":1}` at 4.0 s
      wall; yours should differ only in the sha and possibly `dirty`.
      Any Playwright command passes `--workers=1` (§3.1).
- [ ] **`npm run build` is NOT owed** — this task touches no run surface under `src/`. Say so
      explicitly rather than skipping silently.

**READY-FOR-GATES + report:** the `metadata` block and bottom-of-file helper you landed · the `50:`
proof before and after · `law-pointer-guard` PASS · the emitted provenance line from fixture output ·
how you proved each of the three arms can go red · the `grep -n "git"` proof the reducer derives
nothing · the single-spec end-to-end `config.metadata` capture **with the tracked-only flag** · the
`test:node-guards` raw tally **with your Node version**.

⚠️ **A NEGATIVE RESULT IS STILL LICENSED, though the known hazard is now closed.** The `__dirname`
wall is measured and cured. But if `import.meta.dirname` behaves differently in the lane worktree than
it did in `gate-s1517` — different Playwright cache state, a transpile path this fire did not
exercise — **say so with the measurement and STOP.** Two negative results in a row on this row would
itself be the finding. The precedent is `8134ec30` and `f9c0e498`: **hardening a defect behind a green
test is strictly worse than shipping nothing.**

ⓘ **Scope note on what "done" means here, so the drain does not over-claim.** This task ships the
MECHANISM. `logs/suite-red-inventory.md` will only *name* a commit at the **next real regeneration** of
the inventory, which no lane task can perform. The F-1510-3 row should therefore be marked
**cured-pending-regeneration, not closed** — the same discipline that correctly kept it open at s1513.
