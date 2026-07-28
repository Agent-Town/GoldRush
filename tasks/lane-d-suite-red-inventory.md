# Task lane-d-suite-red-inventory: build the factory's first SUITE RED INVENTORY (lane-d, commit prefix "test:")

**FIRE-AUTHORED (attended review welcome)** — s1159, 2026-07-28.

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-d` (branch `lane/perf`).

READ FIRST:
- `AGENTS.md`
- `reviews/f1158-3-grant-gold-diagnostics-staleness.md` (this fire's cure — the trigger for this task)
- `tasks/BACKLOG.md` line 1513 (**F-1141-3**) — the precedent that names the pattern you are measuring

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/perf main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.

*(Author's note, verified 2026-07-28 09:1xZ: `lane/perf` tip `892116c1` is 1 ahead of main and FALSE-AHEAD — its only code file differs from main in zero content. It should classify as a SAFE DUPE. Verify this yourself; do not take it from me.)*

## Why (F-1158-3 / F-1158-2, s1158–s1159, dated 2026-07-27..28)

**The factory has no inventory of its own red tests, and has now been bitten twice by that gap.**

1. `e2e/e2-stamp-mill.spec.ts:202` asserted a story beat string that `e3019343` re-authored **nine hours after** the test was written. The test sat red for **20 days**. Nobody knew.
2. Repairing it did **not** turn the spec green — it advanced it to a **deeper, previously unreachable** failure on mobile-chrome only (`:145`). That deeper failure was a real harness defect (`grantGold` never republished diagnostics), cured in `eda6504f` this fire.
3. This is a **named, repeating pattern**, not a one-off. `tasks/BACKLOG.md:1513` (F-1141-3) records the identical shape in different code: *"This was invisible until this fire because `:192`/`:196` always died earlier on the ghost-settle harness artifact — the stale test was hiding a real bug behind it, which is the standing pattern whenever a stale assertion is repaired."*

A test that fails **early** hides every assertion after it. So **each currently-failing test is an unknown amount of unexercised territory**, and the factory currently discovers these one accident at a time. There are **333 spec files** and the known reds live scattered in review-file prose (`world-info-notes :193/:286/:318`, `m2-04 :226`, `vp-02 :566`, `char.claim_jumper :731`, …) with **no single machine-readable list anywhere in the repo** (verified: no red-inventory artifact in `logs/`, `docs/`, or `tasks/`).

**This task does not fix anything. It measures.** The deliverable is the list.

## Scope

1. **Start a dev server on a SCRATCH PORT.** Port `5188` is the shared lane port and is hard-coded in `vite.config.ts:38`; a full-suite run on it can kill or be killed by another lane (Mistake #12). Use **5271**:
   `npm run dev -- --port 5271` in the background, wait until it answers.
2. **Run the whole suite on BOTH projects against that server**, using the config's external-server path (`playwright.config.ts:17` makes `webServer` undefined when `GR_CAPTURE_EXTERNAL_SERVER=1`):
   ```
   GR_CAPTURE_EXTERNAL_SERVER=1 GR_CAPTURE_BASE_URL=http://127.0.0.1:5271 \
   PLAYWRIGHT_JSON_OUTPUT_NAME=logs/suite-red-inventory-raw.json \
   npx playwright test --reporter=json --workers=2
   ```
   Expect this to take a long time (hours) and to exit non-zero — **a non-zero exit is the expected outcome, not a failure of the task.** Do not add `--retries`. Do not stop at the first red.
3. **Reduce the raw JSON with a script you write — do NOT read the raw JSON into your context** (it will be tens of MB). Add `scripts/suite-red-inventory.mjs` that reads the raw JSON and emits a compact markdown table to `logs/suite-red-inventory.md`, one row per FAILING test: spec file · test title · **project** · the failing `file:line` · the first line of the error message · duration.
4. **Classify every failing test into exactly one bucket** in that table's `bucket` column, by comparing the two projects' results for the same test title:
   - `BOTH` — fails on desktop-chrome AND mobile-chrome
   - `MOBILE-ONLY` — fails on mobile-chrome, passes on desktop-chrome
   - `DESKTOP-ONLY` — fails on desktop-chrome, passes on mobile-chrome
5. **Rank the `BOTH` bucket by masking risk** in a second table, `logs/suite-red-inventory.md#masking-candidates`: for each `BOTH` failure, report the failing line number and **the total line count of that test's body**, so the reader can see how much of the test never runs. A test failing at line 3 of 90 is a bigger unknown than one failing at line 88 of 90. State the ratio explicitly.
6. **Write the headline numbers** at the top of `logs/suite-red-inventory.md`: total tests run, total passed, total failed, and the size of each of the three buckets. These four numbers are the point of the task.

## Firewall

Touch ONLY: `scripts/suite-red-inventory.mjs` (new), `logs/suite-red-inventory.md` (new), `logs/suite-red-inventory-raw.json` (new).

NO changes to: **any file under `e2e/`** — the specs are the INSTRUMENT here, not the subject; **any file under `src/`**; any existing test assertion, timeout, or `expect` constant; no `test.skip`/`test.fixme`/`test.retry` anywhere; no widening of `m2-04:226` (owner-gated, F-1156-2); no "drive-by fix" of any red you find, however obvious it looks. **Finding a red and fixing it in this task is a firewall violation.** Report it instead — the repairs get scoped from your inventory, one at a time, with their own controls.

## Self-check (evidence, not vibes)

- `npx tsc --noEmit` green and `npm run build` green (you changed no TS, so these must be untouched-green — if either is red, STOP and report, because that means the lane base is broken).
- `logs/suite-red-inventory.md` exists, has the six headline numbers, and every failing test in the raw JSON appears in it exactly once per project. **Prove the reduction is complete**: report the failure count you read out of the raw JSON and the row count you wrote, and state that they match.
- **Positive control for the reducer** (mandatory — a probe that executes nothing reports zero): before trusting a `0`, hand your script a raw JSON you have deliberately edited to contain one synthetic failing test, and show it appears in the output. Say so in your report, then re-run clean.
- `git diff --stat` shows ONLY the three allowed paths.
- End: **READY-FOR-GATES** + report: the six headline numbers · the full `MOBILE-ONLY` list (this is the bucket s1158 asked for by name) · the top 5 masking candidates with their failing-line/total-line ratios · the positive-control result · any spec that CRASHED or timed out rather than asserting, listed separately, since those are a different failure class.

## No-op guard

If you find yourself about to exit without changes, WRITE WHY into your report first — a silent no-op wastes a queue slot and a gate. In particular: if the suite run dies partway (server death, disk, OOM), **still emit the inventory for the tests that DID run** and say plainly how far it got and which spec it died on. A partial inventory that names its own cutoff is valuable; a missing one is not.
