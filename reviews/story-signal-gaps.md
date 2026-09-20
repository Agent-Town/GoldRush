# Review: story-signal-gaps — boss-act signals, the return's contract id, the first-boot beat, the profile key, one Hud per root (smoke-36 worktree, Claude Opus 5 implementer, attended drain 2026-09-06 morning)

**Slice/branch/tip:** `story-signal-gaps` · `fix/story-signal-gaps` · commit `9336b269c` on base `0a120edd3` · merged to main: see the ledger row (first-parent merge; the collisions were the ledger and two comment-only header notes in `beats.ts` beside the portraits batch, both kept).
**Verdict:** MERGED. Three bosses that act on maps without a `twist.baron` now report their own lifecycle: `boss-act { contractId, boss, act }` (a new union member with a `BossStoryEmitter` so no system hardcodes a contract id) plus `boss-arrival`/`boss-defeat` from inside `SalvageClawBossSystem` (paperwork, crown, winch, anchor-feet; arrival at act 1, defeat at the warm quit), `OldDiggerBossSystem` (renovation, boarding, swap; arrival at the renovation, defeat when it joins the fleet) and `E10StaticBossSystem` (approach, three-preserves; arrival when an actor crosses z ≥ 36, defeat at the recede). No emission on any rehydration path. `run-return-town` carries `contractId` from `options.initialBoardContractId`. A `first-boot` beat heads the E1 table (STORYBOOK :64, :30). `STORY_FIRST_BOOT_KEY` is exported and swept with the profile. `Hud`: one per root, idempotent dispose, with a regression arm at 3 s.

## Re-keyed beats
| beat | was | now | citation |
|---|---|---|---|
| `e9-digger-correction` | `run-return-town` gated on the arrival beat | `boss-act` · `e9-dome-basin` · `renovation` | :561, :562 |
| `e9-digger-kept` | `run-return-town` gated on the correction | `boss-defeat` · `e9-dome-basin` | :564 |
| `e10-three-preserves` | `run-return-town` gated on the decks beat | `boss-act` · `e10-last-claim` · `three-preserves` | :613 |
| `first-boot` (new, head of the E1 table) | none | `first-boot` | :64, :30 |
E8's three boss beats were already keyed on `boss-arrival`/`boss-defeat`, which simply never fired; the emitter alone revives five dead E8 beats (F-SSG-4). Nothing PROPOSED is served by a real act yet: E10's four PROPOSED marks cite missing engine consumers.

## Evidence
| Gate | Where | Result |
|---|---|---|
| `e2e/story-signal-emitters.spec.ts` (new arms: a Claw act card on `e8-mare-claim`, a Digger act card on `e9-dome-basin`, the first-boot card, the briefing at 3 s) | worktree, own port 5309, both projects | 14/14 (10.6 m), zero console/page errors |
| Closing battery `ss-02` + `ss-09` + `ss-10` + `ss-11` + `story-loop` + `profile-first-boot` + `tape-01` | worktree, both projects | 74 passed / 2 failed (15.6 m); the two are `story-loop:185` on both projects (F-2460-2), CONTROL-PROVEN by reverting the nine src files to the base |
| Determinism | worktree | E1 null floors 21/21 byte-identical, 79 pairs / 34 contracts with zero outcome differences (only the eraStamp); headless tape `fnv1a32:a4d0de7f` = banked; browser `tape-01:140` green both projects |
| tsc / build / guards | worktree | clean / green / `no-emdash` 1/1, `agent-rung-conformance` 3/3, `view-schema-guard` 3/3; `law-pointer-guard` red on exactly the predicted `fire.md` pointer (F-SSG-2, re-based by the drain) |
| Engine era | worktree hash `6a8894b9…` | re-measured on the merged tree by the drain and pinned there |
| Attended on the merged tree | see the drain commit and the ledger row | tsc, the guards, the pointer re-base, build, `story-signal-emitters` + `profile-first-boot` + `tape-01` + `ss-11` + `story-loop` at one worker on both projects |

Screenshots: `reviews/shots-story-signal-gaps/{desktop,mobile}-chrome-{e8-salvage-kings-claw,e9-digger-correction,contract-briefing-at-3s,first-boot-card}.jpg` (8, 1.0 MB), cards verified visually.

## Merge classification
Base `0a120edd3`; main moved by the Canyon Works levers, the squall, the gold cure and the portraits (`Game.ts` at other sites, `beats.ts` header notes). `src/story/signals.ts`, `src/story/beats.ts`, the three boss systems, `src/game/Game.ts`, `src/game/ProfileStorage.ts`, `src/town/TownScene.ts`, `src/ui/Hud.ts`, four e2e specs: LANE-TOUCHED (the two `beats.ts` header notes unioned with the portraits batch's notes). `reviews/shots-story-signal-gaps/*`: NEW. `tasks/BACKLOG.md`: MAIN-MOVED, unioned. Attended in the landing commit: `scripts/fire.md`'s `Game.ts` pointer re-based 2567–2568 → 2576–2577 (+9, as predicted); the droplet ledger routes the ADR-004 re-assay verb (F-LINEAGE-4 was the live door).

## Findings
- **F-SSG-1 (honesty, premise corrected):** F-CWBC-2 does not reproduce at `0a120edd3`: one HUD mount, the card visible 189 ms → 8188 ms; likely cured on main by `teardownActiveScene`'s `hud.replaceChildren()` (`src/main.ts:341`). What landed is the invariant (one Hud per root + idempotent dispose) and a regression arm, not a repair. F-CWSL-5's "race" reading stands corrected the same way.
- **F-SSG-3 (measurement trap):** a long-lived vite dev server serves HMR-timestamped module variants after a src edit, so a spec's raw `import('/src/story/signals.ts')` binds a different instance and records zero signals; restart the dev server after src edits before gating.
- **F-SSG-5 (copy owed, fire-authorable):** acts with no consuming beat: `salvage-claw:paperwork/winch/anchor-feet`, `old-digger:boarding/swap`, `the-quiet:approach`, and `boss-arrival`/`boss-defeat` on `e10-last-claim`.
- **F-SSG-6 (E10 act numbering, honesty guard):** the Quiet's system has three transitions, not the storybook's four: Act 0 (the fading portrait) has no state, Act 1 (the squalls) belongs to the E10S ladder; acts are named for what happens, never renumbered; `e10-portrait-fades` and `e10-unraveled-board` keep `run-return-town` with the reason in source.
- **F-SSG-7 (one line):** `src/main.ts:125` still declares the literal `'gr.story.firstBoot.v1'`; import `STORY_FIRST_BOOT_KEY` there.
- **F-SSG-8 (spec-authoring trap):** a saga contract cannot be reached by `?contract=` in a plain boot (`fallbackReason: 'debug-disabled'`, `ContractFamilies.ts:1343`); the player's authorization is the board's `stagePlayerContractLaunch` write (`:1250`); the new tests use exactly that and assert `contract.activeId`.
