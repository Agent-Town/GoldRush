CODEX: model=gpt-5.6-sol effort=high
# lane-gazette-welcome — GG-01b: THE WELCOME — the newsie hands you the town
ROLE: lane implementer. WORKDIR: this lane worktree. One task, firewalled.
WHY: specs/greenhorn-gazette/README.md §THE WELCOME (owner ruling 2026-07-29 verbatim therein) — first entry is a distinct once-only welcome, retriggerable via the newsie, never replaying uninvited.
DEPENDENCY: GG-01 (lane-gazette-first-issue) must be MERGED to main first — pre-flight: verify the pinned issue #1 renderer exists on your base (grep its testid); if absent, STOP and report LADDER-WAIT.
READ-FIRST: the spec §THE WELCOME (the whole law) · GG-01's merged code + its e2e · the newsie actor (src/town/townsfolk.ts + bark system) · the story-beat card system (founding-welcome beat) for the walk-beat pattern · reviews/e1-gameplay-depth.md F-E1-2.
PRE-FLIGHT (LANE-SAFETY invariant): any dirty tracked blob must be reachable in git, else STOP.
SCOPE: per spec — newsie delivery beat on first entry post-naming · the 2-3 anchored walk beats, skippable, dissolving to normal play · once-law flag in profile storage (SAVE-COMPAT additive) · newsie retrigger prompt (read again / show me around again) · e2e: welcome fires exactly once on fresh profile, never on second entry, retrigger works, every beat skippable, zero console.
TOUCH-ONLY: town welcome module (new file preferred) · newsie prompt hook in TownScene (minimal) · profile key addition (additive only) · one e2e spec. NO: Gazette panel content, Trail Guide barks, contracts, Balance.
SELF-CHECK: both projects green · adjacent town suites unmodified-green · screenshots (delivery moment, a walk beat, retrigger prompt) desktop+390px into artifacts/gazette-welcome/.
READY-FOR-GATES + report: the beat list as built + once-law proof (second-entry spec assertion).
