# b4v3-picnic-active-defense — the hold is earned, not stood upon

**Slice:** `b4v3-picnic-active-defense` (lane-b) · **Branch:** `lane/b` · **Lane tip:** `50feb6b2c`
**Base:** `93b484785` (s2131 lock) · **Merged at:** `ccf8dc57d` · **REVERTED at:** `75125b4da`
**Drained:** s2131, 2026-08-21 · **Gate worktree:** `gate-s2131` (detached, §3.0b)
**Salvage ref:** `archive/lane-b-s2131-b4v3-absorbed-2cc5a1d4b`

## VERDICT: MERGED, THEN REVERTED — the hold went live on an admitted contract

**I merged this on a complete green battery and then reverted it in the same fire.** The gate did
not catch the defect; regenerating a report the merge had invalidated did. I am recording that
order plainly because it is the useful part of this review: the battery was run correctly and in
full, and it was still not sufficient.

The runner reached a **Law-2 STOP**, not `READY-FOR-GATES`, and it was right to. It built the
owner's ruling faithfully, proved on its own tree that the ruling does not achieve the goal, put
the admission changes back, and named the mechanism. That is the honesty guard working exactly as
the master specified — a STOP of this shape is a *success* of the instrument, not a failed run.
**The defect I found is a different one, and the runner inherited it from the v1 WIP.**

Corrective queued: `tasks/f2131-1-picnic-enable-key.md`.

## What it does

A picnic stake's disc is CONTESTED by (a) a standing structure inside the disc, or (b) the hero
**while actively defending** — having dealt damage within the last 5 seconds. A hero merely standing
in the disc contests nothing. The owner's ruling is quoted verbatim at the predicate site:

```
// OWNER RULING (2026-08-21), verbatim: "picnic - no, just standing there should not win"
```

`PicnicHoldSystem.contested()` is the single seam; `update()` now takes `(delta, at, enemies,
structures, hero)` and both engines pass the same three bodies. The stack also carries the v1 hold
system and the v2 stake-pressure weight — all three commits were undrained WIP on `lane/b` and are
absorbed by this merge.

## THE BLOCKING DEFECT — F-2131-1a: the enable-key is not contract-scoped

```ts
static isEnabled(markers: readonly ContractStakeMarker[]): boolean {
  return markers.filter(({ heroStart }) => heroStart).length >= 2;
}
```

That predicate is a property of *any* contract's data, not of e6-picnic. Exactly two shipped
contracts satisfy it:

| contract | heroStart markers | epoch | status |
|---|---:|---|---|
| `e6-picnic` | 3 | epoch-6-atomic | intended, not admitted |
| `e10-last-claim` | 3 | epoch-10-deepsky | **not intended, and ADMITTED** |

So `e10-last-claim` silently gained the picnic quarter-of-enemies stake-pressure targeting **and the
picnic loss condition** (`onAllClaimed → postHeroDeath`) — a way to lose that the contract never had.

### Proven by bisection, in one worktree, deterministic 2 runs per arm

| arm | `e10-last-claim` turns |
|---|---:|
| pre-merge `93b484785` | **5**, 5 |
| merged `ccf8dc57d` | **2**, 2 |
| merged, `src/sim/HeadlessContractSim.ts` reverted | 5 |
| merged, `enemies.update` hunk reverted | 5 |
| merged, **target argument only** reverted | 5 |
| merged, final-snapshot field gated | **2** ← refuted my first hypothesis |
| after revert `75125b4da` | **5** |

⚠️ **My first hypothesis was wrong and I am keeping it in the record.** I saw that the final
snapshot shipped a bare `picnicHold: this.picnicHold.diagnostics` where every sibling is null-gated,
with a comment three lines below stating the rule — a textbook determinism-hash contamination. It
was a *real* convention violation, it was not the regression, and gating it changed nothing. The
lesson is the house one: control a hit before believing it condemns. Had I committed that fix as
"the cure", I would have shipped a green-looking board with the regression still live.

**F-2090-1 predicted this exactly, one slice early:** *"`isEnabled` then needs a new key
(`holdStake:true`) … since it currently *counts* `heroStart` markers."* The prediction was filed as
a note about fragility and nothing was watching it.

### Why the gate did not catch it

