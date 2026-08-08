# Review — mp-07c-3: THE INVITATION

**Slice/branch/tip:** mp-07c-3 (fire-authored `tasks/lane-mp07c3-the-invitation.md`) · `lane/b` · merged `64ea699a3042c911e830886e9c83b2ca75c96084` · drained attended 2026-08-08 ~13:15. **The road the owner ratified this morning is COMPLETE: body (07c-1) → eyes (07c-2) → invitation (07c-3).**

**Verdict: MERGED — the cleanest gate of the day.**

**What it does:** The Ride Together panel now carries a copyable one-paste command — `node scripts/gr-sim.mjs --room <CODE> --origin <ORIGIN>` — so a player invites their agent(s) exactly as the owner asked ("the player [should] be able to invite his agent or multiple agents if they want"). Clipboard via navigator API with a non-throwing fallback; headless riders carry an `agent` flag into PartyOverview and render with a distinct Agent mark; the "(scout)" suffix leaves the visible label (wire name unchanged). Where does the PLAYER see it, in a plain boot: the Ride Together panel, proven by its own no-debug spec + screenshots both viewports (`reviews/shots-mp-07c-3/`).

**Evidence:** tsc/build rc=0 · own invitation spec green · agent-seat-room harness green (98-check era) · adjacents (task-025+m1-01+m2-01) green both projects · **test:node-guards on v26.4.0: 391/391, zero fails, zero skips** — the first fully-clean battery of the day (all worktrees quiet at last) · runner-side: e2e 2/2 zero console/page errors, screenshots, independent review caught + fixed a claim-phrase/CLI mismatch pre-handoff. Transcript `artifacts/mp-07c-3-gate.txt`.

**Merge classification:** base = post-f-door-5 main; nine files LANE-TOUCHED incl. two NEW screenshots + the new spec; clean auto-merge.

**Findings:** none blocking. Runner's honest notes (live-desk guard red on ITS shell; MP-02's known Town Start Ride red) both matched documented classes and did not reproduce on the merged-tree battery.
