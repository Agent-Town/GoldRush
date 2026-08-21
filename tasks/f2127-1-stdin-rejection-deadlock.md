# Task f2127-1: make a rejected order FAIL FAST instead of hanging, and teach the front door to answer the secure window (LANE-D, commit prefix "fix:")

**FIRE-AUTHORED s2128 (attended review welcome).**

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-d`.

READ FIRST: `AGENTS.md`; `tasks/BACKLOG.md` line 22 (the F-2127-1 row — **note the correction in Why below: that row's stated cause is WRONG**); `scripts/f2127-stdin-rejection-probe.mjs` (the banked control that proved the mechanism); `scripts/gr-sim.mjs:209-232` (`readOrders`); `src/agent/StandingOrders.ts:167-171`; `src/sim/HeadlessContractSim.ts:1299` and `:1303-1309`.

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/d main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. **EVIDENCE-ARTIFACT EXCEPTION (F-1266-1, s1266): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, and any `.png` screenshot — are NEVER "work" and NEVER a STOP, whether they sit as uncommitted dirt or as the entire content of an ahead commit. Screenshots are never byte-identity gated, so their bytes differ from main forever. Discard them (`git checkout -- <paths>` / reset) and PROCEED, listing what you discarded.** Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything. Then `git -C worktrees/lane-d status --short` → must be clean, with the FACTORY-CHURN EXCEPTION — always expected, never a STOP; list them and proceed (F-1407-1): (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*` and any `.png`. What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.

**DEPENDENCY PROOF (F-1320-2).** `lane/d` is `ahead=0 behind=15` vs main as of s2128, but it carries **byte-identical blobs** for all three files this task edits (`scripts/gr-sim.mjs`, `e2e/front-door-parity.spec.ts`, `src/agent/StandingOrders.ts` — verified by `git diff --name-only lane/d main --` on those paths returning empty). The safe-dupe reset above puts you on fresh main regardless. If any of those three files differs from main after your reset, STOP and report.

## Why (F-2127-1, filed s2127 2026-08-21; root cause RE-DERIVED and CORRECTED s2128)

`e2e/front-door-parity.spec.ts:84` — test title `'pure stdin progression and panning secure the Claim deterministically'` — is RED on main and burns **180 seconds of every gate battery that names it**.

⚠️ **THE BACKLOG ROW'S STATED CAUSE IS FALSE, AND FOLLOWING IT WILL SEND YOU HUNTING A BUG THAT DOES NOT EXIST.** The row (and s2127's handoff) says *"The test sends a duplicate `SECURE_CHOICE`"*. Measured s2128: `e2e/front-door-parity.spec.ts` contains **ZERO occurrences of `SECURE_CHOICE` and ZERO of `pendingSecure`**. It never answers the secure window at all. The misreading came from the rejection message itself — see layer 4.

The real cause has four layers, each verified by reading the code:

1. **TRIGGER.** The `runReactive` helper in `e2e/front-door-parity.spec.ts` — the ternary in its `child.stdout` line handler that chooses between `SECURING_ORDERS[0]`, a `PICK_UPGRADE`, and bare `HOLD` — decides orders from `pendingOffer` only, and never reads `now.pendingSecure`. (Cited by content, not coordinate: it is a module-level helper, so no test title is recoverable at its line — F-1310-1.) When the secure window opens it sends `HOLD`, and `src/agent/StandingOrders.ts:167` rejects any submission that is not exactly one `SECURE_CHOICE` while `pendingSecure` is live. **Every sibling client already handles this** — `scripts/gr-sim.test.mjs:279` and `scripts/f2086-canyon-census-player.mjs:11` both answer `pendingSecure` first. The front door is the only client that does not.

2. **MECHANISM — this is where the 180 seconds comes from.** `scripts/gr-sim.mjs:209 readOrders` loops `while (true)`; on a rejected submission it writes stderr and `continue`s, waiting for another line. The turn loop at `:114` `await`s it *before* `sim.advanceToTurn()`. So no new view is emitted, and a client that only speaks when spoken to never speaks again. **Deadlock until the client's own timeout.**

3. **THE IRONY, and the reason this is a protocol defect and not merely a stale test.** `src/sim/HeadlessContractSim.ts:1303-1309` **already defaults** the secure choice (to `bank`, since `boot.overtime` is false here) once `Balance.offers.pickSeconds` elapses. The sim was designed to survive an unanswered window. The deadlock is precisely what stops that fallback from ever firing, because the sim's clock cannot advance while `readOrders` blocks.

4. **WHY THE LEDGER GOT IT WRONG — fix this too.** `StandingOrders.ts:168` reads `'Only one SECURE_CHOICE is accepted while the secure window is open.'` That sentence describes *duplicate rejection*, but the condition at `:167` rejects **any** non-`SECURE_CHOICE` order. A correct reader of that message infers a duplicate-send bug, which is exactly what s2127 recorded. **A message that misdiagnoses its own trigger cost a fire a wrong root cause in the durable ledger.**

🧪 **LEVER PROVEN BEFORE AUTHORING (§0.7).** `scripts/f2127-stdin-rejection-probe.mjs` was run both ways in the fire shell — same binary, same contract, same seed, same first view, only the orders' validity differing:
- `invalid` → `NO-FURTHER-VIEW`, **23,228 ms** elapsed with no second view; stderr: `gr-sim rejected orders: PICK_UPGRADE requires a live offered id; "no-such-offer-id-s2128" is not available.`
- `valid` (CONTROL) → `RE-PROMPTED`, next view in **218 ms**, stderr silent.

