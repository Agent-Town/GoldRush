# Node guard process capture — F-2546-1

Measured 2026-09-07 by s2546 on main d1471866b; corrective authored, not implemented.

The quiet-board test and the real Node guard launcher both capture matching process command lines with spawnSync ps and no explicit maxBuffer. A large observer is collected before the correct shared invocation classifier can reject it. The test fails loudly with ENOBUFS; the launcher treats capture failure as advisory and drops its contention stamp.

The prior MAIN terminal snapshot (`artifacts/s2545-fire/main-node-terminal-observed.txt`, SHA256 187e3855358cbebf2deb21d0004a7182d4da02b457e98cb462ff26e3452a0099) reports 742 tests, 735 pass, two ENOBUFS failures, five skips, 1623.300 seconds. The fixture sweep stopped on its failing child; its title does not establish all subjects ran and the npm chained tail did not execute. This is neither a gold-runtime regression nor evidence of actual concurrent batteries.

`artifacts/s2546-fire/ps-capture-probe.mjs` extracts both current functions and uses PATH-local fake processes. Re-run from the repo root with native Node 26. It writes `ps-capture-probe.json`: eight short/long × original/64-MiB × quiet/stamp observations. At 1,200,000 observer characters, original capture fails quiet and returns NO_STAMP; the bounded option restores QUIET and CONTENDED — 2. Short controls are unchanged. The quiet arm fixes classification false to isolate capture; the advisory arm imports the real classifier and includes a true sibling. No real battery or large-argv process is started. This probe is evidence, not the final regression suite; the corrective requires the real classifier in its persistent check.

The live census in `process-capture.json` was only 8,926 bytes; it did not reproduce the historical overflow or identify its producer. The failure mechanism is reproduced, the historical producer is unknown. Raw argv was not retained.

Corrective: `tasks/lane-a-node-guards-ps-capture.md`, lane-a, both capture sites plus a regression in the existing test. No simulation, buffer-policy framework, battery serialization, or deadline change. The fix remains pending and has a finite capture ceiling. Dispatch only after MAIN's current full Node battery exits; do not touch or redispatch MAIN's owned gold files or the held chapter patch.
