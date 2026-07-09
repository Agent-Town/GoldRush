# Sol findings — AI, accounts, and trust boundaries

- **Branch:** `sol/repository-audit-findings`
- **Base:** `7802ed6`
- **State:** UNTRIAGED — no implementation authorized.
- **Scope:** product AI promises, Assay production path, economy authority, account recovery, profile selection, KV concurrency, and telemetry consent/configuration.

## Summary

| Finding | Severity | Backlog overlap | Suggested future branch if accepted |
|---|---|---|---|
| `F-SOL-TRUST-001` Prospector is scripted, not the promised agent runtime | P1 product gap | M4 AgentStub is intentionally shipped; no OpenClaw runtime task found | `sol/bounded-agent-runtime-proposal` |
| `F-SOL-TRUST-002` Assay posting is dev-only and 404s in production | P0 | Backlog calls M5/Assayer live; no production queue route found | `sol/production-assay-queue` |
| `F-SOL-TRUST-003` Economy/tool mutations are not server-authoritative | P1 architecture gap | Brief requires it; no server tool surface task found | `sol/economy-authority-boundary` |
| `F-SOL-TRUST-004` Economy accepts invalid event amounts | P1 hardening | No corrective found | `sol/economy-event-validation` |
| `F-SOL-TRUST-005` Fresh-device sign-in cannot discover cloud profiles | P1 | Accounts v1 active; existing test retains profile knowledge | `sol/account-profile-index` |
| `F-SOL-TRUST-006` Profile selection can queue the prior profile's data | P1 | No corrective found | `sol/profile-session-rebind` |
| `F-SOL-TRUST-007` Account abuse counters are non-atomic | P1 public-readiness | No concurrency corrective found | `sol/atomic-account-rate-limits` |
| `F-SOL-TRUST-008` Telemetry defaults to opt-in without an affirmative choice | P2 / owner | No consent ruling found | `sol/telemetry-consent-ruling` |
| `F-SOL-TRUST-009` Cloud save version rotation is non-atomic | P1 data integrity | No concurrency corrective found | `sol/atomic-save-version-rotation` |
| `F-SOL-TRUST-010` Telemetry dedupe and counters are non-atomic | P2 analytics integrity | No concurrency corrective found | `sol/atomic-telemetry-aggregation` |
| `F-SOL-TRUST-011` Telemetry binding truth contradicts tracked deployment state | P2 operations | Binding mismatch already logged as F-tl01-1 | `sol/telemetry-binding-contract` |

## F-SOL-TRUST-001 — [P1 product gap] The shipped Prospector is a scripted fallback, not the promised AI partner

**Evidence**

- `docs/GOLD_RUSH_BRIEF.md:195-205` requires an in-browser OpenClaw Lite worker, player-supplied LLM, state polling, and transparent tool/debug surfaces; agent decisions must not be faked by backend handlers.
- `src/agent/AgentStub.ts:35-80` implements a deterministic receipt-producing stub.
- `src/game/Game.ts:1153-1178` installs the stub against in-process adapters.
- `src/game/Game.ts:3244-3370` drives XP/gold collection and repair with fixed timers and hard-coded priority loops.
- The scripted behavior is useful and owner-liked; this finding is about product truth, not deletion of the fallback.

**Impact**

The game's strongest differentiator is currently conventional companion automation. Marketing or product decisions that assume a real deliberative agent would overstate what ships.

**Recommendation for triage**

Keep AgentStub as the no-key/offline safety path. Before implementation, write an attended design proposal for a slow, bounded LLM planner over the typed tools—never a combat-tick controller—with explicit latency, cost, privacy, and fallback behavior.

## F-SOL-TRUST-002 — [P0] The Assay Office promises live orders but production has no queue endpoint

**Evidence**

