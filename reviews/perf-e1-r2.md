# perf-e1-r2 — the E1 optimization, extended

**Slice:** PERF R2 (`TASK.md`), items 1–2 of 4 · **Branch:** `perf2/e1-extend` · **Base:** `7c833197`
**Tip:** `501332b6` · **Sessions:** 2026-08-04 07:14–07:51 (s1), 10:15– (s2, this one)

## VERDICT

**Item 1 (enemy-sprite instancing): REVERTED to opt-in, with a proven mechanism.** It works, it is
−60 draw calls/map on every one of the five E1 maps in both projects, and it still cannot ship. The
census names the reason: three.js sorts render-list *items*, not the sprites inside them, so
collapsing 60 sprites into one InstancedMesh costs their per-sprite depth interleaving with the
other transparent batches at the same renderOrder. That is round 1's failure class, not a new one,
and sorting *within* the batch — which s1 implemented correctly — cannot reach it.

**Item 2 (the light bill): ONE UPGRADE SHIPPED, measured.** Parking the sun's shadow `autoUpdate`
while its intensity is exactly 0 removes **13 draw calls per frame (85 → 72, −15%) through the whole
dark phase** and is **bit-identical by day** (84 = 84 calls, 156,236 = 156,236 triangles). This is
the only rendering behaviour this branch changes.

**Items 3 (co-material prop merging) and 4 (the mobile arm) were NOT reached.** The census that item
3 depends on is landed and published; the merge work is not started. Item 4 is partially answered
below (mobile census + mobile pixel arm) but the tier-demotion-under-synthetic-load proof is not done.

| # | Item | Verdict | Evidence |
|---|---|---|---|
| 1 | Enemy sprites → InstancedMesh | **REVERT** (opt-in via `?spriteinstancing`) | F-R2-1, F-R2-2 |
| 2 | The light bill — zero-intensity shadow pass | **KEEP, shipped** | F-R2-3 |
| 2 | The light bill — remaining profile | not started | — |
| 3 | Static co-material prop merging | not started (census published) | `artifacts/perf-e1-r2/` |
| 4 | Mobile arm | partial — census + pixel arm done, demotion proof not done | tables below |

---

## WHAT IT DOES

Three commits sit on this branch. `100c2d57` adds `drawCallCensus()`, which renders one extra
attributed frame with an `onBeforeRender` tap on every visible renderable, so each buffer render —
exactly one WebGL draw call — is charged to the object that issued it. `ac07ff0b` added enemy-sprite
instancing (default-on), a census attribution fix, and the shadow-pass parking. `501332b6` (this
session) demotes instancing to opt-in after the mobile pixel gate failed.

Net effect on a shipped boot versus base `7c833197`: **the shadow-pass parking, and nothing else.**
The instancing machinery remains in the tree but is inert unless `?spriteinstancing` is passed.

---

## EVIDENCE

### 1. Draw calls — the win instancing would have bought (census, 60-enemy pressure)

Perfectly reproducible: identical to the unit across all three paired samples, both projects.

| Map | desktop shipped → instanced | mobile shipped → instanced |
|---|---|---|
| e1-night-shift | 139 → 79 | 128 → 68 |
| the-claim | 136 → 76 | 123 → 63 |
| e1-dry-gulch | 137 → 77 | 123 → 63 |
| e1-twin-banks | 127 → 67 | 120 → 60 |
| e1-baron | 134 → 74 | 120 → 60 |

What those calls ARE (Night Shift, 139 total): 60 one-per-enemy sprites drawing two triangles each
(43% of the frame), 13 unnamed MeshStandardMaterial meshes, 13 EnemyPool instanced, 5 DecoyShedPool,
5 CapacitorBankPool, 5 landmark paint meshes.

### 2. F-R2-2 — the p95 arm cannot resolve this change on this box

Three paired same-window samples. The draw-call column above never moves; p95 does not replicate in
sign or magnitude:

