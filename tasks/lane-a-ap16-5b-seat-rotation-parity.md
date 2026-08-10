# Task ap16-5b: the seat learns the facing too — rotation parity on the SECOND build path (LANE-A, commit prefix "feat:")

**FIRE-AUTHORED (attended review welcome)** — s1645, 2026-08-11.

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-a`.

READ FIRST: `AGENTS.md`; `specs/agent-play/ap-16-same-game-law.md` (the law this serves); `specs/multiplayer/mp-07-one-engine-at-the-table.md` (what the seat IS, and why it is narrow on purpose); `reviews/ap16-5-rotation-parity.md` (the predecessor drain — its Findings section is this task's entire WHY); `src/sim/SeatOrders.ts` (the subject); `src/agent/StandingOrders.ts` (the REFERENCE implementation — you are copying its ruling, not inventing one); `scripts/agent-seat.test.mjs` (the suite you extend).

SEQUENCING LAW: this task depends on AP-16-5 (`144b3291`) being present, because it copies that slice's validation ruling verbatim. Verify with
`grep -c "rotationSteps?: 0 | 1 | 2 | 3;" src/agent/StandingOrders.ts`
→ must print `1`. If it prints `0`, **STOP and report "AP-16-5 not landed in this lane"** — do not improvise the dependency, and do not gate on `git log -N`.

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/a main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. **EVIDENCE-ARTIFACT EXCEPTION (F-1266-1, s1266): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, and any `.png` screenshot — are NEVER "work" and NEVER a STOP, whether they sit as uncommitted dirt or as the entire content of an ahead commit. Screenshots are never byte-identity gated, so their bytes differ from main forever. Discard them (`git checkout -- <paths>` / reset) and PROCEED, listing what you discarded.** Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything. Then `git -C worktrees/lane-a status --short` → must be clean, with the FACTORY-CHURN EXCEPTION — always expected, never a STOP; list them and proceed (F-1407-1): (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*` and any `.png`. What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.

## Why (F-1645-2, s1645 2026-08-11 — found by the ap16-5 runner under its master's FIREWALL LIFT clause, then VERIFIED AT SOURCE by the drain before this master was written)

AP-16-5 (`144b3291`) taught the **standing-orders** door that a `BUILD` order can carry `rotationSteps: 0..3`, and published it in `public/skill.md`'s guarded grammar fence. It did not — and by its firewall could not — touch the **second** build path.

**The gap, verified line by line rather than inherited from the report:**

1. `src/sim/SeatOrders.ts:31-36` — `SeatBuildOrder` has `verb` / `what` / `where` / `when` and **no** `rotationSteps`.
2. `src/sim/SeatOrders.ts:47` — `const BUILD_KEYS = ['verb', 'what', 'where', 'when'];`
3. `src/sim/SeatOrders.ts:120` — `if (!exactKeys(value, BUILD_KEYS)) return schemaError;`
4. `src/sim/SeatOrders.ts:~92` — `buildActions()` emits `{ type: 'place_build', id, position, rotationSteps: 0 }`, **hardcoded**.

⚠️ **The consequence is sharper than "the seat lacks a feature", and it is the actual reason this task exists.** Because line 3 is an `exactKeys` check, an unknown field is not ignored — it is a **schema error that rejects the WHOLE ORDER**. So an agent that reads the freshly-published grammar in `public/skill.md`, writes `{"verb":"BUILD",...,"rotationSteps":1}`, and sends it through the seat gets `INVALID_ARGS` and places **nothing**. It does not get a building facing the wrong way; it gets no building and a refusal. That is a worse experience than silently defaulting, and it is now reachable from documentation the factory itself publishes.

**What this task is NOT, so you do not over-reach (read this before scoping):** the seat is **deliberately** narrower than the standing-orders door, and that narrowness is a *tested* property — `scripts/agent-seat.test.mjs:103` is named `'the seat carries BUILD and refuses to stretch for the rest'`, and the seat correctly refuses `MOVE_TO`, `HOLD`, `REPAIR_UNDER`, `BLAST_AT` and every other verb with `UNSPEAKABLE_ON_THE_WIRE`. **You are not here to close that gap.** Rotation is a *modifier on the one verb the seat already speaks*, which is exactly why it — and only it — belongs here. If you find yourself adding a second verb, you have left the task.

**The ruling is inherited, not yours to re-decide:** AP-16-5 ruled **VALIDATE, not NORMALIZE** — `rotationSteps: 7` and `rotationSteps: 'north'` are schema errors, never clamped — and its runner explicitly agreed after implementing it. The seat must reject the same values the same way, for the same reason. **If you think the seat should differ from the door here, STOP and write the finding instead of implementing a divergence** — a second, quieter grammar is the precise failure the same-game law exists to prevent.

## Scope

