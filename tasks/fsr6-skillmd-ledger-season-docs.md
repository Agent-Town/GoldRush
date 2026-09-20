# Task fsr6: document the ledger-season surface in the door doc (lane-b, commit prefix "docs:")

**FIRE-AUTHORED (attended review welcome) — s2080, 2026-08-20.**

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-b`.

READ FIRST: `AGENTS.md`; `reviews/assay-season-roll.md` (the attended drain that filed this finding,
2026-08-20); `public/skill.md` (the file you are editing — read it whole before writing);
`functions/api/standings.ts` (the surface you are documenting).

SEQUENCING LAW: this documents the ledger-season dimension landed by the season roll. Verify it is
present by CONTENT, not by coordinate: `grep -Fc "const CURRENT_SEASON = 2;" functions/api/standings.ts`
must return `1`. Do NOT gate on `git log -N` with a small N. If it returns 0, STOP and report
"season roll not landed" rather than improvising the surface.

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/b main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. **EVIDENCE-ARTIFACT EXCEPTION (F-1266-1, s1266): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, and any `.png` screenshot — are NEVER "work" and NEVER a STOP, whether they sit as uncommitted dirt or as the entire content of an ahead commit. Screenshots are never byte-identity gated, so their bytes differ from main forever. Discard them (`git checkout -- <paths>` / reset) and PROCEED, listing what you discarded.** Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything. Then `git -C worktrees/lane-b status --short` → must be clean, with the FACTORY-CHURN EXCEPTION — always expected, never a STOP; list them and proceed (F-1407-1): (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*` and any `.png`. What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.

## Why (`reviews/assay-season-roll.md:18`, attended drain, 2026-08-20)

The review of the season roll filed, verbatim:

> **F-SR-6:** `public/skill.md` lacks `?season=` / `season_closed` docs for rig authors. → truth-pass successor.

The successor it named (`f2078-1-deepwater-manifest-truth-pass`) had already been dispatched 24
minutes earlier with a four-file firewall that excludes `public/skill.md`, so this debt was never
carried by anything and is still open. Measured on main at `d4e42a315` by the authoring fire:
`grep -Fc "season=" public/skill.md` returns **0**. The door doc is silent about a dimension that now
governs every read and every write a rig author makes.

The surface to document is real and was re-verified at source, not transcribed:

- `functions/api/standings.ts:933-938` `parseSeason(url)` — reads `?season=`; **omitted means the
  CURRENT season** (`raw === null` → `CURRENT_SEASON`); accepts only `/^[0-9]{1,4}$/` **and** a member
  of `KNOWN_SEASONS`; anything else returns `null`.
- `:287` — a `null` season is refused with HTTP **400 `bad_season`**, "Season not accepted."
- `:170-171` — `FIRST_SEASON = 1`, `CURRENT_SEASON = 2`, `KNOWN_SEASONS = {1, 2}`.
- `:529` — a POST aimed at a closed season is refused with HTTP **403 `season_closed`**, "That
  season's book is closed. The county writes only in the season now riding."
- `:942-943` `seasonLabels(season)` — every read response carries `{ season, assayEra }`, where
  `assayEra` is `season !== FIRST_SEASON`.
- `:286`, `:290` — `season` is counted into each branch's strict param arithmetic
  (`url.searchParams.size !== 2 + seasonParams`), so it is an ALLOWED extra param, not a free-for-all.

⚠️ **ONE THING YOU MUST NOT DO, and it is the reason this task is docs-only.** `functions/api/standings.ts:161-168`
states that two season axes exist and "**must never be conflated**": the CHRONICLE season
(`src/seasons/registry.ts`, string ids like `founding-season`) and the LEDGER season (this numeric
one). They roll for different reasons and do not align. Document the LEDGER season only. Do not
describe a mapping between them, do not imply one exists, and do not touch the reader.

## Scope

1. Add ONE new prose section to `public/skill.md` documenting the ledger season for rig authors. It
   must state, each as a checkable sentence: (a) `?season=` is optional on reads; (b) omitting it
   means the season now riding; (c) the accepted values are `1` and `2`; (d) an unaccepted value is
   HTTP 400 `bad_season`; (e) writes aimed at a closed season are HTTP 403 `season_closed`; (f) read
   responses carry `season` and `assayEra`.
2. State plainly what season 1 vs season 2 MEANS for an entrant: season 1 admitted un-assayed rows;
   the season now riding admits only rows the county can assay. Source the claim to
   `functions/api/standings.ts:165-167`, in your own words — do not paste the comment.
3. Place the section where a rig author will meet it before they write a submit call. Say in your
   report WHERE you put it and why that is the reading order.
4. Do NOT add a new guarded block. `scripts/skillmd-guard.test.mjs` pins named blocks only
   (`grammar`, `buildables`, `seeds`, door-contracts) via `guardedBlock(name)`; a new guarded block
   would demand a pin nobody wrote. Plain prose and, if you want one, a plain unguarded fence.

**No-op guard:** if you find yourself about to exit without changes, WRITE WHY into your report
first — a silent no-op wastes a queue slot and a gate.

## Firewall

Touch ONLY: `public/skill.md`.

NO changes to: `functions/api/standings.ts` (this task DOCUMENTS it; if you believe the code is
wrong, report it and change nothing) · `src/seasons/registry.ts` · `src/encyclopedia/reader.ts` and
`reader.css` (the Founding-Season page is F-SR-5, a SEPARATE and currently OWNER/ATTENDED-GATED
question — see the note below) · `scripts/skillmd-guard.test.mjs` or any other guard · the four
named guarded blocks in `public/skill.md` · any `e2e/**` assertion · any file under `src/` · `tasks/**` ·
`package.json`.

🚫 **DO NOT "fix" F-SR-5 while you are here, even though it looks adjacent and trivial.** The review
calls it a one-param fix; the authoring fire measured that it is not. `reader.ts:538-552`
(`loadSeasonResults`) holds a CHRONICLE id (`founding-season`), and `parseSeason` accepts only digits
— so passing it through returns 400. Bridging the two axes is exactly the conflation
`standings.ts:161-168` forbids, and it needs a ruling, not an edit.

## Self-check (evidence, not vibes)

- `npx tsc --noEmit` clean · `npm run build` green. (Both, even though this is a docs change — the
  door doc is served from `public/` and the guard below loads source through vite.)
- `npx playwright test e2e/ap16-8b-door-doc.spec.ts --workers=1` **if that spec exists** — check with
  `ls e2e/ | grep -i door` first and report what you found; do not invent a suite name.
- `npm run test:node-guards` green, run **ALONE** (~3 min, contends with any concurrent battery).
  It contains `scripts/skillmd-guard.test.mjs`, which is the guard that judges this file — it MUST
  stay green, including its positive-control arm.
  ⓘ **KNOWN RED, not yours:** `scripts/node-guards-contention.test.mjs` ("board did not stay quiet
  for 300ms") reds whenever another session has a `run-node-guards` process — see F-1606-1 and
  F-2080-1. If it is your ONLY failure, say so explicitly and PROCEED. Any other failure is yours.
- Re-grep the door doc after editing: `grep -Fc "season=" public/skill.md` must now be ≥ 1, and
  `grep -Fc "season_closed" public/skill.md` must be ≥ 1. Paste both numbers.
- No screenshots and no perf table: this renders nothing.

End: READY-FOR-GATES + report (a) where you placed the section and the reading-order argument for it;
(b) the two grep counts above; (c) the skillmd-guard result specifically, not just the battery total;
(d) anything adjacent you noticed and did NOT touch.
