# Review — the coal moves onto its own claim, and the reason the owner never found it

**Slice/branch/tip:** `worktree-agent-a383c2ed5dd452ebd`, base `4ab4981de`. Headless Opus-5 agent.
**Verdict: PROPOSED — GREEN. Two owner items, both executed and both measured; the ruling's lever
works and does not admit either map, and the playtest report is fully explained with a shipped cure.**

Two owner items, 2026-08-21:

1. **RULING**, to the F-E2PL-1 lever, verbatim: **"sounds like a good idea"** — let a contract author
   its own coal.
2. **PLAYTEST REPORT**, verbatim: **"I was not able to ever obtain coal or use the pressure weapons
   when I played maps in E2"**.

---

## PART 1 — THE `coalSeams` VOCABULARY

### The diff, in three places

| where | change |
|---|---|
| `ContractFamilies.ts:1543` | `coalSeams` joins `AUTHORED_TWIST_KEYS` — the validator's allowlist |
| `ContractFamilies.ts` (twist type + `validateAuthoredContractShape`) | `coalSeams?: ContractHarvestAnchor[]` with schema validation |
| `PressureSystem.ts` | `DEFAULT_COAL_SEAMS` exported; the constructor takes optional anchors and falls back |

**The schema refuses three things on purpose**, because each would be a silent lie: an **empty list**
(it would fall back to the constant while reading as authored), a **seam without a finite place**, and
— the one worth naming — **coal on a contract that declares no `pressureEnabled`**, since nothing
could ever burn it. The shape is deliberately `harvestAnchors`' own `{x, z}`: a seam is a place, not
a machine (Mistake #14 — the contract disposes).

Both engines read it through **one expression each**, written identically:
`Game.ts:1538` and `HeadlessContractSim.ts:821` both pass `twist.coalSeams`.

### Zero-change proof for the maps that ship today

`e2-hill-mine` and `e2-pressure-garden` author nothing, so they get `DEFAULT_COAL_SEAMS` — the same
three coordinates the module constant always held. Measured, not asserted: the Hill Mine's shipped
pin reproduces **exactly** after every edit in this slice —

```
e2-hill-mine-01  SECURED w15  fnv1a32:c40556c0   (shipped value, re-run 3x across the slice)
```

And the Pressure Garden's authored `coal-bed-terrace` (x −28..28, z 36..44) **contains all three
default seams**, which is the constant's own provenance: it was authored for the mine/garden pair.

### The seams each map now owns

Placed at the Hill Mine's measured standard — its three seams sit **29.5 / 31.4 / 27.2 wu** from its
stake, mean **29.4**.

| contract | stake | authored seams | distances | mean | reads as |
|---|---|---|---|---|---|
| `e2-trestle` | `south-boiler-site` (12,−12) | (−16,−20) (−20,−16) (−12,−24) | 29.1 / 32.2 / 26.8 | **29.4** | a coal bank along the mine spur on the south approach — **no gorge crossing** |
| `e2-incline` | `lower-engine-house` (−24,−18) | (0,−28) (4,−26) (7,−22) | 26.0 / 29.1 / 31.3 | **28.8** | a coal bank in the lower yard feeding the winding engine, clear of both haul lines |

Both clusters sit on flat ground outside the bowl/ramp features, ≥5wu off the rails the railcar
rides, and on the hero's own bank. **Before this, both maps' fuel was 55wu and 58wu away.**

### Re-proof — the lever works, and neither map converts it

131 runs this slice: a **64-run** re-search of best play on the new economics, **32 battery runs**
(every row twice, **all 32 identical both passes**), and coal-reach probes. `line` uses the pressure
line; `deep` is the deepest run of any kind; `dry` declines the line entirely.

| run | outcome | hash ×2 | fires (lance/mortar/rocket) | pressure spent |
|---|---|---|---|---|
| `line-e2-trestle-01` | unsecured **w10** | `e6fe4301` | 52 / 17 / 15 | **368** |
| `deep-e2-trestle-01` | unsecured **w12** | `096a69c6` | 0 / 0 / 0 | 0 |
| `dry-e2-trestle-01` | unsecured **w12** | `8c28f1ff` | 0 / 0 / 0 | 0 |
| `line-e2-trestle-02` | unsecured **w12** | `053b81d6` | 8 / 20 / 18 | **384** |
| `deep-e2-trestle-02` | unsecured **w13** | `823139ae` | 0 / 0 / 0 | 0 |
| `dry-e2-trestle-02` | **SECURED w18** | `bc515b13` | 0 / 0 / 0 | 0 |
| `line-e2-incline-01` | unsecured **w6** | `b90667b6` | 0 / 0 / 0 | 0 |
| `dry-e2-incline-01` | unsecured **w6** | `83b0a873` | 0 / 0 / 0 | 0 |
| `line-e2-incline-02` | unsecured **w10** | `5607b921` | **288** / 6 / 4 | **384** |
| `dry-e2-incline-02` | unsecured **w8** | `dac0c325` | 0 / 0 / 0 | 0 |
| `idle-*` ×4 | unsecured **w2 / w1 / w2 / w2** | `05c59970` `a438e2ff` `13911bf5` `7f25d30c` | 0 | 0 |

**THE ECONOMICS DID INVERT, exactly as predicted — and it was not enough.** Pressure delivered
**doubled** on both maps (192 → 368 on the trestle, 192 → 384 on the incline; the incline's lance
fires went 164 → 288). The incline's ceiling moved w9 → **w10**. But across 96 measured runs on the
new coal, **the only secure in the programme is still `dry-e2-trestle-02`** — the run that declines
the line.

**THE ATTRIBUTION IS STRONGER THAN LAST TIME.** All four `dry` controls reproduce the pre-ruling
hashes **bit for bit even though the seam coordinates moved** (`8c28f1ff` / `bc515b13` / `83b0a873` /
`dac0c325`), and all four idle floors are unchanged. A rider that declines the line cannot tell the
authoring happened. **Neither ruling moved any balance.**

**Per map, judged independently — both rows STAY, reworded to the new ceiling:**

- **`e2-trestle`** — seed 01 still never secures (w10 with the line, w12 deepest). The wall is the
  `hpScale: 30` railcar, not the fuel: 384 pressure and 46 arsenal shots reach it and it lives.
  **This is now [F-1608-2]'s question and nothing else.**
- **`e2-incline`** — refuses for a reason the coal never touched: the hero dies at **wave 6 of 12** on
  seed 01 with two turrets standing, in every measured ladder. Four spawn edges onto a lower-yard
  stake it cannot leave. The fuel arrived; the claim did not survive to spend it.

---

## PART 2 — WHY THE OWNER COULD NOT GET COAL

### It was never buried, and the reason is worth pinning

The suspicion was the F-SEAM-1 class — `PressureSystem` is **not** on
`Game.resampleVisualHeights()`'s list, the omission that buried the gold seams up to 6.18 m. Measured
on the far side of the GLB mount, plain boot, both viewports, all three maps:

| contract | seam | visualY | groundY | gap vs `groundY + 0.32` | drawing |
|---|---|---|---|---|---|
| `e2-hill-mine` | (−12,39) / (−5,43) / (3,39) | 4.845 / 5.039 / 4.814 | 4.525 / 4.719 / 4.494 | **0.000 / 0.000 / 0.000** | yes |
| `e2-trestle` | (−16,−20) / (−20,−16) / (−12,−24) | 0.590 / 0.573 / 0.566 | 0.270 / 0.253 / 0.246 | **0.000 ×3** | yes |
| `e2-incline` | (0,−28) / (4,−26) / (7,−22) | −0.030 / −0.029 / −0.035 | −0.350 / −0.349 / −0.355 | **0.000 ×3** | yes |

**And the mechanism behind that clean result is a real difference, not luck.** `GoldNode` places its
sprite **once** at spawn, so it needed the hook. `PressureSystem.syncSeams()` recomputes
`Terrain.visualAnchorY` **every frame** inside `update()`, so a late-mounting sculpt is picked up on
the next tick — the coal is self-healing by construction. **`PressureSystem`'s absence from
`resampleVisualHeights` is CORRECT; do not "fix" it.** That sentence is now a comment on the guard,
because a future janitor reading the F-SEAM-1 story would otherwise add a redundant hook.

The mechanic also works: **standing on a seam for 0.8 s yields its 4 coal**, verified on all three
maps × both viewports (`coal=4`, `harvested=[true,false,false]`).

### So what a fresh player actually saw — three compounding facts, none of them a bug

1. **The coal is off-camera from the stake.** The plain-boot frame at the Hill Mine's boiler-house
   site shows the stake, the rail cut and the headframe; the coal is 29wu north, **off the top of the
   screen**. Nothing in the opening view suggests there is anything worth walking north for.
2. **THE BRIEFING NEVER MENTIONED COAL.** This is the finding. The Hill Mine's card names the
   terraces, the switchbacks and the flooded gallery — and says nothing about the fuel its own
   pressure line runs on. Meanwhile **`e2-pressure-garden`'s card had said it all along**: *"The coal
   seams cluster on the highest terrace above the boiler beds."* One map in the epoch taught it; the
   one the player meets first did not.
3. **The lump reads as scenery.** A 0.46-radius near-black dodecahedron (`#332d29`, emissive 0.06)
   among ambient scatter rocks of the same size and colour family. The one marker that would separate
   it — the orange survey ring — renders **only** with the `coal_survey` research node, whose own
   text is the single other place in the game that says coal exists.

### The cure, and why it is this one

**The missing sentence, in the house's own voice, on the card the player reads on Begin** — the line
`e2-pressure-garden` already had, now on the three maps that lacked it:

- `e2-hill-mine`: *"Coal seams lie at the mine mouth on the top terrace, north of the boiler-house site."*
- `e2-trestle`: *"Coal seams lie along the mine spur on the south approach, west of the boiler site."*
- `e2-incline`: *"Coal seams lie in the lower yard between the haul lines, east of the engine house."*

It is pure contract data, it moves no balance (hash re-proved after), it costs no UI code, and it is
strictly smaller than a tooltip or a prompt. **What I deliberately did NOT do:** brighten the coal
material or make the survey ring always-on. The first is art direction and the second would nullify a
research node whose entire value is marking the seams — both are owner calls, raised as F-E2CS-1.

### The owner's acceptance test, shot for tomorrow

`artifacts/e2-pressure-line/coal-shots/` — desktop 1280×800 and mobile 390×844, three frames each,
in the order a player meets them:

1. `acceptance-1-briefing.png` — the card, now carrying the coal line as its fourth rule.
2. `acceptance-2-coal-seen.png` — the lump on screen, uncut, `inView: true` asserted, `coal: 0`.
3. `acceptance-3-coal-cut.png` — after standing on it: **`coal=4`, seam spent**.

---

## Gates

| gate | result |
|---|---|
| `tsc --noEmit` | clean (re-run after every edit) |
| `e2-hill-mine` shipped pin | `fnv1a32:c40556c0` **unmoved**, re-measured 3× |
| battery ×2 per row | **32/32 rows, both passes identical** |
| dry controls vs pre-ruling hashes | **4/4 byte-identical with the seams moved** |
| idle floors (Law 2) | **4/4 unchanged**, w1–w2, 0 secured |
| `e2e/er01-e2-census.spec.ts` + `e2e/contract-briefings.spec.ts` | **11 passed** |
| `coal-visual-probe` × 3 maps × 2 viewports | **6/6 green**, 0 console/page errors |
| `coal-acceptance` × 2 viewports | **2/2 green** |
| `e2e/seam-visual-follows-sculpt.spec.ts` | extended with the coal pin |

## Findings

- **F-E2CS-1 — the coal lump reads as scenery, and the only cure inside render bounds is art or a
  research nerf.** A 0.46-radius `#332d29` dodecahedron at emissive 0.06 is indistinguishable from
  the ambient scatter it sits among; the survey ring that would separate it is gated behind
  `coal_survey`. **OWNER:** brighten/enlarge the lump (art direction), or give it a faint always-on
  ember tell and leave the ring as the node's at-range/through-fog value. The briefing line shipped
  here tells a player coal EXISTS and roughly where; it does not make the object legible when he is
  standing over it.
- **F-E2CS-2 — an agent cannot LOCATE the coal through the public grammar.** The seam positions reach
  the prover only through `sim.pressure.diagnostics`; the VIEW carries no coal. This is exactly the
  F-E3CF-5 shape that was just cured for gold seams (`now.seams` gained `x`/`z`/`anchorIndex`).
  **Fire-authorable**, and cheap: publish the seams on the stable prefix beside `map.seams`.
- **F-E2CS-3 — `PressureSystem` must stay OFF `resampleVisualHeights`.** Recorded as a comment on the
  extended guard: its per-frame resync is why coal never suffered F-SEAM-1, and adding the hook would
  be a redundant no-op that reads like a fix.
- **F-E2CS-4 — the fuel is no longer the trestle's wall, so [F-1608-2] is now its ONLY lever.** With
  384 pressure and 46 arsenal shots delivered on its own ground, seed 01 still stops at w10–w12
  against the `hpScale: 30` railcar. The remaining question is the difficulty ruling and nothing else.
