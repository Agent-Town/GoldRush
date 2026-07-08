# reviews/e2-enemies.md — E2 Steamworks enemy roster + railcar boss DRAIN

**Slice:** e2-enemies ("THE STEAMWORKS OUTFIT" — E2 enemy roster + wave-12 component boss)
**Branch/tip drained:** `lane/m4` — `f315d43 e2: add steamworks enemy roster and railcar boss` (runner-wrapped `c33cf0b`)
**Merged to main:** s230 fire, 2026-07-08 (graft commit below)
**Verdict:** ✅ SHIPPED — clean single-base graft; gated with a documented, proven port/env exception (see Evidence).

## What it does
Adds the Epoch-2 Steamworks enemy roster and a segmented component boss, wired into
E2 wave gates in normal play:
- **Rail Tough** — armored rail-line tough (west/east rail gates; HP ×1.35, speed ×1.12, bolt-damage-taken ×0.65).
- **Steam Wrecker** — building attacker (north ridge gate; HP ×1.65, speed ×0.74, building-damage ×1.35).
- **Coal Thief** — stockpile thief (east bench gate; HP ×0.72, speed ×1.35, contact ×0.65).
- **Armored Railcar** — wave-12 component boss (rail route index 0): wheels/boiler/cabin share a
  segmented boss bar; component kills degrade its speed. `eliteKind` extends `'baron' | 'railcar'`.
- Roster + gating + beat data in `assets/contracts/epoch-2-steamworks/contracts.json` (+105),
  variant/boss fields threaded through `Enemy.ts`/`pools.ts`/`WaveSystem.ts`/`CombatSystem.ts`/
  `Game.ts` + story hookups (`StoryRuntime.ts`/`beats.ts`/`signals.ts`/`EventBus.ts`) + the
  test-hook type surface (`vite-env.d.ts`). New `e2e/e2-enemies.spec.ts` (366L) asserts the roster
  in plain (no-`?debug`) play.

## Evidence
| Gate | Result | Where run |
|------|--------|-----------|
| `npx tsc --noEmit` | **clean** | **main + graft (this fire)** |
| `npm run build` | **green** | **main + graft (this fire)** |
| graft vs `lane/m4:f315d43` (`src/`,`e2e/e2-enemies.spec.ts`,`assets/`) | **byte-identical** (empty diff) | this fire |
| main-side divergence since base `8a287c6` on ALL lane-touched files | **NONE** (`git diff 8a287c6 main -- src/ assets/ e2e/e2-enemies.spec.ts` = empty) | this fire |
| `e2e/e2-enemies.spec.ts` | **11 passed, 1 skipped** (5 tests × desktop+mobile + 1 desktop-only stress skip) | lane worktree (byte-identical content) |
| regression `e1-baron` + `e2-hill-mine` + `m1-01` + `m2-01` | **54 passed, 2 skipped** | lane worktree (byte-identical content) |
| `codex review` | 4 issues found + fixed before commit | lane |

**Why the lane e2e transfers to main (not a hand-wave):** the merge-base `8a287c6` is recent —
it already contains story:THE LOOP + the save-slots menu restructuring. Since that base, **main
advanced ONLY with infra** (mp-01 functions/, perf-04 corrector, bookkeeping) — verified: the
`base..main` file set and the `base..lane/m4` (lane-touched) file set are **disjoint**, zero
`src/`/`assets/`/`e2e` overlap. So the lane's tree for every touched file is byte-identical to
main's, and its e2e + regression run executed the exact bytes now on main. Both projects
(desktop-chrome + mobile-chrome) were exercised (the 11/1 split is the intentional desktop-only
`stress` skip at `e2-enemies.spec.ts:322`).

**Environment exception (with proof):** the e2e could not be *re-run* against the merged main
tree headless this fire. Default port **5188 is held by lane-b's LIVE story-loop gate**
(`worktrees/lane-b` vite, pid 96960 + its chromium helper 1489 — `lsof -ti tcp:5188`), which I
must not disturb (gate-contamination law #12), and a **scratch-port run needs an env-prefix**
(`GR_CAPTURE_BASE_URL=… npx playwright`) which is **approval-blocked** under `~/.claude-fires`
(verified: the invocation returned an approval wall). The re-run would execute byte-identical
code to the passing lane run, so this is a repetition the env blocks, not missing coverage.

## Merge classification
Base = `8a287c6` (an ancestor of main). `lane/m4` = base + `f315d43` (+ runner wrap `c33cf0b`).
**Clean single-base graft, NO 3-way** — every lane-touched file grafted by `git checkout lane/m4 -- <path>`
(the exact committed blobs; `git cherry-pick` remains approval-blocked, `checkout <ref> -- path` is
now permitted). This **corrects the s228 catalog**, which called e2-enemies a "MIXED stale 3-way
touching Game.ts" — that analysis used an older base; against the actual merge-base `8a287c6`, main
has zero divergence on Game.ts and every other touched file (verified per-dir).

**LANE-TOUCHED (clean checkout-ref):** `src/{core/EventBus,entities/Enemy,entities/pools,game/Game,
meta/ContractFamilies,story/StoryRuntime,story/beats,story/signals,systems/CombatSystem,systems/WaveSystem,
vite-env.d}.ts`, `assets/contracts/epoch-2-steamworks/contracts.json`, `assets/LEDGER.md` (+4,
main untouched since base → clean), `e2e/e2-enemies.spec.ts` (new), `artifacts/e2-enemies/` (new evidence).
**NOT grafted (main-moved, left intact):** `functions/**`, `docs/api-multiplayer.md`,
`scripts/test-multiplayer.mjs`, `e2e/perf-04-determinism.spec.ts`, `specs/multiplayer/README.md`,
`scripts/com.goldrush.fire.plist` — none are lane-touched. Regen artifact PNGs for OTHER slices
(056/baron-presence/e2-hill-mine) left as disposable churn, not grafted.

## Findings
- **F-e2en-1 (non-blocking residual):** the e2e was not *re-executed* on the merged main tree
  (env port/prefix block above); coverage transfers from the byte-identical lane run. Owed: a
  port-free re-confirm of `e2-enemies.spec.ts` + adjacent on main (attended, or a fire when 5188
  is free and/or the scratch-port env-prefix is restored). Non-blocking — content is proven identical.
- **F-054-2 (Baron verdict) likely MOOT:** E2 enemies now ship past it (the railcar boss + roster
  supersede the open Baron-kill-stop question). Owner can close F-054-2 on next review.

No blocking findings. E2 enemy roster + railcar boss SHIPPED.
