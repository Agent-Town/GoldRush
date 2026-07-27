# Task lane-board-chapter-tab-adoption: FOUR E2E SPECS STILL CLICK THE PER-CONTRACT PAGE DOT THAT THE CHAPTER REORGANIZATION RETIRED ON 2026-07-20

**FIRE-AUTHORED (attended review welcome) — s1110, 2026-07-27. This is the corrective that F-1109-1 ordered.** The goal leaf for `contract-art-key-adoption` already names this slice by name ("Corrective authored same fire: lane-board-chapter-tab-adoption") — that sentence was aspirational: s1109 found the defect but ran out of authoring budget, so the master is only being written now.

**READ THIS FIRST, BECAUSE IT INVERTS THE OBVIOUS FIX: the DOM is RIGHT and the SPECS are STALE.** The tempting repair is to make `TownScene` emit `contract-page-dot-<id>` again so these clicks resolve. **That would reverse a ratified 2026-07-20 reorganization and re-introduce a retired control.** `src/**` is firewalled. See WHY.

You are Codex (worktrees/lane-b).

CODEX: model=gpt-5.6-sol effort=medium

> ⚠️ The `CODEX:` line above is at **column 0 on its own line** deliberately (F-1088-4). `scripts/lane-runner-v3.sh:65-66` greps `^CODEX:`, so an inline copy is silently ignored and the run falls back to `effort=medium`.

## WHY (the evidence chain, dated — every number below was re-measured s1110, not inherited)

**THE CHAPTER REORGANIZATION — `6822607f`, 2026-07-20T09:50:20+07:00**, *"feat: reorganize The Book into era chapters"*. The Book stopped being a flat dot-paginated list and became per-era chapters. Navigation is now a chapter tab, rendered at `src/town/TownScene.ts:1826`:

```
<button class="town-ui__chapter-tab" type="button" data-contract-page="${index}"
        data-testid="contract-chapter-tab-${escapeHtml(entry.id)}" ...>
```

`6822607f` updated **exactly seven** e2e files (`git show --stat 6822607f | grep e2e`): `072-era-activation`, `board-card-images`, `board-gating-and-profiles`, `board-upcoming-surveys`, `contract-briefings`, `fresh-scene-render-state`, `town-t3-board`. **It left four behind**, and they have been red ever since — the same **"frozen spec + moved source"** class as F-1101-2 and the art-key adoption that preceded this one.

**THE FOUR SITES — `grep -rn 'contract-page-dot' src/ e2e/` returns 0 hits in `src/` and exactly 4 in `e2e/`:**

| # | site | clicks | DOM actually offers |
|---|---|---|---|
| 1 | `e2e/e2-pressure-garden.spec.ts:69` | `contract-page-dot-e2-pressure-garden` | `contract-chapter-tab-epoch-2-steamworks` |
| 2 | `e2e/e2-trestle.spec.ts:69` | `contract-page-dot-e2-trestle` | `contract-chapter-tab-epoch-2-steamworks` |
| 3 | `e2e/e2-incline.spec.ts:61` | `contract-page-dot-e2-incline` | `contract-chapter-tab-epoch-2-steamworks` |
| 4 | `e2e/cw-02-escort.spec.ts:68` | `contract-page-dot-e3-canyon-works` | `contract-chapter-tab-epoch-3-voltage` |

**#1 and #2 CORRECT A PRIOR ATTRIBUTION, and that is the most useful thing in this file.** s1105 read those two files' redness as the retired *art key* and fixed `:74` in each. Measured: both fail at **`:69`, five lines UPSTREAM of that edit** — so the art-key assertion is **never reached**, and fixing it changed nothing observable in those two specs. The art-key slice's real gain was `town-t3-board` alone, which is exactly the 6/9 → 7/9 its runner honestly reported. **#3 and #4 have never been reported by anyone.** Do not assume a red in these files is yours to own; see SELF-CHECK's before/after demand.

**THE CURE ALREADY SHIPS GREEN IN-REPO — copy it, do not invent one.** `e2e/town-t3-board.spec.ts:121-126`:

```ts
async function goToContractPage(page: Page, id: string): Promise<void> {
  const chapter = listEpochs().find((epoch) => loadEpoch(epoch.id).contracts.some((contract) => contract.id === id));
  if (!chapter) throw new Error(`Missing chapter for ${id}`);
  await page.getByTestId(`contract-chapter-tab-${chapter.id}`).click();
  await expect(page.getByTestId(`contract-card-${id}`)).toBeVisible();
}
```

It derives the chapter **from the manifest at runtime**, so it carries **no frozen literal** — which is the whole point, because a frozen literal is what broke all four of these sites in the first place. **Do not "simplify" it to a hardcoded `contract-chapter-tab-epoch-2-steamworks`.** That idiom does exist in ~8 already-green specs, and it is precisely the debt this finding is about; re-freezing a different literal would repeat the mistake at one remove. All four contract ids were verified present in the manifests s1110 (`e2-trestle`, `e2-pressure-garden`, `e2-incline` in `assets/contracts/epoch-2-steamworks/contracts.json`; `e3-canyon-works` in `epoch-3-voltage/contracts.json`), so the `Missing chapter` throw should not fire. If it does, **STOP and report** — that means the manifest moved and this task's premise is dead.

**A LOCAL COPY IN EACH FILE IS THE HOUSE IDIOM — do NOT extract a shared module.** `hold()`, `shot()` and `watchErrors()` are already duplicated across these same specs verbatim. `e2e/helpers/` exists but holds exactly one module with exactly one importer; promoting a navigator into it would mean touching the 13 already-green files that use this testid, which is a scope explosion and a firewall violation. Four local copies, matching the proven one.

**All four specs already import from `../src/meta/ContractFamilies`** (each takes `ACTIVE_EPOCH_KEY`), so the import you need is an **extension of an existing line**, not a new one.

## PRE-FLIGHT — verify by CONTENT, and run the premise checks AFTER the reset

1. `git log --oneline main..lane/m4` → **must be EMPTY.** s1110 measured `lane/m4` at `bbc9b6db`, **0 ahead of main**. **Any** commit means undrained work: **STOP and report** (LANE-SAFETY LAW — a pre-flight `reset --hard` over unmerged output is how w1-03 and polish-02 were destroyed).
2. Start from fresh main: `git checkout -B lane/m4 main`.
3. **NOW, and only now, the premise checks** — a stale lane answers for its own tree, not for main (F-1090-2):
   - `grep -rc 'contract-page-dot' src/` → **must be 0.** If non-zero, the dot control is back and this task's premise is dead: **STOP and report.**
   - `grep -rln 'contract-page-dot' e2e/` → **must list exactly the four files above.** Fewer means someone already fixed one: **STOP and report which.** More means the class grew: report the extra and fix it too only if it is a straight page-dot click; anything else, **STOP and report**.
   - `grep -c 'contract-chapter-tab' src/town/TownScene.ts` → **must be ≥1.** If 0, the tab is gone too and the cure is wrong: **STOP and report.**

## SCOPE (numbered; each item is testable)

1. **`e2e/e2-pressure-garden.spec.ts`** — add the `goToContractPage` helper (verbatim from `town-t3-board.spec.ts:121-126`), extend the existing `ContractFamilies` import to also take `listEpochs, loadEpoch`, and replace the `:69` dot click with `await goToContractPage(page, 'e2-pressure-garden');`. Leave everything else in the file alone — including the `:74` art-key assertion, which is already correct.
2. **`e2e/e2-trestle.spec.ts`** — identical change at `:69`, id `e2-trestle`.
3. **`e2e/e2-incline.spec.ts`** — identical change at `:61`, id `e2-incline`.
4. **`e2e/cw-02-escort.spec.ts`** — identical change at `:68`, id `e3-canyon-works`. Note this file's next line asserts `contract-launch-e3-canyon-works` carries `data-contract-mode='escort'`; the helper's added card-visible assertion is a strict improvement and should sit before it.
5. **Leave a one-line comment at each of the four sites** naming the retirement, e.g. *"chapter tabs since 6822607f; chapter derived from the manifest so no literal can freeze again"*. Four comments, one line each.
6. **Add NO new spec and NO new assertion beyond the helper's own.** `e2e/board-era-chapters.spec.ts` already guards chapter navigation across all epochs and is stronger than any spot-check added here. Duplicating it is a scope violation, not diligence.
7. **Do not modify `src/`.** If you believe the board should still emit page dots, **STOP and report** — restoring a retired control is an owner decision (§7.3), not a lane's.

