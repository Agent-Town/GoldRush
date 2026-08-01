# lane-c — F-1323-2: the charter fuzz rig reads `briefing.goals` off an undefined briefing

**FIRE-AUTHORED (attended review welcome)** — s1323, 2026-08-01.

**Role:** Codex runner, lane-c. **Workdir:** `worktrees/lane-c` (branch `lane/e2-arsenal`).

## READ-FIRST (paths, in this order)

1. `e2e/charter-press.rig.ts` — the rig. Line **70** is the failing site; `charterMutants()` at `:35` builds the mutant stream.
2. `src/charter/CharterSchema.ts:45-62` — `importContract()`, which is what produces `charter.contract`.
3. `src/meta/ContractFamilies.ts:870` — `listContracts()`, the source of the templates array.
4. `e2e/cp02-charter-boot.spec.ts` — the caller. Read its **module-scope prologue**: the `const E1 = listContracts('epoch-1-frontier')` binding and the `for (const mutant of charterMutants(E1, FUZZ_COUNT))` loop above the first `test(...)`. That loop runs at **collection time**, which is why a node collection guard trips it and a normal playwright run does not. (Cited by symbol, not by line: there is no test title at those lines, and the coordinate would decay.)
5. `scripts/whole-suite-collection.test.mjs:33` — the guard that reds.
6. `reviews/pc-01b-drill-yard-parity.md` § F-1323-2 — the measurement this task exists to act on.

## WHY (evidence, dated — do not re-argue it, verify it)

`npm run test:node-guards` reds **3 of 209** tests, and s1323 measured that **all three share one root**:
`scripts/whole-suite-collection.test.mjs` fails, and `collection-guards-cwd-invariance` and `fixture-teardown`
each report *its* child failure as their own. One defect presenting as three reds.

The failure, reproduced **deterministically 2/2 runs** by s1323 on main:

```
TypeError: Cannot read properties of undefined (reading 'goals')
   at charter-press.rig.ts:70
>  70 |  contract.briefing.goals[Math.floor(rng() * contract.briefing.goals.length)] = '   ';
```

**Pre-existing, established by control:** it reproduces at the same line on a detached worktree at `5f81a36d`,
before either of s1323's merges. The rig is untouched by them and was last modified at `2ce1a2ca` (2026-07-17).

**Two hypotheses have already been falsified — do not re-run these, they are spent:**

1. *"a contract lacks `briefing.goals` in the data"* — **FALSE.** s1323 read all ten epoch bundles:
   **42 contracts, 0 lacking `briefing.goals`.**
2. *"`importContract()` drops `briefing`"* — **FALSE on its face.** `CharterSchema.ts:60` is
   `contract: structuredClone(contract)`, which carries every own enumerable property.

So the templates array handed to `charterMutants` is the remaining suspect, and the **strongest single clue is
the environment**: this crash appears only under the *node* collection guard, never in a normal playwright run,
and the guard's own name is *"whole suite collects without loading Vite-only modules."* `listContracts()` →
`loadEpoch(epochId).contracts` may well resolve to a different (or partially-loaded) object under node than
under vite. **That is a hypothesis, not a finding — scope 1 exists to settle it by observation.**

## SCOPE (numbered; each item testable)

1. **OBSERVE THE DEFECT — this is a STOP.** Reproduce the red, then print, at the moment of failure:
   the templates array's **length**, and for each template its `id` and `typeof template.briefing`. Identify
   **exactly which template** has an undefined `briefing` and **why** (missing from the loaded object? a
   different code path under node? a synthetic/upcoming entry?). **Write the answer into your report before
   changing one line of source.** If the templates array turns out to be fine and the undefined arises
   elsewhere, **STOP and report that** — the cure below would then be aimed at the wrong subject.
2. **Cure the ROOT you found in scope 1, not the symptom at line 70.** Explicitly: adding
   `if (!contract.briefing) return 'noop';` at `:69` is **FORBIDDEN as the primary fix** — it would make the
   guard green while silently deleting one of the fuzz rig's mutation arms, which is the
   *loosening-a-guard-to-pass* failure this factory keeps naming. If, after scope 1, a guard clause is genuinely
   the correct fix (e.g. the template legitimately has no briefing), it must be accompanied by an assertion that
   the arm still fires for templates that DO have one, plus a one-line dated comment saying why.
3. **Prove the cure with a mutation, at its own birth commit.** Revert your fix, show the red; restore, show the
   green; report the **sha256 of the changed file before and after** to prove byte-exact restoration. A cure
   whose red you have not personally seen is not proven.
4. **Verify the blast radius is what you think.** After the cure, `charterMutants` must produce the **identical
   mutant stream** it did before for any templates array that already worked — the rig's whole contract is
   determinism from `CHARTER_FUZZ_SEED` (`charter-press.rig.ts:5-8`). If your fix changes which templates are
   picked or how many, say so loudly; that would change what `cp02-charter-stamp` and `cp02-charter-boot`
   actually test.
5. **Report the guard count honestly.** Run the full `test:node-guards` set and report `# tests / # pass / # fail`
   from a TAP reporter. Expect **209 tests**. If your cure fixes the root, expect all three reds to clear
   together — they share one cause. **If only one clears, say so; that means the "one root" finding was wrong.**

## FIREWALL

**TOUCH-ONLY:** `e2e/charter-press.rig.ts` · `src/charter/CharterSchema.ts` · `src/meta/ContractFamilies.ts`
(only if scope 1 proves the root is there) · `e2e/cp02-charter-boot.spec.ts` / `e2e/cp02-charter-stamp.spec.ts`
(only to assert the cure, never to relax an assertion).

**NO:** `assets/contracts/**` — the data is proven correct (42/42 carry `briefing.goals`); editing it would be
curing a symptom in the wrong file · `scripts/whole-suite-collection.test.mjs`,
`scripts/collection-guards-cwd-invariance.test.mjs`, `scripts/fixture-teardown.test.mjs` — **these are the
instruments; do not edit the thing that is reporting the problem** · `src/town/**`, `src/game/**`, `src/systems/**`
· any `tasks/**` or `reviews/**` bookkeeping · the `bt-01-tiers` reds (F-1323-5) and the
`m2-03-wave-scheduler:126` knee-budget red (F-1323-3) — both are **known pre-existing** and are **not yours**.

## SELF-CHECK (name the exact commands; both projects where it renders)

- `npx tsc --noEmit` — clean.
- `npm run build` — green.
- `node --test --test-reporter=tap scripts/whole-suite-collection.test.mjs scripts/collection-guards-cwd-invariance.test.mjs scripts/fixture-teardown.test.mjs` — all three green.
- Full node-guards set (the file list in `package.json` → `scripts["test:node-guards"]`, **all 37 files** — do not
  hand-retype a shorter list; s1323 measured that omitting one file silently changes the denominator from 209 to 208).
- `npx playwright test e2e/cp02-charter-boot.spec.ts e2e/cp02-charter-stamp.spec.ts --workers=1` — green, both
  projects. **`--workers=1` is mandatory** (§3.1: at default workers the fire shell's CPU ceiling manufactures reds).
- Zero console/page errors.
- No screenshots owed — nothing here renders.

**READY-FOR-GATES** + report: which template had the undefined `briefing` and why (scope 1's answer, verbatim);
the mutation red you saw and the before/after sha256; the TAP `# tests / # pass / # fail`; and whether all three
reds cleared together or only one.
