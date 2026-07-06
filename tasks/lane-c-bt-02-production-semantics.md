# Task BT-02: tiers must have TEETH — production & strength semantics (LANE-C, branch lane/polish, commit prefix "feat:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-c. READ FIRST: AGENTS.md; specs/building-tiers/README.md (ratified — this is slice BT-02); the BT-01 review in reviews/ (what tier-core actually wired). Pre-flight (LANE-SAFETY, runner-auto-commit aware — replaces the stricter rule that no-op'd the 05:44 run): ahead lane commits whose content is already merged to main are SAFE DUPES → `git checkout -B lane/polish main && git clean -fd` and PROCEED. STOP only on an ahead commit NOT represented on main, or uncommitted foreign edits. Then `npm install`; build green first. Sequencing vs the correctives task in this same lane: whichever runs second force-resets again — both are independent off main.

## Owner ruling (2026-07-07, mid-playtest, verbatim — this is the LAW of this task)
"I upgraded the Sluice but it produces the same amount of gold — of course upgrading buildings should improve their production. Otherwise it does not make sense. Upgrading towers or walls should make them much stronger. Otherwise it does not make sense to upgrade. Not all buildings have to be upgradeable."

## F-BT-01-1 (verify first)
If BT-01 shipped a purchasable sluice tier with NO yield effect, that is a live do-nothing purchase — the worst UX in the game right now. FIRST ACTION: verify what each tier currently changes (read the BT-01 diff + Balance tier tables). Never leave a buyable tier without a felt effect; if any tier can't get its effect in this task, LOCK its purchase button ("requires: <coming era>") rather than selling nothing.

## Scope (the ratified trio only — "not all buildings have to be upgradeable" is already law)
1. **Sluice tiers → production**: each tier meaningfully raises auto-pan yield/rate (felt within one wave — target ≥ +60% per tier as the starting stake; Balance-tunable). Tier-2 sluice should visibly out-earn two tier-1s per footprint — that's the point of upgrading.
2. **Turret tiers → firepower**: damage and/or fire-rate per tier ("much stronger" — starting stake ≥ +50% DPS per tier), respecting 041's overwatch (lob-arc unaffected).
3. **Palisade tiers → toughness**: max HP per tier ("much stronger" — starting stake ≥ +75% HP), interlocking with wear states (tier walls crack later) and BT-00 demolish refund math (invested cost includes tier spends).
4. **Feedback of the purchase**: on upgrade, an immediate legible confirmation — ledger float-text ("Sluice II — the works run richer") + the tier visual + (for sluice) the very next pan-out visibly larger. The player must FEEL the buy within seconds.
5. Economy telemetry: tier spends and per-building yield visible in diagnostics for the 021/012 tuning loop.

## Firewall
Touch ONLY: Balance tier tables (additive), BuildSystem tier effect application, sluice yield path (Economy stays sole gold writer — yield flows through existing grant sources), turret handle stats, palisade maxHp, upgrade UI copy, e2e. NO new buildings, NO tier availability beyond science gates already shipped in SCI-02, NO wave/enemy changes.

## Self-check
tsc/build; new/extended e2e: tier-2 sluice yield > tier-1 measurably; turret tier DPS delta; palisade tier HP delta; do-nothing-purchase impossible (every enabled tier button changes a stat, asserted generically); BT-00 refund includes tier investment; m2-01 + task-025 + m1-01 unmodified green both projects; zero console errors. Commit on lane/polish. End: READY-FOR-GATES + what BT-01 had actually wired (F-BT-01-1 answer) + results.
