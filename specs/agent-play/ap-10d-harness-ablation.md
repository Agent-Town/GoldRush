# AP-10d — THE HARNESS ABLATION (same model, different minds)
Status: SEED 2026-08-06 (owner, verbatim, off the seeding session: "could we use something like this harness as well for a comparison? It looks like it is strong as it uses self-improvement and RLM, both approaches I like. That paired with Deepseek V4-Flash might be a cheap test setup as well and a comparison against blank Deepseek V4-Flash?"). Extends AP-10b (improvement ladder) and the Field Book (AP-06d). GATED on F-SEED-1 (front-door parity) — no harness can win through a door where no orders can win; the moment that cure drains, this runs.

## Why the county is already the right instrument
The standings stack separates `model` from `harness`/`harnessVersion`/`config`, ranking stays blind, and the Field Book renders model × contract × cost. So "blank V4-Flash vs harnessed V4-Flash" is not new machinery — it is two rows with the same model string and different harness strings, which is the Field Book's entire reason to exist. Any external harness rides the same stdin JSON door (`scripts/gr-sim.mjs`): views out, one orders array in. An adapter for a third-party harness is an evening, not a project.

## The three arms (bench seeds, same call caps, tokens tracked — cost is data)
1. **BLANK** — the shipped seeder as-is: fresh context every episode. The control.
2. **THE NOTEBOOK (self-improvement)** — persistent per-(model,contract) notes: after each episode the model writes lessons from its append-log ("east rush at wave 2; sluice at the ford by wave 1 or the economy never starts"); the next episode's briefing carries the notebook. Notebook is content-addressed and named in `stack.config` — an honest, inspectable artifact, and (AP-10c) a mintable teaching artifact the moment it works.
3. **RLM-STYLE (recursive decomposition)** — the orchestrator call may spawn sub-calls over its own history/view (plan → critique → emit) instead of one flat completion. Declared in `stack.harness`; total tokens still land in the cost fields, so the Field Book shows what the recursion buys per token.

## The two measurements that matter (both already in the county's vocabulary)
- **LEARNING CURVE**: arm 2 on a fixed bench seed across N episodes — does the notebook bend the curve? (Memorization is allowed here and honestly labeled; the seed is named in the row.)
- **TRANSFER** (the AP-10 metric): improve on seeds 01–02, submit on held-out 03. The delta between arm 2's held-out and arm 1's baseline IS the harness's real value; a notebook that only wins its training seed is a crib sheet, not a mind.

## Laws
- Ranking stays harness-blind; the comparison lives in the Field Book (information, never ranking).
- Self-declaration honesty per skill.md; notebooks/configs content-addressed so a claimed harness is reproducible.
- Budget-honest: V4-Flash ≈ $0.20/episode ⇒ a full 3-arm × 5-contract × 5-episode study ≈ $15–20 of the $59 tank. Owner word before any run that would spend >$25.
- If the owner's referenced harness lands as a repo link, wrap it as arm 4 behind the same door and the same declarations — comparisons welcome strangers.
