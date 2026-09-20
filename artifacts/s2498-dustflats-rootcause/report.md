# F-2498-1 — `e4-dust-flats.spec.ts` asserts an ORPHANED implementation, not a stale input contract

**s2498, 2026-09-04.** Measured, not inherited. Corrects F-2497-1's decisive clause.

## The inherited claim, and why it matters

`tasks/BACKLOG.md` line 2 (s2497 drain row) records:

> **F-2497-1 OWED:** `e4-dust-flats.spec.ts:97` presses Space expecting a road grade and so
> encodes the OLD input contract; **it is now the only thing between that test and green.**

s2497's handoff carried the same as next-fire priority (B), calling it "a test-only edit outside
any live firewall" and filing `:31` (F-2497-3) as an *independent* red.

Both halves are measurably wrong. The prescribed edit cannot make the test green, and the two
reds are ONE root cause.

## What was measured

Reproduced the reds first (`npx playwright test e2e/e4-dust-flats.spec.ts --workers=1`, F-1270-1):
**4 failed / 2 passed**, matching s2497's account exactly, including its control finding that the
merge moves `:97` FORWARD (main dies at `:103` on `vehicle.active`; the merged tree reaches `:110`).
That part of s2497's account is CONFIRMED.

Then the decisive probe (`probe.spec.ts` beside this file), with the control asserting its own
validity first (F-2215-1):

```
[s2498] CONTROL contract=e4-dust-flats vehicleActive=true     <- the boot really came up
[s2498] dustFlats BEFORE any input = null
[s2498] dustFlats AFTER Upgrade    = null                     <- THE PRESCRIBED CURE
[s2498] dustFlats AFTER Space      = null
[s2498] diagnostics keys = actors,agent,...,vehicle,vfx,wave,...   (117 keys, no `dustFlats`)
[s2498] console errors = []
```

`vehicleActive=true` and 117 populated keys prove the object is readable and the Motor composition
mounted — so `null` is an ANSWER, not a failed read. **`dustFlats` is absent under every input.**
No keypress can move a diagnostic that is never published.

## The root cause

- `src/world/DustFlatsTile.ts:131` `diagnostics()` returns exactly the
  `{ enabled, ringRoad, weather, orbit, roads }` shape BOTH failing tests assert.
- That class has **ZERO importers** — measured:
  `grep -rn "from '.*DustFlatsTile'\|createDustFlatsTile" src/ e2e/ scripts/` returns nothing.
- The codebase already documents this in three places, none of which the tests were reconciled
  with: `src/sim/MotorSocket.ts:29-31` ("Today's `Game.ts` carries none of it: `DustFlatsTile` has
  no importer"), `src/sim/HeadlessContractSim.ts:691`, `src/agent/MechanicsManifest.ts:338`.

So `dustFlats` is dead, and **both** failures fall out of it: `:31` reads `undefined` directly,
`:97` reads the same `undefined` behind `?? 0` and polls 0 forever. F-2497-3 is not independent
of F-2497-1; it is the same defect seen without the masking default.

## What actually happened (the part that makes this benign)

The capability was not lost — it was **rebuilt along a different path**, and the old one was left
orphaned rather than deleted:

- `e4-roads-and-convoys` (`7f5c590a1`) put the era's composition in `src/sim/MotorSocket.ts`
  (verbs `GRADE`/`HAUL`, view `now.motor`, schema 1 -> 2).
- `e4-vehicles-plain-boot` (`49370319b`, s2497) mounted it in a plain boot.
- `src/game/Game.ts:9262 motorGrade()` calls `motorSocket.gradeAt(...)`, adds a `RoadSegment` to
  `this.motorRoadViews`, and floats "Road graded".

**Road grading works in the browser today.** What does not exist is any *browser diagnostic* for
it: there is no `dustFlats` key and no `motor` key among the 117 published. The tests poll the
retired implementation's telemetry for a capability the surviving implementation provides silently.

## Why this is NOT fire-authorable, and what the fork is

Re-pointing the tests requires choosing a diagnostic contract, and that is a design call with more
than one defensible answer:

- `:97` needs only `dustFlats.roads.segments`, which `this.motorRoadViews.size` already answers.
  But publishing a partial `dustFlats` object changes how `:31` fails rather than fixing it.
- `:31` additionally asserts `enabled`, `ringRoad.radius`, `weather.{phase,cycle}`, `orbitMembers`
  and `tarSeams` — storm and orbit telemetry. Whether the browser boot composes those at all is a
  separate question this finding does not settle.

Three defensible resolutions, for an owner/attended word:

- **(a)** Publish a `motor`-shaped browser diagnostic from the surviving `motorSocket` composition
  and re-point both tests at it. Restores real coverage of shipped behaviour. *Recommended*, but
  it is a new telemetry contract, so it wants a slice rather than a drive-by.
- **(b)** Narrow the two tests to what the boot demonstrably exposes (`vehicle.*`, float text,
  tape `motorActions`) and delete the `dustFlats` assertions.
- **(c)** Retire `src/world/DustFlatsTile.ts` and these two tests together as the superseded
  implementation and its coverage.

⛔ **Do NOT do the edit F-2497-1 prescribes.** It is measured above to leave the test exactly as
red, and a fire that makes it and re-runs will conclude the *input system* is broken and go
chasing `Game.ts`'s intent handling, which is working correctly.

## Reusable

A predecessor's finding can be **right about the symptom and wrong about the cause**, and the
give-away is a clause that closes the question — *"it is now the only thing between that test and
green"*. That sentence is a prediction, and it is cheap to test: apply the prescribed cure and see
whether the red moves. It cost one throwaway spec and ten seconds here, and it retires a whole
fire's budget of misdirected work. Mistake #4 governs an inherited DIAGNOSIS exactly as it governs
an inherited status — and a diagnosis is more dangerous, because it arrives with a plan attached.
