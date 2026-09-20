# Heat 10 R2 — the level field

Date: 2026-09-02 (Asia/Bangkok)

## Verdict

**CONTROLLER PARITY REMOVED THE PER-ORDER LATENCY TAX, BUT IT DID NOT MAKE THE RIDERS EQUAL STRATEGISTS.** Prime Agent re-earned The Claim at verified rank 6 and pushed its Baron line to wave 18. PI improved on Night Shift and Hill Mine but lost its prior Claim row to a controller bug at the secure window. Neither rider felled the Baron.

## Mandatory preflight and arena law

- Live build: `c13b4c24`; detached arena `/tmp/heat10-r2-c13b4c24` at `c13b4c24d85f4189bddde1acf8913c136887f715`; Era 5.
- Arena install was `npm ci --no-audit --no-fund` only. No `npm install` or `npm update` ran. The committed and post-install lockfile SHA-256 remained `1a1fa48ea5f6998f1f663732de3fe16dce266ba90be4e24c7b7ea3fab26ee863`.
- Before the probe, `computeEngineHash` from the arena's `scripts/assay-replay-agent.mjs` returned `25040ad58451125adfa7d1d6c19c70f40ce17cd8cc6d377134e0a545922ca2ca`; the Era-5 registry recorded the same value as its declaration and pin (`recorded: true`).
- The early probe was accepted at rank 5, assayed `verified`, hash `fnv1a32:8886f412`; WATCH papers were build `c13b4c24d`, engine `25040ad58451125adfa7d1d6c19c70f40ce17cd8cc6d377134e0a545922ca2ca`, Era 5.
- Build green after `npm ci`: TypeScript, Vite (2,214 modules), and asset-diet passed.
- Identity receipts carried from Heat 9 R2: PI is `pi` 0.73.1; Prime Agent is `prime-agent` 0.8.0. They used separate charters, state, matrices, and notebooks.

## Leveling delta

| Rig | Map | Heat 9 R2 | Heat 10 R2 | Delta |
|---|---|---|---|---|
| PI | The Claim | secured w10, verified rank 6 | w3 death; w1 death; reached w10 secure window but controller hung on an invalid multi-order secure response | verified row lost; no terminal tape |
| PI | Night Shift | best w3 | w2; w2; **w4** | **+1 wave** |
| PI | Hill Mine | best w2 | w2; w1; **w4** | **+2 waves** |
| PI | Baron | best terminal w12; other rides hit walls | w5; w10; **w11** | -1 terminal wave; no boss |
| Prime Agent | The Claim | secured w10, verified rank 8 | w1; w4; **secured w10, verified rank 6** | **+2 rank places** |
| Prime Agent | Night Shift | best w5 | w2; **w7**; w5 | **+2 waves** |
| Prime Agent | Hill Mine | best w3 | w1; **w6**; w1 | **+3 waves** |
| Prime Agent | Baron | three 20-minute per-turn walls, no terminal tape | w4; w6; **w18 / 712 kills / 114 calls** | first terminal Baron result; no boss secure |

## PI matrix — `pi` 0.73.1

| Map | Mode | Scored rides | Result | Verdict / papers |
|---|---|---|---|---|
| The Claim | controller-authoring via operator exec loop | 3 | death w3/99.033s/5g; death w1/31.467s/0g; secure boundary w10 then repeated validation refusal until interrupted | not submitted; no terminal tape |
| Night Shift | controller-authoring via operator exec loop | 3 | death w2/84.967s/5g; w2/86.567s/5g; w4/142.8s/10g | not submitted |
| Hill Mine | controller-authoring via operator exec loop | 3 | death w2/85.5s/5g; w1/42.133s/5g; w4/127.233s/10g | not submitted |
| Baron | controller-authoring via operator exec loop | 3 | death w5/136s/65 kills; w10/268.033s/272 kills; w11/304.867s/342 kills | not submitted; boss not reached |

PI's evidence span was 86.4 minutes for the whole rig, below 4.5 hours; no map approached its 90-minute ceiling.

## Prime Agent matrix — `prime-agent` 0.8.0

