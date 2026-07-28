# Task lane-b-cp04-launch-clear-observability: the charter document is destroyed by a SILENT clear one call before the seam that misses it — make that boundary say so, and change nothing else (lane-b, commit prefix "fix:")

**FIRE-AUTHORED (attended review welcome)** — s1186, 2026-07-29. Successor to the lawful STOP `factory-cp04-charter-name-composition` (leaf status `stopped`, run report `tasks/runs/20260728-194217-lane-b-cp04-charter-name-composition.md`, classification `c-outer-gate-not-entered`). That task's own STOP report ends by naming this slice as its prerequisite — quoted verbatim in **Why** below. Filed as **F-1186-2**. The predecessor leaf is NOT revived; this is a new leaf.

CODEX: model=gpt-5.6-sol effort=high

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-b`.

READ FIRST (paths, not memory):
- `AGENTS.md`
- `src/meta/ContractUnlock.ts:75-80` — **the whole of `reverifyStagedContractLaunch`.** This is the subject. Note it has TWO distinct reasons to clear (`!contract` and `!unlocked`) collapsed into ONE unconditional call, and records neither.
- `src/meta/ContractFamilies.ts:1099-1106` — `clearPlayerContractLaunch`. **Read `:1103-1104` closely: it removes `PLAYER_CONTRACT_LAUNCH_KEY` AND `CHARTER_LAUNCH_KEY`.** The second removal is the data loss; nothing announces it.
- `src/meta/ContractFamilies.ts:1108-1120` — `stageCharterLaunch` and the prose comment at `:1108-1111` stating the seam's intended contract.
- `src/meta/ContractFamilies.ts:1177-1183` — the charter seam. It has five silent early-outs; the predecessor proved it is the FIRST (`launched === false`) that fires.
- `src/meta/ContractFamilies.ts:1203-1213` — the diagnostics object you will extend.
- `src/vite-env.d.ts:278-288` — the `gr.contract` diagnostics declaration. **`fallbackReason` at `:281` is a CLOSED union of three values plus `null`.**
- `e2e/cp04-lever.spec.ts:130-152` — the nine seeded boots, and `:136-142` where the test stages BOTH sessionStorage keys via `addInitScript`.
- `tasks/runs/20260728-194217-lane-b-cp04-charter-name-composition.md` — the STOP that produced every number below.

## Pre-flight (LANE-SAFETY, runner-auto-commit aware)
The lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via `git log`/`git diff`), it is a SAFE DUPE → `git checkout -B lane/m4 main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make.

**s1186 measured lane-b as SAFE TO RESET immediately before authoring this — but re-derive rather than trusting this paragraph.** `lane/m4` was 2 ahead (`907d5310` town-store-collider, merged `422d2639`; `c97062be` the predecessor STOP, report-only). `git diff --name-only --diff-filter=A main..lane/m4` listed ONLY `.wrangler/tmp/**` scratch that main deliberately deleted, plus four stale `tasks/queue/**` copies whose masters all still exist at `tasks/` root (all four confirmed present on disk). ⚠️ **Do NOT read a plain two-dot `git diff main..lane/m4` as evidence of deletions** — it shows hundreds of `D` rows that are merely this lane's staleness against a main that moved. The `--diff-filter=A` probe is the one that answers the safety question.

➡️ **Run it yourself: `git diff --name-only --diff-filter=A main..lane/m4`.** If it lists only `.wrangler/tmp/**` and `tasks/queue/**`, reset and proceed. If ANYTHING else appears, that is undrained work a reset would DESTROY — **STOP AND REPORT naming the files.**

Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.

## Why (the defect, dated, measured — and why the obvious repair was correctly refused)

The predecessor was sent to find which of the charter seam's early-outs drops the composed contract name. It found it, and then **correctly refused to repair it**, because the repair it had been authorized to make would not have worked. Its closing paragraph, verbatim:

> "The proposed additive diagnostics field would not have made the original defect visible: the charter-application branch was never reached, so it had no rejection to carry. **Visibility must exist at the earlier launch re-verification/clear boundary before a rejection diagnostic can help.**"

That sentence is this task's entire scope. The measured causal chain, from the same report:

```text
[CP04 observe] {"step":1,"launched":false,"requestedId":"e1-dry-gulch","contractId":"e1-dry-gulch"}
[CP04 observe] {"step":2,"charterLaunch":null}
[CP04 observe] {"step":3,"pressedOk":true,"pressedContractName":"The Dry Gulch — Build Something Big"}
[CP04 observe] {"step":5,"documentContainsBuildSomethingBig":true}
```

Read that carefully: **the document was intact and parsed to the correct composed name (step 3), and by the time the seam looked, it was gone (step 2).** `startGame()` calls `reverifyStagedContractLaunch()` before `activeContract()`; the staged `e1-dry-gulch` is locked for a virgin test profile; so `ContractUnlock.ts:79` calls `clearPlayerContractLaunch()`, which at `ContractFamilies.ts:1104` also removes `CHARTER_LAUNCH_KEY`. The charter document is collateral damage of an unlock check that has no idea charters exist.

Measured failure shape, unmodified: **16 failed / 8 passed** across both projects (`--workers=1`, 9.1 m); desktop alone **8 failed / 4 passed** (4.8 m). The two `the-claim` boots pass because `the-claim` is the default and is never locked.

