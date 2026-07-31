CODEX: model=gpt-5.6-sol effort=xhigh
# lane-mechanics-manifest — AP-11: every contract declares its own language
ROLE: lane implementer. WORKDIR: this lane worktree. One task, firewalled.
WHY: specs/agent-play/README.md §AP-11 (owner ruling 2026-07-31 verbatim therein). Round 2's night-shift wall (reviews/standing-orders-rehearsal-r2.md verdict: "the darkness needs a verb") is an undeclared-vocabulary bug, not a difficulty feature.
READ-FIRST: §AP-11 (the whole law) · the contract/tile data pipeline (ContractFamilies manifests, tileParams, interactables in map data — find where lantern posts/springs/fords live as DATA) · src/agent/View.ts (stable prefix — where the manifest rides) · §THE STANDING ORDERS (OPERATE lands in SO-2, NOT here — this slice is declaration only).
PRE-FLIGHT (LANE-SAFETY invariant): dirty tracked blobs must be reachable in git, else STOP.
SCOPE:
1. deriveMechanicsManifest(contractId): built ONLY from sim/contract data — interactables + operations, special rules (darkness cycle, water crossings, spring cells, loss stakes), wave posting. NO hand-written entries; a mechanic the deriver cannot see does not exist (that blindness is the point — it forces data completeness).
2. Manifest included in: THE VIEW's stable prefix + the contract briefing surface (compact human line: "This claim speaks: lanterns, springs, the river").
3. Derive for ALL FIVE E1 contracts; commit the five manifests as a fixture (the assayer battery will later diff live derivation against these).
4. e2e: night-shift's manifest names the lantern/darkness mechanic · dry-gulch names springs · twin-banks names crossings · manifests are byte-stable per contract (determinism) · zero console.
TOUCH-ONLY: new derivation module + View.ts prefix inclusion + briefing surface line + fixtures + one e2e spec. NO: StandingOrders schema (OPERATE = SO-2), sim data itself, card copy.
SELF-CHECK: both projects green · tsc + build · release build unaffected-green.
READY-FOR-GATES + report: the five manifests verbatim + where the deriver found each mechanic.
