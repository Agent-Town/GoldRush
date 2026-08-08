---
source: codex
project: Gold Rush
date: 2026-08-08
type: digest
task: f1571-1
---

# F-1571-1 — M4-06 uncensored drift sample

## Result

Moved the existing receipt and refusal-bark assertions, unchanged and in their original relative order, to immediately after the existing drift log. Added the requested F-1565-2 comment. The captures remain before the sampling window.

The uncensored desktop run exposed a real bound breach: `driftAbs=0.4096828041302199`, `gapClosed=0.40952183859783275`. Per the firewall, both `0.4` bounds remain unchanged and no product code was touched.

## Manufactured censoring proof

The refusal assertion was temporarily changed by direct file edit to `expect(['forced-failure']).toContain(immediate.lastLine)` for both arms.

Before the reorder, `artifacts/f1571-1-uncensored-drift/before-forced-failure.txt` contains this failure:

```text
Error: expect(received).toContain(expected) // indexOf

Expected value: "no trust"
Received array: ["forced-failure"]

  406 |     reason: 'PERMISSION_DENIED',
  407 |   });
> 408 |   expect(['forced-failure']).toContain(immediate.lastLine);
      |                              ^
```

`rg -n "\[m4-06-denied\] driftAbs=" artifacts/f1571-1-uncensored-drift/before-forced-failure.txt` produced no output: the assertion aborted the test before the sample.

After the reorder, `artifacts/f1571-1-uncensored-drift/after-forced-failure.txt` contains the drift sample before the same manufactured failure:

```text
[m4-06-denied] driftAbs=0.3722002149381437 gapClosed=0.37139096406706074

Error: expect(received).toContain(expected) // indexOf

Expected value: "no trust"
Received array: ["forced-failure"]

  412 |     reason: 'PERMISSION_DENIED',
  413 |   });
> 414 |   expect(['forced-failure']).toContain(immediate.lastLine);
      |                              ^
```

The manufactured failure was restored. The intended final spec hash was recorded before verification and still matches:

```text
72055250610e6c4fda5a2535904ca0011defb693748c88d761ef0d7ab8844fd0  e2e/m4-06-embodiment.spec.ts
```

## Arrangement and firewall checks

- The block from `advanceSim(0.35)` through the drift `console.log` hashes identically on `HEAD` and in the final file: `4088e0e66a95535f3202ef3a34c9ab0fa7b618aeeffe8348c13e848a24403985`.
- No `advanceSim`, `companion`, distance computation, log statement, numeric bound, or other constant moved or changed.
- `CLAUDE_CONFIG_DIR` was not set; the FIRE-shell reproduction remains F-1571-1 fire duty.
- `npm run test:node-guards` is not owed because this slice touches no `src/sim/`, `src/systems/`, or `src/entities/` file.

## Verification

- Pre-edit `npm run build`: green; Vite `1.41s`; asset diet `1,158,214 / 1,500,000` bytes.
- Final `npx tsc --noEmit`: rc 0.
- Final `npm run build`: green; Vite `1.24s`; asset diet: `[asset-diet] Herald dev-path art 1158214 bytes (1500000 byte ceiling).`
- M4-06 desktop, `--workers=1`: `9 passed`, `1 failed` in `46.3s`. The sole failure was the uncensored unchanged-`0.4` bound breach above.
- M4-06 mobile, `--workers=1`: `10 passed` in `42.9s`; `driftAbs=0.3359077254247072`, `gapClosed=0.33534841091296563`.
- Adjacent M4-07 and M4-08, both projects at `--workers=1`: `13 passed`, `1 skipped` in `32.3s` (the existing desktop-only skip for the mobile bottom-sheet test).

## Deliberately discarded factory churn

The Playwright runs regenerated only evidence PNGs under `artifacts/m4-07-panel/`, `artifacts/m4-07/`, `artifacts/m4-08-attribution/`, `artifacts/m4-re-land/`, `artifacts/prospector-presence/`, and `reviews/shots-f1567-2/`. Per F-1407-1/F-1266-1, all were discarded; none is part of this slice.

## Adjacent findings left untouched

The normal desktop run demonstrates that a lane-shell sample can breach the unchanged ceiling once logging is uncensored. This is reported evidence, not a tuning instruction; no bound or game behavior was changed.

---

## DRAIN — s1572, MERGED `14b3c927c5d1d2d2bf96584d0f7731b72c816c66`

