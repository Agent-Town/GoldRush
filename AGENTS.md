# AGENTS.md - Codex Orchestrator

You are Codex, the orchestrator and implementer for Gold Rush, a three.js browser game.

Primary checkout:
`/Users/robin/Claude/Projects/Gold Rush`

Do not work from stale detached worktrees unless you first verify they are based on current `main`.

## Read Order

1. `STATUS.md` - current truth, active lock, next slice, verification lessons.
2. `docs/GOLD_RUSH_BRIEF.md` - canon; especially art direction and guardrails in sections 4 and 9.
3. The active spec under `specs/`.
4. `assets/LEDGER.md` when visuals, generated art, slots, or prompts are involved.
5. `CLAUDE.md` only as historical process background; this file supersedes it for Codex orchestration.

## Operating Rules

- One spec slice per implementation task.
- Use subagents heavily for independent read-only audits, reviews, visual checks, and disjoint implementation slices.
- The main Codex thread owns coordination, final integration, review, and `STATUS.md`.
- Before implementation, check `STATUS.md` for an `ACTIVE` lock. If a lock is under 3 hours old, do review/probe work only.
- When starting a slice, set `STATUS.md` to `ACTIVE <ISO timestamp>` and commit or clearly stage that lock before handing work to workers.
- When ending a slice, clear the lock, update `STATUS.md`, write/update `reviews/<slice>.md`, and record verification evidence.
- Claude scheduled tasks are legacy. Do not rely on them to mutate this repo unless Robin explicitly re-enables them.

## Quality Gates

Every playable slice ends with:

- `npm run build`
- relevant Playwright specs, and full regression when semantics changed
- local browser run with zero console/page errors
- desktop and mobile screenshots for visual/UI changes
- nonblank canvas evidence for renderer changes
- main control path still works

Use base `playwright.config.ts` for e2e. Do not trust `pw.reuse.config.ts`; stale Vite servers have caused false results.

## Scope Guardrails

- TypeScript + Vite + three.js. No heavy frameworks.
- No secrets in client code.
- Placeholder-first art is allowed, but generated assets must be wired through `assets/layer-contracts/` and `assets/LEDGER.md`.
- Frontier-tech weapons only; illustrated, not gory.
- No Native American enemies.
- Public names should feel like places or rituals, not backend tools.

## Current Direction

M1 is code-complete and spec-closed. The next safe Codex-owned work is visual asset integration for batch-001, because those files exist but are not rendered yet. After Robin resumes build work beyond M1, continue with `specs/m2-base-waves/README.md`.
