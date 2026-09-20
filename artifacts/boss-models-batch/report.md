# boss-models-batch — the Dredge Queen and Old Digger rebuilds, landed with the hunks F-SAR-4 held

Branch `feat/boss-models-batch`, cut from main `b70ef3b31`. Implementer: Opus, scratch worktree, Anthropic
subscription (owner 2026-09-17: "Lets do them all." · "All on the Anthropic subscription").
Every number below was measured on this tree. Nothing was inherited from a predecessor's claim.

**Outcome:** the Dredge Queen and the Old Digger land, each with its held hunk re-applied.
**The Salvage Claw is HELD** — see §6. It has no held hunk, and the rebuilt model is a step back
from the model main already ships.

---

## 1. Per boss — before / after, measured

`before` = main `b70ef3b31` (the 2026-09-12 boss-fidelity land, `d9b9f985c`).
`after` = the model taken from `92f6cc115` with `git checkout`, no merge.
Geometry, materials, images, morphs and bounds parsed straight out of each GLB's JSON+BIN chunks;
optimized bytes measured in `dist/assets` after `npm run build` on this tree.

### E5 — Dredge Queen · `assets/pilots/dredge-queen-3d/dredge-queen-detail-opus5.glb` · **LANDED**

| | before (main) | after (landed) | delta |
|---|---|---|---|
| file bytes | 6,588,168 | 8,297,784 | **+1,709,616** |
| sha256 | `f66ba8b7e03fd899…` | `b79157255a2737a1…` | |
| triangles | 44,920 | 33,124 | **−11,796** |
| mesh nodes | 4 — claw, paddle_port, paddle_starboard, hold | 4 — same four names | 0 |
| per-mesh tri | 11,532 / 6,936 / 6,936 / 19,516 | 11,360 / 3,636 / 3,636 / 14,492 | |
| materials | 1 · `DredgeQueenDetailOpus5Material` | 1 · same name | 0 |
| images | 1 PNG **1024²**, 2,215,910 B | 1 PNG **2048²**, 5,088,005 B | +1024², +2,872,095 B |
| morph cycles | claw `[Damage_SlackClaw]`; three others 1 each | claw **`[Damage_SlackClaw, Cycle_OpenGrab]`**; three others unchanged | **+1 on the claw** |
| animations | 0 | 0 | 0 |
| bounds (x·y·z) | 8 × 5.0437 × 4.4106 | 8 × 5.3305 × 4.5248 | +0.287 tall |
| optimized (dist) | 1,480,976 B (layer contract) | **1,217,764 B** (measured) | **−263,212** |

**The contract the held hunk needs HOLDS:** `Cycle_OpenGrab` is present on the claw mesh at morph
index **1**, with `Damage_SlackClaw` at **0** — the exact shape `033f69c61` gated on. Proven at
runtime, not just in the file: the loader now *refuses* a claw without it, and the model mounts
(`data-dredge-queen3d-mounted="true"`, `…-source="glb"`, four components intact) on both viewports.

### E9 — Old Digger · `assets/pilots/old-digger-3d/old-digger.glb` · **LANDED**

| | before (main) | after (landed) | delta |
|---|---|---|---|
| file bytes | 3,548,152 | 1,959,340 | **−1,588,812** |
| sha256 | `86b3df8a8bc27321…` | `f5efdc4e8871c3f9…` | |
| triangles | 16,104 | 7,192 | **−8,912** |
| mesh nodes | **3** — bucket_wheels (5,528), gantry (2,452), tape_deck (8,124) | **4** — gantry (1,268), tape_deck (3,312), bucket_wheel_port (1,372), bucket_wheel_starboard (1,240) | **+1** |
| materials | 1 · `OldDiggerPaintedMaterial` | 1 · same name | 0 |
| images | 1 PNG 1024², 2,209,575 B | 1 PNG 1024², 1,347,820 B | −861,755 B |
| morph cycles | `Redemption_GentleBuckets` / `_SafeGantry` / `_TealTapeDeck`, 1 per node | the same three, 1 per node; `GentleBuckets` now on **both** wheel nodes | |
| animations | 0 | 0 | 0 |
| bounds (x·y·z) | 12.4 × 5.7879 × 3.559 | 12.4 × 6.6036 × 3.1632 | +0.816 tall, −0.396 deep |
| optimized (dist) | — | **267,216 B** (measured) | |

