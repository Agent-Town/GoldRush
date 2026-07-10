# Task 076-save-transfer-atomicity: restores never half-write, stale devices never clobber (lane-b, AFTER 074; commit prefix "fix:")
CODEX: model=gpt-5.5 effort=high
FROM swarm findings [2×high + mediums] `reviews/swarm-48h-confirmed.json`, all save-safety: `ProfileTransfer.ts:94` restoreProfileBundle DELETES all local profile data then writes — a mid-write failure loses everything, no rollback; `AccountSync.ts:79` a stale device silently overwrites a newer cloud save (push without freshness compare outside sign-in); `AccountSync.ts:235` boot auto-restore races profile creation; `ProfileTransfer.ts:52` round-trip silently drops manual slots beyond 5; `SaveSlots.ts:62` unknown version/corrupt store → destructive delete of ALL manual saves.
You are Codex in worktrees/lane-b. Pre-flight per LANE-SAFETY. READ FIRST: all five evidence entries, ProfileTransfer/AccountSync/SaveSlots current flows, 069's rejection-card pattern (reuse its UX + validation boundary).
## Scope
1. **Atomic restore**: stage the incoming bundle to temp keys → validate (069 boundary) → swap → clean up; any failure leaves the previous state byte-intact + the rejection card.
2. **Freshness guard on push**: the sync envelope carries a monotonic revision (or updatedAt); a device whose base revision is older than cloud's PULLS AND COMPARES (the existing compare card) instead of overwriting. Last-write-wins only WITHIN an acknowledged compare.
3. **Boot race**: auto-restore defers until profile init completes (order the promises; no silent clobber of a just-created profile).
4. **SaveSlots**: unknown-version/corrupt store → preserve the raw blob under a `.recovery` key + rejection card, NEVER delete; the 5-slot transfer cap becomes explicit in the export UI ("oldest slots stay on this device").
5. e2e: mid-write failure injection → local state intact + card; stale-device scenario → compare card not clobber; corrupt slot-store → recovery key + card, slots readable after re-import; existing save/sync suites green.
Firewall: those three files + the sync envelope (additive field) + e2e. NO save-key renames, NO new sync features, NO UI beyond the existing card patterns + one cap notice.
End: READY-FOR-GATES + the failure-injection e2e output.
