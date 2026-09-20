# Account registry landing evidence

Status: READY-FOR-GATES for review of the scoped implementation; **full-battery acceptance is not green**. The individual required suites, build, mutation proof and independent review passed. Broad guard failures are recorded below and remain for the orchestrator.

Task: `tasks/running/lane-b--20260919-190544-sol-account-registry-land.md` in the main worktree. Working branch: `sol/account-registry-land`. Base: `821bff7e915bef5c774193e2611b4726317b45ca`. Node: **26.4.0**, Wrangler: **4.107.0**. All application test requests stayed local; no Cloudflare deployment, secret operation, remote KV read/export, D1 operation or droplet access was performed. Commands in the operations document are instructions for a later owner-run migration.

## Preflight and scope

- No commits ahead of main at preflight; no branch reset or history edit needed. The runner owns the eventual commit/integration.
- Discarded **119** preexisting untracked generated CPU profiles under `artifacts/perf-survey/profiles/`, as authorized by the evidence-artifact exception. Exact paths: `discarded-evidence.json`.
- `npm install --no-audit --no-fund`: exit 0. Initial `npm run build`: exit 0. `git status --short` was empty after baseline build and before edits; see `preflight.txt`, `install.log`, `baseline-build.log`.
- The permitted shared source files were byte-identical between the lane base and current main when reconciled. The b9fe source tree was read only.
- No edits to existing test assertions or fixtures were needed. `scripts/test-accounts.mjs` and `scripts/review-account-creation.test.mjs` are unchanged, as are the multiplayer/stats scripts and all game/simulation files.

## Reconciliation, hunk by hunk

| Surface | Reconciled result |
| --- | --- |
| `functions/api/_account-registry.ts` | Recovered the complete 111-line b9fe worker by content. SQLite-backed DO with unique email/account IDs, atomic resolve, generation-checked retirement, transactional bootstrap receipt, per-namespace scope, and authenticated public bootstrap/status only. Source unchanged from the recovered implementation. |
| `wrangler.account-registry.toml` | Recovered worker entry point, binding and `accounts-01` SQLite migration declaration by content. Creating this file runs nothing. |
| `_accounts.ts` types | Added optional SQLite atomic methods, the registry binding/scope types and exported `AccountRecord`. No unrelated API type changes. |
| `_accounts.ts` verification | Replaced non-atomic KV get/put with the SQLite atomic owner or a registry resolve. Registry failures return 503; no KV fallback and no deterministic email-derived IDs. Resolution precedes code consumption, session revocation and new-token publication. |
| `_accounts.ts` deletion | Registry readiness is checked before save cleanup. Retire only the authenticated account generation; revoke sessions after successful retirement. Preserve retry sessions on remote failure. Delete legacy KV account copies only in the KV path; SQLite already retired the exact row. |
| `_accounts.ts` registry transport | Added scoped binding-only `status`/`resolve`/`retire` calls, with missing binding/scope, transport failures and non-success responses mapped to `account_registry_unavailable`. |
| `server/ledger/storage.mjs` | Recovered only the two held methods: unique-key INSERT-on-conflict resolution and account-ID-checked DELETE retirement. Existing storage schema, saves and other methods unchanged. |
| `wrangler.toml` | Reconciled the held Pages binding as a **commented deployment-day block**, with scope deliberately unset. This preserves the closed gate and avoids breaking routine Pages deployments before the worker exists. Owner enables both only after verified bootstrap. Existing bindings unchanged. |
| `scripts/bootstrap-account-registry.mjs` | Task assumed it might be missing, but it already existed on main. Extended it with the requested offline dry-run, count/record/hash/uniqueness/size validation before networking, redirect rejection and a bounded live request. Live mode still requires `--source-quiesced`; dry-run emits no readiness claim or account records. |
| `docs/ops/account-registry.md` | Preserved the recovered identity/concurrency rationale and five migration prerequisites; supplied owner-run commands, independent verification and rollback for each step, with landed-versus-deferred status at the top. |

