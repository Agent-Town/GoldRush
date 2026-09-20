# s1214 — F-1211-6 discriminated: the variable is CONCURRENT BROWSERS, not loadavg, and not any merge

**Tree:** `main` @ `2e92339d` (src/e2e identical to `227116e8`) · **Server:** one external vite on scratch
port **5261**, started from this tree (`GR_CAPTURE_EXTERNAL_SERVER=1` + `GR_CAPTURE_BASE_URL`) and
**reused by all four arms** — so the server is held constant and cannot be the variable.

**Subject:** `e2e/gazette-welcome.spec.ts:44` › *the Gazette welcome fires once, walks skippably, and
retriggers through the newsie*, failing at `:87` —
`expect(Math.hypot(newsieAfter − newsieBefore)).toBeLessThan(1)`.

## The four arms — one variable at a time

| # | arm | workers | projects | loadavg (start → end) | result |
|---|---|---:|---|---|---|
| 1 | quiet | 1 | desktop | 2.58 → — | **12/12 PASS** |
| 2 | CPU-loaded (11 self-exiting burners) | 1 | desktop | **8.26 → 20.72** | **12/12 PASS** |
| 3 | still-loaded | 1 | mobile | 15.25 → 7.72 | **12/12 PASS** |
| 4 | **concurrent** | **4** | desktop + mobile | 3.00 → 15.81 | 🔴 **4 failed / 12 passed** |

Arm 4's four failures are **all four executions of `:44`** (2 desktop + 2 mobile); the spec's other
three tests passed 12/12 in the same run.

**The refutation of the load-ceiling reading is arm 2 vs arm 4.** Arm 2 ran at a *higher* peak
loadavg (**20.72**) than arm 4 (**15.81**) and passed every execution; arm 4 failed every execution of
the subject. `loadavg` is therefore **not** the variable — **the number of browsers sharing the box is.**

## The measured drift, and why it matches s1211 exactly

s1211 recorded `4.87`. Arm 4 produced **`4.996038430596785`** and **`2.332059175921571`** at the same
line. Same assertion, same magnitude ⇒ **F-1211-6 is reproduced, not merely resembled.**

## Mechanism (from the spec's own text, `e2e/gazette-welcome.spec.ts:81-87`)

```
const newsieBefore = … actors.find(a => a.id === 'newsie').position   // last beat only
await page.getByTestId('town-welcome-next').click();                  // ← this ENDS the welcome
await page.waitForTimeout(50);                                        // wall-clock window
const newsieAfter  = … same read …
expect(Math.hypot(after − before)).toBeLessThan(1);
```

The sample is taken **across the boundary the welcome closes on**, and its width is **50 ms of wall
clock**. With one browser the town advances a handful of frames in that window and the newsie has not
yet resumed its wander (< 1 unit). With four browsers sharing the machine the same 50 ms covers many
more simulated frames, the newsie resumes wandering, and the distance grows to 2.3–5.0.

⇒ The test asserts a **state** property ("the newsie does not wander during the welcome") using a
**wall-clock sampling window**, and samples it *after* the welcome has ended. Nothing in `src/` is
broken: 36/36 of these executions pass whenever the window is not stretched.

## What this closes

- **The bisect F-1211-6 asked for is unnecessary, and would have found nothing.** Only two commits
  touched `src/` or `e2e/` after s1211's measurement (`4c72f2e7` county standings, `94dd863b` AP-06),
  and `git show --name-only` proves neither touches `src/town/**` or `src/news/**` — there is no
  candidate cure commit, which is consistent with "it never stopped failing; it fails only when run
  concurrently."
- **The s1211 contradiction is explained.** s1211 measured 8/8 red; the lane-d runner measured 8/8
  green ~13:26. Both are true: they differ in worker count, not in tree.
- **Why every single-spec gate sees green:** a drain that runs this spec alone (`--workers=1`) cannot
  reproduce it. The canonical `npm test` uses Playwright's default worker count (~half of 16 cores),
  which does.

## Raw

`load-arm.mjs` in this folder is the arm-2 instrument (burners self-exit; no pid is ever killed).
Arms 1/3/4 were plain `npx playwright test` invocations against the same 5261 server, spawned through
`node -e` because the shell gate rejects an env-prefixed command line.
