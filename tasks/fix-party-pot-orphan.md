# Task fix-party-pot-orphan: the SHARED POT label visually orphans from its party HUD (lane-c, commit prefix "fix:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-c.
READ FIRST: AGENTS.md; `src/ui/PartyOverview.ts` (the party HUD — header at `:32-37`, pot span `:35`); `src/ui/PartyOverview.css` (`.party-overview` absolute at top-left, `width: min(560px, calc(100vw - 32px))`; `.party-overview__header` is `justify-content: space-between` with NO backdrop — only text-shadow); `docs/playtests/shots-2026-08-15/shared-pot-hangs-in-air.png` (the owner's screenshot, in-repo).

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/lane-c main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work), or the worktree holds uncommitted edits you did not make. EVIDENCE-ARTIFACT EXCEPTION (F-1266-1): changes confined to `artifacts/**`, `reviews/shots-*`, and any `.png` are NEVER "work" and NEVER a STOP — discard and PROCEED, listing them. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything. THEN A CLEANLINESS LINE with the FACTORY-CHURN EXCEPTION — always expected, never a STOP; list and proceed (F-1407-1): (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*`, any `.png`. What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.

## Why (owner, 2026-08-15, first mixed human+AI ride — verbatim)
*"the shared gold kind of hangs in the air"* — with a screenshot showing the uppercase text `SHARED POT 75G` floating alone over bare terrain, no panel, no anchor (preserved at `docs/playtests/shots-2026-08-15/shared-pot-hangs-in-air.png`).
VERIFIED mechanism (attended, file:line): the pot is the right half of the party HUD's header row — `PartyOverview.ts:35` inside `.party-overview__header`, which is `display:flex; justify-content: space-between` across the panel's full `min(560px, 100vw-32px)` width with **no background** (text-shadow only, `PartyOverview.css`). "RIDERS" and the rider cards hug the left edge; the pot label gets flung to the far right edge of an invisible 560px box — landing over open world, visually severed from the panel it belongs to. It reads as a world-floating label ("hangs in the air"), which is exactly the Billboard-Mistake class the owner has ruled on before: things must read as anchored to what they belong to.

## Scope
1. Re-compose the header so the pot label reads as PART of the party HUD: place it adjacent to the "Riders" title / the cards row (drop the full-width `space-between` fling), OR give the header a subtle panel backdrop that visually ties title→pot→cards into one unit — match the game's existing HUD chrome (the HP/TIME/WAVE box style) rather than inventing a new look. Smallest diff that makes it read anchored wins.
2. Verify at BOTH breakpoints: desktop and 390px (the panel width formula differs — the orphan distance shrinks on mobile but the composition must hold at both).
3. e2e: extend the existing party-overview coverage (or add `e2e/party-pot-anchor.spec.ts`): with a 2-rider snapshot, assert the pot element's bounding box sits within/adjacent to the party panel's visual cluster (e.g. horizontal gap between pot and the riders header/cards below a sane threshold), desktop + mobile.

## Firewall
Touch ONLY: `src/ui/PartyOverview.ts` (markup order if needed), `src/ui/PartyOverview.css`, one e2e spec (new or extended).
NO changes to: the shared-gold VALUE plumbing (`sharedGold` data path — sim/economy untouched), `src/mp/**`, `functions/api/**`, any other HUD element's placement, existing e2e assertions, balance.

## Self-check
tsc + `npm run build` green. The spec green desktop+mobile at `--workers=1`. Adjacent `task-025` + `m1-01` + `m2-01` unmodified-green. Zero console/page errors plain boot. Before/after screenshots (2-rider party, pot visible) → `artifacts/party-pot-anchor/`.
End: READY-FOR-GATES + report: the composition chosen (adjacent vs backdrop), both-breakpoint screenshots, suite counts.

## No-op / honesty guard
If the header has been recomposed by a predecessor (check git log on PartyOverview.css), WRITE WHY and stop. Do not restyle beyond the header composition — one concern, smallest diff.
