# lane-f1506-2-e9-roster-bisect — FIRE-AUTHORED (attended review welcome)

**Role:** Codex runner, lane-a. **Workdir:** `worktrees/lane-a` (branch `lane/a`).

## READ FIRST (paths, not memory)
- `e2e/e9-roster.spec.ts` — the subject. Its three `test(...)` titles are at `:48`, `:113`, `:167`.
- `logs/suite-red-inventory.md` — the exoneration ledger. Read its header block and lines ~579-581.
- `scripts/red-inventory-lookup.mjs:141` — the three-verdict logic (`KNOWN-RED` / `CLEAN-IN-INVENTORY` / `NOT-IN-INVENTORY`).
- `tasks/BACKLOG.md` — the rows for **F-1506-2** (this task's WHY) and **F-1503-3** (the row it corrects).
- `src/game/Game.ts` — the era gate `activeEpoch.order >= 9 && !multiplayerActive() && heroWeaponsEnabledFor(...)`, named by F-1503-3 as the suspected surface. **Suspected, not proven — do not assume it.**

## WHY (evidence, quoted and dated)
**F-1506-2 (s1506, 2026-08-07) — measured this fire, both endpoints, same worktree / same shell / same `--workers=1`:**
- At `eb3a8a01200b57cbbfce73ddc44898361669b391` (2026-07-28T09:25+07, the commit the suite-red-inventory run measured): **`e2e/e9-roster.spec.ts` → 6 passed.**
- At current `main` (post-`4efc59645`): **4 failed / 2 passed** — titles `E9 placeholders preserve siege/thief flags and cure-arms exits` (`:113`) and `plain Red Fields boot stays error-free without the debug harness` (`:167`), **both projects**.

⇒ This is a **REGRESSION inside a bounded window**, not a ledger gap. `red-inventory-lookup` returns
`CLEAN-IN-INVENTORY`, and that verdict is **CORRECT** — it means the spec *ran and passed* in the
recorded run, which the re-execution above independently confirms. The two halves of the inventory
are the **same run** (`logs/suite-red-inventory-compact.json` `stats.expected: 2006` matches the
markdown headline `Total passed: 2006`, exactly as `logs/suite-red-inventory.md:581` claims).

⚠️ **This task exists BECAUSE the inherited recommendation was wrong.** F-1503-3 (s1503) diagnosed
*"a stale exoneration ledger… it converts UNKNOWN into a false CLEAN"* and REC'd *"refresh the red
inventory FIRST so it stops under-reporting"*. Two later fires repeated the verdict word as
`NOT-IN-INVENTORY` (the opposite meaning — *never ran*). Nothing is stale and nothing is unknown:
**refreshing the inventory would write this live regression into the ledger as an accepted
known-red, laundering a findable bug into an excused one.** Do not refresh the inventory.

## SCOPE (each item testable)
1. **Validate the predicate on BOTH known outcomes before bisecting anything** (a bisect predicate
   that has not been shown to distinguish the endpoints is not a predicate). Run
   `npx playwright test e2e/e9-roster.spec.ts --workers=1` at `eb3a8a012` → expect **6 passed**, and
   at `main` → expect **4 failed / 2 passed**. Report both raw tallies. If either endpoint
   disagrees with the numbers above, **STOP and report** — the window has moved and the rest of
   this task is void.
2. **Bisect `eb3a8a012..main`** using that predicate. Report the bisect log (each commit tested and
   its verdict) and name the **culprit commit** with its hash, subject and `--stat`.
3. **Diagnose from the failing assertions, not from the suspicion in READ FIRST.** For each of the
   two failing titles, report the assertion, its **expected vs received values**, and how the
   culprit commit's diff produces that value. If the culprit does not explain both titles, say so.
4. **Write `docs/bench/e9-roster-regression.md`**: the two validated endpoints with tallies, the
   bisect table, the culprit commit, the per-title expected/received values, and the diagnosis.
   This file is the deliverable and must exist even if scope 5 does not run.
5. **Cure ONLY if it is small and provable.** If the fix is ≲20 lines and makes
   `e2e/e9-roster.spec.ts` **6/6 green** on both projects with no other spec moving, land it and
   report the before/after tallies. Otherwise **STOP-and-report with the culprit named** — an
   unclear cure is a separate slice with its own design question, and guessing at one is worse
   than a named culprit. State explicitly which branch you took and why.

## FIREWALL
**TOUCH-ONLY:** `docs/bench/e9-roster-regression.md` (new) · under scope 5 ONLY: the culprit source
file(s) your diagnosis names.
**NO:**
- ❌ **Never edit `e2e/e9-roster.spec.ts`.** It is the instrument. Making the test agree with the
  regression is the failure this task exists to prevent.
- ❌ Never touch `logs/suite-red-inventory.md` or `logs/suite-red-inventory-compact.json` — see WHY.
- ❌ No other spec, no unrelated `src/` cleanup, no dependency changes.
- ❌ Do not `git bisect reset` onto a branch other than the one you started from; leave `lane/a`
  checked out at its head when you finish.

## PRE-FLIGHT
Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/a main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. **EVIDENCE-ARTIFACT EXCEPTION (F-1266-1, s1266): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, and any `.png` screenshot — are NEVER "work" and NEVER a STOP, whether they sit as uncommitted dirt or as the entire content of an ahead commit. Screenshots are never byte-identity gated, so their bytes differ from main forever. Discard them (`git checkout -- <paths>` / reset) and PROCEED, listing what you discarded.** Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything. **THEN A CLEANLINESS LINE: `git -C worktrees/lane-a status --short` → must be clean, with the FACTORY-CHURN EXCEPTION — always expected, never a STOP; list them and proceed (F-1407-1): (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*` and any `.png`. What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.**

**CURRENCY CHECK (F-1424-3):** before scope 1, run
`grep -c "test('E9 placeholders preserve siege/thief flags and cure-arms exits'" e2e/e9-roster.spec.ts`
→ must be **1**. If it is **0**, the lane is stale or the spec moved: STOP and report, do not proceed.

## SELF-CHECK before READY-FOR-GATES
- `npx tsc --noEmit` clean · `npm run build` green.
- `npx playwright test e2e/e9-roster.spec.ts --workers=1` — report the tally for **both projects**.
  Expected: **6 passed** if scope 5 landed a cure; **4 failed / 2 passed** (unchanged) if you stopped
  at scope 4. Say which, and never report a green you did not obtain.
- If scope 5 landed: `npm run test:node-guards` (a cure to `src/sim`, `src/systems` or `src/entities`
  makes it MANDATORY — F-1460-1) plus the adjacent specs your diff's files appear in, derived with
  `grep -rln`, not guessed.
- `docs/bench/e9-roster-regression.md` exists and contains the bisect table and the culprit hash.

**READY-FOR-GATES** + report: both validated endpoint tallies · the bisect log · the culprit commit
(hash + subject + `--stat`) · per-title expected/received · which scope-5 branch you took and why ·
the final `e9-roster` tally.
