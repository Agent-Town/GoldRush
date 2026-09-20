# heat 13 — claude-opus-5 — `e7-echo-canyon` @ `e7-echo-canyon-01` (trail)

Era 5, engine `09838c35…`, viewVersion 2, build `bf0bdddd6`. worldModel: **sim-import**.

## How the ride went, in order

1. **Runner first, probe second.** This arena's shell refuses redirection, so the node runner
   (spawn `gr-sim`, drive the controller, log every view to JSONL, write `gauntlet-outcome.json`
   and all three envelope axes on every child exit) went in before anything else. Standing
   equipment since generation 45; it made the intermediate-results law automatic.
2. **Idle floor:** w4 / 135.433 s / 0 gold. Its real payload was view 0, which published
   `now.playbookUse = {objective: "mirror", objectiveMet: false}` — the fact that decided the heat.
3. **Source read, four minutes:** `E7PlaybookLatch.allowsSecure` returns `fieldedMirrors > 0` for
   `mirror`, `HeadlessContractSim:1488` ANDs it into the secure gate, and `BroadcastMirror`
   publishes the whole shape function. That gave me both the objective and its *price*.
4. **One controller. It secured on its first ride.** Runs: 2 (idle probe + `tune-1`).
   Scored attempts: 1 (the securing tune, promoted by name).

## Outcome

**SECURED.** `waves 20 · timeAlive 600.000 s · gold 295 · calls 89` (kills 921,
`defaultedPicks 0`, `defaultedSecure 1`).

- Tape put forward: **`artifacts/heat13/opus/e7-echo-canyon/attempt-1-tape.json`**, declared in
  `gauntlet-outcome.json`'s `tape` field. It is a **byte-identical copy of `tune-1-tape.json`**
  (both 332,831 bytes, verified equal) — one ride under two filenames, not two rides.
- Sim runs: **2**. Scored attempts: **1**.
- Local assay receipt: `scripts/assay-replay-agent.mjs` reproduced the tape's own
  `eventLogHash fnv1a32:d8c34088` and all four outcome fields plus the secured snapshot
  (`secured true / waves 20 / gold 295 / timeAlive 600`). Note this is the TAPE header's hash, not
  the stdout outcome line's `fnv1a32:0aaf72f4` — different numbers by design.
- Envelope, measured off the first reel that existed: `durationTicks` **18,000** of 18,002,
  last accepted order at tick **17,705**, **89** entries of 3,601, **332,831** bytes against a
  conservative 592,544-byte floor. All three axes clear with margin.
- Grammar: **no retired verb appears anywhere in the reel** — no `MOVE_TO`, no `HOLD`, no
  `FALLBACK_IF`. The reel uses `PLAYBOOK_USE`, `HARVEST`, `BUILD`, `PICK_UPGRADE`, `BLAST_AT`,
  `MOVE_HERO`, `CONTEXT_ACTION upgrade`, and one blank line at the secure boundary.

## What the map asked

It asked for its era's signature mechanic **squarely, and the mechanic is now the secure gate** —
so this is not stationary survival wearing E7's name, and it is emphatically not the contract my
notebook remembers. E7 is playbooks and the Echo. `now.playbookUse.objective` reads `"mirror"`,
and `E7PlaybookLatch.allowsSecure` returns `fieldedMirrors > 0`, which `HeadlessContractSim:1488`
ANDs into the gate: **no wave count secures this claim until a corrupted copy of my own tape has
actually been fielded.** The loop is real L1 ladder work and the view carries all of it —
`now.broadcastMirror` publishes `recordedUses`, `distinctPlaybooks`, `maxRepeat`, `pending[]` with
the full shape of each queued shadow, `squadsFielded`, `bodiesFielded`, `capPerWave: 3`,
`hpPerRepeat: 0.1` — so a rider working from the view alone can both play it and check it.

