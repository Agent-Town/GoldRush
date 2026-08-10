# Task minds-rigs-full-width: F-1620-6 cure, option B — the tables get the whole width (LANE-B, commit prefix "fix:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-b.
READ FIRST: AGENTS.md; the F-1620-6 row in tasks/BACKLOG.md (the finding + the three options + the s1621 mechanism note — the cause is `.claim-ledger__board-layout` `grid-template-columns: minmax(0, 1fr) minmax(300px, 340px)` with `align-items: start`: grid tracks are rectangular, so the sidebar column reserves its width for the whole row and the aggregate tables clip mid-column at 1280px while free space sits under the Front Desk card); src/encyclopedia/reader.ts (the Field Book views: Minds/Rigs/By team + the learn-more links merged since) + reader.css (`:312`/`:469` overflow containers — coordinates may have drifted, cite the code); e2e/field-book.spec.ts (containment assertions at `:269`/`:280` "body.scrollWidth <= clientWidth" family — keep them green).

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/b main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. EVIDENCE-ARTIFACT EXCEPTION (F-1266-1, s1266): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, and any `.png` screenshot — are NEVER "work" and NEVER a STOP, whether they sit as uncommitted dirt or as the entire content of an ahead commit. Screenshots are never byte-identity gated, so their bytes differ from main forever. Discard them (`git checkout -- <paths>` / reset) and PROCEED, listing what you discarded. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything. THEN A CLEANLINESS LINE: `git -C worktrees/lane-b status --short` → must be clean, with the FACTORY-CHURN EXCEPTION — always expected, never a STOP; list them and proceed (F-1407-1): (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*` and any `.png`. What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.

## Why (owner 2026-08-10)
F-1620-6 offered the owner three cures for the desktop clip; the owner ruled: **"B"** (2026-08-10) — *let the table span both tracks below the card*. The finding's own recommendation matched: the stated audience is people "interested in the details", and B is the only option that stops clipping the details; the sidebar is four short links and a two-sentence instruction, which reads fine as a strip.

## Scope
1. On the Field Book aggregate views (Minds, Rigs, and By team if it shares the layout), the desktop board layout becomes single-column: the Front Desk card renders as a full-width strip ABOVE (its links laid out horizontally in house style), and the aggregate table takes its own full-width row BELOW. No reserved sidebar track remains beside the tables. County Standings and any non-Field-Book board pages keep today's two-column layout unless they exhibit the same clip (check; report, don't drift).
2. 390px behavior unchanged (already single-column; verify, don't churn).
3. The in-container `overflow-x: auto` stays as the fallback for genuinely-too-wide content — B removes the artificial squeeze, not the containment law.
4. e2e: extend field-book.spec.ts — at 1280px the Rigs aggregate table's visible width exceeds the old squeezed width (assert the table container's clientWidth ≥ ~900px, or assert no horizontal scroll is NEEDED: scrollWidth <= clientWidth on the table container with all columns rendered); existing containment assertions stay green; both viewports, zero console/page errors.

## Firewall
Touch ONLY: `src/encyclopedia/reader.ts`, `src/encyclopedia/reader.css`, `e2e/field-book.spec.ts`.
NO changes to: `functions/**`; ranking; the learn-more/source link machinery; other tasks' fresh work.
If you find yourself about to exit without changes, WRITE WHY into your report first — a silent no-op wastes a queue slot and a gate.

## Self-check (evidence, not vibes)
tsc + `npm run build` green. field-book spec green desktop+390px both projects, zero console/page errors. Screenshots to `reviews/shots-minds-rigs-full-width/`: Rigs at 1280px showing the FULL "Declared cost" column uncut (the F-1620-6 evidence was `90,000 in · 8,00` clipped — show it whole) + the strip layout + 390px unchanged.
End: READY-FOR-GATES + report: the layout change summary, the County-Standings check result, and the screenshots.
