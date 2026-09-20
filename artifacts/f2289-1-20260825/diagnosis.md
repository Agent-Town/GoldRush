# F-2289-1 diagnosis — the recorder hashed an uninstalled module instance

## Verdict

The raw Hill Mine divergence reproduces on current `main`: the tape claims `fnv1a32:a45ba9ac`, while the official replay produces `fnv1a32:85cb8a01` and exactly reproduces the secured outcome (`waves:17`, `gold:5`, `timeAlive:529.8`). Night Shift agrees at `fnv1a32:889d9357` and exactly reproduces its secured outcome (`waves:25`, `gold:115`, `timeAlive:750.033`).

`fnv1a32:a45ba9ac` is the exact hash of `{ "orders": [] }`. The original Hill recorder therefore hashed the silent no-executor fallback from `snapshotStandingOrders()`. Its normalized sequence has **0 entries**; replay has **84 entries**. The first difference is index **0**, and the shape is **84 missing recorder entries**, not reorder or changed content.

This identifies the mechanism more narrowly than “empty log”: the running `HeadlessContractSim` necessarily had an installed executor because all 84 accepted submissions executed and produced the retained outcome. `installedExecutor` is initialized to `null`, `bindStandingOrders()` is the only assignment, and no code sets it back to `null`. Therefore the later `vite.ssrLoadModule('/src/agent/StandingOrders.ts')` in `writeAgentTape()` observed a fresh/re-instantiated SSR module singleton, not the module instance the live sim had bound. The late module lookup silently returned the fallback. On current main without an intervening Vite invalidation, both reconstructed paths see the same installed instance and produce the 84-entry `85cb8a01` sequence; that explains why the defect is conditional.

Evidence:

- `hill-original-recorder-hash-input.json` — exact normalized input whose hash is the raw recorder claim.
- `hill-replay-orders.json` — 84 normalized replay `orders_replaced` entries, all 84 submissions accepted.
- `hill-recorder-orders.json` — current turn-driven recorder reconstruction: the same 84 entries and outcome as replay.
- `sequence-diff.json` — count and first-difference summary.
- `night-recorder-orders.json` / `night-replay-orders.json` — 62 identical control entries.

## Reproduction commands and results

Baseline:

```sh
git log --oneline | grep -q 'gauntlet-heat5b-reearn'
npm install --no-audit --no-fund
npm run build
```

Result: dependency present at merge `81729ab9b`; install up to date; build green.

Official replay:

```sh
node scripts/assay-replay-agent.mjs artifacts/gauntlet-heat5b-20260825/e2-hill-mine/attempt-10-tape.json
node scripts/assay-replay-agent.mjs artifacts/gauntlet-heat5b-20260825/e1-night-shift/attempt-1-tape.json
```

Results:

| tape | claimed | replayed | claimed outcome | replayed outcome |
|---|---|---|---|---|
| Hill Mine attempt 10 | `a45ba9ac` | `85cb8a01` | secure, w17, 5g, 529.8s | exact match |
| Night Shift attempt 1 | `889d9357` | `889d9357` | secure, w25, 115g, 750.033s | exact match |

Sequence probes:

```sh
node artifacts/f2289-1-20260825/probe-orders-log.mjs recorder artifacts/gauntlet-heat5b-20260825/e2-hill-mine/attempt-10-tape.json artifacts/f2289-1-20260825/hill-recorder-orders.json
node artifacts/f2289-1-20260825/probe-orders-log.mjs replay artifacts/gauntlet-heat5b-20260825/e2-hill-mine/attempt-10-tape.json artifacts/f2289-1-20260825/hill-replay-orders.json
node artifacts/f2289-1-20260825/probe-orders-log.mjs recorder artifacts/gauntlet-heat5b-20260825/e1-night-shift/attempt-1-tape.json artifacts/f2289-1-20260825/night-recorder-orders.json
node artifacts/f2289-1-20260825/probe-orders-log.mjs replay artifacts/gauntlet-heat5b-20260825/e1-night-shift/attempt-1-tape.json artifacts/f2289-1-20260825/night-replay-orders.json
```

Empty fallback proof:

```sh
node -e "/* load agentOrdersEventLogHash through Vite; hash { needsRider:false, orders:[], log:[] } */"
```

Result: `fnv1a32:a45ba9ac`, byte-for-byte the raw Hill claim.

## Hypotheses

### H1 cross-attempt accumulation — REFUTED

Every Hill attempt ran in a separate process. The first line of attempts 1–10 names ten distinct PIDs: `27225`, `29036`, `37559`, `48544`, `67628`, `67907`, `69472`, `69679`, `71336`, `74066`. `rider.mjs` spawns one `scripts/gr-sim.mjs` child and exits. There is no process in which attempts 1–9 could accumulate into attempt 10. The diff is also the inverse of accumulation: recorder has zero entries, replay has 84.

### H2 rejected orders counted on one side — REFUTED

All 84 retained Hill submissions are accepted by both current probes. The original log does contain rider-visible failed order execution, but submission rejection events have type `orders_rejected`, and `agentOrdersEventLogHash()` explicitly filters them out. The observed diff is zero-versus-84 `orders_replaced`, not a rejected-order subset.

### H3 terminal-instant boundary — REFUTED

Replay consumes all 84 submissions; no unreached-order arm fires. The last retained order is tick `15743`, before `durationTicks:15894`, and replay reaches terminal with the exact recorded outcome. The missing sequence begins at index 0, not at the terminal entry.

### H4 empty-log fallback — CONFIRMED on recorder; REFUTED on replay

The raw claim `a45ba9ac` equals the empty normalized input exactly. Replay has an installed executor, 84 `orders_replaced` events, and hash `85cb8a01`. Because the live sim could not have executed those standing orders without its bound executor, the recorder's later empty snapshot proves an SSR module-instance split/re-instantiation at the late `ssrLoadModule()` lookup.

## Blast radius

Command:

```sh
node artifacts/f2289-1-20260825/sweep-agent-tapes.mjs artifacts/f2289-1-20260825/blast-radius.json
```

| total retained agent tapes | agree | diverge | unreplayable |
|---:|---:|---:|---:|
| 115 | 96 | 8 | 11 |

The eight divergent retained paths are listed with both hashes and replay outcomes in `blast-radius.json`. Six are old heat-5/Hill paths (including one duplicate winning tape), one is the later Baron audit death tape, and one is the raw heat-5b Hill win. Seven of the eight also replay to a different outcome or to an unsecured run, so they are build-skew/trajectory cases rather than isolated F-2289-1 evidence. The raw heat-5b Hill tape is the only divergent retained tape whose replay reproduces the claimed secure outcome exactly. Thus this defect is proven to have refused **one honest standing** in the retained corpus, not many. The Baron death tape also reproduces its outcome while differing in hash, so the silent-hash class is not unique to Hill, but it cost no standing.

The 11 unreplayable files are not counted as agreements: two legacy v1 tapes lack `runStart`, four are malformed/refused retained fixtures, and five terminate before a retained order tick. Exact path and error are retained in the JSON.

## Priced cure recommendation — not implemented

One small lane slice, approximately **10–20 production lines plus one focused regression test (2–4 hours including gates)**:

1. In `src/sim/HeadlessContractSim.ts`, expose the standing-orders snapshot through the live sim instance (the method closes over the same imported module instance that was bound during construction).
2. In `scripts/gr-sim.mjs::writeAgentTape()` and `scripts/assay-replay-agent.mjs::replayAgentTape()`, hash that sim-owned snapshot instead of performing a late independent `ssrLoadModule('/src/agent/StandingOrders.ts')` lookup.
3. Add one regression that invalidates/re-instantiates the Vite module between sim boot and tape write and proves the writer either retains the live 84-entry snapshot or fails closed—never emits the legitimate-looking empty fallback.

Safety condition: an installed executor with genuinely zero submissions must remain a valid empty log; only “no bound executor for this live sim” must fail. Therefore changing `agentOrdersEventLogHash()` to reject every empty log would be unsafe, and changing the global `snapshotStandingOrders()` fallback to throw could break benign pre-install view callers. The sim-owned snapshot removes the singleton identity ambiguity at the hashing boundary without widening those semantics.
