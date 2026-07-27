# town-plaza-slot-diagnostics — drain review (s1109)

- **Slice:** `lane-town-plaza-slot-diagnostics` (s1108-authored named lift for rf-37's firewall STOP)
- **Branch / tip:** `lane/m3` @ `93d55f55` — `runner(lane-a): lane-town-plaza-slot-diagnostics.md`
- **Landed as:** `425d2a9a` — **path-scoped, NOT a branch merge** (see F-1109-3)
- **Verdict:** ✅ **MERGED** — the lift does exactly what it was authored to do, and it is proven by payload, not by a green test.

## What it does

rf-37 (`lane-approach-steer-to-arrival`) STOPped lawfully at its own firewall because site 4
(`approachStampMill`) had no runtime-resolved target: `TownScene.ts:2064` maps `townBuildings`,
which excludes `stamp-mill`, and the plaza publish site derived `trailCount` **from
`townPlazaLayout.slots.length` and then discarded the slots**. The approach pair existed at
`townLayout.ts:100` but was one property access from the runtime and reached no consumer.

This lift is the smallest thing that closes that gap — deliberately a prerequisite, not a rewrite:

| File | Change |
|---|---|
| `src/town/TownScene.ts:183` | `TownDiagnostics.plaza` gains `slots: Array<{id, position:{x,z}, approach:{x,z}}>` |
| `src/town/TownScene.ts:2086` | publish site adds `slots: townPlazaLayout.slots.map(...)` — **additive**, existing four fields untouched |
| `e2e/town-t1-square.spec.ts:73-79` | one assertion on the **id and shape**, never the literal coordinates |

`vite-env.d.ts` needed no edit — `:941` references the exported type, confirmed by a clean `tsc`.

## Evidence (measured this fire, on the landed tree)

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | clean |
| `npm run build` | ✓ built in **1.31s** |
| Adjacent battery, **desktop-chrome** | **9 passed / 4 failed** |
| Adjacent battery, **mobile-chrome (390px)** | **9 passed / 4 failed** — identical failure set |
| **Control, clean main, run 1** | **8 passed / 5 failed** |
| **Control, clean main, run 2** | **8 passed / 5 failed** — byte-identical failure set |

Battery = `town-t1-square` + `ts-01-plaza-ground` + `town-plaza-props-blender` + `town-era-switch`
(every e2e file mentioning the plaza that isn't already covered elsewhere).

### The landed tree is strictly BETTER than clean main
All four reds on the landed tree are present on clean main, which additionally fails
`town-era-switch.spec.ts:120`. **The control was run twice and reproduced exactly** — per s1104(D)'s
standing rule that a fingerprint control run once is a coin toss. No red is attributable to this slice.

### The slice's own spec is red, and the new assertion still PASSED — proven directly
`town-t1-square.spec.ts:65` fails on **both** trees, at `:55` inside `approach()`, reached from
`:85`. That is `town-t1-square:53` — **site 7 of rf-37's own nine-site wall-clock list** (F-1104-3):
hold a key for a fixed ms, release it, then poll for an arrival that nothing is moving toward.
So the slice's own gate cannot be green until rf-37 lands, and pretending otherwise would be the
Premature Celebration.

Instead the new assertion is proven by its **payload**, captured from the run:

```
[town-plaza-slot] {"id":"stamp-mill","position":{"x":4.8,"z":9},"approach":{"x":3.45,"z":6.5}}
```

The assertion at `:73-79` sits *above* the failure at `:85`, so it executed and passed. The runtime
now publishes `stamp-mill` with a finite `approach` pair — `{x:3.45, z:6.5}`, matching
`townLayout.ts:100` exactly. **That is the whole purpose of the lift, and it is satisfied.**

### §3.0 block check
`node scripts/drain-block-check.mjs 20260727-070008-lane-town-plaza-slot-diagnostics.md`
→ **✅ CLEAR** — `status="authored"`, run before classification.

## Findings

### F-1109-3 — F-1108-2 FIRED EXACTLY AS PREDICTED; THIS DRAIN HAD TO BE LANDED PATH-SCOPED ✓ VERIFIED
`93d55f55` carries **24 files / 10,824 insertions**, of which **only 2 are content**:

- real: `src/town/TownScene.ts` (+9/−1), `e2e/town-t1-square.spec.ts` (+7)
- debris: **18 `.wrangler/tmp/**` bundle-scratch files** (`middleware-loader.entry.ts`,
  `functionsWorker-*.js/.mjs/.map`, `functionsRoutes-*.mjs`), plus
  `artifacts/accounts-worker/test-accounts.json`, `artifacts/multiplayer-relay/test-multiplayer.json`,
  `logs/factory-usage.json`, `logs/usage-history.jsonl`

Cause is unchanged and still live: **`scripts/lane-runner-v3.sh:84` runs `git add -A`**, the exact
broad add CLAUDE.md §4.2 forbids, while `.wrangler/` is **tracked** rather than ignored. `git merge`
would have imported all of it onto main.

**Landing method:** `git checkout lane/m3 -- src/town/TownScene.ts e2e/town-t1-square.spec.ts`,
then a path-scoped commit. Verified loss-free before committing:
`git log fa63dc7c..HEAD -- <both paths>` is **EMPTY**, so main had not moved either file since the
lane base and the checkout clobbered nothing. Staged diff was exactly `2 files, +15/−1`.

⚠️ **CONSEQUENCE FOR THE NEXT FIRE — `lane/m3` NOW READS "1 AHEAD" AND IS NOT DRAINABLE.**
Its content is on main; only debris remains unmerged. This is the false-ahead state, cause
RUNNER DEBRIS. Verify by file-probe, not by commit count:
`git diff main lane/m3 -- src/ e2e/` is **EMPTY**. Nothing is deleted — `93d55f55` stays reachable
(RETENTION LAW). The lane needs a reset before its next refill, not a drain.

**The runner fix remains OWED and is now twice-demonstrated.** I did **not** apply it this fire:
`bash` reads a running script lazily by byte offset, and editing `lane-runner-v3.sh` while a lane
run is live can corrupt execution mid-flight. It is safe to apply only while **no** `codex exec` is
running. `:82` already shows the path-scoped form as the model.

### F-1109-4 — the new assertion ships a `console.log` into a spec ⚠️ NON-BLOCKING
`town-t1-square.spec.ts:74` emits `console.log('[town-plaza-slot] …')`. Harmless (test-side, not
shipped code) and it is precisely what made the payload proof above possible this fire — but it is
permanent debug noise in a spec that will run on every board sweep. Worth deleting once rf-37 lands
and the assertion no longer needs to testify for a red test.

## Player-visible change
**None** — diagnostics + one test assertion. No gazette item, no deploy, per the filter law.

## What this unblocks
rf-37 (`lane-approach-steer-to-arrival`) is now executable **as written, byte-unchanged**. Its goal
leaf carries a DO-NOT-RE-QUEUE-UNTIL marker naming this slice; that marker is now satisfied.
