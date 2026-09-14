# Gold Rush code review — saves, simulation, and multiplayer

Reviewed commit: `d41ab98ce0d7fbc48bb01e8e87c92c61f148de2d`.
Review branch: `sol/code-review-20260908`. Date: 2026-09-08.

**Verdict: six confirmed correctness defects, including two P1 findings.** Application code and existing tests are unchanged. This is a source review with focused reproductions, not an exhaustive audit or release approval. No merge, commit, push, or deployment was performed.

## F-CR0908-1 — P1: Concurrent first sign-ins can strand a family's cloud saves

**Location:** `functions/api/_accounts.ts:459–470`, especially the random account ID at line 465.

Two devices verifying the same family's first login can both read an absent email-to-account record. Each creates a different account ID and a valid session; the last account write wins. Both sessions can successfully save, but the losing account's saves cannot be found through a subsequent email login. The sign-in form's busy state cannot serialize requests from different devices.

The reproduction executes the actual request-code, verify, push-save, and pull-save handlers against an isolated asynchronous storage adapter, deliberately overlapping the account reads. Both logins return HTTP 200 with different account IDs. A save through the losing session is acknowledged; a later login receives HTTP 404 when attempting to recover it. No production account or service was contacted. The source routes accounts to Cloudflare Functions (`src/app/GameApi.ts:1–4`); the proof exercises the asynchronous storage contract, not a deployed concurrency test.

**Correction:** serialize account creation and code consumption per email at the authoritative storage boundary, preserving existing account IDs. Successful concurrent logins must resolve to the same durable account.

Evidence: `account-race-repro.mjs`, `account-race-verified.log` in the evidence directory below.

## F-CR0908-2 — P1: Adding an agent disables desync detection between browsers

**Location:** `src/mp/LockstepClient.ts:678–684`, especially the quorum at line 681.

Hash comparison waits for `roster.length - 1` remote hashes. In a mixed room, the agent deliberately sends none (`src/sim/SeatedLockstepSim.ts:178`). With two browsers and one agent, each browser therefore waits for a second hash forever, even when the other browser has already supplied a contradictory hash. Diverging simulations continue without detection or recovery. MP-07c explicitly requires browser-to-browser hash detection to remain intact (`specs/multiplayer/mp-07c-agent-rides-the-browsers-world.md:18`).

The actual client methods report `desyncs: 1, paused: true` for two contradictory browser hashes. Adding a headless roster member to the identical test changes the result to `desyncs: 0, paused: false`.

**Correction:** derive the expected hash-producing peer IDs from the room mode. Compare browser peers in mixed rooms and retain all-seat comparison in headless-only rooms; ignore hashes from seats outside that expected set.

Evidence: `multiplayer-repro.mjs`, `multiplayer-verified.log`.

## F-CR0908-3 — P2: A terminal agent update can eject the browser host

**Location:** `src/game/Game.ts:3774–3776`.

Terminal views bypass the client's two-second interval, while `functions/api/_multiplayer.ts:467` enforces that interval for every view. If the run ends within two seconds of a preceding view, the relay rejects the terminal packet with `view_rate_limited`. Its socket error handler removes the host and closes the connection with code 1008 (`_multiplayer.ts:238–246`). The agent never receives its terminal result. A fast response to a pending-secure view is a normal way to reach this boundary.

The reproduction executes the production Game method extracted without changing its logic, the actual room admission, and the actual socket callback. Only the view builder and transport are fixtures. A terminal view 1,000 ms after the preceding view produces `terminalDelivered: false`, `view_rate_limited`, close code 1008, and a roster containing only the agent.

**Correction:** retain the terminal receipt until the relay interval permits delivery. Do not mark it delivered or clear its pending state before sending it lawfully.

Evidence: `multiplayer-terminal-repro.mjs`, `multiplayer-terminal-verified.log`.

## F-CR0908-4 — P2: Destroyed turrets retain functioning later-era weapons

**Location:** `src/systems/BuildSystem.ts:775–776`; related position list at lines 1939–1945.

A wreck keeps its pool slot occupied for its ruin. `turretPosition()` checks that occupancy, so it still supplies a weapon origin at zero HP. Wreck teardown unregisters the ordinary turret shooter, but E6 Sunline Mount and E9 Storm Lance independently registered their shooters and gate them on this position. E7 Beam Relay similarly consumes the occupied-position list, which includes ruins. Game passes these sources directly at lines 1692, 1705, and 1755; the surrounding epoch/research gates do not check turret health.

Consequently, an unlocked solo-play weapon can continue operating from an indestructible ruin without repair. This contradicts the ruin's required “function OFF” behavior in `specs/m2-base-waves/slices/05-base-damage-and-repair.md:13`.

The reproduction instantiates the actual arsenal classes and calls the actual building damage → wreck → teardown path on a minimal pool fixture. HP changes from 50 to 0 and the building target becomes inactive, but all three mounted shooter handles remain enabled at the ruin's position. This establishes shooter availability, not a rendered firing sequence. The E7 fixture uses its actual fallback mode, available in later eras when the E7 signal system is disabled.

