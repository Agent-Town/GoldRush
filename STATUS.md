# STATUS — Gold Rush

Last updated: 2026-07-03 (session 1, end)

## Where we are
- **M0 Skeleton: all 5 slices done + committed.** Awaiting Robin playtest + sign-off (run `npm install && npm run dev` in the project folder; docs/DEPLOY.md).
- **M1 Core loop: slices 01 (Claim Jumpers + death/restart) and 04 (gold panning + Economy) done, merged, reviewed, committed** (`a873bc5`). Built by two parallel Codex lanes.
- Next slice: **m1/02-auto-fire-spark-rig**, then 03 (wave pressure, first fun verdict), then 05/06, then 07 tune gate.

## How to resume (next session — do this, in order)
1. Enable file deletion (`allow_cowork_file_delete` on any path in the repo) BEFORE any rm/git work.
2. Re-provision sandbox: `npm config set prefix ~/.npm-global && export PATH=~/.npm-global/bin:$PATH && npm i -g @openai/codex`; copy `.codex-auth/auth.json → ~/.codex/auth.json`; write `~/.codex/config.toml` trusting `/sessions/<session>/mnt/Gold Rush` AND `~/gr`; `apt-get download libxdamage1 && dpkg -x libxdamage1*.deb ~/locallibs` (for Playwright: `export LD_LIBRARY_PATH=~/locallibs/usr/lib/aarch64-linux-gnu`).
3. Rebuild the Codex working copy: `rsync -a --exclude node_modules --exclude .git mnt/Gold\ Rush/ ~/gr/ && cd ~/gr && npm i --prefer-offline && git init -qb main && git add -A && git commit -qm baseline`.
4. Delegate m1/02 per the chunked protocol below. One slice per Codex session; review; rsync back **remembering deletions don't propagate — check for resurrected files** (`git status` on mount after rsync; known-stale list: none currently).

## Codex chunked-exec protocol (proven)
- No background processes survive a bash call (`bwrap --die-with-parent`); `/tmp` is per-call. Logs/prompts live in `~`.
- Launch: `timeout -k 1 40 codex exec --dangerously-bypass-approvals-and-sandbox -m gpt-5.5 "$(cat ~/task.md)" < /dev/null >> ~/log 2>&1` in `~/gr` (NOT the mount — codex bus-errors on heavy edits there). Then loop `codex exec resume <session-id> ... "continue (supervisor checkpoint — check disk, don't redo)"` until exit 0.
- Model: **gpt-5.5** (Robin wants it; `-fast`/`-codex` variants rejected on subscription auth). Effort: start `medium`; `xhigh` thinks past the 40s window and loses turns. Robin has token resets — don't ration.
- Tell Codex in every task: supervisor interrupts+resumes; many short commands; one small patch per file part; servers die between chunks; NEVER `npx playwright install`; playwright runs `--reporter=dot --timeout=15000` per spec file.
- When Codex livelocks on a long verification run, run the gate YOURSELF and resume it with the result.

## Verification lessons (hard-won today)
- **NEVER truncate playwright output to `tail -1/-2` — count lines: `grep -E "[0-9]+ (passed|failed|skipped)"`.** A truncated summary hid 2 failures and cost an hour.
- Headless SwiftShader ceiling: 17–22 fps regardless of scene (pre-M1 empty baseline 22). e2e fps gate = ≥12 floor (sim-explosion detector); real 60 fps = Robin's hardware at milestones. Draw calls ARE meaningful headless: budget ≤200, currently 18 @ stress=120.
- Interaction tests use the `?debug` teleport harness (`window.__GR_TEST__.teleport(x,z)`) — never keyboard-park the hero in tests.
- `?timescale=N` scales the WHOLE sim (hero, enemies, harvest) since the unification in `a873bc5`. Keep it uniform; split clocks broke cross-lane tests.
- Parallel lanes: lane B works in `~/grB` (clone); merge = new files copied + shared-file hunks 3-way applied vs the `pre-m1`-style tag; watch `Game.ts`/`Balance.ts`/`UiBridge.ts`/`vite-env.d.ts` overlaps.

## Codex sessions (resumable)
- A (combat, m1-01 + enemy instancing): `019f266c-2120-75d0-b86a-2ff59bf12b9a`
- B (economy, m1-04 + seam instancing): `019f266c-d5e3-73c3-9dfe-e9b002893366`
- New slices: start fresh sessions.

## Open reviews / carried minors
- Seam cluster subtle at gameplay zoom → m1-07 charm pass or batch-001 art.
- River hue leans green under sun tint (placeholder tolerance) → batch-001 `terrain-river-tile.png`.
- Camera pitch is 65.6° actual vs "57°" spec prose (spec math error, shot approved) → m1-07 tuning axis.
- HarvestSystem has no `reset()` — seam capacity/timers persist across in-run restart. Fold into m1/05 task (touches Economy spending anyway) or a 10-line fix next session.
- Hero movement e2e in visual.spec still keyboard-driven (works; leave until flaky).

## Robin owes (non-blocking)
- M0 playtest + sign-off (M1 lanes proceeded per his acceleration request — reversible, all reviewed).
- batch-001 generation budget OK (`assets/LEDGER.md`), then paste prompts from `assets/requests/batch-001.md` into ChatGPT, downloads → `assets/raw/` with exact filenames.

## Done log
- 2026-07-03: repo skeleton `e439424` → specs+assets `bc87a96` → m0-01 `a82d66c` → m0-02 `7330e70` → m0-03 `a4dea14` → m0-04 `dbb62b4` → m0-05 `4d435de` → m1-01 `b4cb01d` → m1-04+perf+integration `a873bc5`. Interview decisions in docs/decisions/ADR-001 + specs. Codex = sandbox CLI (subscription auth.json), chunked. 2 parallel lanes ran; drafts fanned out ×3 for specs.
