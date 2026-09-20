# f1529-1 — order_failure surprises coalesce on a semantic order identity

**Slice:** `f1529-1-order-failure-coalesce-by-identity` (F-ER02-1, **attempt 2**)
**Branch:** `lane/b` · **Lane tip:** `04a92f855` · **Merge-base:** `d907f419`
**Merged to main:** `ffdc125677818647ac1a204e8e109d0d46288d13`
**Gated by:** s1531 fire, 2026-08-07 · Node **v26.4.0** · gate worktree `worktrees/gate-s1531` (detached, §3.0b custody)

## VERDICT: PASS — MERGED

The runner's headline was **re-derived at the gate, not inherited** (Mistake #4). Both storm arms
were re-run by this fire from the archived driver; both reproduced to the digit.

## What it does

The ER-02 "storm": a standing order that cannot succeed fails every tick, each failure raises an
`order_failure` surprise, each surprise mints a turn, each turn demands a submission, and the
submission re-arms the same doomed order. On `the-claim`/`e1-the-claim-01` that loop bills **2,971
protocol calls** — `outcome.calls` is exactly what AP-07 exports to Prime Intellect as `num_turns`,
so this is the economy axis, not tidiness.

Attempt 1 (`f1528-1`) tried to de-dupe on the **record** and was measured a **1.00× no-op**:
`submit()` rebuilds `this.records` from scratch on every submission, so record identity cannot
survive, and `tick()` skips already-`failed` records, so `fail()` never sees one — the `'failed'`
branch fired **0 times in 2,971** while the same probe on `'active'` fired 2,967/2,971 (a live
positive control).

