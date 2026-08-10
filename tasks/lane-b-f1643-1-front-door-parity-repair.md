# Task f1643-1: teach `front-door-parity` the verb AP-16-2 added (LANE-B, commit prefix "test:")

**FIRE-AUTHORED (attended review welcome)** — s1644, 2026-08-11.

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-b`.

READ FIRST: `AGENTS.md`; `specs/agent-play/ap-16-same-game-law.md` (the law this spec defends); `public/skill.md` §the draft (the door's published promise); `tasks/BACKLOG.md` line 7 (F-1643-1, the finding this repairs); `e2e/front-door-parity.spec.ts` (the subject).

SEQUENCING LAW: this task depends on the AP-16-2/2b pick clock being present. Verify with
`grep -c "if (this.progression.applyUpgrade(offer\[0\].id)) this.defaultedPicks += 1;" src/sim/HeadlessContractSim.ts`
→ must print `1`. If it prints `0`, **STOP and report "pick clock not landed in this lane"** — do not improvise the dependency, and do not gate on `git log -N`.

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/b main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. **EVIDENCE-ARTIFACT EXCEPTION (F-1266-1, s1266): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, and any `.png` screenshot — are NEVER "work" and NEVER a STOP, whether they sit as uncommitted dirt or as the entire content of an ahead commit. Screenshots are never byte-identity gated, so their bytes differ from main forever. Discard them (`git checkout -- <paths>` / reset) and PROCEED, listing what you discarded.** Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything. Then `git -C worktrees/lane-b status --short` → must be clean, with the FACTORY-CHURN EXCEPTION — always expected, never a STOP; list them and proceed (F-1407-1): (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*` and any `.png`. What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.

## Why (F-1643-1, s1643 2026-08-11; every number below RE-MEASURED at source by s1644 before this master was written)

F-1643-1 recorded `e2e/front-door-parity.spec.ts` as RED 0/4 on main, proven pre-existing by a main-side control, and asked for **"a corrective that re-baselines the progression expectations … or retires the assertion if the pick clock made it meaningless."**

**Do neither. Both options are wrong, and measurement says why.**

**1. The attribution is no longer inferred — it is VERIFIED.** F-1643-1 marked the AP-16-2/2b pick clock as the *likely* author, explicitly `INFERRED`. The cure's own comment says so outright: `scripts/gr-sim.test.mjs:46` — in test `'gr-sim replays the same contract, seed, and orders byte-for-byte'` — reads *"AP-16-2: bench-001 levels once; the first-option pick moves from immediate to the trail deadline, so the outcome gains one default and its terminal hash re-pins."* The sibling suite was re-pinned when the clock landed; **this spec was not.** That closes the attribution.

**2. The stdin test does not merely drift — it CRASHES, and no re-baseline of numbers can fix it.** `e2e/front-door-parity.spec.ts:35` (`'pure stdin progression and panning secure the Claim deterministically'`) feeds a **fixed 13-batch** order stream via `spawnSync(..., { input })`. The protocol is strict lockstep — `scripts/gr-sim.mjs:99-101` writes one view, breaks if terminal, else `await readOrders(...)`, i.e. **one order batch per non-terminal turn**. The pick clock adds turns, so 13 batches now run out and `scripts/gr-sim.mjs:179` throws `Error: stdin ended while gr-sim was waiting for standing orders.` → **rc=1**. Measured s1644 at 12, 20 and 30 HOLD batches: rc=1 every time.

**3. The door is NOT broken, and parity is intact — a client that answers its offers still secures the Claim exactly as the spec always asserted.** s1644 built a reactive lockstep client (spawn + line-read; one batch per view; answer `{"verb":"PICK_UPGRADE","id":now.pendingOffer[0].id}` whenever an offer is live, else HOLD) and ran it twice, byte-identical:

| client | rc | outcome | first upgrade at |
|---|---|---|---|
| **answers picks** | 0 | `secured:true, waves:10, gold:0, kills:297, calls:26, defaultedPicks:0, eventLogHash:fnv1a32:fd705184` | **level 2** |
| **silent** (HOLD only) | 0 | `secured:false, waves:8, gold:0, kills:200, calls:38, defaultedPicks:6` | level 4 |

`secured:true, waves:10` is **precisely what the spec asserts today**. The spec is not stale about the outcome; it is stale about **the client**. It never learned `PICK_UPGRADE` — the verb AP-16-2 exists to add.

⚠️ **This is why "re-baseline the numbers" would have been a real mistake:** the obvious repair pins `secured:false, waves:8`, recording *"the agents' front door loses The Claim"* as the new normal. That is false, and it would have been enshrined by a green test.

**4. Only the idle test is a genuine stale-value repair, and it is fully explained.** `e2e/front-door-parity.spec.ts:63` (`'idle remains deterministic and losable after progression parity'`) expects `upgradesTaken: { heavy_spark: 2 }` and `waves: 3`. Measured now: `hp:0, level:3, upgradesTaken:{}`, outcome `secured:false, waves:2, defaultedPicks:0`. Cause, traced not guessed: `syncUpgradeOfferClock()` runs every sim step (`src/sim/HeadlessContractSim.ts:713`), and it defaults only once `timeAlive*1000 >= offerTime + Balance.offers.pickSeconds*1000` (`:767-783`, `pickSeconds` 20 default / 30 greenhorn / 10 vein-hunter — `src/game/Balance.ts:907,1081,1086`). The idle hero levels late and dies at **81.7 s**, before any deadline elapses — so zero picks apply, so it is weaker, so it dies one wave earlier. Both drifted values have the same single cause and neither is a bug.

**5. The published promise is currently asserted NOWHERE.** `public/skill.md:78`: *"Silence at the deadline applies the first choice, exactly like the browser clock, and increments `defaultedPicks` in the terminal outcome."* That is the parity claim of the whole slice, and no test in this spec exercises it. The silent run above (`defaultedPicks: 6`) shows it working; it should be pinned.

## Scope

1. **Rewrite the stdin client as a reactive lockstep driver.** Replace the fixed-`input` `spawnSync` in `'pure stdin progression and panning secure the Claim deterministically'` with a `spawn`-based client that reads stdout line by line and writes exactly one order batch per non-terminal view (protocol: `scripts/gr-sim.mjs:99-101`). Keep the existing `SECURING_ORDERS[0]` opening batch verbatim as the first response. Give it a hard timeout (≥180 s) so a protocol mistake fails loudly instead of hanging.
2. **The driver answers offers.** When a view carries a non-empty `now.pendingOffer`, respond `[{ verb: 'PICK_UPGRADE', id: view.now.pendingOffer[0].id }, ...HOLD]`; otherwise respond `HOLD`. Assert the restored outcome: `secured:true, waves:10, gold:0, calls:26, defaultedPicks:0`.
3. **Keep every assertion that still holds** — re-verified true by s1644: `waveOne.now.score.goldPanned === 90`, `waveOne.now.works.byKind` equals `{ palisade: 4, turret: 1 }`, the `opening.almanac.nextWave` block, and `defeatedBasis: 'all enemies, including continuous tricklers'`. Do not touch them.
4. **Fix the `progressed` assertion to state the new law rather than the old one.** `expect(progressed.now.hero.upgradesTaken).not.toEqual({})` currently fails because the first level-up no longer applies a pick. Replace it with an assertion that the *answered* client takes its first upgrade **at level 2** (i.e. the first view whose `upgradesTaken` is non-empty has `hero.level === 2`), plus `upgradeChoiceRule === 'first-offer'`. That is the parity fact worth defending: answering promptly is as fast as the old immediate-apply behaviour.
5. **Add a third test pinning the documented silence default** (`public/skill.md:78`). Same reactive driver, never sending `PICK_UPGRADE`: assert `secured:false, waves:8, defaultedPicks:6` and that its first upgrade arrives strictly later (level 4) than the answered client's (level 2). This is the first test anywhere of the clock's silence promise.
6. **Determinism, and the cost it now carries — READ THIS ITEM BEFORE COSTING THE OTHERS.** Today each test runs the sim **twice** to byte-compare stdout. A reactive run is ~2 minutes, so keeping double-runs on two new expensive tests would add ~8 minutes per project. Instead: run each reactive test **once** and assert determinism by pinning `eventLogHash` (`fnv1a32:fd705184` for the answered client — s1644 measured it twice, identical). Keep the cheap idle test's existing double-run byte-compare unchanged. ⚠️ **If any measured value in this master does not reproduce exactly, STOP and report the difference — do NOT re-pin to whatever you observe.** These are deterministic sim runs on the same tree; a divergence is news, not noise (no re-pin reflex — F-1441-3).
7. **Re-baseline the idle test, with the cause written into the file as a comment** (from Why §4, citing `HeadlessContractSim.ts:767-783`): `upgradesTaken: {}` and `waves: 2`; also assert `defaultedPicks: 0`, since dying before the deadline is exactly what the comment explains.
8. **Halve the standing cost: this is a node-only spec, so run it in `desktop-chrome` only.** It spawns `gr-sim.mjs` and never opens a page, yet `playwright.config.ts:74-96` collects it into both `desktop-chrome` and `mobile-chrome` — which is where the "0/**4**" came from. Skip it in every project but `desktop-chrome`, in-file, with a one-line reason comment. **I RULE for desktop-only here** and take responsibility for it; if you find the skip cannot be expressed in-file without touching `playwright.config.ts` (which is firewalled), **report that instead of reaching for the config** — and say so if you disagree with the ruling.

