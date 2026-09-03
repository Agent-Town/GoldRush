# Review — ledger-exposure-guard-declares-tables

**Slice:** `ledger-exposure-guard-declares-tables` (F-2470-1 cure)
**Branch / tip:** `lane/d` @ `9dafbab44`
**Gated as:** `07d8c6d3d` (detached worktree `gate-s2474`, §3.0b), merged to main by fast-forward — the gated commit itself, not a fresh resolution
**Drained by:** s2474
**Verdict:** ✅ **MERGE — evidence complete, scope exact, no findings that block.**

## What it does

`scripts/ledger-mirror-exposure.mjs` is the instrument standing at LB-01's ONE-WAY DOOR: a
mirror row committed to git is undone only by a force-push, which is deny-listed here. Until
this slice it enumerated every table in each mirror but harvested keys only from tables
carrying a `key` column, and **never reported the table list at all** — so a table with no
`key` column was skipped in full and silently, while the tool printed an affirmative,
worded all-clear about the whole mirror. That is F-2221-1's polarity, and `refusal-taxonomy`
had just added exactly such a table.

The slice does two things:

1. **Declares the corpus on every run, including the happy path** (F-2208-1). The verdict now
   carries a `tables inspected` line naming every `file:table[columns]`, and a table it could
   not harvest is named `[SKIPPED: no declared columns]` rather than vanishing. The same
   declaration rides in `--json`.
2. **Gives the classifier an axis for non-KV tables**: `TABLE_IDENTITY_COLUMNS = { refusals:
   ['anon_id', 'profile_name'] }`, filtered against the table's actual columns, with the
   harvested values passing through the same `classifyKey` as `key` values.

## Evidence (merged tree `07d8c6d3d`, detached `gate-s2474`)

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **rc=0** |
| `npm run build` | **rc=0**, built in 4.35 s; asset-diet ceilings respected (herald 1,158,214 B vs 1,500,000 B) |
| Slice's own spec + adjacent ledger guards (`ledger-mirror-exposure-guard`, `ledger-mirror-freshness-guard`, `ledger-backup-fill-gaps-guard`) | **46 pass / 0 fail / 0 skipped**, 6.18 s |
| `npm run test:ledger-guards` (the battery whose legs this diff modifies) | **rc=0**, 202.1 s, node assertions green + `RESULT: 83 passed, 0 failed` bash legs |
| Live run on the real corpus | `11 mirror(s), 11 read, 0 unreadable` · `keys inspected 67` · `account-class rows 0` · `unrecognised rows 0` · all 11 tables named `kv[key]` · `✅ CLEAN` |
| Mutation proof (independently re-run, not inherited) | `✔ MANUFACTURED: removing the refusals map recreates the blind spot` |
| Merged-tree diff vs main | exactly 3 files, +58/−6 — identical to the lane commit; no surprise content |

**Screenshots: none, and that is the correct answer here** (Mistake #10's question asked and
answered). This slice touches `scripts/` only — a factory instrument, its test, and a BACKLOG
row. Nothing renders, no player-facing surface moves, and there is no plain-boot path on which
a player could see it. The build gate covers the bundle.

**Load condition, stated because a duration without one is a measurement with a hidden
parameter (F-2452-1):** `test:ledger-guards` took 202.1 s against a `77–99 s` quiet band,
because lane-c held a live runner throughout (`half-stamped-reel-refusal`). rc=0, so there was
no red to attribute to contention (F-2462-1); the wall figure is inflated and the verdict is not.

## Merge classification

Base: `main` @ `a4a420df1` (this fire's own lock commit; main did not move during the gate).

| Path | Class | Resolution |
|---|---|---|
| `scripts/ledger-mirror-exposure.mjs` | LANE-ONLY | taken as-is; main never moved it |
| `scripts/ledger-mirror-exposure-guard.test.mjs` | LANE-ONLY | taken as-is; main never moved it |
| `tasks/BACKLOG.md` | **BOTH-MOVED** | union, **verified by row count**: main's 8 rows ∪ lane's 1 row = **9**, each asserted present by its own 60-char key after the write (`missing []`), no conflict markers remaining |

Main's tip was the gated commit's first parent, so main fast-forwarded to the exact tree the
battery ran against — no re-resolution, no untested bytes.

## Findings

**F-2474-1 — the mapped column names are CORRECT, verified against the schema rather than
inherited (NO ACTION).** The master and the runner both assert `refusals` carries `anon_id` and
`profile_name`. Confirmed by reading the writer, not by trusting the report:
`server/ledger/storage.mjs:27–28` declares `anon_id TEXT NOT NULL` / `profile_name TEXT NOT
NULL`, and `:48` inserts them. Recorded because a hand-written column map is exactly the kind of
thing that is usually a guess — here it is not.

**F-2474-2 — when refusals rows first reach a mirror they will classify `unrecognised`, not
`account`, and the `unrecognised` count will jump from 0. That is CORRECT and must not be read
as a regression (NON-BLOCKING, forward-looking).** `classifyKey` refuses on the six account
prefixes, clears on `standings:`/`assay-`/`assay:`, and returns `unrecognised` for everything
else. An `anon_id` is a 32-char hex, so it matches neither list. Per the tool's own declared
design an unrecognised row **declares and warns without refusing** — which is the right
outcome and the whole point of the cure: those values become *visible* where they were
previously *invisible*. F-2470-1 already recorded that this data is county-standings class by
the taxonomy master's own design and is lawful in plaintext under the standing gate. A future
fire seeing `unrecognised rows: N>0` for the first time should read the table list, confirm the
rows are refusal identities, and not treat the number as an alarm.

**F-2474-3 — a wrong or renamed identity column fails toward being DECLARED, not toward being
missed (NO ACTION, recorded as a soundness property).** The map is filtered with
`.filter(column => cols.includes(column))`, so a column name that stops matching yields an empty
harvest and the table prints `[SKIPPED: no declared columns]` rather than silently reporting
clean. The cure's failure direction is therefore the safe one — unlike the defect it replaces,
which failed toward an affirmative all-clear.

**Scope discipline:** the firewall held exactly. `TOUCH ONLY` named the guard, its test and the
BACKLOG row; the diff is those three files and nothing else. The master forbade touching
`scripts/fire.md` and told the runner to propose any duty wording in its report instead — it did,
and did not touch the law surface.

## Ledger

- Goal leaf `ledger-exposure-guard-declares-tables` → `status: "merged"`, `mergeHash:
  07d8c6d3d2f4496275522202cc944046ff85f856` (recorded in the drain-bookkeeping commit that
  follows this one, per §3.0's two-commit rule: a commit cannot contain its own hash).
- `tasks/BACKLOG.md`: F-2470-1 marked cured; the lane's riding row retired to a shipped row.
- GZ-01: **nothing owed, and that is the INSTRUMENT's answer rather than my judgement.**
  `gazette-backfill-sweep` reads `reported 180 / dismissed 64 / candidates 0`, and this merge is
  not in its corpus at all — verified by reading its selector, `PLAYER_PREFIXES = ['src/',
  'assets/', 'public/', 'functions/', 'site/', 'index.html']`, against a diff that touches only
  `scripts/` and `tasks/`. No gazette item and no dismissal paragraph: writing one for a commit
  the sweep never selected would be noise in the queue, not bookkeeping.
