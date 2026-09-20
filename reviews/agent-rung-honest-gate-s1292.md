# agent-rung-honest-gate — second STOP, and why it was re-derivable in advance (s1292)

**Slice:** `agent-rung-honest-gate` (cure for F-1218-1), **run 2 of 2**
**Branch / tip:** lane-c worktree, `lane/e2-arsenal` @ `079c3cc6` — **no commit produced by this run**
**Master:** `tasks/lane-c-agent-rung-honest-gate.md` (FIRE-AUTHORED s1218, re-queued unchanged s1291)
**Run log:** `tasks/runs/20260731-153513-lane-c-lane-c-agent-rung-honest-gate.md.log` (160,694 tokens)
**Predecessor review:** `reviews/agent-rung-honest-gate.md` (s1219, run 1)
**Triaged by:** s1292, 2026-07-31

## Verdict

**STOPPED — LAWFULLY, AT ITEM 2, FOR THE SECOND TIME. Zero repo bytes changed; `lane/e2-arsenal`
measured 0 ahead / 17 behind `main`, working tree tracked-clean.** Nothing to merge.

The runner did its job exactly right. **The defect is upstream of the runner: the master it was
handed carried a premise the owner's 2026-07-30 ruling had already overturned, and the goal leaf's
own guidance made the authorized cure impossible to write.** Both are recorded below as findings.

## The item-1 table (the master's declared deliverable, harvested from the run)

Derived by the runner from source; the "declared rung" column re-verified at source by me in
`src/agent/ToolSurface.ts:351-390`.

| Tool | Declared rung | Effective today | Ruled? |
|---|---:|---:|---|
| `pan_at` (`auto_pan`) | **2** | 1 | ✅ RULED L2 (owner 2026-07-30, *"harvesting is the hero's basic verb"*) |
| `place_building` | **3** | 1 | ✅ RULED L3 (owner 2026-07-30, *"building spends gold"*) |
| `collect_xp`/`collect_gold` (`auto_collect`) | 1 | 1 | ✅ unchallenged |
| `repair` (`auto_repair`) | 1 — **DISPUTED**, ladder line says 2 | 1 | ❌ **UNRULED — F-1279-2, owner's desk** |
| `chase_mark` | **none declared** | 1 | ❌ **UNRULED — F-1219-2 open half** |

Effective-today is 1 for every row for one reason, re-verified at source this fire:
`decideToolPermission` (`src/agent/PermissionLadder.ts:24-31`) takes `(meta, sideEffect)`, never the
tool, and returns the literal `requiredLevel: 1` at `:30`; its sole call site
`src/agent/ToolSurface.ts:226` has `tool: TName` in scope at `:222` and drops it.

## The three assertions the STOP fired on — and their ratification status, one by one

The runner named three currently-green assertions that enforcing declared rungs would flip. **I read
all three at source.** All three live in `e2e/m4-01-tool-surface.spec.ts`.

| # | Assertion | Drives | Under the ruling | Ratified? |
|---|---|---|---|---|
| 1 | `:133` `place_building` succeeds | level **1** | build is **L3** → must be denied | ❌ **contradicts the owner's ruling** |
| 2 | `:164` `expect(receipt.outcome.requiredLevel).toBe(1)` for all four tools | level **0** | pan→**2**, build→**3** (repair/chase_mark stay 1) | ❌ **wrong for 2 of its 4 rows** |
| 3 | `:179` rung-1 `pan_at` reaches `NO_SYSTEM_API` | level **1** | pan is **L2** → `PERMISSION_DENIED` | ❌ **contradicts the owner's ruling** |

