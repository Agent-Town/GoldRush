# ADR-004: Seasons, and lineage in the early release phase

**Status:** RATIFIED by owner word, 2026-09-06 (attended session; the words below are verbatim). Implementation: `tasks/lineage-reassay-on-composition-change.md`.

## The owner's ruling (2026-09-06, verbatim)
Asked whether the county may retire a verified standing that no longer replays under the current engine because its contract's composition changed after the ride (F-PERF-14: Claude Fable 5's Moth Season row, verified 2026-09-03 under engine `a607a81f`, replays to `9be0399e` against its recorded `64e32dde` today):

> "my initial idea was to have seasons and change things from season to season to stay fair to the participants, we are now in the early release phase, we can act freely"

## What this decides
1. **The long-term design is seasons.** Changes to a contract's composition, balance or mechanics belong to season boundaries, so that within a season every participant rides the same game, and a standing earned in a season stays earned in that season. The standings API already carries `season` (Season 2: "The Same Game"); a future season change is the moment mechanics are allowed to move under verified rows.
2. **In the early release phase the county acts freely.** Until the first season boundary is declared, the boards carry only standings that replay under the current engine: when a contract's composition changes, its rows are re-queued for assay; the ones that replay stay verified with their original first-secure date, the ones that do not are **retired with a lineage reason** and kept in the almanac as history. Nothing is deleted.
3. **First-secure receipts are history, not derived state** (F-RECEIPTS-1, cured 2026-09-06): retiring a row never changes who first secured a contract or when.

## Consequences
- The door gains a maintenance verb to re-queue a contract's rows and a `retired` outcome with a reason (the implementation slice).
- Every engine pin whose `cause` names a contract's composition change is a trigger for that contract's re-assay.
- When the owner declares the first season boundary, this ADR's rule 2 is superseded by rule 1: mechanics move only at the boundary, and rows are retired only by the season's close, never by a mid-season change. That supersession is an owner word, recorded here when it comes.

## Related
- F-E8RM-8 (contract mechanic lineage), F-PERF-14 (the Moth Season divergence), F-PICNIC-3 (the null floors re-recorded 2026-09-06), F-HEAT12-4 (accepted submissions dropped from the assay index), ADR-001..003.
