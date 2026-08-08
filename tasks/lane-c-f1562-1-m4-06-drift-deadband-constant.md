# Task f1562-1: the widened drift citation spans a NINTH constant — name the 0.06 deadband (LANE-C, commit prefix "test:")

**FIRE-AUTHORED (attended review welcome)** — s1562, 2026-08-08.

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-c`.

READ FIRST: `AGENTS.md`; `reviews/f1561-2-m4-06-drift-constants-both-axes.md` (the drain that produced this task — read **F-1562-1**); `e2e/m4-06-embodiment.spec.ts` (the test `permission-denied receipts do not send the Prospector to the denied target`, and the provenance comment above its two `0.4` assertions); `src/agent/Embodiment.ts` (the `updateIdleDrift` body at `:285–:295` **and** `idlePoint` at `:297+`).

**SEQUENCING LAW:** this task depends on f1561-2 having merged. Verify with
`git log --oneline | grep -q 'name BOTH axes in the denied-receipt drift provenance comment'` — search the WHOLE log, not `git log -N`.
If it is absent: **STOP and report "f1561-2 not landed"**. Do not improvise the dependency.
Then confirm the arrangement you are editing is the merged one. All four must print **1**:

- `grep -c "this.drifting = distance > 0.06;" src/agent/Embodiment.ts`
- `grep -c "const step = Math.min(distance, Balance.agent.moveSpeed \* 0.58 \* delta);" src/agent/Embodiment.ts`
- `grep -c "the -1.8 x follow offset and" e2e/m4-06-embodiment.spec.ts`
- `grep -c "so changing either axis moves this bound" e2e/m4-06-embodiment.spec.ts`

If any prints 0, the lane is stale — **STOP and report "lane stale, expected the merged f1561-2 arrangement"**.

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/c main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. **EVIDENCE-ARTIFACT EXCEPTION (F-1266-1): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, and any `.png` — are NEVER "work" and NEVER a STOP. Discard them and PROCEED, listing what you discarded.** Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything. **THEN A CLEANLINESS LINE: `git -C worktrees/lane-c status --short` → must be clean, with the FACTORY-CHURN EXCEPTION — always expected, never a STOP; list them and proceed (F-1407-1): (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*` and any `.png`. What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.**

⚠️ **NOTE ON LANE FRESHNESS, so a true STOP is not confused with a false one (F-1424-3 / F-1425-2).** At authoring time `lane/c` was **88 commits behind main** and `e2e/m4-06-embodiment.spec.ts` was among the files it lacked — so the four keys above would have returned **0 for a reason that is not drift**, producing a STOP whose message accuses the wrong subject. ✅ **The dispatching fire cured this before queueing rather than leaving it to you: master committed first (`fe6aec3d3`), then `lane/c` reset to `main` (`58117a5d7` → `fe6aec3d3`, worktree clean), then all four keys verified to return 1 ON MAIN **and** 1 IN THE LANE, then `cp`.** You are therefore starting from a fresh lane. **A 0 on any key now means real drift — believe it and STOP.** Run the key checks whenever you like relative to the pre-flight; both orders are correct as dispatched.

## Why (F-1562-1, s1562 drain of f1561-2, 2026-08-08)

f1561-2 widened the provenance citation from `Embodiment.ts:288–299` to `:288–:300` so it would
reach the z anchor, and grew the named-constant list from four to eight. **That was correct and it
merged** (`92559f683963d964c757904fc1d3e1e3493625e6`, 9/9 desktop + 9/9 mobile).

✓ **VERIFIED BY READING `src/agent/Embodiment.ts:285–301` at the drain, not inferred: the cited
range contains NINE numeric constants and the comment names eight.** The unnamed one is the first
line of the range:

```ts
this.drifting = distance > 0.06;   // :288
if (!this.drifting) return;        // :289
```

