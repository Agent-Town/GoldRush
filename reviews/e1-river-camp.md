# e1-river-camp — THE RIVER CAMP CLOSED (one boolean)

**Slice:** `lane-e1-river-camp` · **branch:** `lane/m3` · **tip:** `cf02e0d3c1069bae6af5bd886551c8bede95769a`
**Merge-base:** `ab7cba01` · **Drained:** s1078, 2026-07-26 · **Merge:** see drain commit
**Verdict:** ✅ **MERGE** — the release-blocking passive-win exploit is closed by the datum the master named, the test rewrite is a genuine premise change (verified below, not assumed), and the only two reds are proven not mine.

## What it does
Three of the five E1 release maps could be **won by standing still in the river**: walk into the deep channel, stop pressing keys, secure the Claim in 77 seconds with 0 kills, 0 damage, 0 gold and 0 buildings. This flips **one boolean** — `assets/contracts/epoch-1-frontier/manifest.json:217` `heroCanWadeDeep: true → false` — so the hero keeps the shallows and the fords but loses the deep channel, which is where the exploit lived. The two e2e specs that encoded the old premise are rewritten to lock the new one.

Owner authority: **"river-camp 'lets fix it'"** (owner, on the E1 verdict, BACKLOG:1033). This is the fix he asked for, at the size the master recommended (option **a**, "smallest first").

## THE SCRUTINY POINT — is the 41-line deletion assertion-weakening?
s1077 handed this over as the thing to prove, and it is the only judgement call in the slice. **✓ VERIFIED: it is a premise change the fix genuinely requires, not weakening.** Traced to source, not inferred:

- `src/world/Terrain.ts:214` — `walkable = depth <= wadeDepth || (deep && TILE_WATER?.heroCanWadeDeep === true && ACTIVE_TILE.id === 'frontier-river-claim')`. With the datum false, **the hero can no longer stand on a deep sample by walking.**
- The deleted block asserted hero-in-deep-river behaviour: wade speed sampling, then the "Wet powder." disarm and its restore. Every one of those assertions is now **unreachable by the code path they tested** — they would have to be deleted or they would fail.
- The replacement is **stronger on the changed behaviour, not weaker.** It asserts the new invariant positively and falsifiably: `riverSamples === 0` (the hero never entered the river at all), `zone === 'shallows'`, `terrainSample(-12,0)` → `{ walkable: false, zone: 'river', waterClass: 'deep' }`, and — the part that matters — `disarmed === false` / `reticleDisarmed === false`, i.e. **the player keeps their weapons**, which is precisely what the old design traded away. It then still spawns an enemy and proves bolts fly.
- `gt-05` moves in lockstep and does **not** go vacuous: it still pins the full depth/speed table and now asserts `river: { walkable: false, speedMul: 0 }`, so a silent revert of the datum fails it.

**Net:** coverage of *"hero wades deep"* is removed because the behaviour is removed. Coverage of *"hero cannot wade deep"* is added. That is the correct trade, and it is regression-sensitive in the direction the owner cares about.