**218 ms vs ≥23 s.** The rejection is the hang. Note this arms via `PICK_UPGRADE`, not the secure window — proving the deadlock is a property of **any** rejection, not of `SECURE_CHOICE`.

## Scope

1. **Fail fast in `scripts/gr-sim.mjs` `readOrders`.** A rejected submission must terminate the run with a non-zero exit and a stderr line naming the rejection reason, instead of silently waiting. **Do NOT re-emit the view as a retry** — re-emitting changes the transcript, and this spec plus `scripts/gr-sim.test.mjs` assert transcript contents, indices and `eventLogHash`. Fail-fast leaves every valid-order run byte-identical; a retry would not. Match the file's existing voice (`:193`: *"a rider that believes it rode is worse than one that knows it was thrown"*).

2. **Teach `runReactive` in `e2e/front-door-parity.spec.ts` to answer the secure window.** When `message.now.pendingSecure` is live, send exactly `[{ verb: 'SECURE_CHOICE', choice: 'bank' }]` — one order, nothing appended — mirroring `scripts/gr-sim.test.mjs:279`. `bank` is deliberate: `HeadlessContractSim.ts:1299` makes it the choice that terminates the run, and `:1309` shows it is what the sim itself would have defaulted to. Both `runReactive` arms (`answerOffers` true and false) must answer it; the secure check goes **before** the `pendingOffer` branch.

3. **Re-derive the pins in that spec ONLY if they actually move, and report either way.** ⚠️ **The pins are EXPECTED to hold.** `HeadlessContractSim.ts:1177` computes `calls: this.calls - this.secureChoiceCalls`, so answering the window does not change `calls`; and `bank` matches the sim's own default. So `secured: true, waves: 10, gold: 0, kills: 297, calls: 26, defaultedPicks: 0, eventLogHash: 'fnv1a32:fd705184'` should reproduce unchanged. **If any pin moves, that is a FINDING, not a re-pin licence (F-1441-3)** — report the old and new values and the named cause before changing a single number. Never re-pin to make a red go away.

4. **Correct the misleading message at `src/agent/StandingOrders.ts:168`** so it states the actual condition — that while the secure window is open the only accepted submission is a single `SECURE_CHOICE` — rather than implying a duplicate was sent. Keep it one sentence. If any test asserts the old string, update it in the same commit and say so.

5. **Add a regression test to `scripts/gr-sim.test.mjs`** (already rooted in `test:node-guards`, so no new gate-rooting is needed — §0.5) proving a rejected order now terminates promptly instead of hanging: assert a non-zero exit and the reason on stderr, under a timeout **well below** 180 s (≤30 s). Model the arming on `scripts/f2127-stdin-rejection-probe.mjs`.

6. **No-op guard.** If you find yourself about to exit without changes, WRITE WHY into your report first — a silent no-op wastes a queue slot and a gate.

## Firewall

Touch ONLY: `scripts/gr-sim.mjs`, `e2e/front-door-parity.spec.ts`, `src/agent/StandingOrders.ts` (the message at `:168` only), `scripts/gr-sim.test.mjs` (the new regression test only).

NO changes to: sim semantics or balance — `src/sim/HeadlessContractSim.ts` is **READ-ONLY** for this task, including the default-choice logic at `:1303-1309`; the `pendingSecure` rejection **condition** at `StandingOrders.ts:167` (the message changes, the predicate does NOT); any existing assertion in any other e2e spec; `playwright.config.ts`; `package.json`; any other task's fresh work. Do not add a new file under `scripts/` matching `(guard|assert|check|audit|contract|ratchet)` — scope 5 goes into the existing `gr-sim.test.mjs`.

## Self-check (evidence, not vibes)

- `npx tsc --noEmit` clean · `npm run build` green.
- `playwright test e2e/front-door-parity.spec.ts --workers=1` → **all tests green**, and report the wall time for test 1 (it must no longer approach 180 s). This spec is desktop-only by its own `beforeEach` skip at `:22`, so a mobile run adds nothing — say so rather than reporting a vacuous mobile green.
- `npm run test:node-guards` green, run **ALONE** (it is ~405 s and contends with any concurrent battery — F-2099-1). Report the pass/skip/fail tally.
- Re-run `node scripts/f2127-stdin-rejection-probe.mjs invalid 25000` after your fix and paste the verdict — it must now show the run **terminating**, not `NO-FURTHER-VIEW`.
- Zero console/page errors in the spec run.
- Adjacent suites by name, unmodified-green: `scripts/gr-sim.test.mjs`, `scripts/gr-sim-campaign.test.mjs`, `scripts/same-game-audit.test.mjs` (it asserts at `:306` that `SECURE_CHOICE` reaches the door), `scripts/component-boss-secure.test.mjs`.

End: **READY-FOR-GATES** + report: (a) the wall time of front-door test 1 before and after; (b) whether ANY pin in scope 3 moved, with old→new and the named cause if so; (c) the exact new wording of the `StandingOrders.ts` message; (d) the `test:node-guards` tally; (e) anything adjacent you noticed but did NOT fix, per the firewall.
