# Task f1616-1: the walkthrough spec stops rewriting a tracked review file, and gets a control that is not vacuous (lane-c, commit prefix "test:")

**FIRE-AUTHORED s1616 (attended review welcome)**

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-c`.

READ FIRST: `AGENTS.md`; `e2e/advance-stream-walkthrough.spec.ts` **in full** — it is the only file you will change, and it is 173 lines; `reviews/advance-stream-walkthrough-drain.md` (the s1616 drain review that found both defects — findings **F-1616-1** and **F-1616-2**, quoted in the WHY below); `src/assets/AdvanceStream.ts` lines **180–205** (the prefetch `fetch(...)` and its header) and **246–253** (`threeDimensionalAssetsEnabled`, the predicate that makes the current control vacuous — **read it, do not change it**); `.claude/skills/author-task/SKILL.md` §3 LANE pre-flight (the sentence listing what still STOPs).

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/c main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. **EVIDENCE-ARTIFACT EXCEPTION (F-1266-1): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, and any `.png` — are NEVER "work" and NEVER a STOP. Discard them and PROCEED, listing what you discarded.** Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything. Then `git -C worktrees/lane-c status --short` → must be clean, with the FACTORY-CHURN EXCEPTION — always expected, never a STOP; list them and proceed (F-1407-1): (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*` and any `.png`. What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.

**PREMISE CHECK (do this first, and STOP if any fails):**
```
grep -c "await writeFile('reviews/advance-stream-walkthrough.md', report);" e2e/advance-stream-walkthrough.spec.ts
grep -c "const CONTROL = process.env.GR_ADVANCE_STREAM_CONTROL === 'lite';" e2e/advance-stream-walkthrough.spec.ts
grep -c "await page.route('**/*.glb', async (route) => {" e2e/advance-stream-walkthrough.spec.ts
```
All three must return **1** (verified `=1` on main at dispatch, s1616). If any returns 0, the ground moved — **STOP and report which one, with the current text of that region.** Do NOT search for a replacement target and do not guess.

The one test in that file is titled **"measures warm assets across menu, town, and two contracts"**. Every scope item below is about that test; cite it by that title, not by a line number, when you report.

## Why (F-1616-1 + F-1616-2, both measured at the s1616 drain of f1614-1, merge `21b473464`)

**F-1616-2 — the spec dirties a tracked `reviews/*.md` on every run.** `.claude/skills/author-task/SKILL.md` ends BOTH pre-flight templates with the same sentence, verbatim: *"What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`."* The factory-churn and evidence-artifact exceptions cover `artifacts/**`, `reviews/shots-*` and `.png`; **`reviews/*.md` is deliberately excluded from both.** The drain confirmed this by manufacturing it — a desktop-only run of the spec on the merged tree, then `git status --short`:

```
 M artifacts/advance-stream-walkthrough.md
 M reviews/advance-stream-walkthrough.md
```

That is the exact predicate `f1406-1` died on: **54,875 tokens for zero edits** (F-1407-1). It stayed hidden during a two-project run only because mobile runs last and its numbers happened to match the committed bytes. **A trap that fires only when the last project disagrees is worse than one that always fires.** Every other spec in `e2e/` writes solely to `artifacts/**` or `reviews/shots-*` — this is the only one writing a tracked `reviews/*.md`.

**F-1616-1 — the prescribed prefetch-disabled control is vacuous.** The f1614-1 gate demanded *"the prefetch-disabled control showing the WARM column collapse — a table whose warm column is unchanged with the stream off is measuring nothing."* Run at the drain, both projects, the `tier=lite` control returns **all zeros — WARM *and* COLD**, every door. The WARM column collapses, so the gate is literally met and carries **no information**: an all-zero table cannot tell *"prefetch stopped warming"* from *"nothing was requested at all"*.

⚠️ **This was unsatisfiable by construction and is NOT the previous runner's fault.** `src/assets/AdvanceStream.ts:250-252` (`threeDimensionalAssetsEnabled`) returns false on `terrain2d` **or** `tier=lite`, and that single predicate gates the whole 3D asset path including demand-loads. There is no prefetch-only disable flag, so *any* implementation of that control produces an all-zero table.

## Scope

1. **Stop writing the tracked review file.** Delete the `writeFile('reviews/advance-stream-walkthrough.md', report)` call. Keep the `artifacts/advance-stream-walkthrough.md` write exactly as it is — `artifacts/**` is the factory-churn-excepted evidence surface and is the correct home for a regenerated table. **Do NOT delete the committed `reviews/advance-stream-walkthrough.md` file itself**: it is the owner-facing record of a measurement that already happened, and it stays as a static artifact. You are removing the *rewrite*, not the *record*.

