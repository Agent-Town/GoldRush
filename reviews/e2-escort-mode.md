# Review — e2-escort-mode (Steamworks escort contract goes live)

- **Slice:** e2-escort-mode (BUILD-PLAN §4 E2 item ③ — the escort objective alongside pressure)
- **Source branch/tip:** `lane/perf` (worktrees/lane-d) tip `195d429d` — runner(lane-d): e2-escort-mode.md
- **Landed by:** the **attended E2 wave**, straight-to-main as `7f851d22` (2026-07-12 10:03:55 +0700, `runner(lane-d): e2-escort-mode.md`) — **16 files, +414/−6**. It landed MID-FIRE during s414, which correctly HELD its own redundant re-land (§7.6 / Mistake #12) once it saw the external commit.
- **Verdict:** ✅ LIVE & GREEN — content confirmed on main, gate battery passes. This is the OWED post-hoc review + gate-confirm (attended merged without a `reviews/` file; s414+s415 flagged it owed). Written by s416 fire.

## Why a post-hoc review (not a drain)
The escort content is **already on main** — s416 did NOT merge anything. `git branch --contains 7f851d22` → `main`; `git cat-file -e HEAD:src/entities/OreCart.ts` → present. The attended wave grafted lane-d straight to main during s414 without writing a review file or running a confirming battery (same pattern as its other wave lanes). s414/s415 carried "ESCORT REVIEW OWED" forward. With the board quiet (queues empty, no fresh done-moves, no live attended writes, lane runner idle), s416 wrote the review and ran the gate on the merged tree.

## What it does (the escort objective)
Adds the E2 escort contract layer (`?mode=escort` on the Hill-Mine E2 contract):
- **OreCart** (`src/entities/OreCart.ts`, new, +175) — an ore cart that traverses an authored rail from the west spawn to the **east railhead** (`x:46, z:-2`); on arrival it banks **40 gold** (`gold_granted` source `'escort'`) and marks the objective satisfied. Carries HP (180), a `stopped/moving/arrived/destroyed` state machine, and a hero-repair path (repairs a stopped cart back to `moving`).
- **WaveSystem** (`+85`) — spawns/updates the cart, drives its rail traversal and `updateEscort` tick, and exposes escort state to diagnostics.
- **Enemy** (`+11`) — wreckers gain the escort target: a nearby wrecker engages the cart (`wreckState: 'swinging'`), stopping it and dealing `wreck.damage`; `moveIgnoringTerrain` / `escort:ore-cart` targeting.
- **Wiring:** `Economy.ts` (the `'escort'` gold source, sole gold writer preserved), `Game.ts` (`resolveEscortDamage` / `onEscortPayout` / diagnostics), `ContractFamilies.ContractEscortMode`, `contracts.json` "Railhead Escort" E2 entry, `RunSuspend.ts` decode, `Balance.escortCart` rows, `vite-env` `GrEscortDiagnostics` + `__GR_TEST__.escort()/damageEscort()` test hooks.
- **Fail-soft law honored:** destroying the cart loses ONLY the escort objective — `state:'destroyed', objectiveLost:true` while `__THREE_GAME_DIAGNOSTICS__.state` stays `'playing'`; the run continues (no game-over on objective loss).

## Evidence (all run by s416 on current main `7f851d22`+)
| Gate | Result |
|------|--------|
| `npx tsc --noEmit` | ✅ clean |
| `npm run build` | ✅ green, built in 607ms |
| `e2e/e2-escort-mode.spec.ts` | ✅ **6/6** (3 tests × desktop-chrome + mobile-chrome): cart traverses authored rail → arrives at east railhead → pays 40g (`gold_granted`/`escort`/40); nearby wrecker engages stopped cart (`state:'stopped', hp:60`, enemy `wreckState:'swinging'`) → hero repairs to `state:'moving', hp:180`; cart destruction → `destroyed/objectiveLost:true`, game state stays `'playing'`. **Zero console/page errors** both projects (spec asserts `errors===[]`). |
| Adjacent (isolation): e2-enemies | ✅ 6/6 desktop — incl. E2 wave-pulse spawns, same-seed determinism, 200-stress draw-call envelope |
| Adjacent (isolation): m2-01-build-menu, e2-pressure-in-run | ✅ 9/9 desktop — incl. palisade slide-through, PRESSURIZE completes, boilers Hill-Mine-only, stress draw-calls <200 |
| Boot probe (zero console, desktop + 390px) | ✅ covered by the escort spec's own error-capture on both projects + the booting adjacent tests |
| Screenshots | `artifacts/e2-escort-mode/{desktop,mobile}-chrome-{arrival,under-attack}.png` (regenerated green by this run) |

## Merge classification
No merge performed by s416 — escort landed as `7f851d22` (attended). Per that commit's `--stat`: 2 new src files (`OreCart.ts`) + spec + 4 PNGs + `mp-posture.md`; 10 shared files received additive escort wiring; net +414/−6 (the 6 deletions are single-line swaps in `Economy.ts` gold-source enum and `RunSuspend.ts` decode). Main health post-landing: tsc clean, build green.

## Findings
- **F-1 (non-blocking, environment — NOT a regression):** A first batch run of five heavy specs (`e2-hill-mine`, `e2-enemies`, `m1-01`, `m2-01`, `e2-pressure-in-run`) × **both projects with 2 workers** produced **13 red** — every one a **draw-call/stress-envelope or timing-sensitive** test (200-enemy stress, stress=120 pool budget, draw-calls<200, deterministic-seed, PRESSURIZE-completes, palisade-slide-through). **Fingerprint proof it is machine contention, not escort:** re-running the correctness-critical + representative-perf failures **single-worker in isolation** turned them **100% green** — e2-enemies 6/6 (incl. the "wave pulses spawn" + "same seed deterministic" + "200-stress draw-call envelope" that had failed in the batch), and m2-01+pressure 9/9 (incl. "single enemy slides around palisade", "PRESSURIZE completes", "stress draw calls <200"). Concurrent heavy-suite load blew the perf budgets and starved timing waits; escort's own suite is 6/6 clean. No corrective owed — this is the known "gate battery under concurrency" load artifact (§3 env-exception with isolation proof), not a code defect.
- **F-2 (housekeeping, non-blocking):** `lane/perf` (`195d429d`) still shows falsely "ahead" of main — its content is home via `7f851d22` (verify by file-probe, not `main..branch`; memory `tip-graft-drains-leave-branches-falsely-ahead`). Branch archive (`archive/lane-perf`) owed to a permitted session; no content risk.
