# Task f2189-1-depenetrate-node-safe: keep the never-trapped hero cure, but stop dragging Vite into plain node (lane-c, prefix "fix:")

**FIRE-AUTHORED (attended review welcome)** — s2189, 2026-08-22.

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-c`.

READ FIRST — ⚠️ **THE FIRST FILE IS NOT ON YOUR LANE. Your lane is deliberately BEHIND main (see the
pre-flight: you must NOT refresh it), so `reviews/c3-hero-move-pin.md` does not exist in your
worktree. Read it out of main instead:**

```
git show main:reviews/c3-hero-move-pin.md
```

That is the drain that HELD your predecessor; it carries the measurement, the two-sided control and
the cure shape you are about to need. **Read it before anything else.** Then, on your lane as normal:
`AGENTS.md`; **`tasks/fe2cs2-2-coal-seam-defaults-node-safe.md`** and
**`reviews/fe2cs2-1-publish-coal-seams-on-the-view.md`** (the SAME defect class cured once already —
read how it was resolved before inventing a second answer); `src/world/LandmarkCollision.ts` (line 1
is the whole problem); `src/game/RunSuspend.ts` (your predecessor's new import);
`scripts/whole-suite-collection.test.mjs` (the guard that caught this — read it, **do not edit it**).
If any of those three older paths is missing on your lane too, read it from `main:` the same way and
say so in your report.

## Pre-flight — READ THIS ENTIRE SECTION BEFORE RUNNING ANY GIT COMMAND

⚠️ **THIS LANE IS INTENTIONALLY AHEAD OF MAIN AND ITS AHEAD CONTENT IS YOUR OWN BASE. DO NOT RESET
IT. DO NOT `git checkout -B lane/c main`. DO NOT `git clean -fd`.** The usual SAFE-DUPE template is
WRONG for this task: the lane holds `c3-hero-move-pin`, which is the work you are repairing, not
debris. Resetting it is Mistake #2 exactly, and it would destroy an owner-playtest cure.

```
LANE-SAFETY-OPT-IN: BUILD-ON-PREDECESSOR
EXPECTED-HOLDS: e2e/c3-hero-move-pin.spec.ts
EXPECTED-HOLDS: reviews/shots-c3/desktop-chrome-yard-corner.png
EXPECTED-HOLDS: reviews/shots-c3/mobile-chrome-yard-corner.png
EXPECTED-HOLDS: src/entities/Hero.ts
EXPECTED-HOLDS: src/game/Game.ts
EXPECTED-HOLDS: src/game/RunSuspend.ts
EXPECTED-HOLDS: tasks/BACKLOG.md
```

Those seven paths are the complete held set, measured live with `node scripts/lane-usable.mjs
lane-c` by the authoring fire at 2026-08-22T17:10Z (`ahead=1 behind=5 paths=7 tracked-dirt=0
untracked=0`). If the lane holds anything else, **STOP and report it** — an unanticipated held path
is exactly the state the lane-safety guard exists to refuse.

**Cleanliness line.** `git status --short` in the worktree → expect clean, with the **FACTORY-CHURN
EXCEPTION — these tracked classes are ALWAYS EXPECTED and are NEVER a STOP; list them and proceed
(F-1407-1):** (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*` and any `.png`. What still STOPs:
modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md` that you
did not write.

Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.

## WHY (measured by the s2189 drain on the merged tree, 2026-08-22 — every number below is a real run)

Your predecessor's cure is **good** and is not being reverted. It added one import:

```ts
// src/game/RunSuspend.ts
import { depenetrateToWalkable } from '../world/LandmarkCollision';
```

But `src/world/LandmarkCollision.ts:1` is a **Vite-only** module specifier:

```ts
import registryText from '../../assets/pilots/map-rebuild-spike/landmark-collision-contract.json?raw';
```

Playwright spec files run in **node**, and three specs import `RunSuspend` at node level —
`e2e/restore-validation.spec.ts`, `e2e/mp-arsenal.spec.ts`, `e2e/lane-gold-quantization.spec.ts`
(cited by content, not coordinate: grep each for `from '../src/game/RunSuspend'`).
Node cannot resolve `?raw`, throws `needs an import attribute of "type: json"`, and Playwright
**aborts whole-suite collection on any such error**. Measured, same command, same machine:

| tree | `npx playwright test --list` | rc |
|---|---|---|
| `main` @ `063b26b23` | `Total: 2958 tests in 425 files` | 0 |
| `main` + `lane/c` | `Total: 0 tests in 0 files` (8 × TypeError) | 1 |

And the house guard built after the previous instance of this class agrees, in both directions:
`node --test scripts/whole-suite-collection.test.mjs` → **main PASS (1.9 s)**, merged **FAIL**.

⚠️ **This is the rf-33 incident re-created.** The `lane-hero-y-restore-roundtrip` master records rf-33
restoring collection as *"`npx playwright test --list`: 0 tests → 2378 tests in 330 files"*. The
merged tree returns that number to 0.

ⓘ **Why the predecessor's own gates were all green and could not have seen this:** naming a spec file
explicitly collects only that file, and `c3-hero-move-pin.spec.ts` does not import `RunSuspend`. The
10/10 and the 41/42 are REAL. A targeted run is structurally incapable of detecting a collection
break; only whole-suite collection can.

## Scope

1. **Make the depenetration helpers node-safe by MOVING them, not by rewriting them.** Create
   `src/world/depenetrate.ts` containing `depenetrateToWalkable` and `depenetrateFromBlockers`
   **byte-for-byte as they are today** (including the `ponytail:` comment and the 16 m ceiling), with
   no `?raw` import and no dependency on the landmark registry. `blockerContains` / the
   `PlanarBlocker` type move or are imported as needed — whatever keeps the new module free of
   Vite-only specifiers. **No behaviour change of any kind is in scope.**
2. **`src/world/LandmarkCollision.ts` re-exports both helpers** so every existing import site keeps
   working unchanged. Do NOT touch its `?raw` registry load — that is legitimate app-side code and
   is not the defect; the defect is that node-level test code can now reach it.
3. **Point `src/game/RunSuspend.ts` at the new module** (`../world/depenetrate`). Change nothing else
   in that file.
4. **Check for siblings before you finish (F-2189-1's own lesson).** Any OTHER module that node-level
   test code imports and that transitively reaches a Vite-only specifier is the same defect. Run the
   guard, and if it still reds, follow the chain and report what you find — do not stop at the first
   fix.
5. **Do NOT re-litigate the movement cure.** `Hero.ts`, `Game.ts`'s movement/diagnostic changes and
   the c3 spec are your predecessor's shipped work and stay exactly as they are.

## The one behavioural question you MUST answer (F-2189-2)

Your predecessor **deleted** this line from `restoreSnapshot` in `src/game/RunSuspend.ts`:

```ts
if (hero?.group?.position) hero.group.position.y = snapshot.hero.position.y;
```

`git log -S` attributes it to **`afbee591f` — `runner(lane-a): lane-hero-y-restore-roundtrip.md`**,
whose entire purpose was curing `e2e/restore-validation.spec.ts:658`
("active megaproject wrecker references survive strict normalization and restore"),
a test whose failure was exactly one
difference: `root.hero.position.y`. The deletion is *plausibly* right — the new relocate recomputes
height via `heroVisualYAt` and re-applying the saved `y` would undo it — **but nobody has verified
it, because F-2189-1 stops that suite from collecting at all.**

Once your fix lands, **`e2e/restore-validation.spec.ts` must collect and `:658` must be GREEN on both
projects.** That is the acceptance test for the deletion.

🚫 **If `:658` is RED, do NOT restore the deleted line reflexively and do NOT loosen the assertion.**
Report the measured `y` values on both sides (the original finding recorded
`0.14559222393281415 != 0.2763519114255905`) and say which of the two cures is right. A conflict
between a shipped fix and a new one is a finding, not a merge conflict to split the difference on.

## Firewall

Touch ONLY: `src/world/depenetrate.ts` (new), `src/world/LandmarkCollision.ts` (re-export line ONLY),
`src/game/RunSuspend.ts` (the one import path, plus the `y` line only if the evidence above tells you
to), `tasks/BACKLOG.md` (your status row).
NO changes to: `src/entities/Hero.ts`, `src/game/Game.ts`, `e2e/c3-hero-move-pin.spec.ts`, any
existing e2e assertion, `scripts/whole-suite-collection.test.mjs`, the `?raw` registry load itself,
enemy movement/balance, `HeadlessContractSim`.

## Self-check (evidence, not vibes)

- `npx tsc --noEmit` + `npm run build` green.
- **`node --test scripts/whole-suite-collection.test.mjs` GREEN** — this is the whole point; report
  its wall time.
- **`npx playwright test --list` reports a non-zero total** — quote the exact `Total: N tests in M
  files` line. It should be ≥ the 2958/425 main measured above (plus your predecessor's 10).
- **`e2e/restore-validation.spec.ts` GREEN, both projects, `--workers=1`** — quote the count, and
  call out `:658` explicitly.
- `e2e/c3-hero-move-pin.spec.ts` still **10/10**, both projects (your predecessor's cure is intact).
- Adjacent unmodified-green, both projects, `--workers=1`: `task-025`, `m1-01`, `m2-01`,
  `run-suspend`, `mp-arsenal`, `lane-gold-quantization`.
  ⓘ `run-suspend.spec.ts:194` on mobile-chrome is a **known load-attributable flake** (F-2189-4): it
  reds inside a large battery and passes alone in 37.6 s against a 90 s budget. If you see it red,
  re-run it ALONE before reporting it, and report both results.
- **`npm run test:node-guards`** — run it ALONE, ~530 s (F-2166-2). This is **OWED** on this slice
  under F-1460-1 (`src/entities/` + `src/game/` are touched by the predecessor) and the s2189 drain
  deliberately deferred it to you rather than skipping it. Report the full counts.
- `node scripts/null-floor-anchors.mjs --check` — report secured flips (expect 0).
- Zero console/page errors in a plain no-`?debug` boot, desktop + 390px.

End: **READY-FOR-GATES** + report: the guard's wall time, the exact `--list` total, the
`restore-validation` count with `:658` named, whether you had to touch the `y` line and the evidence
that decided it, any sibling Vite-only import chains found under scope item 4, and the node-guards
counts.

## No-op / honesty guard

If the guard is already green when you start, **STOP and report** — that would mean main moved under
this master and the premise needs re-measuring; do not manufacture a diff. Never make the guard green
by editing the guard, by adding the spec to an ignore list, or by deleting an import that app code
needs.
