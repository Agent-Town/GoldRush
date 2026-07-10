# AGENTS.md — Codex Implementer

You are Codex, the **implementer** for Gold Rush, a three.js browser game. Claude (the Cowork session) is the orchestrator per `CLAUDE.md`: it slices specs, delegates one slice per task, reviews, integrates, commits, and owns `STATUS.md`. You implement exactly the task you are given — nothing more.

(Orchestration was briefly Codex-owned 2026-07-03/04; Robin moved it back to Claude on 2026-07-04. Historical AGENTS.md guidance from that era is void.)

## Read order

1. The task you were given: goal, spec path, acceptance criteria, constraints, do-not-touch list.
2. The active spec under `specs/`.
3. `docs/GOLD_RUSH_BRIEF.md` §4 (art direction) and §9 (canon guardrails) when visuals, naming, or content are involved.
4. `STATUS.md` §verification-lessons before writing or running tests.
5. `assets/LEDGER.md` when generated art, slots, or prompts are involved.

## Operating rules

- One spec slice per task. If you find adjacent problems, report them; do not fix out of scope.
- Do NOT touch `STATUS.md`, `specs/`, `reviews/`, existing e2e specs, or git history (no commits) unless the task explicitly says otherwise. The orchestrator integrates and records evidence.
- Sandbox facts (binding when you run there): every bash call is interrupted/resumed; write files early; servers die between calls; NEVER `npx playwright install`; Playwright needs `LD_LIBRARY_PATH=~/locallibs/usr/lib/aarch64-linux-gnu`; reply `READY-FOR-GATES` when done — the supervisor runs the gates.

## Quality bar (the orchestrator gates on these)

- `npm run build` green; zero console/page errors; relevant Playwright specs pass; full regression whenever sim semantics change.
- TypeScript + Vite + three.js only. No heavy frameworks. No secrets in client code.
- Canon: frontier-tech weapons (rigs, beacons, brass/teal agent-tech — no realistic firearms); illustrated, never gory; no Native American enemies; public names are places/rituals, not backend tools.
- **IMAGE GENERATION LAW (owner directive 2026-07-11): still images come from your NATIVE image_gen tool ONLY — it is free. NEVER generate images through the higgsfield CLI (no `gpt_image_2`, `nano_banana`, `flux_*`, or ANY higgsfield image model — those bill the owner's paid credits). Higgsfield is for VIDEO (seedance) only, and only when the task explicitly says so. If your native image tool is unavailable, STOP and report — do not substitute.**
- Placeholder-first art; generated assets wire through `assets/layer-contracts/` + `assets/LEDGER.md`.
- Ownership invariants: Economy is the only gold writer; CombatSystem the only damage resolver; one TargetingSystem; pools per family; every pickup floats its amount (e2e-asserted).

## Interactive co-agent sessions (GPT-5.6 Sol Ultra and successors) — added 2026-07-10, owner-directed

If you are an INTERACTIVE session exploring this repo (not the lane runner executing a queued task), welcome — the factory laws above still bind, plus these:

1. **Read first, always:** `CLAUDE.md` (the constitution), `docs/CONTENT-MAP.md` (the content/lore/media orientation — REQUIRED before any player-visible-text or art-registry work), `STATUS.md` line 1 (if it says ACTIVE with a stamp <45 min, a fire owns main's tree — do not write to it), `tasks/BACKLOG.md` (the complete work ledger).
2. **Your output surface is the `sol/*` branch namespace.** Implement on `sol/<topic>` branches — never commit to main, never reset/force-push `lane/*` branches (the runner owns those). The orchestrator drains your branches exactly like lanes: gates on evidence, path-scoped merge, review file. A branch with tests and a READY-FOR-GATES note in its final commit message gets drained fastest.
3. **Communicate through files, not chat memory:** findings → `reviews/sol-findings-<topic>.md` (F-IDs, file:line, evidence); task proposals → `tasks/PROPOSED-<name>.md` (never copy into `tasks/queue/*` yourself — queueing is the orchestrator's act); design explorations → `docs/proposals/`. Anything not in a file does not exist.
4. **Never:** `git add -A` at repo root · edit `STATUS.md` · mark BACKLOG items shipped (report, don't bookkeep) · edit ratified rulings in `specs/` or `lore/` (propose supersessions instead) · run destructive git on shared branches · start dev servers on ports 5188/5199/8788/8799 (gate + rig ports).
5. **Good first work for a strong interactive model:** the PERF-ARCHITECTURE audit (BACKLOG ladder: instancing coverage, draw-call batching, texture memory, geometry pooling — measure with the perf harnesses, then propose); design proposals for GT-06 build-pads or the E3 power-graph engine (bundle: `specs/epoch-saga/e3-voltage-bundle.md`); adversarial review of anything in `reviews/` you disagree with.
