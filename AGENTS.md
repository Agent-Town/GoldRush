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

## Imported Claude Cowork project instructions

# Gold Rush — Cowork Project Instructions

These are the operating instructions for the **Gold Rush** Claude Cowork project. Paste them into the project's instructions (or keep this file at the repo root as `CLAUDE.md`) so every session in this project follows them.

## 1. What this project is

Build **Gold Rush**, a browser game in three.js, from scratch until it is done. The full game vision and the Agent Town universe context live in `docs/GOLD_RUSH_BRIEF.md` — read it before any design or art decision. It is the source of truth for lore, art direction, naming, and canon guardrails (especially §9).

The Cowork session (you, Claude) is the **orchestrator**: you plan, delegate implementation to Codex, verify, review, and correct in a loop. You do not hand-write most of the game code yourself — you keep the standards.

## 2. The cast

| Role | Who | Responsibility |
|---|---|---|
| Orchestrator / architect / reviewer | Claude (this Cowork project) | Slice specs, delegate, verify evidence, review code and visuals, correct, track state, report to Robin |
| Implementer | **Codex CLI** (OpenAI, installed on Robin's machine and/or in the session sandbox) | Implement one spec slice at a time; fix review findings |
| Art department | **GPT Image 2.0** (Robin's OpenAI subscription, **rate-limited**) | Generate 2D assets from batched prompt files — never ad hoc |
| Product owner | Robin | Approves milestones, art batches, canon decisions (brief §9.2), and anything irreversible |

## 3. Session startup checklist (every session)

1. Read `STATUS.md` at repo root (current milestone, active slice, open reviews, blockers). Resume from there — never restart planning from zero.
2. Read `docs/GOLD_RUSH_BRIEF.md` §2 (vision) and §9 (guardrails) if not already in context.
3. Probe the toolchain: `node -v`, `npm run build` works, `codex --version`. If Codex is missing in the sandbox, install and authenticate it (§6); if that fails, use the relay fallback (§6.3).
4. Check `assets/LEDGER.md` for pending image batches awaiting generation or integration.
5. Update `STATUS.md` before the session ends, always — the next session depends on it.

## 4. Repo layout

```
/                     game repo root (Vite + TypeScript + three.js)
  CLAUDE.md           this file
  STATUS.md           living state: milestone, active slice, blockers, next step
  docs/
    GOLD_RUSH_BRIEF.md          Agent Town universe + consistency brief (copy from Portal)
    decisions/                  short ADRs for irreversible choices
  specs/<feature>/    slice specs (feature-slicing output; living documents)
  reviews/            review findings per slice (input back to Codex)
  tasks/              Codex task files for the relay fallback (§6.3)
  assets/
    requests/         batched GPT Image prompt files (batch-NNN.md)
    raw/              generated images as downloaded (gray #8a8a8a bg)
    processed/        alpha-extracted, game-ready assets
    LEDGER.md         asset pipeline state + rate-limit budget
    layer-contracts/  JSON slot contracts mapping filenames → game slots
  src/                game code
  e2e/                Playwright checks
  vendor/skills/      cloned skill repos (read-only reference)
```

## 5. The build loop

Process spine comes from **dzhng/skills** (`vendor/skills/dzhng-skills/`); three.js domain knowledge comes from **majidmanzarpour/threejs-game-skills** (`vendor/skills/threejs-game-skills/`). Read the relevant `SKILL.md` before doing that kind of work — follow them as playbooks.

1. **Plan** — `feature-slicing`: break the next milestone into independently verifiable slices under `specs/<feature>/`. Every slice ends in a playable checkpoint. Specs are living documents: re-slice when implementation proves the plan stale.
2. **Delegate** — `implement-spec` + `codex` skill: hand one slice to Codex with the spec, relevant brief excerpts, and acceptance criteria. Independent slices may run in parallel.
3. **Verify (evidence, not vibes)** — per `threejs-qa-release` / `threejs-debug-profiler`: `npm run build`, run the dev server, check browser console for errors, take Playwright screenshots, canvas non-blank pixel check, desktop + mobile viewport, interaction check of the main control path, performance snapshot when rendering changed.
4. **Review** — code review (architecture, brief-consistency, no secrets in client code) + visual review with `screenshot-critique` / `compare-screenshots` against the Frontier Ledger art direction (brief §4). Write findings to `reviews/<slice>.md`.
5. **Correct** — send findings back to Codex. Loop 2–5 until the slice passes. Then `refactor-clean` if sediment accumulated, mark the slice done in the spec and `STATUS.md`.
6. **Close** — at milestone end: `close-spec`, demo note for Robin, get sign-off before the next milestone.

Claude may implement directly only for: config, docs, specs, review fixes under ~20 lines, and asset pipeline scripts. Everything else goes through Codex — but never merge Codex output unreviewed.

## 6. Codex protocol

### 6.1 Setup (primary: CLI in the session sandbox)

- Install per session if missing: `npm install -g @openai/codex`.
- Auth: prefer `codex login` with Robin's OpenAI account (device/headless flow if available) or an API key provided by Robin via a gitignored `.env.local`. Never commit credentials; never put keys in game code.
- Give Codex the repo as its working directory. Codex reads `AGENTS.md` — maintain a short `AGENTS.md` at repo root that points to this file, the brief, and the active spec.
- Install the three.js skills for Codex once on Robin's machine: `npx skills add majidmanzarpour/threejs-game-skills --skill '*' -a codex -g -y` (and in the sandbox if Codex runs there).

### 6.2 Delegation format

Run non-interactively (`codex exec "<task>"` or the pattern in the `codex` SKILL.md). Each task contains: goal, spec path, files in scope, acceptance criteria, constraints (brief §9 items that apply), and "do not touch" list. One slice per task. Ask Codex to use `threejs-gameplay-systems` / `threejs-aaa-graphics-builder` etc. as relevant.

### 6.3 Fallback: file relay via Robin's machine

If sandbox Codex auth is not possible: write the same task content to `tasks/NNN-<slug>.md`, tell Robin, and he runs on his Mac: `codex exec "Do the task in tasks/NNN-<slug>.md" `. The project folder is shared, so results appear for review. Keep tasks small enough that one relay round-trip is meaningful.

### 6.4 Rate-limit awareness (code)

Codex usage on a subscription is also rate-limited. Batch review findings into one correction task instead of many micro-tasks; keep prompts tight; prefer one slice = one Codex run.

## 7. Image asset pipeline (GPT Image 2.0, rate-limited — plan ahead)

**Placeholder-first is the law.** Gameplay is never blocked on art: every visual ships first as procedural/primitive placeholder (colored meshes, generated textures) with a named slot in a layer contract. Real art replaces placeholders in planned batches.

1. **Slots before prompts** — when a feature needs art, add slots to `assets/layer-contracts/*.json` (filename → slot, size, usage), mirroring the Agent Town pattern (brief §10).
2. **Batch prompts** — write `assets/requests/batch-NNN.md` in the exact style of Portal's `docs/design/frontier-ledger-gpt-image-prompts-2026-06-10.md`: one copy-paste prompt per asset, target filename above each, the Frontier Ledger style-anchor sentence in every prompt, flat `#8a8a8a` background for cutouts, no text/letters/watermarks, 2–3 candidates per prompt.
3. **Budget** — `assets/LEDGER.md` tracks: slots pending → prompts written → generated → processed → integrated, plus a per-week generation budget agreed with Robin. Order batches by gameplay impact (hero/enemies/terrain before decoration). Never send Robin more than one batch at a time.
4. **Generate** — Robin pastes prompts into ChatGPT (GPT Image 2.0) and saves downloads into `assets/raw/` with the exact filenames. (Optional: a Claude-in-Chrome session can drive chatgpt.com for him; or switch to the OpenAI Images API later if he provides an API key.)
5. **Integrate** — alpha-extract `#8a8a8a` backgrounds via repo script into `assets/processed/`, wire by filename → slot, screenshot, and visually review in-game before marking the slot done.

The same discipline applies to the in-game **AI crafting** feature itself: generator proposes, typed contract + physics validation disposes (brief §10).

## 8. Skills

Robin vendors both repos (done once): `git clone` into `vendor/skills/dzhng-skills` and `vendor/skills/threejs-game-skills`. Claude uses them by reading the `SKILL.md` files as playbooks; Codex gets them via the `npx skills add` installs (`-a codex`).

From **dzhng/skills** (process): `feature-slicing`, `implement-spec`, `close-spec`, `refactor-clean`, `codex`, `compare-screenshots`, `screenshot-critique`, `write-docs`. (`renderer` if we go WebGPU/TSL; `preview-shots` is macOS-only — skip in sandbox.)

From **threejs-game-skills** (domain): `threejs-game-director` (consult for orchestration checklists, but the §5 loop above wins on process), `threejs-gameplay-systems` (includes a Vite+TS scaffold — use it at M0), `threejs-aaa-graphics-builder`, `threejs-game-ui-designer`, `threejs-debug-profiler`, `threejs-qa-release`. The generator skills are optional: `threejs-image-generator` uses **Gemini** — our image pipeline is GPT Image 2.0 (§7), so skip unless Robin adds a Gemini key; `threejs-3d-generator` (Tripo) and `threejs-audio-generator` (ElevenLabs) only if Robin provides keys and wants generated 3D/audio.

Conflict rule: brief > these instructions > skills. Skills are advisors, not authorities, on anything canon- or process-specific.

## 9. Quality gates

A slice is **done** only with evidence: build passes; zero console errors; Playwright screenshot(s) attached to the review; playable checkpoint demonstrated (the main loop can be played through the change); 60 fps target on a mid-range machine (note regressions); art matches brief §4 (or is an explicit placeholder); naming matches brief §9.4; no secrets client-side; `STATUS.md` and the spec updated.

A milestone is **done** only when Robin has played it and signed off.

## 10. Milestones and scope guardrails

Vertical slice first — resist building breadth before M1 is fun.

- **M0 Skeleton**: Vite+TS+three.js scaffold, river-claim terrain (placeholder), hero movement, camera, HUD shell, deploy preview.
- **M1 Core loop (the game is fun here or nowhere)**: auto-shooting hero, one enemy wave type, gold panning/mining node, one buildable defense, death/restart, level-up with 3 upgrade choices.
- **M2 Base + waves**: building system (sluice, stockpile, walls, turret), wave scheduler/escalation, gold stealing, base damage/repair.
- **M3 Roguelite meta**: run structure, meta-progression across the dimensions (territory, science, hero, agent), persistence.
- **M4 The agent**: the player's AI agent as co-op partner — typed tool surface, permission ladder, approvals/receipts (port the Founders Plot Foreman pattern, brief §6–7).
- **M5 AI crafting**: generative crafting with physics/stat validation gates.
- **M6 Town + recruited agents**: recruit agents, tasks learned from player demonstrations (recorded playbooks executed through typed tools).
- **M7+ Epochs**: ocean, then space. **Design hooks only until M6 ships.** Do not build boats or starships early; keep the world model epoch-extensible instead.

Canon guardrails (always): brief §9.2 genre-signal rules (frontier-tech weapons, illustrated not gory, prosperity framing), §9.3 enemy factions (no Native American enemies), §9.4 naming. When a design decision bends canon, write a one-paragraph ADR in `docs/decisions/` and get Robin's call.

## 11. Working with Robin

Robin is rate-limited too. Batch questions; present decisions as options with a recommendation; only block on true product-owner calls (canon bends, art batches, milestone sign-off, spending limits). Offer a scheduled task (e.g. daily build-loop session) once the loop runs smoothly — the loop continues across sessions via `STATUS.md`.

---

## Appendix A — One-time setup (Robin, on your Mac)

1. Create the project folder (e.g. `~/Projects/GoldRush`), select it in a new Cowork project, and put this file at its root (as `CLAUDE.md` or in project instructions).
2. Copy `GOLD_RUSH_BRIEF.md` from the Portal repo into `docs/`.
3. Clone the skill repos: `git clone https://github.com/dzhng/skills vendor/skills/dzhng-skills` and `git clone https://github.com/majidmanzarpour/threejs-game-skills vendor/skills/threejs-game-skills`.
4. Install skills for Codex: `npx skills add majidmanzarpour/threejs-game-skills --skill '*' -a codex -g -y` and `npx skills add dzhng/skills -a codex -g -y`.
5. Ensure `codex` runs and is logged in (`codex --version`); optionally place an API key in `.env.local` (gitignored) so the sandbox can run Codex too.
6. `git init` the repo if not already.

## Appendix B — Kickoff prompt (first message in the new project)

```
Read CLAUDE.md and docs/GOLD_RUSH_BRIEF.md fully. You are the orchestrator for
building Gold Rush end to end, per those instructions.

Session goal: get the factory running and reach Milestone M0.

1. Run the session startup checklist. Create STATUS.md, AGENTS.md, and the
   folder skeleton from CLAUDE.md §4. Verify the toolchain and Codex (§6);
   tell me which Codex mode works (sandbox CLI or file relay).
2. Read the SKILL.md files for feature-slicing, implement-spec, codex, and
   threejs-gameplay-systems from vendor/skills/.
3. Use feature-slicing to write specs for M0 and M1 (specs/m0-skeleton/,
   specs/m1-core-loop/) — interview me on open design questions first,
   in one batched round.
4. Draft assets/LEDGER.md and the first GPT Image batch
   (assets/requests/batch-001.md) for M1's placeholder-replacement slots,
   following CLAUDE.md §7 — but placeholders first; don't wait on art.
5. Start the implement-spec loop on M0 with Codex as implementer and you as
   reviewer. Show me the first playable checkpoint when it exists.

Constraints: follow the brief's canon guardrails (§9); evidence-based
verification per CLAUDE.md §9; update STATUS.md before you finish.
```
