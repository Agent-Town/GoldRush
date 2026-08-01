# lane-c — F-1324-1: the charter fuzz rig is not total over its own mutation space (whole-suite collection is at ZERO)

**FIRE-AUTHORED (attended review welcome)** — s1324, 2026-08-01.
**Supersedes** `tasks/lane-c-f1323-2-charter-fuzz-briefing-undefined.md` (retained on disk, Retention Law). That
master's scope 1 was **correct and it worked** — the runner obeyed the STOP and came back with the root. This
master acts on that answer, and **corrects three of its premises** which s1324 measured false. Read the
supersession notes in §WHY before re-reading the old master, or you will re-inherit the errors.

**Role:** Codex runner, lane-c. **Workdir:** `worktrees/lane-c` (branch `lane/e2-arsenal`).

## READ-FIRST (paths, in this order)

1. `e2e/charter-press.rig.ts` — the rig. `charterMutants()` is the stream builder; `applyMutation()` holds the
   13-entry `menu` array. The two symbols that collide are the arm returning `'illegal:missing-briefing'`
   (it does `delete contract.briefing`) and the arm returning `'blank:briefing.goal'` (it dereferences
   `contract.briefing.goals`). **Cited by symbol, not by line — s1323's master cited `:70` and the coordinate
   is already load-bearing in three other documents.**
2. `e2e/cp02-charter-boot.spec.ts` — the caller. Its **module-scope prologue** (`const E1 = listContracts(...)`
   then `for (const mutant of charterMutants(E1, FUZZ_COUNT))`) runs at COLLECTION time, above the first
   `test(...)`. That is why a collection failure takes the whole file dark rather than reddening one test.
3. `e2e/cp02-charter-stamp.spec.ts` — the other caller, same stream, same seed.
4. `scripts/whole-suite-collection.test.mjs:33` (**"whole suite collects without loading Vite-only modules"**)
   — the guard that reds. It runs `npx playwright test --list` and asserts exit 0.
5. `reviews/pc-01b-drill-yard-parity.md` § F-1323-2 — the original measurement.
6. `tasks/runs/20260801-100848-lane-c-lane-c-f1323-2-charter-fuzz-briefing-undefined.md.log` — the STOP report
   that identified the root. Its conclusion is **confirmed**; do not re-derive it.

## WHY (evidence, dated — verify it, do not re-argue it)

### The root (CONFIRMED by s1323's runner, re-confirmed by s1324)

`charterMutants` applies **1 or 2** mutations to the same charter (`mutations = 1 + Math.floor(rng() * 2)`), and
each step picks from the 13-arm menu **independently, with no memory of what earlier steps did**. When step 0
picks `illegal:missing-briefing` (which `delete`s `contract.briefing`) and step 1 picks `blank:briefing.goal`
(which reads `contract.briefing.goals`), the read throws:

```
TypeError: Cannot read properties of undefined (reading 'goals')
```

This is **mutation-arm composition inside the rig**. It is NOT malformed contract data, NOT a Node-vs-Vite
loader difference, and NOT `importContract()` dropping a field. Those three hypotheses are **spent** — s1323
falsified the first two by reading all 42 contracts and `CharterSchema.ts`, and s1324 falsified the third below.

### THREE CORRECTIONS to the superseded master — each measured, each changes what you should do

**⚠️ CORRECTION 1 — IT IS NOT "PRE-EXISTING". IT IS MERGE-CAUSED, AND THE MERGE WAS s1323's OWN DRAIN 1.**
The old master and the goal leaf both state *"Pre-existing, proven by a detached-worktree control at `5f81a36d`
before either s1323 merge."* **That control does not support the claim.** s1324 re-ran it at exactly
`5f81a36d`, unpatched, in a detached worktree:

| tree | `npx playwright test --list` | exit |
|---|---|---|
| `5f81a36d` (before the Drill Yard merge) | **`Total: 2462 tests in 348 files`** | **0** |
| current `main` (after `7e93be3d`) | **`Total: 0 tests in 0 files`** | **1** |

The crash does **not** reproduce at the control. `git log -S"e1-drill-yard"` puts the contract's arrival at
`f0bf5251` — the lane-b Drill Yard runner commit, which reached main inside `7e93be3d`.

**The mechanism is the interesting part, and it is why this will happen again.** Template selection is
`templates[Math.floor(rng() * templates.length)]`. Adding `e1-drill-yard` to `epoch-1-frontier` changed
`templates.length`, which **re-rolled the entire seeded stream from the first draw onward**. The observable
signature is in the collected test names: at `5f81a36d` mutant 12 is `[e1-night-shift]`, on main it is
`[e1-dry-gulch]`. The rig's latent composition bug is old (the file was last touched `2ce1a2ca`, 2026-07-17);
the **red** is eight hours old. ➡️ **Therefore any future merge that adds or removes a contract from any epoch
can resurrect this crash at a new index. Curing index 41 alone is not a cure — see scope 2.**

