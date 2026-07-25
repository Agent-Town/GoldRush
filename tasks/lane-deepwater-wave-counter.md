# Task lane-deepwater-wave-counter: make the Deepwater HUD count the waves the player is actually fighting (LANE-B, commit prefix "fix:")

**FIRE-AUTHORED (attended review welcome)** — s1025, 2026-07-25, promoted from `tasks/DRAFT-deepwater-hud-corsair-counter.md` (which the rig-repair runner filed) now that its evidence merged at `4d04e3b8`.

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-b`.

READ FIRST: `AGENTS.md`; `reviews/saga-rehearsal-2026-07-25.md` (§Gates passed → the `F-REH-05` row, and §F-REH debt disposition); `tasks/DRAFT-deepwater-hud-corsair-counter.md`; `reviews/rig-repair.md` (F-1025-3); `src/world/DeepwaterClaimTile.ts`; `src/systems/UiBridge.ts`; `src/ui/Hud.ts`; `e2e/e5-deepwater-claim.spec.ts`.

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/m4 main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.
> Known state at authoring time: `lane/m4` sits 1 ahead at `1244914b runner(lane-b): lane-rig-repair.md`. That content was squash-merged to main as `4d04e3b8` — it IS a SAFE DUPE. Confirm it yourself (`git log --oneline main | grep -q 'HONEST SAGA REHEARSAL'` and file-probe `rehearsal/segments/e6-03-board-chapters-proof.mjs` on main) before resetting; if that probe fails, STOP and report.

## Why (evidence: `reviews/saga-rehearsal-2026-07-25.md`, dated 2026-07-25, merged `4d04e3b8`)

The repaired rehearsal rig ran a 40-simulated-minute Deepwater probe with a moving, damageable hero. Verbatim from the review's gates table:

> **F-REH-05 | RESOLVED |** At 2,405 sim seconds: `corsairWaves=100`, `xp=500`, `kills=129`, `hudWave=0`. Deepwater progresses; the generic HUD counter is misleading.

So the progression is healthy and the **counter is the liar**. A player on `e5-deepwater-claim` fights a hundred waves of corsair skiffs while the HUD's wave number sits at `0` — a healthy run reads as broken. This is the same class as the loading-shell problem the owner hit on his slow line: the game working, but the readout saying otherwise.

Verified on current main (file:line, opened — do not take on trust, re-confirm):
- `src/game/Game.ts:5220` — `syncUi()` passes `this.waveSystem.diagnostics.wave` as the `wave` argument into `uiBridge.build(...)`. On a Deepwater contract the corsair waves are scheduled by the claim tile, **not** by `WaveSystem`, so this argument stays `0`.
- `src/systems/UiBridge.ts:178` — `this.snapshot.wave = wave;` (the only writer of the snapshot field).
- `src/ui/Hud.ts:270` — `this.elements.waveNumber.textContent = snapshot.wave.toString();` → the `[data-hud-wave-number]` element inside `[data-testid="hud-wave"]`.
- `src/world/DeepwaterClaimTile.ts:118` — `snapshot()` exposes `corsairWaves` (an array; its `.length` is the count fought).
- **THE PRECEDENT TO FOLLOW — `src/game/Game.ts:4738`**: `const runWave = this.deepwaterClaim?.snapshot().corsairWaves.length ?? this.waveSystem.diagnostics.wave;`. The codebase ALREADY resolves "which wave number is true for this run" exactly this way when recording a Baron/Queen defeat. This slice extends that same idiom to the displayed number. Do not invent a second convention — reuse this one (extract it to a small private accessor and use it in both places).

## Scope

1. **One accessor, two call sites.** Add a private accessor on `Game` (suggested `private currentRunWave(): number`) whose body is the existing `4738` expression, and use it BOTH at `4738` (replacing the inline expression, behaviour byte-identical) AND at `5220` (where the HUD number comes from). No other call site changes.
2. **Non-Deepwater is untouched.** When `this.deepwaterClaim` is null/undefined the accessor returns `this.waveSystem.diagnostics.wave` exactly as today — every non-Deepwater contract's HUD number must be byte-identical to current main.
3. **Only the NUMBER moves.** `waveState`, `edge`, `pulse`, announcements, the announcement kind/title, `nextWaveInSim`, level-up pauses, XP, "stay for the Rush", and Queen-defeat securing all keep their current owners and current inputs. If you find yourself editing `WaveSystem`, `UiBridge`'s shape, or the announcement path, you have left scope — stop and report instead.
4. **Assert it.** Extend `e2e/e5-deepwater-claim.spec.ts` (do not create a new spec file, and do not weaken any existing assertion in it) with one test that: boots `e5-deepwater-claim`, advances until `deepwaterClaim.snapshot().corsairWaves.length >= 2`, and asserts the visible `[data-hud-wave-number]` text equals that count (and is therefore non-zero). Use the harness/param conventions already used by that spec — read it first, mirror it.
5. **Prove the other side.** In the same spec (or the nearest existing non-Deepwater one you are already running), assert that a non-Deepwater contract's `[data-hud-wave-number]` still tracks `WaveSystem` — i.e. that scope item 2 actually holds in the DOM, not just in the diff.
6. If the accessor turns out to be wrong for a case you discover (e.g. a contract that has BOTH a deepwater claim and meaningful WaveSystem waves), do NOT paper over it — implement the smallest correct rule, and write what you found and why in your report.

## Firewall

Touch ONLY: `src/game/Game.ts` (the accessor + the two call sites), `e2e/e5-deepwater-claim.spec.ts`.
NO changes to: `src/systems/UiBridge.ts` · `src/ui/Hud.ts` · `src/world/DeepwaterClaimTile.ts` · `src/systems/WaveSystem*` · any sim semantics, spawn schedule, balance number or event-log shape · any EXISTING e2e assertion anywhere (you may add; you may not weaken or delete) · `rehearsal/**` (the rig is another slice's surface) · `STATUS.md`, `tasks/`, `reviews/` (the fires own those).

If fixing this properly requires touching a NO file, that is a finding, not a licence: write it in your report and stop.

## Self-check (evidence, not vibes)

- `npx tsc --noEmit` clean; `npm run build` green.
- `e2e/e5-deepwater-claim.spec.ts` green **desktop AND mobile (390px)**, including your new assertions.
- Adjacent suites unmodified-green both projects, by name: `e5-boss-dredge-queen.spec.ts`, `e5-arsenal.spec.ts`, `e5-water-spike.spec.ts`, `m1-01`, `m2-01`.
- Zero console/page errors in every run above.
- Screenshot the Deepwater HUD with a non-zero wave number to `reviews/shots-deepwater-wave-counter/desktop-chrome-wave-counter.png` and `.../mobile-chrome-wave-counter.png` (create the directory).
- No-op guard: if you find yourself about to exit without changes, WRITE WHY into your report first — a silent no-op wastes a queue slot and a gate.

END: **READY-FOR-GATES** + report: the accessor's final shape and both call sites, the observed `corsairWaves.length` vs displayed number in your new test, confirmation that non-Deepwater HUD output is unchanged (say how you proved it), and anything you found that the DRAFT's author did not anticipate.
