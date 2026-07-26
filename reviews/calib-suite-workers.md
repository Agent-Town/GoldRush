# F-1101-1 Playwright worker calibration

- Slice: `lane-calibrate-suite-workers`
- Branch: `lane/perf`
- Base: current `main` after the required fresh reset
- Date: 2026-07-27
- Instrument: frozen 12-file, 43-test subset; `desktop-chrome` only
- Verdict: **VOID — no worker count pinned**

The two `workers=1` controls disagree at p95 by **17.88%** (`17.9s` → `14.7s`), above the predeclared 15% drift ceiling. Ruling 5 therefore voids the table and requires a stop rather than a pin. `playwright.config.ts`, `package.json`, and the proposed guard remain untouched.

The provisional decision-rule result is still useful evidence, but is not a valid pin: `workers=2` was the only candidate with p95 inflation ≤1.25, no test over 25s, and zero reds. `workers=4` and `workers=8` failed the fixed rule.

## Quiescence and run summary

Every recorded gate used:

```sh
sysctl -n vm.loadavg
ps -Ao command= | grep -c "[C]hrome for Testing" || true
ps -Ao pid=,etime=,time=,command= | grep "[p]laywright test" || true
```

Every accepted sample had zero Chrome processes and no live Playwright process.

| Run | Accepted pre-run samples, 60s apart | Result | Wall time | Immediate post-run loadavg |
|---|---|---:|---:|---|
| w1 | `{ 2.20 2.51 3.43 }`; `{ 3.08 2.73 3.44 }` | 42/43 | 5.5m | `{ 3.40 3.17 3.42 }` |
| w2 | `{ 3.13 3.11 3.40 }`; `{ 3.00 3.11 3.38 }` | 43/43 | 2.9m | `{ 5.20 4.83 4.10 }` |
| w4 | `{ 2.27 4.02 3.85 }`; `{ 1.53 3.45 3.64 }` | 41/43 | 1.8m | `{ 9.59 6.15 4.70 }` |
| w8 | `{ 2.07 4.43 4.21 }`; `{ 2.46 4.02 4.07 }` | 16/43 | 7.0m | `{ 39.14 46.83 26.37 }` |
| w1 repeat | `{ 3.14 25.14 21.29 }`; `{ 2.12 20.61 19.87 }` | 43/43 | 5.2m | `{ 3.30 9.67 14.90 }` |

Cooldown readings above the 1-minute threshold were not accepted as pre-run samples:

- Before w4: `{ 4.94 4.78 4.08 }`
- Before w8: `{ 8.90 6.06 4.67 }`, then `{ 4.01 5.19 4.45 }`
- Before w1 repeat: `{ 36.16 46.09 26.23 }`, `{ 13.19 37.34 24.40 }`, then `{ 5.65 30.81 22.83 }`

## Duration table

`✘` marks a red. Durations are the full list-reporter values. P95 uses the nearest-rank method over all 43 tests. Inflation uses the first w1 duration for the same test.