**⚠️ CORRECTION 2 — IT IS NOT NODE-ONLY, AND THE BLAST RADIUS IS THE WHOLE E2E SUITE, NOT 3 TESTS.**
The old master says *"this crash appears only under the node collection guard, never in a normal playwright
run"* and builds its remaining hypothesis on that. **False.** s1324 ran plain playwright on main:

- `npx playwright test e2e/cp02-charter-boot.spec.ts --list --workers=1` → the same TypeError, then
  `Error: No tests found.` / `Total: 0 tests in 0 files`.
- `npx playwright test --list --workers=1` (whole suite) → `Total: 0 tests in 0 files`.

So the honest severity is **not** "3 of 209 node-guard tests are red". It is: **both CP-02 specs currently
contribute ZERO tests to every run, and whole-suite collection on main is at zero — down from 2462.** The
`whole-suite-collection` guard is the only instrument standing between the factory and a silent 2462→0
collapse, and it is doing exactly its job. ⓘ **Targeted runs are UNAFFECTED** — `npx playwright test
e2e/safari-swap.spec.ts --list` still returns `Total: 4 tests in 1 file`, because playwright's file filter is
applied before load. That is why drain gates, which always name their specs, kept passing and nobody saw this.

**⚠️ CORRECTION 3 — THE OLD MASTER'S FORBIDDEN FIX IS THE FILE'S OWN IDIOM, AND THE PROHIBITION AS WRITTEN IS
TOO BROAD.** Scope 2 of the superseded master forbids `if (!contract.briefing) return 'noop';` as the primary
cure, on the grounds that it "would green the guard by deleting a fuzz mutation arm". **The instinct is right
and the rule as written is wrong.** Three of the thirteen arms in this same `menu` already do precisely this:
two do `if (!leaf) return 'noop';` and one does `if (!zones || zones.length === 0) return 'noop';`.
`return 'noop'` is the file's established way of saying *this arm's target is not present in this charter*, and
`noop` mutants are ordinary and stamp fine (mutants 12, 36 and 52 carry the bare label `noop` in today's
collected output). A guard clause here does **not** delete the arm: the arm still fires for every charter that
has a briefing, which is every first-mutation and all but the small minority of second-mutations that follow a
`missing-briefing`. ➡️ **The real requirement is not "no guard clause". It is: the arm must still FIRE when the
briefing exists, and that must be asserted, not asserted-by-vibes.** Scope 3 makes that checkable.

### The one thing that is already settled, so you do not spend a run on it

s1324 instrumented the rig in a throwaway detached worktree (`try/catch` + a `S1324CRASH` line, never committed)
and ran the full 200-mutant stream to completion. **There is exactly ONE crash in the whole stream:**

```
S1324CRASH index=41 template=e1-drill-yard step=1 prior=[illegal:missing-briefing] err=Cannot read properties of undefined (reading 'goals')
```

With that single crash neutralised, `cp02-charter-boot.spec.ts` collects **18 tests in 1 file** (9 per project ×
2 projects). **So a correct fix to the one reading arm is sufficient to clear the red — there is no second
crash waiting to produce another STOP.** Do not spend a run re-finding this.

## SCOPE (numbered; each item testable)

1. **Cure the composition, in the rig, in `applyMutation`.** The reading arm must tolerate a briefing that an
   earlier step deleted, using the file's existing `return 'noop'` idiom and matching the surrounding style.
   The shape s1324 expects (you may improve on it, but say so if you do):

   ```ts
   () => {
     const goals = contract.briefing?.goals;
     if (!goals || goals.length === 0) return 'noop';
     goals[Math.floor(rng() * goals.length)] = '   ';
     return 'blank:briefing.goal';
   },
   ```

   Add a one-line dated comment saying why the guard is there (composition with `illegal:missing-briefing`).
   **Do NOT** reorder the menu, change the seed, change `FUZZ_COUNT`, or make step 1 aware of step 0's label —
   any of those re-rolls the stream, which is the very mechanism that caused this.

2. **Make the rig TOTAL over its mutation space — this is the actual deliverable, not step 1.** A fuzz rig that
   can throw is a rig that takes its callers dark, and correction 1 proves the trigger is a contract-count
   change that any future merge can make. Add a guard that fails if **any** composition of arms throws, rather
   than one that only checks today's seed. Either mechanism is acceptable:
   - **(a) preferred** — a test that drives every ordered PAIR of menu arms against a fresh charter and asserts
     none throws. This needs the arms addressable; if you export a test-only handle to do it, keep the public
     surface unchanged for the two specs and say what you exported.
   - **(b) acceptable** — a test that runs `charterMutants(templates.slice(0, k), N)` for **every** `k` from 1
     to `templates.length` with `N ≥ 500`, asserting no throw. This directly exercises the "template count
     changed" mechanism and would have caught index 41 before the Drill Yard merged.

   State which you chose and why. **If you pick (b), say what it does NOT cover** — it samples streams, it does
   not prove totality.

3. **Prove the arm still FIRES — bidirectionally.** A guard clause that silently swallows the arm is the failure
   the superseded master was afraid of, so assert both directions: a charter WITH a briefing must still produce
   the `blank:briefing.goal` label (and the goal must actually be blanked), and a charter whose briefing was
   deleted must produce `noop` rather than throwing. **Both assertions, or scope 3 is not done.**

