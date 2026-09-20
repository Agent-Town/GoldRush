# Task e10s-1b: land the Ember Shore's data WITH the schema that admits it — twist key, declared-inert registration, engine dependency, pins (lane-a, commit prefix "feat:")

**FIRE-AUTHORED (attended review welcome)** — s2123, as the named cure for the `gate-side` block on `e10s-1-ember-shore-data` (STOPPED s2122). Every file:line below was re-verified at source by the author on main at `f9a184e6d`, not inherited from the predecessor's report.

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-a`.

READ FIRST: `AGENTS.md`; `specs/agent-play/e10-ember-shore-preserve.md` (**your spec — §2 Laws and §3 defaults**); `tasks/done/stopped-s2122-schema-key-absent-20260821-095114-e10s-1-ember-shore-data.md` (the predecessor master — its data is your salvage source); `src/meta/ContractFamilies.ts` (the schema you are extending); `assets/contracts/epoch-10-deepsky/contracts.json`.

**REFRESH THIS LANE FIRST — IT IS 200 COMMITS BEHIND.** This is step ONE, before the pre-flight below and before `npm install`. The author verified at dispatch that `lane/a` is `ahead=0`, tracked-dirt 0, untracked 0 (`node scripts/lane-usable.mjs lane-a` → **USABLE**) — **there is nothing on this branch to lose**, so the reset is unconditionally safe here:

```
git checkout -B lane/a main && git clean -fd
```

**THEN THE DEPENDENCY GREP — IT IS A HARD STOP.** Run:
`grep -Fc "Declared-inert contract data must name its missing engine dependency." src/meta/ContractFamilies.ts`
Expect **exactly 1**. The author proved this count against `main` before writing it here (F-1425-2). If it is 0, the reset did not take — **STOP and report "lane lacks the current ContractFamilies"**; do not attempt the task from this file alone.

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/a main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. **EVIDENCE-ARTIFACT EXCEPTION (F-1266-1, s1266): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, and any `.png` screenshot — are NEVER "work" and NEVER a STOP, whether they sit as uncommitted dirt or as the entire content of an ahead commit. Screenshots are never byte-identity gated, so their bytes differ from main forever. Discard them (`git checkout -- <paths>` / reset) and PROCEED, listing what you discarded.** Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything. **THEN A CLEANLINESS LINE: `git -C worktrees/lane-a status --short` → must be clean, with the FACTORY-CHURN EXCEPTION — always expected, never a STOP; list them and proceed (F-1407-1): (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*` and any `.png`. What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.**

## Why (the predecessor's block, re-verified at source s2123)

**The predecessor was correct and is not being repeated.** `e10s-1` authored the Ember Shore data faithfully from spec §3 and then could not load it: the contract registry rejects `twist.emberShore` as an unknown field. It reported the RED honestly, touched no forbidden file, and its data survives on `lane/c` tip **`1a2b93969`** as salvage. Its goal leaf is `status:"blocked"`, `blockClass:"gate-side"` — a readiness hold no owner word lifts, liftable only by satisfying the condition.

**ROOT CAUSE IS THE MASTER, NOT THE RUN.** The s2121 master firewalled `src/**`, which is exactly where the twist allowlist lives, so the task could not satisfy its own acceptance condition by construction. **This master fixes that by landing the schema and the data together.**