- `src/crafting/AssayBench.ts:62-79` tells the player the Assayer "takes orders now" and exposes a Post button.
- `src/crafting/CraftingQueue.ts:45-81` always calls `/__goldrush/crafting-queue/state` and `/pending`.
- `vite.config.ts:40-105` implements those routes only in `configureServer`, which exists for Vite development, not the production bundle or Pages Functions.
- No matching route exists under `functions/`.
- Production-preview Playwright reproduced: expected status `Posted`, observed `JSON ready (HTTP 404)` at `e2e/m5-04-offline-queue.spec.ts:89-114`.
- A direct production queue-state request returned the SPA HTML rather than queue JSON during the audit.
- `scripts/fire.md:20` shows the Assayer is an external repository fire duty; deployed clients cannot write to that filesystem.

**Impact**

Player intent is lost behind an apparently live feature. Reload cannot turn the failed request into a verdict because nothing persisted server-side.

**Recommendation for triage**

Either hide/label posting as local-operator experimental, or build an authenticated/abuse-bounded persisted queue plus worker/assayer and production readback. The accepted branch must include a production-preview/Pages test, not only Vite middleware tests.

## F-SOL-TRUST-003 — [P1] The brief's server-authoritative economy and HTTP tool contract are not implemented

**Evidence**

- `docs/GOLD_RUSH_BRIEF.md:186-193` describes namespaced HTTP tools with idempotency keys and world deltas.
- `docs/GOLD_RUSH_BRIEF.md:218-224` says gold/inventory mutations should be server-authoritative events.
- `src/agent/ToolSurface.ts:130-173` invokes in-process game adapters directly; there is no network/idempotency boundary.
- `src/game/Game.ts:280-297` constructs the client Economy/Targeting/Combat ownership surfaces.
- `functions/api/_accounts.ts:371-380` validates only ledger-envelope metadata and stores opaque client data; it does not validate game/economy rules.

**Impact**

Cloud save, future co-op, crafted items, and any monetized/shared economy would trust client-authored state. The current architecture cannot provide authoritative idempotency or conflict resolution promised by the design.

**Recommendation for triage**

Do not retrofit a broad backend casually. First decide which mutations truly need authority at the public/co-op gate, then define a minimal event API and migration boundary. Keep solo combat client-side as the brief allows.

## F-SOL-TRUST-004 — [P1] Economy events do not reject negative or non-finite amounts

**Evidence**

- `src/game/Economy.ts:73-99` adds/subtracts the event amount directly.
- `src/game/Economy.ts:215-238` checks only overspend and cap comparisons; negative and `NaN` amounts pass these comparisons.
- `src/game/Economy.ts:241-247` explicitly treats nonpositive income/resource amounts as receivable.
- A negative `gold_spent` therefore increases gold; a non-finite value can poison the state and replay summary.
- Suspend/cloud imports can replay economy logs, increasing the relevance beyond trusted TypeScript call sites.

**Impact**

Core one-writer invariants exist, but the writer itself does not enforce event-domain validity.

**Recommendation for triage**

Reject non-finite and nonpositive mutation amounts at `Economy.apply`, validate replay/import events through the same decoder, and add property-style tests for every event kind.

## F-SOL-TRUST-005 — [P1] Account recovery cannot enumerate the family's profiles on a new device

**Evidence**

- `functions/api/_accounts.ts:142-154` verifies a code and returns token/account metadata without an account-level profile index.
- `functions/api/_accounts.ts:225-255` requires the client to supply a known `profileId` for pull/version operations.
- `src/game/AccountSync.ts:208-216` can pull only the current local profile ID or a profile ID already saved in the browser session.
- On first boot, `src/ui/menu/StartMenu.ts:113-165` presents local profile creation before a recovery path.
- `e2e/accounts-sync.spec.ts:150-190` tests recovery while retaining browser knowledge of the profile ID; it is not a blank-device proof.

**Impact**

The account can authenticate successfully yet cannot discover or restore the whole family's ledgers without preexisting local identifiers.

**Recommendation for triage**

Add an authenticated account-level profile index and a sign-in/recovery entry before local profile creation. Gate with a fresh browser context containing no profile/session storage.

