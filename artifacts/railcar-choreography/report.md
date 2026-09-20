# Railcar choreography — blocked pre-flight

The lane was clean, but `HEAD` contains two commits absent from `main`:

- `7d4a7e80 (archive: pruned by the A3 rewrite) runner(lane-c): e2-drip-02-pressure-garden.md`
- `56ab99d8 runner(lane-c): e3-03-day-night-cycle.md`

`git log --oneline main..HEAD` and `git diff --stat main...HEAD` confirm this is undrained sibling work, not a safe duplicate. Per the queued task's binding LADDER-STALL protocol, railcar implementation and gates did not start.

Unblock: drain or otherwise preserve those commits, refresh lane-c from current `main`, then requeue `railcar-choreography`.
