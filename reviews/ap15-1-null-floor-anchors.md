# ap15-1 — THE NULL FLOOR (AP-15 slice 1)

- **Slice**: `tasks/lane-a-ap15-1-null-floor-anchors.md` (fire-authored s1650, dispatched s1652)
- **Branch / tip**: `lane/a` @ `73ae4929a` — *"assay: pin AP-15 null-floor anchors"* (single commit)
- **Base**: `main` @ `2350ff966`
- **Run**: `tasks/runs/20260811-101203-lane-a-lane-a-ap15-1-null-floor-anchors.md.log` (2.19 MB, 10:12:03 → 10:39)
- **Drained by**: s1653, 2026-08-11
- **Gated in**: detached worktree `worktrees/s1653-gate` (§3.0b — undecided content never entered main's tree or index)

## VERDICT: MERGE — green across the battery, with one non-blocking finding (F-1653-3) recorded for the slice's successor.

## What it does
Pins the **null floor**: what each door-servable contract+seed yields to *no mind at all* (`gr-sim --policy idle`).
`assets/contracts/null-floors.json` (`goldrush.nullfloor.v1`, 35 rows across 12 contracts) records
`secured / waves / timeMs / gold / kills / eventLogHash` per seed, stamped with an era.
`scripts/null-floor-anchors.mjs` derives it; `--check [path]` re-derives and diffs against a pin.
`scripts/null-floor-anchors.test.mjs` is a **millisecond shape guard** (does the artifact cover exactly
the door-servable bench seeds?) and is the only piece wired into a standing battery — the ~2-minute
sim derivation is deliberately barred from every gate, which is the F-1648-1 lesson applied at authoring time.

This is the artifact AP-15's own Goodhart clause depends on: *"decision economy is void where the null
floor secures."* Until it existed, law 2 of the spec was unenforceable.

## Evidence (all re-run by the drain on the MERGED tree, not inherited from the runner's report)

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | clean |
| `npm run build` | ✓ built in 1.86s; asset diet 1,158,214 / 1,500,000 bytes |
| `node --test scripts/null-floor-anchors.test.mjs` | 1/1 pass (1.27 s) |
| `npm run test:node-guards` (ALONE, merged tree) | **rc=0, 293.0 s** — includes the lane's newly-added entry |
| `--check` **bite proof**, independently manufactured | **rc=1 in 113.9 s**, naming `the-claim/e1-the-claim-01 waves: pinned=3 derived=2` |
| package.json both-touched merge | auto-merged; **both** sides verified present post-merge |
| Console/page errors | N/A — no rendering, no UI surface, no screenshots owed |

**The bite was proven, not accepted.** The runner reported proving it; a runner's report is a claim
(Mistake #4), so the drain perturbed a *copy* (`the-claim/e1-the-claim-01` waves 2→3) and ran `--check`
against that path. It refused, and named the exact row. The pinned artifact was never touched.

## Merge classification
Base `2350ff966`; four files, additive, one clean commit.

| File | Class | Notes |
|---|---|---|
| `assets/contracts/null-floors.json` | LANE-TOUCHED (new) | 311 lines, the pinned artifact |
| `scripts/null-floor-anchors.mjs` | LANE-TOUCHED (new) | 100 lines, derive + `--check` |
| `scripts/null-floor-anchors.test.mjs` | LANE-TOUCHED (new) | 46 lines, shape guard |
| `package.json` | **BOTH-MOVED** | resolved by git's ort strategy; verified by hand below |

`package.json` moved on both sides in the same fire: the lane added `null-floor-anchors.test.mjs`
to `test:node-guards` (**65 → 66 entries, +1 added, 0 removed** — checked by tokenising both sides,
not by eye, because a removal inside a 4,000-character line is invisible to a reader), while s1653
added `runner-restart-recipe.test.sh` to `test:ledger-guards` on main. Different keys, different
lines, clean auto-merge. **Post-merge both were asserted present**, since "it merged cleanly" is not
evidence that both changes survived.

## Findings

**F-1653-3 (non-blocking, recorded for AP-15's successor slice — no corrective task spawned).**
`eraStamp` is derived as `git merge-base HEAD main` (short hash), so it changes on **every commit to
main**, whereas the spec defines an era as the **sim** era (*"e.g. pre/post f-door-5's harvest-walk"*).
Proven during this drain: `--check` reported `eraStamp: pinned="d279d4b0a" derived="2350ff966"`, and
`2350ff966` is a **pure bookkeeping commit touching only `tasks/BACKLOG.md` and `artifacts/`** — zero
sim content, yet it advanced the "sim era". Consequence: any `--check` run on a tree whose main has
moved reports a cross-era difference by construction, so the spec's *"cross-era comparisons are
labeled, never silent"* labelling fires constantly and carries no information. That is the shape
F-1460-1 warns about — a signal that reds so often it gets excused, and then the one that matters is
excused too. **Not blocking**: the artifact, its shape guard and the drift bite are all correct, and
the era question belongs to the anchor-versioning design that AP-15 slice 2 (the frontier registry)
must settle anyway — where it is currently owner-gated (F-1653-2).

**Runner-reported, carried forward unaltered (spec hygiene, attended-owed, no code impact):** the AP-15
spec is stale in two places — it says *"12 idle runs"* where 35 per-seed anchors are actually required,
and *"seven axes"* while enumerating eight. The runner correctly reported these and **made no spec
edits**, which is the firewall behaving exactly as intended.

## Player-visibility (GZ-01 filter)
**Not player-visible.** This is a measurement artifact and its derivation script; nothing renders, and
no player path changes. **No gazette item filed** — recorded here so the next sweep can dismiss it
against a stated reason rather than re-judging it.
