# Review: tasks/015 30-wave soak harness — REVIEWED, NOT MERGED (deferred to Mac evidence run)

Status: **code-reviewed clean, UNGATED — intentionally left uncommitted.** `e2e/soak-30.spec.ts` stays in the working tree for tasks/018.

- Scope exactly as tasked: ONE new spec file, ZERO src changes (bot policy is injected in-page and reads `?soak=` itself; per-wave JSON report to test-results/soak/; desktop-only, self-skips mobile).
- Asserts per task: pool caps, renderer envelope (warm-cycle style), zero GL/console errors, draw calls ≤200, fps floor ≥12, every 5 waves to 30.
- **Why not gated in-sandbox**: `test.setTimeout(180_000)` at timescale 24 — a single test that cannot fit the 45s bash wall in any split; Playwright state dies with the call (s12 law). No partial run = no evidence = no merge (protocol: never merge unreviewed OR unexecuted gates).
- **Route**: tasks/018 (Mac evidence run) executes it as part of the full regression and commits the soak report; the fire that reads that evidence commits this file citing it. Do NOT commit earlier — an unexecuted 3-minute test would silently join every future full sweep.
- Fires: do not re-gate this path; disposition recorded in gate-progress.json.
