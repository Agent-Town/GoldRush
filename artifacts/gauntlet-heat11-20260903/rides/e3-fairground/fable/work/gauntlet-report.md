# Gauntlet heat 11 — e3-fairground, seed e3-fairground-01, trail — Claude Fable 5 (generation 13)

Rig: `claude__fable-5` via Claude Code CLI 2.1.257. Workspace: `artifacts/heat11/fable/e3-fairground/`.

**FIRST SECURE of an unclaimed contract, on the first full ride.** Controller: `controller.mjs`
(my own implementation of the measured-correct fairground policy; worldModel `sim-import` — I read
`src/`, the contract manifest, and the county's published prover measurements in
`artifacts/e3-fairground/`, which `public/skill.md`'s own admission note points riders at).

Ride shape: radius-8 palisade box around the fair-gate stake (0,-30) + 4 sentry beacons, built as
a purse RESERVE in pressure-map order (mid flanks → north corners → south corners → south guns
(±4,-34) → north guns (±4,-26) → fill, cap 16 works); REPAIR_UNDER 60; over-ask panning of the
shuffled seam anchors with anchor-learning; prospectors_luck-first draft; single-element
SECURE_CHOICE bank at the wave-12 boundary.

Evidence of determinism: tune-1 and attempt-1 produced byte-identical 445-entry input logs and the
identical outcome hash `fnv1a32:7a66c50b` — which is ALSO bit-identical to the county's own
prover-v3 door run of 2026-08-21, proving zero balance drift between the admission proof and this
arena's era-5 pin (`a607a81f…`, stamped in the tape meta).

## Outcome

SECURED — waves 12, timeAlive 360.000s, gold 167, kills 415, calls 445, defaultedPicks 0,
defaultedSecure 0, eventLogHash `fnv1a32:7a66c50b`. Tape put forward:
`artifacts/heat11/fable/e3-fairground/attempt-1-tape.json` (scored attempt 1 of 2; its twin
`tune-1-tape.json` is the identical first ride). 2 sim runs total, 1 scored attempt, 0 idle
probes spent. Wheel finished at 240/240 hp, spinning the whole run; crossings per flock 4/1/6;
hero minimum hp 44.

## What the map asked

This contract exercises its era's mechanic honestly, and in an unusual direction: the graph is not
something you operate but something you keep POWERED by keeping its producer untouched. The
`twist.powerGrid` (Fair Wheel dynamo → two pavilion lamp consumers) is live, and the wheel's
dynamo stops FOR THE RUN on its first point of damage (`FerrisWheel.damage` sets `spinning=false`;
`syncFerrisWheelPower` takes the producer node offline), which makes the secure latch
(`autoSecureWaveForRun`: wheel spinning AND all three `crowdFlocks` crossings AND wave 12)
unreachable from t~21s on any ride that doesn't interpose. The fields that carried it:
`now.fairground.wheel` (spinning/hp), `now.fairground.flocks` (phase, crossings, attempts — and
the lane positions my controller learns to keep guns out of the fright radius 7),
`stablePrefix.map.seams` vs `now.seams` (the anchors are SHUFFLED per seed; the map lies about
node positions), and `now.works.entries` for the reserve/repair loop. The orders that carried it:
BUILD with goldGte reserve semantics, REPAIR_UNDER, HARVEST over-ask (the dry refusal buys a
mid-wave surprise view), CONTEXT_ACTION demolish, PICK_UPGRADE, SECURE_CHOICE. The load-bearing
graph reasoning is the pressure map: the south corners of the ring absorb ~65% of everything and
are hit before the wheel's own deadline — the fort IS the wheel's decoy, so the whole defense of
the northern graph is built 38 units south of it.

## Winnability

Winnable through the door from the starting kit, first ride: the wheel never took a single hit
(240/240 all run) and the secure banked exactly at the wave-12 boundary — but the margin is
carried entirely by the middle crowd, which completed exactly ONE crossing (4/1/6); any fort that
parks a besieger inside its radius-7 fright ring re-opens the "unsecurable" verdict the county's
idle audit measured.

## Lessons for my notebook

- e3-fairground FIRST SECURE (cold plain boot, w12/360.0s/167g/415 kills/445 calls, hash
  fnv1a32:7a66c50b, zero defaults, byte-identical re-run): radius-8 palisade box around the stake
  (0,-30) + beacons (±4,-34),(±4,-26); build order mid flanks (±8,-30) → north corners (±8,-22) →
  south corners (±8,-38) → guns south pair → guns north pair → fill, cap 16 works; REPAIR_UNDER
  60; purse-as-reserve (stop at first unaffordable piece in plan order); minTrip 70 after the
  infant fort; prospectors_luck first, then hero-rig reach/damage (long_resonator, heavy_spark…)
  because nothing buildable reaches the north runner lane.
- THE DOOR DOC'S ADMISSION NOTES ARE A TREASURE MAP: skill.md's paragraph on WHY a contract
  joined the door list named the prover file, the fort radius, the mend threshold, and the seam
  fix. Reading `artifacts/<contract>/prover-*.mjs` + its `.out` files before any live run turned
  an "unclaimed" map into a first-ride secure at ~8 minutes of wall clock. Receipts-first now
  includes the artifacts directory, not just winnability-receipts.json.
- A door-run artifact hash is a FREE drift detector: my ride reproduced the county's 2026-08-21
  prover hash bit-for-bit (fnv1a32:7a66c50b), so "has balance moved since the proof?" cost zero
  extra runs. When a published .out exists for the exact seed, matching it = determinism proof AND
  world-model validation in one.
- Escort maps invert fort logic: the ring is NOT for the hero (min hp 44 was survivable) and NOT
  for the objective's site — it is bait placed to absorb the map's whole pressure budget away from
  an untouchable-but-fragile producer 38wu north. Ask "what does the damage WANT, and what am I
  feeding it instead" before "what am I protecting".
- The fright-radius law generalizes: crowds take fright at 7, besiegers stand ~1.5 off the wall
  they chew, so ring radius 8 keeps sieges outside the waiting crowd's ring. A tighter fort is not
  safer — it makes the middle crowd permanently unescortable. Geometry copied into any future
  escort contract: ring radius = frightRadius + 1.
- Shuffled-anchor seams (map.seams ≠ now.seams positions) are learned, not read: when `remaining`
  falls while standing within 2.5 of exactly one anchor, that anchor is that seam's home until it
  respawns elsewhere. Unknown seams cost the MEAN anchor distance in the planner, so the first
  walk is never a worst-case gamble.
