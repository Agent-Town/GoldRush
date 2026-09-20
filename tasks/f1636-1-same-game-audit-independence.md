# Task f1636-1: the same-game audit must MEASURE parity again, not assert it (LANE-A, commit prefix "fix:")

FIRE-AUTHORED (attended review welcome) — s1636, from the ap16-1 drain's own finding.

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-a.

READ FIRST: `AGENTS.md`; `reviews/ap16-1-buildable-parity.md` (the drain that raised this — §Findings F-1636-1 carries the reproduction); `scripts/same-game-audit.mjs` (the whole file, especially `advertisedBuildables`, `doorAccepts`, `browserAccepts`, `audit()`); `scripts/same-game-audit.test.mjs`; `src/agent/MechanicsManifest.ts:434` (`mechanicsBuildableIds` — the real shared source both engines now read); `src/game/Game.ts:5717` (`isBuildableEnabled`); `src/sim/HeadlessContractSim.ts` (the `offeredBuildables` predicate passed into `BuildSystem`); `specs/agent-play/ap-16-same-game-law.md`.

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via `git log`/`git diff`), it is a SAFE DUPE → `git checkout -B lane/a main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. EVIDENCE-ARTIFACT EXCEPTION (F-1266-1): changes confined to `artifacts/**`, `reviews/shots-*`, and any `.png` are NEVER "work" and NEVER a STOP — discard them and PROCEED, listing what you discarded. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything. THEN A CLEANLINESS LINE: `git -C worktrees/lane-a status --short` → must be clean, with the FACTORY-CHURN EXCEPTION (F-1407-1), always expected, never a STOP: (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*`, any `.png`. What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.

ⓘ ap16-1 is MERGED to main at `760990fda5d91559202dbf5a3020de90f694aa7c`, so lane/a's ahead commit is a SAFE DUPE by construction. Expect the reset arm.

## Why (drain finding F-1636-1, s1636 — reproduced, not argued)

ap16-1 legitimately unified the two engines onto one buildable rulebook. But in the same commit it rewrote the AUDIT so that both sides of every buildable row are computed from the **same** helper:

```js
function doorAccepts(contract, id)    { return advertisedBuildables(contract).has(id); }
function browserAccepts(contract, id) { return advertisedBuildables(contract).has(id); }
```

Every buildable row now compares a value to itself, so `equal` is structurally guaranteed. The drain proved this by manufacturing the defect: forcing the real browser predicate to `return false` — the browser offers **nothing** — and regenerating the audit still yields:

```
BASELINE                           -> buildable rows 840, diverging 0
BROWSER OFFERS NOTHING (real code) -> buildable rows 840, diverging 0
```

The generator consults the real engines only through `line()`, for evidence *citations*; never for verdicts. So `docs/bench/same-game-audit.md`'s headline `agent-exceeds: 0` is a tautology, and the guard that ap16-1 installed —

```js
assert.equal(rows.filter((r) => r.surface === 'buildable' && r.direction !== 'equal').length, 0);
```

— **cannot fail**. It replaced a real assertion (`'wide BUILD door must remain visible'`). A green that cannot go red is worse than no test.

Second, independent overstatement in the same rows: `const agent = agentCanEnter && predicate` became `const agent = predicate`, so buildable rows claim parity even on contracts the headless sim **cannot enter** — while the `verb` rows of the same document still report `agent-lacks: 324` for exactly that gap. The document contradicts itself.

**This is not a request to undo ap16-1.** The behavioural unification is correct and stays. What must come back is the audit's ability to *detect* a future divergence.

## Scope

1. **One side of each buildable row must come from the real browser path, the other from the real headless path** — no third hand-written copy. `mechanicsBuildableIds` (`src/agent/MechanicsManifest.ts:434`) is the shared source both engines read; the audit must reach the engines' *actual* use of it rather than restating its rule. State in your report exactly how you bridged `.ts` → the `.mjs` generator, and why that bridge cannot silently drift (options to weigh and choose between, with reasons: consume the `e2e/fixtures/e1-mechanics-manifests.json` fixture ap16-1 added; compile/import the TS; or derive one side from a generated artifact — pick one and defend it).
2. **Restore reachability to the row.** `agentCanEnter` must once again gate the agent side, so a contract the headless sim cannot enter never reports buildable parity. Say what the counts do.
3. **The guard must be able to go RED — and you must PROVE it does.** Replace the vacuous assertion with one that fails when the two engines genuinely disagree. Then *manufacture* the disagreement exactly as the drain did (temporarily force `isBuildableEnabled` to `return false`), show the guard RED, revert byte-identical, show it GREEN. Paste both arms into your report. A guard whose violation path you have not executed is not evidence (the s1299/s1300 standard).
4. **Regenerate `docs/bench/same-game-audit.md`** and report before/after counts per surface. If honest measurement re-opens buildable divergences, **that is a correct result, not a regression** — report the number, do not tune it toward zero. Reject-don't-stretch (Mistake #14).
5. **Do not touch the ability or choice rows.** They belong to ap16-3 (lane-c) and ap16-2 (lane-d), both of which have unmerged work in flight. If your change to the generator's structure would obviously help their rows too, SAY SO in the report and leave it — do not do it.

## Firewall

Touch ONLY: `scripts/same-game-audit.mjs`, `scripts/same-game-audit.test.mjs`, `docs/bench/same-game-audit.md` (regenerated), and — only if scope 1's chosen bridge requires it — a new small helper module you create for that purpose (name it in the report before writing it).

NO changes to: `src/game/Game.ts`, `src/sim/HeadlessContractSim.ts`, `src/agent/MechanicsManifest.ts` (the merged parity fix is CORRECT — the audit is what is broken); `src/agent/StandingOrders.ts`; ability/choice audit rows; ranking/API; other lanes' fresh work.

ⓘ **This master gives the generator a single named owner.** F-1636-2 recorded that all three ap16 masters wrote scope that needed `scripts/same-game-audit.mjs` while none listed it — which is what legitimately stopped lane-c's ap16-3. From here, that file is this task's.

If you find yourself about to exit without changes, WRITE WHY into your report first — a silent no-op wastes a queue slot and a gate.

## Self-check (evidence, not vibes)

`npx tsc --noEmit` + `npm run build` green. `npm run test:node-guards` green — it contains `same-game-audit.test.mjs`, so your new assertion runs there. Both arms of the scope-3 manufactured-defect proof pasted in. Adjacent: `task-025` + `m1-01` + `m2-01` unmodified-green both projects. Zero console/page errors, plain boot.

End: READY-FOR-GATES + report: the bridge you chose and why it cannot drift; the RED arm and the GREEN arm verbatim; before/after per-surface counts; whether honest measurement re-opened any buildable divergence and what it is.
