# Task lane-vp-02f: retire two vp-02 test debts — `:292`'s NE keys assert the cured defect, `:388`'s texture count has no settle (lane-b, commit prefix "test:")

**FIRE-AUTHORED s1137 (attended review welcome).** From **F-1137-1** (found while draining vp-02e this same fire, `reviews/vp-02e.md`) and **F-1136-1** (s1136, `tasks/BACKLOG.md` tail). It invents no scope: both defects are already diagnosed at source, and both repairs are mechanical. **Neither is a product change — this task must not touch `src/`.**

CODEX: model=gpt-5.6-sol effort=high

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-b`.

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. **Do not compare this worktree against a list of files I wrote; I do not have one, and an exhaustive dirt list is the wrong instrument (it is what stopped a runner needlessly at s1132).** Check the **invariant** instead: **no dirty blob in this worktree may be UNIQUE — every modified/deleted/untracked file's content must already exist somewhere in git** (main's history, any branch, or this lane's own commits). If every dirty blob is reachable, the reset destroys nothing → `git checkout -B lane/m4 main && git clean -fd` and PROCEED. If **any** blob exists nowhere else, **STOP and report that file by name** — that one is real unmerged work and resetting it would be the Mistake #2 shape. (`git hash-object <file>` then `git cat-file -e <hash>` is enough; `.wrangler/tmp/**` is build scratch and is exempt.) Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.

*(s1137 pre-measured the branch and you must still re-verify it: `lane/m4` is **1 ahead** at `6683a2d7`, the vp-02e runner commit. **It was drained this fire at `e6961aee`, verbatim** — I checked every file in that commit against main with `git diff lane/m4 main -- <those paths>` and the diff is **empty**, so every blob is byte-identical on main. The invariant holds and the reset loses nothing.)*

## READ FIRST (paths, in this order)

1. `reviews/vp-02e.md` — the Findings section. F-1137-1 and F-1137-2 are both there; **this task is F-1137-1 only.** Read the A/B table so you understand why `:292` is red.
2. `tasks/BACKLOG.md` tail — **F-1136-1** (the `:388` flake, with its alternation proof) and **F-1137-1**.
3. `assets/layer-contracts/characters.v2.json` → slot `char.hero`, `rotations.directions`. **This file is BINDING for every frame filename you write.**
4. `e2e/vp-02b-rotation-resolver.spec.ts:292` — the stale NE capture, and `:24-33` (the `directions` table, which is already correct — read it, do not edit it).
5. `e2e/vp-02-sprite-animation.spec.ts:388` — the warmed-swap test, and the `steadyCalls()` helper it already uses for draw calls.

## WHY (evidence, quoted)

**F-1137-1** (`reviews/vp-02e.md`, s1137, measured this fire): `vp-02b:292` waits for **NE** to emit `char-hero-sheet-rotation2-f-r0c2.png` / `…r0c3.png` — the **east** keys. vp-02e (`e6961aee`) made the hero's explicit contract cells win over walk-sheet aliases, so NE now correctly emits its **own** cells. The old expectation was satisfiable **only while the alias bug was present**. Proven cure-caused by an A/B under identical conditions: **control PASS/PASS → treatment FAIL/FAIL** on desktop and mobile. `:113` in the same file already asserts the correct contract and is green.

vp-02e's runner reported this rather than rewriting it, because its firewall excluded the file. That was the **right** call and this task is the follow-through.

**F-1136-1** (s1136, proven by alternation, not opinion): `vp-02-sprite-animation:388` asserts `expect(after?.textures).toBe(baseline?.textures)` → **Expected 26, Received 27** on mobile-chrome. The same single test, same command, same commit, run twice: **attempt 1 PASSED, attempt 2 FAILED.** The defect is the assertion's **shape**: the test's own comment concedes headless transient sensitivity for *draw calls* (*"s27 evidence: instantaneous 20 vs steady 19"*) and gives them a `steadyCalls()` settle — but `textures` is asserted **exactly, with no settle**, inheriting the sensitivity without the mitigation.

## SCOPE (numbered, each testable)

1. **MEASURE BEFORE YOU REPAIR.** Run both suites, both projects, `--workers=1`, and write the **per-test** before list into your report. No bare counts. This is the authority for what follows — **if your measurement disagrees with the WHY above, your measurement wins and you say so.**

2. **Repair `:292`'s NE frame keys from the CONTRACT, not from the runtime.** Read `characters.v2.json` → `char.hero.rotations.directions.ne.frames.files` and use those filenames verbatim. ⛔ **Do NOT boot the game, observe what NE serves, and copy that in.** That inversion — encoding observed runtime as an expectation — is exactly how vp-02d's runner promoted a live bug into a spec (F-1135-1), and it is the single most expensive mistake this suite has produced. The contract is the authority; the runtime is the thing under test. **If the runtime disagrees with the contract, that is a STOP + report, not an edit.**

3. **Give `:388`'s texture count the same settle draw calls already have.** Mirror the existing `steadyCalls()` mitigation rather than inventing a second mechanism.

4. **PROVE the settled assertion can still FAIL.** A poll that accepts whatever it is given is the *probe that executes nothing* class — it would turn a flaky guard into a vacuous one, which is strictly worse. Mutate the **subject** (not the test): make a texture genuinely leak, show the repaired assertion goes RED, then revert the mutation and show it green. **Report both runs.** Do not commit the mutation.

5. **Both repaired tests green on desktop AND mobile.** For `:388`, run it **at least 3 times per project** and report every outcome — a flake fix asserted from one green run is not evidence.

## TOUCH-ONLY

- `e2e/vp-02b-rotation-resolver.spec.ts` — **the `:292` frame keys only**
- `e2e/vp-02-sprite-animation.spec.ts` — **the `:388` texture assertion only**
- your report

## NO — do not touch

- ⛔ **`src/**` — ANY file. This task is test-only.** Both defects are in assertions. If you conclude a product change is needed, that is a **STOP + report**, and it is a genuinely useful result — say so rather than reaching for it.
- **`assets/layer-contracts/characters.v2.json`.** It is the authority. If you believe the contract is wrong: STOP + report, never edit.
- **the `directions` table at `e2e/vp-02b-rotation-resolver.spec.ts:24-33`** — already verified row-by-row against the contract at s1135. If you find yourself editing it, STOP.
- `e2e/vp-02b-rotation-resolver.spec.ts:233` and `e2e/vp-02-sprite-animation.spec.ts:705` — **known pre-existing reds** (both wait for the absent `char.claim_jumper` slot; `spawnPack()` exposes `char.bandit_base`). Leave them red; confirm they fail the same way they do today.
- **`e2e/vp-02-sprite-animation.spec.ts:547`** — that is **F-1137-2**, a separate open question (west capture goes null on **mobile only**, cause NOT yet determined, desktop green). It needs a diagnostic probe, not a repair. **Do not touch it, and do not "fix" it by loosening the assertion.**
- `Balance.ts`, art, anything not named in TOUCH-ONLY.

## SELF-CHECK (name the exact evidence)

- `npx tsc --noEmit` clean · `npm run build` green.
- **Per-test before/after lists for both suites, desktop-chrome AND mobile-chrome, `--workers=1`. No bare counts** — a green count has hidden a red exit code in this repo before.
- `:292` green both projects, with the NE filenames quoted in the report and traced to the contract line they came from.
- `:388` green both projects, **3+ runs each, every outcome reported.**
- Scope-4 mutation proof: the RED run and the reverted GREEN run, both named.
- The four known reds above still red, and fingerprint-matched to today's failure text.
- Zero console/page errors in every boot probe.

**READY-FOR-GATES** — report: the scope-1 measurement, the contract lines your NE filenames came from, the scope-4 mutation proof, the per-test lists, and anything you were tempted to touch outside TOUCH-ONLY.