**WHY THIS SLICE IS OBSERVE-ONLY, AND WHY THAT IS THE POINT.** There are at least three coherent cures — seed the unlock so the staged contract is not locked; teach `reverifyStagedContractLaunch` to preserve the charter key; rule that a locked contract may not carry a charter and fix the test's expectation. **Choosing between them decides whether a locked contract can be charter-launched, which is a design fork and therefore the owner's, not yours.** This task makes the boundary tell the truth so that fork can be decided on evidence instead of argument. **Do not pick a cure. Do not make the failing boots pass.** A run that leaves `cp04-lever.spec.ts` at 16/8 and adds a diagnostic proving *why* is a complete success.

## Scope (numbered, each item testable)

**1. Measure first — confirm the premise before changing anything.**
   1a. Reset per pre-flight, `npm run build` green.
   1b. Run `npx playwright test e2e/cp04-lever.spec.ts --project=desktop-chrome --workers=1 --reporter=line`. Record the pass/fail split and exit code.
   1c. Add a TEMPORARY probe (removed before you finish) that logs, on one failing seeded boot, whether `reverifyStagedContractLaunch()` called `clearPlayerContractLaunch()` and which sub-condition was true — `!contract` or `!contractUnlockStatus(contract).unlocked`.
   ⛔ **STOP GATE.** If the clear did NOT happen, or the split is not ~8 failed / 4 passed on desktop, the premise this task rests on is refuted. **Write the STOP report with what you actually observed and stop.** That is a success, not a failure — the predecessor's STOP is exactly why this task could be written.

**2. Record the reason at the boundary (`src/meta/ContractUnlock.ts`).**
   2a. `reverifyStagedContractLaunch()` records, before clearing, WHICH sub-condition fired — as a closed union, exactly two values: `'staged-contract-missing'` (the `!contract` arm) and `'staged-contract-locked'` (the `!unlocked` arm). No free strings.
   2b. It also records whether a charter document was present at the moment of the clear (read `CHARTER_LAUNCH_KEY` **before** calling `clearPlayerContractLaunch`) — this is the field that makes the data loss visible rather than inferable.
   2c. The clear itself is UNCHANGED. Same call, same conditions, same timing. This slice adds no branch that alters behaviour.

**3. Surface it through the existing diagnostics channel.**
   3a. Extend the `gr.contract` diagnostics object at `ContractFamilies.ts:1203-1210` with the record from scope 2 — present as `null` when no clear occurred.
   3b. Declare it in `src/vite-env.d.ts` beside `:281` as a **closed union**, matching how `fallbackReason` is declared. ⚠️ **Do NOT widen `fallbackReason` itself** — it is a different question with a settled three-value vocabulary, and stretching it would make two unrelated causes indistinguishable. New field, new union.
   3c. A plain boot with nothing staged must report the new field as `null`. Assert this — it is the common path.

**4. Prove it (`e2e/cp04-lever.spec.ts`, additive only).**
   4a. Add ONE test asserting that on a seeded locked-contract boot the new diagnostic reads `'staged-contract-locked'` **and** reports that a charter document was discarded. This is the first artefact in the codebase that states the real cause out loud.
   4b. Do NOT modify the existing 16 failing expectations. They stay red; they are the owner's fork to resolve.
   4c. **Mutation control (mandatory, both exit codes reported):** (i) make `reverifyStagedContractLaunch` skip the clear → your new assertion must FAIL; (ii) restore → it must PASS. A diagnostic that cannot go red is not a diagnostic. If it cannot be made to fail, say so plainly and STOP rather than shipping a tautology.

## Firewall

**TOUCH-ONLY:** `src/meta/ContractUnlock.ts` · `src/meta/ContractFamilies.ts` (the diagnostics object at `:1203-1210` and, if strictly needed for 2b, a read-only accessor — **NOT** the charter seam at `:1177-1183`) · `src/vite-env.d.ts` (the `gr.contract` block only) · `e2e/cp04-lever.spec.ts` (additive tests only) · your run report.

**NO:**
- ❌ **No cure.** Do not seed/alter unlock state, do not preserve the charter key, do not reorder `startGame()`. Those are the owner's fork (see Why).
- ❌ Do not modify the charter seam at `ContractFamilies.ts:1177-1183`.
- ❌ Do not touch `e2e/cp04-lever.spec.ts:106` (the press-through expectation) — it is downstream of a separate OWNER FORK.
- ❌ Do not widen `fallbackReason`'s union (scope 3b).
- ❌ Do not make the 16 failing boots pass. If they start passing, you changed behaviour — revert and report.
- ❌ No `src/ui/**`, no `src/charter/**`, no `src/game/**`, no other e2e specs, no `STATUS.md`, no `reviews/`, no `tasks/` beyond your run report.

## Self-check before READY-FOR-GATES

- [ ] `npx tsc --noEmit` exit 0
- [ ] `npm run build` exit 0
- [ ] `npm run test:node-guards` exit 0 — **run this; it also answers whether the whole suite is collectable, and a scoped run never does** (s1185 lost 50 minutes to exactly that)
- [ ] `e2e/cp04-lever.spec.ts` BOTH projects: your new test passes; **the pre-existing split is UNCHANGED at 16 failed / 8 passed** — report the number, and if it moved, explain why before doing anything else
- [ ] Adjacent unmodified-green: `e2e/release-build.spec.ts` + task-025 + m1-01 + m2-01, both projects
- [ ] Zero console/page errors, plain boot desktop **and** 390 px
- [ ] Both mutation-control exit codes reported (scope 4c)
- [ ] Temporary scope-1c probe REMOVED — prove it with `git diff -- src/` showing only your intended hunks
- [ ] Plain boot reports the new field as `null` (scope 3c)

**READY-FOR-GATES** — report: the scope-1 split and whether the STOP gate fired · which sub-condition the boundary recorded · whether a charter document was present at the clear · both mutation exit codes · the unchanged 16/8 · anything you refused and why.
