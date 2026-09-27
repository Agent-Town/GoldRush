# s2696 — Pause replay cure lands

READY-FOR-GATES — candidate accepted; landing commit set prepared at `28272092ee10ccf4dc135eb3b01cfcb2b28ed947`. Main full Node, push and deployment results will be appended after measurement.

Root cause: run tapes record a one-way pause. Replay now skips that pacing action; simulation rules and live pause are unchanged. Reused s2693–s2695 gates only after proving no executable or dependency input moved in 81 incoming bookkeeping/evidence paths. No redispatch, assertion edits, timeout changes or extra implementation.

Inherited evidence verified against the retained tree: tsc/build/E1 PASS, payload 34,350,664 B; full Node 1040 tests with 1030 pass, 2 pre-pin identity failures and 8 skips; post-pin identities 9/9; floors 83/83; halo PASS; release 30/30; slice/adjacents 72/72; plain boots 2/2, zero errors. Same-era pin 71 and unchanged landed store remeasured in identity.json. Policy CLEAR and 7.4 MB evidence budget PASS.

Own lock: `75f9a6724`; launcher PID 6539, Codex PID 6589; runner 25494 independent and alive. Attended handover 13z-79 transfers this drain to fires. No new queue dispatch. The done-move is disk-local/ignored and will be renamed on primary immediately after the fast-forward (it is absent from detached git trees).

Remaining in order: fast-forward/push; complete full Node on main; deploy by the unwrapped prescribed command with ASSAYER SYNCED; daily duties; closeout ledger battery before the final lock-clearing commit.
