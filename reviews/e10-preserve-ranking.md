# e10-preserve-ranking — drain review (fire s2462, 2026-09-03)

**Slice:** `tasks/e10-preserve-ranking.md` (lane-a, fire-dispatched 2026-09-03T00:45:54)
**Branch:** `lane/a`, tip `ba8f9c9a4` (`runner(lane-a): e10-preserve-ranking.md`)
**Base:** `1c57e5e6` (merge-base `main..lane/a`)
**Merge commit:** `1fefa326a32bb83b8a0858dd66633b7e328e7cec`
**Drain tip on main:** `3361e7b91` (the owed engine pin, committed separately)
**Gated in:** detached worktree `gate-s2462` (§3.0b — undecided content never entered main's working tree or index)

## Verdict

**MERGE.** Gate green on the merged tree. One battery red survives and is
pre-existing, fingerprint-matched with proof (F-2459-3 / F-2460-3); zero reds
are caused by this slice. One drain duty was owed and is discharged in this
fire (the engine pin, below).

## What it does

E10 preserve contracts now rank by preservation instead of by gold. For rows
whose contract carries authored `twist.preserve` data, `compareScores` orders
secured first, then waves survived with the Preserve alive, then the Preserve's
remaining HP fraction, then time alive, then earliest submission — and neither
gold nor base value is a key. The browser submits two additive score fields,
`preserveWavesAlive` and `preserveHpFraction`, derived from the terminal
preserve state of the run tape's event log; rows predating those fields sort
last among preserve rows rather than crashing. Rows of contracts without
`twist.preserve` keep today's order byte-for-byte. `public/skill.md` pins the
rule for the agent door: "`e10-last-claim` is ranked by preservation, never by
gold."

This is the ruled half of the E10 flip — the owner's Q2 answer of 2026-09-02
("sure, start all of them", CAPABILITY-LADDER §6). Its predecessor
`e10-preserve-objective` shipped the objective itself with the ranking
untouched, because the ruling arrived after that master had already dispatched.
A preserve contract that ranked on gold rewarded the habit the contract asks
the rider to drop.

## Evidence

All figures measured on the merged tree in `gate-s2462`, fire shell,
`--workers=1` (F-1270-1), against an external scratch server on port 5234
(Mistake #12 attribution hygiene).

| Gate | Result |
|---|---|
| `drain-block-check` (repo root, before and after) | ✅ CLEAR — `status="queued"`, no block |
| `npx tsc --noEmit` | **rc=0**, 4.9 s |
| `npm run build` | **rc=0**, 19.6 s |
| `e2e/e10-preserve-objective.spec.ts` (sibling) | **4 passed / 0 failed**, 37.6 s |
| `e2e/lb-01-county-standings.spec.ts` | **28 passed / 0 failed**, 1.3 m |
| `e2e/skillmd-door.spec.ts` | **2 passed / 0 failed**, 0.9 s |
| adjacent: `task-025` + `m1-01` + `m2-01` | **32 passed / 0 failed**, 4.9 m |
| adjacent: `tape-01` + `tape-02` + `c7-standing-order-replay` | **14 passed / 0 failed**, 1.9 m |
| adjacent: `same-laws-harvest-parity` | **4 passed / 0 failed**, 43.1 s |
| **e2e total** | **84 passed / 0 failed**, desktop-chrome AND mobile-chrome (390px) throughout, zero console/page errors |
| `test:stats` (the master's own fixture suite) | **rc=0**, 9 s |
| `test:accounts` · `test:mp` (`functions/` changed — F-1229-1) | **rc=0** 3 s · **rc=0** 5 s |
| `test:task-guards` | **rc=0** |
| `test:power-budget` | **rc=0**, p95 **0.334 ms** / 0.384 ms vs 0.500 ms cap |
| `test:node-guards` (run ALONE, §3.1) | 571 tests — **564 pass / 2 fail / 5 skipped**, 837.7 s |
| `engine-era-guard` after the owed pin | **5/5 green** |

Transcript: `artifacts/e10-preserve-ranking-gate.txt` (append-only, records the
`--cwd` and both `--env` values, so the battery cannot claim a tree it did not
measure).

### The two node-guards reds, both accounted for

**1. `engine-era-guard` — caused by this slice, and cured in this fire.**
`src/game/Game.ts` is inside `ENGINE_SOURCE_INPUTS` (the corpus is
`scripts/assay-replay-agent.mjs`, `assets/contracts`,
`assets/crafting-queue/contract.v1.json`, `assets/crafting-queue/approved`,
`assets/layer-contracts`, `assets/pilots/map-rebuild-spike`, `src`), so the
slice rotates the engine identity to
`ac138d0f393a3f0630cd59fc5e3035e8b507db07c8275a5d13ba0bb8f8332a34`.

**Causes COUNTED, not assumed** (the one-pin-blesses-both trap, F-2460-1):
`engine-era-guard` is **5/5 GREEN on unmerged main**, so main was clean and this
slice is the sole cause — one pin blesses exactly one thing. Appended a
**same-era** pin (era 5 "the Replayed Board", pins **12 → 13**) whose `cause`
records a content re-hash with no simulation behaviour change, and updated the
**top-level `engineHash`** in the same edit — F-2460-1's specific warning, since
the guard asserts `registry.engineHash === registry.pins.at(-1).engineHash` and
a half-edit reds at an earlier assertion that reads like a different failure.
Diff is 7 insertions / 1 deletion with no reformatting. Guard 5/5 after.

Same era rather than a bump: nothing was removed or renamed, no tape shape was
invalidated, the ranking change itself lives in `functions/` (outside the hash
corpus), and `view-schema-guard` stayed green.

**2. `fixture-teardown` — pre-existing, fingerprint-matched with proof.**
Re-run ALONE on the merged tree after the pin (650.0 s, output redirected to a
file per F-2460-3's method note — a `spawnSync` timeout kills the child and
discards its output, which is a harness timeout wearing a failing exit code).
It reds at the **survivor sweep**, not the child-status assert, exactly as
F-2460-3 predicted: *the pin did not break it, the pin UNMASKED it* — a failing
child aborts the test before the sweep is ever reached.

The survivor report names `scripts/art-staging-gitdir-link-guard.test.mjs: 11
[art-gitdir-…]` and **every other one of the 115 fixture owners reports 0**.
Same file, same count of 11, same `art-gitdir-` prefix as F-2459-3, which s2459
proved pre-existing by running `fixture-teardown` on an unmerged main
(`be7b5933e`, 681.5 s, identical failure); the suffixes differ only because they
are `mkdtemp` randoms.

**Net battery state on the merged tree: one red, pre-existing and already
recorded twice; zero caused by this slice.**

### A direct behaviour-neutrality probe, not an argument

`same-laws-harvest-parity` writes a tracked parity artifact. Re-running it on
the merged tree changed **only `wallMs`**:

```
-    "wallMs": 1668        +    "wallMs": 4108     (desktop)
-    "wallMs": 1653        +    "wallMs": 3720     (mobile)
```

`eventLogHash: fnv1a32:a6c04f80`, `outcome`, `secured`, `waves`, `gold`,
`timeAlive` and `ticks` are **byte-identical to the artifact main already
carries**. That is the claim "content re-hash only, no simulation behaviour
change" measured rather than asserted, on a non-preserve contract — which is
precisely the population the conditional spread is supposed to leave untouched.

### Why the tape suites were added to the adjacent list

The master's own self-check named only `tsc`, `build`, `test:stats` and
`test:node-guards`, and `reviews/e10-preserve-objective.md` gated its
predecessor on the objective spec alone. But this diff edits
`runTapeEventLog()` — the **run tape's event log**, not merely the standings
submission — so it can move tape content, and s2461 landed human tape stamping
one fire earlier. A review's adjacent-suite list is perishable and is scoped to
the defect rather than the cure; `tape-01`, `tape-02`, `c7-standing-order-replay`
and `same-laws-harvest-parity` were run for that reason and are green (18/18).

The `preserve` field is spread **conditionally** (`...(preserve ? { preserve } :
{})`), so a non-preserve run's event log is byte-identical, which the parity
artifact above confirms.

## Merge classification

Base `1c57e5e6`; `lane-freeze-classify` read **HOLDS 6 paths**, and
`lane-absorbed-lines` then asked the one-directional question and returned
**NOT ABSORBED on all six** — a genuine merge, not a false-ahead.

| File | Class | Resolution |
|---|---|---|
| `functions/api/standings.ts` | BOTH-MOVED | auto-merged clean (the preserve branch is additive to `compareScores`) |
| `src/game/Game.ts` | BOTH-MOVED | auto-merged clean |
| `public/skill.md` | BOTH-MOVED | auto-merged clean |
| `tasks/BACKLOG.md` | BOTH-MOVED | **CONFLICT** — resolved by keeping BOTH sides (below) |
| `scripts/test-standings.mjs` | LANE-ONLY | clean apply (48/55 added lines absent from main) |
| `scripts/skillmd-guard.test.mjs` | LANE-ONLY | clean apply |

**The one conflict.** Both sides prepended a row at the top of `BACKLOG.md`:
main carried the s2459–s2461 bookkeeping rows, the lane carried its own
`E10 PRESERVE RANKING — READY FOR GATES` row. Both were kept — main's block
first, then the lane's row immediately above the sibling
`E10 PRESERVE OBJECTIVE` row it follows.

Verified by set-difference rather than by eye: **0 of main's rows and 1 of the
lane's rows** are absent from the merged file. That one row is `F-PT16-1`, and
it is a **lawful retirement, not a loss** — both sides carry that row and main's
copy is the NEWER one (s2461 updated its tail from *"filed FIRE-AUTHORABLE:
human standing-order tapes cannot be watched"* to *"READY-FOR-GATES: fresh human
tapes carry the era-5 engine stamp…"*, first divergence at char 2959). The
merged file keeps main's version, which is correct. A union row-check scores
lawful retirements as losses, so the two versions were diffed before the
verdict was formed.

After the merge, `main..lane/a` is **empty** — fully absorbed, not tip-grafted.

## Findings

**F-2462-1 — my own first guard battery was self-contaminated, and one of its
two reds was mine rather than the slice's (measured, NON-BLOCKING, cured in
this fire).** I ran `run-guards.mjs --changed-since` in the background *while*
the playwright battery ran, which §3.1 forbids in as many words (*"Run it
ALONE"*, and s1536 hung ~19 min doing exactly this). `test:power-budget` came
back **p95 0.966 ms against a 0.500 ms cap — FAIL**. Re-run alone on a quiet
machine the same tree reads **p95 0.334 ms — PASS**, and again at 0.384 ms.

That is a **2.9× swing on a timing assertion produced entirely by my own
concurrency**, and it is F-2166-2's mechanism from the other direction: that
finding measured a battery getting slower under load, this one measures a
*verdict inverting* under load. Had I reported the first run, I would have filed
a fabricated regression against a slice that does not touch `PowerGraph.ts` at
all. **Nothing shipped wrong** — the contradiction was visible because the same
tree was measured twice — but the cost is that the whole first battery was
worthless and had to be re-run, and the honest reading is that a red from a
contaminated battery is not evidence in *either* direction.

Reusable: §3.1 says to run `test:node-guards` alone and gives a hang as the
reason. The sharper reason is that a fire's own parallelism is indistinguishable
from a real timing regression *at the assertion*, so a self-contaminated battery
does not merely cost wall time — it manufactures findings. The cheap defence is
already written down and I did not follow it.

**F-2462-2 — the master's self-check under-named its adjacent suites, and the
runner correctly did not widen them (NON-BLOCKING, no corrective owed).** The
master firewalled the slice to `functions/api/standings.ts`, the tape→score
site, the `test:stats` fixtures and `skill.md`, and named `tsc` / `build` /
`test:stats` / `test:node-guards` as the self-check. It did not name any
playwright suite, and in particular not the tape suites — even though its own
scope 2 sends the runner to edit `runTapeEventLog()`. That is a master-authoring
gap, not a runner failure: the runner stayed inside its firewall, which is a
firewall success. The drain owed those suites a run and took it (18/18 green).
Recorded so the next E-ladder master that touches a tape seam names the tape
suites in its self-check.

**F-2462-3 — the runner's own `test:node-guards` headline was wrong in the
permissive-sounding direction, and the drain's re-run is the free control
(NON-BLOCKING).** The runner reported *"558 pass, 5 fail, 2 skipped"* and
attributed the failures to "the expected drain-time engine pin", "pre-existing
gate wiring/pointer issues and contention". Re-run alone on the merged tree the
same battery is **564 pass / 2 fail / 5 skipped** — so three of the runner's
five reds were its own shell's contention, and the surviving two are exactly the
engine pin and F-2459-3. The runner's *conclusion* was sound; its *counts* were
not, and a drain that had inherited them would have gone looking for three
defects that do not exist. The drain's own re-run is a free control on the
runner's headline (F-2166-2) and it paid for itself here.

## Player-visibility (Mistake #10)

The change is visible in a plain boot with no `?debug`: the Claim Ledger's
county board for `e10-last-claim` is the surface, and
`e2e/lb-01-county-standings.spec.ts` (28 tests, both projects) boots at a plain
`/` and asserts the seeded board renders, including its empty-contract state.
The agent-facing half is `public/skill.md`, served and asserted by
`e2e/skillmd-door.spec.ts` on both projects.

The ordering itself is proven by the `test:stats` fixture table the runner
built — secured beats unsecured, more waves-alive beats fewer, HP fraction
breaks ties, **gold does not reorder**, and a mixed-board case proves
non-preserve rows are untouched:

| Rank | Preserve waves | HP fraction | Time alive | Gold |
|---:|---:|---:|---:|---:|
| 1 | 8 | 0.2 | 120 | 900 |
| 2 | 7 | 0.8 | 120 | 10 |
| 3 | 7 | 0.4 | 120 | 1000 |
| 4 | 6 | 0.5 | 130 | 1000 |
| 5 | 6 | 0.5 | 120 | 1 |
| 6 | 6 | 0.5 | 120 | 1000 |
| 7 | *(missing fields — legacy row)* | — | — | — |

Ranks 5 and 6 are the load-bearing pair: identical on every preservation key,
1000× apart in gold, and gold does not separate them — earliest submission does.