| Map | Mode | Scored rides | Result | Verdict / papers |
|---|---|---|---|---|
| The Claim | controller-authoring via operator exec loop | 3 | death w1/31.467s/5g; w4/142.4s/0g; **secured w10/300s/35g** | **verified rank 6**, assay `fnv1a32:fcf5753a`; exact Era-5 WATCH papers |
| Night Shift | controller-authoring via operator exec loop | 3 | death w2/85.033s/5g; w7/235.3s/25g; w5/152.033s/45g | not submitted |
| Hill Mine | controller-authoring via operator exec loop | 3 | death w1/45.133s/10g; w6/196.467s/55g; w1/42.133s/50g | not submitted |
| Baron | controller-authoring via operator exec loop | 3 | death w4/127.967s/62 kills; w6/168.7s/114 kills; **w18/476.633s/712 kills** | not submitted; Baron not felled |

Prime Agent's evidence span was 16.1 minutes for the whole rig, below 4.5 hours; no map approached its 90-minute ceiling.

## Controller authorship, transport, and commons

- Every actual controller is stored verbatim under the relevant rig/map directory. Every controller declared `// SCORED: yes`; neither rig requested a diagnostic ride or per-turn mode.
- Operator-authored files are labeled transport shims: `author-controller.mjs`, `controller-runner.mjs`, `first-view.mjs`, `build-submission.mjs`, and `publish-submission.mjs`. They contain no strategy or coordinates. The operator never edited a rider controller.
- PI Claim attempt 3 is retained as a 24.4 MB transcript: its authored controller sent `SECURE_CHOICE` with other orders, violating the door's single-order secure-window rule. It was interrupted as a hung scored ride; no logic was repaired.
- PI Hill attempt 2 first completed deterministically but failed to write its tape because the operator supplied a relative evidence path. The failed transcript is retained as `attempt-2.transport-failed.log`; the identical controller was rerun with absolute output paths and was not charged an extra scored attempt.
- Prime's first Baron authoring call returned an empty completion. The zero-byte receipts are retained; one bounded authoring retry succeeded before any ride began.
- The SSE/EPIPE health evidence from preflight is retained. Completion calls were serialized; no 429 occurred.
- Controllers were copied verbatim into each rig's own `memories/.../controllers/heat10-r2/`, and generation 2 was appended to each notebook. Commons commits: PI `2969703`; Prime Agent `f5b6756`. Nothing was pushed.

## What leveling changed

Heat 9 mostly measured how fast a stateless model could answer one view at a time. Heat 10 moved that latency outside the simulation: each rig paid one authoring call, then its controller ran a full ride at simulator speed. The strongest demonstration is Prime's Baron attempt 3: 114 simulator decisions and 476.633 simulated seconds completed in about 19 wall-clock seconds, where Heat 9 exhausted a 20-minute wall around 71–78 per-turn orders. The reform exposed controller quality instead of completion latency. It improved five non-Claim bests across the pair and gave Prime a deep Baron terminal result, but it also exposed a new failure class—PI's valid-looking controller could reach the secure boundary and still fail the door's single-order rule forever.

## Self-check

- Both four-map matrices are complete and name modes, scored attempts, results, and verdicts.
- The only secured tape was submitted; its public assay is verified and its WATCH papers match exactly.
- All authored controllers and iteration transcripts are banked; transport interventions are labeled.
- No unsecured tape was submitted. No strategy was operator-authored or repaired.
- `npm ci` was the only arena dependency install. Lockfile identity remained unchanged.
- Post-field `npm run build` also passed on the lane tree: TypeScript, Vite (2,214 modules), and asset-diet green.
- Global guest configs were never edited; heat-local state was used. The shim stopped and post-stop curl returned rc 7. The exact heat-owned Prime socket owner PID 88518 was stopped; the two pre-existing Prime processes (80984 and 81066) remained running.
- Gold Rush changes are confined to `artifacts/gauntlet-heat10-r2-20260902/**`. No source, spec, review, STATUS, BACKLOG, existing e2e, or git history was touched.
- No secret value appears in evidence.

READY-FOR-GATES
