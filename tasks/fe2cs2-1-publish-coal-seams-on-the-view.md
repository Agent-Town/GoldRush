# Task fe2cs2-1: publish the coal seams onto the agent view, so a rider can LOCATE the fuel it is scored on (LANE-C, commit prefix "feat:")

**FIRE-AUTHORED (attended review welcome)** — s2142, 2026-08-21.

🏷️ **NAMING, AND IT IS DELIBERATE — DO NOT DERIVE AN F-ID OF THE FORM `F-2142-n` FROM THIS TASK.** The house convention mints a finding id from the task name, and the s2142 fire had **already spent `F-2142-1` and `F-2142-2`** on unrelated findings before authoring this (the campaign-harness terrain binding, and its multi-leg design fork) — which is exactly the collision F-2141-3 recorded, *"two unrelated findings, one id, neither author able to see the other."* This task is therefore named for the finding it cures, **F-E2CS-2**, filed in `reviews/e2-coal-seams-and-legibility.md`. **File anything you discover as `F-E2CS2-1`, `F-E2CS2-2`, … and never as `F-2142-anything`.**

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-c`.

READ FIRST: `AGENTS.md`; **`reviews/e2-coal-seams-and-legibility.md`** — the review that filed this finding TODAY; read its **F-E2CS-2** entry and its PART 1 (the `coalSeams` vocabulary), because the shape you publish must match the vocabulary that merged at `dfb58606a`; `src/agent/View.ts` (your whole subject: the `stablePrefix.map` type at `:33`–`:38` and its builder at `:238`–`:247`); `src/systems/PressureSystem.ts:42` (`DEFAULT_COAL_SEAMS`) and `:83`–`:84` (the fallback rule you must mirror exactly); `tasks/BACKLOG.md` — the F-E2CS-2 row.

**SEQUENCING LAW / STALENESS CHECK — verify the premise before building. Run:**

```
grep -Fc "      water: { river: boolean; ford: boolean; sources: number; descriptor: string | null };" src/agent/View.ts
```

It **must return 1** (verified on main by the authoring fire at dispatch time). That line is the sibling field your new one sits beside in the `stablePrefix.map` type. **If it returns 0, your lane is stale or the type has moved — STOP and report "stablePrefix.map water field not found"; do NOT improvise a different insertion point.**

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/c main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. **EVIDENCE-ARTIFACT EXCEPTION (F-1266-1): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, any `.png` — are NEVER "work" and NEVER a STOP; discard them and PROCEED, listing what you discarded.** Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything. Then `git -C worktrees/lane-c status --short` → must be clean, with the FACTORY-CHURN EXCEPTION, always expected and never a STOP (F-1407-1): (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*` and any `.png`. What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.

ⓘ **At authoring time `lane/c` was `ahead=0 behind=28`, tracked-dirt 0, untracked 0 — USABLE** (`node scripts/lane-usable.mjs lane-c`).

⚠️ **THE LANE WAS NOT PRE-REFRESHED.** The authoring fire's shell is denied git operations inside lane worktrees. **The F-1424-3 ordering hazard is avoided the other way:** this master and its cited evidence were committed to `main` **BEFORE** the `cp` that dispatched it, so the `git checkout -B lane/c main` in your own pre-flight is what brings the citation into the lane. **Run the staleness grep AFTER your pre-flight reset.** A 0 after a successful reset to main is a real finding and a STOP, not a stale lane.

## Why (F-E2CS-2, filed 2026-08-21 in `reviews/e2-coal-seams-and-legibility.md`, verified at source by s2142)

The coal ruling shipped today (`dfb58606a`): contracts may author their own `coalSeams`, and three
briefing cards now tell a human player that coal exists and roughly where. **An agent was given
neither half.** The review's own finding says it plainly:

> **F-E2CS-2 — an agent cannot LOCATE the coal through the public grammar.** The seam positions reach
> the prover only through `sim.pressure.diagnostics`; the VIEW carries no coal. This is exactly the
> F-E3CF-5 shape that was just cured for gold seams (`now.seams` gained `x`/`z`/`anchorIndex`).
> **Fire-authorable**, and cheap: publish the seams on the stable prefix beside `map.seams`.

**Verified at source by s2142, not inherited:** `grep -c "coal" src/agent/View.ts` returns **0**, and
so does `grep -n "pressure" src/agent/View.ts`. The view publishes gold seams twice — as authored
anchors on `stablePrefix.map.seams` (`:243`–`:247`) and as live state on `now.seams` (`:321`–`:333`,
which gained `x`/`z`/`anchorIndex` in the F-E3CF-5 cure, merged `b253af85c`) — and publishes coal
nowhere.

⭐ **Why this is the stable prefix and NOT `now`, stated so you do not "improve" on it.** A coal seam
is a **place**, authored on the contract, and it does not move; the review's PART 1 makes exactly this
point about the vocabulary — *"the shape is deliberately `harvestAnchors`' own `{x, z}`: a seam is a
place, not a machine."* `stablePrefix` is where places live, and it is cached per run
(`View.ts:169`, `:204`), so publishing there costs nothing per turn. **Do not add a per-turn `now`
row**; whether a seam has been spent is a different question and is NOT in this slice.

## Scope (numbered, each testable)

