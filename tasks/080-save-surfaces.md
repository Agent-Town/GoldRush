# Task 080-save-surfaces: the remaining three of MP-004's five save surfaces (lane-a; commit prefix "fix:")
CODEX: model=gpt-5.6-sol effort=high
FROM `docs/MASTERPLAN-2026-07-10.md` amendment §4 (saves = five surfaces; 069+076 shipped two) + the cited Sol evidence: `reviews/sol-findings-persistence-multiplayer.md` (PERSIST-004/008/009) + `reviews/sol-findings-ai-accounts-trust.md` (TRUST-005/009). READ those entries FIRST — file:line evidence stands.
You are Codex in worktrees/lane-a. Pre-flight per LANE-SAFETY.
## Scope
1. **Page-exit flush** (AccountSync.ts:149-170): cloud pushes ride a debounce timer with no exit flush — add visibilitychange/pagehide flush (sendBeacon-class or awaited fetch with keepalive) so closing the tab never strands the last minutes.
2. **Blank-device discovery** (AccountSync.ts:208-233): a signed-in account on a fresh device can only pull profile ids it already knows — add a list-profiles read (the worker already stores per-profile blobs; expose an authenticated index) so a new device offers the family's profiles by name.
3. **KV version-rotation atomicity** (functions/api/_accounts.ts:190-209): the last-5-versions rotation is a non-atomic read/write chain — restructure to tolerate concurrent pushes (single-key envelope with embedded versions, or ordered writes where a torn state never loses the NEWEST save; document the chosen invariant).
4. **The known version-order harness red** (Sol's brief-#2 note): fix or evidence-quarantine `test:accounts` version-order with a findings entry — no silent skip.
## Gates
tsc/build · the accounts worker harness green INCLUDING the version-order case (or its documented quarantine) · AC round-trip e2e green · exit-flush e2e (route-intercept: closing mid-debounce still pushes) · new-device discovery e2e vs wrangler dev · offline-first regression (signed-out byte-identical).
Firewall: AccountSync.ts, functions/api/_accounts.ts (+ its harness), the new e2e. NO save schema beyond additive worker routes, NO RunSuspend/SaveSlots (069/076 own those), NO MP.
End: READY-FOR-GATES + harness output + the atomicity invariant statement.
