# lane-f1508-2-red-inventory-lookup-verdicts — FIRE-AUTHORED (attended review welcome)

**Role:** Codex runner, lane-b. **Workdir:** `worktrees/lane-b` (branch `lane/b`).

## READ FIRST (paths, not memory)
- `scripts/red-inventory-lookup.mjs` — **the single script this task may change.** Read `specPath()`, the `fail()` helper, the `outcome` assembly, and both `console.log` verdict lines near the end.
- `tasks/BACKLOG.md` — the row for **F-1508-2**. Grep by content, not by line number: `a bare-name query is refused rather than answered`. That sentence IS this task's gate.
- `logs/suite-red-inventory-compact.json` — the machine-readable snapshot. You want its `stats` object; it is the source of the date.
- `logs/suite-red-inventory.md` — the human snapshot the tool parses. Note its "Harness provenance" heading; read the WARNING in scope 2 about it before using its date.
- `reviews/f1507-2-landmark-routing-bisect.md` + the F-1510-3 row in `tasks/BACKLOG.md` — why the missing date cost two fires real work.

## WHY (evidence, quoted and dated)

`scripts/red-inventory-lookup.mjs` distinguishes three verdicts — `KNOWN-RED`, `CLEAN-IN-INVENTORY`
(*ran and passed*), `NOT-IN-INVENTORY` (*never ran*). The last two have **opposite meanings**, and the
tool selects between them correctly. Two surfaces let a caller read the wrong one anyway.

**⑴ A bare spec name silently returns the wrong verdict. Re-measured on main by s1511 (2026-08-07), not inherited:**

```
$ node scripts/red-inventory-lookup.mjs 072-era-activation
NOT-IN-INVENTORY — e2e/072-era-activation
$ node scripts/red-inventory-lookup.mjs e2e/072-era-activation.spec.ts
CLEAN-IN-INVENTORY — e2e/072-era-activation.spec.ts
```

Same spec, opposite verdicts. `specPath()` falls back to `` `e2e/${path.basename(normalized)}` ``
**without appending `.spec.ts`**, so the key `e2e/072-era-activation` matches nothing and the tool
reports *never ran* for a spec that ran and passed. ⚠️ **And the exit code cannot save the caller:**
the last line of the script exits **1** for `NOT-IN-INVENTORY`, and a `--strict` `KNOWN-RED` also
exits 1 — so an exit-code reader cannot tell a typo from a real red. This is the surface that
**cost s1508 its first reading** of the F-1507-2 premise.

**⑵ `CLEAN-IN-INVENTORY` prints with no snapshot date, so "clean" arrives with no expiry.** The header
line carries the inventory path, row counts and totals — but not *when the run happened*. This is the
exact ambiguity F-1224-3 documents and the reason s1510 had to do timestamp archaeology by hand to
recover a proven-green bisect endpoint (F-1510-3).

🔍 **A CORRECTION TO THE FINDING ITSELF, MEASURED s1511 — DO NOT COPY THE DATE OUT OF THE F-1508-2 ROW.**
That row names the answer as **2026-07-29**, citing the `## Harness provenance (APPENDED 2026-07-29 …)`
heading in `logs/suite-red-inventory.md`. But that is the date the provenance section was **appended**,
not the date the suite **ran**. `logs/suite-red-inventory-compact.json` `stats` says:

```
"startTime":"2026-07-28T02:26:03.534Z","duration":10834520.016999999,"expected":2006,"skipped":86,"unexpected":304,"flaky":0
```

and all **2397** per-test `startTime` values in that file fall between `2026-07-28T02:26:03.534Z` and
`2026-07-28T05:26:30.806Z` — a single ~3 h window, one day **earlier** than the banner.
**Print the date the suite RAN, derived from `stats.startTime`. A cure whose whole purpose is expiry
accuracy must not ship a date that is itself wrong by a day.**

## SCOPE (each item testable)

1. **Refuse a query about a spec that is not on disk, rather than answering it.** In `specPath()` (or
   immediately after it), resolve the candidate against the repo and **verify the `.spec.ts` file
   exists**. If it does not, call the existing `fail()` helper — which already prints
   `red-inventory-lookup: <message>` to stderr and exits **2** — with a message that names the
   resolved path it looked for and suggests the likely intent. A query about a spec that is not there
   is a **misuse, not a verdict.**
   - Exit **2** (misuse) is required, and it must be distinct from `1`. That distinction is the point:
     `1` means "a real answer you may not like", `2` means "your question was malformed".
   - ⓘ **Convenience is welcome but must not be silent:** if you choose to *resolve* a bare
     `072-era-activation` to `e2e/072-era-activation.spec.ts` when that file exists, you must print
     the resolution to stderr so the caller sees which key was actually queried. Silent correctness is
     how surface ⑴ was born. Refusing outright also satisfies this scope item — **your choice, but say
     which you did and why in the report.**