0. **Re-derive the premise before you build** (quote all three in your report):
   - the staleness grep above → must be **1**.
   - `grep -c "coal" src/agent/View.ts` → must be **0** before your edit. **If it is already ≥1, the work is done — STOP and report that.**
   - `grep -n "export const DEFAULT_COAL_SEAMS" src/systems/PressureSystem.ts` → confirm the constant exists and note its line.

1. **Type the field beside its sibling.** Add `coalSeams: readonly { id: string; x: number; z: number }[]` to `AgentView['stablePrefix']['map']` (`:33`), in the same shape as `seams` at `:35`. Same shape, deliberately — a rider that can read one should not have to learn a second grammar for the other.

2. **Build it under the DECLARED rule.** Publish the anchors in `buildStablePrefix` beside `:243`, resolving them **exactly as `PressureSystem` does** — `twist.coalSeams` when it is present and non-empty, otherwise `DEFAULT_COAL_SEAMS` (mirror `PressureSystem.ts:83`; do not re-implement the rule differently, and do not import the system itself if the constant alone will do). Id them `coal-seam-1`, `coal-seam-2`, … matching the `gold-seam-${index + 1}` convention at `:244`.
   ⚠️ **On a contract that does NOT declare `pressureEnabled`, publish an EMPTY array, not the default anchors.** The contract schema already refuses coal on a contract with no pressure (review PART 1: *"coal on a contract that declares no `pressureEnabled`, since nothing could ever burn it"*), so publishing three fallback coordinates there would tell a rider there is fuel on a claim that can never burn any — a published lie, which is the whole class F-E2CS-2 belongs to.

3. **Pin it with a test, all three directions.** Assert: (a) `e2-hill-mine` (authors none) publishes the three `DEFAULT_COAL_SEAMS` coordinates; (b) a contract that authors its own — `e2-trestle`, whose review-recorded seams are `(-16,-20) (-20,-16) (-12,-24)` — publishes **those** and not the defaults; (c) a contract with no `pressureEnabled` publishes an **empty array**. **(b) and (c) are the load-bearing ones** — a test with only (a) passes just as happily if you hardcoded the constant and ignored `twist.coalSeams` entirely, and again if you published the defaults everywhere. Prefer a new focused `scripts/coal-seams-on-the-view.test.mjs` **rooted into `test:node-guards` in `package.json`** (`gate-caller-audit` will red if you add the script and forget to root it — F-2141-4's lesson).

4. **🚨 THE HASH CONTROL — LOAD-BEARING, AND IT OUTRANKS THE FEATURE.** Adding a field to the agent view risks moving run hashes, and **every bench floor, pin and admission exemption in the repo is keyed to them**. This is the same control `f2138-1` ran when it published `canyonConnect`, and it came back clean there — **which is a reason to expect a clean result, not a reason to skip the measurement.** Capture the run hash for one contract that declares pressure (`e2-hill-mine`, whose shipped pin is `fnv1a32:c40556c0`) and one that does not, **before and after** your change. All four must be byte-identical.
   - **Unchanged → PROCEED**, paste all four.
   - **Any hash MOVED → STOP AND REPORT.** Do not re-pin, do not update a fixture, do not "accept" the new number (F-1441-3). **A stop here is a success.**

5. **Say what you did NOT publish.** In your report, state in one line that seam *depletion* (whether the coal has been cut) is deliberately not in this slice, so the next reader does not mistake the omission for an oversight.

## Firewall

**TOUCH-ONLY:** `src/agent/View.ts` · a new `scripts/coal-seams-on-the-view.test.mjs` · `package.json` (only to root that one script into `test:node-guards`).

**NO:**
- `src/systems/PressureSystem.ts` — **read it, mirror its fallback rule, change nothing in it.** It is one day old and its own review is the citation for this slice.
- `src/meta/ContractFamilies.ts`, `assets/contracts/**` — the `coalSeams` vocabulary shipped yesterday and is correct; this slice publishes what exists and authors no new seams for any map.
- `src/game/Game.ts` — the browser's coal legibility is **F-E2CS-1** and is an OWNER call (brighten the lump, or an always-on ember tell). **Do not touch materials, the survey ring, or the `coal_survey` research node.** If you believe the view fix needs a render change, STOP and report.
- Any re-pin of any hash, floor or fixture, anywhere.
- `tasks/**`, `STATUS.md`, `reviews/**`, `CLAUDE.md` — the drain writes those. If a citation in a law file rotted because of your diff, **report the shift with old and new line numbers; do not edit the law file.**

## Self-check before you report

- `npx tsc --noEmit` rc=0 · `npm run build` rc=0.
- `node --test scripts/coal-seams-on-the-view.test.mjs` — all three directions (scope 3).
- `node scripts/gate-caller-audit.test.mjs` — green, proving the new script is rooted.
- All four hashes from scope 4, pasted.
- All three scope-0 greps quoted.
- ⚠️ **Your diff touches `src/**`, so the DRAIN owes the full `test:node-guards` battery (~405 s, run ALONE — CLAUDE.md §3).** You are not required to run it, but say in your report that it is owed.

**READY-FOR-GATES.** Report: the three scope-0 greps · the exact diff · all three test directions with their measured coordinates · the four hashes from scope 4 · your scope-5 line · and any law-file coordinate your diff rotted (named, not edited).
