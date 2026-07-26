# Task lane-078-focus-and-ledger-reverts: THREE FIXES OF 2026-07-10 WERE REVERTED BY TWO LANDINGS OF 2026-07-11 (LANE-C, commit prefix "fix:")
**FIRE-AUTHORED (attended review welcome) — s1102, 2026-07-27. This is F-1101-2, and s1101 asked for it explicitly: "NO blind fix — the assertion is precise enough that a guess repairs the test, not the behaviour." So no guessing was done. s1102 root-caused all three reds by READING GIT HISTORY, without running a single test (a whole-suite baseline was live on the machine and any run would have contaminated it). Every culprit below is quoted from a diff that was actually read. Your job is to restore three known-good hunks, not to invent repairs.**

You are Codex (worktrees/lane-c).

CODEX: model=gpt-5.6-sol effort=high

> ⚠️ The `CODEX:` line above is at **column 0 on its own line** deliberately (F-1088-4). `scripts/lane-runner-v3.sh:65-66` greps `^CODEX:`, so an inline copy is silently ignored and the run falls back to `effort=medium`.

## WHY (the evidence chain, dated)

`e2e/078-ux-hygiene.spec.ts` holds **4** tests. **3 of them fail on main today.** They failed in s1101's whole-suite run at `--workers=8` and again in the `--workers=4` rerun — the same three, at both worker counts, so they are **not** the CPU-contention false-reds that F-1101-1 describes. `:111` failed in **1.5 s** in both runs: a fast red hiding among slow fake ones.

| test | verdict in `logs/suite-runs/20260727-0405-whole-suite-w4.log` |
|---|---|
| `:84` legacy board-unlock seen keys | ✓ 1.4s |
| `:111` ledger discovery write-back preserves unknown ids | ✘ 1.5s |
| `:130` ledger Escape … restores schoolhouse focus | ✘ 40.2s |
| `:151` contract board focuses Launch on open | ✘ 43.5s |

**s1101 guessed "same family ⇒ likely one cause, not three". That guess was wrong, and the truth is more useful:** it is **three reverted fixes across TWO commits**, both landed **2026-07-11**, each silently undoing work done **2026-07-10**. `e2e/078-ux-hygiene.spec.ts` has exactly **one** commit in its whole life (`cd76c7f0`, 2026-07-10) and has never been touched since — the spec froze on the 10th while the product moved on the 11th. Nobody saw it because the suite was collecting **0 tests for nine days** (F-1094-1 / rf-33).

**THE THREE REVERTS — verified by reading each diff:**

| # | test | culprit commit (2026-07-11) | what it undid | fix landed |
|---|---|---|---|---|
| 1 | `:151` | `93632a94` *"audio: MU-02 wave 1 — full-length title…"* | collapsed a two-query `??` into ONE grouped selector in `TownScene.openBoard()` | `cd76c7f0` 2026-07-10 *"fix: focus board launch on open"* |
| 2 | `:130` | `9b567437` *"feat: en-03 epoch pages"* | deleted `currentRestoreFocus`, the focus restore on close, the `Tab` branch, and `trapLedgerFocus()` from `reader.ts` | `acf1c476` 2026-07-10 *"fix: trap claim ledger modal focus"* |
| 3 | `:111` | `9b567437` **(same commit)** | reverted `discoverLedgerEntry` from the unfiltered `readStoredDiscoveryValues` back to the filtering `readStoredDiscovered` | `e1f243f4` 2026-07-10 *"fix: preserve unknown ledger discovery ids"* |

Note #2 and #3 are **one commit doing two reverts in two files** — `9b567437` touched `reader.ts` (−34 lines) and `state.ts` in the same landing. An audio commit and an encyclopedia feature commit each carried a stale base and quietly took accessibility and data-integrity work down with them.

## PRE-FLIGHT — verify by CONTENT, never by counting, and run the premise checks AFTER the reset

