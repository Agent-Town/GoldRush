# Task f2130-1: give a REACTIVE client liveness after a rejection WITHOUT taking recovery away from stream clients (LANE-D, commit prefix "fix:")

**FIRE-AUTHORED s2130 (attended review welcome).**

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-d`.

READ FIRST: `reviews/f2127-1.md` — **the whole F-2130-1 section, it is the entire WHY of this task**; `scripts/gr-sim.mjs` (`readOrders`, and the turn loop that awaits it); `scripts/agent-reels.test.mjs:32-45` (the recovery contract you must NOT break); `scripts/moth-season-pressure.test.mjs:14-25`; `src/sim/HeadlessContractSim.ts:1303-1309` (the designed default-secure fallback — **READ-ONLY**).

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main, it is a SAFE DUPE → `git checkout -B lane/d main && git clean -fd` and PROCEED. **RULING FOR THIS LANE, s2130 (cite it, do not re-derive it):** `lane/d`'s ahead commit holds `scripts/gr-sim.mjs` + `scripts/gr-sim.test.mjs` from f2127-1. Those two files were **gated and REJECTED on evidence** by `reviews/f2127-1.md` (F-2130-1) — they are *decided*, not undrained work, so resetting over them destroys nothing and the review is their permanent record. The other two f2127-1 files are on main at `a8f02a7a0`. **Reset and PROCEED.** STOP-and-report only if the worktree holds uncommitted edits you did not make, or an ahead commit touches paths outside those two files. **EVIDENCE-ARTIFACT EXCEPTION (F-1266-1):** changes confined to `artifacts/**`, `reviews/shots-*` and any `.png` are NEVER work and NEVER a STOP — discard them and list what you discarded. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything. `git -C worktrees/lane-d status --short` must then be clean, with the FACTORY-CHURN EXCEPTION (F-1407-1) — `logs/**`, `artifacts/**`, `reviews/shots-*`, `.png`: list them and proceed. What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.

## Why (F-2130-1, filed s2130 at the f2127-1 partial drain — measured by controlled reversion, not inherited)

f2127-1 proposed one cure for two different problems and only one of them was real.

**What was already fixed and is on main** (`a8f02a7a0`): the front door now answers `pendingSecure`, and test 1 of `e2e/front-door-parity.spec.ts` runs in **4.4 s** instead of timing out at 180 s. **F-2127-1 is CURED. Do not re-fix it.**

**What was held.** f2127-1 also changed `scripts/gr-sim.mjs readOrders` to `throw` on any rejected submission instead of `continue`. That was gated and refused, because it breaks a capability two suites deliberately assert:

- `scripts/agent-reels.test.mjs:38-43` runs gr-sim twice over the same input, once with an invalid `[{verb:'NOPE'}]` line prefixed, asserts **both exit 0**, and asserts the two tapes are **byte-identical**. Its contract is: *a rejected order is survivable and leaves no trace in the reel.*
- `scripts/moth-season-pressure.test.mjs` secures with `defaultedSecure: 1` — its client never answers the secure window and relies on the sim's own fallback at `HeadlessContractSim.ts:1303-1309` firing after `Balance.offers.pickSeconds`.

Proven by controlled reversion in one worktree and shell, only `scripts/gr-sim.mjs` swapped, restore verified byte-identical by blob hash:

| Suite | lane `gr-sim.mjs` (fail-fast) | main `gr-sim.mjs` (`continue`) |
|---|---|---|
| `agent-reels` | **FAIL** `:42` `1 !== 0` | **PASS** |
| `moth-season-pressure` | **FAIL** `:18` `1 !== 0` | **PASS** |

⚠️ **THE INVERSION THAT MATTERS, AND IT REVERSES f2127-1's STATED REASONING.** That master quoted the sim's default-secure fallback as "the irony", believing the deadlock stopped it from ever firing. **It fires today, for stream-driven clients** — Moth Season's control run proves it. `continue`-on-rejection is the mechanism that *lets* the designed fallback work. The deadlock is a property of **reactive** clients ONLY: `readOrders` waits for another line without re-emitting a view, and the turn loop awaits it before `advanceToTurn()`, so a client that speaks only when spoken to never speaks again. **The bug is missing LIVENESS for reactive clients, not missing STRICTNESS for all of them.**

## Scope

1. **Restore nothing and break nothing: `scripts/gr-sim.mjs` on main is the baseline.** Start from main's `readOrders`. A rejected submission must remain **recoverable** — a client that keeps sending lines must still be able to proceed, and a valid-order run must stay byte-identical (`agent-reels` asserts exactly this).

2. **Give the reactive client a way to make progress after a rejection.** After a rejection, the protocol must not leave the client with nothing to react to. Choose ONE and justify it in your report:
   - **(a) PREFERRED — a rejection notice on stdout** that a reactive client can answer, distinguishable from a view by its shape (e.g. a top-level `rejected` key), emitted only on the rejection path so valid-order runs are untouched; or
   - **(b)** re-emit the current view after a rejection — **only if** you can show the transcript is unchanged for valid-order runs.
   ⚠️ **Whichever you pick, `scripts/gr-sim.test.mjs` and this repo's specs assert transcript contents, indices and `eventLogHash`. A valid-order run must produce a byte-identical tape and an unchanged `eventLogHash`.** If your approach cannot hold that, STOP and report rather than re-pinning anything (F-1441-3).

3. **A rejection must still be visible.** Keep the existing stderr line (`gr-sim rejected orders: <reason>`). Do not silence it.

4. **Prove liveness with a regression test in `scripts/gr-sim.test.mjs`** (already rooted in `test:node-guards`, no new gate-rooting — do NOT add a new file under `scripts/` matching `(guard|assert|check|audit|contract|ratchet)`). A **reactive** client — one that writes only in response to stdout, modelled on `scripts/f2127-stdin-rejection-probe.mjs` — must, after sending one invalid order, still reach a terminal outcome, under a timeout **≤30 s**. On main today that test would hang to the harness timeout; that is the red it must own.

5. **No-op guard.** If you are about to exit without changes, WRITE WHY into your report first.

## Firewall

Touch ONLY: `scripts/gr-sim.mjs`, `scripts/gr-sim.test.mjs` (the new test only).

NO changes to: `src/sim/HeadlessContractSim.ts` (**READ-ONLY**, including `:1303-1309`); `src/agent/StandingOrders.ts` (both its predicate at `:167` and its message at `:168` are settled — the message landed at `a8f02a7a0`); `e2e/front-door-parity.spec.ts` (**F-2127-1 is CURED there; its pins `calls: 27` / `eventLogHash: 'fnv1a32:05270638'` are correct and must not move** — if your change moves them, that is a FINDING that your approach altered a valid-order transcript, and it means scope 2 failed its own constraint); any assertion in `scripts/agent-reels.test.mjs` or `scripts/moth-season-pressure.test.mjs` — **those two suites are the acceptance criteria and editing them to pass is the failure mode this task exists to prevent**; `playwright.config.ts`; `package.json`.

## Self-check (evidence, not vibes)

- `npx tsc --noEmit` clean · `npm run build` green.
- `node --test scripts/agent-reels.test.mjs` → **PASS**, unmodified.
- `node --test scripts/moth-season-pressure.test.mjs` → **PASS**, unmodified.
- `npx playwright test e2e/front-door-parity.spec.ts --workers=1` → 3/3 desktop green, pins unmoved. (Mobile is skipped by the spec's own `beforeEach` at `:22` — say so, do not report a vacuous mobile green.)
- `node --test scripts/gr-sim.test.mjs` → green including your new test; report pass/skip/fail.
- `npm run test:node-guards` green, run **ALONE** (~405 s, contends with any concurrent battery — F-2099-1). Report the tally.
- Run `node scripts/f2127-stdin-rejection-probe.mjs invalid 25000` and paste the verdict — with a working rejection notice it should now re-prompt rather than report `NO-FURTHER-VIEW`. ⓘ The probe has a known cosmetic defect (no child-close handler, so it prints `NO-FURTHER-VIEW` after its wait even when the child died) — read stderr alongside it and say which you observed.
- Zero console/page errors.

End: **READY-FOR-GATES** + report: (a) which option in scope 2 you took and why; (b) proof the valid-order transcript and `eventLogHash` are unchanged; (c) the `agent-reels` and `moth-season` results; (d) the `test:node-guards` tally; (e) anything adjacent you noticed but did NOT fix.