2. **Put the snapshot date on the verdict line, derived from data.** Read `stats.startTime` from
   `logs/suite-red-inventory-compact.json` and include the date on the verdict line for **all three**
   outcomes (a stale `KNOWN-RED` is just as misleading as a stale clean). Also add it to the `--json`
   result object as its own field.
   - **Derive it; never hardcode `2026-07-28`.** The inventory will be regenerated and a literal
     would rot into a lie — the exact failure class as F-1506-2's laundering lesson.
   - If the compact JSON is missing or has no `stats.startTime`, degrade **loudly and honestly**
     (`snapshot date UNKNOWN`), never silently omit the field — an absent date must not be
     indistinguishable from a fresh one.
3. **Resolve the snapshot to a commit, mechanically (closes F-1510-3).** Add a `--snapshot` flag that
   prints the run window (`stats.startTime` + duration) and the main-branch commit that was tip at
   that moment: `git rev-list -1 --before=<stats.startTime> main`. Pure plumbing, no judgement.
   - If shelling out to git is awkward from this script, **print the window and the exact
     `git rev-list` command a reader should run** and say so in the report. A copyable command
     satisfies this item; a missing one does not.
4. **Prove ⑴ and ⑵ by manufactured defect, not by a green.** A passing tool never executes its own
   refusal path, so a green is not evidence about the red (the s1299/s1300 standard).
   - Show the **before/after pair** for the bare-name query: `NOT-IN-INVENTORY` before, a **rc=2
     refusal** (or an announced resolution) after.
   - Show a verdict line **with** the date where the old one had none.
   - Temporarily point `RED_INVENTORY_COMPACT_PATH` at a copy whose `stats.startTime` is removed, and
     show the `UNKNOWN` degradation firing. **Restore it** and say so.
5. **Add a guard, and root it.** Add `scripts/red-inventory-lookup.test.mjs` asserting: a bare name is
   refused with rc=2 (or announces its resolution); a full path still returns `CLEAN-IN-INVENTORY`;
   the verdict line carries a date matching `/\d{4}-\d{2}-\d{2}/`; the date is **not** a hardcoded
   literal (assert it tracks a fixture's `stats.startTime`, e.g. via `RED_INVENTORY_COMPACT_PATH`).
   - ⚠️ **Root it in `test:node-guards`, and check the gate-caller audit accepts the name.** A new
     script that no gate calls reds `gate-caller-audit` under an innocent name — and note the audit
     only recognises names containing `guard|assert|check|audit|contract|ratchet`. `…lookup.test.mjs`
     contains **none of those six**, so either name it so it is recognised or grandfather it with a
     stated reason. **Report which you did.**

## FIREWALL

**TOUCH-ONLY:** `scripts/red-inventory-lookup.mjs` · `scripts/red-inventory-lookup.test.mjs` (new) ·
`package.json` (only to root the guard in `test:node-guards`) · your report under `docs/bench/`.

**NO:**
- ❌ **Do NOT edit `logs/suite-red-inventory.md` or `logs/suite-red-inventory-compact.json`.** They are
  the SNAPSHOT — evidence, not code. "Refreshing" them to make something read better is the
  laundering failure F-1506-2 named. Copy to a scratch path for the scope-4 probe and restore.
- ❌ Do NOT change the three verdict NAMES or the meaning of exit `0`/`1`. Callers depend on them.
- ❌ Do NOT re-pin `scripts/gr-sim.test.mjs` (F-1441-3) or touch any e2e spec.
- ❌ Do NOT touch `src/`. This task has no gameplay surface.

## SELF-CHECK before you report
- [ ] `node scripts/red-inventory-lookup.mjs 072-era-activation` → rc **2** refusal, or an announced resolution printed to stderr. Raw rc quoted.
- [ ] `node scripts/red-inventory-lookup.mjs e2e/072-era-activation.spec.ts` → still `CLEAN-IN-INVENTORY`, now **with the date**.
- [ ] The printed date is **2026-07-28**, derived from `stats.startTime`, and grep proves no `2026-07-28` literal in the script.
- [ ] `--json` output carries the snapshot-date field.
- [ ] Scope-4 before/after pairs quoted verbatim, incl. the `UNKNOWN` degradation, with the fixture restored.
- [ ] `npm run test:node-guards` — **full raw tally**, and it INCLUDES the new guard (say how you verified it ran, not merely that the suite passed).
- [ ] `npm run test:ledger-guards` — raw tally (you touched `package.json`, a gate-topology surface).
- [ ] `npx tsc --noEmit` rc quoted. **`npm run build` and a browser battery are NOT owed** — this task touches no run surface under `src/`; say so explicitly rather than skipping silently.
- [ ] All Playwright commands, if you run any at all, pass `--workers=1` (§3.1 — a correctness requirement of the fire shell, not an optimisation).

**READY-FOR-GATES + report:** which option you took for scope 1 (refuse vs announce) and why · the
verdict lines before and after · the derived date and the proof it is not hardcoded · whether
`--snapshot` resolves a commit or prints the command · the guard's name and how it is rooted ·
the `test:node-guards` and `test:ledger-guards` raw tallies.

⚠️ **A NEGATIVE RESULT IS LICENSED, as always.** If `stats.startTime` turns out not to be a reliable
snapshot date (e.g. the file is regenerated by a process that rewrites it), **say so with the
measurement and STOP** rather than inventing a date source. s1511's own drain merged a negative result
as a full deliverable this same fire; a measured "this cannot be done the proposed way" is worth as
much as a cure.
