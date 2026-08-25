# Review — f2289-1-sim-owned-orders-snapshot

**Slice:** `f2289-1-sim-owned-orders-snapshot` (lane-a, FIRE-AUTHORED s2291, cure for F-2289-1)
**Branch:** `lane/a` · **Tip:** `1a723b940 runner(lane-a): f2289-1-sim-owned-orders-snapshot.md`
**Base (merge-base with main):** `d79627ea4` (s2291's authoring commit)
**Gated by:** fire s2293, 2026-08-25, in detached worktree `.gate-s2293` on the MERGED tree (§3.0b)

## Verdict

**MERGE.** tsc clean, build green, the slice's own regression passes with all three arms, and the merged tree's `test:node-guards` adds **zero** failures against a main baseline this same fire measured independently.

## What it does

F-2289-1 was a module-instance split: `scripts/gr-sim.mjs::writeAgentTape()` and `scripts/assay-replay-agent.mjs` each performed a **late, independent** `vite.ssrLoadModule('/src/agent/StandingOrders.ts')` and hashed `snapshotStandingOrders()` from *that* module — which is not necessarily the module the live sim bound its executor into. When they diverged, the recorder hashed the module's silent empty fallback (`fnv1a32:a45ba9ac`, exactly the hash of `{orders: []}`), and the county **refused an honest standing** on the resulting recorder-vs-assayer mismatch.

The cure removes the singleton ambiguity **at the hashing boundary only**: `HeadlessContractSim` gains `standingOrdersSnapshot()`, which returns the view through the module instance the sim itself closed over, and both the recorder and the assayer now hash `sim.standingOrdersSnapshot()` and perform no late lookup. The global fallback semantics and `agentOrdersEventLogHash()` are untouched — which matters, because the lever proof established that a bound executor with **zero** submissions hashes identically to the fallback, so "reject empty logs" would have been wrong.

## Evidence (measured on the MERGED tree in `.gate-s2293`, not inherited)

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **rc=0** |
| `npm run build` | **green, 3.40 s**; asset-diet ceiling respected (Herald dev-path art 1,158,214 B of a 1,500,000 B ceiling) |
| Merge | **clean, `ort`, zero conflicts** — merged-tree diff vs main is byte-identical to the lane diff (6 files, +83/−6) |
| `npm run test:node-guards` (merged tree) | see the baseline comparison below |

**Merge classification** — merge-base `d79627ea4`, one commit `1a723b940`, six files, **all LANE-TOUCHED · zero MAIN-MOVED · zero BOTH-MOVED**. No graft or three-way resolution was required, and none was performed.

## The battery: a red board, and why this slice is not the cause

⚠️ **`npm run test:node-guards` is RED ON MAIN, and was red before this slice existed.** This drain therefore does **not** gate on a bare green — it gates on a **differential against a baseline measured this same fire, on main, before the merge** (see F-2293-1, filed s2293).

**Main baseline (s2293, measured on main):** 2 failures —

1. **`fixture-teardown.test.mjs`** — pre-existing. The detector runs each subject in a child process with `TMPDIR` set to a fresh scratch (`scripts/fixture-teardown.test.mjs:33-42`), so its survivors are *freshly leaked*, not accumulated debris. Reproducing its own method on main gives **8 of 8 subjects leaking, with counts identical to the lane's run** (10/4/8/3/2/2/3/8 = 40 dirs per battery run). Every child exits `rc=0` having really executed tests — the guards pass their own arms; only teardown is missing. **Cure authored and dispatched this fire:** `tasks/f2293-1-guard-fixture-teardown.md` (lane-b).
2. **`moth-season-pressure.test.mjs`** — a load ceiling, not a content failure. Its `run()` wraps `spawnSync` with `timeout: 30_000`; a timeout kill is reported as `status: null`, which is the literal `null !== 0` at `scripts/moth-season-pressure.test.mjs:18`. The lane's own stderr carries `gr-sim speed: 0.34 waves/s` (12 waves ≈ 35 s, over budget). **Control: green on main in 15.2 s**, a 2.1× margin — the documented F-2076-1 / F-2166-2 class.

**Independent corroboration:** the runner reached the same attribution separately, in `artifacts/f2289-1-cure-20260825/verification.md` — *"unrelated pre-existing fixture-teardown leaks and a load-only Moth Season timeout"*. The two measurements were taken in different trees by different agents and agree. **The drain's attribution was measured first and was not inherited from that file** (Mistake #4).

## Findings

- **F-2293-1** (filed s2293, non-blocking, OPEN) — `test:node-guards` is red on main; both failures are environment. Cure for the fixture leak authored + dispatched to lane-b this fire. The Moth Season half is a load ceiling and is deliberately **not** cured: re-pinning it would be exactly the reflex the standing prohibition forbids.
- **No blocking findings against this slice.** The firewall held: the runner touched only its five named files plus `package.json` for the Scope-4 rooting lift its master explicitly granted, and it added its regression to `test:node-guards` rather than leaving it uncollected.

## Out of scope, correctly left alone

The refused Hill Mine standing **was not re-admitted**. The runner reports it would now hash `fnv1a32:85cb8a01` rather than the fallback `fnv1a32:a45ba9ac`, and stopped there — re-admission is an owner/attended call, as the master required. The Night Shift control still agrees at `fnv1a32:889d9357`, i.e. the cure did not move a tape that already agreed.
