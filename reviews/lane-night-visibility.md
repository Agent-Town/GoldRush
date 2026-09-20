# lane-night-visibility — F-BW-9: fear the dark, but see the fight

- **Slice:** `lane-night-visibility` (lane-a)
- **Branch:** `lane/m3`, lane commit `8e3ed580`
- **Base:** applied as a PATCH onto main `44a748dd` (not a branch copy — see Merge classification)
- **Drained:** s1438, 2026-08-03
- **Verdict:** ✅ **MERGED.** Answers the owner's gate-walk words with the second-smallest A/B arm; firewall respected; every red controlled or inventory-matched.

## What it does

The owner said, verbatim on the 2026-08-03 gate walk: *"it is getting very dark in the night on the map, the lamps don't help really."* At full dark the field read as featureless black and lamp pools felt inert in their outer half. This slice raises the **perceptual floor** and the **lamp visual reach** — render-side only — without touching the physics that make night frightening.

Three render surfaces move, and nothing else:

1. **Ambient floor.** `LightRig` now takes `max(palette.fillIntensity, nightAmbientFloorIntensity * darkness)` — a floor that only engages as darkness rises, so day and dusk are byte-identical.
2. **Lamp reach.** Night pool light `decay` goes `2 → 1.25` (new `Balance.contracts.nightShift.nightLightDecay`). **Every light's distance/radius is unchanged** — the lit area reads fully out to the edge it always had, rather than dying in its outer half.
3. **Pool falloff curve.** The terrain shader's falloff exponent goes `pow(…, 3.0) → pow(…, 1.5)`. Same radius, same falloff width, same exposure/tone.

Plus full-dark palette **colour** fields: background `#000000 → #080a0f`, fog `→ #14141a`, fill `→ #384862`, ground `→ #17120f`, sprite tint `→ #44516b`.

The runner A/B'd two arms and took the smaller one that actually moved the board; the first arm (`0.14` ambient, `1.5` decay, `2.0` exponent) shifted lit share by under one percentage point and was "barely visible."

### Measured effect (wave 12, full dark)

| View | Mean luma | Lit share | Sampled ambient | Hero outer band |
|---|---:|---:|---:|---:|
| Desktop | 37.30 → 49.97 | 36.06% → 48.95% | 0.2939 → 0.3463 | 0.3157 → 0.3749 |
| Mobile | 36.10 → 49.28 | 37.88% → 52.19% | 0.3159 → 0.3649 | 0.2586 → 0.3057 |

The runner's own verdict: *"The fear survives. Full dark still has a black horizon, deep occlusion, and strong separation between safe pools and the surrounding field, but the ground plane and combat silhouettes no longer disappear into featureless black."* Boards at `artifacts/lane-night-visibility/comparison-board.png` (rows = waves 8/12/18; columns = desktop before/after, mobile before/after). **Owner's eye still wanted** — this is a look ruling, and only he can close it.

## Firewall audit

The master's `NO` list: radii · `minLight` · coverage · darkness values · `nightSpeedOutsideLight` · the pools shader **exposure**. Verified by reading the diff:

- `darkness` is still `1` at the dark keyframe — only COLOUR fields moved, which the master's TOUCH-ONLY explicitly permits.
- No radius, distance, `minLight`, coverage or speed constant appears in the diff.
- `uTerrain3dNightPoolIntensity` (the exposure uniform the in-flight `beauty2/pools` shift owns) is **untouched**; only the falloff exponent moved, which the master's scope item 2 explicitly authorises ("brighten the render curve inside the existing radius, never widen it").
- `night-mode-truth.spec.ts` and `night3d-perf.spec.ts` are **unmodified** — the self-check demanded they stay green *unmodified*, and they are absent from the diff entirely.

## Evidence

