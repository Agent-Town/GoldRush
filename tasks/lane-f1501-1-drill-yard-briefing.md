CODEX: model=gpt-5.6-sol effort=xhigh

# lane-f1501-1-drill-yard-briefing — the Drill Yard card is the only E1 contract that does not speak its own manifest

**FIRE-AUTHORED s1501 (attended review welcome).** Authored from a **ratified spec slice** (AP-11 §1,
`specs/agent-play/README.md:149`) plus a control-run measurement this fire took while draining
`f1496-1-drill-yard-fixture-six` (see §WHY). No design fork, no canon, no owner word — §WHY explains
precisely why the one plausible alternative cure is unavailable rather than merely unattractive.

ROLE: implementer on lane-a. WORKDIR: `worktrees/lane-a` (branch `lane/a`). Commit prefix `dyb:`.
Never touch STATUS.md, reviews/, tasks/queue/, tasks/goals.json, or other lanes.

---

## PRE-FLIGHT — DO THESE IN ORDER. STEP 1 IS MANDATORY AND UNCONDITIONAL.

**F-1465-2 exists because a master offered the refresh as a conditional and put a currency probe beside
it; the runner ran the probe first against a stale lane and truthfully reported a failure that was only
staleness. Refresh FIRST, probe SECOND, always.**

**STEP 1 — REFRESH (unconditional, run exactly this):**
```
git -C worktrees/lane-a fetch origin main
git -C worktrees/lane-a checkout -B lane/a origin/main
```
Safe and authorized: `node scripts/lane-usable.mjs --all` read lane-a **USABLE** (`ahead=0`,
`tracked-dirt=0`, run-surface byte-identical to main) at authoring time. It was **7 commits behind**,
which is exactly why this step is unconditional rather than optional.

**STEP 2 — CURRENCY PROBE (only after step 1). Must print `1`:**
```
grep -c "private renderTrainingGround(contract: ContractManifest): string {" src/town/TownScene.ts
```
If it prints `0`, someone has already changed the function this task exists to change — **STOP** and
report the tip you found and what that function looks like now. (s1501 verified this exact one-line key
returns `1` on main at authoring time, per F-1425-2: a key spanning a wrapped line matches nowhere,
including in the file it was copied from. This one visibly sits on a single line.)

**STEP 3 — CLEANLINESS:** `git -C worktrees/lane-a status --short` → must be clean.
> **FACTORY-CHURN EXCEPTION — these two tracked classes are ALWAYS EXPECTED and are NEVER a STOP; list them and proceed (F-1407-1):** (a) `logs/**` — the fire/runner accounting, rewritten every cycle by the factory itself; (b) `artifacts/**`, `reviews/shots-*` and any `.png` — regenerated evidence. ⓘ What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.

---

## READ FIRST (paths, in this order)

- `src/town/TownScene.ts`, **`renderTrainingGround()`** (opens at `:2279`) — the bespoke card you are
  changing. Read the whole method first. It renders `renderContractArt`, a topline, the name, the
  flavor line and the launch button, and **nothing else**.
- `src/town/TownScene.ts:2240–2262` — the **ordinary** contract-card path, for comparison. Note that it
  calls `renderContractBriefing(contract)` inside a `showDetails` branch. **This is your model; match its
  structure rather than inventing one.**
- `src/town/TownScene.ts`, **`renderContractBriefing()`** (`:3265`) — the function that emits the testid
  the acceptance test wants, at `:3282`. Read what it renders: an optional geography line, the mechanics
  line, then a **Goals** section and a **Rules** section.
- `e2e/agent-view.spec.ts`, the test **`the derived manifest rides THE VIEW and every E1 briefing speaks
  it`** (opens at `:297`; the failing assertion is the loop at `:348–:352`). **This is your acceptance
  test and you may NOT edit it** — see the FIREWALL for why that is the whole point.
- `assets/contracts/epoch-1-frontier/contracts.json`, contract `e1-drill-yard` — read its `briefing`
  block so you know what will appear on the card once you render it.

## WHY (evidence, quoted, dated, and measured this fire)

**The red, measured by s1501 with a control arm — not inherited.** Draining
`f1496-1-drill-yard-fixture-six`, both arms were run in the same shell within the hour, `--workers=1`:

| Arm | `e2e/agent-view.spec.ts` (+ `drill-yard-manifest.spec.ts`) |
|---|---|
| clean main, before the merge | **4 passed / 4 failed** — `:264` and `:297`, both projects |
| merged tree (`77a1b19b`) | **8 passed / 2 failed** — only `:297`, both projects |

So `:297` is a **main-side red that predates and outlives that slice**. Failure text, identical in both
arms and in both projects:

> `Error: expect(locator).toHaveText(expected) failed` · `Locator:
> getByTestId('contract-board-mechanics-e1-drill-yard')` · `Error: element(s) not found`

**The mechanism, by coordinate.** `TownScene.ts:2190` routes the training ground to
`renderTrainingGround()` (`:2279`). That method never calls `renderContractBriefing()` (`:3265`), which
is the only emitter of `contract-board-mechanics-<id>` (`:3282`). The ordinary card path (`:2253`) calls
it. `e1-drill-yard` is the only contract that reaches the board through the training-ground path, so it
is the only one whose card cannot satisfy the loop at `:349`.

**Why this is a spec violation and not a design fork — read this before proposing anything cleverer.**
The obvious alternative cure is to exempt the training ground from the test's loop. That option is
**closed by a ratified spec**, `specs/agent-play/README.md:149` (AP-11 §1), quoted verbatim:

> *"every contract carries a machine-readable mechanics declaration DERIVED FROM ITS OWN SIM DATA
> (never hand-authored): interactables present … their operations, the map's special rules …
> **It rides the briefing**, THE VIEW's stable prefix, and skill.md's per-contract section."*

The Drill Yard is a contract in `listContracts()`. Its briefing does not carry the manifest. Exempting it
would put the tree in contradiction with AP-11 §1, so there is no fork here to reserve for the owner —
only one lawful direction.

