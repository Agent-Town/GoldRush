CODEX: model=gpt-5.6-sol effort=high
# lane-guide-beat-priority — teaching holds the floor: guide beats must not be overtaken
ROLE: lane implementer. WORKDIR: this lane worktree. One task, firewalled.
WHY (product finding under F-1205-5, measured at the captured bytes): hud-agent-feed is a SINGLE-SLOT live region — under load, combat/sim barks ("That horn marks their road in" 23x) OVERTAKE first-run Trail Guide beats before a slow reader (or a slow machine) sees them. The proof spec caught it as flake; the PLAYER experiences it as lost teaching. NO-BLOCKER law: wire the fix; owner corrects post-hoc.
READ-FIRST: the hud-agent-feed implementation (single-slot mechanics) · the Trail Guide beat emitter (first-run beat ids + hintsSeen dismissal) · tasks/BACKLOG.md §F-1205-5 (the full mechanism, incl. WHY raising timeouts worsens it) · lane-trail-guide-plain-boot-observed-beats.md (the queued proof's recorder approach — your fix makes its subject stable; do NOT touch that spec).
PRE-FLIGHT (LANE-SAFETY invariant): dirty tracked blobs must be reachable in git, else STOP.
SCOPE:
1. FIRST-RUN GUIDE BEATS HOLD THE SLOT: while an undismissed first-run guide beat is displayed, non-guide barks QUEUE (bounded, newest-wins within their own class) instead of overwriting; the beat releases on dismissal or its natural dwell (choose a dwell floor honest for reading, ~4-6s).
2. Scope strictly to FIRST-RUN teaching beats (the hintsSeen-gated set) — ordinary barks keep today's single-slot liveliness after teaching is done.
3. e2e: under a scripted bark storm, a first-run beat stays visible its full dwell + queued barks surface after · post-teaching behavior byte-identical (existing feed specs unmodified-green).
TOUCH-ONLY: the feed module + the guide-beat emitter hook · one e2e spec. NO: playwright.config timeouts, the plain-boot proof spec, bark copy.
SELF-CHECK: both projects green · adjacent feed/guide suites unmodified-green · zero console.
READY-FOR-GATES + report: dwell/queue rules as shipped + storm-test screenshot.