**The contract the held hunk needs HOLDS**, and its safety condition is measured rather than assumed.
The branch held the GLB wheel spin because main's single `bucket_wheels` node has an *unmeasured
pivot* spanning the whole machine (−6.2…+6.2 in x), so a blind z-rotation would swing the assembly
through the ground. On the rebuilt model each wheel is its own node, pivoted at its own centre:

| node | translation | local half-extent | lowest point while spinning |
|---|---|---|---|
| `bucket_wheel_port` | (−3.9728, 2.2059, −0.0186) | x ±2.227, y ±2.206 | y = 2.2059 − 2.206 = **−0.0001** (rests on the ground) |
| `bucket_wheel_starboard` | (4.6515, 1.6291, −0.0186) | x ±1.548, y ±1.548 | y = 1.6291 − 1.548 = **+0.081** |

A z-spin therefore turns each wheel in place. The review's reason for holding the hunk is gone with
the model that caused it.

### E8 — Salvage King's Claw · **HELD, not landed** (§6)

| | main (kept) | the rebuild (rejected) | delta if landed |
|---|---|---|---|
| file bytes | 4,323,572 | 7,131,704 | +2,808,132 |
| sha256 | `3ae8420b44b79d4a…` | `074dcd02e22801de…` | |
| triangles | 30,844 | 30,100 | −744 |
| mesh nodes | 3 — winch (4,340), anchor_feet (8,224), crown (18,280) | 3 — winch (4,340), anchor_feet (8,224), crown (17,536) | 0 |
| materials | 1 · `SalvageClawDetailOpus5Material` | 1 · same name | 0 |
| images | 1 PNG **1024²**, 2,078,542 B | 1 PNG **2048²**, 4,919,533 B | +1024² |
| morph cycles | `Landing_SprungWinch` / `_SettledAnchorFeet` / `_DarkCrown`, 1 each | identical | **none gained** |
| bounds | 14.4932 × 12.0422 × 14.4932 | 11.4 × 9.9654 × 11.4 | −21 % wide, −17 % tall |
| on screen (loader `scale 0.78`) | 11.305 × 9.393 | 8.892 × 7.773 | **−21 % / −17 %** |

---

## 2. The hunks re-applied — file:line, and what each does

Both were re-applied by **reading the branch hunk against main's current file**, not by merging.
Main's boss-fidelity fields, its yaw convention, its bar-point and shape-hull code all stay exactly
as they are; only the claw and wheel code lands. Net: `src` +31 / −12 across two files.

| # | site | what it does |
|---|---|---|
| 1 | `src/systems/DredgeQueenBossSystem.ts:19-21` | `DREDGE_QUEEN_3D_TRIANGLES` 44_920 → **33_124**, with a two-line comment naming the model's commit (`92f6cc115`) and the numbers measured on it. |
| 2 | `src/systems/DredgeQueenBossSystem.ts:645-650` | the component gate. Was `morphTargetInfluences?.length === 1` for all four. Now `=== (id === 'claw' ? 2 : 1)` **and** `mesh.morphTargetDictionary?.Cycle_OpenGrab === 1` for the claw. This is the half that made F-SAR-4(a) dangerous on main: without the morph the claw would fail the gate, `meshes.size` would be 3, `inspectDredgeQueen3d` would return null and the whole model would drop to `failed`. It is now a *positive* check on a model that satisfies it. |
| 3 | `src/systems/DredgeQueenBossSystem.ts:686-693` | the claw drive. Influence 0 stays main's damage morph; influence 1 becomes `sin(π · clawCycleProgress)²` while `act === 1` and the claw is undamaged, 0 otherwise — the *same* curve `syncPresentation:571-573` already drives the fallback primitive jaws with, so the GLB and the placeholder open together. Main's boss-fidelity emissive fields (`#ffffff`/0.8 intact, damage colour/1) are untouched; the branch's `#fff8e8`/3/2 values were **not** taken. |
| 4 | `src/systems/OldDiggerBossSystem.ts:16-18` | `OLD_DIGGER_3D_TRIANGLES` 16_104 → **7_192**, same comment shape. |
| 5 | `src/systems/OldDiggerBossSystem.ts:21-24` | `OLD_DIGGER_3D_COMPONENTS`: `bucket_wheels` → `bucket_wheel_port` + `bucket_wheel_starboard`, both on `Redemption_GentleBuckets`. `OLD_DIGGER_3D_NODES` derives from it, so the loader, the morph drive and the ground-support scan all follow with no other edit. |
| 6 | `src/systems/OldDiggerBossSystem.ts:665` | `meshCount !== 3 \|\| meshes.size !== 3` → `!== 4 \|\| !== 4`. |
| 7 | `src/systems/OldDiggerBossSystem.ts:713-720` | the GLB wheel spin: `wheel.rotation.z = -this.wheelPhase` on the two wheel nodes, replacing the F-SAR-3/-4(b) hold comment. `wheelPhase` is main's — it already turned the primitive chassis wheels at `syncPresentation:571`; the GLB now turns on the same phase. The comment at the site carries the measured pivots above, so the next reader can check the safety claim without re-deriving it. |

