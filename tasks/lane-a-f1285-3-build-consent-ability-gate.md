CODEX: model=gpt-5.6-sol effort=high
# Task lane-a-f1285-3-build-consent-ability-gate: make revoking the place-building consent actually refuse a BUILD standing order (lane-a, commit prefix "fix:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-a`.
**FIRE-AUTHORED s1287 (attended review welcome).** One task, firewalled.
⚠️ **This is a consent-correctness fix, not a feature.** A checkbox the player unticks currently changes nothing for BUILD orders. You are closing exactly that gap — and you must not widen the permission model while you are in there.

READ FIRST: `AGENTS.md` · `tasks/BACKLOG.md` **F-1285-3** (the finding, item №2 — its evidence chain is the premise) · `reviews/ap-06b-adapter-reland-s1285-drain.md` (where the gap was first reported, by the runner that built the consent checkbox) · `src/agent/StandingOrders.ts` — **`permissionDenial()` and `requiredAbility()` are THE SUBJECT** · `src/agent/AgentConsent.ts` (the ability registry and `restoreFutureState` — READ ONLY, see the TRAP) · `e2e/ap-standing-orders.spec.ts` *"seeded standing orders obey priority, gates, legal actions, surprises, and the live rung"* and *"consent restores a save from before place-building existed"* — the two tests nearest this behaviour.

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/m3 main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. **EVIDENCE-ARTIFACT EXCEPTION (F-1266-1): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, and any `.png` — are NEVER "work" and NEVER a STOP. Discard them and PROCEED, listing what you discarded.**
⚠️ **Verify with the instrument, not by eyeball:** `node scripts/lane-freeze-classify.mjs lane/m3` and, for any BOTH-MOVED path, `node scripts/lane-absorbed-lines.mjs lane/m3 <path>`. BOTH-MOVED is a triage bucket, not a loss verdict. ⓘ s1287 archived the previous tip as `archive/lane-a-s1287-absorbed-tip` after measuring it **DUPLICATE 6/6, LOSS-FREE** — so a reset is expected to be safe here, but **measure it yourself, do not inherit that sentence.** Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.

## Why (F-1285-3 №2 — verified at source s1287, every line re-read, not grepped)

`AgentConsent.ts:16` registers a real, player-facing ability:

```ts
{ id: 'place_building', level: 3, label: 'Let the Prospector place buildings' },
```

The player can untick it. `permissionDenial()` (`StandingOrders.ts:399-414`) then runs three gates in
order: the rung ladder, the rung's granted/earned state, and finally the **ability** gate —

```ts
const ability = requiredAbility(order);
if (ability && state.consent?.abilities[ability]?.allowed === false) {
  return `${order.verb} requires the granted ${ability} ability.`;
}
```

➡️ **But `requiredAbility()` (`:416-420`) never returns `place_building`:**

```ts
function requiredAbility(order: StandingOrder): AgentAbility | null {
  if (order.verb === 'REPAIR_UNDER') return 'auto_repair';
  if (order.verb === 'HARVEST') return 'auto_pan';
  return null;                      // <-- BUILD lands here
}
```

`ability` is `null` for BUILD, so the third gate is skipped entirely and the order proceeds. **A player
who revokes "Let the Prospector place buildings" still gets buildings placed.** That the verb genuinely
belongs to this ability is not an inference — `StandingOrders.ts:193` executes a BUILD by calling
`this.surface.tools.place_building(order.what, order.where)`, the exact tool the ability names.

ⓘ **Why nobody noticed:** `requiredLevel('BUILD')` = **3** (`:345-349`) and `place_building` is declared
at **level 3**, so the *rung* gate already refuses BUILD below rung 3. The two gates coincide almost
everywhere. They diverge in exactly one state — **rung 3 granted, ability unticked** — which is the
only state the checkbox exists to express.

## Scope

