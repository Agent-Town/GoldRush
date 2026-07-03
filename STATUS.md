# STATUS — Gold Rush

Last updated: 2026-07-03 ~15:55 +07 (session 3 end — manual continuation lane; ACTIVE lock cleared)

## Where we are
- **M0 Skeleton: all 5 slices done + committed.** Awaiting Robin playtest + sign-off (`npm install && npm run dev`; docs/DEPLOY.md).
- **M1: 01, 02, 03, 04 done, reviewed, committed.**
  - 02 = Spark Rig auto-fire (`06f4231`, s2 scheduled session; `reviews/m1-02-auto-fire-spark-rig.md`).
  - 03 = wave pressure (`7b5180f`, session 3; `reviews/m1-03-wave-pressure.md`). **First fun verdict recorded in `specs/m1-core-loop/slices/03-wave-pressure.md`: NOT FLAT, no reslice** — stationary dies wave 1, instrumented kiting reaches wave 3 with gold income frozen by pressure (the intended tension). Tuning concerns parked for 07.
  - Feedback fixes from Robin's playtest = `0a4cf2f` (banner, gold float text, frame pacing, 57° camera; `reviews/feedback-fixes.md`).
- Next: **m1/05-sentry-beacon-build and m1/06-level-up-choices — both unblocked, parallelizable** (disjoint except Game.ts/Balance.ts registration). Fold HarvestSystem `reset()` into 05. Then 07 tune gate → Robin playtest = M1 exit.
- Full regression at session end: **23/23** across 6 spec files, tsc clean, build green.

## Session collision — resolved today, protocol below is BINDING
Two orchestrator lanes ran concurrently today (scheduled s2 + manual s3). Both independently built m1-02; s2 committed first (`06f4231`); s3 followed the protocol, discarded its duplicate working tree, validated s2's HEAD (smoke + probes), and harvested its findings into the record. Nothing was lost, ~1 slice of effort was burned. **Rules:**
1. On start: read STATUS.md `Last updated` line. If it says ACTIVE with a timestamp <3 h old, assume another lane is live: do docs/review/probe work only, or coordinate via a fresh commit message — do NOT start a slice.
2. Set `ACTIVE <ISO>` in STATUS.md (commit it) on start; clear it in your handoff commit.
3. Before rsync-back: `git log --oneline -3` on the mount. Newer commits than your ~/gr baseline → STOP, 3-way merge (restore their-only files via `git checkout HEAD --`), re-run the suite, only then commit.
4. rsync-back excludes `STATUS.md` and `specs/` — edit those ON the mount after code sync (two clobbers happened today; both caught).

## How to resume (next session — in order)
1. Enable file deletion (`allow_cowork_file_delete`) BEFORE any rm/git work.
2. Re-provision sandbox: `npm config set prefix ~/.npm-global && export PATH=~/.npm-global/bin:$PATH && npm i -g @openai/codex`; copy `.codex-auth/auth.json → ~/.codex/auth.json`; `~/.codex/config.toml` trusts mount AND `~/gr`; `apt-get download libxdamage1 && dpkg -x libxdamage1*.deb ~/locallibs`; Playwright runs need `export LD_LIBRARY_PATH=~/locallibs/usr/lib/aarch64-linux-gnu`. NEVER `npx playwright install` if browsers exist (check `~/.cache/ms-playwright`).
3. Rebuild ~/gr: `rsync -a --delete --exclude node_modules --exclude .git mnt/Gold\ Rush/ ~/gr/ && cd ~/gr && npm i --prefer-offline && git init -qb main && git add -A && git commit -qm baseline`.
4. Delegate m1/05 (and optionally 06 in a parallel ~/grB lane) per the chunked protocol. Review; rsync back per collision rule 4.

