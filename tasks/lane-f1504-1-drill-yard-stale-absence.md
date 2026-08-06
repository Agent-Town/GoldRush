CODEX: model=gpt-5.6-sol effort=xhigh

# lane-f1504-1-drill-yard-stale-absence — the yard's own spec still asserts the briefing is absent

**FIRE-AUTHORED s1504 (attended review welcome).** Authored from a **merge-caused red measured this
fire** while draining f1501-1-drill-yard-briefing (merge abcfffb88127640c1709d6ec37033e84f9106ced,
review reviews/f1501-1-drill-yard-briefing.md, F-1504-1), against a **ratified spec slice** (AP-11 §1,
specs/agent-play/README.md:149). No design fork, no canon, no owner word. The scope is small on purpose
and the reasoning for its exact shape is in §WHY — read that before you widen it.

ROLE: implementer on lane-a. WORKDIR: worktrees/lane-a (branch lane/a). Commit prefix `dysa:`.
Never touch STATUS.md, reviews/, tasks/queue/, tasks/goals.json, or other lanes.

---

## PRE-FLIGHT — DO THESE IN ORDER. STEP 1 IS MANDATORY AND UNCONDITIONAL.

**STEP 1 — REFRESH (unconditional, run exactly this):**
```
git -C worktrees/lane-a fetch origin main
git -C worktrees/lane-a checkout -B lane/a origin/main
```
Safe and authorized: lane-a's only unmerged commit was f1501-1's, and this fire merged it at
abcfffb88127640c1709d6ec37033e84f9106ced before writing this master, so the branch holds nothing main
has not absorbed. Refresh FIRST, probe SECOND, always (F-1465-2).

**STEP 2 — CURRENCY PROBE (only after step 1). Must print `1`:**
```
grep -c "await expect(page.getByTestId('contract-board-briefing-e1-drill-yard')).toHaveCount(0);" e2e/drill-yard.spec.ts
```
If it prints `0`, someone has already changed the assertion this task exists to change — **STOP** and
report the tip you found and what that line looks like now. (s1504 verified this exact one-line key
returns 1 on main after the merge, per F-1425-2: a key spanning a wrapped line matches nowhere. This one
visibly sits on a single line.)

**STEP 3 — PREDECESSOR GATE. Must print `2`:**
```
grep -c '${renderContractBriefing(contract)}' src/town/TownScene.ts
```
ⓘ *The expected number is **2**, and here is the derivation so you can check it rather than inherit it
(F-1501-2).* The shared renderer now has **two** call sites: `:2253`, the ordinary contract-card path
inside its `showDetails` branch, which predates this ladder entirely; and `:2302`, the training-card call
that f1501-1 added. s1504 measured both against `origin/main` — the exact ref STEP 1 checks out — after
the merge landed.

- **If it prints `1`**, only the ordinary path is present: **f1501-1 is not on your base**, this task's
  premise does not hold, and the assertion in STEP 2 is *correct* rather than stale. **STOP** and say so.
- **If it prints `0`**, something larger is wrong with the board. **STOP** and report what you found.

