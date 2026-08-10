# FACTORY PAUSED — owner request, 2026-08-11 (machine load)

The owner's machine was under heavy load ("My machine is going nuts"); the attended session stopped the factory at ~03:0x:

- `launchctl unload ~/Library/LaunchAgents/com.goldrush.fire.plist` — fires stopped (dashboard job left running, it is light).
- Both `lane-runner-v3.sh` loops killed; one in-flight `npm ci` (a task pre-flight) force-stopped — the worktree's next pre-flight self-heals node_modules.
- The lane-a task `f1643-2-suite-red-inventory-refresh` was killed MID-RUN (its playwright herd was the main load). It is a maintenance refresh — re-queue it fresh when resuming; check `tasks/running/` for its stale copy and the lane-a branch for partial output (salvage laws apply, expect little of value).
- One live fire (mid-cycle at pause time) was deliberately allowed to drain out.
- A 4h44m ZOMBIE Blender introspection probe (`fries-mcdx/landmark.blend`, owner-diagnosed) was killed separately — if fries-mcdx work needs its object counts, re-run the probe (seconds when healthy).

## To resume
1. `launchctl load ~/Library/LaunchAgents/com.goldrush.fire.plist`
2. The fires restart the runners on their next cycle (or start them manually).
3. Re-queue f1643-2 if its refresh is still owed; delete this file in the same commit as the resume note.
