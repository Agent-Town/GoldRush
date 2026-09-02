# human-tape-true-reel-stamp — drain review (s2461, 2026-09-03)

**Slice:** `human-tape-true-reel-stamp` (F-SLHP-2)
**Branch / tip:** `lane/d` @ `1df336ff1` (runner commit), base `1e2ad54730c411cbfb65340ad2763120acc7638f`
**Merge:** `16ed9b2227b36b9a3b23aae0f047ed28b8cdce18` · reconciliation `fc45ed6456a15e12e31e3d8b954efe7aff505665`
**Gated in:** detached worktree `gate-s2461` (§3.0b custody — undecided content never entered main's tree)

## Verdict

**MERGED.** 18/18 own + adjacent playwright, desktop AND 390px mobile, `--workers=1`, rc=0. Two reds
appeared on the merged tree and both were cured as this drain's own named duties (engine pin, law
pointer). One further red is **pre-existing and independently re-confirmed here** (art-gitdir leak,
F-2459-3). **Zero reds are attributable to the slice.**

## What it does

Human run tapes now carry the engine identity that produced them. `RunTapeMeta` gains `engineHash`
and `era`; `runTapeRecordingMeta` stamps a fresh recording and — the load-bearing half — **retains the
original stamp across a resume**, so suspending and continuing a run does not silently re-stamp a tape
with a newer engine. Stamped standing-order tapes route to true replay and watch to their own event
hash; unstamped legacy tapes keep working and fall back to the ordinary tape show, so nothing already
on a player's shelf is invalidated. This closes **F-SLHP-2** — human standing-order tapes could not be
watched since `ecc2a1a1b`.

## Evidence

| Gate | Result |
|---|---|
| `drain-block-check` (pre-drain, and re-asserted) | `✅ CLEAR — human-tape-true-reel-stamp.md` |
| `npx tsc --noEmit` (merged tree) | **rc=0** — re-run after the spec edit, since `tsconfig` includes `e2e/` |
| `npm run build` | **rc=0**, 17.48 s |
| `e2e/tape-01-run-tape.spec.ts` + `c7-standing-order-replay` + `tape-02-lantern-show` + `same-laws-harvest-parity` | **18 passed / 0 failed (2.4 m)**, desktop-chrome + mobile-chrome 390px, `--workers=1` |
| — same four specs BEFORE the viewVersion reconciliation | **16 passed / 2 failed** (`c7:8`, both projects) |
| `test:node-guards` (merged tree, run ALONE) | **562 pass / 3 fail** → 2 cured below, 1 pre-existing |
| `test:power-budget` | **rc=0**, p95 = 0.318 ms |
| `test:stats` / `test:accounts` / `test:mp` | rc=0 / rc=0 / rc=0 |
| `test:task-guards` / `test:citations` / `test:gate-callers` | rc=0 / rc=0 / rc=0 |
| `engine-era-guard` after the pin | **5/5 pass** |
| `law-pointer-guard.test.mjs` after the re-base | **22/22 pass** |
| Console / page errors | zero — `c7` and `tape-01` both collect `console.error` + `pageerror` and assert empty |

Transcript: `artifacts/human-tape-true-reel-stamp-gate.txt`.

## Merge classification

Base `1e2ad547`. `lane-freeze-classify` read **HOLDS 5 paths**; `lane-absorbed-lines` then asked the
one-directional question on the three BOTH-MOVED paths and returned **NOT ABSORBED** on all three, so
this was a genuine 3-way merge and not a false-ahead.

