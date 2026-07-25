# E1-only release build — MEASURED (s1056 fire, 2026-07-26)

**Slice:** none (no code changed). This is a MEASUREMENT of an owner-gated option, in the s1051 pattern:
turn a number on the OWNER'S DESK from a projection into an arithmetic fact before Robin has to answer.

**Verdict:** ✅ **Option (2) of F-1051-3 ("SHIP E1-ONLY") is worth −350.0 MiB / 82.7%, not the −205.6 MB / 49%
the desk projected — and the artifact builds, guards clean, and passes 24/24 release e2e today.**
**Still owner-gated and NOT shipped**: it removes E2–E10 from the deployed build, which is a product
decision (§7.3). Nothing in this fire changed what deploy.sh does or what players receive.

## Why this was measured now

The desk's option (2) was derived by applying `assert-release-build.mjs`'s rules to a *listing* of the
all-epoch `dist/` — "418 files, 205.6 MB — 49% of the upload — is later-epoch content". That is a
subtraction over a file list, not a build. It could not see that the E1 build also emits a smaller code
bundle and fewer images. Board was dry on all six slots, so the fire measured the premise instead.

## The numbers (same method, same tree, one build apart)

| | files | bytes | MiB | .glb | images |
|---|---|---|---|---|---|
| all-epoch (`npm run build`) | 3,053 | 443,984,214 | **423.4** | 406 / 306.8 MiB | 1,166 / 104.0 MiB |
| E1-only (`GR_RELEASE=e1 npm run build:release`) | 1,695 | 76,962,747 | **73.4** | 53 / 19.5 MiB | 759 / 47.1 MiB |
| **delta** | −1,358 | −367,021,467 | **−350.0 (82.7%)** | −353 / −287.3 MiB | −407 / −56.9 MiB |

The all-epoch row **independently reproduces F-1050-3** (423.4 MB, 3,054 files, 306.8 MB of GLB) from a
separate fire by a separate method — the cheapest available proof both measurements count the right thing.

The E1 byte count is not mine: it is the guard's own printed line, i.e. the artifact certifying itself —
`[release-build] E1-only: 1695 files, 76962747 bytes, zero later manifest ids or plate/GLB assets`.

## Two corrections to the desk

1. **Option (2) SUBSUMES option (1); they are not additive.** The desk says "the two overlap heavily".
   Precisely: after E1-only there are **53 GLBs totalling 19.5 MiB and all 53 already carry `-diet-`**,
   so the selector fix option (1) targets has almost nothing left to bite on. Option (1) projects
   423.4 → ~230.5 MB; option (2) measures 423.4 → 73.4 MiB — **(2) beats (1) by ~157 MiB and then
   leaves (1) with ~nothing to do.** (Option (1) remains the right fix if an all-epoch deploy is ever wanted.)
2. **In an E1-only build the dominant class is IMAGES, not models** — 759 files / 47.1 MiB = **64%** of
   the build, against 19.5 MiB of GLB. Every note in this saga has pointed at `.glb`. If 73.4 MiB ever
   needs to shrink further, the lever moved.

## Does it actually play?

`npm run test:release` (unprefixed — a fire may invoke it): **24/24 passed, both projects, 1.0m, rc=0.**
Includes a full first-player playthrough (*"first player reaches textured town actors and places a Dry
Gulch spring sluice"*, 34.5s mobile / 35.5s desktop), all five E1 maps booting through the release door,
debug/era query seams proven inert, later-flagship URLs declining to the Claim, a forged locked launch
declining, and an imported later ledger healing to the frontier and playing.

So option (2) is not a proposal needing engineering — it is a **working, gated, playable artifact today**.

## The guard that would enforce it — audited, and it is SOUND

Recorded because this factory has found three vacuous guards in a row (F-1044-1, F-1047-1, F-1052-1) and
the next reader should not have to re-derive that this one is different. `assert-release-build.mjs` has
four independent assertions; **each was exercised separately against the all-epoch dist and each fires**:

| assertion | line | hits on all-epoch dist |
|---|---|---|
| later-epoch manifest id in text | `:13` | fails immediately (`Game-C4ZLyxeC…js`) |
| later plate/GLB stems | `:36` | **432** |
| era-named assets `e2..e10` | `:37` | **418** ← independently reproduces F-1051-3's "418 files" |
| named later roster | `:42` | **131** |

It is also **fail-closed, not false-green**: invoked the way `npm run build:release` invokes it (no
`GR_RELEASE`) it throws `build:release requires GR_RELEASE=e1`, rc=1.

**And it is NOT an F-1047-1 repeat** — checked before claiming it. `playwright.release.config.ts:10`
supplies the env (`GR_RELEASE=e1 npm run build:release && vite preview`), and the entry point
`npm run test:release` is **unprefixed**, so the F-1024-4 env-prefix denial does not reach it. This is a
gate the factory can actually keep, and this fire kept it.

## Honest limits (so nobody is oversold)

- **NOT deployed.** That 73.4 MiB *completes* where 423.4 MiB timed out is arithmetic, not proof. At the
  measured ~3.3 MB/min uplink it is ~23 min of upload against ~128 min — the largest measured lever in
  this saga, and still not a guarantee.
- **Option (2) is a PRODUCT decision** — it removes the deep-saga epochs the T6–T10 wall only just
  shipped. Owner's alone (§7.3). A fire measuring it is not a fire choosing it.
- **No visual comparison** of the E1 build against the all-epoch one beyond the 24 e2e assertions.
- `dist/` was **restored to its all-epoch state** before this fire exited (`npm run build`, rc=0, 13s),
  so no later fire measures an E1-shaped dist and misattributes it — the F-1054-1/F-1055-1 stale-belief shape.

## Retained probes (RETENTION LAW §4.10b)

`logs/_s1056_e1_release_build.mjs` · `logs/_s1056_e1_release_suite.mjs` · `logs/_s1056_restore_dist.mjs`
