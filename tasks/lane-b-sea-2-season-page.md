# Task sea-2-season-page: SEA-2 — the Season Page, where the county's history becomes something a player can read (LANE-B, commit prefix "feat:")

**FIRE-AUTHORED s1637 (attended review welcome)**

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in **worktrees/lane-b**.

READ FIRST:
- `AGENTS.md`
- `specs/seasons/seasons-v1.md` — **RATIFIED 2026-08-10**. Read ALL of it; it is short. Your slice is the **SEA-2** bullet under `## Slices`, and **Law 3** (the four owed things) and **Law 5** (removability) are the two that constrain you most. Prove you have the right file:
  `grep -c "each page renders the four owed things" specs/seasons/seasons-v1.md` → **must print 1**. If it prints 0, your lane is stale — STOP and report, do NOT improvise.
- `src/seasons/registry.ts` — **SEA-1's output, merged to main `c94983206bb15c979c259f6fb61c674a7b181685` (s1637)**. This is the substrate you render. Prove the lane has it:
  `grep -c "export function resolveSeasonAt" src/seasons/registry.ts` → **must print 1**. **0 = your lane predates SEA-1 and everything below is unbuildable — STOP and report, do NOT re-implement the registry.**
- `src/encyclopedia/reader.ts` — the Field Book / Claim Ledger reader. This is your surface. Prove it:
  `grep -c "^type CountyStanding = StandingStack & {" src/encyclopedia/reader.ts` → **must print 1**.
- `reviews/sea-1-season-registry.md` — what SEA-1 actually shipped and, more usefully, what it deliberately did NOT.
- `e2e/field-book.spec.ts` — the suite that owns this reader today. Its assertions stay green; you are adding a sibling spec, not editing this one.

## Pre-flight (LANE-SAFETY, runner-auto-commit aware)
The lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via `git log`/`git diff`), it is a SAFE DUPE → `git checkout -B lane/b main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make.

EVIDENCE-ARTIFACT EXCEPTION (F-1266-1): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, any `.png` — are NEVER "work" and NEVER a STOP, whether uncommitted dirt or the entire content of an ahead commit. Discard them and PROCEED, listing what you discarded.

Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything. THEN A CLEANLINESS LINE: `git -C worktrees/lane-b status --short` → must be clean, with the FACTORY-CHURN EXCEPTION (F-1407-1) — always expected, never a STOP; list and proceed: (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*`, any `.png`. What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.

## Why (owner 2026-08-10, verbatim — this is the law this slice serves)
> "I would make that into seasons. Explain in a season page what happened in that season and then have the results and runs of the different models as well as a comment about them, their performance, what we learned from each of the experiments. This manifests this important step in history in the application. If users don't like we can later remove it. I think that its important."

**SEA-1 built the substrate; nobody can see it.** That is the precise gap you close. SEA-1 (drained s1637) put a checked-in registry in `src/seasons/registry.ts` and made `/api/standings` stamp every row with its season — but the drain verified, whole-tree, that **no browser surface reads the label**: `src/encyclopedia/reader.ts:58` types a standings row with `submittedAt?` and **no `season` field at all**, so the label is dropped at the type boundary. The owner asked for a *page*, and right now the county has a season and no way to read about it.

This is also Mistake #10 in the making — a merged feature the player cannot reach in a plain boot. SEA-2 is the answer to "where does the PLAYER see this?".

## Scope

1. **Carry the label across the type boundary.** `CountyStanding` (and the grouped/`showing` row type beside it) gain an optional `season?: string`, and the runtime validators that currently police those shapes accept it **without requiring it** — legacy rows have no season and must keep rendering exactly as they do today. If a validator rejects unknown keys, widen it minimally; do not loosen it into accepting anything.

2. **A Seasons view in the Field Book, behind ONE switch (Law 5 — removability).** The reader already has a view switcher (`data-ledger-view="standings"` and its siblings). Add a **Seasons** view in the same family, reusing the same switcher mechanics. ⚠️ **Law 5 is a hard requirement, not a nicety:** the owner's *"if users don't like we can later remove it"* must be a **one-line act**. Put the whole surface behind a single named constant/flag so that flipping it hides the Seasons tab and every season page — and **say in your report the exact line that does it**. Removal hides PAGES, never DATA.

