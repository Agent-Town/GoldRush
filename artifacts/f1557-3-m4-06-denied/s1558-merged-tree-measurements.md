# s1558 — f1557-3 merged-tree measurements (M4-06 permission-denied)

Taken by the s1558 fire in detached worktree `gate-s1558` (main `f9178c521 (archive: pruned by the A3 rewrite)` + `lane/b`),
`--workers=1` per §3.1, machine otherwise idle (no playwright, no `run-node-guards`,
no lane runner — `tasks/running/` empty throughout).

## Gate battery (merged tree)

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | rc=0, no output |
| `npm run build` | green, `✓ built in 1.03s` |
| `m4-06-embodiment.spec.ts` desktop-chrome | **9/9 passed** (40.9 s) |
| `m4-06-embodiment.spec.ts` mobile-chrome | **9/9 passed** (40.2 s) |
| adjacent `m4-07-prospector-panel` + `m4-08-agent-attribution` desktop-chrome | **6 passed, 1 skipped** (16.4 s) |

`test:node-guards` NOT required: the diff touches `e2e/` + `artifacts/` only, no
`src/sim|src/systems|src/entities`, so F-1460-1 does not bind. Asserted, not assumed.

## Flake re-measurement — 100 mobile-chrome runs of the denied test

`--grep "permission-denied receipts" --project=mobile-chrome --workers=1`

| Batch | Result |
|---|---|
| `--repeat-each=15` | 14 passed, **1 failed** |
| `--repeat-each=15` | 15 passed |
| `--repeat-each=20` | 19 passed, **1 failed** |
| `--repeat-each=20` | 20 passed |
| `--repeat-each=30` | 29 passed, **1 failed** |
| **total** | **97 / 100 passed — ~3% failure rate** |

## The failing assertion is NOT the drift bound

Every failure landed on `e2e/m4-06-embodiment.spec.ts:421`:

```
Error: expect(received).toContain(expected) // indexOf
Expected value: "ledger"
Received array: ["held", "ask me", "no trust"]
> 421 |   expect(['held', 'ask me', 'no trust']).toContain(after.lastLine);
```

i.e. `after.lastLine === "ledger"` — the companion's last spoken line is a ledger-voice
line rather than a permission-denial line.

Corroborated independently by the logged distribution: across every merged-tree run,
`driftAbs` took only three values — `0.2833831328784402`, `0.3529334214834294`,
`0.20800000000000016` — **max 0.353 against a `gapClosed` bound of 0.45 and a
`driftAbs` bound of 0.6**. No drift assertion could have failed in any of the 100 runs.

## The directional reform's premise, measured

`gapClosed = driftAbs − 0.00105` in **every** sample (lane's 60 and my 100):

| driftAbs | gapClosed | delta |
|---|---|---|
| 0.2833831328784402 | 0.2823313158299232 | 0.00105 |
| 0.3529334214834294 | 0.3522530399578141 | 0.00068 |
| 0.20800000000000016 | 0.20675740724312952 | 0.00124 |

The drift is almost exactly **along** the line to the denied node, so substituting
`gapClosed` for `driftAbs` at the same `0.45` threshold moves the failure boundary by
~0.001. See F-1558-2.

## s1557's 0.4757 outlier did not reproduce

s1557 measured one failure at `driftAbs=0.4757520362541813` in 15 idle runs on main.
It appears in **0 of 160** subsequent samples (lane 60 + mine 100). Either a rarer tail
than 1/15 or condition-dependent. Stated as unresolved, not explained away — and note
that if it recurs, `gapClosed ≈ 0.4747` would **still** exceed the new 0.45 bound.
