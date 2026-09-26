# River native proof pre-flight

2026-09-26. Lane `sol/map-art-campaign-2` initially clean, zero ahead commits, 134 commits behind main. No undrained work. Authorized `git checkout -B sol/map-art-campaign-2 main && git clean -fd` brought the lane to `a9506add6`. No evidence discarded. Both the initial checkout build and the refreshed-main build exited 0 after `npm install --no-audit --no-fund`. npm removed 30 lines of optional-platform libc metadata from package-lock.json; restored only that tool-generated churn. Status clean before edits.

Premise checks passed: `grep -n 'RIVER_STANDING_POSTS_ENABLED' src/game/Game.ts` finds the false constant at 11151 and its guarded use at 7761; `git log --oneline main | grep -q 'river-ending-score-1'` exits 0. Read the run-6 River finding and run note, cure report and addendum, drain review, existing cure spec, shared driver and River wrapper. No standalone River-ending spec exists under specs/; the assigned task and landed cure define this proof.

Read the vault's raw-River/finale distinction. Task's TOUCH-ONLY firewall excludes vault writes; all new durable evidence remains under run-7.

Own Vite dev server uses unoccupied lane port 5303 (same port as run 6), strictPort. Playwright uses one worker, desktop then 390 px phone, trace off. The telemetry dev-send flag is enabled only with GR_NATIVE_RIVER_POST_PROBE=1; county traffic is counted then answered locally, with no external writes. The common seed omits River for every contract so no other proof can fabricate its completion.

The new spec registers the unchanged nativeProof River journey and observes its first and second pan, then checks the Book's River cell, literal reload, native re-pull and raw route. Production and existing test assertions are untouched.
