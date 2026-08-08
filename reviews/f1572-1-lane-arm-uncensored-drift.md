# F-1572-1 — lane arm, uncensored drift

**Slice:** `f1572-1-lane-arm-uncensored-drift`  
**Branch/tip measured:** `lane/b` at `210d4f5dbfe3ae941d53cf08421529899c673d02`  
**Verdict:** **DECLARED SUCCESS — the uncensored lane arm produced 24 observations, 0 CENSORED runs, and 0 breaches of `0.4`.**

## Arrangement and pre-measurement checks

- Full `e2e/m4-06-embodiment.spec.ts`, never the isolated test and never `--repeat-each`.
- Twelve separate `npx playwright test` invocations per project, `desktop-chrome` then `mobile-chrome`, serially, with `--workers=1`; every invocation started its own dev server.
- Samples were harvested by filtering for the `[m4-06-denied]` substring, then parsing `driftAbs`.
- Both F-1424-3 sequencing probes printed `1` before measurement.
- `npx tsc --noEmit`: rc=0.
- Pre-measurement `npm run build`: green; Vite **1.41s**; `[asset-diet] Herald dev-path art 1158214 bytes (1500000 byte ceiling).`
- Every invocation: rc=0, **10 passed**. `test:node-guards` was **not owed** because this task changes no `src/sim/`, `src/systems/`, or `src/entities/` file.

Raw invocation logs and exit-code companions are under `artifacts/f1572-1-lane-arm/<project>/run-{01..12}.{log,rc}`.

## Raw lines in run order

### `desktop-chrome`

```text
[m4-06-denied] driftAbs=0.33233868267175914 gapClosed=0.33175519291965117
[m4-06-denied] driftAbs=0.3722002149381437 gapClosed=0.37139096406706074
[m4-06-denied] driftAbs=0.3722002149381437 gapClosed=0.37139096406706074
[m4-06-denied] driftAbs=0.2833831328784402 gapClosed=0.2823313158299232
[m4-06-denied] driftAbs=0.3722002149381437 gapClosed=0.37139096406706074
[m4-06-denied] driftAbs=0.3722002149381437 gapClosed=0.37139096406706074
[m4-06-denied] driftAbs=0.3722002149381437 gapClosed=0.37139096406706074
[m4-06-denied] driftAbs=0.3722002149381437 gapClosed=0.37139096406706074
[m4-06-denied] driftAbs=0.3722002149381437 gapClosed=0.37139096406706074
[m4-06-denied] driftAbs=0.30904530412222725 gapClosed=0.30863110994026144
[m4-06-denied] driftAbs=0.3722002149381437 gapClosed=0.37139096406706074
[m4-06-denied] driftAbs=0.3722002149381437 gapClosed=0.37139096406706074
```

### `mobile-chrome`

```text
[m4-06-denied] driftAbs=0.3722002149381437 gapClosed=0.37139096406706074
[m4-06-denied] driftAbs=0.3722002149381437 gapClosed=0.37139096406706074
[m4-06-denied] driftAbs=0.30904530412222725 gapClosed=0.30863110994026144
[m4-06-denied] driftAbs=0.3722002149381437 gapClosed=0.37139096406706074
[m4-06-denied] driftAbs=0.3722002149381437 gapClosed=0.37139096406706074
[m4-06-denied] driftAbs=0.3722002149381437 gapClosed=0.37139096406706074
[m4-06-denied] driftAbs=0.30904530412222725 gapClosed=0.30863110994026144
[m4-06-denied] driftAbs=0.3497942252239167 gapClosed=0.34914401122789407
[m4-06-denied] driftAbs=0.3722002149381437 gapClosed=0.37139096406706074
[m4-06-denied] driftAbs=0.3359077254247072 gapClosed=0.33534841091296563
[m4-06-denied] driftAbs=0.3722002149381437 gapClosed=0.37139096406706074
[m4-06-denied] driftAbs=0.3722002149381437 gapClosed=0.37139096406706074
```

## Distribution

| project | values in run order | observations | distinct | min | max | breaches `>= 0.4` | CENSORED |
|---|---|---:|---:|---:|---:|---:|---:|
| `desktop-chrome` | `0.33233868267175914`, `0.3722002149381437`, `0.3722002149381437`, `0.2833831328784402`, `0.3722002149381437`, `0.3722002149381437`, `0.3722002149381437`, `0.3722002149381437`, `0.3722002149381437`, `0.30904530412222725`, `0.3722002149381437`, `0.3722002149381437` | 12 | 4 | `0.2833831328784402` | `0.3722002149381437` | **0** | **0** |
| `mobile-chrome` | `0.3722002149381437`, `0.3722002149381437`, `0.30904530412222725`, `0.3722002149381437`, `0.3722002149381437`, `0.3722002149381437`, `0.30904530412222725`, `0.3497942252239167`, `0.3722002149381437`, `0.3359077254247072`, `0.3722002149381437`, `0.3722002149381437` | 12 | 4 | `0.30904530412222725` | `0.3722002149381437` | **0** | **0** |

## Three-way comparison

| arm | sampling | observations | breaches `>= 0.4` | max |
|---|---|---:|---:|---:|
| **This lane arm** | uncensored; 12 desktop + 12 mobile | **24** | **0** | `0.3722002149381437` |
| F-1564-1 lane arm | censored | **24** | **0** | `0.3722002149381437` |
| s1572 fire arm | uncensored; desktop | **12** | **0** | `0.3722002149381437` |

## Verdict

The uncensored lane arm **does not breach `0.4`**: 0 of 24 observations breached, and no run was censored. This is a declared successful negative result. On the banked comparison metrics it **does not differ from the uncensored fire arm**: both have zero breaches and the identical maximum `0.3722002149381437`; this lane sample therefore does not support a lane-versus-fire localisation. It also reproduces F-1564-1's zero-breach count and exact maximum after removing that arm's censoring bias. The previously observed lane breach `0.4096828041302199` remains a real observation, but it did not recur in this fixed-size arm and no bound change is justified.

## Firewall and adjacent findings

- `e2e/m4-06-embodiment.spec.ts` is byte-identical to `main`: SHA-256 `72055250610e6c4fda5a2535904ca0011defb693748c88d761ef0d7ab8844fd0` on both.
- No `e2e/**` or `src/**` file changed; no numeric bound changed; `CLAUDE_CONFIG_DIR` was not set.
- No adjacent defect was found or fixed.
