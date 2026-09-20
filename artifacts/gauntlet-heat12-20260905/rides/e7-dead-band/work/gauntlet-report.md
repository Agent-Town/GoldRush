# e7-dead-band — heat 12, generation 45 (claude-opus-5)

Arena engine hash `86e53f37efee27cc9e1333b7dba29719c61e002ed2edfdd5cda8d729545df77b` (era 5, viewVersion 2, build `cd3545caa`).
Seed `e7-dead-band-01`, difficulty trail. worldModel: **sim-import** (read `src/systems/E7PlaybookLatch.ts`,
`src/systems/SignalSuppression.ts`, `src/sim/HeadlessContractSim.ts`, `src/game/Balance.ts`).

## Route

1. **probe-idle** — `--policy idle`: died w4 / 128.1 s / 0 g. Published the whole contract in view 0:
   `now.playbookUse {objective: "refusal", objectiveMet: false}` and `now.signalSuppression` live.
2. **tune-1** (ctrl v1) — w18 / 559.3 s / 200 g. Full ladder (4 turrets + 6 beacons) standing by wave 9,
   then `goldPanned` **frozen at 870** and gold pinned at the 200 cap for eleven waves. A dead purse.
3. **attempt-1** (ctrl v1 + turret tier sink) — **SECURED w20 / 600.000 s / 200 g / 83 calls.**
   Local assay (`scripts/assay-replay-agent.mjs`) reproduced the tape's own `fnv1a32:e181301c`
   and all four outcome fields.

## Outcome

**SECURED.** waves **20**, timeAlive **600.000 s**, gold **200**, calls **83**
(kills 928, `defaultedPicks` 0, `defaultedSecure` 1, outcome-line `eventLogHash fnv1a32:297c535f`).

Tape put forward: `attempt-1-tape.json`, declared in `gauntlet-outcome.json`'s `tape` field.
Admissibility measured on the reel itself, all three ceilings clear:
`durationTicks` **18000** with the last accepted order at tick **17638** (the F-HEAT11-1 terminal-tick
hazard avoided by answering `pendingSecure` with a blank line), **83** entries, **308,017** bytes
against a ~576 KB ceiling.

**3 sim runs, 1 scored attempt.** Stopped on the first secure, per the rule.

## What the map asked

It asked me for its era's signature mechanic **squarely, in one order, and the county's own
prose is the whole answer** — this is not ordinary stationary survival wearing E7's name any more,
though it was when I last rode it. E7 is playbooks and the Echo, and the Dead Band's proof is
`refusal`: `now.playbookUse.objective` is `"refusal"`, and `E7PlaybookLatch.allowsSecure` returns
`suppressedUses > 0`, which `HeadlessContractSim` ANDs into the secure gate — so no wave count can
secure this claim until a `PLAYBOOK_USE` has been **refused**. The decisive detail is an ordering one
I checked in source before writing an order: in `usePlaybook` (`HeadlessContractSim.ts:2823`) the
suppression gate is asked **before** the `NOTHING_RECORDED` gate, and `SignalSuppression.refuse`
counts the refusal on the way through. So the objective is reachable on view 0 with nothing yet
demonstrated. Mine latched at **t = 0.033 s** off one order — `{"verb":"PLAYBOOK_USE","name":"dead-band-1"}`
— answered `signal-suppressed: The dead band swallows it.`, `refusals.suppressed: 1`,
`objectiveMet: true`. This is the only map where failing the verb is passing the contract, and it is
the most legible era gate I have ridden: `now.playbookUse` and `now.signalSuppression` publish
declaration, objective, refusal counts and the last answer, so a rider working from the view alone
has everything. The honest qualifier is that it is **cheap and front-loaded** — one order in the
first thirty milliseconds of a 600-second contract, and the era never asks again.

The remaining 599.97 seconds are ordinary survival, and that is where the run was actually won or
lost. The fields that carried it: `now.works.byKind`/`entries` (placement, `index` and **`tier`** —
the field that decided the heat), `now.seams[].active/x/z`, `now.gold` against the 200 cap,
`now.score.goldPanned` (the diagnostic that found the fault), `now.hero.hp/maxHp/level`,
`now.threats.alive` (peaked 28), `now.orders[].status/reason`, `now.pendingOffer`/`now.pendingSecure`.
The orders: `PLAYBOOK_USE`, `BUILD`, `HARVEST`, `PICK_UPGRADE`, `MOVE_TO`, `CONTEXT_ACTION upgrade`,
`BLAST_AT`, `HOLD`, and one blank line. Geography was kind: the claim at (0, 12) sits on the north
edge of `dead-band-yard` (x −30..30, z −42..12), so build ground reaches the welded hero — the exact
inverse of `e7-relay-valley`, which reuses this tile and puts every zone 31.24 wu away. And the
roster is one id, `data_rustler`, `thief: true` — which forces `wrecker = false`, so no work can be
attacked: **0 of 10 works wrecked across 928 kills**, `goldStolen` 0, and `REPAIR_UNDER` would have
been dead weight.

**Does my notebook's memory of this map still hold?** Half of it. Generation 27 rode this same seed
and reported `now.signalSuppression` as a permanent row of zeros — "published honestly, nothing to
show", a mechanic unreachable by construction because the grammar had no playbook verb. **That has
moved**: the verb exists, the refusal is counted, and the counted refusal is now the secure gate. The
*survival* half is unchanged — same welded hero, same thief-only roster, same 22.8 wu near seam
against a 42 wu far pair, same wave-20 default.

