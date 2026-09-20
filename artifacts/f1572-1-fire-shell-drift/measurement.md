# F-1571-1 — the fire-shell drift measurement, run s1572

**Run by:** s1572 fire, immediately after `f1571-1` merged at `9bfecb997a892889ee65e4c4e595ce16ebafe745`.
This measurement was impossible before that merge: the pre-reorder assertion order deletes the
sample on exactly the runs most likely to be interesting (F-1565-2 censoring half).

## Arrangement

- **Shell:** the FIRE shell (`CLAUDE_CONFIG_DIR` set by launchd — genuinely a fire process, not a
  lane exporting the variable). Per F-1571-1 a lane cannot manufacture this arrangement, because
  the CPU ceiling is a property of the process context (F-1269-1), not of an environment variable.
- **Spec:** `e2e/m4-06-embodiment.spec.ts`, **full spec** — not the isolated test. F-1563-3 measured
  isolated runs passing with 29% margin while full-spec runs breached, so the isolated arrangement
  answers a different question.
- **Project:** `desktop-chrome`. `--workers=1` on every run (§3.1).
- **Runs:** 11 separate playwright invocations (8 + 3), each starting its own dev server.

## Result — the breach did NOT reproduce

| statistic | value |
|---|---|
| desktop observations (this session) | **10** matched + 1 unmatched (see caveat) |
| plus the two gate-battery desktop runs | **12 total desktop observations** |
| **breaches of `0.4`** | **0** |
| max | **0.3722002149381437** |
| min | 0.20800000000000016 |
| distinct values in 10 | 7 |

Observed value set, sorted:

```
0.20800000000000016
0.26277176408434727
0.28338313287844020
0.30267639485100240
0.31888869531546643
0.33233868267175914
0.37220021493814370
```

## What this means

1. **The maximum is `0.3722002149381437` — bit-for-bit the same maximum F-1564-1 recorded over 24
   LANE-shell observations.** Two shells, two independent sample sets, identical maxima. That is not
   a coincidence; it is the quantisation F-1559-1 identified, and it says the ceiling behaves the
   same in both shells.
2. **F-1563-3's localisation of the breach to the fire shell is REFUTED by its own prescribed
   measurement.** The fire shell produced zero breaches in 12 observations, while the only breach on
   record this week (`0.4096828041302199`, f1571-1 runner) came from the **lane**. The localisation
   was an artifact of *when* samples happened to be taken, not a property of either shell.
3. **Values recur exactly across runs and across arms** (`0.3722002149381437` three times,
   `0.33233868267175914` and `0.26277176408434727` twice each, including across the merged/control
   arms of the drain gate). The quantity is strongly quantised, so means and margins computed as if
   it were continuous will mislead.

⛔ **This is not a re-pin instruction.** F-1441-3 stands: a re-pin needs a named cause, and this
measurement produces none — it produces the opposite, evidence that the bound is not being
approached in this shell at all.

## Caveat, stated rather than smoothed over

One run of the first batch of 8 reported no sample while the suite still read `10 passed`. My probe
matched with `driftAbs=([0-9.]+)`, which **cannot match scientific notation or `NaN`** — so I cannot
distinguish "the sample was absent" from "the sample was present in a form my regex could not read".
Three follow-up runs using a substring filter (independent of number format) found the line present
every time. The honest statement is therefore: **1 of 11 runs unresolved, attributable to my probe
and not demonstrated to be a second censoring channel.** Filed as **F-1572-3**.