## Codex chunked-exec protocol (proven; m1-03 took ~15 chunks + 1 correction)
- Launch in `~/gr`: `timeout -k 1 40 codex exec --dangerously-bypass-approvals-and-sandbox -m gpt-5.5 -c model_reasoning_effort="medium" "$(cat ~/task.md)" < /dev/null >> ~/log 2>&1`; then loop `codex exec resume <id> ... "continue (supervisor checkpoint — check disk, don't redo)"` until exit 0 (124 = keep resuming).
- Task file must include: interrupted+resumed warning, write-files-early, servers die between chunks, NEVER playwright install, LD_LIBRARY_PATH line, do NOT git commit, and **"reply READY-FOR-GATES instead of running long verifications — the supervisor runs gates"** (worked cleanly for m1-03; prevents verification livelock).
- If Codex stalls two checkpoints at the same spot, nudge with an explicit "WRITE IT NOW in two patches" instruction — un-stalled m1-03's WaveSystem immediately.
- When e2e fails repeatedly: run a live probe YOURSELF (vite + playwright-api node script sampling diagnostics every ~500 ms), hand Codex the curve + root cause. Found m1-03's real alive-cap overshoot in one probe; earlier found s2's 0-dmg slot bug and the (discarded lane's) bolt-tunneling issue the same way. Probe before correcting; never let Codex soften a failing assert.

## Verification lessons (cumulative)
- Count playwright summaries: `grep -E "[0-9]+ (passed|failed|skipped)"` — never tail.
- E2e SERIAL on SwiftShader (`--workers=1`); per spec file, and per-test batches via `-g "name|name"` sized <35 s to fit the 45 s bash wall.
- `pw.reuse.config.ts` (port 5189, reuseExistingServer) + `(npx vite --port 5189 --strictPort >log &) && sleep 3` in the same call. Orphan servers CAN outlive a bash call (hidden PID namespace): **kill with `fuser -k 5189/tcp`** — `pkill -f vite` self-matches your own bash cmdline and kills your shell (exit 143 trap).
- Keyboard e2e deprecated for actions → `__GR_TEST__.spawnPack/teleport/resetRun` under `?debug`; `?nowaves` for tests assuming no ambient spawns; `?nokill` for cap/pressure tests; `?nospawn` hard block.
- Headless SwiftShader: 17–22 fps ceiling, fps gate ≥12 floor; draw calls are the real perf gate — ≤200 budget, currently ~26 @ stress=120. frameMs telemetry (avg/p95) now in diagnostics for Robin-hardware numbers.
- Death tests must OVERWHELM (rig out-fights thin spawns; iframes cap intake → death ≈6.5 s sim under swarm).

## Codex sessions (resumable)
- A (m1-01): `019f266c-2120-75d0-b86a-2ff59bf12b9a` · B (m1-04): `019f266c-d5e3-73c3-9dfe-e9b002893366` · C (m1-02, s2): `019f26c3-f4c7-7c40-8fff-804894719f3e` · D (m1-03, s3): `019f2701-f227-7710-a6f1-884cb5d10232` · feedback fixes: `019f26bd-3944-76a3-a8a7-b19089b2d4f4`. (`019f26e4-8174…` = s3's discarded duplicate m1-02 — do not resume.)
- New slices: fresh sessions.

## Open reviews / carried minors
- Bolt readability (teal washes white under tone-mapping) + dust-puff reads black (want tan/parchment) → m1-07 or batch-001.
- Seam cluster subtle at gameplay zoom; river hue leans green → batch-001 art.
- Camera 57° (`0a4cf2f`) — confirm with Robin at 07 gate; all camera knobs in ?debug lil-gui.
- HarvestSystem has no `reset()` — fold into m1-05 (touches Economy anyway).
- XP counter shows overflow ("21 / 12 XP") until 06 consumes levels — expected.
- `?stress` bypasses the wave alive-cap by design (perf harness); respects pool cap 96 — don't "fix".
- Intermittent dark rectangle in `?debug` screenshots only (canvas-rendered, screen-anchored, extensively probed in `reviews/feedback-fixes.md`; never seen without ?debug) — watch during 05/06; escalate only if it appears in default views or on Robin's hardware.
- Vfx floatText textures now cached by string (s3 finding folded into s2's review record); frameMs stats computed on publish, not per-frame.

## Robin owes (non-blocking)
- Playtest: M0 + M1 (01–04) are playable — waves, auto-fire, panning, death/restart, run ledger. Fun verdict from headless instrumentation is positive; the real feel check is his.
- batch-001: budget OK per `assets/LEDGER.md`; paste `assets/requests/batch-001.md` prompts into ChatGPT, downloads → `assets/raw/` exact filenames.

## Done log
- 2026-07-03 (s1): skeleton `e439424` → specs `bc87a96` → m0-01..05 → m1-01 `b4cb01d` → m1-04 `a873bc5` → docs `e1164ec`.
- 2026-07-03 (s3 manual, feedback lane): `0a4cf2f` F1–F4 fixes (+2 supervisor review-fixes: float-text sizing, shadow frustum ±48).
- 2026-07-03 (s2 scheduled): m1-02 `06f4231` (+ e2e modernization, pw.reuse), handoff `7942d54`.
- 2026-07-03 (s3 manual): collision resolved per protocol (own m1-02 duplicate discarded, s2 HEAD validated); ACTIVE lock `64f3400`; m1-03 `7b5180f` (WaveSystem, fun verdict NOT FLAT, 23/23 regression); this handoff.

## Robin directives (2026-07-03 evening — binding, next session implements FIRST)
1. **Standing UX rule: EVERY collectible/pickup shows floating world-space amount feedback** (like gold "+5"): XP motes → teal "+3" via existing `Vfx.floatText` at pickup point, wired to the xp-grant path. Applies to all future items/drops — write it into every relevant slice spec. Implement the XP wire BEFORE starting m1-05.
2. Robin playtests the live working tree (vite HMR) — keep main always playable; he gets 15-min progress pings (scheduled task `gold-rush-progress-ping`) + 3h build sessions (`gold-rush-build-loop`).
3. Reminder shown to Robin: level-up on XP threshold arrives with m1-06 (currently XP accrues past need — expected).
