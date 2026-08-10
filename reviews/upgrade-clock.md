# Review — upgrade-clock (THE PICK CLOCK)

**Slice:** `upgrade-clock` — the upgrade draft gets a 30/20/10 s timer by difficulty
**Branch:** `lane/d` · **tip** `45b5c6bb3`
**Base:** `005753fc1` · **Merge:** `e7bb88cf00925a964733321ad4fb45b40fb583d1`
**Drained:** s1628, 2026-08-10 · gated in detached worktree `gate-s1628` per §3.0b

## VERDICT: MERGED — every red attributed to a control before merging, none of them this slice's.

## What it does

Owner ruling 2026-08-10: the draft *"can pause forever… should be changed"*. This is the **human**
half of that ruling (the agent half rides AP-16-2, now measured by the same-game audit drained
earlier this fire).

- `Balance.offers.pickSeconds` — **Greenhorn 30 s · Trail 20 s · Vein Hunter 10 s**.
- `UpgradeOverlay` gains a `data-testid="upgrade-countdown"` eyebrow with `aria-live="polite"`.
- On expiry the game selects **offer 0 through the normal intent/tape path** — not a special case —
  and counts it as `defaultedPicks` in the run-stats snapshot.
- `LockstepClient` carries `pick_upgrade { defaulted?: true }`, so in co-op the expiry is submitted
  by roster slot 0 and **consumed by every peer as the same authoritative tick action**. The clock
  cannot desync a multiplayer draft.
- Cost: one string comparison per frame, at most one DOM write per second.

## Evidence

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **rc=0** |
| `npm run build` | **green, 2.05 s** |
| `e2e/m1-06-level-up-choices.spec.ts` `--workers=1`, desktop + 390 px mobile | **18 passed / 6 failed** — all 6 pre-existing, see below |
| — the 4 NEW clock tests | **pass on both projects** |
| Merge | **clean ort**, no conflict, despite lane 365 behind |
| `main..lane/d` after merge | **empty** (fully absorbed) |
| Screenshots | `reviews/shots-upgrade-clock/desktop-chrome-countdown.png`, `mobile-chrome-countdown.png` |

### The 6 playwright reds are pre-existing on main — settled by a control, not by argument

The runner reported them as "unrelated stale assertions expecting five/six `double_tap_coil` stacks
despite the current cap of three". I did not take that on trust. **Reverted-files control**: in the
same gate tree, same shell, same hour, I checked out main's version of all five changed code/spec
files and re-ran the three failing titles.

| Test | Merged tree | **Control (slice reverted, same root)** |
|---|---|---|
| `investment weighting prefers owned families…` ×2 projects | FAIL `Expected: >= 22 / Received: 0` | **FAIL, identical** |
| `owned-family cards show a compact stack pip` ×2 | FAIL `toHaveText "V"` | **FAIL, identical** |
| `maxed upgrades leave the offer pool` ×2 | FAIL `Expected: 6 / Received: 3` | **FAIL, identical** |

Six for six, same values. `logs/suite-red-inventory.md` independently lists all six as **KNOWN-RED**
with matching error signatures — but that snapshot is **13 days stale (threshold 7; 353 commits have
touched `e2e/` or `src/` since)** and the inventory prints its own warning that membership is never
exoneration (F-1444-2). **The control is what settles it.** The label merely agrees.

⚠️ **Standing red recorded, not laundered:** main carries 6 reds in `m1-06-level-up-choices` — the
spec asserts 5–6 `double_tap_coil` stacks against a current cap of 3, and an investment-weighting
threshold of ≥22 that returns 0. That is a real stale-assertion debt in a *gameplay* suite, it is
**not** this slice's to fix (firewall), and it should be a corrective.

## F-1628-2 — `test:node-guards` REDS IN A SCRATCH GATE WORKTREE AND IS GREEN FROM MAIN'S ROOT

*Non-blocking for this slice; a real hazard for the drain protocol.*

