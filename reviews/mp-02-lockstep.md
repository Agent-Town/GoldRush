# Review — MP-02 lockstep core (two sims, one truth)

**Slice:** mp-02 (spec `specs/multiplayer/README.md`, MP-02; builds on MP-01 relay per `docs/api-multiplayer.md`)
**Branch/tip:** `lane/perf` @ `bf33055` ("mp: add flagged lockstep core")
**Base:** merge-base(main, lane/perf) = `9f9ab52` (bf33055's direct parent) → main advanced only STATUS.md + tasks/BACKLOG.md since, so a CLEAN 7-file graft (no 3-way).
**Merged to main:** s238 fire, drain commit below.
**Verdict:** ✅ MERGE — flag-gated (`?mp=dev`), zero default-path impact, both mp-02 e2e proofs green on desktop, full regression + boot green.

## What it does
Adds input-delay lockstep multiplayer as a **dev-flagged** overlay (`?mp=dev`), with zero effect on the normal single-player path. When active:
- `Game.update()` sources the tick from `LockstepClient.pump(localInput)`: sim advances only on complete input bundles (~3-tick delay buffer); the fixed step is `mpClient.stepSeconds`. When no bundle is ready the frame renders-only and returns (no sim advance).
- All actors' inputs come from the bundle; local hero driven by `intentsFromLockstepInput(bundle.inputs[0])`; remote riders render as placeholder tinted cylinder+cone heroes v1 (MP-03 owns real presentation).
- **Desync guard:** every 30 ticks a `stableHash` (fnv1a32) of sim state is exchanged; mismatch → pause + "the wire crossed" card + auto-resync by restoring the freshest run-suspend snapshot passed through the relay blob.
- `RunSuspend.ts` gains two additive wrappers (`captureRunSuspendSnapshot`/`restoreRunSuspendSnapshot`) — the resync vehicle; existing capture/restore logic unchanged.

## Firewall compliance — VERIFIED
`bf33055` touched exactly the 7 firewalled files, nothing else:
`src/mp/LockstepClient.ts` (new, 373L) · `src/game/Game.ts` (flag-gated tick seam) · `src/game/RunSuspend.ts` (additive wrappers) · `src/vite-env.d.ts` (additive flag types) · `e2e/mp-02-lockstep.spec.ts` (new) · `artifacts/mp-02/{identity,desync-resync}.json`.
- **No sim logic changes on the default path:** `installMultiplayerDev()` early-returns when `multiplayerConfigFromSearch()` is null (`if (params.get('mp') !== 'dev') return null`), so `mpClient` stays `undefined`. With no client, `update()` collapses to the original two lines (`sampledIntents` → `intents`, unchanged `elapsed += delta`); `finishMultiplayerTick()` no-ops. Proven green by the regression suites below.
- **No relay changes:** `LockstepClient` imports only `three` + the `Intents` type and speaks MP-01's protocol (`/api/multiplayer/create`, `…/connect` WS) — no `functions/` edits.
- **No UI beyond the dev card:** the desync card reuses the death-overlay classes with `data-testid="mp-desync-card"`.
- **Canon (brief §9):** remote riders are tinted cylinder-body + cone-hat + lamp (frontier-tech, no firearms, not gory, no peoples); card voice "Ride Together / The wire crossed / Restoring the latest trail ledger" is warm-frontier. ✓

## Evidence
| Gate | Result |
|------|--------|
| `npx tsc --noEmit` | clean |
| `npm run build` | ✓ built 299ms |
| `e2e/mp-02-lockstep.spec.ts` desktop-chrome | **2/2 pass** — 500-tick identity (20.9s) + desync→wire-card→resync (10.2s) |
| `e2e/mp-02-lockstep.spec.ts` mobile-chrome | 2/2 **skip by design** (`test.skip(project !== 'desktop-chrome')` — one two-tab proof is enough) |
| m1-01 + m2-01 (flag-off regression, both projects) | **22/22 pass** — zero default-path regression |
| `_s106-prospector-boot-probe` (plain boot, both projects) | **2/2 pass** — zero console/page errors |

**Lockstep numbers** (fresh `artifacts/mp-02/identity.json`): both clients (Alice/Bob roster) advanced to **tick 530** with **byte-identical per-tick hashes** at every 30-tick checkpoint (30…530); tickRate **35.1**, latency **79ms**, buffered 2, desyncs 0.
**Resync proof** (`desync-resync.json`): injected desync → **2 desyncs / 2 resyncs**, ended `paused:false` (recovered), tickRate 28.2, latency 85ms.

## Findings
- **F-mp02-1 (NON-BLOCKING, harness):** the spec's `beforeAll` boots a wrangler-dev relay for BOTH playwright projects, persisting to a shared dir `test-results/mp-02-relay-state/room-worker`. Running desktop + mobile in one `playwright test` invocation spins two workerd instances on the same persist SQLite → `NOSENTRY database is locked: SQLITE_BUSY` and both fail at `startRelayEnv`. Run **per-project** (or serially) and it is green (proven above). Does NOT affect the shipped feature (flag-gated, display-safe) or any other suite. Cheap fix for a later spec-refinement task: project-scope the persist dir (append `testInfo.project.name`) or gate the relay boot to desktop-only. Filed as a note, not a blocking corrective — MP-02 merges.
- Where the PLAYER sees this in a plain boot: **nowhere** by design — the entire path is `?mp=dev` gated (MP-03 owns player-facing presentation). The Debug-Gate-Leftover rule (Mistake #10) is satisfied: this is explicitly a dev-flag slice, and the boot probe confirms the flag-off game is unchanged.

## Merge classification
CLEAN single-base graft: `git checkout lane/perf -- <7 paths>`; post-graft `git diff lane/perf -- <7 paths>` = EMPTY (merged == lane). STATUS.md + tasks/BACKLOG.md deltas in `main..lane/perf` were **MAIN-MOVED-ONLY** (s237 commits after the merge-base) → NOT copied.
