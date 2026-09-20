# Task f1621-1: three instruments, one 25 MB ceiling — attribute the 9.5 MB gap and rename so it cannot recur (LANE-A, commit prefix "test:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-a.
READ FIRST: AGENTS.md; `e2e/asset-diet.spec.ts` (the whole file — BOTH network instruments live in it); `scripts/deploy.sh` (the release gate, lines ~50-90 — read how `BUDGET_LIMIT` is compared and, critically, WHICH line it greps); `src/assets/AssetLoading.ts` (`syncAssetLoadingCue` — the `townAlreadyWarm` rule that explains why the two instruments cannot see the same window); `reviews/f1619-2-asset-diet-town-budget-ab.md`; `tasks/BACKLOG.md` line 4 (finding **F-1620-7**, which this task closes).

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/a main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. **EVIDENCE-ARTIFACT EXCEPTION (F-1266-1, s1266): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, and any `.png` screenshot — are NEVER "work" and NEVER a STOP, whether they sit as uncommitted dirt or as the entire content of an ahead commit. Screenshots are never byte-identity gated, so their bytes differ from main forever. Discard them (`git checkout -- <paths>` / reset) and PROCEED, listing what you discarded.** Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything. **THEN A CLEANLINESS LINE: `git -C worktrees/lane-a status --short` → must be clean, with the FACTORY-CHURN EXCEPTION — always expected, never a STOP; list them and proceed (F-1407-1): (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*` and any `.png`. What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.**

CURRENCY CHECK: this task edits the A/B test that landed in `56c2dcfec`. Verify the lane has it before starting: `git merge-base --is-ancestor 56c2dcfec HEAD` must succeed, AND `grep -c "town byte budget reports normal and saveData arms by URL" e2e/asset-diet.spec.ts` must print `1`. If either fails, STOP and report "lane stale — f1619-2 absent"; do NOT improvise the predecessor.

## Why (F-1620-7, filed s1620 2026-08-10 at the f1619-2 drain; every fact below RE-VERIFIED by reading the code at authoring time, s1621)

`tasks/BACKLOG.md` line 4 states the gate this task closes, verbatim: **"Closes when the two `townResponseBytes` sites either measure the same thing or are renamed so they cannot be confused, AND f1615-1's figures are restated against a named instrument."** No owner word is owed — the row records `GATE: none owed to the owner`.

**Three instruments answer one 25 MB question, and they disagree by 9.5 MB on mobile:**
- **12,932,580** — `e2e/asset-diet.spec.ts`, test **"honest town and claim cues appear while GLBs are throttled and leave at ready"**, which asserts `expect(townResponseBytes).toBeLessThan(25_000_000);`
- **15,218,288** — `scripts/deploy.sh`, the `checking first-town asset budget…` step, `BUDGET_LIMIT=25000000`. Measured on the build published as `719c697ca`.
- **22,469,519** — `e2e/asset-diet.spec.ts`, test **"town byte budget reports normal and saveData arms by URL"**, which asserts `expect(normalBytes).toBeLessThan(25_000_000);`

**The release gate is the second-most optimistic of the three, and it cannot ever see the tightest one.** ✓ VERIFIED by reading `scripts/deploy.sh`: the budget step runs `--grep "honest town and claim cues"` and parses **only** the `[asset-diet] <project> townResponses: <n> bytes` line, which is `console.info`'d by that test alone. The A/B test emits no such line, so **no deploy can ever be gated on the 22.5 MB figure.** If the A/B arm is the honest measure, releases pass reporting ~9.8 MB of headroom while holding ~2.5 MB.

**A real mechanism explains the gap, and it is NOT yet measured — that is this task's job.** ✓ VERIFIED by reading the code, stated as a HYPOTHESIS the runner must test, never assume:
- The throttled-cues test asserts `await expect(cue).toBeVisible()` after entering town. Per `src/assets/AssetLoading.ts` `syncAssetLoadingCue`, the cue is suppressed when `townAlreadyWarm` (label is `the town` AND `assetPrefetchTownState === 'ready'`). **So that test structurally requires entering town BEFORE the prefetch has finished**, and it stops counting at `assetLoadingState === 'ready'` — a partial-load window by construction.
- The A/B test instead waits for `data-asset-prefetch-town-state` to be `ready` **before** clicking enter-town, so it counts the full advance-stream prefetch, and it sets `Network.setCacheDisabled: true` over CDP.
- These are **two independent differences** (prefetch-wait, cache-disabled) plus a third (the deploy figure runs under `playwright.preview.config.ts`, the others under the dev config). Nobody has attributed the 9.5 MB across them.

**A latent under-count that would make the tightest number an UNDER-estimate.** ✓ VERIFIED: both instruments total `Number(response.headers()['content-length'] ?? 0)`. A response with no `content-length` header (chunked or compressed transfer) silently contributes **0**. Neither instrument counts how often that happens, so neither can tell a real total from a partial one. If this is non-zero, the 2.5 MB headroom is optimistic too.

## Scope

1. **Audit the silent zero.** In BOTH network instruments, count responses whose `content-length` header is absent or unparseable, separately from the byte total. Report per instrument: the count, and the list of such URLs (deduped, with occurrence counts). Write it into the artifact for each project. **This is a measurement, not a fix — do NOT change how bytes are totalled and do NOT start estimating body sizes.** If the count is `0` in both, say so explicitly in the report and in your final message: that is a clean refutation and it is a valuable result, not a boring one.

2. **Attribute the gap by measurement, not by story.** In the A/B test's `measureTown` helper, parameterise the two suspected causes so they can be varied independently: (a) whether the prefetch-wait (`data-asset-prefetch-town-state` → `ready`) happens before entering town, and (b) whether `Network.setCacheDisabled` is sent. Measure the `normal` arm in **all four combinations** and write a decomposition table to the artifact with one row per cell: `prefetchWait`, `cacheDisabled`, `townResponseBytes`, and the delta from the cell that matches the throttled-cues test's configuration (`prefetchWait=false, cacheDisabled=false`). **Keep the existing `normal` and `saveData` arms and their existing assertions exactly as they are** — the four cells are ADDITIONAL reporting; the arms that carry assertions must not change configuration.
   - ⚠️ **A null is a result and must be reported as one.** If the four cells land within ~2% of each other, then neither suspected cause explains the 9.5 MB, the hypothesis in "Why" is **REFUTED**, and you must say so in those words and state what is left unexplained. Do NOT reach for a third variable to make the story close, and do NOT adjust any number to fit.
   - The throttled-cues test also *throttles GLBs by 600 ms*, which the A/B test does too — so that is held constant and is not one of the cells.

3. **Rename so the confusion cannot recur** (this is the literal BACKLOG gate). Replace the four bare `25_000_000` literals in `e2e/asset-diet.spec.ts` with a single named, exported-at-module-scope constant whose name says what the ceiling IS (e.g. `TOWN_TRANSFER_CEILING_BYTES`), and give each of the two tests a distinctly-named local for its own measured quantity, so that two different quantities are never both called `townResponseBytes`. The throttled-cues test's `console.info` line **must keep its exact current text shape** — `[asset-diet] ${project} townResponses: ${n} bytes` — because `scripts/deploy.sh` greps it with `sed -nE 's/.*\[asset-diet\] ([^ ]+) townResponses: ([0-9]+) bytes.*/\1 \2/p'`. Breaking that string silently un-gates every deploy. Verify with a grep after your edit that the literal text `townResponses: ` still appears in the emitted string.

4. **Write the reconciliation comment at the top of the file**, naming all THREE instruments, what window each measures, the measured numbers from your run, which one the release gate reads, and the attribution result from scope 2. This is the artifact a future reader needs in order to not re-litigate F-1620-7. Keep it factual and short — a dozen lines, not an essay.

5. **Restate f1615-1's figures against a named instrument** in your final report (not in code): state which of the three instruments f1615-1's `desktop 21,389,200 → 16,209,181` / `mobile 15,181,572 → 17,074,995` were taken with, or state that it cannot be determined from the record. "Cannot be determined" is an acceptable and useful answer; guessing is not.

**Do NOT change the ceiling value, do NOT add or remove any `expect(...)`, do NOT re-pin any number to make anything pass.** If a measurement comes out over 25,000,000, that is a genuine finding — report it loudly and leave the assertion red rather than adjusting it.

If you find yourself about to exit without changes, WRITE WHY into your report first — a silent no-op wastes a queue slot and a gate.

## Firewall

Touch ONLY: `e2e/asset-diet.spec.ts`, and generated evidence under `artifacts/asset-diet/**`.

NO changes to: `scripts/deploy.sh` (the release gate is the SUBJECT of this measurement — changing it destroys the evidence; if you conclude it should read a different instrument, that is a FINDING for your report, not an edit) · any file under `src/**` (sim and loading semantics are not in scope; the asset set must not move while it is being measured) · `playwright.config.ts`, `playwright.preview.config.ts` · `package.json` (no new scripts — this test is already reached by `npm run test:asset-diet`) · any other `e2e/*.spec.ts` · `tasks/**`, `specs/**`, `reviews/**`, `STATUS.md`, `tasks/BACKLOG.md`.

## Self-check (evidence, not vibes)

- `npx tsc --noEmit` clean · `npm run build` green.
- `npm run test:asset-diet` green **both projects** (desktop + mobile), `--workers=1`. This is the suite that owns the edited file; name its pass/fail counts and wall time in your report.
- Adjacent suite, unmodified-green both projects: `npx playwright test e2e/advance-stream-cache-reuse.spec.ts --workers=1` (it is the other live consumer of the town asset path). If it is red, fingerprint the failure against main BEFORE claiming this task caused it.
- `npm run test:node-guards` is **NOT** required — this task touches no `src/sim/`, `src/systems/` or `src/entities/` path (F-1460-1).
- Zero console/page errors in both tests (the file already calls `expectNoConsoleErrors`; do not weaken it).
- Artifacts written and non-empty: `artifacts/asset-diet/town-budget-desktop-chrome.md`, `artifacts/asset-diet/town-budget-mobile-safari.md` (exact project names as your run reports them), each carrying the existing arms table PLUS the new four-cell decomposition table PLUS the missing-`content-length` audit.
- `git diff --numstat` reported in your message, so the drain can see edit size at a glance.

End: READY-FOR-GATES + report (1) the four-cell decomposition with the attribution verdict — or the word **REFUTED** and what is left unexplained; (2) the missing-`content-length` counts per instrument per project; (3) confirmation that the `townResponses: ` grep string survived, quoted from your edited line; (4) your scope-5 answer on f1615-1's instrument; (5) any measurement that came out over the ceiling.