## Firewall

Touch ONLY: `e2e/front-door-parity.spec.ts`.

NO changes to: `src/**` (in particular `src/sim/HeadlessContractSim.ts` — the pick clock is CORRECT; this task repairs its test, never the mechanism) · `scripts/gr-sim.mjs` · `scripts/gr-sim.test.mjs` (its pins are already correct for the clock — leave them) · `playwright.config.ts` · `public/skill.md` · `package.json` · any other `e2e/*.spec.ts` and their assertions · `tasks/**`, `specs/**`, `reviews/**`. Sim semantics are explicitly out of scope: **if you conclude the clock itself is wrong, STOP and write the finding — do not fix it here.**

## Self-check (evidence, not vibes)

- `npx tsc --noEmit` clean · `npm run build` green.
- `npx playwright test e2e/front-door-parity.spec.ts --workers=1` **green**, and report the pass/skip counts per project (expected: 3 passed in `desktop-chrome`, the spec skipped in `mobile-chrome`).
- Adjacent, unmodified-green, named not implied: `node --test scripts/gr-sim.test.mjs` (the sibling suite that pins the same sim — it must stay green and unedited) and `npx playwright test e2e/ap16-4-contract-admission.spec.ts e2e/ap16-upgrade-door.spec.ts --workers=1` both projects.
- Zero console/page errors (this spec opens no page; state that explicitly rather than implying it).
- **Report the measured wall time** of the full spec per project. If it exceeds ~6 minutes in `desktop-chrome`, report it as a finding with the number — do not silently accept it and do not thin the assertions to make it fit.
- No screenshots (nothing renders); say so rather than leaving the line blank.

**If you find yourself about to exit without changes, WRITE WHY into your report first** — a silent no-op wastes a queue slot and a gate.

End: **READY-FOR-GATES** + report (a) the three tests' measured outcomes vs the table in Why §3, (b) whether `eventLogHash` reproduced `fnv1a32:fd705184` exactly, (c) your verdict on the scope-8 desktop-only ruling, and (d) anything the reactive driver revealed about the lockstep protocol that this master got wrong.
