# Task lane-d-e9-digger-spec: the Old Digger's authored gates (LANE-D, commit prefix "test:")

⛔ **SHIPPED 2026-07-18 — NEVER QUEUE (Mistake #8 guard, content-probed s2063 2026-08-19).** The deliverable `e2e/e9-boss-old-digger.spec.ts` is **on main** — 166 lines, 3 test blocks whose titles map one-to-one onto the numbered scope below: *"surveys, legally unmakes its path, never attacks, and cannot be killed"* (items 1+2, including THE NO-KILL ASSERTION), *"boards the live machine, spawns drones, takes hazard ticks, and dismounts safely"* (item 3), and *"THE SWAP uses the ${priorRecording ? …}"* (item 4, both arms). 🔑 **IT SHIPPED UNDER A DIFFERENT MASTER'S NAME, WHICH IS THE WHOLE REASON THIS FILE LOOKED UNRUN:** the single commit that added it is `a9c738c44` *"runner(lane-d): lane-d-wd04-postscripts.md"* (2026-07-18T07:22:18+07:00, on main, verified by `git branch --contains`) — so **no done-move, no commit and no branch anywhere carries this master's filename**, and every filename-keyed search returns nothing forever. This master was authored at 00:37 the same morning, ~6h45m before another lane landed its content. ✅ **THE DISCRIMINATOR WAS WRITTEN INTO THIS FILE ALL ALONG and it answers in one command** — see the GROUND-TRUTH pre-flight line below: *"e2e/e9-boss-old-digger.spec.ts absent = BUILD. Present = STOP SHIPPED."* It is present. ⚠️ **F-2059-1 CALLED THIS FILE "genuinely never run" AND THAT HALF IS REFUTED (see F-2063-1):** it probed for a `specs/**` digger file, but this master's deliverable is an `e2e/` spec — the right path was named in the master's own pre-flight, one line further down than the search went. ⓘ **Sized honestly: queueing this would have STOPPED, not flailed** — the pre-flight is a hard STOP, so the cost was one wasted dispatch (~44k tokens, the F-1424-3 precedent), not the 824k Mistake #8 shape. The banner is still owed, because a STOP is only free the day someone reads it.

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-d.
CODEX: model=gpt-5.6-sol effort=high
READ FIRST: AGENTS.md; src/systems/OldDiggerBossSystem.ts (the SHIPPED system, acts 0-3 — you write gates for it, you do not change it); lore/STORYBOOK.md E9 §BOSS (the ratified choreography the assertions encode); e2e/e5-boss-dredge-queen.spec.ts (the boss-spec house pattern).

Pre-flight (LANE-SAFETY): standard safe-dupe rules (`git checkout -B lane/perf main && git clean -fd` on content-on-main; STOP on undrained/foreign). npm install; build green.
GROUND-TRUTH pre-flight: e2e/e9-boss-old-digger.spec.ts absent = BUILD. Present = STOP SHIPPED.

## Why: the Digger system merged from the alt window's final shift, complete but spec-less (the wall took the last milestone). A boss without authored gates is a claim, not a fact.
## Scope — e2e/e9-boss-old-digger.spec.ts (GATE-AUTHORSHIP; the charter's original assertions; both projects):
1. Boss-flagged e9-dome-basin run: the Digger spawns, executes its survey, UNMAKES structures on its path via legal build-system channels, never damages the player.
2. **THE NO-KILL ASSERTION:** sustained maximum damage never destroys it (HP floor holds) — the fight cannot be won wrong.
3. Boarding: mount reachable, drones spawn aboard, hazard ticks apply, dismount safe.
4. THE SWAP: completes WITH a prior playbook recording AND with the no-recording fallback; post-swap the Digger is non-hostile, gentle-state, and PERSISTS across a same-profile re-run (TileStateStore); the old-tape archive event fires.
5. Zero console errors; DQ boss spec + task-025 unmodified-green both projects. If ANY assertion finds the shipped system wrong, that is a FINDING with file:line — report, fix only if ≤20 mechanical lines.
## Firewall: the new spec ONLY (+ ≤20-line mechanical fixes with findings). NO system redesign, NO Balance retunes.
## Self-check: tsc+build green · new spec green both projects · adjacents green · zero console.
No-op guard: exit-without-changes = WRITE WHY first.
END: READY-FOR-GATES + assertion results + any findings.
