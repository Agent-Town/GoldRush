# Task 074-mystery-ledger-leak: locked contracts keep their secrets EVERYWHERE (lane-b; commit prefix "fix:")
CODEX: model=gpt-5.6-sol effort=medium
FROM swarm finding [high] `reviews/swarm-48h-confirmed.json` ("Mystery law leak: locked contracts' goals and rules readable in the Claim Ledger after one board open") — `src/town/TownScene.ts:919` region: board-open discovery registers contract ledger entries with FULL goals/rules regardless of lock state; the encyclopedia renders them → the 059 teaser law is defeated by the side door.
You are Codex in worktrees/lane-b. Pre-flight per LANE-SAFETY. READ FIRST: the finding's evidence entry, the MYSTERY LAW (tasks/059-contract-catalog.md: locked = name + dimmed art + one rumor line + unlock terms ONLY), the contract ledger entry registration in TownScene/encyclopedia registry, 063's voice law.
## Scope
1. The ledger's contract pages honor lock state: LOCKED contract entry = the same teaser content as the catalog (name, rumor line, unlock requirement, "The clerk draws up the terms when you're ready.") — goals/rules render ONLY once unlocked. Unlock upgrades the page in place (a nice reveal: the page "gets drawn up").
2. Discovery semantics stay: seeing the board still discovers the ENTRY (discovered-only law) — it's the CONTENT that gates on lock state, not the page's existence.
3. e2e: fresh profile opens board → ledger shows the locked contract's teaser page, asserts goals/rules text ABSENT (the 063 string-assertion pattern); unlock → page shows full terms; en-01/en-02 regression green.
Firewall: the contract-entry registration/render path + its e2e ONLY. NO board/catalog changes (059 is correct), NO other ledger entries, NO unlock logic.
End: READY-FOR-GATES + locked-page + unlocked-page screenshots.
