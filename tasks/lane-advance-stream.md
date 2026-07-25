# Task lane-advance-stream: THE ADVANCE STREAM + THE CASCADE (LANE-C, sequenced after asset-diet, commit prefix "perf:")

You are Codex, implementer for Gold Rush (worktrees/lane-c).
CODEX: model=gpt-5.6-sol effort=high
**SEQUENCED: run after lane-asset-diet MERGES (its raise-cue + progress seam are your consumers; probe the cue's dataset exists on main, else STOP).**
READ FIRST: the merged asset-diet (the cue + the size reality it created) · the immutable-cache headers (public/_headers) · the board frontier logic (next-unbeaten per chapter order) · the suspend/resume flow (last-suspended contract).

## THE ADVANCE STREAM (owner 2026-07-25, verbatim: "Could we start downloading all the assets as soon as the player visits the start page? Basically streaming in advance?")
5. PREFETCH FROM THE MENU: the start page begins warming the cache the moment it settles — priority-ordered, low-priority fetches (never competing with the interactive path): ① the town's GLBs+atlases (the guaranteed next scene) ② the profile's last-played/first contract (the-claim for fresh) ③ the remaining E1 maps ④ everything else, idle-paced (requestIdleCallback batches; pause instantly on any scene transition, resume in the next scene's idle). Assets are hash-named immutable — warming is pure win; re-visits cost nothing.
6. THE PREFETCH IS POLITE: respect navigator.connection saveData (skip bulk prefetch when set, keep tier ①) · a dataset seam exposes progress (prefetched/total) · the town's raise-cue (scope 2) consumes it — on a warm cache the town raises instantly and the cue never shows.
7. Spec additions: menu idle → tier-① requests observed (playwright network capture) · a scene launch mid-prefetch cancels pending fetches (no bandwidth contention: assert the run's own asset requests are not queued behind prefetch) · saveData=true skips bulk · zero console.

8. THE CASCADE NEVER STOPS (owner sharpening, verbatim: "when in town is downloaded, the first contract is the next thing the player will need... Then loading the contract feels seamless and fast. But we can already prepare the next one and so on."): every scene idle continues the stream ONE STEP AHEAD of the player — in town: the LIKELY next contract first (the board frontier: next unbeaten in chapter order, or last-suspended), then its successor; in a run: the town (the guaranteed return) then the next contract onward. One priority function, consulted everywhere.

## Firewall: ONE prefetch module (menu-mounted, scene-consulted) + the priority function + specs. NO scene-load-path changes, NO cache-header changes.
END: READY-FOR-GATES + a throttled-network walkthrough table (menu→town→contract1→town→contract2: what was already warm at each door).
