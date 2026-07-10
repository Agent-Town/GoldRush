# Task gz-h1-newsie: THE CLAIM HERALD hits the plaza — the newsie + the one-page paper (lane-b; commit prefix "feat:")
CODEX: model=gpt-5.6-sol effort=medium
FROM `specs/gazette-house/README.md` GZ-H1 + `lore/agent-town-heritage.md` §5 (the Pony Express DELIVERS — v1 the newsie works the plaza; re-anchors to the station when GZ-H2/heritage builds it).
You are Codex in worktrees/lane-b. Pre-flight per LANE-SAFETY. READ FIRST: the gazette spec (laws: owner approval = publication; 063 in-world voice — fires TRANSLATE, "the river now runs past the claim's edge" never "064 shipped"; no token talk ever), the town actor pattern (townsfolk barks, youngster loop), the Claim Ledger reader page pattern, `marketing/outbox/gazette-queue.md` (the fires' GZ-01 duty output — your content source shape).
## Scope
1. **THE FEED FILE**: `news/herald.json` (repo-tracked; array of {headline, lines[], date, hash}) — the deploy pipeline ships it; fires append to it ONLY from owner-approved outbox items (the approval flow stays outside this task).
2. **THE NEWSIE**: a youngster-sprite variant (cap; use existing youngster sheets + a tint/prop pass placeholder-first) on the plaza near the tavern, with a bark rotation of the LATEST headline ("EXTRA! ..."), the town-actor pattern.
3. **THE HERALD PAGE**: interacting opens a one-page parchment (Claim Ledger reader pattern): masthead "THE CLAIM HERALD" (pictogram + styled text per UI conventions), 3-4 items from herald.json, in-world voice. Offline/empty: "No fresh ink today."
4. e2e: newsie present + barks a headline from a fixture feed; page opens/renders items; empty feed shows the quiet line; zero internal strings (063 assertion pattern); town battery green.
Firewall: the newsie actor + herald page + news/herald.json (+ fixture) + e2e ONLY. NO posting/approval flow, NO fire.md, NO other town surfaces, NO sim.
End: READY-FOR-GATES + screenshots (newsie on plaza, the Herald page open) desktop + 390px.
