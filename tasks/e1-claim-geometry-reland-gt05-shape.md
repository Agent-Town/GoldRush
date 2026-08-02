# e1-claim-geometry-reland-gt05-shape — let gt-05 accept the declared claim geometry

**FIRE-AUTHORED s1393 (attended review welcome).** Role: Codex runner, lane-c. Workdir: `worktrees/lane-c` (branch `lane/e2-arsenal`).

## READ FIRST

- `reviews/e1-claim-geometry-declared-reland.md` — the s1393 gate that found this. Read the section **"The one real red, and its cure"**; the cure is already measured and this task is only asking you to land it.
- `e2e/gt-05-water-depth.spec.ts` around `:333`–`:358` — the test you are changing.
- `CLAUDE.md` §4.5 (firewalls are contracts) and §5 Mistake #2 (never reset over unmerged work).

## PRE-FLIGHT (run this exact sequence; STOP on any mismatch and report)

⚠️ **This lane deliberately holds ONE undrained commit — your predecessor. This is the normal, expected state for this task, NOT the Mistake-#2 hazard.** Do not reset, rebase or squash it; you are committing *on top of* it.

1. `git -C worktrees/lane-c rev-parse --abbrev-ref HEAD` → must print `lane/e2-arsenal`. If not, **STOP**.
2. `git -C worktrees/lane-c log main..HEAD --oneline` → must print **exactly one line**, ending `e1-claim-geometry-reland: declare shared claim geometry`. If it prints **nothing**, the predecessor was drained while you waited — **STOP and report** (this task is then obsolete as written). If it prints **more than one line**, **STOP and report**.
3. `git -C worktrees/lane-c rev-parse HEAD` → record it; it should be `e676addf…`. If it differs, report the value you saw and continue only if step 2's single line still matches.
4. `git -C worktrees/lane-c status --short` → expect no dirty tracked source. If tracked source is dirty, **STOP and report**.
5. `git -C worktrees/lane-c grep -n "snapshot.tileParams" -- e2e/gt-05-water-depth.spec.ts` → must find the assertion. If absent, **STOP and report** (the test moved).

## WHY (evidence, quoted and dated — measured by s1393 on 2026-08-02)

The predecessor `e676addf` declares the E1 claim's geometry in the contract: three E1 contracts gain
`size`, `fords`, `harvestAnchors` and `water` under `tileParams`. That is the slice's entire purpose.

`e2e/gt-05-water-depth.spec.ts:338` asserts the **exact** shape of that object:

```ts
expect(snapshot.tileParams).toEqual({ tileId: …, biome: …, river: true, ford: true, waterSources: [], lanes: {…} });
```

and `classicSnapshot` (`:404`) returns the raw contract object
(`window.__THREE_GAME_DIAGNOSTICS__?.contract.tileParams`). So the four newly-declared fields make
`toEqual` fail by construction. s1393 measured it on both projects:

- **merged tree:** `gt-05-water-depth:333` **RED** on desktop-chrome AND mobile-chrome.
- **clean-main control:** the same test **GREEN** on both. The red is the slice's.
- failure diff: **`- Expected 0 / + Received 40`** — purely additive (`fords`, `harvestAnchors`, `size`, `water`); **no existing value changed**.

⚠️ **That assertion is the test's FIRST, so every later assertion in it — impassability, wade speed,
enemy segments, depth samples — never executed while it failed.** s1393 therefore did not assume the
rest was fine; it ran the repair as a probe in a detached worktree: changing that one call to
`toMatchObject` made the test pass **2/2 (desktop + mobile) in 28.2s**, with all previously-masked
water assertions executing. **The cure below is that measured change, nothing more.**

This suite sat outside the predecessor master's TOUCH-ONLY list, which is why the predecessor runner
neither ran nor fixed it — correct behaviour, and the reason this is a separate task.

## SCOPE (numbered, each item testable)

1. **In `e2e/gt-05-water-depth.spec.ts`, change the `snapshot.tileParams` assertion at `:338` from `toEqual` to `toMatchObject`.** Change **only** the matcher. Do **not** edit the expected object's contents, and do **not** add the four new fields to it — `toMatchObject` is the point: this test's subject is water behaviour, and it should assert the fields it cares about while tolerating geometry the contract declares. Every other assertion in the file stays exactly as it is.
2. Report the numbers below. **Do not "fix" anything else.** If any other test in this file fails, **report it as a finding, do not repair it** — it would be new information (see the ⚠️ above: those assertions have not run in this configuration before).

## FIREWALL

**TOUCH-ONLY:** `e2e/gt-05-water-depth.spec.ts` — and within it, only the matcher named in scope item 1.

**NO:** do **not** touch `assets/contracts/**`, `src/**`, `e2e/tile-identity-pass.spec.ts`,
`e2e/agent-view.spec.ts`, `e2e/fixtures/**` or any other spec · do **not** amend, reset, rebase or
squash the predecessor commit `e676addf` · do **not** touch `STATUS.md`, `tasks/BACKLOG.md`,
`tasks/goals.json`, `logs/suite-red-inventory.md` or anything under `reviews/` · do **not** check
out, merge or reset `lane/m4`.

## SELF-CHECK (run every one, at `--workers=1`, report exact counts — this flag is a correctness requirement of the fire shell, not an optimisation)

1. `npx playwright test e2e/gt-05-water-depth.spec.ts --workers=1` → **the whole file, both projects.** Report X/Y and name every failing test. The target test is `:333` "classic claim keeps deep water impassable while carrying equivalent depth data" — it must **PASS on both projects**.
2. `npx tsc --noEmit` → rc 0.
3. `npm run build` → rc 0.
4. `git diff --name-only main...HEAD` → must list **exactly seven** paths: the predecessor's six (`assets/contracts/epoch-1-frontier/contracts.json`, `e2e/agent-view.spec.ts`, `e2e/fixtures/e1-mechanics-manifests.json`, `e2e/tile-identity-pass.spec.ts`, `src/meta/ContractFamilies.ts`, `src/world/Terrain.ts`) plus `e2e/gt-05-water-depth.spec.ts`. Anything else → **STOP and report**.
5. `git -C . log main..HEAD --oneline` → must print **exactly two** lines (predecessor + yours).

⚠️ **Known pre-existing reds on clean main — NOT yours, do not run them, do not fix them, do not report them as failures:** `e2e/agent-view.spec.ts` byte-stable-fixture (F-1380-2) · `e2e/tile-identity-pass.spec.ts` "E1 contracts load place descriptors…" (nondeterministic hash) · `e2e/e2-hill-mine.spec.ts:131` · `e2e/072-era-activation.spec.ts:226` · `e2e/night3d-perf.spec.ts:67` (F-1390-1).

Commit path-scoped on `lane/e2-arsenal` with the prefix `e1-claim-geometry-reland:`. **Never `git add -A`.**

**READY-FOR-GATES + report:** exact counts for self-checks 1–5; the full `git diff --name-only main...HEAD` list; the two-line `log main..HEAD`; and confirmation that the predecessor commit is untouched (same sha as pre-flight step 3).
