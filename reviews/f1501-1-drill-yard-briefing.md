# f1501-1-drill-yard-briefing — the Drill Yard card speaks its own manifest

- **Slice:** `f1501-1-drill-yard-briefing` (AP-11 §1, `specs/agent-play/README.md:149`)
- **Branch / tip:** `lane/a` @ `7cc08cf1bdb6d003ca85bb0ee3af12bf5d14a9fc` ("dyb: show the Drill Yard briefing")
- **Base at authoring:** `origin/main`; at drain the lane was **1 ahead / 12 behind**, merged three-way `--no-ff`
- **Merge:** see the drain commit below · **Drained by:** s1504 fire, 2026-08-07
- **Block check:** `node scripts/drain-block-check.mjs 20260806-233837-lane-f1501-1-drill-yard-briefing.md` → **✅ CLEAR** (`status="queued"`), run before any gating

## VERDICT: **MERGED** — with one merge-caused red, cured by a corrective authored and dispatched in the same fire (F-1504-1).

## What it does

`renderTrainingGround()` in `src/town/TownScene.ts` built the Drill Yard's board card by hand — art,
topline, name, flavour line, launch button — and stopped there. Every *other* E1 contract card runs the
ordinary path, which calls the shared `renderContractBriefing(contract)`; the training card was the sole
exception, so the one contract explicitly designed to teach the game was also the one contract whose card
refused to say what the game contains. AP-11 §1 requires the derived mechanics manifest to ride the
briefing, so this was a straightforward violation rather than a design question.

The cure is **one line**: `${renderContractBriefing(contract)}` inserted between the flavour paragraph and
the launch button, reusing the shared renderer rather than inventing a training-only variant. The runner
correctly found no unlock gate was needed (`e1-drill-yard` is `unlock: "default"`), and correctly declined
to invent one — the ordinary path's `showDetails` branch exists for lockable cards, which this is not.

The card grew taller, and at 390px it overlapped the board header. The runner added **five lines of CSS**
inside the existing mobile media query, scoped to `.town-ui__contract.town-ui__training-card` only
(`grid-template-rows: 120px auto; gap: 6px`), taking the card from ~652px to 618px. This respects the
master's item-4 constraint exactly: no shared briefing class was touched, so the other 41 cards are
untouched, and before/after screenshots justify it rather than asserting it.

## Evidence — all on the MERGED tree unless a row says otherwise

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **clean**, no output |
| `npm run build` | **green**, built in 1.86s (chunk-size advisory only, pre-existing) |
| **Own spec** `e2e/agent-view.spec.ts` `--workers=1` | **8 passed** (4 desktop-chrome + 4 mobile-chrome) — **exactly the count the master DERIVED**, not one inherited |
| Adjacent A: `drill-yard` + `drill-yard-manifest` + `drill-yard-station-art` + `contract-briefings` | run 1: **19 passed / 3 failed** · run 2 (identical command, same commit): **20 passed / 2 failed** |
| Adjacent B: `town-t3-board` + `board-card-images` + `board-era-chapters` + `board-gating-and-profiles` + `061-first-claim-onboarding` | **24 passed / 6 failed** — all 6 pre-existing, proved below |
| Console / page errors | **zero unsuppressed**; `agent-view` and `contract-briefings` both close on `expectNoConsoleErrors` and are green |
| Screenshots, both viewports | `reviews/shots-f1501-1/` — read and judged by eye, not by markup (F-1332-2) |

**Screenshot verdict, stated as a viewing rather than an inference:** on desktop the goals and rules sit
as two side-by-side panels under the manifest line, all three yard rules legible at card scale. At 390px
they stack, and the card still terminates in a fully visible "Enter the yard" button with no clipping and
no header overlap. The mechanics line renders in full on both.

### The two stable reds are mine, and they are the point of the corrective

`e2e/drill-yard.spec.ts:92` — `await expect(page.getByTestId('contract-board-briefing-e1-drill-yard')).toHaveCount(0);`
— fails on **both** projects, `Expected: 0 / Received: 1`. This assertion encodes the *absence* of the
briefing, i.e. exactly the defect AP-11 §1 forbids and this slice cures. It is stale by construction.

**Proved merge-caused rather than assumed:** a control run of that spec on the pre-merge commit
`bef7788c8` returned **4 passed**. The red appears only after the merge, which is the correct and
intended behaviour of a suite that had memorised the old shape.

