# Task f1619-1: is the WARM re-request a `page.route` artifact, or does the advance stream download its assets TWICE in normal play? (lane-c, commit prefix "test:")

**FIRE-AUTHORED s1619 (attended review welcome)**

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-c`.

READ FIRST: `AGENTS.md`; `e2e/advance-stream-walkthrough.spec.ts` **in full, all 176 lines** — you are going to build a sibling of it and you must not change it; `tasks/BACKLOG.md` (**F-1616-3**, the finding this task exists to settle — quoted in the WHY below; find it by content, never by line number: `grep -n "Distinguishing them costs one probe" tasks/BACKLOG.md`); `reviews/advance-stream-walkthrough-drain.md` section **F-1616-3**; `src/assets/AdvanceStream.ts` lines **180-205** (the prefetch `fetch(...)`, its `x-gold-rush-prefetch: 1` header and its `cache: 'force-cache'`) — **read it, do NOT change it**; `.claude/skills/author-task/SKILL.md` section 3 LANE pre-flight.

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE -> `git checkout -B lane/c main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. **EVIDENCE-ARTIFACT EXCEPTION (F-1266-1): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, and any `.png` — are NEVER "work" and NEVER a STOP. Discard them and PROCEED, listing what you discarded.** Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything. Then `git -C worktrees/lane-c status --short` -> must be clean, with the FACTORY-CHURN EXCEPTION — always expected, never a STOP; list them and proceed (F-1407-1): (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*` and any `.png`. What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.

**PREMISE CHECK (do this first, and STOP if any fails):**
```
grep -c "const THROTTLE_MS = 150;" e2e/advance-stream-walkthrough.spec.ts
grep -c "currentDoor.demands.add(request.url());" e2e/advance-stream-walkthrough.spec.ts
grep -c "x-gold-rush-prefetch" src/assets/AdvanceStream.ts
grep -c "Distinguishing them costs one probe" tasks/BACKLOG.md
```
All four must return **1** (each proved `=1` on main AND `=1` inside the refreshed lane at dispatch, s1619, per F-1425-2). If any returns 0, the ground moved — **STOP and report which one, with the current text of that region.** Do NOT search for a replacement target and do not guess.

The one test in the walkthrough spec is titled **"measures warm assets across menu, town, and two contracts"**. Cite it by that title, never by a line number, when you report (F-1310-1: coordinates rot).

## Why (F-1616-3, measured at the s1616 drain of f1614-1, merge `1e2172f45`, still OPEN)

The walkthrough table's WARM column is computed from `door.demands`, which by construction holds only requests **without** the prefetch header. So a URL is counted WARM **iff it was prefetched to completion and then demand-requested again anyway.** That is visible in the numbers, not inferred from the code: town shows 2 such URLs, contract1 shows 7. Meanwhile the prefetch runs with `cache: 'force-cache'`, so the prefetch's entire value proposition **is** a populated HTTP cache — and in that harness the cache is demonstrably not being reused.

F-1616-3, verbatim from the ledger:

> **UNVERIFIED, DELIBERATELY, AND IT IS THE PART WORTH SOMEONE'S TIME:** whether the re-request is an artifact of `page.route('**/*.glb')` interception bypassing the browser cache, **or a real property of play.** **If it is real, the advance stream downloads its assets twice in normal play** — a genuine performance defect and a much larger finding than this drain. **Distinguishing them costs one probe: walk the same doors with NO `page.route` at all and count requests per URL.**
>
> **GATE: none owed to the owner; any fire may take the probe (one per fire).**

**This task is that probe, and nothing else.** It is a MEASUREMENT slice: it builds an instrument, runs it, and reports a number. It does not fix anything, and it must not.

## Scope

1. **Create ONE new spec: `e2e/advance-stream-cache-reuse.spec.ts`.** It walks the **same five doors in the same order** as the walkthrough spec — `menu`, `town`, `contract1`, `town-return`, `contract2` — using the same boot flags, the same seeded profile and the same navigation helpers. **Copy those helpers into the new file.** The duplication is DELIBERATE and ordered: do **not** refactor the walkthrough spec's helpers into a shared module, and do not import from it. The walkthrough spec is a merged contract with its own gate; a probe must not be able to break it.

2. **Install NO `page.route`. This is the entire point of the task.** The walkthrough spec's `page.route('**/*.glb', ...)` handler is the suspect: `route.continue()` re-issues the request through the interception path, which is the hypothesis for why a completed `force-cache` prefetch fails to prevent a second fetch. Your spec must never call `page.route`, `page.routeFromHAR`, or `context.route`. If you find you need throttling to keep the doors distinguishable, use **CDP `Network.emulateNetworkConditions`** instead — it slows the transport without interposing on the cache. Say in your report whether you needed it and what values you used.

3. **Instrument with CDP, because the Playwright `request` event cannot answer this question.** A resource served from the browser's memory or disk cache may or may not surface as a `request` event, and it never tells you whether bytes crossed the wire — so counting `request` events would produce a number that looks like an answer and is not one. Open a session (`const cdp = await page.context().newCDPSession(page); await cdp.send('Network.enable');`) and record, per `requestId`:
   - `Network.requestWillBeSent` -> the URL, the wall time, and whether `request.headers['x-gold-rush-prefetch'] === '1'`
   - `Network.requestServedFromCache` -> mark that requestId **CACHE**
   - `Network.responseReceived` -> `response.fromDiskCache`, `response.fromPrefetchCache`, `response.status`
   - `Network.loadingFinished` -> `encodedDataLength`, the authoritative count of bytes that crossed the wire

   Both playwright projects in the battery are chromium (`desktop-chrome`, `mobile-chrome` in `playwright.config.ts`), so CDP is available in both. `desktop-webkit` is scoped by `testMatch` to `058-device-tiers.spec.ts` only and will never run this spec — do not add a webkit guard for a project that cannot reach you.

4. **Classify every second fetch, and separate the CONFOUND from the finding — this is the part that decides whether the probe is worth anything.** Removing `page.route` also removes the 150 ms throttle, so a demand request can now legitimately start *while* the prefetch for the same URL is still in flight. That is a RACE, not a cache failure, and reporting the two together would be exactly the mistake this probe exists to correct. For each GLB URL, bucket every non-prefetch fetch as one of:
   - **DOUBLE-DOWNLOAD** — the prefetch for that URL reached `Network.loadingFinished` **strictly before** this fetch's `requestWillBeSent`, and this fetch still crossed the wire (`encodedDataLength > 0`, not `fromDiskCache`, not `fromPrefetchCache`, not `requestServedFromCache`). **This is the bucket F-1616-3 asks about.**
   - **OVERLAP** — the prefetch had not finished when this fetch started. Timing, not cache.
   - **CACHE-HIT** — served from cache. The prefetch worked.

5. **Emit `artifacts/advance-stream-cache-reuse-<project>.md`** (per-project path — the walkthrough spec races on a shared path and f1616-1 had to fix exactly that; do not repeat it). Two tables:
   - per door: DOUBLE-DOWNLOAD / OVERLAP / CACHE-HIT counts, and total wire bytes;
   - per URL, for every URL fetched more than once: the URL, the prefetch's bytes, each subsequent fetch's bytes, and its bucket.

   `artifacts/**` only. **Write no `reviews/*.md`** — a tracked `reviews/*.md` rewrite is a hard STOP in both pre-flight templates and is the defect f1616-1 was authored to remove (F-1616-2). Do not reintroduce it.

6. **Assert only what must be true whichever way the answer falls.** Assert: `expect(errors).toEqual([])` (console + page errors, same collector shape as the walkthrough spec); **at least one prefetch reached `loadingFinished`**; and **at least one non-prefetch GLB fetch was observed**. Those two are the anti-vacuity assertions — without them an instrument that observed nothing at all would report a clean sheet and read as good news, which is the F-1616-1 failure with the sign flipped.

   ⚠️ **Do NOT assert that DOUBLE-DOWNLOAD is zero, and do not assert that it is non-zero.** The answer is genuinely unknown — that is why this task exists — and an assertion either way would bake a guess into a gate. **A spec that asserts the unknown is not rigour, it is a coin flip wearing a green tick.** The regression assertion belongs to the FOLLOW-UP slice, written once the number is known and, if the defect is real, once it is fixed. Say so in a comment at the head of the file so no later reader mistakes this for a vacuous guard.

7. **Run the comparison arm and report both.** Run the **unmodified** `e2e/advance-stream-walkthrough.spec.ts` in the same shell and the same hour, and paste its WARM/COLD table beside your new table. The A/B is the deliverable: same doors, same build, `page.route` present vs absent. **State your verdict in prose** — artifact of interception, real property of play, or *undetermined and why*. **"Undetermined, with the numbers and the reason" is a fully acceptable outcome and is worth far more than a confident guess.**

8. **Change nothing that the probe measures.** `src/**` is firewalled, **especially `src/assets/AdvanceStream.ts`**. If the probe shows the stream is downloading twice, that is a FINDING for your report — a follow-up slice fixes it. A task that MEASURES the prefetch path must not alter it (the same law that governed f1614-1 and f1616-1, unchanged).

If you find yourself about to exit without changes, WRITE WHY into your report first — a silent no-op wastes a queue slot and a gate (Mistake #1).

## Firewall

Touch ONLY: `e2e/advance-stream-cache-reuse.spec.ts` (new file).

NO changes to: `src/**` — **especially `src/assets/AdvanceStream.ts`, `src/town/TownTavernPilot.ts`, `src/world/Terrain3dClaimPilot.ts`** · `e2e/advance-stream-walkthrough.spec.ts` (the comparison arm — it must be byte-identical at the end, or the A/B is worthless) · `e2e/advance-stream.spec.ts` or any other existing spec · `reviews/**` · `package.json` · `playwright.config.ts` · `scripts/**` · `tasks/**`, `STATUS.md`, `tasks/goals.json`, `tasks/BACKLOG.md` (the fire owns all ledger surfaces) · other lanes' work.

## Self-check (evidence, not vibes)

- `npx tsc --noEmit` clean; `npm run build` green.
- `npx playwright test e2e/advance-stream-cache-reuse.spec.ts --workers=1` green in **both** chromium projects. Report rc, pass counts and wall time.
- **Paste both projects' `artifacts/advance-stream-cache-reuse-*.md` tables in full** — both tables, both columns, not a summary line. The bucket counts ARE the deliverable.
- **Paste the comparison arm**: `npx playwright test e2e/advance-stream-walkthrough.spec.ts --workers=1`, both projects, with its WARM/COLD table. Report rc and pass counts (it was 2/2 both projects at s1618).
- Adjacent: `npx playwright test e2e/advance-stream.spec.ts --workers=1` green, both projects — it shares the prefetch primitives. Report pass counts (10/10 both projects at s1618).
- **Prove the walkthrough spec is untouched**: `git diff --stat -- e2e/advance-stream-walkthrough.spec.ts` must be EMPTY. Paste the (empty) output.
- `git status --short` after a single-project run (`--project=desktop-chrome`): paste it. It must show **no modified tracked `reviews/*.md`**, and nothing outside your new spec plus `artifacts/**`.
- `npm run test:node-guards` is **correctly OUT of this battery** per F-1460-1 — this diff is one new `e2e/` file and zero `src/sim`, `src/systems`, `src/entities`. State that you checked, do not run it.
- No screenshots and no perf table: this slice renders nothing new.

End: **READY-FOR-GATES** + report (a) the four pre-flight grep counts, (b) whether you needed `emulateNetworkConditions` and with what values, (c) both projects' full cache-reuse tables, (d) the comparison arm's WARM/COLD table, (e) **your prose verdict on F-1616-3 — artifact, real, or undetermined-and-why**, (f) the empty `git diff --stat` for the walkthrough spec, (g) all playwright runs' rc, pass counts and timings, (h) anything you noticed about the prefetch set or the stream — as a finding, never as an edit.
