# Review — M6 attempt-4: actors foundation integrated (attended drain, s61, 2026-07-07 ~12:50)

**Slice:** `save/m6-attempt4-integrate` (cb0b00e, lane-d) → merged to main `5de1c85`.
**Verdict: PASS — merged.** The foundation the town, recruited agents, and the whole second half of the saga stand on. Behavior-frozen: `Balance.actors.enabled = false`; zero gameplay change, proven.

## What it does
Replaces the hero singleton with `actors = [Hero]` + `primaryActor` plumbing through Game and CombatSystem (CombatSystem accepts `readonly Hero[]`, remains the sole damage resolver). The audited attempt-3a scratch, re-applied onto fresh main per the preserve-hooks law. Fourth attempt; first merge; the attempt-2 rejection was formally refuted by the audit (its tripwire was main's own since-fixed bug F-028-1).

## Evidence
- Runner self-check (pre-merge, 8h-old base): serial battery **56/56** · perf-02 bench 2/2 · determinism seed `m6-r3a-determinism` hashes IDENTICAL desktop+390 (`99a299eb…`) · zero console errors · codex review clean.
- Attended drain (post-merge tree): tsc CLEAN · build green · battery **66/66** both projects (task-025, m1-01, m2-01, m4-06, sci-01, perf-02) · **determinism second pass green** (perf-02 re-run, envelopes held).

## Merge classification
3 files vs 8h-moved main. Balance.ts + CombatSystem auto-merged (additive). Game.ts: 3 conflicts, all one shape — main's newer features (043 context-bar `demolish`, `agentConsent.reset()`) vs the `hero→primaryActor` rename. Resolved per the audit's law: main's features kept, routed through `primaryActor`; +5 mechanical renames in main-newer regions (tsc-verified exhaustive). One dedupe (buildWorld position/sync lines).

## Findings
None blocking. Salvage lifecycle applied: `save/m6-attempt4-integrate`, `lane/m6-r3a-apply`, `lane/m6-partial-salvage` → archive/*. **UNLOCKED: WP-TOWN — the Town v1 spec (attended) is now authorable; it gates Epoch 2.**
