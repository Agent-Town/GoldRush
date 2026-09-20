# Task f1612-1: the GZ-01 sweep learns the difference between "reported" and "dismissed" (lane-b, commit prefix "fix:")

**FIRE-AUTHORED s1612 (attended review welcome)**

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-b`.

READ FIRST: `AGENTS.md`; `scripts/gazette-backfill-sweep.mjs` **in full, including its header comment** — it already carries the F-1600-1 lesson and you must not undo it; `tasks/BACKLOG.md` row `F-1610-1` (the finding this cures, which specifies its own cure); `marketing/outbox/gazette-queue.md` lines **1255–1275** (the dismissal block you will mark).

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/b main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. **EVIDENCE-ARTIFACT EXCEPTION (F-1266-1): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, and any `.png` — are NEVER "work" and NEVER a STOP. Discard them and PROCEED, listing what you discarded.** Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything. Then `git -C worktrees/lane-b status --short` → must be clean, with the FACTORY-CHURN EXCEPTION — always expected, never a STOP; list them and proceed (F-1407-1): (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*` and any `.png`. What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.

**PREMISE CHECK (do this first, and STOP if any fails):**
```
grep -c "NOT cited anywhere — candidates to judge" scripts/gazette-backfill-sweep.mjs
grep -c "const seen = new Set(outbox)" scripts/gazette-backfill-sweep.mjs
grep -c "None of the four changes anything a player or a rig can see" marketing/outbox/gazette-queue.md
```
All three must return **1** (verified `=1` on main and in this lane at dispatch, s1612). If any returns 0, the ground moved — **STOP and report which one, with the current text of that region.** Do NOT search for a replacement target and do not guess.

## Why (F-1610-1, measured s1610 2026-08-10 by running the instrument before and after its own commit)

`scripts/gazette-backfill-sweep.mjs` answers "which player-visible merges reached no owner-facing sink?" by testing whether a merge's hash **appears anywhere** under `marketing/outbox/`. That test is **presence-keyed, not purpose-keyed** — and s1610 measured the consequence on itself:

> the sweep read *"NOT cited anywhere — candidates to judge: **6**"* before its commit and **0** after, but it had written news for only **TWO** of the six. The other four cleared because the roundup's closing note **names their hashes in prose in order to explain why they are NOT player-visible.**

A hash written as *"here is what landed"* and a hash written as *"here is why this does not count"* are the same byte-string in the same directory. **So any fire that documents its reasoning — which is what this factory asks for everywhere else — empties the candidate list as a side effect of being honest.**

F-1610-1 calls this a **one-way ratchet**: the dismissal is durable and greppable, so nothing is lost, but the merge can never resurface even though player-visibility is a *judgement* the law deliberately leaves to human reading. It names the fix itself:

> **have the sweep count a hash as *dismissed* only when it appears on a line matching a declared marker, and report two numbers — reported *N*, dismissed *M*, candidates *K* — so the dismissals stay visible and re-judgeable instead of vanishing into the cited total. DO NOT build it as a red guard.**

**Re-measured at dispatch (s1612), so you know the live figures:** the sweep today reports **71 player-path-touching merges, 71 cited, 0 candidates** — a clean board that, per this finding, is *a weaker signal than it looks*. The four known dismissals sit in one contiguous prose block at `marketing/outbox/gazette-queue.md:1266–1269`: `5bbdc9182`, `9264046eb`, `5626f3883`, `206d6cffb`. **The marker string does not exist anywhere in `marketing/` or `scripts/` yet** — grep confirmed zero hits at dispatch — so you are introducing it, not adopting it.

## The trap this task exists to avoid

⚠️ **A naive implementation re-creates the exact disease F-1600-1 named.** If "dismissed" requires the marker, and the four existing dismissals lack it, they flip straight back to **candidates** — and every future fire pays the judgement cost on them again, forever. F-1600-1's words: *"a check that reports a discharged duty as owed reports it forever."*

**Therefore the default must be REPORTED, never CANDIDATE:**

| citation state | classify as |
|---|---|
| hash absent from `marketing/outbox/` | **candidate** (unchanged) |
| hash present, no marker in scope | **reported** (unchanged behaviour — no re-judgement tax) |
| hash present, marker in scope | **dismissed** (new third number) |

## Scope

