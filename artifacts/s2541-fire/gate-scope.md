# s2541 chapter writer gate scope

Candidate `44fd2661f345f25c9d9099359ff405eabd6b641e` is based on main `e53a12082daac6317e20da1ba9c85788021f0226`, in `/private/tmp/gr-gate-s2541`, backed up as `origin/save/chapter-evidence-s2541`. The seven writer-only changes from the saved s2537 candidate were applied to current main. All six s2540 readiness barriers, s2539 M2 input synchronization, and the current four-test Moth program and 138-row recording are preserved. No runtime or fixture change is proposed.

The first gate is the complete `npm run test:node-guards`, through the existing gate-battery driver, with Node 26.4.0, explicit PATH, and fire serialization. It runs alone. The previous full runs took 2,074.1 and 2,397.6 seconds; these are scheduling evidence, not current results. A full run consuming the fire window earns a retained gate result and HOLD handoff, not a waived battery or an untested merge.

If the gate leaves sufficient time, the remaining declared gates are typecheck, build, the six complete chapter specs on desktop and mobile, task-025/M1/M2 adjacency with fresh control for any known reds, plain desktop and 390px boot, and the changed-since auxiliary guards. Ordinary writer behavior must leave the 51 retained files byte-identical; explicit refresh must still write at the retained destination. No full Playwright regression is needed because simulation semantics do not change.

Evidence uses append-only transcripts in this directory. Scratch helpers live in `/tmp`; the private Vite server uses checked-free port 5331, candidate cwd, and a separate optimizer cache. Only processes and scratch outputs created by this fire may be cleaned up.
