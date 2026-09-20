# toolsurface-terrain-edge — the whole Playwright suite becomes collectable again

**Slice:** `toolsurface-terrain-edge` (F-2381-1's corrective)
**Branch:** `lane/d`
**Tip gated:** `6e06ef5bd` — `runner(lane-d): lane-d-toolsurface-terrain-edge.md`
**Gated on:** detached worktree `gate-s2382`, merged onto `7c8f376ec` (main at this fire's lock)
**Drained by:** s2382

## VERDICT: MERGE

---

## What it does

`src/agent/ToolSurface.ts` carried a module-scope `import * as Terrain from '../world/Terrain'`.
`Terrain.ts` imports a layer contract as `?raw` — a **Vite-only** specifier that node cannot
resolve. `ToolSurface` sits on the static import graph of `e2e/ap16-6-browser-seat.spec.ts`
(via `src/mp/AgentRiderBody.ts`), so Playwright's *collection* pass — plain node, no Vite —
threw before a single spec was registered and **the entire 431-file suite failed to collect**.

The slice removes that import and takes the predicate through the `ToolSurfaceOptions` bag
`createToolSurface(game, options)` already accepted:

```ts
-  buildTargetReachable: (pos) => Terrain.isBuildable(pos.x, pos.z),
+  buildTargetReachable: options.buildTargetReachable ?? (() => true),
```

This is the cure already ratified in this codebase, not a new invention.
`src/systems/ScheduledRelocationSystem.ts` states the law verbatim (F-A8-7,
*"TERRAIN IS INJECTED, NOT IMPORTED"*), and `DevilsAlleyPresentation.ts` /
`SeedCaravanPresentation.ts` are two worked examples of it.

It also ships `scripts/vite-only-import-reachability-guard.test.mjs`, rooted in
`test:ledger-guards`, which names the **class** rather than the instance.

---

## Evidence

| Check | Result |
|---|---|
| **HEADLINE — `npx playwright test --list`, merged tree** | **`Total: 2996 tests in 431 files`** |
| **CONTROL — same command on main (`7c8f376ec`), unmerged** | **`Total: 0 tests in 0 files`**, rc=1, `TypeError: … m1-core.layer-contract.v1.json?raw needs an import attribute of "type: json"` |
| `npx tsc --noEmit` (merged tree) | clean, no output |
| `npm run build` (merged tree) | green, built in 1.85s; asset-diet ceilings reported normally |
| `npm run test:node-guards` (merged tree, `src/sim/` touched → mandatory) | see **Node guards** below |
| New guard, teeth | see **Guard teeth** below |
| `e2e/agent-view.spec.ts` known-red | see **Known reds** below |

The headline and its control are the whole finding: a **differential**, taken with the same
binary minutes apart, where the only variable is the merge. Main cannot collect; the merged
tree collects 2996 tests across 431 files.

---

## Behaviour preservation — the one real risk, and why it is discharged

The default is **permissive** (`() => true`). The master flagged exactly this as
*"a behaviour change wearing a convenience costume"* and required the runner to prove
production behaviour is unmoved. It is, because **every production composition root injects
the genuine predicate**. Enumerated on the merged tree, not inherited:

| Construction site | Injects `Terrain.isBuildable`? |
|---|---|
| `src/game/Game.ts:2500` — the browser's live AgentStub surface | **yes** |
| `src/game/Game.ts:4210` — `new AgentRiderBody(...)`, multiplayer rider | **yes** |
| `src/sim/HeadlessContractSim.ts:1032` — the headless sim | **yes** |
| `src/mp/AgentRiderBody.ts:22` | forwards `...options` through |
| `e2e/*.spec.ts` (6 sites) | no options → permissive; their own placement adapters remain authoritative |

`git grep` over the merged tree finds **no** other `createToolSurface(` / `new AgentRiderBody(`
call site under `src/`. So the permissive default is reachable only from specs that construct a
bare surface, and no production path changes.

---

## Merge classification

Base: `7c8f376ec` (main at lock). Merged `lane/d` @ `6e06ef5bd`, **no conflicts**.

| File | Class |
|---|---|
| `src/agent/ToolSurface.ts` | LANE-TOUCHED — taken |
| `src/game/Game.ts` | LANE-TOUCHED — taken |
| `src/mp/AgentRiderBody.ts` | LANE-TOUCHED — taken |
| `src/sim/HeadlessContractSim.ts` | LANE-TOUCHED — taken |
| `scripts/vite-only-import-reachability-guard.test.mjs` | LANE-TOUCHED (new) — taken |
| `package.json` | LANE-TOUCHED — taken (roots the new guard in `test:ledger-guards`) |
| `STATUS.md` | **MAIN-MOVED** — main's kept |
| `tasks/lane-d-toolsurface-terrain-edge.md` | **MAIN-MOVED** — main's kept |

⚠️ **Method note worth carrying.** `git diff main..lane/d` — a **two-dot** diff — showed the lane
"reverting" both MAIN-MOVED files: STATUS.md to s2381's stale lock line, and the master to its
pre-`e3a8ca8fa` pre-flight (i.e. undoing s2381's F-1407-1 retro-fit). **Neither is a real lane
change.** Both files differ only because *main* moved after the lane branched, and the
**three-way merge kept main's version automatically, with no conflict**. The explicit
`git checkout main -- <path>` this drain ran was a verified no-op. This is the standing
"merge THREE-WAY, never read a two-dot diff as intent" rule, and it would have read as a
destructive revert to anyone classifying from the two-dot output alone.

---

## Findings

**F-2382-1 — a repaired master re-copied into a queue after dispatch is a second DISPATCH, not an edit.** *(non-blocking for this merge; already cured this fire)*

s2381 authored this master, `cp`'d it to `tasks/queue/lane-d/`, and the runner consumed it at
`00:15:27` — the runner **`mv`s**, so the queue went empty (`lane-runner-v3.sh:432`). s2381 then
ran `test:ledger-guards`, correctly caught that its hand-written pre-flight omitted the F-1407-1
factory-churn exception, fixed `tasks/lane-d-toolsurface-terrain-edge.md`, and **re-`cp`'d the
corrected file into the queue at `00:20`** — believing it was updating the pending dispatch.

It was not. The live run had already been reading the old copy for five minutes, and the new
file was an **armed second dispatch**: `lane-runner-v3.sh:243` selects `ls "$q"/*.md | head -1`
the moment the slot's pidfile clears.

- **Realised cost: ZERO.** The live run did **not** stop on the churn (verified: it ran to
  `READY-FOR-GATES`, 388,878 tokens, real diff), so the defective pre-flight cost nothing, and
  the duplicate never fired because this fire parked it ~20 minutes before the slot freed.
- **Direction is what earns it a finding.** Had it fired *after* this drain, the corrected
  pre-flight would have read SAFE-DUPE against a main that now carries the work, reset the lane,
  and re-derived an already-merged diff — **Mistake #8, the 824k Flail**, exactly.
- **The instrument already existed and was already right.** `node scripts/drain-block-check.mjs
  <master> --queue` returns `⛔ ALREADY DISPATCHED — DO NOT QUEUE`, and its message describes
  this scenario in so many words: *"If you repaired the master after copying it, the repair
  belongs to the NEXT run of this work."* §2E's dispatch order says to run it **before the cp** —
  s2381 ran it before the *first* cp and not before the second, because a re-sync does not feel
  like a dispatch.
- **Cure applied:** the stale copy is parked at
  `tasks/queue-paused/s2382-PARKED-armed-duplicate-dispatch-lane-d-toolsurface-terrain-edge.md`
  (byte-identical to the tracked master, so nothing is lost; restore with one `cp` if wanted).
- **No guard proposed.** The refusal already exists and is correct; what was missing is that
  nothing tells a fire to re-ask it on a *re-copy*. That is a law sentence, not new code.

**F-2382-2 — an orphaned `test:node-guards` battery has been idle for 8+ hours and blocked the runner's own gate.** *(non-blocking; reported, not killed by this drain)*

The runner's report says *"Full `test:node-guards` could not run: an unrelated main-worktree
battery has remained active and idle for over eight hours."* **That is true and I measured it:**
pid `79285`, started `Sun Aug 30 16:39:09`, cwd = the **main** worktree, child `95194` at
**0.0% CPU for 8h04m**. Per §2.0b's diagnostic it is `PPID 1` / `TTY ??` — no controlling
terminal, reparented to launchd — i.e. **a fire's own detached orphan, not attended hand-work**,
and therefore clearable. A second, older orphan (`13504`/`13543`/`13551`, `Fri Aug 28 06:57:51`,
**2d17h**) belongs to a different sub-project's suite (`tests/site-smoke`, `tests/sites-worker`).

This drain ran its own battery anyway and it executed (child at 99.7% CPU), so the gate was not
blocked here — but the runner was genuinely prevented from discharging a mandatory check, which
is why the slice arrived with that one gate owed to the drain.

**F-2382-3 — the new guard passes vacuously if its carrier set is empty.** *(non-blocking, latent)*

`vite-only-import-reachability-guard.test.mjs` derives carriers from `git grep -l -F '?raw'`
(correct — derived from the tree, never transcribed, exactly as the master demanded) and is
`import.meta.dirname`-anchored (so cwd-invariant, F-2220-1's lesson already applied). But if that
grep ever returns nothing, `carriers` is empty, no spec can reach one, and the guard reports
success having checked nothing — F-2217-1's shape. **Not a live defect** (the carrier set is
non-empty today and an empty one would mean the class genuinely cannot occur), and deliberately
not cured here: a corpus-declaration arm belongs to whoever next touches that file, not to a
drive-by in a drain.

---

## Ledger

- Goal leaf `toolsurface-terrain-edge` → `status="merged"` + `mergeHash`, in the drain
  bookkeeping commit.
- GZ-01: **NOT PLAYER-VISIBLE** — this restores a *factory* gate (suite collectability). No
  player-facing behaviour changes; the permissive default is unreachable from production paths.
