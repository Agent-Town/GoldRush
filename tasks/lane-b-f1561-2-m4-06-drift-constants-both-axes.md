# Task f1561-2: the drift bound couples to SEVEN constants, not four — name the z axis and widen the citation (LANE-B, commit prefix "test:")

**FIRE-AUTHORED (attended review welcome)** — s1561, 2026-08-08.

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-b`.

READ FIRST: `AGENTS.md`; `reviews/f1560-1-m4-06-drift-ceiling-provenance.md` (the drain that produced this task — read **F-1561-2**); `e2e/m4-06-embodiment.spec.ts` (the test `permission-denied receipts do not send the Prospector to the denied target`); `src/agent/Embodiment.ts` (the `idlePoint` method).

**SEQUENCING LAW:** this task depends on f1560-1 having merged. Verify with
`git log --oneline | grep -q 'the denied-receipt drift CEILING is geometric'` — search the WHOLE log, not `git log -N`.
If it is absent: **STOP and report "f1560-1 not landed"**. Do not improvise the dependency.
Then confirm the arrangement you are editing is the merged one. All three must print **1**:

- `grep -c "This 0.4 ceiling depends on Balance.agent.moveSpeed" e2e/m4-06-embodiment.spec.ts`
- `grep -c "return Math.hypot(a.x - b.x, a.z - b.z);" e2e/m4-06-embodiment.spec.ts`
- `grep -c "Math.cos(at \* 0.52) \* 0.18" src/agent/Embodiment.ts`

If any prints 0, the lane is stale — **STOP and report "lane stale, expected the merged f1560-1 arrangement"**.

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/b main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. **EVIDENCE-ARTIFACT EXCEPTION (F-1266-1): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, and any `.png` — are NEVER "work" and NEVER a STOP. Discard them and PROCEED, listing what you discarded.** Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything. **THEN A CLEANLINESS LINE: `git -C worktrees/lane-b status --short` → must be clean, with the FACTORY-CHURN EXCEPTION — always expected, never a STOP; list them and proceed (F-1407-1): (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*` and any `.png`. What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.**

## Why (F-1561-2, s1561 drain of f1560-1, 2026-08-08)

F-1560-2 existed for one reason: the `0.4` drift bound couples to product constants **named nowhere
near the assertion**, so an ordinary tuning slice would red this e2e with no hint why, and the next
fire would reach for the tolerance — the loop F-1285-2 has been in for 275 fires.

f1560-1 landed that cure and it is **half a cure**. ✓ **VERIFIED BY READING, not inferred:**

- `e2e/m4-06-embodiment.spec.ts:85–86` — `distance()` is `Math.hypot(a.x - b.x, a.z - b.z)`, i.e.
  **x AND z**; and `driftAbs = distance(after.position, before.position)`.
- `src/agent/Embodiment.ts:299` — x anchor: `hero.x - 1.8 + Math.sin(at * 0.78) * 0.22`
- `src/agent/Embodiment.ts:300` — z anchor: `hero.z - 1.25 + Math.cos(at * 0.52) * 0.18`

The shipped comment names `moveSpeed` (4.8), the `0.58` idle multiplier, the `-1.8` offset and the
`±0.22 / 0.78 Hz` oscillation — **four of the seven**. The three z-axis terms (`-1.25`, `±0.18`,
`0.52 Hz`) are unnamed, even though `driftAbs` is a 2-D distance that depends on them exactly as much.

🔑 **The omission is SYSTEMATIC, not a typo, and that is the instructive part: the comment cites
`Embodiment.ts:288–299`, and the z line is `:300`. The cited range ends exactly one line above the
constants it omits** — so every reader who follows the citation stops just before the evidence
against it. That is how it passed a review that was otherwise looking straight at it.

## Scope

1. **Name the z axis.** In `e2e/m4-06-embodiment.spec.ts`, extend the comment block above
   `expect(gapClosed).toBeLessThan(0.4);` so it names **all seven** constants the bound couples to —
   the four already there plus `-1.25` (z follow offset), `±0.18` (z amplitude) and `0.52 Hz`
   (z frequency).

2. **Widen the citation.** The same comment cites `Embodiment.ts:288–299`. Make it `:288–:300` (or
   whatever range actually spans both anchor lines in the merged tree — **verify by reading the file,
   do not trust this number**; if `idlePoint` sits elsewhere after a rebase, cite what you find and
   say so in your report).

3. **State WHY the 2-D fact matters, in one clause**, so the next reader does not have to re-derive
   it: `driftAbs` is `Math.hypot(dx, dz)`, so a change to either axis moves this bound.

4. **Report the arithmetic you did NOT change.** Confirm in your report that both
   `expect(...).toBeLessThan(0.4)` lines are byte-identical to main, and that
   `git diff main -- e2e/m4-06-embodiment.spec.ts` shows **comment lines only**.

## Firewall

**TOUCH-ONLY:** `e2e/m4-06-embodiment.spec.ts` — **comment lines exclusively.**

**NO:**
- **NO `src/**` edits.** The constants are being *named*, not tuned. A test-provenance slice that
  starts editing the agent is how a flake becomes a regression.
- **NO change to any numeric argument of any `expect(...)`.** Not the `0.4`s, not the `0.5`, not the
  `0.01`. If you believe a bound is wrong, that is a FINDING to report, never an edit.
- **NO restoring `waitForTimeout`**, no re-asserting `after.lastLine` (F-1558-1), no disturbing the
  f1557-3 assertion order, no touching `advanceSim(0.35)` (f1559-1).
- **NO new test, no new artifact.** This is a comment-only slice and it should diff as one.

## Self-check (run these, paste the output)

1. `npx tsc --noEmit` → rc=0.
2. `npm run build` → green.
3. `npx playwright test e2e/m4-06-embodiment.spec.ts --project=desktop-chrome --workers=1` → 9 passed.
4. `npx playwright test e2e/m4-06-embodiment.spec.ts --project=mobile-chrome --workers=1` → 9 passed.
5. **The comment-only proof:** `git diff main -- e2e/m4-06-embodiment.spec.ts` and confirm every
   changed line begins with `//` (after whitespace). Paste the diff — it is short, and it IS the
   deliverable.

`--workers=1` is not an optimisation, it is a correctness requirement of the fire/lane shell (F-1270-1).

**READY-FOR-GATES.** Report: the final comment block verbatim, the seven constants as you named them,
the line range you cited and what you found when you read `idlePoint`, and the comment-only diff proof.
If you find an **eighth** constant the bound couples to that this master did not name, say so — that
is a better outcome than a tidy seven, and this task would rather be corrected than confirmed.
