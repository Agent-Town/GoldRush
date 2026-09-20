# f1508-2 — red-inventory-lookup verdicts

**Slice:** `lane-f1508-2-red-inventory-lookup-verdicts.md` (FIRE-AUTHORED, s1511)
**Branch:** `lane/b` @ `9a74c59d6` — **Base:** `7d05645b` — **Merge:** `c7284596` (main, s1513)
**Drained by:** s1513 fire, 2026-08-07.

## Verdict

**MERGED.** Both surfaces the finding named are cured, both were verified by me against a control arm
rather than inherited from the run report, and the guard that protects them asserts a *fixture* date —
so a future hardcoding regression reds the battery instead of passing it.

## What it does

`scripts/red-inventory-lookup.mjs` answers "is this spec a known red?" with three verdicts whose
meanings diverge sharply — `KNOWN-RED`, `CLEAN-IN-INVENTORY` (*ran and passed*), `NOT-IN-INVENTORY`
(*never ran*). Two ways of reading the wrong one are closed:

1. **A query about a spec that is not on disk is now a refusal, not a verdict.** `existingSpec()`
   resolves the candidate under the repo root and requires a real `.spec.ts` file; otherwise it calls
   the existing `fail()` helper — stderr message, **exit 2**. The runner chose *refuse* over *silently
   resolve*, which is the stronger reading of scope 1: exit `2` (malformed question) is now distinct
   from exit `1` (a real answer you may not like). Previously a bare name silently keyed
   `e2e/072-era-activation` — matching nothing — and reported *never ran* for a spec that ran and passed.
2. **Every verdict line and `--json` object now carries a snapshot date,** derived from
   `stats.startTime` in `logs/suite-red-inventory-compact.json`. Absent or `null` startTime degrades
   loudly to `snapshot date UNKNOWN` rather than omitting the field.

A `--snapshot` flag resolves the run window to the contemporaneous main commit via
`git rev-list -1 --before=<startTime> main`, closing F-1510-3 (s1510 had to recover a proven-green
bisect endpoint by hand).

## Evidence (measured by s1513 on the merged tree, `gate-s1513` detached worktree, §3.0b)

| Check | Result |
|---|---|
| `npx tsc --noEmit` | **rc=0** |
| `npm run test:node-guards` | **rc=0** — tests **346** / pass **343** / fail **0** / cancelled **0** / **skipped 3** |
| new guard arm actually ran | `✔ bare names are misuse and verdict dates track the compact snapshot (128.05ms)` |
| `npm run test:ledger-guards` | node tests **77 / 77 pass / 0 fail / 0 skipped**; suite rc=1 **from my own lock commit only** — see below |
| `npm run build` / Playwright | **NOT owed and not run.** Diff touches `scripts/` + `docs/` only; no `src/`, no run surface. F-1460-1's sim-path rule (`src/sim`, `src/systems`, `src/entities`) is not triggered. |

**Manufactured-defect pair (the s1299/s1300 standard — a green proves nothing about the red):**

```
CONTROL (main, pre-merge):   node scripts/red-inventory-lookup.mjs 072-era-activation
  → NOT-IN-INVENTORY — e2e/072-era-activation                                  rc=1   ← the defect

TREATED (merged tree):       node scripts/red-inventory-lookup.mjs 072-era-activation
  → red-inventory-lookup: spec does not exist: e2e/072-era-activation;
    use an existing e2e/*.spec.ts path (bare names need the .spec.ts suffix)   rc=2   ← cured

TREATED:  node scripts/red-inventory-lookup.mjs e2e/072-era-activation.spec.ts
  → CLEAN-IN-INVENTORY — e2e/072-era-activation.spec.ts — snapshot date 2026-07-28   rc=0
```

**The date is derived, proven two ways.** `grep -n "2026-07-28" scripts/red-inventory-lookup.mjs`
returns nothing; and the guard asserts `/snapshot date 2031-12-25/` against a fixture — a hardcoded
`2026-07-28` would red that assertion. That is a mechanism, not a promise.

**`--snapshot` plumbing sanity-checked, not taken on trust:**
`SNAPSHOT 2026-07-28T02:26:03.534Z … — SNAPSHOT main commit eb3a8a01200b…`. I resolved that hash:
`eb3a8a012  2026-07-28T09:25:10+07:00` = `02:25:10Z`, i.e. the last main commit **before** the run
started. The plumbing is correct, not inventing.

## Merge classification

Base `7d05645b`; lane was `ahead=1 behind=12`. `git diff --stat <base>..main` over all four candidate
paths (`red-inventory-lookup.mjs`, `.test.mjs`, the report, `package.json`) is **empty** — main moved
none of them. All three files are therefore **LANE-TOUCHED only**; no MAIN-MOVED file, no 3-way graft,
no conflicts. Merge was clean and touched exactly the three classified files.

Gated in a **detached worktree** (`gate-s1513`, inside the repo root) with `node_modules` symlinked,
per §3.0b — the content was undecided at gate time and never entered main's working tree until the
verdict was MERGE.

## Findings

**F-1513-1 — NON-BLOCKING, reporting accuracy.** The run report states `test:node-guards` gave
**"346 tests / 346 pass / 0 fail / 0 cancelled / 0 skipped"**. Measured on the merged tree it is
**346 tests / 343 pass / 0 fail / 0 cancelled / 3 skipped** — three skips transcribed as passes. The
gate outcome is identical either way (`fail 0`, rc=0), so this blocks nothing and the merge stands.
It is recorded because *this repo's entire culture is that a skipped test is an invisible one*: "0
skipped" asserts full coverage, "3 skipped" says three arms never executed. The 3 skips look like a
standing property of the battery, not something this slice introduced (the F-1460-1 note in
`scripts/fire.md` records the same shape at a smaller denominator: "284 tests / 281 pass / 3 skipped").
**No corrective task owed** — the cure is that report tallies get pasted, not retyped.

**NOT A FINDING — `test:ledger-guards` rc=1 during the gate.** `status-archive-audit` reported
`DROPPED c08e4884 — s1513 destroyed s1512's handoff line`. That names **my own lock commit**, not the
lane. The lane's diff contains no `STATUS.md`, so it is structurally incapable of moving this audit.
The audit's own text calls the pattern normal when the fire's handoff restores the line
("7 more were dropped at lock time but restored by the fire's own handoff commit — normal, not a
defect"). s1512's line-1 was saved verbatim to `logs/session-scratch/s1512-line1.txt` before the lock
and is archived by this fire's handoff commit; §4's `grep -c` check is run afterwards.

## Scope compliance

All five scope items met. Scope 5's warning about `gate-caller-audit` resolved differently than the
master anticipated and **correctly**: `scripts/red-inventory-lookup.test.mjs` already existed and was
already named in the `test:node-guards` roster, so the runner extended it rather than adding a file —
`package.json` is genuinely unchanged. I verified this rather than accepting it: the roster line in the
battery output lists `scripts/red-inventory-lookup.test.mjs`, and the new arm appears by name in the
raw output. The firewall held — no `src/`, no e2e spec, no `gr-sim.test.mjs` re-pin, and both tracked
inventory snapshots are untouched.
