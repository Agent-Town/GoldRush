CODEX: model=gpt-5.6-sol effort=high
# lane-mandatory-welcome — the town greets every new face, unasked
ROLE: lane implementer. WORKDIR: this lane worktree. One task, firewalled.
WHY: specs/greenhorn-gazette/README.md §THE MANDATORY WELCOME (owner ruling 2026-07-30 verbatim therein).
READ-FIRST: that section (the whole law) · the profile-creation flow (profile-name-input + "First time prospecting?" radio) · THE WELCOME implementation as merged (8993da33) + its once-law profile key · the greenhorn offer's difficulty side effect (what "ease me onto the trail" set — replace with default per spec).
PRE-FLIGHT (LANE-SAFETY invariant): dirty tracked blobs must be reachable in git, else STOP.
SCOPE: 1. Remove the first-time question from profile creation (name only; town naming unchanged). 2. Welcome auto-arms for FRESH profiles (no imported data, no claims) — reuse the once-law key; imported/existing profiles never see it uninvited. 3. Retrigger + skippability byte-unchanged. 4. Update the existing welcome/profile e2e specs to the new flow (expectations updated, assertions never weakened); new assertions: fresh profile → welcome fires; imported ledger → does not.
TOUCH-ONLY: profile-creation UI + the welcome arming hook + affected e2e specs. NO: welcome choreography content, Gazette, difficulty presets themselves.
SELF-CHECK: both projects green · release-build first-player spec green (it walks profile creation — update it faithfully) · zero console · screenshots of the new creation flow desktop+390px.
READY-FOR-GATES + report: the creation flow as shipped + which specs changed.
