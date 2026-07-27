# Task lane-vp-02-anim-key-staleness: cure the pre-existing anim-red cluster in `vp-02-sprite-animation` — the suite still asserts the PRE-`-f-` (male) hero sheets (lane-a, commit prefix "fix:")

**FIRE-AUTHORED s1134 (attended review welcome).** This discharges **F-1**, the corrective owed since **s459** and named in `tasks/BACKLOG.md:259` as *"the pre-existing anim-red cluster (owed corrective, not gait)"*. It is a **test-only repair with a binding external source of truth** (the contract). It invents no scope: the cure is to make four stale expectations agree with the shipped contract.

CODEX: model=gpt-5.6-sol effort=high

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-a`.

READ FIRST: `AGENTS.md`; `assets/layer-contracts/characters.v2.json` lines **4-47** (the `char.hero` slot: its `fallback.file` at `:8` and the eight `rotations.directions` blocks — **this file is the BINDING source of truth for every filename in this task**); `e2e/vp-02-sprite-animation.spec.ts` in full, but especially lines **29-36** (the 8-direction table), **350-368** (the fallback test), **550-572** (the E/W assertions); `src/assets/SpriteAnimator.ts` lines **475-482** (`frameKey` = `diagnosticKey ?? key`) and **1064-1077** (`mergeWalkSheetWithRotationIdle`, which sets `diagnosticKey` — read it, it is a walk8→rotation filename remap and it passes rotation filenames through **verbatim**).

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. **Do not compare this worktree against a list of files I wrote; I do not have one and an exhaustive list is the wrong instrument (it is what stopped a runner needlessly at s1132).** Check the **invariant** instead: **no dirty blob in this worktree may be UNIQUE — every modified/deleted/untracked file's content must already exist somewhere in git** (main's history, any branch, or this lane's own commits). If every dirty blob is reachable, the reset destroys nothing → `git checkout -B lane/m3 main && git clean -fd` and PROCEED. If **any** blob exists nowhere else, **STOP and report that file by name** — that one is real unmerged work and resetting it would be the Mistake #2 shape. (`git hash-object <file>` then `git cat-file -e <hash>`, or search the path's history, is enough; `.wrangler/tmp/**` is build scratch and is exempt.) Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.

*(s1134 pre-measured the branch and you must still re-verify it: `lane/m3` is **1 ahead** at `881bc40d`, whose entire content is one file, `reviews/lane-cw-02-slide-latch-blast-radius.md`, whose blob is **`42c10ac6…` on the branch and `42c10ac6…` on main — byte-identical, i.e. already merged.** That is a true SAFE DUPE: the reset destroys nothing.)*

## WHY (evidence, dated)

1. **The corrective is owed and named.** `tasks/BACKLOG.md:259` (run-gait-stride, s459) records the gate as: *"10 adjacent anim reds (066-walk8×2, run-scene-refresh, task-031×2, task-042, **vp-02b×4**) fingerprint-proven PRE-EXISTING vs byte-identical pre-gait baseline `6f765aa5`"*, closing with **"F-1 = the pre-existing anim-red cluster (owed corrective, not gait)."** `BACKLOG:65` independently records *"F-p03-vp02b (non-blocking, **PROVEN pre-existing via baseline-on-main**)"*. Two fires measured this cluster the right way and neither cured it.

2. **s1134 found the single root cause, ✓ verified at source: the s37/batch-005R2 female-hero sheet swap (`-f-`) was never reflected in the vp-02 suites.** `char.hero` (`characters.v2.json:6-8`) has `fallback.file` = **`hero-homesteader-f.png`** and its eight rotation blocks name **only** `-f-` cells. `frameKey` passes those filenames through **verbatim** (`SpriteAnimator.ts:479` → `idleFile = rotationFiles[idleIndex]`, `:1069`). **There is no normalisation anywhere:** `grep -- '-f-' e2e/` = **0 hits**. So every pre-`-f-` expectation in the suite is unmatchable.

3. **The four defects, each ✓ read at source s1134. This is the complete list; measure it yourself before repairing (scope 1).**
   - **`:29-36`** — the 8-direction table asserts `char-hero-sheet-rotation-r0c0.png` etc. It is **byte-for-byte the contract's eight blocks with `-f-` deleted**.
   - **`:355`** — `page.route('**/char-hero-sheet-rotation-r*.png', abort)`. The served cells are `…rotation-f-r*` and `…rotation2-f-r*`, so **this glob now matches nothing** and the layer the test means to block is not blocked. (It never matched `rotation2-` either.)
   - **`:358`** — waits for `frameKey === 'hero-homesteader.png'`, but the contract fallback is **`hero-homesteader-f.png`**. Both files still exist on disk, so this fails as a **timeout**, not a 404.
   - **`:554`/`:559`/`:568`/`:570`** — E/W `frameKey` assertions carrying the same pre-`-f-` keys.