⚠️ **`git log main..lane/e2-arsenal` WILL PRINT ONE COMMIT (`828508b3 test: guard glob fallback completeness`), AND THAT IS EXPECTED — IT IS *NOT* A REASON TO STOP.**
s1102 verified the reset is **loss-free by content, not by counting**: `git diff main lane/e2-arsenal -- package.json scripts/glob-fallback-completeness.test.mjs` is **EMPTY**, i.e. that commit's content is already in main ⇒ classic false-ahead (an ahead-count is not a drain signal, F-1066-1 / F-1073-1).

1. `git log --oneline main..lane/e2-arsenal` prints **exactly `828508b3` and nothing else.** A **second** commit would be undrained work — **only then STOP and report.**
2. Start from fresh main: `git checkout -B lane/e2-arsenal main`. `828508b3` is safe to leave behind.
3. **NOW, and only now, run the premise checks** — a stale lane answers for its own tree, not for main, and a pre-flight that checks premises *before* the reset has STOPped a run wrongly before (F-1090-2):
   - `grep -n "data-contract-launch\]:not(:disabled), \[data-contract-close" src/town/TownScene.ts` → **must print exactly one hit (line ~1421).** Absent ⇒ someone already fixed #1; STOP and report.
   - `grep -c "currentRestoreFocus\|trapLedgerFocus" src/encyclopedia/reader.ts` → **must print 0.** Non-zero ⇒ #2 already restored; STOP and report.
   - `grep -n "readStoredDiscoveryValues" src/encyclopedia/state.ts` → **must print nothing.** Present ⇒ #3 already restored; STOP and report.
   - `npx playwright test e2e/078-ux-hygiene.spec.ts --project=desktop-chrome --workers=1` → **must be 1 passed, 3 failed.** Anything else and the baseline moved: STOP and report the actual counts.

⚠️ **RUN EVERY PLAYWRIGHT COMMAND IN THIS TASK WITH `--workers=1`.** `playwright.config.ts` pins no `workers`, so the default is cores/2 = **8 full WebGL Chromes on 16 cores**, which drove loadavg 34 and manufactured ~26% false reds (**F-1101-1**, open, its own master pending). Two of your three targets (`:130`, `:151`) were reported as 40 s/43 s *timeouts* under that contention even though they are genuine assertion failures. **At `--workers=1` they must fail as assertions, not time out** — if you see a 30 s timeout instead of a fast assertion failure, say so, because that changes the diagnosis.

## READ FIRST (in your worktree, after the reset, before writing anything)

- `e2e/078-ux-hygiene.spec.ts` — the whole file (159 lines). Note `seedProfile` (`:18-43`) seeds the **profile-scoped** ledger key at `:39` while test `:111` reads the **raw unscoped** key at `:124`. **That asymmetry is CORRECT and is not your bug:** `src/encyclopedia/` never uses `profileDataKey` (verified: `git grep -n profileDataKey -- src/encyclopedia/` returns nothing), so production really does use the raw `gr.claimLedger.discovered.v1`. The seed line is harmless noise. **Do not "fix" it.**
- `git show cd76c7f0 -- src/town/TownScene.ts` — 3 lines. The entire product change of the commit that created this spec.
- `git show 93632a94 -- src/town/TownScene.ts` — find the hunk that reverted it.
- `git show acf1c476 -- src/encyclopedia/reader.ts` — **the exact block you must reinstate for #2.**
- `git show e1f243f4 -- src/encyclopedia/state.ts` — **the exact shape you must reinstate for #3.**
- `src/encyclopedia/reader.ts:30-64` (open/close) and `:330-338` (`onLedgerKeyDown`).
- `src/encyclopedia/state.ts:36-55` (`discoverLedgerEntry`) and `:116-127` (`readStoredDiscovered`).

## THE RULINGS (decided by reading the diffs — do not revisit)

**RULING 1 — restore the ORIGINAL hunks. Do not write new focus logic.**
All three fixes existed, were reviewed, and were green. Reinstating them is a repair with a known-good reference. Inventing a fresh approach is how a guess repairs the test instead of the behaviour.