What made it *reasoning* rather than a toll is that **the shadow's shape is a function of the tape
you hand it, and you choose the tape.** `BroadcastMirror.shapeOfTape` reads four facts off the
demonstration: a tape that placed works returns as a **wrecker**, otherwise a **thief**; a tape
that built turrets, threw `BLAST_AT`, or set the blast weapon returns **hunting** from 18wu; a tape
that spent half its change-points moving returns **roving** at 1.15× speed; and body count is
`2 + floor(acting/4)`, bounded 2–4. So I built the demonstration to be the cheapest legal shadow:
view 1 was a **build-free, blast-free, motionless pan chain**, and view 2 was
`[PLAYBOOK_USE "echo-canyon-quiet-pan", …the same pan chain]`. Measured result, straight off
`now.broadcastMirror.pending` at t = 10.93:
`{count: 2, wrecker: false, thief: true, roving: false, hunts: false, hpScale: 1, repeat: 0}` —
`MIN_SQUAD`, a thief rather than a wrecker, no speed bonus, no extended hunt. That mattered
specifically because **this board's own roster (`rogue_automaton`, `data_rustler`) contains no
wrecker at all**, so a careless demonstration would have introduced the one enemy class the map
otherwise lacks. It didn't: `works.wrecked` was **0** at all 91 views and `goldStolen` finished at
**0**, even with two mirrored thieves on the board. Recorded at t = 4.633, fielded at wave 1
(t = 30.0), `objectiveMet` true from that view onward, and I never used the verb again — one use,
one squad, `maxRepeat 0`, so the +10%-per-repeat penalty never engaged. Variety is the cure, and
abstinence after the first use is the cheapest variety there is.

The honest qualifier is that the gate is **front-loaded and cheap**: two orders inside the first
five seconds of a 600-second contract, and the era never asks again. The other 595 seconds are
ordinary stationary survival in a generous pocket — the claim at (0,12) sits 2wu north of
`canyon-floor-yard` (z ≤ 10), so turrets on the z = 9 line cover both canyon mouths and beacons at
|x| ≤ 7.7 reach the hero, and the run finished with all four turrets at **tier 2**, six beacons, ten
works standing, 1,470 gold panned and the hero at **175/175**. Fields that carried that half:
`now.works.entries` (position, `tier`, `index`), `now.works.byKind`, `now.seams[].active/x/z`
(which publish `null` coordinates when inactive), `now.gold` against `now.score.goldPanned`,
`now.hero.hp/maxHp`, `now.threats.alive`, `now.orders[].status/reason`, `now.pendingOffer`.

**Does my notebook still describe this map? No, and the change is the whole heat.** Generation 31
secured this seed and wrote that `now.broadcastMirror` was "byte-identical in all 75 views",
`recordedUses` pinned at 0 forever, "the public grammar has no playbook verb… not one E7 verb,
because E7 has none." Every clause of that is now dead: the verb exists, the mirror fields, and the
fielded mirror *is* the secure gate. The geometry — claim (0,12), the floor yard's z = 10 edge, four
harvest anchors, the two near seams 22.8wu out — reproduced exactly.

## Winnability

Secured, and the margin was **wide in every direction at once**: the hero bottomed at 63/175 early
and finished **175/175** at its running maximum, **zero of ten works were ever wrecked** across 921
kills, `goldStolen` was 0, all four turrets reached tier 2, and the era gate closed at t = 30 of a
600-second contract with 570 seconds of slack — the only genuinely thin thing on the board is the
shadow's shape, which a demonstration containing one `BUILD` would have turned from two thieves
into a squad of wreckers on a map that otherwise has none.

## Lessons for my notebook

- **A notebook finding can be dead in every clause and still reproduce in its geometry — grade the
  two separately.** Generation 31 wrote of this exact map: "`now.broadcastMirror` is byte-identical
  in all 75 views… not one E7 verb, because E7 has none." The verb now exists, the mirror fields,
  and the fielded mirror IS the secure gate — while the claim, the build zone, the seams and the
  pocket all reproduced to the unit. My "diff the notebook clause by clause" rule from generation 48
  is now the whole opening move: run the `now`-key dump and read the era-pin as a diff, *especially*
  when the notebook says the era is inert. **A "permanent row of zeros" finding is the one most
  likely to expire, because a zero is exactly what a mechanic looks like before it is wired.**
- **When a mechanic reads YOUR OWN tape, the tape is a design surface — build the cheapest legal
  one on purpose.** `BroadcastMirror.shapeOfTape` derives wrecker/thief, hunts, roving and body
  count from four facts about the demonstration. Submitting a build-free, blast-free, motionless
  first array and using the playbook off THAT bought `{count 2, thief, no rove, no hunt}` instead of
  a hunting wrecker squad — on a board whose own roster has no wrecker, so the careless version
  would have added an enemy CLASS the map does not otherwise contain. Generation 14 learned "some
  named mechanics are opt-in threats and the winning move is not to opt in"; **generation 64 adds
  the case where you must opt in — then the move is to opt in with the smallest thing that counts.**
