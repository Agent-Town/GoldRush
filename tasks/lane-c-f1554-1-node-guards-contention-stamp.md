# Task f1554-1: stamp CONTENDED on a node-guards battery that is not running alone (LANE-C, commit prefix "f1554-1:")

**FIRE-AUTHORED (attended review welcome)** — authored s1556 from the F-1554-1 row in `tasks/BACKLOG.md`, with the premise re-measured this fire.

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-c`.

READ FIRST: `AGENTS.md`; the **F-1554-1** row in `tasks/BACKLOG.md` (the finding this cures, filed s1554 2026-08-08); `scripts/run-node-guards.mjs` (49 lines — the file you are changing); `scripts/node-guards-timeout.test.mjs` (**the pattern to copy**: it asserts harness BEHAVIOUR by executing the harness against a temp fixture, never by grepping its source, and it strips `NODE_TEST_CONTEXT` from the child env); `scripts/fire-shell-serialisation.test.mjs` (the both-directions guard shape).

**LANE-CURRENCY CHECK (run BEFORE any edit, F-1424-3):** run
`grep -c 'const NODE_GUARDS_TEST_TIMEOUT_MS = 300_000;' scripts/run-node-guards.mjs`
Expect **exactly 1**. If it returns 0, the lane is stale or the file moved — **STOP and report "lane-c stale: contention-stamp key absent"**, do not improvise a refresh. (Verified s1556: this span matches 1 on `main` and 1 on `lane/c`, and it sits on a single line so `grep` can see it.)

**WHY LANE-C, stated because the slot table would suggest otherwise:** this is factory tooling, not world/visual work. It is queued to lane-c on a MEASURED merge-safety ground: lane-c is the only lane whose `package.json` is **byte-identical to main** (`git diff main lane/c -- package.json` = 0 lines; lanes a/b/d differ by 32/13/13 lines). Scope item 5 edits the single very long `test:node-guards` line in `package.json`, so on any other lane that edit would collide on the one line it must touch. All five files in scope are identical between `main` and `lane/c` (verified s1556), so the lane's 30-commit drift does not intersect this task's surface.

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/c main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. **EVIDENCE-ARTIFACT EXCEPTION (F-1266-1, s1266): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, and any `.png` screenshot — are NEVER "work" and NEVER a STOP, whether they sit as uncommitted dirt or as the entire content of an ahead commit. Screenshots are never byte-identity gated, so their bytes differ from main forever. Discard them (`git checkout -- <paths>` / reset) and PROCEED, listing what you discarded.** Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything. **THEN A CLEANLINESS LINE: `git -C worktrees/lane-c status --short` → must be clean, with the FACTORY-CHURN EXCEPTION — always expected, never a STOP; list them and proceed (F-1407-1): (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*` and any `.png`. What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.**

## Why (F-1554-1, s1554 2026-08-08 — `GATE: none`, fire-authorable; premise re-verified s1556)

F-1537-1 orders the `test:node-guards` battery **run ALONE**, because overlapping runs contaminate each other on the shared `claimed-spec-harness-guard` / `fixture-teardown` fixtures (the s1536 ~19-minute hang). s1554 obeyed that instruction and discovered a fire **cannot**: it measured **three concurrent batteries** while gating f1552-1 — two belonging to the lane-b Codex runner and an attended session, neither of which a fire can see, schedule against, or wait on. Its own run was starved past **35 minutes** without completing, and `kill` is outside the fire bash allowlist, so it could not reclaim even its own process.

The half that decides what to build: **contention manufactures REDS, never GREENS.** Starvation cannot make a failing assertion pass. So a contended green is *sound*, while a contended red is *worthless* — and the real damage is that a fire holding a red **cannot tell which kind it has**, and the two demand opposite acts (investigate vs re-run). That is the exact shape that let the `cross-engine` excused label rot for five fires (F-1460-1).

F-1554-1's cure, verbatim: *"have `scripts/run-node-guards.mjs` `pgrep -f run-node-guards` at start-up and, when it finds a sibling, print one loud `CONTENDED — n concurrent batteries` line and stamp the same words into its summary."*

⛔ **The finding's own standing prohibition, which is binding scope here: do NOT make contention a failure.** That would red the board every time the factory is busy — i.e. exactly when throughput matters — and would be excused into uselessness within a week. **The exit code must be byte-for-byte what it is today, in every case.**

✓ **VERIFIED s1556 by READING the file:** `scripts/run-node-guards.mjs` is 49 lines and contains no `pgrep`, no `CONTEND`, no `concurrent` and no sibling detection of any kind. The premise is live.

✓ **VERIFIED s1556 by MEASURING the live process shape — and it corrects the arithmetic the naive cure would do.** A single battery presents **TWO** matching processes to an external observer, not one:

```
92951  ppid 92940  sh -c node scripts/run-node-guards.mjs scripts/wrangler-version-assert.test.mjs …
92952  ppid 92951  node scripts/run-node-guards.mjs scripts/wrangler-version-assert.test.mjs …
```

`npm run` interposes a `sh -c` wrapper whose command line also contains the harness path. So `pgrep -f run-node-guards | wc -l` **double-counts**: it would report `2` for a battery running perfectly alone. This is almost certainly what F-1554-1 itself saw — it reports the siblings as the **pairs** `34453/34454` and `69380/69381`, which by this measurement are **two batteries, not four**. The finding's conclusion is unaffected; only the number the stamp must print is. **Count batteries, not pids.**

