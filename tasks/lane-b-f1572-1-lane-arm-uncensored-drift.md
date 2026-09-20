# Task f1572-1: the lane arm, measured UNCENSORED for the first time — is F-1564-1's "0 breaches in 24" a property of the lane, or of the censoring? (LANE-B, commit prefix "fix:")

**FIRE-AUTHORED (attended review welcome)** — s1572, from **F-1572-1**, whose fire arm s1572 ran itself the same fire (`artifacts/f1572-1-fire-shell-drift/measurement.md`). I did not inherit the premise: I merged the cure (`9bfecb997`), ran the fire arm, and read F-1564-1's closure before writing this scope.

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-b`.

READ FIRST: `AGENTS.md`; `artifacts/f1572-1-fire-shell-drift/measurement.md` — **the fire arm you are pairing against, including its caveat**; `reviews/f1571-1-m4-06-uncensored-drift-sample.md` — **the whole DRAIN section at the foot, because its control-arm table is the method you are repeating**; `e2e/m4-06-embodiment.spec.ts`, the test titled *"permission-denied receipts do not send the Prospector to the denied target"*, whole body — it is the subject and **you must not modify it**; `tasks/BACKLOG.md` rows **F-1572-1**, **F-1572-3**, **F-1571-1**, **F-1564-1** and **F-1563-3**.

**Pre-flight (LANE-SAFETY, runner-auto-commit aware):** the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/b main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. **EVIDENCE-ARTIFACT EXCEPTION (F-1266-1): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, and any `.png` — are NEVER "work" and NEVER a STOP**; discard them and PROCEED, listing what you discarded. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything. Then `git -C worktrees/lane-b status --short` → must be clean, with the **FACTORY-CHURN EXCEPTION (F-1407-1), always expected and never a STOP; list them and proceed: (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*` and any `.png`. What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.**

**SEQUENCING / CITATION CHECK (F-1424-3 — run BOTH before any measurement).** Each key is a single line, verified to print `1` on main at dispatch (s1572):

```sh
grep -c "F-1565-2: assertions follow the drift log so receipt or bark failures cannot suppress its sample." e2e/m4-06-embodiment.spec.ts
grep -c "console.log(\`\[m4-06-denied\] driftAbs=" e2e/m4-06-embodiment.spec.ts
```

Both must print `1`. **If either prints `0`, STOP and report "lane drifted or predecessor absent" — do NOT improvise.** The first proves the f1571-1 reorder (merge `9bfecb997`) is present in this lane. **Without it you would be measuring the CENSORED arrangement and would reproduce F-1564-1's bias exactly** — which is the one outcome this task exists to avoid.

## Why (F-1572-1, and a re-reading of F-1564-1's closure)

F-1564-1 closed F-1563-3 with **24 lane-shell observations, 0 breaches of `0.4`, max `0.3722002149381437`**, and the ladder has treated that as the lane's clean bill of health ever since.

⚠️ **That measurement was taken through the censoring.** F-1565-2 states the mechanism and s1572 merged its cure: before `9bfecb997`, the bark assertion executed **before** the drift log, so **every run that lost the bark race yielded no drift sample at all** — and, in F-1565-2's own words, *"the runs most starved of CPU are exactly the ones most likely to both lose that race and drift furthest. A mean over surviving samples is not the mean."*

🔑 **So F-1564-1's "0 breaches in 24" is not yet known to be a property of the LANE. It may be a property of the CENSORING.** Those two hypotheses have never been distinguished, because until this week no uncensored lane measurement existed.

✓ **AND THERE IS DIRECT EVIDENCE THEY COME APART.** The f1571-1 runner — in this lane, on the uncensored tree — produced `driftAbs=0.4096828041302199`, a genuine breach of the unchanged `0.4` bound (`9 passed / 1 failed`, desktop). That is **the first lane-shell breach on record**, and it appeared in the first uncensored lane run anyone has taken.

✓ **Meanwhile the FIRE arm, which F-1563-3 blamed, came back clean** (s1572, `artifacts/f1572-1-fire-shell-drift/measurement.md`): **12 desktop observations, 0 breaches, max `0.3722002149381437`** — bit-for-bit F-1564-1's lane maximum. **The shell the ladder accused is the one that will not reproduce it.**

➡️ **This task supplies the missing arm: an UNCENSORED lane-shell distribution at the same n, by the same method, so the pair can finally be compared like with like.**