**None of the three is a ratified contract.** Each is green only because the rung-blind gate made the
distinction inexpressible — the exact structural blindness recorded in F-1219-1 and in the standing
memory note *green assertions may be unratified*. Assertions 1 and 3 additionally contradict a dated
owner ruling that is quoted in the very spec the master cites as its ratified law
(`specs/m4-agent-ux/README.md:14`, *"L2 tend, repair & work the claim (walls, buildings, pan…) · L3
build (place buildings — spends gold)"*, landed `21985788`).

## F-1292-1 — THE LEAF'S "DO NOT TOUCH" LIST CONTAINS ONE OF THE THREE BLOCKING ASSERTIONS, SO THE AUTHORIZED RE-AUTHOR WAS UNWRITEABLE

`tasks/goals.json`, leaf `agent-rung-honest-gate`, `authorNotes` (written s1279 by F-1279-1) says:

> those four assertion families are CORRECT and must NOT be 'fixed'

naming `m4-01:164`, `066-walk8:162`, `m4-05:218`, `m4-06:248`. The reasoning given is that all four
*"encode pan-at-L2"* and the owner ratified pan-at-L2.

**That reasoning holds for three of the four and fails for `m4-01:164`.** Measured at source:

- `066-walk8:110`, `m4-05:105` (×2), `m4-06:271/:336/:376` all drive `pan_at` at **level 2 and
  require success**. Under an honest gate with `auto_pan: 2` these **still pass**. ✅ correctly blessed.
- `m4-01:164` is **not a pan-at-L2 assertion at all.** It sits inside the *level-**0*** matrix test
  (`installAgentTools(page, 0)` at `:148`), it requires **failure**, and it asserts
  `requiredLevel === 1` for **four** tools at once — `pan_at`, `repair`, `chase_mark`,
  `place_building` (`:152-156`). It encodes the **hardcoded `requiredLevel: 1`**, i.e. the defect
  itself, not the ruling. Under the ruling it is wrong for 2 of its 4 rows.

**Consequence, and this is the whole finding: `m4-01:164` is simultaneously (a) one of the three
assertions the item-2 STOP fires on and (b) on the leaf's must-not-touch list.** Any author obeying
the leaf literally cannot produce a cure that passes item 2 — the task is guaranteed to STOP forever.
The s1279 re-classification was right to overturn the pre-ruling reading; it swept one row into the
blessed bucket that does not belong there.

**Not a criticism of the runner or of s1279's substance** — F-1279-1 correctly found and fixed a
ruling that no mechanism had heard, and three of its four rows are right. This is the narrower
inherited-list defect: *a re-classification's list members must each be re-derived, not carried as a
set.*

## F-1292-2 — THE OWNER AUTHORIZED A **RE-AUTHOR**; s1291 PERFORMED A **RE-QUEUE**, AND THE RUN REPRODUCED THE IDENTICAL STOP

The ruling's own text (`tasks/BACKLOG.md`, `OWNER RULINGS 2026-07-30 (blocker sweep…)` row — cited
by anchor, the number drifts) reads:

> RE-QUEUE AUTHORIZATION: … `ap-06b-panel-ladder-and-voice` + `agent-rung-honest-gate` **re-author
> against the ruling (changed premise per §5)**.

and the leaf's `authorNotes` repeats it: *"Re-authoring is AUTHORIZED against the changed premise
(CLAUDE.md §5)."* s1291 instead re-queued the **s1218 master unchanged in its blocking structure**,
refreshing only the self-check bar (node-guards 74/74→196/196, 344→347 files) and re-verifying the
defect premise. Its own leaf note records this verbatim: *"Queued lane-c s1291."*

The master therefore still carried, into a run dated 2026-07-31 15:35:

- **NO list:** *"`auto_pan` stays 3"* — but the owner ruled 2, and `ToolSurface.ts:380` has declared
  **2** since `21985788` (09:02 today).
- **MEASURED PREMISE:** *"`place_building` and `chase_mark` have NO declared capability at all"* —
  but `place_building` has been declared at **level 3** since `e4336ba8` (11:18 today).

The runner caught both and reported them as premise drift, then stopped — the correct behaviour.
**Cost: 160,694 tokens to re-derive a conclusion already in the ledger since s1219 and already
ruled on since 2026-07-30.** CLAUDE.md §7.5 (*"third attempt only with a CHANGED premise; identical
retry is forbidden"*) is the law this brushes: the premise *check* was refreshed, the premise
*itself* was not.

## What the re-derivation actually unlocks

With the three blocking assertions correctly classified as unratified-and-overruled, **the cure is
no longer a design fork for the ruled rows.** Enforcing `auto_pan: 2` and `place_building: 3`:

- **breaks exactly the three `m4-01` assertions above**, all three of which encode pre-ruling behaviour;
- **leaves all three genuinely-blessed pan-at-L2 families green** (`066-walk8`, `m4-05`, `m4-06`);
- **requires no movement on the two unruled rows** — `repair` stays at its shipped 1 (F-1279-2 is
  the owner's) and `chase_mark`, having no declared capability, keeps the gate's default of 1
  (F-1219-2's open half). Neither row's *value* is touched; only the blanket `toBe(1)` becomes
  per-tool, which is what lets the two unruled rows keep asserting 1 explicitly.

Successor master authored this fire: `tasks/lane-c-agent-rung-honest-gate-v2.md`.

## Env / gates

No gate battery was run by me: **there is no diff to gate.** The runner's own checks, from its
report — `npm run test:node-guards` 190/190; `npx playwright test e2e/m4-01-tool-surface.spec.ts
--workers=1` with the literal `Running 8 tests using 1 worker`, 8/8 passed. ⓘ Its 190/190 is below
main's 196/196 because the lane sat 17 commits behind; that is the stale-base signature, not a
regression — and it is a second, independent symptom of the re-queue-instead-of-re-author.

## Findings

- **F-1292-1** (above) — leaf `authorNotes` blesses `m4-01:164`, which is one of the three blocking
  assertions. **Corrected in `tasks/goals.json` in the same commit as this review.**
- **F-1292-2** (above) — re-queue performed where a re-author was authorized. **Discharged by
  authoring the v2 master this fire.**
