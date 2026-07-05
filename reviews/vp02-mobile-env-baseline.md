# Finding: vp-02 mobile failures are environmental baseline, not lane debt — s34

Two mobile-chrome tests fail on the 2026-07-05 sandbox VM, on BOTH the lane/perf
merge candidate AND stock main d801243 (bisect: stock files swapped into the same
env, east-mirroring repro 2x, damped-sweep 1x):

1. `east heading uses west files with mirrored pixels` — assertion, not timeout:
   asymmetry delta -0.003 vs required > +0.004; snapshot.mirrored=true and frameKey
   correct, pixels not (fully) mirrored. Likely the screenshot lands mid-crossfade
   on the slow emulated device, washing out the asymmetry signal.
2. `damped heading sweep visits every orientation in order` — hard 30s test timeout.

Context: this VM is measurably slower than the s32/s33 one (shared /sessions volume
at 98-100%, phantom 8.5G held by the harness; DISK LAW updated). s32 recorded vp-02
11/11. Same code, different iron.

Class: env-timing. NOT a lane/perf regression; gate passed with this on record.

Suggested fix (small, someone's next slice, NOT urgent): mobile-project-only
`test.slow()` or timeout bump on the sweep test; for the mirroring test, wait for
`fadeActive === false` in the snapshot before capturing pixels — that also makes it
deterministic on fast machines.

Desktop: vp-02 11/11, vp-02b 5/5 — unaffected.