## Scope

1. **Measure, do not change.** Run the **full spec** `e2e/m4-06-embodiment.spec.ts` — **not** the isolated test, and **not** `--repeat-each`. F-1563-3 measured isolated runs passing with **29% margin** while full-spec runs breached, so the isolated arrangement answers a different question. Each observation is its own `npx playwright test` invocation with its own dev server.
2. **n = 12 per project**, `desktop-chrome` and `mobile-chrome`, **`--workers=1` on every invocation**, run **serially** (never race the projects — §3.1). 24 invocations total.
3. **Harvest the sample with a SUBSTRING filter, then parse — never let the number's format gate the observation's existence (F-1572-3).** s1572 lost one observation of eleven to a probe written as `driftAbs=([0-9.]+)`, which cannot match scientific notation or `NaN` and is therefore indistinguishable from a genuinely absent line. Filter lines containing `[m4-06-denied]`, record the **raw line verbatim**, and parse the number afterwards. **If a run yields no such line at all, that is an OBSERVATION, not an error** — record it as CENSORED with the run's pass/fail counts, because on the uncensored tree a missing sample would be a finding in its own right.
4. **Report the full DISTRIBUTION, not a max.** For each project: every raw value in run order, the count of distinct values, min, max, and the count of breaches `>= 0.4`. The quantity is strongly quantised (F-1559-1; s1572 saw 7 distinct values in 10 samples, several recurring bit-for-bit), so **do not compute a mean and present it as the headline** — list the values.
5. **State the comparison explicitly** against the two banked sets, in a table: this lane arm vs **F-1564-1's censored lane arm** (24 obs, 0 breaches, max `0.3722002149381437`) vs **s1572's uncensored fire arm** (12 obs, 0 breaches, max `0.3722002149381437`).
6. **Write `reviews/f1572-1-lane-arm-uncensored-drift.md`** with the raw lines, the tables, and a one-paragraph verdict answering exactly one question: **does an uncensored lane arm breach `0.4`, and does it differ from the fire arm?** A breach count of zero is a **DECLARED SUCCESS**, not a failure to find something — say so plainly and do not go hunting.

## Firewall

**Touch ONLY:** `reviews/f1572-1-lane-arm-uncensored-drift.md` (new, your report) · `artifacts/f1572-1-lane-arm/**` (new, your raw run logs).

**NO changes to:** ⛔ **`e2e/m4-06-embodiment.spec.ts` — NOT ONE BYTE. This is a measurement task; editing the subject destroys the measurement.** · any other `e2e/**` · any `src/**` · `playwright.config.ts` · `src/game/Balance.ts` · `tasks/**`, `tasks/goals.json`, `tasks/BACKLOG.md`, `STATUS.md` · `specs/**` · any other `reviews/*.md`.

⛔ **FORBIDDEN GREENS — each is a task FAILURE even if everything passes:** changing **any** numeric bound, in either direction, **including a narrowing** — a re-pin needs a named cause and this task is constructed to produce none (**F-1441-3**) · setting `CLAUDE_CONFIG_DIR` anywhere, which would fake a fire shell and measure a benign arrangement (**F-1571-1** — the variable confers only the worker pin, never the CPU ceiling) · running with `--repeat-each` or the isolated test and presenting it as the full-spec arrangement · reporting a mean or a max **instead of** the distribution · discarding a censored run rather than recording it.

🔓 **No firewall lift is granted.** If you find an adjacent defect, **report it in your review file — do not fix it** (CLAUDE.md §4.5).

## Self-check (evidence, not vibes)

`npx tsc --noEmit` rc=0 and `npm run build` green **before** the measurement begins (proving the tree you measured is sound) — quote the Vite time and the asset-diet line. Confirm `git diff --stat` shows **zero** changes under `e2e/` and `src/` at the end. **`npm run test:node-guards` is NOT owed** — this task touches no `src/sim/`, `src/systems/` or `src/entities/` file; say so explicitly rather than silently skipping it.

**No-op guard:** if you find yourself about to exit without a report, **WRITE WHY into your report first**.

**READY-FOR-GATES** + report: the 24 raw `[m4-06-denied]` lines in run order · per-project distinct/min/max/breach counts · the count of CENSORED runs, if any · the three-way comparison table · your one-paragraph verdict · confirmation that the spec file is byte-identical to `main` · anything adjacent you found and deliberately did not fix.
