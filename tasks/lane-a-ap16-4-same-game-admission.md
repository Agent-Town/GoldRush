# Task ap16-4: SAME-GAME ADMISSION — the door admits what the browser offers, and every refusal becomes a CITED EXEMPTION (LANE-A, commit prefix "feat:")

**FIRE-AUTHORED s1642 (attended review welcome).**

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-a`.

READ FIRST: `AGENTS.md`; `specs/agent-play/ap-16-same-game-law.md` (the law + the AP-16-4 slice bullet — this task IS that bullet); `reviews/f1636-1-same-game-audit-independence.md` (why the audit must MEASURE both sides, never assert one); `docs/bench/same-game-audit.md` (the generated report you will change the shape of).

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/a main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. **EVIDENCE-ARTIFACT EXCEPTION (F-1266-1, s1266): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, and any `.png` screenshot — are NEVER "work" and NEVER a STOP, whether they sit as uncommitted dirt or as the entire content of an ahead commit. Screenshots are never byte-identity gated, so their bytes differ from main forever. Discard them (`git checkout -- <paths>` / reset) and PROCEED, listing what you discarded.** Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything. **THEN A CLEANLINESS LINE: `git -C worktrees/lane-a status --short` → must be clean, with the FACTORY-CHURN EXCEPTION — always expected, never a STOP; list them and proceed (F-1407-1): (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*` and any `.png`. What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.**

**STEP 1 (unconditional, F-1465-2): refresh the lane onto current `origin/main` before reading any source.** This lane was 48 commits behind at authoring time. Then verify the evidence commit is present:

```
git log --oneline | grep -q 'ap16-2b' || echo "MISSING"
grep -c 'direction(true, agentCanEnter),' scripts/same-game-audit.mjs      # expect 1
grep -c "fallbackReason = 'unavailable-contract';" src/meta/ContractFamilies.ts  # expect 1
```

If either grep returns 0, **STOP and report "lane is stale or the cited code moved"** — do NOT improvise a replacement anchor.

---

## Why (spec slice + measured evidence, 2026-08-10)

The owner's law (`specs/agent-play/ap-16-same-game-law.md`, ratified 2026-08-10) rule 1: *"a contract's manifest is THE offer, for both species. The door accepts exactly what the manifest advertises."* Class 5 of the AP-16-0 audit is the widest surviving breach: **30 of 42 contracts launch nowhere near the headless door.** After F-1636-1 restored an honest buildable measurement, those 30 became **the SOLE cause of every remaining buildable divergence** (360 agent-lacks = 30 unenterable × 12 buildables).

**But the "30" is itself half wrong, and that is the load-bearing discovery of this task (F-1642-1, measured s1642).** The audit's human side is a **hardcoded constant**, not a measurement:

```js
direction(true, agentCanEnter),        // scripts/same-game-audit.mjs
```

That literal `true` asserts *"browser can launch the contract"* for all 42 without ever asking the browser. It is the same tautology shape F-1636-1 cured one class over — one side of the comparison is a constant.

✓ **MEASURED s1642 against the real browser predicate.** `src/meta/ContractFamilies.ts` refuses to open a contract whose harvest anchors are empty, and says so to the player:

```
fallbackReason = 'unavailable-contract';
```

…with the geography line *"<name> is not ready for a direct claim; The Claim opened instead."* **15 of the 42 contracts carry `"harvestAnchors": []` in their bundle**, so the browser itself will not open them. The spec's own law says such a contract is **outside the same-game universe** (*"a contract the browser does not offer is outside the same-game universe"*).

**The 30 therefore split exactly 15 / 15:**

| bucket | n | contracts |
|---|---|---|
| **Outside the universe** — browser refuses too, `harvestAnchors: []`. NOT a debt. | 15 | `e10-ember-shore` `e10-archive-world` `e10-river` `e5-regatta` `e5-flotilla` `e6-half-life-hollow` `e6-picnic` `e7-echo-canyon` `e7-dead-band` `e7-relay-rush` `e8-far-side` `e8-low-orbit` `e9-seed-run` `e9-devils-alley` `e9-old-canal` |
| **Genuine admission candidates** — browser offers, door refuses. | 15 | `e1-drill-yard` `e10-last-claim` `e3-fairground` `e4-dust-flats` `e4-long-road` `e4-gusher-county` `e4-boneyard` `e5-deepwater-claim` `e5-stillwater` `e6-glow-mesa` `e6-showroom` `e7-relay-valley` `e8-mare-claim` `e8-eclipse` `e9-dome-basin` |

And **0** contracts are admitted by the door while refused by the browser — there is no inverse breach to fix.

Today's admitted 12 = the **9** ids in the `SUPPORTED_CONTRACTS` literal + the **3** escort-mode railcars (`e2-hill-mine`, `e2-trestle`, `e2-incline`) which enter through `boot.mode` under the existing `!SUPPORTED_CONTRACTS.has(id) && !mode` predicate. That arithmetic closes and you should reproduce it.

