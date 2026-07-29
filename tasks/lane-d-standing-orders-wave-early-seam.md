CODEX: model=gpt-5.6-sol effort=xhigh
# standing-orders-wave-early-seam — cure the ONE measured member of the concurrency class, against a number (F-1215-1 / F-1214-1)
ROLE: lane implementer. WORKDIR: this lane worktree. One task, firewalled.
**FIRE-AUTHORED (attended review welcome)** — authored s1219 from the s1218 rate table, which is the first time this defect has had a measured rate to be cured against.

WHY: four fires (s1214→s1217) argued about this class from single samples; s1216 authored an instrument, s1218 merged it (`987df988`, `reviews/concurrency-class-failure-rate.md`), and the table it produced (`logs/session-scratch/s1216-concurrency-rates/rates.md`) settled the argument. **Two of the four suspects are not flakes at all** — `locked-win:65` and `tl-01:236` fail **100% at every worker count, both projects** (deterministic reds; do not touch them here). **The concurrency class has exactly ONE measured member**, and this task cures it.

**THE SUBJECT, AND ITS MEASURED RATE (quote, do not re-derive from memory):**
`e2e/ap-standing-orders.spec.ts:80` (the `seeded standing orders obey priority, gates, legal actions, surprises, and the live rung` test), failing at **line 121**:
```ts
await expect.poll(() => view(page).then((state) => state.log.some((event) => event.surprise === 'wave_early'))).toBe(true);
```
| Project | workers=1 | workers=2 | workers=4 |
|---|---:|---:|---:|
| desktop-chrome | 0/8 | 0/8 | **0/8** |
| mobile-chrome | 0/8 | 0/8 | **2/8 = 25.0%** |

s1219 extracted the failing line from the harness's own raw artefacts (`raw/run-12-w4.json`, `raw/run-18-w4.json`): **both failures are `errLine 121`, both `mobile-chrome`, both at workers=4.** That is the entire measured footprint of the class. **It is mobile-only and w4-only.**

⚠️ **THE ACCEPTANCE NUMBER MUST BE MOBILE-ONLY, AND s1218's PHRASING OF IT WAS TOO WEAK — THIS IS THE MOST IMPORTANT LINE IN THIS TASK.** s1218 proposed "0/16 at w4". But desktop-chrome measured **0/8 at w4 with no cure at all**, so a pooled desktop+mobile "0/16" is half-filled with executions that never fail: at the measured 25% rate, an **uncured** build passes a pooled 0/16 gate about **10%** of the time (`0.75^8`). Requiring **0/16 mobile-chrome executions at workers=4** drops that to about **1%** (`0.75^16`). **Use the mobile-only gate. A pooled gate is an automatic reject.**

