# Task lane-a-cp04-lever-unlock-seed-realign: cp04-lever asserts a pre-unlock-gate contract on 16 executions — observe WHICH contract actually boots, then realign the spec to the ratified gate (lane-a, commit prefix "test:")

**FIRE-AUTHORED (attended review welcome)** — s1178, 2026-07-28. Authored from `logs/suite-red-inventory.md:65-80` (shipped `7a457025`), re-derived at source by s1178 before a line of this task was written: the 16 red rows counted row-by-row, the 9 seeded boots decomposed to their land ids by index arithmetic, the pass/fail split measured against `DEFAULT_CONTRACT_ID`, and the suspect commit read with `git show --stat`. **This defect is UNCLAIMED — `grep -c "cp04" tasks/BACKLOG.md` = 0 and `grep -c "cp04" tasks/goals.json` returns only the merged CP-04 leaf. It is a Completeness-Law hole, not a ladder rung.** No new scope invented.

CODEX: model=gpt-5.6-sol effort=high

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-a`.

READ FIRST (paths, not memory):
- `AGENTS.md`
- `e2e/cp04-lever.spec.ts` — **all of it, but especially `:15-25` (how `combinations` and `bootSample` are built), `:106` and `:146` (the two failing assertions), and `:129-149` (the seeded-boot test body).**
- `e2e/release-build.spec.ts:202-245` (`seedProfile`) — **the CONTROL. It is the idiom you are propagating, it was authored in the SAME commit as the unlock gate, and it is green.** Note both arms: `:99` `{ contractId, unlocked: true }` and `:177` `{ contractId: 'e1-baron', unlocked: false }` — its author deliberately tested the locked case too.
- `src/meta/ContractUnlock.ts:17-45` (`contractUnlockStatus`) — **the gate. Read what makes a contract unlocked.**
- `src/meta/ContractFamilies.ts:701` (`DEFAULT_CONTRACT_ID = 'the-claim'`)
- `src/charter/templates/LeverTemplates.ts:8-35` (the five `LEVER_LANDS`, in order)
- `src/ui/Hud.ts:318-332` (`showContractBriefing` — the only producer of `contract-briefing-name`)

## Pre-flight (LANE-SAFETY, runner-auto-commit aware)
The lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via `git log`/`git diff`), it is a SAFE DUPE → `git checkout -B lane/m3 main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make.

**The dupe is PRE-PROVEN for you — do not spend budget re-deriving it.** s1178 verified at 2026-07-28T18:2xZ: `lane/m3` is **1 ahead** at `ced4484f` (`runner(lane-a): lane-a-town-info-note-dead-reckoning.md`), whose deliverable **shipped to main as `011e85fc`**. The decisive probe is the unique-blob invariant, not the ahead-count: `git diff --name-only --diff-filter=A main..lane/m3` returns **EMPTY** — the lane holds **zero files that main lacks**, so a reset destroys nothing. Re-run that one command to confirm nothing changed since, then reset and move on.

Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.

## Why (the defect, dated, measured)

`e2e/cp04-lever.spec.ts` shipped **2026-07-17** in `d21cac4e` with, in that commit's own message, *"cp04 24/24 both projects"*. **It has since gone red on 16 executions** — the second-largest single-file cluster on the red board (5.3% of 303), behind only the eight `town-*-blender` specs that are on the owner's desk as F-1167-1.

**The 16 rows, counted by s1178 out of `logs/suite-red-inventory.md:65-80` — not inherited from a summary:**

| site | tests | rows | failure surface | masking |
|---|---|---|---|---|
| `cp04-lever.spec.ts:146` | 7 seeded boots | **14** (7 × 2 projects) | `expect(locator).toHaveText(expected) failed` | 14/16 steps never ran (87.5%) |
| `cp04-lever.spec.ts:106` | the Lever press-through | **2** (1 × 2) | `expect(locator).toHaveText(expected) failed` | 45/54 steps never ran (83.3%) |

**Both sites assert the same thing: `contract-briefing-name` renders the charter's composed contract name.** Neither is a timeout, so **F-1167-2's timeout discount does not apply** — these are real assertion failures on BOTH projects.

### The discriminator, and it is already in the data

`bootSample` (`:25`) is `[0, 4, 17, 10, 23, 24, 29, 30, 43]` — **nine** boots. Only **seven** are red. s1178 decomposed the indices against `LEVER_LANDS` order (`the-claim`, `e1-dry-gulch`, `e1-night-shift`, `e1-twin-banks`, `e1-baron`), `LEVER_STORIES` (`defend`, `explore-quiet`, `big-build`), `LEVER_VISITORS` (`gentle`, `classic`, `busy`), where `index = land*9 + story*3 + visitors`:

| index | land / story / visitors | in the red list? |
|---|---|---|
| 0 | **the-claim** / defend / gentle | **NO — GREEN** |
| 4 | **the-claim** / explore-quiet / classic | **NO — GREEN** |
| 17 | e1-dry-gulch / big-build / busy | RED |
| 10 | e1-dry-gulch / defend / classic | RED |
| 23 | e1-night-shift / explore-quiet / busy | RED |
| 24 | e1-night-shift / big-build / gentle | RED |
| 29 | e1-twin-banks / defend / busy | RED |
| 30 | e1-twin-banks / explore-quiet / gentle | RED |
| 43 | e1-baron / big-build / classic | RED |

**Every `the-claim` boot passes. Every non-`the-claim` boot fails. The split is perfect and it is not about story or visitors at all.** `:106` fits the same rule — it presses through on `e1-twin-banks`.

**`the-claim` is `DEFAULT_CONTRACT_ID` (`src/meta/ContractFamilies.ts:701`).**

### The suspect, and why it is a suspect and not yet a conclusion

`src/meta/ContractUnlock.ts` **did not exist** when this spec was written. It was added **2026-07-23** by `6c009cb8` (*"feat: add physical E1 release build"*, +92 lines), which also moved `ContractFamilies.ts`, `main.ts` and `Game.ts`. `contractUnlockStatus` (`:17-45`) returns `unlocked: true` immediately only for `unlock === 'default'`; every other value is conditional on **scoreboard rows** (`wave10OnClaim`, `firstSecuredClaim`), **research state** (`science-complete`), or **an active epoch** (`epochIsActive`).

**`cp04-lever.spec.ts` seeds none of those.** Its seeded-boot test (`:135-141`) writes only two `sessionStorage` keys and navigates. `localStorage` is virgin: no profile, no scores, no active epoch, no research.

**And the control proves the author of the gate knew this.** `release-build.spec.ts` — authored in the *same commit* `6c009cb8` — never navigates without first calling `seedProfile(page, { unlocked: true })` (`:99`, `:109`, `:132`, `:167`, `:186`), and that helper (`:202-245`) seeds **exactly** the state the gate reads: `keys.scores` with `secured: true` rows for `the-claim` **and** `e1-dry-gulch`, `keys.activeEpoch`, `keys.meta` science track, `keys.research` taken list.

➡️ **This has the F-1170-2 shape exactly: a commit adds a gate, writes its OWN new spec that respects the gate, and updates none of the pre-existing specs that don't.** But s1178 **did not run the spec** (lane-c was live; Mistake #12), so the mechanism is **? INFERRED, and scope 1 exists to measure it, not to confirm a foregone conclusion.**

## Scope

**1. OBSERVE THE DEFECT — a mandatory STOP gate. Do not edit one line of any spec before this is written down.**
   a. Reproduce on the current lane tree, **`--workers=1`** (F-1173-5: the default worker count manufactures reds in this suite and any comparison must state its worker count), both projects:
      `npx playwright test e2e/cp04-lever.spec.ts --workers=1`
      Record `uptime` immediately before and after. Report pass/fail per test **by name**.
   b. **Confirm or refute the split above**: are exactly the two `the-claim` boots green and the seven others red? If the split is different from the table, **STOP and report** — the premise this task rests on is wrong and the cure would be aimed at the wrong subject.
   c. **Capture the ACTUAL rendered string.** For ONE failing seeded boot, print both sides: the expected `combination.charter.contract.name` and the real `textContent` of `[data-testid="contract-briefing-name"]`. Also print `window.__THREE_GAME_DIAGNOSTICS__.contract.activeId`. **That pair of values is the whole finding** — put it in the report verbatim.
   d. **Now classify, and the classification decides everything downstream:**
      - **(a) FALLBACK** — the rendered name is *The Claim's* and/or `activeId` is `the-claim` while the test asked for `e1-dry-gulch` ⇒ the locked contract silently fell back to the default. The spec encodes a pre-07-23 world. **Proceed to scope 2.**
      - **(b) SOMETHING ELSE** — the rendered name is neither the charter's nor The Claim's, or `activeId` is correct while only the *name* differs ⇒ this is a naming/render fault, **not** an unlock fault. **STOP and report**; the cure below is wrong for it.
   e. If green on the current tree: **STOP and report the cure's commit** — the inventory is 2026-07-28T02:26Z and something may have landed since.

**2. NAME THE PLAYER-FACING QUESTION — report it, do NOT fix it.**
   If scope 1 lands on (a), then a fresh save that opens the Charter Press Lever is offered **five** lands and can actually launch **one**; the other four silently boot The Claim instead. Answer Mistake #10 in one paragraph — *where does the PLAYER see this, in a plain boot?* — and say whether the Lever's card list is gated by `contractUnlockStatus` in the UI today (read `src/charter/PressPanel.ts`; do not change it).
   ⛔ **This is an owner design fork and it is NOT yours to pick.** Whether the Lever should hide locked lands, show them locked, or unlock-on-press is a design decision. **Write it as a finding for the owner's desk and move on.** Your cure is test-side only.