The battery went **rc=1 with 5 failures** on the merged tree in `gate-s1628`:
`suite-red-inventory.test.mjs` × 3 reducer tests (`reducer output is script-root-invariant`,
`…renders absolute raw paths relative to the recorded tree`, `…refuses body statistics when the
recorded tree is unavailable`), plus the `fixture-teardown` test they cascade into
(*"all 29 fixture owners remove their temp directories"* — child `suite-red-inventory.test.mjs`
failed), plus `every functions/**/*.ts is type-checked`.

Attributed by isolating **one variable at a time**, because the first comparison changed two:

| Arm | Root | Slice content | Result |
|---|---|---|---|
| merged tree | `gate-s1628` | present | **rc=1**, 3 reducer reds |
| **control** | `gate-s1628` | **reverted** | **rc=1, identical reds** |
| control | main repo root | absent | **rc=0** |
| **post-merge confirmation** | **main repo root** | **present (merged)** | **rc=0 in 1.8 s**; `fixture-teardown` **rc=0 in 43.9 s** |

So the reds track the **root**, not the content. Mechanism: the test `scriptCopies()` the reducer to
a temp directory and asserts byte-identical output from both locations — a scratch worktree whose
`node_modules` is a **symlink into main** is exactly the arrangement that breaks it.

⚠️ **The part that is NOT yet explained, stated rather than smoothed over:** drain 1 of this same
fire ran the **full** `test:node-guards` in this **same** `gate-s1628` worktree and got **rc=0 in
311.7 s**. So it is not a simple deterministic property of the root — something about accumulated
fixture/temp state between the two runs matters (the fixture-teardown cascade is the visible symptom
of exactly that). A drain that meets this will see a red it cannot reproduce from main.

➡️ **Consequence for the protocol, which is the reason this is worth a finding at all:** §3.0b tells
every drain to gate in a detached worktree, and this is a guard that **reds there for reasons that
have nothing to do with the slice**. The memory index already records the inverse hazard
("gating in a scratch worktree makes tracked-subject guards vacuous"); this is the same seam from
the other side — not a false green but a **false red**, which is more expensive, because a fire that
believes it will either block a good merge or start re-pinning things. **Until it is understood: a
`suite-red-inventory` or `fixture-teardown` red seen in a scratch gate worktree must be re-run from
the main repo root before it is believed.** Owner's desk not required; this is fire-authorable.

## Merge classification

Base `005753fc1`. Auto-merged clean by `ort`; **no conflict**, including `src/game/Game.ts` despite
`lane/d` sitting **365 commits behind** — so Mistake #15 (stale + conflicted = RE-LAND) was
considered and did **not** apply; the merge was tested before being committed to.

| File | Class |
|---|---|
| `src/game/Game.ts` | **BOTH-MOVED** — auto-merged, no conflict |
| `src/game/Balance.ts` | LANE-ONLY |
| `src/ui/UpgradeOverlay.ts` | LANE-ONLY |
| `src/mp/LockstepClient.ts` | LANE-ONLY |
| `e2e/m1-06-level-up-choices.spec.ts` | LANE-ONLY |
| `reviews/shots-upgrade-clock/*.png` ×2 | LANE-ONLY (new evidence) |

**A note on the base moving mid-gate, because it is the exact §3.0b hazard.** My first fast-forward
was **refused** — a concurrent Cowork agent had committed `005753fc1` (goal-tree bookkeeping) at
13:41 while I was running playwright. Nothing was corrupted and nothing was staged in main's index,
**because the gate was in a detached worktree**: I reset the gate to the new main, re-merged (clean
again), verified `005753fc1` touched only `logs/` and `tasks/goals.json` and therefore could not
affect tsc/build/e2e, and fast-forwarded. Had I been gating in main's working tree this would have
been the F-1295-1 / F-1589-5 incident rather than a refused command. **The refusal is the cure
working.**

## Findings

- **F-1628-2** (above) — scratch-worktree false reds in `test:node-guards`. Non-blocking, fire-authorable.
- **Pre-existing, owed a corrective (not this slice's firewall):** 6 stale assertions in
  `e2e/m1-06-level-up-choices.spec.ts` — `double_tap_coil` expected 5–6 vs a cap of 3, and an
  investment-weighting threshold of ≥22 returning 0. Control-confirmed present on main without this
  slice.