## FIREWALL

**TOUCH-ONLY:** `e2e/e2-pressure-garden.spec.ts` · `e2e/e2-trestle.spec.ts` · `e2e/e2-incline.spec.ts` · `e2e/cw-02-escort.spec.ts`
**NO:** `src/**` (especially `src/town/TownScene.ts` — the DOM is correct) · `e2e/town-t3-board.spec.ts` (it is the *reference*; read it, do not edit it) · `e2e/helpers/**` (no shared extraction — see WHY) · any other `e2e/*.spec.ts` · `playwright.config.ts` · `tasks/**` · `STATUS.md` · `reviews/**`

⚠️ **`e2e/town-t1-square.spec.ts` and `src/town/TownScene.ts` are being edited RIGHT NOW by `lane-approach-steer-to-arrival` (rf-37) on lane-a.** Your TOUCH-ONLY set is disjoint from both. Do not read-modify-write anything outside it.

Reporting an adjacent problem is good and welcome. Fixing one outside TOUCH-ONLY is a violation.

## SELF-CHECK (report COLLECTED COUNT beside pass count — F-1104-5)

Every path below was `ls`-verified by s1110 at authoring time. A positional arg that matches **no** file contributes **zero tests without failing**, so a battery that only says "passed" is unauditable — **report `<passed>/<collected>` for each command.**

```
npx tsc --noEmit
npm run build
npx playwright test e2e/e2-pressure-garden.spec.ts e2e/e2-trestle.spec.ts e2e/e2-incline.spec.ts e2e/cw-02-escort.spec.ts e2e/board-era-chapters.spec.ts --project=desktop-chrome --workers=1 --reporter=line
npx playwright test e2e/e2-pressure-garden.spec.ts e2e/e2-trestle.spec.ts e2e/e2-incline.spec.ts e2e/cw-02-escort.spec.ts e2e/board-era-chapters.spec.ts --project=mobile-chrome --workers=1 --reporter=line
```

`board-era-chapters.spec.ts` is in the battery as **the adjacency that matters**: it is the real chapter-navigation guard, it must stay green, and its greenness is what proves the tab testid was right all along.

- **RUN THE DESKTOP COMMAND ONCE ON THE UNMODIFIED TREE FIRST and record the failures.** The fix needs a measured baseline, not an assumed one. Expect all four to fail at the dot click before your change.
- ⚠️ **DO NOT ASSUME THESE FOUR GO GREEN, AND DO NOT CHASE THEM IF THEY DO NOT.** These are heavy seeded integration specs (60–90 s timeouts) and the dot click is merely their **first** failure; clearing it can expose further downstream staleness that has been invisible for a week. **Success for this slice = the navigation step no longer fails and nothing regressed.** Any newly-revealed downstream failure is a **finding to report with its exact line and message**, not scope to fix. Report each spec as one of: green / still-red-but-past-`:69` (with the new failure line) / unchanged.
- These files carry `hold(page,'KeyA',850)`-style wall-clock waits — the flake class F-1104-3/F-1104-6 flagged. If a failure looks like a timing race rather than a selector miss, **say so and do not fix it here**; a poll-to-arrival conversion is a separate owed finding.
- **If any file collects 0, say so loudly** — that is the F-1094-1 silent-zero class, and it means the run proved nothing.
- Zero console/page errors in the board boot probe, desktop **and** 390px mobile.
- Screenshots the specs already emit are sufficient; no new artifact paths required.

**READY-FOR-GATES.** Report: the before/after pass **and collected** counts per project; the exact final navigation line at all four sites; the per-spec verdict from the three-way list above; whether the `Missing chapter` throw ever fired; and anything you found in `src/` that looks wrong but which you correctly did **not** touch.