## Evidence
| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **0 errors** |
| `npm run build` | **green, 1.28s** |
| `e2e/task-025-bandits-dont-swim.spec.ts` (the slice's own) | **5/5 desktop + 5/5 mobile-390 PASS** — incl. the new `hero stops in the shallows and keeps weapons armed at the deep channel` |
| `e2e/gt-05-water-depth.spec.ts` (the slice's own) | **PASS desktop + mobile-390** |
| `e2e/m1-05-sentry-beacon-build.spec.ts` (adjacent, master-named) | **6/6 desktop PASS** isolated — incl. `river placement is rejected without spending gold` |
| `e2e/e1-night-shift.spec.ts` (adjacent, master-named) | **4 failed — PRE-EXISTING, fingerprint-matched (below)** |
| Console / page errors | **0/0** — both specs assert `pageErrors === []` internally and passed |
| Full battery | 42 passed / 9 failed (10.1m), both projects, `--workers=1` |

**Merge classification:** merge-base `ab7cba01`. `git diff ab7cba01 main` over the three files is **EMPTY** ⇒ all three are **LANE-TOUCHED-ONLY**, main moved none of them. No 3-way graft, no conflict, no judgement call. Applied by `git checkout cf02e0d3 -- <3 files>` and verified **byte-identical to the lane tip**. `lane/m3`'s other four commits are false-ahead (re-verified s1077) and were **not** drained — only `cf02e0d3`'s three files.

### The two reds, both proven not mine (cp-revert fingerprint on clean main)
1. **`e1-night-shift` ×4 (`:271`, `:372`, `:435`, `:478`) — PRE-EXISTING.** Reverted the slice to clean main and re-ran the identical selection: **the same four fail, and `:271` returns a byte-identical payload** — `{"dayHero":0.17412235294117648,"darkHero":0.043672156862745094,"heroRatio":0.25081304108897956,"tintLuminance":0.05135041268560246}`. All four are **lighting/luminance** assertions (hero brightness ratio, lantern light-ring sources, inside/outside readability, a night-suspend save timeout). A water-walkability boolean cannot move a luminance ratio, and the control proves it did not. **→ F-1078-1.**
2. **`m1-05:112` — CONTENTION FALSE-RED, not a regression.** It failed in the full battery (**27.3s**) and passed on clean main (10.3s), which reads like a differential. It is not: re-run **isolated with the slice applied it passes in 11.2s (6/6)**. `resetRun … keeps renderer memory stable` is timing/perf-sensitive, and lane-c's `gr-ladder-tune-measure` playwright battery was live at **49–51% CPU** throughout my run. Classic gate-battery contention — recorded so the next fire does not re-derive it.

## Findings
- **F-1078-1 — `e1-night-shift` carries 4 pre-existing lighting reds on main (desktop AND mobile).** ✓ VERIFIED pre-existing by cp-revert control with a byte-identical failure payload. Not caused by, and not fixed by, this slice. `:271` hero-brightness ratio **0.2508 vs a ≤0.0914 bound** is not a near-miss — it is ~2.7× over, which suggests the dusk/dark hero tint stopped being applied rather than drifting. `:478` is a different shape (a 15s `waitForFunction` timeout on the night-suspend save). **Non-blocking for this merge; wants a rung.** Note these were named by the river-camp master as must-be-green, so this red is what stopped that box being ticked — the master's expectation was written before the regression landed.
- **F-1078-2 — the "Wet powder." disarm has lost its only walk-reachable trigger in E1, and no e2e now covers it.** ✓ VERIFIED by reading: `Game.ts:6536` `heroWeaponsDisarmedFor` keys on `Terrain.sample(...).waterClass === 'deep' || heroInDeepwaterDiveZone(actor)`. The first disjunct is now unreachable on foot everywhere (see F-1078-3), leaving only the **epoch-5 dive zone** path live. The `Wet powder` announce assertion was deleted with the block and is not re-homed. The mechanic is **not dead code** — E5 still reaches it — but it is now **untested**. Non-blocking, correctly out of this slice's firewall. Recommend a rung to re-home the disarm assertion onto an E5 deepwater spec.
- **F-1078-3 — E10's `heroCanWadeDeep: true` is inert, and has been all along.** ✓ VERIFIED: `Terrain.ts:214` ANDs the flag with a **hard-coded `ACTIVE_TILE.id === 'frontier-river-claim'`**, so `epoch-10-deepsky/contracts.json:512` and `mask-tables/e10-river.json:23,47` set a flag that can never fire. The river-camp master's firewall says *"other epochs' manifests (E10 sets the same flag for its own reasons — leave it)"* — correct to leave, but the stated reason does not hold: **E10 does not get deep wading from this flag today.** Pre-existing, unrelated to this merge, but it means the E10 water design is silently not what its contract says. Wants an owner/attended look before E10 content is built on the assumption.

## Where does the PLAYER see this, in a plain boot?
On The Claim, e1-night-shift and e1-baron: **the river is now a barrier with one crossing.** The hero walks into the shallows and stops at the deep channel instead of strolling through it. This makes the Claim's own board card true — it promises *"The river splits the claim around one center ford"*, and until this merge the river split nothing. Verified by the specs at plain-boot equivalents (`?debug` only for teleport/balance harness; the `walkable:false` terrain sample is engine truth, not a debug artifact).
