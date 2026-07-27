# Task lane-vp02-capture-error-surface: let the west/east capture timeout message actually REACH the report (lane-b, commit prefix "test:")

**FIRE-AUTHORED s1141 (attended review welcome).** From **F-1141-1** (`tasks/BACKLOG.md`, this fire), which was found while draining vp-02g at `ef3731b8`. It invents no scope: vp-02g already built the enriched message and its content is already merged — this task only stops the caller from throwing it away. **No new assertion, no changed expectation, no product code.**

CODEX: model=gpt-5.6-sol effort=high

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-b`.

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. **Do not compare this worktree against a list of files I wrote; I do not have one, and an exhaustive dirt list is the wrong instrument (it is what stopped a runner needlessly at s1132).** Check the **invariant** instead: **no dirty blob in this worktree may be UNIQUE — every modified/deleted/untracked file's content must already exist somewhere in git** (main's history, any branch, or this lane's own commits). If every dirty blob is reachable, the reset destroys nothing → `git checkout -B lane/m4 main && git clean -fd` and PROCEED. If **any** blob exists nowhere else, **STOP and report that file by name** — that one is real unmerged work and resetting it would be the Mistake #2 shape. (`git hash-object <file>` then `git cat-file -e <hash>` is enough; `.wrangler/tmp/**` is build scratch and is exempt.) Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.

*(s1141 pre-measured the branch and you must still re-verify it: `lane/m4` is **1 ahead** at `43d72990`, the vp-02g runner commit, **already drained to main at `ef3731b8`** by this fire. Confirmed by content, not by message: `e2e/vp-02-sprite-animation.spec.ts` is **absent from `git diff --name-only main..lane/m4`**, i.e. byte-identical to main — the slice's content is fully merged and this is a false-ahead tip. Nothing is lost by the reset.)*

## READ FIRST (paths, in this order)

1. `e2e/vp-02-sprite-animation.spec.ts:174-200` — `canvasCaptureAtHeroFrame`, including the enriched throw vp-02g added.
2. `e2e/vp-02-sprite-animation.spec.ts:566-600` — the east-heading test: **the two call sites and the attempt-0 retry that depends on `null`.**
3. `reviews/vp-02g.md` — the drain review, especially finding **F-1141-1**.
4. `tasks/BACKLOG.md` — **F-1141-1** and **F-1141-2** (this fire).

## WHY (quoting the evidence, dated)

vp-02g (merged `ef3731b8`, 2026-07-27) made the capture helper record the distinct observed
`{direction, frameKey, fadeActive}` tuples and `framesPolled`, and put them in its timeout throw.
That was the right fix and it delivered the diagnosis — classification **(c), the crossfade gate**.

**But the message never reaches the report.** Both callers do:

```ts
// e2e/vp-02-sprite-animation.spec.ts:579,584
const west = await canvasCaptureAtHeroFrame(page, 'w', '…r1c0.png').catch(() => null);
const east = await canvasCaptureAtHeroFrame(page, 'e', '…r0c2.png').catch(() => null);
```

`.catch(() => null)` **discards the error object**, so the test dies at `expect(west).not.toBeNull()`
and the report shows only `Received: null`. ✓ **Verified at s1141, not inferred:** the
`error-context.md` from a real desktop `:566` failure that fire contains exactly
`Error: expect(received).not.toBeNull()` and **no observed-sequence anywhere**. vp-02g's runner
obtained its dumps only via a *temporary* error exposure that its own scope 5 required it to revert.

🔑 **This is the same class as F-1140-1** — a signal computed and then thrown away by its caller.
Two fires running. The point of this task is that the next person who hits this red sees the
diagnosis for free instead of spending a fire re-deriving it.

## SCOPE (numbered, each testable)

1. **PROVE THE GAP FIRST — a STOP gate, and you may contradict me.**
   Before changing anything, run the east-heading test on **desktop** until you observe one failure:
   `-g "east heading uses explicit rotation2 files" --project=desktop-chrome --workers=1 --repeat-each=6`.
   (s1141 measured desktop at **5/10** and again at **1/4**; it fails readily.) Open the resulting
   `test-results/**/error-context.md` and **quote its `# Error details` block verbatim** in your report.
   - **Expected: `expect(received).not.toBeNull()` with no observed-sequence.** That is the premise.
   - ⚠️ **If you instead find the observed-sequence already present in the report, my premise is WRONG
     — STOP, say so, and report the quote.** Do not "fix" something that is not broken.

