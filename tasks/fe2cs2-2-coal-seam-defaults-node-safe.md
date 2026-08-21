# Task fe2cs2-2-coal-seam-defaults-node-safe: keep the coal seams on the agent view, but stop dragging Vite into plain node (lane-c, prefix "fix:")

**FIRE-AUTHORED (attended review welcome)** — s2143, 2026-08-21.

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-c`.

READ FIRST: `AGENTS.md`; **`reviews/fe2cs2-1-publish-coal-seams-on-the-view.md`** (the drain that
HELD your predecessor — it contains the measurement, the isolation, and the `package.json`
resolution you are about to need); `src/systems/PressureSystem.ts` (lines 9, 42);
`src/agent/View.ts` (your predecessor's own diff, already on this lane);
`scripts/whole-suite-collection.test.mjs` (the guard that caught this — read it, do not edit it).

## Pre-flight — READ THIS ENTIRE SECTION BEFORE RUNNING ANY GIT COMMAND

⚠️ **THIS LANE IS INTENTIONALLY AHEAD OF MAIN AND ITS AHEAD CONTENT IS YOUR OWN BASE. DO NOT RESET
IT. DO NOT `git checkout -B lane/c main`. DO NOT `git clean -fd`.** The usual SAFE-DUPE template is
WRONG for this task: the lane holds `fe2cs2-1`, which is the work you are repairing, not debris.
Resetting it is Mistake #2 exactly.

```
LANE-SAFETY-OPT-IN: BUILD-ON-PREDECESSOR
EXPECTED-HOLDS: package.json
EXPECTED-HOLDS: scripts/coal-seams-on-the-view.test.mjs
EXPECTED-HOLDS: src/agent/View.ts
```

Those three paths are the complete held set, measured live with `node scripts/lane-usable.mjs
lane-c` by the authoring fire at 2026-08-21T22:44Z (`ahead=1 behind=17 paths=3 tracked-dirt=0
untracked=0`). If the lane holds anything else, **STOP and report it** — an unanticipated held path
is exactly the state the lane-safety guard exists to refuse.

**Step 1 — acquire main without losing the lane.** Run `git merge --no-edit main`.

🚨 **THIS MERGE WILL CONFLICT, ONCE, AND THE AUTHORING FIRE ALREADY RESOLVED IT AND PROVED THE
RESOLUTION. THIS IS NOT THE BOARD MOVING UNDER YOU.** `git merge-tree --write-tree main lane/c`
returns rc 1 with **exactly one** conflicted path: `package.json`. The cause is benign and known —
two slices each prepended one new guard to the `test:node-guards` script:

- main side: `scripts/campaign-harness-terrain.test.mjs` (landed `8656ca1f1…` earlier this fire)
- lane side: `scripts/coal-seams-on-the-view.test.mjs` (your predecessor)

**Resolve by keeping BOTH, in that order, immediately after `scripts/run-node-guards.mjs`.** The
authoring fire verified that after stripping each side's own prepend the two sides are
**byte-identical**, so nothing else is hiding in that hunk — if you find any other difference,
**STOP and report it**. If any path *other* than `package.json` conflicts, **STOP and report it**.

**Step 2 — prove you have your predecessor's work, by content.** Each must return exactly **1**;
zero means this lane is not what this master was written against — **STOP and report the count**:

- `grep -Fc "coalSeams: readonly { id: string; x: number; z: number }[];" src/agent/View.ts`
- `grep -Fc "the agent view publishes declared pressure-contract coal seams only" scripts/coal-seams-on-the-view.test.mjs`
- `grep -Fc "export const DEFAULT_COAL_SEAMS" src/systems/PressureSystem.ts`

## WHY — quoted evidence, not a hunch

`reviews/fe2cs2-1-publish-coal-seams-on-the-view.md` held your predecessor with this measurement:

> merged (main + `lane/c`) → rc 1, `Total: 0 tests in 0 files`, `?raw` TypeError present
> merged, `src/agent/View.ts` reverted to main → **rc 0, `Total: 2958 tests in 425 files`**

The chain: `src/agent/View.ts` now does `import { DEFAULT_COAL_SEAMS } from '../systems/PressureSystem'`
→ `PressureSystem.ts:5` does `import * as Terrain from '../world/Terrain'` → `Terrain.ts` is the
repo's **only** importer of `assets/layer-contracts/m1-core.layer-contract.v1.json?raw`. Under Vite
that suffix is a loader directive; under plain node it throws
`TypeError: Module "…?raw" needs an import attribute of "type: json"` **during playwright's
collection pass**, so the whole e2e suite collects zero files.

**A suite that collects zero tests does not go red — it goes empty**, and every playwright gate
after it would pass by running nothing. That is why this is a blocking finding and not a nit.

## Scope

0. **Re-derive the premise before you build** (quote each in your report):
   - `npx playwright test --list` on the lane **as you find it after Step 1** → expect
     `Total: 0 tests in 0 files` and the `?raw` TypeError. **If it already collects a non-zero
     total, STOP and report that** — the defect you were sent to fix is not present and you must
     not invent a cure for it.
   - `grep -rn "layer-contract.v1.json?raw" src/` → expect exactly one hit, in `src/world/Terrain.ts`.

1. **Give `DEFAULT_COAL_SEAMS` a node-safe home, with ONE definition.** Create a small leaf module
   — `src/systems/coalSeamDefaults.ts` unless you find a better existing home, in which case say so
   in your report — holding the `CoalSeamAnchor` type (`PressureSystem.ts:9`) and the
   `DEFAULT_COAL_SEAMS` array (`:42`), **byte-identical coordinates**, with the existing explanatory
   comment moved across rather than rewritten. It must import **nothing** — no THREE, no Terrain, no
   Balance.
   - `src/systems/PressureSystem.ts` imports both from the leaf and **re-exports them** so every
     existing importer and the `'PressureSystem.DEFAULT_COAL_SEAMS'` seam-source string keep working
     unchanged.
   - `src/agent/View.ts` imports `DEFAULT_COAL_SEAMS` **from the leaf**, not from `PressureSystem`.
   🚫 **Do NOT duplicate the array.** Two lists that must agree is how the coordinates drift.

2. **🚨 DO NOT TOUCH `src/world/Terrain.ts` OR ITS `?raw` IMPORT.** Making Terrain node-safe is a
   far larger question that re-baselines a great deal, and it is emphatically not this slice. If you
   believe the only correct cure is there, **STOP and report that** — a reported refusal is a
   firewall success.

3. **Prove the cure with the instrument that caught the defect.**
   - `npx playwright test --list` → last non-empty line matches `Total: <n> tests in <m> files` with
     **n and m both non-zero**, and **no** `needs an import attribute` anywhere in stdout/stderr.
     Paste the verbatim total.
   - `node --test scripts/whole-suite-collection.test.mjs` → green.

4. **Keep your predecessor's guard green, and widen it by one arm (F-2143-5).**
   `scripts/coal-seams-on-the-view.test.mjs` currently constructs `HeadlessContractSim` with
   `admissionProbe: true`, while the campaign harness — the consumer this field exists for —
   constructs it **without**. Add one arm that asserts the Hill Mine seams **without
   `admissionProbe`**, so the guard answers the question its consumer actually asks. Existing arms
   and their coordinates stay unchanged.

5. **Run the full battery and ATTRIBUTE the reds; do not chase the inherited one.**
   `npm run test:node-guards`, run ALONE (~7 minutes; it is the 400-second battery). Expect
   `same-game report exemption reasons and citations match source` to fail with
   `stale exemption reason for 'e2-incline'`. **That red is INHERITED — it fails standing alone on
   main and is not yours.** Do NOT regenerate `docs/bench/same-game-audit.md`; report the red,
   name it as inherited, and move on. Any red **other** than that one is yours to explain.

## Firewall

**TOUCH-ONLY:** `src/agent/View.ts` · `src/systems/PressureSystem.ts` · the one new leaf module ·
`scripts/coal-seams-on-the-view.test.mjs` · `package.json` (Step 1's conflict resolution **only** —
plus rooting the leaf module is NOT needed, it is not a gate script).

**NO:**
- `src/world/Terrain.ts` and `assets/layer-contracts/**` — see scope 2.
- `docs/bench/same-game-audit.md` and `assets/contracts/**` — the stale-report red is inherited
  (F-2143-4) and regenerating it inside this slice destroys its attribution.
- `scripts/whole-suite-collection.test.mjs` — it is the instrument. Read it, never edit it. If you
  find yourself wanting to relax it, that is the finding, not the fix.
- `scripts/gr-sim-campaign.mjs`, `scripts/campaign-harness-terrain.test.mjs` — this fire's other
  merge; unrelated.
- `tasks/**`, `STATUS.md`, `reviews/**`, `CLAUDE.md` — the drain writes those. If a citation in a
  law file has rotted because of your diff, **report the shift with old and new line numbers; do
  not edit the law file.**
- Any re-pin of any hash, floor or fixture, anywhere.

## Self-check before you report

- `npx tsc --noEmit` rc=0 · `npm run build` rc=0.
- The verbatim `Total: <n> tests in <m> files` line from scope 3, with n,m non-zero.
- `node --test scripts/whole-suite-collection.test.mjs` green.
- `node --test scripts/coal-seams-on-the-view.test.mjs` green, including the new no-probe arm.
- `node scripts/gate-caller-audit.test.mjs` green.
- `npm run test:node-guards` result, with every red attributed (expect exactly the one inherited).
- Both scope-0 premise greps quoted.
- Confirm in your report that `DEFAULT_COAL_SEAMS` exists in exactly ONE place
  (`grep -rn "^export const DEFAULT_COAL_SEAMS" src/` → 1).
- Zero console/page errors is N/A — this slice renders nothing.

**READY-FOR-GATES** — report: the two premise greps, the before/after playwright totals, the
`package.json` resolution you applied, where you put the leaf module and why, the new guard arm's
result, and the full battery's reds with attribution.
