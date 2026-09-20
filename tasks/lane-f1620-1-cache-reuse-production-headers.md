# Task f1620-1: does the advance stream double-download against PRODUCTION headers, or only against Vite's `no-cache`? (lane-c, commit prefix "test:")

**FIRE-AUTHORED s1620 (attended review welcome)**

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-c`.

READ FIRST: `AGENTS.md`; `e2e/advance-stream-cache-reuse.spec.ts` **in full, all 235 lines** — you are going to extend this file, not replace it; `reviews/f1619-1-advance-stream-cache-reuse.md` sections **F-1620-1** and **F-1620-2** (the two findings this task exists to settle — find the file by name, it was written s1620); `playwright.preview.config.ts` **in full** (it is short — this is the config that serves a BUILT bundle instead of the dev server, and it is the whole mechanism of this task); `package.json` scripts `test:asset-diet` and `test:advance-stream*` if present (`grep -n "advance-stream" package.json`); `.claude/skills/author-task/SKILL.md` section 3 LANE pre-flight.

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE -> `git checkout -B lane/c main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. **EVIDENCE-ARTIFACT EXCEPTION (F-1266-1): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, and any `.png` — are NEVER "work" and NEVER a STOP.** Discard them and PROCEED, listing what you discarded. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything. Then `git -C worktrees/lane-c status --short` -> must be clean, with the FACTORY-CHURN EXCEPTION — always expected, never a STOP; list them and proceed (F-1407-1): (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*` and any `.png`. What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.

**PREMISE CHECK (do this first, and STOP if any fails):**
```
grep -c "fetch.status = response.status;" e2e/advance-stream-cache-reuse.spec.ts
grep -c "return completedPrefetch && (fetch.encodedDataLength ?? 0) > 0" e2e/advance-stream-cache-reuse.spec.ts
grep -c "captures HTTP status and never reads it" reviews/f1619-1-advance-stream-cache-reuse.md
grep -c "is FORCED BY THE DEV SERVER" reviews/f1619-1-advance-stream-cache-reuse.md
grep -c "advance-stream-cache-reuse" package.json
```
The **first four must return `1`** — the first two are the defect F-1620-1 names and the exact line you will change; the next two prove you can see the two findings this task exists to settle. Each was proved `=1` against **the path named on its own line** on main, and again inside the refreshed lane at dispatch (F-1425-2 — a key copied from the file you *meant* is not a key proved against the file you *named*).

⚠️ **The FIFTH is EXPECTED TO RETURN `0`, and that is not a failure** — it is a positive fact you need: this spec has **no dedicated npm script** and is reached only by the default playwright run, which is why scope item 6 forbids you from adding one. **Report all five counts.** If any of the first four returns `0`, the ground moved — **STOP and report** with the current text of the region. Do NOT search for a replacement target and do not guess.

Cite the existing test by its title — **"measures advance-stream cache reuse without route interception"** — never by a line number (F-1310-1: coordinates rot, and your own edit will rot them).

## Why (F-1620-1 and F-1620-2, both measured at the s1620 drain of f1619-1, merge `3ef4c1dcc`)

f1619-1 answered half of F-1616-3: the WARM re-request is **not** a `page.route` artifact — it reproduces with zero interception, identically, across four runs. **But the drain found the probe had inherited a second confound it could not see**, and that is what you are here to remove.

From `reviews/f1619-1-advance-stream-cache-reuse.md`, F-1620-2, verbatim:

> `playwright.config.ts:69` runs the harness against `npm run dev` — the **Vite dev server**. Probing it directly: `cache-control: no-cache`, weak ETag, conditional replay `304`. Under `Cache-Control: no-cache` the browser **must revalidate before reusing any entry**, so a CACHE-HIT — a fetch served entirely from cache with no network trip — is **impossible by construction** in this harness. The `0` in that column is the server's doing, not the prefetch's failure.

And F-1620-1:

> `fetch.status = response.status` is set at `:68`, and `status` appears nowhere else in the file — `classify()` never reads it. A **304 Not Modified** has none of the cache flags set and an `encodedDataLength` of ~127 bytes, so **every revalidation lands in DOUBLE-DOWNLOAD.** Splitting by transfer size: desktop **11 revalidation-sized + 18 genuine full re-transfers (~46.0 MB)**.

⭐ **The stake: if the double-download survives against production-style headers, the deployed game re-downloads tens of MB in a five-door walk, and a cure slice against `src/assets/AdvanceStream.ts` becomes clearly worth funding. If it does NOT survive, the whole thing was a dev-server artifact and the ladder should stop here.** Both answers are valuable and **you must not prefer either.**

## Scope

1. **Fix `classify()` to read HTTP status — the smallest change that removes a known-wrong label.** A response with `status === 304` is **definitionally a cache reuse**: the body was served from cache and only headers crossed the wire. Add a `REVALIDATED` bucket for it, distinct from both CACHE-HIT (no network trip at all) and DOUBLE-DOWNLOAD (the body crossed the wire). **Four buckets, not three.** Do not collapse REVALIDATED into CACHE-HIT — they cost different amounts and a future regression assertion will want them apart.

2. **Add a SECOND test to the same file that runs against a BUILT bundle with production-style headers.** This is the point of the task. `playwright.preview.config.ts` already exists and already serves a built bundle — read it and reuse it exactly as `test:asset-diet` does; **do not invent a server.** If the preview server's headers are still `no-cache`, say so plainly in your report and set the response headers yourself at the CDP layer or via a static server flag — **whatever you do, the report must state the EXACT `cache-control` value the run actually observed**, obtained by reading it off a real response, not from documentation. ⚠️ **A run whose headers you did not measure answers nothing**, because measuring the headers is the entire difference between this task and f1619-1.

3. **Report the SAME five-door table for both arms, side by side** — dev-server arm and production-headers arm, four buckets each, per project. Emit `artifacts/advance-stream-cache-reuse-headers-<project>.md`. The A/B is the deliverable.

4. **Assert only what must be true whichever way the answer falls.** Assert `expect(errors).toEqual([])`, at least one prefetch reached `loadingFinished`, and at least one non-prefetch GLB fetch was observed — the same anti-vacuity pair f1619-1 used. ⚠️ **Do NOT assert that DOUBLE-DOWNLOAD is zero under production headers, and do not assert that it is non-zero.** The answer is genuinely unknown; that is why this task exists. **A spec that asserts the unknown is a coin flip wearing a green tick.** Put that in a comment at the head of the new test so no later reader mistakes it for a vacuous guard.

5. **Re-state f1619-1's headline number with the corrected buckets.** With REVALIDATED split out, the dev-server arm should show roughly **18 DOUBLE-DOWNLOAD + 11 REVALIDATED** on desktop (14 + 15 mobile) where it previously showed 29. **If your numbers differ materially from that, say so — do not quietly adopt mine.** They came from a size-split of the committed artifact, not from a status field, and yours will be the first measured directly.

6. **Gate topology: keep it unchanged (the s1301 lesson).** Both tests live in `e2e/advance-stream-cache-reuse.spec.ts`, which the default playwright run already reaches. **Do not add an npm script**; if the preview arm needs a different config, drive it from within the test rather than by rooting a new gate. If you believe a new script is genuinely unavoidable, **STOP and report** rather than adding one — a new un-rooted gate reds `gate-caller-audit` and that is the drain's problem to pre-empt, not yours to discover.

7. **Change nothing that the probe measures.** `src/**` is firewalled, **especially `src/assets/AdvanceStream.ts`**. If the answer is that the stream really does download twice in production, that is a FINDING for your report — a cure slice fixes it. **A task that measures the prefetch path must not alter it** (the law that governed f1614-1, f1616-1 and f1619-1, unchanged).

If you find yourself about to exit without changes, WRITE WHY into your report first — a silent no-op wastes a queue slot and a gate (Mistake #1).

## Firewall

Touch ONLY: `e2e/advance-stream-cache-reuse.spec.ts`.

NO changes to: `src/**` — **especially `src/assets/AdvanceStream.ts`** · `e2e/advance-stream-walkthrough.spec.ts` · `e2e/advance-stream.spec.ts` · `e2e/asset-diet.spec.ts` · `package.json` · `playwright.config.ts` · `playwright.preview.config.ts` (**read it, reuse it, do not edit it**) · `scripts/**` · `reviews/**` · `tasks/**`, `STATUS.md`, `tasks/goals.json`, `tasks/BACKLOG.md` (the fire owns all ledger surfaces) · other lanes' work.

## Self-check (evidence, not vibes)

- `npx tsc --noEmit` clean; `npm run build` green.
- `npx playwright test e2e/advance-stream-cache-reuse.spec.ts --workers=1` green in **both** chromium projects. Report rc, pass counts and wall time. **`--workers=1` is a correctness requirement of the fire shell, not an optimisation (F-1270-1) — but you are a LANE, so if you also run at default workers, report both and say which is which.**
- Adjacent: `npx playwright test e2e/advance-stream.spec.ts e2e/advance-stream-walkthrough.spec.ts --workers=1` green, both projects — they share the prefetch primitives. Report pass counts (10/10 and 2/2 at s1620).
- **Paste both arms' full four-bucket tables, both projects.** The bucket counts ARE the deliverable, not a summary line.
- **Paste the exact `cache-control` header value you observed in each arm**, and say how you read it.
- `git diff --numstat` — report it; only `e2e/advance-stream-cache-reuse.spec.ts` plus `artifacts/**` may appear.
- `npm run test:node-guards` is **correctly OUT of this battery** per F-1460-1 — this diff is one `e2e/` file and zero `src/sim`, `src/systems`, `src/entities`. State that you checked; do not run it.
- No screenshots and no perf table: this slice renders nothing new.

End: **READY-FOR-GATES** + report (a) the four premise-check counts, (b) the exact `cache-control` observed per arm and how you read it, (c) both arms' full four-bucket tables per project, (d) **your prose verdict: does the double-download survive production-style headers, or was it a dev-server artifact — or undetermined, and why**, (e) the re-stated dev-arm split of DOUBLE-DOWNLOAD vs REVALIDATED against the ~18/11 desktop expectation, (f) all playwright runs' rc, pass counts and timings, (g) anything you noticed about the prefetch firing 2–3× per URL (F-1620-4) — as a finding, never as an edit.

**"Undetermined, with the numbers and the reason" is a fully acceptable outcome and is worth far more than a confident guess.**