4. **A warning that is the entire reason this master exists, and it is not hypothetical — it happened this week on the sibling suite (F-1134-1, `BACKLOG`).** A master told a runner *"the suite normalises `-f-` out of the filename"*; that premise was **false**; the runner found the assertions failing and **rewrote the expectation table to match whatever it observed**, reassigning which cells the diagonals use. **The instruction produced the bent test.** Read scope 2 before you touch a filename.

## Scope (numbered, each testable)

1. **MEASURE FIRST, REPAIR SECOND. Do not change a line before you have run the suite and recorded what is actually red.** Run `npx playwright test e2e/vp-02-sprite-animation.spec.ts` on **both** projects on a clean lane and **paste the per-test red/green list** (names, not a count) into your report. WHY §3 is my list; **yours is the authority.** If a defect I named is already green, say so and leave it alone. If something is red that I did **not** name, report it — do not assume it belongs to this cure.

2. **THE CONTRACT IS THE SOURCE OF TRUTH, AND THE REPAIR IS MECHANICAL: insert `-f-` into stale filenames and CHANGE NOTHING ELSE.** ⛔ **Do NOT re-derive the direction→cell mapping from observed runtime output.** Every expected filename must be **copied from `characters.v2.json`**, whose blocks are: `s`=`rotation-f-r0c0/r0c1` · `se`=`rotation-f-r0c2/r0c3` · `w`=`rotation-f-r1c0/r1c1` · `ne`=`rotation-f-r1c2/r1c3` · `n`=`rotation-f-r2c0/r2c1` · `sw`=`rotation2-f-r0c0/r0c1` · `e`=`rotation2-f-r0c2/r0c3` · `nw`=`rotation2-f-r1c0/r1c1`. **If the runtime disagrees with the contract for any direction, that is a FINDING to report — the contract wins and you STOP, because a runtime/contract disagreement is a real bug and silently encoding it into a test would hide it.**

3. **`:355` — fix the glob so it blocks what it intends to block.** It must abort the hero's rotation cells **as the contract now names them**, including the `rotation2` sheet it never covered. Prefer one glob that cannot go stale the same way again (e.g. matching the sheet family rather than a hand-spelled cell prefix), and say in your report **why your pattern cannot silently match zero files in future**. ⚠️ **This test's value is entirely in the abort actually firing** — a route that matches nothing makes it pass while testing nothing. **Prove it fires:** assert (or log and paste) a non-zero count of aborted requests.

4. **`:358` — expect the contract's fallback, `hero-homesteader-f.png`.** Read it from `:8`, do not hardcode from this master.

5. **Keep every assertion's INTENT identical.** This is a filename repair. Do not delete a test, do not relax a tolerance, do not add `test.skip`, do not widen an `expect` to make it pass. **If a test cannot be made green by a truthful filename correction, STOP and report it** — that one is a real bug and is out of scope.

## Firewall

**TOUCH-ONLY:** `e2e/vp-02-sprite-animation.spec.ts`.
**NO — and the first entry is a hard serialization rule, not a preference:** ⛔ **`e2e/vp-02b-rotation-resolver.spec.ts` — a LIVE task (`lane-vp-02d-side-idle-resolver`, lane-b) is editing that file right now.** It carries the same stale table and it is **not yours**; touching it is a firewall violation and a merge collision. Also NO: any `src/**` (this is a test-only repair — if you believe a src change is needed, that is a FINDING and a STOP), `assets/**` (the contract is correct — **do not edit the JSON to match a test**; that inversion is the worst outcome this task can produce), any other `e2e/*.spec.ts`, `package.json`, `playwright.config.ts`.

Reporting an adjacent problem is good; fixing one out of scope is a violation.

## Self-check (run these, paste the real numbers)

- `npx tsc --noEmit` — clean.
- `npm run build` — green.
- `npx playwright test e2e/vp-02-sprite-animation.spec.ts` — **both** projects (desktop-chrome AND mobile-chrome/390px). Paste the **before** list (scope 1) and the **after** list side by side, per test.
- `npx playwright test e2e/066-walk8-engine.spec.ts e2e/run-scene-animation-refresh.spec.ts` — both projects. These are **adjacent members of the same s459 cluster and are NOT in your scope**; run them only to record whether this repair moved them. **Do not edit them.** Report their state.
- Boot probe desktop + 390px: **zero** console errors and zero page errors.

END WITH: **READY-FOR-GATES** + the files you changed + the real self-check numbers + explicit answers to: (a) the before/after per-test list from scope 1; (b) did the runtime disagree with the contract for **any** direction, and if so which; (c) what is your `:355` glob, and what non-zero abort count proves it fires; (d) did any test require anything beyond a truthful filename correction (if yes, you should have stopped — say what and why).