**Verified at source on main `f9a184e6d` (author, s2123 — the predecessor's report named two blockers; there are SIX coupled changes, and four of them were undiscovered):**
1. `AUTHORED_TWIST_KEYS` at `src/meta/ContractFamilies.ts:1542-1547` holds 23 keys and contains **no `emberShore`**. Enforced at `:1654` via `addUnknownFieldReasons(twist, AUTHORED_TWIST_KEYS, 'twist', reasons)`.
2. `addUnknownFieldReasons` (`:1695`) iterates **top-level keys only** — it does not descend. So `twist.emberShore` produces exactly ONE `field_unknown` reason. ⓘ **The predecessor also reported "the negative `squallDecayPerSecond`" as a second rejection. That is NOT a separate blocker today** — no validator descends into an unknown key, and the author found no negative-value check for it. Treat it as scope item 6, not as a red.
3. **The house pattern for data declared ahead of its consumer is a TWO-step registration**, and the two freshest precedents merged today: `twist.scheduledRelocation` (A9) and `twist.persistentCanalChoices` (A10) each appear in **both** `AUTHORED_TWIST_KEYS` **and** `DECLARED_INERT_PATHS` (`:1568-1613`). Follow that pattern exactly — do NOT write a bespoke validator.
4. **The inert registration has a consequence the predecessor never reached:** `:1726-1733` — `const inert = DECLARED_INERT_PATHS.find(...)`, and if a contract declares an inert path with no non-empty `tileParams.engineDependencies`, it raises `engine_dependency_required`. **`e10-ember-shore` is the ONLY deepsky contract with `engineDependencies: undefined`** (the other three all declare one). So step 3 REQUIRES step 4, or you will trade one red for another.
5. `scripts/e3-mask-tables.test.mjs:399` pins `assert.deepEqual(emberShore.tileParams.harvestAnchors, []);` — the four authored anchors red it.
6. `e2e/er01-e10-census.spec.ts` pins `EXPECTED_DEPENDENCY['e10-ember-shore'] = undefined` — adding the engine dependency moves it.

**Sequencing/authorization.** `specs/agent-play/door-completion-sheet.md:3` records the owner's ratified ruling: ***"B1–B6 ALL BUILD (sequenced AFTER the A-wave — nothing deferred; deferral recommendations are OVERRULED)"***. The A-wave closed 2026-08-21. B5's prerequisite attended spec exists and is build-authorized under the NO-BLOCKER LAW.

## Scope

1. **Admit the twist key.** In `src/meta/ContractFamilies.ts`, add `'emberShore'` to `AUTHORED_TWIST_KEYS` (`:1542-1547`). Keep the existing formatting and trailing-comma style.

2. **Register it declared-inert.** Add `'twist.emberShore'` to `DECLARED_INERT_PATHS` (`:1568-1613`), beside the `twist.scheduledRelocation` / `twist.persistentCanalChoices` precedents. **No bespoke validator** — the consumer lands in E10S-3, and a validator now would pin numbers the consumer has not yet earned.

3. **Land the salvaged contract data.** The predecessor's contract hunk applies **cleanly** to current main — the author verified this with `git apply --check -3`. Apply the commit's OWN patch, never a whole-file checkout:
   ```
   git diff 1a2b93969^ 1a2b93969 -- assets/contracts/epoch-10-deepsky/contracts.json | git apply -3
   ```
   ⚠️ **Do NOT use `git checkout 1a2b93969 -- <file>`.** Main has moved since that commit; a whole-file checkout would silently revert A9/A10 work. This yields the four `harvestAnchors`, `twist.secureWave: 12`, the two-row roster, and `twist.emberShore`.

4. **Declare the engine dependency** (required by scope 2 — see Why §4). Add to `e10-ember-shore.tileParams.engineDependencies` a single entry mirroring its three siblings' shape exactly:
   `{ "dep": "ember-shore-preserve-consumers", "status": "missing", "description": "Needs the declared preserve warmth/stoke, squall scheduler, and secure-latch consumers; E10S-2 lands the scheduler and E10S-3 the preserve consumer." }`
   Then update `e2e/er01-e10-census.spec.ts` `EXPECTED_DEPENDENCY['e10-ember-shore']` from `undefined` to `'ember-shore-preserve-consumers'`. **If any OTHER census expectation for this contract also moves (`EXPECTED_RULES`, `EXPECTED_LOSS_STAKES`), report it — do not adjust it silently.**

5. **Bench seeds — author by hand, do NOT patch.** The author measured that the predecessor's `bench-seeds.json` hunk applies **with conflicts**: main added 8 lines of A9/A10 seeds in the same trailing region. Append this key after the existing last entry, matching the file's existing shape:
   ```json
   "e10-ember-shore": [
     "e10-ember-shore-01",
     "e10-ember-shore-02"
   ]
   ```

6. **Refresh the stale anchors pin.** In `scripts/e3-mask-tables.test.mjs:399`, replace `assert.deepEqual(emberShore.tileParams.harvestAnchors, []);` with the four authored anchors. **Assert the real values — never weaken the assertion to make it pass.**

7. **Normalise the decay sign (author's ruling, reversible).** The salvage carries `"squallDecayPerSecond": -4`, taken from the spec's prose "−4/s". The house convention for a `...PerSecond` rate is a **positive magnitude whose field NAME carries the direction** — precedent `attachDamagePerSecond: 6` (`assets/contracts/epoch-3-voltage/contracts.json:122`). A literal `-4` on a field named *Decay* means warmth would RISE if E10S-3 reads it as written. **Change it to `4`.** The field is declared-inert so nothing enforces this today; it is being settled now so E10S-3 inherits an unambiguous number. If you disagree after reading spec §3, leave `-4` and **report the reasoning** rather than silently choosing.

8. **RESOLVE-AND-REPORT (do NOT author).** `specs/agent-play/e10-archive-world-restoration.md` (B6) needs `twist.lightHold`, and `AUTHORED_TWIST_KEYS` holds no `lightHold` either — so E10A-1 very likely carries this identical blocker (s2122 explicitly RETRACTED an earlier "E10A-1 is clean" note; `tileParams.lightHoldSites` is a permitted TILE key and is **not** clearance for a twist key). **Read both and report in one paragraph** whether E10A-1 needs the same two-step registration and whether `e10-archive-world` already satisfies the engine-dependency rule. **Author nothing for it** — a second lane editing this same array would collide.

## Firewall

**TOUCH-ONLY:** `src/meta/ContractFamilies.ts` (**the two named lists ONLY** — `AUTHORED_TWIST_KEYS` and `DECLARED_INERT_PATHS`; no validator functions, no other list) · `assets/contracts/epoch-10-deepsky/contracts.json` (**the `e10-ember-shore` block ONLY**) · `assets/contracts/bench-seeds.json` · `scripts/e3-mask-tables.test.mjs` (**the Ember Shore anchors assertion ONLY**) · `e2e/er01-e10-census.spec.ts` (**the `e10-ember-shore` dependency expectation ONLY**) · regenerated floors/audit artifacts if and only if the gate requires them.

**NO — do not touch, for any reason:** any other contract block in any file (**`e10-last-claim` is ADMITTED — prove its floors and pins byte-unmoved**) · `e10-archive-world` and `e10-river` · any preserve/squall **consumer, scheduler, or secure latch** (those are E10S-2/E10S-3 — this slice declares, it does not enforce) · any other twist validator · `src/config/Balance.ts` (F-1741: no balance buffs, no minting) · the Quiet / boss tech · procgen v3 · `specs/**` · `STATUS.md` · `tasks/**` other than your own done-move · any other assertion in the two test files you are permitted to touch.

## Self-check before READY-FOR-GATES

- `npx tsc --noEmit` clean · `npm run build` green.
- **Contract loads on BOTH engines** — browser and headless; state how you proved each. This is the predecessor's exact failure point, so show it passing.
- **`npm run test:node-guards`** — required: your diff touches `src/**` (F-1460-1, cross-cutting sim reach). Expect `scripts/e3-mask-tables.test.mjs` and `scripts/bench-seeds.test.mjs` to exercise your change. ⓘ The battery is ~7 minutes serial and must be **run ALONE**; a known unrelated Moth Season red exists on clean main — fingerprint it against a clean-main control rather than assuming it is yours.
- **`e2e/er01-e10-census.spec.ts` green, desktop AND 390px mobile**, at `--workers=1`.
- **Floors regen `--check` clean.** Per the spec's gate: rows appear only with admission and **`0 secured:true`** for `e10-ember-shore`. **A secured row here means the map is claimable with no consumer built — report it as a STOP, do not adjust anything to hide it.**
- **`e10-last-claim` floors/pins BYTE-UNMOVED** — diff and state the result explicitly.
- Zero console/page errors in a plain boot (no `?debug`).

**NO-OP GUARD:** if you find yourself about to exit without changes, WRITE WHY into your report first — a silent no-op wastes a queue slot and a gate.

End: **READY-FOR-GATES** + report: which engines loaded the contract and how you proved it · the census expectations that moved · the decay-sign decision you took and why · your one-paragraph E10A-1 verdict (scope 8) · anything you were forbidden to fix but noticed.