The slice could not have fixed it: the master's firewall forbids editing `e2e/**`, and deliberately so —
"a green bought by editing the assertion is the one outcome this task counts as a failure." The runner
obeyed, reported the stale line, and stopped. That is the right call, and it leaves a real corrective
owed. **F-1504-1 below; authored and dispatched this fire.**

ⓘ **A prediction check worth recording, because two prior sessions disagreed about where this line is.**
s1502's handoff predicted the failure at `e2e/agent-view.spec.ts:297`; the runner reported
`e2e/drill-yard.spec.ts:92`; s1503's handoff warned the next fire to re-measure rather than inherit
either. Re-measured this fire by `grep -n`: **the runner's coordinate is exact** — `:92` in
`drill-yard.spec.ts` — and s1502's was the wrong file. The warning was right to be issued and the runner
was right on the facts.

### The third red in run 1 was noise, and the discriminator was a re-run

`e2e/contract-briefings.spec.ts:318` ("every current contract launch shows manifest briefing goals and
rules") failed on desktop-chrome in run 1 and **did not reproduce**: run 2 of the byte-identical command
on the same commit returned 20/2, and the spec **alone** returns **14 passed** (7 tests × 2 projects).
Three measurements, two of them green ⇒ noise, per the re-run-before-bisecting law. Not filed as a
finding; recorded here so the next fire that sees it once knows it has been chased.

### The six board-battery reds are pre-existing, proved by control AND recorded in the inventory

All six are the same assertion in one file: `e2e/061-first-claim-onboarding.spec.ts:74` —
`await expect(page.getByTestId('town-bark-speaker')).toHaveText('Marta Vale');` — a town NPC bark
speaker, with no causal path to a contract-card briefing. Plausibility is not evidence, so it was
measured: a detached control worktree at the **pre-merge** commit `bef7788c8` ran that spec and returned
**6 failed / 2 passed**, identical in count, assertion and line to the post-merge run. **Exonerated by
measurement.** The control worktree was removed cleanly, its `node_modules` symlink unlinked *first* so
nothing could follow it into main's tree.

The control was the right act regardless of the ledger, per F-1444-2 and its proof case F-1448-1, where
a spec that the inventory correctly reported KNOWN-RED turned out to be **merge-caused** on that
particular tree. Inventory membership is not exoneration; the matched control is what decides a merge.

## Merge classification

Base `origin/main`; three-way `--no-ff`, **no conflicts, no graft**. The lane was 12 behind, so a
two-dot diff would have read main's twelve commits as deletions — merged three-way, never off a diff.

| Path | Class | Note |
|---|---|---|
| `src/town/TownScene.ts` | LANE-TOUCHED | +1 line, inside `renderTrainingGround()`. Main moved this file since the lane's base, but not this function; `ort` merged clean. |
| `src/town/town.css` | LANE-TOUCHED | +5 lines inside the existing 390px media query. |
| `reviews/shots-f1501-1/*.png` (×5) | LANE-ONLY | new evidence files, no main-side counterpart. |

Both source paths are inside the master's TOUCH-ONLY list, and **nothing outside it was touched** — in
particular `e2e/agent-view.spec.ts`, `src/agent/MechanicsManifest.ts` and
`e2e/fixtures/e1-mechanics-manifests.json` are byte-unchanged, so the `f1328-1` question the firewall
reserves stays reserved.

## Findings

**F-1504-1 — `e2e/drill-yard.spec.ts:92` asserts the absence of the briefing this slice is required to
render. MERGE-CAUSED, BLOCKING-CLASS, CURED BY A CORRECTIVE DISPATCHED THIS FIRE.**
The assertion is not merely stale, it is *inverted*: it pins the card to the pre-AP-11 shape. The cure is
not to delete it — a deleted assertion tests nothing — but to invert it into a positive check that the
briefing is present and that its text equals the derivation, which is strictly more suite than the board
has today. Authored as `tasks/lane-f1504-1-drill-yard-stale-absence.md` and dispatched to lane-a. Until it lands,
`drill-yard.spec.ts:92` is red on main on both projects. ⓘ **Deliberately NOT hand-written into
`logs/suite-red-inventory.md`:** that file is the generated output of a full-suite run and its header
carries self-consistency assertions (438 rows parsed, reduction check 304/304, a positive control) that
a hand-inserted row would silently falsify. `red-inventory-lookup.mjs` correctly reports
`NOT-IN-INVENTORY` for this spec, which is the honest state. The red is recorded here, in the corrective
master, and in the s1504 handoff instead.

**F-1504-2 — `scripts/red-inventory-lookup.mjs` SHIPPED s1447 TO ANSWER "IS THIS RED ALREADY KNOWN?" IN
ONE SECOND, AND NO LAW SURFACE CITES IT — SO FIRES KEEP GREPPING THE INVENTORY AND GETTING FALSE ZEROES.
I nearly filed the opposite of this finding, and how that happened IS the finding.**

I asked whether the 061 reds were known by running
`grep -n "town-t3-board\|Marta Vale\|town-bark" logs/suite-red-inventory.md`. It returned **nothing**, and
my first draft of this review accordingly filed a finding titled *"CLEAN-IN-INVENTORY while 6 of its 8
tests are red"* — asserting a ledger gap and citing F-1503-3 as precedent for a pattern. **That was
false in every particular.** The inventory holds **9 rows** for `e2e/061-first-claim-onboarding.spec.ts:74`,
bucketed BOTH, with measured blast radius (24.1% and 66.7% of the spec unexercised behind it).

The grep could not have found them. The inventory's columns are *Spec file · Test title · Project ·
Failing file:line · First error line*, and its error column stores the **generic** matcher text
(`Error: expect(locator).toHaveText(expected) failed`) — the expected **value** `Marta Vale` appears
nowhere in the file, and neither does `town-bark`, because the testid is not a column either. I queried
by the two things I could see in my own terminal output and by a spec name (`town-t3-board`) that was
merely in the same battery. **A negative grep is not a negative result**, and here it was one keystroke
from becoming a fabricated finding against a ledger that was doing its job.

`node scripts/red-inventory-lookup.mjs e2e/061-first-claim-onboarding.spec.ts` returns **KNOWN-RED** with
all nine rows and their blast radii, instantly; the same tool returns **NOT-IN-INVENTORY** for
`e2e/drill-yard.spec.ts`, which is the correct and useful answer for my own new red. It was built for
exactly this question, after F-1436-2 measured that grepping ten cited coordinates against the inventory
returned **0 of 10** while the same ten by title returned **10 of 10**.

⚠️ **It is cited in `tasks/BACKLOG.md` prose and NOWHERE ELSE** — verified this fire by grepping
`.claude/skills/**`, `scripts/fire.md` and `CLAUDE.md`: **zero hits in all three**. That is the
shipped-cure-is-inert-until-a-law-cites-it shape: the tool works, the tool is correct, and the two fires
since have both reached for `grep` anyway. s1503 paid a control worktree for `e9-roster` — which the
lookup would have confirmed as genuinely absent (**NOT-IN-INVENTORY**, verified this fire, so F-1503-3
stands) — and I paid one here for a spec the ledger already knew.

**Non-blocking. REC: one line in `.claude/skills/drain/SKILL.md`'s adjacent-suite step naming
`red-inventory-lookup.mjs` as the way to ask, with the standing caveat from F-1444-2 that KNOWN-RED is
a starting point and never an exoneration. Cheapest fire-authorable item this fire produced.**
🚫 Do not cure it by re-running the whole inventory, and do not read this finding as a complaint about
the ledger — the ledger was right and the query was wrong.

**F-1501-4 CONFIRMED, NOT RE-FILED — the card now says "straw mans", and its gate has just opened.**
s1501 filed this ahead of the slice precisely so that the runner reporting it would be confirming a known
thing rather than raising an alarm; the mechanism worked as designed. The manifest line reads
*"…rolling logs, straw mans, drill wave…"* in both screenshots, from a naive de-slugger over
`straw_man` ×3. Its BACKLOG gate reads "fire-authorable **after f1501-1 merges**" — **that condition is
satisfied as of this merge**, and its recommendation (fix at render time in `mechanicsManifestLine`,
leaving the byte-stable fixture untouched, sweeping all 42 lines) still holds. Not authored this fire:
one authored master per fire, and F-1504-1 has a red main behind it while this is cosmetic.

## Player-visible?

**Yes** — this is the answer to Mistake #10's question. In a plain boot with no `?debug`: enter town →
open the contract board → the Drill Yard card now carries its geography line, its mechanics manifest, two
goals and three rules. Before this merge the tutorial contract was the only card that showed a player
nothing about what it teaches. A gazette item is owed and was appended this fire; deploy runs.
