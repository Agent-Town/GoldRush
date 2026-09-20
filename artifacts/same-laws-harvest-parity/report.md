# same-laws-harvest-parity: gate report (lane/d, attended finish of the codex run)

**Slice**: `same-laws-harvest-parity` (master `tasks/same-laws-harvest-parity.md`, v2: "the player can send the Prospector to a seam too", owner playtest 16, both rulings verbatim in the master). **Branch**: `lane/d`, base `1b08a841e`. **Commits**: `1345067f7` (WIP salvage of the codex run, verbatim) -> `e2f71b671` (finish: touch prompt dismissal, G selects, plain-boot probe, parity artifact, node-guard wiring, skill.md vocabulary) -> this evidence commit (parity JSON, screenshots, this report, BACKLOG row). **Session**: https://claude.ai/code/session_01Rpu6VBzeT24Kk8jHuRHkpQ (2026-09-02). **Codex run**: `tasks/runs/20260902-160427-lane-d-same-laws-harvest-parity.md.log`: 114 min of implementation, then HTTP 401 `token_revoked` in its gate/report phase (the fire's F-2453-3 row describes the death; that row's "re-dispatch" question is closed by this lane: it is a DRAIN candidate).

**Firewall**: `git diff --stat main -- src/sim/HeadlessContractSim.ts src/agent/StandingOrders.ts src/systems/HarvestSystem.ts src/game/Balance.ts assets/engine-era.json functions src/ui/TrueReelRenderer.ts` is EMPTY: nothing to revert. One file outside the master's touch-only list was edited: `package.json`, one token (`scripts/same-laws-harvest-parity.test.mjs` joins `test:node-guards`), because `gate-caller-audit` named the new test as a NEW orphan with no caller; the master asks for the node test, and a test nothing runs is the hole that guard exists for.

## 1. What exists (scope 1-7, file:line on the lane tip)

