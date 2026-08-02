# run3d-15b — gold-seam rider: restore the plain-boot 3D default (ATTEMPT 2, corrective)

**FIRE-AUTHORED (attended review welcome).** Role: Codex runner, lane-a. Workdir: `worktrees/lane-a` (branch `lane/m3`).

> ⛔ **DO NOT RESET THIS LANE. DO NOT `git checkout -B` IT FROM MAIN.** ⛔
> This is **not** a fresh slice. `lane/m3` already carries your attempt-1 work at commit `d0a861a9`
> (`runner(lane-a): run3d-15-gold-nodes.md`) — the baked GLB, the blend, the new spec, the artifacts
> and the registry wiring. **That work was gated and it is GOOD; it is being kept, not redone.**
> It is **unmerged**, so the usual safe-dupe reset pre-flight would DESTROY it (Mistake #2, the Reset
> Massacre — w1-03 and polish-02 were lost exactly this way).

## PRE-FLIGHT (run this exact sequence; STOP on any mismatch and report)

1. `git -C worktrees/lane-a rev-parse --abbrev-ref HEAD` → must print `lane/m3`. If not, **STOP**.
2. `git -C worktrees/lane-a log --oneline -1` → must print `d0a861a9 runner(lane-a): run3d-15-gold-nodes.md`. If the tip is anything else, **STOP and report** — do not reset, do not force anything.
3. `git -C worktrees/lane-a status --short` → expect clean, or only regenerated `artifacts/**` PNGs. If tracked **source** files are dirty, **STOP and report**.
4. Confirm `src/game/Run3dPilot.ts` contains the string `if (!params.has('run3dPilot'))`. If it does not, the premise of this task is gone — **STOP and report**.

**You are committing ON TOP of `d0a861a9`, on `lane/m3`. Nothing gets rebased, reset, or squashed.**

## WHY (evidence, quoted)

Attempt 1 was gated on the merged tree in a detached worktree by fire s1387 and **REJECTED** — review `reviews/run3d-15-gold-nodes.md`, finding **F-1387-3**. Everything about the model and the rider wiring passed and is being kept:

> tsc clean · build green · `run3d-gold-seam.spec.ts` **8 passed** · `run3d-sluice.spec.ts` **8 passed** unmodified · `test:node-guards` **226/226** · **720 tris**, one 512² material, re-export `byteIdentical: true` · p95 desktop 0.8897 / mobile 0.8776, both under the 1.15 bar.

The single blocking defect is four lines of boot-path control flow. `src/game/Run3dPilot.ts:43-46` adds:

```ts
if (!params.has('run3dPilot')) {
  publish(host.canvas, 'off');
  return { update: () => undefined, dispose: () => publish(host.canvas, 'off') };
}
```

On **main**, `const selection = params.get('run3dPilot') ?? 'all'` means a plain boot with **no** param mirrors **every** registered building in 3D. This early return fires first, so a plain boot now publishes `'off'` and returns — **the `?? 'all'` default became unreachable dead code, and a plain boot renders no 3D buildings at all.** That is Mistake #10 ("where does the PLAYER see this, in a plain boot?").

Measured on the merged tree, `--workers=1`, **both projects**, and **not** fingerprint-matched to `logs/suite-red-inventory.md`:

- `e2e/m2-05-base-damage-repair.spec.ts:353` — `waitForFunction(['ready','lite','failed'].includes(run3dPilotState))` → **timeout 30 000 ms** (boots without the param; state is `'off'`, which is not in the accepted set).
- `e2e/night3d-perf.spec.ts:118` — `terrain3dPilotState === 'ready' && run3dPilotState === 'ready'` → **timeout 90 000 ms** (same cause).

**The early return is also redundant**, which is why this is a small fix and not a redesign. The very next line already delivers exactly what the master asked for:

```ts
const ids = (selection === 'all' ? Object.keys(registry).filter((id) => id !== 'gold_seam') : [selection])
```

Scope item 4 of the attempt-1 master required *"plain flag-off boot → **zero GLB requests** + sprites still render"* — a requirement about **the gold seam**, not about the whole pilot; R2's "sprites stay the flag-off default" is likewise per-rider. The `.filter((id) => id !== 'gold_seam')` satisfies both on its own.

## SCOPE (numbered, each item testable)

