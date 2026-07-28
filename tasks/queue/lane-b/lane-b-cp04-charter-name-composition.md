# Task lane-b-cp04-charter-name-composition: the charter-COMPOSED contract name is lost between the staged document and the briefing — find WHICH of the four silent early-outs drops it, then repair only that link (lane-b, commit prefix "fix:")

**FIRE-AUTHORED (attended review welcome)** — s1180, 2026-07-28. Successor to the lawful STOP `factory-cp04-lever-unlock-seed-realign` (leaf status `stopped`, review `reviews/cp04-lever-unlock-seed-realign.md`). That task's mechanism was **refuted by its own observe-first gate**; this one starts from what the refutation actually printed. Filed as **F-1179-3**. The predecessor leaf is NOT revived — this is a new leaf, per its own stopNote.

CODEX: model=gpt-5.6-sol effort=high

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-b`.

READ FIRST (paths, not memory):
- `AGENTS.md`
- `src/meta/ContractFamilies.ts:1145-1212` — **the whole `resolveActiveContract` body.** The charter seam is `:1177-1182`; the diagnostics it returns are `:1205-1210`.
- `src/meta/ContractFamilies.ts:1099-1140` — `stageCharterLaunch` / `readCharterLaunch` / `clearCharterLaunch`, and the comment at `:1108-1111` that states the seam's intended contract in prose.
- `src/meta/ContractFamilies.ts:895-930` — `parseContractDescriptor` and `descriptorRejection`, including the `normalized.id !== template.id` rejection at `:913`.
- `e2e/cp04-lever.spec.ts:130-152` — the nine seeded boots. **Note `:136-142`: the test stages BOTH sessionStorage keys itself via `addInitScript`, so the charter document IS present at boot; this is not a missing-seed problem.**
- `e2e/cp04-lever.spec.ts:61-116` — the press-through test. Its `:106` expectation is a **different** failure (see the firewall — it is downstream of an OWNER FORK).
- `reviews/cp04-lever-unlock-seed-realign.md` — the STOP that produced the evidence below.
- `src/ui/Hud.ts:329` — the read-back (`contract-briefing-name`). **Read to understand, not to edit.**

## Pre-flight (LANE-SAFETY, runner-auto-commit aware)
The lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via `git log`/`git diff`), it is a SAFE DUPE → `git checkout -B lane/m4 main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make.

**Lane-b was frozen until this fire, and s1180 unfroze it deliberately — re-derive rather than trusting this paragraph.** `lane/m4` was 1 ahead at `fdc52dcd`, whose entire content was a **single** file — `artifacts/anim-8frame-townsfolk/plaza-before-desktop-chrome.png`, the sole surviving evidence of the s1162 lawful STOP — and that file existed **nowhere else in any object database**, which is exactly why three fires carried "⛔ lane-b must NOT be reset" while also reporting "PIPELINE-DRY: lane-b". s1180 landed that byte on main (`d3fc75df`, Retention Law) precisely so this lane could be reset without loss.

➡️ **Verify it yourself before resetting: `git diff --name-only --diff-filter=A main..lane/m4` must be EMPTY.** If it is EMPTY, reset and proceed. If it is NOT empty, something landed after authoring — that is undrained work, a reset would DESTROY it, **STOP AND REPORT naming the files.**

Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.

## Why (the defect, dated, measured — and the mechanism that was already refuted)

s1179 ran the nine seeded boots and printed one triple that killed the previous hypothesis:

```text
expected 'The Dry Gulch — Build Something Big'
actual   'The Dry Gulch'
activeId 'e1-dry-gulch'
```

**`activeId` is the REQUESTED contract.** So nothing falls back to `DEFAULT_CONTRACT_ID`, the unlock gate is not implicated on these boots, and the previously-proposed unlock-seed cure would have papered over a defect it does not touch. What is lost is **only the charter-composed name**, and the same shape repeats on Night Shift / Twin Banks / The Baron's Claim. Measured shape: **16 failed / 8 passed, both projects, `--workers=1`, 9.1 m**; the two `the-claim` boots green.

The composed name is built from two Lever labels — `LeverTemplates.ts:15` `label: 'The Dry Gulch'` (the land) and `:63` `label: 'Build Something Big'` (the story). The test's expectation is `combination.charter.contract.name`, computed in-test from the same compile pipeline that produced the staged document.

