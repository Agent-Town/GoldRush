# hm-06-twin-banks-braid-water — the braid's water surface (HM-06, F-TB-1 (b))

- **Slice:** `tasks/hm-06-twin-banks-braid-water.md` (owner 2026-09-24 ruling F-TB-1 "(5) (b)"; queued 2026-09-25 on the owner's word "twin banks")
- **Branch:** `sol/map-art-campaign-2` (lane-c, Astra / gpt-6-astra)
- **Tip gated:** `d4c0207c3` "feat: record HM-06 braid constructor firewall blocker"
- **Base:** `01d2b2e52` (the lane's merge-base with main at run time)
- **Drained by:** s2680 fire, 2026-09-25, in the detached gate worktree `worktrees/gate-s2680`

## VERDICT: MERGE — as a FIREWALL STOP, not as an implementation.

The requested feature is **NOT implemented and does not claim to be**. What lands is the runner's
finding, its evidence, and an ordered remaining list. `READY-FOR-GATES: NO` is written in the
report itself. This is the firewall working exactly as designed (CLAUDE.md §4.5: "Codex reporting
adjacent problems is good; fixing out of scope is a violation"), and it is a **real diff with a
written WHY**, so it is not a Silent No-Op (Mistake #1).

## What it does

The master told the runner to make the Twin Banks water surface follow the `waterMask` that already
rules the simulation, touching only `Terrain3dClaimPilot.ts`'s "Twin Banks water entry". The runner
found the fix cannot live there: the mask-driven source-box pool needs changes to the **shared**
`createChannelWater` constructor, outside TOUCH-ONLY. It stopped before writing any renderer or test
change, and recorded why, with source coordinates and a mask comparison.

It also **corrects the master's premise**, which is the most valuable thing in the merge (see F-2680-1).

## Evidence

| Gate | Result |
|---|---|
| Diff is real (not a no-op) | 4 files, **+210 / −1** |
| Diff shape | `artifacts/**` ×3, `reviews/*.md` ×1. **Zero** `src/`, `e2e/`, `scripts/`, `tasks/`, `specs/`, `assets/`, `package.json` |
| Firewall compliance | **CLEAN.** All 4 paths are inside the master's TOUCH-ONLY (campaign report, status doc row, `run-11/braid/**`). Nothing in the NO list was touched |
| Runner pre-flight (its own, reported) | `npm install` exit 0; `npm run build` (tsc + Vite + asset diet) exit 0; tracked tree clean before and after |
| Store | detached at store main `5793a967d`, clean; branch `astra/hm-06-braid` cut at that commit; **no store commit, nothing to push** |
| Runtime/asset bytes changed | **0** — no engine-hash input touched, so no era pin is measured or moved |
| `run-guards --changed-since f9c9780ed` (merged tree, gate worktree) | see GATE BATTERY below |
| `npm run test:ledger-guards` | run as the fire's last act, before the clearing commit (§4 / F-E1T-2) |

**Gates deliberately NOT run, and why:** the master's self-check names tsc, both builds, six e2e specs
on both projects, boot probes, draw counts, frame p95 and the E1 payload. Those gate *code*. This diff
contains **no executable or config bytes** — no `src/`, `e2e/`, `scripts/`, `assets/` or `package.json`
— so running them would gate the wrong object and attribute any red to an unrelated cause. The battery
actually owed is the one the factory derives from the diff (`run-guards --changed-since`), which is what
ran. The master's suites are **owed by the implementation run, not by this finding**, and the remaining
list carries them.

## GATE BATTERY (merged tree, `worktrees/gate-s2680`)

`node scripts/run-guards.mjs --changed-since f9c9780ed` selected **base gate only** — "(no path rule matched)",
which is itself evidence about the diff's shape: no path rule in the factory's own mapper fires on it.

| guard | rc | time | verdict |
|---|---|---|---|
| `test:power-budget` | 0 | 0s | PASS (p95 = 0.375 ms) |
| `test:task-guards` | 0 | 0s | PASS |
| `test:citations` | 0 | 2s | PASS |
| `test:gate-callers` | 0 | 0s | PASS |
| `test:node-guards` | `signal:SIGTERM` | 900s | **RED — pre-existing, attributed below** |

**4/5. The one red is NOT this merge's, and it was attributed by a control, not by assumption:**

| run | tree | result |
|---|---|---|
| gated | merged, `worktrees/gate-s2680` @ `409a4ea91` | `signal:SIGTERM` @ **900s** |
| **control** | **clean PRE-MERGE main, primary checkout** | `signal:SIGTERM` @ **900s** |

The two fingerprints are **identical**. `test:node-guards` does not fail an assertion — it is **killed by
`run-guards`'s own 15-minute cap** (`timeout: 15 * 60 * 1000`) while still emitting passing tests.

Four further legs, because a timed-out suite returns no content verdict on either side and I did not want the
attribution resting on the timeout alone:

1. **§3.1's own trigger for `test:node-guards` is not met.** The law runs it "when the diff touches `src/sim/`,
   `src/systems/`, `src/entities/` or anything the engine hash covers". This diff touches none of them; the suite
   ran only because it sits in `run-guards`'s unconditional base gate.
2. **The guards that DO read the trees this diff touches all pass on the merged tree.** 36 of the 174 node-guard
   files reference `artifacts/` or `reviews/`, so this was checked rather than assumed — the seven that actually
   audit those trees were run individually: `review-evidence-audit` 6/0, `evidence-budget` 14/0, `evidence-readers`
   17/0, `evidence-archive-buckets` 10/0, `master-shipped-classifier` 12/0, `backlog-split-closed` 13/0,
   `same-game-audit` 6/0 — **78 assertions, 0 failures.**
3. **`scripts/evidence-budget.mjs` on the merged tree:** PASS (advisory) — 26,385 files / 8,658.1 MB tracked under
   `artifacts/`; no ceiling is banked yet, so it cannot refuse a drain.
4. **The guards that judge my OWN new files** (this review and the v2 master, which the base gate ran before they
   existed) were re-run after writing them: `test:task-guards`, `test:citations`, `test:gate-callers` all PASS.

**Caveat, recorded rather than hidden:** the control's `head` reads `41ef255c4` because I refreshed the lock
stamp mid-run to stop it going stale at 45 minutes. The code state was identical to `f9c9780ed` — only
`STATUS.md` line 1 differed — but three node-guard files (`desk-declaration-guard`, `law-pointer-guard`,
`status-rotate-month`) do reference `STATUS.md`, so a content verdict from those three in the control run would
be suspect. None of the three is reached before the cap in either run, and neither run reaches a content verdict
at all, so this does not affect the timeout fingerprint the attribution rests on.

## Merge classification

- **Base:** `01d2b2e52`. Merged into main at `f9c9780ed` with `git merge --no-ff d4c0207c3`, strategy **ort**, **zero conflicts**.
- Per file:

| File | Class |
|---|---|
| `artifacts/sol/map-art-campaign-2/report.md` | LANE-TOUCHED (append of one dated run-11 section at EOF) |
| `artifacts/sol/map-art-campaign-2/run-11/braid/e1-twin-banks/mask-comparison.json` | LANE-TOUCHED (new file) |
| `artifacts/sol/map-art-campaign-2/run-11/braid/e1-twin-banks/report.md` | LANE-TOUCHED (new file) |
| `reviews/sol-map-art-current-status-20260909.md` | LANE-TOUCHED (Twin Banks row rewritten) |

- **MAIN-MOVED: none.** Main moved only by the s2680 lock commit (`STATUS.md`), which the lane does not touch.
- **Retention check on the one rewritten row:** the Twin Banks status row prepends the run-11 verdict and
  retains the entire prior record behind "Prior record:" — verified by reading the diff, **no prior text
  dropped**. Lawful supersede, not a delete.

## Findings

### F-2680-1 — the master's premise was wrong about WHERE the single band is, and the correction is load-bearing. OPEN, fire-authorable (re-author).

The master's WHY says the Twin Banks water "still renders as one 15.6 m band (`visualHalfWidth 7.8`)"
and that the player "sees water where the sim has dry ground". **Verified against the code by this
drain, not inherited from the report:**

- `src/world/Terrain3dClaimPilot.ts:2895` `createChannelWater` reads `contract.maskTruth?.waterMask?.regions`
  — **not** `Terrain.waterMask()` — and adds **one `createWaterRibbon` per `polyline_band` river region**.
  Twin Banks declares two (`north-channel`, `south-channel`, each `halfWidth` 1.5), so the mounted GLB path
  **already draws the braid as two ribbons**, plus a confluence mesh and a ford sheet.
- The single 15.6 m band survives in the **fallback** `Terrain` surface (`Terrain.ts:694,1202,1554`), which
  is not the normal mounted path.

So the master aimed the cure at a path that was already braided. A re-author that repeats the premise
would send the next run at the wrong file.

**The real remaining defect, verified independently by this drain** (read `createChannelWater` and the
contract, did not take the report's word):

- Twin Banks' mask declares five regions: `west-ford` (rect/ford), `east-ford` (rect/ford),
  **`west-source-box` (rect/river)**, `north-channel` and `south-channel` (polyline_band/river).
- The ribbon loop skips anything that is not `kind === 'polyline_band'`; the ford-pan filter takes only
  `kind === 'rect' && zone === 'ford'`.
- **`west-source-box` is `kind: rect, zone: river`, so it matches neither branch and is rendered by
  nothing.** The confluence mesh near it is a hardcoded `dressing.confluences` approximation, not
  region-driven. The runner's claim is exact.

Curing it means teaching the **shared** `createChannelWater` a rect-river pool region — which is precisely
the constructor the firewall forbade. The STOP was correct in law and in fact.

**Corrective:** re-author HM-06 as a v2 master whose WHY states the corrected premise (the pilot path is
already braided; the gap is the unrendered rect-river source box plus the fallback band) and whose firewall
**lifts `createChannelWater`** scoped to masked water, while keeping every simulation and other-map
prohibition. Not queued by this fire: `tasks/CODEX-WALL` suspends §2E refills, and the master carries a
gate-side hold reserving the queue action to the attended session.

### F-2680-2 — the no-sculpt decision rests on authored audit values, not a fresh measurement. OPEN, carried into the re-author.

The runner reports the contract's bed figures (north −0.4596 m, south −0.3507 m, plait mean +0.5234 m) and
flags them as **authored audit values, not a fresh delivered-GLB measurement**, explicitly asking that they
be remeasured before the "leave the store alone" branch of scope item 2 is accepted. The v2 master must
require the measurement rather than inherit the number — otherwise scope item 2 decides itself on a figure
nobody re-took.

### F-2680-3 — `test:node-guards` can no longer FINISH inside the gate's own cap on a fire shell. OPEN, fire-authorable. Not this slice's; found by this slice's gate.

Observed **twice today, on two different trees**, one of them clean main: the suite is SIGTERM'd at exactly 900s
by `run-guards`'s `timeout: 15 * 60 * 1000`, still printing passing tests when it dies. The fire shell forces
`--test-concurrency=1` (`CLAUDE_CONFIG_DIR` present; F-1409-1/F-1410-1, "the conservative default pending
fire-side measurement"), while the historical record in `logs/guard-stats.jsonl` shows the suite completing in
**284–430s** through early September — it has outgrown the cap at concurrency 1.

**Why this matters beyond one drain:** `test:node-guards` is in `GATE_GUARDS`, the *unconditional* base gate, so
**every fire drain from now on inherits an un-completable leg** and must spend 15 minutes to learn nothing. A red
that is structurally guaranteed teaches a fire to wave reds through — the exact habit the gate exists to prevent.

**Recommended cure (owner/attended call, not taken by this fire):** either raise the cap for this one guard, or
measure the fire-side concurrency that F-1409-1 explicitly left pending and lift it from 1, or split the suite.
Whichever is chosen, the guard-stats record now holds two dated 900s data points to measure against.

### Non-findings, recorded so nobody re-opens them

- **Production and sculpt masks are semantically equal today** (the runner's JSON comparison, banked as
  `mask-comparison.json`, `"equal": true` against baseline `01d2b2e52`). Making the production mask
  authoritative is therefore a *plumbing* change, not a behaviour change, at today's data.
- The runner makes **no claim** that the source-box pixels are currently dry, and neither does this review.

## Ledger

- `tasks/goals.json` leaf `hm-06-twin-banks-braid-water`: `status` `queued` → `blocked-firewall`, `mergeHash`
  recorded, with the lift the v2 master needs — in the drain commit.
- `tasks/BACKLOG.md`: the TWIN BANKS BRAID row updated from QUEUED to the firewall-stop outcome, F-2680-1 and
  F-2680-2 declared — in the drain commit.
- The done-move is renamed `stopped-…` so the board stops counting it as a real drain.
