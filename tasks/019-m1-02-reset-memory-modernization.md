> ⚠️ **OPEN, BUT ITS PREMISE MAY HAVE EXPIRED — MEASURE BEFORE QUEUEING (Mistake #8 guard, content-probed s1132 2026-07-27).** Not shipped: `e2e/m1-02-auto-fire.spec.ts:96` still reads `expect(after?.textures).toBe(baseline?.textures)` — the exact line this master names as the problem — and that file's newest commit `0abbab20` (2026-07-04) PRE-DATES the master's own 2026-07-05 evidence. The sibling m1-05 cure did land (`51b75ba6`); m1-02 never got the same treatment. ⚠️ **But the mirror-bake it blames may have self-cured**: the hero contract retired its mirror table to `{}` at s37 (all 8 directions explicit). **Run the `m1-02` spec on current main FIRST — if it is green, retire this master rather than queueing it.** See F-1132-4.

# Task 019: m1-02 reset renderer-memory assert — s27-law modernization

Codex: single-file harness fix. SCOPE: `e2e/m1-02-auto-fire.spec.ts` ONLY. No src changes, no other e2e.

**Problem:** `run reset recycles combat pools without renderer memory growth` asserts absolute texture equality (`expect(after?.textures).toBe(baseline?.textures)`, line ~96). It is the ONLY red in both Mac full-suite evidence runs (2026-07-05 1059: 22→other; 1147: 22→23). s30's A/B on m1-05's identical failure proved the +Δ is 016's lazy mirror-bake UV-flip cache reaching new depth first-time during cycles — pool-depth warm-up (s10 family), NOT a leak.

**Fix (copy the m1-05 pattern s30 landed — read its reset test):** quiesce → warm a FULL cycle (including all 8 walk directions so the mirror-bake depth is reached) → grace cycle → assert ZERO GROWTH across two further cycles. Geometries may stay exact-equality. Keep the pool-recycle asserts (bolts/motes) untouched. Add the in-file rationale comment (s23 law) citing s30's A/B + this task.

**Gates:** tsc clean; m1-02 full file green desktop+mobile 3× stable locally; do not touch `.last-run.json` shortcuts (s27 lesson — full listing). Reply READY-FOR-GATES with results; supervisor re-runs + merges.

Constraints: no `git commit` on main (lane-c or relay tree per current STATUS); never `playwright install`; servers die between calls.