**MEASURED PREMISE (re-derive at source before building — do not inherit it):**
`src/agent/StandingOrders.ts:268-280`, `detectSurprises`, called from `tick(at, actor)` at `:138` (and `:159`):
```ts
if (state.wave > previous.wave && this.expectedWaveAt !== null && at + 0.2 < this.expectedWaveAt) {
  this.surprise('wave_early', at, …);
}
…
if (!previous || state.wave !== previous.wave) this.expectedWaveAt = at + state.nextWaveInSim;
```
This is a **sampled state-diff**: the event fires only if some tick observes `state.wave > previous.wave`. If it is not observed in a qualifying window, the event is **never emitted at all** — it is a **missed** event, not a late one. That matters more than anything else here: ➡️ **`expect.poll` at `:121` will poll until timeout and can never succeed, so RAISING ITS TIMEOUT CANNOT FIX THIS.** (This repo has paid for that lesson: *a poll-driven control loop's accuracy is bounded by its sampling interval; healthy throughput plus a wrong final state means the loop, not starvation.*)

🔬 **MY MECHANISM READING IS AN UNVERIFIED HYPOTHESIS AND YOU MUST TREAT IT AS ONE.** s1219 read the code but did **not** prove which branch fails. Candidates, none confirmed:
- **(a) the 0.2 s guard**: under contention the tick that observes the transition arrives so late that `at + 0.2 < this.expectedWaveAt` is already false → wave seen, but not judged "early".
- **(b) `previous === null`**: if the first tick after the executor installs lands *after* `startWaveForTest(1)`, there is no `previous` to diff against, `:275` is skipped entirely, and `:279` just adopts the new wave.
- **(c) `expectedWaveAt` is stale/too near**: `nextWaveInSim` under `?nowaves` may make `expectedWaveAt` too close to `at` for the guard to ever pass.
- **(d)** something else, including the possibility that the spec's own sequencing at `:119-121` is at fault rather than the product.
**Item 1 exists to decide between these. Do not skip it and do not assume (a).**

**IS THIS A PRODUCT BUG OR A TEST BUG? — ANSWER IT WITH EVIDENCE, IT DETERMINES THE CURE.** If the sampler can miss a genuinely early wave, then a real player's agent silently misses a surprise it was supposed to report, and the defect is in `StandingOrders.ts`. If instead the product is correct and only the spec's sequencing is racy, the defect is in the spec. **These have different cures and you must not guess which one you are in.**

READ-FIRST: `logs/session-scratch/s1216-concurrency-rates/rates.md` (the table above — read the real file, and note it also records per-run loadavg) · `reviews/concurrency-class-failure-rate.md` (what the instrument does and does not establish) · `src/agent/StandingOrders.ts:130-170` + `:262-300` (`tick`, `detectSurprises`, `surprise`, `append` — THE SUBJECT) · `e2e/ap-standing-orders.spec.ts:80-135` (the test and the exact sequencing around `:119-121`) · `scripts/concurrency-class-rate.mjs` (**the instrument already exists — REUSE IT, do not write a third probe**; `--subjects file:line,… --workers … --runs N(>=8) --port PORT(not 5188) --output DIR`, and it has a `--self-test`).

PRE-FLIGHT (LANE-SAFETY invariant): any dirty tracked blob must be reachable in git, else STOP.

SCOPE:
1. **DECIDE THE MECHANISM BEFORE YOU CHANGE ANY BEHAVIOUR.** Instrument the four candidates above and report which one actually fires in a failing execution — with the observed values of `at`, `previous.wave`, `state.wave`, `expectedWaveAt` and `nextWaveInSim` at the deciding tick. **State plainly whether the defect is in `StandingOrders.ts` or in the spec's sequencing.** This determination is the deliverable even if you stop later.
2. **BUILD A DETERMINISTIC REPRODUCTION — this is the real prize.** A 25% flake cured against a 25% flake is barely measurable; a defect reproduced **100% on demand** is a cured defect you can prove. Force the deciding condition directly (e.g. drive `tick()` with the sample spacing/ordering item 1 identified, at the unit/seam level) so the miss reproduces **without needing load at all**. Report its before-rate: it must be **100%**, not "usually".
   ⛔ **HARD STOP:** if item 1 cannot identify a mechanism, or the deterministic reproduction will not reproduce, **STOP and report items 1-2**. Do **not** proceed to cure a defect you cannot summon on demand. **Reporting that is a SUCCESS**, and it is a far better outcome than a cure validated only by a lucky quiet box (this is exactly F-1215-2's finding, and the reason the rate instrument exists).
3. **Cure it at the seam item 1 named** — so the surprise is emitted from the fact that the wave changed, rather than from a tick happening to sample the change inside a 0.2 s window. **Every currently-green assertion keeps its meaning**; this makes the detection reliable, it does not redefine what "early" means. If curing it would change any other surprise (`claim_damage`, `hero_down`, `order_failure`) or any player-visible ledger/voice line, **STOP and report** rather than widening.
4. **Prove it with the deterministic test from item 2** — it must fail without the cure and pass with it. **Mutate the cure to confirm the test genuinely fails without it, and report that you did.**
5. **THEN corroborate with the rate instrument, mobile-only.** `node scripts/concurrency-class-rate.mjs --subjects e2e/ap-standing-orders.spec.ts:80 --workers 4 --runs 16 --port <free, NOT 5188> --output logs/session-scratch/s1219-wave-early`. **ACCEPTANCE: 0/16 mobile-chrome executions at workers=4.** Report the mobile and desktop counts **separately** — never pooled. Also report each run's loadavg: **a quiet box weakens this arm**, and you must say so if the box was quiet (a green under load is worth more than a green in a quiet box).

TOUCH-ONLY: `src/agent/StandingOrders.ts` (the surprise-detection seam ONLY) · `e2e/ap-standing-orders.spec.ts` (**only** if item 1 proves the defect is the spec's sequencing) · a new unit/seam test for item 2 · `logs/session-scratch/s1219-wave-early/` (measurement output).
NO: **raising the `expect.poll` timeout at `:121`, or any timeout, anywhere** (it cannot work — the event is never emitted; automatic reject) · **widening, weakening, or deleting the `:121` assertion** · **pinning `workers` or adding `fullyParallel` in `playwright.config.ts`** (that hides the class from `npm test`, the exact danger F-1214-1 named — automatic reject) · `retries` · the other three surprises' semantics · `locked-win:65` / `tl-01:236` (**deterministic reds, NOT this class — F-1218-3**) · the AP-06b wiring or `lane/e2-arsenal` · `PermissionLadder.ts` / `ToolSurface.ts` (**owner-gated by F-1219-1 — do not touch the rung gate**) · Economy · CombatSystem · Balance.

SELF-CHECK: `npm run test:node-guards` **FIRST** (74/74 — the only instrument that sees a suite-uncollectable regression) · `npx tsc --noEmit` clean · `npm run build` green · `npx playwright test --list` reports **344 files** and the test count moves by exactly the number of tests you added × 2 projects (**state both numbers**) · `e2e/ap-standing-orders.spec.ts` full file, both projects · adjacent: `e2e/m4-05 m4-06 m4-09 m4-10 gazette-welcome` · zero console/page errors · plain boot desktop + 390px.

⚠️ **`--workers=N` DOES NOT DO WHAT YOU THINK ON A SINGLE FILE (F-1217-2).** `playwright.config.ts` sets no `fullyParallel` and no `workers`; the default parallelises across **files**, serially within one. One spec × two projects tops out at **2 workers** whatever you pass. **Always report the literal `Running X tests using M workers` line**, never the flag. (The rate instrument in item 5 handles this itself — but quote its lines too.)

🔴 KNOWN REDS — NOT yours, do not "fix" them (automatic reject):
  - `locked-win.spec.ts:65` and `tl-01-run-telemetry.spec.ts:229` — **100% deterministic at every worker count** (measured s1218, F-1218-3). Report if seen; never chase.
  - `m4-06-embodiment.spec.ts:395` — known ~45% flake (F-1212-2). Re-measure as a rate before blaming yourself.
  - `gazette-welcome.spec.ts:44` — measured **1/8 mobile at w2, 0/8 at w4** (s1218). A single event; not this task's subject.

READY-FOR-GATES + report: item 1's mechanism determination **with the observed values at the deciding tick, and the product-vs-spec verdict**; item 2's deterministic reproduction and its 100% before-rate (or the STOP); the item-4 mutation proof; item 5's **separate mobile and desktop** counts at w4 with the loadavg range; and the literal worker-count lines of every battery you ran.
