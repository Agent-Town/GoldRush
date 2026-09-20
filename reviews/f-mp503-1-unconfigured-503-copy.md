# Review — f-mp503-1: the unconfigured 503 measures OUR guard again

**Slice/branch/tip:** f-mp503-1 (fire-authored `tasks/lane-fmp503-1-unconfigured-503-copy.md`) · `lane/c` · tip `8cff7382d` · merged `4f74e5df0ede2a4b1dbea3cc3ae0d9a0a21a6320` · drained attended 2026-08-08 ~10:15.

**Verdict: MERGED — gate green after one environmental re-run.**

**What it does:** Root-caused F-MP503-1 with the body in hand: the "undefined message" 503 was WRANGLER'S OWN `Worker "gold-rush-mp-room" not found` (text/plain) — the unconfigured fixture resolved the repo's wrangler config, so our function (whose `error()` provably includes the saddle copy) never ran. Cure at the honest layer: the unconfigured fixture now runs OUTSIDE the repository so wrangler cannot resolve project config and our guard path executes; capture evidence at `artifacts/multiplayer-relay/f-mp503-1-capture.txt`; the summary artifact records `wranglerVersion` and failed responses keep status + raw body. Red-then-green control on the copy string itself.

**Evidence:** tsc rc=0 · build rc=0 · **test:mp 462 checks green on the merged tree** (first run red = port 9231 contention from the racing duplicate's lingering wrangler — environmental, re-run alone green) · node-guards on v26.4.0: 382/379/3, the day's documented collection-class (live lane-b worktree) · fire-side: 462 green + copy-mutation control. Transcript `artifacts/f-mp503-1-gate.txt`.

**Race note, judged:** two masters existed for this finding — the fire's (`lane-fmp503-1-unconfigured-503-copy.md`, queued 09:52, ran, CURED) and the attended one (`lane-fmp503-saddle-copy.md`, queued 10:02, correctly lane-safety-STOPPED against the fire's undrained commit). The fire's fix is the one merged; the attended master is retired SUPERSEDED in this commit. The dispatch-race class (two authors, one finding, minutes apart) is real but self-healed by the pre-flight — no corrective owed beyond the retirement.

**Findings:** none blocking. Runner note adopted for the record: wrangler should be pinned as a devDependency (this gate depends on its config-resolution behaviour) — noted, not actioned here.