2. **Make the artifact write project-scoped.** Both playwright projects currently write the same `artifacts/advance-stream-walkthrough.md` path, so at the 6 workers a lane shell uses they race on one file. Write `artifacts/advance-stream-walkthrough-<project>.md` instead (`testInfo.project.name` is already in scope — the report header line uses it). One file per project, no race, and the reader can compare desktop against mobile.

3. **Replace the vacuous control with one that isolates prefetch.** Drop the `GR_ADVANCE_STREAM_CONTROL === 'lite'` mechanism and the `&tier=lite` boot flag it appends. In its place, when the control env var is set, use the **`page.route` handler the spec already installs** to fail or stall requests carrying `x-gold-rush-prefetch: 1` while letting every other `.glb` through untouched. The 3D path stays enabled, so demand-loads still happen and **COLD stays non-zero while WARM collapses to 0** — which is the comparison the gate was always trying to buy. Keep the env-var name so existing muscle memory still works, or rename it and say so in your report; either is fine, but say which.

4. **Assert the control's own validity in-spec.** In the control arm, assert that the total COLD across all doors is **greater than zero** — that single assertion is what makes the control non-vacuous, and it is the assertion whose absence let an all-zero table read as a pass. Keep the existing `town.warm > 0` assertion for the normal arm and keep `expect(errors).toEqual([])` for both.

5. **Do not touch what measures the game.** `src/**` is firewalled — **especially `src/assets/AdvanceStream.ts` and `src/town/TownTavernPilot.ts`.** If your control work suggests the prefetch set or the stream's behaviour is wrong, that is a FINDING to report, never an edit to make here. The same law governed f1614-1 and it is unchanged.

6. **Report the two tables.** Run both arms and paste both tables. **The normal arm must still show the WARM column varying BETWEEN doors** — town around `2 WARM / 8 COLD` and contract1 around `7 WARM / 8 COLD` at the s1616 drain. ⚠️ **Do NOT assert those numbers** (they are timing-dependent; town-return legitimately moved between 2|8 and 4|6 across runs) — report them so the next reader can see the discriminator still discriminates.

If you find yourself about to exit without changes, WRITE WHY into your report first — a silent no-op wastes a queue slot and a gate.

## Firewall

Touch ONLY: `e2e/advance-stream-walkthrough.spec.ts`.

NO changes to: `src/**` — **especially `src/assets/AdvanceStream.ts`, `src/town/TownTavernPilot.ts`, `src/world/Terrain3dClaimPilot.ts`** · `reviews/advance-stream-walkthrough.md` (the static owner record — leave the committed file exactly as it is) · `reviews/advance-stream-walkthrough-drain.md` or any other `reviews/*.md` · `e2e/advance-stream.spec.ts` or any other existing spec · `package.json` · `playwright.config.ts` · `scripts/**` · `tasks/**`, `STATUS.md`, `tasks/goals.json`, `tasks/BACKLOG.md` (the fire owns all ledger surfaces) · other lanes' work.

⚠️ **`artifacts/advance-stream-walkthrough.md` becomes orphaned by scope 2** (nothing writes that exact path any more). **Leave it on disk** — it is the committed evidence of the s1616 measurement and the RETENTION LAW covers it. Do not delete it, and do not "tidy" it into the new per-project name.

## Self-check (evidence, not vibes)

- `npx tsc --noEmit` clean; `npm run build` green.
- `npx playwright test e2e/advance-stream-walkthrough.spec.ts --workers=1` green in **both** projects (desktop and 390px mobile). Report rc, pass counts and run time.
- **The control arm, both projects**, with your new mechanism: report rc, pass counts, and **both columns** of the table — not just WARM. **A control whose COLD column is also zero has reproduced F-1616-1 and is a FAIL**, however green the run.
- **Prove scope 1 by manufacture, not by reading the diff.** After a **single-project** run (`--project=desktop-chrome`), run `git status --short` and paste it. It must show **no modified tracked `reviews/*.md`**. That is the whole point of this task, and the previous spec passed every green gate while failing it.
- `npx playwright test e2e/advance-stream.spec.ts --workers=1` green — the adjacent suite that shares the prefetch primitives. Report pass counts (it was 10/10 both projects at s1616).
- No screenshots and no perf table required: this slice renders nothing.

End: **READY-FOR-GATES** + report (a) the three pre-flight grep counts, (b) the `git status --short` after a single-project run, (c) both arms' tables with BOTH columns, (d) which env-var name the control uses now, (e) all playwright runs' rc and pass counts with timings, (f) anything you noticed about the prefetch set — as a finding, never as an edit.