| File | Class | Resolution |
|---|---|---|
| `e2e/tape-01-run-tape.spec.ts` | LANE-ONLY | clean apply |
| `e2e/c7-standing-order-replay.spec.ts` | LANE-ONLY | clean apply, then one assertion reconciled (below) |
| `src/game/RunTape.ts` | BOTH-MOVED | **both sides kept.** Type gains main's `viewVersion?` *and* the lane's `engineHash?`/`era?`. `validateTapeMeta` became the **union** of the two validators: main's `viewVersion` range check and the lane's rule that `engineHash`/`era` are valid only as a well-formed pair. Neither side's semantics were weakened. |
| `src/game/Game.ts` | BOTH-MOVED | **both sides kept.** Main stamped `{ buildId, viewVersion }` inline; the lane routed through `runTapeRecordingMeta(...)`. Resolved to the lane's call with main's `viewVersion` added to the `current` meta — so a fresh tape carries all four fields and a resumed tape still retains its original stamp. |
| `tasks/BACKLOG.md` | BOTH-MOVED | **both sides kept** — main's new S6 E3 row *and* the lane's updated F-PT16-1 line. Verified by content, not line count: both marker strings present, merged line count 5140 = main's. |

## Findings

**F-2461-1 — the lane's own `c7` assertion could not survive the merge, and that was the drain duty the
runner named.** `c7:15` asserted `expect(tape.meta).toEqual({ buildId, engineHash, era })` — exact deep
equality, written against a tree that had no `viewVersion`. On the merged tree a fresh tape correctly
carries `viewVersion: 1` as well, so the assertion failed on **both projects**. This is a merge seam,
not a defect: the runtime is doing exactly what both slices intend. Reconciled by asserting all three
stamps. **Kept as `toEqual` rather than relaxed to `toMatchObject`** — the point of the line is that a
fresh tape carries exactly the declared stamp and no stray field, which is what makes the
stamped-vs-unstamped routing decidable; relaxing it would have removed the test's teeth to make a red
go away. The runner predicted this in its own report ("Drain must reconcile main's newer `viewVersion`
field"), so it is a discharged duty rather than a surprise.

**F-2461-2 — engine pin owed and paid, with the cause COUNTED rather than assumed.** `src/**` is inside
`ENGINE_SOURCE_INPUTS`, so the slice rotates the engine identity and `engine-era-guard` redded. Before
attributing it I measured that **main was self-consistent** (main tree hash `10c1fa66…` == registry
`engineHash`), which is what proves this slice is the only cause rather than assuming it. Merged hash
`cb321d83…` computed **independently** and matched the guard's message. Appended as an era-5 pin
(pins 11 → 12) with its cause; the top-level `engineHash` was updated in the same edit — s2460's
lesson, since the registry carries both and appending only the pin leaves the guard red at an earlier
assertion. **Same era:** no view field removed or renamed, no tape shape invalidated, unstamped legacy
tapes still validate.

**F-2461-3 — law-pointer rot, predicted by the runner, and the predicted MAGNITUDE was wrong.** The
runner wrote "`scripts/fire.md`'s `placeBuilding:` pointer into `Game.ts` shifts **+12** lines on merge".
Measured, it shifted **+1** (2524 → 2525). The subject was right and the number was not — which is the
argument for "cite the CODE, the coordinate drifts" in one line: even a runner reading its own diff
cannot compute the shift in advance, because it depends on what the merge adds *above* the site. Both
range members were re-grepped **independently** (`placeBuilding` 2525, `panAt` 2526) — the law warns a
range is two pointers and only the first is guarded — then eye-checked by reading the lines back.
Baseline updated with `--update` after eye-checking, never before.

**F-2461-4 (NOT BLOCKING, pre-existing, re-confirmed) — the art-gitdir fixture leak.** `fixture-teardown`
reds on `scripts/art-staging-gitdir-link-guard.test.mjs: 11 [art-gitdir-*]`. In the full battery it
reported only that its *child* `engine-era-guard` had failed, so curing the pin was not sufficient to
clear it; **run alone (547 s) it reds independently at the art-gitdir leak.** That is exactly
F-2459-3 / F-2460-3, which s2459 proved pre-existing by a control run on unmerged main. Not caused by
this slice, not cured here, still open and still taxing every mandated battery.

## Where the player sees this (Mistake #10)

In a plain boot with no `?debug`: finish a run with standing orders, open the tape shelf, press WATCH.
A tape recorded by this build now replays *truly* — to its own event hash — instead of refusing. A tape
recorded before this build still opens in the ordinary tape show rather than erroring. Both paths are
asserted in `c7-standing-order-replay.spec.ts` on desktop and at 390px.
