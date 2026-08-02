# f1406-1 — aim the cross-engine guard at a subject that diverged

**Slice:** `f1406-1-aim-the-cross-engine-guard-at-a-subject-that-diverged` (main slot, DISPATCH 2, run `20260802-231226`)
**Base / tip:** main `132095c4` → runner output left uncommitted in main's working tree (main-slot convention)
**Banked at:** `save/f1406-1-dispatch2-fire-shell-s1408` (blob `5039bec2`), which also carries the two cure attempts s1408 measured
**Gated by:** s1408 fire, 2026-08-02T23:30Z → 2026-08-03T00:1xZ

## VERDICT (s1408): HOLD — NOT MERGED. The slice does what it was asked to do; it cannot pay for itself in the shell that has to run it.

## VERDICT (s1409, SUPERSEDING): MERGED — `9b3961f6952fffa23b23b4f518e0c0b98d13d94b`. The hold was lifted by RULING F-1408-2, not by a green.

The s1408 hold below stands as written, and its measurements were re-used rather than re-run. What changed is that the ruling it asked for was made. See the s1409 section at the foot of this file.

`scripts/wave-scaling-cross-engine.test.mjs` is a member of `test:node-guards` (`package.json:18`, verified by grep+read). That battery is run by **fires**, on every drain gate. This slice makes it either RED or ten-minutes-long in a fire shell. Merging it would hand every future fire a red it did not cause.

## What it does (and it is good work)

F-1406-1 found that the shipped determinism guard probed `the-claim` — one of the two contracts that **already agreed across engines before the f1405-1 cure** — so it was green on the broken tree and green on the fixed tree, certifying its own aim rather than the fix. This slice widens it from one contract to all three `HeadlessContractSim` supports, one independently-named test each, and pins no hashes. That is exactly the ask.

**Scope 3 — the deliverable — is SATISFIED, and I checked it before anything else** (the s1407 handoff warned that a green-only report would not satisfy it). The report carries a manufactured red naming the discriminating subject:

```
Manufactured full pre-cure defect: 2 pass / 1 fail, correctly naming e1-night-shift:
  fnv1a32:c832307e !== fnv1a32:ed5d8203
```

It also volunteers a premise correction worth keeping: restoring **only** the `spawnAtPosition` HP call — which the master named as the way to reproduce — stayed green at `fnv1a32:30373c0b`. The historical **five-site** restoration is what reproduces the divergence. The master's reproduction recipe was wrong and the runner said so instead of quietly working around it.

