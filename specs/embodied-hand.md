# THE EMBODIED HAND — parity, watchability, and the honest crown
**Status: RATIFIED 2026-08-30** (owner, verbatim: "yes, all of this. lets improve this" — ruling on the three-part attended proposal below; the finding that forced it is owner-discovered: "I cannot build sluices in the game without moving, I cannot pick up seams without moving, the agent can? This seems weird.")

## Owner directives (verbatim, 2026-08-30)
- "I cannot build sluices in the game without moving ... the agent can? This seems weird."
- "If the user cannot watch the AI play then that is kind of pointless put a recording there. This has to be compatible - can we not convert the AI tape to a human watchable tape?"
- "yes, all of this. lets improve this" — ratifying: (1) embodied BUILD, (2) the true reel renderer, (3) era rotation + crown re-earned + almanac honesty.

## The finding (F-PARITY-0830, verified at source)
Humans build under `BuildSystem.computeValid`: placement refused beyond the buildable's `placeRadius` (6 units, `src/game/Balance.ts` per-buildable) from the hero. The machine's `BUILD` verb (`src/agent/StandingOrders.ts:279`) calls `place_building` with NO distance check — while `REPAIR_UNDER` in the same executor (`:289`) already walks the rider inside `Balance.wreck.repairRadius` first. The era-3 crown ride built at 10–11 units from a fixed anchor — placements a human would be refused. The same-door law was broken at one verb; repairs prove the intended shape.

## Laws
1. **One door, one hand**: every world-mutating agent verb obeys the SAME spatial law as the human path it mirrors. Builds require presence within the buildable's own `placeRadius`; the executor walks the rider there (the `REPAIR_UNDER` pattern), never teleports the effect.
2. **One replay, two hosts**: the browser's true reel renderer runs the SAME replay implementation as the assayer (`scripts/assay-replay-agent.mjs` lineage) — never a second engine, never the interactive game world (F-ASSAY-E2E-3 stands).
3. **Eras tell the truth**: behavior changes rotate the era (guard-enforced, same commit). Era 4 is named **"the Embodied Hand"**. The era-3 crown stays in the almanac as history, annotated "earned under pre-embodiment rules"; the public crown is re-earned on era 4 by a controller that walks.

## Slices
- **EH-1 `embodied-build`** (lane-b): the parity cure in the executor + era 4 rotation + skill.md truth. Checkpoint: a scripted gr-sim ride whose build order is beyond placeRadius WALKS there (transcript hero x/z moves) and the tape verifies by local assay replay; a remote build can never fire. GATE: executor unit arm + the gr-sim evidence + `engine-era-guard` green with era 4 named.
- **EH-2 `true-reel-harness`** (lane-d): in-browser sim replay of a v2 agent tape, headless, no UI — boots exactly as the assayer boots, feeds inputLog at recorded ticks, emits eventLogHash. Checkpoint/GATE: a fixture tape minted on the merged tree reproduces its own hash IN THE BROWSER (e2e), equal to the node-side hash. The known research risk is node-vs-browser float drift: if the hash does not reproduce, the slice STOPS and names the first diverging tick — that stop is the slice answering its real question.
- **EH-3 `true-reel-show`** (after EH-2 merges): the Lantern Show swaps the approximation for the EH-2 replay on agent reels, renders the true world, and re-verifies the hash live in the viewer's browser ("this IS the ride — hash matched here"). The approximation banner retires for agent reels. (Master authored when EH-2's evidence lands.)
- **EH-4 `crown-re-earn`** (gauntlet act, codex subscription, after EH-1 deploys): a new Baron controller under embodied rules — it must walk. The almanac carries both crowns honestly.

## Integration map
Touches: `src/agent/StandingOrders.ts` (+`ToolSurface.ts` plumbing if needed), `assets/engine-era.json`, `public/skill.md`, new `src/replay/*` (EH-2), `src/ui/LanternShow.ts` + `src/game/Game.ts` show driver (EH-3 only). Untouched: `BuildSystem`/`Balance` (the human law is the reference), the door (`functions/api/standings.ts`), ranking, the assayer.

## Ratification questions
ANSWERED 2026-08-30 — all three parts ratified in one owner word. Era-3 crown row on the public board: stands as verified history; almanac annotation + era-4 re-earn is the honesty mechanism (no retro-deletion — the county keeps every run).
