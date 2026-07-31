CODEX: model=gpt-5.6-sol effort=xhigh
# Task lane-d-f1281-2-turret-placement-diagnosis: name the root cause of the e2-arsenal turret placement red (lane-d, commit prefix "fix:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-d`.
**FIRE-AUTHORED s1284 (attended review welcome).** One task, firewalled.
⚠️ **THIS IS A DIAGNOSIS, NOT A FIX.** You will produce a named root cause with evidence. You will NOT change product behaviour and you will NOT edit the failing assertion. Read the STOP rule in Scope 3 before you start — it is the point of the task.

READ FIRST: `AGENTS.md` · `tasks/BACKLOG.md` F-1281-2 (the finding you are discharging — read the whole row, it already contains a `--workers=1` control arm) · `e2e/e2-arsenal.spec.ts:87-105` ("Auto-Pan upkeep and boiler battery bands consume the fixed-step pressure store") — the failing test, THE SUBJECT · `src/systems/BuildSystem.ts:960-982` (`placeFree`, the function returning `false`) · `src/game/Game.ts:5249-5256` (`isBuildableEnabled`) · `logs/session-scratch/s1281/control-arm-clean-main.txt` (the existing proof it is pre-existing).

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/perf main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. **EVIDENCE-ARTIFACT EXCEPTION (F-1266-1): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, and any `.png` — are NEVER "work" and NEVER a STOP. Discard them and PROCEED, listing what you discarded.** Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.
⚠️ **Verify with the instrument, not by eyeball:** `node scripts/lane-freeze-classify.mjs lane/perf` and, for any BOTH-MOVED path, `node scripts/lane-absorbed-lines.mjs lane/perf <path>`. BOTH-MOVED is a triage bucket, not a loss verdict.

## Why (F-1281-2, s1281 — a declared open red with a clean reproduction and no diagnosis)

The test *"Auto-Pan upkeep and boiler battery bands consume the fixed-step pressure store"* (`e2e/e2-arsenal.spec.ts:87`) fails on **both** projects at **line 100**, where `window.__GR_TEST__?.placeFree('turret', 0, 10)` resolves **`false`** and the assertion requires `true`.

s1281 proved it is **pre-existing, not a regression from the rung work**: a control arm on clean main (`62dc6380`) in a detached worktree, same shell, same hour, `--workers=1`, reproduced the identical failure at the identical line on both projects. It also established the red is **not** the `auto_pan` assertion at `:98` — that one passes, and this spec's `auto_pan` is the *upgrade* id (`src/game/Upgrades.ts:100`), an unrelated namespace from the consent ability. The spec itself is **unchanged since `90e7cc68` (2026-07-12)**, so something on the product side moved under it.

**F-1281-2's stated gate is the whole job:** *"reproduce at `--workers=1`, then decide whether the coordinate went stale or placement regressed — do not 'fix' it by moving the coordinate until that question is answered."*

## Measured premise (s1284 — RE-DERIVE IT, do not inherit it)

`placeFree` (`src/systems/BuildSystem.ts:960-982`) returns `false` through exactly five doors. s1284 read them at source and **eliminated two of them by reading; the other three are yours to discriminate.**

⛔ **ELIMINATED — do not spend a minute re-walking these:**
1. **There is no build-range check in `placeFree` at all.** F-1281-2 offered *"a build-range check against the moved player"* as a hypothesis; the function never consults `heroPosition`. The test's `teleport()` at `:93-94` cannot be the cause. **This hypothesis is dead — it is recorded here so you do not chase it.**
2. **`isBuildableEnabled('turret')` cannot return `false`.** `Game.ts:5250` disables `turret` only under `this.activeContract.twist.powerGrid`, and **`powerGrid` is never assigned anywhere in `src/` or `e2e/`** (it exists solely as an optional type field, `src/meta/ContractFamilies.ts:607`). So that branch is unreachable and the function falls through to `return true`. ⚠️ **Re-derive this yourself with a fresh `grep -rn "powerGrid:" src/ e2e/` before relying on it** — if that grep is now non-empty, the premise moved and this elimination is void.

🎯 **THE THREE LIVE CANDIDATES**, in `placeFree`'s own evaluation order:
- **(a) capacity** — `this.countFor('turret') >= this.maxCountFor(def)`: the contract fixture may already place turrets, exhausting `maxCount`.
- **(b) placement rules** — `!this.matchesPlacement(def, target)` after `this.snap(target)`: a terrain/footprint rule rejecting world `(0, 10)`. Note the contract is `e2-hill-mine` — set by the `QUERY` constant near the top of `e2e/e2-arsenal.spec.ts` (`contract=e2-hill-mine`) — whose **terrain has been actively reshaped** — the Hill Mine relief slice gave it `render.terrainMesh:'required'` and real terraces. A tile that was placeable in July may not be now.
- **(c) occupancy** — `this.overlapsExisting('turret', target)`: something already sits at the snapped target.

