# Review — m4-07 Prospector Panel (lane-b, s110 drain)

**Slice:** M4-07 — G-key/chip-tap ledger panel; ceiling-vs-consent split; readable stacked receipts.
**Lane commit:** `24529c3` (lane/m4) "feat: add prospector panel consent controls".
**Merged:** onto clean main (s110 fire, after sci-ceiling), 3-way auto-resolve on `Game.ts`, `--no-commit` gated.
**Verdict:** ✅ PASS — merged.

## What it does
- New `ProspectorPanel.ts` + `AgentConsent.ts`. G-key (desktop) / chip-tap (mobile bottom-sheet) opens a ledger panel showing the Prospector's permission ladder, per-run consent toggles (rung grants + ability checkboxes), and stacked receipts.
- **Ceiling-vs-consent split (the important part):** the victory-fed `agentAutonomyLevel` **ceiling is untouched** — `AgentConsentStore` is a *separate per-run gate layered on top of* `permissionLevel`. `agentConsent.allows('auto_collect', permissionLevel)` now gates the auto-collect sweep; consent resets each run (`agentConsent.reset()` in `resetRun`). **Defaults grant** (behavior-safe — proven by m4-06:228 still gathering XP with no explicit consent set).
- **Readable receipts:** `AgentStub` now timestamps each receipt (`MM:SS - line`, clock injected from `Game.timeAlive`) and keeps up to **8** (was 3), replacing the run-on feed. New `set_agent_rung`/`set_agent_ability` UI intents (early-return in `handleUiIntent`, no gameplay side effects).

## Firewall check ✓
- **No `PermissionLadder.ts` change** (not in diff). **No `Balance`/meta change** (`Balance` imported in UiBridge, not modified; `MetaProgress` untouched). **Ceiling untouched** — consent never widens autonomy beyond the earned `permissionLevel` (rung toggles only *revoke within* the earned level).
- Files beyond the named firewall (`AgentStub.ts` +14, `Game.ts` +17) are the receipts/consent wiring — in-scope for the slice's ratified intent.
- 3-way merge with the sci-ceiling drain on `Game.ts` auto-resolved cleanly; verified both feature sets present (`continuedStudyBonuses` at 1848/1873/1947 + `agentConsent.*` at 1136/1157/1215/1259) — non-overlapping regions.

## Evidence
- `npx tsc --noEmit` — clean. `npm run build` — clean (only the pre-existing chunk-size advisory).
- **`e2e/m4-07-prospector-panel.spec.ts` (both projects): all pass** — G-open/no-pause, ladder earned-toggles + unearned-hints + current-abilities, auto-collect consent halts-and-resumes behavior with newest-first stacked receipts, mobile chip-tap full-width bottom sheet with 44px close target.
- **Regression (both projects): m4-06 embodiment, m4-05 agent-closeout, m4-01 tool-surface — all pass.**
- Boot probe (`_s106`, both projects): 2/2, zero console/page errors.
- Lane screenshots merged in: `artifacts/m4-07-panel/{panel-open-desktop,panel-open-mobile,receipts-stack,revoked-ability-state}.png`.

## Findings (non-blocking)
- **task-027-victory-must-matter:80** (desktop) failed once inside the 42-test concurrent batch, **passed isolated on first try** — concurrent-load flake (F-042 family), not caused by this merge (victory/meta/Claim-Office paths untouched by consent/receipts).
