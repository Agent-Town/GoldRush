# f1510-3-inventory-names-its-commit — drain review (s1514)

**Slice:** `lane-f1510-3-inventory-names-its-commit` (FIRE-AUTHORED s1513)
**Branch:** `lane/a` · **Tip:** `477fb7f9a5c5e62462ee9d5c6998fd488d96ca92` · **Base:** `377ead435`
**Merged to main:** `e47354c62d102b08329ff60048e8be818b75f879`

## Verdict

**MERGED — as a NEGATIVE RESULT. The finding F-1510-3 is NOT cured and its row stays OPEN with a
revised gate.**

The master explicitly licensed a negative result and the licensed one is what happened. The runner
proved, before writing any code, that the change it was asked to make would emit a *wrong* value —
and stopped. That is the correct outcome, not a failed run.

## What it does

Adds one file, `docs/bench/f1510-3-inventory-snapshot-commit-negative-result.md` (86 lines,
docs-only, zero code, zero `src/`). It records the measurement that disqualifies the requested cure:
`git rev-parse HEAD` evaluated at inventory-generation time cannot name the tree the suite ran on.

The runner declined to manufacture the "normal / degradation / dirty-marker" guard arms the master
asked for, on the grounds that *"adding tests for output known to be false would harden the defect
instead of guarding a cure."* Accepted, and endorsed — a green test wrapped around a wrong value is
worse than no test, because the next fire reads the green.

## The central claim, RE-MEASURED at the drain rather than inherited

The report argued from the tracked snapshot's data. I re-ran that on main:

| Probe | Result |
|---|---|
| `logs/suite-red-inventory-compact.json` → `config.rootDir` | `/Users/robin/Claude/Projects/Gold Rush/worktrees/lane-d/e2e` |
| same → `stats.startTime` | `2026-07-28T02:26:03.534Z` |
| generator's own tree at reduce time | whatever checkout invokes it — here `main` |

Both reproduce exactly as reported.

🔑 **But the decisive evidence is not in that data — it is in the generator's own design, and it makes
the finding stronger than the report claimed.** Reading `scripts/suite-red-inventory.mjs`:

- `:12` `const recordedRoot = report.config?.rootDir;`
- `:14–:16` `runRoot` is resolved **from `recordedRoot`**, using the generator's own `ROOT` only as a
  fallback when the report names no root at all.
- `:17` `runTreePresent = recordedRoot ? fs.existsSync(recordedRoot) : true` — the tool explicitly
  contemplates that the tested tree **may not even exist on this disk**.
- `:121` test bodies are resolved out of `runRoot`, not out of `ROOT`.
- `:263` the existing `- Run tree:` header line already prints `recordedRoot` and its present/unavailable status.

➡️ So the generator is **by construction a reducer of a report produced in another checkout**. The
requested `Snapshot commit:` line would name the reducing tree as a *structural property of the
tool*, not as an accident of one stale snapshot. A fire re-running this against a freshly generated
report would hit the identical wall.

This distinction matters for what happens next: had the cause been "the tracked snapshot happens to
be old", the cure would be "regenerate it". Because the cause is the tool's architecture, the cure
has to reach the *run harness* — capture the revision at Playwright time and thread it alongside the
raw report, so the reducer can copy it verbatim.

## Evidence table (gates on the merged tree)

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **rc=0** |
| `npm run test:node-guards` | **rc=0** — 346 tests / **343 pass / 0 fail** / 0 cancelled / 3 skipped, `duration_ms 170013` |
| Node version (this fire's shell) | **v26.4.0** — the `.nvmrc` pin, so no F-1507-1 split; tally is byte-identical to s1513's supervisor run |
| `npm run build` | **NOT OWED** — docs-only diff, no run surface |
| Playwright (desktop + 390px) | **NOT OWED** — same reason; nothing renders |
| F-1460-1 sim-pin rider | **N/A, checked not assumed** — diff touches no `src/sim/`, `src/systems/` or `src/entities/` path (`git diff --name-status` = one `docs/bench/` addition) |
| `logs/suite-red-inventory.md` / `-compact.json` | **unchanged** — the master's central prohibition (F-1506-2 laundering class) held; the runner never regenerated the snapshot |

The runner's own tally was `rc=1`, 341 pass / 2 fail on Node **v23.11.1**, and it named the two reds
as the standing F-1507-1 timeout-semantics split rather than bending them. Discharged here at 26.4.0:
both are gone, so its diagnosis was right. **This is the second consecutive fire in which the Node
split cost a supervisor rerun** — see the desk item.

## Merge classification

Base `377ead435` (a main commit, so the lane was not stale).

| Path | Class | Resolution |
|---|---|---|
| `docs/bench/f1510-3-inventory-snapshot-commit-negative-result.md` | **LANE-TOUCHED** (added; main has never held it) | clean path-scoped checkout |
| `STATUS.md` | **MAIN-MOVED-ONLY** (s1513 handoff + this fire's lock) | untouched by the lane; no overlap |

Disjoint — zero conflict surface. `lane-usable.mjs lane-a` read `ahead=1 behind=2 paths=1
tracked-dirt=0 untracked=0`, `HOLDS LANE-ONLY`, `59 of 59 added lines absent from main`, which is the
correct pre-drain reading for one new file.

⚠️ Note for the *next* fire: `lane/a` will read `HOLDS` no longer, but it is now `behind` main and
its tip is absorbed — run `lane-usable.mjs` before refilling rather than assuming.

## Findings

**[F-1514-1] — FILED, non-blocking, no corrective queued.** *A gate sentence is a predicate about the
world, and this ledger has no step that ever tests one.* F-1510-3's gate was read closely by three
passes (s1510 filing it, s1513 re-measuring the row and correcting its REC about a non-existent
provenance block, and the master s1513 authored) and none of them asked the one question that
mattered: **not "is this gate met?" but "would performing the described cure make this sentence
true?"** It would not have. The distinguishing feature is that the gate stays *unmet*, so nothing
reds and no drain is blocked — it just keeps recruiting fires to build the wrong thing. Recorded as a
class with a **process** REC, deliberately not a mechanism: gate prose is free-form across 400+ rows
and no parser can evaluate *"names the commit it was taken at"* against a code tree. Full row at the
top of `tasks/BACKLOG.md`.

**F-1510-3's GATE REVISED in the same commit** (not closed): the old sentence is disqualified above;
the new one requires the revision to be captured *by the run* and copied by the reducer, and warns
that this is no longer the trivial one-liner the row was filed as. Whoever authors it should price it
first — it reaches the harness.

**No corrective task queued.** The successor work is a real scope change that needs pricing, and
[F-1511-5]'s one-master-per-fire ceiling is already the board's binding constraint; queueing a
half-priced master against a gate that was just proved wrong would repeat the mistake this review
names.

## Credit where it is due

The master licensed this outcome in as many words — *"A NEGATIVE RESULT IS EXPLICITLY LICENSED and is
a real possibility here … s1513 could not rule that out from the generator alone and says so rather
than asserting otherwise."* That paragraph is the only reason this cost one lane run instead of a
shipped false line plus the fire that later has to unpick it. **Authors: keep writing that paragraph
when you cannot rule something out.**
