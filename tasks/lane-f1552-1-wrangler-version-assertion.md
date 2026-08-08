# f1552-1 — declare the instrument by ASSERTING it: one wrangler-version check, all six spawn sites

**FIRE-AUTHORED (attended review welcome)** — s1552, 2026-08-08.

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-c`.

READ FIRST: `AGENTS.md`; `tasks/BACKLOG.md` rows **F-1552-1** (the peer boundary that killed the pin), **F-1552-3** (why this is an assertion and not an install — including the veto window) and **F-1552-4** (the denominator: six spawn sites in four scripts, not two); the STOPPED predecessor `tasks/lane-f1549-2-wrangler-pin.md` and its run log `tasks/runs/20260808-111445-lane-d-20260808-111600-lane-f1549-2-wrangler-pin.md.log` (read its pre-pin control — those numbers are your BEFORE arm and you must not re-derive them by breaking anything); `scripts/test-multiplayer.mjs` around `spawn('wrangler'` and its `cleanEnv()`; `scripts/agent-seat-room.mjs` around its `spawn('wrangler'`; `scripts/test-stats.mjs` `spawnWrangler`; `scripts/test-accounts.mjs` around its `spawn('wrangler'`.

## Pre-flight (LANE-SAFETY, runner-auto-commit aware)

The lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via `git log`/`git diff`), it is a SAFE DUPE → `git checkout -B lane/c main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make.

EVIDENCE-ARTIFACT EXCEPTION (F-1266-1): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, and any `.png` — are NEVER "work" and NEVER a STOP. Discard them and PROCEED, listing what you discarded.

Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.

THEN A CLEANLINESS LINE: `git -C worktrees/lane-c status --short` → must be clean, with the FACTORY-CHURN EXCEPTION — always expected, never a STOP; list them and proceed (F-1407-1): (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*` and any `.png`. What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.

## CITATION CHECK (hard STOP if it fails)

Before scope 1, run these four greps in the lane. Each must return **exactly 1** (all four verified `1` on main at `c1af4b0d7`, s1552, each chosen to sit visibly on one line per F-1425-2):

- `grep -c "const child = spawn('wrangler', args, {" scripts/test-multiplayer.mjs`
- `grep -c "const child = spawn('wrangler', args, { cwd: ROOT, env: cleanEnv(), stdio: \['ignore', 'pipe', 'pipe'\] });" scripts/agent-seat-room.mjs`
- `grep -c 'function spawnWrangler(args, label) {' scripts/test-stats.mjs`
- `grep -c "if (devAuth) args.push('--binding', 'DEV_AUTH=1');" scripts/test-accounts.mjs`

If any returns 0, the lane is stale relative to the master — **STOP and report the counts**; do not adapt. ⓘ The second key is deliberately the whole single-line spawn call in `agent-seat-room.mjs`, which `mp-07c-2` (`6e203aaad`) moved from `:681` to `:731` this same morning — a coordinate would already be wrong, the content is not.

## Why

`npm run test:mp`, `npm run test:stats`, `npm run test:accounts` and the two-seat room harness all stand up real Cloudflare processes by calling `spawn('wrangler', …)` with a **bare command name**, therefore **PATH** resolution — and `wrangler` appears in **neither** `dependencies` nor `devDependencies`. The gates run whatever this Mac happens to have (today Homebrew's `4.107.0`). **A gate that depends on an unversioned external binary can go red with an empty repo diff** — the exact shape `F-MP503-1` wore for a full morning.

**The obvious cure — pin it as a devDependency — was authored (s1551), dispatched, and STOPPED with a zero diff, and the runner was right.** `npm install` fails `ERESOLVE`: `wrangler@4.107.0` declares the optional peer `@cloudflare/workers-types ^4.20260701.1`, while `package.json:42` declares `^5.20260729.1`. An *optional* peer is still enforced when the package is **present** in the tree, which it is.

Two measurements changed the cure, both made s1552 and both re-verified at source rather than inherited:

1. **F-1552-1 — the pin was aimed at the one version on the shelf that cannot install.** Probed across all 4,919 published wrangler versions: `4.107.0` is the **last** release carrying a 4.x workers-types peer; `4.108.0` declares `^5.20260706.1` and every release after it declares a 5.x range (`4.120.0`/latest: `^5.20260801.1`). So a pin is *possible* at `4.108.0`+ — it is simply not what this task does, and **F-1552-3** records why (per-worktree install cost; swapping the binary the gates have actually been exercising on the very morning F-MP503-1 turned on 4.107's config-resolution behaviour) together with the one-word veto that reverses the choice.
2. **F-1552-4 — the denominator was wrong twice.** F-1549-2 named two spawn sites in one file; F-1551-1 grepped "the class" and found one more, in a second file. ✓ VERIFIED s1552 by reading every hit: there are **six spawn sites across four scripts** — `test-multiplayer.mjs` ×2, `agent-seat-room.mjs` ×1, `test-stats.mjs` ×2, `test-accounts.mjs` ×1. `test-stats.mjs` and `test-accounts.mjs` had **never been named by anyone**, and each is a live npm gate.

➡️ **An assertion is the cure that matches that denominator.** A devDependency pin binds only the `npm run` entry points, because `node_modules/.bin` reaches PATH only when npm puts it there — and `agent-seat-room.mjs` has no npm script entry (it is invoked as plain `node`, which is how the mp-07c-1 drain ran its 86/86 harness). An assertion reaches all four scripts identically, costs zero bytes on disk per worktree, and converts silent host drift into a **named, immediate failure** instead of a mystery red.

## Scope

1. **New `scripts/wrangler-binary.mjs`** — a small, zero-dependency module exporting:
   - `EXPECTED_WRANGLER_VERSION` — the string `'4.107.0'`, with a comment stating it is **the version the gates demonstrably resolve today**, citing F-1552-1 and naming `4.108.0` as the lowest version whose declared peer accepts this repo's `@cloudflare/workers-types ^5`, so the next person to move it has the boundary in hand.
   - `resolveWranglerPath()` — returns the absolute path PATH resolution would pick (`which wrangler` or equivalent), or `null`.
   - `assertWranglerVersion(label)` — runs `wrangler --version`, parses the version, and on mismatch **throws** an Error whose message names, in this order: the calling gate's `label`, the version found, `EXPECTED_WRANGLER_VERSION`, the resolved path, and the remedy sentence. On a missing binary it throws a **distinct** message saying wrangler was not found on PATH. Returns the found version on success.
   - An escape hatch: if `process.env.GR_WRANGLER_ANY === '1'`, do not throw — print a single loud `WRANGLER VERSION DRIFT` warning line naming both versions, and return the found version. **The escape must be impossible to trigger silently.**
2. **Wire it at all four scripts**, once each, before the first wrangler spawn on that script's path: `test-multiplayer.mjs`, `agent-seat-room.mjs`, `test-stats.mjs`, `test-accounts.mjs`. ⚠️ `test-multiplayer.mjs` **already** spawns `wrangler --version` to record `wranglerVersion` in its summary artifact — **reuse that probe, do not add a second spawn**; if reuse is awkward, say so in your report and add the call at the earliest point that does not double-spawn.
3. **New guard `scripts/wrangler-version-assert.test.mjs`, proving BOTH directions by MANUFACTURING the defect** — a passing guard never executes its violation path, so a green is not evidence about the red:
   - **positive arm**: with a stub reporting the expected version, `assertWranglerVersion` returns it and does not throw;
   - **violation arm**: with a stub reporting a *different* version, it **throws**, and the message contains both version strings and the label;
   - **missing arm**: with a stub that fails to run, it throws the distinct not-found message;
   - **escape arm**: with `GR_WRANGLER_ANY=1` and a mismatched stub, it does **not** throw and does emit the warning.
   Inject the version-reader as a parameter or module seam so the test never needs a real wrangler — the guard must pass on a machine with no wrangler at all.
4. **Root the new guard**: add `scripts/wrangler-version-assert.test.mjs` to the `test:node-guards` list in `package.json`. An un-rooted new gate reds `gate-caller-audit` (this is a known, repeatedly-paid tax — see the s1301 law clause).

## Firewall

Touch ONLY: `scripts/wrangler-binary.mjs` (new) · `scripts/wrangler-version-assert.test.mjs` (new) · `scripts/test-multiplayer.mjs` · `scripts/agent-seat-room.mjs` · `scripts/test-stats.mjs` · `scripts/test-accounts.mjs` · the `test:node-guards` line of `package.json` · evidence under `artifacts/wrangler-assertion/`.

NO changes to: any dependency or version in `package.json` (**this task installs nothing** — if you find yourself running `npm install` to add a package, you have left the task) · `package-lock.json` · the f-mp503-1 unconfigured fixture or anything that cure installed · any `src/**` · any `e2e/**` · any existing test assertion (adding a test is expected; **editing an existing assertion is a STOP-and-report**, never a silent judgement call — F-1528-2).

⛔ **FORBIDDEN GREENS — each makes this look done while the finding survives:**
- wiring fewer than four scripts (the denominator is the whole point of this slice — F-1552-4);
- making the assertion a bare `console.warn` with no throw path, so nothing ever fails;
- defaulting `GR_WRANGLER_ANY=1` anywhere, or setting it in a script/config so the assertion is inert on arrival — that is F-1460-1's excused-label failure in advance;
- proving the guard with a green only, without the manufactured violation arm;
- "fixing" the peer conflict by touching `@cloudflare/workers-types` — that is a different task and it is explicitly out of scope;
- pinning wrangler at any version (see F-1552-3: that option is deliberately deferred, not forgotten).

If you find yourself about to exit without changes, WRITE WHY into your report first — a silent no-op wastes a queue slot and a gate.

## Self-check (evidence, not vibes)

**The manufactured defect is the deliverable.** Show the violation arm actually failing, not just the suite passing.

- `npx tsc --noEmit` → **0**
- `npm run build` → green
- `node --test scripts/wrangler-version-assert.test.mjs` → paste the tests/pass/fail line, all four arms named
- **`npm run test:mp`** → paste the pass line. Baseline to beat: **462 checks green** (recorded by the f1549-2 run at 11:17 this morning, same repo, unpinned). Also paste the `wranglerVersion` recorded in `artifacts/multiplayer-relay/test-multiplayer.json` — it must still read **`4.107.0`**, and the assertion must have passed silently.
- **`npm run test:stats`** and **`npm run test:accounts`** → paste both pass lines. ⓘ These two have never been gated for this before; **if either is ALREADY red before your edit, that is a FINDING to attribute and report, not something to fix here** — record the pre-edit red and say so plainly.
- `node scripts/agent-seat.test.mjs` → green
- **`npm run test:node-guards`** → paste the tests/pass/fail line and name any red you attribute rather than fix. ⓘ Expect ~3 minutes serial and **run it ALONE** (F-1537-1: overlapping batteries contaminate each other on shared fixtures).
- **One live drift demonstration**, which is the whole cure in one line: run any one of the four gates with a temporarily-wrong `EXPECTED_WRANGLER_VERSION` (or a stubbed reader) and paste the failure message it prints. It must name the gate, both versions, and the resolved path. Then restore and show the file byte-identical.

Do NOT run playwright suites — this slice touches no `src/**` and no `e2e/**`.

End: **READY-FOR-GATES** + report: all six pass lines above, the drift-demonstration message verbatim, which of the four scripts needed a wiring judgement call (especially the `test-multiplayer.mjs` double-spawn question), any gate that was already red before you started, and confirmation that `package.json` dependencies and `package-lock.json` are untouched.
