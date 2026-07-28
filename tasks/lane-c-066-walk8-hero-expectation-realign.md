# Task lane-c-066-walk8-hero-expectation-realign: `066-walk8-engine` still asserts the hero "stays on walk4" — observe what she ACTUALLY walks on, then realign the expectation to the ratified activation (lane-c, commit prefix "test:")

**FIRE-AUTHORED (attended review welcome)** — s1179, 2026-07-28. Authored from a defect **I measured myself during the `29bac3d9` drain**, with my own single-variable control, not from a summary: the two reds reproduce with `assets/layer-contracts/characters.v2.json` reverted to clean main, so they are not that merge's doing. Filed as **F-1179-1** (`tasks/BACKLOG.md`). No new scope invented; the successor question is a test expectation, and the engine is not on trial.

CODEX: model=gpt-5.6-sol effort=high

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-c`.

READ FIRST (paths, not memory):
- `AGENTS.md`
- `e2e/066-walk8-engine.spec.ts` — **all of it, but especially `:79-86` (the shared `heroWalk()` helper and its `frameCount === 4` wait), `:194-206` (the test named "hero stays on walk4 while walk8 cells are registered"), and `:208-238` (the Claim Jumper cadence test, whose FIRST act is that same helper).**
- `assets/layer-contracts/characters.v2.json` — the `char.hero` entry: its `walk4` block, its `walk8` block (including the `notes` field, which dates and quotes the activation), and the `walk8.directions` map merged at `29bac3d9`.
- `e2e/eight-winds-hero.spec.ts` — the sibling that reads the same contract and is **green 4/4**. It is your regression net; it must stay 4/4.
- `reviews/eight-winds-wiring-hero.md` **ACT 2** — the drain that measured this defect, including the exact control that proves it pre-existing.
- `src/assets/SpriteAnimator.ts:790-855` — **read it to understand, not to edit.** See the firewall.

## Pre-flight (LANE-SAFETY, runner-auto-commit aware)
The lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via `git log`/`git diff`), it is a SAFE DUPE → `git checkout -B lane/e2-arsenal main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make.

**The dupe is PRE-PROVEN for you — do not spend budget re-deriving it.** s1179 verified at 2026-07-28T19:2xZ, immediately after draining this very lane: `lane/e2-arsenal` is ahead at `46397ac5`, whose entire 77-file deliverable **shipped to main as `29bac3d9`**. The decisive probe is the unique-blob invariant, not the ahead-count: `git diff --name-only --diff-filter=A main..lane/e2-arsenal` returns **EMPTY** — the lane holds **zero files that main lacks**, so a reset destroys nothing. Re-run that one command to confirm nothing has changed since, then reset and move on.

Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.

## Why (the defect, dated, measured)

`e2e/066-walk8-engine.spec.ts:194` is named **"hero stays on walk4 while walk8 cells are registered"**, and it means it literally:

```ts
expect(walking.frameCount).toBe(4);
expect(walking.fps).toBeCloseTo(9.5, 1);
expect(walking.sourceFrameKey).toContain('char-hero-sheet-walk4-');
expect(walking.sourceFrameKey).not.toContain('walk8');
```

That was a true and useful assertion **when walk8 cells were registered but not yet activated for the hero**. The hero's `walk8` was **activated on 2026-07-12 with owner approval** — the contract's own `notes` field records it in writing. The suite has been red on **both** projects ever since, and it is not one test but two:

| site | why it fails | cost |
|---|---|---|
| `:194` | asserts `frameCount === 4` and a `walk4-` sheet on a hero who was moved to `walk8` on 07-12 | 2 executions (both projects) |
| `:208` | **collateral** — it calls `heroWalk()` at `:210` before it reaches its own subject, so it dies in the helper at `:81` and its Claim-Jumper cadence assertions **never run at all**; it then repeats the same stale hero expectation at `:228-229` | 2 executions (both projects) |

Neither is a timeout in the sense F-1167-2 discounts: they are 30 s waits on a condition that **can never become true**, which is a stale expectation wearing a timeout's clothes.

