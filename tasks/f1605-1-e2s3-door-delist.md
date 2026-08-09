# Task f1605-1: de-list the three railcar contracts from the AP-07 door (LANE-B, commit prefix "fix:")

**FIRE-AUTHORED s1605 (attended review welcome).**

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-b`.

READ FIRST: `AGENTS.md`; the owner ruling authorising this work — in `tasks/BACKLOG.md`, **grep `F-E2S-3 RULED: de-list now, socket later`** (cited by CONTENT, not by line: a second rulings roundup landed while this master was being written and shifted every coordinate by one) — and the `F-E2S-3` row itself (grep `PROVEN BY THE SOL CRACK EXPERIMENT`); `bench/gauntlet/heat2/sol/crack-report.md` (the impossibility proof this ruling acts on); the `F-DOOR-4` row (grep `THE BENCH ADVERTISED FIVE CONTRACTS THE DOOR REFUSES`) — that is the de-list pattern you are copying.

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/b main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. **EVIDENCE-ARTIFACT EXCEPTION (F-1266-1, s1266): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, and any `.png` screenshot — are NEVER "work" and NEVER a STOP, whether they sit as uncommitted dirt or as the entire content of an ahead commit. Screenshots are never byte-identity gated, so their bytes differ from main forever. Discard them (`git checkout -- <paths>` / reset) and PROCEED, listing what you discarded.** Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything. **THEN A CLEANLINESS LINE: `git -C worktrees/lane-b status --short` → must be clean, with the FACTORY-CHURN EXCEPTION — always expected, never a STOP; list them and proceed (F-1407-1): (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*` and any `.png`. What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.**

**LANE STALENESS — READ THIS BEFORE THE CITATION CHECK BELOW.** At authoring time (s1605) `node scripts/lane-usable.mjs lane-b` measured `lane/b` **ahead=0, tracked-dirt=0, untracked=0, behind=93** — i.e. the lane holds **nothing** main has not absorbed, and the reset in the pre-flight above is therefore verified loss-free, not merely hoped to be. **Because `ahead=0` makes the pre-flight's "for each ahead commit" clause vacuous, perform the reset ANYWAY: `git checkout -B lane/b main && git clean -fd`.** A 93-behind tree would otherwise be edited against files that no longer match main and the drain would conflict. ⚠️ **Re-measure before you trust that sentence** — if `git log main..lane/b` is now NON-empty, something landed after authoring: **STOP and report**, do not reset.

**DISPATCH CITATION CHECK (run AFTER the reset above, before any edit).** The order matters and is the whole of F-1424-3: run these against a lane already at main, so a `0` means the key genuinely drifted on main rather than that the lane was merely stale. Each key was verified to return exactly **1 on main** at authoring time (F-1425-2 — keys chosen to sit on a single line, since `grep` is line-oriented and prose wraps):

```
grep -cF 'const SUPPORTED_CONTRACTS = new Set([' src/sim/HeadlessContractSim.ts   # expect 1
grep -cF 'gr-sim ends an idle Baron run at its grace ceiling' scripts/gr-sim.test.mjs   # expect 1
grep -cF 'the E2 Baron fights keep their pinned outcomes' scripts/gr-sim.test.mjs   # expect 1
grep -cF 'census support is explicit and deterministic' e2e/er01-e2-census.spec.ts   # expect 1
```

Any of these returning 0 **after** the reset means the key drifted on MAIN, not that the lane is stale — **STOP and report "key drifted on main: <which key>"**. Do not adapt, and do not go hunting for a replacement key: a master whose premise moved needs re-authoring by a fire, not repair by its runner.

## Why (owner ruling 2026-08-09 ~21:45, verbatim — grep `F-E2S-3 RULED: de-list now, socket later` in `tasks/BACKLOG.md`)