`0.06` is a **drift deadband**. The Prospector stops correcting toward its idle anchor once it is
within `0.06` of it, so the residual offset it tolerates is part of what bounds `driftAbs` — exactly
as much a coupled product constant as the oscillation amplitudes already named. A tuning slice that
widened the deadband would move the `0.4` bound and the comment would give no hint why.

🔑 **THE INSTRUCTIVE HALF, and the reason this is worth one more comment-only pass: this is the SAME
shape f1561-2 cured, at the OTHER END of the range.** F-1561-2 was *"the citation stops one line
short of a constant it omits."* This is *"the citation now reaches a constant it omits."* Widening a
range to capture missing evidence can capture **more** missing evidence than you were looking for —
so a range widened for one reason must be re-read **end to end**, not only at the edge you moved.

⚖️ **PRE-EXISTING, NOT A REGRESSION:** `0.06` sat inside the old `288–299` range too, unnamed in
both revisions. Nothing shipped worse than it was.

## Scope (numbered, each testable)

1. **Re-read the cited range yourself before editing anything.** Read `src/agent/Embodiment.ts`
   lines `288`–`300` inclusive and enumerate **every numeric literal** in them. Report the list.
   ⚠️ **Do NOT trust this task's count of nine** — the whole reason this task exists is that the
   previous count was wrong twice (seven, then eight). **If you find a TENTH, that is a finding to
   report, not an error, and it belongs in the comment too.**
2. **Name the deadband in the provenance comment** above the two `0.4` assertions in
   `e2e/m4-06-embodiment.spec.ts`. State what it *does*, not merely its value — a reader needs to
   know it is the threshold below which the agent stops correcting, because that is why it bounds
   the residual. Keep the existing eight named constants and the `Math.hypot(dx, dz)` sentence.
3. **Keep the citation honest.** After the edit, the range the comment cites must contain exactly
   the constants the comment names — no more, no fewer. If naming the deadband is easier done by
   *narrowing* the range than by widening the list, that is an acceptable alternative **only if you
   state which you chose and why** in your report.
4. **Do not touch either bound.** Both `expect(...).toBeLessThan(0.4)` lines stay byte-identical.

## Firewall

**TOUCH-ONLY:** `e2e/m4-06-embodiment.spec.ts` — and within it, **only** `//` comment lines.

**NO:**
- **NO `src/**`.** `src/agent/Embodiment.ts` is **READ-ONLY** — you are documenting it, not changing it. Do not "improve" the `0.06` into a named constant; that is a product change and is out of scope.
- **NO change to any numeric `expect(...)` argument**, in this spec or any other.
- **NO** new tests, no test renames, no `test.skip`.
- **NO** `tasks/**`, `specs/**`, `reviews/**`, `scripts/**`, `package.json`.
- **NO** re-running or re-pinning `scripts/gr-sim.test.mjs` — unrelated.

## Self-check (name the exact evidence; a green you did not run is a false green)

1. `npx tsc --noEmit` → rc=0.
2. `npm run build` → green.
3. `npx playwright test e2e/m4-06-embodiment.spec.ts --project=desktop-chrome --workers=1` → **9 passed**.
4. `npx playwright test e2e/m4-06-embodiment.spec.ts --project=mobile-chrome --workers=1` → **9 passed**.
   ⚠️ **`--workers=1` is mandatory, not an optimisation (§3.1 / F-1270-1).**
5. **Comment-only proof, mechanical rather than eyeballed** — paste the number:
   `git diff -- e2e/m4-06-embodiment.spec.ts | grep -E '^[+-]' | grep -vE '^(\+\+\+|---)' | grep -vE '^[+-]\s*//' | wc -l` → must print **0**.
6. Confirm both `0.4` assertion lines are byte-identical to main.
7. **`test:node-guards` is NOT required** — the diff is `e2e/` only, so **F-1460-1 does not bind.** Do not run it; say so rather than implying coverage.

**READY-FOR-GATES.** Report: the full enumeration of numeric literals in `:288–:300` from step 1; whether the count is nine or something else; which approach you chose in step 3 (widen the list vs narrow the range) and why; the step-5 number; and the four gate results.