## Winnability

Secured, and the margin was **wide in the middle and honestly thin at the close**: zero of ten works
were ever wrecked and the hero held its full running maximum through wave 12, but it bled from 175 to
a low of **47/175** in the last four waves and finished at 100/175 (level 29) against 28 live
threats — one more wave on that slope would have been a coin flip, and the wave-20 gate is what made
it comfortable. The thing with real slack was the reel, not the play: 17638 against an 18000 tick
ceiling and 308 KB against 576 KB.

## Lessons for my notebook

- **The door document told me the whole contract before I opened a file, and it was right.** The E7
  paragraph in `skill.md` says the Dead Band's `refusal` objective wants the refusal itself and that
  this is "the only map where failing the verb is passing the contract." That was not flavour text —
  it was the secure gate, stated plainly. Generation 13 learned to reproduce a named prover's recipe;
  the cheaper version is: **read the door's own paragraph for the map you are riding before reading
  any source, then verify it in one grep.** Two minutes turned a 600-second contract into one order.
- **When a gate is a counter, find out WHICH check increments it and in what ORDER.** Everything here
  turned on `usePlaybook` asking `signalSuppression.refuse()` *before* the `NOTHING_RECORDED` branch.
  Had the order been reversed, the objective would have needed a prior demonstration and my opening
  array would have been wrong. `refuse()` counts on the way through and its own comment says so
  ("call this exactly once per attempted use so the counters stay evidence rather than decoration").
  **Read the early-return order of the function that moves the counter, not just the predicate that
  reads it.** Gen-12 said enumerate every clause of a conjunctive gate; this is the same move one
  level down, inside a single function.
- **`score.goldPanned` going FLAT is still the single most diagnostic number on the board, and it
  has now caught the same fault in two consecutive generations.** Gen-39 found the dead sink on
  `e8-mare-claim` this way; tune-1 here showed the identical signature — ladder complete at wave 9,
  gold pinned at 200, `goldPanned` frozen at 870 — and the same cure moved it from w18 to a w20
  secure. Panning into a full bucket credits nothing, so a capped purse does not merely waste the
  surplus, it **switches the economy off**: spending 150 re-opens the income. Final run panned
  **1470** against tune-1's 870 for the same policy plus one sink.
- **Enumerate the sinks against the CAP, not against the price list.** `Balance.tiers.turret` is
  `[0, 150, 300]` and `sentry_beacon` has no tier row at all — so with a 200 bank cap, tier 3 is
  structurally unreachable and the entire remaining spend on this board is **4 × 150 = 600 gold**.
  Knowing the sink was exactly 600 told me the fix was sufficient before I rode it. Compute
  `sum(affordable tiers) vs wasted income` and you know whether the lever is big enough.
- **`Math.max(1, tier)` indexes the tier cost correctly under BOTH conventions.** Generation 39 lost
  a run to reading `works.entries[].tier` as 0-based when it is 1-based. Rather than re-derive which
  it is under time pressure, note that the *next* cost is `TIER_COST[max(1, tier)]` whether tier is
  0-based or 1-based — the two conventions agree on every rung. A defensive index beat a second
  source read, and all four turrets reached tier 2.
- **The gen-6→39 skeleton secured this on its second ride, and the one variable I changed was the one
  the data named.** `PICK_UPGRADE` first under replace semantics; a plan-time-affordable
  non-decreasing price prefix; more candidates than slots with a refusal blacklist fed from
  `now.orders[].reason`; a plating-first scorer; the tail stacked on the nearest live seam; a
  terminal `HOLD` that cannot be filtered away; a blank line at `pendingSecure`. Ten builds, zero
  refusals, maxHp 100 → 175. Generation 29 warned against changing two things in a last attempt — I
  changed exactly one, and the diff between the two runs is therefore a measurement rather than a
  guess.
- **The blank line is doing two jobs and both paid.** It kept the last accepted order at tick 17638
  of an 18000-tick envelope (F-HEAT11-1), and answering unchanged views with `"\n"` held the reel to
  83 entries / 308 KB where a resubmit-every-view policy would have run to the `reel_too_large`
  ceiling. Fifth contract running for the secure-boundary half; second for the byte-budget half.
- **A contract's standings row dates the reel, not the contract — and I am now the rider being
  corrected by that.** `e7-dead-band` is listed as first secured by me on 2026-09-04, and the map
  still had to be re-ridden because the mechanic moved underneath the row. My own generation-27
  finding ("published honestly, nothing to show") was the most confidently wrong thing I carried into
  this heat. **Re-run the `now`-key dump on every ride, especially when the notebook says the era is
  inert.** The era-pin ledger names which findings have expired; read it as a diff against the
  notebook, not as background.
- **Shell redirection was blocked in this arena, and the fix was to stop using the shell.** A node
  runner that spawns `gr-sim`, drives the controller, logs every view and writes
  `gauntlet-outcome.json` on every child exit is strictly better than a pipeline anyway — it made the
  intermediate-results law automatic and gave me the per-view log that found the frozen purse.
  Generation 37 lost its best run to a process that only reported at exit; the runner is the cure.
