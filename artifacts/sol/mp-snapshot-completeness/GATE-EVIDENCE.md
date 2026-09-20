# F-SOL-PERSIST-002 gate evidence

- Branch: `sol/mp-snapshot-completeness`
- Base: exact drained `origin/main@54f39f2`
- Scope: additive snapshot v2, v1 migration, complete deterministic future state, true lockstep convergence, and two independently controlled multiplayer heroes.

## Required gates

### Static and production build

```text
npm exec -- tsc --noEmit && git diff --check && npm run build
PASS
Vite build completed; existing >900 kB chunk warning only.
index: 1,448.96 kB; gzip: 375.91 kB
```

### Snapshot validation, suspend, and save slots

```text
npm exec -- playwright test e2e/restore-validation.spec.ts e2e/run-suspend.spec.ts e2e/save-slots.spec.ts --project=desktop-chrome --project=mobile-chrome --workers=1 --reporter=line
54 passed (4.2m)
```

### Isolated lockstep suite

```text
npm exec -- playwright test e2e/mp-02-lockstep.spec.ts --project=desktop-chrome --workers=1 --reporter=line
6 passed (1.4m)
```

This includes 500-tick peer identity, injected mismatch restore, real elite and boss-group divergence followed by 100+ ticks of convergence, independent movement of two real heroes, room join, and invalid narrow-width handling.

After the review-driven streaming transport fix, the first four simulation/resync cases passed in the combined run. The documented F-drain-1 order-dependent town-roster harness flake then reproduced; both remaining town cases passed 1/1 in exact isolated reruns, as required by the brief's isolation ruling.

### Relay protocol

```text
npm run test:mp
456 relay checks passed
```

### Long-horizon determinism

```text
npm exec -- playwright test e2e/perf-04-determinism.spec.ts --project=desktop-chrome --project=mobile-chrome --workers=1 --reporter=line
6 passed (8.3m)
```

Both projects and both repeated runs produced 18,000 equal ticks and timeline entries, future-state hash `fnv1a32:d835987d`, economy hash `fnv1a32:0f6f2150`, and seven economy events. No projected future-state diff remained. See `perf-04-summary.json`.

### RNG reset regression

```text
npm exec -- playwright test e2e/perf-04-determinism.spec.ts --grep "resetRun rewinds every RNG stream" --project=desktop-chrome --project=mobile-chrome --workers=1 --reporter=line
2 passed
```

### v1 migration and profile fixtures

```text
npm exec -- playwright test e2e/profile-first-boot.spec.ts e2e/m3-06-demo-profiles.spec.ts --project=desktop-chrome --project=mobile-chrome --workers=1 --reporter=line -g "pack the ledger|two title profiles"
4 passed
```

### Cloud account client

```text
GR_CAPTURE_BASE_URL=http://localhost:5188 VITE_ACCOUNTS_API_URL=http://127.0.0.1:8877 npm exec -- playwright test e2e/accounts-sync.spec.ts --project=desktop-chrome --project=mobile-chrome --workers=1 --reporter=line
10 passed (11.5s)
```

Compressed cloud ledgers use outer envelope v2 so a legacy v1 client rejects them instead of interpreting the codec wrapper as an empty profile. The current client expands the payload back to validated v1 before atomic restore.

### Review-driven safety regressions

```text
npm exec -- playwright test e2e/save-slots.spec.ts e2e/restore-validation.spec.ts --project=desktop-chrome --project=mobile-chrome --workers=1 --reporter=line -g "one malformed manual slot|gzip snapshot decoding stops|compressed non-record profile data"
6 passed (10.8s)
```

These prove mixed shelves retain valid slots and preserve the original for recovery, gzip decoding cancels at the streamed output ceiling, and compressed array data cannot erase local profile bytes.

### Reclaimable pickup regression

```text
npm exec -- playwright test e2e/m2-04-gold-stealing.spec.ts --project=desktop-chrome --project=mobile-chrome --workers=1 --reporter=line -g "killed carrier drops reclaimable gold pickup"
2 passed
```

## Capacity evidence

The same complete snapshot round-tripped exactly after transport compression:

- Desktop: 359,268 raw bytes; 22,036 wire bytes; 22,374-byte cloud request.
- Mobile: 359,280 raw bytes; 22,040 wire bytes; 22,378-byte cloud request.
- Codec: `gzip-base64-v1`; both local transport and cloud envelope round trips were exact. Cloud envelopes are v2 and explicitly rejected by legacy v1 readers.

See `capacity-desktop-chrome.json` and `capacity-mobile-chrome.json`.

## Broad regression disposition

```text
VITE_ACCOUNTS_API_URL=http://127.0.0.1:8877 npm exec -- playwright test --project=desktop-chrome --project=mobile-chrome --workers=1 --reporter=line
1,012 passed, 61 failed, 35 skipped, 8 did not run (1.8h)
```

The broad combined-order run contains known/adjacent UI, terrain, story, balance, and ordering reds. Every branch-related red observed there was corrected and rerun through its exact owning suite above: perf-04, profile v2 migration, the invalid legacy demo fixture, and the combined-order pickup case. All six mp-02 cases passed in both desktop and mobile inside the broad run; restore/save/night-shift/fixed-step/harvest/building/agent families were green.

The separate `npm run test:accounts` script remains an adjacent known red at `scripts/test-accounts.mjs:80`: `current save is latest envelope: expected 7, got 6`. The unchanged harness reproduces this with its ordinary v1 fixtures before compressed-v2 validation is involved; account-sync e2e passed 10/10 against the local worker and passed in the broad browser run.

## Review

Independent review found and drove fixes for mixed-slot shelf loss, post-buffer gzip limits, compressed-envelope version skew, and non-record decompression. Focused follow-up found no actionable lockstep ordering or actor-slot issue. Final disposition is recorded in the READY-FOR-GATES commit body.