2. **PRESERVE THE NULL, SURFACE THE MESSAGE.** Change only the two call sites so that the thrown
   error's text is captured and included when the assertion fails, while the value still becomes
   `null` on failure. Any shape that achieves this is acceptable; the smallest is to catch into a
   recorded reason, e.g. keep `west`/`east` as `T | null` and hold a parallel `westReason`/`eastReason`
   string, then pass it as the `expect` message:
   `expect(west, westReason ?? 'west capture returned null').not.toBeNull();`
   - ⛔ **The attempt-0 retry at `:587` legitimately depends on the `null`** (`if (attempt === 0 && (!west || !east))`).
     **It must keep working unchanged.** Removing the `.catch` outright would break it — that would be a
     cure that breaks the retry, and it will be rejected.
   - ⛔ Do **not** touch `canvasCaptureAtHeroFrame` itself. vp-02g already did that part correctly.

3. **POSITIVE CONTROL — prove the message now arrives.** Temporarily, in your working tree only, ask
   for an impossible frameKey (e.g. `char-hero-sheet-rotation-f-r9c9.png`), run the test, and **paste
   the `error-context.md` `# Error details` block showing the populated observed-sequence and
   `framesPolled`**. Then revert it and show `git diff` proves it is gone. *(A probe that executes
   nothing reports nothing — we have shipped that mistake before.)*

4. **THE SUITE MUST NOT MOVE.** Run the full `e2e/vp-02-sprite-animation.spec.ts`, both projects,
   `--workers=1`, and report the per-test list. Expected, unchanged: **19 passed / 3 failed** — the two
   `char.claim_jumper` `:724` screenshot reds and the intermittent east-heading capture. A different
   count is a finding; report it rather than chasing it.

## TOUCH-ONLY

- `e2e/vp-02-sprite-animation.spec.ts` — **the two call sites at `:579`/`:584` and the assertions at `:589-590` only**
- your report

## NO — do not touch

- ⛔ **`src/**` — ANY file.** The underlying flake is **F-1141-2**, a crossfade *design* question routed
  to the owner. If you conclude the product is at fault, that is a **STOP + report**, not a fix here.
- ⛔ **Making `:566` pass is NOT the goal and WILL be rejected.** Do not widen the accepted frameKey, do
  not raise the 2 000 ms window, do not add a third attempt, do not add `test.retry`, do not `skip`.
  The flake is the subject under study and loosening the assertion destroys the evidence — F-1137-2's
  refusal is still binding.
- ⛔ `canvasCaptureAtHeroFrame`'s body, the success condition, the window, the rAF cadence.
- ⛔ The attempt-0 retry control flow at `:587`.
- ⛔ The `:724` `char.claim_jumper` known-reds.
- ⛔ Any other spec file, `tasks/`, `reviews/`, `STATUS.md`, `tasks/goals.json`.

## SELF-CHECK before you report

- Scope 1's verbatim "before" quote (or the STOP if my premise was wrong).
- `npx tsc --noEmit` clean; `npm run build` green.
- Scope 3's verbatim "after" quote showing a populated observed-sequence, **plus proof of revert**.
- The attempt-0 retry still present and unmodified — quote the line.
- Full `vp-02-sprite-animation` per-test list, both projects; the two known-reds unchanged.
- `git status` clean of `src/`.

READY-FOR-GATES + report the before/after error quotes, the retry line, and anything you had to STOP on.
