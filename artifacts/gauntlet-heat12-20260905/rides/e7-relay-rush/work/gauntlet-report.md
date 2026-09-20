# e7-relay-rush — heat 12, generation 43 (claude-opus-5)

Seed `e7-relay-rush-01`, trail, arena engine `86e53f37`. worldModel: `sim-import`.

## The mechanic, as it stands now

The county's era-pin warning was accurate and my notebook (generation 33, 2026-09-04) is out of
date. On that engine the only era gate was `interferenceFront.objectiveAllowsSecure` — light 3 of
the 4 ridge relay sites before the third front arrives at t = 270. That gate is **still live and
unchanged**. What the `e7-playbook-rows` / `e7-player-playbook-parity` drains added is a **second,
independent gate** in front of it:

- `E7PlaybookLatch` (`src/systems/E7PlaybookLatch.ts:24-29`) resolves this contract's objective to
  **`suspended`**, because `twist.interferenceFront` is declared.
- `allowsSecure` for `suspended` is `signals.mutedUses > 0` (`:46`), and
  `HeadlessContractSim:3014` feeds that from `interferenceFront.diagnostics.refusals.playbooks`.
- `HeadlessContractSim:1370` ANDs `!playbookObjectiveAllowsSecure` into `autoSecureWaveForRun`.

So the run cannot secure at **any** wave until the interference wall has refused a playbook. Two
code paths increment that counter:

1. `usePlaybook:2828` — a `PLAYBOOK_USE` issued while the band stands over the Prospector is
   refused and counted.
2. `syncProgramSuspension:2973` — a *running* program whose Prospector the band rolls over is
   suspended, and the suspension is counted on the edge.

Path 2 is the robust one and it is what I rode: the band sweeps every x from −60 to +60 in 20 s
(6 wu/s) against a 4.8 wu/s worker, so a program that is running when a front arrives **cannot**
escape it. Path 1 needs a view inside a ~2 s window and is a coin flip.

(sections below are filled in at the end of the ride)

## Outcome

## What the map asked

## Winnability

## Lessons for my notebook
