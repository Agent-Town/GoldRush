# F-1476-1 — the renderer-count reproducibility measurement (s1477)

**Status: MEASURED. This is the denoised statistic F-1476-1's gate asked for and s1476 could not
supply.** s1476 proved a bisect harness constructible, then correctly refused to bisect because its
predicate was non-monotonic and a back-to-back control at one commit returned two different answers
(n=2). This fire supplies the missing statistic: **n runs at ONE commit, instrument pinned, subject
fixed** — the only thing varying between samples is the run itself, so any spread IS the noise band.

- Commit under test: `659f4efe0` (main at s1477 lock).
- Worktree: detached `gate-s1477` (§3.0b custody — main's tree never held undecided content).
- Instrument: `npx playwright test --project=desktop-chrome --workers=1` (§3.1), same shell, serial.
- Harnesses: `measure.mjs` (crawler, n=12), `measure2.mjs` (railcar, n=10), `common-mode.mjs`.
- Raw samples retained: `samples-*.json`; per-metric spread: `spread-*.json`.

## 1. `wire-crawler-3d` — n=12, all rc=0

**18 of 20 metrics are byte-stable across all twelve runs.** Exactly two jitter:

| metric | verdict | observed |
|---|---|---|
| `coldBaseline.calls` | **NOISY** spread 1 | 73, 74 |
| `coldBaseline.triangles` | **NOISY** spread 2 | 147706, 147708 |
| `coldBaseline.geometries` | STABLE | 81 (12/12) |
| all 17 others (`mounted.*`, `loadedBeforeKill.*`, `presentationBaseline.*`, `disposed.*`, `coldBaseline.textures`) | STABLE | single value 12/12 |

⚠️ **This corrects an inherited reading.** s1476 recorded `geometries 80→81` as "stable across both
runs, unattributed, possibly real". At n=12 `coldBaseline.geometries` is **hard-stable at 81** — so it
is a genuine reproducible property of the commit and IS attributable by bisect. It was never the
noisy component; only `calls`/`triangles` are.

## 2. `wire-railcar-3d` — n=10, all rc=0

**8 of 18 metrics jitter** — this spec is markedly noisier, and the difference matters:

| metric | verdict | observed |
|---|---|---|
| `baseline.calls` / `.triangles` / `.geometries` | NOISY | 86–87 / 116720–116722 / 93–94 |
| `mounted.geometries` | NOISY | 101, 102 |
| `despawned.geometries` | NOISY | 98, 99 |
| `combatDeath.calls` / `.triangles` / `.geometries` | NOISY | 57–58 / 113216–113218 / 98–99 |
| `despawnDelta.geometries` / `.textures` | **STABLE** | −3 / −4 (10/10) |
| all `textures`, `mounted.calls/triangles`, `despawned.calls/triangles` | STABLE | single value |

🔑 **THEREFORE A METRIC CANNOT BE CLASSIFIED BY ITS NAME.** `geometries` is hard-stable in the
crawler's `coldBaseline` (12/12 at 81) and noisy in four railcar phases. Noise is a property of the
**(spec, phase, metric) triple, measured** — not of the metric. Any cure that whitelists "geometries
is reliable" or "calls is unreliable" as a global rule is wrong on this evidence.

## 3. The mechanism (`common-mode.mjs`) — why the deltas survive

Two distinct jitter behaviours, separated by asking whether the offset cancels within a run:

**(a) `geometries` and `textures` jitter is perfectly COMMON-MODE.** Across all 10 railcar runs and
all 6 phase pairs, every `geometries` and `textures` delta is a single exact value:

```
mounted-baseline.geometries:      STABLE 8        mounted-baseline.textures:      STABLE 3
despawned-baseline.geometries:    STABLE 5        despawned-baseline.textures:    STABLE -1
combatDeath-baseline.geometries:  STABLE 5        combatDeath-baseline.textures:  STABLE -1
despawned-mounted.geometries:     STABLE -3       despawned-mounted.textures:     STABLE -4
combatDeath-mounted.geometries:   STABLE -3       combatDeath-mounted.textures:   STABLE -4
combatDeath-despawned.geometries: STABLE 0        combatDeath-despawned.textures: STABLE 0
```

The absolutes move (93/94, 98/99) but the **differences are exact**. This is why the railcar spec's
one live assertion — `disposedCounts.geometries - baseline.geometries < 8` — is sound and has never
flaked: it asserts on a delta, and deltas are reproducible.

**(b) `calls` and `triangles` jitter INDEPENDENTLY per phase, so their deltas are NOT stable.**
`combatDeath - baseline` took three distinct values over ten runs (−28/−29/−30 calls,
−3502/−3504/−3506 triangles). Only `despawned-mounted` happened to stay exact.

🔬 **The signature of the jitter is one quad.** In every sample of BOTH specs, `+1 call` occurs with
exactly `+2 triangles` and never otherwise — crawler 73↔147706 / 74↔147708, railcar baseline
86↔116720 / 87↔116722, railcar combatDeath 57↔113216 / 58↔113218. One extra draw call carrying
exactly two triangles is a **single quad** (one sprite/UI/billboard) present or absent in the frame
the diagnostics happen to sample. That is a sampling race, not a rendering change.

## 4. What this means for the F-1476-1 gate

The gate closes on either **(a)** counts re-characterised with a measured noise band and the
artifact recording a tolerance instead of a byte, or **(b)** the spec no longer writing them into
the tracked tree.

✓ VERIFIED, and it is the load-bearing fact for choosing between them: **nothing reads these files.**
`git grep renderer-count` over all tracked files returns the two specs that WRITE them and otherwise
only prose (reviews, BACKLOG, STATUS, task masters). There is no consumer, no guard, no assertion
against the committed JSON. The four tracked `renderer-counts-*.json` are **write-only evidence**,
and their only mechanical effect today is to dirty the tracked tree on every run — the F-1407-1
artifact-churn class, which can trip a lane pre-flight's clean-vs-main test.

**Recommendation (a), on this evidence, because it is strictly better than (b):** deltas are exact
and are the part that carries regression signal, so throwing the artifact away would discard real
evidence to fix churn. Record the reproducible quantities as exact bytes (all `geometries`/`textures`
phase-to-phase deltas, plus every metric measured stable) and record the single-quad-jitter
quantities as a **tolerance band** rather than a sample. Re-runs then produce byte-identical files —
the churn ends — while a value leaving its band becomes a real, visible signal instead of noise
indistinguishable from drift.

⚠️ **Two standing cautions this measurement does NOT lift.** The bands above are measured for
`desktop-chrome` at `659f4efe0` on this machine; `mobile-chrome` was not sampled, and neither was any
other host. And per F-1476-1's own closing sentence, **do not "refresh" the committed baselines as a
drive-by** — that blesses one sample of a jittery quantity as truth, which is the misreading the
finding exists to stop.