**RULING 2 — for #1, restore the two-query `??` form, and understand WHY the one-liner is wrong.**
`querySelector('[data-contract-launch]:not(:disabled), [data-contract-close]')` returns the first match **in document order across the whole group** — it does *not* prefer the first branch. `data-contract-close` lives in the board **header** (`TownScene.ts` ~`:1785`), before every contract card (`data-contract-launch` ~`:1886`), so the close button always wins. The `??` form asks the two questions **in priority order**, which is the actual intent ("focus Launch, else fall back to Back").

**RULING 3 — for #2, KEEP the unconditional `event.stopPropagation()` at `reader.ts:334`. This is the trap in this task.**
`acf1c476` put `stopPropagation()` *inside* the Escape branch. The current code has it as the **first statement**, unconditional, with a deliberate three-line comment about multiplayer (the sim keeps running, so leaked keys would move the hero or turn Escape into a shared pause). That comment post-dates `acf1c476` and is **correct**. A literal `git revert`-style restore would re-delete it and regress multiplayer input. **Insert the `Tab` branch AFTER line 334's `stopPropagation()`**, so Tab is both trapped in the modal and withheld from the global InputController. Result:
```
event.stopPropagation();          // keep, unconditional, keep the comment
if (event.key === 'Tab') { trapLedgerFocus(event); return; }   // re-added
if (event.key !== 'Escape') return;
event.preventDefault();
closeClaimLedger();
```

**RULING 4 — for #2, capture the restore target AFTER `closeClaimLedger(false)`, exactly as the original did.**
`openClaimLedger` now begins `backfillReachedWorldOutsideEntries(); closeClaimLedger(false);` (`:31-32`). The capture goes **after** that call — capturing before it can latch an element the close is about to remove. Restore on close must stay guarded by `notify && restoreFocus?.isConnected`, so the silent `closeClaimLedger(false)` re-open path does not move focus.

**RULING 5 — for #3, reinstate the two-function split; do not simply drop the filter.**
`e1f243f4` split one reader into two on purpose: `readStoredDiscoveryValues()` returns **all** stored strings unfiltered (used by the **write** path, so unknown ids survive a round-trip), while `readStoredDiscovered()` keeps filtering to valid ids (used by the **read** path, so unknown ids never reach the UI). Deleting the filter outright would leak `future-ledger-id` into `readLedgerDiscovered()` and into the ledger UI. Both functions must exist, and `discoverLedgerEntry` must call the **unfiltered** one — including the `new Set<string>([...])` widening for `known`, since the values are no longer narrowed to `LedgerDiscoveryId`.

**RULING 6 — the `aria-modal` / `inert` question is OWNER-GATED. Do not touch it.**
The ledger declares `role="dialog" aria-modal="true"` yet the town UI behind it stays tabbable; the herald (`TownScene.ts:945`) and E10 finale (`:1630`) paths instead set `this.ui.inert = true`. Switching the ledger to `inert` is arguably cleaner than a JS focus trap — **and it is a product decision with a multiplayer interaction, not a repair.** Restore the trap as it was. **REPORT the `inert` alternative as a finding**; do not implement it.

## SCOPE (numbered; each item is testable)

1. **`src/town/TownScene.ts:1421`** — restore `cd76c7f0`'s two-query `??` form per RULING 2. One line becomes two.
2. **`src/encyclopedia/reader.ts`** — reinstate `acf1c476` per RULINGS 3 + 4: module-level `currentRestoreFocus` (near `:24-28`), capture in `openClaimLedger` after `closeClaimLedger(false)`, restore in `closeClaimLedger` after `root.remove()` guarded by `notify && restoreFocus?.isConnected`, the `Tab` branch in `onLedgerKeyDown` **after** the existing `stopPropagation()`, and the `trapLedgerFocus()` helper.
3. **`src/encyclopedia/state.ts`** — reinstate `e1f243f4` per RULING 5: add `readStoredDiscoveryValues()` (unfiltered, deduped), keep `readStoredDiscovered()` as the filtered wrapper, and point `discoverLedgerEntry` at the unfiltered one with the `Set<string>` widening.
4. **MANDATORY MUTATION CONTROL — aim it at each defect's own branch, and run the guard BEFORE you edit it.** You already have the "before" from the pre-flight (1 passed / 3 failed). After all three fixes, `078` must be **4/4 green**. Then, one at a time, **re-apply each original defect** and show the matching test go **RED**, then restore byte-exact:
   - (a) collapse `TownScene.ts:1421` back to the grouped selector → **only `:151` reds**.
   - (b) remove the `Tab` branch from `onLedgerKeyDown` → **`:130` reds**.
   - (c) point `discoverLedgerEntry` back at `readStoredDiscovered` → **only `:111` reds**.
   Paste all three outputs. A mutation that reddens a *different* test than named, or reddens nothing, is a **finding** — report it, do not adjust the test. Confirm `git diff` is clean of mutations at the end.

