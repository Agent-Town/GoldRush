# Heat 9 — PI and Prime Agent de-conflation field

Date: 2026-09-01 (Asia/Bangkok)

## Verdict

**FIELD STOPPED AT THE MANDATORY EARLY SKEW PROBE.** Live production and the detached arena were build `085ad8ac`, Era 5. The probe's honest current-build reel carried engine hash `417ac150318346d52acf9658a6578bc1cc9d54d484c922e80fb6cb8965c3c864`; the Era 5 registry records only `c0a015aed8285ebf05228ff1165395b86b9496d66af45e7c5b9c41d6bffc237b`. The public door returned HTTP 400:

`{"ok":false,"error":"reel_not_current","message":"This reel's engine pin is not recorded in era 5 'the Replayed Board'."}`

The task's skew law says `early probe, skew → STOP`. Neither rider launched, no gameplay attempt was burned, no unsecured tape was submitted, and neither identity was used as a substitute for the other.

## Gate and shim receipts

- Detached arena: `/tmp/heat9-325b7398` at `085ad8acda5c9bf3d14a8d87d96c7b81a3466345`.
- Arena install/build: green after correcting the recorded working-directory mistake; Vite built 2,214 modules and asset-diet passed.
- Era gate: Era 5, **the Replayed Board**.
- SSE: `"content":"OK"`, `"finish_reason":"stop"`, `data: [DONE]`.
- EPIPE/abort check: curl rc 28 after 1150 ms; shim remained live.
- Shim stopped cleanly; post-stop curl rc 7.
- Completion cap was three; field execution was planned serially, so the >3 concurrent 429 condition was never approached.

## PI matrix

| Map | Attempts | Result | Verdict | Papers | Era notice |
|---|---:|---|---|---|---|
| the-claim | 0/3 | field-wide DNF: pre-rider `reel_not_current` skew stop | no submission | n/a | present in PI charter; rider did not launch |
| e1-night-shift | 0/3 | field-wide DNF: pre-rider `reel_not_current` skew stop | no submission | n/a | present in PI charter; rider did not launch |
| e2-hill-mine | 0/3 | field-wide DNF: pre-rider `reel_not_current` skew stop | no submission | n/a | present in PI charter; rider did not launch |
| e1-baron | 0/3 | field-wide DNF: pre-rider `reel_not_current` skew stop | no submission | n/a | present in PI charter; rider did not launch |

## Prime Agent matrix

| Map | Attempts | Result | Verdict | Papers | Era notice |
|---|---:|---|---|---|---|
| the-claim | 0/3 | field-wide DNF: pre-rider `reel_not_current` skew stop | no submission | n/a | present in Prime charter; rider did not launch |
| e1-night-shift | 0/3 | field-wide DNF: pre-rider `reel_not_current` skew stop | no submission | n/a | present in Prime charter; rider did not launch |
| e2-hill-mine | 0/3 | field-wide DNF: pre-rider `reel_not_current` skew stop | no submission | n/a | present in Prime charter; rider did not launch |
| e1-baron | 0/3 | field-wide DNF: pre-rider `reel_not_current` skew stop | no submission | n/a | present in Prime charter; rider did not launch |

## Identity result

PI is `@mariozechner/pi-coding-agent`, invoked by the historical protocol as `pi -p`; Heat 9 located and installed version 0.73.1 in an isolated prefix. Prime Agent is the separate `prime-agent` CLI, version 0.8.0. The historical Heat 4 directory is explicitly `prime/`; Heat 5/5b contain neither guest harness. The heat-6 through heat-8 masters conflated the label as `pi (Prime Agent)`, and Heat 8's own driver proves what actually ran: its key `pi` called the `prime-agent` executable and wrote Prime Agent headers into a `pi__` notebook. Heat 9 corrected the boundary with separate charters, model states, executable paths, and notebook families before the skew gate stopped play.

## Submissions, standings, and commons

- Operator probe only: secure w10 / 300s / 200g, tape `agent-0b91cbb4-4ff68392-0d91-4fdd-9642-99107f2acd63`; **door-refused before storage**, so there is no verified slip or rank.
- PI: no submission and no Era 5 row earned.
- Prime Agent: no submission and no Era 5 row earned.
- No WATCH reel exists for the refused probe; reel-papers duty is not applicable to an unaccepted row.
- PI's new clean notebook family records the pre-rider stop as a non-generation; local-only commons commit `73bbf60`. Prime's notebook is unchanged because Prime never launched, so no Prime commons commit was warranted.

## Restoration and self-check

- No global PI, Prime Agent, OpenClaw, or other guest config was edited. Both model configs were isolated under `/tmp/heat9-*-state/`.
- The pre-existing Prime background service was untouched; the heat-owned Prime socket was never created.
- No secret value is present in the evidence.
- Gold Rush changes are confined to `artifacts/gauntlet-heat9-20260901/**`; no source, spec, review, STATUS, BACKLOG, or git-history change.
- The gauntlet checkout change is confined to PI's new notebook family and will be committed locally, never pushed.

READY-FOR-GATES
