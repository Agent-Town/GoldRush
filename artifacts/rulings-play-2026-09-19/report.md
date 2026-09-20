# rulings-play-2026-09-19 — six owner rulings on play and art, executed

**Master:** `tasks/rulings-play-2026-09-19.md` · **Branch:** `feat/rulings-play-2026-09-19`, scratch worktree cut from main `7bec53556` · **Implementer:** Claude Opus 5 on the owner's Anthropic subscription, 2026-09-19, Node 26.4.0 (`/opt/homebrew/bin`), dev server port 5309 only, playwright `--workers=1` with `GR_CAPTURE_EXTERNAL_SERVER=1`.

**The ruling, verbatim (owner, 2026-09-19):** "I agree with all your recommendations on the decisions - good work" — on `docs/OWNER-DESK-2026-09-19.md`, every recommendation taken. The thread behind all six is his D1 of 2026-09-07: "AI and human users have to have the same options and tools, otherwise it is unfair".

Every number below was measured on this tree by a command named beside it. Nothing is inherited.

---

## Verdicts

| # | ruling | verdict |
|---|---|---|
| 1 | **F-HEAT14-3** (a) publish pressure in the agent view | **LANDED** — `now.pressure`, contract-scoped, both engines |
| 2 | **A1** (a) the Eclipse gets the Mare Claim's numbers | **LANDED (the census pin)** — the engine half was already on main before the ruling |
| 3 | **F-OMA-4** yes, the Twin Banks fords | **LANDED** — +4.67 waves on the plain boot |
| 4 | **F-NCS-5 / F-NCS-6** (a) wake the Claim Jumper | **PARKED** — the diff is proven; ten pinned suites name the old slot |
| 5 | **F-POC-4** (a) accept the wheel at the 14-back station | **LANDED** — desktop HUD coverage 39.1 % → 0.0 % |
| 6 | **F-SSL-3** take the prospector regenerations | **LANDED** — 64 cells, halo guard PASS |

**Engine hash:** `cc3fd5d45add762f…` → **`78c43d60c8810afe…`** (`78c43d60c8810afec3a0b3b7cab7e51b58dd7e09019eeec1b72242e4d316482e`), measured on the branch tip. `assets/engine-era.json` is UNTOUCHED — the pin is the drain's. THREE `ENGINE_SOURCE_INPUTS` members moved: `src/` (the view field and the manifest rule), `assets/contracts/epoch-1-frontier/contracts.json` (the fords) and `assets/contracts/null-floors.json` (the re-minted floors). `assets/layer-contracts/characters.v2.json` is byte-identical to main — item 4 was reverted whole. The only sim-semantics change is the ruled Twin Banks spawn edges.

---

## 1. F-HEAT14-3 — the E2 pressure gauge, published

**The ruling.** Desk option (a): *publish pressure (value, band, coal seconds) in the agent view as one additive field, named in the skill fence.* The finding behind it, the heat-14 rider's own words: on the Trestle and the Incline it read the union of `now` keys across its whole run and found *no pressure value, no band, no coal count, no boiler fuel*, while `boiler_house` sat on its price list at 70 gold × 3 — so 210 gold of boiler was "a strictly dominated purchase" and F-MAPL-1's `coalSeconds` 12 → 36 "only triples the duration of a process I cannot observe".

**The field.** `now.pressure`, present only where `twist.pressureEnabled` and the consumer is live — the SAME predicate `Game.activeResourceSnapshots` filters the human's HUD gauge on, so a map that draws the gauge for the human publishes it for the rider and a map that draws neither publishes neither.

```
now.pressure = {
  stored, cap,                         // the needle and its ceiling, floored as the HUD floors them
  band: 'empty'|'low'|'working'|'high',
  safeBand: {min,max} | null,          // null until `pressure_assay`, the HUD's own research gate
  coal, coalSeconds,                   // lumps in hand, and the burn those lumps buy
  boilers: {built, hot, cooling, max},
  vents,                               // how often the valve has blown off
  objective: {active, failed, complete, hotBoilers, waves},
  seams: [{id, x, z, harvested, progress, marked}],
}
```