✓ **VERIFIED s1556, and you must re-prove it rather than trust me:** macOS `pgrep` **excludes the calling process and all of its ancestors by default** (the `-a` flag re-includes them). Since the harness itself spawns the `pgrep`, its own `sh -c` wrapper and node process are ancestors of that `pgrep` and are therefore excluded automatically. This is the property that makes self-detection a non-issue — but it is platform-specific, so scope item 6 requires you to prove it by execution, not by citing this paragraph.

## Scope

1. **Detect sibling batteries in `scripts/run-node-guards.mjs`, before the existing `spawnSync`.** Use `pgrep -f run-node-guards`. Convert the matching processes into a count of **batteries, not pids** — the `sh -c` wrapper and its `node` child are the same battery (see the measured shape above). State in a code comment how you collapsed them and why.

2. **When at least one sibling battery is found, print exactly `CONTENDED — n concurrent batteries`** (with `n` the battery count) to **stderr**, once at start-up. The words `CONTENDED` and `concurrent batteries` must appear literally — later fires will grep for them.

3. **Print the same stamp a second time after the child exits**, immediately before the process exits, so a reader scrolling to the END of a long log sees it next to the pass/fail counts. This is how "stamp the same words into its summary" is satisfiable: the harness inherits stdio and writes no summary file of its own, so the end-of-output position **is** the summary position. If you find a genuinely better summary surface, use it and say why in your report.

4. **When no sibling is found, print NOTHING about contention.** Existing output must be unchanged byte-for-byte in the alone case. This is the false-positive direction and it is as important as the detection.

5. **New guard `scripts/node-guards-contention.test.mjs`, registered in the `test:node-guards` list in `package.json`.** Copy the shape of `scripts/node-guards-timeout.test.mjs`: execute the harness against a temp fixture **outside the repo** (so the battery's own glob guards never collect it), and strip `NODE_TEST_CONTEXT` from the child env (`node:test` exports it, and a nested `node --test` inheriting it switches to the machine-readable reporter and every assertion fails for an unrelated reason). Assert **both directions, the violation path by MANUFACTURING it** — a passing guard that never executes its violation path is not evidence about the red (the s1299/s1300 standard):
   - **(a) DETECTION:** with a real sibling battery alive (spawn one on a slow fixture, e.g. a fixture test that sleeps a few seconds; bound it and always clean it up, including on assertion failure), the harness prints `CONTENDED` naming the **correct battery count**.
   - **(b) NO FALSE POSITIVE:** with no sibling, the harness prints **no** `CONTENDED` line — this is the assertion that catches the double-count and the self-match.
   - **(c) EXIT CODE UNCHANGED:** the harness's exit status is identical with and without a sibling, for both a passing and a failing fixture. **This is the assertion that enforces the finding's "not a hard gate" prohibition.**

6. **Prove the self-exclusion property by execution** rather than by citing this task: assert that a harness run with no siblings does not detect *itself* (covered by 5b), and note in your report what `pgrep`'s default self/ancestor exclusion did on this machine.

7. **Never let detection break the battery.** If `pgrep` is missing, exits non-zero (it exits 1 when nothing matches — that is the normal alone case, not an error), returns junk, or throws for any reason, swallow it and run the battery exactly as today. Detection is advisory instrumentation; it may never be the reason a gate fails to run. Assert this with a fixture or an injected failure if you can do so without contorting the code — if you cannot, say so in your report rather than faking it.

## Firewall

Touch ONLY: `scripts/run-node-guards.mjs`; `scripts/node-guards-contention.test.mjs` (new); the `test:node-guards` value in `package.json` (add the new guard to the list — **do not reorder or remove any existing entry**).

NO changes to: `scripts/node-guards-concurrency.mjs`; the `NODE_GUARDS_TEST_TIMEOUT_MS` value or the F-1400-4 comment block above it; `scripts/node-guards-timeout.test.mjs`; `scripts/node-guards-concurrency.test.mjs`; any other guard in the battery; any `src/**`; any sim semantics; any existing e2e assertion; any other task's fresh work. **Do NOT change the harness's exit-code behaviour in any case — that is the point of the task, not a detail of it.**

## Self-check (evidence, not vibes)

- `npx tsc --noEmit` rc=0 and `npm run build` green.
- `node --test scripts/node-guards-contention.test.mjs` — the new guard green, **run alone**, with the manufactured-defect arms (5a/5b/5c) visibly executing. Paste the real output.
- `node --test scripts/node-guards-timeout.test.mjs scripts/node-guards-concurrency.test.mjs scripts/fire-shell-serialisation.test.mjs` — the three harness-adjacent guards unmodified-green, run alone. Paste counts.
- `npm run test:node-guards` — the full battery. ⚠️ **It is ~181 s and F-1537-1 says run it ALONE; if you cannot get a quiet board, say so and report the count you got plus whether a `CONTENDED` stamp appeared** — a contended green is sound, a contended red must be re-run before you believe it (F-1554-1). **Report whether YOUR OWN run printed the stamp, and whether that was correct.**
- Report the exit codes observed in arm 5c side by side (sibling vs alone, passing vs failing fixture).
- No screenshots and no perf line: this task renders nothing.

**No-op guard:** if you find yourself about to exit without changes, **WRITE WHY into your report first** — a silent no-op wastes a queue slot and a gate. In particular, if you conclude the detection cannot be made reliable, report the measurement that shows it rather than leaving the file untouched.

End: **READY-FOR-GATES** + report: the battery count logic you chose and how you collapsed the `sh -c` wrapper; what `pgrep`'s self/ancestor exclusion did on this machine; the exit codes from arm 5c; whether your own full-battery run was contended; and anything you had to adapt from this master, with the reason.
