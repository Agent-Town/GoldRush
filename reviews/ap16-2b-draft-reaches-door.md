# ap16-2b — the draft reaches the door (RE-LAND)

- **Slice**: `ap16-2b-reland-draft-reaches-door` (lane-d, master `tasks/lane-d-ap16-2b-draft-reaches-door.md`, FIRE-AUTHORED s1639)
- **Branch / tip**: `lane/d` @ `3f2ed7927` (`runner(lane-d): lane-d-ap16-2b-draft-reaches-door.md`)
- **Lane base**: `96556346b`
- **Merge**: `89e97e2938aff518d1f4995472238f878a642758` (main, s1641 fire)
- **Run log**: `tasks/runs/20260810-212739-lane-d-lane-d-ap16-2b-draft-reaches-door.md.log` (12.0 MB)
- **Salvage ref reused**: `save/ap16-2-s1639-73a0cfed` (tip `73a0cfedc8379019a441d29d7375864967136e28`)

## VERDICT: MERGE

Gated in the detached worktree `gate-s1641` (§3.0b custody — main's working tree never held
undecided content), merged and committed as one act (§3 / F-1589-5 — never left staged on main).

## What it does

The upgrade draft stops being a thing the sim resolves for itself and becomes a thing the door
offers. While `progression.offer` is live headless, the agent view now carries `pendingOffer`
(id/name/effectText) and `expiresAtSimMs`; `PICK_UPGRADE` joins the standing-order grammar; and the
`while (this.progression.offer…)` auto-first-pick loop is replaced by an offer that auto-resolves to
`offer[0]` at the difficulty's own window **in SIM time**. That last clause is the point of the
slice: agent and browser now read one clock instead of keeping two, so an agent's draft decision
costs it the same time it costs a human.

Two scopes the original `ap16-2` could not reach inside its own firewall land here, which is why it
was re-landed rather than merged:

- **Scope 7 — the moth-season fixture.** The runner took lawful option **(a)** and re-recorded it
  rather than re-pinning: 17 → 31 turns carrying 18 explicit picks. Competent arm secures wave 12
  (360000 ms, 433 kills, 30 calls, 0 defaults, hash `42b693d3`); the old no-pick fixture dies wave 8
  (231 kills, 6 defaults, hash `79d560c9`); idle control dies wave 4. The fixture now *can* express
  a pick, which it previously could not.
- **Scope 8 — F-1638-3 retired.** `scripts/same-game-audit.mjs` no longer hardcodes every non-`:rig`
  ability as unavailable. Ability rows move `12 equal / 114 lacks` → `24 equal / 102 lacks`; BLAST
  specifically `42 lacks` → `12 equal + 30 entry-gated lacks`. Whole-report totals
  (exceeds/lacks/equal) `0/1164/516` → `0/1128/552`. The guard that pinned the falsehood was
  re-aimed, with a teeth proof: SHA-256 `370b878…fcfd1`, manufactured removal → 2 pass / 1 fail on
  "blast must be reachable", byte-identical restoration → 3/3 green.

## Evidence

All fire-shell runs at `--workers=1` (§3.1). Battery run ALONE (F-1537-1).

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **CLEAN**, rc=0 |
| `npm run build` | **rc=0** — 1,360.49 kB / gzip 326.64 kB, built 1.47 s |
| `npm run test:node-guards` (mandatory — diff touches `src/sim/` + `src/agent/`, F-1460-1) | **rc=0 — 446 tests / 441 pass / 0 fail / 0 cancelled / 5 skipped** |
| `gr-sim` — merged tree, ALONE | rc=0 — 16 tests / 14 pass / 0 fail / 2 skipped (224.3 s) |
| `gr-sim` — **CONTROL**, unmerged main, same worktree | rc=0 — 16 tests / 14 pass / 0 fail / 2 skipped (195.3 s) |
| `e2e/ap16-upgrade-door.spec.ts` | **2/2** desktop + 390px mobile, rc=0 (5.4 s) |
| Adjacent: `task-025` + `m1-01` + `m2-01` | **32/32**, rc=0 (2.5 m), both projects |
| Plain boot `_s106-prospector-boot-probe` | **2/2**, zero console/page errors, desktop + 390px |

