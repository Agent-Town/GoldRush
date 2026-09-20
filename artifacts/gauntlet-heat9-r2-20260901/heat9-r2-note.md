# Heat 9 R2 — PI and Prime Agent de-conflation field

Date: 2026-09-01 (Asia/Bangkok)

## Verdict

**THE PIN CURE HELD, BOTH DISTINCT RIGS RODE, AND BOTH RE-EARNED AN ERA-5 CLAIM ROW.** The live build was `ec71f9234`, Era 5, engine `25040ad58451125adfa7d1d6c19c70f40ce17cd8cc6d377134e0a545922ca2ca`. The early probe, PI, and Prime Agent submissions were all accepted, machine-verified, and returned exact WATCH papers. Neither rider secured Night Shift, Hill Mine, or Baron.

## PI matrix — `pi` 0.73.1

| Map | Attempts and result | Verdict | Papers | Era notice |
|---|---|---|---|---|
| The Claim | diagnostic driver attempt died w2/81.767s/20g after later stateless calls lost the manual; corrected first clean attempt secured w10/300s/2g | **verified rank 6**, `fnv1a32:490b83e3` | build `ec71f9234`; Era 5; full current engine | charter + reflection |
| Night Shift | death w2/89.267s/0g; death w2/88.633s/0g; death w3/109.433s/5g | not submitted | n/a | charter + reflections |
| Hill Mine | death w2/84.667s/10g; death w2/85.5s/5g; death w2/85.5s/15g | not submitted | n/a | charter + reflections |
| Baron | 20m wall after 66 orders; death w12/327.567s/5g; 20m wall after 74 orders | not submitted; boss not reached | n/a | charter + available reflection |

The diagnostic Claim attempt is retained as transport evidence but is not counted as a clean gameplay attempt: the stateless driver supplied the manual only on the first completion, causing three rejected order arrays later. The root cause was fixed once by supplying the full briefing to every stateless completion; all subsequent PI and Prime transcripts had zero rejected arrays.

## Prime Agent matrix — `prime-agent` 0.8.0

| Map | Attempts and result | Verdict | Papers | Era notice |
|---|---|---|---|---|
| The Claim | death w4/126.733s/10g; death w4/129.5s/15g; secured w10/300s/0g | **verified rank 8**, `fnv1a32:904e9638` | build `ec71f9234`; Era 5; full current engine | charter + reflections |
| Night Shift | 20m wall after 65 orders; death w3/113.967s/5g; death w5/161.067s/0g | not submitted | n/a | charter + available reflections |
| Hill Mine | death w1/42.133s/10g; death w1/42.833s/0g; death w3/90.1s/0g | not submitted | n/a | charter + reflections |
| Baron | 20m walls after 72, 71, and 78 orders | not submitted; boss not reached | n/a | charter; no terminal reflections |

## Verified submissions and reel papers

- Operator probe: rank 4, tape `agent-0b91cbb4-6afad806-0dd6-4749-a0fe-c4834bd462de`, assay `verified`, hash `fnv1a32:8886f412`.
- PI Claim: rank 6, tape `agent-f66211a9-72c59534-0b16-415e-8a86-b757e99df181`, assay `verified`, hash `fnv1a32:490b83e3`.
- Prime Agent Claim: rank 8, tape `agent-5224920f-1f930e06-d367-4f67-8d20-2f7c03b5b32d`, assay `verified`, hash `fnv1a32:904e9638`.
- Every WATCH response returned exactly `{"buildId":"ec71f9234","engineHash":"25040ad58451125adfa7d1d6c19c70f40ce17cd8cc6d377134e0a545922ca2ca","era":5}`.

No unsecured or wall-only attempt was posted.

## Embodiment and commons

Both charters carried the live embodied BUILD rule and Era-5 fresh-board notice. The terminal evidence did not isolate walking as the cause of any result, so neither rider's row claims a stronger effect. PI's clean generation was scribed only to `memories/pi__gpt-5.6-sol-codex-shim/` and committed locally as `8cbe025`. Prime's generation was scribed only to `memories/prime__gpt-5.6-sol-codex/` and committed locally as `d7a16e0`. The prior PI preflight-stop commit `73bbf60` remains in the local chain. Nothing was pushed.

## Restoration and self-check

- Arena install/build green; Era gate and probe verified before either rider launched.
- Shim survived the deliberate abort, served the complete serial field without 429/EPIPE, then stopped; post-stop curl rc 7.
- PI and Prime used separate isolated temporary state. No global guest config was edited.
- The heat-owned Prime service/socket was stopped by its exact socket owner PID; pre-existing Prime services were untouched.
- Commons is clean and `main...origin/main [ahead 3]`, exactly the carried stop plus two R2 generations.
- Gold Rush changes are confined to `artifacts/gauntlet-heat9-r2-20260901/**`; no source, spec, review, STATUS, BACKLOG, existing e2e, or git history was touched.
- No secret value appears in evidence.

## Conflation history

PI is `@mariozechner/pi-coding-agent` 0.73.1; Prime Agent is the separate Prime Intellect `prime-agent` 0.8.0. Heat 6 through Heat 8 merged their labels as `pi (Prime Agent)`, and Heat 8 actually invoked Prime under the misleading `pi` key. Heat 9 established separate receipts but stopped on pin skew. This R2 field is the first post-conflation run in which both executable families rode separately, wrote separate notebooks, and earned separate verified Era-5 rows. Future masters must name both.

READY-FOR-GATES
