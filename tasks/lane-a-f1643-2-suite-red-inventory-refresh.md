# Task f1643-2: refresh the suite red inventory, and record what the machine was doing while you did (LANE-A, commit prefix "chore:")

**FIRE-AUTHORED (attended review welcome)** — s1646, 2026-08-11.

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-a`.

READ FIRST: `AGENTS.md`; `tasks/BACKLOG.md` (the two F-1643-2 rows — the 🔵 finding and the ⏳ **RE-PRICED** row directly under it; together they are this task's entire WHY and its gate); `scripts/suite-red-inventory.mjs` (the reducer you will drive); `scripts/red-inventory-lookup.mjs` (the consumer whose answers this refresh exists to make useful); `logs/suite-red-inventory.md` (the stale snapshot you are replacing — read its **"Corrections since the snapshot"** preamble before you touch anything, because it states the one thing you must not do).

SEQUENCING LAW: this task drives a reducer whose input path is a positional default. Verify with
`grep -c "const \[input = 'logs/suite-red-inventory-raw.json', output = 'logs/suite-red-inventory.md'\] =" scripts/suite-red-inventory.mjs`
→ must print `1`. If it prints `0`, **STOP and report "reducer signature moved"** — the command sequence below is written against that exact signature and a changed one means this master is stale, not that you should improvise a new invocation.

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/a main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. **EVIDENCE-ARTIFACT EXCEPTION (F-1266-1): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, and any `.png` — are NEVER "work" and NEVER a STOP. Discard them and PROCEED, listing what you discarded.** Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything. Then `git -C worktrees/lane-a status --short` → must be clean, with the FACTORY-CHURN EXCEPTION — always expected, never a STOP; list them and proceed (F-1407-1): (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*` and any `.png`. What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.

## Why (F-1643-2, s1643 + the s1644 re-pricing — quoted, not paraphrased)

The red inventory is the instrument a drainer uses to price an adjacent-suite red without spending a control run on it. It is **14 days stale** and it says so honestly:

```
NOT-IN-INVENTORY — e2e/front-door-parity.spec.ts — snapshot date 2026-07-28
! STALE SNAPSHOT — 13 days old, threshold 7; 378 commit(s) have touched e2e/ or src/ since
  The snapshot may simply predate this spec; absence here is not evidence either way.
```

(measured s1643 at 13 days / 372 commits; re-measured s1646 at 14 days / **378** commits.)

**The instrument behaves well — the DATA is what is stale.** F-1643-2's own words: it *"declared the staleness and explicitly said 'absence here is not evidence either way' rather than implying green, which is the failure mode this whole class usually has."* Consequence, verbatim: *"every adjacent-suite red in this window costs a fire a full control run (~4 min here) to price."*

⚠️ **Read the s1644 re-pricing before you assume this is small.** *"The row's 're-running `scripts/suite-red-inventory.mjs` would have cost 1 second' is true only of the LOOKUP. The generator is a reducer, not a runner"* — it reads `logs/suite-red-inventory-raw.json` and reformats it, so refreshing the snapshot means **running the whole e2e suite under the playwright JSON reporter first — tens of minutes**.

**Two facts s1646 measured while authoring this, which neither row records and which change what you must do:**

1. **`logs/suite-red-inventory-raw.json` DOES NOT EXIST in the tree.** It is untracked (not gitignored — `git ls-files logs/` returns only `suite-red-inventory-compact.json` and `suite-red-inventory.md`), and the copy that produced the 2026-07-28 snapshot is gone from disk. So the reducer's input must be **produced**, not refreshed: running the reducer alone gives `ENOENT`, not a stale-but-working report.
2. **The exact command that produced the snapshot is documented nowhere** — not in the `.md`, not in `scripts/`. s1646 therefore **proved the pipeline end to end on one cheap spec before writing this task** (`prove the harness is constructible before authoring scope`), and scope 1–2 below is that proven sequence scaled up, not a guess. The probe: `PLAYWRIGHT_JSON_OUTPUT_NAME=/tmp/x.json npx playwright test e2e/_s106-prospector-boot-probe.spec.ts --workers=1 --reporter=json` wrote a 6,026-byte raw report, and `node scripts/suite-red-inventory.mjs /tmp/x.json /tmp/y.md` consumed it and emitted a well-formed inventory (`Total tests run: 2`, plus a `Harness:` line recording configured/actual workers and a `Revision:` line).

