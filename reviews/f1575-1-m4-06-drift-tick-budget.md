# F-1575-1 — m4-06 drift tick budget

## Verdict

**(A) CONFIRMED.** The existing denied-receipt window is not deterministic: `tickDelta` varied from 23 to 26 across the 24 full-spec runs. The controlled sweeps crossed `driftAbs=0.4` at tick deltas 36–42 on desktop and 43–44 on mobile. At `timescale=4`, the smallest gap from the observed full-spec maximum (26) to a crossing (36) is 10 fixed ticks, or about 2.5 normal 60 Hz rAF frames. That is within reach of page-round-trip latency under the working-machine load that distinguishes the three historical full-gate breaches from the dedicated quiet samples.

The bound is therefore a race against page-round-trip latency. The three historical new-regime breaches now have a concrete mechanism, though their exact `tickDelta` values cannot be recovered because those runs did not log the counter. Recommended follow-up: make the whole `before`→`after` window deterministic. This task deliberately does not implement that cure and does not change either `0.4` bound.

## Full-spec distribution — 24 serial runs

All projects ran serially with `--workers=1`; raw logs and exit-code companions are under `artifacts/f1575-1-drift-tick-budget/<project>/run-NN.{log,rc}`. Every invocation emitted exactly one `[m4-06-denied]` line. The full parsed table is `artifacts/f1575-1-drift-tick-budget/samples.txt`.

| Project | Pass/fail invocations | `tickDelta` distribution | Min | Max | Distinct |
|---|---:|---|---:|---:|---:|
| desktop-chrome | 12 pass, 0 fail | 23×1, 24×6, 25×3, 26×2 | 23 | 26 | 4 |
| mobile-chrome | 11 pass, 1 fail | 23×2, 24×5, 25×3, 26×2 | 23 | 26 | 4 |
| combined | 23 pass, 1 fail | 23×3, 24×11, 25×6, 26×4 | 23 | 26 | 4 |

The paired `simSecondsDelta` values were quantized with the ticks: 23→about 1.9667 s, 24→2.1000 s, 25→2.2333 s, and 26→2.3667 s.

No item-3 run produced a genuine denied-drift breach. Nothing was re-run or excluded. Mobile run 02 remained red at rc=1 with `9 passed (38.5s)`, but its denied test passed with:

```text
[m4-06-denied] driftAbs=0.30904530412222725 gapClosed=0.30863110994026144 tickBefore=25 tickAfter=49 tickDelta=24 simSecondsDelta=2.1000000000000014
```

The unrelated failure was the existing `Prospector floats above terrain while following hero probe points` assertion at `e2e/m4-06-embodiment.spec.ts:229`: expected `position.y >= 1.495`, received `1.287`. It is reported here and deliberately not fixed under the firewall.

## Controlled drift-vs-tick sweeps

Each project ran three times, serially with `--workers=1`; every invocation passed and asserted zero console errors and zero page errors. The files `artifacts/f1575-1-drift-tick-budget/sweep-<project>-NN.txt` contain every sampled pair. The curve up to the first crossing was:

| Project/run | `(tickDelta, driftAbs)` samples through first `> 0.4` | First crossing |
|---|---|---:|
| desktop 01 | (26, 0.223660), (31, 0.354295), (36, 0.422787) | 36 |
| desktop 02 | (29, 0.194659), (35, 0.296651), (37, 0.315387), (42, 0.421070) | 42 |
| desktop 03 | (25, 0.203593), (28, 0.263805), (31, 0.338186), (36, 0.407647) | 36 |
| mobile 01 | (30, 0.209122), (34, 0.257560), (37, 0.322453), (43, 0.406007) | 43 |
| mobile 02 | (30, 0.209122), (34, 0.257560), (39, 0.381257), (44, 0.436165) | 44 |
| mobile 03 | (31, 0.224361), (35, 0.276877), (38, 0.341984), (43, 0.404085) | 43 |

The complete sweeps continued beyond 40 ticks past `before` (final sampled deltas 84–92 desktop and 89–90 mobile). Round trips were not corrected out; their added ticks are recorded in every pair as required.

## Existing-test arrangement proof

`companion()` still performs one `page.evaluate`; it now returns the existing embodiment fields plus the already-published `simulation.tick` and `timeAlive`. No `src/**` file changed.

The denied-receipt test body's exact diff is the existing log line only—no `expect`, `await`, or `page.evaluate` was added, removed, reordered, or reworded:

```diff
-  console.log(`[m4-06-denied] driftAbs=${driftAbs} gapClosed=${gapClosed}`);
+  console.log(`[m4-06-denied] driftAbs=${driftAbs} gapClosed=${gapClosed} tickBefore=${before.simTick} tickAfter=${after.simTick} tickDelta=${after.simTick - before.simTick} simSecondsDelta=${after.timeAlive - before.timeAlive}`);
```

## Verification

