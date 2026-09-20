# Review — f1560-1: the denied-receipt drift ceiling, two-window experiment

**Slice:** f1560-1-m4-06-drift-ceiling-provenance
**Branch:** lane/b @ `c13598fcb` (base `a3f105337`)
**Merged to main:** `a2eb12c4e5b8d0fbd8b6a32d0fa8b0f8dc15b3ba`
**Drained by:** s1561 fire, 2026-08-08
**Verdict:** ✅ **MERGE** — the experiment's stated prediction is CONFIRMED, the restoration is proven, and the gates are green. Three findings, none blocking.

## What it does

s1560 shipped a narrowed bound (`driftAbs < 0.4`) on the strength of an **inference**: that the
observed maximum was a *saturation ceiling* rather than a distribution tail, making the bound
geometric rather than an artefact of the 0.35 s sampling window. This slice was authored to be able
to **refute that inference**, with the prediction written down before the measurement.

Two arms, 20 repeats × 2 projects each (40 samples per arm):

- **Arm A** (control): the shipped arrangement, `advanceSim(0.35)`.
- **Arm B** (discriminating): `advanceSim(1.05)` — a **3× window**, nothing else changed.

If the bound were window-limited, tripling the window should raise the maximum toward the window's
speed budget. It did not. The slice also lands a comment-only cure naming the constants the bound
depends on, and **restores** the spec to `advanceSim(0.35)`.

## Evidence

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | rc=0 |
| `npm run build` | green (`✓ built in 1.08s`) |
| m4-06 desktop-chrome | **9 passed** (40.8 s) |
| m4-06 mobile-chrome | **9 passed** (40.1 s) |
| adjacent m4-05 / m4-07 / m4-08 desktop | **9 passed, 1 skipped** (25.2 s) |
| adjacent m4-05 / m4-07 / m4-08 mobile | **10 passed** (25.2 s) |
| `test:node-guards` | **NOT RUN — F-1460-1 does not bind.** The diff is `e2e/` + `artifacts/` only; no `src/sim/`, `src/systems/`, `src/entities/` path is touched. Stated rather than implied. |

All playwright run with `--workers=1` (§3.1) on the **merged tree** in detached worktree
`gate-s1561` (§3.0b) — undecided content never entered main's working tree.

### The experiment's numbers, recomputed from the artifact rather than inherited

I re-derived these from `artifacts/f1560-1-drift-ceiling/samples.txt` directly; they reproduce the
runner's summary exactly.

| | n | max `driftAbs` | distinct values |
|---|---|---|---|
| Arm A (`advanceSim(0.35)`) | 40 | `0.3722002149381437` | 7 |
| Arm B (`advanceSim(1.05)`) | 40 | `0.3529334214834294` | 4 |

- CONFIRMED threshold `max_A + 0.10` = `0.4722002149381437` → **`max_B` is below it.**
- **`max_B − max_A` = −0.019267.** Tripling the window did not merely fail to raise the maximum, it
  **lowered** it. Under a window-limited model the speed budget would have gone 1.021 → 3.06 units.
- Arm B passed its assertions in all 40 samples; the master expected it might fail, and it did not.
- Margin to the shipped `0.4`: arm A **6.9%**, arm B **11.8%**.

**VERDICT (verbatim from the runner):** `CEILING CONFIRMED (geometric)`.

### Restoration proven, not promised

- `advanceSim(0.35)` present at `e2e/m4-06-embodiment.spec.ts:409`.
- `git diff main...lane/b -- e2e/m4-06-embodiment.spec.ts` filtered to non-comment lines is
  **empty** — the change is comment-only, and both `expect(...).toBeLessThan(0.4)` assertions are
  untouched context lines. The one act the master forbade its runner (widening the bound) did not
  happen.

## Merge classification

Base `a3f105337` is an ancestor of main. `git log a3f105337..main` for both paths is **empty**, so:

| File | Class |
|---|---|
| `artifacts/f1560-1-drift-ceiling/samples.txt` | **LANE-ONLY** (new file, 114 lines) |
| `e2e/m4-06-embodiment.spec.ts` | **LANE-ONLY** (comment-only, +4/−3) |

Merged `ort`, no conflicts.

## Findings

### F-1561-2 — the constants cure names 4 of the 7 constants, and its citation stops one line short (NON-BLOCKING, corrective owed)

The whole point of F-1560-2's cure was that the `0.4` bound "depends on four constants named nowhere
near the assertion", so an ordinary tuning slice would red it with no hint why. The shipped comment
names `moveSpeed` (4.8), the `0.58` idle multiplier, the `-1.8` follow offset, and the
`±0.22 / 0.78 Hz` oscillation.

✓ **VERIFIED — the measured quantity is two-dimensional, and only one dimension is named.**

- `e2e/m4-06-embodiment.spec.ts:85–86` — `distance()` is `Math.hypot(a.x - b.x, a.z - b.z)`, i.e.
  **x AND z**. `driftAbs` is `distance(after.position, before.position)`.
- `src/agent/Embodiment.ts:299` — x anchor: `hero.x - 1.8 + Math.sin(at * 0.78) * 0.22`
- `src/agent/Embodiment.ts:300` — z anchor: `hero.z - 1.25 + Math.cos(at * 0.52) * 0.18`

So the bound couples to **seven** constants, and the three z-axis terms — `-1.25`, `±0.18`, `0.52 Hz`
— are **not named**. The omission is systematic rather than a typo: the comment cites
`Embodiment.ts:288–299`, and the z line is `:300`. **The cited range ends exactly one line above the
constants it omits.**

A tuning slice that changes the z oscillation reds this bound with no hint why — the precise failure
mode the cure was written to prevent, still open on one axis. Comment-only fix; corrective authored
this fire.

### F-1561-3 — the ceiling is confirmed; the *saturation* mechanism behind it is not (NON-BLOCKING, no action)

s1560 read the bit-identical mode (27 of 60) as "a saturation ceiling — the agent closes its gap and
stops". The conclusion (bounded, geometric) is now measured true. The **mechanism** is not:

- The mode value `0.3722002149381437` occurs **13/40 in arm A and 0/40 in arm B.** A terminal stop
  would *persist* under a longer window — more time, more runs saturated. It vanishes entirely.
- ✓ Reading `Embodiment.ts:288–294`: `this.drifting = distance > 0.06; if (!this.drifting) return;`
  re-evaluates every frame, so the agent does not stop — it **tracks** an anchor that keeps moving.

What actually bounds the drift is that the anchor is a **bounded oscillator** (±0.22 x, ±0.18 z about
a fixed offset) and `step = Math.min(distance, …)` at `:292` **cannot overshoot** — so displacement is
capped by the orbit's extent no matter how long you watch. That is a *stronger* guarantee than
saturation, and it is why arm B came in lower: a longer window leaves the agent nearer its converged
tracking orbit rather than mid-transient.

Practical consequence, and the reason this is written down: `0.3722` is **window-specific, not a
universal saturation point**. A future fire reasoning "0.3722 is the hard ceiling, so any window is
safe" would be reasoning from a refuted picture, even though the bound it protects is sound.

### F-1561-4 — arm A's own distinct-value count moved (INFORMATIONAL)

s1559 measured 10 distinct values in 60 samples; arm A here measures 7 in 40, arm B 4 in 40. The
readings remain multi-valued (s1559's quantisation model stays refuted), and the spread narrows as
the window lengthens — consistent with F-1561-3's tracking picture. No action.

## Ledger

- Goal leaf `f1560-1-m4-06-drift-ceiling-provenance` → `merged` @ the hash above.
- F-1560-1 **CLOSED** — model tested and confirmed by a falsifiable experiment.
- F-1560-2 **CLOSED with residue** — the bound is vindicated; the constants comment is incomplete,
  carried forward as F-1561-2.
- F-1285-2: the 0.4 bound now rests on a stated-in-advance experiment rather than an inference.
