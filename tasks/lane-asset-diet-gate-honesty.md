# Task lane-asset-diet-gate-honesty: make `asset-diet.spec` tell the truth about which bundle it measured (lane-c, commit prefix "test:")

**FIRE-AUTHORED (attended review welcome)** — s1028, 2026-07-25. Authored from the F-1026-1 finding in `tasks/BACKLOG.md:784` plus `reviews/advance-stream.md`; no new scope invented.

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-c`.
READ FIRST: `AGENTS.md`; `tasks/BACKLOG.md:784` (the F-1026-1 finding, verbatim below); `e2e/asset-diet.spec.ts`; `playwright.config.ts` lines 1-25.

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/e2-arsenal main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.

**The dupe is PRE-PROVEN for you — do not spend budget re-deriving it.** s1028 ran this at 2026-07-25T05:2xZ against `lane/e2-arsenal` @ `d8240ec9`:
`git diff --stat main lane/e2-arsenal -- src e2e` → **pure main-ahead DELETIONS, ZERO lane-unique additions** (main has the deepwater wave-counter that this branch lacks; the branch's own advance-stream work is already on main as `e109639f`). That is a textbook SAFE DUPE → reset and proceed. Re-run the one command to confirm nothing changed since, then move on.

## Why (F-1026-1, from `reviews/advance-stream.md`, recorded 2026-07-25; BACKLOG:784)
Verbatim: *"**F-1026-1 (corrective, small) — pin `e2e/asset-diet.spec.ts` to the production bundle.** It asserts `townResponses < 25MB`, but playwright's default `webServer` is `npm run dev`, which serves the **undieted originals** — so the suite is structurally red on the dev server and reads as a regression to every fire that touches `AssetLoading.ts`. Measured, not argued: baseline main **36,244,224 B** vs merged **36,253,834 B** (the prefetch adds ~9.6KB, 0.03%, against an 11MB pre-existing overshoot); the same suite is **4/4 green against the production bundle**. GATE: either a `preview`-backed playwright project or a `test.skip` guard when `GR_CAPTURE_EXTERNAL_SERVER !== '1'`, so the red stops costing drains their budget."*

Premise re-verified on current main by s1028 before authoring (file:line, not memory):
- `e2e/asset-diet.spec.ts:92` — `expect(townResponses.reduce((sum, bytes) => sum + bytes, 0)).toBeLessThan(25_000_000);` and the file contains **no** `test.skip`, **no** `process.env` reference at all.
- `playwright.config.ts:20-21` — `webServer: process.env.GR_CAPTURE_EXTERNAL_SERVER === '1' ? undefined : { command: 'npm run dev', ... }`. So by default the suite measures the **dev** server.
- `package.json:8` — `"build": "tsc && vite build && node scripts/asset-diet.mjs"`, i.e. the diet only exists in the built bundle, never in `npm run dev`.
- `playwright.config.ts:4` — `baseURL = process.env.GR_CAPTURE_BASE_URL ?? 'http://127.0.0.1:5188'`.

**The cost this is paying down:** this red has now misled two fires (s1026 measured it; s1027 had to re-explain it). A suite that is red for a structural reason nobody can see is worse than no suite — it burns gate budget and trains fires to wave away reds.

## Scope
1. **Guard the suite so it only asserts against a production bundle.** Satisfy the GATE by EITHER a `test.skip`/`test.describe.skip` when `process.env.GR_CAPTURE_EXTERNAL_SERVER !== '1'`, OR a dedicated preview-backed playwright project. Pick ONE and say in your report why. The simpler guard is preferred unless you find a concrete reason it fails.
2. **The skip must be LOUD, never silent.** A reader of the playwright output must be able to tell the suite was skipped and why — use a skip *reason* string naming the cause and the command to run it properly (e.g. `"asset diet measures the BUILT bundle; run: npm run build && npm run preview -- --port 5188, then GR_CAPTURE_EXTERNAL_SERVER=1 npx playwright test e2e/asset-diet.spec.ts"`). A silently-skipped suite is how a real regression hides — do not trade a false red for a false green.
3. **Add a short comment block at the top of the spec** stating what it measures, why the dev server cannot satisfy it, and the exact two-command way to run it for real. The next fire should learn this from the file, not from a handoff.
4. **Prove BOTH states** (this is the deliverable, not the code):
   - default run (no env var): the suite SKIPS, reported clearly, and the overall run is **green** — no red.
   - production run: `npm run build` → `npm run preview -- --port 5188` → `GR_CAPTURE_EXTERNAL_SERVER=1 npx playwright test e2e/asset-diet.spec.ts --workers=1` → the assertions actually EXECUTE and pass. Report the real measured `townResponses` total in bytes.
5. **Do NOT weaken the budget.** `25_000_000` stays exactly as it is. If it fails against the production bundle, that is a genuine finding: STOP, report the measured number, and do not adjust the threshold to make it pass.

## Firewall
Touch ONLY: `e2e/asset-diet.spec.ts`, and `playwright.config.ts` ONLY if you chose the preview-project route (scope 1).
NO changes to: the `25_000_000` threshold or any other existing assertion value · `src/**` (this is a test-honesty fix, zero production code) · `scripts/asset-diet.mjs` · any other e2e spec · sim semantics · other tasks' fresh work. If you believe a src change is required, STOP and report instead — that is a different task.

## Self-check (evidence, not vibes)
`npx tsc --noEmit` clean. `npm run build` green. `e2e/asset-diet.spec.ts` proven in BOTH states per scope 4, with the real byte number quoted. Adjacent suites unmodified-green, both projects, at `--workers=1`: `advance-stream.spec`, `044-start-screen`, `profile-first-boot`. Zero console/page errors. No screenshots needed (nothing renders differently — say so explicitly rather than omitting it).

**Capped-workers law (F-1026-2, binding):** run every suite at `--workers=1`. Uncapped playwright sweeps on this board MANUFACTURE failures — 4 suites × 2 projects uncapped produced 12 failures where the identical capped set produced 2, baseline-identical. An uncapped red is not evidence.

**No-op guard:** if you find yourself about to exit without changes, WRITE WHY into your report first — a silent no-op wastes a queue slot and a gate.

End: READY-FOR-GATES + which route you took (skip-guard vs preview project) and why · the measured production-bundle `townResponses` byte total · confirmation that the default run is green-with-visible-skip · the adjacent-suite results at `--workers=1`.