1. **Delete the early return** at `src/game/Run3dPilot.ts:43-46` (the `if (!params.has('run3dPilot')) { … }` block, including its `publish(host.canvas, 'off')` and the returned no-op object). Change nothing else in the file — the `Buildable3dId`→`Run3dId` rename, the registry entry, the `gold_seam` mount/unmount loop and the `.filter((id) => id !== 'gold_seam')` all **stay exactly as they are**.
2. If `'off'` is now an unreachable member of the `publish()` state union and TypeScript or lint flags it as unused, remove that member too — **only** if it is genuinely unreferenced after item 1. If anything else still publishes `'off'`, leave the union alone and report why.
3. **Re-point the flag-off assertion** in `e2e/run3d-gold-seam.spec.ts` (currently line 58, inside `test('flag-off boot keeps gold sprites and requests no GLB', …)`). Replace `await expect.poll(() => …run3dPilotState).toBe('off')` with an assertion that actually proves the test's own name and the master's requirement:
   - the pilot reaches **`'ready'`** (the landed default — other buildings DO mirror), **and**
   - the existing `requests` counter for `/gold-seam[^/]*\.glb/` is **still `0`**, **and**
   - the gold sprites still render (keep the existing `assets['node.gold_seam'] === 'loaded'` check).
   The rest of that test, and every other test in the file, stays as written.
4. Re-run and report the numbers below. **Do not "fix" anything outside items 1–3** — if you find another problem, report it, do not repair it.

## FIREWALL

**TOUCH-ONLY:** `src/game/Run3dPilot.ts` · `e2e/run3d-gold-seam.spec.ts` · regenerated files under `artifacts/run3d-gold-seam/` (p95 JSON + screenshots) if a re-run rewrites them.

**NO:** do **not** touch `assets/pilots/run3d/gold-seam.glb` or `.blend` (they are byte-verified and final) · do **not** touch any other `e2e/run3d-*.spec.ts` · do **not** touch `e2e/m2-05-base-damage-repair.spec.ts` or `e2e/night3d-perf.spec.ts` (**they are the oracle — fixing the code is the job, and editing them would hide it**) · do **not** touch `logs/suite-red-inventory.md` (standing order: never hand-edit) · do **not** touch `STATUS.md`, `tasks/BACKLOG.md`, `tasks/goals.json`, or anything under `reviews/` · do **not** touch `src/entities/GoldNode.ts` or `src/systems/HarvestSystem.ts` · do **not** reset, rebase or squash the branch.

## SELF-CHECK (run every one, at `--workers=1`, report exact counts — this flag is a correctness requirement, not an optimisation)

1. `npx tsc --noEmit` → rc 0.
2. `npm run build` → rc 0.
3. `npx playwright test e2e/run3d-gold-seam.spec.ts --workers=1` → **8/8**, both projects.
4. `npx playwright test e2e/run3d-sluice.spec.ts --workers=1` → **8/8** unmodified (the rename's control).
5. **The two reds this task exists to clear**, both projects, both must go GREEN:
   `npx playwright test e2e/m2-05-base-damage-repair.spec.ts e2e/night3d-perf.spec.ts --workers=1`
   Report per-test results. ⚠️ **`night3d-perf.spec.ts:88` (a p95 ratio ~1.40 vs a 1.15 bar) is a SEPARATE, UNCLASSIFIED red (F-1387-4) that is probably shell load and is NOT yours to fix** — report its number and move on. Item 5 passes when **`:118` reaches `'ready'`**; `:88` is a report item only.
6. `npx playwright test e2e/run3d-assay-bench.spec.ts e2e/run3d-interaction.spec.ts e2e/run3d-lantern-post.spec.ts e2e/run3d-palisade.spec.ts e2e/run3d-sentry-beacon.spec.ts e2e/run3d-stockpile.spec.ts e2e/run3d-turret.spec.ts --workers=1` → expect all green. (`e2e/run3d-boiler-house.spec.ts` is **excluded on purpose**: its 8 reds are pre-existing and fingerprint-matched in `logs/suite-red-inventory.md`; do not run it, do not fix it.)
7. `npm run test:node-guards` → rc 0, report X/Y.
8. Zero console/page errors in the boot probes, desktop **and** 390px mobile.

Commit path-scoped on `lane/m3` with the prefix `run3d-15b:`. **Never `git add -A`.**

**READY-FOR-GATES + report:** the exact counts for self-checks 1–8; confirmation that `Run3dPilot.ts:43-46` is gone and that the `.filter((id) => id !== 'gold_seam')` is untouched; the new text of the flag-off assertion; and the `night3d-perf:88` p95 numbers as a report item.
