# GG-03b — gazette panel weight (measure-first STOP)

- **Slice:** `tasks/lane-gg-03b-gazette-panel-weight.md` (s1208-authored, FIRE-AUTHORED)
- **Branch / tip:** `lane/m3` @ `a7c91fdc` (runner(lane-a), 2026-07-29 11:32→11:44)
- **Merge-base:** `29fecc6a` · **true delta vs base: 1 file, +23** (`artifacts/gg-03b-gazette-panel-weight/report.md`)
- **§3.0 `drain-block-check`:** ✅ CLEAR (`[gg-03-gazette-panel-swap] status="queued"`) — ran first, before classification.
- **Verdict: MERGE the stop report. The STOP was lawful. But `PREMISE-NOT-REPRODUCED` must NOT be recorded as "F-1208-1 refuted" — pooled across three fires the treatment still fails 6/12 where the control fails 0/16.**

## What it does

GG-03b's scope 1 was a mandatory measure-first gate with the power to cancel scopes 2–6: re-run
`e2e/gazette-art-wiring.spec.ts` at the canonical config against the archived GG-03 treatment and against
base, interleaved, and proceed only on **≥2/4 treatment red with control green**. The runner measured
4 arms on lane-a scratch port 5262, got **treatment 4/4 green, control 4/4 green**, and stopped —
retaining no source, CSS, guard, e2e, raw or derivative change. The delta really is one report file.

That is exactly what the master told it to do, and it did it honestly: it interleaved, it recorded all
four cells, it refused the shared port 5188 when it found lane-d holding it, and it discarded a first
invocation that died before test collection rather than count it. **The obedience is not in question.**

## Evidence

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | clean |
| `npm run build` | green, 1.52 s |
| `e2e/gazette-art-wiring.spec.ts` (desktop+mobile, **2 workers**, scratch 5271, on main) | **4/4 passed (21.5 s)**, `:103` 2/2 green |
| True delta vs merge-base | 1 file, +23/−0 — no src, no guard, no spec |
| Dev-path panel weight (byte probe, this tree) | **22,489,952 B = 21.45 MB** across 6 panels |
| `dist/` panel weight, post-diet (s1208's figure) | 3,350,448 B vs a 4,000,000 B ceiling |

## F-1209-1 (HIGH) — `PREMISE-NOT-REPRODUCED` is a true statement about 4 cells and a false inference about the world

The master's threshold was written to be judged **on the run's own 4 cells only**, so it silently discarded
the 16 cells s1208 had already measured. Pooling every cell measured at the canonical 2-worker config:

| Fire | Arm | `:103` failures |
|---|---|---|
| s1208 | control | 0/8 |
| s1208 | treatment | **6/8** |
| GG-03b (s1209 drain) | control | 0/4 |
| GG-03b (s1209 drain) | treatment | 0/4 |
| s1209 (this drain, on main) | control | 0/4 |
| **Pooled** | **control** | **0/16** |
| **Pooled** | **treatment** | **6/12 (50%)** |

Fisher's exact on 6/12 vs 0/16 gives p ≈ 0.002. **The treatment has a failure mode the control does not
have, at 12 and 16 cells respectively.** GG-03b did not refute that; it sampled a window in which the
mode did not fire. s1208 had already flagged the shape — a 1-worker rerun passed 2/2 — and named it:
*a documented flake may be a load ceiling, not a line*. Two fires disagreeing at n=8 and n=4 is the
signature of an undersampled rate, not of one fire being wrong.

**Consequence:** GG-03 stays blocked. The archive ref `archive/lane-perf-gg03-06eeac68` stays pinned.

## F-1209-2 (HIGH, the generalisable one) — the measure-first gate was aimed at the load-dependent variable when a load-free one was sitting in the same review

s1208's review carried **two** findings. F-1208-1 is a *timing symptom* — whether a 30 s test times out —
which is by construction a function of ambient machine load. F-1208-2 is a *byte fact*. The master gated
scope 1 on the symptom, so an ambient-load difference between two fires was enough to cancel the work.

Had it gated on the byte fact, the gate would have been deterministic. I re-derived it this fire, from a
server I first proved was serving this tree by **byte-identity** (`served 3,812,947 B == local 3,812,947 B`,
`buf.equals(local)` true — a stronger identity proof than the `/src/main.ts` string check I tried first,
which correctly failed only because Vite transforms TS):

```
200   3812947  gazette-panel-claim-goal.png
200   3891517  gazette-panel-freeing-fevered.png
200   3867107  gazette-panel-seams-gold.png
200   3313922  gazette-panel-the-arms.png
200   3755707  gazette-panel-the-works.png
200   3848752  gazette-panel-town-serves.png
DEV-PATH TOTAL 22489952 = 21.45 MB
```

**That number does not move with load, worker count, or time of day.** It is the same on a quiet box and a
busy one. A measure-first gate built on it cannot return `PREMISE-NOT-REPRODUCED` by luck.

➡️ **Standing lesson, worth a convention: when a report offers both a timing symptom and a deterministic
mechanism for the same defect, the measure-first gate must be written on the mechanism.** The symptom is
what you noticed; the mechanism is what you can measure twice and get the same answer.

## F-1209-3 (HIGH) — F-1208-2 re-derived and confirmed independently: the guard's denominator excludes the path it regressed

✓ VERIFIED by reading `scripts/asset-diet.mjs`, not by grep. Line 9 is `const distDir = resolve('dist')`,
and GG-03's added ceiling reads:

```js
const afterGazetteBytes = await totalBytes((await filesUnder(distDir))
  .filter((file) => basename(file).includes('gazette-panel-')));
```

`filesUnder(distDir)`, evaluated **after** the diet has already converted the plates to webp. So the guard
measures 3,350,448 B and passes a 4,000,000 B ceiling, while the path every `npm run dev` playtest and
**every e2e run** uses carries 22,489,952 B. **6.7×.** The shipped build is fine; the developed and tested
one is not.

Two supporting details I verified rather than assumed:
- The panels are **1672×941**, which is exactly the `platePngs` plate tier in `asset-diet.mjs`, so they are
  legitimately converted to webp with no resize. (My first hypothesis — that they were 1024-squares tripping
  the "unrecognised 1024-square tier" warning — was **wrong**, and measuring the dimensions is what corrected it.)
- The wiring is `import.meta.glob('../../assets/raw/gazette-panel-*.png', { eager: true, query: '?url' })`,
  which in dev resolves to the raw file served verbatim — confirmed by the byte-identity probe above.

**The ceiling is also fitted to the observed value** (4,000,000 against a measured 3,350,448, a 19% margin
chosen after the fact). That is a second, milder weakness in the same guard.

## Merge classification

Base `29fecc6a`. Single LANE-TOUCHED file, `artifacts/gg-03b-gazette-panel-weight/report.md`, pure add —
grafted path-scoped with `git checkout lane/m3 -- <file>`. Every other entry in the `main..lane/m3` two-dot
diff (the deletion of all five s1208 files, 7k lines of `goals.json`) is **stale-base phantom**: the branch
forked at s1208's lock commit, before s1208's own handoff landed. Classified against the merge-base, never
against main. No conflicts.

The two `artifacts/gazette-art-wiring/*.png` my control run regenerated were **reverted, not committed**
(known F-1204-2 churn).

## Disposition

- Stop report merged — it is real measured evidence and the retention law keeps it.
- GG-03 **remains blocked**; archive ref stays pinned.
- **GG-03c authored this fire**, re-gated on the byte fact (F-1209-2), not on the timing symptom.
