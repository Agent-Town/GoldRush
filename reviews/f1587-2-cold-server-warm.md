# F-1587-2 cold-server warm — STOPPED: control did not reproduce

## Verdict

**STOPPED WITHOUT A DRIVER PATCH. Arm A did not reproduce the reported cold-start failure or slowdown, so the task explicitly forbids claiming or shipping a cure.**

On pinned Node `v26.4.0`, a fresh Vite server on `127.0.0.1:5231` received no HTTP request before Playwright. The first and only selected desktop-chrome test, `the day town boots with ground contact, wear and parcel dressing — and no night dressing`, passed in **5.5 s**. Playwright reported **1 passed in 6.7 s**; `/usr/bin/time` measured **7.19 s** wall for the command; rc was **0**.

This is close to s1587's quoted warm result (5.0 s), not its cold failure (41.8 s). A single non-reproduction is evidence about the defect's rate, not evidence that a document request reaches the lazily imported town chunk.

## Evidence

- `artifacts/f1587-2-cold-start/arm-a-server.log` — fresh Vite server startup on port 5231. Readiness was detected from Vite's own log; no curl/fetch probe contaminated the cold control.
- `artifacts/f1587-2-cold-start/arm-a-playwright.txt` — exact Playwright result, first-test timing, overall timing, wall time, and rc.
- Command subject: `GR_CAPTURE_EXTERNAL_SERVER=1 GR_CAPTURE_BASE_URL=http://127.0.0.1:5231 npx playwright test e2e/beauty-town.spec.ts --project=desktop-chrome --workers=1 -g 'the day town boots with ground contact'`.
- The test regenerated tracked `artifacts/era-lights/after/desktop-chrome-day.png`; it was discarded under the task's evidence-artifact exception because it is outside the allowed F-1587-2 evidence directory.

## Required work deliberately not performed

The stop condition fired before implementation. Therefore there is no Arm B, no warm-up helper, no added unit-test arms, no manufactured reds, and no post-change gate battery. The untouched pre-flight tree did pass `npm run build`; Vite completed in **1.55 s** on Node `v26.4.0`.

## Blast radius

None: `scripts/gate-battery.mjs` and `scripts/gate-battery.test.mjs` remain byte-for-byte unchanged, so Playwright and non-Playwright batteries both behave exactly as before. This is established by the empty diff for both script paths, not by a prospective test arm.

## Adjacent finding

The relevant town code is loaded by `main.ts` through a dynamic `import('./town/TownScene')` after Enter Town. A plain `GET /` cannot be assumed to compile that cold chunk. This was observed but not changed because Arm A did not reproduce and the task requires stopping at that point.