## F-SOL-TRUST-006 — [P1] Selecting a profile can queue sync under stale session identity

**Evidence**

- `src/game/ProfileManager.ts:82-89` changes `activeId` and immediately calls `accountSync.queuePush`.
- `src/game/ProfileStorage.ts:205-207` changes the module-global `sessionProfileId` only through `bindProfileSession`.
- `src/game/ProfileStorage.ts:282-285` prefers a nonempty session profile over the newly active profile.
- Binding occurs when starting the profile (`src/game/ProfileManager.ts:65-68`), not during `selectProfile`.

**Impact**

Export, storage reads, or queued cloud sync between selection and Start can package the previously bound profile.

**Recommendation for triage**

Pass explicit profile IDs through sync/export operations or rebind atomically with selection; remove global precedence from data-boundary code.

## F-SOL-TRUST-007 — [P1 public-readiness] Account abuse counters use non-atomic read-then-write sequences

**Evidence**

- `functions/api/_accounts.ts:126-139` reads and increments verification attempts in separate KV operations.
- `functions/api/_accounts.ts:496-501` implements rate counters as non-atomic get/put.
- Existing harnesses issue these operations sequentially.

**Impact**

Concurrent requests can lose counts and weaken verification or endpoint abuse limits.

**Recommendation for triage**

Move security-relevant limits to one atomic owner such as a Durable Object or transactional store. Add concurrent-burst tests; do not treat security limits as approximate analytics.

## F-SOL-TRUST-008 — [P2 / owner] Telemetry defaults on without an affirmative player choice

**Evidence**

- `src/telemetry/payload.ts:32-38` treats a missing preference or storage error as opted in.
- `src/telemetry/payload.ts:49-56` discloses anonymous stats as an opt-out setting.

**Impact**

For a family-facing game, default-on collection is a product-trust decision that should be explicit and owner-ratified even when payloads are anonymous.

**Recommendation for triage**

Robin decides first-run consent versus opt-out before public release. Keep any implementation branch limited to that ruling and its disclosure/setting tests.

## F-SOL-TRUST-009 — [P1 data integrity] Cloud save version rotation is non-atomic

**Evidence**

- `functions/api/_accounts.ts:180-209` rotates current and prior save versions through multiple independent KV reads and writes.
- Existing account harnesses serialize save operations and do not exercise concurrent writes for the same profile.

**Impact**

Overlapping saves can overwrite the intended current/prior ordering, weakening recovery or presenting an older body as the latest version.

**Recommendation for triage**

Give each profile's version chain one transactional owner and add overlapping-write tests that prove monotonic ordering and recoverable prior versions.

## F-SOL-TRUST-010 — [P2 analytics integrity] Telemetry deduplication and counters are non-atomic

**Evidence**

- `functions/api/telemetry.ts:62-100` performs deduplication and aggregate counter updates through separate KV reads and writes.
- Existing telemetry harnesses issue events sequentially rather than concurrently.

**Impact**

Concurrent events can bypass dedupe or lose aggregate increments, making public stats and product decisions inaccurate.

**Recommendation for triage**

Decide whether bounded approximation is acceptable. If exactness is required, give aggregation one atomic owner; if not, document the error model and keep security or billing decisions away from these counters.

## F-SOL-TRUST-011 — [P2 operations] Telemetry binding truth contradicts tracked deployment state

**Evidence**

- `functions/api/telemetry.ts:41` and `functions/api/stats.ts:53` require `env.TELEMETRY`.
- `tasks/BACKLOG.md:96` already records F-tl01-1: the owner bound the namespace as `ACCOUNTS`, while code reads `TELEMETRY`; the same line later says ingest is unblocked, leaving contradictory deployment truth.

**Impact**

Binding ambiguity can silently turn ingest into a no-op and makes repository evidence insufficient to reproduce the deployment.

**Recommendation for triage**

Deduplicate against F-tl01-1. If anything remains, establish one checked-in deployment binding contract plus a live ingest/readback smoke test; do not create parallel implementation work.