| Test | w1 | w2 | w4 | w8 | w1 repeat |
|---|---:|---:|---:|---:|---:|
| `054-baron-epic.spec.ts:171` wave 20 spawn | 7.5s | 7.8s | 8.2s | 27.6s | 7.4s |
| `054-baron-epic.spec.ts:212` Baron wrecks structures | 5.7s | 6.2s | 6.5s | 32.2s | 5.8s |
| `054-baron-epic.spec.ts:262` stationary contact and kite | 7.6s | 8.0s | 12.6s ✘ | 1.5m ✘ | 7.8s |
| `054-baron-epic.spec.ts:318` scaled collider | 3.8s | 4.2s | 4.9s | 38.5s ✘ | 3.9s |
| `054-baron-epic.spec.ts:337` scripted wave-20 kite | 17.9s | 20.3s | 24.0s | 3.3m | 19.1s |
| `055-baron-kill-stop.spec.ts:121` standard and note | 21.6s ✘ | 12.5s | 12.8s | 1.3m ✘ | 11.8s |
| `055-baron-kill-stop.spec.ts:156` skip hold | 4.3s | 4.2s | 4.7s | 49.7s ✘ | 4.1s |
| `055-baron-kill-stop.spec.ts:168` sim hash | 10.6s | 10.8s | 15.1s | 1.0m ✘ | 11.1s |
| `055-baron-kill-stop.spec.ts:193` same-tick overrun | 4.5s | 4.5s | 5.1s | 1.0m ✘ | 4.4s |
| `072-era-activation.spec.ts:210` fresh E1 | 2.0s | 2.3s | 3.7s | 14.7s | 2.2s |
| `072-era-activation.spec.ts:243` ready mill waits | 2.8s | 3.6s | 4.4s | 59.0s ✘ | 3.1s |
| `072-era-activation.spec.ts:254` Stamp Mill activates E2 | 10.5s | 11.8s | 13.0s | 3.0m ✘ | 11.0s |
| `072-era-activation.spec.ts:338` skip E2 ceremony | 3.9s | 4.2s | 6.3s | 1.0m ✘ | 4.0s |
| `072-era-activation.spec.ts:353` Stamp Mill raises E2 | 7.2s | 7.8s | 10.4s | 36.2s | 7.5s |
| `cp06-share.spec.ts:18` lineage round-trip | 3ms | 4ms | 7ms | 8ms | 3ms |
| `cp06-share.spec.ts:50` post export/import | 10.2s | 10.6s | 11.2s | 28.4s | 10.2s |
| `e1-dry-gulch.spec.ts:78` debug load | 8.7s | 9.1s | 9.5s | 1.0m ✘ | 8.7s |
| `e1-dry-gulch.spec.ts:108` water sources | 3.6s | 3.8s | 4.3s | 1.0m ✘ | 3.6s |
| `e1-dry-gulch.spec.ts:127` sluice placement | 7.8s | 7.1s | 8.9s | 1.0m ✘ | 7.6s |
| `e1-dry-gulch.spec.ts:161` yield multiplier | 3.7s | 3.9s | 4.3s | 1.0m ✘ | 3.7s |
| `e1-dry-gulch.spec.ts:188` spawn edges | 4.7s | 5.1s | 5.4s | 1.0m ✘ | 4.7s |
| `e1-dry-gulch.spec.ts:221` seeded diagnostics | 6.8s | 7.1s | 8.0s | 43.6s ✘ | 6.9s |
| `e3-blackout-ridge.spec.ts:33` stored breath | 10.6s | 8.1s | 11.6s | 49.0s | 7.7s |
| `e3-blackout-ridge.spec.ts:105` masks and trunk | 4.9s | 5.3s | 5.9s | 36.6s | 5.0s |
| `e5-boss-dredge-queen.spec.ts:131` storm and Act 2 | 14.7s | 17.2s | 21.8s | 1.4m | 14.7s |
| `e5-boss-dredge-queen.spec.ts:192` interrupt claw | 6.3s | 6.5s | 7.5s | 2.0m ✘ | 6.3s |
| `e5-boss-dredge-queen.spec.ts:215` defensive-claw arc | 6.3s | 6.3s | 9.1s | 2.7m ✘ | 5.9s |
| `e5-boss-dredge-queen.spec.ts:237` frame p95 | 20.1s | 20.5s | 21.7s | 23.8s | 19.9s |
| `e6-tile-consumers.spec.ts:25` decay fields | 10.7s | 10.9s | 12.5s | 1.5m ✘ | 10.6s |
| `e6-tile-consumers.spec.ts:78` six-vein ring | 8.7s | 9.0s | 9.9s | 3.0m ✘ | 8.8s |
| `e6-tile-consumers.spec.ts:123` non-E6 inert | 2.7s | 2.8s | 3.2s | 25.0s | 2.8s |
| `e7-arsenal.spec.ts:26` era gating | 8.5s | 9.0s | 11.9s ✘ | 1.0m ✘ | 8.5s |
| `e7-arsenal.spec.ts:43` four additions | 4.0s | 4.2s | 4.9s | 1.0m ✘ | 4.0s |
| `e7-signal-systems.spec.ts:34` relay graph | 6.5s | 6.8s | 7.9s | 1.0m ✘ | 6.7s |
| `e7-signal-systems.spec.ts:67` milestones inert | 3.3s | 3.4s | 3.7s | 53.0s ✘ | 3.4s |
| `e7-signal-systems.spec.ts:79` seeded progress | 6.5s | 6.6s | 7.4s | 1.0m ✘ | 6.5s |
| `e7-signal-systems.spec.ts:104` silences | 3.8s | 3.9s | 4.4s | 1.0m ✘ | 3.8s |
| `e8-boss-salvage-claw.spec.ts:102` component descent | 9.1s | 9.5s | 10.7s | 2.9m ✘ | 9.3s |
| `e8-boss-salvage-claw.spec.ts:155` completed lift | 8.9s | 9.1s | 9.3s | 24.1s | 8.8s |
| `e9-boss-old-digger.spec.ts:73` survey and unmake | 5.9s | 6.3s | 6.9s | 1.6m ✘ | 6.2s |
| `e9-boss-old-digger.spec.ts:103` board and dismount | 4.5s | 4.5s | 5.0s | 6.8s | 4.5s |
| `e9-boss-old-digger.spec.ts:123` prior-recording swap | 8.7s | 8.5s | 8.9s | 11.0s | 8.7s |
| `e9-boss-old-digger.spec.ts:123` no-recording swap | 8.4s | 8.3s | 8.4s | 8.7s | 8.6s |
| **p95 duration** | **17.9s** | **17.2s** | **21.7s** | **180.0s** | **14.7s** |
| **p95 inflation vs first w1** | reference | **1.170** | **1.658** | **20.690** | drift control |
| **max duration** | **21.6s** | **20.5s** | **24.0s** | **198.0s** | **19.9s** |
| **reds** | **1** | **0** | **2** | **27** | **0** |

