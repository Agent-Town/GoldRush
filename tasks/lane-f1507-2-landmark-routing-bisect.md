# lane-f1507-2-landmark-routing-bisect — FIRE-AUTHORED (attended review welcome)

**Role:** Codex runner, lane-a. **Workdir:** `worktrees/lane-a` (branch `lane/a`).

## READ FIRST (paths, not memory)
- `e2e/landmark-collision.spec.ts` — the subject. The failing test is `test('enemy blocker routing is deterministic and goes around a county landmark'` at `:68`; the failing assertion is `:91`.
- `tasks/BACKLOG.md` — the rows for **F-1507-2** (this task's WHY), **F-1460-1** (the named hypothesis), and **F-1506-2** (the bisect shape this task copies).
- `logs/suite-red-inventory.md` — the exoneration ledger. Read its header block and the harness-provenance section (~`:577`).
- `src/entities/Enemy.ts` — the stuck-watchdog and `route.blocker` gating named by F-1460-1. **Named, not proven — do not assume it.**
- `src/systems/BuildSystem.ts` — the other half of the `4ab487437` diff (+139/-31).

## WHY (evidence, quoted and dated)
**F-1507-2 (s1507)** recorded `e2e/landmark-collision.spec.ts:68` ("enemy blocker routing is deterministic and goes around a county landmark") red on **both projects**, controlled
against a pre-merge arm at `a4556dca5` in the same worktree and shell, so it is **not** attributable to
the f1506-2 merge. **s1508 overturned the OTHER half of F-1507-2** (`072-era-activation`) by dating the
ledger — that spec's red was a stale pasted literal, not a regression.

⚠️ **This half survives the same date test, and that is why it is real.** Measured s1509:
- The red-inventory snapshot is dated **2026-07-29** (`logs/suite-red-inventory.md`, harness-provenance section). `CLEAN-IN-INVENTORY` therefore means **"ran and passed on 2026-07-29"**.
- `4ab487437` (`runner(lane-c): f1452-1-fort-solidity-routes-long-static-blockers.md`) is dated **2026-08-04T07:24+07** — **six days AFTER the snapshot**.
- Unlike the 072 case, the failing assertion is **behavioural** (`toBe(true)` on a routing path), not a pasted literal. A behaviour change after the snapshot is a **regression**, not a stale broadcast.

**Reproduced on current main (`9e6195f45`) this fire, `--workers=1`: 2 failed / 8 passed**, desktop AND
mobile, both at `:91`:
```
expect(first.some(({ x }) => Math.abs(x - landmark.x) > landmark.halfX)).toBe(true);
  Expected: true
  Received: false
```
⇒ The scripted enemy **never deviates in x at all** — it is not routing around the landmark, it is
walking straight at it. Note `:93` (never *inside* the landmark) is NOT the assertion that fails.

🎯 **The hypothesis, stated as a hypothesis:** F-1460-1 records `4ab487437` as having regated enemy
routing on `route.blocker`, costing 8 kills over 20 waves — deliberate, spec-green, and merged at
`07213c73`. It is a dated, plausible culprit **and F-1507-2 explicitly says it was never tested.**
**Test it. Do not assume it.**

## SCOPE (each item testable)
1. **Validate the predicate on BOTH endpoints before bisecting anything** (a predicate not shown to
   distinguish the endpoints is not a predicate). Run
   `npx playwright test e2e/landmark-collision.spec.ts --workers=1` at:
   - `c063b5e59` (the parent of the candidate, 2026-08-04T05:50+07) → **expect 10 passed**
   - current `main` → **expect 2 failed / 8 passed**

   Report both raw tallies. If either disagrees, **STOP and report** — the window has moved and the
   rest of this task is void. ⚠️ If `c063b5e59` is ALREADY red, the candidate is exonerated and the
   first-bad commit is **earlier**: widen the window back toward the 2026-07-29 snapshot and say so.
2. **Test the named candidate directly**: `4ab487437` vs its parent `c063b5e59`. If `4ab487437` is
   red and `c063b5e59` green, the first-bad commit is named without a full bisect — record it and
   skip to scope 4.
3. **Otherwise bisect `c063b5e59..main`** with that predicate. Report the bisect log (each commit
   tested and its verdict) and name the culprit with hash, subject and `--stat`.
4. **Diagnose from the failing assertion, not from the suspicion in READ FIRST.** Report what the
   enemy path actually is (dump the `path` array from the failing run — it is returned by the
   `run()` helper at `:73`), what it should be, and how the culprit's diff produces that path. If
   the culprit does not explain a path with **zero x-deviation**, say so plainly.
5. **Write `docs/bench/landmark-routing-regression.md`**: both validated endpoint tallies, the
   candidate result, the bisect table if one was needed, the culprit commit, the observed vs
   expected enemy path, and the diagnosis. **This file is the deliverable and must exist even if
   scope 6 does not run.**
6. **Cure ONLY if it is small and provable.** If the fix is ≲20 lines and makes
   `e2e/landmark-collision.spec.ts` **10/10 green** on both projects with no other spec moving, land
   it and report before/after tallies. Otherwise **STOP-and-report with the culprit named.**
   ⚠️ **Routing is contested ground:** `4ab487437` deliberately changed enemy routing and was
   spec-green when it merged, so "fixing" this red may re-break fort solidity. If your cure would
   move `f1452-1`'s own behaviour, that is a **design fork — STOP**, do not choose for the owner.
   State explicitly which branch you took and why.

## FIREWALL
**TOUCH-ONLY:** `docs/bench/landmark-routing-regression.md` (new) · under scope 6 ONLY: the culprit
source file(s) your diagnosis names.
**NO:**
- ❌ **Never edit `e2e/landmark-collision.spec.ts`.** It is the instrument. Making the test agree with
  the regression is the failure this task exists to prevent.
- ❌ Never touch `logs/suite-red-inventory.md` or `logs/suite-red-inventory-compact.json` — refreshing
  the ledger would launder a live regression into an accepted known-red (the F-1506-2 lesson).
- ❌ Never re-pin `scripts/gr-sim.test.mjs` to make a red go away (F-1441-3). A moved sim number is a
  finding with a named cause, never a re-pin reflex.
- ❌ No other spec, no unrelated `src/` cleanup, no dependency changes.
- ❌ Do not `git bisect reset` onto a branch other than the one you started from; leave `lane/a`
  checked out at its head when you finish.

## PRE-FLIGHT
Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/a main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. **EVIDENCE-ARTIFACT EXCEPTION (F-1266-1, s1266): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, and any `.png` screenshot — are NEVER "work" and NEVER a STOP, whether they sit as uncommitted dirt or as the entire content of an ahead commit. Screenshots are never byte-identity gated, so their bytes differ from main forever. Discard them (`git checkout -- <paths>` / reset) and PROCEED, listing what you discarded.** Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything. **THEN A CLEANLINESS LINE: `git -C worktrees/lane-a status --short` → must be clean, with the FACTORY-CHURN EXCEPTION — always expected, never a STOP; list them and proceed (F-1407-1): (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*` and any `.png`. What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.**

**CURRENCY CHECK (F-1424-3):** before scope 1, run

`grep -c "enemy blocker routing is deterministic and goes around a county landmark" e2e/landmark-collision.spec.ts`

→ must be **1**. If it is **0**, the lane is stale or the spec moved: STOP and report, do not proceed.

## SELF-CHECK before READY-FOR-GATES
- `npx tsc --noEmit` clean · `npm run build` green.
- `npx playwright test e2e/landmark-collision.spec.ts --workers=1` — report the tally for **both
  projects**. Expected: **10 passed** if scope 6 landed a cure; **2 failed / 8 passed** (unchanged) if
  you stopped at scope 5. Say which, and **never report a green you did not obtain.**
- If scope 6 landed: `npm run test:node-guards` is **MANDATORY** (a cure to `src/sim`, `src/systems` or
  `src/entities` triggers F-1460-1), plus the adjacent specs your diff's files appear in, derived with
  `grep -rln`, not guessed. Report the `gr-sim` Baron tally explicitly.
- `docs/bench/landmark-routing-regression.md` exists and contains the endpoint tallies and the culprit hash.

**READY-FOR-GATES** + report: both validated endpoint tallies · the candidate `4ab487437` verdict ·
the bisect log if one was needed · the culprit commit (hash + subject + `--stat`) · the observed
enemy path vs expected · which scope-6 branch you took and why · the final `landmark-collision` tally.