This slice keys the de-dupe on something that **does** survive: a **semantic order tuple** (verb plus
the fields that define the order's meaning) mapped to its **last failure reason**, held in a
`Map` that lives beside the records rather than inside them. A repeat of *the same order failing the
same way* is suppressed as a notification; a success `delete`s the key so the order can be news
again; `reset()` clears the map with the rest of the run state.

**Nothing is hidden.** The suppressed channel is the *notification*; `now.orders` still carries
`{"status":"failed","reason":...}` on every single view. The rider loses a repeated announcement,
not a fact.

## Evidence

Gate battery run on the **merged** tree in a detached worktree; `--workers=1` throughout (§3.1).

| gate | result |
|---|---|
| `npx tsc --noEmit` | **0 errors** |
| `npm run build` | **green, 2,182 modules** |
| `npm run test:node-guards` | **rc=0 — 353 pass / 0 fail** |
| slice's own new test | ✔ `identical order failures coalesce across submissions without hiding a new failure` (1.40 s) |
| PIN 1 — *"gr-sim replays the same contract, seed, and orders byte-for-byte"* | ✔ **PASS, did not move** |
| PIN 2 — *"the E2 Baron fights keep their pinned outcomes"* | ✔ **PASS, did not move** |
| `e2e/ap-standing-orders.spec.ts` (the suite that exercises this file) | **12/12**, desktop + 390px mobile |
| `e2e/044-start-screen.spec.ts` (plain-boot, console-error asserting) | **14/14**, both projects |
| `e2e/061-first-claim-onboarding.spec.ts` | 6 reds — **pre-existing, see attribution** |

### The headline, re-derived by this fire

Driver: `logs/runs-archive/s1529-gate-driver-storm-arms.mjs`, contract `the-claim`, seed
`e1-the-claim-01`, rider submitting one impossible `HARVEST gold-seam-999` every turn.

| arm | tree | `outcome.calls` | `eventLogHash` | waves/s |
|---|---|---|---|---|
| **BEFORE** | stock main (`990eb1ce6`) | **2,971** | `fnv1a32:d93e9b89` | 0.32 |
| **AFTER** | merged gate worktree | **5** | `fnv1a32:c3952a80` | 5.22 |

**Ratio 594.2×**, against the **743×** deletion-only upper bound measured in s1529 (F-1529-3) —
**80.0% of the ceiling recovered**, while *keeping* the surprise channel that outright deletion
would have destroyed. The BEFORE arm reproduced s1529's baseline (2,971 / `d93e9b89`) exactly, which
is what makes the AFTER number mean anything.

### Both directions (scope 3 — the hard acceptance)

The new test proves the cure does **not** blind the rider:

- a **reordered but semantically identical** BUILD order fails again → **coalesced**, and the
  surprise sequence does **not** advance;
- fail → **success** → fail → the second failure is **news again** (`needsRider: true`, a second
  `order_failure` at a strictly greater `seq`);
- after `reset()` the first failure is news again.

Worth recording: the runner's *first* key was a raw `JSON.stringify(order)`, which is sensitive to
nested property **insertion order** — two identical orders written with `{x,z}` vs `{z,x}` would
have hashed differently and defeated the coalesce. It caught this in its own review pass and
replaced it with an explicit positional tuple, then added the reordered-BUILD case as a regression.
That hole is closed and covered.

### Attribution of the 061 reds — CONFIRMED pre-existing

`e2e/061-first-claim-onboarding.spec.ts` fails 6/8 on the merged tree (3 tests × 2 projects), all on
line 74, `expect(page.getByTestId('town-bark-speaker')).toHaveText('Marta Vale')`.

Two independent proofs it is not this slice:

1. **Exact fingerprint match** to `logs/suite-red-inventory.md` (snapshot 2026-07-28): same file,
   same three test names, both projects, same line, same assertion.
2. **Control arm** — the inventory is 10 days old and "may have rotted", so this fire re-ran the
   suite on **stock main**: `6 failed / 2 passed`, the *same six*, same error. The reds belong to
   main, not to the merge.

A town-bark speaker name also has no causal path to an agent order executor, but the control arm is
what makes this a measurement rather than an argument.

## Merge classification

`main..lane/b` was **1 commit ahead**, worktree clean, `tracked-dirt=0`.
`git log <merge-base>..main -- scripts/gr-sim.test.mjs src/agent/StandingOrders.ts` → **empty**: main
moved **neither** file since the branch point (all 7 intervening main commits are bookkeeping —
STATUS, logs, tasks, skills). Both paths are therefore **LANE-TOUCHED, MAIN-MOVED none**; no 3-way
graft was required and no conflict was resolved. A trial `git merge --no-ff` in the gate worktree
confirmed it: *"Merge made by the 'ort' strategy"*, exactly 2 files, +100/−0.

Merged path-scoped (`git checkout 04a92f855 -- <the two paths>`), content byte-identical to the lane
blobs. Firewall held exactly: `git diff --cached --stat` listed the two firewalled files and nothing
else.

## Findings

- **F-1531-1 (non-blocking, recorded not fixed).** `claim_damage` remains the **second** storm
  trigger and is untouched **on purpose** — the master firewalled it out and the runner obeyed.
  Unlike `order_failure` it has no status/reason pair to de-dupe against, so curing it needs a
  **rate-limit or a window**, which is a design choice. Already on the owner's desk as **F-1529-4**
  (recommendation: a window — it degrades gracefully under a damage burst where a rate-limit
  silently drops the tail). No new task authored; it is owner-gated, not fire-authorable.

- **F-1531-2 (non-blocking, now RESOLVED BY THIS MERGE).** F-1529-2 recorded that the `'failed'`
  branch of the `status()` de-dupe was dead code (0/2,971 reachability). It is still dead, and that
  is now **correct rather than suspicious**: the de-dupe that actually fires for failures lives in
  `fail()`, keyed on the identity map. Recorded so a future reader does not "cure" the dead branch
  and re-open the question.

- **F-1531-3 (method, worth keeping).** This is the second consecutive slice where **prescribing an
  acceptance instead of a mechanism** (F-1529-1) was decisive. Attempt 1 shipped a mechanism derived
  from a careful read and was a 1.00× no-op; attempt 2 handed the runner a *number* and let it
  choose the key — and it not only found a working key, it **found and closed a flaw in its own
  first key** (the property-order hole) because it was reasoning about the acceptance rather than
  executing an instruction. The pattern is now 1-for-1 and cheap to repeat.

## Firewall

Touched exactly: `src/agent/StandingOrders.ts`, `scripts/gr-sim.test.mjs`.
Untouched as required: `claim_damage` / `hero_down` / `wave_early` behaviour, `scripts/gr-sim.mjs`,
`src/sim/HeadlessContractSim.ts`, `src/agent/View.ts`, all `e2e/**`, all Balance values.
The four existing tests in `gr-sim.test.mjs` were **not edited** — the change is append-only (+83/−0),
so the F-1528-2 carve-out was never invoked.
