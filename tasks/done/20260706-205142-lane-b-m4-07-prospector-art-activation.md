# Task M4-07: activate the Prospector's real sprite — swap procedural billboard → illustrated hover automaton (LANE-B, branch lane/m4, commit prefix "m4:")

**FIRE-AUTHORED (s83, attended review welcome).** Authored from the evidence chain:
`reviews/m4-re-land.md` (m4-06 embodiment landed a procedural placeholder + a DORMANT
`char.prospector_agent` contract stub), `reviews/art-batch-008-prospector.md` + `assets/LEDGER.md`
(the real hover4 art is now PROCESSED and QA-passed), and a scout fact-sweep of the exact
integration points (cited inline below). No invented scope — m4-06 shipped the DORMANT slot
expecting exactly this replacement.

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-b.
READ FIRST: AGENTS.md; docs/GOLD_RUSH_BRIEF.md §6–7 (agent) + §9.2/§9.4 (canon: the agent is
"the Prospector", frontier-tech/machinefolk, NO firearms, NEVER gory); `reviews/art-batch-008-prospector.md`
(the art you are wiring + its measured heights + the F-008-1 seam note); `src/agent/Embodiment.ts`;
`src/assets/SpriteAnimator.ts`; `assets/layer-contracts/characters.v2.json`.

## Pre-flight (SAFE reset — drain-gated per LANE-SAFETY law)
lane/m4 is MERGED into main as of s82 (`28a6165`). CONFIRM before resetting: run
`git checkout lane/m4 && git log --oneline main..lane/m4` — if that prints ANY commit, STOP
and report (there is unmerged lane output; do NOT reset). If it is EMPTY (expected), proceed:
`git reset --hard main && git clean -fd && npm install --no-audit --no-fund`, then `npm run build`
green before touching anything.

## Why
The Prospector companion currently renders a procedural canvas billboard (placeholder-first law,
m4-06). The real illustrated art now exists and is processed: 32 hover cells
`assets/processed/char-prospector-sheet-hover4-{a,b}-r{0..3}c{0..3}.png` + `.frames.json`
per sheet + `char-prospector-portrait.png` (768²). This slice makes the buddy Robin asked for
look like the warm brass automaton it is — the visible payoff of M4, and Demo-Day-relevant.

