# Review — e1-approach-helper-dedupe (F-1257-3's corrective)

**Slice:** `lane-b-approach-helper-dedupe.md` (FIRE-AUTHORED s1257) · **branch** `lane/m4` · **tip** `7291f08a` · **drained** s1258
**Verdict:** ✅ **MERGE** — scope met exactly, class closed rather than instance patched, and the gate battery came back *stronger* than the authored baseline.

## What it does

The braking-lead hero-approach algorithm — the thing whose *previous* incarnation silently missed its own `0.12` tolerance on 13/13 moves and let the E1 plain-boot proof pass by harvest-range luck for an unknown number of fires (s1256, F-1206-1) — existed in two byte-identical copies after `616f82c6`. This slice deletes the inlined copy from `e2e/release-build.spec.ts` and imports the shared module instead. One file, `1 insertion(+), 57 deletions(-)`, **zero `src/` bytes, zero bytes in `e2e/helpers/hero-approach.ts`, zero regenerated artifacts**. No behaviour change anywhere: not the `0.12` tolerance, not the `speed / 28 + 0.08` lead, not the 16 ms sampler, not the 12-pass cap.

## Evidence (re-measured on merged main, not inherited from the run)

| Gate | Result | Note |
|---|---|---|
| `npx tsc --noEmit` | **clean** | — |
| `npm run build` | **green**, 1.20 s | asset-diet clean: herald dev-path 1,158,214 B vs 1,500,000 B ceiling |
| **Release suite** (`playwright.release.config.ts`) | **26 / 26 passed**, 1.1 m | loadavg **9.90** at start — a *loaded* green |
| Adjacent `trail-guide-plain-boot` + `trail-guide` @ `--workers=1` | **14 / 14** both projects, 1.9 m | the shared helper's other caller |
| **Canonical arm** — `trail-guide-plain-boot --repeat-each=2`, **default workers**, both projects | **4 / 4**, 43.1 s | loadavg **7.54 → 18.25**. This spec's history is three false GREENs under `--workers=1`, so the serial arm is deliberately *not* the gate |
| Console / page errors | zero | both suites assert it; assertions untouched |
| Screenshots | **none owed, none regenerated** | the slice renders nothing; regenerating would be the churn that made this lane look permanently ahead |

**Merge classification.** Lane base `f82069a7`; `git log f82069a7..main -- e2e/release-build.spec.ts e2e/helpers/hero-approach.ts` is **empty** → both files are **MAIN-UNMOVED**, so the single LANE-TOUCHED file was taken directly. Every other path in `git diff main lane/m4` (STATUS.md, `logs/*`, `tasks/BACKLOG.md`, six `gg-03c` shots) is **MAIN-MOVED-ONLY** reverse-noise from main's four commits after the lane base — none merged.

## What the drain verified for itself rather than trusting

- **Byte-identity of the deleted body** (the run's central claim, and scope 3's STOP condition): read both, line-for-line. The deleted `moveHeroTo` is identical to `hero-approach.ts:5-59` modulo the `export` keyword — same `const SIM_PROGRESS_TIMEOUT = 15_000`, same `hypot(dx,dz) <= 0.12` return branch, same `speed / 28 + 0.08` release condition, same `speed < 0.05` settle, same 12-pass cap, same throw at `:58`. **A move, not a redesign.** ✓ VERIFIED
- **The class, not the instance.** `grep -rn 'speed / 28' e2e/` now returns **exactly one line** — `e2e/helpers/hero-approach.ts:41`. The braking-lead algorithm has one copy in the repository. `grep -rln 'helpers/hero-approach' e2e/` returns exactly the two intended callers. ✓ VERIFIED
- **Scope 2's dead constant.** `SIM_PROGRESS_TIMEOUT` no longer appears anywhere in `release-build.spec.ts`; its deletion is correct, and `type Page` is still used at 8 sites so the import stays. ✓ VERIFIED

## Findings

- **F-1258-1 (non-blocking, master-accuracy note — the master undercounted the blast radius by 4.5×).** Both the master and the F-1257-3 finding describe *"its two call sites at `:305-306`"*. There are **nine**: `:83, :84, :86, :299, :300, :301, :304, :305, :306`. Harmless here — the signature is identical, no call site needed editing, and the run correctly reported none changed — but it means the shared helper now carries **eleven** call sites across two specs, not four. That *raises* the value of this dedupe and the cost of any future tuning of `hero-approach.ts`. Recorded so the next person to touch that file knows what they are moving.
- **F-1258-2 (non-blocking, cosmetic-but-loaded name collision).** `e2e/trail-guide-plain-boot.spec.ts:8` declares its own `SIM_PROGRESS_TIMEOUT = 20_000` and uses it for `expect.configure` timeouts, while the helper it calls holds an internal `SIM_PROGRESS_TIMEOUT = 15_000` (`hero-approach.ts:3`). Same name, different value, different purpose, two files that talk to each other. This is exactly the shape of trap scope 2 was written to prevent inside one file. No action taken (the firewall forbade touching either), and no defect follows from it today — the helper reads only its own constant. Flagged for whoever next tunes the braking budget: **the 20_000 is not the helper's budget.**
- **F-1258-3 (non-blocking, and this one is good news about a known red).** The authored baseline was `25 passed / 1 failed`, the red being `later flagship URLs decline to the Claim` on **mobile-chrome** (F-1180-2's known transient). This drain measured **26/26 — that test green on BOTH projects, under loadavg 9.90.** The lane's own run measured it red on **desktop-chrome** instead. So across four readings on effectively-unchanged code: s1255 green/green, s1257 red on mobile, lane run red on desktop, s1258 green/green. **It is confirmed a rate and confirmed not project-specific** — the "(mobile-chrome)" qualifier that has been travelling with F-1180-2 in the ledgers is an artefact of a single sample, and should not be treated as scope. Cited by title throughout, per the master's instruction, since ~55 deleted lines moved its line number.

## Duplication inventory (reported, deliberately NOT fixed — one class per slice)

The run named inline `shot` and `openGame` helpers as widespread in `e2e/` without comparing bodies. Confirmed as unexamined, and left that way: this slice's class was the braking-lead algorithm, and it is closed. A body-comparison sweep of the `shot`/`openGame` family is a separate candidate, not an owed corrective — those are boilerplate, not an algorithm that was once silently wrong.
