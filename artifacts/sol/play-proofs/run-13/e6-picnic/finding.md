# The Picnic — HELD, both projects

Own contract `e6-picnic`, terrain alias `e6-glow-mesa`. All three sandwich stakes are claimed at six-second timers; the run correctly ends despite 100 HP. Default desktop ends at wave 2 / 83.333 s; phone at wave 2 / 81.333 s. Both have 15 gold, zero repairs, two of two defenses standing, zero console/page errors. No secure/bank/Book/reload.

The default kit targets the west stake as home (-16,18) but places its turret at (-15,14) and beacon at (-20,18), distances 4.123 and 4.000 from the stake. Both exceed the authored radius 3 (`src/systems/PicnicHoldSystem.ts`). The other two stakes are also unprotected. Gathering for the third turret leaves the objective unheld. This is a driver placement/defense failure, not a defective loss rule or proof of impossible balance. The contract explicitly permits a 10-gold palisade to hold a stake; this driver never tries that opening.

No restore-ground retry: the failure is the stake objective with full hero health and intact works, not hero/defense attrition on a working objective. One default ride per project; paired command exit 1 at secure assertion. No F-PP9 map-defect ID. Follow-up owner: QA/native objective route — pan the nearby meadow seam and place a work inside a stake's actual radius; prove it holds before expanding. No kit/balance/runtime edits here.

Reproduction: `python3 artifacts/sol/play-proofs/run-13/run-map.py e6-picnic`. Exact argv/env, direct exit, trimmed failure log, compact rows, frozen objective states and terminal JPEGs are in `default/`; raw rows/logs remain at the paths in each row. Human-shaped Book launch, no debug/seed URL, timescale 4, desktop then 390×844 phone, one worker. Desktop terminal directly inspected: wave 2, 100 HP, 15 gold and loss ledger.
