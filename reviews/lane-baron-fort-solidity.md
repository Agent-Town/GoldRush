# lane-baron-fort-solidity — F-BW-19: the fort's walls learn to say no

**Slice:** `lane-baron-fort-solidity` (master `tasks/done/20260803-180134-lane-baron-fort-solidity.md`)
**Branch:** `lane/e2-arsenal` · **Commit:** `39cfef9d` (middle of a 3-commit stack)
**Drained by:** s1439 fire

## VERDICT: STOP LANDED — the slice is REFUSED, not shipped

The runner returned **STOP — not READY-FOR-GATES** and shipped a 36-line census instead of a registry change. It is right to have done so, and the refusal is the deliverable.

Only `artifacts/fort-solidity/STOP-report.md` is landed here (1 file, 36 insertions, zero code). **No collision registry entry has shipped, so the owner can still walk through the Baron's fortress walls** — F-BW-19 remains OPEN.

## Why the STOP is correct

Owner, gate walk 2026-08-03: *"I was also able to walk through its fortress walls."* The obvious fix — add `fortified_far_bank` and friends to the landmark collision registry — was **measured and rejected**, which is Mistake #14's shape (reject-don't-stretch) applied to gameplay rather than vocabulary:

- A single full-body `fortified_far_bank` rectangle (`29.8 × 3.1`) made the enemy settle near `(6.675, -13.080)` against a target at `(0, -5.8)`, with a **longest stationary run over 1,400 fixed ticks**.
- The honest component split (five palisades + two platforms) **still stalled**: a direct route ended near `(2.220, -13.080)` after 30 simulated seconds, and a normal high-HP enemy oscillated around `(2.35, -13.01)` instead of clearing the wall.

Root cause, as reported: `ClaimJumperEnemy.resolveBlocker()` does local collision response only, and `BuildSystem.palisadeRoute()` supplies long-obstacle waypoints **for player-built palisades only** — static landmark blockers never enter that route graph. Short landmark bodies route acceptably; a continuous fort wall does not.

Shipping the registry entries alone would have traded a walk-through wall for a **permanent enemy stall** — the MQ-3 "solid AND never-trap" law failing on its second clause. The census (all five E1 maps, four registry gaps found, honest footprints measured from the mounted bodies) is banked in the report and is the real asset here.

## Findings

**F-1439-4 🔺 — the master asked for cross-lane coordination that a lane runner cannot perform, and the STOP is partly an artifact of that.**

Scope 3 of the master reads *"coordinate with the stall-census tasks; run their probe if landed"*. The report's blocking line is: *"The repository has no landed stall-census probe to reuse (`stall-census`, `stall-probe`, and `stall pocket` searches returned no task/spec)."*

That statement was **true for its tree and false for the factory**:

| probe | lane | done-move | visible to fort-solidity? |
|---|---|---|---|
| `scripts/night-stall-census.mjs` | lane-b (`a0412139`) | 17:17 | **no** — different branch/worktree |
| `scripts/twin-banks-stall-census.mjs` | lane-c (`9236e9ba`) | 18:52 | **no** — landed 36 min *after* this run |

A lane runner sees its own worktree. A master that tells it to reuse a sibling lane's output is asking for something structurally unavailable unless that output has already been **drained to main**. This is not the runner's error and it should not be written up as one. ➡️ **When authoring, either sequence the dependency through main (drain the probe first, then queue the consumer) or inline the probe into the master. "Run their probe if landed" is not a dispatchable instruction across lanes.**

**F-1439-5 🔺 — `src/entities/Enemy.ts` is being written by three slices across two lanes simultaneously, and the fort-solidity successor makes four.**

`a0412139` (lane-b, night-stuck-census, 18 lines), `9236e9ba` (lane-c, tb-stall-census, 89 lines) both modify it and both are **currently undrained**; `9236e9ba` changes the `resolveBlocker()` signature. The successor this STOP calls for must touch `resolveBlocker()` **and** the route owner — i.e. the same function. That is the §4 one-writer-per-surface hazard in its live form. **Drain the two census slices to main and settle `Enemy.ts` before authoring the fort-solidity successor**, or the successor will be written against a base that no longer exists.

**F-1439-6 🟢 — the successor's stated blocker is now answerable.** The report says a successor *"must explicitly authorize the enemy/static-blocker routing seam (likely `Enemy.ts` plus the route owner)"* and notes no probe exists to verify the result. Both probes now exist (above). Once they are on main, the successor can be authored with a real acceptance instrument rather than an eyeball — and its firewall can name `resolveBlocker()` explicitly, which this master's TOUCH-ONLY deliberately did not.

## Disposition

Leaf registered with `status: "stopped"`. The census and footprints are banked in `artifacts/fort-solidity/STOP-report.md` (RETENTION LAW: mirrored into git rather than left in the lane). **F-BW-19 stays on the board as OPEN**, and the successor is gated on F-1439-5 clearing.
