# Task f1590-1: the dep re-optimization A/B, on a lever that PROVABLY arms — and a cure only if it confirms (LANE-B, commit prefix "fix:")

**FIRE-AUTHORED (attended review welcome).** s1590, 2026-08-09.

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-b.

READ FIRST:
- `AGENTS.md`.
- `reviews/f1589-4-dep-reoptimize-stall.md` — your predecessor's report **and** the s1590 drain verdict appended below it. Its line 81 contains the sentence `was the only reachable verdict, and the runner reaching it honestly` — **grep for that exact span; if it returns 0 your lane is stale, STOP and report** (do not proceed, do not "fix" it).
- `artifacts/f1590-1-arm-lever/transcripts.md` — the three runs that found the working lever. It contains the line `lockfileHash-written=deadbeef` and the heading `The lever that does work`; **grep for both, expect 1 each, STOP if either is 0.**
- `artifacts/f1590-1-arm-lever/probe.mjs` — a working, 40-line instrument that arms the trigger and reports whether it took. **You may reuse or adapt it; you do not have to rebuild it.**
- `scripts/gate-battery.mjs` — the shared driver, where a cure would land IF one becomes warranted.
- `e2e/beauty-town.spec.ts` — the subject test is at `:14`, `the day town boots with ground contact, wear and parcel dressing — and no night dressing`.

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/b main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. **EVIDENCE-ARTIFACT EXCEPTION (F-1266-1): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, and any `.png` screenshot — are NEVER "work" and NEVER a STOP, whether they sit as uncommitted dirt or as the entire content of an ahead commit. Discard them (`git checkout -- <paths>` / reset) and PROCEED, listing what you discarded.** Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything. **THEN A CLEANLINESS LINE: `git -C worktrees/lane-b status --short` → must be clean, with the FACTORY-CHURN EXCEPTION — always expected, never a STOP; list them and proceed (F-1407-1): (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*` and any `.png`. What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.**

ⓘ **The pre-flight `npm install` no longer matters to this task's arm** — that was the predecessor's worry. This task arms the trigger *deliberately and locally*, so an install that does or does not move the lockfile cannot spoil your window. Record what it printed anyway, for the log.

## Why (F-1590-1, s1590 drain of f1589-4 — the third attempt, and the first with a lever that works)

This is the **third** attempt at F-1587-2 and it is lawful under §7.5 because the premise changed again, this time on measured grounds rather than a new guess.

- **s1587** measured `e2e/beauty-town.spec.ts:14` ("the day town boots with ground contact, wear and parcel dressing — and no night dressing") failing at **41.8 s** as the first test against a fresh scratch server, timing out in `saveEraLightShot`'s `waitForFunction(() => town.elapsed > 4)`; the same test on the same tree passed **warm in 5.0 s**.
- **`f1587-2-cold-server-warm` (s1589)** could not reproduce it cold (**5.5 s**) and correctly shipped nothing.
- **`f1589-4` (s1590)** re-aimed at vite dep re-optimization and returned **COULD-NOT-ARM** — also correctly, because **both levers its master prescribed cannot possibly work**:
  - `node_modules/vite/dist/node/chunks/node.js:31487` prints `Re-optimizing dependencies because lockfile has changed` **only inside `if (cachedMetadata)`**. Deleting `node_modules/.vite` removes the very `_metadata.json` whose mismatch produces the message — the branch is unreachable **by construction**. A cold cache optimizes *silently*; it never *re*-optimizes.
  - `:32019-32031` — `getLockfileHash()` is `getHash(readFileSync(lockfilePath, 'utf-8'))`, over the lockfile's **CONTENT**. Touching its mtime cannot move it.

**The lever that does work was proved by manufacture at the s1590 drain** (`artifacts/f1590-1-arm-lever/`): leave `deps/` intact and stale ONLY the stored hash.

```js
const meta = 'node_modules/.vite/deps/_metadata.json'
const m = JSON.parse(readFileSync(meta, 'utf-8'))
writeFileSync(meta, JSON.stringify({ ...m, lockfileHash: 'deadbeef' }, null, 2))
```

Run 1 printed the premise line verbatim (`8:21:45 AM [vite] (client) Re-optimizing dependencies because lockfile has changed`); the converged control run was **silent**; and `lockfileHash` returned to `6c42fd2c` afterwards — **it self-heals**, because vite rewrites the correct hash as part of re-optimizing. `node_modules/**` is untracked, so this arms the trigger **without touching `package-lock.json` at all**.

📊 **One prior result you must not re-derive:** with the dep cache **fully absent**, f1589-4 measured first-test durations of **5.6–5.9 s** against **5.6–5.7 s** warm, six runs, all rc=0. So **from-scratch optimization work is NOT the stall** (~0.2 s, not ~36 s). What remains untested is the *re*-optimization path specifically — which does strictly more than a cold build: it **invalidates an existing cache**, and can do so while a client is already attached.

## Scope

1. **Arm A — ARMED, 3 repetitions.** For each repetition: stale `lockfileHash` per the lever above, start a fresh dev server on a scratch port (5231 or 5234; `GR_CAPTURE_EXTERNAL_SERVER=1` + `GR_CAPTURE_BASE_URL` per the port law — **`PORT` sets nothing**), wait only for vite's own readiness line, send **no** warming request, then run the single subject test:
   `npx playwright test e2e/beauty-town.spec.ts --project=desktop-chrome --workers=1 -g 'the day town boots with ground contact'`
   **The run counts as ARMED only if the captured server log contains the `Re-optimizing dependencies because lockfile has changed` line.** Quote that line, with its timestamp, for each of the three. If a repetition comes back unarmed, re-arm and retry it rather than reporting it as an Arm A observation.
   Capture per repetition: the arm proof line, the test's own duration, the suite duration, wall time, rc, and the **full** server log.

2. **Arm B — DISARMED control, 3 repetitions.** Identical in every respect except the cache is left consistent, so the server prints **no** optimization line at all. ⚠️ **Take a throwaway convergence run first and discard it** — the drain measured that the first control after an armed run can still report `Re-optimizing dependencies because vite config has changed`; a control is only a control once the server starts silent. Report that you did this.

3. **Report whether any optimization line appeared DURING the test window, as opposed to at startup.** This is a capture, not a second experiment — you already have the full logs. Say explicitly, per run, whether lines such as `new dependencies optimized` or `optimized dependencies changed. reloading` appear *after* the readiness banner. **Do not chase this if it shows up** — record it and stop; it is the next author's call.

4. **Rule on the hypothesis in writing.**
   - **CONFIRMED** = Arm A reproduces the stall (any run near 41.8 s, or a first-test duration several times Arm B's) while Arm B does not.
   - **NOT CONFIRMED** = both arms land in the same band. Say so plainly. Three bounded non-reproductions is a real result about F-1587-2's rate and it belongs in the ledger — **do not invent a fourth hypothesis and chase it.**

5. **The cure, CONDITIONAL — only if item 4 says CONFIRMED.** If and only if confirmed, add the cure to `scripts/gate-battery.mjs` and **prove it with an Arm C**: armed exactly as Arm A, cure active, 3 repetitions, showing the stall gone. Keep `scripts/gate-battery.test.mjs` green and extend it if the cure adds a branch worth pinning. Prefer *waiting for the optimizer to settle* over *sending a `GET /`*: the town scene is loaded by `main.ts` via a dynamic `import('./town/TownScene')`, so a document request may never compile the chunk that was starving. **If NOT CONFIRMED, ship no cure** — a cure on an unconfirmed cause is what two predecessors were right to refuse.

6. **Write `reviews/f1590-1-dep-reoptimize-armed.md`**: verdict line (CONFIRMED / NOT CONFIRMED), the arm-proof line quoted per Arm A repetition, a table of all runs (arm, repetition, armed?, first-test duration, suite duration, wall, rc), the item-3 answer, and an explicit statement of which cure the evidence does and does not support.

If you find yourself about to exit without changes, WRITE WHY into your report first — a silent no-op wastes a queue slot and a gate.

## Firewall

Touch ONLY: `reviews/f1590-1-dep-reoptimize-armed.md`, `artifacts/f1590-1-dep-reoptimize-armed/**`, and — **only under the item-5 condition** — `scripts/gate-battery.mjs` and `scripts/gate-battery.test.mjs`.

NO changes to: `e2e/beauty-town.spec.ts` or any other spec (**raising that timeout is specifically forbidden — it hides a harness artefact inside a gameplay assertion's budget, F-1275-1**); `playwright.config.ts` (**and in particular do not touch `workers` — the fire-shell serialisation there is load-bearing, F-1270-3, and guarded**); `package.json` / `package-lock.json` (**this task needs neither — the lever is entirely inside untracked `node_modules/`**); `src/**`; sim semantics; other tasks' fresh work.

`node_modules/**` is untracked, so staling `_metadata.json` is free and is **not** a repo change. You need no restore step — vite repairs it itself — but say so rather than assuming it.

## Self-check (evidence, not vibes)

- `npm run build` green (pre-flight, before anything).
- `git status --short` shows nothing outside the TOUCH-ONLY paths, and `git diff --stat package-lock.json` is **empty**.
- All runs' raw output written under `artifacts/f1590-1-dep-reoptimize-armed/`.
- **If NOT CONFIRMED:** no executable byte changed, so state "tsc/build/suites provably unaffected" rather than claiming suites you did not run — the drain checks the diff, not the claim.
- **If CONFIRMED and a cure shipped:** `npx tsc --noEmit` rc=0, `npm run build` green, `node --test scripts/gate-battery.test.mjs` green, plus the Arm C table. `test:node-guards` is **not** owed — no `src/sim/`, `src/systems/` or `src/entities/` path is in scope (F-1460-1).

End: READY-FOR-GATES + report: the arm-proof line for each Arm A repetition; the full run table; the item-3 answer; whether F-1589-4 is CONFIRMED; and, if a cure shipped, its Arm C numbers.