Firewall honoured: only `scripts/wave-scaling-cross-engine.test.mjs` was modified. F-1406-2 (widening the bench's own pin coverage) was explicitly declined as out of scope, as instructed.

## Evidence table — real numbers, and note WHICH SHELL each was taken in

| Arm | Shell | Arrangement | Child budget | Result |
|---|---|---|---|---|
| Runner's own report | lane | concurrent (`Promise.all`) | 60 s | **3 pass / 0 fail, 42.09 s** |
| `npx tsc --noEmit` | fire | — | — | **clean** |
| `npm run build` | fire | — | — | **rc=0, 24.3 s** |
| Guard as delivered | **fire** | concurrent | 60 s | **RED — rc=1, 95.0 s**; `not ok 3 e1-night-shift`, `code: null`, `duration_ms 65129` |
| Guard, timeout raised | **fire** | concurrent | 180 s | **RED — rc=1, 230.5 s**; same subject, `duration_ms 181831` |
| Single probe, alone | **fire** | one child, nothing else | — | v26.4.0 **56.7 s**, v23.11.1 **61.5 s**, both `fnv1a32:30373c0b` |
| Guard, serialised | **fire** | serial `for` loop | 180 s | **RED — rc=1, 697.2 s**, `not ok 3 e1-night-shift` |

Prior cost of this guard, for scale: **6.31 s**. The runner measured its own widening at **+35.78 s** — in the lane shell.

## Findings

**F-1408-2 (blocking, MEASURED) — the guard is green in the shell that wrote it and unaffordable in the shell that must run it.**

`code: null` is the discriminator: the child was **killed by its own timeout**, not caught diverging. There is no hash disagreement anywhere in these runs — when a probe was allowed to finish, both engines returned `fnv1a32:30373c0b`. **The f1405-1 cure holds. What fails is the budget.**

I was wrong twice on the way here, and both corrections are the useful part:

1. First hypothesis: *concurrency did it* (the F-1270-1 shape). I tested it by running one probe alone in the fire shell and got 61.5 s — already over a 60 s budget **with nothing else running**. So I concluded the budget was simply too tight and raised it.
2. Second hypothesis: *raising the budget cures it*. At 180 s it went red again at 181.8 s. So concurrency **was** implicated after all — 61.5 s alone vs >180 s with one sibling is the F-1269-1 fire-shell CPU ceiling — but my single-child measurement could never have shown that, because **I measured one child and the test runs two.** A measurement taken under a different arrangement than the one you are diagnosing is not evidence about it.
3. Third arm (serialise, giving each child the whole ceiling) came back **RED at 697.2 s** — so serialising is not a cure either, it is just a slower red. ⓘ Reported as observed, not smoothed: that run's TAP summary read `# tests 3 | # pass 2 | # fail 0` while also printing `not ok 3`, an internally inconsistent tally I did not chase and am not going to explain away. The `not ok 3` and the `rc=1` agree with the other two arms; the `# fail 0` does not agree with either, and the next fire should distrust that counter rather than me.

So in a fire shell this guard is red at every budget I could justify, or minutes long if serialised. `e1-night-shift` is the expensive subject — `e1-dry-gulch` and `the-claim` passed in every arm.

**This is not the slice's fault and the finding is not an argument to drop the subject.** `e1-night-shift` is precisely the contract that discriminates; a cheaper guard that keeps only the two contracts which cannot fail would be F-1406-1 all over again. The tension is real and it needs a ruling, not a tweak:
  · (a) keep all three but run the cross-engine guard **only outside the fire shell** — the inverse of the `workers: isFireShell` mechanism at `playwright.config.ts:50`, skipping in fires rather than serialising there. Cheapest, and honest, but it means the fires never run it;
  · (b) make the probe itself cheaper for `e1-night-shift` (fewer waves) so the comparison survives on a smaller sample;
  · (c) accept a ~4-minute `test:node-guards` in fires.
**RECOMMENDATION: (a)**, with the skip reason printed so a green never reads as coverage it did not perform. It mirrors a mechanism the factory already trusts and it keeps the discriminating subject.

**F-1408-3 (non-blocking, for the record) — the master's reproduction recipe named one site; five are required.** Recorded so the next author does not re-derive it. The runner found this and reported it rather than papering over it.

## Custody

Undecided content was in main's working tree (main-slot convention puts it there). It is banked at `save/f1406-1-dispatch2-fire-shell-s1408` **before** main was restored, and the restore was verified by **blob hash**, not by `git status` — per F-1295-1, a sweep's signature is the absence of dirt, so `git status` cannot discriminate. `HEAD:scripts/wave-scaling-cross-engine.test.mjs` = worktree = `97358bf3`; the banked variant is `5039bec2`. Nothing was lost and nothing undecided is on main.

---

# s1409 — the ruling, and what it cost to make it

**Gated in:** detached worktree `worktrees/gate-s1409` (§3.0b — the block was `blockClass: "gate-side"`, so evidence may be gathered but main's tree may not be dirtied)
**Merged:** `9b3961f6952fffa23b23b4f518e0c0b98d13d94b`, leaf flipped in the immediately following commit (F-1384-1: a commit cannot contain its own hash)

## The ruling: (a), as recommended — but re-priced first rather than inherited

s1408 recommended (a) and it was right. I did not take that on trust, because the choice between (a) and (b) turns on a number s1408 never measured: **how much of the cost is `e1-night-shift` itself, and is there a cheap trim of it?** Measured in a fire shell:

| Contract | Waves | Replay events | Fire-shell wall |
|---|---|---|---|
| `the-claim` | 10 | 545 | **4.4 s** |
| `e1-night-shift` | 25 | 1541 | **35.8 s** |

Cost is **super-linear in waves** — 2.5× the waves for 8× the time — so a "fewer waves" trim buys much less than it looks like it should, and any trim deep enough to matter would have to be justified against the very property that makes `e1-night-shift` the only discriminating subject. Option (b) had no cheap version. Option (c) pays ~4 minutes on every drain gate forever. **(a) it is.**

⚠️ Note 35.8 s here against s1408's 56.7 s for the same probe: **the fire shell's cost is not a constant**, which is itself a reason not to buy this workload there.

## What landed

`scripts/cross-engine-skip.mjs` holds the decision as a pure function, so **both** directions are assertable; `scripts/cross-engine-skip.test.mjs` pins them and is rooted in `test:node-guards`. The skip reason is a **string**, so node:test prints `# SKIP <reason>` on every line and a fire's green cannot be misread as coverage it did not perform.

**Red path proven by manufacturing the defect** (a passing guard never executes its violation path): replacing the function body with an unconditional skip — the exact "simplification" that would silently delete the cross-engine guard from the whole factory — goes **rc=1 naming the lane arm**, while the **fire arm still passes**. That asymmetry is the whole argument for a two-directional guard: a one-directional one would have been green on the defect. Probe reverted, `sha256/16 93ea6c8e95f469c5` byte-identical.

⚠️ **What this cure does NOT do, stated so no one reads it as more than it is:** fires no longer run the cross-engine comparison at all. The coverage now lives entirely in lane and attended shells. That is defensible — sim code is authored there — but it is a real reduction, and the printed SKIP reason exists so that nobody mistakes a fire's green for the check having happened.

## Evidence

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | rc=0, 17.2 s |
| `npm run build` | rc=0, 50.6 s |
| cross-engine guard, fire shell | **rc=0, 0.1 s, 3 skipped, reason printed** (was RED 95.0 / 230.5 / 697.2 s at s1408) |
| `node --test scripts/cross-engine-skip.test.mjs` | rc=0, 3 pass; manufactured defect → **rc=1** |
| `npm run test:node-guards` ×3 (arm) | 235 tests — 232 pass / 232 / 231 |
| `npm run test:node-guards` ×3 (control, pristine main) | 230 tests — 230 / **1 red** / 230 |

Lane-shell behaviour is **not** re-measured here and is not claimed: I cannot produce a lane shell from inside a fire, and unsetting `CLAUDE_CONFIG_DIR` would only change the *label*, not the process context that F-1269-1 is about. The lane arm rests on the runner's own s1408 report (**3 pass / 0 fail, 42.09 s**) plus the pure-function guard above.

## F-1409-1 — a red in a file this slice never touched, and why it is not this slice's

The battery drew a red in `scripts/gr-sim.test.mjs`. I did not reason my way out of it; I ran the **control**: same battery, same shell, same hour, slice reverted to pristine main. **Control 2 green / 1 red. Arm 1 green / 2 red.** The flake is on main.

Three further facts make it a load ceiling rather than a line: a **different test** fails on different runs (`replays … byte-for-byte` at 53.8 s twice, `boots escort mode from data` at 41.3 s once); every failure carries an **inflated duration**; and the same file run **isolated is rc=0**, with the byte-for-byte test taking **5.1 s** instead of 53.8. `node --test` runs files concurrently, so a heavy sim file competes with 38 siblings under the F-1269-1 ceiling.

**At n=3 per arm the green-rate difference between arm and control is noise, and I am not claiming it as a difference in either direction** — including the tempting direction, that skipping the probes made the battery lighter. Filed as F-1409-1 with its own gate; deliberately not cured from inside a drain.