**THE GATE THIS TASK RIDES ON, and why it is being authored now.** F-1643-2's re-pricing sets it: *"it must not be run just because a fire is idle: a full-suite run taken while lanes are live measures THE MACHINE, not the code (F-1270-1's load ceiling), so a snapshot taken under load would enter the inventory as a fresh set of excused reds, which is strictly worse than the 13-day-old one it replaced. GATE: author this only when all four lanes are idle and no drain is in flight, and have it state the concurrent load it ran under in the report."* s1644 and s1645 both declined for want of that gate. At s1646 all four lanes are idle, `ahead=0`, and the fire's only drain (`57208ef8`) was fully committed before this was authored.

⚠️ **BUT THE GATE'S LETTER IS NOT ITS PURPOSE, AND s1646 MEASURED THE DIFFERENCE — THIS IS THE MOST IMPORTANT PARAGRAPH IN THIS TASK.** The gate is written in terms of *lanes*, and lanes are **not** the only load on this machine. At authoring time, with all four lanes idle, `ps` showed **Blender at 100% CPU for 2h26m** (`Blender -b assets/blender/fries-mcdx/landmark.blend`, a headless art-pipeline render) and `fseventsd` at 100%, i.e. **2 of 16 physical cores saturated by work no lane instrument can see.** A fire that checked only `lane-usable --all` would have called the machine quiet and been wrong. **This is exactly why the gate's third clause exists** — *state the concurrent load it ran under* — and it is the clause that makes the snapshot survive an imperfect machine. Obey it literally (scope 4) and do not silently assume a quiet box.

## Scope

1. **Produce the raw report** — the full suite, both target projects, **under the OWNER'S THROTTLE LAW (2026-08-11, verbatim: "can we limit the amount of threads it uses? I was just surprised it took so long. I woke up in the middle of the night to it.")**:
   `PLAYWRIGHT_JSON_OUTPUT_NAME=logs/suite-red-inventory-raw.json nice -n 19 npx playwright test --reporter=json --workers=3`
   **Exactly `--workers=3` and `nice -n 19` — this REPLACES the earlier "lane's natural parallelism" guidance.** The prior 8-worker run saturated the owner's machine and woke him; 3 workers keeps it audible-quiet and usable, `nice` yields the CPU to anything interactive. Expect roughly 2.5-3× the 8-worker wall clock (this becomes a day-scale background hum — that is the deliberate trade, not a defect). The reducer records the observed worker count, so the snapshot self-describes its harness. Expect a **non-zero exit code** — the suite has known reds and that is the entire point; do not treat rc≠0 as a failure of this task, and **do not stop at the first red**.
2. **Reduce it, with the positive control actually observed** — never with the flag simply asserted:
   a. First run `node scripts/suite-red-inventory.mjs logs/suite-red-inventory-raw.json logs/suite-red-inventory.md` **without** the flag, and confirm the output says `Positive control: **NOT RECORDED**`.
   b. Then perform the control the existing snapshot describes: inject **one synthetic mobile-only failure** into a copy of the raw JSON, reduce that copy to a scratch path, and **verify it produces exactly one MOBILE-ONLY row carrying your injected error marker**. Quote the row.
   c. Only then re-run the real reduction with `--positive-control-passed`.
   **A control you did not watch fail is not a control** — `scripts/suite-red-inventory.mjs:8` makes that flag pure assertion, so it is only as true as the step you actually performed.
3. **Regenerate the compact JSON** the same way the tracked `logs/suite-red-inventory-compact.json` is produced, so the `.md` and the compact form describe the SAME run. If you cannot determine how the compact file is generated by reading the reducer, **STOP and report it** rather than hand-writing one — a compact file that disagrees with its own `.md` is worse than a stale pair, because `red-inventory-lookup` resolves ambiguity through it.
4. **Record the concurrent load, as the gate demands** — in the report AND in a short `## Run conditions` block appended to `logs/suite-red-inventory.md`: the `ps`-measured non-suite processes above ~20% CPU at **start and end** of the run (name + %CPU + elapsed), the physical core count, the wall-clock duration, and the `Harness:` line the reducer emitted. If Blender or any other heavy job was running, **say so plainly** — a declared imperfect snapshot is useful; an undeclared perfect-looking one is the failure this gate exists to prevent.
5. **Separate load-induced reds from real ones, which is what makes this snapshot trustworthy rather than merely fresh.** After the full run, take every spec **file** that produced a failure and re-run **those files only, serially** (`--workers=1`), once. Any test that fails in the parallel run and **passes** serially is load-attributable: list it under a clearly-headed `## Load-attributable (parallel-only) failures` section in your report and in the appended block. Do **not** rewrite the snapshot tables to hide it — see scope 6.
6. **NEVER rewrite an observation.** `logs/suite-red-inventory.md`'s own preamble is law here: *"ADDITIVE ONLY. The tables below record what the snapshot run observed on its date and are never rewritten — overwriting an observation that was true when taken launders history and hides the drift itself."* You are producing a **new snapshot run**, which legitimately replaces the tables with your run's observations; what you must not do is edit the **"Corrections since the snapshot"** entries carried from the old one. **Preserve that section verbatim** and let the reducer write fresh tables around it. If the reducer drops those corrections, **STOP and report it** — that is a real defect in the reducer and it is worth more than this refresh.