**These are hypotheses, not findings.** Discriminate them by measurement, not by argument.

## Scope

0. **ABORT CHECK, FIRST — the premise must be present before you diagnose it.** Reproduce the red on your lane at `--workers=1`: `npx playwright test e2e/e2-arsenal.spec.ts --workers=1 -g "Auto-Pan upkeep and boiler battery bands consume the fixed-step pressure store"`. **If it PASSES on both projects, the premise has moved: STOP, change nothing, and report that F-1281-2 is stale with your run output as the evidence.** A green here is a legitimate and valuable outcome — do not go hunting for something to fix.

1. **Instrument the five doors and name the one that closes.** Do this **without changing product behaviour**: from the page context, call the same inputs `placeFree` sees and read back the discriminating values — `countFor('turret')`, `maxCountFor(def)`, the snapped target after `snap()`, `matchesPlacement(def, target)`, `overlapsExisting('turret', target)`. A temporary scratch harness under `logs/session-scratch/s1284-lane-d/` is fine and expected; **the repo's `src/` must be byte-identical when you finish.** Report each of the five values.

2. **Then answer F-1281-2's actual question with evidence:** *did the coordinate go stale, or did placement regress?* Distinguish them concretely — e.g. if (b), is `(0, 10)` now inside a terrace wall / outside the buildable region, and **when** did that become true? Use `git log`/`git blame` on the placement rule or the terrain descriptor to date it, and name the commit if you can. "It fails because `matchesPlacement` is false" is **not** an answer; *why* `matchesPlacement` is false, and since when, is the answer.

3. 🛑 **HARD STOP — DO NOT FIX, AND DO NOT TOUCH THE ASSERTION.** Whichever door it is, you **stop at the diagnosis**. Do not move the `(0, 10)` coordinate, do not relax a placement rule, do not add a fixture to unblock it, do not mark the test skipped. If the answer is "placement regressed", that is a **product bug affecting real players** and it needs its own scoped slice with owner-visible framing; if the answer is "the coordinate went stale", the repair is a test edit that must be judged against whether the *new* terrain is intended. **Both outcomes are somebody else's decision, and pre-empting it is exactly the invented scope §2E forbids.** End your report with a one-paragraph recommendation and the evidence for it.

TOUCH-ONLY: `logs/session-scratch/s1284-lane-d/**` (your scratch harness and captured output) · `reviews/f1281-2-turret-placement-diagnosis.md` (your written diagnosis) · `artifacts/f1281-2/**` (any captured screenshots or JSON).
NO: **`src/**` — any file, any line** (this task changes zero product bytes; if you believe a source edit is required, that belief IS the finding, report it) · **`e2e/e2-arsenal.spec.ts`** and every other `e2e/**` file — especially the failing assertion at `:100` · `playwright.config.ts` and `playwright.preview.config.ts` (the `--workers=1` requirement is §3.1 law, not a knob) · `package.json` · the rung/agent work in flight on lane-c (`src/game/Game.ts`, `src/agent/**`) · Economy · CombatSystem · Balance.

## Self-check before READY-FOR-GATES
- `npx tsc --noEmit` clean and `npm run build` green (you changed no source, so both must be **exactly** as they were — a change here means you broke the firewall).
- `git status` shows changes ONLY under `logs/session-scratch/s1284-lane-d/`, `reviews/`, `artifacts/` — **`git diff main -- src/ e2e/` must be EMPTY.** Paste that empty diff into your report as the firewall proof.
- The reproduction from Scope 0 ran at **`--workers=1`** (§3.1: a red seen at default workers is not evidence until it reproduces at `--workers=1`), both projects, with the run output captured to your scratch dir.
- Your review file cites the failing test **by title**, never by bare `spec:line` (the `citation-title-guard` will red the drain otherwise).

READY-FOR-GATES + report: the five door-values from Scope 1 with the failing one marked · the dated answer to "stale coordinate vs regressed placement" with the commit that moved it if you found one · the empty `git diff main -- src/ e2e/` proving zero product bytes changed · your one-paragraph recommendation · **or an explicit STOP** if Scope 0 came back green, or if you could not discriminate the doors — an honest "I narrowed it to (b) but could not date it" is a better deliverable than a guess dressed as a cause.
