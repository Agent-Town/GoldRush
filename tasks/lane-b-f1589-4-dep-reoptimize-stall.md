# Task f1589-4: is the cold-start stall actually a vite DEP RE-OPTIMIZATION? — measure before curing (LANE-B, commit prefix "fix:")

**FIRE-AUTHORED (attended review welcome).** s1589, 2026-08-09.

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-b.
READ FIRST: AGENTS.md; `reviews/f1587-2-cold-server-warm.md` (your predecessor's report AND the s1589 drain verdict appended below it — read both, they disagree about the cause); `artifacts/f1587-2-cold-start/arm-a-server.log` (three lines; line 1 is this task's whole premise); `scripts/gate-battery.mjs` (the shared driver, 255 lines — where a cure would land IF one is warranted); `e2e/beauty-town.spec.ts` (the subject test is at :14, `the day town boots with ground contact, wear and parcel dressing — and no night dressing`).

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/b main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. **EVIDENCE-ARTIFACT EXCEPTION (F-1266-1, s1266): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, and any `.png` screenshot — are NEVER "work" and NEVER a STOP, whether they sit as uncommitted dirt or as the entire content of an ahead commit. Screenshots are never byte-identity gated, so their bytes differ from main forever. Discard them (`git checkout -- <paths>` / reset) and PROCEED, listing what you discarded.** Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything. **THEN A CLEANLINESS LINE: `git -C worktrees/lane-b status --short` → must be clean, with the FACTORY-CHURN EXCEPTION — always expected, never a STOP; list them and proceed (F-1407-1): (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*` and any `.png`. What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.**

⚠️ **PRE-FLIGHT RIDER, SPECIFIC TO THIS TASK: `npm install` IS ITSELF THE SUSPECTED TRIGGER.** The pre-flight above runs `npm install --no-audit --no-fund`, and this task's hypothesis is that a lockfile touch is what causes the stall. So **record whether the pre-flight install reported any change, and whether `node_modules/.vite/deps` changed mtime**, BEFORE you start Arm 1. If the pre-flight has already consumed the re-optimization window, say so and re-arm it deliberately per scope item 1 — do not report a clean Arm 1 that your own pre-flight warmed.

## Why (F-1589-4, s1589 drain of f1587-2 — and a predecessor that correctly refused to guess)

F-1587-2 (s1587) measured `e2e/beauty-town.spec.ts:14` failing at **41.8 s** as the first test against a fresh scratch server — timing out in `saveEraLightShot`'s `waitForFunction(() => town.elapsed > 4)` — while the SAME test on the SAME tree passed **warm in 5.0 s**. The cure proposed was "warm the server with one request".

`f1587-2-cold-server-warm` (lane-b, merged as evidence `9371c1c8d`) tried to reproduce that on a genuinely cold server and **could not**: the test passed in **5.5 s** (suite 6.7 s, wall 7.19 s, rc=0) against a server that was ready in 115 ms and had received no HTTP request. It shipped no patch and reported the negative result, exactly as instructed. **A non-reproduction bounds a defect's rate, not its existence — so F-1587-2 is still OPEN.**

**The re-aim comes from the predecessor's own artifact.** Line 1 of `artifacts/f1587-2-cold-start/arm-a-server.log` reads verbatim:

> `7:11:22 AM [vite] (client) Re-optimizing dependencies because lockfile has changed`

Dependency re-optimization is a known multi-second first-request stall, and it is triggered by a **lockfile change**, not by server temperature. That fits all three observations better than cold-vs-warm does: 41.8 s once, never reproducible after, 5.5 s on a genuinely cold server. It predicts the defect is **EPISODIC** — reachable only in the window after an install moves the lockfile — which is exactly why a straight cold/warm A/B cannot summon it.

Corroborating, verified on main at authoring time: `node_modules/.vite/` currently holds `deps` **plus two leftover `deps_temp_*` directories**, which is the on-disk signature of re-optimization passes.

⚠️ **§7.5 applies: this is the second attempt at F-1587-2 and it is lawful ONLY because the premise CHANGED.** Re-running the same cold/warm A/B is forbidden. If you find yourself starting a server and timing the first test without having first manipulated the dep cache, you are running the predecessor's task, not this one.

## Scope

1. **Re-arm the trigger deliberately, and prove you armed it.** Establish the re-optimization state on purpose rather than hoping to catch it: remove `node_modules/.vite` (the vite dep cache — it is generated, never tracked, and vite rebuilds it) and/or touch the lockfile's mtime so vite decides to re-optimize. **Prove the arm worked by capturing the server log line** — the run is only armed if the server prints an optimizing/re-optimizing line. Record which lever you used and the exact line printed. If neither lever makes vite re-optimize, that is a REPORTABLE NEGATIVE — say so and continue to item 4.

2. **Arm A — ARMED (re-optimization pending).** Start a fresh dev server on a scratch port (5231 or 5234; `GR_CAPTURE_EXTERNAL_SERVER=1` + `GR_CAPTURE_BASE_URL` per the port law — `PORT` sets nothing), wait only for vite's own readiness line, send **no** warming request, then run the single subject test:
   `npx playwright test e2e/beauty-town.spec.ts --project=desktop-chrome --workers=1 -g 'the day town boots with ground contact'`
   Capture: the test's own duration, the suite duration, wall time, rc, and the full server log. **Repeat this arm 3 times, re-arming before each** — the defect is claimed to be episodic, so a single observation decides nothing. Report all three.

3. **Arm B — DISARMED (dep cache already warm).** Identical to Arm A in every respect except that the dep cache is already optimized (run once to warm it, then start a fresh server). **Same 3 repetitions.** The comparison that matters is Arm A vs Arm B, both cold-server, differing ONLY in dep-cache state — that isolates re-optimization from server temperature, which is the whole point of the re-aim.

4. **Rule on the hypothesis in writing, and let the numbers decide the cure.**
   - If Arm A reproduces the stall (any run near 41.8 s, or a first-test duration several times Arm B's) and Arm B does not: **F-1589-4 is CONFIRMED.** Then and only then propose the cure, and note that a `GET /` warm-up **may not be sufficient** — the town scene is loaded by `main.ts` via a dynamic `import('./town/TownScene')`, so a document request need never compile the chunk that was starving. If the right cure is "wait for the optimize to finish" or "pre-warm the dep cache in the driver", say so.
   - If Arm A does NOT reproduce: **report that as the result.** Two failed reproductions from two different premises is real evidence about F-1587-2's rate, and it belongs in the ledger. **Do NOT invent a third hypothesis and chase it** — that is the next author's call, with your numbers in hand.
   - **Either way, ship NO driver patch in this task.** This task's deliverable is a measurement, not a cure; a cure authored on top of an unconfirmed cause is exactly what the predecessor was right to refuse.

5. **Write `reviews/f1589-4-dep-reoptimize-stall.md`** with a verdict line (CONFIRMED / NOT CONFIRMED / COULD-NOT-ARM), a table of all six runs (arm, repetition, armed?, first-test duration, suite duration, wall, rc), the server log line for each armed run, and an explicit statement of which cure the evidence does and does not support.

If you find yourself about to exit without changes, WRITE WHY into your report first — a silent no-op wastes a queue slot and a gate.

## Firewall

Touch ONLY: `reviews/f1589-4-dep-reoptimize-stall.md`, `artifacts/f1589-4-dep-reoptimize/**` (all evidence goes here, nowhere else).

NO changes to: `scripts/gate-battery.mjs` and `scripts/gate-battery.test.mjs` (**this task measures; it does not cure — a patch here is out of scope even if you become confident**); `e2e/beauty-town.spec.ts` or any other spec (**raising that timeout is specifically forbidden — it hides a harness artefact inside a gameplay assertion's budget, F-1275-1**); `playwright.config.ts`; `package.json` / `package-lock.json` (**you may touch the lockfile's MTIME as an experimental lever under scope 1, but its CONTENT must end byte-identical — verify with `git status` before reporting**); `node_modules/**` is not tracked, so deleting `.vite` is free and is NOT a repo change; sim semantics; other tasks' fresh work.

## Self-check (evidence, not vibes)

`npm run build` green (pre-flight, before anything). No tracked file outside the two TOUCH-ONLY paths may differ — **`git status --short` must show nothing else**, and `git diff --stat package-lock.json` must be empty even if you touched its mtime. All six runs' raw output written under `artifacts/f1589-4-dep-reoptimize/`. No spec was modified, so no suite needs re-running: state that explicitly rather than claiming suites you did not run.

⚠️ **This task deliberately has NO tsc/spec gate**, because it changes no executable byte. Do not manufacture one — an honest "zero executable bytes changed, therefore tsc/build/suites are provably unaffected" is the correct evidence line here, and the drain will check the diff rather than the claim.

End: READY-FOR-GATES + report: which lever armed the re-optimization and the exact server line proving it; the six-run table; whether F-1589-4 is CONFIRMED; and — if confirmed — which cure the numbers support and which they do not.
