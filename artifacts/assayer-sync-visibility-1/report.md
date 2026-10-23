# Assayer sync visibility — implementation READY-FOR-GATES; commit blocked

Implemented the authorized F-SRV-3 slice. Both sync halves now retain diagnostics in a private temporary file, identify the failing half and exit codes, print the last ten scrubbed lines, and remove the temporary file. A failed mid-step sync records the published build and UTC timestamp in `~/.goldrush/assayer-drift`; a successful sync removes the marker. The watcher uses its existing notification/log alert and a separate wall-clock timestamp: immediate alert, then once per 3600 seconds while the marker persists, reset after recovery. Status/dashboard formatting remains unchanged (alert-only option). The mirror allowlist and Pages publishing are unchanged.

## Root cause and boundaries

The confirmed visibility defect was discarded rsync/ssh stderr and a one-time log warning with no persistent health signal. The original remote failure cannot be reconstructed and is not claimed fixed. Existing missing-host/unreachable prechecks remain outside the changed mid-step block. No real SSH or deploy was executed: fixture rsync/ssh binaries handle all new sync tests. Existing deployment contracts use their own offline fixtures/local servers.

## Pre-flight and adaptations

- Started on `sol/open-findings-astra`, HEAD `4cd9cfc6124c059dcee55f1e0d8860dcc45d7af0`; clean worktree, zero ahead commits, no artifacts discarded or resets needed.
- Baseline `npm run build`: exit 0 before edits. Followed the task's explicit no-install restriction over its contradictory generic install pre-flight; no npm install/ci. The observed node_modules was a directory, not the described symlink.
- `scripts/attended/droplet-maintenance.sh` is absent in the lane; read the primary checkout's reference, including rollback-directory sync and sequential service verification. No edits to that script.
- `scripts/edge-probe-json.test.mjs` is absent in the lane; ran the existing `edge-probe-composite-guard.test.mjs` instead. This is a named-check availability gap, not a claimed pass of the absent test.
- Read the dashboard and edge fixtures; selected the explicitly permitted alert-only option to preserve output parsing.
- Read the vault's relevant deployment-drift note. No vault write: the task's TOUCH-ONLY firewall outranks the general knowledge-write instruction. Durable findings are recorded here.

## Verification

All commands completed with exit 0:

- `bash -n scripts/deploy.sh` and `bash -n scripts/health-watch.sh`.
- `node --test scripts/assayer-sync-visibility.test.mjs`: **4/4**. Both failure halves, ten-line tail, IPv4/IPv6 scrubbing, short circuit before SSH on rsync failure, marker lifecycle, real alert function with notification stub, 3599-second silence/3600-second alert and recovery reset. Production blocks are extracted verbatim; no deployment setup runs.
- `node --test scripts/gate-caller-audit.test.mjs scripts/edge-alarm-clock-guard.test.mjs scripts/edge-probe-composite-guard.test.mjs scripts/deploy-budget.test.mjs scripts/deploy-mirror-allowlist.test.mjs`: **90/90**, existing tests unmodified.
- `bash scripts/test-deploy-contract.sh`: **15 PASS cases**, plus default retry schedule check.
- `bash scripts/test-deploy-site-contract.sh`: **7 scenarios PASS**.
- `npx tsc --noEmit`; final `npm run build`.
- `git diff --check`; `git diff --exit-code -- src`; guard appears exactly once in `test:node-guards`.

The baseline and final src tree hash is `2919de18adcba0acaad94a780ef91b1f9fcf8ebf`. Build retains existing Vite config/chunk-size and asset conversion warnings. Evidence: `new-guard.txt`, `guards.txt`, `deploy-contract.txt`, `deploy-site-contract.txt`, `tsc.txt`, `build.txt`. No evidence test copies were saved as executable test files.

## New FAILED output from fixture

```text
ASSAYER SYNC FAILED mid-step: half=rsync rsync exit=23 step exit=23; droplet may be mixed-state — run the runbook sync by hand before trusting fresh verdicts
  diagnostic-3 <ip> <ip> <ip>
  diagnostic-4 <ip> <ip> <ip>
  diagnostic-5 <ip> <ip> <ip>
  diagnostic-6 <ip> <ip> <ip>
  diagnostic-7 <ip> <ip> <ip>
  diagnostic-8 <ip> <ip> <ip>
  diagnostic-9 <ip> <ip> <ip>
  diagnostic-10 <ip> <ip> <ip>
  diagnostic-11 <ip> <ip> <ip>
  diagnostic-12 <ip> <ip> <ip>
```

## Remaining list in order

1. Orchestrator must resolve the pre-existing lane Git index lock, then path-scope and commit the completed changes. Both git add and git commit returned exit 128: `.git/worktrees/lane-a/index.lock` already exists. The empty lock is dated October 20 21:44; lsof reported no open owner. No lock removal or metadata repair was attempted because it is outside the TOUCH-ONLY firewall.
2. Orchestrator gates/integration; the specifically requested edge-probe-json guard is unavailable at this lane baseline.
3. Any live deployment or remote repair remains attended-owned and was not authorized for this task.

All implementation items are complete, but no delivery commit was created. Changes remain in the worktree; starting HEAD is `4cd9cfc6124c059dcee55f1e0d8860dcc45d7af0`. This is not a no-op: the implementation and evidence are preserved at the authorized paths.

## s3307 integration update — 2026-10-23

The earlier commit-blocked remainder is superseded: the verified stale index lock was preserved, delivery committed as 4fe2becb802a78136f3a5e4256897c2c8154e563, and the drain accepted in reviews/assayer-sync-visibility-1.md. Current-main edge-probe-json checks passed within the 126-test targeted battery. The original report above remains the implementer's completion record.
