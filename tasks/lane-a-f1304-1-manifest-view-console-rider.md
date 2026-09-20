CODEX: model=gpt-5.6-sol effort=high
# lane-a-f1304-1-manifest-view-console-rider — FIRE-AUTHORED (attended review welcome)
ROLE: lane implementer. WORKDIR: this lane worktree. One task, firewalled.

WHY (quoted evidence, dated):
- **F-1304-1**, raised by the s1304 drain of AP-11 (`reviews/ap-11-mechanics-manifest.md`, 2026-07-31, merge `d97bc4d5`). Measured there, three arms, same tree, same shell, all `--workers=1`:
  | Arm | Command | n | Result |
  |---|---|---|---|
  | A | `e2e/agent-view.spec.ts`, **both** projects | 3 | **3/3 FAIL** — mobile `:283` only |
  | B | same file, `--project=mobile-chrome` | 2 | **2/2 PASS** |
  | C | same file both projects, `--grep "briefing speaks it"` | 1 | **PASS** |
  The failure is always and only the closing `expect(errors).toEqual([])` at the end of `e2e/agent-view.spec.ts:283` ("the derived manifest rides THE VIEW and every E1 briefing speaks it"), receiving 8 × `THREE.GLTFLoader: Couldn't load texture blob:http://127.0.0.1:5188/<uuid>` and nothing else. Every manifest, VIEW and briefing assertion in that same run PASSES, and the board renders the correct line.
- Arm C names the mechanism: the poison is the heavy **preceding** `:342` seeded-rider boot (`?debug&nowaves&nolevel&nopause`) in the same worker — a **pre-existing** test AP-11 never touched. The new assertion is the first one positioned to observe it.
- **F-1180-2** (`tasks/BACKLOG.md:424`) already owns this fingerprint: *"load-sensitive… absent from the red map, the next full-suite comparison will read it as a NEW red and mis-attribute it."* Same text recurs in `reviews/blocked-storage-boot.md:91`, `reviews/m3-05b-run-ledger.md:50`, `reviews/gg-01b-welcome-release-gate.md:42`, `reviews/gg-03c-herald-art-dev-path-weight.md:99`.
- **F-1083-2** (`tasks/BACKLOG.md:1766`) rules the underlying cure out of scope: *"diagnosing renderer determinism is not fire-authorable."* **This task does NOT attempt it.**

READ-FIRST (paths):
- `e2e/agent-view.spec.ts` — the whole file, especially `watchErrors()` (~`:249`) and the two browser tests at `:283` and `:342`.
- `reviews/ap-11-mechanics-manifest.md` §F-1304-1 — the measurement you are curing, including why the diff is exonerated.
- `logs/suite-red-inventory.md` — the row s1304 added for this red; your change retires it.
- `tasks/BACKLOG.md:424` (F-1180-2) and `:1766` (F-1083-2) — the two rulings that bound this scope.

PRE-FLIGHT (LANE-SAFETY invariant): the lane worktree must be clean vs main before you reset — `node scripts/lane-usable.mjs lane-a` must print **USABLE**. If it prints AHEAD-BUT-ABSORBED, HOLDS, DIRTY or BUSY: **STOP** and report the word verbatim. Dirty tracked blobs must be reachable in git, else STOP.

SCOPE:
1. Narrow `watchErrors()` in `e2e/agent-view.spec.ts` so it **ignores exactly one documented transient and nothing else**: console/page errors whose text starts with `THREE.GLTFLoader: Couldn't load texture blob:`. Match by that literal prefix — **not** a loose `/GLTF/i`, **not** a blanket "ignore console errors". Carry a comment naming **F-1304-1 and F-1180-2** so the next reader knows this is a cited exception, not a convenience.
2. **Keep the assertion load-bearing.** Every other console error, every `pageerror`, and any *new* message class must still red the test. Prove this in the same change: add an assertion (or a deliberate temporary mutation you then revert and report) showing an injected foreign console error still fails. **A filter that cannot be shown to still catch something is indistinguishable from a deleted assertion.**
3. Report the filtered count rather than discarding it silently — e.g. keep the suppressed messages in a second array and log/expose the count, so a fire reading the run can see *how much* was ignored. A silent filter is how a real regression hides.
4. Re-measure Arm A **exactly as F-1304-1 defines it** — `npx playwright test e2e/agent-view.spec.ts --workers=1` (both projects), **3 runs** — and report the pass/fail count per run. 3/3 green is the acceptance bar; anything less means the premise moved and you should STOP and report rather than widen the filter to force a green.

TOUCH-ONLY: `e2e/agent-view.spec.ts`.
NO: `src/**` (this is a test-robustness corrective — if you find yourself editing `src/`, the premise has changed: STOP and report) · any other spec's error watcher (fix the class only after this instance is proven) · the GLTF/texture/renderer loading path (F-1083-2) · `logs/suite-red-inventory.md` (the drain retires that row, not you) · the manifest/VIEW/briefing assertions themselves, which are green and must stay byte-unchanged.

SELF-CHECK: `npx tsc --noEmit` clean · `npm run build` green · `e2e/agent-view.spec.ts` **3 consecutive both-project runs at `--workers=1`, all green** · adjacent `e2e/second-rider.spec.ts` unchanged-green-or-known-red (it carries a documented 10.6% flake at `:96`, `logs/suite-red-inventory.md:212`) · zero console errors in the runs you report.

READY-FOR-GATES + report: the exact filter predicate you wrote verbatim · the per-run pass/fail table for the three Arm-A runs · how you proved a foreign console error still reds the test · the suppressed-message count you observed per run.
