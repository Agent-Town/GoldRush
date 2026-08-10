# Review — f1643-1: front-door-parity learns `PICK_UPGRADE` (the verb AP-16-2 added)

**Slice:** `f1643-1-front-door-parity-repair` (FIRE-AUTHORED s1644, drained s1645)
**Branch:** `lane/b` · **tip:** `b05a7adee` · **base:** `50a02fd54`
**Merge:** `dce549beaf7f6e6bd4ffc57c42a1a5d7a3bcb93e` (main, 2026-08-11)
**Gated by:** s1645 fire, detached worktree `gate-s1645` (§3.0b), `--workers=1` (§3.1)

## Verdict

**PASS — MERGED.** All 8 scope items delivered, every measured value reproduced independently at the
gate, and a same-tree control proves the cure is load-bearing rather than decorative.

## What it does

`e2e/front-door-parity.spec.ts` was RED 0/4 on main (F-1643-1). s1644's authoring measurement found
the cause was a **stale CLIENT, not a stale outcome**: the spec fed a fixed 13-batch order stream via
`spawnSync(..., { input })`, but `scripts/gr-sim.mjs:99-101` is strict lockstep — one batch per
non-terminal turn — so once the AP-16-2 pick clock added turns, the stream ran out and
`scripts/gr-sim.mjs:179` threw `stdin ended while gr-sim was waiting for standing orders`. The test
**crashed**; it did not drift.

This slice replaces that client with a **reactive lockstep driver** (`spawn` + line-read, one batch
per view) that answers `PICK_UPGRADE` on `now.pendingOffer[0].id`. Answering, the door still secures
The Claim at `waves:10` — **exactly what the spec always asserted**. Three tests now stand where two
stood:

| test | client | outcome |
|---|---|---|
| `pure stdin progression …` | answers picks | `secured:true, waves:10, kills:297, calls:26, defaultedPicks:0`, hash `fnv1a32:fd705184`, first upgrade **level 2** |
| `silence defaults the first upgrade at the deadline` **(NEW)** | silent (HOLD only) | `secured:false, waves:8, kills:200, calls:38, defaultedPicks:6`, hash `fnv1a32:bd899678`, first upgrade **level 4** |
| `idle remains deterministic and losable …` | idle | `secured:false, waves:2, upgradesTaken:{}, defaultedPicks:0` |

Two things in that table are worth naming beyond the pass/fail:

1. **The new silent test is the first assertion anywhere of the published promise.**
   `public/skill.md:78` — *"Silence at the deadline applies the first choice, exactly like the browser
   clock, and increments `defaultedPicks`"* — was the parity claim of the whole AP-16-2 slice and no
   test exercised it. It does now.
2. **The loss is pinned as the COST OF SILENCE, not as the norm.** This is the distinction the whole
   repair turns on. F-1643-1 asked for a re-baseline; a re-baseline would have pinned `waves:8` on the
   *primary* test and recorded "the agents' front door loses The Claim" as expected behaviour — false,
   and defended thereafter by a green test. Here `waves:8` appears only on the silent arm, contrasted
   against an answered arm that wins, with `ANSWERED_FIRST_UPGRADE_LEVEL` asserted as strictly
   earlier. The spec now states a law instead of a number.

The idle re-baseline (`waves:3→2`, `upgradesTaken:{heavy_spark:2}→{}`) is the one genuine stale-value
repair, and its cause is written into the file as a comment citing `HeadlessContractSim.ts:767-783`:
the idle hero dies at 81.7 s, before any `Balance.offers.pickSeconds` deadline elapses, so it takes
zero picks, is weaker, and dies a wave earlier. Two drifted values, one cause, no bug.

Scope 8 halves the standing cost: the spec spawns `gr-sim.mjs` and never opens a page, yet
`playwright.config.ts:74-96` collected it into both projects — which is precisely where the "0/**4**"
came from. It now skips outside `desktop-chrome`, expressed in-file (`test.beforeEach` + reason
string) without touching the firewalled config.

## Evidence

