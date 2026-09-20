# Gold Rush — September 8 review repairs

Status: READY-FOR-GATES. All six repairs and independent-review follow-ups are implemented and verified within the coverage below. Broader baseline failures and the incomplete fixture rerun remain explicit. This is the repair record for F-CR0908-1 through F-CR0908-6 in `reviews/sol-findings-code-review-20260908.md`; the original report and reproductions are retained. Working branch `sol/code-review-20260908`, base `d41ab98ce0d7fbc48bb01e8e87c92c61f148de2d (archive: pruned by the A3 rewrite)`. Nothing has been committed, pushed, merged, deployed, or applied to live player data.

## Repairs

| Finding | Root correction | Regression evidence |
| --- | --- | --- |
| F-CR0908-1, P1: first-sign-in account race | `_accounts.ts` resolves identity through the SQLite unique-key operation or a scoped SQLite-backed Durable Object. The registry preserves imported random IDs, admits no KV fallback, and requires explicit bootstrap. Deletion conditionally retires one registration generation. | `scripts/review-account-creation.test.mjs`: actual SQLite connections and local workerd, forced overlapping verification, both successful sessions' saves visible after later sign-in, normalized email aliases, legacy IDs, account isolation, random replacement generations, stale-token controls, scoped registries, bootstrap refusal and outage behavior. |
| F-CR0908-2, P1: mixed-room desync blind spot | `LockstepClient.ts` captures the actual simulator peer IDs for each sampled tick before asynchronous snapshot compression; thin seats cannot satisfy or delay browser quorum. | `scripts/review-mixed-hashes.test.mjs`: 19 arrival-order, room-mode, wrong-peer, membership-change and async-encoding cases. |
| F-CR0908-3, P2: terminal views eject host | `Game.ts` keeps the relay interval for terminal views, preserves send clocks through immediate secured-run reset, and retains the terminal receipt until every current thin seat receives it once. | `scripts/review-terminal-views.test.mjs`: real relay callbacks and production Game/RunManager methods with two staggered seats, death and secured endings, exact deadlines and subsequent endings. Original HEAD fails the negative control. |
| F-CR0908-4, P2: wrecked arsenal turrets still fire | `BuildSystem.turretPosition` exposes only operational origins. E7 uses indexed slots and operational signal nodes, preserving relay identity when earlier slots become wrecked; E6/E9 share the same getter. | `scripts/review-wrecked-turrets.test.mjs`: actual projectile creation before wreck, no new shots after wreck/suspension, funded repair restores fire, stable E7 IDs, research/epoch/solo controls. Ruins remain occupied for repair. |
| F-CR0908-5, P2: solo retention evicts party results | `standings.ts` partitions its existing bounded retention by rotation and rider count. Legacy rows remain solo. | `scripts/review-party-retention.test.mjs`: party sizes 1–4, top/newest bounds, champion/replay survival, archived seasons and rotations. Existing standings harness: 320 KV + 320 SQLite checks. |
| F-CR0908-6, P2: default manual-save label refused | `SaveSlots.ts` uses an allowed hyphen delimiter instead of a comma. Validation policy is unchanged. | `scripts/review-save-names.test.mjs`: default save/readback, 112 legal town/wave combinations, invalid/reserved/profanity/duplicate controls. Real desktop/mobile clicks persist one default slot with zero page/console errors. |

Run all six focused checks with `npm run test:review-fixes` using Node 26.4.0. The final aggregate run passed all 28 tests, including both account backends and the review follow-ups. The new account fixture also leaves no temporary account directories. Logs are in `artifacts/sol/code-review-fixes-20260908/`.

## Independent review and follow-through

A fresh security reviewer found that a registry outage could occur after destructive account cleanup. Root reproduced it against the actual handler, then corrected the ordering: registry readiness is checked first, and session deletion follows successful retirement. New failure-injection checks preserve all data on a missing/offline/unready registry and retain retry authorization if retirement fails after preflight. No other actionable allocation bypass was reported. Cross-backend deletion is not atomic; the remaining failure semantics are explicit in `docs/ops/account-registry.md`.

