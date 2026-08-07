# fd3-1-submitted-at-projection — the county board's "when" column becomes a real time

- **Slice:** `tasks/lane-b-fd3-1-submitted-at-projection.md`
- **Branch:** `lane/b`, tip `0f310dacf0bc72e0fe66032d0b3de9916fa08600`
- **Drained:** s1522, 2026-08-07

## VERDICT: MERGE

## What it does

One defensive line in the public county projection, plus the test that proves it.

`functions/api/standings.ts` — `boardRow()` now emits `submittedAt` only when it is finite and non-negative:

```ts
...(Number.isFinite(row.submittedAt) && row.submittedAt >= 0 ? { submittedAt: row.submittedAt } : {}),
```

Legacy rows with a missing or malformed timestamp therefore omit the key entirely and keep the accessible em-dash fallback the board already renders, rather than shipping `NaN`/`undefined` into the UI. `e2e/lb-01-county-standings.spec.ts` gains one test (+48 lines) asserting both halves in one pass: a freshly submitted row carries its stored time, a legacy row without one keeps the dash.

**Player-visible effect:** the `when` column in the county standings, which s1521 shipped showing dashes for every row, now shows real submission times. This closes the gap s1521's own handoff flagged — *"the 'when' column will show dashes until lane-b lands."*

## Evidence

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **0 errors** (merged tree) |
| `npm run build` | **green, 1.05s** |
| `e2e/lb-01-county-standings.spec.ts` (own spec) | **18/18 passed**, desktop + mobile, `--workers=1` |
| The new assertion by name | **2/2 passed** desktop + mobile (5.1s), run in isolation |
| Adjacent: `field-book` + `milk-county-board` + `drill-yard` | 19 passed / 5 failed → **all 5 attributed, none this slice's** (below) |
| `--workers=1` throughout | §3.1 |
| Custody | detached worktree `gate-s1522b` (§3.0b); undecided content never entered main's tree |

Merge classification: base `main` moved **8 commits** during the run. Cherry-picked onto current main; `tasks/BACKLOG.md` **auto-merged cleanly** (the lane added one ledger line while this fire edited the same file heavily — no conflict). All other paths **LANE-TOUCHED only**. 7 files, 50 insertions.

## ⚠️ RED ATTRIBUTION — THE INHERITED LABEL WAS WRONG, AND I ONLY FOUND OUT BY RUNNING THE CONTROL

s1521's handoff told me what to expect: *"gate it `--workers=1` and **expect the three 429 reds, they are not yours** (F-1521-2)."* The first treatment run produced exactly that shape — 6 failed = the three named tests × 2 projects, `secure submits…` / `secure skips…` / `offline standings…`, each failing on `"Failed to load resource: the server responded with a status of 429 ()"` surfacing through `expectNoErrors`. It would have been entirely reasonable to cite F-1521-2 and merge.

**Running the control refuted the inherited characterisation.** Three arms, same worktree, same command, same shell, `--workers=1`:

| # | Arm | Slice | Result |
|---|---|---|---|
| 1 | treatment | present | 12 passed / **6 failed** (429) |
| 2 | control | **absent** (verified: `submittedAt >= 0` not in the file) | **16/16 passed, zero reds** |
| 3 | treatment | present, re-applied | **18/18 passed, zero reds** |

**Verdict on the reds: environmental and TRANSIENT, not this slice.** Arm 3 is the decisive one — the slice present, run immediately after a clean control, fully green including both new tests. A regression caused by the slice cannot pass with the slice applied.

⚠️ **But arm 2 alone would have been dangerously misleading, and this is the part worth carrying forward.** Taken by itself, "control green / treatment red" reads as *the slice reddened three siblings* — a plausible mechanism was even available (the new test adds two more submissions to a rate-limited endpoint, which could tip the suite over the limit). The arms were ~10 minutes apart on a **stateful rate limiter**, so elapsed time confounds any two-arm comparison. **One observation per arm is an anecdote** — which is precisely the lesson of `f1424-4-worker-arm-rates`, drained by this same fire an hour earlier. Three arms were the minimum that could separate the hypotheses.

📌 **F-1521-2's characterisation needs correcting so the next drain does not over-excuse.** It records the 429s as *"a standing local condition"* that *"a 150 s wait did not clear."* Measured today, they **do** clear: the same suite went fully green **twice consecutively** (16/16, then 18/18) after an earlier red run. Treating them as permanent would mean waving through a genuine future regression wearing the same costume. See F-1522-6.

### The adjacent reds, attributed the same way

- **`milk-county-board.spec.ts:281` and `:305`, both projects (4 reds) — PRE-EXISTING.** The control arm reproduced all four exactly, with the slice absent. Not in the red inventory (`red-inventory-lookup` → `NOT-IN-INVENTORY`, snapshot 2026-07-28), so the inventory offered no exoneration and a control was the only way to know.
- **`drill-yard.spec.ts:68` mobile (1 red) — FLAKY.** Failed once in treatment, passed in control, then **6/6 green** under `--repeat-each=3` on the treatment arm. Zero reproductions after the first observation.

## Findings

**F-1522-6 — the `lb-01` 429 reds are TRANSIENT, not a standing condition; F-1521-2 should not be cited as blanket cover. [NON-BLOCKING, corrects an inherited label]**
Measured above: green twice consecutively after a red run. The mechanism is a rate limiter on the standings submission endpoint with no rate-limit-aware fixture, so the reds track *recent request volume*, not tree state. **Consequence for the next drain touching this spec: do not excuse a red here by pointing at F-1521-2 — re-run it.** A single clean re-run settles it in ~40 s, which is cheaper than the control worktree F-1521-2 had to build. The durable cure remains what F-1521-2 asked for: either a rate-limit-aware fixture, or an inventory row so the question stops costing a drain each time.

**F-1522-7 — `milk-county-board.spec.ts` is red on main and invisible to the inventory. [NON-BLOCKING, informational]**
`:281` (*"an offline county clerk leaves the posse board and field book quiet"*) and `:305` (*"a failing standings request adds no error of the application own"*) fail on **plain main**, both projects, reproducibly across two runs. `red-inventory-lookup` returns `NOT-IN-INVENTORY` (snapshot 2026-07-28 — the spec is newer than the snapshot). So every drain touching the standings surface will pay for a control run to learn this, exactly as this one did. Filed so the next drain can cite a measurement instead of re-deriving it; not fixed here (outside this slice's firewall, and it is main's red, not the lane's).

## Ledger

- Goal leaf `fd3-1-submitted-at-projection`: `queued` → `merged`, with mergeHash.
- `tasks/BACKLOG.md`: row closed.
- **Gazette item owed and written** — this is a player-visible change (GZ-01 filter law).