3. **A season list, from the registry and only from the registry.** The Seasons view lists every entry in `SEASONS` — name, date range (an open-ended `endsAt: null` reads as ongoing in county voice, never as a blank or `null`), and its one-line `summary`. **Do not hardcode a season anywhere.** Today the registry holds exactly one season; your list must render two correctly the day Season 2 is added, with no further edit.

4. **A season page rendering the four owed things (spec Law 3), each as its own labelled section.** For the selected season:
   - **(a) what happened** — the registry `summary` plus the season's era stamps, in county voice.
   - **(b) the results** — the county rows belonging to that season, grouped by model and by harness. ⚠️ **REUSE the existing Minds/Rigs cell rendering — the spec says "do not fork it".** The reader already builds these cells (`byStack: 'Minds'` / `byHarness: 'Rigs'`); call the same code path. Forking it is a scope violation even if it is faster.
   - **(c) commentary** and **(d) what we learned** — **these are SEA-3's content, not yours.** Render each as a section with an honest, county-voice "not yet written" state. ⚠️ **Never an empty frame** — that is the house rule the Minds/Rigs slice already follows. You are building the shelf, not the book.

5. **Rows that have no season must not vanish.** A legacy row with no `season` key is excluded from a *season's* results — it belongs to no season — but the existing County Standings view must keep showing it exactly as before. Prove both halves.

6. **390px containment + honest empty states.** Per house rule, the whole surface renders and is usable at 390px with no horizontal overflow. A season with zero rows says so in county voice rather than rendering an empty table.

## Firewall
Touch ONLY: `src/encyclopedia/reader.ts` · `src/encyclopedia/reader.css` · a NEW spec `e2e/sea-2-season-page.spec.ts` · `src/seasons/registry.ts` **for additive read-only helpers only** (e.g. a `seasonById`/list accessor) — **you may NOT change any season's data, add a season, or give Season 2 a start date** · `package.json` **only if** you add a new node guard, to root it in `test:node-guards`.

> ⓘ **`package.json` is in TOUCH-ONLY deliberately (F-1637-1, s1637).** The two previous slices each had scope that was unsatisfiable inside their own firewall because a new guard must be rooted or `gate-caller-audit` reds. If you add a guard, root it. If you add no guard, do not touch this file.

NO changes to: `functions/**` — **the API is SEA-1's and it is done; if you find yourself wanting a new field, you are solving it in the wrong place** · **ranking, ordering, or `compareScores` in any form** · `e2e/field-book.spec.ts` (its assertions must pass UNCHANGED — that is your regression proof) · `src/sim/**`, `src/agent/**`, `public/skill.md` — **lanes c and d hold undrained commits on all three right now; touching them creates a merge pile** · the season NARRATIVE/commentary text (SEA-3) · `scripts/same-game-audit.mjs` (lane-a owns it this hour).

If you find yourself about to exit without changes, WRITE WHY into your report first — a silent no-op wastes a queue slot and a gate.

## Self-check (evidence, not vibes)
- `npx tsc --noEmit` clean; `npm run build` green.
- **`e2e/field-book.spec.ts` green UNCHANGED, desktop + 390px mobile** — state the pass count. This is the load-bearing negative: the existing Field Book must not regress.
- Your new `e2e/sea-2-season-page.spec.ts` green desktop + 390px mobile, zero console/page errors. Run playwright with `--workers=1`.
- **Reach it in a PLAIN BOOT — no `?debug`, no query flags (Mistake #10).** Your spec must open the Field Book the way a player does and arrive at a season page. Say in your report the exact click path.
- **Prove the removability switch (Law 5)**: flip it, show the Seasons tab and pages are gone, flip it back. Name the line.
- **Prove the reuse (scope 4b)**: name the shared function/code path your results section calls, and show it is the same one the Minds/Rigs view uses — not a copy.
- **Prove scope 5 both ways**: a seasoned row appears under its season; a legacy row with no season appears in County Standings and NOT in a season's results.
- Screenshots to `reviews/shots-sea-2/` — season list + one season page, desktop 1280 and mobile 390.

End: **READY-FOR-GATES** + report: the one-line removability switch, the shared Minds/Rigs code path you reused, the plain-boot click path, your two pass counts (field-book unchanged + your new spec), and how an open-ended season's date range reads to a player.