**Scope 1, the command.**
- Desktop: `src/ui/ProspectorDispatchInput.ts:54-59` (`onClick`): a click on the canvas while the Prospector is selected, or an Alt/Shift-click without selecting, resolves the nearest target and dispatches. Selection = opening the charter once (chip click OR `G`): `src/ui/Hud.ts:406-411` sets `prospectorSelected` (getter `:254`) and `data-selected="true"` on the chip; the ring cue is `src/ui/theme.css:1258`. The selection is sticky for the session (a one-time gate against accidental sends; modifier-click never needed it).
- Touch: `src/ui/ProspectorDispatchInput.ts:61-76`: `pointerdown` with `pointerType === 'touch'` on a seam/sluice starts a 500 ms hold (`HOLD_MS`, `:3`); >12 px of movement or `pointerup` before that cancels it; on the hold the prompt button `[data-testid="prospector-dispatch-confirm"]` "Send the Prospector to the seam|sluice" appears at the touch point (`theme.css:1270`, min-height 44 px); tapping it dispatches (`:88-91`); any new canvas `pointerdown` dismisses a lingering prompt. Touch-originated clicks are ignored by the desktop path (`isTouchClick`, `:98-102`).
- Wiring: `src/game/Game.ts:1727-1732` constructs the input with `() => this.hud.prospectorSelected && !this.buildSystem.isBuildMode`, `prospectorDispatchTargetAt` (`:7579-7597`: ground-plane raycast, nearest active seam or `sluice-N` within 2.2 wu of the pointer's ground point) and `dispatchProspector`; disposed at `:2595`.
- Route (the same `pan_at` path as a rider): `dispatchProspector` `:7519-7526` -> multiplayer: `mpQueuedActions`; solo: `pendingProspectorDispatches` + `recordRunTapeAction` -> at the next tick `:2734-2736` the pending actions enter `mpActionsThisTick` (slot 0) -> `applyMultiplayerActions` `:3299` -> `beginProspectorDispatch` `:7528-7538` (queue FIFO; refused unless `playing` and unpaused) -> `advanceProspectorDispatch` `:7540-7570`, run every sim step right after `prospector.updateSimulation` (`:3012-3013`): the Prospector gets `assignWork(point, 0)`, the exact call a rider's `{ movement }` becomes (`src/agent/Embodiment.ts:133`), walks at `Balance.agent.moveSpeed`, arrives within `Balance.agent.arriveRadius` (0.16), settles (see F-SLHP-1), then `panAgentAt(node)` (`:7558` -> `:7484`, UNCHANGED) grants exactly one pan tick: `Balance.goldSeam.tickSeconds * panTickMult` of harvest, `tickGold` 5, the seam's channel state restored around it, no more.
- Repeated commands: queued and served one per order; measured below: two dispatches on one seam = two ticks one sim tick (1/30 s) apart, exactly as two rider HARVEST orders; the count/rate was measured, not changed.

**Scope 2, discoverability.** `src/story/trailGuide.ts:12,27`: trigger `first-prospector-pan`, line "Send the Prospector to pan a seam while you hold the claim." (no em dash, LEXICON per `lore/canon-rules.md` clean); fired from `Game.ts:7543-7545` the first time the Prospector is idle with an active seam within `Balance.goldSeam.channelRange`, once per profile (`takeTrailGuideBark`), never inside a replay. Encyclopedia: `src/encyclopedia/registry.ts:196` "Pan command: select the Prospector and click a seam, or hold a seam on touch." World-info note on the Prospector: `src/ui/WorldInfoNotes.ts:140`.

**Scope 3, recorded in the human tape.** `src/mp/LockstepClient.ts:14` adds `{ type: 'prospector_dispatch'; node: string }` to `LockstepAction`; `normalizeAction` `:1062-1065` (token <= 64 chars). `src/game/RunTape.ts:36` `RunTapeAction`; the recorder's routed-vs-recorded dedup is a multiset (`:136-146`) so two identical dispatches in one tick both survive while a routed copy still dedupes (tape-01 "the recorder deduplicates routed actions" stays green). On replay the action re-enters through the same `:3299` handler. Node test `scripts/same-laws-harvest-parity.test.mjs` (normalize + record twice + snapshot: `[action, action]`), now in `test:node-guards`. Assay slip in section 3.

**Scope 4, parity evidence.** Section 2. Zero change to `HeadlessContractSim.panAt`, `StandingOrders.ts`, `HarvestSystem.ts`, `Balance.ts` (firewall diff empty).

**Scope 5, Lantern Show / true reel (verify only).** Symmetric: the reel draws the Prospector from `internal.prospector.snapshot.position` (`src/replay/AgentTapeReplay.ts:146` -> `src/ui/TrueReelRenderer.ts:121`), the one embodiment both species move; there is no dispatch-specific rendering for riders, so a human tape renders travel and panning the same way. No new work. Caveat, pre-existing and unrelated to this slice: the true reel refuses every HUMAN tape that contains standing orders (F-SLHP-2).

**Scope 6, skill.md.** `public/skill.md:102`: "The player has the same dispatch command (select the Prospector and click a seam, or hold it on touch); the Prospector serves the player and the rider alike." (skill.md vocabulary: humans are "the player", agents "the rider"). The sentence sits outside the `skillmd-guard:grammar` pinned block; skillmd-guard (7 tests) and no-emdash-guard green; no baseline needed re-pinning.

**Scope 7, engine hash.** Section 4.

## 2. Parity table (identical on desktop-chrome and mobile-chrome)

`/?debug&contract=the-claim&seed=same-laws-harvest-parity`, seam `gold-seam-1` at (-9, 6.7), the run reset and stepped one tick, command issued at t = 0.033 s in both arms (player: two dispatches, click-while-selected on desktop / tap-hold + confirm on mobile; rider: two `HARVEST` orders via `__GR_AGENT__.submitOrders`), then 20 s of manual sim.

| tick | player dispatch (s after command) | rider HARVEST (s after order) | gold | cumulative |
|---|---|---|---|---|
| 1 | 1.867 | 1.867 | 5 | 5 / 5 |
| 2 | 1.900 | 1.900 | 5 | 10 / 10 |

Absolute sim times 1.900 s and 1.933 s in both arms; seam remaining 30 -> 20 in both arms; `expect(curve(player)).toEqual(curve(rider))` holds on both projects. Raw: `artifacts/same-laws-harvest-parity/parity-desktop-chrome.json`, `parity-mobile-chrome.json`.

## 3. The tape input and the assay slip

Input kind added: `prospector_dispatch` (`{ type: 'prospector_dispatch', node: 'gold-seam-1' }` x2 in the recorded human tape, `tape.inputLog.entries[*].a`). Tape `eventLogHash` `fnv1a32:a6c04f80`, 601 ticks. Replayed by the county's instrument `scripts/assay-replay.mjs` (fresh vite + headless chromium on port 5260):

`{"eventLogHash":"fnv1a32:a6c04f80","outcome":{"secured":false,"waves":0,"gold":10,"timeAlive":20.033333},"ticks":601,"wallMs":1668}` (desktop; mobile identical hash, wallMs 1653). Asserted equal to the tape's own hash and tick count. The door submission proper (`/submit` on the live assayer) was not exercised; it is an ops act, and the assay instrument is what the door runs.

## 4. Engine hash (F-1441-3: same-era pin, NO era bump)

- lane/d tip (this tree): `e3a41eb34dd4ba1d84458f41f5c2069b6adba1e4a89d4af168b02157b46f7f6b` (`computeEngineHash` over the worktree; identical from the committed tree via `git archive`).
- Lane base `1b08a841e` and main at `7b9e196cd`: `91516772bb548766abdc9fff587b71775ac677bca27c267fe29bef5e727d21a0`, which is NOT in `assets/engine-era.json` (live `eaadcc38...`, pins `c0a015...`, `417ac1...`, `25040a...`, `d47f32...`, `eaadcc...`): main was already unpinned after the true-reel-sprites / reel-deep-links merges.
- main moved during this gate: `4d8553afc` (lantern-true-terrain `c1374d659`) hashed to `e3a56191a9a7c7b08448fa99cf199c73c0df6513cdfb40347f8d06ae21af5323` (unpinned at that moment); by `89921972f` (the lantern_post reel fix `f587b3c87` plus the pin commits `0a1ecea97` / `89921972f`) main hashes to `93c80710c048c5e1c77acab19fd0de575bff15ca8beb8d0ab80bcbebd702b2c1`, which IS the registry's live hash (six era-5 pins). Main is pinned again as of `89921972f`; only the merged tree remains to pin.
- The drain must compute the MERGED tree (`node -e "import('./scripts/assay-replay-agent.mjs').then(m=>m.computeEngineHash()).then(console.log)"`) and append one era-5 pin for that value with this cause; `e3a41eb3...` is the lane's number, not the merged tree's.

## 5. Gates (node 26.4.0 per `.nvmrc`; the first battery ran under the shell's v23.11.1)

| command | rc | counts |
|---|---|---|
| `npx tsc --noEmit` | 0 | salvage tree (v23.11.1) and final tree (v26.4.0) |
| `npm run build` | 0 | salvage tree and final tree |
| `npm run test:node-guards` | 1 | 564 tests, 558 pass, 4 fail, 2 skipped (attribution below); under v23.11.1 before the fixes: 563 / 555 / 6 |
| `npm run test:stats` | 0 | stats worker 87, standings kv 194, standings sqlite 194, ledger worker 19 checks |
| `node --test scripts/same-laws-harvest-parity.test.mjs` | 0 | 1 / 1 |
| `npx playwright test same-laws-harvest-parity --workers=1` (both projects, dev server on scratch port 5199) | 0 | 4 passed (23.7 s): the parity test and the plain-boot (no `?debug`) probe on each project; zero console/page errors asserted in all four |
| BACKLOG/skill.md-sensitive guards after the ledger edit (`stale-ready-for-gates`, `findings-state`, `citation-title`, `law-pointer`, `desk-birth`, `skillmd`, `no-emdash`, `gate-caller-audit`) | 1 | 130 pass / 1 fail (law-pointer, below) |
| `npm run test:findings-state`, `npm run test:citations` | 0, 0 | PASS, PASS |

The 4 node-guard reds, each attributed:
1. `engine-era-guard.test.mjs:65` "the landed registry names the live engine": `e3a41eb3...` is absent from era 5. By design on a lane: the drain appends the pin; the registry is firewalled.
2. `law-pointer-guard.test.mjs:135`: POINTER DRIFT `scripts/fire.md -> src/game/Game.ts:2495` (`placeBuilding: ...`, now `:2507`: +1 import `:261`, +4 fields `:719-722`, +6 wiring `:1727-1732`, +1 dispose). The drain re-bases (CLAUDE.md section 4.10b lifecycle); `scripts/fire.md` is not lane-touchable.
3. `desk-declaration-guard.test.mjs:163`: the guard REFUSES (exit 2) in any linked worktree ("STATUS.md line-1 is NOT the one main carries", F-2232-1 / F-2241-1 / F-2242-1); on the lane's own reading undeclared = 0. Environmental.
4. `fixture-teardown.test.mjs:24`: "scripts/desk-declaration-guard.test.mjs child failed", the same refusal. Environmental.
Cured during the gate: `gate-caller-audit` "NEW scripts/same-laws-harvest-parity.test.mjs NO CALLER" (package.json); `node-guards-timeout` red under v23.11.1 by its own diagnosis, green under 26.4.0.

## 6. Adjacent suites (`/harvest|prospector|agent-seat|tape|replay|standing-orders/` = 12 specs, both projects, `--workers=1`)

Batch A (port 5199): `_s106-prospector-boot-probe`, `agent-seat`, `ap-standing-orders`, `assay-auto-tape`, `assay-replay-roundtrip`, `c7-standing-order-replay`: 20 passed, 3 failed (4.6 m). Batch B (port 5200, concurrently): `f1297-2-plain-boot-tape-button`, `m4-07-prospector-panel`, `pb02-replay-actor`, `tape-01-run-tape`, `tape-02-lantern-show`, `task-026-prospector-collects-xp`: 23 passed, 2 failed (2.1 m).

| red | attribution |
|---|---|
| `pb02-replay-actor.spec.ts:78` event parity, both projects (`Expected: 15, Received: 0` at `:119`) | stable pre-existing main red: `reviews/agent-reels-2.md:55` (4/4 both arms); spec last changed `c7d6740f8` 2026-07-17 |
| `agent-seat.spec.ts:60` "the host opens a room" 45 s predicate timeout, desktop only | load (three batteries shared the CPU); re-run alone: 1 passed (10.1 s) |
| `c7-standing-order-replay.spec.ts:12`, both projects: `lantern-playback-status` `data-hash=""`, text "Reel refused . recorded outcome retained" (`:36`) | pre-existing on main since `795c5c4a3` (2026-08-30, true-reel-show): a tape with standing-order actions routes to `startTrueRunTapeReplay` (`Game.ts:6986`), which refuses any tape whose `meta.engineHash` is not in the era lineage (`:7046`), and human tapes are stamped `{ buildId }` only (`:7331`, `RunTape.ts:361`). None of those inputs differ from main on this lane (the only `LanternShow.ts` diff is main's own lantern-true-terrain); the codex run's battery shows the same fingerprint. Filed as F-SLHP-2 |

The master's wider regex (`/agent|orders/`) would add more specs; the instruction's regex was followed.

## 7. Screenshots (written by the spec)

- `reviews/shots-same-laws-harvest-parity/desktop-chrome.png` (1280x800): the Prospector chip selected (teal ring), the Prospector under way to `gold-seam-1` after two clicks.
- `reviews/shots-same-laws-harvest-parity/mobile-chrome.png` (390x844): the "Send the Prospector to the seam" prompt after a tap-hold on the seam.

## 8. Findings and what is left

- **F-SLHP-1 (non-blocking; owner/drain awareness).** The rider's arrival-to-pan delay in the browser is not a sim quantity: StandingOrders reads `actorMoving` from `window.__THREE_GAME_DIAGNOSTICS__` (`src/agent/ToolSurface.ts:202`, `readLiveState` `:427`), republished on presentation (`publishDiagnostics` in `updatePresentation`, `Game.ts:3256`), so under the manual harness (5 ticks per present) it is 1-5 ticks depending on the arrival tick, and under live frames about 1. The player's path uses a fixed sim-side settle of 4 ticks (`PROSPECTOR_DISPATCH_SETTLE_TICKS`, `Game.ts:368`), which reproduces the rider's curve exactly under the gate harness (the codex run measured player 1.767 s vs rider 1.867 s before tuning it) and keeps the human tape presentation-independent (assay-safe). In live play the player's tick can therefore land up to ~0.13 s later than a rider's would; gold per order, order count and travel are identical. Sharing the rider's observed signal would make human tapes cadence-dependent (a replay hazard); changing the rider is outside the firewall. Recommendation: accept as parity, revisit only on an owner word.
- **F-SLHP-2 (pre-existing, owner's desk).** Human tapes that contain standing orders cannot be watched in the Lantern Show (refused as unstamped); `c7-standing-order-replay` is red on main since true-reel-show. Not touched here.
- **Drain owes**: the same-era pin for the merged tree (section 4); the `scripts/fire.md` `Game.ts:2495 -> :2507` re-base plus `scripts/law-pointer-baseline.json`; the BACKLOG merge (the lane's `tasks/BACKLOG.md` is main's `4d8553afc` file plus one edited row, F-PT16-1, so the 3-way merge is one row).
- **Not done**: the master's "submitted through the door locally" wording was met with the assay instrument, not the HTTP door; the master's wider adjacent regex.
- **Design notes**: selection is sticky per session (one-time gate; modifier-click bypasses; opening the charter by `G` selects too). Multiplayer: a dispatch is a lockstep action applied on every peer to the shared Prospector (slot ignored), consistent with the shared companion; not exercised in MP. The trail-guide line consumes its once-per-profile hint only outside replays.
- **Instruments**: the gate used two untracked scratch Playwright configs (ports 5199/5200, the default config's projects) so a fire's 5188 on main was never contended; they were moved to the session scratchpad after the gate. `test-results/` is gitignored. The codex run's regenerated evidence PNGs under other slices' `artifacts/` and `reviews/shots-*` were left uncommitted (churn, not this slice's evidence).
