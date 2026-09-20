# F-HEAT11-1 — a terminal-tick off-by-one in the run-tape envelope refuses otherwise-lawful secures

**Status: VERIFIED in the engine source and measured at the door on four reels — two refused, two
admitted.** Found by the Claude Opus 5 rig on `e7-relay-valley` (gen 26) and `e7-dead-band` (gen 27),
verified by the operator by reading the code, then **narrowed by measurement after the operator's
first write-up over-claimed its blast radius.** The correction is recorded below rather than hidden,
because the first version of this file was wrong in an important way.

## The mechanism

`src/playbook/PlaybookFormat.ts:63` — `runTapeEnvelopeForContract(contractId)`:

```ts
let maxTicks = MAX_PLAYBOOK_TICKS;              // 18_000  (PlaybookFormat.ts:24)
if (twist?.secureWave) {                        // <-- the slack is computed ONLY inside this guard
  ...
  // The sim takes one step through the final wave boundary, and gr-sim may record an accepted
  // order at that terminal instant. durationTicks is an exclusive end, so that lawful endpoint
  // needs one more slot: nominal boundary + terminal step + inclusive endpoint.
  const contractTicks = Math.ceil((finalWave * Balance.waves.waveInterval / cadence) / PLAYBOOK_STEP_SECONDS) + 2;
  maxTicks = Math.max(MAX_PLAYBOOK_TICKS, contractTicks);
}
```

A contract that declares **no `twist.secureWave`** never enters the branch, so it gets a flat
`maxTicks = 18_000` with **no inclusive-endpoint slack** — while the comment inside the branch spells
out exactly why that slack is needed.

`durationTicks` is an exclusive end. So on such a contract:

- if the rider's **last accepted order lands at the terminal tick 18 000**, `durationTicks` becomes
  **18 001 > 18 000** → the door refuses `reel_duration_exceeded`;
- if the last accepted order lands **any earlier tick**, `durationTicks` stays at **18 000 = the cap**
  → the reel is admitted.

The door is behaving exactly as documented (`reel_duration_exceeded` is in `public/skill.md`'s
refusal taxonomy). The defect is the withheld slack, and it costs exactly one tick.

## The measurement that settles it

Four reels, all Opus, all wave 20 / `timeAlive` 600 s, all on contracts declaring **no `twist.secureWave`**:

| contract | `durationTicks` | last entry `t` | door |
|---|---|---|---|
| `e6-half-life-hollow` | **18 001** | **18 000** | ❌ `reel_duration_exceeded` |
| `e6-picnic` | **18 001** | **18 000** | ❌ `reel_duration_exceeded` |
| `e9-devils-alley` | 18 000 | 17 560 | ✅ verified `fnv1a32:687553f2`, rank 1 |
| `e7-echo-canyon` | 18 000 | 17 905 | ✅ verified `fnv1a32:a525ade1`, rank 1 |

Same era, same rig, same wave count, same run length — **the only variable that predicts the verdict
is whether the final recorded order sits on tick 18 000 or before it.**

A third, independent confirmation of the mechanism came from the rig itself: on `e7-dead-band` it
computed `durationTicks 18001 > this contract 18000-tick door envelope` and **declined to put forward
a reel it had already determined was inadmissible.**

## What this does and does not mean (the correction)

**The operator's first write-up of this finding claimed 13 of the 32 heat-11 targets were
"structurally unclaimable". That was wrong, and the very next two rides disproved it.** 18 corpus
contracts declare no `twist.secureWave` and 13 of those are heat-11 targets, but lacking the slack is
a **hazard, not a bar**: two of the four measured reels on such contracts were admitted.

The accurate statement is:

> On a contract with no `twist.secureWave`, a secure whose banking order lands on the terminal tick
> is refused; the same contract, played so the last order lands earlier, is claimable. The bug costs
> some lawful runs, not all of them, and which runs it costs is not under the rider's explicit
> control — it depends on the tick at which `pendingSecure` is answered.

So `e6-picnic` and `e6-half-life-hollow` are **"won but unclaimed"** — genuinely winnable, and losable
to a one-tick accounting rule — and both remain re-rideable, since each rig still holds a second
scored attempt on them.

## The suggested fix (one line; the code already argues for it)

Give the default branch the same inclusive-endpoint slack the guarded branch documents:

```ts
let maxTicks = MAX_PLAYBOOK_TICKS + 2;
```

or compute `contractTicks` from the effective secure wave (`twist.secureWave ?? Balance.run.secureWave`)
so every contract gets the slack its own clock implies.

**This is a report, not a change.** The heat's firewall is `artifacts/gauntlet-heat11-*/**` plus one
BACKLOG row; `src/**` was not touched.

## Second envelope finding, same rig, same ride (`e7-relay-valley`, gen 26)

`maxTapeBytes = RUN_TAPE_FIXED_BYTES + maxEntries * RUN_TAPE_BYTES_PER_ENTRY` budgets **160 bytes per
entry** (`PlaybookFormat.ts:55`, calibrated on "the retained Baron proof… 140.7 bytes per entry").
A rider issuing 32-order arrays runs about **4 KB per entry**, ~25× the budget: the rig measured its
`tune-1` at **1 724 873 bytes after only 131 of 600 seconds**. An order-dense rider can therefore
breach `reel_too_large` long before any duration ceiling. The calibration holds for sparse
Baron-style play and not for order-dense play — this one is independent of the tick bug and, unlike
it, is not a one-tick edge case.
