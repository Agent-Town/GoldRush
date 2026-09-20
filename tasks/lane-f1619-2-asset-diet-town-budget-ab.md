# Task f1619-2: settle the ~1.9 MB mobile asset-diet growth — a saveData A/B on the town byte budget (lane-a, commit prefix "test:")

**FIRE-AUTHORED s1619 (attended review welcome)**

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-a`.

READ FIRST: `AGENTS.md`; `e2e/asset-diet.spec.ts` **in full** — it is the only file you will change, and you are ADDING to it, never rewriting it; `reviews/f1615-1-prefetch-wins-mount-laziness.md` lines **70-75** (the unverified byte shift this task settles — quoted in the WHY below; find it by content: `grep -n "mobile 15,181,572" reviews/f1615-1-prefetch-wins-mount-laziness.md`); `e2e/advance-stream.spec.ts` — the test titled **"saveData keeps tier one and skips bulk contract maps"**, for the two-line `addInitScript` idiom that emulates a metered connection (**copy that idiom; do not import from that file and do not change it**); `src/assets/AdvanceStream.ts` around `saveDataEnabled` and the `priority === 1` narrowing — **read it, do NOT change it**.

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE -> `git checkout -B lane/a main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. **EVIDENCE-ARTIFACT EXCEPTION (F-1266-1): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, and any `.png` — are NEVER "work" and NEVER a STOP. Discard them and PROCEED, listing what you discarded.** Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything. Then `git -C worktrees/lane-a status --short` -> must be clean, with the FACTORY-CHURN EXCEPTION — always expected, never a STOP; list them and proceed (F-1407-1): (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*` and any `.png`. What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.

**PREMISE CHECK (do this first, and STOP if any fails):**
```
grep -c "expect(townResponseBytes).toBeLessThan(25_000_000);" e2e/asset-diet.spec.ts
grep -c "const townResponses: number\[\] = \[\];" e2e/asset-diet.spec.ts
grep -c "mobile 15,181,572" reviews/f1615-1-prefetch-wins-mount-laziness.md
```
All three must return **1** (each proved `=1` on main AND `=1` inside the refreshed lane at dispatch, s1619, per F-1425-2). If any returns 0, the ground moved — **STOP and report which one, with the current text of that region.** Do NOT search for a replacement target and do not guess.

The existing test is titled **"honest town and claim cues appear while GLBs are throttled and leave at ready"**. Cite it by that title, never by a line number.

## Why (an unverified number that two later measurements disagree about)

`reviews/f1615-1-prefetch-wins-mount-laziness.md` records, as a runner claim the drain explicitly did **not** confirm:

> Runner reports tsc green, build green, asset-diet 4/4, and an asset-size shift worth a look on the next gate: desktop 21,389,200 -> 16,209,181 bytes, but mobile 15,181,572 -> **17,074,995** (mobile grew ~1.9 MB, which is the same direction as F-1617-4 and may share its cause).

Three things make this worth one lane run rather than another guess:

1. **The two projects moved in OPPOSITE directions from one change** — desktop fell 5.2 MB while mobile rose 1.9 MB. A single prefetch-set edit producing opposite signs in two projects is either a real device-tier asymmetry or a measurement artifact, and **nobody has yet looked at WHICH URLs differ.** That per-URL breakdown is the deliverable.

2. **It is still unsettled, and the later evidence does not settle it.** s1618 measured the *deployed* bundle at desktop 13,899,179 B / mobile 13,313,590 B — mobile SMALLER than desktop, the opposite direction — but that is a **different metric**: total published bytes, not `townResponseBytes`. Two numbers that measure different things cannot confirm or refute each other, and s1618 said so and left the question open.

3. **f1617-1 cannot have moved it.** The saveData trim (`bbc35cc0b`) narrows only the metered path; a normal connection keeps the full prefetch set to the byte. So whatever the number is on main today, it is still the number f1615-1 produced.

**The control is free, and that is why this is one small task rather than an A/B against a reverted tree.** Because f1617-1 excludes the two bulk halls under `saveData`, a saveData arm IS a "without the bulk halls" control — obtainable with an `addInitScript`, with **no code revert, no second checkout and nothing left uncommitted**.

⚠️ **State the control's limit rather than overselling it: the saveData arm is a LOWER BOUND, not a clean isolation of the two halls.** `saveDataEnabled` also narrows prefetch to `priority === 1`, so the arm-to-arm delta bundles the halls together with whatever else drops out. **That is exactly why scope 3 demands the per-URL breakdown** — the URL list says precisely which assets account for the delta, where a single delta number would only invite a story.

## Scope

1. **Add ONE new test to `e2e/asset-diet.spec.ts`** — do not create a new spec file. That file already carries the `test.skip(process.env.GR_ASSET_DIET_BUNDLE !== '1', ...)` guard and is already reached by `npm run test:asset-diet` through `playwright.preview.config.ts`, so a new test in it inherits the right harness and **changes no gate topology** (no `package.json` script, no `playwright.config.ts` edit, nothing added to `claimedByAnotherConfig`). A new file would need all three and would silently join the default gate as well.

2. **The existing test is a live gate: ADD ONLY.** Its body must be unchanged — no re-scoping, no "while I am here" tidying, no extraction of shared helpers out of it. Prove it in your report with `git diff -- e2e/asset-diet.spec.ts` showing **additions only** (`git diff --numstat` deletions column must read `0`). If you believe the existing test is wrong, that is a FINDING for your report, never an edit here.

3. **The new test measures `townResponseBytes` in two arms and reports the URLs, not just the totals.** Reuse the existing test's counting idiom (same-origin responses, `content-length`, stop counting at `ready`) but record **`{url, bytes}` per response**, not only the running sum. Two arms:
   - **normal** — same boot as the existing test (`/?town3dPilot=all&tier=full`);
   - **saveData** — identical, plus the `addInitScript` that defines `navigator.connection = { saveData: true }`, copied from the `advance-stream.spec.ts` test named above.

4. **Emit `artifacts/asset-diet/town-budget-<project>.md`** with: both arms' `townResponseBytes` totals; the delta; each arm's headroom against the **25,000,000** ceiling the existing test asserts; and a table of every URL **present in the normal arm and absent from the saveData arm** (or present in both with different bytes), sorted by bytes descending. `artifacts/**` only — **write no `reviews/*.md`** (a tracked `reviews/*.md` rewrite is a hard STOP in both pre-flight templates; F-1616-2 exists because a spec did it).

5. **Assert only what must hold whichever way the numbers fall.** Assert both arms are under `25_000_000` (the same ceiling the existing test uses — the budget is the budget), that the saveData arm is **not larger** than the normal arm, and `expectNoConsoleErrors`. ⚠️ **Do NOT assert any specific byte total, and do NOT assert a specific delta.** Those are exactly the numbers in dispute; pinning them would freeze today's measurement into a gate and convert every future asset change into a mystery red. **A number worth measuring is not yet a number worth asserting.** Say so in a comment above the new test.

6. **Do not touch what you are measuring.** `src/**` is firewalled, **especially `src/assets/AdvanceStream.ts` and `src/town/TownTavernPilot.ts`**. If the URL table shows the prefetch set is wrong, that is a FINDING — a follow-up slice rules on it.

7. **Answer the question in prose.** In your report, state plainly: is the mobile `townResponseBytes` on main today above, below or equal to the review's `17,074,995`? Which URLs account for the normal-vs-saveData delta in each project? And does the desktop/mobile asymmetry survive, or was it an artifact of that one run? **"The asymmetry did not reproduce" is a perfectly good answer** and is worth reporting as loudly as a confirmation.

If you find yourself about to exit without changes, WRITE WHY into your report first — a silent no-op wastes a queue slot and a gate (Mistake #1).

## Firewall

Touch ONLY: `e2e/asset-diet.spec.ts` (additions only).

NO changes to: `src/**` — **especially `src/assets/AdvanceStream.ts`, `src/town/TownTavernPilot.ts`** · `e2e/advance-stream.spec.ts` (you copy an idiom OUT of it; you never edit it) · any other spec · `playwright.config.ts`, `playwright.preview.config.ts`, `package.json` (scope 1 exists precisely so none of these move) · `reviews/**` · `scripts/**` · `tasks/**`, `STATUS.md`, `tasks/goals.json`, `tasks/BACKLOG.md` (the fire owns all ledger surfaces) · other lanes' work.

## Self-check (evidence, not vibes)

- `npx tsc --noEmit` clean; `npm run build` green.
- `npm run test:asset-diet` green in **both** chromium projects — that runs the whole file, so it covers the existing test AND yours. Report rc, pass counts and wall time. **The existing test must still pass; if it does not, STOP and report — you have changed a live gate.**
- **Paste both projects' `artifacts/asset-diet/town-budget-*.md` in full** — both arms' totals, the delta, the headroom, and the URL table. The URL table IS the deliverable.
- **Paste `git diff --numstat -- e2e/asset-diet.spec.ts`** — the deletions column must read `0`.
- `git status --short` after the run: paste it. No modified tracked `reviews/*.md`, nothing outside `e2e/asset-diet.spec.ts` plus `artifacts/**`.
- Adjacent: `npx playwright test e2e/advance-stream.spec.ts --workers=1`, both projects — it owns the saveData contract you are emulating. Report pass counts (10/10 both projects at s1618).
- `npm run test:node-guards` is **correctly OUT of this battery** per F-1460-1 — this diff is one `e2e/` file and zero `src/sim`, `src/systems`, `src/entities`. State that you checked, do not run it.
- The existing test writes screenshots to `artifacts/asset-diet/`; yours needs none. No perf table: this slice renders nothing new.

End: **READY-FOR-GATES** + report (a) the three pre-flight grep counts, (b) both projects' full town-budget artifacts, (c) `git diff --numstat` proving additions only, (d) **the prose answer to scope 7 — above/below/equal to 17,074,995, which URLs drive the delta, and whether the desktop/mobile asymmetry reproduced**, (e) all runs' rc, pass counts and timings, (f) anything you noticed about the prefetch set or the diet script — as a finding, never as an edit.
