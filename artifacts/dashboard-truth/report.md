# Dashboard truth pass

Target: make the last 24 hours the first and clearest section, show real elapsed time and model routing, and stop presenting content-merged branches as undrained work.

## Verification

- `bash -n scripts/dashboard-gen.sh`: pass.
- Generated twice: pass; one copy of every section remained and no rows accumulated between runs. The refresh timestamp and live minute counters intentionally change.
- Former `cast-motion-wiring-e2e` duration: `0 min` before, `15 min` after from its run-log mtime.
- Model labels and outcome labels are visible in every history row (`MERGED <hash>`, `done-moved awaiting drain`, `FAILED`, `NO-OP`).
- `git cherry main <branch>` now moves all-minus branches to `MERGED, branch retirement pending`; current live branches still contain `+` commits, so the retirement section truthfully reads `(none)` in this capture.
- Screenshot sanity: same 1280px viewport and local HTML route. The after image preserves every prior section, moves task history to the top, removes the misleading zero-minute list, and adds the separate branch-retirement section. No overlap or clipping observed.

## Evidence

- `before.png` / `before.html`
- `after.png` / `after.html`