✓ **PROVEN PRE-EXISTING, NOT CAUSED BY `29bac3d9`, BY CONTROL** (s1179, on the merged tree): with `assets/layer-contracts/characters.v2.json` reverted to clean main and everything else left in place, the same two tests fail at the same helper line — desktop control **1 passed / 2 failed**, identical to the treatment arm.

⚠️ **The valuable part of `:208` is the part that never runs.** It is the only test asserting that a walker at a *higher frame count* keeps the *old stride duration* (`jumper.fps` ≈ 8.55 at 8 frames). That cadence law is exactly what the eight-winds work depends on. Restoring it to life is the point of this task; the hero lines are only its doorway.

## Scope

### 1. OBSERVE THE DEFECT AND CLASSIFY — MANDATORY STOP GATE, BEFORE YOU EDIT A SINGLE ASSERTION

Run the suite unmodified and capture what the hero **actually** is at the moment `heroWalk()` gives up:

```text
npx playwright test e2e/066-walk8-engine.spec.ts --project=desktop-chrome --workers=1 --reporter=line
```

Then, with a **temporary** diagnostic (a scratch spec or a one-test edit you remove before reporting — `git diff -- e2e/066-walk8-engine.spec.ts` must be empty at the end of this scope), press `KeyS` in the same plain boot and print the hero's full snapshot from `window.__THREE_GAME_DIAGNOSTICS__.spriteAnimations['char.hero']`: **`clip`, `frameCount`, `fps`, `frameKey`, `sourceFrameKey`, `strideUnitsPerCycle`**. Paste it verbatim.

**Classify, and obey the classification:**

- **(a) the hero is on a `walk8` sheet AND her stride duration is preserved** — i.e. `frameCount` has doubled while `frameCount / fps` (the seconds-per-cycle) still matches the walk4 era's `4 / 9.5 ≈ 0.42 s` to within the tolerance you can defend, and/or `strideUnitsPerCycle` is unchanged. ➡️ **PROCEED to scope 2.** This is the expected finding and it means the engine honoured the cadence law across activation.
- **(b) the hero is on a `walk8` sheet BUT the stride duration CHANGED** ➡️ **STOP AND REPORT.** That is an **engine/contract defect**, not a stale test — the test would then be red for a *real* reason and realigning it would install a false green over a live regression. Report the two numbers and stop. **Do not touch `src/`.**
- **(c) anything else** — she is still on `walk4`, or the wait fails for an unrelated reason, or the suite is **already green** on your tree ➡️ **STOP AND REPORT** with the evidence. The inventory that named this defect is hours old and something may have landed.

**(b), (c) and an already-green tree are all LAWFUL STOPS and count as full successes.** A stop with numbers is worth more than a cure aimed at the wrong mechanism — that is exactly what the sibling task `lane-a-cp04-lever-unlock-seed-realign` proved this same day (`reviews/cp04-lever-unlock-seed-realign.md`).

### 2. REALIGN THE EXPECTATION — the test's INTENT survives, only its stale premise dies

Only on classification (a). Three edit sites, and **no others**:

1. **`heroWalk()` at `:81-85`** — the wait must name what the hero IS, not what she was. It must still be a *specific* wait: `clip === 'walk'` plus the frame count you measured. **Do not** relax it to "any frameCount" or drop the condition — a helper that waits for nothing returns a snapshot of a standing figure and every assertion downstream becomes decorative.
2. **`:199-202`** — rewrite the four hero assertions so the test asserts the ratified truth with **the same rigour it had before**. The successor must pin, at minimum: the sheet family actually in use, the frame count, and the **cadence** with a `toBeCloseTo` tolerance no looser than the `(…, 1)` it uses today. **Rename the test** — a test called "hero stays on walk4" that asserts walk8 is a lie in the ledger. Something like *"hero walks on the activated walk8 sheet at the ratified cadence"*; the name is yours, the honesty is not optional.
3. **`:228-229`** — the same two stale hero lines inside the Claim Jumper test. Realign them identically, or reduce them to the minimum precondition the jumper test genuinely needs — **your call, justified in the report**. Everything from `:230` down (the jumper's own `frameCount`, sheet and `fps` assertions) is **untouchable**: those are the assertions this whole task exists to bring back to life.

⛔ **You may NOT satisfy this scope by deleting an assertion, by loosening `toBeCloseTo` precision, by swapping `toContain` for `toBeTruthy`, or by marking anything `test.skip`.** The count of assertions must not fall. If you believe one is genuinely unanswerable, STOP and say why.

### 3. MUTATION CONTROL — aim it at the SUBJECT, and restore it by hash

Your realigned assertions must be able to fail. Prove it by mutating **the thing under test**, not the test:

- Record `git hash-object assets/layer-contracts/characters.v2.json` as **PRE**.
- Temporarily neutralise the hero's `walk8` activation in that file (the smallest edit that makes her fall back — e.g. renaming the `walk8` key on `char.hero`). Re-run `:194` and show it goes **RED**, with the printed failure.
- **Restore the file and prove the restore**: `git hash-object` again must equal **PRE**, and `git status --porcelain -- assets/` must be **EMPTY**. Paste `PRE=…` and `POST=…`.

This is the one and only edit to `assets/**` this task permits, it is temporary, and an unrestored one is a rejection.

### 4. SELF-CHECK

1. `npx tsc --noEmit` — clean.
2. `npm run build` — green, note the time.
3. `e2e/066-walk8-engine.spec.ts`, **both projects**, `--workers=1`, and **state the worker count** (F-1173-5: a red inherits its harness config). Target **6/6**. Any remaining red must be reproduced on an **unmodified control** and reported with that proof — never waved through.
4. Adjacent, unmodified, both projects, `--workers=1`: `e2e/eight-winds-hero.spec.ts` (**must stay 4/4** — it reads the same contract and is the net under your mutation) and `e2e/vp-02b-rotation-resolver.spec.ts` (**14/14**).
5. `e2e/vp-02-sprite-animation.spec.ts` is **expected to carry known reds** and they are **not yours to fix**: `:405` on both projects is **F-1138-6** (off by exactly +1 texture, measured in every arm on 2026-07-28) and `:566` is the **F-1140-5/F-1137-2** crossfade flake (desktop rate ~5/10). Report its counts; do not chase them.
6. `git status --porcelain -- src/` **EMPTY** and `git status --porcelain -- assets/` **EMPTY**, both pasted.
7. Zero console / page errors in the specs you run (066 already asserts them; say so).

## Firewall

**TOUCH-ONLY:**
- `e2e/066-walk8-engine.spec.ts` — the three sites in scope 2 and the test name. Nothing else in the file.
- your run report under `tasks/runs/`.
- `assets/layer-contracts/characters.v2.json` — **only** as the temporary, hash-restored mutation of scope 3.

**NO — do not touch, do not "fix", do not tidy:**
- **All of `src/**`.** The engine is not on trial here; the test is. If you conclude the engine is wrong, that is classification **(b)** and it is a **STOP**, not an edit. `SpriteAnimator.ts` in particular is the surface the eight-winds slice was explicitly forbidden to touch, twice.
- **`char.claim_jumper` / the jumper's own activation** — **owner-gated design fork** (F-1166-1; `tasks/025-vp-02e-jumper-8way-activation.md` is marked DO-NOT-QUEUE). You may realign the **hero** precondition inside `:208`; you may not change what that test asserts about the jumper, and you may not "activate" anything.
- `e2e/eight-winds-hero.spec.ts`, `e2e/vp-02*.spec.ts`, and every other spec — they are your controls, and a control you edited is not a control.
- `assets/processed*`, every sheet, every `frames.json` — no extraction, no regeneration.
- `playwright.config.ts`, `package.json`, any `--workers` default.

## Self-check before you report

READY-FOR-GATES + report, in this order: **scope 1's snapshot and its classification letter** (or the STOP); the three realigned sites as a diff in text; the mutation control's RED plus `PRE=`/`POST=`; the 066 table at 6/6 with the worker count stated; the adjacent table including `eight-winds-hero` at 4/4; and one paragraph naming what, if anything, `:208` still cannot assert about the jumper without touching the owner-gated fork.
