CODEX: model=gpt-5.6-sol effort=xhigh
# lane-gr-sim — the headless contract runner (AP-07's prerequisite)
ROLE: lane implementer. WORKDIR: this lane worktree. One task, firewalled.
WHY: specs/agent-play/README.md §AP-07 (owner direction 2026-07-30 verbatim therein). Offline eval/RL needs contract runs WITHOUT a browser. The sim is planar/deterministic with rendering strictly separate (constitution §4.6) — this slice proves that law by running it blind.
READ-FIRST: §AP-07 + §THE STANDING ORDERS · src/agent/View.ts + StandingOrders.ts (REUSE — the runner speaks the same vocabulary) · the sim boot path (what Game.ts initializes that is sim vs render — the runner boots ONLY sim) · StatSimHarness (precedent for headless sim stepping) · RunSuspend (state shape knowledge).
PRE-FLIGHT (LANE-SAFETY invariant): dirty tracked blobs must be reachable in git, else STOP.
SCOPE:
1. scripts/gr-sim.mjs (or src/sim entry compiled): `node scripts/gr-sim.mjs --contract e1-dry-gulch --seed bench-001` boots the SIM ONLY (no three.js renderer, no DOM; jsdom/stub only if imports demand — prefer refactor-free stubbing), steps the fixed timestep.
2. Per wave boundary (+ surprise flags): emit THE VIEW as JSON on stdout; read standing orders JSON on stdin (same schema as et.goldrush.orders; validation identical). A --policy=idle flag runs orderless (baseline).
3. On termination: outcome JSON {secured, waves, timeMs, gold, kills, calls, eventLogHash} — replay-truth fields included.
4. DETERMINISM PROOF: same contract+seed+orders script twice → byte-identical outcome + event hash (this is the gate).
5. Speed note in report: waves/sec headless (RL viability number).
TOUCH-ONLY: the new runner entry + minimal seams in sim code ONLY where a render import blocks headless boot (each such edit listed in the report; behavior byte-identical in browser — full suites prove it). NO: View/Orders schemas, Balance, gameplay logic.
SELF-CHECK: determinism gate above · tsc + build · FULL adjacent suites unmodified-green (the seams touch shared code — the whole board is adjacent; run the m1/m2/m3 core set + release-build suite) · zero console in a browser boot probe.
READY-FOR-GATES + report: a full transcript of one headless dry-gulch run (views + orders + outcome) + the determinism proof + waves/sec.