**Verdict: MERGE.** Gated in a detached worktree (`gate-s1572`) per §3.0b — the lane's content was never placed in main's working tree until the verdict was MERGE. Worktree removed after; the `node_modules` symlink unlinked behind an `lstat` guard so removal could not follow it into main's real tree.

**§3.0 first:** `drain-block-check` → **CLEAR** (`status:"queued"`).

### Merge classification

Base `3e47f632222e5f326d7fa75d1117303a44e9374b`. **Main moved on ZERO of the ten paths** — the only three commits on `main` since the base are bookkeeping (`STATUS.md`, `tasks/BACKLOG.md`, `logs/**`). All ten are **LANE-TOUCHED / MAIN-UNMOVED**; `ort` clean, no graft.

### Evidence (fire shell, all `--workers=1` per §3.1, projects run SERIALLY)

| gate | result |
|---|---|
| `npx tsc --noEmit` | rc=0 |
| `npm run build` | green, Vite **1.03s**, asset diet **1,158,214 / 1,500,000** |
| m4-06 **desktop** | **10 passed** (42.0s) — `driftAbs=0.26277176408434727` |
| m4-06 **mobile** | **10 passed** (42.8s) — `driftAbs=0.3722002149381437` |
| adjacent m4-07 + m4-08, both projects | **13 passed, 1 skipped** (33.7s) |
| `test:node-guards` | **not owed** — diff touches no `src/sim/`, `src/systems/`, `src/entities/` |

### The runner's red did NOT reproduce, and a control arm says why it is not this slice's

The runner reported `9 passed / 1 failed` on desktop at `driftAbs=0.4096828041302199` — a real `0.4` breach, correctly **reported and not fixed** (the master forbids re-pinning; F-1441-3). It did not reproduce here in **four runs**. Because a single arm cannot separate *caused* from *revealed*, I ran the **control arm** — main's pre-reorder spec, same shell, same hour:

| arm | desktop `driftAbs` | mobile `driftAbs` |
|---|---|---|
| **merged** (reordered) | 0.26277176408434727 | **0.3722002149381437** |
| **control** (main) | 0.33233868267175914 | **0.3722002149381437** |

**Mobile is bit-identical across arms**, and `0.3722002149381437` is *exactly* the maximum of F-1564-1's 24-observation set — the quantisation F-1559-1 identified. Desktop differs run-to-run in **both** arms. So there is no evidence the reorder shifts the distribution, and the breach belongs to the known F-1563-3 class rather than to this slice.

### The deliverable, re-manufactured rather than inherited

A green suite is not evidence for this task, so the censoring differential was reproduced at the gate by **direct file edit** (never a shell-quoted probe), same forced failure on both arms:

- **BEFORE** (main's ordering): forced refusal failure → **no `[m4-06-denied]` line at all** — the sample is destroyed.
- **AFTER** (reordered): same forced failure → **`[m4-06-denied] driftAbs=0.2833831328784402`** present, then the failure.

The cure works on the path a passing run never executes.

### Firewall

Spec `sha256` **`72055250610e6c4fda5a2535904ca0011defb693748c88d761ef0d7ab8844fd0`** matches the lane blob **and** the runner's recorded hash (triple-match); restored byte-identical after both probes. Both `0.4` bounds intact at `:425`/`:426`; no `CLAUDE_CONFIG_DIR`; no `waitForTimeout` added to this test; refusal set unchanged; no `after.lastLine` re-assertion. **No forbidden green.**

### Findings

- **F-1572-1 (non-blocking, OPEN)** — the runner's breach was observed in the **LANE** shell, where F-1564-1 measured **0 breaches in 24 observations** and on that basis localised F-1563-3 to the **fire** shell. My four **fire-shell** runs breached **zero** times. The ladder's localisation is therefore weaker than its closure states, and the two shells' roles may be the reverse of the recorded conclusion. Evidence, not a re-pin instruction.
- **F-1572-2 (non-blocking, OPEN)** — the master's premise that the move "changes NOTHING about the arrangement under test" is **imprecise**. `before` is captured at `:397` and `after` at `:406`, so the two moved assertions sat **inside** the measurement window, and at `timescale=4` wall-clock is a live input to drift. The perturbation is sub-millisecond against a window of several page round-trips — and mobile came back bit-identical — so it is **immaterial in practice and does not block**. What must not be reused is the general claim that a pure assertion cannot perturb a timing measurement.
