# Task f1614-1: the advance-stream walkthrough table — measure what was already warm at each door (lane-b, commit prefix "test:")

**FIRE-AUTHORED s1614 (attended review welcome)**

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-b`.

READ FIRST: `AGENTS.md`; `e2e/advance-stream.spec.ts` **in full** — it already contains every observation primitive this task needs and you must reuse them rather than invent new ones; `e2e/story-loop.spec.ts` lines **55–90** and **165–195** (the proven menu→town→contract→town transition recipe); `src/assets/AdvanceStream.ts` (what the stream decides to warm); `src/town/TownTavernPilot.ts` (`townPrefetchUrls`); `reviews/advance-stream.md` around the sentence quoted in the WHY below; `tasks/BACKLOG.md` row `F-1532-2` (the finding this discharges) and the row `OWNER RULINGS ROUNDUP #2` (the ruling that unblocked it).

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/b main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. **EVIDENCE-ARTIFACT EXCEPTION (F-1266-1): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, and any `.png` — are NEVER "work" and NEVER a STOP. Discard them and PROCEED, listing what you discarded.** Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything. Then `git -C worktrees/lane-b status --short` → must be clean, with the FACTORY-CHURN EXCEPTION — always expected, never a STOP; list them and proceed (F-1407-1): (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*` and any `.png`. What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.

**PREMISE CHECK (do this first, and STOP if any fails):**
```
grep -c "the walkthrough table was not produced" reviews/advance-stream.md
grep -c "a throttled-network walkthrough table" tasks/lane-advance-stream.md
grep -c "await page.getByTestId('start-menu-enter-town').click();" e2e/advance-stream.spec.ts
```
All three must return **1** (verified `=1` on main and in this lane at dispatch, s1614). If any returns 0, the ground moved — **STOP and report which one, with the current text of that region.** Do NOT search for a replacement target and do not guess.

## Why (F-1532-2, unblocked by owner ruling 2026-08-09; evidence re-verified at dispatch s1614)

The advance-stream master ended with a deliverable that was never produced. `tasks/lane-advance-stream.md:16`, verbatim:

> `END: READY-FOR-GATES + a throttled-network walkthrough table (menu→town→contract1→town→contract2: what was already warm at each door).`

`reviews/advance-stream.md:114` records the gap in as many words — **"the walkthrough table was not produced"** — and the ledger files it **OWED (small, non-blocking)** with the note that **Robin asked for it by name.**

It has sat owed for ~13 days because it was **coupled to an owner fork, not because it was hard.** F-1532-2 called it *"a trap right now"*: the table documents *what is warm at each door*, which is precisely the set `townPrefetchUrls()` returns, and F-1167-1 branch **(b)** ("pilot GLBs should not be prefetched") would have changed that set and invalidated the table as written.

⚖️ **THE FORK IS ANSWERED.** `tasks/BACKLOG.md` row `OWNER RULINGS ROUNDUP #2 (2026-08-09 late)` records the owner's choice verbatim-by-label: **prefetch "Prefetch wins" (F-1167-1 ruled; F-1532-2 unblocks behind it)**. That is branch **(a)**, under which F-1532-2's own gate says the table **"is written as-is and is a ~1-lane evidence slice."** So the prefetch set is stable and you are measuring it, not deciding it.

⚠️ **This task produces EVIDENCE. It must not change what the game warms.** If your measurement suggests the stream is warming the wrong things, that is a FINDING to report, never an edit to make here.

## The harness already exists — reuse it, do not invent it

Every primitive was verified present on main at dispatch (s1614) by reading `e2e/advance-stream.spec.ts`:

| what you need | how it is already done | where |
|---|---|---|
| "was this warm-ahead or cold-demand?" | request header `x-gold-rush-prefetch === '1'` marks a **prefetch**; its absence marks a **cold demand-load** | `:36–38`, and `:109–111` uses exactly this to tell a real run request from a prefetch |
| throttling | `page.route('**/*.glb', …)` with a delay / barrier before `route.continue()` | `:86–89` and `:113–122` |
| which door the stream thinks it is at | `#game-canvas` attributes `data-asset-prefetch-scene`, `-state`, `-total`, `-progress` | `:45–47` |
| menu→town | `getByTestId('start-menu-enter-town').click()` then wait `window.__GR_TOWN_DIAGNOSTICS__.frame > 10` | `:127–128` |
| town→board→contract | the `openBoard` helper (hold `KeyA`/`KeyW` → `town-open-board` → `contract-board`), then `contract-launch-the-claim` | `:152–158`, `:130` |
| run is up | `window.__THREE_GAME_DIAGNOSTICS__.frame > 10` | `:137` |
| contract→town | drive the run under `timescale=24` to `claim-secured`, then `bank-secured-claim` ("Return to Town"); on death `stake-again` also returns and lands on `contract-board` | `e2e/story-loop.spec.ts:168–179` ("secured contract returns to town, fires the secured beat, and leaves the board open"), boot flags at `:211` |

**The return leg is the only one this task has not seen executed under throttling.** Choose the cheapest proven path and **report which you used**; see the honest-partial clause in scope 4.

## Scope

1. **Add `e2e/advance-stream-walkthrough.spec.ts`** — one spec, one test, that walks the five doors **menu → town → contract1 → town → contract2** with `.glb` traffic throttled (reuse the `page.route` delay pattern; a fixed per-request delay is fine — you are shaping the race, not benchmarking the network). Give it an explicit generous `test.setTimeout` — this is a long walk and the default will not hold it.

2. **At each door, classify every asset request the door involved** into **WARM** (a request for that URL carrying `x-gold-rush-prefetch: 1` completed *before* the door opened) versus **COLD** (first request for that URL happened at or after the door opened, without the prefetch header). Key on the **URL**, and count each URL once per door. This is the whole measurement — the header is the discriminator and it is already load-bearing in the existing spec, so do not introduce a second mechanism.

3. **Write the table to `artifacts/advance-stream-walkthrough.md`** — one row per door with: door name, warm count, cold count, and the first few cold URLs (they are the interesting column: a cold asset at a door is the stream having lost the race). Include the boot flags and the throttle delay you used in a header line, so the numbers are reproducible. **Also commit the same table as `reviews/advance-stream-walkthrough.md`** — that copy is the owner-facing artifact Robin asked for by name, and it is the actual deliverable of this task.

4. **Assert the MECHANISM, not a magic number.** The spec must assert something real that would break if the advance stream stopped working — at minimum: **the town door shows at least one WARM asset**, and **zero console/page errors across the whole walk** (reuse `collectErrors`). ⚠️ **Do NOT assert exact warm/cold counts** — they depend on timing and machine load and will flake (F-1101-1 / F-1270-1 are this factory's two standing lessons about load-sensitive assertions). **HONEST-PARTIAL, PRE-AUTHORIZED:** if the second contract leg cannot be reached reliably within a sane timeout, **deliver the four-door table (menu → town → contract1 → town), assert what you did reach, and REPORT the gap plainly as a finding.** A truthful four-door table is a success; a fabricated fifth row is a failure. Do not loop retrying to force the fifth door.

5. **Do not wire this spec into any additional npm gate.** Playwright collects `e2e/**` automatically; that is sufficient. Adding a new npm script would red `gate-caller-audit` under an innocent-looking name unless rooted, and this slice does not need a gate of its own.

If you find yourself about to exit without changes, WRITE WHY into your report first — a silent no-op wastes a queue slot and a gate.

## Firewall

Touch ONLY: `e2e/advance-stream-walkthrough.spec.ts` (new) · `artifacts/advance-stream-walkthrough.md` (new) · `reviews/advance-stream-walkthrough.md` (new).

NO changes to: `src/**` — **especially `src/assets/AdvanceStream.ts`, `src/town/TownTavernPilot.ts` and `src/world/Terrain3dClaimPilot.ts`: this task MEASURES the prefetch set and must not alter it** · `e2e/advance-stream.spec.ts` or any other existing spec (read them, reuse their patterns by copying into your new file; do not refactor shared helpers out of them) · `package.json` · `playwright.config.ts` · `scripts/**` · `tasks/**`, `reviews/*.md` other than your new file, `STATUS.md`, `tasks/goals.json`, `tasks/BACKLOG.md` (the fire owns all ledger surfaces) · other lanes' work.

## Self-check (evidence, not vibes)

- `npx tsc --noEmit` clean; `npm run build` green.
- `npx playwright test e2e/advance-stream-walkthrough.spec.ts --workers=1` green in **both** projects (desktop and 390px mobile). Report the run time — this is a long spec and the next fire needs to know its cost.
- `npx playwright test e2e/advance-stream.spec.ts --workers=1` green — the adjacent suite you are most likely to have disturbed, since you reuse its primitives. Report pass counts.
- **Prove the discriminator actually discriminates rather than the table merely printing.** Re-run once with prefetch disabled (`/?tier=lite` sets `data-asset-prefetch-enabled=false` — see `e2e/advance-stream.spec.ts:79–82` in the test "lite rendering skips unused 3D prefetch") and confirm the WARM column collapses toward zero. **Report both readings.** A table whose warm column is identical with the stream off is measuring nothing.
- Paste the final table into your report.
- No screenshots and no perf table required: this slice renders nothing new. Zero console/page errors is asserted in-spec per scope 4.

End: **READY-FOR-GATES** + report (a) the three pre-flight grep counts, (b) the throttle delay and boot flags used, (c) the full table, (d) whether you reached the fifth door and by which return path, (e) the prefetch-disabled control's warm column, (f) both playwright runs' rc and pass counts with timings.
