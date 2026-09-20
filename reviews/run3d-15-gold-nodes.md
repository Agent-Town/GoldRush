# run3d-15-gold-nodes — REJECT (attempt 1)

**Slice:** `run3d-15-gold-nodes` (RUN-3D rider 15, the first rider of the contract-buildables ladder)
**Branch / tip:** `lane/m3` @ `9d61d6a9` (`runner(lane-a): run3d-15-gold-nodes.md`)
**Gated on:** `9233bbd8` = `main` (`f3473665`) + `lane/m3`, merged clean, **in detached worktree `worktrees/gate-s1387`** (§3.0b custody — main's working tree never received slice content; worktree removed after the verdict, `git status` on main clean of all 17 slice paths).
**Fire:** s1387, 2026-08-02
**Verdict:** 🔴 **REJECT — do not merge.** Corrective re-dispatched to lane-a the same fire.

---

## What it does

Adds a `gold_seam` 3D rider to the `?run3dPilot` pilot: a new baked GLB (`assets/pilots/run3d/gold-seam.glb`), a new spec (`e2e/run3d-gold-seam.spec.ts`), and an additive registry entry in `src/game/Run3dPilot.ts`, mounted/unmounted off the `HarvestSystem` snapshot (read-only) as seams deplete and respawn. The type `Buildable3dId` is renamed `Run3dId` to accommodate riders that are not buildables — a rename the ladder genuinely needed, since a gold seam is not a buildable.

**The modelling and wiring half of this slice is exemplary and should be preserved verbatim in attempt 2.** The defect is four lines of boot-path control flow.

## Evidence table (all `--workers=1`, desktop + mobile, on the MERGED tree)

| Gate | rc | Result |
|---|---|---|
| `npx tsc --noEmit` | 0 | clean |
| `npm run build` | 0 | `✓ built in 1.08s`; `Run3dPilot` chunk 4.68 kB; >900 kB warning pre-existing |
| `e2e/run3d-gold-seam.spec.ts` (own spec) | 0 | **8 passed**, 35.4 s — runner's claim confirmed |
| `e2e/run3d-sluice.spec.ts` (unmodified sibling) | 0 | **8 passed**, 25.2 s — runner's claim confirmed |
| run3d adjacent arm (8 specs) | 1 | **52 passed / 8 failed** — all 8 reds are `boiler-house`, **fingerprint-matched pre-existing** (see below) |
| `npm run test:node-guards` | 0 | **226/226** |
| p95 (committed) | — | desktop **0.8897**, mobile **0.8776** — both ≤ 1.15 bar |
| p95 (re-measured this gate) | — | desktop **0.9226**, mobile **1.0458** — both ≤ 1.15 bar |
| model contract | — | **720 tris**, 1 mesh / 1 primitive / 1 material / 1 image 512×512, 0 cameras/lights/anims; re-export `byteIdentical: true`, `semanticIdentical: true`, sha256 match, 372,772 B |
| **`m2-05-base-damage-repair.spec.ts`** | **1** | **RED both projects** — `:353` `waitForFunction` timeout 30 000 ms |
| **`night3d-perf.spec.ts`** | **1** | **RED both projects** — `:118` `waitForFunction` timeout 90 000 ms |

### The 8 boiler-house reds are pre-existing — proof, not assertion
`logs/suite-red-inventory.md` is byte-identical to main on this tree (`git diff main HEAD -- logs/suite-red-inventory.md` empty) and already carries **all eight** at the same coordinates (`:49`, `:24`, `:82`, `:24`, both projects, identical assertion text). Mechanism read at source rather than inherited: the spec places at `(0,12)`, which `tasks/goals.json:4230` records as the dead centre of the authored `hill-mine:boiler-house-site` footprint (half-extents 3.35875), made non-buildable when `5e527a28` added the `!terrain.walkable` clause now live at `src/world/Terrain.ts:236`. Same class as the closed F-1281-2. **No control run required.**

---

## The blocking defect (F-1387-3)

`src/game/Run3dPilot.ts:43-46` (new in this slice):

```ts
if (!params.has('run3dPilot')) {
  publish(host.canvas, 'off');
  return { update: () => undefined, dispose: () => publish(host.canvas, 'off') };
}
```

**Verified by reading both versions side by side, not from the failing tests:**

- **main** — `const selection = params.get('run3dPilot') ?? 'all'`, then `ids = selection === 'all' ? Object.keys(registry) : [selection]`. A plain boot (no param) ⇒ `'all'` ⇒ **every registered building mirrors in 3D.**
- **slice** — the early return fires first whenever the param is absent, so the pilot publishes `'off'` and returns. **The `?? 'all'` default is now unreachable dead code**, and a plain boot renders **no** 3D buildings at all.

**This is Mistake #10 exactly** — "where does the PLAYER see this, in a plain boot?" The answer changed from *all buildings in 3D* to *nothing*, and nothing in the slice's own gate noticed.

### It is also redundant
The very next line already does what the master asked for:

```ts
const ids = (selection === 'all' ? Object.keys(registry).filter((id) => id !== 'gold_seam') : [selection])
```

The master's scope item 4 requires *"plain flag-off boot → **zero GLB requests** + sprites still render"* — a statement about **the gold seam**, not about the whole pilot. R2's "sprites stay the flag-off default" is likewise per-rider. `.filter((id) => id !== 'gold_seam')` satisfies both. The early return delivers no additional behaviour the master wanted and costs the landed default.

### The slice's own gate certifies the regression
`e2e/run3d-gold-seam.spec.ts:53-58` — the test is correctly *named* (`'flag-off boot keeps gold sprites and requests no GLB'`) but expresses it as `await expect.poll(...run3dPilotState).toBe('off')`, which is only true if the entire pilot is off. So the spec passes **because** of the defect. A green own-spec was therefore never going to catch this.

### Measured consequences, and why they are not fingerprint-matched
Both failures boot **without** a `run3dPilot` param and wait for the pilot to become ready:

- `m2-05-base-damage-repair.spec.ts:353` — `waitForFunction(['ready','lite','failed'].includes(run3dPilotState))`, boots `?debug&timescale=8&nowaves&nolevel&nopause&seed=m2-05-orphans` ⇒ state is now `'off'`, which is not in the accepted set ⇒ 30 000 ms timeout.
- `night3d-perf.spec.ts:118` — `terrain3dPilotState === 'ready' && run3dPilotState === 'ready'`, boots `?debug&autotier&contract=e1-night-shift&…&tier=full` ⇒ `'off'` ⇒ 90 000 ms timeout.

`logs/suite-red-inventory.md`'s only rows for these two files are `m2-05:127` and `night3d-perf:135`, both `expect(...).toBe(...)` assertion errors bucketed **MOBILE-ONLY**. What I measured is a **different line, a different failure mode (`waitForFunction` timeout), and BOTH projects.** Not the same red.

**The runner's own compatibility note — "`run3dPilot=all` retains its landed buildable-only aggregate contract" — is true of the explicit `=all` and silent about the default path.** The adjacent denominator it chose (the run3d family) was the wrong one: every consumer that breaks lives outside it, because the run3d specs all pass the flag explicitly and so never exercise the default.

---

## Findings

- 🔴 **F-1387-3 (BLOCKING, cured by the attempt-2 corrective queued this fire).** The flag-absent early return reverts the landed plain-boot 3D-buildings default. Fix: delete `Run3dPilot.ts:43-46`; re-point `run3d-gold-seam.spec.ts:58` to assert `'ready'` **and** zero `gold-seam*.glb` requests, which is what the test's own name claims and what actually proves the master's requirement.
- 🟡 **F-1387-4 (NON-BLOCKING, needs a control run — do not attribute to this slice yet).** `night3d-perf.spec.ts:88` reported p95 ratio **1.400** desktop / **1.418** mobile against a 1.15 bar, on both projects, and is **absent from `logs/suite-red-inventory.md` entirely**. It is a terrain3d-vs-painted ratio, mechanically unrelated to the run3d pilot, and it was measured 7.5 minutes into a heavy battery on a loaded shell (the F-1269-1/F-1270-1 ceiling class). **It may well be load, not code.** Classify with a `night3d-perf`-alone control run on clean main before writing it up as anything. I did not run that control this fire and am not claiming a verdict on it.

## Merge classification (recorded for attempt 2)

Base = `9d61d6a9^`. Main moved **only** `STATUS.md` and `tasks/BACKLOG.md` since that base; the runner touched **neither** (17 files changed vs its own parent, firewall respected). The `STATUS.md`/`BACKLOG.md` delta visible in a `main..lane/m3` two-dot diff is **pure stale-base noise**, not runner output — check against the branch's own parent, not against main. **All 17 slice paths are LANE-TOUCHED with zero MAIN-MOVED collision**, and `git merge --no-ff lane/m3` applied with no conflicts. Attempt 2 should re-land on fresh main the same way.
