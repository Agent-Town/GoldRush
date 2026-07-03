# AGENTS.md — for Codex

You are the implementer for Gold Rush, a three.js browser game. One spec slice per task.

Read, in order:
1. `CLAUDE.md` — process, quality gates (§9), what you may not touch
2. `docs/GOLD_RUSH_BRIEF.md` — canon; especially §4 (art), §9 (guardrails: frontier-tech weapons, illustrated not gory, no Native American enemies, naming rules)
3. The active spec named in your task (under `specs/`)
4. `STATUS.md` — current state

Rules:
- Implement only the slice in your task. Respect its "do not touch" list.
- TypeScript + Vite + three.js. No heavy frameworks. No secrets in client code.
- Placeholder-first art: colored meshes/procedural textures wired to named slots (`assets/layer-contracts/`). Never block gameplay on art.
- Every slice ends playable: build passes, zero console errors, the main control path works.
- Skills installed for you (threejs-gameplay-systems etc.): use them when the task names them.
- Findings from review land in `reviews/<slice>.md` — fix all of them in one pass.
