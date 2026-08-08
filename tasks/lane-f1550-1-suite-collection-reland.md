# Task f1550-1: cut the ONE import edge that killed `npm test` again — `takeBuildRejectionDetail` moves out of BuildSystem (LANE-C, commit prefix "fix:")

**FIRE-AUTHORED (attended review welcome)** — s1550, from F-1550-1 measured this fire.

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-c`.

READ FIRST: `AGENTS.md`; `reviews/mp-07c-1-order-channel.md` (F-1550-1, the finding this cures, with its control run); `tasks/BACKLOG.md` the `F-1094-1` row (the 2026-07-18 incident this is a repeat of — **read its "load-bearing trap" paragraph before you touch anything**); `reviews/rf-33.md` (the proven cure shape); `src/systems/BuildSystem.ts:74–97` and `:1071` (the symbols that move and the one writer); `src/agent/ToolSurface.ts:17`, `:248`, `:250` (the only consumer); `scripts/whole-suite-collection.test.mjs` (the guard that must go green).

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/c main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. EVIDENCE-ARTIFACT EXCEPTION (F-1266-1): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, and any `.png` screenshot — are NEVER "work" and NEVER a STOP. Discard them and PROCEED, listing what you discarded. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything. THEN A CLEANLINESS LINE: `git -C worktrees/lane-c status --short` → must be clean, with the FACTORY-CHURN EXCEPTION — always expected, never a STOP; list them and proceed (F-1407-1): (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*` and any `.png`. What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.

**CITATION CHECK (hard STOP if it fails).** Before scope 1, run these three greps in the lane. Each must return **exactly 1**:
- `grep -c "import { takeBuildRejectionDetail } from '../systems/BuildSystem';" src/agent/ToolSurface.ts`
- `grep -c "let pendingBuildRejectionDetail: BuildRejectionDetail | undefined;" src/systems/BuildSystem.ts`
- `grep -c "json?raw';" src/world/Terrain.ts`

If any returns 0, the lane is stale relative to the master — **STOP and report the counts**; do not adapt.

## Why (F-1550-1, measured by s1550 on 2026-08-08, every number re-derivable)

`npm test` — `package.json`'s `"test": "playwright test"` — **collects zero tests**. Measured on main at `bc9629bfb`: `npx playwright test --list` → **`Total: 0 tests in 0 files`**. `npm run test:node-guards` is rc=1 with **3 failures cascading from one root**: `whole suite collects without loading Vite-only modules`, and through it `whole-suite collection guard is cwd-invariant` and `all 23 scripts/*.test.mjs fixture owners remove their temp directories` (both run it as a child).

The error is unchanged from the 2026-07-18 incident:

```
TypeError: Module ".../assets/layer-contracts/m1-core.layer-contract.v1.json?raw"
           needs an import attribute of "type: json"
```

i.e. the `?raw` JSON import at `src/world/Terrain.ts:2`, which Node cannot parse during Playwright's Node-side collection. rf-33 (`e3db39ae`, s1095) cured this exact class by cutting the ONE value-import edge that dragged `Terrain` into a spec's static import graph, taking the suite `0 → 2378 tests`.

**s1550 bisected the corpus and the culprit is a single spec, and a single edge.** Chunk probe over 393 specs → chunk 3 fails; binary search → **`e2e/task-026-prospector-collects-xp.spec.ts`** alone. Proof it is the *only* one: `--list` over all specs **except** that one exits 0 with **`Total: 2738 tests in 388 files`**. The chain is three hops, walked statically:

```
e2e/task-026-prospector-collects-xp.spec.ts
  -> src/agent/ToolSurface.ts        (:17  value import)
  -> src/systems/BuildSystem.ts      (:27  import * as Terrain)
  -> src/world/Terrain.ts            (:2   ?raw JSON)
```

**Dated to one commit: `6d6dc5e8d`, 2026-08-08T08:41:03+07:00, `runner(lane-b): lane-fdoor2-rejection-reasons.md`** — the f-door-2 slice that merged this morning. It added `takeBuildRejectionDetail` to `BuildSystem` and imported it into `ToolSurface`. The regression is **~2 hours old, not nine days**; the whole point of acting now is that last time nobody noticed for nine days, because *every gate in this repo runs NAMED specs and `npm test` is the only caller of the unfiltered suite.*

⚠️ **THE LOAD-BEARING TRAP, and it is the same one F-1094-1 names.** `takeBuildRejectionDetail` is used as a **runtime value** at `ToolSurface.ts:248` and `:250`, so an `import type` back-reference is **unavailable** — the symbol must **MOVE**. Importing it back would re-drag `Terrain`, leave collection broken, **and leave `tsc` and `build` both green** — a silent no-op that reads as a fix.

