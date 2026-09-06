# ADR-005 — Rider parity: the agent controls exactly what a human controls

**Status:** RATIFIED by the owner, 2026-09-07 (desk answer A2), verbatim:

> "Humans cannot control the positioning of the Prospector, just the rider, for the Prospector they can give "policies" like repair. This has to be 1:1 the same for the AI. There cannot be an unfair advantage here of it being able to control the Prospector like the rider and the human cant."

**The law.** The species-blind benchmark compares like with like. A human player steers the rider (the hero) and gives the Prospector POLICIES; a human never positions the Prospector directly. The agent door must offer exactly that surface: the rider's body under direct control (`MOVE_HERO`, the rider's own actions), the Prospector under policies a human can also set, and nothing a human cannot do. Any verb that positions the Prospector directly, or reaches a mechanic the human has no control for, is an unfair advantage and must go or be reframed as the human's own control.

**Consequences.**
1. The door grammar is audited verb by verb against the human's real control surface (`src/ui/ProspectorPanel.ts` and the game's input paths), the same-game audit's method extended to CONTROLS, not only mechanics. The audit names every verb without a human twin (`MOVE_TO` is the first) and proposes the 1:1 grammar.
2. Verbs without a human twin are removed or replaced by the policies the human has; where the human's policy surface is thinner than a fair game needs, the human gains the control too, never the agent alone.
3. Existing tapes that use removed verbs no longer replay and retire under ADR-004; heats and provers are re-ridden on the new grammar. Early release: "we can act freely".
4. `docs/bench/same-game-audit.md` gains a controls table and a guard keeps every door verb mapped to a human control.

**Related.** ADR-004 (seasons and lineage), F-HMV-1 (closed by the same ruling's first half on 2026-09-06: "the player can also not walk the Prospector but just the rider").
