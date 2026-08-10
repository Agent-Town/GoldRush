# Task sea-1-season-registry: SEA-1 — the county names its seasons, and every row learns which one it rode in (LANE-B, commit prefix "feat:")

**FIRE-AUTHORED s1635 (attended review welcome)**

CODEX: model=gpt-5.5 effort=high

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in **worktrees/lane-b**.

READ FIRST:
- `AGENTS.md`
- `specs/seasons/seasons-v1.md` — **RATIFIED 2026-08-10**. Read ALL of it; it is short. Your slice is the first bullet under `## Slices`. Prove you have the right file with:
  `grep -c "a checked-in season registry (id, name, dates, era stamps, one-line summary)" specs/seasons/seasons-v1.md` → **must print 1**. If it prints 0, your lane is stale — STOP and report, do NOT improvise.
- `functions/api/standings.ts` — the county board API. Prove the lane has the code this task edits:
  `grep -c "Number.isFinite(row.submittedAt) && row.submittedAt >= 0" functions/api/standings.ts` → **must print 1**. 0 = stale lane, STOP and report.
- `e2e/lb-01-county-standings.spec.ts` — the suite that owns this endpoint's behavior. Its assertions stay green.

## Pre-flight (LANE-SAFETY, runner-auto-commit aware)
The lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via `git log`/`git diff`), it is a SAFE DUPE → `git checkout -B lane/b main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make.

EVIDENCE-ARTIFACT EXCEPTION (F-1266-1): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, any `.png` — are NEVER "work" and NEVER a STOP, whether uncommitted dirt or the entire content of an ahead commit. Discard them and PROCEED, listing what you discarded.

Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything. THEN A CLEANLINESS LINE: `git -C worktrees/lane-b status --short` → must be clean, with the FACTORY-CHURN EXCEPTION (F-1407-1) — always expected, never a STOP; list and proceed: (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*`, any `.png`. What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.

## Why (owner 2026-08-10, verbatim — this is the law this slice serves)
> "I would make that into seasons. Explain in a season page what happened in that season and then have the results and runs of the different models as well as a comment about them, their performance, what we learned from each of the experiments. This manifests this important step in history in the application. If users don't like we can later remove it. I think that its important."

`specs/seasons/seasons-v1.md` slices that directive. **SEA-1 is the substrate: the registry and the label.** It is marked *"fire-authorable after AP-16-0 merges"*, and **AP-16-0 merged this morning** (`df05e6258`, drained s1628) — the gate is met.

Seasons law 2 (verbatim from the spec): *"No row is ever deleted by a season change (retention law). Every standing carries its season label; old crowns are history, not cheats."* This slice is what makes that sentence true of the data.

## Scope
1. **A checked-in season registry.** A new source module (suggested `src/seasons/registry.ts`; name it as you judge, but it must be importable by both the API and future browser code) exporting an ordered, typed list of seasons. Each entry: `id`, `name`, `startsAt` (epoch ms), `endsAt` (epoch ms **or `null` for the open/current season**), `eraStamps: string[]`, and a one-line `summary`. Content comes from the spec's `## Season boundaries (proposed)` section — do not invent seasons.
   - **SEASON 1 — "The Founding Season"**, open-ended (`endsAt: null`), era stamps including the Walk correction `3dd7790d`, summary in county voice from the spec's own bullet.
   - ⚠️ **SEASON 2 must NOT be given a start date.** The spec says it *"opens when AP-16-1..3 land under one era stamp"* — **those three slices are in flight right now and have not merged.** Either omit Season 2 entirely, or include it with an explicit `startsAt: null` + a comment saying its boundary is pending that stamp. **Do not guess a date.** Say in your report which you chose and why.
2. **A derived season label on API rows — additive, GET-only.** In `functions/api/standings.ts`, the public row projection (the one carrying the `submittedAt` spread cited above) gains a derived `season` field resolved from the row's `submittedAt` against the registry. Rows whose `submittedAt` is missing or unresolvable get **no `season` key at all** — absent, never a guessed default. Apply the same treatment to the second projection (the `stackCell`/`showing` family in the same file) **only if** it is part of the same GET response; if it is not, leave it and say so.
3. **A pure, unit-testable resolver.** The date→season lookup lives in the registry module as a plain function, not inline in the handler, and gets a small node test (house pattern — see `scripts/*.test.mjs`) covering: a date inside Season 1; a date before all seasons; a missing/undefined timestamp; and the open-ended `endsAt: null` boundary.
4. **Prove the ranking did not move.** This is the load-bearing negative. `compareScores` and every ordering path in `standings.ts` are UNTOUCHED, and your evidence must show it, not assert it: report `git diff` proof that no comparator line changed, and keep `lb-01-county-standings` green.

## Firewall
Touch ONLY: the new registry module + its test, `functions/api/standings.ts` (additive projection field only), and `e2e/lb-01-county-standings.spec.ts` **only if** an additive assertion is needed for scope 2.

NO changes to: **ranking, ordering, or `compareScores` in any form** · the POST/write path or validation (`submittedAt` is read, never written differently) · `src/sim/**`, `src/agent/**`, `src/game/Progression.ts` — **all three are being edited RIGHT NOW by live lanes a/c/d (AP-16-1/2/3); every one of those masters firewalls "NO changes to ranking/API", and this task is the mirror of that promise** · the Field Book / encyclopedia reader (a different slice) · the Season PAGE (that is SEA-2, not yours) · season narrative content (SEA-3).

If you find yourself about to exit without changes, WRITE WHY into your report first — a silent no-op wastes a queue slot and a gate.

## Self-check (evidence, not vibes)
- `npx tsc --noEmit` clean; `npm run build` green.
- The new resolver test passes; state its pass count.
- `e2e/lb-01-county-standings.spec.ts` green **desktop + 390px mobile**, zero console/page errors. Run playwright with `--workers=1`.
- A GET response sample in your report showing a row **with** its `season` label and (if any exists) a row **without** one.
- The scope-4 ranking proof: name the comparator lines and show they are unchanged.

End: **READY-FOR-GATES** + report: which Season-2 choice you made and why, whether the second projection was in the GET path, the resolver test count, the GET sample, and the ranking proof.