## Fixed-rule evaluation

| Candidate | Inflation ≤1.25 | Max ≤25s | Zero reds | Provisional result |
|---|---:|---:|---:|---|
| w2 | yes, 1.170 | yes, 20.5s | yes | qualifies |
| w4 | no, 1.658 | yes, 24.0s | no, 2 | disqualified |
| w8 | no, 20.690 | no, 198.0s | no, 27 | disqualified |

No candidate is selected because the drift control voided the experiment before Ruling 6 could choose the largest qualifier.

## Findings

- **F-1101-1 remains open:** the measurement strongly points to `workers: 2`, but the 17.88% p95 control drift makes that conclusion inadmissible under the authored rule. Re-run the same frozen sequence on a stable box.
- The first w1 run's lone red (`055-baron-kill-stop.spec.ts:121`) passed at w2, w4, and the repeated w1. It is evidence of run-to-run instability, not grounds to edit the instrument.
- `workers=8` reproduced the saturation mechanism directly: post-run 1-minute load reached 39.14, 27/43 tests reddened, and p95 duration reached 180s.
- This calibration covers `desktop-chrome` only by ruling. It does not directly measure the mobile project.

## Fire-side drain addendum (s1107, 2026-07-27)

Landed as a **report-only, pure-add drain**: 5 raw logs + this file, `9614b7eb` → main. No `src/`, no `e2e/`, no `scripts/`, no config — so no gate battery was run, and none was owed. Every other path in `git diff main lane/perf` is a stale-base phantom (main moved after the lane's base `91d511e6`); classified against the merge-base, the branch is **pure-add, 6 files, 1354 insertions, zero deletions**. The report's quiescence figures were verified against the raw run log: **every loadavg triple in its tables appears verbatim** in `tasks/runs/20260727-053703-lane-d-*.log`.

### F-1107-1 — the drift that voided this experiment is ONE FLAKY TEST, not an unstable box

The report's remedy ("re-run the same frozen sequence on a stable box") does not follow from its own data, and a re-run that only changes boxes will be voided again at similar odds.

Re-deriving p95 from the published duration table (the parse reproduces the report's own `17.9s` / `14.7s` exactly, so it is validated against its author's figures):

| Check | Value |
|---|---|
| p95 nearest-rank at n=43 | rank 41 ⇒ **the 3rd-largest duration** |
| top-3, w1 | 17.9s, 20.1s, **21.6s ✘** |
| top-3, w1 repeat | 14.7s, 19.1s, 19.9s |
| tests agreeing within ±0.5s across the two controls | **40 / 43** |
| largest mover | `055-baron-kill-stop.spec.ts:121` — **−9.8s**, and w1's **lone red** |
| second-largest mover | `e3-blackout-ridge.spec.ts:33`, −2.9s |

**40 of 43 tests reproduce within half a second.** A genuinely unstable box moves the whole distribution; this one moved a single test. That test is `055:121`, which was **red in w1 at 21.6s — w1's single largest duration — and green at 11.8s in the repeat**. Because p95 here reads the 3rd-largest value, greening the top value is sufficient on its own to walk p95 from 17.9s to 14.7s. That is the entire 17.88% "drift".

Two consequences the re-run must carry:

1. **The instrument's own selection rule was satisfied by too thin an input.** The 12 files were frozen as "fully green" from **one** banked w4 log, precisely so "failures can't confound the duration signal" — and a failure confounded the duration signal exactly as feared. One run cannot establish greenness of a flaky test. This is the standing law from s1104(D) applied to instrument selection rather than to fingerprinting: *"a fingerprint control run ONCE is a coin toss; 'fingerprint-matched with proof' has to mean REPEATED."*
2. **The drift metric is hypersensitive by construction.** At n=43, p95 nearest-rank reads the 3rd-largest sample, so any single red dominates it. A trimmed statistic, or a drift rule computed over green tests only, would not have voided a table whose 40 quiet tests agree to within ±0.5s.

Recommended for the re-run: drop `055:121` from the frozen subset (or re-derive the subset from repeated runs), and compute the drift control over green tests only. The provisional `workers=2` result is *not* thereby promoted — it still needs a valid control — but it is no longer contradicted by anything measured here.

**Note the trailing-load red herring:** the repeat's accepted samples were `{ 3.14 25.14 21.29 }` / `{ 2.12 20.61 19.87 }` against the first w1's `{ 2.20 2.51 3.43 }` — the 5-minute load differed by roughly **8×**, because the quiescence gate only ever tested the 1-minute figure, which recovers in ~2 minutes while the 5/15-minute averages stay elevated far longer after the w8 saturation. That looks like the obvious culprit and **is not**: despite that 8× gap, 40 of 43 tests still landed within ±0.5s. Worth tightening the gate anyway, but it did not cause this void.

### F-1107-2 — `055-baron-kill-stop.spec.ts:121` is a flake, and it is NOT the rf-37 class

Read at source: it uses `expect.poll` throughout and never holds-then-releases a key before polling for an arrival, so the `rf-37` (`lane-approach-steer-to-arrival`) cure **does not apply to it** and it must not be added to that master's 9-site list. Its reds are load-*in*dependent on the evidence here — it failed under **w1**, the quietest condition in the whole sequence, and passed at w2, w4 and the w1 repeat. Mechanism undiagnosed; the likely suspects are its fixed 8s/5s poll budgets around the ceremony transition. Owed as its own investigation.

## Raw evidence

- `logs/suite-runs/calib-w1.log`
- `logs/suite-runs/calib-w2.log`
- `logs/suite-runs/calib-w4.log`
- `logs/suite-runs/calib-w8.log`
- `logs/suite-runs/calib-w1-repeat.log`