## Closed-gate proof

The task's phrase “exactly as main today” needs a precise boundary: baseline main has no configured `ACCOUNTS` binding, and the **unconfigured** `/api/verify` and `/api/delete-account` status/body remain byte-equivalent (`503 sign_in_not_enabled`). With an explicitly supplied KV fixture, baseline still uses the old allocator. This landing intentionally replaces that path with the required closed registry gate; preserving the old KV fallback would contradict the task's core acceptance condition.

`closed-gate.test.mjs` loads both the recorded baseline and the actual changed handlers. It verifies unchanged unconfigured responses, then verifies both handlers with: absent binding+scope, absent binding only, absent scope, unreachable registry, and a real unopened local workerd registry. Each rejected request returns `503 account_registry_unavailable` and preserves a byte-for-byte snapshot of identity, existing save, session and retry code. The code fixture requests session revocation, so the verification test also catches revocation occurring before readiness.

Manufactured defects are confined to temporary module copies; production source is never mutated:

1. `GR_REGISTRY_MUTANT=kv-fallback` restores main's old KV allocator. All **five verify cases fail** with `200 !== 503`; all deletion cases and the unconfigured baseline comparison still pass. Command exit **1**, expected. Transcript: `mutant-kv-fallback.log`.
2. `GR_REGISTRY_MUTANT=delete-before-readiness` moves save deletion ahead of readiness. All **five delete cases fail** on the exact data snapshot, even though the response remains 503; verification cases pass. Command exit **1**, expected. Transcript: `mutant-delete-before-readiness.log`.

The existing unchanged `review-account-creation.test.mjs` separately proves parallel first-login convergence, preservation of imported legacy IDs, namespace isolation, conditional retirement, old-token isolation from replacement saves, save-cleanup failure, and a remote retirement failure after readiness.

`bootstrap-dry-run.test.mjs` installs a fetch function that throws if called. Empty and populated valid exports pass without URL/secret/scope configuration; the input file stays byte-identical. Wrong count/hash, duplicate emails/IDs, excessive record count/size, and missing live-mode acknowledgement are rejected locally. Dry-run never emits `ready:true` or account records.

## Verification

All test commands use `/opt/homebrew/bin` first on PATH. Local Wrangler calls use `WRANGLER_SEND_METRICS=false`. Tests that normally regenerate account/multiplayer evidence use `GR_GUARD_NO_ARTIFACT=1`.

| Check | Result | Transcript |
| --- | --- | --- |
| Baseline install/build | PASS, exit 0 | `install.log`, `baseline-build.log` |
| `tsc --noEmit` | PASS, exit 0 | `tsc.log` |
| Final `npm run build` | PASS, exit 0 | `build.log` |
| `npm run test:accounts` | PASS, **43 KV + 43 SQLite** checks | `test-accounts.log` |
| `node --test scripts/review-account-creation.test.mjs` | PASS, **3/3** tests | `review-account-creation.log` |
| `npm run test:mp` | PASS, **466** checks | `test-mp.log` |
| `npm run test:stats` | PASS, **87 stats + 320 KV standings + 320 SQLite standings + 26 ledger HTTP** checks | `test-stats.log` |
| Closed gate + bootstrap dry-run | PASS, **13/13** tests | `closed-gate-final.log` (also initial `closed-gate.log`) |
| Manufactured KV fallback | Expected FAIL, five verify assertions reject it | `mutant-kv-fallback.log` |
| Manufactured early deletion | Expected FAIL, five snapshot assertions reject it | `mutant-delete-before-readiness.log` |
| `run-guards.mjs --changed-since 821bff7e915bef5c774193e2611b4726317b45ca` | **FAIL, 4/8 guards; exit 1** | `run-guards.log`, `guard-stats-serial.jsonl` |
| Runbook shell + embedded Node syntax | PASS, parse only; no remote commands executed | `doc-command-check.log` |
| Independent read-only review | PASS, no actionable material findings | `independent-review.md`, `independent-review.log` |