| Map (desktop) | pair 1 | pair 2 | pair 3 |
|---|---|---|---|
| e1-night-shift | +10.1% | +17.5% | −7.1% |
| e1-dry-gulch | +27.5% | −13.1% | −2.5% |
| e1-baron | +34.9% | 0.0% | +1.7% |
| the-claim (mobile) | +3.9% | +4.4% | **+64.7%** |

**No wall-clock claim about a 60-draw-call change is supportable on this machine**, in either
direction. I nearly reported pair 1's desktop numbers as a >15% p95 regression; pairs 2 and 3 show
that would have been reading noise as signal. s1's "p95 unchanged within noise" was the correct read.

### 3. F-R2-1 — the pixel gate, and why instancing fails it

The rig (`e2e/perf-r2-pixels.rig.ts`) compares two arms of the SAME run/window/build/pinned clock,
plus **a control arm**: a second boot of the identical configuration. Treatment is read against that
control, so the verdict is machine-independent by construction.

| Scene (pressure) | treatment changed px | control | treatment-only px | % of frame |
|---|---|---|---|---|
| desktop e1-night-shift | 2,005 | 9 | 1,479 | 0.144% |
| desktop the-claim | 5,521 | 161 | 4,269 | 0.417% |
| desktop e1-dry-gulch | 4,420 | 83 | 3,377 | 0.330% |
| desktop e1-twin-banks | 4,454 | 213 | 2,719 | 0.266% |
| desktop e1-baron | 5,580 | 912 | 3,627 | 0.354% |
| **mobile the-claim** | **37,226** | 2,832 | 27,423 | **1.101%** |

Desktop passes all ten scenes. **Mobile the-claim-pressure FAILS**: 37,226 changed against a bar of
24,905 (1% of the frame). At CSS resolution — the unit the eye actually receives, since the mobile
profile is DPR 2.75 — it is **1.53% changed, mean channel delta 0.4984, against a same-build reboot
control of 0.089% / 0.0194**: 17× and 26× its own noise floor. Downscaling to CSS size does not wash
it out. **The mobile run aborts at that scene, so 6 of 10 mobile scenes are UNMEASURED** — the
verdict rests on the one that failed plus the mechanism, not on a completed mobile sweep.

**The mechanism** (census, the-claim at pressure, both arms same window). At renderOrder 2 the
shipped arm draws 60 `GeneratedClaimJumperSprites` as 60 individually depth-sorted items, interleaved
with `EnemyPool` (10 calls), `GeneratedGoldSeamSprites` (2) and `GeneratedHeroHomesteader` (1).
Instanced, all 60 collapse into ONE item at ONE depth and can no longer interleave with any of them.
`pools.ts` also puts `GeneratedClaimJumperSprites` and `GeneratedClaimJumperThiefSprites` at the same
renderOrder, so variants lose interleaving against each other too. One object occupies one place in
the queue; no amount of sorting inside the batch recovers this.

**Delta forensics** (`artifacts/perf-e1-r2/tools/`, boards in `reviews/shots-perf-r2/`): 68–80% of
changed pixels sit on strong gradients against a 0.8–24% frame base rate (8–70× enrichment), in only
3–8 connected components over 40px, largest at 0.19–0.37 fill — thin bands tracing silhouettes and
glow falloff, **no solid sprite-sized blob**. At 6× and 14× the arrangement, overlap direction and
occlusion are identical. So the picture is *locally* reordered where sprites meet the batches they
used to interleave with, not grossly reordered. At 100% I cannot see it.

That is the gate's second limb — "a visual delta ≤ what a reviewer calls invisible at 100%" — and I
am not taking it. The rig I designed says the mobile scene exceeds its own bar, and **moving my own
threshold to pass my own change is the one move this task forbids.** Boards are in
`reviews/shots-perf-r2/board-*-1to1.png` (arms at 1:1) and `board-*-deltamask.png` (red = instancing
changed it AND a same-build reboot did not) so a reviewer can overrule me on the evidence.

**Cost of the revert: none measurable.** p95 is unresolvable here (F-R2-2), so the −60 calls were a
structural win for hardware this box cannot speak for.