Nothing in the prescribed battery asks *"did another contract's behaviour move?"* The slice's own
spec asserts `Picnic hold is absent off-contract` — and it **passed**, because it tests the *browser*
path on a non-stake contract, not the headless path on `e10-last-claim`, the one contract in the
repo that trips the key. `test:node-guards` passed too. The signal existed only in a generated
report that no gate regenerates. The corrective adds the missing guard.

## THE OWNER FORK — F-2131-1b

**`--policy=idle` does not mean the hero does not fight, and every idle floor in the door-admission
program is an ARMED floor.**

The runner reported that explicit `--contract e6-picnic --seed e6-picnic-01 --policy=idle` still
SECURES wave 20 (`fnv1a32:b9f476a6`) — the idle hero scored **268 kills with zero calls** and thereby
refreshed its own active-defense window at sandwich-west, continuously, for the whole run. So under
the ruled signal, standing idle is mechanically indistinguishable from fighting.

✓ **VERIFIED FROM THE CODE, not inherited from the run log.** `HeadlessContractSim.ts:1803` registers
the hero as a combat shooter, and the handle's own gate at `:478` reads:

```ts
enabled: () => !this.dead && this.weapon === 'rig',
```

There is no policy term and no intent term in that predicate. `IDLE_INTENTS` (`:441`, applied at
`:1335`) governs **movement** — the hero never thrusts — and says nothing about firing. The Spark Rig
is driven by `CombatSystem`'s auto-targeting regardless. An "idle" hero in this sim is a stationary
turret, not a bystander.

**Why this generalises past the picnic:** the idle floor is the instrument that proves a contract
cannot be won by doing nothing. For most contracts it still reports truly, because the idle hero
loses anyway. It goes *wrong* precisely where a predicate reads hero damage as evidence of intent —
which is what the owner's ruling just asked for. The ruling is not at fault and neither is the
implementation; the **instrument** cannot express the distinction the ruling draws.

**This is the changed premise §7.5 requires for a fourth attempt.** F-2090-1 offered the owner three
options and recommended (a) — move the hero start off a stake. The owner ruled something closer to
(b). Both were reasoned about as *hold-semantics* questions. They are not: the binding constraint is
that the headless floor has no concept of a hero who declines to fight. The next fork must either
distinguish commanded defense from autonomous fire, or change what `--policy=idle` means — and the
second is the wider, cheaper fix, because it repairs the instrument for every contract at once.

I am **not** authoring that master. It changes what a floor *means* across the whole admission
program, so it is an owner design fork, not a fire's call. It goes to the desk.

## Evidence

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | clean |
| `npm run build` | green, 1.21s, asset-diet ceilings respected |
| `npm run test:node-guards` (mandatory — diff touches `src/sim`, `src/systems`, `src/entities`) | 480 tests / **472 pass** / 5 skip / 3 fail — all three controlled below, 576.8 s |
| `e2e/e6-picnic-hold.spec.ts` | **6/6** desktop + mobile, 8.3 s |
| `er01-e5-census` + `er01-e6-census` + `ap16-4-contract-admission` | **18/18** both projects, 36.9 s |
| Boot probes (`_s2080-f1742-1`, `_s106-prospector`) | **8/8** desktop + 390px, zero console/page errors |

Playwright run `--workers=1` throughout (§3.1).

### The three reds, each controlled — none attributable to this merge

1. **`same-game-report-guard.test.mjs`** — "stale exemption reason for `e2-incline`".
   ✓ **CONTROLLED: reproduces byte-identical on plain main**, outside the gate worktree, with this
   merge nowhere in the tree. Pre-existing. Filed as **F-2131-2** and CURED this fire (below).
2. **`node-guards-contention.test.mjs`** — "board did not stay quiet for 300ms"; stderr printed
   `CONTENDED — 2 concurrent batteries`.
   ✓ **CONTROLLED: the lane-d runner was live** — `tasks/running/lane-d.pid` = 9695, a codex process
   25 minutes into `f2130-1-rejection-liveness`. This guard's entire purpose is to report a second
   concurrent battery; it reported one, correctly. Environmental.
3. **`fixture-teardown.test.mjs`** — "all 34 fixture owners remove their temp directories".
   ✓ **CONTROLLED: a cascade of (2).** Its assertion failure names the contention child's failure as
   its cause (`node-guards-contention.test.mjs child failed`, `1 !== 0`). One red, counted twice.

