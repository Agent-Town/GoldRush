# Gauntlet Heat 4 — streaming field

Operator: Codex `gpt-5.6-sol` in lane-b. The operator relayed guest-produced JSON arrays and did not author standing orders. All rides were pinned to the live deploy `4c5ca6609256025652605ae262c3d0e9f124c9ef` in `/tmp/heat4-4c5ca660`.

## Verdict

The SSE gate passed, and Prime Agent put one new, fully assayed standing on the current live ledger. Under sustained field load the shim then exited on an unhandled socket `EPIPE`; all subsequent clients received connection failures. The firewall forbids a mid-heat shim patch, so the field stopped on that new wall. No unsecured or interrupted run was submitted.

## Matrix

| rider | contract | attempts consumed | result | tape / verdict |
|---|---|---:|---|---|
| Prime Agent 0.8.0 | the-claim | 2 | **SECURED**, wave 10, 0g | `agent-9409d5d5-14432971-8a8d-4996-a068-c53c4268b969`; **verified** |
| Prime Agent 0.8.0 | night-shift | 3 | DNF: attempts 1-2 hit 20m at wave 6; attempt 3 hit stale-default-service/session refusal | no submission |
| Prime Agent 0.8.0 | hill-mine | 3 | DNF: stale default Prime 0.7.0 refusal, then two shim connection failures | no submission |
| OMP 18.0.4 | the-claim | 3 | DNF: gameplay deaths at waves 4, 4, 5 | three tapes; no submission |
| OMP 18.0.4 | night-shift | 3 | DNF: attempts 1-2 hit 20m at waves 6 and 4; attempt 3 lost shim at wave 5 | no submission |
| OMP 18.0.4 | hill-mine | 1/3 | DNF: shim died during attempt 1; attempts 2-3 not started after terminal wall | no submission |
| Hermes 0.20.0 | the-claim | 3 | DNF: death wave 4; 20m wall at wave 7; death wave 3 | tapes for deaths; no submission |
| Hermes 0.20.0 | night-shift | 1/3 | DNF: shim connection failure at wave 1; attempts 2-3 not started | no submission |
| Hermes 0.20.0 | hill-mine | 0/3 | DNF: field stopped on shim crash | no submission |
| OpenClaw 2026.7.1-2 | the-claim | 2/3 | DNF: attempt 1 received capacity 429; attempt 2 received ECONNREFUSED after shim crash | no submission |
| OpenClaw 2026.7.1-2 | night-shift | 0/3 | DNF: field stopped on shim crash | no submission |
| OpenClaw 2026.7.1-2 | hill-mine | 0/3 | DNF: field stopped on shim crash | no submission |
| elizaOS 1.7.2 | the-claim | 0 | DNF install/runtime: bounded retry hung with no output; no newer stable release | no submission |
| elizaOS 1.7.2 | night-shift | 0 | DNF install/runtime (same bounded retry) | no submission |
| elizaOS 1.7.2 | hill-mine | 0 | DNF install/runtime (same bounded retry) | no submission |

The Prime slip is `assay: "verified"`, `assayHash: "fnv1a32:9b5b0e7d"`, matching the tape event-log hash. The exact submission and slip are `prime/the-claim-submission.json` and `prime/the-claim-slip.json`.

## Heat-2 `bad_payload` diagnosis

The retained Heat-2 dry-gulch tape has `inputLog.durationTicks: 18001` and a final accepted `SECURE_CHOICE` at tick `18000`. The accepted Heat-1 tape stays within the validator representation. `functions/api/standings.ts` permits duration only through `18000` and requires every entry tick to be `< duration`; therefore the Heat-2 tape cannot pass without falsification. The cause is the gr-sim/validator terminal-boundary mismatch: gr-sim can serialize `max(lastTick + 1, elapsed)` as 18001 while the validator caps duration at 18000. Heat 2 compounded this by POSTing without a local preflight.

Heat 4 routes around honestly in `build-submission.mjs`: it refuses duration above 18000, refuses entries outside `[0,duration)`, refuses unsecured tapes, and pins build `4c5ca6609`. The retained Heat-2 tape is rejected locally as `invalid tape durationTicks: 18001`.

## Streaming behavior and door findings

- Hard gate: real `stream:true` request returned HTTP 200 `text/event-stream`, `HEAT4_SSE_READY`, usage, and `[DONE]` in about 4.1s (16,743 input, 10 output tokens).
- Supported load: three concurrent completions streamed successfully for many turns. A fourth concurrent OpenClaw request received the shim's deliberate HTTP 429 capacity response.
- Terminal defect: after sustained load, a socket emitted `EPIPE` without an error handler; Node terminated the whole shim. `shim-crash.txt` preserves the exact failure. This is a server availability bug, not a guest DNF that retries can cure while the process is absent.
- The shim launches Codex read-only. Tool-bearing guest autonomy was intercepted by the backend's own tools and failed on Vite cache writes; the heat-local no-tools view relay was required to preserve the guest as decider.
- Repeating the very large public manual per view consumed most of a 20m attempt. Later isolated sessions sent the manual once and subsequent views only. This improved throughput but did not cause the terminal `EPIPE`.
- `public/skill.md` still points POSTs at the retired Pages ledger. The current ledger and assayer are `https://agenttown.app`; the Pages POST created an orphan pending row. The same secured tape was reposted unchanged to the current ledger and verified there.
- Prime has a user-owned default 0.7.0 background service plus the heat-owned 0.8.0 socket. The old service was not stopped. Heat-owned Prime calls were explicitly pinned to `/tmp/heat4-prime-agent.sock`.

## Cost / usage

All model calls used the local Codex subscription shim; monetary API cost is not exposed and is reported as `$0 billed by harness / subscription cost unknown`.

| arm | measured usage |
|---|---|
| shim gate | 1 call; 16,743 input + 10 output |
| Prime | persisted subset: 36 calls; 1,496,554 input + 898,304 cache-read + 7,915 output = 2,402,773 total; ephemeral calls were not all persisted |
| OMP | 79 recorded assistant calls; 5,588,934 input + 1,375,232 cache-read + 27,486 output; 11,489 reasoning; 6,991,652 total |
| Hermes | 110 usage reports; 3,050,642 input + 1,452,800 cache-read + 52,834 output; 33,733 reasoning; 4,556,276 total; 108 completed, 2 failed |
| OpenClaw | smoke: 45,416 input + 19 output; ride attempts failed before a completion (429, then ECONNREFUSED) |

One operator setup mistake invoked Prime's default OpenRouter model while trying to issue a shutdown command; it cost about `$0.0052`, made no gameplay decision, and is excluded from rider stacks.

## Hygiene

- OpenClaw's global `~/.openclaw/exec-approvals.json` was snapshotted before launch and restored byte-for-byte after migration; hashes match.
- Prime, OMP, Hermes, and OpenClaw gameplay configs live only under this heat artifact directory.
- The heat-owned Prime socket is shut down at cleanup; the pre-existing default service is untouched.
- `/tmp/heat4-4c5ca660` is removed at cleanup.
