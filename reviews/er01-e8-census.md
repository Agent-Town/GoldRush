# reviews/er01-e8-census.md — ER-01 E8 Orbital readiness census

- **Slice:** `lane-er01-e8-census.md` (ER-01 ladder, E8 Orbital)
- **Branch / tip:** `lane/b` @ `a377fdcb6` (single runner commit)
- **Merged to main:** `c61b0968f7add06a9ab599b6d0939dd6e2a9d037`
- **Drained by:** s1480 fire, 2026-08-06
- **Verdict:** ✅ **MERGE**

## What it does

Measures all four `epoch-8-orbital` contracts against `HeadlessContractSim` under AP-11 and
publishes `docs/bench/e8-readiness-census.md`. Verdict **0 AGENT-READY / 4 DATA-GAP / 0 BROKEN**.

The root gap is named precisely and is *one* gap, not four: `E8PhysicsSystem` runs only at the
browser `Game` seam, so low-g, suit timers, atmosphere walls, handholds, debris, orbital return
and the eclipse event have no headless owner. Each contract additionally declares its own missing
consumer — `atmosphere-wall-consumer` (`e8-mare-claim`), `far-side-contract-consumers`,
`low-orbit-contract-consumers`, `eclipse-contract-consumers`.

**BROKEN is 0 for a stated reason**: all four bundles load and *declare their missing dependencies
honestly*. That is the DATA-GAP/BROKEN distinction applied correctly — incomplete for agents, not
malformed. Note this is exactly where E8 differs from E7, whose Relay Valley declares nothing
(F-1480-2): the E8 wave has no such hole.

## Evidence

| Gate | Result |
|---|---|
| Custody | detached worktree `gate-s1480` @ `44d6d678f`, stacked on the E7 merge — per §3.0b |
| §3.0 block check | UNKNOWN pre-drain (F-1480-1, whole wave); leaf registered by this drain |
| `npx tsc --noEmit` | **rc=0**, no output |
| `npm run build` | **green, 1.39s** |
| Own spec, desktop + mobile | **8/8 passed, 10.6s**, `--workers=1` |
| Console/page errors | zero captured (asserted per contract per seed) |
| Diff shape | **106 insertions, 0 deletions**, exactly 3 files |

## Merge classification

Base: `main` @ `20c1ea6b` (post-E7). `docs/bench/e8-readiness-census.md` and
`e2e/er01-e8-census.spec.ts` are pure LANE-ONLY adds (38 / 67 lines, none present on main).
`tasks/BACKLOG.md` is BOTH-MOVED add/add — union-resolved, with the lane's
`READY-FOR-GATES on lane/b` line **retired to `✅ MERGED s1480`** in the merge commit (F-1461-4:
a clean auto-merge would have landed it asserting that merged work still awaits gates).

`SUPPORTED_CONTRACTS` and `assets/contracts/bench-seeds.json` are **unchanged** — correct under
ER-01 (seeds are pinned only for admitted contracts, and this census admits none), and the reason
`test:node-guards` is not owed: zero `src/` bytes moved and nothing `gr-sim.test.mjs` consumes was
appended.

## Instrument note

Same as the E7 drain: port 5188 was held by another session's `gr-milk-deepwater-surgery` vite
(pid 54836, not killed), so the gate ran against an external dev server on 5234 via
`GR_CAPTURE_BASE_URL` + `GR_CAPTURE_EXTERNAL_SERVER=1`. `external-server-guard.mjs` was live and
did not refuse — positive evidence the server was `vite dev`, not a preview (F-1457-1).

## Findings

**None blocking.** F-1480-1 (missing goal leaves across the whole E7–E10 wave) is filed in
`reviews/er01-e7-census.md` and cured for this slice by the accompanying bookkeeping commit.
