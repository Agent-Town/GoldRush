# STATUS — Gold Rush

Last updated: 2026-07-03T23:30Z (Codex takeover — **M1 CODE-COMPLETE & SPEC-CLOSED, 51/51**. NO ACTIVE lock. Codex now owns orchestration; Claude scheduled build tasks are legacy/paused.)

## Where we are
- **M1: DONE (code) — 01–08 all shipped & spec-closed (s8, 2026-07-04). Full regression 51/51.** m1-08 = wave18 (`adfb1bc`) + wave23 card corrections (`12af31e` + harness/evidence `bfe9e0d`). Robin still needs to playtest/sign off, but Codex orchestration is no longer paused.
- **Current Codex priority:** `specs/visual-polish/slices/01-batch001-asset-integration.md`. The six PNGs exist in `assets/processed/`, but `assets/LEDGER.md` still marks them unintegrated and the game renders placeholders. Do this small visual-polish slice before M2.
- **After asset integration / Robin's M1 verdict:** continue with `specs/m2-base-waves/README.md`, starting at M2-01 buildable registry/menu.
- **M0: all 5 slices done.** M0 sign-off rolls into the M1 playtest.
- **s8 handoff:** folded Robin's wave23 round into m1-08 via Codex `019f2a21`: fillers scale (assay +5×wave, dressing 30% maxHp, sharpen unchanged), procedural glyphs removed, cards slimmed, `__GR_TEST__.maxUpgrades` added. Evidence: 51/51 hermetic, desktop+mobile+filler screenshots, screenshot-critique PASS. batch-002 icon prompts written.
- **s6 handoff (2026-07-03 eve): COLLISION ACCOUNT + ports.** s6 started on a 3h-old s5 ACTIVE lock (task-file guard: 150 min) while s5 was still live → both lanes built m1-07 in parallel. s5's landed (`c2a46b9`, richer, reviewed) — s6's duplicate was DISCARDED (implementation `~/gr-mine` in s6's VM only, Codex session `019f285a-f5a9-7b23-bf08-bcc7b217244f`, do not resume). Salvaged from s6's lane with fresh evidence, committed `93ddbae` on top of s5: (1) **InputController sub-frame tap buffer** — real game bug, keydown+keyup inside one frame gap dropped the press; on s6's 6fps VM, Enter-to-build was lost ~50% of presses (probe: confirm() never called, 3/3 fixed after). Benefits all tap keys incl. 1/2/3 picks on slow machines. (2) **m1-02 bolt-pool assert → in-page rAF max-tracker** (protocol polling read 0 bolts across 20 samples at 6fps while kills advanced). s6's hitPause-cooldown patch was dropped — s5's charm impl already has cooldown+clamp (verified). LOCK RULE FIX: overlap guard now honors ANY ACTIVE lock <3h (per §protocol) — the 150-min task-file window caused this; if the scheduled task fires while a lock is <3h old, exit. Robin: consider updating the scheduled-task prompt's 150 to 180+ min.
- **s5 handoff (m1-07, `c2a46b9` + review `m1-07-feel-and-tune-prep.md`):** 45/45 regression HERMETIC (see environment rule below), tsc/build clean, evidence shots in `reviews/shots-m1-07/`. Codex G `019f2845-9049-7970-ae36-5dcf45f38611`. New harness: `?nopause`, `__GR_TEST__.setBalance/clearScores`, `test.setTimeout(45s)` on m1-06 maxed (trace cost of richer card DOM).
- **s5 ENVIRONMENT RULE (supersedes pw.reuse guidance): bash calls live in separate PID namespaces — background vites from earlier calls turn into invisible, unkillable zombies serving STALE module caches, and multiple listeners round-robin one port.** Never trust a reused server: run e2e ONLY via base `playwright.config.ts` (own webServer per run); probes/screenshots = vite + client in the SAME bash call on a virgin port + freshness-check a new-API symbol first. Also: headless_shell-1228 SIGSEGVs on this image → `channel:'chromium'` committed; full chrome needed the `data:,` favicon (committed). Provisioning from wiped home works: npm i (34 pkgs, lockfile), `npx playwright install chromium` OK (shell binary broken anyway — full binary is what we use), libxdamage1 via `apt-get download` + `dpkg -x ~/locallibs`.

## Session collision protocol (BINDING — unchanged)
1. On start: read the `Last updated` line. `ACTIVE <ts>` < 3 h old → another lane is live: docs/review/probe only.
2. Set `ACTIVE <ISO>` + commit on start; clear it in the handoff commit.
3. Before rsync-back: `git log --oneline -3` on the mount; newer commits than your ~/gr baseline → STOP, 3-way merge, re-run suite.
4. rsync-back excludes `STATUS.md` and `specs/` (edit those ON the mount); also exclude `test-results/`, `playwright-report/`, `dist/`. Do NOT use `--delete` on rsync-back (review files live mount-side only); rebuild-direction (mount→gr) keeps `--delete`.

## How to resume (next session — in order)
1. Load `allow_cowork_file_delete` tool BEFORE any rm/git work (call it only when a delete actually fails).
2. Re-provision sandbox (VM home may be wiped — s4 found codex/auth/libs INTACT but ~/gr stale and git identity missing): `git config --global user.name/email`; `export PATH=~/.npm-global/bin:$PATH; codex login status` (expect "Logged in using ChatGPT"); `ls ~/locallibs/usr/lib/aarch64-linux-gnu` (libXdamage); `ls ~/.cache/ms-playwright` (chromium-1228 — NEVER `npx playwright install`); Playwright runs need `export LD_LIBRARY_PATH=~/locallibs/usr/lib/aarch64-linux-gnu`.
3. Rebuild ~/gr: `rm -rf ~/gr/.git && rsync -a --delete --exclude node_modules --exclude .git "mnt/Gold Rush/" ~/gr/ && cd ~/gr && npm i --prefer-offline && git init -qb main && git add -A && git commit -qm baseline`.
4. Verify baseline green (see verification lessons), then 07 prep / M2 spec work.

## Codex chunked-exec protocol (proven; sessions E/F took ~15 chunks each)
- Launch in `~/gr`: `timeout -k 1 40 codex exec --dangerously-bypass-approvals-and-sandbox -m gpt-5.5 -c model_reasoning_effort="medium" "$(cat ~/task.md)" < /dev/null >> ~/log 2>&1`; loop `codex exec resume <id> ...` until exit 0 (124 = keep resuming).
- Task file must include: interrupted+resumed warning, write-files-early, servers die, NEVER playwright install, LD_LIBRARY_PATH, no git commit, don't touch STATUS/specs/reviews/existing e2e, and "reply READY-FOR-GATES — supervisor runs gates".
- **s4 lesson — write-livelock remedy:** if chunks keep dying mid-write ("writing X now" with nothing on disk), switch resumes to `model_reasoning_effort="low"` + explicit "TWO apply_patch calls of ~60 lines each, first tool call immediately, ZERO prose". Un-stuck both E and F instantly. Medium reasoning for planning/integration chunks, low for mechanical writing.
- Per-file progress probes (`wc -l`, `grep -c`) after each chunk beat reading the log.

## Verification lessons (cumulative — s6 additions at top)
- **s6 env variance:** VM home fully wiped (rebuild recipe worked; `.codex-auth/auth.json` on the mount is the auth seed); /sessions disk hit 100% (other tenants) → playwright browsers now live at `/tmp/pw-browsers` via `~/.cache/ms-playwright` symlink — RE-CHECK the symlink next session (/tmp wipes on VM restart); chromium fetched direct: `curl -C - https://cdn.playwright.dev/dbazure/download/playwright/builds/chromium/1228/chromium-linux-arm64.zip` (playwright install never fits the 45s wall). Background processes reaped ~60-90s (`setsid nohup` included): vite MUST start in the same bash call as its test batch — `fuser -k 5189/tcp; (npx vite --port 5189 --strictPort &) && sleep 3 && curl -s guard` then ONE batch <35s. This per-call kill+fresh-vite pattern also dodges s5's zombie-vite/stale-code hazard.
- **Headless fps floor is a fiction under load: s6 saw 6fps** (vs s4's 17-22) — ALL throughput/visibility asserts must be in-page rAF trackers, never protocol polling (m1-02 hardened `93ddbae`; m1-06 was already right).
- **Overlay `visible` lies:** hidden overlays are opacity-hidden → playwright counts them visible; `heroHp` is NOT a diagnostics key (`?? 100` guards made waits pass vacuously). Death waits: poll `state === 'dead'` or use the suite's `forceDeath`. Separation rings CAP contact DPS — huge point-blank packs form a donut and stall (~4 contacts/4s); overwhelm ≠ big pack, use forceDeath's repeated tight spawns.
- **Probe-your-probe:** two s6 misdiagnoses (hit-pause "perma-freeze", "death never happens") came from polling nonexistent keys / protocol sampling. Verify the observable exists (`JSON.stringify` drops undefined silently) before trusting a 0.

- **New-mechanic slices change sim semantics under OLD suites — always run the FULL regression, never just the new spec file.** m1-06's level-freeze deadlocked m1-01's death test (caught) and made m1-02's kill counts a mote-collection race (latent). Fix pattern: harness param family — `?nolevel` (XP math intact, no offer/freeze) joins `?nowaves/?nokill/?nospawn`.
- **Bolt-diffusion:** dumb bolts hit the first pool-ordered enemy on the flight line — in a clump, damage diffuses (probed: 7/7 hits, 56 dmg, zero kills across 6×28 HP). Kill-attribution asserts need SINGLE-enemy scenarios (all bolts concentrate → deterministic kill). Receding/approaching targets always get hit; crossers/clumps diffuse.
- **Playwright tracing (`retain-on-failure`) records during passing runs and shifts timing** — it re-rolls race coins. Never chase trace-on-vs-off as the bug; find the underlying nondeterminism (probe at volley/hit level with temporary guarded console.warn instrumentation — then REVERT it).
- **Renderer-memory leak gates need a warm cycle along the measured camera path** — first visibility lazily uploads frustum-culled geometry (+1 on a mere teleport). Pattern: run one full identical cycle before baselining (m1-05 reset test), plus `__GR_TEST__.warmVfx()` for the float-text pool (m1-01/02).
- **Sub-frame windows (volley-2 double bolt ≈ 1 headless frame) can't be seen by protocol polling** — install an in-page rAF max-tracker via evaluate and read it after.
- **aria/page snapshots list HIDDEN overlays** (death + upgrade overlays are permanently in DOM) — don't misread them as visible when debugging failures.
- Freeze/drift asserts: never compare against a pre-keypress sample (sim runs between sample and key landing — 0.45 s at ×3); assert within the frozen window and use the identity `Δ(nextWaveInSim) ≡ Δ(timeAlive)` for un-drift.
- Count summaries: `grep -E "[0-9]+ (passed|failed|skipped)"` — never tail. E2e SERIAL (`--workers=1`), `--project=desktop-chrome` (23→38 tests), per spec file, `-g` batches sized <35 s; ONE batch per bash call (two in one call breached the 45 s wall).
- `pw.reuse.config.ts` (port 5189) + guarded start: `(curl -s -o /dev/null http://127.0.0.1:5189/ || ((npx vite --port 5189 --strictPort >log 2>&1 &) && sleep 3))` — orphan vite sometimes survives between calls, sometimes not. Kill only via `fuser -k 5189/tcp`.
- Death tests must OVERWHELM; spawnPack lands ON the hero — a 4-pack vs an upgraded rig is a death coin flip, use 1-enemy packs for non-death asserts.
- Headless SwiftShader 17–22 fps; fps floor ≥12; draw calls are the real gate (≤200; now ~35 with 6 beacons @ stress=120). frameMs avg/p95 in diagnostics.
- `__GR_TEST__` surface: teleport, spawnPack, resetRun, warmVfx, grantGold, grantXp, setBuildMode, placeBeacon, state. Debug keys: T pack, X +50 XP (?debug only).

## Codex sessions (resumable)
- A (m1-01) `019f266c-2120-75d0-b86a-2ff59bf12b9a` · B (m1-04) `019f266c-d5e3-73c3-9dfe-e9b002893366` · C (m1-02) `019f26c3-f4c7-7c40-8fff-804894719f3e` · D (m1-03) `019f2701-f227-7710-a6f1-884cb5d10232` · feedback `019f26bd-3944-76a3-a8a7-b19089b2d4f4` · **E (m1-05) `019f2741-d3eb-7962-b9b3-7946d440d98c` · F (m1-06) `019f277f-e96a-7513-8a9a-30b4442485de`**. (`019f26e4-8174…` = discarded dup — do not resume.) New slices: fresh sessions.

## Open reviews / carried minors
- **Dark-wood props read black** at gameplay zoom (M0 claim posts + stumps, `palette.wood`) — same tonal family as dust-puff-reads-black and teal-bolt-washout → one lighting/palette item in m1-07 + batch-001.
- **split_spark implements +1 bolt SAME target** (single combat path); README flavor said "next-nearest" — Robin call at 07 gate whether the feel needs true split (targeting change).
- Vfx floatText is NOT string-cached (s3 note was wrong — verified): dispose+create canvas per call, bounded by pool 12. Fine at current pickup volume; revisit only if 07 profiling flags it.
- Upgrade weights all = 1 (uniform); offer UX (hover states, pick flourish) → 07 charm pass.
- Mobile: build ghost = hero-position fallback (no touch-drag), level cards tight at 390 px but readable; ?debug lil-gui overlaps card 1 (debug-only) → M2 build-UX + 07 notes.
- Camera 57° (`0a4cf2f`) — confirm with Robin at 07; all camera knobs already in ?debug gui.
- Intermittent dark rectangle in `?debug` screenshots only — still present in s4 debug shots, never in default views; keep watching, escalate only if it reaches Robin's hardware/default views.
- `?stress` bypasses the wave alive-cap by design; beacon pool pre-allocated ×6 (InstancedMesh parts) — don't "fix" either.

## Robin owes (non-blocking)
- **Playtest M1 01–06 — the whole loop is live** (`npm install && npm run dev`): pan, build a beacon (B), level up (or press X under `?debug` to force it), pick cards with 1/2/3. Fun verdicts: waves (03) recorded NOT FLAT; beacons+levels need his hands.
- batch-001: paste `assets/requests/batch-001.md` prompts into ChatGPT, downloads → `assets/raw/` exact filenames.
- 07-gate questions queued: camera 57°, split_spark same-target vs next-nearest, beacon cost curve feel (25/35/45/55/75/95).

## Done log
- 2026-07-04 (s8, took over DEAD s7 lock @5h): re-provisioned wiped VM (codex/libs/playwright/~gr) → committed s7's orphaned wave18 (`adfb1bc`) → **wave23** card corrections via Codex `019f2a21` (`12af31e`) → `maxUpgrades` harness + **51/51** regression + card screenshots/critique PASS (`bfe9e0d`) → **M1 spec-CLOSED**, STATUS/README updated, batch-002 icon prompts written. Root cause of Robin's "lost work" worry: s7 died mid-slice leaving wave18 staged-but-uncommitted. PAUSED for Robin per his request; lock cleared.
- 2026-07-03 (s5 scheduled, long-runner): env re-provision from wiped home + chromium-channel fix `(in 851896a)` → **m1-07 `c2a46b9`** (lil-gui seam, hit-pause/impulse, coin-tick, D1–D5 directives, tonal pass; Codex G, 1 correction round + %-suffix supervisor fix) → zombie-vite forensics → review + this handoff. Overlapped s6 from ~14:08Z (art batch `68f1c53`, playtest docs) — disjoint paths, no conflicts.
- 2026-07-03 (s1): skeleton `e439424` → specs `bc87a96` → m0-01..05 → m1-01 `b4cb01d` → m1-04 `a873bc5` → docs `e1164ec`.
- 2026-07-03 (s3 feedback lane): `0a4cf2f` F1–F4.
- 2026-07-03 (s2 scheduled): m1-02 `06f4231`, handoff `7942d54`.
- 2026-07-03 (s3 manual): collision resolved; m1-03 `7b5180f` (fun verdict NOT FLAT); handoff `e9158db`/`9860fd4`.
- 2026-07-03 (s4 manual): lock `152dce4` → **XP-float directive `4849825`** (+ warmVfx leak-gate hardening) → **m1-05 `60f8552`** (beacons; bolt-diffusion probe; 4 supervisor fixes) → **m1-06 `448407f`** (levels; `?nolevel`; full-suite semantic sweep) → this handoff (ACTIVE cleared).

## Robin directives (2026-07-03 — status)
1. **DONE `4849825`** — XP motes float teal `+N` at pickup. The standing rule (every collectible/pickup floats its amount, e2e-asserted) is codified in `specs/m1-core-loop/README.md` invariants; write it into every future item/drop slice.
2. Robin playtests the live working tree — main is playable at every commit (verified each slice); 15-min pings + 3 h build sessions continue via scheduled tasks.
3. Level-ups now consume XP (m1-06) — the "XP accrues past need" reminder is obsolete.

## Robin playtest wave-10 (2026-07-03 late) — BINDING for m1-07, read docs/playtests/2026-07-03-robin-wave10.md
Fun verdict POSITIVE ("I enjoy it", reached wave 10). Directives: (1) upgrade cards get effect text + placeholder icons; (2) adopt his Balance defaults — camera lag .15 / lookAhead 1.35 / offset (0,26.2,18.3) / downLook 3.35, exposure 0.75; (3) XP readability into the tonal pass; (4) rename death CTA "Stake Again"→"Try Again" (+e2e assert update); (5) local top-5 scoreboard on death screen (localStorage). Backlog → M2 specs: multi-weapon + AOE buildables. → M3: skill tree. M1 exit = directives applied + Robin confirms defaults.

## Art batch-001 generated 2026-07-03T15:05Z — 6/6 raw+processed in assets/
All six batch-001 slots (hero-homesteader, enemy-claim-jumper, node-gold-seam, bld-sentry-beacon, terrain-bank-tile, terrain-river-tile) are generated (1254² raw PNGs) and processed (1024² game-ready; cutouts alpha-keyed via new `scripts/extract-alpha.mjs`, terrain full-bleed). Per-slot visual review + pipeline notes (incl. why generation ran through ChatGPT web relay instead of Codex CLI, and the 7-call budget accounting) in `assets/LEDGER.md`. NEXT CODE SESSION: wire processed art to slots per `assets/layer-contracts/m1-core.layer-contract.v1.json` (billboard sprites for char.*/node.*/bld.* slots, textures for terrain.bank/terrain.river), screenshot in-game, visual review vs brief §4.1, then mark LEDGER Integrated. Keep placeholders as fallback for missing/failed slots. Duplicate raws also sit in ~/Downloads (same filenames) — safe to delete.
