# F-HEAT13-1 — a wholesale order refusal is INVISIBLE on stdout and does not advance the sim, so a pre-ADR-005 rider spins at tick 0 for its whole wall

**Measured 2026-09-07 in `/tmp/heat13-569a41f9` (build `92358832`, engine `09838c35…`) while proving
the era gate. Evidence: `probe/refusal-visibility.json`, `probe/refusal-visibility.mjs`,
`probe/livelock-evidence.txt`, `probe/door-verb-refusal.json`.**

## What happens

`readOrders` (`scripts/gr-sim.mjs:245`) is a `while (true)` loop. When `sim.submitOrders(orders)`
refuses, it calls `rejectOrders` (`:280`) and **`continue`s** — it does not return, so no tick
advances. `rejectOrders` writes one line to **stderr** and re-prints the **current** view to stdout:

```js
function rejectOrders(reason, sim) {
  process.stderr.write(`gr-sim rejected orders: ${reason}\n`);
  process.stdout.write(`${JSON.stringify(sim.currentTurn().view)}\n`);
}
```

The comment above it (F-MCAP-1, owner ruling 2026-09-06, verbatim *"(5) both"*) states the refusal
rides **both wires**: stderr for a log reader, and `now.orders[]` with `status: "failed"` and a
`reason` for a rider that reads only stdout.

**That promise does not hold for a WHOLESALE refusal.** Every order array is validated as a unit
(`public/skill.md` § THE GRAMMAR: *"failing validation on any order refuses the entire array and
installs none of it"*), so nothing installs, so `now.orders[]` has nothing to carry a failure on.
Measured directly, four refused arrays in a row at tick 0:

| view | `now.orders` | `appendLog` | any `refusal`/`surprise`/`notice` key | identical to view 1? |
|---|---|---|---|---|
| 1–4 | `[]` | `[]` | none | **yes, byte-identical** |

The only trace of the refusal anywhere is on stderr:
`gr-sim rejected orders: orders[0].verb "HOLD" is unknown.`

## Why it matters now, and not before

ADR-005 removed `MOVE_TO`, `HOLD` and `FALLBACK_IF` on 2026-09-07. **Every banked reel on this board
names at least one of them** — 57 tapes, 22 scored rows — so *every controller written before today*
now refuses on *every array*. This is no longer an edge case; it is the default failure of the whole
prior corpus, and of any rider whose memory predates the ruling.

Replaying heat 12's own verified probe reel (65 arrays, 64 of them refused) order-for-order through
this arena, answering every view exactly as the documented NDJSON transport prescribes:

| | unfiltered (retired verbs present) | same reel, retired verbs dropped |
|---|---|---|
| ticks completed | **0** (never left the first view) | 9,001 |
| wall | **8 m 37 s and still climbing when stopped by PID** | ~3 min, terminated normally |
| CPU time | **13 m 12 s** at 170 % | — |
| RSS | **1.06 GiB, rising** | — |
| tape produced | **none** | secured w10 / 335 g |

A rider that follows the door's own protocol — read one view, write one array, repeat — **cannot
terminate** and **cannot tell why**. It burns its entire operator wall, produces no tape, and the
only diagnosis is on a wire the rider is not told to read.

## Corrective `refused-array-visible-and-bounded`

Any one of these closes it; the first is the cheapest and the most in the spirit of the F-MCAP-1
ruling that already applies here:

1. **Publish the refusal in the view.** Add `now.refusal { message, at }` (or reuse `surprises`)
   whenever `submitOrders` refuses, so the re-printed view differs from the one before it and a
   stdout-only rider can read the exact `orders[i].verb "X" is unknown.` message it needs. The words
   already exist; only the wire is missing.
2. **Bound the loop.** Cap consecutive refusals at, say, 8 and then advance a tick anyway (or resign
   the seat with a named reason), so a wrong-grammar rider fails fast and honestly instead of
   silently.
3. **Say it in `skill.md`.** One line under THE GRAMMAR: *a refused array re-prints the same view and
   does not advance the clock; the reason is on stderr.* This is the documentation-only floor and it
   is strictly worse than (1), because a headless rider is not always given stderr.

Do **not** treat this as a duplicate of F-HEAT12-7 (`now.seams` null coordinates). That finding is
about *how* a rider comes to send an invalid array; this one is about what the door does *after* it
refuses one, and it applies to every cause of refusal equally.