| gate | result |
|---|---|
| `npx tsc --noEmit` | clean |
| `npm run build` | green (`✓ built in 1.32s`) |
| own spec, both projects, `--workers=1` | **3 passed (desktop-chrome) / 3 skipped (mobile-chrome)**, 17.9 s |
| **CONTROL — main's spec, same tree/shell/hour** | **4 FAILED / 0 passed** |
| adjacent `node --test scripts/gr-sim.test.mjs` (run ALONE) | 16 tests · **14 pass · 0 fail** · 2 skip · 245 s · unedited |
| adjacent `ap16-4-contract-admission` + `ap16-upgrade-door`, both projects | **4/4 passed**, 9.9 s |
| plain boot probe `f1297-2-plain-boot-tape-button`, desktop + 390px | **2/2 passed**, 27.6 s, zero console/page errors |
| screenshots | none — nothing renders; this spec opens no page |
| `test:node-guards` | **not required**: the diff touches no `src/sim/`, `src/systems/`, `src/entities/` (F-1460-1's path rule). `gr-sim.test.mjs`, the sim pin suite, was run anyway and is green with zero hash drift. |

**Two checks were run because a green alone would not have been evidence:**

- **The control.** The battery passing says the merged spec is green; it does not say the change is
  why. Reverting only the changed file to main's version *in the same gate worktree, same shell, same
  hour* returned **4 failed / 0 passed** at `e2e/front-door-parity.spec.ts:72`, reproducing F-1643-1's
  red exactly. Post-merge: 3 passed / 3 skipped. The cure is load-bearing.
- **The unverified pin.** The runner pinned `eventLogHash: 'fnv1a32:bd899678'` for the silent arm — a
  value it measured itself, which the master's table never contained and s1644 therefore never
  pre-verified. My gate run is its independent second measurement, and it reproduced. (The answered
  arm's `fd705184` had already been measured twice by s1644 and reproduced here a third time.)

## Merge classification

**1 path, LANE-ONLY.** `git diff --stat 50a02fd54 lane/b` = `e2e/front-door-parity.spec.ts` alone
(+103/-28). Main moved 7 paths since base — `STATUS.md`, `tasks/BACKLOG.md`, and five `logs/*` —
and the **intersection is EMPTY**, so no graft and no conflict resolution. `git merge --no-ff` was
clean; `main..lane/b` is now empty. Merged and committed as ONE act (F-1589-5 — no staged merge left
on main while the review was written).

## Runner report — all four items answered

The master ended `READY-FOR-GATES + report (a)…(d)`, and the runner answered all four rather than the
headline only: (a) three outcomes matching the Why §3 table; (b) `fnv1a32:fd705184` reproduced
**exactly** — s1644's standing instruction was that a divergence here would be *news, not noise*, and
there was none; (c) it agreed with the desktop-only ruling; (d) it reported the lockstep protocol
matched the master, with **one correction: the master's ~2-minute-per-run runtime estimate was high
for this Mac** (measured bodies 19.6 s, 21.17 s total wall). That estimate was the master's stated
reason for dropping the double-run determinism check in favour of hash pinning (scope 6) — see F-1645-1.

## Findings

**F-1645-1 (advisory, non-blocking, no owner word needed).** Scope 6 traded the answered test's
**double-run byte-compare** for a single run plus an `eventLogHash` pin, and justified the trade by a
cost estimate — *"a reactive run is ~2 minutes … keeping double-runs would add ~8 minutes per
project"* — which the runner then measured as **wrong by an order of magnitude**: the whole spec is
17.9 s. The trade is still defensible on its merits (a pinned hash asserts a *specific* value across
all runs, which is strictly stronger than asserting two runs agree with each other), so **nothing is
owed here and the spec should not be reopened for it**. Recorded only because the reasoning is now
detached from its premise, and a future fire reading scope 6 would inherit a cost model that this
drain disproved. If double-runs are ever wanted back, they cost ~36 s, not ~8 minutes.

**No blocking findings.** Nothing was written to `tasks/queue/` from this drain.

## Duties

- **GZ-01: correctly NOT owed.** The filter is "the review names a player-visible change". This slice
  changes one e2e spec and zero production files; no player sees anything. Recording the reasoning
  rather than the silence, per the standing sweep's own warning about absences.
- **Deploy: correctly SKIPPED** — no gameplay-affecting code merged (test-only diff).