**NO VENT VERB, and that is parity rather than an omission** — the human has no vent key either. `PressureSystem.update` vents by itself above `safeMax` ("Above the safe band, the valve vents with a warm puff", `src/ui/WorldInfoNotes.ts:74`). `vents` counts the puffs so a rider can read the waste it is paying for. The desk decides later if a key is ever wanted.

**NO VIEW-VERSION BUMP — F-RP-1.** The master's scope line asks for one; the firewall (and the launcher) forbid `assets/engine-era.json`, which is where the version lives. The conflict resolves by the registry's OWN rule rather than by preference, and the rule is written in two places on this tree: `src/agent/View.ts:39–47` ("No view-schema version bump goes with them, and that is the registry's own rule rather than an omission") and `public/skill.md` ("Contract-scoped fields such as `now.preserve` … are absent from the stamped set, and so do not move the version"). The mechanism is `scripts/view-schema-guard.test.mjs`, which builds the canonical field list from **`the-claim`** — an E1 map with no boilers — so a contract-scoped `now` field never enters `viewSchema.fields`. **Measured: `view-schema-guard` 3/3 green on this tree, including its own mutation proof that an unbumped addition reds.** The bump is available to the drain in one line if the owner wants a version stamp anyway.

**Measured (`artifacts/rulings-play-2026-09-19/pressure-rider-probe.json`,** the E2 census's own rig: buffed spark rig, two boilers placed free, hero stood on the contract's first coal seam, every E2 map, plus an unrigged plain-economy arm):

| contract | arm | secured | peak stored | bands seen | coal (s) | seams dug | boilers built/hot | vents |
|---|---|---|---|---|---|---|---|---|
| e2-trestle | census rig | yes, w12 | **78** | empty → working | 1 (36 s) | 1 of 3 | 2 / 1 | **14** |
| e2-incline | census rig | yes, w12 | **78** | empty → working | 1 (36 s) | 1 of 3 | 2 / 2 | **14** |
| e2-hill-mine, e2-pressure-garden | census rig | yes, w12 | 0 | empty | 0 | 0 | 2 / 0 | 0 |
| all four | plain economy | no | 0 | empty | 0 | 0 | 0 / 0 | 0 |
| **the-claim (control)** | — | — | **no `now.pressure` field at all** | | | | | |

The two maps F-HEAT14-3 was written about move every row. The Hill Mine and the Pressure Garden do not under this harness because their seams are `DEFAULT_COAL_SEAMS` on the Hill Mine's minehead, far from where the rig teleports the hero; the E2 census's own longer run does reach them (it asserts `vents > 0` for all four and passes). The plain-economy arm is the honest other half: the rider cannot afford 70 gold of boiler before wave 1–3, which is the *reason* the mechanic needed publishing.

**Also landed:** a `pressure_reading` rule in `stablePrefix.mechanics` naming the field beside the four rules (`pressure_bands`, `pressure_auto_vent`, `pressure_generation`, `pressure_powers`) that were published all along; an E2 paragraph in `public/skill.md`'s EPOCH LEVERS section; `now.pressure` added to the contract-scoped list in the View-schema section (and the paragraph DE-DUPLICATED — it was present twice with two different field lists, unpinned by any guard); and the E2 census re-pinned with a dated cause naming F-HEAT14-3, asserting the new rule, the gauge itself, and the both-sides-of-the-gate `toBeUndefined()` for a map with no boilers.

**One deliberate subtlety, documented in the type:** `band` is derived from the DRAWN needle (`stored`, floored), not from the raw balance. They differ by at most one integer on a fractional tick — at a true 80.4 the engine's `PressureSystem.band` reads `high` and vents while both gauges read 80 and `working`. The HUD's reading is the one taken, because the fairness rule is that the rider gets the human's instrument, not a better one.