**Five of the 15 candidates are ALREADY-RULED refusals and MUST NOT be admitted by this task** (an exemption is a debt, not a policy — but a *ruled* exemption is also not yours to overturn):

- `e5-deepwater-claim`, `e5-stillwater`, `e6-glow-mesa`, `e6-showroom` — admission was **attempted and MEASURED** and the measurement refused it; see the comment already in `HeadlessContractSim.ts` and `reviews/milk-twin-sockets.md`.
- `e3-fairground` — **OWNER DESIGN FORK, F-1475-1**, still on the owner's desk; `e3-fairground-socket` is attended-gated. Do not admit it, do not socket it, do not re-litigate it.

That leaves **10 contracts to actually attempt**: `e1-drill-yard` `e10-last-claim` `e4-dust-flats` `e4-long-road` `e4-gusher-county` `e4-boneyard` `e7-relay-valley` `e8-mare-claim` `e8-eclipse` `e9-dome-basin`.

⚠️ **A TRAP IS LAID FOR YOU AND IT IS NAMED IN ADVANCE (the F-1638-3 shape, which cost a previous slice a whole run).** `scripts/skillmd-guard.test.mjs` reads the door list by **regexing a source literal**:

```
SUPPORTED_CONTRACTS set literal must exist in HeadlessContractSim.ts
```

Its regex is `/const SUPPORTED_CONTRACTS = new Set\(\[([\s\S]*?)\]\);/` and it then scrapes single-quoted ids from **inside** that literal. **The moment you replace the literal with a derivation, that guard THROWS** — and it will look exactly like you broke it. You did not; it is parsing source text that no longer exists. Scope item 5 re-aims it at the derived value. **Do not "fix" this by keeping a hand-maintained literal, and do not delete the guard.**

---

## Scope

1. **Make the reachability row a MEASUREMENT on both sides.** In `scripts/same-game-audit.mjs`, replace the hardcoded `true` in `direction(true, agentCanEnter),` with a real browser-availability predicate derived from the browser's own rule — a contract is browser-offered iff it is in the registry the browser walks AND is not refused by the `unavailable-contract` branch (empty `harvestAnchors`). Read the rule from `ContractFamilies.ts` source the same way the harness already reads other predicates; do **not** re-implement it from memory, and do **not** hardcode the 15 ids from the table above — that table is the expected OUTPUT, and if your measurement disagrees with it, **report the disagreement rather than tuning to match it**.
2. **Add a third row state so "outside the universe" is visible, not silently dropped.** A contract neither species can enter is **not** parity and **not** a divergence — emit it with a direction that plainly says so (e.g. `not-offered`) and evidence naming the `unavailable-contract` branch. The generated `docs/bench/same-game-audit.md` summary must state all three counts. **Regenerate the report** (`node scripts/same-game-audit.mjs`) and commit it.
3. **Introduce a single CITED EXEMPTION table** as the one source of truth for every non-admitted, browser-offered contract. Each entry carries: the contract id, a one-line reason, and a **citation** — a `file:line`-or-ruling reference (`F-E2S-3`, `F-1475-1`, `reviews/milk-twin-sockets.md`, or the file:line of the missing system). Seed it with the five ruled refusals above plus whatever item 4 fails. **An exemption with no citation is not allowed to compile past review** — if you cannot cite it, that is a finding to report, not a blank to fill.
4. **Attempt admission for the 10 candidates, mechanically, and let the result decide.** Write a measurement pass (a script or test harness, your call) that boots `HeadlessContractSim` for each of the 10 with the support gate bypassed for measurement only, runs it idle to a terminal or a bounded step budget, and records: booted? first view emitted? reached terminal? threw — and if so, the error and its `file:line`. **Contracts that pass get ADMITTED. Contracts that fail get an EXEMPTION citing the exact failure site.** 🚫 **Do NOT fix any era socket, do NOT add a missing system, do NOT make a failing contract pass.** Exemption-on-failure is the intended, cheap outcome; building a socket is a different slice and is out of scope. Record the pass/fail table in your report.
5. **Derive `SUPPORTED_CONTRACTS` from the registry minus the exemption table**, replacing the hand-maintained literal, and **re-aim `scripts/skillmd-guard.test.mjs`'s door-contracts test at the DERIVED value** (evaluate the module rather than regex its source — the harness in `same-game-audit.mjs` already shows how to load real values). Preserve the existing test title `skill.md door-contracts match SUPPORTED_CONTRACTS in HeadlessContractSim`. **PROVE THE RE-AIMED GUARD BITES by manufacturing a defect** (drop one admitted id from the derived set, or add a phantom id to the fence; watch it go RED, then revert byte-identical and watch it go GREEN). A guard installed to replace a source-regex is exactly how a tautology gets born — the red-then-green proof is mandatory and goes in your report.
6. **Update the guarded `public/skill.md` door-contracts fence** to the new derived list, editing **inside** the `<!-- skillmd-guard:door-contracts:start -->` / `:end` markers only, preserving the block's existing sorted order and formatting.
7. **A per-admitted-contract boot probe e2e** at `e2e/ap16-4-contract-admission.spec.ts`: for every admitted contract, assert the door accepts it and the first view emits (cheap smoke — no long runs, no outcome pinning). Assert the **count** dynamically from the derived set, never a hardcoded number, so the spec cannot rot into a tautology. It must pass desktop **and** 390px mobile.
8. **The era question — REPORT, do not act.** AP-16-4 is an ADDITIVE-capability slice: the spec states it lands **inside Season 2** without re-stamping eras, because admitting new contracts changes no existing seed's event log. **Verify that claim rather than restating it**: confirm `test:node-guards` shows **zero `gr-sim` hash drift** on the existing pinned seeds. If any pinned outcome moves, **STOP and report it** — that would mean admission changed an existing run, which contradicts the spec's own premise and is an owner-facing fact, not something to re-pin around. **Re-pinning a moved hash to make a red go away is forbidden (F-1441-3); a moved hash is a FINDING.**