4. **Prove the cure with a mutation, at its own birth commit.** Revert your fix → show the red; restore → show
   the green. Report the **sha256 of `e2e/charter-press.rig.ts` before and after** to prove byte-exact
   restoration. A cure whose red you have not personally seen is not proven. Do the same for the scope 2 guard:
   **re-introduce the composition bug and show your new guard goes RED** — a passing guard never executes its
   violation path, so its green says nothing about whether it can catch anything.

5. **Verify the stream is unchanged where it existed, and report where it is new.** The stream past index 41
   **never existed on main** (the run died there), so there is nothing to preserve after it — but indices 0–40
   must be untouched. Checkable prediction from s1324's instrumented run: with the cure in place,
   `cp02-charter-boot.spec.ts --list` must still name **mutant 6 `[e1-twin-banks]` (legal:rename)**, **mutant 10
   `[e1-baron]` (legal:rename)**, **mutant 12 `[e1-dry-gulch]` (noop)** and **mutant 25 `[the-claim]`
   (perturb:tileParams.lanes.territoryRingBiasWaves + legal:rename)**. If any of those four changes, your fix
   moved the stream and you must say so loudly before anything else.

6. **Report the numbers honestly, and DERIVE every denominator.**
   - `npx playwright test --list --workers=1` → report the exact `Total: N tests in M files` line. **Expect it
     to be back in the thousands** (s1324 measured 2462/348 at `5f81a36d`; main has moved since, so a different
     number is not a defect — *an unexplained one is*, and **0 is a failure**).
   - `cp02-charter-boot.spec.ts --list` → expect **18 tests in 1 file**.
   - Full `test:node-guards`: read the file list out of `package.json` → `scripts["test:node-guards"]`
     **programmatically**, never by retyping it, and state how many files you ran. Report `# tests / # pass /
     # fail` from a TAP reporter. s1323 measured **209 tests / 3 fail** on main; s1323 also measured that
     omitting a single file silently moves the denominator to 208.
   - **All three reds should clear together** — they share one root (`collection-guards-cwd-invariance` and
     `fixture-teardown` each report `whole-suite-collection`'s child failure as their own). **If only one
     clears, say so: that falsifies the one-root finding and is a more valuable report than a green.**

## FIREWALL

**TOUCH-ONLY:** `e2e/charter-press.rig.ts` · `e2e/cp02-charter-boot.spec.ts` / `e2e/cp02-charter-stamp.spec.ts`
(**only** to add the scope 3 assertions — never to relax an existing one) · **one new test file** for scope 2 if
you choose to add one.

**NO:** `assets/contracts/**` and `src/meta/ContractFamilies.ts` — the data is proven correct (42/42 carry
`briefing.goals`); the Drill Yard contract is **not** at fault and must not be removed or reordered to make the
stream go back — that would "fix" this by deleting a shipped feature from the board · `src/charter/**` —
`importContract` is exonerated · `scripts/whole-suite-collection.test.mjs`,
`scripts/collection-guards-cwd-invariance.test.mjs`, `scripts/fixture-teardown.test.mjs` — **these are the
instruments reporting the problem; editing them is how you would hide it** · `playwright.config.ts` — the
`workers: isFireShell` line is load-bearing law (§3.1) · any `tasks/**` or `reviews/**` bookkeeping · the
`bt-01-tiers` reds (F-1323-5) and the `m2-03-wave-scheduler` knee-budget red (F-1323-3) — both **measured
pre-existing with controls on record**, and **not yours**.

⚠️ **If you add a new npm script for scope 2, it must be rooted in an existing gate** (`test:node-guards` or a
caller of it) or `gate-caller-audit` will red on an un-rooted gate. Prefer adding your file to the existing
`test:node-guards` list over inventing a new script.

## SELF-CHECK (name the exact commands)

- `npx tsc --noEmit` — clean.
- `npm run build` — green.
- `npx playwright test --list --workers=1` — **exit 0, `Total:` in the thousands, not 0.**
- `node --test --test-reporter=tap scripts/whole-suite-collection.test.mjs scripts/collection-guards-cwd-invariance.test.mjs scripts/fixture-teardown.test.mjs` — all three green.
- Full node-guards set (file list read from `package.json`, all 37 files — do not hand-retype a shorter one).
- `npx playwright test e2e/cp02-charter-boot.spec.ts e2e/cp02-charter-stamp.spec.ts --workers=1` — green, both
  projects. **`--workers=1` is mandatory** (§3.1: at default workers the fire shell's CPU ceiling manufactures
  reds; a red seen at default workers is not evidence until it reproduces at `--workers=1`).
- Zero console/page errors.
- No screenshots owed — nothing here renders.

**READY-FOR-GATES** + report: the scope 2 mechanism you chose and what it does not cover; the two mutation reds
you personally saw (cure + guard) with before/after sha256; the `Total: N tests in M files` line; the TAP
`# tests / # pass / # fail`; whether the four named mutants (6, 10, 12, 25) are unchanged; and whether all three
node-guard reds cleared together or only one.