**Gate:** `e2e/er01-e2-census.spec.ts` **8 passed**, both projects, one worker.

---

## 2. A1 — the Eclipse's air

**VERIFY-DON'T-INHERIT (Mistake #4).** The slice A1 asks for is already on main and was before the ruling was given. `e0c92bbb9` (2026-09-06, "e8-air-wall-all-maps — the same air wall on every Orbital contract, engine half", owner: "yes, same air for all space contracts") authored `{ regolithRequired: 4, regolithWindowWaves: 4 }` on the Eclipse, and `E8SuitAirSystem.requiredGrounds` has read the contract's own number since the same commit. `scripts/eclipse-winnable.test.mjs` already guards both values in the owner's words ("{4, 4} is the owner's number"). **Nothing in `src/systems/E8SuitAirSystem.ts` or the Eclipse's twist needed to move, and neither was touched.**

**What was owed, and landed:** the census row. `er01-e8-census.spec.ts` pinned each E8 map's dependency, rules and seeds and said nothing about the air gate, so a map could lose its window silently. It now pins per id with the ruling's cause — the two REGOLITH maps assert `{4, 4}` and no crossing key, the two CROSSING maps assert `{crossingRequired 4, crossingWindowWaves 4}` and no regolith key, because the owner took (a) and not (b).

**Measured with the current grammar** (`artifacts/rulings-play-2026-09-19/eclipse-ride-01.json`, seed `e8-eclipse-01`, 84 turns, 28 draft picks):

| | value |
|---|---|
| gate | `required` 4 of 6 grounds, `windowWaves` 4 |
| latch closes | **t = 447.6 s, wave 14, WINDOW 3**, grounds [2,3,4,5] |
| window-held pans | **90** |
| breathless pans / pans on air | 0 / 192 |
| outcome | **secured**, wave 20, 600 s, 140 gold, 923 kills, `fnv1a32:98994a5b` |

The fourth credit cannot exist before window 3, which is the whole of the ruling, and the map still secures.

