# e2-pressure-socket — drain review (s1461)

- **Slice:** `lane-e2-pressure-socket` (the ERA-SOCKET template, first instance)
- **Branch / tip:** `lane/a` @ `dcf02430` (runner commit), base `3445d479`
- **Merged to main:** `24c6600fbf294f8ff1dff5e64db8268f045abff6` (`Merge branch 'lane/a'`)
- **Gated in:** detached worktree `gate-s1461/` at merge `0cd231cf` (§3.0b — main's tree never held undecided content)
- **Drain-block check:** `? UNKNOWN` — no goal leaf matched. Per F-1457-3 this was NOT read as clearance: the goal tree was searched by leaf id (`agent-play ▸ er-01-*`) and only `er-01-e2-census` exists. Genuine Goal Registration Law debt, registered in the bookkeeping commit. **Not a block.**

## VERDICT: MERGED

## What it does

Closes the ERA-SOCKET class for E2's signature mechanic. Before this, pressure was a
browser-only system: agents had no manifest vocabulary for it and the headless bench had no
consumer, so `e2-hill-mine` and `e2-pressure-garden` were correctly **refused** admission to
`HeadlessContractSim` under AP-11 reject-don't-stretch (the E2 census, `96d40988`).

The slice builds the socket rather than the stretch:

- `src/sim/HeadlessContractSim.ts` — imports the **production** `PressureSystem` and runs it
  after `BuildSystem.update`; admits `e2-hill-mine` and `e2-pressure-garden` to
  `SUPPORTED_CONTRACTS`; gates the `boiler_house` placement predicate on
  `manifest.twist.pressureEnabled`.
- `src/agent/MechanicsManifest.ts` — derives `BUILD boiler_house` plus the generation, band,
  auto-vent and powered-consumer rules **from the consumer**, adding **zero new operations** to
  the agent vocabulary. Rules landed: `pressure_auto_vent {above:80, loss:35, cooldownSeconds:3}`,
  bands `empty/low<25/working≤80/high>80`, generation `12s coal → 4 pressure/s`, powered systems
  `auto_pan`, `boiler_lance`, `pressure_mortar`, `sky_rocket_battery`, `boiler_battery`.
- `e2e/er01-e2-census.spec.ts` + `docs/bench/e2-readiness-census.md` — census re-measured against
  the new socket.

The runner also addressed the `crypto.randomUUID()`-in-hashed-event landmine its master named:
economy ids are reducer-inert and stripped before `eventLogHash`, so both pinned seed pairs stay
byte-identical through four vent events. **Verified in the diff, not taken on the report's word.**

Census movement: Pressure Garden **DATA-GAP → AGENT-READY**. Hill Mine's pressure blocker is cured
but its *separate* naive-terminal-outcome gap remains DATA-GAP — correctly left untouched
(F-ER01-2 is an attended ruling, firewalled out of this slice).

## Evidence

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **rc=0**, no output |
| `npm run build` | **green, 1.04s** |
| Own spec `er01-e2-census.spec.ts`, `--workers=1`, desktop + mobile | **8 passed (1.1m)** |
| Adjacent (grep-derived): `agent-view.spec.ts` + `drill-yard-manifest.spec.ts` | **6 passed / 4 failed** — see control run |
| **CONTROL ARM**, same worktree, same hour, clean main `067adff4` | **6 passed / 4 failed — IDENTICAL, same four test titles** |
| `npm run test:node-guards` | **rc=1** — F-1460-1 Baron pin only |
| Gate ports 5188/5199/5231/5234 | probed free before gating; no live lane contended |

Adjacent suites were derived by **grepping the touched modules' consumers**
(`grep -rl "MechanicsManifest\|HeadlessContractSim" e2e scripts src`), not from the runner's list.

**The four `agent-view` reds are control-proven pre-existing, not labelled.** This mattered here:
the slice edits `MechanicsManifest.ts` and two of the four reds are *manifest* assertions
(`all five E1 mechanics manifests match their byte-stable fixture`, `the derived manifest rides THE
VIEW and every E1 briefing speaks it`) — exactly the shape a manifest change would break. The
control run on clean main returns the same 4/6 split with the same four titles, so the merge is
exonerated by measurement rather than by the "stale Drill Yard expectations" label it was
inherited under.

**The `test:node-guards` red is F-1460-1**, and it matches s1460's clean-main measurement **to the
digit**: received `kills: 861` / `fnv1a32:36004eab` against pinned `869` / `b9566c6d`, at
`scripts/gr-sim.test.mjs:393`. Cause is NAMED (`4ab48743`, f1452-1 fort-solidity routing), not
excused. This slice touches neither `src/entities` routing nor `BuildSystem`'s solidity path.

No screenshots: the slice has **no player-visible surface** — it is headless agent-bench
infrastructure (`src/sim/` is the bench, not the browser runtime) plus one spec and one doc.
Zero-console is asserted inside the census spec itself (the F-1458-1 narrow filter).

## Merge classification

Base `3445d479`; main had moved **4 commits** ahead. Per-file:

| File | Class | Resolution |
|---|---|---|
| `src/agent/MechanicsManifest.ts` | LANE-TOUCHED | clean |
| `src/sim/HeadlessContractSim.ts` | LANE-TOUCHED | clean |
| `e2e/er01-e2-census.spec.ts` | LANE-TOUCHED | clean |
| `docs/bench/e2-readiness-census.md` | LANE-TOUCHED | clean |
| `tasks/BACKLOG.md` | **BOTH-MOVED** | conflict — resolved to HEAD, see below |

The only conflict was the ledger. The lane's added line read *"✅ READY-FOR-GATES —
`lane-e2-pressure-socket` on lane-a"*, which **this merge makes false**. Landing it would leave a
half-retired entry (Mistake #5). Resolved by keeping main's side and writing the merged verdict
directly in the bookkeeping commit — the same call s1458 made for lane-b, and the reason lane/a
will read `ahead` after this drain while holding nothing unabsorbed.

`SUPPORTED_CONTRACTS` and `bench-seeds.json` are **append-only union surfaces** per the
PARALLEL-CENSUS DRAIN NOTE — this drain kept all epochs' members, and the three census drains
queued behind it must do the same.

## Findings

**F-1461-1 — 🟥 A LANE WAS RESET OVER UNDRAINED OUTPUT; 113 LINES SURVIVED ONLY IN THE REFLOG.**
Found at this fire's triage, not by this slice. `lane-b` committed the ER-01 **E3 Voltage census**
at `d0f52744` (20:47:02) and was `reset --hard` to `origin/main` roughly **30 seconds later** when
the runner dispatched the E6 census into the same slot. The done-move
`20260805-203235-lane-er01-e3-census.md` sat un-prefixed, claiming a completed run, while its
content — `docs/bench/e3-readiness-census.md`, `e2e/er01-e3-census.spec.ts`, 16 lines of
`bench-seeds.json`, 113 insertions total — was on **no branch and not on main**. This is the
Reset Massacre (Mistake #2 / LANE-SAFETY LAW) arriving through the **runner's own same-lane serial
dispatch**, not through a fire's refill: the attended batch put E6 behind E3 on lane-b, and nothing
between them drained E3. **Rescued to `archive/lane-b-s1461-orphan-er01-e3-d0f52744` before any
other work.** The re-land is left to the next fire (budget), and the *class* is open: any
same-lane serial pair queued without a drain between them repeats this exactly.

**F-1461-2 — 🟡 GOAL REGISTRATION DEBT ON THE WHOLE CENSUS BATCH.** None of
`lane-e2-pressure-socket`, `lane-er01-e3/e4/e5/e6-census` registered a goal leaf, so
`drain-block-check` returns `UNKNOWN` for every one of them — the F-1458-3 shape, one wave later
and five leaves wide. This slice's leaf is registered in the bookkeeping commit; the four census
leaves are owed by whoever drains them. Non-blocking.

**F-1461-3 — 🟡 MY OWN INSTRUMENT RETURNED A FALSE ZERO, KEPT AS THE LESSON.** My first goal-tree
search walked `children`/`leaves`/`nodes` — none of which `tasks/goals.json` uses (`goals` /
`subgoals` / `tasks`) — and reported **0 matches**, which reads exactly like "ER-01 has no leaves
at all" and would have made F-1461-2 look total rather than partial. Caught because `grep` on the
raw file immediately found `er-01-e2-census`. A fresh classifier's first answer is more likely its
own bug than a discovery; the raw-text cross-check cost one command.

No blocking findings.
