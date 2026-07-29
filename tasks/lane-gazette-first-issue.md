CODEX: model=gpt-5.6-sol effort=high
# lane-gazette-first-issue — GG-01: the Greenhorn's Gazette, text-first
ROLE: lane implementer. WORKDIR: this lane worktree. One task, firewalled.
WHY: specs/greenhorn-gazette/README.md (owner-ratified 2026-07-29) — the Herald's pinned first issue IS the tutorial. This slice ships it TEXT-FIRST (placeholder-first law; engravings come in GG-02/03).
READ-FIRST: the spec (all of it) · the Herald implementation (grep CLAIM HERALD / gazette in src/town + src/ui) · lore/story-arc.md §THE GOLD FEVER (panel 5 wording law) · the greenhorn offer implementation (start menu "First time prospecting?") · reviews/e1-gameplay-depth.md F-E1-2 (what new players miss).
PRE-FLIGHT (LANE-SAFETY invariant): any dirty tracked blob must be reachable in git, else STOP.
SCOPE: per spec GG-01 — pinned issue #1 with the six panels (typeset, art slots reserved with data-panel ids for GG-03), fresh-profile Herald badge, greenhorn-offer "yes" opens it on first town entry, always reopenable. e2e per the spec's list.
TOUCH-ONLY: the Herald/news UI module + css · the greenhorn-offer hook point (minimal) · one e2e spec. NO: Trail Guide barks, contracts, Balance, art files.
SELF-CHECK: spec e2e green both projects · zero console · screenshots (badge, open issue, 390px) into artifacts/gazette-first-issue/.
READY-FOR-GATES + report: panel copy as shipped (the attended session may polish wording post-merge; owner corrects post-hoc per NO-BLOCKER).