1. **`SeatBuildOrder` gains `rotationSteps?: 0 | 1 | 2 | 3;`** — optional, exactly as `StandingOrder`'s BUILD arm carries it (`src/agent/StandingOrders.ts`, the reference).
2. **`parseSeatOrder` accepts the key without widening the schema for everyone else.** Mirror the reference's shape: test `'rotationSteps' in value` and pass the *conditional* key list to `exactKeys`, so an order WITHOUT the field is validated against exactly today's four keys and its behaviour is untouched. Do not simply add `rotationSteps` to the constant `BUILD_KEYS` — that would silently permit the key everywhere the constant is used and weaken the strictness that makes this door honest.
3. **Validate the value the same way the door does:** integer, `0 <= n <= 3`. Anything else (`7`, `-1`, `1.5`, `'north'`, `null`) returns the existing `INVALID_ARGS` schema error. Reuse the seat's existing error path; do not invent a new `reason`.
4. **`buildActions()` forwards it** — replace the hardcoded `rotationSteps: 0` with the order's value defaulting to `0` when the field is absent (`order.rotationSteps ?? 0`). Omission must remain byte-identical in behaviour to today.
5. **Extend `scripts/agent-seat.test.mjs`** with the four cases that make this real, in the existing house style of that file: accept `0`, `1`, `2`, `3` and see the facing reach the sim's `place_build` action; **reject `7`**; **reject `'north'`**; and **omission still places at facing `0`**. Name the new test so it says what it defends, e.g. `'the seat carries the facing, and refuses a facing the county does not keep'`.
6. **Do NOT touch the audit or the published grammar.** `scripts/same-game-audit.mjs` compares the human tape against `src/agent/StandingOrders.ts` and its rows say "standing-order `BUILD`" — they are correctly scoped today and this task does not change what they measure. `public/skill.md` documents the standing-orders door, whose grammar is already correct. **If you believe either needs to move, STOP and report it as a finding** — that is a scoping decision above your firewall.

## Firewall

**Touch ONLY:** `src/sim/SeatOrders.ts` · `scripts/agent-seat.test.mjs`.

**NO changes to:** `src/agent/StandingOrders.ts` — **it is the REFERENCE; you read it and copy its ruling, you do not move it** · `src/sim/SeatedLockstepSim.ts` (the consumer — if the action shape genuinely cannot carry the facing without editing it, STOP and report the file:line) · `src/mp/LockstepClient.ts` (the human path is the reference for the whole law) · `public/skill.md` · `scripts/same-game-audit.mjs` · `scripts/same-game-audit.test.mjs` · `scripts/skillmd-guard.test.mjs` · `scripts/gr-sim.test.mjs` pins (a moved hash is a FINDING, never a re-pin — F-1441-3) · `e2e/**` · `specs/**`, `tasks/**`, `reviews/**`, `STATUS.md`, `tasks/BACKLOG.md`, `tasks/goals.json` (the fire owns those).

🔓 **FIREWALL LIFT:** if the facing cannot reach the sim without editing a file not listed above, **STOP and report the file:line** rather than reaching into it. ⓘ This clause is not boilerplate — it is why this task exists: AP-16-5's runner hit exactly such a wall, obeyed exactly this clause, and naming the site is what produced this rung. Naming the right site is worth more than a guessed edit.

**If a new script you add matches `(guard|assert|check|audit|contract|ratchet)`, root it:** name the battery that calls it or add a grandfather reason to `scripts/gate-caller-baseline.json`, and run `node scripts/gate-caller-audit.mjs --include-untracked` before you finish (F-1576-1 — the runner commits last, so its own battery cannot see the file it just wrote).

## Self-check (evidence, not vibes)

- `npx tsc --noEmit` clean · `npm run build` green.
- `npm run test:node-guards` — **run it ALONE** (F-1460-1: this diff touches `src/sim/`; the battery is ~3–7 minutes and overlapping it with a second battery contaminates both). Report tests/pass/fail/skip. **Zero `gr-sim` hash drift is load-bearing** — the seat and the contract sim share a tree, and a moved pin means you changed behaviour you did not mean to.
- `node --test scripts/agent-seat.test.mjs` green, and **report the test count before and after** your addition.
- **A red-then-green teeth proof for the rejection ruling (scope 3):** show `7` and `'north'` each producing the `INVALID_ARGS` schema error, and a valid `0..3` passing. A guard that has never been observed failing is not yet evidence.
- **The omission proof (scope 4), stated as a number not a vibe:** an order with no `rotationSteps` must produce the identical `place_build` action it produces today, facing `0`.
- Adjacent, unmodified-green, named not implied: `node --test scripts/same-game-audit.test.mjs` (its counts must NOT move — this task does not change what the audit measures; if a count moves, that is a FINDING, and STOP) and `npx playwright test e2e/ap16-5-rotation-parity.spec.ts --workers=1` both projects.
- Zero console/page errors — this task opens no page; **state that explicitly** rather than implying it.
- No screenshots (nothing renders); say so rather than leaving the line blank.

**If you find yourself about to exit without changes, WRITE WHY into your report first** — a silent no-op wastes a queue slot and a gate.

End: **READY-FOR-GATES** + report: (a) the execution site you changed (`file:line`) · (b) the before/after `agent-seat.test.mjs` test counts · (c) your teeth-proof output for `7` and `'north'` · (d) whether any `gr-sim` pin or `same-game-audit` count moved (either one = STOP and report) · (e) whether you agree that the seat should reject rather than clamp, given it is the same ruling the standing-orders door already made · and (f) anything you had to touch outside the Touch-ONLY list (which should be nothing — STOP instead).
