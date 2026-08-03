CODEX: model=gpt-5.6-sol effort=xhigh
# lane-night-stuck-census — F-BW-10: enemies stop wedging on the furniture
ROLE: lane implementer. WORKDIR: this lane worktree. One task, firewalled.
WHY (owner, gate walk 2026-08-03: "the opponents get stuck a lot on the different objects"): night-shift enemies latch on props/prePlaced objects. The cliff-side cure (gt-03b goal-side steer) shipped; OBJECT avoidance is its sibling gap (F-1130-5 family).
THE BENCH IS YOUR INSTRUMENT: e1-night-shift runs headless (SUPPORTED_CONTRACTS). Build the stall census FIRST: gr-sim scripted runs across seeds, sampling per-enemy progress; a stall = no net progress toward goal for N sim-seconds while alive and unobstructed by design → census table (position clusters → the offending object) BEFORE any fix.
READ-FIRST: the gt-03b review + resolver as merged (one movement law — EXTEND it, never fork) · Enemy avoidance path (avoidanceSide, depenetration) · night-shift prePlaced objects + props collision footprints · the hero's never-wedged invariant (gt-02 fuzz — the pattern to port).
PRE-FLIGHT (LANE-SAFETY invariant): dirty tracked blobs must be reachable in git, else STOP.
SCOPE: 1. The headless stall census (committed as evidence). 2. Fix at the resolver: object-class avoidance with the goal-side bias law extended to prop footprints; a never-wedged fuzz invariant for ENEMIES (port gt-02:207's shape: N random spawns × M objects, all achieve net progress). 3. Re-run the census: stall clusters → zero (or each residual named + justified). 4. Determinism preserved (baseline replay hash before/after for an unaffected seed).
TOUCH-ONLY: Enemy resolver/avoidance + one census script (scripts/) + specs. NO: object placements, night mechanics, Balance speeds.
SELF-CHECK: gt-02/gt-03 suites unmodified-green · night suites green · determinism proof · both projects.
READY-FOR-GATES + report: census before/after tables + the fuzz invariant green.
