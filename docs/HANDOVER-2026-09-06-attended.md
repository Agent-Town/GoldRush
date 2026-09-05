# HANDOVER 2026-09-06 (attended, the overnight Opus wave) — read this first, then `STATUS.md` line 1, then the top rows of `tasks/BACKLOG.md`

Written by the attended session at the end of the night the owner asked for ("How do we get all the contracts to finish? … We have a lot of subscription left and I want to use it all until tomorrow. Can you push hard while I sleep?", 2026-09-05). Every claim below was verified by a command in that session; every hash is on `main` and pushed to origin. Verify with `git log`, never inherit (Mistake #4).

## 1. What the owner can play this morning
- **Production** https://agenttown.app/goldrush (alias of https://gold-rush-3in.pages.dev), E1 release. Deployed twice tonight: `220886ab` (the E7–E9 chapters, budget PASS desktop 11.96 MB / mobile 15.64 MB of 25 MB, assayer synced) and then the tree at `3691960c4` with the four fixes below (see the deploy log line in the BACKLOG top rows for its verdict). Carries the whole Astra wave from earlier in the night (Stillwater v2, bounded prefetch, hard budget verdict, shared atlas, Lantern world reel, asset-diet manifest, GLB contract guard, triangle sampler, Homemaker fix, town-hall prefetch, renderer-count re-pins, lighting calibration with the `?lighting=legacy` veto) and the story chapters E4–E9 as data.
- **Full-board preview, everything unlocked for testing:** https://full-board.gold-rush-3in.pages.dev/ at tree `3691960c4`. Open the town board and press **"Open every claim"** (preview builds only; the E1 release bundle carries none of it, proved on the built text twice). Every opened card is tagged "Opened for testing"; standings are unaffected; "Lock the board again" restores the real frontier. All 42 contracts and all ten chapters are reachable; the three Deep Sky maps (`e10-ember-shore`, `e10-archive-world`, `e10-river`) now open as themselves instead of falling back to The Claim.
- **The owner's own verdict rows** are still owed on his devices: `docs/release/RELEASE-VERDICT.md`. The deploy prints `WARN missing docs/release/verdict-<build>.md` until one exists.

## 2. What shipped tonight (merge hash → row in `tasks/BACKLOG.md` → review in `reviews/`)
| Slice | Merge | What the player gets | Review |
|---|---|---|---|
| ss-05 / ss-06 / ss-07 (E4, E5, E6 chapters) | `4e58d637a`, `eb7529a11`, `373638978` | the Motor, Deepwater and Atomic chapters as data | `reviews/ss-05-e4-beats.md`, `ss-06-e5-beats.md`, `ss-07-e6-beats.md` |
| ss-09 (E8 chapter) | `642f0ae9e` | the Orbital Frontier, 17 beats | `reviews/ss-09-e8-beats.md` |
| ss-08 (E7 chapter) | `1a259941f` | the Signal Era, 15 beats | `reviews/ss-08-e7-beats.md` |
| ss-10 (E9 chapter) | `53ad974d7` | the Red Fields, 15 beats | `reviews/ss-10-e9-beats.md` |
| perf-optimization-survey | `7e85c9e43` | the county's first full performance survey (no game code) | `reviews/perf-optimization-survey.md`, report `docs/reviews/2026-09-05-perf-survey.md` |
| e10-empty-harvest-anchors-unlaunchable | `b31adf7b1` | the three Deep Sky maps launch as themselves; no board contract is refused by the browser | `reviews/e10-empty-harvest-anchors-unlaunchable.md` |
| preview-unlock-all | `1119a4e90` | "Open every claim" on the board in preview builds | `reviews/preview-unlock-all.md` |
| e6-picnic-thirty-second-death | `87abff832` | the Picnic card explains the hold; the hero never died there (F-SMOKE-2 corrected) | `reviews/e6-picnic-thirty-second-death.md` |
| story-signal-emitters | `85900872f` | wave-complete, rung-promotion, science-threshold, first-boot fire; six orphaned E1 beats appear in play | `reviews/story-signal-emitters.md` |
| playability-smoke-36 (earlier) | `637b45845` | `npm run test:playability`: 42 contracts × 2 projects, plain boot | ledger row |

Era pins appended tonight (all era 5, same era per F-1441-3): `1052ba1a` (E8), `583c7743` (E7+E8+E9), `22682002` (anchors), `32d89821` (unlock-all), `e5c60809` (picnic), `9b2b30d8` (emitters). The registry's top-level `engineHash` is the last one.

## 3. Still in flight when this was written (verify with `git log main..<branch>`)
- **ss-11-e10-beats** (E10 chapter, lane-c, Claude Opus 5): three commits on `lane/c` at the time of writing, the agent still hardening its spec. Drain recipe: `beats.ts` = main's content up to the trailing `STORY_RUNTIME_BEATS` export + the lane's block from its `// Chapter E10` header; `StoryRuntime.ts` = union of import names + one switch line; re-hash on the merged tree and pin; gate `ss-11` with `ss-09`/`ss-10` and `story-loop`. If the attended session drained it before you read this, its row is at the top of the BACKLOG.
- **gauntlet-heat12-opus-sweep** (branch `heat12/opus-sweep`, detached arena `/private/tmp/heat12-038cc280`, 11 commits): Claude Opus 5 riding the county's contracts; its receipts land on the branch for a drain that verifies every tape by replay before any standing is published.
- **Runner state:** codex quota exhausted since ~14:00 on 2026-09-05 ("try again Sep 12" at the wall, trickling back); the fires switched to the codex engine earlier and ride the same quota, so the fire cadence has been mostly no-op handoffs. The attended session did the night's drains directly.

## 4. Owner's desk (each has a BACKLOG row with options and a recommendation)
- **F-PERF-14 / contract lineage (the one decision that unblocks the rest):** `county-e3-moth-season` no longer replays to its own hash after today's composition change (`9be0399e` vs `64e32dde`, 16,390 vs 10,801 ticks), reproduced by two independent verifiers; the assayer verifies standings by that hash. F-PICNIC-3 is the same fact seen from the null floors (10 stale `eventLogHash` rows: moth season ×2 and the four E8 maps ×2). Recommendation: (a) re-record the county tape now, and (b) rule that a mechanic change re-opens its contract's board as the standing lineage law (F-E8RM-8's row).
- **F-DISK-1:** every parallel worktree is a ~14 GB full checkout; nine tonight took the 3.6 TB volume to zero twice (an `ENOSPC` truncated the BACKLOG mid-write in a lane, restored byte-for-byte). Recommendation: sparse-checkout `artifacts/`, `logs/`, `tasks/runs/` out of lane and scratch worktrees, or LFS. Nothing tracked or retained was deleted; ~90 GB of regenerable output was freed.
- **One art batch for E5–E9:** five chapters name townsfolk with raw `assets/raw/tf-*` portraits and no processed entry, so they speak through registered speakers. One extraction batch plus `speakers.ts` rows unlocks real speaker ids for E5, E6, E7, E8 and E9 at once (art task, fire-authorable).
- **Story follow-ups, all small and fire-authorable from their rows:** `boss-act-signals` (the Claw's and the Digger's acts reach no beat: F-SS09-3, F-SS10-1), `run-return-town` contract id (F-SS06-2), a `first-boot` beat row (F-SSE-1), the first-boot key in `PROFILE_DATA_KEYS` (F-SSE-3), `picnicHold` in the diagnostics type (F-PICNIC-2), the storybook's stale PROPOSAL tag on Chalk (F-SS08-2), `npm:test:playability` in the gate-caller baseline (F-E10L-3), a sweep of preview surfaces guarded by runtime tests instead of define folds (F-UNLOCK-3).
- **Standing items:** F-CLI-2 (`~/.codex/config.toml` still carries `service_tier = "priority"`, today-only by the owner's word; revert when the quota resets), the REVERT-LIGHTING veto window, the OpenRouter key, the rotation-salt backup, the device verdict rows.

## 5. Laws learned tonight (also in the session memory)
- Implementer agents must stop only the PIDs they started. Two attended gates on port 5273 were killed (exit 144) by implementers' `pkill -f` cleanups; every later brief carries the rule.
- A pin's `cause` text ships inside the release bundle (`LanternController`, `BrowserAgentTapeWorker`): never quote a preview-only string in `assets/engine-era.json` (F-UNLOCK-5).
- Under host load 45–80 e2e reds flip project between runs. A red counts only when it reproduces alone at one worker on a quiet host. Tonight's flips (`ss-09:141`, `story-loop:206`, `story-loop:228`) all went 4/4 at load 10; F-2460-2's three (`ss-01:103`, `ss-03:52`, `story-loop:185`) remain the only standing story reds.
- Merging chapters that append at the same seam: rebuild `beats.ts` from blocks in era order, never trust git's line matching (it interleaved E4/E6 earlier in the night).
- `$B:tasks/…` is a zsh modifier (brace the variable); `--include='*.mjs'` must be quoted.
- Safe to free: `dist/`, `test-results/`, own control worktrees, stale `$TMPDIR/goldrush-manifest-fingerprint-*` fixture copies (3.6 GB each). Never `tasks/runs/`, `logs/`, `artifacts/`, salvage dirs, other sessions' worktrees.
