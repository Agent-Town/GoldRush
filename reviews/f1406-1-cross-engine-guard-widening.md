# f1406-1 — aim the cross-engine guard at a subject that diverged

**Slice:** `f1406-1-aim-the-cross-engine-guard-at-a-subject-that-diverged` (main slot, DISPATCH 2, run `20260802-231226`)
**Base / tip:** main `132095c4` → runner output left uncommitted in main's working tree (main-slot convention)
**Banked at:** `save/f1406-1-dispatch2-fire-shell-s1408` (blob `5039bec2`), which also carries the two cure attempts s1408 measured
**Gated by:** s1408 fire, 2026-08-02T23:30Z → 2026-08-03T00:1xZ

## VERDICT: HOLD — NOT MERGED. The slice does what it was asked to do; it cannot pay for itself in the shell that has to run it.

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
