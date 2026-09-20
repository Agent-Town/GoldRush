# Task f1611-1: teach the two BUILD-rejection assertions to read a detail (lane-b, commit prefix "fix:")

**FIRE-AUTHORED s1611 (attended review welcome)**

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-b`.

READ FIRST: `AGENTS.md`; `reviews/f-door-6-reach-vs-zone.md` (the drain that found this — finding **F-1611-1**, with its control); `tasks/BACKLOG.md` row `F-1611-1`.

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/b main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. **EVIDENCE-ARTIFACT EXCEPTION (F-1266-1, s1266): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, and any `.png` screenshot — are NEVER "work" and NEVER a STOP, whether they sit as uncommitted dirt or as the entire content of an ahead commit. Screenshots are never byte-identity gated, so their bytes differ from main forever. Discard them (`git checkout -- <paths>` / reset) and PROCEED, listing what you discarded.** Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything. Then `git -C worktrees/lane-b status --short` → must be clean, with the FACTORY-CHURN EXCEPTION — always expected, never a STOP; list them and proceed (F-1407-1): (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*` and any `.png`. What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.

**PREMISE CHECK (do this first, and STOP if it fails):**
```
grep -c "expect(rejected.order?.reason).toContain('FAILED: BUILD action was rejected');" e2e/ap-standing-orders.spec.ts
grep -c "expect(lifecycle.orders\[0\]?.reason).toContain('FAILED: BUILD action was rejected');" e2e/ap-standing-orders.spec.ts
```
Both must return **1**. If either returns 0, the ground moved — **STOP and report which one, with the current text of that line.** Do NOT search for a replacement target and do not guess.

## Why (F-1611-1, measured s1611 2026-08-10 while gating `f-door-6-reach-vs-zone`)

`e2e/ap-standing-orders.spec.ts:408` — inside `e2e/ap-standing-orders.spec.ts:342` ("plain-boot production orders pan a seam and place a real building") — **fails on main today**:

```
Expected substring: "FAILED: BUILD action was rejected"
Received string:    "FAILED (insufficient_gold): BUILD action was rejected."
```

**Control-confirmed pre-existing**, byte-identical on a merged tree and on a clean-main tree, same harness, same hour, two scratch ports each proven to serve its own tree. Reproduces on **desktop AND mobile**. `red-inventory-lookup e2e/ap-standing-orders.spec.ts` returns **NOT-IN-INVENTORY on a 12-day-stale snapshot**, so it is untracked, not excused.

**The test is the stale party, not the door.** The `detail` parenthetical is f-door-2's deliberate, additive design; the assertion was written before it existed and was never widened. The received detail here is `insufficient_gold` — a label the f-door-6 rename never touched, which is what exonerates the slice that found this.

**And it is a class, not an instance.** The identical literal appears at a second site, `e2e/ap-standing-orders.spec.ts:218`, inside `e2e/ap-standing-orders.spec.ts:123` ("seeded standing orders obey priority, gates, legal actions, surprises, and the live rung"). That one **passes today** only because its BUILD fails on a revoked rung, a path that produces no `detail` — so it is a latent copy of the same defect that reds the moment that path gains one. Fix both or the cure survives in the sibling.

## Scope

1. **Widen both assertions to accept an optional `detail` parenthetical while still pinning what the test actually means.** The intent at both sites is *"this order was rejected, and the reason names a rejected BUILD action."* Preserve that; do not weaken it to a bare substring match on `BUILD action was rejected`, which would stop pinning the `FAILED` prefix. A regex of the shape `/^FAILED( \([a-z_]+\))?: BUILD action was rejected/` satisfies both requirements; you may choose a different expression, but it MUST still fail if the `FAILED` prefix disappears.

2. **At `:408`, additionally assert the detail is a member of the door's vocabulary when one is present.** The five legal values are `insufficient_gold`, `out_of_reach`, `out_of_zone`, `collision`, `cap_reached` (`src/systems/buildRejectionDetail.ts`). Import the type or restate the list — your call — but the test must now catch a detail that is *not* in the vocabulary. **Do NOT hard-pin the literal `insufficient_gold`**: that re-creates this exact defect one balance change later, which is the whole lesson of this task.

3. **Report whether `:408`'s detail is deterministic.** Run that one test at least twice and say in your report whether the emitted detail was `insufficient_gold` both times. This is an observation to bank, not a gate — if it varies, say so and say what you saw; do not chase it.

4. **Do not touch the door.** `src/systems/BuildSystem.ts`, `src/systems/buildRejectionDetail.ts` and `public/skill.md` are all correct as merged at `ef1ac7c5a`. If you conclude the door is wrong, that is a **FINDING to report, not an edit to make**.

If you find yourself about to exit without changes, WRITE WHY into your report first — a silent no-op wastes a queue slot and a gate.

## Firewall

Touch ONLY: `e2e/ap-standing-orders.spec.ts`.

NO changes to: `src/**` (the door is correct — see scope 4) · `public/skill.md` · any other `e2e/*.spec.ts` · sim semantics · `package.json` and `playwright.config.ts` (this task adds no test file and needs no collection change) · `tasks/**`, `reviews/**`, `STATUS.md`, `tasks/goals.json`, `tasks/BACKLOG.md` (the fire owns all ledger surfaces) · other lanes' work.

## Self-check (evidence, not vibes)

- `npx tsc --noEmit` clean; `npm run build` green.
- `e2e/ap-standing-orders.spec.ts` green **desktop-chrome AND mobile-chrome**, at `--workers=1` (F-1270-1: a fire-side or lane-side red at default workers is not evidence). Report the pass count for each project.
- **Prove the cure actually bites** rather than merely going green: after the fix, temporarily make the door emit a detail that is NOT in the vocabulary (or hand-edit the expected string) and confirm the widened assertion FAILS; then revert. A passing assertion that would also pass on a broken door is not a cure. Report the manufactured red's message. **Revert the probe by file edit and confirm `git diff` shows only the intended change.**
- Adjacent, unmodified-green both projects, at `--workers=1`: `e2e/m4-01-tool-surface.spec.ts`, `e2e/m4-10-agent-actions-integrity.spec.ts`, `e2e/m4-05-agent-closeout.spec.ts`.
- Zero console/page errors in the specs above (they already assert this — report if any bucket is non-empty).
- No screenshots or perf table required: this task changes assertions only and renders nothing.

End: **READY-FOR-GATES** + report (a) the two pre-flight grep counts, (b) the exact final text of both assertions, (c) desktop/mobile pass counts, (d) the manufactured-red message proving the assertion bites, (e) whether `:408`'s detail was deterministic across your runs.
