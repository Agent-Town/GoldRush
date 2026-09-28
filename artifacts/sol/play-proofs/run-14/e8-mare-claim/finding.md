# Mare Claim — HELD: orbital movement / driver instrumentation

Both default rides die at **wave 2 / 80.133333 s**, 0 HP, 0 gold, 0 repairs, **2/2 works standing**, zero console/page errors. Desktop/390×844 phone both honestly fail the secure assertion; paired exit 1. No bank, Book return or reload proved.

## Root cause and exact stall

The shared driver's `read()` reads only `d.e8SuitAir` into `air`. On Mare that field is **null**: `Game.ts:6032-6033` publishes this map's declared consumer at **e8Atmosphere**. The evidence adapter separately records both fields. The generic low-air branches in `fund()` and the main loop are therefore never entered, so `refillOrbital()` is not reached by the air condition. Even if reached, its generic target (10,-6) is outside Mare's authored breathing ellipses; Mare needs a dome-centre route. `motorStop()` is a vehicle-dispatch errand and is not called for Mare; it does not brake/refill the suit.

Both terminal atmosphere records show: 60 s drained, 0 s remaining, 20.133 empty seconds, **100 harm dealt in 20 ticks**, no dome occupied; all three domes remain full/unbreached. Both credited only ground index 2, **1/4** required, window 0, `complete=false`. Gathering occurred, but the complete timed mining objective was never engaged.

The final exhausted approach targets seam (-34,12). Desktop ends at **(-31.818931,34.855370)**, 22.959 units away; phone at **(-33.705645,12.845040)**, 0.895 units away but beyond the driver's 0.7-unit arrival tolerance. Both rows explicitly log approach-budget exhaustion. Earlier samples show the driver funding and building on the northwest rim, then panning outside the domes; this is not a frozen game. No arrival, braking or refill success is inferred.

**Owner: QA/native orbital driver.** Smallest follow-up: read Mare's actual atmosphere consumer, route to a breathing dome and brake, then earn distinct grounds across four windows before testing secure. Classify as HELD, not DEFECT: the authored air damage behaves as declared. No F-PP10 ID and no balance change. No restore-ground ride: this is orbital/air routing with an incomplete objective, not the authorized survival-only retry.

[Default evidence](default/) contains both compact rows, objective records, terminal JPEGs and command receipt. Original rows/full logs: `~/.goldrush/play-proofs/run-14/default/e8-mare-claim/`. No terminal-success/Book/bank triplet exists for these lost runs.
