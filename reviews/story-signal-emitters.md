# Review: story-signal-emitters — the four story signals nobody emitted (scratch worktree `smoke-36`, Claude Opus 5 implementer, attended drain 2026-09-06 early)

**Slice/branch/tip:** `story-signal-emitters` · `fix/story-signal-emitters` · commits `b39fd4822`, `3d9ee4411`, `0ba8501c2`, `f24292141`, `c7bf87287`, `fec436092` on base `79c7d2c57` · merged to main: see the ledger row (first-parent merge; no `src/` collision with the night's other merges, the ledger unioned).
**Verdict:** MERGED. `wave-complete`, `rung-promotion`, `science-threshold` and `first-boot` now fire in a plain boot, so all six orphaned E1 beats appear as cards without `?debug` on desktop and at 390px. Presentation signals only: the E1 null floors are 21/21 byte-identical and a played tape replays to its banked hash in both engines.

## What it does
| Signal | Where | When it fires |
|---|---|---|
| `wave-complete {wave}` | `src/game/Game.ts:3327` (`syncStoryWaveSignal`, from `updatePresentation:3303`) | the frame the wave counter leaves wave N (the only wave-end transition the scheduled path exposes; `WaveSystem.resolveWaveState:971` returns quiet/warning/active and `cleared` belongs to the drill yard's bell); skipped during tape replay and when `practice.metaProgress === false` |
| `rung-promotion {level}` | `src/game/Game.ts:3341` (`syncStoryRungSignal`) | the frame the persisted agent autonomy track increases (credited at secure time); the per-run policy-slot bonus is excluded on purpose (a loan, not a rung); seeded at −1 so the first frame only baselines |
| `science-threshold {threshold}` | `src/game/Game.ts:9567` (`emitScienceSignals`, renamed from `emitScienceCompleteIfReady`; both callers kept) | a research pick raises `scienceMeter().steps`; the threshold is the step count reached |
| `first-boot` | `src/main.ts:156`, guarded by `claimFirstBootForProfile()` at `:138` | the first boot at which a profile exists, once per profile, in its own per-profile datum `gr.profile.v2.<id>.gr.story.firstBoot.v1` |

`e2e/story-signal-emitters.spec.ts` (new, 4 tests × 2 projects) proves the six beats as cards in a plain boot; runs are shortened the way `story-loop`'s own plain-boot test does it (editing the live `Balance` module through Vite after boot, so `applyStoredDifficultyPreset()` cannot clobber it). Three cards are proven from a seeded starting profile (1 rung, 2 science steps banked); the emitter path is identical for a player who reaches them over more rides.

## Evidence
| Gate | Where | Result |
|---|---|---|
| `e2e/story-signal-emitters.spec.ts` | worktree, own dev server on 5309, both projects | 8/8 (6.9 m), zero console/page errors, no `?debug` |
| Closing battery `story-signal-emitters` + `ss-01..ss-04` + `story-loop` + `profile-first-boot` + `tape-01` | worktree, `--workers=1`, both projects | 60 passed / 6 failed (12.8 m); the six are exactly F-2460-2's known set, CONTROL-PROVEN by reverting `Game.ts` + `main.ts` to main, and none depends on the four signals (`ss-01:103` is the `ledger-page` precedence, `ss-03:52` a table assertion, `story-loop:185` the reload that re-applies the stored difficulty preset over `tunePlainFastSecure`) |
| Determinism | worktree | E1 null floors vs `assets/contracts/null-floors.json`: 21/21 pairs byte-identical (the-claim ×5, dry-gulch ×3, night-shift ×3, twin-banks ×5, e1-baron ×5); browser engine `tape-01-run-tape.spec.ts:140` green both projects; headless `scripts/assay-replay.mjs` on `artifacts/assay-e2e-cure/tape-v2-run1.json` → `fnv1a32:a4d0de7f`, its banked hash |
| tsc / build / guards | worktree | clean / green (herald 1,158,214 B under ceiling) / `agent-rung-conformance` 3/3, `view-schema-guard` 3/3, `no-emdash-guard` 1/1 |
| Self-caught regression | worktree | reading beat-seen state at boot reached `ensureProfileState` (`src/game/ProfileStorage.ts:129`), which creates and saves a default "Robin" profile (F-SSE-2); guarded with `loadProfileState` first; `profile-first-boot.spec.ts:41` (no Robin ghost) 6/6 both projects |
| Engine era | worktree hash `fbbb8720…` on the pre-merge tree | superseded by the merged-tree hash `9b2b30d8`, pinned by the drain (same era per F-1441-3) |
| Attended on the merged tree | see the drain commit and the ledger row | tsc, build, era pin, `story-signal-emitters` + `story-loop` + `profile-first-boot` + `tape-01` at one worker on both projects, `null-floor-anchors --check` |

Screenshots: `reviews/shots-story-signal-emitters/{desktop,mobile}-chrome-{first-boot,first-wave-five,deputy-first-promotion,deputy-trusted-routine,science-first-pick,science-mastery,baron-shadow}.jpg` (14, 1.9 MB).

## Merge classification
`src/game/Game.ts` (+59/−4), `src/main.ts` (+37/−2): LANE-TOUCHED (main did not move them since the base). `e2e/story-signal-emitters.spec.ts`, `reviews/shots-story-signal-emitters/*`: NEW. `tasks/BACKLOG.md`: MAIN-MOVED, unioned. `assets/engine-era.json`: main's registry kept; the drain appends the merged-tree pin.

## Findings
- **F-SSE-1 (non-blocking, story data):** `first-boot` has no consuming beat: nothing in `src/story/beats.ts` declares `trigger: 'first-boot'`; the signal fires exactly once per profile and shows nothing. One beat row in the E1 table (a `beats.ts` change, forbidden to this slice's firewall) makes the master's "shows the first-boot beat" true; fire-authorable.
- **F-SSE-2 (trap, cured here):** both story seen-state helpers reach `ensureProfileState`, which creates a default profile; reading them at boot would answer "Who's prospecting?" for the player.
- **F-SSE-3 (non-blocking, one line):** the first-boot key is not in `PROFILE_DATA_KEYS` (`src/game/ProfileStorage.ts:36`), so it is not swept on profile delete/export/import.
- **F-SS10-1 and F-SS09-3 CONFIRMED by reading, not fixed:** `boss-arrival` (`Game.ts:5991`) and `boss-defeat` (`:6250`) sit below `if (!baron) return`, and `e8-mare-claim` (Salvage Claw) and `e9-dome-basin` (Old Digger) declare no `twist.baron`; those systems are enabled by contract-id checks, so an honest emission needs new call sites inside the boss systems: a follow-up slice (`boss-act-signals`), attended or fire-authored from this row.
- **F-SS06-2 CONFIRMED by reading:** `run-return-town` carries `result` only (`src/story/signals.ts:11`) while `this.options.initialBoardContractId` is at hand (`TownScene.ts:432`); one field plus one argument, fire-authorable.
- **F-SSE-4 (pre-existing):** `artifacts/eh2-fixture/tape.json` returns an empty hash and 0 ticks through `scripts/assay-replay.mjs`'s browser path, reproduced on main's own src.