**Deliberately NOT taken from `033f69c61`** (each is main's, per the master and the review):
`presentationCenter` rename and the hoisted centre computation (main's render-interpolated version is
strictly larger); `machineYaw … + Math.PI / 2` (main's yaw convention stays — the review kept it and
the master names it); `labelSprite` max-width; `persistence.writeAtCeremony({…, yaw})`;
`riderVisualHeight`; `visualY` injection; the `cylinder(…, rotateX)` signature — main already has
every one of these from the 2026-09-12 land.

---

## 3. Guard changes, with their causes

| guard / file | change | cause |
|---|---|---|
| `scripts/glb-contract-guard.baseline.json` | **+1 grandfathered line**, `dredge-queen-detail-opus5.glb::texture-over-cap::image 0 2048x2048 > 1024`, plus a dated `texture-over-cap-2026-09-17` class entry | The only LIVE violation the model swap produced. The cause is written into the file both ways: the atlas is **4× the GPU texture memory** of the fidelity bake (`scripts/asset-diet.mjs:119` compresses to WebP and **never resizes**, so the shipped texture really is 2048²), while the shipped GLB is **smaller** — 1,480,976 → 1,217,764 optimized bytes. The pay-down is named: re-bake at 1024² in `build_dredge_queen_detail_opus5.py` (which landed in the same commit) and delete the line. |
| `scripts/asset-diet.manifest.json` | **no change** | Both models keep their existing paths, which the `bosses` family already names one by one. The diet row moved by itself: **raw 26,337,172 → 26,457,976 B (+120,804), compressed 4,989,588 → 4,353,216 B (−636,372, −12.8 %)** — the family got *cheaper to ship* despite the bigger Dredge Queen source. |
| `scripts/deploy.sh` mirror allowlist | **no change** | No NEW GLB path entered the runtime closure: `deploy.sh:394` and `:397` already name `dredge-queen-detail-opus5.glb` and `old-digger.glb`. Proven, not assumed — `node --test scripts/deploy-mirror-allowlist.test.mjs` is green on this tree (§5). |
| `assets/layer-contracts/{dredge-queen,old-digger}.v1.json` | rewritten by measurement | Triangles, atlas size, bounds, component map, asset sha and optimized sha/bytes now describe the models that are actually on the branch. Each keeps a `supersedes` block with the 2026-09-12 values, the date, the task and the reason, so nothing is deleted (CLAUDE.md §4.10b). |
| `assets/pilots/*/README.md` | dated supersession notes | The Old Digger README is Astra's; the superseded fidelity text is quoted beneath it rather than dropped. The Dredge Queen keeps **main's** fidelity README (it is the better document) with a dated note at the top saying what actually ships and why. |

---

## 4. Renderer-count artifacts — nothing re-recorded, and that is the measured answer

**No `artifacts/wire-*-3d/renderer-counts-*.json` file was touched.** The provenance for that decision
is a control run, not an assumption (F-DRB-7 forbids blessing a number you have not measured):

Only two specs own renderer-count artifacts — `wire-crawler-3d` and `wire-railcar-3d` — and neither
loads a Dredge Queen or an Old Digger. Both were red on this branch, so both were re-run with main's
four files checked back into this same worktree (`git checkout b70ef3b31 -- <2 src files, 2 GLBs>`),
same server, same worker count, same machine:

| assert | this branch | control (main `b70ef3b31`) | verdict |
|---|---|---|---|
| `wire-crawler-3d.spec.ts:115` desktop `coldBaseline.triangles` | 149626, band [147704, 147710] | **149626**, band [147704, 147710] | identical → pre-existing |
| `wire-crawler-3d.spec.ts:115` mobile `coldBaseline.triangles` | 146040, band [144118, 144124] | **146040** | identical → pre-existing |
| `wire-railcar-3d.spec.ts:63` desktop `baseline.triangles` | 118628, band [116718, 116724] | **118628** | identical → pre-existing |
| `wire-railcar-3d.spec.ts:63` mobile `baseline.calls` | expected 67, got 68 | expected 67, got **68** | identical → pre-existing |

All four are the F-SAR-7 chain already on main (+1,919 crawler desktop, +1,922 mobile, +1,910 railcar),
whose corrective `reviews/sprite-animator-runtime-land.md` already names. Re-recording them here would
be curing someone else's red inside this drain, which the master's firewall forbids ("attribute, do not
cure").

---

## 5. Gates — every one, with its exact result

| gate | result |
|---|---|
| `npx tsc --noEmit` | **rc=0**, no output |
| `npm run build` | **rc=0**. `bosses` diet row 7 assets, raw 26,457,976 → compressed 4,353,216 (84 %) |
| `GR_RELEASE=e1 npm run build` | **rc=0** |
| `node scripts/first-town-payload.mjs` | **rc=0**, first-town payload **48,914,924 bytes**, 0 demand-paged. These bosses are not in the first town — **zero** matches for `dredge`/`digger`/`salvage` anywhere in the probe's output, as expected |
| `node scripts/glb-contract-guard.mjs` | before the baseline line: **rc=1**, `423 GLBs · 5 violations · 5 grandfathered · 1 live`. After: **rc=0**, `423 GLBs · 6 violations · 6 grandfathered · 0 live` |
| `node --test scripts/glb-contract-guard.test.mjs scripts/deploy-mirror-allowlist.test.mjs` | **rc=0 · 24 pass / 0 fail / 0 skip** |
| e2e battery, both projects, `--workers=1`, own vite on 5410 | **46 passed / 8 failed of 54**, 4.6 min. Specs: `e5-boss-dredge-queen`, `e9-boss-old-digger`, `e8-boss-salvage-claw`, `e3-crawler-boss`, `057-baron-rocket-cart`, `wire-crawler-3d`, `wire-railcar-3d` |
| → `e9-boss-old-digger.spec.ts` | **8/8 green**, both projects — the boss whose loader contract changed most |
| → `e8-boss-salvage-claw.spec.ts` | **4/4 green**, both projects (untouched) |
| → `e3-crawler-boss.spec.ts` | **8/8 green**, both projects |
| → `e5-boss-dredge-queen.spec.ts` | **14/16 green**; the 2 reds are the `:237` p95 gate, below |
| → the 8 reds | 4 renderer-count asserts (§4, identical on the control), 2 × `057-baron-rocket-cart:251` `blast-charge-arm` (**pre-existing on main**, `reviews/drain-review-boss-fidelity.md` §4), 2 × `e5:237` p95 (below) |
| plain boot, no `?debug`, both viewports | **zero console errors, zero page errors, zero failed requests**, canvas present after 9 s |
| presentation probes | **none exist for these three bosses** — `scripts/check-*-presentation.mjs` covers baron, crawler and railcar only |
| `computeEngineHash()` | branch **`95972a35a5172a35bfc743de7f91951f61a97c46e9f71e6d68096335dc21df46`** (main `b70ef3b31` = `df1784d4ae13590b676dbe7482f44c314c6f34946ab8efdff1dd5a953f373890`). `src` and `assets/layer-contracts` are both engine inputs, so this moved; **the drain pins it** |

### The E5 p95 gate — 8 branch runs vs 6 control runs, and what they actually say

`e2e/e5-boss-dredge-queen.spec.ts:237` asserts boss-run frame p95 ≤ 1.15 × the non-boss tile's.
The master says 4+ runs before calling it anything. Here are 8 on this branch and 6 on the control,
all quiet-board, single worker. The spec prints both arms, so these are the numbers themselves, not
pass/fail:

| tree | runs | boss-arm p95 (ms) | non-boss-arm p95 (ms) | reds |
|---|---|---|---|---|
| branch | 8 (16 tests) | 10.3, 16.4, 16.9, 16.4, 16.8, **16.7**, 16.7, 16.0, **16.4**, 16.4, 16.7, 16.9, 16.7, 16.6, 16.6, 16.6 — median **16.65** | 16.7, 15.3, 16.5, 16.8, 16.4, **10.3**, 16.3, 15.5, **10.3**, 16.5, 16.6, 16.6, 16.6, 16.7, 16.6, 16.4 | 2 |
| control | 6 (12 tests) | 9.5, 16.3, 16.5, 16.6, 15.5, 16.4, 16.7, 16.6, 16.4, 16.7, 16.6, 16.6 — median **16.55** | 15.0, 16.4, 16.6, 16.7, 16.6, 16.6, 16.6, 16.6, 15.1, 16.3, 15.7, 15.9 | 0 |

**Verdict: UNMEASURABLE ON THIS HOST, NOT A REGRESSION — F-DRB-10, with a sharper diagnosis.**
The boss arm is the same on both trees (median 16.65 vs 16.55 ms; the 2048² atlas costs nothing this
instrument can see). What flips is the **denominator**: the host alternates between a vsync-locked
~16.6 ms mode and a free ~10 ms mode, and the gate fails exactly when the *non-boss* arm lands in the
fast mode while the boss arm sits at the vsync ceiling — which is what both branch reds are
(`Expected: <= 11.845, Received: 16.7` and `16.4`, i.e. non-boss = 10.3 ms both times). The control's
one sub-15 sample (9.5 ms) happened to fall on the *boss* arm, so it passed at ratio 0.63. Under the
54-test battery both trees degrade further (branch battery: desktop 9.3/16.7 ratio 1.80, mobile
16.5/24.3 ratio 1.47). This is F-DRB-10's own corrective, still owed: a mode-aware comparison with
≥ 8 samples per arm. Nothing here justifies calling the gate against this branch.

---

## 6. What was held, and why

### The Salvage King's Claw — HELD

The master's condition was "land its rebuilt model only if the system's loader accepts it as is **and**
the presentation improves on the board". Measured, it fails on the second and gains nothing on either:

1. **There is no held hunk waiting for it.** F-SAR-4 names two contracts, the Dredge Queen's claw
   cycle and the Old Digger's split wheels. `SalvageClawBossSystem.ts` is byte-identical to main and
   nothing in it is waiting for a model. The rebuild's morph set is *identical* to main's
   (`Landing_SprungWinch` / `_SettledAnchorFeet` / `_DarkCrown`, one influence each). It unlocks nothing.
2. **It is the older lineage, not a newer one.** Main's Salvage Claw is the 2026-09-12 boss-fidelity
   bake, which a drain review checked eyes-on ("a domed pavilion crowned with spires, standing on
   articulated anchor-feet with boarding ladders — a salvage fortress, per F-BF-02's ask"). The
   `92f6cc115` model is the July duel model (same 7,131,704 bytes as `741927814 (archive: pruned by the A3 rewrite)`) re-exported on
   2026-09-10 for a ladder-grounding fix. Landing it would revert a reviewed fidelity pass.
3. **It shrinks the boss on screen.** The loader multiplies by `0.78` (introduced at `37ced849b`, long
   before either model). Main's 14.4932-unit body renders at 11.305; the rebuild's 11.4-unit body
   renders at 8.892 — **21 % narrower and 17 % shorter**. The crown itself is 11.4 wide in both; the
   difference is entirely in the anchor feet (±7.247 → ±5.51) and the crown height (12.042 → 9.965),
   i.e. exactly the fortress stance the fidelity pass added.
4. **It costs a second cap violation for nothing.** +2,808,132 raw bytes and a 1024² → 2048² atlas —
   a fresh `texture-over-cap` grandfather line whose own class prose records that this very asset was
   *paid down* from 2048² once already.

Held with the reason. If the owner wants the 2048² Salvage Claw atlas, the honest route is to re-bake
the **fidelity** body at 2048², not to swap the body back.

### Also held (each already main's, and each named in the review as such)

`src/systems/EchoBossSystem.ts`, `src/systems/LandYachtBossSystem.ts`, `src/game/Balance.ts` —
F-SAR-5 / F-SAR-6, explicitly not this task. Untouched, byte-identical to main.

---

## 7. Findings

**F-BMB-1 — the Dredge Queen trade is real and should be seen, not discovered later.** The landed
model has **11,796 fewer triangles** than the bake it replaces and **4× the texture memory**. The
shipped bytes go *down* (−263,212 optimized) and the eyes-on read is good (§8), but a reviewer
comparing `artifacts/boss-fidelity/e5-dredge-queen/` with §8's captures is comparing two different
fidelity strategies — more geometry at 1024², or less geometry at 2048² — not a straight upgrade.
The one thing that is unambiguously new is the claw cycle. Non-blocking; owner-visible.
**Cure if the owner wants both:** re-bake this atlas at 1024² (one Blender run with the builder that
landed here) and delete the baseline line.

**F-BMB-2 — a contract on main describes a model that is not on main. Pre-existing, not caused here.**
`assets/pilots/salvage-claw-3d/salvage-claw-detail-opus5-asset-contract.json` declares
`sha256 9027a145…, bytes 7131704, triangles 30100` while main actually ships
`sha256 3ae8420b…, bytes 4323572, triangles 30844`. The 2026-09-12 fidelity land replaced the GLB and
left this sidecar describing its predecessor. `assets/layer-contracts/salvage-claw.v1.json` *is*
accurate, so the family has two contracts and one of them rotted. Nothing reads the stale one at
runtime, so it is not a blocker — but it is exactly the kind of drift `glb-contract-guard` exists to
stop, and the guard does not read this file. **Cure (fire-authorable, small):** regenerate the sidecar
from the shipped GLB, or point the guard at it.

**F-BMB-3 — the E5 p95 gate should be repaired, not re-argued every drain.** §5 is the third drain to
re-derive the same bimodality by hand. The measurement is now unambiguous (the *denominator* flips;
the boss arm is identical across trees), which is enough to specify the fix: compare modes, or pin the
boss arm against an absolute budget instead of a ratio to a co-measured tile. Until then every drain
that touches an E5 asset pays this tax.

---

## 8. Eyes-on — captures in this directory

Recipe and runtime state in `capture-report.json` beside them. Both viewports, act 1 (the act each
model changes), `?debug` harness with the specs' own balance settings, camera settled before every frame.

| file | what it shows |
|---|---|
| `dq-desktop-act1.png`, `dq-mobile-act1.png` | the Dredge Queen anchored in act 1 at 1280×800 and 390×844. Reads as a working river vessel: hull, covered paddle wheel, lattice derrick with the grab arm out, red corsair sail with the ghosted crossed pickaxes, stack. ADR-001 holds — no firearm, no gore, a machine. |
| `dq-{desktop,mobile}-claw-{closed,open}.png` | the claw cycle at `clawCycleProgress ≈ 0` and `≈ 0.5`. Frame-diff between the pair: **7.31 %** of desktop pixels, **10.41 %** of mobile. |
| `od-{desktop,mobile}-working.png` | the Old Digger working. **Both bucket wheels are visible as separate assemblies** — the large port wheel and the smaller starboard one — with the tracked chassis and the conveyor gantry between them, teal lamp cells lit, planted on the ground with its shadow. Legible at 390 px. |
| `od-{desktop,mobile}-working-plus400ms.png` | the same frame 400 ms later with the survey frozen (`oldDigger.surveySpeed = 0`), so the machine stands still and **only the wheels move**: **3.13 %** of desktop pixels change, **1.89 %** of mobile. |

Runtime state at capture, all four: `data-*3d-state="ready"`, `…-source="glb"`, `…-mounted="true"`,
**zero console errors, zero page errors, zero failed requests**. Renderer at capture — Dredge Queen
179,036 tri / 93 calls desktop, 136,426 / 73 mobile; Old Digger 114,452 / 95 desktop, 109,888 / 64 mobile.

**The mounts are the contract proof.** Both loaders return `null` (→ `failed`, primitive fallback) on
any mismatch of mesh count, material count, triangle count or morph shape. `mounted="true"` means the
Dredge Queen's claw really carries `Cycle_OpenGrab` at index 1 and the Old Digger really exposes four
meshes at exactly 7,192 triangles, **in the browser**, not just in a file parse.

---

## 9. Commits on `feat/boss-models-batch`

| sha | what |
|---|---|
| `9f2732326` | `feat:` the two models + their build sources, asset contracts and READMEs, both layer contracts, both held hunks, both loader constants |
| `af536dade` | `chore:` the one grandfathered guard line, with the number that pays it down |
| (this commit) | `docs:` this report and the captures |

Nothing outside the master's firewall was touched. `STATUS.md`, `tasks/BACKLOG.md`,
`tasks/goals.json`, `assets/engine-era.json`, the sim, `Game.ts`, `Balance.ts`, the other boss systems
and every e2e assertion are byte-identical to main. Tracked screenshots that the specs rewrote under
`artifacts/**` were restored with `git checkout --` before every commit; the only artifacts added are
the ones in this directory.
