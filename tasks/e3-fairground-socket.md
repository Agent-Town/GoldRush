> ⛔ SUPERSEDED 2026-08-23 SAME DAY AS AUTHORED — DO NOT QUEUE. The attended burn batch authored this WITHOUT checking for the banked master (author-task §0.1 skipped); tasks/lane-e3-fairground-socket.md (s1474, fire-authored) carries the real measured analysis (the FerrisWheel consumer, the socket sites, the census firewall) and is the dispatched one. Kept per the retention law; the lesson is the banner.

# Task e3-fairground-socket: the fairground's science tree reaches the engine — the research-node channel opens (lane-b, prefix "feat:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-b.
READ FIRST: AGENTS.md; the `e3-fairground-socket` leaf in tasks/goals.json (the F-1475-1 history — measured when e3-fairground failed BOTH constructor doors; the owner greenlit 2026-08-09, and the fairground was since ADMITTED through the door 2026-08-22 via six authored anchors, so **your first act is a PREMISE RE-CHECK**: the old measurement may be stale); src/sim/HeadlessContractSim.ts (the constructor doors F-1475-1 named); src/meta/ContractFamilies.ts + the epoch bundle loader (`loadEpoch()` / EpochBundle — the s177/s178 record: it has NO research-node channel and ResearchChart renders only static RESEARCH_NODES); src/ui/ResearchChart.ts; specs/epoch-saga/ (the E3 slice that owns the science dimension).

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff — c7's runner commit IS merged at `2de0ab94d`), it is a SAFE DUPE → `git checkout -B lane/b main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. FACTORY-CHURN EXCEPTION (F-1407-1): changes confined to `logs/**`, `artifacts/**`, `reviews/shots-*`, any `.png` are NEVER a STOP — list and proceed. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.

## Why (owner greenlight 2026-08-09 desk walkthrough, verbatim record "all three chosen"; the gap measured s177/s178)
The E3 science dimension's engine seam was never built: `loadEpoch()`'s EpochBundle carries no research-node channel, so the fairground's science tree cannot reach the engine and ResearchChart shows only the static default. A prior queue attempt no-op'd TWICE on exactly this architectural absence (the s178 record) — the cure is the seam itself, which is this slice.

## Scope
1. **Premise re-check first** (write the result into your report): does e3-fairground now pass the HeadlessContractSim constructor doors on current main (it was admitted 2026-08-22)? If the F-1475-1 blockage is GONE, say so and proceed; if a door still refuses, STOP and report which door and why — the greenlight assumed admission resolved it.
2. **The channel**: EpochBundle gains an optional research-node payload (`researchNodes` or the shape the epoch-saga E3 spec names — read it and follow the spec's vocabulary); `loadEpoch()` carries it; contracts/epochs WITHOUT it behave byte-identically to today (additive, defaulted).
3. **The consumer**: ResearchChart renders the epoch's own nodes when present, the static RESEARCH_NODES otherwise (no visual change for E1).
4. **The sim side**: if the science/research state already flows through the sim (SCI-01..04 shipped), wire the channel to it read-only; do NOT invent new research mechanics — this slice is the SOCKET, not new science.
5. **Tests**: a unit/e2e proving (a) an epoch with authored nodes renders them, (b) an epoch without them renders the static default unchanged (pin one existing E1 assertion unmodified), (c) determinism pins unmoved (`node scripts/null-floor-anchors.mjs --check` clean; gr-sim fixture hash byte-stable).

## Firewall
Touch ONLY: the epoch bundle loader + its types, ResearchChart, the new test(s), BACKLOG row. NO changes to: contract data files (authoring nodes for real epochs is the NEXT slice), Balance, sim mechanics, existing e2e assertions beyond the one consumer pin.

## Self-check (evidence, not vibes)
tsc + `npm run build` green; new tests green both projects; task-025 + m1-01 + m2-01 unmodified-green; floors `--check` clean; zero console/page errors plain boot desktop + 390px. End: READY-FOR-GATES + report: the premise re-check verdict, the channel shape as shipped vs the spec's naming, test counts.

## No-op / honesty guard
If the channel already exists under a name the s178 record predates (someone built it since), STOP and report where — do not layer a second seam.