**The seam that must apply it has FOUR consecutive silent early-outs and not one of them logs, returns a reason, or is visible to any test** (`src/meta/ContractFamilies.ts:1177-1182`):

```ts
if (launched && requestedId && contract.id === requestedId) {   // (1)
  const charterLaunch = readCharterLaunch();                     // (2) may be null
  if (charterLaunch && charterLaunch.templateId === requestedId) {// (3)
    const pressed = parseContractDescriptor(charterLaunch.document, contract);
    if (pressed.ok) contract = pressed.contract;                 // (4) !ok is SWALLOWED
  }
}
```

✓ **VERIFIED AT SOURCE (s1180), so do not re-derive these two:**
- **An id mismatch at (3) is NOT the cause.** `src/charter/PressPanel.ts:280-284` passes the same `rootId` to `stageCharterLaunch(rootId, …)` **and** to `next.set('contract', rootId)`, so templateId and the URL param match by construction; the seeded boots do the same at `cp04-lever.spec.ts:141-143`.
- **The permanent diagnostic CANNOT express this failure.** `ActiveContractDiagnostics.fallbackReason` (`:630`, mirrored in `src/vite-env.d.ts:281`) has exactly three values — `'debug-disabled' | 'unknown-contract' | 'unavailable-contract'` — all of which describe why the **contract** fell back. **None can say the charter document was rejected or never applied.** A verdict an instrument cannot express never warns you it is missing, which is why this defect has read as "contract resolved fine" to every test that looked.

## Scope

### 1. OBSERVE AND CLASSIFY — MANDATORY STOP GATE, BEFORE YOU CHANGE ANY BEHAVIOUR

Reproduce first, unmodified, and state the worker count (F-1173-5):

```text
npx playwright test e2e/cp04-lever.spec.ts --project=desktop-chrome --workers=1 --reporter=line
```

Then, with a **temporary** diagnostic you remove before reporting (`git diff -- e2e/` and `git diff -- src/` must both be EMPTY at the end of this scope), instrument the seam for **one** failing seeded boot — `e1-dry-gulch` — and print, verbatim:

1. `launched`, `requestedId`, and `contract.id` **as (1) evaluates them** — i.e. was the outer gate even entered?
2. `readCharterLaunch()` — null or `{templateId}`?
3. `pressed.ok`. **If false, print the full rejection reasons array** from `descriptorRejection`.
4. If `pressed.ok` is true: `pressed.contract.name`.
5. Independently: **does the staged document text itself contain the string `Build Something Big`?** Print that boolean. This separates "the composer never wrote the name" from "the parser dropped it".

**Classify, and obey the classification:**

- **(a) the seam is entered and `pressed.ok === false`** — the rejection is real and silently swallowed at (4). ➡️ **PROCEED to scope 2.** Report the rejection reason; it names the cure.
- **(b) `pressed.ok === true` but `pressed.contract.name` is already the short name, AND the document text does NOT contain the composed name** ➡️ **STOP AND REPORT.** The composer never serialised it, so the *test's expectation*, not the runtime, may be the thing that is wrong — and deciding which side is authoritative is a **spec question about what a stamped charter is**, not a runner's call.
- **(c) the outer gate (1) or the `templateId` check (3) is never entered** ➡️ **STOP AND REPORT** exactly which sub-condition was false and its operands.
- **(d) anything else — including an already-green tree** ➡️ **STOP AND REPORT** with the evidence. The measurement behind this task is hours old.

**(b), (c), (d) and an already-green tree are all LAWFUL STOPS and count as full successes.** The predecessor of this very task earned its keep by stopping (`reviews/cp04-lever-unlock-seed-realign.md`); a stop with numbers is worth more than a cure aimed at the wrong link.

### 2. REPAIR THE ONE LINK — only on classification (a)

Two edits, both narrow, and **no others**:

1. **Make the swallowed rejection impossible to swallow again.** At `:1181-1182`, the `!pressed.ok` branch must stop being silent: carry the rejection into the returned diagnostics. This means **adding** a field (or an additional union member) to `ActiveContractDiagnostics` and mirroring it in `src/vite-env.d.ts` — **additive only.** ⛔ You may **not** repurpose, rename, or change the meaning of any of the three existing `fallbackReason` values; specs elsewhere read them. A new nullable field is the shape to prefer.
2. **Fix the cause the rejection names**, and nothing beyond it. If the reason is `contract_id`, the fix belongs where the id is written or normalised — not in the comparison at `:913`, which is a real invariant and must keep its teeth.