I did not re-pin anything, and nothing was softened to make a red go away (F-1441-3).

⚠️ **Everything in the evidence table above was measured on the MERGED tree and was honestly
green.** It is retained rather than deleted precisely because a complete green battery is what
preceded the revert — that is the finding, not a footnote to it.

## Merge classification

Base `93b484785`; clean `ort` auto-merge, no conflicts. Per-file:

| File | Class |
|---|---|
| `src/systems/PicnicHoldSystem.ts` (new, +119) | LANE-ONLY |
| `e2e/e6-picnic-hold.spec.ts` (new, +68) | LANE-ONLY |
| `src/game/Game.ts` | LANE-ONLY (23 of 29 added lines absent from main) |
| `src/entities/pools.ts` | LANE-ONLY — `heroPosition` widened to accept an array/function |
| `src/agent/MechanicsManifest.ts` | LANE-ONLY |
| `e2e/er01-e6-census.spec.ts` | LANE-ONLY (1 line) |
| `src/sim/HeadlessContractSim.ts` | BOTH-MOVED — auto-merged, verified by the sim suites passing |
| `tasks/BACKLOG.md` | BOTH-MOVED — auto-merged; the lane's row replaces the pre-STOP row |

`main..lane/b` is **empty** after the merge: the lane is fully absorbed and no longer frozen salvage.

`main..lane/b` was empty after the merge and remains so after the revert — the commits are in main's
history, only their content is undone. **Re-landing must revert the revert** (`git revert 75125b4da`),
never re-merge `lane/b`, which git now considers already merged. The corrective says so in its
pre-flight, and the tip is archived at `archive/lane-b-s2131-b4v3-absorbed-2cc5a1d4b`.

## Findings

- **F-2131-1a (BLOCKING — corrective queued, no owner word needed)** — `PicnicHoldSystem.isEnabled`
  is not contract-scoped; the hold and its loss condition went live on the admitted
  `e10-last-claim`. Caused the merge to be reverted. `tasks/f2131-1-picnic-enable-key.md`.
- **F-2131-1b (OPEN — OWNER DESIGN FORK)** — the headless idle floor is armed; `--policy=idle` gates
  movement, not fire, so no hero-damage predicate can separate idle from defending. Detailed above.
  Blocks e6-picnic admission and reprices every idle-floor argument in the program.
- **F-2131-2 (CURED this fire)** — `same-game-report.json`'s `e2-incline` exemption reason was stale
  against `HeadlessContractSim.ts`. The E2 pressure-line work updated the source text without
  running `--write-report`, leaving `test:node-guards` red on main for every drain that followed.
  Regenerated; guard green. Not a picnic issue — found only because this drain ran the full battery
  and controlled its reds instead of excusing them (the F-1460-1 lesson).
- **F-2131-4 (non-blocking; folded into the corrective as item 4)** — the final snapshot ships a
  bare `picnicHold: this.picnicHold.diagnostics` (`[]` off-contract) where every sibling is
  null-gated and the adjacent A10 comment states the rule. A real convention violation; **measured
  NOT to be the regression** (gating it alone left `e10-last-claim` at 2 turns). Recorded with that
  negative result attached so the next reader does not re-derive it.
- **F-2131-3 (non-blocking, no owner word needed)** — the b4v3 master's NO firewall permitted
  "CombatSystem semantics beyond READING an existing recent-damage signal", and there was no such
  signal, so the runner added `lastHeroDamageAt` to `PicnicHoldSystem` and fed it from `Game.ts`'s
  hero-damage site. That is the minimal write the master allowed. Recorded so the next author knows
  the signal exists and is picnic-local, not a general combat facility.

## Where the player sees this, in a plain boot

**After the revert: nowhere, and that is now the point.** e6-picnic is not admitted, so no plain boot
ever reached the picnic hold.

But the honest answer for the *merged* window is not "nowhere" — it is **`e10-last-claim`**, which a
player CAN reach, and which for the life of that merge carried enemy stake-pressure targeting and a
loss condition it was never designed to have. That is precisely the question this section exists to
force, and had I asked it of the merged tree rather than of the slice's intent, I would have found
the defect before merging instead of after. The slice's own `absent off-contract` test answers the
browser path only; the contract that trips the key does so headless.
