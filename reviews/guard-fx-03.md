# guard-fx-03-fixture-teardown-class — review

**Slice:** `guard-fx-03-fixture-teardown-class` (lane-a slot) · **branch:** `lane/m3` · **tip:** `5abffe47` `runner(lane-a): guard-fx-03-fixture-teardown-class.md`
**Drained:** s1240, 2026-07-30 · **merge-base:** `f14cc1c3 (archive: pruned by the A3 rewrite)`
**Conflict of interest, declared up front:** this slice was **FIRE-AUTHORED by s1239**, one fire before this drain. It is a sibling fire's master, not this fire's own, but it is still house-authored — so **every claim in the runner's report was re-derived by command on the merged tree**, and two mutation arms the report never ran were added (§Mutation arms B and C). Nothing below is quoted from the report without an independent measurement beside it.

## Verdict

**PASS — MERGED.** The leak is closed at the population level (delta **0** across two full batteries), the guard is mutation-proved on **three** independent arms, its denominator was verified complete by an independent sweep rather than trusted, and the firewall is exact (3 files, 0 player-visible bytes).

## What it does

`scripts/site-contract.test.mjs` was the one harness in the guard battery that created temp fixtures and never removed them: `mkdtempSync` at `:114` (`gr-site-parse-`) and `:155` (`gr-site-inline-`), with `rmSync` **not imported at all**. Both dirs were created *outside* any `try`, so it leaked on the **green** path — two directories per invocation, and the file runs twice per drain battery (once under `test:node-guards`, once under `run-guards.mjs` as a `GATE_GUARD`).

The slice does two things. It wraps both fixture regions in `try { … } finally { rmSync(tmp, { recursive: true, force: true }) }`, copying the settled house shape from `scripts/subject-tree.test.mjs:11–15` — assertions inside the `try`, so a *failing* assertion also tears down. And it adds `scripts/fixture-teardown.test.mjs`, a runtime guard that discovers every `mkdtemp`-using `scripts/*.test.mjs`, extracts each file's **own** temp-dir prefix literals from its source, runs it as a child with `TMPDIR` redirected to a fresh scratch dir, and asserts zero survivors matching *that file's* prefixes.

The prefix-scoping is the load-bearing design choice, and it is the reason this guard tells the truth. The obvious implementation — "assert the scratch dir is empty" — **emits false reds**: `town-spec-collection`, `whole-suite-collection` and `run-guards.test` each leave `node-compile-cache` / `playwright-transform-cache-501` behind. Those are Node's and Playwright's own caches, written into whatever `TMPDIR` points at; they are not fixtures and not ours to delete. s1239 found that by prototyping rather than proposing; this drain confirms all three read **0** under prefix-scoping (see the arm-A survivor table, where they appear as `0 []`).

## Evidence

All measured on the merged tree (main + the 3 files), this fire. Reds and greens read by **test-case text via the TAP reporter**, never by `rc` alone — `node --test` defaults to the *spec* reporter and emits no TAP `not ok` lines, the exact false negative recorded as F-1238-3.

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **rc=0** |
| `npm run build` | **rc=0** (`✓ built in 1.21s`; asset-diet ceilings respected) |
| `node --test scripts/site-contract.test.mjs` | **rc=0, 7/7 by name, 0 notok** (115 ms) |
| `node --test scripts/fixture-teardown.test.mjs` | **rc=0, 1/1**, title states **10** subjects (26.2 s) |
| `npm run test:node-guards` | **rc=0** ×3 runs — `tests 111 · pass 111 · fail 0 · skipped 0 · todo 0` (30.7 / 31.4 / 31.2 s) |
| `node scripts/run-guards.mjs` | **rc=0, `guards: 8/8 passed`** (123 s) — incl. `test:mp` **PASS** |
| Adjacent `scripts/run-guards.test.mjs` | **rc=0, 10/10** (4.8 s) |
| Adjacent `scripts/subject-tree.test.mjs` | **rc=0, 7/7** (0.1 s) |
| Adjacent `scripts/script-tree-parse.test.mjs` | **rc=0, 5/5** (0.8 s) — **grep-derived; the runner never named it** |
| Boot probe / screenshots | **not owed and not fabricated** — 0 files under `src/ e2e/ assets/ public/` |

**Adjacent suites were derived by grep, not from the runner's list.** Sweeping `scripts/ e2e/ functions/ src/ .github/` for references to the two changed test files surfaced `scripts/script-tree-parse.test.mjs`, which the runner's report did not mention. Run individually: **5/5 green**. Its reference turns out to be a comment at `:26` naming `test:deploy-site-contract` in a worked example, not a real coupling — but that verdict came from reading the line, not from assuming it.

