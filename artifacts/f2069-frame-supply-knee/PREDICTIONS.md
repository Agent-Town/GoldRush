# f2069 Arm C — predictions registered BEFORE measurement

Written s2069 2026-08-19, before any throttled run existed. Recorded first so a green cannot be
read backwards into whatever the derivation needed (the F-1591-1 row's own warning: *"A mechanism
that explains everything is not thereby true"*).

## What is already proven by reading, and therefore NOT what this arm tests

`src/core/Loop.ts:116` is `Math.min(delta, 0.05)` and `:121` feeds that clamped value to `update()`
on the variable-step path; `src/town/TownScene.ts:686` is `this.elapsed += delta`. That
`Math.min` clamps is arithmetic, not a hypothesis. Re-verified from source this fire (coordinates
had rotted from the s1591 row: 453→456, 679→686, 2537→2596; substance identical).

## What is genuinely open, and what Arm A failed to establish

Arm A (`n2/n4/n8/n16`, merged `c213694c0`) tried to depress frame supply with parallel CPU load and
**could not arm** — every run stayed ~120fps. So the open question is not "does `Math.min` work" but:

1. **Can frame supply be depressed below the 20fps knee at all** in this app, or does something
   (rAF coalescing, vsync, compositor behaviour) keep it pinned high regardless?
2. **When it is depressed, does `Δelapsed/frame` actually pin at 0.05** — or does some other path
   also advance `elapsed`, which would falsify the "81 presented frames" budget?
3. **Does the 30s-cap timeout class (F-1587-2's 41.8s red) reproduce** below ~2.7fps?

## Predictions (falsifiable, stated as numbers)

| Arm | CPU throttle | Predicted fps | Predicted Δelapsed/frame | Predicted wall for 81 frames |
|-----|--------------|---------------|--------------------------|------------------------------|
| C-0 control | 1× | ≥60 | ≈ 1/fps, **< 0.05**, unclamped | ≈ 0.7–1.4 s |
| C-4 | 4× | ~15–30 | 0.05 **iff** fps < 20 | ≈ 2.7–5.4 s |
| C-8 | 8× | ~8–15 | **exactly 0.05** | ≈ 5.4–10 s |
| C-16 | 16× | ~4–8 | **exactly 0.05** | ≈ 10–20 s |
| C-32 | 32× | ~2–4 | **exactly 0.05** | ≈ 20–40 s; **may exceed the 30s cap** |

## Decision rule, fixed in advance

- **CONFIRMED** — some arm lands below the knee (mean frame interval > 50ms) **and** its
  `meanElapsedPerFrame` is 0.05 within float tolerance, **and** `maxElapsedPerFrame` never exceeds 0.05.
- **REFUTED** — an arm below the knee shows `meanElapsedPerFrame` materially ≠ 0.05 (i.e. `elapsed`
  is fed by something other than the clamped presentation delta).
- **COULD-NOT-ARM** — no arm gets the mean frame interval above 50ms. This is the Arm A outcome and
  is a **negative result to be reported as such**, not retried a fifth time with a bigger number.

A control arm at 1× runs in the same shell in the same window; per F-1270-1 the fire shell is the
known manufacturer of depressed frame supply, so the control is what distinguishes "the throttle
did it" from "the shell did it".