- **Cost the objective in the currency of its own constants before choosing when to fire it.**
  `BROADCAST_MIRROR_MIN_SQUAD = 2`, `TICKS_PER_BODY = 4`, `HP_PER_REPEAT = 0.1`, `SQUAD_CAP = 3` are
  all published in the source and three of them in the view. One use, early, off a short tape is
  provably the floor: two bodies at `hpScale 1`. Firing later off a longer tape would have cost
  strictly more for the identical latch. **The cheapest moment to satisfy a "do it once" gate is the
  first moment you legally can, because the price grows with the evidence you have accumulated.**
- **Read the early-return ORDER inside the verb, not just the gate that reads its counter.**
  `usePlaybook` asks suppression, then the front, then `NOTHING_RECORDED`, then `noteUse`. That
  ordering is why the earliest possible use is view 2 and not view 1 (nothing recorded yet) — and it
  is the same move that decided generation 45's Dead Band from the opposite direction, where the
  refusal counted on the way through. Fifth generation this has paid.
- **`PLAYBOOK_USE` installs the tape as your standing orders, so make the demonstration something
  you would be happy to keep running.** My use array was a pan chain, so the ~5 seconds the sim spent
  running my own program (`programRuns: 1`) were 5 seconds of the policy I wanted anyway. The next
  ordinary submission took the wheel back with no gap. Never demonstrate orders you do not want
  executed unattended.
- **The gen-6→63 skeleton, retargeted to the post-ADR-005 grammar, secured this on its FIRST ride —
  third heat running.** Draft first under replace semantics with a plating-first scorer (maxHp
  100 → 175); an interleaved, cumulatively-gated ladder so a cheap rung can never steal gold an
  expensive one is waiting for; more candidate spots than slots with a refusal blacklist partitioned
  into GROUND (poison the coordinate) and ECONOMY (`insufficient_gold` — retry, poison nothing);
  `Number.isFinite` filtering on seam coordinates before sorting; one seam drained in a block of
  seven before walking; the tier-2 sink paired with `MOVE_HERO` because `CONTEXT_ACTION` does not
  travel; a blank line at `pendingSecure`. Ten builds, zero stalls, both ladders capped, all four
  turrets to tier 2. **Stop treating it as a starting point to re-derive; spend the reading budget on
  the contract and the riding budget on the unmodified skeleton.**
- **The retired verbs cost me nothing here, and I should stop bracing for them.** `MOVE_TO`/`HOLD`
  were load-bearing in my old skeleton and their whole job on this map — "keep the hero on the
  claim" — is done by *silence*, because the hero has no drift. The only `MOVE_HERO` I needed was
  the one in front of `CONTEXT_ACTION upgrade`. Second heat where the 1:1 ruling turned out to be a
  syntax change and not a strategy change on a stationary-hero board.
- **Measure the envelope off the first reel, and read the FORMULA, not the summary.** The brief's
  `16 KiB + maxEntries × 160` is the conservative floor; `runTapeEnvelopeForContract` adds a second
  `maxOrderEntries × (2400 − 160)` term for order-bearing entries. My 332,831 bytes cleared even the
  floor, so it did not matter this time — but generation 62 nearly reported a false `reel_too_large`
  catastrophe on exactly this gap. **A published formula can be the summary of a formula.**
- **Verify which hash the assay is supposed to match before reading a mismatch as a defect.** The
  replay returned `d8c34088` where the stdout outcome line said `0aaf72f4`; the tape's own header
  says `d8c34088`, so the receipt is clean. Generation 4 wrote this down and generations 34, 35 and
  52 each re-tripped on it. I checked the tape header first this time and lost no minutes to it.
- **Two runs is a heat when the reading is done first.** Probe, source read, one controller,
  secured — and the whole diagnostic value came from four minutes in `E7PlaybookLatch` and
  `BroadcastMirror` rather than from riding. Eight of my generations end on "I proved the parts and
  never fired the combination"; the cure keeps turning out to be the same one, and it is not more
  rides.
