# f2069 — the frame-supply knee, measured below it at last

**Slice:** F-1591-1 Arm C (evidence-only; no product bytes)
**Branch/tip:** main @ `2f8f165ac` (probe + first six arms), this file and the last two arms following
**Fire:** s2069, 2026-08-19
**Verdict:** ✅ **CONFIRMED — the clamp law holds at the regime that matters, and the timeout class reproduces.**

## What this answers

F-1591-1 (s1591) derived that `town.elapsed` gains `min(frameDelta, 0.05)` per **presented** frame, so
the `beauty-town` predicate `elapsed > 4` costs **at least 81 presented frames** regardless of wall time,
and below ~2.7 fps it must breach the spec's 30 s cap — the class of the single historical **41.8 s** red
that F-1587-2 chased through three non-reproductions.

Arm 0 (merged `c213694c0`, s1592) confirmed only the **upper bound**, taken entirely **above** the 20 fps
knee where the derivation itself says the ratio cannot move. Arm A tried to get below the knee with
N=2/4/8/16 parallel loads and **could not arm** — every run stayed ~120 fps. The row has read
*"unrefuted and still unconfirmed at the only regime that matters"* for ten days.

## Changed premise (§7.5 — a third attempt needs a changed premise, not a retry)

Parallel load is a **contention** instrument: it has to win a scheduling fight against a 10-core host, and
it lost. `Emulation.setCPUThrottlingRate` over CDP depresses the main thread **deterministically**, so it
does not depend on winning that fight. Predictions were registered in
`artifacts/f2069-frame-supply-knee/PREDICTIONS.md` **before any throttled run existed**.

## Evidence

Server: scratch port **5236** (`vite preview` on `dist/`, verified current — `Loop.ts` last changed
`f3e2d1026` 2026-08-04, `TownScene.ts` `e719d813d` 2026-08-15T09:09+07, dist built 2026-08-15T13:50Z).
Arms run **serially**, one browser at a time (§3.1: concurrency in a fire shell is what manufactures
depressed frame supply, and frame supply is this probe's subject).

| arm | throttle | fps | frame interval | mean Δelapsed/frame | min | max | clamp | frames to Δ4 | wall to Δ4 | predicted 81/fps |
|-----|----------|-----|----------------|---------------------|-----|-----|-------|--------------|------------|------------------|
| c0 control | 1× | 119.86 | 8.3 ms | 0.00833 | 0.00827 | 0.00839 | no | 485 | 4.05 s | 0.68 s |
| c4 | 4× | 117.54 | 8.5 ms | 0.00851 | 0.00829 | 0.01177 | no | 480 | 4.08 s | 0.69 s |
| c8 | 8× | 99.69 | 10.0 ms | 0.00982 | 0.00833 | 0.02572 | no | 426 | 4.27 s | 0.81 s |
| c20 | 20× | 29.31 | 34.1 ms | 0.02734 | 0.01625 | **0.05000** | no | 157 | 5.36 s | 2.76 s |
| c50 | 50× | 7.96 | 125.6 ms | 0.04840 | 0.03920 | **0.05000** | yes | 86 | 10.80 s | 10.17 s |
| c120-2 | 120× | 3.13 | 319.1 ms | **0.05000** | **0.05000** | **0.05000** | yes | 82 | 26.16 s | 25.85 s |
| c200 | 200× | 1.90 | 526.7 ms | **0.05000** | **0.05000** | **0.05000** | yes | **81** | **42.66 s** | 42.66 s |

### The three things this establishes

1. **Frame supply CAN be depressed below the knee — but only by a lot.** 4× and 8× barely move it
   (120 → 99.7 fps); it takes ~50× to cross the knee. **This is why Arm A could not arm, and it is a
   result, not an aside:** the town's per-frame JS cost is small against the frame budget, so load-based
   instruments have very little leverage. Anyone attempting this axis again should throttle, not load.
2. **Below the knee, `Δelapsed/frame` pins at exactly 0.05.** At 120× and 200× the min, mean and max are
   all `0.05` to float precision — *every* frame clamped. `max` never exceeds `0.05` in **any** arm,
   including the unclamped ones, so the upper bound Arm 0 established holds universally.
3. **The timeout class reproduces.** At 200× the run reached `elapsed > 4` in **exactly 81 frames** —
   the derivation's number, literally — taking **42.66 s**, with `elapsed` standing at only **2.90** when
   the spec's 30 s cap would have expired (`wouldTimeOutAt30sCap: true`). The historical red that
   started this whole thread was **41.8 s**. The mechanism reproduces it to within **2%**.

The knee is **not sharp in the mean**, and that is predicted rather than awkward: clamping is per-frame,
so a mixed frame-time distribution yields a mean between the two regimes (c20's mean is 0.0273 while its
max already touches 0.05). The mean pins only once essentially every frame exceeds 50 ms.

## Findings

**F-2069-1 — F-1591-1 is CONFIRMED at the regime that matters; its row's standing caveat is discharged.**
Non-blocking. The row's own words — *"it does NOT prove elapsed pins at 0.05 when clamped, because the
clamp never engaged"* — are now answered: the clamp engaged in four arms and pinned exactly.
No cure, by design: **nothing here is a defect.** The clamp is correct behaviour protecting the sim from
long frames; what the measurement establishes is that the *test predicate* `elapsed > 4` is denominated
in frames, not seconds, and therefore has a hard frame-supply dependency that its 30 s cap does not cover.

**F-2069-2 — a probe whose window can close silently will mislead exactly once, so record the exit.**
Non-blocking, already cured in this fire. The first 120× run (`arm-c120-1.json`, **retained**) closed its
measured window at 10.8 s with neither exit condition met, and reported `wouldTimeOutAt30sCap: false` —
which reads as "no timeout" when the truth was "never measured": the window simply never reached 30 s.
That is a **false negative wearing a real answer's clothes**. The probe now records `exitReason`,
`measuredWindowSeconds` and `capMs`, and returns `wouldTimeOutAt30sCap: null` (not `false`) when the
window never reached the cap. The re-run under instrumentation exited cleanly at `reached-elapsed-4`.
⚠️ **The early close of `c120-1` is itself still UNEXPLAINED** — its total process wall exceeded 300 s
while reporting an 11 s window, and no exit condition accounts for it. It is retained rather than
deleted, and it is *not* leaned on: every claim above rests on `c120-2` and `c200-1`.

## Scope / what this does NOT establish

- Measured in the **steady state**, with throttling armed after warmup. It does not model a cold-boot
  replay where load also delays asset work.
- CPU throttling is not the same stressor as a loaded CI box; it establishes the **mechanism**, not that
  any particular real-world red was produced by this exact route.
- No claim is made that F-1587-2's 41.8 s red *was* this. The mechanism is now shown sufficient to
  produce that number; sufficiency is not identity.

## Gates

Evidence-only: no product bytes, no `src/` or `e2e/` change, so the slice-gate battery does not apply
(nothing to regress). Artifacts and this review only. `test:ledger-guards` run as the fire's last act.
Zero console/page errors across all eight arms (`errors: []` in every JSON).