- Pre-flight citations: all three required greps returned `1`.
- Baseline build: rc=0, Vite `✓ built in 1.60s`; asset diet `1158214 bytes (1500000 byte ceiling)`.
- `npx tsc --noEmit`: rc=0.
- Full m4-06 spec: desktop 12/12 invocations `10 passed`, rc=0; mobile 11 invocations `10 passed`, rc=0, plus the preserved run 02 `9 passed`, rc=1 described above.
- Sweep spec: desktop 3/3 and mobile 3/3 invocations `1 passed`, rc=0; zero console/page errors asserted in every run.
- `npm run test:node-guards`, run alone under pinned Node 26.4.0: `393 tests / 393 pass / 0 fail / 0 skipped`, rc=0. Two earlier attempts were invalidated honestly: one completed contended under Node 23, and one Node 26 attempt was interrupted immediately after detecting the live FIRE battery; neither is counted.
- Final build: rc=0, Vite `✓ built in 1.50s`; asset diet `1158214 bytes (1500000 byte ceiling)` and `235 terrain/landmark GLBs 592044952 -> 92718740 bytes (84% cut); 54 plate-class PNGs 187042157 -> 24822346 bytes (87% cut); herald spot cuts 375470 bytes`.
- `git add --dry-run` confirmed representative `.log` files would be added; it printed `add` for desktop run 01, mobile run 01, and a sweep file.
- Screenshots are not owed because this measurement renders nothing new.

---

# DRAIN GATE — s1577

**Slice:** `f1575-1-m4-06-drift-tick-budget` · **branch:** `lane/c` @ `61951fce6` · **base:** `7fd3bc8a4` · **merge:** `--no-ff` onto main

**VERDICT: MERGED.** The instrument is sound, the arrangement is provably unchanged, and verdict (A) reproduces independently on a differently-loaded shell. One red is carried and classified below; it is the ladder's own documented flake, and this slice is the first thing in nine rungs that can say *why* it happened.

## Merge classification — DISJOINT

Main moved **14** files since the base (`STATUS.md`, `tasks/BACKLOG.md`, `tasks/goals.json`, `package.json`, `.claude/skills/drain/SKILL.md`, the f1574-1 audit + its test + baseline + artifact, the f1576-1 master, three `logs/**`). The lane touched **58**, all under `artifacts/f1575-1-drift-tick-budget/**`, the two e2e specs, and this review. **Overlap: 0** — computed set-wise, not eyeballed. All 58 LANE-TOUCHED; no 3-way graft needed.

⚠️ `package.json` is among main's moved files, which is why the lane's `393 tests` node-guards figure is **not** the merged tree's figure and was not inherited as one.

## Firewall — verified by reading the diff, not by trusting the report

The existing test's body diff is **the `console.log` line and nothing else**; `companion()` still performs exactly **one** `page.evaluate` and one round trip (the F-1572-2 constraint — the instrument must not lengthen the window it measures). No `expect`, `await` or `page.evaluate` added, removed, reordered or reworded. **Neither `0.4` bound nor the `0.45` was touched** — F-1441-3 honoured. No `src/**` change.

## Evidence — measured on the MERGED tree (fire shell, `--workers=1`, projects serial)

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | rc=0 |
| `npm run build` | green, Vite **1.73 s**, asset diet `1158214 / 1500000` bytes |
| sweep spec `f1575-1-drift-tick-budget` desktop | **1 passed (6.8 s)** |
| sweep spec mobile (390 px) | **1 passed (4.1 s)** |
| `m4-06-embodiment` mobile (390 px) | **10 passed (52.6 s)**, rc=0 |
| `m4-06-embodiment` desktop | **9 passed / 1 failed (1.2 m)** — the denied-drift breach, quoted below |
| denied test x5 isolated, desktop | **5 passed (21.2 s)** |
| collection + gate-rooting guards | **33 tests / 33 pass / 0 fail** (`whole-suite-collection`, `gate-battery`, `glob-fallback-completeness`, `subject-tree`, `claimed-spec-harness-guard`) |
| `gate-caller-audit` | **PASS** — escalations 3, unrouted 0; the new spec is not a gate-shaped subject |
| boot probe | zero console errors, zero page errors, asserted **in-spec** on both projects; desktop + 390 px covered |

Screenshots correctly not owed — this slice renders nothing new.

**`test:node-guards` (the 436 s battery) deliberately NOT re-run, with reasons rather than silence:** F-1460-1's trigger is `src/sim/`, `src/systems/` or `src/entities/` and **this diff touches none of them** (e2e + artifacts + reviews only). Both halves of the merge were already battery-gated — main's at s1576 (399 tests), the lane's at 393 — and the union's only untested interaction is *collection of a new e2e spec*, which is exactly what the 33 targeted guards above cover. A live lane-b runner was also finishing during the gate window, and s1536 lost ~19 minutes to two batteries sharing `claimed-spec-harness-guard`/`fixture-teardown` fixtures.