**What would earn it back:** one shared atlas+material for every gameplay-renderOrder sprite batch,
so a single instanced draw contains all of them and cross-batch interleaving stops being a question.
Kept behind `?spriteinstancing` so that redesign starts from a working implementation and a
one-command A/B rather than from scratch.

### 4. F-R2-3 — the shadow-pass parking (SHIPPED)

three.js's shadow pass has no intensity guard (`WebGLShadowMap.js:158-170` checks only
`shadow === undefined` and the autoUpdate/needsUpdate pair), so a full depth pass over every caster
kept running through the dark phase for a sun the night palette had already lerped to exactly 0.

Measured, Night Shift, full tier, desktop (`artifacts/perf-e1-r2/tools/shadowprobe.mjs`):

| Phase | base `7c833197` | branch | delta |
|---|---|---|---|
| true dark (darkness 1) | 85 calls / 156,238 tris | **72 calls / 155,912 tris** | **−13 calls (−15%)** |
| full day (darkness 0) | 84 calls / 156,236 tris | 84 calls / 156,236 tris | **identical** |

Pixel-safety, verified rather than argued: at darkness 1 the diagnostics report
`sunIntensity: 0` **exactly** and `sunPresent: false` on both trees, so the shadow term is multiplied
by zero radiance. On the mobile/lite profile `shadowsQuality: "blob"` and `shadowMapSize: 0` — there
is no shadow-map pass there at all, so the change is doubly inert on mobile. `autoUpdate` is
recomputed every frame inside `LightRig.update()` (line 302, after `applyNightShiftPalette` at line
285), so it cannot latch off into the following day. `castShadow` is untouched, so no material's
shadow-count program key changes and nothing recompiles at the dusk boundary.

### 5. Adjacent suites — 9 reds, ALL control-proven pre-existing

Run `--workers=1`, scratch port 5251 (branch) / 5252 (control), external servers, both projects.
Control = detached worktree at base **`7c833197`**, `/tmp/gr-ctl`, port 5252.

| | branch | control @ `7c833197` |
|---|---|---|
| passed | 24 | 19 (3 specs only) |
| failed | **9** | **9 — the identical set** |

Identical set, spec-and-line: `058-device-tiers:195` (desktop), `e1-night-shift:271 / :372 / :435`
(both projects), `night3d-perf:67` (both projects). **This branch introduces no new red.**

`night-mode-truth` — the lantern READ gate the task makes revert-triggering — is **4/4 green on both
projects** on the branch.

One red is self-evidently not rendering: `e1-night-shift:271` fails on `spriteTint` expected
`#34405a`, received `#44516b` — contract data, which no rendering change can move.

Because `e1-night-shift:435` asserts night luminance, "same test red" was not enough; I compared the
values and established the noise floor:

| | desktop `inside` | mobile `inside` | `outside` (both) |
|---|---|---|---|
| control run 1 | 0.170778 | 0.158463 | bit-identical to branch |
| control run 2 | 0.169944 | 0.157629 | bit-identical to branch |
| branch run 1 | **0.169944** (bit-identical to control run 2) | 0.152570 | — |
| branch run 2 | 0.167140 | 0.153991 | — |

`outside` is bit-identical across every run and both trees. Desktop produced a **bit-identical frame**
to a control run. Mobile sat ~3% low across two samples — above the control's 0.5% spread — which I
chased rather than waved off, and it is resolved by §4: on mobile the shadow map does not exist
(`shadowMapSize: 0`), so this change cannot move a mobile pixel. The residual is lantern-flicker
phase in an n=2 sample, not a regression.

### 6. Boot health

Five E1 maps booted on the branch: all `READY` (run3d + terrain3d), **zero console/page errors**.
Plain boot with no `?debug`, desktop 1280×800 and mobile 390×844: canvas present, **zero errors**.

| Check | Result |
|---|---|
| `npx tsc --noEmit` | clean (before and after) |
| `npm run build` | green (before and after) |

---

## MERGE CLASSIFICATION

Base `7c833197`; branch is a strict fast-forward, **no conflicts, no MAIN-MOVED files** — no commit
landed on `main` under these paths during the shift.