⛔ **You may NOT satisfy this scope by making `parseContractDescriptor` accept what it currently rejects wholesale, by deleting the `normalized.id !== template.id` guard, or by writing the composed name into the briefing from the template as a workaround.** The spec's value is that it cross-checks two independent code paths — the charter composer against the HUD read-back at `src/ui/Hud.ts:329`. A cure that makes those paths agree by copying one into the other destroys the test's whole purpose while turning it green.

⛔ **No assertion in `e2e/cp04-lever.spec.ts` may be deleted, skipped, or weakened to `toContainText` / a regex / `toBeTruthy`.** The assertion count must not fall. If you believe an expectation is genuinely unanswerable, that is a STOP.

### 3. MUTATION CONTROL — aim it at the SUBJECT, and restore it by hash

Your repair must be able to fail. Prove it by mutating **the thing under test**, not the test:

- Record `git hash-object src/meta/ContractFamilies.ts` as **PRE**.
- Temporarily neutralise the charter application — the smallest edit that makes the seam not apply (e.g. forcing the (4) branch not to assign). Re-run one seeded boot and show it goes **RED** with the composed name missing. Paste the failure.
- **Restore and prove the restore**: `git hash-object` must equal **PRE**, and `git status --porcelain -- src/` must show only your scope-2 edits. Paste `PRE=…` and `POST=…`.

### 4. SELF-CHECK

1. `npx tsc --noEmit` — clean.
2. `npm run build` — green, note the time.
3. `e2e/cp04-lever.spec.ts`, **both projects**, `--workers=1`, **state the worker count**. Report the count against the **16 failed / 8 passed** baseline above. **You are NOT expected to reach 24/24** — see the firewall on `:106`. Every remaining red must be named and attributed.
4. Adjacent, unmodified, both projects, `--workers=1`: `e2e/release-build.spec.ts` (**its 14 reds are known and firewalled — they must not get worse**) and `e2e/trail-guide.spec.ts`.
5. `git status --porcelain -- e2e/` **EMPTY** (this task changes no spec), pasted.
6. Zero console / page errors on the boots you run.

## Firewall

**TOUCH-ONLY:**
- `src/meta/ContractFamilies.ts` — only the two scope-2 edits.
- `src/vite-env.d.ts` — only the additive diagnostics mirror.
- your run report under `tasks/runs/`.

**NO — do not touch, do not "fix", do not tidy:**
- **`e2e/cp04-lever.spec.ts` and every other spec.** This task changes runtime behaviour, not expectations. An edited control is not a control.
- **`src/charter/PressPanel.ts` land-card rendering and `src/meta/ContractUnlock.ts`** — this is **OWNER FORK F-1179-4**, live on the owner's desk: the Lever renders all five `LEVER_LANDS` and never calls `contractUnlockStatus`, so a real press-through can request `e1-twin-banks` and be briefed as `The Claim`. The three options (hide locked lands / show them locked / unlock on press) are the **owner's** choice. ➡️ **`cp04-lever.spec.ts:106` is downstream of that fork and is EXPECTED TO STAY RED.** Do not fix it, do not seed around it, do not touch the unlock gate.
- `src/ui/Hud.ts` — the read-back is the cross-check; changing it is how you fake this green.
- `e2e/cp04-lever.spec.ts:118-127` ("a plain boot remains inert") — its virgin storage IS its point.
- `playwright.config.ts`, `package.json`, any `--workers` default.

## Self-check before you report

READY-FOR-GATES + report, in this order: **scope 1's five printed observations and its classification letter** (or the STOP); the scope-2 diff in text with the additive diagnostics field named; the mutation control's RED plus `PRE=`/`POST=`; the cp04 count against the 16/8 baseline with the worker count stated and **every remaining red attributed** (`:106` to F-1179-4 explicitly); the adjacent table; and one paragraph on whether the new diagnostics field would have made this defect visible to the ORIGINAL spec — because that, not the count, is what stops the next one.