**The player-facing half (CLAUDE.md Mistake #10 — "where does the PLAYER see this in a plain boot?").**
Tavern → contract board: the Drill Yard is the only E1 card with no mechanics line. Worse, the copy it
is hiding **already exists and is already written** — `contracts.json` gives `e1-drill-yard` two goals
(*"Try every Frontier building."*, *"Practice on the straw men and rolling logs."*) and three rules
(*"Pull the assay-tent lever to top up practice gold."*, *"Ring the Drill Bell for one small wave."*,
*"Nothing in the yard enters the county ledger."*). Those three rules are the yard's entire tutorial, and
the card that teaches the game currently shows none of them. This is a card that hides its own
instructions.

## SCOPE — numbered, each item testable

1. **Make `renderTrainingGround()` render the contract briefing**, by calling
   `renderContractBriefing(contract)` — the same function the ordinary card uses. Place it inside
   `<div class="town-ui__contract-copy">`, after the flavor `<p>` and before the launch `<button>`,
   which is the ordinary card's own ordering. **Do not write a second, training-only briefing renderer
   and do not inline a copy of its markup** — one path, one function; a duplicate would drift the moment
   `renderContractBriefing` changes, which is exactly the failure this task is repairing.
2. **The acceptance test must go green**: `e2e/agent-view.spec.ts:297` passes on **desktop-chrome AND
   mobile-chrome**. It compares the rendered text to `mechanicsManifestLine(deriveMechanicsManifest(id))`
   **exactly**, so a paraphrase or a re-wrap will not pass.
3. **Gate it the way the ordinary card gates it, if a gate is needed at all.** The ordinary path renders
   the briefing only under `showDetails`; `e1-drill-yard` is `unlock: "default"` (always unlocked), so
   the plain call should suffice. If you find a gate is required for the locked-card case, mirror the
   ordinary path's condition rather than inventing a new one, and say so in your report.
4. **CSS only if a screenshot proves it is needed.** The briefing uses existing classes
   (`town-ui__contract-briefing`, `town-ui__contract-briefing-label`) that are already styled. If, and
   only if, your 390px screenshot shows the training card visibly broken — overflow, clipped text,
   collapsed layout — you may add a **narrowly scoped** rule under `.town-ui__training-card` in
   `src/town/town.css` (the training-ground block starts at `:546`). Attach the before/after screenshots
   that justify it. **No restyling of the shared briefing classes** — they are on 41 other cards.
5. **If the rendered mechanics line looks WRONG to you** — it names an interactable the yard does not
   have, or omits one it does — **do not fix it and do not adjust the card to hide it.** Report it as a
   finding with the field name. The derivation is not this task's variable, and touching it re-opens a
   question a fire has twice measured vacuous (`f1328-1`).

## FIREWALL

**TOUCH-ONLY:** `src/town/TownScene.ts`; `src/town/town.css` (scope item 4's narrow case only).

**NO — do not edit any of these, for any reason, even if you believe it would help:**
- `e2e/agent-view.spec.ts` — **this is the load-bearing prohibition.** The loop at `:348` is the
  acceptance test; excluding the training ground from it would turn the gate green while leaving the
  defect, and would contradict AP-11 §1 (see §WHY). A green bought by editing the assertion is the one
  outcome this task counts as a failure.
- `src/agent/MechanicsManifest.ts` and `e2e/fixtures/e1-mechanics-manifests.json` — the derivation and
  its byte-stable fixture landed at `77a1b19b` hours ago and are green. Editing either to flatter the
  card re-opens the owner question `f1328-1` reserves.
- `assets/contracts/**` — the yard's briefing copy is already correct and already authored; your job is
  to render it, not to rewrite it. (Its wording is separately flagged for the owner's eye as F-1432-4 —
  leave it alone.)
- `e2e/board-card-images.spec.ts`, `e2e/map-census.spec.ts` — the `toHaveLength(41)` census-count debt is
  carved out to `f1330-1-count-shaped-censuses` and is NOT yours, though it will be sitting right next
  to you.
- `logs/suite-red-inventory.md`, `STATUS.md`, `tasks/goals.json`, `tasks/queue/**`, `reviews/**`, other lanes.

## SELF-CHECK before you report

1. `npx tsc --noEmit` → clean.
2. `npm run build` → green.
3. **`npx playwright test e2e/agent-view.spec.ts --workers=1`, BOTH projects, report per project.**
   **Expect 8/8 desktop-chrome and 8/8 mobile-chrome.** ⓘ *That number is DERIVED, not inherited, and
   here is the derivation so you can check it yourself:* the spec holds 4 tests × 2 projects = 8; as of
   `77a1b19b` exactly one of them is red (`:297`) on each project; this task's cure addresses that
   test's only failure mode (the missing element). **This is the direct lesson of F-1501-2, in which the
   previous master inherited an "expect 8/8" from a finding that named two reds and cured one, and a
   perfectly good run therefore filed NOT READY-FOR-GATES.** If your numbers differ, **report them as
   they are** rather than rounding toward this expectation — and if `:297` still fails for a *different*
   reason (a text mismatch rather than a missing element), that is a FINDING for the desk, not a licence
   to widen your scope.
4. **Adjacent suites, enumerated from the tree rather than from this list** (a review's adjacent-suite
   list is perishable — F-1496 drain lesson): at minimum
   `npx playwright test e2e/town-t3-board.spec.ts e2e/board-card-images.spec.ts e2e/drill-yard-manifest.spec.ts --workers=1`,
   plus anything else `grep -rln "training-ground\|contract-board-briefing\|town-open-board" e2e/` turns
   up. Report pass/fail per project. **You are editing a shared town-board renderer; the adjacency is
   the point.**
5. **Screenshots, both viewports** — the Drill Yard card as the player sees it (tavern → contract
   board), desktop and 390px, to `reviews/shots-f1501-1/`. State in your report whether the three yard
   rules are legible at card scale. *(Precedent F-1332-2: `town.css:628` `object-fit: cover` crops
   plate art on desktop, so "legible" must be judged on the rendered card, not on the markup.)*
6. Zero console/page errors in the boot probes — the agent-view tests close on `expectNoConsoleErrors`,
   so a leak there will surface as a red rather than as a warning.
7. `git -C worktrees/lane-a status --short` → clean apart from the F-1407-1 churn classes.

**READY-FOR-GATES** — report: the commit sha; the per-project pass/fail counts from self-check 3 and 4;
whether you needed a CSS rule and the screenshot that justified it; the screenshot paths; whether the
rendered mechanics line matched the derivation exactly; and anything you found and did **not** fix, named
as a finding. If you stopped at any STOP above, report exactly which one and what you found — a truthful
stop is a good outcome and costs the factory far less than a green bought by editing an assertion.