### Reconciliation with the runner's own report

The runner reported `446 tests / 444 pass / 0 fail / 2 skips` from its **lane** shell; I measured
`446 / 441 / 0 / 5` from the **fire** shell. Same denominator, and the 3-skip delta is fully
explained: the three cross-engine hash guards are deliberately skipped in a fire shell per F-1408-2
(printed verbatim in the run: *"cross-engine guard NOT RUN HERE, so this green is NOT coverage"*).
`gr-sim` 16/14/0/2 and adjacent 32/32 match the runner exactly.

### The first battery red, and why it is not the slice's (see F-1641-2)

The first `test:node-guards` run returned **rc=1** — a vite module-runner
`transport was disconnected, cannot call "fetchModule"` tearing down a `gr-sim` child, surfacing as
`1 !== 0` at `scripts/gr-sim.test.mjs:171` (the assertion that the child exited 0).

It was **not believed on sight** and it was **not excused**. Matched arms:

| arm | result |
|---|---|
| unmerged main, `gr-sim` alone, same worktree | rc=0 — 16/14/0/2 |
| merged, `gr-sim` alone, same worktree | rc=0 — 16/14/0/2 |
| merged, full battery (first run) | rc=1 — vite transport disconnect |
| merged, full battery (clean re-run) | **rc=0 — 446/441/0/0/5** |

My first hypothesis — file concurrency — was **refuted by measurement, not by argument**:
`CLAUDE_CONFIG_DIR` is set in the fire shell, so `nodeGuardsConcurrency()` had already resolved to
**1** and the battery was serial both times. The red therefore did not come from parallelism, did
not reproduce, and does not track the merged content in either direction. Recorded as F-1641-2
rather than waved through.

## Merge classification

9 paths, **ALL LANE-TOUCHED / LANE-ONLY**. Main moved 11 files since the lane base
(`STATUS.md`, `artifacts/s1639/**`, `logs/**`, `scripts/fire.md`, `scripts/law-pointer-baseline.json`,
`specs/agent-play/README.md`, `tasks/BACKLOG.md`, `tasks/goals.json`) and **the intersection with the
lane's 9 files is empty** — so there is no BOTH-MOVED bucket and no graft. Automatic merge by `ort`,
zero conflicts. Post-merge `main..lane/d` is empty and `lane-freeze-classify` reports `ahead=0`.

The firewall held: `src/agent/View.ts` and `src/game/Progression.ts` were inside TOUCH-ONLY as
conditional allowances and were not needed; nothing outside the list was touched.

## Findings

- **F-1641-2** (RAISED, non-blocking, instrument-side): the fire-shell `test:node-guards` battery
  produced a non-reproducing `vite` module-runner transport disconnect that killed a `gr-sim` child
  and reddened the whole battery. Not the slice (proven by matched arms above); not concurrency
  (proven by reading the resolved value). Filed as an observation with its measurements, deliberately
  **without** a proposed mechanism — the house precedent (F-1594-1 / F-1613-2 / F-1614-1) is to
  measure a guard's precision before building one, and a single non-reproducing infra flake does not
  yet justify a mechanism. What it DOES justify: a fire that hits this should re-run once and compare
  arms before spending its budget on a phantom regression, which is what cost this fire ~10 minutes.
- **F-1638-3**: RETIRED by scope 8, as the master required. The audit's pinned falsehood is gone and
  the guard was re-aimed with a red-then-green teeth proof.

## Era stamp — reported, not taken

**AP-16-1..3 are now complete, which is the condition `specs/seasons/seasons-v1.md` names for opening
Season 2 "The Same Game".** The runner was ordered to report and mint nothing, and it complied. The
boundary is **MET and UNMINTED** — a season boundary is a canon + date decision belonging to an
attended session or the owner (CLAUDE.md §7.3). No season, date or era stamp was created by this
drain either.