The initial concurrent multiplayer run failed because another local Wrangler fixture held inspector port **9229** (`test-mp-port-collision.log`). Once concurrent workerd tests finished, the unchanged multiplayer suite passed serially. The guard runner serializes its top-level suites; the default Node suite still runs many files concurrently. That first broad run was stopped after documented child timeouts in unchanged agent-reel/assay-replay tests under host load 98.31 / 109.28 / 69.05. Its partial TAP, start transcript and exact owned-process termination record are retained in `node-guards-initial-progress.tap`, `run-guards-contended.log` and `run-guards-abort.json` (exit 143, intentionally aborted after real failures). The full battery was retried with the repository-supported `CLAUDE_CONFIG_DIR=/Users/robin/.claude` serial-file mode; no assertion or timeout was changed. Only the verified process tree started by this task was stopped. In the serial run, the Node suite reached its unchanged 900-second outer bound; the power-budget check then failed at p95=154.215 ms. A check for surviving owned Node-suite processes, using its exact unique TAP destination, found none after that timeout.

## Owner deploy-day needs and next-agent handoff

Read `docs/ops/account-registry.md` before any rollout. The owner must supply the actual namespace/deployment inventory and maintenance control, quiesce **every** identity writer including previews and in-flight requests, independently verify a complete private export, deploy the worker and set its private migration secret, bootstrap with a matching receipt, then enable matching Pages binding/scope and smoke-test legacy saves before reopening. Remove the public migration secret afterward. This task has not performed or authorized those operations.

The repository cannot automate an unknown external maintenance topology: step 1 explicitly names that owner prerequisite and provides only a verification probe, not a fictitious universal stop command. Local Wrangler help and installed pagination implementation were inspected to verify the documented CLI shapes and full cursor traversal. Live environment settings and remote behavior remain unverified.

No atomic transaction spans KV saves, sessions and the registry. Post-readiness failures can partially delete saves; ambiguous retirement may require signing in again. These limitations are preserved in the runbook and were not expanded into unrelated authentication/session work.

## Broad-gate blockers outside the account slice

The broad battery finished **4/8 green (exit 1)** and has not satisfied its green acceptance criterion. Passing guards: multiplayer, task guards, citations and gate callers. Failing guards: Node suite, power budget, stats and accounts. The retained serialized TAP includes:

- `scripts/assay-replay.test.mjs:183`: overtime replay exceeds its existing 240,000 ms timeout. The earlier first replay and agent-reel timeout cases pass in serialized mode. Replay tests, the headless runner and all `src/` files have zero diff against the task base.
- `scripts/claim-boat-asset.test.mjs:8` and `:29`: missing `assets/raw/claim-boat-material-atlas.png` and `assets/raw/flotilla-material-atlas.png`. Both are tracked at the base, marked **S / skip-worktree**, and absent on disk. Their tests are unchanged. The task explicitly forbids touching assets; none were hydrated or altered.
- The broad Node suite ultimately reaches the existing 900-second runner bound, and the broad power-budget check reports p95=154.215 ms under the busy host. No simulation or budget source was changed.

The broad stats and accounts reruns failed before any behavioral verdict because their local Pages/Wrangler fixtures did not become ready. This differs from the earlier complete individual runs, which passed on the same production source. Both results are retained; the earlier passes do not override the red broad battery.

Use `node-guards-serial-progress.tap` for retained test-level evidence and `run-guards.log` for the final top-level matrix. These failures are not waived. Re-run on a complete checkout and a quiet test host; investigate any replay/performance failure that persists before integration. Do not interpret the focused green suites or READY-FOR-GATES handoff as approval to deploy or as a fully green repository battery.

Factory churn: `logs/task-stats.jsonl` changed from 799 tracked rows to an empty file while checks were running. Attribution is unverified; it was not manually edited, restored or staged by this task. It is excluded from the deliverable under the task's explicit `logs/**` churn exception. No commit was created; the runner/orchestrator owns integration. `source-verification.json` records the final production-file hashes and unchanged existing test scripts.
