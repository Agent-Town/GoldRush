# Task 077-epoch-substrate: ten eras through one data contract (lane-b; commit prefix "feat:")
CODEX: model=gpt-5.6-sol effort=high
FROM `specs/epoch-substrate/README.md` (READ IT FIRST, whole — the 7 decisions are DECIDED; escalate with evidence, never relitigate) + its evidence source `reviews/sol-findings-masterplan.md` F-SOL-MP-001.
You are Codex in worktrees/lane-b. Pre-flight per LANE-SAFETY.

## Scope (the spec's decisions, implemented)
1. EpochBundle typed research/threshold/megaproject/transition/successor fields + loadEpoch validation (reject-don't-stretch).
2. Generic `activateEpoch` (successor + megaproject-record gate; zero hardcoded ids).
3. Data-driven research: Frontier array → epoch-1 manifest VERBATIM (byte-equal semantics); per-epoch banked keys with legacy mapping.
4. Chart renders the active epoch generically (branches, icons, banked overflow, successor column).
5. 072 grandfather shims (E2-active profiles valid untouched).
6. Epoch-2 science manifest from the e2 bundle + THE PROOF e2e: fresh-E2 profile → research steam nodes → bank threshold → raise the E3 megaproject target → `epoch-activated: epoch-3-voltage` — no engine edits.
7. Regressions: research-chart + 072 + sci suites green; existing-profile migration asserted (legacy research state reads identically); determinism hash unchanged.

## Firewall
Touch ONLY: ContractFamilies, ResearchTree, ResearchChart, epoch-1/2 manifest data, migration shims, e2e. **NO sim tick (fixed-step just landed — do not touch Loop/Game.update), NO Balance values, NO E3+ content beyond the manifest stub, NO MP, NO save keys beyond additive.**
End: **READY-FOR-GATES** + the proof-gate e2e output + the migration assertion output.
