# F-SOL-SIM-001 final gate attempt — BLOCKED — 2026-07-10

Branch: `sol/fixed-step-unification`

Implementation tip before evidence tail: `1b575fd`

Compared main: `e374f47`

Status: **NOT READY-FOR-GATES.** The exact isolated MP resync gate is red 0/2. `MP-BLOCKER-EVIDENCE.md` records the hard evidence and the ruling needed.

## Product and focused gates

| Gate | Command | Result |
|---|---|---|
| TypeScript | `npx tsc --noEmit` | OBSERVED PASS at current tip; output not retained |
| Production build | `npm run build` | OBSERVED PASS at current tip; output not retained; Vite large-chunk warning remains |
| Fixed-step contract | `npx playwright test e2e/sim-fixed-step.spec.ts --project=desktop-chrome --workers=1` | OBSERVED PASS, 6/6; 30/60/144 fps each produced 300 ticks, Economy hash `fnv1a32:0f6f2150`, seven Economy rows, zero dropped time; current-tip output not retained |
| Determinism | `npx playwright test e2e/perf-04-determinism.spec.ts --project=desktop-chrome --workers=1` | OBSERVED PASS, 2/2; both 600-second runs produced 18,000 tick samples and `fnv1a32:598dff4d`; current-tip output not retained |
| Authorized legacy fixtures | nine-file desktop run, one worker | OBSERVED PASS, 42 passed / 1 project-skip; no assertion or Balance retuning; output not retained |
| Night Shift | isolated relight case, `--repeat-each=2` | OBSERVED PASS, 2/2 at 7.0 seconds each; output not retained |
| Full desktop regression | `npx playwright test --project=desktop-chrome --workers=1 --reporter=line` | OBSERVED: 496 passed / 31 failed / 4 skipped / 6 did not run, 537 enumerated, 56.2 minutes; final reporter output was not retained, so this is not checksummed proof |
| Five new aggregate reds | same five cases isolated on main and branch | OBSERVED PASS, 5/5 on main and 5/5 on branch; raw output not retained |

The checksummed focused logs and `full-desktop.log` predate commit `23cd01d`; they are the original park-time artifacts. Current-tip reruns are recorded above only as observations because their reporter output was not retained. They are not presented as checksummed proof.

## Performance comparison

The same WebKit wave-20 FULL/LITE probe ran three times against fresh servers on current main and this branch. The pre-existing LITE `<=25 ms` assertion stayed red on both sides; the fixed-step spec compares FULL medians. These final raw captures were not retained, so the comparison below is an observation rather than checksummed gate evidence.

- Main FULL p95: `29, 29, 29 ms`; median `29 ms`.
- Branch FULL p95: `29, 27, 27 ms`; median `27 ms`.
- Branch/main ratio: `0.931`; change `-6.9%`.
- Allowed branch median: `30.45 ms` (`29 * 1.05`).
- Observed result: branch was below the 5% ceiling and all six captures had zero console/page errors. No final gate claim is made from the unretained output.

## Multiplayer isolation evidence

- 500-tick byte-identical identity: observed PASS, 1/1; current-tip output not retained.
- MP-03 two real local-camera heroes and shared credit: observed PASS, 1/1; current-tip output not retained.
- MP-04 town join: observed isolated failure twice with a stable three-tick observation skew (`342/339`), while the full serial file passed MP-04; output not retained. This matches the known F-drain-1 order/observation flake.
- Desync restore: **FAIL, 0/2 in exact isolation.** Both repeats time out waiting for Bob to report a resync. A diagnostic run reached Alice tick 714 with 22 desyncs/22 resyncs while Bob reached tick 713 with 0/0; every post-injection hash remained unequal. The checked-in task-067 green artifact also contains unequal peer hashes at ticks 90 and 120. See `MP-BLOCKER-EVIDENCE.md`.

No MP protocol or snapshot-schema code was changed on this branch.

## Feel A/B

- Two sequential, clean Chromium contexts; 1280x800 at DPR 1; same seed, stationary target set, and absolute-time 30-second input choreography.
- Trimmed videos are exactly 30.00 seconds / 750 frames each.
- Main and branch both reported zero page/console errors.
- Final hero separation after the choreography: `0.1502` world units.
- Matched-frame normalized MAE range: `1.36%` to `4.35%`.
- Gold Rush has no dash input. The 23.0–25.5 second hard-reversal sequence is the honest acceleration/response proxy; no dash claim is made.
- Owner sheet: `artifacts/sol/fixed-step-feel/contact-sheet.png`.
- Side-by-side video: `artifacts/sol/fixed-step-feel/side-by-side-30s.webm`.
- Blind review: **ACCEPT**. The largest sampled camera phase offset was roughly 25–30 px at 10 seconds and reconverged by 14 seconds; no projectile pop, freeze-frame stair-step, or material acceleration/reversal difference was visible. At the 29-second sample the HUD timer straddles a display boundary (`00:34` main / `00:35` fixed-step), while final simulated time differs by only 0.059 seconds. See `artifacts/sol/fixed-step-feel/REVIEW.md`.

## Review evidence

The independent fixture review found three issues before commit: a 5:1 determinism-timeline downsample, inflated repeated fractional polling windows, and generated artifact rewrites. All three were corrected. The implementation keeps 18,000 perf samples through a cheap per-tick callback, preserves the original 4/8/11/20/36-second fixture windows, and restores all unrelated generated artifacts.

The final evidence review then rejected the READY claim because the isolated MP gate was red and the later full/p95 outputs were not retained. This file has been corrected accordingly; no READY tail is written.

`codex review --uncommitted` was attempted as required but the installed CLI rejected the configured `gpt-5.6-sol` model as requiring a newer CLI. No review claim is made from that failed invocation; the read-only subagent review above is the successful second opinion.
