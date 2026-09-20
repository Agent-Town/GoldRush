# Task ap16-5: ROTATION PARITY — the rider may turn what it builds (LANE-A, commit prefix "feat:")

**FIRE-AUTHORED s1643 (attended review welcome).**

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-a`.

READ FIRST: `AGENTS.md`; `specs/agent-play/ap-16-same-game-law.md` (the law + **the AP-16-5 slice bullet — this task IS that bullet**); `reviews/ap16-4-same-game-admission.md` (the slice that just merged in front of you: how a derivation replaced a literal, and the shape of the additive-hash proof you must repeat); `src/mp/LockstepClient.ts` (the HUMAN `place_build` action — **this is the reference you mirror, and you do not move it**).

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/a main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. **EVIDENCE-ARTIFACT EXCEPTION (F-1266-1): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, and any `.png` — are NEVER "work" and NEVER a STOP, whether uncommitted dirt or the whole content of an ahead commit. Discard them and PROCEED, listing what you discarded.** Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything. **THEN A CLEANLINESS LINE: `git -C worktrees/lane-a status --short` → must be clean, with the FACTORY-CHURN EXCEPTION — always expected, never a STOP; list them and proceed (F-1407-1): (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*` and any `.png`. What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.**

**STEP 1 (unconditional, F-1465-2): refresh the lane onto current `origin/main` before reading any source.** Your predecessor `ap16-4` merged as `effe1057` and **this task depends on it**. Then verify the evidence is present:

```
git log --oneline | grep -q 'ap16-4' || echo "MISSING"
grep -c "if (!exactKeys(value, \['verb', 'what', 'where', 'when'\])) return schemaError(index, 'BUILD');" src/agent/StandingOrders.ts   # expect 1
grep -c 'const rotationSteps = Number.isInteger(value.rotationSteps) ? ((Number(value.rotationSteps) % 4) + 4) % 4 : 0;' src/mp/LockstepClient.ts   # expect 1
grep -c 'function standingOrderIdentity(order: StandingOrder): string {' src/agent/StandingOrders.ts   # expect 1
```

If any grep returns 0, **STOP and report "lane is stale or the cited code moved"** — do NOT improvise a replacement anchor.

---

## Why (spec slice + source-verified evidence, 2026-08-11)

`specs/agent-play/ap-16-same-game-law.md:34`, verbatim: **"AP-16-5 (rotation parity): `BUILD` gains optional `rotationSteps` (0..3, default 0) mirroring the human `place_build` tape field (audit class 7). Additive — default preserves every existing hash; assert that in the battery."**

The same-game law's rule is that both species play the same game. A human placing a building **chooses its facing**; the rider cannot, so a rider's palisade or turret can only ever land in one orientation. That is a real capability gap, not a cosmetic one, and it is audit class 7.

The human side already exists and is **the reference implementation you mirror** (✓ source-verified s1643):

```ts
| { type: 'place_build'; id: string; position: LockstepPoint; rotationSteps: number }   // LockstepClient.ts:12
const rotationSteps = Number.isInteger(value.rotationSteps) ? ((Number(value.rotationSteps) % 4) + 4) % 4 : 0;   // LockstepClient.ts:1048
```

The agent side has no such field: `validateOrder` pins BUILD to exactly four keys (`StandingOrders.ts:410`), so **today a rider that sends `rotationSteps` gets a schema error**, not a rotated building.

⚠️ **TWO NON-OBVIOUS HAZARDS, NAMED IN ADVANCE. Both are the reason this "small additive slice" is not a one-line change.**

**(1) THE IDENTITY COLLISION.** `standingOrderIdentity()` (`StandingOrders.ts:625-627`) builds a BUILD order's identity from `[verb, what, where.x, where.z, ...when]` — **rotation is not in it.** If you add the field without extending the identity, two BUILD orders that differ ONLY in facing become **the same order** to every dedupe/receipt path that keys on identity. That is a silent correctness bug that no "does it rotate?" test would catch. **Extending the identity is mandatory and carries its own test.**