1. **Add a declared purpose marker** and classify with it. Use the literal `NOT PLAYER-VISIBLE`. Define its scope as the **paragraph** — the run of contiguous non-blank lines — in which it appears, **not the single line.** This is required, not stylistic: the four existing dismissals are wrapped prose spanning `:1266–1269`, so a same-line rule would catch at most one of them. (This is F-1425-2's lesson — `grep` is line-oriented and prose wraps — applied to a classifier instead of a citation key.)

2. **Report three numbers, not two,** preserving the existing output shape and its existing lines: `reported N`, `dismissed M`, `candidates K`. Keep the existing `...of which cited only via a CONTAINED commit` line working. Print the dismissed merges as their own short list (hash + date + subject), so a later fire can re-judge them — **that visibility is the entire point of the finding.**

3. **Retro-mark the four known dismissals** by adding the marker to the paragraph at `marketing/outbox/gazette-queue.md:1266–1269`. Add the marker text only; **do not rewrite, re-word, or re-flow that note** — it is published owner-facing prose and s1610's reasoning inside it is the record. After this, the sweep must report `dismissed 4` rather than folding them into `reported`.

4. **Add `scripts/gazette-backfill-sweep.test.mjs`** and root it in `test:node-guards` in `package.json`. Test the **classifier against fixture text**, not against the live board — a test that reads the live outbox goes stale every time a fire publishes. Cover all four states: absent → candidate · present-unmarked → reported · present-marked → dismissed · **marked hash on a wrapped continuation line → dismissed** (the case scope 1 exists for). Run `npm run test:gate-callers` and report it green: a new script that is not rooted reds `gate-caller-audit` under an innocent-looking name.

5. **It stays WARN-level. Exit 0 always, in every state.** F-1600-1 forbids mechanising this as a red guard, because *"player-visible" is a judgement* and such a guard *"gets excused into uselessness within a week"*. Do not add a `--strict` mode, do not exit non-zero on candidates, do not wire the sweep itself into any gate. (Scope 4's test is a test **of the tool's classifier**, which is a different thing and is fine.)

6. **Do not weaken the F-1600-1 wide check while you are in here.** The sweep must keep grepping the **8-char short hash across the whole of `marketing/outbox/`** (both sinks), and must keep testing contained commits as well as the merge hash. Its header comment explains why in detail — if your change makes any of that comment false, **update the comment in the same edit**; a stale comment on this particular script is how the original bug survived.

If you find yourself about to exit without changes, WRITE WHY into your report first — a silent no-op wastes a queue slot and a gate.

## Firewall

Touch ONLY: `scripts/gazette-backfill-sweep.mjs` · `scripts/gazette-backfill-sweep.test.mjs` (new) · `package.json` (the `test:node-guards` line ONLY, to root the new test) · `marketing/outbox/gazette-queue.md` (**adding the marker to the `:1266–1269` paragraph ONLY**).

NO changes to: `src/**` · `e2e/**` · any other script in `scripts/**` · any other `marketing/outbox/` file or any other part of `gazette-queue.md` (published owner-facing prose — do not tidy it) · `tasks/**`, `reviews/**`, `STATUS.md`, `tasks/goals.json`, `tasks/BACKLOG.md` (the fire owns all ledger surfaces) · `playwright.config.ts` (this task adds no e2e) · other lanes' work.

## Self-check (evidence, not vibes)

- `npx tsc --noEmit` clean; `npm run build` green.
- `node scripts/gazette-backfill-sweep.mjs` runs clean and **exits 0**. Report the three numbers. Expected after scope 3: **candidates 0, dismissed 4, reported 67** against today's 71 — if your run disagrees, report what you actually saw and why; the window is `--since=2026-08-05` and rolls, so the total may drift by a merge or two. **Do not tune the code to hit these numbers** — they are a sanity check, not a target.
- **Prove the marker actually discriminates, rather than the split merely printing.** Temporarily remove the marker you added in scope 3, re-run, and confirm the four move from `dismissed` back to `reported` (**not** to `candidates` — if they land in candidates, scope 1's default is wrong and that is the bug this task exists to prevent). Restore it. **Report both readings.**
- `node --test scripts/gazette-backfill-sweep.test.mjs` green; report the test count.
- `npm run test:gate-callers` green (proves the new test is rooted).
- `npm run test:node-guards` — report rc and the pass/fail counts. Run it **ALONE**: it is ~181s and contends with any concurrent battery on shared fixtures (F-1537-1).
- No e2e, no screenshots, no perf table: this task changes a factory script and one line of marketing prose, and renders nothing.

End: **READY-FOR-GATES** + report (a) the three pre-flight grep counts, (b) the sweep's three numbers before and after your marker edit, (c) the marker-removal control's two readings, (d) the new test's count and `test:gate-callers` result, (e) `test:node-guards` rc, (f) confirmation that the sweep still exits 0 in every state you exercised.
