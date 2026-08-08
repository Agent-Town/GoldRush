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
