# STATUS — Gold Rush

Last updated: 2026-07-03 ~16:00 +07 (session 2 end — scheduled build loop)

## Where we are
- **M0 Skeleton: all 5 slices done + committed.** Awaiting Robin playtest + sign-off (run `npm install && npm run dev` in the project folder; docs/DEPLOY.md).
- **M1: 01, 02, 04 done, reviewed, committed.** 02 = Spark Rig auto-fire kernel (`06f4231`, `reviews/m1-02-auto-fire-spark-rig.md`): sticky targeting, CombatSystem sole damage owner (contact damage migrated out of Game.ts; ShooterHandle registry ready for beacons), instanced bolt pool 128 + XP motes 64, HUD XP, CombatVfx dust-puffs, procedural audio.
- **A parallel "feedback" session committed `0a4cf2f` mid-run** (transient banner, gold float text, frame pacing, 57° camera). 3-way merged into 02: UI vfx stays `systems/Vfx.ts`, combat vfx is `systems/CombatVfx.ts` — both wired in Game.ts, **don't re-unify**. Post-merge suite 18/18.
- Next slice: **m1/03-wave-pressure** (first "is it fun" verdict — record it in spec README), then 05 + 06 (both unblocked, parallelizable ~grB), then 07 tune gate.

## How to resume (next session — do this, in order)
1. Enable file deletion (`allow_cowork_file_delete` on any path in the repo) BEFORE any rm/git work.
2. Re-provision sandbox: `npm config set prefix ~/.npm-global && export PATH=~/.npm-global/bin:$PATH && npm i -g @openai/codex`; copy `.codex-auth/auth.json → ~/.codex/auth.json`; write `~/.codex/config.toml` trusting `/sessions/<session>/mnt/Gold Rush` AND `~/gr`; `apt-get download libxdamage1 && dpkg -x libxdamage1*.deb ~/locallibs`; `npx playwright install chromium` in ~/gr (supervisor job — Codex is forbidden; retry if the first attempt shows a transient stack trace).
3. Rebuild the Codex working copy: `rsync -a --exclude node_modules --exclude .git mnt/Gold\ Rush/ ~/gr/ && cd ~/gr && npm i --prefer-offline && git config --global user.email x@y && git config --global user.name Orchestrator && git init -qb main && git add -A && git commit -qm baseline`.
4. Delegate m1/03 per the chunked protocol. One slice per Codex session; review; rsync back **excluding STATUS.md and docs/ edited on the mount** (this session lost two STATUS edits to a stale rsync) and checking for resurrected deletions (`git status` on mount; known-stale list: none).

## Codex chunked-exec protocol (proven)
- No background processes survive a bash call (`bwrap --die-with-parent`); `/tmp` is per-call. Logs/prompts live in `~`. BUT: a bash call killed at the RPC level can leave a half-dead orphan holding its port across calls, unkillable from later calls (different PID/net namespace) — hence `pw.reuse.config.ts`.
- Launch: `timeout -k 1 40 codex exec --dangerously-bypass-approvals-and-sandbox -m gpt-5.5 -c model_reasoning_effort="medium" "$(cat ~/task.md)" < /dev/null >> ~/log 2>&1` in `~/gr` (NOT the mount). Then loop `codex exec resume <session-id> ... "continue (supervisor checkpoint — check disk, don't redo)"` until exit 0. m1-02 took ~13 chunks + 1 correction round.
- Model: **gpt-5.5** (Robin wants it). Effort `medium`; `xhigh` thinks past the 40s window.
- Tell Codex in every task: supervisor interrupts+resumes; many short commands; one small patch per file part; servers die between chunks; NEVER `npx playwright install`; playwright per spec file `--reporter=dot --timeout=15000`.
- When Codex livelocks or lacks browsers, run the gate YOURSELF and resume it with the result.

