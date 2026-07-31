# Task lane-c-agent-rung-conformance: land the owner's 2026-07-30 verb-rung ruling in the two tables and the ratified ladder line (lane-c, branch `lane/e2-arsenal`, commit prefix `fix:`)
FIRE-AUTHORED s1280 (attended review welcome).
You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-c` (branch `lane/e2-arsenal`, commit prefix `fix:`).
CODEX: model=gpt-5.6-sol effort=medium

> 🎯 **This is a CONFORMANCE task, not a feature.** The owner ruled a rung on 2026-07-30; the code
> still declares the old one. You are moving **one number in two files** and amending **one line**
> of a ratified spec so it stops contradicting the ruling.
>
> ⚠️ **THE CHANGE IS INERT ON MAIN TODAY, AND THAT IS EXPECTED — DO NOT "FIX" THE INERTNESS.**
> `auto_pan` only enters the panel's capability list when `game.panAt` exists on the agent adapter,
> and **main's adapter does not wire it** (`src/game/Game.ts:2062-2064` wires exactly `repair`,
> `collectXp`, `collectGold`). `panAt` arrives with `save/ap-06b-adapter-wiring`, which is a
> *separate, owner-authorized merge*. So expect **no player-visible diff and no screenshot change**.
> A green run here means "the tables now agree with the ruling", nothing more. Wiring `panAt`
> yourself would be inventing the very scope the owner sequenced behind this task.

## READ FIRST (paths, in this order)
1. `tasks/BACKLOG.md` → the row `OWNER RULINGS 2026-07-30 (blocker sweep, both via decision panel)`.
   **Find it by that anchor text, not by line number** — rows land above it and the number drifts.
   This is the entire authority for the change.
2. `src/agent/AgentConsent.ts` lines 11-16 (`AGENT_ABILITIES`) and 61-97 (`allows`, `ability`).
   This is the **load-bearing** table: `def.level` is compared against the ceiling here.
3. `src/agent/ToolSurface.ts` lines 351-384 (`implementedCapabilities`). The **second** declaration
   of the same fact — it feeds `snapshot.agent.capabilities`, which the panel renders.
4. `src/ui/ProspectorPanel.ts` lines 132-168. Shows why there are two tables and what each drives.
5. `specs/m4-agent-ux/README.md` line 14 — the ratified four-rung ladder line you will amend.

## Why this exists (evidence, quoted and dated)

On **2026-07-30** the owner ruled, via the decision panel (`tasks/BACKLOG.md`, the
`OWNER RULINGS 2026-07-30` row, verbatim):

> AGENT VERB RUNGS — auto_pan/HARVEST = LEVEL 2 ("harvesting is the hero's basic verb"),
> place_building/BUILD = LEVEL 3 ("building spends gold"); panel rows BLESSED at their tiers.
> F-1219-1 RULED. RE-QUEUE AUTHORIZATION: merge save/ap-06b-adapter-wiring (2f216af0) with the
> derived-list levels adjusted per this ruling (ToolSurface: auto_pan pushed at level 2,
> place_building at 3)

The ruling was **recorded in prose and never propagated to code** — s1279 found the three items it
freed still mechanically refused 21 hours later (F-1279-1). s1279 propagated the *bookkeeping*
(`tasks/goals.json` leaves moved `blocked → planned` / `stopped → diagnosed`). **This task
propagates the ruling into the code**, which is the half nothing has yet done.

⚠️ **Two corrections to the plan you may have seen in the s1279 handoff — both measured at source
this fire, both change what you must edit:**

1. **There are TWO declarations of `auto_pan`'s rung, not one.** The handoff named only
   `src/agent/ToolSurface.ts:378`. But `src/agent/AgentConsent.ts:15` declares it too, and *that*
   is the one the consent gate actually reads (`AgentConsent.allows()` line 63:
   `if (!def || def.level > ceiling) return false`). Editing only ToolSurface would leave the
   enforcing table at the old rung — the exact "cured in one file, alive in the sibling" shape.
2. **`place_building` cannot be declared yet, so this task does not declare it.** There is no
   `place_building` member in the `AgentAbility` union (`AgentConsent.ts:3`) and no
   `place_building` branch in `implementedCapabilities`; adding one would require extending a type
   consumed by `LockstepClient.ts`, `RunSuspend.ts` and `Game.ts` **for an adapter method that does
   not exist on main**. The owner tied `place_building at 3` to the *branch merge* — it belongs to
   that task, and this master's scope note says so explicitly so the next author does not re-litigate it.

## Scope (numbered; each item is testable)

0. ⛔ **PREMISE GUARD — run FIRST, ABORT on mismatch.** This lane is routinely a few commits behind
   main on files unrelated to the subject (`lane/e2-arsenal` was **31 behind** at authoring), so
   **judge by the subject's blob, never by ancestry**. Run and record:
   - `git rev-parse HEAD:src/agent/AgentConsent.ts` → must equal **`a142dcb9dc8f48679ede52c9044bf0657a10f12f`**
   - `git rev-parse HEAD:src/agent/ToolSurface.ts` → must equal **`eb584bfab296bea048106456430c2f6d5b127e8b`**
   - `git rev-parse HEAD:specs/m4-agent-ux/README.md` → must equal **`51fcc75fa164ec7bdf3e6e1bb82cd1eb2f655f49`**
   - `grep -c "panAt" src/game/Game.ts` → must be **0** (the inertness premise above)

   **If any hash differs: STOP. Change nothing. Report `PREMISE MOVED — <which file>, <expected>,
   <actual>` and stop.** A differing blob means someone edited the subject after this master was
   written, and the line numbers below are then untrustworthy. If `panAt` count is **non-zero**,
   the adapter branch has already merged — **also STOP** and report `ADAPTER ALREADY LANDED`, because
   the change is then no longer inert and needs a self-check this master did not pre-register.

1. **`src/agent/AgentConsent.ts` — the enforcing table.** In `AGENT_ABILITIES`, change the
   `auto_pan` entry's `level` from `3` to `2`. Change nothing else on that line — the `id` and the
   `label` (`'Let the Prospector work claim pans'`) stay exactly as they are.

2. **`src/agent/ToolSurface.ts` — the derived capability list.** In `implementedCapabilities`, in
   the `if (typeof game.panAt === 'function')` block, change `level: 3` to `level: 2`. Again: the
   `id`, `label` and `tools` array are untouched.

3. **`specs/m4-agent-ux/README.md` line 14 — the ratified ladder line.** It currently reads:

   > L0 suggest-only (watches, comments) · L1 collect & carry (XP motes, dropped gold) · L2 tend & repair (walls, buildings) · L3 work the claim (pan, haul to stockpile)

   Amend **only the L2 and L3 clauses** so the ladder states the ruling:

   > L0 suggest-only (watches, comments) · L1 collect & carry (XP motes, dropped gold) · L2 tend, repair & work the claim (walls, buildings, pan, haul to stockpile) · L3 build (place buildings — spends gold)

   Add, immediately under the ladder line, one dated provenance sentence in the spec's own voice:
   `Rungs for pan and build set by owner ruling 2026-07-30 ("harvesting is the hero's basic verb"; "building spends gold").`
   ⚠️ **Do NOT touch the L1 clause and do NOT restate repair's rung anywhere else** — see scope 5.

4. **Guard the class, because two tables declaring one fact is how this drifts back.** Add
   `scripts/agent-rung-conformance.test.mjs` (a `node --test` file, matching the style of its
   neighbours in `test:node-guards`) that reds if the two declarations disagree with the ruling:
   - asserts `AGENT_ABILITIES` has `auto_pan` at level **2** and `auto_repair` at level **1**
     (the latter pinned **as-shipped**, not as-preferred — see scope 5);
   - asserts the `auto_pan` capability literal in `ToolSurface.ts` declares level **2**, so the two
     tables cannot diverge silently again;
   - **prove it can red before you trust it**: temporarily flip one value back to `3`, show the
     guard exits non-zero, restore, show it exits 0. Put both transcripts in your report.
     *A green you did not try to make red is a rumour.*
   Wire it into `test:node-guards` **the way its neighbours are wired** — read `package.json` and
   follow the existing chain; do not invent a new script name or a new runner.

5. ⛔ **Do NOT touch `auto_repair`.** Code declares it level **1**; the ratified ladder groups
   "tend & repair" at **L2**. That divergence is **F-1279-2, an OPEN question on the owner's desk**
   ("is `auto_repair` L1 or L2?"). The 07-30 ruling reasoned about *harvesting* and said nothing
   about repair. Changing it would be inventing scope against a live owner question.

6. ⛔ **Do NOT touch the behaviour assertions.** Tests that set the agent level and then exercise
   panning (`e2e/066-walk8-engine.spec.ts`, `e2e/m4-05-agent-closeout.spec.ts`,
   `e2e/m4-06-embodiment.spec.ts`, `e2e/m4-01-tool-surface.spec.ts`) encode *what the agent does*,
   which this ruling **ratifies** rather than contradicts. They are expected to stay green untouched.
   The two `auto_pan` panel assertions (`m4-09:107`, `m4-10:110`) are `toHaveCount(0)` at rung 0 and
   hold at either level. **If any of these goes red, that is a finding to REPORT, not an assertion
   to edit** — report it and stop rather than "fixing" the test.

## Firewall

**TOUCH-ONLY:** `src/agent/AgentConsent.ts` (one `level` value) · `src/agent/ToolSurface.ts` (one
`level` value) · `specs/m4-agent-ux/README.md` (the ladder line + one provenance sentence) ·
`scripts/agent-rung-conformance.test.mjs` (new) · `package.json` (**only** the one-line wiring of
the new guard into the existing `test:node-guards` chain).

**NO:** `src/game/Game.ts` (do not wire `panAt`/`placeBuilding` — that is the branch's job) ·
`src/agent/PermissionLadder.ts` · `src/ui/ProspectorPanel.ts` · `src/agent/StandingOrders.ts` ·
any `e2e/**` file · `auto_repair`'s level anywhere · `tasks/**` · `reviews/**` · `STATUS.md` ·
`playwright.config.ts` · any other lane's files.

## Self-check (run these; paste real numbers, not adjectives)

- `npx tsc --noEmit` → rc=0.
- `npm run build` → rc=0.
- `npm run test:node-guards` → rc=0. **Derive the baseline count yourself** by running it once
  before your change and once after; report both as `<before> → <after>` and state that the delta
  is exactly the tests you added. Do not inherit a count from any handoff.
- Playwright, **desktop and mobile (390px) projects**, in the lane's own default configuration:
  `e2e/m4-09-agent-rung-clarity.spec.ts`, `e2e/m4-10-agent-actions-integrity.spec.ts`,
  `e2e/m4-07-prospector-panel.spec.ts`, `e2e/m4-01-tool-surface.spec.ts`,
  `e2e/m4-05-agent-closeout.spec.ts`, `e2e/m4-06-embodiment.spec.ts`,
  `e2e/066-walk8-engine.spec.ts`.
  ⚠️ **Pass NO `--workers` flag.** Serialisation is a *fire-shell* correctness requirement
  (`scripts/fire.md` §3.1); the lane shell is ~3.5× faster in parallel and `playwright.config.ts`
  already keys the difference off `CLAUDE_CONFIG_DIR`. Forcing `--workers=1` here would tax the lane
  and measure the wrong instrument.
- Report the reporter's own `Running N tests using M workers` line for each run, plus rc,
  passed/failed, and wall seconds.
- Zero console errors and zero page errors in every run (the suites above already assert this —
  quote the assertions passing).
- **Screenshots:** the suites write to their usual `artifacts/`/`reviews/shots-*` paths. **Expect
  them to be unchanged** — this task is inert on main (see the header). If a screenshot *does*
  change, that is a finding: report it with the path and do not proceed to claim success.
- **State the inertness explicitly in your report**, in one sentence, with the evidence:
  `grep -c panAt src/game/Game.ts` = 0, therefore `auto_pan` is absent from the derived capability
  list and no panel row moved.

## Sequencing note (for whoever drains this)

This is the **prerequisite** the owner's re-queue authorization names. Once this merges,
`save/ap-06b-adapter-wiring` (`2f216af0`) can be merged "with the derived-list levels adjusted per
this ruling" — the levels will already be adjusted. **`place_building` at level 3 is that task's
scope, not this one's** (its adapter method does not exist on main). The two `diagnosed` siblings
(`lane-c-ap-06b-panel-ladder-and-voice.md`, `lane-c-agent-rung-honest-gate.md`) must be
**re-authored against the changed premise**, never re-queued unchanged: `agent-rung-honest-gate`'s
stored reason argues pan-at-L2 was never ratified, and the owner ruled the opposite way.

READY-FOR-GATES — report: the four scope-0 readings; the before/after `test:node-guards` counts;
the guard's red-then-green transcripts from scope 4; the per-run playwright table (workers obtained,
rc, passed/failed, wall seconds) for both projects; confirmation that no `e2e/**` file and no
`auto_repair` level was modified; and the one-sentence inertness statement with its `grep` evidence.