**F-RP-2 — the 2026-09-06 Eclipse prover CANNOT REPLAY.** `artifacts/eclipse-winnable/prover.mjs` still emits `MOVE_TO` and `HOLD`, retired by ADR-005 stage 3; one unknown verb refuses the WHOLE array, so the rider stands still and gr-sim runs to the prover's own stall guard: `ride stalled: 400 turns without terminating`. The 2026-09-06 file is left byte-untouched as the record of what it measured then. `artifacts/rulings-play-2026-09-19/eclipse-rider.mjs` is the same policy with `MOVE_TO`+`HOLD` → `MOVE_HERO`, which is the engine's own shape since the hero became the body that breathes (`HeadlessContractSim` credits a pan against ACTOR 0's suit, and the Prospector drifts to the hero).

**Gate:** `e2e/er01-e8-census.spec.ts` **6 passed / 2 failed**. Both failures are `e8-mare-claim` at `:108` (`engineDependencies[0].status` is `landed` since the map-art campaign while the census still pins `missing`) — above and independent of this commit's block, and **reproduced on a control tree carrying main's own spec file**. The `e8-eclipse` row passes on both projects.

---

## 3. F-OMA-4 — the Twin Banks fords

`lanes.spawnEdges` `["north","south","east","west"]` → `["north","south"]`. No E1 contract authors `spawnGates`, so `WaveSystem.spawnAt` places every body on the hero-centred ring at radius 26 from EACH listed edge; with all four listed the ring closed from every quarter at once on a claim whose briefing rule 2 reads "Two fords carry pressure across the river". The wave BUDGET does not move — `WaveSystem.planWave` sizes a wave from `waveBudget(wave)`, not from the edge count.

**Measured: `GR_PLAYABILITY_SECURE=1` plain boot, desktop-chrome, three runs per arm, quiet host.**

| arm | run 1 | run 2 | run 3 | mean peak wave |
|---|---|---|---|---|
| **before** | wave 13 / 402.3 s | wave 13 / 399.3 s | wave 12 / 367.5 s | **12.67** |
| **after** | wave 16 / 487.7 s | wave 19 / 576.1 s | wave 17 | **17.33** |

**+4.67 waves; every AFTER run above every BEFORE run.** 0 console / 0 page errors on all six. The open-maps report predicted +1 from a single pair; this is what three runs an arm measure. The map still does not reach its secure wave of 20, so the instrument FAILS in both arms — `peakWave` is the measurement, not the verdict. The third AFTER run ended "the page stopped answering" at peak 17, a harness stall with 0 console and 0 page errors.

**F-RP-3 — the cure needs FIVE edits, not the two `artifacts/open-maps-acceptance-e1-e4/report.md` §5c named.** §5c ran only `e1-twin-banks.spec.ts`. The other three, each found by running the gate and each re-pointed here with the cause:

3. `e2e/fixtures/e1-mechanics-manifests.json` mirrors `posting.spawnEdges` and is compared byte-for-byte by `agent-view.spec.ts:431` and `drill-yard-manifest.spec.ts:39`.
4. `scripts/gr-sim.test.mjs` pins the Twin Banks run TWICE. The IDLE event-log hash at `:929`, `fnv1a32:6730d992` -> **`fnv1a32:c275d9b5`**; and the high-health secure outcome further down, `kills` 787 -> **795** and `eventLogHash` `fnv1a32:6c36401c` -> **`fnv1a32:42c5435d`**. UNMOVED there, and it is the half F44 wrote that assertion for: `secured: true`, `waves: 20`, `timeMs: 600000`, `defaultedPicks: 25`, `defaultedSecure: 1` — wave-20 timing and the offer deadlines are exactly where they were, and the ride is still byte-identical twice.
5. `assets/contracts/null-floors.json` records the idle floor for all five bench seeds. Re-minted on this tree by `gr-sim --policy=idle`, byte-identical on a repeat run:

| seed | before | after |
|---|---|---|
| e1-twin-banks-01 | w3 / 99,733 ms / 50 kills / `6730d992` | **w2 / 81,933 ms / 33 kills / `c275d9b5`** |
| e1-twin-banks-02 | w3 / 98,633 ms / 47 kills / `c4431597` | **w2 / 85,067 ms / 37 kills / `ccd4cede`** |
| e1-twin-banks-03 | w3 / 99,333 ms / 49 kills / `358ea82a` | **w2 / 81,167 ms / 34 kills / `99573be5`** |
| e1-twin-banks-04 | w2 / 75,600 ms / 31 kills / `3518b84c` | **w3 / 106,600 ms / 53 kills / `eb5774fe`** |
| e1-twin-banks-05 | w3 / 109,633 ms / 56 kills / `d349355e` | **w3 / 110,200 ms / 55 kills / `8e9efada`** |

§5c predicted seed 01's row exactly — "waves 3 -> 2 (99,733 -> 81,933 ms, 50 -> 33 kills)" — and this tree reproduces all four numbers, which is the strongest confirmation available that the fords change behaves as it was measured to. The floor gets HARSHER on three of five seeds: the map is not kinder to a player who does nothing.

**Gate:** `e1-twin-banks` + `drill-yard-manifest` + `agent-view`, both projects — **15 passed / 7 failed, every red attributed.** `:64` ("river" → "bank"), `:103` (build confirm) and `:122` (ford route) reproduce on a CONTROL tree restored to main's bytes for all three files (3 failed / 2 passed, desktop). `:192` desktop is a load flake — green alone in 5.8 s. The re-pointed `:135` passes on both projects.

---

## 4. F-NCS-5 / F-NCS-6 — PARKED, with the measurement

**The ruling's diff works.** Applied exactly as `artifacts/needs-cells-codex-strips/land-report.md` §6 prescribes (four sites in `src/entities/pools.ts`, the reel map line in `src/world/LanternWorldStage.ts`, and F-NCS-6's `walk8.enabled: false` on `char.claim_jumper`, which otherwise shadows walk4 in `SpriteAnimator.selectWalkSheet`). Measured on a plain boot with the batch's own eight-heading probe:

| heading | BEFORE (`char.bandit_base`) | AFTER (`char.claim_jumper`) |
|---|---|---|
| s | char-bandit-base-sheet-walk8-r0c0 | **char-jumper-sheet-walk4-a-r0c0** |
| se | char-bandit-base-sheet-walkdiag8-r1c0 | **char-jumper-sheet-walk4-a-r1c0** |
| e | char-bandit-base-sheet-walk8-r2c0 | **char-jumper-sheet-walk4-a-r2c0** |
| ne | char-bandit-base-sheet-walkdiag8-r3c0 | **char-jumper-sheet-walk4-a-r3c0** |
| n | char-bandit-base-sheet-walk8-r3c0 | **char-jumper-north4-v1-r0c0** |
| nw | char-bandit-base-sheet-walkdiag8-r2c0 | **char-jumper-sheet-walk4-b-r1c0** |
| w | char-bandit-base-sheet-walk8-r1c0 | **char-jumper-west4-v1-r0c0** |
| sw | char-bandit-base-sheet-walkdiag8-r0c0 | **char-jumper-sheet-walk4-b-r3c0** |

Eight headings, eight distinct cells, every one the Claim Jumper's own; 0 console and 0 page errors on both probes. The in-play board (`enemy-board-{before,after}.png`, `e1-dry-gulch` at 1280, four outlaws around the hero) shows the bandit replaced by the poncho-and-straw-hat Jumper.

**But it cannot land inside this task's firewall, and the reason is measured.** Repointing the base enemy renames the LIVE E1 slot from `char.bandit_base` to `char.claim_jumper`, and **twelve e2e specs name the old slot as the base enemy's**: `eight-winds-enemies`, `eight-winds-hero`, `066-walk8-engine`, `task-031-anim-roundness`, `task-042-anim-smoothness`, `run-gait-stride`, `run-scene-animation-refresh`, `vp-02-sprite-animation`, `vp-02b-rotation-resolver`, `visual-polish-assets`, `wire-e2-enemy-walk4`, `lane-c-activations-assay-office`. Two of them (`066-walk8-engine:225`, `task-042:77`) additionally require `frameCount === 8`, which the Jumper's FOUR-frame walk4 cannot satisfy by construction — a re-point there is a re-measurement of an animation-quality bar, not a citation fix.

**The master's own named gate, measured both ways:**

| arm | `e2e/eight-winds-enemies.spec.ts` (both projects) |
|---|---|
| with the diff | **0 of 4** — `:19` and `:39` fail on desktop and mobile |
| control (diff reverted) | **2 of 4** — `:19` PASSES on both; `:39` fails on both |

So `:19`'s red is **caused by the diff** and `:39`'s is **pre-existing**. `e2-enemies` `:113` and `:314` fail identically in both arms and are in `logs/suite-red-inventory.md` for both projects.

**Parked per the master's own stop rule** ("a half-finished item is reverted in the worktree, never committed"). The diff is preserved verbatim as `artifacts/rulings-play-2026-09-19/ncs5-parked/the-diff.patch` with both suite logs beside it, so the follow-on is a re-point task with a named list rather than a rediscovery. F-NCS-6 is not landed alone either: disabling walk8 on a slot nothing draws changes nothing at runtime and would be half of one item.

**Adjacent, reported not fixed:** `src/systems/FreedWalkerVfx.ts:71` keeps `char.bandit_base` for its 'base' family and `src/encyclopedia/registry.ts:205` keeps the Outlaw Runner entry on it, so after a future repoint a freed walker and the encyclopedia would still show a bandit while the live enemy is a Jumper. `src/game/Game.ts:6242` waits on that slot's asset status in a capture helper. All three are outside this task's firewall.

