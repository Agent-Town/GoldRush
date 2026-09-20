# f1528-1 — order-failure surprise coalescing (F-ER02-1)

**Slice:** `lane-b-f1528-1-order-failure-surprise-coalesce` · **branch:** `lane/b` · **tip:** `926488927` (unmoved — the runner committed nothing)
**Gated by:** s1529, 2026-08-07, detached worktree `gate-s1529` (§3.0b custody — no probe content ever entered main's working tree; verified `git status --short src/` = 0 lines after every arm)
**Node:** v26.4.0 on every arm (stated per F-1527-3)

## VERDICT: **BLOCKED — NOT MERGED. The runner is right, and it is right for a reason worth more than the task was.**

Zero diff, and the run report says why (Mistake #1 satisfied). Nothing to merge. **The task is not re-queued as written** — see the corrective below.

## What was asked, and what is actually true

The master prescribed one cure, and defended it as *derived rather than chosen*: `private status()`
already opens `if (record.status === status && record.reason === reason) return;` — *"the same thing,
again, is not news"* — while `private fail()` calls `status()` and then raises
`surprise('order_failure', …)` **unconditionally**. The master read that asymmetry as `fail()`
**escaping** a live de-dupe, and prescribed making `status()` return whether it changed and `fail()`
raise the surprise only on a change.

**The asymmetry is real. The inference from it is false.** `fail()` is called from three sites
(`StandingOrders.ts:145`, `:228`, `:252`), and **all three are inside the `for (const record of
this.records)` loop in `tick()`, which `continue`s on `done`/`failed` at `:141`.** So `fail()` can
only ever reach a record that is `pending` or `active`. The `'failed'` branch of the guard at `:262`
is therefore **unreachable** — not weak, not escaped: never true. Making `fail()` respect it is a
no-op by construction.

The guard *is* load-bearing — for `'active'`, which repeats across the many ticks inside one turn.
That is exactly what made the master's read plausible, and is why this is worth recording rather
than filing as carelessness.

## Evidence — measured, not inherited

All arms: `--contract=the-claim --seed=e1-the-claim-01`, rider submits
`[{verb:'HARVEST', seam:'gold-seam-999'}]` (one impossible order) on every turn it is asked for.
Drivers mirrored into git before the worktree was removed:
`logs/runs-archive/s1529-gate-driver-{storm-arms,control-valid}.mjs`.

| arm | tree | `outcome.calls` | `eventLogHash` | waves/s |
|---|---|---|---|---|
| **STOCK** | main `aed92eb60` | **2,971** | `fnv1a32:d93e9b89` | 0.29 |
| **PRESCRIBED PATCH** | + the master's exact cure (tsc clean) | **2,971** | `fnv1a32:d93e9b89` | 0.29 |
| **UPPER BOUND** | `order_failure` surprise removed entirely | **4** | `fnv1a32:8c71d437` | 5.13 |

- Prescribed vs stock: **1.00×, byte-identical event-log hash.** Independently reproduces the
  runner's reported `2,971` / `d93e9b89` exactly.
- **Upper bound: 743× fewer calls, 17.7× faster.**

### Reachability, proved by counter — and validated BOTH ways

A counter instrumented on `status()`, same run length, same probe, two transitions:

| transition | `seen` | `suppressed` | |
|---|---|---|---|
| `failed` (storm arm) | 2,971 | **0** | the guard never fires once |
| `active` (HOLD-order control arm) | 2,971 | **2,967** (99.87%) | the guard fires constantly |

The `active` arm is the **positive control**: a counter that only ever prints `0` proves nothing
until it is shown printing non-zero. It prints 2,967. The `0` on `failed` is a structural fact, not
a broken probe.

## The finding that matters: option 2 was the RIGHT family, and only the KEY was wrong

The upper-bound arm is the useful half. Deleting the surprise outright takes the run from 2,971
calls to 4 — so `reviews/standing-orders-rehearsal-e2.md` §3.1 is **confirmed in full**: the
`order_failure` surprise *is* the storm's engine. The master picked the right option from the
review's three. What it got wrong is *what the de-dupe is keyed on*.

`submit()` (`:125-:130`) replaces **every** record on **every** submission with a fresh
`{id: 'orders-N-i', status: 'pending'}`. Failure identity is destroyed each submission by design.
Any de-dupe keyed on the *record* is therefore dead on arrival; a working key must survive
submission replacement (the order's verb+target+reason, not its record).

**And coalescing is information-preserving, which is what makes a repaired cure fire-authorable
rather than an owner fork.** Measured on a live view: `now.orders` carries
`{"status":"failed","reason":"INVALID_TARGET: gold-seam-999 is unavailable."}` on **every turn**.
The surprise is the *notification* channel; the view is the *state* channel. Suppressing a duplicate
notification hides nothing from the rider — it only stops **billing a turn to repeat an answer the
view already contains**. (`outcome.calls` is what AP-07 exports to Prime Intellect as `num_turns` —
the economy axis.)

## Findings

**F-1529-1 (method, the reusable one) — A MASTER SHOULD PRESCRIBE ITS ACCEPTANCE, NOT ITS
IMPLEMENTATION, WHENEVER THE IMPLEMENTATION IS AN INFERENCE FROM READING.** s1528 authored this cure
from a careful, honest, ✓-VERIFIED read of four mechanism links on main, and explicitly argued it was
*derived, not chosen* — the strongest authoring standard the factory has. It was still dead code,
because reading a guard tells you it exists, **not that anything reaches it**. Reachability is a
*measurement*, not a reading, and no amount of care at authoring time substitutes. The cheap
prophylactic is not "read harder": it is to state the acceptance in numbers (*calls must fall ≥100×
on this arm; a second, different failure must still surface; these pins stay green*) and let the
runner derive the mechanism — then a wrong mechanism costs one lane run and reports a number,
instead of costing a lane run and a fire to find out why the number did not move.

**F-1529-2 — the `'failed'` branch of the `status()` de-dupe at `StandingOrders.ts:262` is dead
code** (0 of 2,971). Recorded, not "cured": it is harmless, and removing it would be a
readability-only change to a file two open findings are about to edit. Whoever lands the real cure
should decide then.

**F-1529-3 — the storm is bounded at 743× and the bound is now known.** Any future F-ER02-1
candidate can be priced against it immediately: a cure that recovers most of 2,971→4 is working, one
that does not is keyed wrong. This is the number the next attempt gates on.

**F-1529-4 (open, deliberately held out) — `claim_damage` is untouched.** It has no status/reason
pair to de-dupe against; it was held out of the f1528-1 master for that reason and stays held out.
It needs an attended pick between a rate-limit and a window (owner's desk).

## Merge classification

None. `lane/b` is `ahead=0` vs main; the runner reverted its probe patch and left the lane clean
(`git diff --name-only` empty, confirmed in the run report and by `main..lane/b` being empty at
gate time). No graft, no conflict, nothing to classify.

## Corrective

`tasks/lane-b-f1529-1-order-failure-coalesce-by-identity.md` — attempt 2 under a **CHANGED premise**
(§7.5): the key must survive `submit()` replacement, the target is the measured 743× bound, and the
master gates on **numbers rather than a prescribed mechanism** per F-1529-1.
