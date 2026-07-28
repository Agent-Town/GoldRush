# Review — claw-2x-triangle-billing-diagnosis (F-CLAW-2X)

**Slice:** `lane-b-claw-2x-triangle-billing-diagnosis`
**Branch/tip:** `lane/m4` @ `f4cb37bf` (runner auto-commit)
**Merge base:** `535185dd55baf975a6df3765d80124b57de5cdfa`
**Drained:** s1196 fire, 2026-07-29
**Verdict:** ✅ **ACCEPTED** — the deliverable is a named verdict with the discriminator actually run, on both arms, in both scenes.

## What it does

F-CLAW-2X (`tasks/BACKLOG.md:1666`, labelled *"fire-investigable"* in its own words, unactioned since 07-28) recorded that the Mare Claim scene bills the Salvage Claw's triangles **exactly 2× per frame** while the queen scene bills 1×, and asked one fire to *"read the claw mount path + renderer.info accounting and name which."*

**It is LEGIT — the second billing is the sun shadow-map pass, not a double-submit.** The run flipped `world.shadowsQuality` between `soft` and `blob` (the discriminator the master pre-declared) and the Claw's 2× collapsed to 1×. Diagnosis only: **zero `src/` bytes**, and the master forbade shipping any repair even if a defect had been proved.

## Evidence

**§3.0 `drain-block-check` ran FIRST**, before classification and before I formed an opinion: ✅ CLEAR (`factory-claw-2x-triangle-billing-diagnosis`, status `queued`).

### The arithmetic, re-derived by the drain rather than read off the run's tables

The run's method is a **paired asset swap**: substitute the detail GLB for the shipped one, changing nothing else, and divide the resulting *scene*-triangle delta by the *asset*-triangle delta. That isolates the boss from unrelated scene geometry — a stronger instrument than reading raw counters, which is what the original finding did.

| scene | shadow | asset Δ | scene Δ | ratio (my computation) |
|---|---|---:|---:|---:|
| e8-mare-claim | ON | 4,440 | 8,880 | **2.000** |
| e8-mare-claim | OFF | 4,440 | 4,440 | **1.000** |
| e5-deepwater-claim | ON | 9,852 | 9,852 | **1.000** |
| e5-deepwater-claim | OFF | 9,852 | 0 | **0.000** |

Exact integers, not noisy ratios. All four rows filled, both arms measured in both scenes — which is precisely the bar s1195 set for this drain (*"an honest UNRESOLVED with four filled table rows is a PASS; a confident verdict with no OFF-arm measurement is not"*). The verdict is confident **and** the OFF arm was measured, so it clears the bar on both counts.

### The prediction was pre-declared, and it held

The master (s1195) derived from `LightRig.ts:167-170` — which gates **both** `renderer.shadowMap.enabled` and `sun.castShadow` on `quality === 'soft'` — that flipping the shadow pass off should collapse the claw's 2× to 1× if the extra submission is the shadow map. **That is exactly what happened.** A confirmed pre-registered prediction is the strongest evidence shape available here, and it is why this reads as a diagnosis rather than a story fitted to the numbers.

The run also verified its own instrument live (`renderer.shadowMap.enabled` **and** `LedgerLowSun.castShadow` both observed toggling) instead of assuming the balance key worked.

### 🔑 The finding's *framing* is corrected, not just answered — F-1196-2 (ⓘ, informational)

The published anomaly compares a **fully-visible** boss against an **off-camera** one, so the 2×/1× gap was never a property of the claw.

- Claw AABB `[-5.236, 11.093, 6.776] → [5.236, 21.317, 17.224]`: intersects **both** the gameplay camera and the sun frustum ⇒ drawn twice ⇒ 2×.
- Queen AABB `[30.536, -1.779, -23.897] → [42.220, 7.155, -16.103]`: intersects the sun frustum but **not** the gameplay camera at the sampled state ⇒ drawn **once, to the shadow map only** ⇒ 1×.

**The `Queen OFF → 0×` row is the check that makes this airtight, and it is internal to the run's own data:** if the queen's single billing were the main pass, disabling shadows would leave it at 1×. It went to **zero**, so the queen's only submission *was* the shadow pass. ⇒ **the queen was under-billed for being off-screen; the claw was never double-billed.** Both scenes are behaving correctly, and the two numbers were never comparable.

➡️ **Consequence for the perf table (non-blocking):** a per-boss triangle ratio in `docs/bench/boss-duel-perf-table.md` is **state-dependent** — it encodes whether that boss happened to be inside the gameplay frustum at sample time, not a stable property of the asset. The run says *"at the sampled state"* and is right to. Any future row comparing two bosses' ratios should record frustum membership alongside the ratio, or it will manufacture the same phantom anomaly again.

### Gates (on the merged tree)

| gate | result |
|---|---|
| `drain-block-check` | ✅ CLEAR (ran first) |
| `npx tsc --noEmit` | **exit 0**, 4 s, zero errors |
| `npm run build` | **exit 0**, 17 s (vite built in 1.49 s; asset-diet 84%/88% cuts) |
| `test:node-guards` (12 files, run BEFORE gating) | **61/61, exit 0**, 11 s |
| `test-ticker-stats.mjs` | **exit 0**, all 8 checks |
| `src/` bytes in the merged diff | **ZERO** — the central firewall, verified by path classification, not by the run's claim |

**No playwright, and that is proportionate rather than thinned.** Mistake #10 asks *"where does the PLAYER see this, in a plain boot?"* — answer: **nowhere, by construction.** The merge is 3 files: a 4-line docs append, a run report, and `scripts/tmp-s1195-claw-2x-probe.mjs`. I verified the probe is **inert** rather than assuming it: `grep` for its name across `package.json`, `scripts/`, `src/`, `e2e/` and CI returns **no reference outside the file itself**, and `test:node-guards` is an explicit enumerated list (not a glob), so nothing collects it.

### Merge classification

Base `535185dd`. Lane's own changed paths: **3**, all three differing from main, **all pure additions** (310 insertions, 0 deletions). `git diff --name-only 535185dd main -- <the 3 paths>` = **empty** ⇒ main never moved them ⇒ **collisions NONE, no 3-way graft**. Path-scoped `git checkout lane/m4 -- <3 paths>`; the standing `logs/` churn was left untouched and uncommitted.

## Findings

- **F-1196-2 (ⓘ informational, no corrective owed)** — the perf table's per-boss triangle ratio is state-dependent (frustum membership at sample time), so the original F-CLAW-2X "anomaly" compared unlike quantities. Documented above and in the run's own frusta section. Recorded rather than actioned: the table is a bench artifact, and the run's append already states *"at the sampled state."*
- **No blocking findings.** The firewall held (zero `src/`), the verdict word is present, both arms were measured in both scenes, and the run resisted the standing temptation to ship the repair it was forbidden to ship.

## Praise, as precedent

The master's three pre-declared STOPs were all framed as *successes* (anomaly fails to reproduce · no reachable non-soft quality · a real double-submit proved → **name it, don't fix it**). None fired, but the run did the harder adjacent thing: it **verified its own instrument before trusting it**, and it captured `uptime`/`load1m` before and after all eight arms while explicitly **declining to make any frame-time claim** — load varied from 7.44 to 10.33 and the integer counters repeated exactly. Measuring the confound and then scoping the conclusion to what the confound cannot touch is the right move, and it is worth copying.