**3. THE CURE — test-side only, and it must not weaken the assertion.**
   Realign `e2e/cp04-lever.spec.ts` so its boots satisfy the ratified unlock gate before navigating, using **`release-build.spec.ts:202-245`'s idiom** (import it, or mirror it — your call, but say which and why).
   - The `toHaveText` assertions **stay exactly as strong**: keep comparing against `combination.charter.contract.name` / the literal `'Twin Banks — Build Something Big'`. **Do not relax either to a regex, a substring, or `toContainText`** — the whole value of this spec is that it cross-checks two independent code paths (the charter composer and the HUD briefing).
   - Keep `expect(errors).toEqual({ console: [], page: [] })` intact everywhere.
   - `'a plain boot remains inert'` (`:117-127`) **must keep its virgin storage** — it is the test that proves the Press leaves no trace, and seeding a profile into it would destroy its meaning. Leave it alone.

**4. MUTATION CONTROL — aim it at the SUBJECT, not at the spec's scaffolding.**
   With the cure in place and green, **remove the unlock seed from one seeded boot only** and show that boot goes red again with the same `toHaveText` surface. Paste both outputs. Then restore it and prove the restore by re-running that one test green. A cure that cannot be un-done on demand has not been shown to be the cause.

**5. GATES.**
   - `npx tsc --noEmit` clean; `npm run build` green (report the time).
   - `npx playwright test e2e/cp04-lever.spec.ts --workers=1` — **all tests green, both projects**, and state the worker count in the report.
   - Adjacent, unmodified, `--workers=1`: `e2e/cp03-*.spec.ts` (the Press sibling) and `e2e/release-build.spec.ts`. **`release-build.spec.ts` is expected to stay RED** — it carries its own 14 rows from three unrelated surfaces (`:160` `Object.is`, `:107` a timeout, `:199` `not.toThrow`); fingerprint-match them to `logs/suite-red-inventory.md:192-197` and do **not** repair them. Any *new* red there is yours.
   - `git status --porcelain -- src/` **must be EMPTY**. Report the command and its output.
   - Report `uptime` before and after the battery. **Timeouts are suspect environment, not reds** (F-1167-2) — re-run once on a quieter box before calling one a failure.

## Firewall

**TOUCH-ONLY:**
- `e2e/cp04-lever.spec.ts`
- `tasks/runs/<your run report>.md`

**NO — do not touch, not even to "fix" something you can see is wrong:**
- **All of `src/**`.** The unlock gate is **shipped, ratified E1-release behaviour**; a cure that edits it reverses a merged release decision. If you believe `src/` is at fault, that is a **STOP and report**, not an edit.
- `e2e/release-build.spec.ts` — it is the CONTROL. Read it, import from it if you like, but do not modify it into agreement.
- `e2e/cp04-lever.spec.ts:117-127` (`'a plain boot remains inert'`) — virgin storage is its point.
- The eight `town-*-blender` specs and `src/assets/AdvanceStream.ts` / `src/town/TownTavernPilot.ts` — **open owner fork F-1167-1**.
- `e2e/bt-00-demolish.spec.ts`, `e2e/bt-01-tiers.spec.ts`, `e2e/night-light-doctrine.spec.ts`, `e2e/world-info-notes.spec.ts` — a different realign already shipped for those (F-1171-1).
- `playwright.config.ts`, `package.json`, `logs/suite-red-inventory*.{md,json}` — the inventory is a dated measurement; do not annotate it.
- `assets/**` — `git status --porcelain -- assets/` must be empty at the end.

## Self-check before you report

- [ ] Scope 1's expected-vs-actual pair is in the report **verbatim**, with `activeId`.
- [ ] The 2-green / 7-red split is confirmed or explicitly refuted.
- [ ] The (a)/(b) classification is stated, with the evidence that decided it.
- [ ] The owner-fork paragraph (scope 2) is written, and **no `src/` byte moved**.
- [ ] Mutation control: red-then-green, both outputs pasted, restore proven.
- [ ] `tsc` clean · `build` green (time stated) · `cp04-lever` all green both projects at `--workers=1` (worker count stated).
- [ ] `release-build` reds fingerprint-matched to the inventory lines, not repaired.
- [ ] `git status --porcelain -- src/` and `-- assets/` both empty, output pasted.
- [ ] `uptime` before/after the battery.
- [ ] Commit is path-scoped (`git add e2e/cp04-lever.spec.ts tasks/runs/...`), prefix `test:`. **Never `-A`.**

**READY-FOR-GATES** — report: the expected-vs-actual pair, the split verdict, the (a)/(b) classification, the owner-fork paragraph, the mutation control's two outputs, the full gate table with worker count and load, and any finding you had to stop on.
