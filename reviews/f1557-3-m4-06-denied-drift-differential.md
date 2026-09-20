# Review — f1557-3: M4-06 permission-denied drift differential

**Slice:** `tasks/lane-b-f1557-3-m4-06-denied-drift-differential.md` (FIRE-AUTHORED s1557)
**Branch:** `lane/b` · **tip:** `36b7c4e1d` · **merge-base:** `ff4c536f`-era main
**Merged to main:** `88b3ea977cd32fdf090f14f475a58588b2661411` (s1558, `--no-ff`, `ort`, no conflicts)

## VERDICT: MERGED — the reorder is delivered and valuable; the metric change is not what it claimed, and the flake is NOT cured

The slice was authored to cure a ~7% flake in `permission-denied receipts do not send the
Prospector to the denied target` by replacing an undirected drift proxy with a directional
one. **The reorder half succeeded and is the real deliverable. The metric half is measured
inert, and the test still flakes at ~3% for an entirely different reason** — which this
slice is the thing that let us see.

Merged rather than held because nothing regresses and the merged state is strictly better
than main's previous state: the three assertions that encode the actual permission rule
(`:411` not moving · `:412` target unchanged · `:413` target is not the denied node) now
run **before** any proxy and passed **100/100**. Under the old order a drift outlier aborted
the test before the rule was ever checked.

## What it does

`e2e/m4-06-embodiment.spec.ts` (+9/−1) — computes `driftAbs` and `gapClosed`, logs both,
reorders so the three semantic assertions precede the numeric bounds, replaces
`driftAbs < 0.45` with `gapClosed < 0.45` plus a loose `driftAbs < 0.6` sanity bound, each
threshold carrying a comment citing the archived distribution.
`artifacts/f1557-3-m4-06-denied/distribution.txt` (+74) — the runner's 30×2-sample raw
measurement, taken with the original assertions still in place.

Firewall respected: no `src/**` touched, so a test-correctness slice did not become a
product edit. Verified by reading the diff, not the report.

## Evidence

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | rc=0 |
| `npm run build` | green, `✓ built in 1.03s` |
| `m4-06-embodiment` desktop-chrome | 9/9 passed (40.9 s) |
| `m4-06-embodiment` mobile-chrome | 9/9 passed (40.2 s) |
| adjacent `m4-07` + `m4-08-agent-attribution` desktop-chrome | 6 passed, 1 skipped (16.4 s) |
| flake re-measurement, 100 mobile runs | **97 passed / 3 failed (~3%)** |

All gated on the **merged tree** in detached worktree `gate-s1558` (§3.0b), `--workers=1`
(§3.1), machine idle. Full transcript: `artifacts/f1557-3-m4-06-denied/s1558-merged-tree-measurements.md`.

`test:node-guards` deliberately NOT run: the diff touches `e2e/` + `artifacts/` only, no
`src/sim|src/systems|src/entities`, so F-1460-1 does not bind. Declared rather than implied.

## Merge classification

Both paths **LANE-TOUCHED, main moved neither** — `git merge` reported no conflicts and the
`ort` strategy applied both cleanly. `e2e/m4-06-embodiment.spec.ts` was verified
byte-identical between lane-b and main at `ff4c536f` by s1557 at dispatch, and main has not
touched it since. `artifacts/f1557-3-m4-06-denied/` is new in the lane.

## Findings

### F-1558-1 — the flake is NOT cured, it is a DIFFERENT flake, and the slice is what revealed it (non-blocking; corrective owed)

Measured on the merged tree: **3 failures in 100 mobile-chrome runs (~3%)**, every one of
them at `:421`:

```
Expected value: "ledger"
Received array: ["held", "ask me", "no trust"]
> 421 |   expect(['held', 'ask me', 'no trust']).toContain(after.lastLine);
```

`after.lastLine === "ledger"` — after a *denied* receipt the companion's last spoken line is
intermittently a **ledger-voice** line instead of a denial line.

✓ **This is provably not a drift failure**, and the proof does not depend on catching the
error: across all 100 runs `driftAbs` took only the values `0.2834`, `0.3529`, `0.2080` —
**max 0.353 against bounds of 0.45 (`gapClosed`) and 0.6 (`driftAbs`)**. No drift assertion
could have failed in any run, so all three failures were semantic-tail.

⚠️ **The `lastLine` flake is PRE-EXISTING and independent of this slice** — `:421` was
asserted before the change too, merely later in the list. It has most likely been
misattributed to the drift flake for the whole life of F-1285-2, because a single test that
fails two ways reports whichever assertion is reached first. **Two independent intermittent
failures wearing one finding's name** is the reusable shape here.

Open question for the corrective: is `lastLine === "ledger"` a **product** defect (a denial
should suppress or outrank a queued ledger line) or a **test race** (the 350 ms wait can land
between the ledger float and the denial line)? Not answered this fire; do not assume the
cheaper one.

### F-1558-2 — the directional reform's premise is measured false; the reorder, not the metric, was the value (non-blocking, closed as a correction)

F-1557-3's WHY holds that `:410` measured "**undirected** drift over ≈1.4 s of sim, which
idle wander alone can exceed", and that a directional measure would be tight where the
undirected one is loose. **Measured across 160 samples, that is false:**
`gapClosed = driftAbs − 0.00105`, always. The drift is almost exactly along the line to the
denied node, so swapping the metric at the same `0.45` threshold moves the failure boundary
by ~0.001 — a rename, not a reform.

⚠️ Consequence the runner's own margin table does not state: the claimed "+0.098 margin" is
computed against a sample that **never reproduced the known failure**. s1557's outlier at
`driftAbs=0.4757` appears in **0 of 160** subsequent samples; if it recurs, `gapClosed ≈ 0.4747`
would **still** exceed 0.45. The bound is no more robust to the known tail than the one it
replaced.

💡 This does not make the slice worthless — it relocates its value. What actually improved is
the **ordering**: the permission rule is now proven on every run instead of being skipped
whenever a proxy tripped first. s1557 identified the ordering defect correctly and the metric
defect incorrectly, and only running the thing distinguishes them.

### F-1558-3 — the master's STOP condition was reachable and was not taken (non-blocking, process note)

The master required "an explicit STOP if the spread cannot support a meaningful bound". The
spread is **two discrete values** (`0.2834`/`0.3529`) with a known out-of-sample outlier at
`0.4757` — arguably exactly that case. The runner instead selected `0.45` and reported a
margin against the in-sample max. Not a firewall breach and not worth a re-run, but worth
recording: **a STOP condition phrased as a judgement will usually lose to a computable
margin**, because the margin is the thing that looks like evidence.
