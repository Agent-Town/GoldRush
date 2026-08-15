# The Run-Start Tape Contract (tape v2) — what a proof must carry
### Status: RATIFIED 2026-08-15 (attended, from the s1796 fidelity matrix; one-tape-per-life owner-ruled same day) · the format law the assay worker verifies against · companion to `specs/agent-play/assay-worker.md`

## Why (measured, not argued — the s1796 matrix)
The fidelity matrix (`e2e/assay-replay-roundtrip.spec.ts`, lane-d `2ba06e494`) isolated the divergence class exactly:
- Fresh single-life tapes reproduce byte-for-byte ✓ (cell b). Death-restart tapes reproduce ✓ (cell c) — **one-tape-per-life already exists**: `resetRun()` cuts a fresh recorder (`RunManager.ts:327`, `Game.ts:6440`). The owner's ruling ("one tape per life makes the most sense") is satisfied by shipped behavior and this contract PINS it as law.
- **The real gap: progression.** Live boot applies saved meta progression (`RunManager.ts:86`; Territory-I changes starting build credits, `Game.ts:7285`) while the replay boot exits before installing `RunManager` (`Game.ts:2209`). A controlled Territory-I tape diverges on a fresh single life (`d6ceecd8` vs `168dafd5`); both live reels diverge because both players are progressed. **A tape that does not declare its starting state does not describe its run.**

## The contract
1. **One tape = one life** (law, already mechanical): a tape begins at run birth and ends at that life's terminal; a death-screen restart cuts a new tape. No tape spans lives.
2. **Tape v2 adds `runStart`** — the progression state the run began under, in the shape the game has ALREADY proven sufficient for booting identical progressed state across machines: the multiplayer room-setup progression payload (`normalizeSetup`'s `meta` + `research`, `functions/api/_multiplayer.ts`; live-verified in room inspect: `meta{version, tracks{territory, science, hero, agent}}`, `research{version, epochId, metaScienceCursor, progress, taken[]}`). **Reuse that shape verbatim — do not invent a sibling schema.** (Medals are deliberately NOT included: no currently-assayable contract's sim reads them headless; extend `runStart` the day one does, with a version bump.)
3. **The recorder captures `runStart` at run birth** (`startRunTape`), from the same live state `RunManager` just applied — recorded, never re-derived later.
4. **Replay applies `runStart` before boot**: the replay path installs the run under the tape's declared progression (seed the storage / RunManager with `runStart` — the same apply mechanics the MP guest path and the campaign harness's profile injection already use). Replay of a v2 tape MUST reproduce its recording byte-for-byte; that is the assay's verify condition.
5. **The declaration is part of the claim**: the assayer verifies that the OUTCOME follows deterministically from the DECLARED inputs (seed + runStart + input log). A fabricated `runStart` produces a replay of that fabricated state — the outcome still has to follow. Ranking fairness across progression levels is unchanged county law (progressed players already rank alongside fresh ones); the tape just stops lying about which game was played.
6. **Bounds**: `runStart` adds ~1–2 KB (four int tracks + the taken-nodes list). The 64 KB tape cap is UNCHANGED; `validateTape` (v2) requires `runStart` well-formed and within the same total cap.
7. **Legacy (v1) tapes are structurally unverifiable** — they omit `runStart`, so no replay can be faithful to an unknown starting state. No retro-fill is possible honestly.

## The legacy board (owner line-item — the ONE open question, with a recommendation)
Q4's "retro-assay the existing 17 rows" was ruled before we knew v1 tapes cannot verify. Two honest options:
- **(a) RECOMMENDED — archive & fresh board at launch:** the pre-assay board is preserved as a named history page ("the county's first ledger", RETENTION LAW — nothing deleted), and the launch board starts empty and 100% assayed under v2. Clean trust story: every visible rank is a verified rank.
- **(b) Legacy badge:** old rows stay, marked "pre-assay era, unverifiable"; new rows assay. Keeps continuity, dilutes the trust claim.
Owner picks one word: **archive** or **badge**.

## Sequencing
Implemented by the re-landed `assay-replay-fidelity` master (recorder + replay + validateTape v2 + the roundtrip battery, salvaging lane-d `2ba06e494`); the worker loop (assay-worker slice 2) unblocks when the Territory-I counterexample reproduces and a fresh progressed-profile round-trip is green twice.