### Population-level proof of the cure (scope 6)

| | `gr-site-(parse|inline)-*` in `os.tmpdir()` |
|---|---|
| Before | **142** |
| After `npm run test:node-guards` ×2 | **142** |
| **Delta** | **0 — leak closed** |

Independently corroborating s1239's re-measurement: oldest survivor is `gr-site-parse-Sgg0Dd` at **2026-07-29T16:58:55.835Z** — the identical directory and timestamp s1239 reported, which cross-checks the two fires' instruments against each other and re-confirms that **F-1238-2's "accumulating since 2026-07-09" claim is false** (the window is ~4 h, not 21 days). The guard also leaves **0** of its own `gold-rush-fixture-teardown-*` scratch dirs — it is its own first customer, as the master required.

**The pre-existing backlog of 142 leaked dirs was NOT swept.** They are the evidence, they live in `os.tmpdir()` and not in the repo, and deleting them is not this task's business.

### Denominator verified independently, not trusted (the guard-scope trap)

The guard discovers subjects with `readdirSync(scripts/)` filtered to `*.test.mjs` — a **narrower** tree than the four s1239 swept to measure the class. That gap is exactly where a guard's denominator quietly ends up smaller than its cure, so it was checked rather than assumed. An independent walk of `scripts/ e2e/ functions/ src/`:

- **13** files call `mkdtemp` — **11** are `*.test.mjs`, **2** are non-test scripts (`anim-pass-reextract.mjs`, `stream-showcase.mjs`, both already pairing `mkdtemp` with `rmSync`).
- **All 11** `*.test.mjs` live at `scripts/` top level. **None is out of the guard's scope.**
- The guard covers **10**, excluding itself (commented, deliberate — it calls `mkdtemp` *and* spawns `node --test` per subject, so self-inclusion is unbounded recursion).

Arithmetic reconciles with s1239's pre-slice count of 12/10: the new guard file adds one to each. **The denominator is complete.**

### Mutation arms — three, each red identified by message text