## Scope
1. **Activate the contract** — in `assets/layer-contracts/characters.v2.json`, replace the bare
   `char.prospector_agent` stub (currently just `slot`/`status:DORMANT`/`fallback.procedural`/`notes`,
   ~lines 261-267) with a full slot carrying a **`walk4` block** structured identically to
   `char.hero`'s `walk4` (lines 49-64): `"status": "ACTIVE"`, `"mirrors": {}`, 8 explicit
   `directions`. Sheet-A files fill s/se/e/ne (rows r0-r3), sheet-B files fill n/nw/w/sw (r0-r3);
   the 4 columns c0-c3 are the hover-bob phases; each direction's `clips` = `{ "walk": { "frames":
   [0,1,2,3], "fps": 4 } }`.
   - **CRITICAL — name the block `walk4`, NOT `hover4`:** SpriteAnimator's activation branch reads
     the literal key `slot.walk4` (SpriteAnimator.ts ~line 654) and the clip name `"walk"` (its
     locomotion path). A block named `hover4` or a clip named `"hover"` would NOT be loaded without
     a new SpriteAnimator code path — which is OUT OF SCOPE. Keep it data-only: block = `walk4`,
     clip = `walk`. Record in the block's `notes` that these frames are a hover-bob cycle (no legs),
     fps 4 for a gentle float (tune 3-6 to taste; justify in the run file).
2. **Swap the render in `src/agent/Embodiment.ts`** — replace the procedural visual (the
   `texture`/`material`/`sprite` fields ~lines 26-33, their constructor wiring ~lines 43-49, the
   `material.rotation` tilt ~line 91, the `this.texture` dispose ~line 115, and the whole
   `createProspectorTexture()` ~lines 142-219) with a `SpriteAnimator` instance built for
   `assetSlots.charProspectorAgent` (constructor `(slotId, material, sprite?, fadeMaterial?)`).
   Add a `currentDirection` field: derive the 8-way heading from movement `dx/dz` (reuse the
   project's existing heading→direction helper if one exists — the hero rotation code has one; do
   NOT invent a second convention). Each frame call
   `animator.update(delta, this.moving ? 'walk' : 'idle', currentDirection)`. Keep the existing
   idle bob (`group.position.y` from `Balance.agent.idleBob*`) — that IS the hover float.
3. **Size + seam (F-008-1)** — set the sprite world size (via `Balance.agent.spriteScale`,
   ADDITIVE/tune only) so the automaton reads at ~70% of the hero's on-screen figure band
   (measure in-world against the hero, state the measured ratio in the run file). The processed
   cells are auto-fit @scale=1 with sheet-A figures ~215px vs sheet-B ~203px (~6% larger on A). If
   the companion visibly size-pops when it turns front↔back, fix it by RE-EXTRACTING sheet A to
   match B: `node scripts/extract-alpha.mjs --key ff00ff --grid 4x4 --scale 0.944
   assets/raw/char-prospector-sheet-hover4-a.png` (0.944 ≈ 203/215), re-verify heights, and note it.
   If it does not visibly pop at gameplay zoom, leave both @scale=1 and say so.
4. **Portrait in the ladder chip (SECONDARY — only if cheap & additive)** — the m4-06 permission
   chip is text-only. If the chip has (or trivially gains) a small icon slot, show
   `char-prospector-portrait.png` there for identity; keep it additive HUD-only. If it needs real
   UI restructuring, DEFER it (note in the run file) — the body activation is the gate-critical
   deliverable, don't let the portrait expand the blast radius.

## Firewall
Touch ONLY: `assets/layer-contracts/characters.v2.json` (the prospector slot), `src/agent/Embodiment.ts`
(render swap + direction field), `src/game/Balance.ts` (ADDITIVE agent knobs only), `assets/processed/`
(only if you re-extract sheet A per §3), the m4-06 e2e (extend, see below), and `assets/LEDGER.md`
(flip the batch-008 Integrated cell to ✓ with your evidence). Do NOT change: the
`ProspectorEmbodimentSnapshot` shape / `agent.embodiment` diagnostics fields
(visible/moving/position/target/receiptCount/lastLine — 4 existing tests read them), tool-surface
semantics, permission-ladder logic, Economy/Combat/Wave/BuildSystem, SpriteAnimator code, slots.ts,
vite-env.d.ts, or any other lane's files.

## Self-check (evidence, not vibes)
- `npx tsc --noEmit` + `npm run build` green.
- **`e2e/m4-06-embodiment.spec.ts`: the 4 EXISTING tests still pass UNMODIFIED** on both projects
  (they assert behavior/snapshot, not texture — swapping the material must not disturb them).
- **Add ONE new test** (in m4-06 or a new `e2e/m4-07-prospector-sprite.spec.ts`): on plain boot the
  companion renders the real sprite — assert a loaded sprite texture / non-blank companion pixels
  (not the procedural canvas), and that when driven (`?debug`, agent level ≥1,
  `__GR_AGENT__.panAt(node)`) the facing direction tracks movement (the sprite's active direction
  changes as it moves). Reuse the m4-06 driving pattern (setAgentLevel + panAt + poll
  `agent.embodiment.moving`).
- Regression: `m1-01` + `m2-01` (12/12) + `m3-06` (lane-a intact) unmodified green both projects;
  the m2-01 draw-call budget (≤200) still holds (one animated billboard, no new draw-call class).
- Zero console/page errors desktop 1280×800 + mobile 390×844.
- Before/after screenshots (companion idle + mid-action, showing the illustrated automaton) into
  `artifacts/m4-07/`; state the measured hero-height ratio and the A/B pop verdict.

End: READY-FOR-GATES + files changed + per-project results + the size/seam measurements. Do NOT
merge — a fire gates this (the in-world visual review needs a quiet host).
