# F-1493-2 — the E2 Baron drift tripwire

- **Slice / branch / tip:** `lane-f1493-2-baron-drift-pin` · `lane/a` · `0ffd24a55` ("bdp: pin E2 Baron outcomes")
- **Merged:** `5507b629975e1faf4323976cd1d2091c184a48d8` (main, s1495, fast-forward from the gated tree)
- **Gated in:** detached worktree `gate-s1495` at merge `5507b6299` (§3.0b — undecided content never entered main's working tree)
- **Verdict:** ✅ **MERGED.** The slice does exactly what its master asked, including the part that would have been easy to fake.

## What it does

Adds one test (+82 lines, `scripts/gr-sim.test.mjs`, the only file touched) that pins the terminal
outcome of the three E2 baron contracts under a 100,000-HP / 1,000-damage test rig.

The finding it closes: when `ff628a132` correctly relaxed the census equality on baron contracts —
`autoSecureWaveForRun()` returns `Number.MAX_SAFE_INTEGER` while `twist.baron && !baronBeaten`, so the
old equality was unsound — it removed the only thing that would notice **a baron fight getting longer**.
A Hill Mine run drifting 14 → 25 waves passed everywhere. This is the replacement tripwire.

## Why this slice is trustworthy, and not merely green

The master deliberately stated **no expected values**, and told the runner in as many words that two
disagreeing runs are a **FINDING that forbids a pin** — a STOP would have been the more valuable
outcome. That framing exists because the cheap failure here is indistinguishable from success at a
glance: pin whatever the first run printed, get a green, and record a snapshot as if it were an
invariant.

The runner took the expensive path:

| Check the master demanded | What the run reports |
|---|---|
| determinism **in-process**, before pinning | both runs matched for all three contracts |
| determinism **cross-process** | 10/10 complete runs, identical pins |
| wall-time budget (`gr-sim.test.mjs` is already the battery's dominant term) | 68.63 s → 86.04 s, **+17.41 s against a 30 s cap** |
| contract state captured at module load | caught by its own review; now **one Vite module graph per contract** |

Pinned values: `e2-hill-mine` 12 waves / 445 kills / `fnv1a32:a3b2c95e` · `e2-trestle` 12 / 448 /
`fnv1a32:94275d9a` · `e2-incline` 12 / 424 / `fnv1a32:3362e2f0`.

The test carries a NAMED-CAUSE comment at the pin site: a red requires a named cause, blind re-pinning
is forbidden (F-1441-3). That is the standing prohibition this pin is most likely to collide with, and
it is written where the next reader will be standing.

## Evidence

All arms `--workers=1` (§3.1), run on the **merged** tree in `gate-s1495`, transcript
`artifacts/s1495-drain-gate.txt`.

| Arm | Result |
|---|---|
| `npx tsc --noEmit` | **rc=0** |
| `npm run build` | **rc=0** |
| `npm run test:node-guards` | **rc=0** — **340 → 341 tests, +1 exactly, 0 fail** |
| the new pin actually executed | `✔ the E2 Baron fights keep their pinned outcomes (13063.2 ms)` |

**The count is the load-bearing number, not the rc.** A pin that silently does not run still returns
rc=0 and reads as coverage — worse than no pin. The +1 delta and the named `✔` line are what prove the
test executed rather than being skipped.

**Landing identity:** `git diff 5507b6299 HEAD` **EMPTY** and `git log main..lane/a` **EMPTY** — the
evidence above describes exactly what shipped, not a lookalike tree.

## Merge classification

Base `25476759b` (main at gate time). One file, `scripts/gr-sim.test.mjs`, **LANE-TOUCHED only** —
main had not moved it since the lane's base, so the merge was clean with no graft and no conflict.
Landed by fast-forward from the gated commit rather than re-merging, so the gated tree and the shipped
tree are provably the same object.

## Findings

**F-1495-3 (non-blocking, carried forward not buried) — the interpreter split is still live on this
file.** The runner reports that on the **Node 23** runner `scripts/gr-sim.test.mjs` retains the
documented timeout-control incompatibility: 339/341, with the pre-existing per-test-timeout and
fixture-teardown failures. The fire shell is Node 26.4.0, where it is 341/341 and where this drain
gated. This is the known F-1458-2 split, not a regression introduced here — recorded so that a future
reader who runs the battery under Node 23 and sees two reds does not mistake them for this pin's.