## F-1577-2 — THE FIRST INSTRUMENTED BREACH IN NINE RUNGS

The desktop full-spec gate run breached, and **for the first time in this ladder's history the breach carries its tick count**:

    [m4-06-denied] driftAbs=0.4308236298069081 gapClosed=-0.43077812673885063 tickBefore=47 tickAfter=82 tickDelta=35 simSecondsDelta=3.5666666666666647

Per the master's item-6 honesty guard: **this was not re-run away and is not excluded.** It is the most valuable single observation on the board.

⚠️ **But it also refines verdict (A) on an axis the master did not anticipate, and the refinement matters more than the confirmation.** Five isolated repeats of the same test on the same tree, same shell, minutes apart, ran at `tickDelta` **32, 34, 34, 34, 37** — *overlapping and exceeding the breaching run's 35* — and produced `driftAbs` of only **0.021 / 0.244 / 0.311 / 0.170 / 0.052**. **Window length alone therefore does NOT predict the breach.** The breaching run's distinguishing feature is its **start phase**: `tickBefore=47`, against 33–41 for all five clean runs. ➡️ **The race has two axes — how long the window is, AND where in the Prospector's motion it opens.** Both are load-dependent; only the first was hypothesised.

✓ **The correlation the master itself stated now reproduces exactly:** the breach came from a **full-spec gate run** (nine tests of prior load), the clean samples from **isolated measurement runs** — precisely the split distinguishing the three historical new-regime breaches from ~120 quiet observations.

## F-1577-4 — the bit-identical recurrence is explained

The mobile gate run reproduced the ladder's long-puzzling bit-for-bit maximum **`driftAbs=0.3722002149381437`** — and it now carries its cause: **`tickDelta=24`**, which the runner's own 24-run distribution shows is the **modal** tick count (24 occurred 11 times of 24). The master's hypothesis — *"a modal tick count reached by a modal round-trip cost"* — is confirmed by direct measurement rather than inference.

## F-1577-3 — drift is OSCILLATORY, and the review's table shows only the rising limb

An independent desktop sweep on the merged tree, in a shell ~1.6x more contended than the runner's (final tick deltas **134–139** vs the banked 84–92):

| tickDelta | 34 | 41 | 45–58 | 62 | 69 | 82–89 | 105 | 119 |
|---|---|---|---|---|---|---|---|---|
| driftAbs | 0.277 | 0.395 | **0.459 (peak)** | 0.397 | 0.275 | 0.142 | **0.008** | 0.215 |

`driftAbs` crosses `0.4` between ticks **41 and 45**, peaks at **0.459**, **decays to 0.008 by tick 105**, then climbs again. The runner's table reports only *first crossing* and is accurate as far as it goes, but the curve is **not monotonic** — so the breach region is a **BAND (approx. 41–62 ticks), not a threshold**.

🎯 **This has a direct consequence for the recommended cure that nobody has stated:** a fix that makes the window deterministic must also choose *where* to land it. Landing it inside the band breaches every time; landing it past ~69 ticks passes with large margin. **A "make it deterministic" cure that happens to pin the window at ~45 ticks would convert a 2% flake into a 100% red.** The cure needs a named target tick count, justified against this curve.

## F-1577-1 — the firewall prescribed a control the mechanism does not grant (non-blocking)

The master's firewall forbade touching `package.json` because *"a permanent sweep in the standing suites is a cost nobody has approved"*. The runner complied exactly. **But `playwright.config.ts:46` is `testDir: './e2e'` with no `testMatch` on a non-capture run, so EVERY new `e2e/*.spec.ts` is auto-collected into the standing suites regardless.** The sweep is therefore already in every full-suite run — measured cost **~10.9 s** (6.8 s desktop + 4.1 s mobile). Not touching `package.json` never controlled that; the firewall named a lever it did not have. Same family as F-1576-1: a master prescribing an outcome the mechanism cannot deliver. Advisory — no owner word needed to *keep* it, and the spec arguably earns its 11 s as a standing instrument.

## Adjacent

The runner's banked mobile run-02 red (`Prospector floats above terrain...` at `:229`, `position.y` 1.287 vs >= 1.495) **did not reproduce** — mobile ran 10/10 green here. Correctly reported by the runner and not fixed under the firewall.

## Red disposition

The desktop denied-drift red is **fingerprint-matched to a pre-existing class, with proof of pre-existence**: F-1563-3 banked `0.41504` and `0.4453` on `98a464438`, which the master establishes is **after** the `fa2c180a5` regime change — i.e. this exact assertion at this exact `0.4` bound breached **before this slice existed**. The slice changes neither the assertion, the bound, nor the round-trip count. `logs/suite-red-inventory.md` lists this test as known-red **mobile-only under a different assertion** (`toContain`, snapshot 2026-07-28), so the inventory does **not** cover this desktop breach and was not stretched to cover it.
