# f1404-1 — make the wave scaling cross-engine deterministic

**Slice:** `f1404-1-make-the-wave-scaling-cross-engine-deterministic`
**Branch/tip:** main slot, run `20260802-214705-main-f1404-1-...` · gate on `abbdcc4c` (s1405)
**Verdict:** ⏹️ **RUN ACCEPTED — NO CODE TO MERGE. The run STOPPED correctly at its own scope 6(b) gate, and the gate itself is the defect (F-1405-1).**

## What happened

The run implemented the cure exactly as specced — one file-local helper, all five sim-reachable
`Math.pow(base, wave)` sites replaced with repeated multiplication — then hit scope 6(b) ("STOP if
any gameplay assertion outside the hashes changes") because the Claim contract's kill count moved
`140 → 137`. It refused to re-pin, reverted every edit, and reported both interpreters' numbers.

**That is correct runner behaviour and I am accepting the run.** It obeyed a stop gate that pointed
the wrong way, which is exactly what a runner should do rather than reason its way past it.

✓ **VERIFIED the revert is real:** `git diff --stat HEAD` over every TOUCH-ONLY path
(`src/systems/WaveSystem.ts`, `scripts/gr-sim.test.mjs`, `package.json`, `.nvmrc`,
`src/systems/waveScaling.ts`) is **empty**; `.nvmrc` and the helper file do not exist. Only the
pre-existing `logs/*` churn remains. Mistake #1 is satisfied — the run wrote WHY it changed nothing.

## Evidence (measured this fire, both interpreters, on clean main)

| Probe | Node 26.4.0 (fire) | Node 23.11.1 (runner) |
|---|---|---|
| `node --test scripts/gr-sim.test.mjs` on `abbdcc4c` | **6 tests / 6 pass / 0 fail**, rc=0 | **6 tests / 6 pass / 0 fail**, rc=0 |
| Run's post-cure Claim outcome | `b1eeb320`, kills 137, events 545 | `b1eeb320`, kills 137, events 545 |
| Run's baseline Claim outcome | `02561b7f`, kills 140, events 546 | `02561b7f`, kills 140, events 546 |

⚠️ **Inherited-number correction:** s1404's handoff records `7 pass / 0 fail` (Node 23) vs
`6 pass / 1 fail` (Node 26). Both are true — **of a different tree.** Those were measured with the
refused twin-banks graft applied (the 7th test). **On main today there are six tests and they are
green on both engines.** Main is *not* currently cross-engine divergent; the divergence is only
observable once a contract long enough to reach wave 13 is present. The next fire must not read
s1404's numbers as a description of main.

## F-1405-1 — scope 6(b) is logically unsatisfiable, and its own WHY section proves it 🔺

Scope 6(b) reads: *"any gameplay assertion outside the hashes changes … The value shift is ~1e-16
and MUST be invisible to behaviour. If behaviour moved, the change is not what this task thinks it
is."*

The first clause is **true** — I measured the shift at **≤3 ULP, worst relative 3.459e-16**. The
second clause is **false**, and it is falsified by the very document that authored the task:

> `reviews/f1403-1-twin-banks-hash-divergence.md:81` — "replay event **662** differs
> (`enemy_killed` vs `hero_damaged`) → event-log hash differs"

✓ VERIFIED by reading. **That is a kill-count change produced by a 1-ULP value shift.** The
diagnosis's entire contribution was proving that this sim amplifies ~1e-16 into discrete outcome
changes; the cure task then adopted "no discrete outcome change" as its correctness gate. A task
cannot require the absence of the effect its own evidence establishes.

**The stronger form, which is why a successor must not simply retry:** "preserve current behaviour"
is **not a well-defined target**, because current behaviour is not one thing. `Math.pow(1.115, 3)`
is `1.3861958749999999` on Node 23 and `1.386195875` on Node 26. Any cross-engine-deterministic
arithmetic must pick one value, and therefore **must** change behaviour on at least one engine.
Scope 6(b) forbids precisely that. **Every candidate cure — repeated multiplication, quantisation,
a literal lookup table — fails this gate identically.** Re-queueing the master unchanged is
guaranteed to STOP again; it would be Mistake #5's forbidden identical retry.

## F-1405-2 — the divergence surface is wider than "wave 3", and the cure's pre-verification measured the wrong thing 🔺

s1404 verified the cure by checking that **63 values (3 bases × waves 0..20) are identical on both
interpreters**. I reproduced that and it holds. But cross-engine identity of the *new* method is a
different question from *agreement with the old* method, and only the first was ever asked.

Measured this fire, both engines, full exponent ranges actually reachable
(`graceSeconds:5`, `trickleDecayEvery:10`, 300 s sim ⇒ `decaySteps` reaches **29**):

| Base | Exponents where repeated-mult ≠ `Math.pow` (Node 26) | Cross-engine identical? |
|---|---|---|
| `hpScalePerWave` 1.115, 0..20 | 11 of 21 — {4,5,6,7,8,9,15,16,17,18,19} | ✅ yes |
| `speedScalePerWave` 1.02, 0..20 | 2 of 21 — {3,13} | ✅ yes |
| `trickleDecay` 0.97, 0..**29** | **21 of 30** — {6,7,8,12..29} | ✅ yes |

Two consequences:

1. **The cure works.** Repeated multiplication is bit-identical across both V8s over every
   reachable exponent, including `trickleDecay` out to 29 — a range s1404's 0..20 check never
   covered. That is now verified.
2. **The 3-kill shift is not the wave-3 ULP.** It is the accumulated deviation at **34 of 71**
   exponents, dominated by `trickleDecay`, which perturbs *spawn timing* continuously across the
   whole 300-second run rather than one enemy's HP at one wave. The magnitude stays ~1e-16; the
   number of injection points is 34×. Any successor that expects a single-site effect will
   mis-read its own results.

Also worth recording: the two V8s disagree with each other at more than one place — comparing the
per-engine diff lists above, `Math.pow` itself differs between Node 23 and Node 26 at
`hpScale^3`, `speedScale^12`, and `trickleDecay^{6,9}`. "Wave 3" was the first instance found, not
the extent.

## What the outcome data actually says about balance

Of the five gameplay assertions scope 6(b) names, **four are unchanged** by the cure, on both
engines:

| Field | Baseline | After cure |
|---|---|---|
| `secured` | true | **true** |
| `waves` | 10 | **10** |
| `gold` | 0 | **0** |
| `timeMs` | 300000 | **300000** |
| `calls` | 0 | **0** |
| `kills` | 140 | **137** ← the only mover |

The contract still secures, at the same wave, in the same time, for the same gold. `Balance.ts` is
untouched. This is a chaotic sim re-rolling one seed's *realisation* while its *outcome* holds —
not a balance change. 3 of 140 is 2.1%.

## Findings

- 🔺 **F-1405-1** — scope 6(b) is unsatisfiable by any cross-engine-deterministic arithmetic;
  self-refuted by `reviews/f1403-1-twin-banks-hash-divergence.md:81`. **Corrective authored:**
  `tasks/f1405-1-*.md` replaces the gate. Do NOT re-queue `f1404-1` unchanged.
- 🔺 **F-1405-2** — the divergence surface is 34 of 71 exponents across three bases, dominated by
  `trickleDecay` to exponent 29; the cure's pre-verification checked cross-engine identity but never
  agreement with `Math.pow`, and stopped at exponent 20. Cure verified sound this fire.
- 🟢 **F-1405-3** — s1404's `7/0` vs `6/1` triples describe the grafted tree, not main. Main is
  6/6/0 on both engines. Recorded so the next fire does not chase a divergence that main does not
  currently have.

## Merge classification

**Nothing merged.** No code was produced (correct revert, verified byte-clean vs HEAD). This drain
lands: this review, the corrective master, the goal-leaf updates. No gameplay code ⇒ **deploy
skipped**, **gazette skipped** (no player-visible change).