---

## 5. F-POC-4 — the wheel at the 14-back station

The acceptance harness stationed the wheel at `BACK + 6` while its ten neighbours were judged at `BACK` = 14, so F-POC-4's coverage numbers were about a picture nothing else was being asked to fit. `BACK` and the new `WHEEL_BACK` are both DECLARED with the ruling in the harness, and every station row now records the `back` it was measured at.

**Measured, `?debug` boot, both viewports, 0 console / 0 page errors on all four:**

| station | viewport | apex y | foot y | persistent HUD coverage |
|---|---|---|---|---|
| 20 back (old) | 1280 | 10.9 | 122.0 | 39.1 % |
| 20 back (old) | 390 | 11.5 | 128.7 | 61.5 % |
| **14 back (accepted)** | 1280 | **84.5** | 200.2 | **0.0 %** |
| **14 back (accepted)** | 390 | **89.2** | 211.2 | **54.5 %** |

On desktop the wheel leaves the persistent HUD entirely. On 390 px it improves 7 points and no further, because the 390 px HUD owns the top 255 px of 844 and the wheel is the tallest body on the map; halving that is the HUD change the owner declined. Every other Fairground landmark at 14 back reads 0–5 % persistent, so the wheel is now judged beside its neighbours.

**F-RP-5, found by the re-measurement and fixed here:** the harness's wheel GEOMETRY defaults still described the pre-rebuild wheel (`hub` 6.2, `r` 5), so a run without env overrides measured an apex of −66.6 px — the number F-OMB-2/-3 cured. The 2026-09-18 `after/` arm only got +10.9 because it passed `WHEEL_HUB=3.49 WHEEL_RADIUS=3.515` on the command line, and that is nowhere in the file. The defaults now come from `src/entities/FerrisWheel.ts` itself, and the 20-back arm above reproduces the landed review's numbers exactly — which is what makes this a before/after rather than two unrelated pictures.

---

## 6. F-SSL-3 — the prospector coats, taken

**F-RP-7 — the master names the wrong pair.** It says the two held sheets are `hover4-a`/`hover4-b`; those LANDED on 2026-09-14 as despills. F-SSL-3's subjects are `char-prospector-{complainant,gilded}-sheet-hover8`, the two coat REGENERATIONS the split-land review held for the owner's eye. Those are what this takes, from the same source that branch was landing from (`sol/code-review-20260908` @ `92f6cc115`, `git checkout <ref> -- <path>` only): 64 cells, two `.frames.json` sidecars, two raws.

**Measured on this tree** (`prospector-silhouette-census.json`, opaque bbox at alpha ≥ 16, 512 px cells):

| family | cells | figure height main → taken | mean Δ | per-cell Δ range |
|---|---|---|---|---|
| complainant | 32 | max **220 → 226 px** | +2.44 px | −24 … +32 |
| gilded | 32 | max **220 → 224 px** | +2.06 px | −24 … +32 |

This reproduces the review's held +4–6 px rather than inheriting it. The per-cell spread confirms a regeneration and not a uniform rescale — which is exactly why it was an owner question.

**Eyes on:** `contact-char-prospector-*.png`, main's row 0 above the taken row 0 on a flat grey ground. Same brass-and-teal hovering body, same coat, same eight poses; the taken row sits a shade larger and lower. **It reads as the same person.**

**In play:** on a plain `the-claim` boot with each coat granted through the wardrobe's own storage keys, all three skins load and the runtime resolves the taken cells, 0 console / 0 page errors.

**Halo guard, declared and re-pinned, PASS: 315 cured / 0 held / 760 regenerated-and-cured / 2123 scanned**, alpha and opaque RGB unchanged on every undeclared cell. The two stems join `REGENERATED_SHEETS` with their measurement, so 64 cells move `cured` 379 → 315 and `regenerated` 696 → 760 and the three-way sum still closes at 1075.