## Verification lessons (cumulative)
- **NEVER truncate playwright output — count summaries: `grep -E "[0-9]+ (passed|failed|skipped)"`.**
- **E2e must run SERIAL on SwiftShader** — `--fully-parallel --workers=3` produced 2 false failures (CPU contention). Slice suites per test with `-g` to fit the 40s bash wall; use `-c pw.reuse.config.ts` (port 5189 + reuseExistingServer; start `npx vite --port 5189 --strictPort` in the same call).
- **Keyboard-driven e2e is deprecated for actions.** At ~16fps headless, a `press()` (~30ms) can land entirely between frames of the edge-triggered intent sampler: KeyT spam collapsed (thin spawns), second KeyP vanished (pause stuck). Use `__GR_TEST__.spawnPack/state/resetRun/teleport` under `?debug`; where the key IS the contract, hold it ≥160ms (`holdKey` helper in visual.spec). Hero-movement test still keyboard-driven (works; migrate when flaky).
- Post-m1-02, death e2e must OVERWHELM (6+ packs immediately): the rig out-fights thin spawns; iframes cap intake at 16 dmg/s → death ≈6.5s sim regardless of enemy count.
- Headless SwiftShader ceiling 17–22 fps; fps gate = ≥12 floor. Draw calls meaningful: 23 @ 8-enemy fight, budget ≤200.
- Live-probe pattern for behavior bugs: one bash call = vite in subshell + playwright-api node script sampling `__THREE_GAME_DIAGNOSTICS__` every 500ms. Found the 0-dmg blocker (slot read after deactivate) in two probes after e2e only said "enemies don't die".
- `?timescale=N` scales the WHOLE sim. Their feedback Vfx animates on real `delta` by design (banners readable while paused) — don't "fix" it to simDelta.

## Session collision protocol (new, after today's near-miss)
- The feedback session ran concurrently WITHOUT an ACTIVE lock and committed `0a4cf2f` mid-run; its STATUS write-back also reverted this session's lock. **Any session (manual included) must set `ACTIVE <ISO>` in STATUS.md on start and clear it at end.** If you find newer commits on the mount than your ~/gr baseline when rsyncing back: STOP, `git log`, 3-way merge (base = your baseline commit) — never commit a clobbered tree. Restore their-only files via `git checkout HEAD --`, merge shared files with `git merge-file`, re-run the full suite before committing.

## Codex sessions (resumable)
- A (combat, m1-01 + enemy instancing): `019f266c-2120-75d0-b86a-2ff59bf12b9a`
- B (economy, m1-04 + seam instancing): `019f266c-d5e3-73c3-9dfe-e9b002893366`
- C (combat, m1-02 spark rig + fixes): `019f26c3-f4c7-7c40-8fff-804894719f3e`
- New slices: start fresh sessions.

## Open reviews / carried minors
- Bolt readability: teal washes toward white under tone-mapping at gameplay zoom → m1-07 (emissive/size/tracer) or batch-001 `vfx.bolt`.
- Dust-puff reads black; Frontier Ledger wants tan/parchment dust → m1-07.
- Seam cluster subtle at gameplay zoom → m1-07 charm pass or batch-001 art.
- River hue leans green under sun tint (placeholder tolerance) → batch-001 `terrain-river-tile.png`.
- Camera: feedback session moved to 57° (`0a4cf2f`) — verify Robin likes it in playtest; m1-07 tuning axis retained.
- HarvestSystem has no `reset()` — seam capacity/timers persist across in-run restart. Fold into m1/05 (touches Economy spending anyway).
- Hero movement e2e in visual.spec still keyboard-driven (works; leave until flaky).

## Robin owes (non-blocking)
- M0 (+ now M1 partial) playtest + sign-off — deferred per standing authorization 2026-07-03; ladder continues.
- batch-001 generation budget OK (`assets/LEDGER.md`), then paste prompts from `assets/requests/batch-001.md` into ChatGPT, downloads → `assets/raw/` exact filenames.
- FYI: two sessions collided today (see collision protocol) — resolved, nothing lost; if the parallel "feedback" session is his manual Cowork tab, ask him to keep it to non-src files while the scheduled loop is on, or let the loop pick up his feedback as tasks.

## Done log
- 2026-07-03 (s1): repo skeleton `e439424` → specs+assets `bc87a96` → m0-01..05 (`a82d66c`,`7330e70`,`a4dea14`,`dbb62b4`,`4d435de`) → m1-01 `b4cb01d` → m1-04+perf `a873bc5` → docs `e1164ec`.
- 2026-07-03 (feedback session, parallel): `0a4cf2f` banner/float-text/pacing/57° camera.
- 2026-07-03 (s2, scheduled): m1-02 Spark Rig `06f4231` — Codex C, 1 batched correction round (0-dmg slot-order blocker found by live probe), mid-flight 3-way merge with `0a4cf2f`, e2e 18/18, e2e modernization for the post-rig world.