## Firewall

**Touch ONLY:** `logs/suite-red-inventory.md` · `logs/suite-red-inventory-compact.json` · `logs/suite-red-inventory-raw.json` (untracked; **leave it on disk, do not delete it** — RETENTION LAW, and it is the only provenance the next refresh will have; report its byte size).

**NO changes to:** `scripts/suite-red-inventory.mjs` and `scripts/red-inventory-lookup.mjs` — **you are DRIVING these, not fixing them; a defect in either is a FINDING and a STOP, never a patch** · `e2e/**` — 🚫 **you are MEASURING the suite, and a measurement that edits its subject is not a measurement. Do not fix, skip, quarantine, re-pin or annotate a single failing test, however obvious the fix looks.** · `playwright.config.ts` · `src/**` · `scripts/**` (anything else) · `tasks/**`, `specs/**`, `reviews/**`, `STATUS.md`, `tasks/BACKLOG.md`, `tasks/goals.json` (the fire owns those).

🔓 **FIREWALL LIFT:** if producing the raw report genuinely requires touching a file outside the Touch-ONLY list, **STOP and report the file:line** rather than reaching into it.

**If a new script you add matches `(guard|assert|check|audit|contract|ratchet)`, root it:** name the battery that calls it or add a grandfather reason to `scripts/gate-caller-baseline.json`, and run `node scripts/gate-caller-audit.mjs --include-untracked` before you finish (F-1576-1).

## Self-check (evidence, not vibes)

- `npx tsc --noEmit` clean · `npm run build` green. **These gate the tree you measured, not your edit** — this task changes no code, so a red in either means the lane is wrong and the whole snapshot is void. Report both explicitly.
- `node scripts/red-inventory-lookup.mjs e2e/front-door-parity.spec.ts` — **the acceptance test of this whole task.** Before your change it answers `NOT-IN-INVENTORY` + `STALE SNAPSHOT — 13 days old`. After, it must answer from a snapshot dated **today** with **no staleness warning**. Paste both the before and after output verbatim; a refresh that does not move this line has not worked.
- `node --test scripts/red-inventory-lookup.test.mjs` and `node --test scripts/suite-red-inventory.test.mjs` (if present) green — these read the file you rewrote, so they are the adjacent suites here, named not implied.
- Report the snapshot's headline numbers **against the old ones**, so the delta is legible rather than buried: old = `2388 run / 2006 passed / 303 failed / BOTH 135 / MOBILE-ONLY 17 / DESKTOP-ONLY 11`. State yours in the same shape and **call out any bucket that moved by more than ~20%**, with your reading of why.
- The `Reduction check:` line must reconcile — failing project results in raw JSON == rows across the tables. If it does not, **STOP**: the reducer disagreeing with its own input is a finding, not a rounding error.
- This task opens pages only as the suite itself does and adds no new ones; **state that explicitly**. No screenshots beyond whatever the suite writes on its own failures.

**If you find yourself about to exit without changes, WRITE WHY into your report first** — a silent no-op wastes a queue slot and a gate.

End: **READY-FOR-GATES** + report: (a) wall-clock duration and the `Harness:` line (configured vs actual workers) · (b) the concurrent-load block from scope 4, start and end · (c) old-vs-new headline numbers with any >20% bucket move explained · (d) the before/after `red-inventory-lookup` output · (e) your positive-control evidence from scope 2b, quoted · (f) the load-attributable list from scope 5 (state "none" if none — do not leave it blank) · (g) the raw report's byte size · and (h) anything you had to touch outside the Touch-ONLY list (which should be nothing — STOP instead).