> **F-E2S-3 RULED: de-list now, socket later** — the door refuses e2-hill-mine/trestle/incline by name (F-DOOR-4 pattern: SUPPORTED_CONTRACTS + the skill.md door-contracts block + RE-AIM f-e2s-1's hill-mine idle ceiling test at a still-listed subject); the era-true pressure-to-damage socket follows as its own census-stream slice. **FIRE-AUTHORABLE, two masters, the de-list first.** GATE: de-list merged with the door-contracts guard green; socket slice specced before authoring.

**A LATER RULING THE SAME EVENING CONFIRMS THIS ONE — do not read it as a conflict.** Roundup #2 (grep `OWNER RULINGS ROUNDUP #2`) rules the Hill Mine railcar *"Tune the fight shorter"* (F-1493-3). That is a **browser-side pacing** pass and its row says so explicitly: *"a Hill Mine railcar balance pass (browser-side; the map stays door-de-listed per F-E2S-3 until the socket)"*. Shortening the browser fight does not give the **headless** board a weapon, which is what F-E2S-3 measured. The two rulings compose; neither cancels the other. That balance pass is a **separate master** — not this one, and not in scope here.

F-E2S-3 proved by the Sol crack experiment that `e2-hill-mine` is **unsecurable headless by construction**: the live order surface sells only `boiler_house` and the headless sim has **no pressure-to-damage consumer**, so all three railcar components sit at exactly full HP at every boundary wave 12→18. `e2-trestle` and `e2-incline` share the railcar shape. The door therefore serves those maps but not their era's weapon — an honest retreat until the socket lands.

**Verified facts on main (s1605 read them; re-verify before trusting):**
- `src/sim/HeadlessContractSim.ts:49` — `SUPPORTED_CONTRACTS` lists all four E2 contracts.
- `src/sim/HeadlessContractSim.ts:254` — the refusal is `if (!SUPPORTED_CONTRACTS.has(this.contractId) && !mode)`. **It is skipped whenever a `mode` is set**, so escort-mode callers are unaffected by this de-list. Message: `AP-07 supports only ...; received <id>.`
- `e2-pressure-garden` **stays listed** — the ruling names only the three railcar contracts.

### ⚠️ The ruling's third clause is NOT satisfiable as written — measured, not assumed

The ruling says *"RE-AIM f-e2s-1's hill-mine idle ceiling test at a still-listed subject"*. **There is no such subject.** `scripts/gr-sim.mjs:76` computes `waveCeiling = twist.baron ? Math.max(secureWave, twist.baron.wave) + BOSS_GRACE_WAVES : secureWave + 2`, and `endReason: 'wave-ceiling'` is only emitted when a **non-terminal** run reaches that ceiling — i.e. the idle rider must still be alive there. After the de-list the only Baron contracts left on the door are `e1-baron` (ceiling 26) and `e3-canyon-works` (ceiling 20).

s1605 ran every real bench seed under `--policy=idle`:

| contract | seeds | waves reached | ceiling | endReason |
|---|---|---|---|---|
| `e1-baron` | 01–05 | 5, 8, 11, 5, 5 | 26 | *(none — rider dies first)* |
| `e3-canyon-works` | 01–02 | 3, 3 | 20 | *(none — rider dies first)* |
| `e2-hill-mine` | 01–02 | **18, 18** | 18 | `wave-ceiling` |

Neither survivor gets close. The test only ever went green **because of the very defect being de-listed** — an idle rider survives 18 waves on hill-mine precisely because the board sells no weapon that interacts with the railcar. So the pin is retired with a named cause, **not re-aimed and not loosened**. Do not attempt a re-aim; do not pass `--mode` to slip past the door (that games the refusal and is era-false).

## Scope

1. **`src/sim/HeadlessContractSim.ts`** — remove `'e2-hill-mine'`, `'e2-trestle'` and `'e2-incline'` from the `SUPPORTED_CONTRACTS` set literal. Leave `'e2-pressure-garden'`. Add a comment at the removal site, in the voice of the existing E5/E6 comment directly below the set, naming: F-E2S-3, the owner ruling of 2026-08-09, and that these return when the era-true pressure-to-damage socket lands (the second master of this ruling). Keep the set literal's shape parseable — `scripts/skillmd-guard.test.mjs:34` extracts it with `/const SUPPORTED_CONTRACTS = new Set\(\[([\s\S]*?)\]\);/`.

2. **`public/skill.md`** — update the `skillmd-guard:door-contracts` JSON block (starts at the `<!-- skillmd-guard:door-contracts:start -->` marker) to drop the same three ids, preserving the block's existing sorted order and formatting. `scripts/skillmd-guard.test.mjs` derives the expected list from the set literal, so this is mechanically checked — if it reds, the block and the literal disagree and you must fix the block, not the guard.

3. **`scripts/gr-sim.test.mjs`** — two pins lose their subject:
   - `gr-sim ends an idle Baron run at its grace ceiling` (uses `e2-hill-mine`, `--policy=idle`, no `--mode`): mark it skipped via the node:test option object (`{ timeout: 45_000, skip: '<reason>' }`). The reason must name F-E2S-3, the owner ruling, the measurement above (no still-listed Baron contract reaches its ceiling under idle), and that the socket slice restores it. **Do not delete the test** — it is the socket slice's restore target.
   - `the E2 Baron fights keep their pinned outcomes` (iterates exactly `['e2-hill-mine', 'e2-trestle', 'e2-incline']`, constructs with no `mode`): every one of its subjects is de-listed, and it **cannot** be re-aimed at `e2-pressure-garden` because that contract has **no `twist.baron`** (verified in `assets/contracts/epoch-2-steamworks/contracts.json`) while the test asserts `first.waves >= contract.twist.secureWave` on the Baron auto-secure path. Skip it the same way, with the same class of reason.
   - Leave the escort test at `scripts/gr-sim.test.mjs:273`/`:289` **untouched** — it passes `mode: 'escort'` / `--mode escort` and so is unaffected by `:254`'s `&& !mode`. Confirm it still passes rather than assuming.

4. **`e2e/er01-e2-census.spec.ts`** — this generates one test per E2 contract (`census support is explicit and deterministic`) and constructs the sim with **no mode**, so three of its four tests would go red. Split the behaviour by contract: `e2-pressure-garden` keeps the full existing census unchanged; the three de-listed ids instead assert the door refuses them, copying the established sibling pattern at `e2e/er01-e4-census.spec.ts:81` (`expect(() => new HeadlessContractSim({ contractId: contract.id, seed: ... })).toThrow(/AP-07 supports only/)`), and keep the existing `expect(consoleErrors).toEqual([])` assertion. Keep one test per contract so the suite's shape and count are unchanged.

5. **Report the blast radius you find.** `src/sim/SeatedLockstepSim.ts:164` constructs the sim from a room's `setup.contractId` with no mode — a multiplayer room on a de-listed contract will now throw, which is the *intended* effect of a de-list. Check whether any room/bench/seed surface still offers the three (`assets/contracts/bench-seeds.json` deliberately keeps them — browser riders still bench these maps, per F-DOOR-4). **Report what you find; change nothing outside the firewall.**

**If any verified fact above is false on your tree, STOP and report which one** — do not adapt the scope around it. **If you find yourself about to exit without changes, WRITE WHY into your report first** — a silent no-op wastes a queue slot and a gate.

## Firewall

Touch ONLY: `src/sim/HeadlessContractSim.ts` (the set literal + its comment), `public/skill.md` (the door-contracts block only), `scripts/gr-sim.test.mjs` (the two named tests only), `e2e/er01-e2-census.spec.ts`.

NO changes to: `assets/contracts/**` (seeds and contracts stay — the maps are unchanged, only the headless door moves) · `src/sim/SeatedLockstepSim.ts` · any other `src/**` · sim semantics, wave/ceiling arithmetic, or `BOSS_GRACE_WAVES` · `scripts/skillmd-guard.test.mjs` or any other guard (if a guard reds, the code is wrong, not the guard) · any other `e2e/*.spec.ts` · the escort tests · `tasks/**`, `STATUS.md`, `reviews/**`, `tasks/goals.json` (the fire owns those).

## Self-check (evidence, not vibes)

- `npx tsc --noEmit` clean · `npm run build` green.
- `node --test scripts/gr-sim.test.mjs` — green, with the two skips visible in the summary. **Report the pass/skip counts before and after.**
- `node --test scripts/skillmd-guard.test.mjs` — green (this is the guard that proves scope 1 and 2 agree).
- `node --test scripts/agent-seat.test.mjs scripts/component-boss-secure.test.mjs scripts/moth-season-pressure.test.mjs` — adjacent, unmodified-green.
- `npx playwright test e2e/er01-e2-census.spec.ts --workers=1` — green **desktop and 390px mobile projects**. `--workers=1` is a correctness requirement in this shell (F-1270-1), not an optimisation.
- `npx playwright test e2e/er01-e3-census.spec.ts e2e/er01-e4-census.spec.ts --workers=1` — adjacent census siblings, unmodified-green both projects.
- Zero console/page errors in the above (the census spec already asserts `consoleErrors` empty — keep it).
- No screenshots owed: this slice renders nothing. Write the numbers, not images.

End: **READY-FOR-GATES** + report (a) the exact set literal after the edit, (b) the before/after pass/skip counts for `gr-sim.test.mjs`, (c) whether the escort tests stayed green untouched, (d) the blast radius from scope 5, and (e) anything you found that contradicts a verified fact in this master.
