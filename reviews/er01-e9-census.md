# reviews/er01-e9-census.md — ER-01 E9 Red Fields readiness census

- **Slice:** `lane-er01-e9-census.md` (ER-01 ladder, E9 Red Fields)
- **Branch / tip:** `lane/c` @ `6f13290bd` (single runner commit)
- **Merged to main:** `ca096ccd376bfe3f570c0beb4b7daefdf548c868`
- **Drained by:** s1480 fire, 2026-08-06
- **Verdict:** ✅ **MERGE** — and this is the most self-critical census of the wave.

## What it does

Measures all four `epoch-9-redfields` contracts against `HeadlessContractSim` under AP-11.
Verdict **0 AGENT-READY / 4 DATA-GAP / 0 BROKEN**.

Epoch-wide `E9ArsenalSystem` is browser-only from the headless sim's perspective and absent from
the mechanics manifest. `e9-dome-basin` additionally depends on browser-only `E9CanalSystem` and
`OldDiggerBossSystem`; Seed Run, Devil's Alley and Old Canal each declare their signature
persistence/relocation consumer `missing`. Every derived manifest exposes zero interactables and
only generic `build_zones`, so Storm Fence deployment, Cure-Arms outcomes, canal gates, quarry
work, dust-devil displacement, Old Digger boarding/tape exchange, planted waypoints, scheduled
relocation and persistent canal choices are all unexpressed.

## Two refusals worth more than the table

1. **It ran the naive arm and then refused to let it count.** Each rejected contract was forced
   through the generic Trail driver with no orders (`--policy=idle` behaviour), each diagnostic
   run repeated and **matched byte-for-byte** — and the census explicitly states those hashes are
   **not acceptance pins**, because the model omits the very mechanics whose events would have to
   contribute before determinism could be certified. Reproducibility is not admissibility. This
   is the same discipline the E5 and E6 censuses applied, held here under the temptation of a
   clean hash.
2. **It reports its own interpreter honestly** — diagnostics on the lane's default Node 23.11.1,
   named in the doc rather than left implicit (F-1458-2).

**BROKEN is 0 for a stated reason**: all four bundles load, all seven generic standing-order forms
respond on both diagnostic seeds, every forced idle run terminates by hero death, and the guard
captures zero console output. *"The missing layer is contract semantics, not bundle integrity."*

## Evidence

| Gate | Result |
|---|---|
| Custody | detached worktree `gate-s1480` @ `ee765d306`, stacked on the E7+E8 merges — §3.0b |
| §3.0 block check | UNKNOWN pre-drain (F-1480-1); leaf registered by this drain |
| `npx tsc --noEmit` | **rc=0**, no output |
| `npm run build` | **green, 1.79s** |
| Own spec, desktop + mobile | **8/8 passed, 8.1s**, `--workers=1` |
| Console/page errors | zero captured |
| Diff shape | **112 insertions, 0 deletions**, exactly 3 files |

## Merge classification

Base `main` @ `90d57a97` (post-E8). Both new files are pure LANE-ONLY adds (40 / 71 lines, none
on main). `tasks/BACKLOG.md` BOTH-MOVED add/add — union-resolved with the lane's
`READY-FOR-GATES on lane/c` retired to `✅ MERGED s1480` in the merge commit (F-1461-4).
`SUPPORTED_CONTRACTS` and `bench-seeds.json` unchanged, consistent with zero admissions — hence
no `test:node-guards` obligation under F-1460-1 (zero `src/` bytes, nothing `gr-sim.test.mjs`
consumes).

## Findings

### F-1480-2 gains its third instance — and the wave now disagrees with itself in a countable way

`e9-dome-basin` **omits `engineDependencies`** despite its missing headless/manifest consumers,
while its three siblings each declare one honest missing dependency. The census records the
asymmetry rather than editing contract content, which is the correct firewall call.

Combined with `e7-relay-valley` (same omission, this fire) and the E5 Deepwater Claim (s1461),
that is **three instances across three epochs**.

> ~~and in every case the offender is *the epoch's flagship contract* — the one with the most real
> browser machinery behind it… This is now a pattern with a predictable shape, not three
> coincidences.~~
>
> ⚠️ **STRUCK — FALSIFIED ~15 MINUTES LATER BY THE E10 CENSUS, same fire.** E10's flagship
> `e10-last-claim` **declares its missing dependency correctly**; the offender there is
> `e10-ember-shore`, which is not the flagship. I generalised from n=3 with the fourth data point
> already sitting in an undrained lane. See `reviews/er01-e10-census.md` for the corrected
> finding: the omission **is** systematic (one per epoch, 4 for 4), but its victim is **not**
> predictable from flagship status.

What survives, and is the part worth acting on: a reader of contract data alone cannot distinguish
"no missing dependency" from "missing dependency not declared", so an undeclared contract reads as
*more* ready than its honest siblings. It belongs in the attended socket masters as a declaration
fix, not just a socket fix.
