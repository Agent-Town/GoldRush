# STATUS — Gold Rush

Last updated: ACTIVE 2026-07-03T11:07:00Z (session 5 — scheduled lane; m1-07 prep + M2 specs)

## Where we are
- **M0: all 5 slices done.** Awaiting Robin playtest + sign-off.
- **M1: 01–06 done, reviewed, committed. Only 07 (feel-and-tune gate) remains → Robin playtest = M1 exit.**
  - Session 4 (this): Robin directive #1 XP float `4849825` → m1-05 Sentry Beacons `60f8552` (`reviews/m1-05-sentry-beacon-build.md`) → m1-06 level-up choices `448407f` (`reviews/m1-06-level-up-choices.md`).
  - The full core loop is now playable end to end: move/pan/kite → auto-fire → waves escalate → gold → build beacons (B, teal/rust ghost, Enter/click) → XP motes float `+3` → level-up freezes sim → 3 parchment Patent-Office cards (1/2/3) → visible run change → death → Stake Again.
- Full regression at session end: **38/38** across 8 spec files (visual 5, feedback-fx 3, m1-01 4, m1-02 3, m1-03 5, m1-04 4, m1-05 6, m1-06 8), tsc clean, build green, draw calls 35 @ `?stress=120` + 6 beacons (budget ≤200).
- Next: **m1/07-feel-and-tune-gate** — orchestrator can prep lil-gui Balance bindings under `?debug` (the only allowed new dep: `lil-gui`) + charm pass; the gate verdict itself needs Robin. After M1 exit: write M2 specs (`feature-slicing`).

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

## Verification lessons (cumulative — additions from s4 at top)
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