| File | Class | Note |
|---|---|---|
| `src/assets/generated.ts` | LANE-TOUCHED | instancing machinery + the opt-in verdict comment |
| `src/entities/pools.ts` | LANE-TOUCHED | `instanced: true` flags — **inert** while opt-in |
| `src/game/Game.ts` | LANE-TOUCHED | `drawCallCensus()`; zero-count attribution fix |
| `src/world/LightRig.ts` | LANE-TOUCHED | **the only shipped render change** (1 line + rationale) |
| `src/vite-env.d.ts` | LANE-TOUCHED | census type declarations |
| `e2e/perf-r2-*.rig.ts`, `playwright.perfr2.config.ts` | LANE-TOUCHED | `.rig.ts` — dropped by the default config's `testIgnore`, so no machine's wall-clock becomes someone else's red (F-1440-2's cure at the config layer) |
| `artifacts/perf-e1-r2/`, `reviews/shots-perf-r2/` | NEW | censuses, boards, forensic tools |

No `Balance.ts`, Economy, CombatSystem, spawn/wave or `src/game/` sim byte was touched — §4.6 holds.
No threshold was moved: the 33.4 ms shed line and the 115% p95 gate are untouched.

---

## FINDINGS

**F-R2-1 — Enemy-sprite instancing costs cross-batch transparent interleaving. BLOCKING for item 1;
resolved by reverting to opt-in.** Mechanism, numbers and boards in §3. Not fixable by sorting.
Corrective path is a design change (one shared atlas+material across gameplay-renderOrder sprite
batches), which is a spec-sized decision, not a slice — **owner/attended call, parked, not invented.**

**F-R2-2 — The wall-clock arm of the perf instrument cannot resolve a 60-draw-call change on this
box.** Paired samples disagree by up to 65% on the same map (§2). Non-blocking, but it invalidates
any future p95-based keep/revert here: **draw calls, triangles and pixels are the only stable
currencies this machine offers.** Any p95 claim needs many more samples or a quieter host. Recorded
so the next session does not re-derive it — or trust a single pair.

**F-R2-3 — The zero-intensity shadow pass was real and is fixed.** −13 calls/frame at true dark,
bit-identical by day, provably inert on mobile (§4). Non-blocking. **Shipped.**

**F-R2-4 — The pixel rig's absolute floors make its control arm non-binding on desktop.** The asserts
are `max(control + 0.2%, 1% of frame)` and `max(control × 1.5 + 0.02, 0.25)`; the absolute floor
dominates in all ten desktop rows, so desktop "passed" on the floor, not on the control. The control
arm still did its job — it is what proved the mobile failure is 17× its noise rather than boot
variance — but the rig currently cannot fail a desktop scene that sits inside 1%. Non-blocking (the
rig is a `.rig.ts`, opt-in, gating nothing). Corrective option for whoever resumes: make the floor
DPR-aware, or assert against control alone once a scene's control is established as near-zero.

**F-R2-5 — 9 adjacent reds pre-exist at base `7c833197`.** Control-proven (§5), identical set. Not
this branch's to fix and **not this branch's to hide**: `e1-night-shift` is red on three tests on
main, one of them on contract data (`spriteTint #34405a` vs `#44516b`), and `night3d-perf`'s 115%
gate is red on both projects on a machine whose p95 swings ±65% (F-R2-2). Someone owns these; this
review is the notice. Recommend a corrective task against `e1-night-shift`'s tint expectation, which
looks like a genuine stale-expectation red rather than an environmental one.

---

## HONEST LADDER STATE

Reached: item 1 (measured, reverted), item 2's first upgrade (measured, shipped). Not reached: the
rest of item 2's profile, item 3's merging, item 4's demotion proof. The census that items 3 and 4
need is landed, published and reusable, and `mergeCandidates` (co-material meshes sharing a
renderOrder, ≥5 calls) is already computed in every census JSON — item 3 starts from data, not a guess.

Nothing is half-landed: instancing is inert unless flagged, the shadow parking is complete and
measured, and the tree is tsc-clean and build-green.