The independent read-only Codex CLI review found that the owning account-sync Playwright fixture lacked the new registry dependency. The fixture now reuses `scripts/test-accounts.mjs --serve <port>`, which boots and binds a private local registry and shuts down its owned processes. Existing e2e specs remain unchanged. Its API-only readiness/verification/teardown check passes. All 18 existing browser cases are accounted for: 9 passed, 8 failed identically with HEAD application sources, and 1 intentional mobile skip. A separate desktop/mobile UI/API lifecycle smoke passes sign-in, upload, signout/relogin with stable identity, wipe/restore of exact town/science values, and deletion with old-token rejection; zero console/page errors. See `security-review.md` and `independent-codex-review.log` in the evidence directory.

The code changes rotate the replay corpus. The current owner-ratified ADR-004 permits early-release mechanics corrections in the same era, superseding the historical owner-gated hash question. `assets/engine-era.json` appends pin `8bc803d424f594ee3ba77a02cbef06a9456599f4d05443f0ab094d27c82cf50d`, retains every prior pin/history record, and states the behavioral correction honestly. Both engine/bench guards pass (9 tests). This is not an era change.

## Verification ledger

- Final production build passed (`build-final.log`); TypeScript, Vite, and asset diet all exit 0.
- Final focused six-fix aggregate: 28 passed; account fixture cleanup verified with an isolated TMPDIR.
- Existing account API harness: 43 KV + 43 SQLite checks passed.
- Existing standings API harness: 320 KV + 320 SQLite checks passed.
- Existing multiplayer relay harness: 466 assertions passed.
- Engine identity/bench seed guards after the pin: 9 passed. The focused command is rooted in `test:node-guards`; final gate-caller audit passes.
- Default manual-save browser proof: desktop 1280×800 and mobile 390×844 each persist exactly one untouched default save, zero page/console errors.
- Targeted browser checks: 58 passed, 4 baseline-matched failures, 10 intentional mobile exclusions across 72 cases. All serial-skipped cases were attempted separately. Failures: E9 Cure-Arms on both viewports; four-rider zero-desync assertion (one successful recovery on both versions); Town invite fixture clears its staged sessionStorage join during navigation. Details and controls: `targeted-browser/summary.md`.
- Account browser checks: 9 passed, 8 baseline-matched failures, 1 intentional mobile exclusion across 18 cases. Six failures are duplicate status-chip locators; two assume first boot makes no storage writes. Separate real UI lifecycle smoke passes on both viewports. Details: `accounts-browser/report.md`.
- Broad Node regression initially executed 742 tests: 728 passed, 8 failed, 1 cancelled, 5 skipped. The explicit 20-file tail added 123 tests: 121 passed and 2 baseline-matched tape-admission failures. Final targeted reruns and attribution are recorded in `node-regression/summary.md`; the original aggregate is not represented as green.
- All six independently executed follow-on commands passed: ticker stats, findings state, blocker panel, ruling propagation, desk declaration, and NUL audit. The existing package command passes 20 test filenames as desk-declaration arguments instead of executing them; those tests were run explicitly, and unrelated package wiring was left unchanged.
- Full default browser run completed with one worker and fail-fast: 42 passed, 1 failed, 3,305 did not run (3,348 collected). `058-device-tiers.spec.ts:209` fails the render-only tier comparison because heroY differs; original HEAD produces the exact same assertion and values (`full-browser-attribution.json`). This is not a completed or green full regression suite. Earlier interrupted serial/parallel diagnostics are retained separately.
- `scripts/fire.md` and `scripts/law-pointer-baseline.json` contain coordinate-only rebases for moved Game and account guards; their underlying law fingerprints remain unchanged. No substantive operating rule was changed.

## Deployment handoff

The fixes are local. Before deploying the Cloudflare account path, follow `docs/ops/account-registry.md`: stop every old identity writer, obtain and independently reconcile the complete private legacy-account export, deploy the registry, import into the correct namespace scope, confirm count/digest and old-save access, then deploy the scoped Pages binding and reopen account routes. Do not initialize an empty registry from an uncertain KV absence. SQLite needs no separate identity migration.

At deployment, assess affected browser-combat standings for re-assay under ADR-004. Preserve original first-secure receipts and retired history. The current headless simulator does not instantiate the same E6/E7 arsenals or tick the E9 socket, so do not assume every E6–E9 headless standing is affected. No live re-assay was performed by this task.

No STATUS, backlog, ratified spec/ruling, existing e2e spec, or git history was changed.