If you find yourself about to exit without changes, **WRITE WHY into your report first** — a silent no-op wastes a queue slot and a gate.

## Firewall

**Touch ONLY:** `src/sim/HeadlessContractSim.ts` (the `SUPPORTED_CONTRACTS` region + its constructor gate + the exemption table if you site it here) · `scripts/same-game-audit.mjs` · `scripts/same-game-audit.test.mjs` (only if item 1/2 moves a count it pins) · `scripts/skillmd-guard.test.mjs` (the door-contracts test only) · `public/skill.md` (**inside the `door-contracts` fence only**) · `docs/bench/same-game-audit.md` (regenerated) · `e2e/ap16-4-contract-admission.spec.ts` (new) · any new measurement script you add under `scripts/`.

**NO changes to:** `assets/contracts/**` — **the contract bundles are DATA and this task must not edit a single one**; admission is a door question, and editing a manifest to make a contract admissible is exactly the "stretch the vocabulary" failure (Mistake #14) · `src/meta/ContractFamilies.ts` — you READ the browser's rule, you do not move it · any era socket (`DeepwaterSocket`, `AtomicSocket`, fairground) or the systems under `src/systems/**` · `src/agent/StandingOrders.ts` (the grammar is AP-16-5/6's surface, not yours) · `src/game/Game.ts` · `functions/**` · existing e2e assertions in any spec other than the one you create · `scripts/gr-sim.test.mjs` pins (see scope 8 — a moved hash is a FINDING, never a re-pin) · `specs/**`, `tasks/**`, `STATUS.md`, `tasks/BACKLOG.md`, `tasks/goals.json` (the fire owns those).

🔓 **FIREWALL LIFT:** if item 5's re-aim requires a tiny exported accessor on `HeadlessContractSim.ts` to expose the derived set, that is pre-authorized — it is inside the Touch-ONLY file. If it requires touching any file **not** listed above, **STOP and report** rather than reaching.

**If a new script you add matches `(guard|assert|check|audit|contract|ratchet)`, root it:** either name the battery that calls it or add a grandfather reason to `scripts/gate-caller-baseline.json`, and run `node scripts/gate-caller-audit.mjs --include-untracked` before you finish (F-1576-1 — the runner commits last, so its own battery cannot see the file it just wrote).

## Self-check (evidence, not vibes)

- `npx tsc --noEmit` clean · `npm run build` green.
- `npm run test:node-guards` — **run it ALONE** (F-1460-1: this diff touches `src/sim/`; the battery is ~3 minutes and overlapping it with a second battery contaminates both). Report tests/pass/fail/skip. **Zero `gr-sim` hash drift** is the load-bearing number (scope 8).
- `e2e/ap16-4-contract-admission.spec.ts` green **desktop + 390px mobile**, `--workers=1`.
- Adjacent suites unmodified-green both projects, `--workers=1`, named: `e2e/skillmd-door.spec.ts`, `e2e/ap-standing-orders.spec.ts`, `e2e/front-door-parity.spec.ts`, `e2e/er01-e2-census.spec.ts`, `e2e/er01-e4-census.spec.ts` (**these last two are census specs that assert which contracts the door refuses — if admission changes their subjects, adapt them and SAY SO, with the before/after in your report**).
- Plain boot probe (no `?debug`): zero console/page errors, desktop + 390px.
- The **red-then-green teeth proof** for the re-aimed skillmd guard (scope 5), with the exact assertion text of the red.
- The **10-candidate pass/fail table** from scope 4, each failure carrying its `file:line`.
- The three-way row counts from scope 2 (equal / divergence / not-offered), before and after.

End: **READY-FOR-GATES** + report: the three-way counts · the 10-candidate admission table with cited failure sites · the final derived door list · the teeth-proof red text · whether any `gr-sim` pin moved (and if so, STOP) · anything you had to adapt in the two census specs · and **whether your measured 15/15 split matches the table in Why, or disagrees with it**.
