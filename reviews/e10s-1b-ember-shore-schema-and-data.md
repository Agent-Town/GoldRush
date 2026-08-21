# e10s-1b — Ember Shore schema and data

**Slice:** E10S-1 (`specs/agent-play/e10-ember-shore-preserve.md` §4)
**Branch:** `lane/a` · **Tip:** `61358eb555e10e236071f8dc7b2e6e8b39c030b0` (2026-08-21T12:00:13+07:00)
**Base at gate:** `43c921149` (main, s2125 lock)
**Gate worktree:** `gate-s2125` (detached, §3.0b — undecided content never entered main's tree)
**Drained by:** s2125 fire, 2026-08-21

## VERDICT: **HOLD — NOT MERGED.** Owner fork; see F-2125-1.

The slice does what its master asked and its own gates are sound. It is held for a
reason no gate in its master could have seen: **it admits `e10-ember-shore` to the
public door while omitting the two door-surface files that every other admission in
this repo carries, which reds three deterministic guards on main.**

## What it does

Authors the E10S-1 data layer for the Ember Shore preserve: the `twist.emberShore`
block and roster in the epoch-10 contracts, four `harvestAnchors` on the cooling
veins, the `e10-ember-shore` mask table, bench seeds `-01`/`-02`, regenerated null
floors, the census row, a mask-table assertion, and two `AUTHORED_TWIST_KEYS`
entries in `src/meta/ContractFamilies.ts`. Twist-inert by design — the preserve
consumer lands at E10S-3, the door at E10S-4.

## Merge classification

Clean 3-way merge, no conflicts, 7 paths — **all LANE-ONLY** (`lane-usable.mjs lane-a`:
`ahead=1 behind=9 paths=7 tracked-dirt=0 untracked=0`). Main had moved none of them.

| Path | Class |
|---|---|
| `assets/contracts/bench-seeds.json` | LANE-ONLY (+4) |
| `assets/contracts/epoch-10-deepsky/contracts.json` | LANE-ONLY (+55/-1) |
| `assets/contracts/epoch-10-deepsky/mask-tables/e10-ember-shore.json` | LANE-ONLY (+19/-1) |
| `assets/contracts/null-floors.json` | LANE-ONLY (+20/-1) |
| `e2e/er01-e10-census.spec.ts` | LANE-ONLY (+1/-1) |
| `scripts/e3-mask-tables.test.mjs` | LANE-ONLY (+7/-1) |
| `src/meta/ContractFamilies.ts` | LANE-ONLY (+3/-1) |

## Evidence

| Check | Result |
|---|---|
| Merge into `gate-s2125` | clean, `f47b1c42c`, 7 files / +103 / −7 |
| `e10-last-claim` unmoved | ✅ **verified** — the door diff is exactly one line, `+ 'e10-ember-shore'`; `e10-last-claim` present in both sides |
| **Control — clean main `43c921149`** | ✅ `skillmd-guard` + `door-admission-ratchet` → **6 pass / 0 fail**, 3.10 s |
| **Merged tree `f47b1c42c`** | 🔴 **3 pass / 3 fail**, 5.52 s |
| Runner-reported battery (lane tree) | `468 tests · 461 pass · 6 fail · 1 cancelled`, 301.9 s |

### The three deterministic reds — slice-caused, timing-free

| Test | Merged tree | Clean main |
|---|---|---|
| `door-admission-ratchet.test.mjs:15` derived door matches the fixed admission baseline | ✖ 2537 ms | ✔ 1718 ms |
| `skillmd-guard.test.mjs:33` skill.md bench seeds match the source registry | ✖ **1.93 ms** | ✔ 0.16 ms |
| `skillmd-guard.test.mjs:40` skill.md door-contracts match SUPPORTED_CONTRACTS | ✖ **0.39 ms** | ✔ 0.09 ms |

Two of the three fail in **under 2 ms**. No scheduling, load or engine hypothesis can
reach them. In each case `actual` is what `public/skill.md` / `door-admission-baseline.json`
declare and `expected` is what the slice's own registry now derives — the assertion
diff is the single token `e10-ember-shore` in all three.

**This refutes the inherited hypothesis.** The run report volunteered that *"some
timeout failures ran under Node 23 instead of the required Node 26.4.0"*, and s2124
carried that forward as the whole explanation (*"the F-2076-1 / F-2099-1
engine-and-load class"*), gating the drain on a two-battery fingerprint. **Half the
set was never load.** The differential above cost 8.6 seconds of measurement, not the
~14 minutes two full batteries would have cost — because the question was *which
tests*, and the run log answered it.

### The run log **does** name the six

s2124 recorded that *"the run log does not name the six"*. It does, in a standard
node TAP summary at `tasks/runs/20260821-112744-lane-a-e10s-1b-ember-shore-schema-and-data.md.log:16909–16919`,
followed by a `✖ failing tests:` block naming each with its file, line and duration.
The remaining three, **not re-measured this fire** (see below):

| Test | Duration | Class |
|---|---|---|
| `fixture-teardown.test.mjs:24` | 170,226 ms | timing (F-2099-1 records this same test at 69.6 s) |
| `gr-sim.test.mjs` (file-level) | **300,000.9 ms** | timing — a failure lasting *exactly* the timeout is a scheduling verdict |
| `node-guards-timeout.test.mjs:94` | 1,225 ms vs a 1,000 ms budget | timing (this test's whole subject is budget enforcement) |

**UNVERIFIED THIS FIRE, deliberately and by law:** `lane/d` was mid-run on `f2124-1`
throughout (pid 28579, dispatched 12:01) and load average reached **11.26**. F-1537-1
forbids overlapping batteries — they contaminate both — and F-2099-1 establishes that
these reds are load-attributable, so a battery taken under a live lane run could not
have produced a trustworthy fingerprint in either direction. None of the three reads
any file this slice touches. They are carried as *probable* timing-class, not proven.

## Findings

### 🔴 F-2125-1 (BLOCKING — owner fork) — the slice opens the public door on a map that cannot be beaten, and omits the two files every other admission carries

`src/meta/ContractFamilies.ts:1336` gates direct play on
`requested.tileParams.harvestAnchors?.length === 0`. An **empty** anchors array is
precisely what holds a map out of play. This slice authors **four** anchors, so
`e10-ember-shore` becomes enterable the moment it merges — with no preserve consumer
(E10S-3) and no door (E10S-4) behind it. The run's own null-floor measurement:
**69 rows, both Ember seeds terminate unsecured at wave 3, `0 secured:true`.**

**The house template couples admission to its door surfaces, and it is not ambiguous.**
Two independent precedents, both within the last 36 hours, touch the *identical* file
set to this slice **plus** the two it omits:

| Admission | bench-seeds | contracts | mask-table | null-floors | **skill.md** | **door baseline** |
|---|---|---|---|---|---|---|
| `c183d3496` e7-echo-canyon | +4 | ✅ | ✅ | ✅ | **+5** | **+1** |
| `1bbb73ad5` e9-devils-alley | +4 | +7 | +7 | +20 | **+5** | **+1** |
| **`61358eb55` e10s-1b** | +4 | +55 | +19 | +20 | **— absent** | **— absent** |

Both precedents admitted a map whose consumer already existed; each commit message
says so (*"admitted — four anchors, bench seeds, **door surfaces**"*, *"admitted —
anchors, seeds, floors, census, audit (A9 **door**)"*). **No map in this repo has been
admitted at its data slice.**

**Neither the runner nor s2124 was wrong about the facts.** The runner flagged this as
its blocker 1 (*"Ember Shore's anchors prematurely admit it before E10S-4"*) and
declined to touch it — correct on both counts. s2124 re-derived it against the spec and
found `specs/agent-play/e10-ember-shore-preserve.md:25` ratifying admission at slice 1
(*"rows appear only with admission; 0 secured:true"*) — also correct. **What neither
checked is that the spec's slice split is out of step with the template the factory
actually follows**, and the spec assigns *"skill.md fences, door baseline"* to E10S-4
(`:28`) without noting that deferring them reds three ratchets in the meantime.

**Why this is not a fire's to take.** Every resolution is a player-facing or
spec-amending call:

- **(a) RECOMMENDED — hold the anchors.** Land E10S-1 with `harvestAnchors: []`; move
  the four anchors to E10S-4 alongside `skill.md` + baseline, exactly as e7 and e9 did.
  Guards stay green, no unbeatable map reaches the public door, and the data layer
  still lands now. Costs a one-line correction to the spec's E10S-1 gate wording.
- **(b) Complete the admission here.** Add the 6 lines (`skill.md` +5, baseline +1).
  Guards go green, but the public door advertises a map that terminates at wave 3 of
  12 for however long E10S-2/3/4 take — and `skill.md` is the agent-facing door doc.
- **(c) Merge as-is.** Forbidden: it reds `test:node-guards` on main on three
  deterministic guards, which is the F-1460-1 shape — a red board that acquires an
  excuse label and then hides a real regression. Five fires missed a genuine sim
  regression that way.

**GATE: re-admit when the owner picks (a) or (b).** Under (a) the corrective is a
one-file data edit and this branch re-lands with anchors emptied; under (b) it is a
6-line completion. Either is a single small master. **Nothing here is lost** — `lane/a`
holds all 7 paths, `ahead=1`, and the branch is untouched.

## Notes

- `lane/c` separately holds the earlier **stopped** `e10s-1` attempt (`1a2b93969`,
  2 paths, leaf `e10s-1-ember-shore-data` blocked `gate-side`). s2124's handoff item
  (B) expected `lane/c` to flip to AHEAD-BUT-ABSORBED once `e10s-1b` merged. **It did
  not merge, so that item does not come due** — `lane/c` still reads HOLDS and must
  not be reset.
- `E10A-1` remains sequenced behind this slice (shared `AUTHORED_TWIST_KEYS` array;
  two lanes on one array is a serialize-law violation). **It does not become authorable**
  — s2124's item (C) was conditioned on this merge landing.
- Gate worktree `gate-s2125` retained with the probe merge for the next fire; it is
  detached and touches nothing.