| Arm | Mutation | Result |
|---|---|---|
| **A** (report's, re-run) | restore `site-contract.test.mjs` to its pre-fix blob `0d8bd8a3` (`rmSync` absent, verified) | **rc=1**, RED naming the file **and both prefixes**: `scripts/site-contract.test.mjs: 2 [gr-site-inline-8xYRwd, gr-site-parse-lAaFbf]`; the other **9** subjects all `0 []`, including the three false-red candidates |
| **B** (**new — the report never ran it**) | make `stream-curate.test.mjs`'s prefix dynamic so **zero** literal prefixes are extractable | **rc=1**, RED: `scripts/stream-curate.test.mjs calls mkdtemp but yielded 0 extractable literal prefixes` — it names the file rather than silently skipping it |
| **C** (**new — the report never ran it**) | delete the `NODE_TEST_CONTEXT` scrub, so children inherit it and execute **zero** tests | **rc=1**, RED with its own backstop message: `child reported zero executed tests` |

All three subjects restored **byte-identically**, verified by `git hash-object`: `9fdc7918…` (site-contract), `0a42f8b4…` (stream-curate), `8f24e248…` (the guard itself — matching the blob hash in the runner's own diff header).

**Why arms B and C were added.** This ladder's whole class is *"a guard ships an assertion nothing executes."* The runner proved arm A — the assertion aimed at the defect — and left its own **two new** defensive branches unexercised. Those branches are the scope-3 and scope-4 requirements of the master, and an unrun guard is an unread verdict. Both fire correctly, each with a distinct, file-naming message.

Arm C is the more interesting of the two, because it validates a gotcha the runner *discovered on its own* and wrote a backstop for: a nested `node --test` inherits `NODE_TEST_CONTEXT` and then executes **zero** tests, which would have made this guard report "0 survivors — green" for all ten subjects while running nothing at all. That is *a probe that executes nothing reports zero*, live, and the runner both found it and defended against it. Arm C proves the defence works.

### Wall-time (scope 7)

Self-measured rather than inherited: the registered `test:node-guards` list (23 files, 111 tests) runs **31.2 s**; the same list minus `fixture-teardown.test.mjs` (22 files, 110 tests) runs **16.9 s** → the guard adds **≈14.3 s**. The report claimed **≈13.8 s**, from a baseline of 9.01 s against my 16.9 s. **The delta reproduces; the absolute baseline does not** — this box was more loaded than the runner's, which also explains the isolated guard measuring 26.2 s here against the report's 20.63 s and the prototype's 25.3 s. Serial is acceptable per the master; the guard is dominated by `goal-tracker.test.mjs`'s child run.

## Merge classification

**Base `f14cc1c3 (archive: pruned by the A3 rewrite)`; merged onto clean main; path-scoped checkout, no graft required.**

| File | Class | Detail |
|---|---|---|
| `scripts/fixture-teardown.test.mjs` | **LANE-TOUCHED** | new, +56 |
| `scripts/site-contract.test.mjs` | **LANE-TOUCHED** | +34/−26, teardown only — no assertion, regex or denominator-anchor changed |
| `package.json` | **LANE-TOUCHED** | +1/−1, the `test:node-guards` line only, guard inserted alphabetically |
| `STATUS.md`, `logs/.goal-tree.html`, `logs/dashboard.html`, `logs/task-stats.jsonl`, `logs/session-scratch/s1239-*.txt` | **MAIN-MOVED-ONLY** | present in the two-dot diff purely as main's newer content reading as deletions; not merged |

`git diff --numstat <base> main` over the three lane-touched paths returns **empty** — main had not moved any of them since the base, so no three-way graft was needed and none was invented. The lane branch will be left **1 ahead** by this tip-graft (the file content merges, the commit does not); that is the known phantom shape, not undrained work.

**Firewall: exact.** Three files, matching the master's TOUCH-ONLY list precisely. The nine clean sibling harnesses are untouched — they are the control group proving the pattern is settled, and the master forbade "tidying" them. `scripts/run-guards.mjs` untouched; nothing in it became false.

## Findings

**F-1240-1 (non-blocking, no action owed — recorded for the class ledger).** The guard has **four** assertion branches; **three** are now mutation-proved (arms A, B, C). The fourth — `assert.ok(subjects.length > 0, 'fixture teardown guard covered 0 mkdtemp-using …')` — is **not exercised**, and is not cheaply exercisable: `SCRIPTS` is derived from the guard's own `import.meta.url`, so reaching zero subjects means relocating the guard or emptying `scripts/` of all eleven `mkdtemp` harnesses. Its failure mode is benign (it fires only if the directory loses every fixture-owning harness, which would itself be loud), so this is disclosed rather than corrected. **Noted because the honest tally is 3 of 4, not 4 of 4** — and because this ladder exists precisely to stop "all assertions proved" being said loosely.

**F-1240-2 (non-blocking, observation).** The guard reads child output with `assert.match(run.stdout, /^ℹ tests [1-9]\d*$/m)` — a match against the **spec reporter's** exact human-readable counter line, pinned by passing `--test-reporter=spec` explicitly. It is coupled to a Node output string rather than to a machine contract (TAP's `# tests N`, say). This **fails safe**: if Node changes that line the assertion misses and the guard goes RED, which is a false alarm rather than a false green. So it is a maintenance note, not a defect, and the explicit `--test-reporter=spec` is what makes the coupling deliberate instead of accidental.

**F-1240-3 (method, non-blocking — corroborating datum for F-1238-1).** This fire's `run-guards.mjs` battery was **8/8 with `test:mp` PASS** (5 s). Running tally for that intermittent red: **1 red in 5 full-battery runs** against **0 red in 5 isolated runs**. Still under-sampled, still no corrective authored; the shape continues to point at load/contention rather than a line in the multiplayer probe.

## Class ledger

**Fifth rung shipped** in the named class **F-1232-1 → F-1235-1 → guard-fx-01 → F-1237-1 → guard-fx-03**. The first four were each *"a branch nothing executes"*; this one is *"a resource nothing releases"* — same genre, same cure shape: prove it, then leave an instrument that notices the next one. **F-1238-2 is DISCHARGED.**

And the rung leaves the class's own lesson stamped on it twice over. F-1238-2 was right that the file leaks, right that it leaks on every run, and **wrong by roughly two orders of magnitude about how long it had been leaking** — s1239 caught that with one `statSync` loop, and this drain independently reproduced the same oldest-survivor directory to confirm it. Then the runner, doing the master's small scope-3/4 duties honestly, discovered a Node behaviour (`NODE_TEST_CONTEXT` inheritance) that would have made its own new guard green while executing nothing — and defended against it. **Both the finding that started this rung and the guard that ends it had a false sentence inside a true report.** That is the entire argument for re-deriving numbers you agree with.