Gated in a detached worktree `gate-s1438` at main (§3.0b — undecided content never entered main's working tree). Port **5188 was HELD** by a live lane under `strictPort`, so every run used scratch port **5199** via `GR_CAPTURE_EXTERNAL_SERVER=1`. Every playwright command passed `--workers=1` (§3.1).

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | clean |
| `npm run build` | ✓ built in **1.53s** |
| `night-mode-truth` + `night3d-perf`, both projects | **6 passed / 2 failed** — both failures are `night3d-perf:67`, disposed of below |
| 6 adjacent suites by grep, both projects | 28 passed / 17 failed — **all 17 disposed of below** |
| Boot probes (`_s106-prospector-boot-probe`, `f1297-2-plain-boot-tape-button`), both projects | **4 passed**, zero console/page errors |

Adjacent suites derived **by grep** (`nightShift|LightRig|nightAmbientFloor|nightLightDecay|night-mode|night3d` over `e2e/`), per the house recipe.

### The 17 adjacent reds, and how each was disposed of

**15 matched `logs/suite-red-inventory.md` BY TITLE** — and, reproducing F-1436-2 for the second fire running, **0 of 15 matched by coordinate** (the inventory records the failing assert's line; the run reports the test's opening line). Look them up by title.

| Test | Projects | Inventory rate |
|---|---|---|
| `e1-night-shift` — loads Night Shift contract data and ramps full, dusk, dark, dawn lighting | both | 88/98 (89.8%) |
| `e1-night-shift` — lantern post is Night Shift gated and relights a true-dark light ring | both | 34/38 (89.5%) |
| `e1-night-shift` — a lantern pool makes only its build island readable at true dark | both | 15/40 (37.5%) |
| `e1-night-shift` — cold lantern relight costs survive run suspend and continue | desktop | 2/39 (5.1%) |
| `terrain3d-registry` — all sixteen contracts mount terrain, panorama, grounded landmarks | both | 25/54 (46.3%) |
| `terrain3d-registry` — rim and horizon probes keep the terrain meeting gradual | both | 31/53 (58.5%) |
| `terrain3d-registry` — all fifteen contracts stay painted in LITE / invalid terrain bytes | both | 17/30 (56.7%) |
| `terrain3d-registry` — terrain2d and the 3D default stay byte-identical per map | desktop | known TIMEOUT |
| `terrain3d-registry` — each registered terrain and panorama inside the 115% p95 budget | both | known TIMEOUT |

⚠️ These sit in suites this slice's subject matter touches, so the inventory alone was **not** treated as sufficient for the e1-night-shift set — see the control evidence below, which covers the whole tree, not one test.

**2 reds were absent from the inventory and were controlled, not waved through:**

**(a) `terrain3d-registry.spec.ts:392` — "disposing while the peer GLB is delayed releases each decoded model immediately"** (desktop). **REFUTED as battery contention.** Green **2/2 in isolation on the merged tree**, and green on the control tree. It appeared only inside a 46-test / 23-minute battery. Nothing in this slice touches GLB loading or disposal.

**(b) `night3d-perf.spec.ts:67` — "daylight matrix and Night Shift pressure stay within the painted 115% p95 gate"** (both projects). **REFUTED BY CONTROL — this gate is RED ON CLEAN MAIN in the fire shell.** This is the one that mattered: a render change that lights more fragments is exactly the kind that *should* be priced by a p95 gate, so it was measured rather than argued.

Control taken in the **same worktree, same server, same port**, by reverting the four code paths to main and proving main-equivalence with an **EMPTY** `git diff --name-only HEAD -- src assets e2e`.

| Tree | Desktop ratio | Mobile ratios (3 samples) |
|---|---|---|
| **Control (= clean main)** | **2.054 RED** | PASS · 1.5617 RED · 1.3938 RED |
| **Merged (this slice)** | **1.6875 RED** | 2.333 RED · 2.0246 RED · PASS |

Gate is `ratio ≤ 1.15`. **Clean main fails it on both projects.** The distributions overlap, both trees pass 1-in-3 on mobile, and **the merged tree's desktop number (1.6875) is materially BETTER than control's (2.054)** — a regression cannot make the measured cost go down. This is F-1180-2's load-ceiling signature: the ratio swings 1.39–2.33 across identical code, and three Codex runners were live throughout.

⚠️ **Stated honestly, because the numbers do not fully exonerate the slice:** the two highest mobile ratios ever recorded (2.333, 2.0246) are both on the merged tree. With n=3 per arm and a spread this wide, **this instrument cannot resolve a real mobile cost of the size a render change like this might plausibly add.** The slice is not convicted, but neither is it proven free — and the honest reason is that the gate meant to answer the question is broken on main. See F-1438-1.

## Merge classification

- Applied as a **patch** (`git cherry-pick -n 8e3ed580`) onto main `44a748dd`, **not** a branch merge. `lane/m3` sits 3 ahead of main, but its two lower commits — `b925d706` (f1429-1) and `b295e2ab` (drill-yard-separation) — were already absorbed by graft in s1431 (`b11cdb88`) and s1432 (`9920d282`). A branch-level merge would have re-imported two stale, already-shipped trees; the patch imports exactly the one new commit.
- **Zero conflicts.** All four code paths applied clean; main had not moved any of them.
- Per-file: all **LANE-TOUCHED**. `artifacts/lane-night-visibility/**` is a pure add (20 files).
- `lane/m3` is a **live lane** (running `tb-water-look` at drain time); its worktree was never touched.

## Findings

**F-1438-1 🟡 — `night3d-perf.spec.ts:67` fails on clean main, and it is absent from the red inventory.** Measured this fire: clean-main desktop **2.054**, clean-main mobile **1.5617 / 1.3938** against a `≤1.15` gate, with only 1 of 3 mobile samples passing. This is a **perf gate that cannot currently price any night-render change** — it reds regardless, so it will wave through the next regression exactly as readily as it flagged this slice. It is also missing from `logs/suite-red-inventory.md`, so every future drain will re-derive this control run from scratch (this fire spent ~10 minutes doing so). **Non-blocking for this merge** (proven pre-existing), but it should be inventoried and then either re-baselined or made load-robust. Filed to the BACKLOG; needs a real investigation, not a threshold bump. 🚫 **Do not "cure" this by raising the 1.15 ratio** — that discards the only instrument that prices night render cost.

**F-1438-2 🟢 — the falloff exponent brushes an in-flight shift's surface.** The master's coordination rule reserves *pool core exposure* for `beauty2/pools`, and this slice honours that (the exposure uniform is untouched). But it does change the falloff **curve** in the same shader block, which its own scope explicitly authorised. When `beauty2/pools` lands, whoever drains it should expect this hunk in the neighbourhood and read both together rather than assuming a conflict. Informational.

**F-1438-3 🟢 — this master had no goal-tree leaf.** `drain-block-check` returned **UNKNOWN** (no leaf matched), as it did for **all six** done-moves in this pile. The 2026-08-03 17:13–18:16 attended gate-walk campaign authored its masters without registering leaves, which is the Goal Registration Law's authoring half going unfulfilled at scale. Leaf registered and flipped to `merged` in this fire (s1432/s1437 precedent). ⓘ This pile is also *why* s1437's F-1437-2 was possible: with no leaf of its own, a master falls through to prefix matching.

## Owner note

The look is his call, not mine. The boards are at `artifacts/lane-night-visibility/comparison-board.png` — **one glance answers whether the lift is right**, and it pairs with the drill-yard copy look (F-1432-4) already waiting on his eye.