0. **ABORT CHECK, FIRST — prove the defect is present before you repair it.** Write a scratch probe
   (under `logs/session-scratch/s1287-lane-a/`, **never** in the repo's test tree) that builds a
   consent state with rung 3 earned+granted and `abilities.place_building.allowed === false`, and calls
   `permissionDenial()` with a BUILD order. It must currently return **`null`** (i.e. allowed).
   **If it already returns a denial, STOP and report** — the premise is gone and this task is void.
   Record the same probe's answer for `REPAIR_UNDER` with `auto_repair` revoked as a **control**: that
   one must already deny. A fix with no working control is not a measurement.

1. **Map BUILD to its ability.** In `requiredAbility()`, return `'place_building'` for `order.verb === 'BUILD'`.
   Nothing else in that function changes. Do **not** touch `requiredLevel()` — the rung ladder is
   owner-ruled (BUILD = 3) and is not in question here.

2. **Re-run the scope-0 probe.** BUILD with the ability revoked must now return the denial string, and
   the message must read `BUILD requires the granted place_building ability.` — it is produced by the
   existing template, so if it reads anything else you have changed more than you were asked to.
   BUILD with the ability **granted** at rung 3 must still return `null`. Report all four cells
   (BUILD revoked / BUILD granted / REPAIR_UNDER revoked / REPAIR_UNDER granted).

3. **Add ONE e2e assertion** to `e2e/ap-standing-orders.spec.ts`, in the test
   *"seeded standing orders obey priority, gates, legal actions, surprises, and the live rung"* if it
   fits its existing seam, otherwise as a new focused `test()` in the same file: at rung 3 with
   `place_building` revoked, a submitted BUILD order is **refused**, and the refusal is visible the way
   the existing rung refusals are visible in that spec (follow the file's own idiom — do not invent a
   new assertion style). Keep it deterministic; no new timers.

4. **Report, do not fix, anything else you find.** F-1285-3 listed four gaps; you are closing №2 only.

## TRAP — read before you touch AgentConsent

🛑 **`AgentConsent.restoreFutureState()` validates a hand-written ability list, and `light_duty` is
deliberately excluded and defaulted (`AgentConsent.ts:32-33,56`).** A *new* required ability breaks
restore for every pre-existing suspended run. ✓ **You are not adding one** — `place_building` already
exists in the registry and in the restore shape — **but you must prove you did not disturb it** by
keeping the spec *"consent restores a save from before place-building existed"* green. That test exists
because this exact class of change broke restore once.

## Firewall

**TOUCH-ONLY:** `src/agent/StandingOrders.ts` (the `requiredAbility` function only) · `e2e/ap-standing-orders.spec.ts` · `logs/session-scratch/s1287-lane-a/**` · `reviews/f1285-3-build-consent-ability-gate.md`.
**NO:** `src/agent/AgentConsent.ts` — any line (read it, never edit it) · `requiredLevel()` — the rung ladder is owner-ruled · `src/agent/ToolSurface.ts` · `src/game/**` · any other spec file · the permission-level type or the ability registry.

## Self-check before you report

- `npx tsc --noEmit` clean · `npm run build` green.
- `npm run test:node-guards` — expect **rc=0**; `scripts/agent-rung-conformance.test.mjs` lives in this battery and guards the neighbouring rung logic.
- `npx playwright test e2e/ap-standing-orders.spec.ts --workers=1` — **both projects**, and name the pass count. ⚠️ **`--workers=1` is mandatory (§3.1): at default workers the fire shell manufactures drift reds, so a red measured any other way is not evidence.**
- Adjacent, derived by grep rather than assumed: `grep -rln "place_building\|permissionDenial\|requiredAbility\|standing" e2e/` — run what it names, at `--workers=1`, and report each result.
- `git diff main -- src/` must show **`src/agent/StandingOrders.ts` and nothing else**.

READY-FOR-GATES + report: the four probe cells from scopes 0 and 2 · the exact denial string · the new assertion and which test carries it · the restore test's result by name · both-project `--workers=1` output · the `git diff main -- src/` file list · **or an explicit STOP** if scope 0 came back already-denying.