**F-RP-6 — the denominator was already wrong on main.** Re-pinned 2103 → 2123, and NONE of the +20 is this task's: they are `498a64a8f`'s Claim Jumper codex plates of 2026-09-18, which landed without moving the number. `git ls-tree -r --name-only 7bec53556 assets/processed | grep -c '\.png$'` reads 2123 on main's own tip, so this guard was already red where this worktree was cut. This task adds ZERO files — its 66 processed changes are replacements under their own names.

---

## Gates

| gate | result |
|---|---|
| `npx tsc --noEmit` | clean |
| `npm run build` | rc=0 |
| `GR_RELEASE=e1 npm run build` | rc=0 |
| `node scripts/first-town-payload.mjs` | **34,219,847 B** of 52,000,000 |
| `scripts/view-schema-guard.test.mjs` | **3/3** |
| `scripts/halo-reextraction-check.mjs` | **PASS** 315 / 0 / 760 / 2123 |
| `node scripts/same-game-audit.mjs` | rc=0; `docs/bench/same-game-audit.md` regenerated BYTE-IDENTICAL (no citation drift) |
| `npm run test:stats` | rc=0 (clock census 42/25/17/0, standings 320 checks, ledger worker 26 checks) |
| `skillmd-guard` + `hero-move-verb` + `gr-sim.test` | 46 tests, 41 pass, 2 skipped (declared), 3 fail — ALL cured or attributed, below |
| `scripts/run-guards.mjs --changed-since 7bec53556` | 125 changed files -> the base gate. **4 of 5 PASS** (`test:power-budget`, `test:task-guards`, `test:citations`, `test:gate-callers`); `test:node-guards` rc=1, below |
| full `npm run test:node-guards`, quiet host | **929 tests, 919 pass, 5 fail, 5 skipped** — every red attributed, three cured here, see below |
| `e2e/er01-e2-census.spec.ts` | **8 passed**, both projects |
| `e2e/er01-e8-census.spec.ts` | 6 passed / 2 failed (both pre-existing, controlled) |
| `e1-twin-banks` + `drill-yard-manifest` + `agent-view` | 15 passed / 7 failed, every red attributed |
| `eight-winds-enemies` + `e2-enemies` | see §4 — the park's own measurement |
| plain boots, NO `?debug`, 4 maps × 1280/390 | **8 of 8, 0 console / 0 page errors**, `__GR_TEST__` undefined, no fallback |
| engine hash | `cc3fd5d45add762f…` → `78c43d60c8810afe…` — **reported, not pinned** |

### The three guard reds, each attributed

| red | verdict |
|---|---|
| `gr-sim.test.mjs` "overtime banks the Claim secure … on both Node engines", 240,002 ms | **CONTENTION.** Re-run ALONE on the same tree: **PASS in 94.3 s.** The 240 s ceiling was hit while the full node-guards battery was saturating the host. |
| `gr-sim.test.mjs` "Twin Banks consumes its declared crossings … at wave 20" | **CAUSED BY F-OMA-4, cured here.** TWO pins in that test moved — the idle event-log hash and the high-health outcome's kills+digest; both re-pointed with the cause, and the map still secures at wave 20 in 600,000 ms. See §3. |
| `hero-move-verb.test.mjs` "a run that issues no MOVE_HERO leaves the recorded null floor byte-identical" | **CAUSED BY F-OMA-4, cured here.** The message is literal — the floor for `e1-twin-banks/e1-twin-banks-01` moved, exactly as §5c measured. All five seeds re-minted, see §3. |

### The battery's five reds, each attributed

