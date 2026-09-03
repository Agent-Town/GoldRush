target: specs/transfer-board.md
anchor: assets/rotations/rotation-seeds.json
why: F-2472-3 (s2472, control-proven): the registry path this RATIFIED spec names at :15 and :19 puts a new .json inside the engine identity corpus, which rotates computeEngineHash and refuses every existing verified reel — violating the spec's OWN law L1 ADDITIVE ("existing tapes, seeds, eras and ranking are untouched"). The fix is a path, not a ruling, but a fire may not edit a ratified spec (CLAUDE.md §2, §7.7).
opened: s2472 2026-09-03
kind: ACTION (mechanical correction — needs no owner ruling, only an attended hand)

---

## What to do — two path edits, ~60 seconds

In `specs/transfer-board.md`, replace `assets/contracts/rotation-seeds.json` with
`assets/rotations/rotation-seeds.json` in **both** places it appears:

- `:15` — the scope-1 "Registry + door" line
- `:19` — the "Touches:" line

And append one sentence to the scope-1 line so the reason travels with the path:

> The registry lives OUTSIDE `assets/contracts/` deliberately: that directory is a whole-directory
> entry in `ENGINE_SOURCE_INPUTS` (`scripts/assay-replay-agent.mjs:36–44`), so a registry placed
> there enters the engine identity hash and breaks L1.

## Why this is an ACTION, not a RULING

Robin ruled the **design** ("Ok, then lets do it all. Sounds like a good idea!"), not the directory.
The path was an incidental choice inside a scope list, and it is incompatible with the spec's own
first law. A law outranks a path in a scope list, so correcting the path is what makes the ratified
document self-consistent — it does not change anything he decided.

**Nothing waits on this.** The corrective master
`tasks/transfer-board-v2-registry-outside-engine-corpus.md` is queued to lane-b and does the right
thing regardless; this item exists so the spec stops disagreeing with the code that satisfies it.

## The measurement, so the next reader need not re-derive it

Single variable — exactly 1 of lane/b's 13 files falls inside `ENGINE_SOURCE_INPUTS`:

| tree | `computeEngineHash()` |
|---|---|
| main @ `aa3304354` (control; equals `assets/engine-era.json`'s declared era-5 hash) | `2a06eb51…` |
| + only `assets/contracts/rotation-seeds.json` | `43f54a20…` |
| + the same file at `assets/rotations/rotation-seeds.json` | `2a06eb51…` — byte-identical to base |

Full working: `reviews/transfer-board.md`, finding F-2472-3.

## ⚠️ Do NOT "fix" this the other way

The lane-b runner's own suggested resolution was to exclude the file from `computeEngineHash` by
editing `ENGINE_SOURCE_INPUTS`. That is a judgement about what "the engine" is, it has
owner-dispatched precedent (`dbb42b97d`), and it is a live desk question. **It is not needed** —
relocation costs nothing and touches no law. Narrowing the corpus to accommodate a file that simply
sat in the wrong folder would be paying an expensive, irreversible price for a free fix.

## When you have made the edit

`node scripts/attended-owed-audit.mjs` will find the anchor in the target and print
**LANDED-NOT-ARCHIVED** with rc=1. Clear it by moving this file to `tasks/attended-owed/archive/`
and committing — that rc=1 is the guard asking for bookkeeping, not reporting a problem.