**Correction:** use operational turret positions for weapons and relay nodes while preserving occupied ruin positions for placement. Verify that wreck disables each weapon and repair restores it.

Evidence: `wrecked-arsenal-repro.mjs`, `wrecked-arsenal-verified.log`.

## F-CR0908-5 — P2: Solo submissions can delete another party size's champion

**Location:** `functions/api/standings.ts:1166–1172`, especially line 1169.

The display ranks each party size separately, but retention partitions only by rotation. It then retains a combined top 100 and the newest 100 remaining rows. A duo champion with a lower score than the solo top 100 becomes an expendable leftover and can be permanently evicted by unrelated solo traffic, including its replay. This violates the party independence stated at lines 623–625 and the top-100-per-contract-and-party contract in `specs/agent-play/assay-worker.md:34`.

The actual endpoint reproduction starts with 199 solo rows and one older verified duo champion. The duo board initially returns rank 1. A single accepted solo submission empties the duo board and removes its tape from storage. Each fixture tape passes the actual stored-tape validator.

**Correction:** apply retention independently to each rotation × party-size partition, matching the ranking boundary.

Evidence: `party-retention-repro.mjs`, `party-retention-verified.log`.

## F-CR0908-6 — P2: The prefilled manual-save name is always rejected

**Location:** `src/game/SaveSlots.ts:175–180`, especially line 176.

The default name appends `, wave N`, but `NAME_RULE` at line 18 excludes commas. Game passes the default directly into the pause-menu input. Clicking Save without editing the suggested name always produces a validation error and creates no manual slot.

An actual browser run completed wave 1 and reproduced this on 1280×800 and 390×844 viewports: `Quartz Hill, wave 1` was rejected, leaving zero manual saves. Changing the name to `Quartz Run` created one slot. Both runs recorded zero console and page errors. Existing save-slot tests replace the input before submitting, so they do not cover this default action.

**Correction:** generate a name accepted by the same validation rules and cover submission of the untouched default.

Evidence: `manual-save-repro.mjs`, `manual-save-verified.log`, `manual-save-results.json`, and `save-default-{1280,390}.png`.

## Verification and boundaries

Evidence directory: `artifacts/sol/code-review-20260908/`.

| Check | Result |
| --- | --- |
| Initial tracked working tree | Clean, detached at the reviewed commit |
| Dependency preparation | `npm ci --ignore-scripts --no-audit --no-fund`, success |
| Production build | `npm run build`, exit 0; includes TypeScript, Vite, and asset diet |
| Existing profile storage guard | 6 passed, 0 failed |
| Six retained reproducer scripts | Each confirms its described defect; run receipts are retained |
| Manual-save browser scenario | Reproduced on both viewports; valid-name control succeeds; zero console/page errors |
| Source / existing tests | Unmodified |

Run the retained scripts from the repository root using Node 26 and the installed dependencies. For example:

```sh
node artifacts/sol/code-review-20260908/account-race-repro.mjs
node artifacts/sol/code-review-20260908/multiplayer-repro.mjs
node artifacts/sol/code-review-20260908/multiplayer-terminal-repro.mjs
node artifacts/sol/code-review-20260908/wrecked-arsenal-repro.mjs
node artifacts/sol/code-review-20260908/party-retention-repro.mjs
node artifacts/sol/code-review-20260908/manual-save-repro.mjs
node --test scripts/profile-data-key-sweep.test.mjs
```

These are diagnostic reproductions: **exit 0 means the defect was reproduced**, not that the behavior is correct. The manual-save script starts its own Vite server on port 5318 and uses installed Chromium; the other scripts use local source modules and isolated fixtures. Screenshots and browser JSON written by reruns go to `/tmp/gold-rush-review-20260908/`.

The initial account repro logged a Vite dependency-scan warning during teardown; the retained version disables discovery and passed again. The first portability rewrite of the browser harness used an incorrect CommonJS import; that harness-only failure is retained, and the corrected script was rerun. Neither failure is classified as a game defect.

Reviewed areas included gameplay action/weapon lifecycle, profile storage and transfer, account handlers, room input/hash/view flow, and standings retention. The full gameplay regression, live services, actual network timing, release-specific build, and complete renderer/performance review were not run. The bounded Economy log was an unvalidated lead and is not included as a finding.

## Previously recorded limitation

The multiplayer probe also reconfirmed **F-SOL-ACTION-002**, already documented in `reviews/sol-findings-lockstep-actions.md:12`: different local progression prevents family members from joining the same room. Its host-setup and per-player payout ownership decision remains distinct from the six findings above. No new ruling or implementation was inferred.

READY-FOR-GATES — review artifacts only. Fixes and their regression checks remain to be implemented through the project's normal task flow.