**STEP 4 — CLEANLINESS:** `git -C worktrees/lane-a status --short` → must be clean.
> **FACTORY-CHURN EXCEPTION — always expected, never a STOP; list them and proceed (F-1407-1):**
> (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*` and any `.png`. What still STOPs: modified
> tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.

---

## WHY (evidence, quoted and dated)

Until 2026-08-07 the Drill Yard's board card was the only E1 contract card that never called
`renderContractBriefing`, so it showed the player nothing about what the tutorial teaches. AP-11 §1
requires the derived manifest to ride the briefing; f1501-1 cured it with one line and merged this fire.

`e2e/drill-yard.spec.ts` was written against the *old* shape. Its test
**"plain boot keeps the Drill Yard visible and launchable on both sides of the welcome"** asserts at
`e2e/drill-yard.spec.ts:92` that the briefing element has count **0** — i.e. it pins the card to the
pre-AP-11 behaviour. Measured at drain, both projects: `Expected: 0 / Received: 1`. A control run of the
same spec at the pre-merge commit bef7788c8 returned **4 passed**, so this red is merge-caused and the
assertion is stale by construction rather than by neglect.

f1501-1 could not fix it: its firewall forbade editing `e2e/**`, and deliberately — in its own words,
"a green bought by editing the assertion is the one outcome this task counts as a failure." Its runner
obeyed and reported the line. That was the correct outcome and it is why this corrective exists as a
separate, deliberate act rather than as a quiet edit inside the slice.

⚠️ **The distinction that governs your scope:** f1501-1 was forbidden to touch its own acceptance test
because doing so would have hidden a defect. You are doing the opposite — the *code* is now correct per
a ratified spec, and the *test* records a superseded expectation. Changing it is legitimate only because
the change makes the assertion say something **truer and stronger**, never merely quieter.

## SCOPE — numbered, each item testable

1. **Invert the stale assertion at `e2e/drill-yard.spec.ts:92`**, in the test titled
   "plain boot keeps the Drill Yard visible and launchable on both sides of the welcome". It must assert the briefing is
   **present** (count 1), not absent. **Deleting the line is NOT acceptable** — a deleted assertion
   tests nothing, and the board would lose its only plain-boot check that the tutorial card briefs.

2. **Make it stronger than a presence check, and derive the expectation rather than hardcoding copy.**
   Assert that the briefing contains **every** rule the contract manifest authors for the yard. The
   spec already imports `loadEpoch` from `../src/meta/ContractFamilies` (used at `:23` to build
   `E1_CLAIM_COUNT`), so read the yard's `briefing.rules` from there and assert each one appears. Do
   **not** paste the three rule strings as literals: that copy is separately flagged for the owner's eye
   (F-1432-4) and a literal would break the moment the owner rules on it.

3. **Do not duplicate what `agent-view` already covers.** The manifest text itself is asserted by the
   test **"the derived manifest rides THE VIEW and every E1 briefing speaks it"** at
   `e2e/agent-view.spec.ts:348`, which compares every E1 card's mechanics line to
   `mechanicsManifestLine(deriveMechanicsManifest(id))` exactly. Adding a second copy of that check here
   buys nothing and creates two places to update. Presence plus rules is the right increment.

4. **Change nothing else in the file.** The neighbouring assertions — the chapter card count of 0, the
   training-ground text, the `data-training-ground` attribute, the flavour text, the "Enter the yard"
   button label, and the `contract-best-e1-drill-yard` count of 0 at `:93` — are all still correct and
   all still passing. If any of them fails for you, that is a FINDING, not a licence to edit it.

5. **If you find the briefing renders but a rule is missing from it**, do not adjust the assertion to
   pass. Report it — that would mean f1501-1 or the contract data is wrong, which is worth a fire's
   attention and is not yours to paper over.

## FIREWALL

**TOUCH-ONLY:** `e2e/drill-yard.spec.ts`.

**NO — do not edit any of these, for any reason, even if you believe it would help:**
- `src/town/TownScene.ts` and `src/town/town.css` — f1501-1 merged hours ago and is green. This task is
  a test correction; if you find yourself editing the renderer, your premise is wrong — STOP and report.
- `e2e/agent-view.spec.ts` — f1501-1's acceptance test, green at 8/8. Not yours.
- `src/agent/MechanicsManifest.ts`, `e2e/fixtures/e1-mechanics-manifests.json` — the derivation and its
  byte-stable fixture. Editing either re-opens the owner question f1328-1 reserves.
- `assets/contracts/**` — the yard's briefing copy is authored and separately flagged (F-1432-4).
- ⚠️ **`mechanicsManifestLine` and the "straw mans" wording.** The card now visibly prints
  "straw mans" from a naive de-slugger. That is **already filed as F-1501-4** with its own gate and its
  own recommendation (fix at render time, sweep all 42 lines). It is NOT this task. Report it if you
  like — you will be confirming a known thing — but do not fix it here.
- `logs/suite-red-inventory.md`, `STATUS.md`, `tasks/goals.json`, `tasks/queue/**`, `reviews/**`,
  other lanes.

## SELF-CHECK before you report

1. `npx tsc --noEmit` → clean.
2. `npm run build` → green.
3. **`npx playwright test e2e/drill-yard.spec.ts --workers=1`, BOTH projects. Expect 4/4 total
   (2 tests × 2 projects).** ⓘ *That number is DERIVED, not inherited:* the file holds exactly two
   `test(` calls, at `:67` and `:112`; both were green on the pre-merge control and exactly one of them
   is red today, on each project, for exactly the assertion you are fixing. If your numbers differ,
   **report them as they are** rather than rounding toward this expectation (F-1501-2).
4. **Prove your new assertion is load-bearing rather than merely green** (the s1299/s1301 standard: a
   passing assertion never executes its violation path). Temporarily revert f1501-1's one line in
   `src/town/TownScene.ts` in your working tree, re-run the spec, confirm your new assertion **FAILS**,
   then restore the line and confirm the file is byte-identical to `origin/main`. Report both results
   and the restore. **Do not commit the probe.**
5. **Adjacent suites, enumerated from the tree rather than from this list** — at minimum
   `npx playwright test e2e/agent-view.spec.ts e2e/drill-yard-manifest.spec.ts e2e/drill-yard-station-art.spec.ts e2e/contract-briefings.spec.ts --workers=1`,
   plus anything else `grep -rln "drill-yard\|contract-board-briefing" e2e/` turns up that you judge
   relevant. Report pass/fail per project. ⓘ **Two known reds you may hit and should NOT chase:**
   `e2e/061-first-claim-onboarding.spec.ts:74` — in the test titled
   "fresh profile gets first-claim guidance, launch sets the per-profile done flag, and second town entry is quiet"
   and two siblings — is KNOWN-RED on both projects (6 of its 8 tests,
   pre-existing, control-proven this fire), and `e2e/contract-briefings.spec.ts` produced one
   non-reproducing desktop red under load at s1504 that was green in isolation and on a re-run. Confirm
   with `node scripts/red-inventory-lookup.mjs <spec>` before spending time on any red.
6. Zero console/page errors — `drill-yard.spec.ts` closes on `expectNoConsoleErrors`, so a leak surfaces
   as a red rather than a warning.
7. **No screenshots required.** Nothing renders differently; f1501-1 already banked the card at both
   viewports in `reviews/shots-f1501-1/`. Say so in your report rather than generating duplicates.
8. `git -C worktrees/lane-a status --short` → clean apart from the F-1407-1 churn classes.

**READY-FOR-GATES** — report: the commit sha; the per-project pass/fail counts from self-check 3 and 5;
**the result of the load-bearing probe in self-check 4, including confirmation that you restored
`TownScene.ts` byte-identically**; how you derived the rules list; and anything you found and did **not**
fix, named as a finding. If you stopped at any STOP above, report exactly which one and what you found —
a truthful stop is a good outcome and costs the factory far less than a green bought by weakening an
assertion.
