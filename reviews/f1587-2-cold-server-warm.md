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

---

## DRAIN VERDICT — s1589, 2026-08-09

**MERGED as evidence. The STOP was correct and the report is accurate.** This slice ships no driver patch and no cure; what it lands is a measured negative result, which is exactly what its master asked for — report a negative result as the result, rather than ship a plausible patch.

**F-1587-2 stays OPEN.** A non-reproduction is not a refutation, and the runner says so itself: one cold run at 5.5 s bounds the defect's RATE, not its existence.

### Verified, not inherited

| Claim in the report | How I checked it | Result |
|---|---|---|
| Blast radius none; `gate-battery` untouched | `git diff main...lane/b -- scripts/` | **empty** |
| No product code moved | same, for `src/` and `e2e/` | **both empty** |
| The whole slice is evidence | `git diff --name-only main...lane/b` | **3 files** — 2 artifacts + this review |
| 5.5 s test / 6.7 s suite / 7.19 s wall | read `arm-a-playwright.txt` directly | **all three match** |
| The server was genuinely cold | read `arm-a-server.log` | ready in 115 ms, no probe before Playwright |

No gate battery is owed and none is claimed: the diff contains zero executable bytes, so tsc, build and every suite are provably unaffected. That is the same evidence standard applied to a diff that cannot change behaviour — not a shortcut around it.

### F-1589-4 — a better hypothesis, sitting in the runner's own server log. NEW, OPEN.

Line 1 of `arm-a-server.log` reads **"[vite] (client) Re-optimizing dependencies because lockfile has changed"**. Dependency re-optimization is a well-known source of multi-second first-request stalls, and it is triggered by a **lockfile change**, not by server temperature. That fits every observation better than cold-vs-warm does:

- it explains why s1587 saw **41.8 s** once and could never get it back;
- it explains why Arm A, run after the optimize had already happened, saw **5.5 s**;
- it predicts the defect is **episodic** — reachable only in the window after an install moves the lockfile — which is exactly why a straight cold/warm A/B cannot reproduce it on demand.

This matters for the retry rule (§7.5: a third attempt needs a CHANGED premise). The next attempt should not re-run the same cold/warm A/B. It should test the re-optimization hypothesis directly — force a dep re-optimize (move the lockfile mtime, or clear `node_modules/.vite`), then time the first test — and only then decide whether a warm-up request is the right cure at all. A `GET /` would not fix this class in any case, which converges with the runner's own adjacent finding: the town scene is a lazily imported chunk that a document request never compiles.

**Recommendation:** keep F-1587-2 open and **re-aim rather than re-run**. No corrective queued this fire — the re-aimed master needs an authoring slot, and one authored master per fire is the limit.