**(2) VALIDATE vs NORMALIZE — THE HOUSE RULING, STATED SO YOU DO NOT HAVE TO GUESS.** The human path *normalizes* (`((n % 4) + 4) % 4`, non-integer → `0`) because it deserializes its own recorder's output. The agent grammar is a **validator**: `isBuildableId`, `validPos` and `finiteInRange` all REJECT bad input with `schemaError` rather than silently repairing it. ➡️ **RULING: the agent grammar REJECTS.** A `rotationSteps` that is present but not an integer in `0..3` is a `schemaError`, exactly like a bad `what` or `where`. **Omitted is the only default, and it means 0.** Rationale: silently repairing a rider's malformed order teaches the rider nothing and hides its bug, which is the opposite of what a door owes a visitor (Mistake #14, reject-don't-stretch). **The EXECUTION you emit must still be byte-identical to what the human path would produce for the same facing** — mirror the shape, not the leniency. **If you believe this ruling is wrong, implement it as written and say so in your report; do not silently choose the other one.**

## Scope (numbered, each testable)

1. **Add `rotationSteps?: 0 | 1 | 2 | 3` to the `BUILD` standing order type** (`StandingOrders.ts:11` region). Optional — every existing order literal must still typecheck untouched.
2. **Teach `validateOrder` the optional key** at the cited `exactKeys` line: BUILD accepts `['verb','what','where','when']` **or** those plus `'rotationSteps'`, and rejects a present-but-invalid value per the ruling above (non-integer, negative, or > 3 → `schemaError(index, 'BUILD')`). Do not loosen any other verb.
3. **Extend `standingOrderIdentity()` for BUILD** so facing is part of identity (hazard 1). **Omitting the field must produce the IDENTICAL identity string it produces today** — an order with no rotation is not a new order. Prove that with an assertion, because it is the hinge of the additive claim.
4. **Execute the rotation**: find the site that turns a BUILD order into the `place_build` lockstep action (start from `StandingOrders.ts:484`'s `'place_building'` mapping and the `HeadlessContractSim` build path) and pass the facing through. **Cite the file:line you changed in your report.** A rotated order must produce a `place_build` action whose `rotationSteps` equals the requested facing, and an un-rotated one must produce exactly what it produces today.
5. **Grammar surface**: update `public/skill.md`'s standing-orders grammar **inside its guarded fence only**, and keep `scripts/skillmd-guard.test.mjs`'s `skill.md grammar matches every StandingOrder source form` test green. That guard is source-locked and was re-aimed one slice ago — **if it throws, read `reviews/ap16-4-same-game-admission.md` before touching it, and never "fix" it by weakening the assertion.**
6. **Audit class 7**: `scripts/same-game-audit.mjs` currently counts rotation as a human-only capability. Move it to `equal` **only if your implementation actually earns it**, regenerate `docs/bench/same-game-audit.md`, and report the three-way counts before and after. Adjust `scripts/same-game-audit.test.mjs` only where item 6 moves a count it pins.
7. **A new e2e** at `e2e/ap16-5-rotation-parity.spec.ts`: a rider BUILD order with each of the four facings places a building at that facing, and an order with the field omitted is **indistinguishable from today's behaviour**. Desktop + 390px.
8. **THE ADDITIVE PROOF — the load-bearing number (same discipline as ap16-4 scope 8).** The spec claims default preserves every existing hash. **Verify that claim, do not restate it:** `npm run test:node-guards` must show **zero `gr-sim` hash drift**. **If any pinned outcome moves, STOP and report it** — that means an omitted field changed an existing run, which contradicts the slice's own premise. **Re-pinning a moved hash to make a red go away is forbidden (F-1441-3); a moved hash is a FINDING.**

If you find yourself about to exit without changes, **WRITE WHY into your report first** — a silent no-op wastes a queue slot and a gate.

## Firewall

**Touch ONLY:** `src/agent/StandingOrders.ts` · `src/sim/HeadlessContractSim.ts` (the build-execution site only) · `public/skill.md` (**inside the grammar fence only**) · `scripts/skillmd-guard.test.mjs` (only if item 5 requires it) · `scripts/same-game-audit.mjs` · `scripts/same-game-audit.test.mjs` (only where item 6 moves a pinned count) · `docs/bench/same-game-audit.md` (regenerated) · `e2e/ap16-5-rotation-parity.spec.ts` (new).

**NO changes to:** `src/mp/LockstepClient.ts` — **the human `place_build` shape is the REFERENCE; you read it, you do not move it.** Changing the human side to meet the agent side would invert the entire same-game law · `assets/contracts/**` (the bundles are DATA) · `src/game/Game.ts` · `src/playbook/**` · `functions/**` · `scripts/gr-sim.test.mjs` pins (scope 8 — a moved hash is a FINDING, never a re-pin) · `CONTRACT_ADMISSION_EXEMPTIONS` or `SUPPORTED_CONTRACTS` (ap16-4's surface, freshly merged — not yours) · the AP-16-6 verbs (`TOGGLE_WEAPON`, `RESEARCH_PICK`, `SECURE_CHOICE`, `DEATH_ACTION`, `CONTEXT_ACTION`) · `specs/**`, `tasks/**`, `STATUS.md`, `tasks/BACKLOG.md`, `tasks/goals.json` (the fire owns those).

🔓 **FIREWALL LIFT:** if item 4's execution site turns out to live in a file not listed above, **STOP and report the file:line** rather than reaching into it. Naming the right site is worth more than a guessed edit.

**If a new script you add matches `(guard|assert|check|audit|contract|ratchet)`, root it:** name the battery that calls it or add a grandfather reason to `scripts/gate-caller-baseline.json`, and run `node scripts/gate-caller-audit.mjs --include-untracked` before you finish (F-1576-1 — the runner commits last, so its own battery cannot see the file it just wrote).

## Self-check (evidence, not vibes)

- `npx tsc --noEmit` clean · `npm run build` green.
- `npm run test:node-guards` — **run it ALONE** (F-1460-1: this diff touches `src/sim/` and `src/agent/`; the battery is ~3 minutes and overlapping it with a second battery contaminates both). Report tests/pass/fail/skip. **Zero `gr-sim` hash drift is the load-bearing number** (scope 8).
- `e2e/ap16-5-rotation-parity.spec.ts` green **desktop + 390px**, `--workers=1`.
- Adjacent suites unmodified-green both projects, `--workers=1`, named: `e2e/ap-standing-orders.spec.ts`, `e2e/skillmd-door.spec.ts`, `e2e/ap16-4-contract-admission.spec.ts`.
  ⓘ **`e2e/front-door-parity.spec.ts` is a KNOWN RED (0/4) — F-1643-1, proven pre-existing by a main-side control at the ap16-4 drain. Do NOT repair it and do NOT count it against you; report it unchanged if you run it.**
- Plain boot probe (no `?debug`): zero console/page errors, desktop + 390px.
- **The identity assertion from scope 3** — omitted-field identity string is byte-identical to today's.
- **A red-then-green teeth proof for the rejection ruling** (scope 2): feed `rotationSteps: 7` and `rotationSteps: 'north'`, watch each produce a `schemaError`, and show a valid `0..3` passing.
- The three-way audit counts from scope 6, before and after.

End: **READY-FOR-GATES** + report: the execution site you changed (`file:line`) · the before/after three-way counts · whether any `gr-sim` pin moved (and if so, STOP) · the identity-preservation evidence · whether you agree with the VALIDATE-vs-NORMALIZE ruling · and anything you had to touch outside the Touch-ONLY list (which should be nothing — STOP instead).