| red | verdict |
|---|---|
| `bench-seeds.test.mjs` "rotation registry stays outside the engine identity corpus" | **THE DRAIN-OWNED ENGINE PIN.** `assets/engine-era.json`'s `engineHash` no longer equals `computeEngineHash()` because three corpus members moved. The pin is the drain's by this task's firewall; the precedent is `reviews/post-open-maps-correctives.md` F-POC-7, whose battery carried "3 × the drain-owned pin". |
| `engine-era-guard.test.mjs` "the landed registry names the live engine and stays outside its hash corpus" | **THE SAME PIN**, asserted from the other side. |
| `fixture-teardown.test.mjs` "all 151 scripts/*.test.mjs fixture owners remove their temp directories" | **A CASCADE OF THE SAME PIN**, and the log says so: the guard re-runs all 151 test files and its message is `scripts/bench-seeds.test.mjs child failed: ✖ rotation registry stays outside the engine identity corpus`. No fixture leaked. |
| `law-pointer-guard` "THE REAL TREE: every law-surface pointer in this repo currently holds" | **CAUSED HERE, CURED HERE.** The skill.md edits pushed `public/skill.md`'s rotation-seed sentence from line 367 to 368 and two `scripts/fire.md` pointers cited it. Re-based BY MEASUREMENT first (the sentence found at :368, read back and verified by eye) and only then `--update`, which is the order this repo's own note demands. Guard now PASSES: "every law-surface pointer still lands on the line it was written for." |
| `no-emdash-guard.test.mjs` "visitor copy and contract text fields contain no em dashes" | **CAUSED HERE, CURED HERE.** The new E2 paragraph in `public/skill.md` carried two em dashes against a file that had zero; rewritten with a parenthesis and a colon. Guard 1/1. |

So the only red left on the branch is the engine pin, in the two places that assert it plus the one that cascades from it — which is the state a drain is supposed to receive.

---

## Findings

- **F-RP-1 (design, resolved by the registry's own law):** the master asks for a view-version bump; `assets/engine-era.json` is firewalled and holds the version. Contract-scoped `now` fields are outside the canonical set by construction (the guard builds it from `the-claim`), so no bump is required and `view-schema-guard` is 3/3. One line for the drain if the owner wants a stamp anyway.
- **F-RP-2 (stale instrument):** the 2026-09-06 Eclipse prover no longer replays — `MOVE_TO`/`HOLD` are retired and an array with an unknown verb is refused whole, so it stalls at 400 turns. Ported rider beside it.
- **F-RP-3 (incomplete prescription):** the Twin Banks fords cure needs three edits, not two; `e2e/fixtures/e1-mechanics-manifests.json` is the third.
- **F-RP-4 (scope, the park's cause):** waking the Claim Jumper moves a slot name that twelve e2e specs assert, two of them on a frame count the new art cannot have. A re-point task with that named list is the corrective.
- **F-RP-5 (rotted default, fixed):** the landmark capture harness's wheel geometry defaults described the pre-rebuild wheel; a run without env overrides measured an apex the shipped wheel does not have.
- **F-RP-6 (pre-existing red, re-pinned):** the halo guard's processed-PNG denominator was left behind by `498a64a8f` and was red on main at 2123 vs 2103.
- **F-RP-7 (master mis-citation):** item 6 names `hover4-{a,b}`; F-SSL-3's subjects are the two `hover8` coat variants.
- **F-RP-8 (my own bookkeeping error, disclosed not rewritten):** `git checkout <ref> -- <path>` STAGES what it restores, so F-SSL-3's 68 asset files sat in the index when the Twin Banks commit was made and were swept into `6c883679b` rather than into `a4935717c`. Content is complete and correct on the branch; only the per-commit attribution is wrong, against CLAUDE.md §4.2 ("one concern per commit"). Not rewritten because a five-commit history rewrite over ~700 files risks more than the cosmetic gain; the drain's review file should state that `6c883679b` also carries the 68 prospector assets.
- **F-RP-9 (adjacent, unfixed):** `public/skill.md` carried its "The rider view is additive-only…" paragraph TWICE with two different contract-scoped field lists, pinned by no guard. De-duplicated here, keeping the longer list and adding `now.pressure`.

