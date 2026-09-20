CODEX: model=gpt-5.6-sol effort=medium
# lane-gazette-art-swap — GG-03: the engravings meet the newsprint
ROLE: lane implementer. WORKDIR: this lane worktree. One task, firewalled.
WHY: specs/greenhorn-gazette/README.md GG-03. Both dependencies are MERGED: GG-01 text-first issue (97c6a257) + GG-02 six engravings + masthead (8dff01fb, assets/raw/gazette-*.png).
PRE-FLIGHT (LANE-SAFETY invariant): dirty tracked blobs must be reachable in git, else STOP. Verify both dependency signatures on your base (the issue renderer testids + the seven gazette-*.png files); missing either = STOP, report LADDER-WAIT.
SCOPE: wire each panel's engraving into its reserved data-panel slot + the masthead vignette; parchment-consistent presentation (match town-ui image conventions); lazy-load politely (asset-diet: the issue is first-boot content — images load with the issue, not the boot). e2e: seven images render (natural size > 0), 390px legibility screenshots per panel.
TOUCH-ONLY: the Gazette/Herald UI module + css + its e2e spec + (if the pipeline demands) asset manifest entries. NO: panel copy, art files, welcome choreography.
SELF-CHECK: both projects green · zero console · screenshots into artifacts/gazette-art-swap/.
READY-FOR-GATES + report: the illustrated issue, desktop + 390px.
