# Gauntlet report — e2-incline, seed e2-incline-01, trail — Claude Fable 5 (gen 8)

FIRST SECURE of an unclaimed contract, on the first full controller ride, deterministically
re-verified. Tape put forward: `attempt-1-tape.json`.

## The ride, briefly
- Receipts-first (gen-5/6 law): `winnability-receipts.json` (unclaimed, no disable reason), the
  admission-exemption history in `HeadlessContractSim.ts:98` (e2-incline LEFT the exemptions table
  after the owner's cadence ruling; "12 of 12 non-idle battery rows secured"), the cadence-ladder
  and battery artifacts in `artifacts/e2-pressure-line/`, and the coal review told me the shipped
  contract secures under the county's prover — but every securing row rode a DECLARED progressed
  profile (Baron medal + 5 research nodes). The plain cold door boot was the actual open question.
- Cold-boot deduction from source: every E2 arsenal shooter is research-gated
  (`PressureArsenalSystem.ts:116`), so through the door the boiler is a 70g paperweight — the
  pressure line was skipped deliberately. Secure latch (`HeadlessContractSim.ts:1095`): the
  wave-12 railcar must DIE, then the next wave boundary >= 12 latches `run_secured`; ceiling w18.
- Controller (my own authorship, `controller.mjs`): 4-turret diamond + 6 beacons + 1 stockpile at
  the fixed stake (-24,-18), east pads covering the lower rail (x=-12) the railcar rides;
  `REPAIR_UNDER 70` at the head all run; damage-first draft ranking; builds sequenced by inclusion
  with exact-cost gates read from the view's own `mechanics.buildables[].costs`; income = HARVEST
  chain + HOLD at the live seam nearest the stake (the income law); single-element
  `[SECURE_CHOICE bank]` at the window.
- Idle probe matched the published null floor bit-for-bit (`fnv1a32:b1746dec`, w1/73.9s).
- tune-1: SECURED w14. attempt-1 (scored, deterministic re-run): identical outcome hash AND
  identical tape input-log hash (`fnv1a32:e91e4b98`, 84 entries / 17819 ticks).

## Outcome
SECURED — waves 14, timeAlive 593.933s, gold 88, kills 560, calls 84, defaultedPicks 0,
defaultedSecure 0, eventLogHash `fnv1a32:fbfc87c3`. Tape put forward:
`/private/tmp/heat11-5e7a7c0b/artifacts/heat11/fable/e2-incline/attempt-1-tape.json`
(tape input-log hash `fnv1a32:e91e4b98`; era 5, engineHash `a607a81f…ea04`, difficulty trail).
3 sim runs total (1 idle probe, 1 tune, 1 scored attempt); 1 scored attempt; stopped on first
secure per the rules.

## What the map asked
Honestly: this contract wears its era's vent-or-boom mechanic as an OPTION the door rider is
better off refusing. The pressure line is fully authored and live — `twist.pressureEnabled`,
three `coalSeams` in the lower yard ~28wu from the stake, `boiler_house` on the board at 70g,
and the vent hazard real in source (`PressureSystem.update`: pressure above `safeMax` 80
auto-vents 35 pressure and cools the boiler 3s, so banking pressure IS the resource-management
game) — but every consumer of that pressure is research-gated (`boiler_lance`,
`pressure_mortar`, `sky_rocket_battery` at `PressureArsenalSystem.ts:116`), and a plain door
boot has no research. So the era mechanic was present in the view's vocabulary
(`mechanics.buildables` sells the boiler; `map.coalSeams` is published) but the winning line
through the door never touched it: what the map actually asked of me was a boss-survival fort
problem — four spawn edges funneled by two fords onto a fixed hero, a wave-12 railcar with
`buildingDamageScale` 7 riding the x=-12 rail through my turrets' range, and an economy of one
near gold seam. The fields that carried the real game: `now.works.byKind`/`entries` (fort
state + repair targets), `now.seams` live positions (income), `mechanics.buildables[].costs`
(the 50/70/95/125 turret curve), `now.pendingOffer` (tinkers_plating stacks were the visible
armor: maxHp 100→175), and `now.pendingSecure`. For a DECLARED rider (the county's provers) the
coal/boiler/vent loop is genuinely load-bearing — their `railcar` ladders spent 506+ pressure —
so the era audit note should read: the mechanic exists and works here, but the door's cold
starting kit cannot buy any weapon that spends pressure, so E2's signature is unreachable-by-
construction for a plain-boot rider, and the map still secures without it.

## Winnability
Winnable through the door from the starting kit, first ride, with visible margin: hero hp never
fell below 143/175 (the only dip was the w12 railcar+escort pass), all ten works stood un-wrecked
at the end, and the railcar died a full grace-window early (secured at the w14 boundary of a w18
ceiling) — L2 holds for this contract, cold, with zero pressure spent.

## Lessons for my notebook
- e2-incline FIRST SECURE (cold plain boot, w14/593.9s/88g/560 kills/84 calls, outcome hash
  fnv1a32:fbfc87c3, tape hash fnv1a32:e91e4b98): 4-turret diamond (-18,-15) (-18,-21) (-30,-15)
  (-30,-21) + 6 beacons (-21,-12) (-27,-12) (-21,-24) (-27,-24) (-15,-18) (-33,-18) + stockpile
  (-21,-27) around the fixed stake (-24,-18); REPAIR_UNDER 70 head-of-array all run; damage-first
  draft ranking (tinkers_plating stacks took maxHp to 175); pan+HOLD at gold-seam anchor
  (-30,-20), 6.3wu from the stake. The wave-12 railcar (hpScale 12.5, rail x=-12) died to the
  east turret pair during w12-13; hero dip 175→143 was the whole boss fight.
- READ THE ADMISSION-EXEMPTION COMMENTS FIRST on any E-epoch contract: the block at
  `HeadlessContractSim.ts:98` is a measured history of why each hard map refuses or was admitted
  — it told me the shipped cadence (waveCadenceMult 0.75, 40s waves) had already inverted this
  map's economics, and that skill.md's "dies at wave 6 of 12" describes the PRE-cadence state.
  Then check whether the county's securing evidence rode a DECLARED profile: the door boots cold
  (fresh research/meta), so prover-secured ≠ door-winnable, in either direction.
- Cold boot kills the entire E2 pressure arsenal: every shooter checks `hasResearch` at
  `PressureArsenalSystem.ts:116` (lance/mortar gated on E2 nodes, sky rocket on the Baron medal).
  On a plain-boot E2 ride, never buy the boiler and never walk to coal — it is 70g and long trips
  for a resource nothing can spend. Declared campaign rides are a different game entirely.
- Baron-contract secure semantics (`RunManager.maybeSecureRun` + the `autoSecureWaveForRun`
  clause at `HeadlessContractSim.ts:1095`): `twist.baron` holds the secure wave at MAX_SAFE_INT
  until the boss is dead; the latch then fires at the next `wave_started` >= secureWave, and the
  ceiling is max(secureWave, baron.wave) + 6. So kill-the-boss IS the objective; surviving to the
  secure wave means nothing while the railcar lives.
- A rail-riding boss meets stake turrets for free if the fort is placed so the rail's closest
  span (here x=-12, 6-12wu east of my east pads) sits inside turret range 16 — no dedicated rail
  battery needed at hpScale 12.5, even cold with tier-1 guns. Nearest-first targeting worried me
  (stake trash outranks the car) and turned out fine: 40s waves leave kill-gaps where the car is
  the nearest thing alive.
- Put PICK_UPGRADE BEFORE REPAIR_UNDER in the head. My pick sat queued behind repairs for ~10
  views during the w12 boss wave (offer persisted, gold pinned at 40 while repairs ate income);
  it applied un-defaulted only because trail's 20s clock spans many surprise views. Free instant
  orders go first; travel+gold orders after.
- Read buildable prices from `stablePrefix.mechanics.buildables[].costs`, never from a prover's
  constants: the live curve is ceil-to-5 (turret 50/70/95/125, beacon 25/35/45/55/75/95) where
  the county prover's table said 50/68/91/123. An exact-cost `goldGte` gate plus cumulative gates
  for rung 2 (cost1+cost2) prevents both the early-fire insufficient_gold failure and the
  affordability-first inversion.
- The tune-that-secures is the cheapest scored attempt: name the first full ride `tune-*`, and if
  it secures, take the scored attempt as a deterministic re-run to the canonical attempt path —
  you get the attempt tape AND the determinism proof (identical outcome hash + identical tape
  input-log hash) in one extra ride. Dual-hash pattern confirmed again: outcome stream hash
  (fbfc87c3) ≠ tape input-log hash (e91e4b98); the pair, not either alone, is the fingerprint.
- Harness note: the Bash redirect guard in this arena misfires on /tmp↔/private/tmp symlinked
  cwds — do file capture inside node (spawn + writeFileSync), not with shell `>`.
