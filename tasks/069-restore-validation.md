# Task 069-restore-validation: malformed save data never crashes, never poisons (lane-b; commit prefix "fix:")
CODEX: model=gpt-5.5 effort=medium
FROM **F-SOL-PERSIST-001 [P0]** (`reviews/sol-findings-persistence-multiplayer.md` — read it FIRST, the evidence is file:line precise): `RunSuspend.ts` validates a shallow subset then dereferences deep (`snapshot.rng.waves`, counters, nested vectors) and trusts `snapshot.economy.log`; `SaveSlots.ts:240-251` is shallower still for IMPORTED slots (user-supplied files!).
You are Codex in worktrees/lane-b. Pre-flight per LANE-SAFETY.

## Scope
1. **A single validation/normalization boundary** every restore path crosses (continue-run, save-slot load, ledger import, cloud pull, MP resync pass-through): full structural validation of the declared schema (types, finite numbers, array shapes, enum fields), with normalization defaults ONLY where a missing field has a safe derivation — otherwise clean rejection.
2. **Rejection is a card, not a crash**: in-world line ("this page of the ledger is water-damaged"), the offending slot/import marked, the app boots to a safe state. NEVER a throw during boot/continue.
3. **Economy log entries validated** before reduction (bounded values, known event types) — malformed events dropped with a diagnostics note, never applied.
4. **e2e fuzz gate**: a corpus of malformed snapshots (truncated, type-swapped, NaN-injected, hostile-imported) round-trips through every restore path — zero crashes, zero economy deltas from rejected data, the card shows. Plus regression: all existing save/suspend/slot specs stay green.

## Firewall
Touch ONLY: RunSuspend validation/normalization, SaveSlots import validation, the rejection card UI string, the fuzz e2e + fixtures. **NO snapshot schema changes (069 hardens reading; PERSIST-002's completeness slice owns writing), NO sim, NO Balance, NO save-key changes.**
End: **READY-FOR-GATES** + the fuzz corpus results table.
