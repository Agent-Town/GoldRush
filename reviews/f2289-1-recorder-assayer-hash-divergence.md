# f2289-1 — recorder/assayer hash divergence (diagnostic)

**Slice:** `f2289-1-recorder-assayer-hash-divergence` · **Branch:** `lane/a` · **Base:** `7f77ccb61` · **Lane tip:** `4fd3c9c6d` · **Merge:** `8f545d60b` · **Drained by:** s2291, 2026-08-25

## Verdict

**MERGED.** The diagnostic did exactly what its master asked and stopped exactly where its firewall said. Four hypotheses carry verdicts (H4 confirmed recorder-side, H1/H2/H3 refuted, each with the evidence that refuted it), the blast radius is measured over the whole retained corpus rather than asserted, and the cure is **priced and deliberately not applied**.

Gated per s2290's standing instruction for this slice: *"gate it on whether the diff and the hypothesis verdicts are actually present, not on whether a cure landed."* Both are present.

## What it does

It answers the question s2290 authored: two endpoints call the same function on the same input — `agentOrdersEventLogHash(snapshotStandingOrders())` at `scripts/gr-sim.mjs:260` and `scripts/assay-replay-agent.mjs:174` — and return different hashes.

The answer is narrower than "the log was empty". `fnv1a32:a45ba9ac`, the raw Hill Mine recorder's claim, **is exactly the hash of `{orders: []}`**. But the live `HeadlessContractSim` demonstrably *had* a bound executor: all 84 submissions executed and produced the retained outcome. `installedExecutor` starts `null`, `bindStandingOrders()` is its only assignment, and nothing ever sets it back. Therefore the late `vite.ssrLoadModule('/src/agent/StandingOrders.ts')` inside `writeAgentTape()` observed **a different SSR module singleton than the one the live sim bound** — a fresh/re-instantiated instance whose executor was never installed — and the silent fallback returned an empty log that hashed legitimately.

That also explains why the defect is *conditional*, which was the part s2290's four hypotheses were competing to explain: without an intervening Vite invalidation both paths see the same instance and agree.

## Evidence

| check | result |
|---|---|
| `npx tsc --noEmit` (merged tree) | **rc=0**, 4.43 s |
| `npm run build` (merged tree) | **rc=0**, green 16.15 s |
| Gate location | detached `.gate-s2291` at `main`, §3.0b |
| Landed tree vs gated tree | `1ac301e4f…` == `1ac301e4f…` — **byte-identical** |
| `main..lane/a` after merge | **empty** — fully absorbed |
| Run surface | **0** — 10 artifacts + 1 BACKLOG row, no code |
| F-1460-1 `test:node-guards` trigger | **does not fire** — no `src/sim`, `src/systems`, `src/entities` path touched |

### The runner's linchpin, re-derived rather than inherited (Mistake #4)

The whole diagnosis rests on one identity. I loaded `RunTape.ts` through Vite **on the merged tree** and computed it myself:

```
agentOrdersEventLogHash({log: []}) = fnv1a32:a45ba9ac
runner's claimed raw Hill recorder hash = fnv1a32:a45ba9ac
MATCH: true
```

The claim holds independently.

### Blast radius, as the runner measured it

| total retained agent tapes | agree | diverge | unreplayable |
|---:|---:|---:|---:|
| 115 | 96 | 8 | 11 |

The honest part of this table is the restraint: of the 8 divergent tapes, **seven also replay to a different outcome**, so they are build-skew/trajectory cases rather than F-2289-1 evidence. Only the raw heat-5b Hill tape both diverges in hash *and* reproduces its claimed secure outcome exactly. **This defect is proven to have cost exactly one honest standing, not many** — and the runner says so in those terms rather than claiming the larger number. The 11 unreplayable files are explicitly *not* counted as agreements, with path and error retained.

## Merge classification

Base `7f77ccb61` (the master's own authoring commit).

| files | class | resolution |
|---|---|---|
| all 10 under `artifacts/f2289-1-20260825/` | **LANE-ONLY** | new paths, taken as-is |
| `tasks/BACKLOG.md` | **BOTH-MOVED** | auto-merged by `ort` |

`BOTH-MOVED` is a bucket, not a verdict, so the resolution was **verified by row-set diff rather than by the word "auto-merging"**: main had gained my two F-2291 rows at the **top** while the lane appended one row at the **bottom** (line 4600) — disjoint regions. Measured: **0 rows lost from main, 0 rows lost from the lane, 3342 + 1 = 3343**, and all five subject rows (`F-2291-1`, `F-2291-2`, `F-2290-1`, `F-2290-2`, `F-2289-1`) present exactly once.

## Findings

**F-2291-3 (non-blocking, informational) — the priced cure is sound and its stated safety condition is the load-bearing part.** The runner prices ~10–20 production lines plus one regression (2–4 h with gates): expose the standing-orders snapshot through the live sim instance, hash *that* instead of a late independent `ssrLoadModule` lookup, and add a regression that invalidates the module between sim boot and tape write. It then names the trap explicitly — **an installed executor with genuinely zero submissions must remain a valid empty log**, so rejecting every empty log would be unsafe, and making the global `snapshotStandingOrders()` fallback throw could break benign pre-install view callers. That is the correct discipline and it should survive into whatever master implements this. **Not authored this fire** (the cure is a code slice; this drain's budget went to the drain and to F-2291-1).

**Cross-reference, recorded so the two are not conflated later.** This fire separately measured a hash divergence on a *different axis* — F-2291-1, the Baron re-ride: same player, same seed, same contract, **twelve days of engine drift**, outcome byte-identical, `eventLogHash` `f5365f4c` → `620e7876`. That is **not** this defect: neither value is `a45ba9ac`, verified above, and the axis is engine-version rather than recorder-vs-replay. The two findings do converge on one consequence worth stating once — **the orders-log hash identifies *a run on a given engine*, never *a run*** — which the runner's own note anticipates when it observes that the Baron death tape likewise differs in hash while reproducing its outcome, "so the silent-hash class is not unique to Hill, but it cost no standing."

## Firewall

Held exactly. The master forbade curing and forbade rewriting any retained tape; the diff contains **no code and no tape rewrite** — ten new artifacts and one ledger row. The runner reported the cure instead of applying it, which is a firewall success, not a shortfall.