⚠️ **AND THERE IS A SECOND HALF THE rf-33 SHAPE DID NOT HAVE: this is a module-level MUTABLE handoff, not a pure function.** `pendingBuildRejectionDetail` (`BuildSystem.ts:81`) is **written** by BuildSystem at `:1071` and **read** by ToolSurface through the taker. Moving the taker alone would split writer and reader across two module instances and the detail would silently always be `undefined` — a green build, a green tsc, and a quietly dead feature. **The slot must move WITH the taker, and BuildSystem must import it back.**

## Scope

1. **New file `src/systems/buildRejectionDetail.ts`** containing, moved verbatim (not rewritten): the `BuildRejectionDetail` type (`BuildSystem.ts:74–79`), the module-level `pendingBuildRejectionDetail` slot (`:81`), the `takeBuildRejectionDetail()` function (`:83–88` including its `// ponytail:` comment), and a small setter for the writer to use (name it in your report). **This file must import NOTHING from `src/world/`, `src/systems/BuildSystem`, or anything reaching them** — ideally it has zero imports. State its exact import list in your report.
2. **`BuildSystem.ts`**: delete the moved symbols; import the setter (and the type, as `import type` if that is all it needs) from the new module; re-point the single write site at `:1071` to the setter. **Keep `rejectionDetail()` (`:90–97`) in BuildSystem** — it maps `ConfirmBuildDiagnostics['reason']`, a type that lives here, so moving it would drag BuildSystem's types into the leaf module. **Re-export `BuildRejectionDetail` and `takeBuildRejectionDetail` from BuildSystem ONLY if some other consumer needs it** — grep first; s1550 measured ToolSurface as the sole external consumer, so a re-export is probably unnecessary. If you add one, say why.
3. **`ToolSurface.ts:17`**: re-point the import at the new module. Do not change `:248`/`:250` behaviour.
4. **Prove the recovery with the instrument, not by reasoning.** `npx playwright test --list` must exit **0** with a **non-zero** `Total:` — expect ~**2738 tests in 388 files**. **Assert non-zero, never a hard-coded 2738** (F-1091-1: one-sided assertions are how rf-29's guard went blind); the number drifts as specs land, and quoting it as a pin is the mistake.
5. **Run the recovered spec, since it has not run under a collecting suite:** `e2e/task-026-prospector-collects-xp.spec.ts` both projects `--workers=1`. **If it reveals reds, that is a FINDING to attribute and report — NEVER something to fix by editing `e2e/`.**

## Firewall

Touch ONLY: `src/systems/BuildSystem.ts`, `src/agent/ToolSurface.ts`, ONE new file `src/systems/buildRejectionDetail.ts`.

NO changes to: **anything under `e2e/`** (the forbidden green — see below) · `src/world/Terrain.ts` (do NOT "fix" the `?raw` import; that is a Vite contract and a separate design question) · `playwright.config.ts` · `package.json` · the glob sites F-1093-4 catalogued · other tasks' fresh work.

⛔ **FORBIDDEN GREENS — each of these makes the guard pass while the defect survives:** editing or excluding `e2e/task-026-prospector-collects-xp.spec.ts` · adding an ignore/testIgnore entry · changing `src/world/Terrain.ts` · importing `takeBuildRejectionDetail` back into `ToolSurface` from `BuildSystem` under any alias · leaving the mutable slot behind in BuildSystem.

If you find yourself about to exit without changes, WRITE WHY into your report first — a silent no-op wastes a queue slot and a gate.

## Self-check (evidence, not vibes)

`npx tsc --noEmit` **0** · `npm run build` green · **`npx playwright test --list` exit 0 with a non-zero Total (paste the exact line)** · `node scripts/whole-suite-collection.test.mjs` **green** · `npm run test:node-guards` — **the 3 F-1550-1 failures must be GONE; paste the tests/pass/fail line and name any remaining red** (s1550 measured 383 tests / 377 pass / **3 fail** / 3 skipped on the merged tree; expect 380 pass / 0 fail from this cure, and if any *other* red appears attribute it, do not fix it) · `e2e/task-026-prospector-collects-xp.spec.ts` both projects `--workers=1`, zero console/page errors · adjacent `e2e/m2-01-build-menu.spec.ts` + `e2e/agent-seat.spec.ts` both projects `--workers=1` (BuildSystem and ToolSurface are both on their paths) · `node scripts/agent-seat.test.mjs`.

🔬 **MUTATION CONTROL — REQUIRED, and it is the proof the slice rests on.** A passing guard never executes its violation path, so a green alone is not evidence about the red. After the cure is green: temporarily re-add the direct `import { takeBuildRejectionDetail } from '../systems/BuildSystem';` to `ToolSurface.ts`, confirm the guard goes **RED again with the same `needs an import attribute` TypeError**, then restore and **verify the restore is byte-identical** (`git hash-object` before/after). Paste both hashes and both guard results.

End: **READY-FOR-GATES** + report: the new module's exact import list, how the writer/reader handoff was kept on one module instance, whether any re-export was needed and why, the `--list` line before and after, the mutation-control hashes and verdicts, and any red you attributed rather than fixed.