## FIREWALL

**TOUCH-ONLY:** `src/town/TownScene.ts` (the one `openBoard` focus line) · `src/encyclopedia/reader.ts` · `src/encyclopedia/state.ts`.
**NO — do not edit, for any reason:** `e2e/078-ux-hygiene.spec.ts` or **anything under `e2e/`** (F-1093-3 / F-1095-2: editing `e2e/` to reach green is a forbidden green on this board — these three tests are the oracle, and they are correct) · `playwright.config.ts` (**the `workers` pin is F-1101-1's own slice — do NOT drive-by it here**, it changes the gate for every drain on the board) · `src/encyclopedia/registry.ts` / `worldOutside.ts` · `src/main.ts` · any other `TownScene.ts` region (the herald/finale `inert` paths are RULING 6, owner-gated) · `tasks/goals.json` / `STATUS.md` / `tasks/BACKLOG.md` / anything under `reviews/` (fire-owned bookkeeping) · **any other failing test you notice** — the suite has ~69 other reds and most are F-1101-1 contention artefacts; they are not yours. Report, never fix.

## SELF-CHECK (run these exact commands; paste real output)

1. `npx tsc --noEmit` → **0**.
2. `npm run build` → **0**.
3. `npx playwright test e2e/078-ux-hygiene.spec.ts --project=desktop-chrome --workers=1` → **4 passed, 0 failed.** Paste per-test durations; `:130` and `:151` should now be *fast*, not 40 s.
4. `npx playwright test e2e/078-ux-hygiene.spec.ts --project=mobile-chrome --workers=1` → paste the result. 078 is not project-restricted in `playwright.config.ts`, so it runs at 390px too. If mobile was **already** failing before your change, say so explicitly and quote your pre-flight — a pre-existing mobile red is a finding, not your regression.
5. **Adjacent suites, `--workers=1`, both projects** — these exercise the three files you touched: `npx playwright test e2e/en-01-ledger.spec.ts e2e/en-02-ledger.spec.ts e2e/en-03-epoch-pages.spec.ts --workers=1` and the town board suite (`grep -rln "contract-launch\|town-open-board" e2e/ | head`, then run what that names). Any red must be **fingerprint-matched to a pre-existing red with proof** (run it on stock main in a detached worktree), never waved through.
6. `npm run test:node-guards` → node phase count unchanged vs main. ⚠️ **The overall command exits rc 1 on a green tree** because of **F-1088-1** (`scripts/test-ticker-stats.mjs` throws `StatsEndpointReadError`), a separate step after the node phase. **Judge this gate by the phase counts, not the exit code — that trap has now misled seven drains.**
7. `npx playwright test --list` → must still print a **non-zero** total (`Total: 2378 tests in 330 files` on main today) and exit **0**. Zero is the failure signature (F-1094-1).
8. The three mutation-control outputs from scope 4, and `git show --stat HEAD` → **exactly three files**.

**Screenshots owed** (this slice changes what the player sees focused): `reviews/shots-078-focus/` — contract board open with the **Launch** button carrying the focus ring, and the schoolhouse with focus back on **Open Ledger** after Escape. Desktop **and** 390px mobile.

**READY-FOR-GATES** — report: the pre-flight 1/3 baseline, the final 4/4, the three mutation-control outputs, the adjacent-suite results with any fingerprint-matched pre-existing reds, whether mobile-chrome was already red before you started, and the RULING 6 `inert` finding.
