# Task lane-c-activations-derivation-hardening: retire the dead `mirrored` column and make the spec's row/frame derivation agree with the runtime it is testing (lane-c, commit prefix "test:")

**FIRE-AUTHORED s1150 (attended review welcome).** This is a **TEST-HARDENING** task in ONE file: `e2e/lane-c-activations-assay-office.spec.ts`, and within it essentially one 8-line derivation block (`:44-51`). It ships **zero `src/`**. Its whole value is that the spec's contract-derivation stops disagreeing with the runtime's contract-derivation in ways that are invisible today and expensive later. **The single most likely wrong move is to "fix" F-1149-1 by widening an assertion or by making `mirrored` reachable through a contract change — both are out of scope and are REJECT conditions (scope 6).**

CODEX: model=gpt-5.6-sol effort=high

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-c`.

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. **Do not compare this worktree against a list of files I wrote; I do not have one, and an exhaustive dirt list is the wrong instrument (it is what stopped a runner needlessly at s1132).** Check the **invariant** instead: **no dirty blob in this worktree may be UNIQUE** — every modified/deleted/untracked file's content must already exist somewhere in git (main's history, any branch, or this lane's own commits). If every dirty blob is reachable, the reset destroys nothing → `git checkout -B lane/e2-arsenal main && git clean -fd` and PROCEED. If **any** blob exists nowhere else, **STOP and report that file by name** — that one is real unmerged work and resetting it would be the Mistake #2 shape. (`git hash-object <file>` then `git cat-file -e <hash>` is enough; `.wrangler/tmp/**` is build scratch and is exempt.) Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.

*(s1150 measured this lane at close and you must still re-verify it: `git log main..lane/e2-arsenal` was **1 ahead**, and that 1 is a **false-ahead** — `5bf6a101`'s two files were merged to main path-scoped at `83eab9b0`, so they are byte-identical on both sides and do not appear in the tree diff at all. Proven by the unique-blob invariant, not by the ahead-count: `git diff --numstat main lane/e2-arsenal` listed only `STATUS.md`, `reviews/lane-c-f1148-1-trajectory-split.md`, `scripts/probe-s1150-confirmbuild-rate.mjs`, `scripts/tmp-s1149-line1.txt`, `tasks/BACKLOG.md` and `tasks/goals.json`, and **every one of those lines is main being NEWER than the lane** — the lane holds nothing unique. If that is no longer true, apply the invariant above.)*

## READ FIRST (paths, in this order)

1. `e2e/lane-c-activations-assay-office.spec.ts:44-51` — **the derivation block you are changing.** Eight lines. Read them before anything else.
2. `e2e/lane-c-activations-assay-office.spec.ts:106-120` — the consuming loop and the three assertions that use `frames` and `mirrored`.
3. `src/assets/SpriteAnimator.ts:1025-1032` — **the runtime this spec exists to check.** The row lookup and the `frameCount` line are the two things your derivation must agree with.
4. `assets/layer-contracts/characters.v2.json` → slot `char.bandit_base`, key `walk8` — the contract both sides read. **You will not edit this file.**
5. `reviews/lane-c-activations-frame-matrix-from-contract.md` — the s1149 drain that produced F-1149-1 and F-1149-2, including the mutation control proving this spec discriminates.
6. `tasks/BACKLOG.md` (the F-1149-1 and F-1149-2 entries) — the consolidated statement of both findings.
7. `CLAUDE.md` §5 Mistake #12 and §7 (escalation).

## WHY (quoting the evidence, dated)

s1149 drained `lane-c-activations-frame-matrix-from-contract` at `c727a5b7` and, while proving the new contract-derived matrix is **not** tautological (it mutated the runtime and got a specific red), recorded two findings it did not have the cap to fix. Verbatim from `reviews/lane-c-activations-frame-matrix-from-contract.md` (**F-1149-1**):

> `const mirrored = !banditWalk8.grid.rowDirections.includes(rowDirection)` sits **after** `indexOf(...)` + `if (row < 0) throw`; since `indexOf(x) >= 0` ⟺ `includes(x)`, the throw **guarantees** membership and `mirrored` can never be `true` **for any contract whatsoever**.

and (**F-1149-2**):

> The spec enumerates its expected frame set from `grid.cols`; the runtime builds its file list from `Math.max(1, sheet.frameCount ?? grid.cols ?? 1)` (`src/assets/SpriteAnimator.ts:1029`).

**All of this was re-verified at source by s1150 (2026-07-28), not inherited.** Reading the file: `:46` is the `indexOf`, `:47` is the throw, `:49` is the `!includes` — so the reachability argument holds exactly as stated. Reading the contract: `rowDirections` is `["s","w","e","n"]` with `aliases {se:e, ne:e, sw:w, nw:w}`, so every alias resolves to a row that **exists** — `mirrored` is `false` for all 8 directions, which is why the outcome is correct today and why neither finding blocks anything.

**s1150 found a third divergence of the same class while verifying the first two (F-1150-4), and it is in scope:** the runtime resolves its row as `source.row ?? rowDirections.findIndex(c => c.toLowerCase() === direction)` and returns **null** when absent; the spec uses `rowDirections.indexOf(rowDirection)` and **throws**. That differs in three ways — the spec ignores an explicit `source.row`, it is case-**sensitive** where the runtime is case-**insensitive**, and it fails loudly where the runtime fails soft. Today `rowDirections` is all-lowercase and carries no `row` key, so **all three are latent** — exactly like F-1149-2.

**The through-line:** this spec derives its expectations from the same JSON the runtime reads, which is what makes it strong — but only while the two derivations *stay the same derivation*. Every divergence above is a place where a future contract makes the test red for a reason that has nothing to do with the bug it appears to report. **You are removing misdiagnosis cost, not fixing a live break.**

## SCOPE (numbered; each item testable)

1. **F-1149-1 — retire the dead `mirrored` column.** Choose ONE, and **state which and why in your report**:
   - **(a) Drop the derived column** and assert the runtime never mirrors outright (`expect(snapshot.mirrored).toBe(false)`), with a comment naming *why* it is always false for this contract (every alias resolves to a real row).
   - **(b) Derive it honestly** — compute `mirrored` from whether the alias resolved to a **different** direction's row (i.e. `rowDirection !== direction`), which is a property that genuinely varies across the 8 directions and can be `true`.
   These are not equivalent and (b) is a **behaviour change to the expectation**: under (b) the four diagonal aliases would expect `mirrored === true`, which the runtime **does not** report. **If you pick (b), you must first check what the runtime actually sets `mirrored` to and match reality — if they disagree, (b) is wrong and you take (a).** Say so explicitly either way. ⛔ Do **not** invent a new contract key, and do **not** change `characters.v2.json`.
2. **F-1149-2 — derive the frame count the way the runtime does.** Replace `length: banditWalk8.grid.cols` with the runtime's own rule (`frameCount ?? cols`, floored at 1) so the two cannot drift. Today both are `8`, so **the expected frame list must be byte-identical before and after** — prove it (scope 5).
3. **F-1150-4 — make the row lookup agree with the runtime.** Honour an explicit `row` on the sheet if present, and compare case-insensitively, mirroring `SpriteAnimator.ts:1027`. Keep the spec's **throw** on "no row" — a test SHOULD fail loudly where the runtime returns null; just make sure it throws only when the runtime would genuinely find nothing. Note the divergence you keep, and why, in a comment.
4. **No other change to this file.** Not the direction list, not the spawn points, not the assertions at `:106-120` beyond what items 1–3 require.
5. **Prove the expectations did not move.** Before your edit, capture the derived `frames` and `mirrored` values for all 8 directions (a scratch `node -e` print is fine); after your edit, capture them again and **paste both in the report**. They must be **identical** — every finding here is latent, so a change in today's expected values means you changed behaviour, not shape. **A diff in that table is a STOP condition, not something to explain away.**
6. **REJECT conditions — read before you start.** Widening, deleting or `.skip`-ing any assertion; editing `assets/layer-contracts/characters.v2.json`; editing anything under `src/`; making `mirrored` reachable by changing the contract rather than the derivation. Any of these means the task failed even if the suite is green. **A STOP with reasons is a SUCCESS** — if items 1–3 turn out to conflict with the runtime, report that and stop; a well-evidenced *"s1149 and s1150 were wrong about X"* is the most valuable outcome available here.

## FIREWALL

**TOUCH-ONLY:** `e2e/lane-c-activations-assay-office.spec.ts`.
**NO (do not create, edit or delete):** anything under `src/` · `assets/layer-contracts/**` (especially `characters.v2.json`) · any other file under `e2e/` · `playwright.config.ts` · `package.json` · `tasks/**` · `reviews/**` · `STATUS.md` · `tasks/goals.json`. Report adjacent problems in your report — **do not fix them.**

## SELF-CHECK (run all; paste real numbers, both projects)

1. `npx tsc --noEmit` → rc=0.
2. `npm run build` → rc=0.
3. `npx playwright test e2e/lane-c-activations-assay-office.spec.ts --project=desktop-chrome --workers=1 --reporter=list` → **rc=0**, paste the counts.
4. Same spec, `--project=mobile-chrome` → **rc=0**, paste the counts.
5. Adjacent, unmodified-green: `npx playwright test e2e/visual-polish-assets.spec.ts e2e/vp-02b-rotation-resolver.spec.ts --project=desktop-chrome --workers=1 --reporter=list` → rc=0, paste counts.
6. `node scripts/run-guards.mjs` → **8/8**. ⚠️ Run this on a **quiet box** — `stream-showcase-queue.test.mjs:58` is load-sensitive and false-reds under competing CPU (F-1150-3, measured s1150). If it reds, re-run with nothing else running before reporting it.
7. `git status --porcelain -- src/` → **empty output, pasted**. Zero `src/` is a hard requirement.
8. `git status --short` → only `e2e/lane-c-activations-assay-office.spec.ts` (plus your report file).
9. The scope-5 before/after derivation table, both halves pasted.

**READY-FOR-GATES.** Report: which cure you chose for `mirrored` and **why**, the before/after derivation table, the runtime's actual `mirrored` value if you evaluated option (b), every suite count above, and any adjacent problem you saw and deliberately did not touch.
