# Gauntlet Heat 5 — best-effort field note

Live build: `4c5ca6609` (`/tmp/heat5-4c5ca660`). All reels declare `gpt-5.6-sol`, `codex-cli` 0.149.1, `sim-import`, and open-book study of the public skill, sim, and admission prover records. Per-run token counts were not exposed by the harness and are omitted rather than invented.

| Contract | Launches | Result | Live standings | Winning insight / stop reason |
|---|---:|---|---|---|
| `the-claim` | 1 | SECURED w10, 190g | accepted rank 2; assay pending | Reused the prior lawful fort rider as the live-build skew probe. |
| `e1-dry-gulch` | 1 | SECURED w20, 145g | accepted rank 1; assay pending | Four-turret/six-beacon fort plus silent banking fits exactly at 18,000 ticks. |
| `e1-night-shift` | 6 | SECURED w25, 115g | POST refused | Do not spend the economy repairing seven cold lanterns; Blast plus a compact fort survives dawn. The win is nevertheless 22,501 ticks against the endpoint's 18,000-tick cap. |
| `e1-twin-banks` | 6 | SECURED w20, 127g | accepted rank 1; assay pending | Compact the standing-order stream and let the documented bank default fire silently; explicit banking creates an illegal tick 18,000 entry. |
| `e1-baron` | 9 | unsecured; best w21 | not submitted | Fort/walls buy only seconds. Replay telemetry leaves about 49k of roughly 53.3k boss HP: the cold public solo door is about 12x short of the boss burn, even after the positioning, weapon, tank, tier, and wall hypotheses were exhausted. |
| `e2-hill-mine` | 14 | SECURED w15, 40g | accepted rank 1; assay pending | In a virgin run, coal makes 576 pressure that can only vent because pressure weapons are progression-gated. Skip coal, keep two home and two rail turrets plus two boilers, and take tank upgrades first. |

## Door findings

1. A Twin Banks explicit-bank win ends at `durationTicks: 18001` and is rejected; silent default banking ends at exactly 18,000 and is accepted.
2. Night Shift's earliest normal wave-25 secure is 22,501 ticks, so every honest winning reel is rejected by the same 18,000-tick validator ceiling.
3. Large pretty-printed Twin reels hit HTTP 413 before validation; the accepted semantic reel is 31,318 bytes.
4. The assay queue accepted and ranked four reels but had not advanced any from `pending` during this session's polling window. The repository's official `assay-replay-agent.mjs` reproduced all four locally with exact outcome and event-log hashes (`local-assay.json` in each accepted contract directory).

Total: 37 launches, 5 simulation secures, 4 accepted standings, 0 verified at the last poll, 1 capability wall, and 1 submission-door wall. Active completed-rider wall was about 22 minutes in aggregate (several rides ran concurrently); total Codex tokens are unavailable from the harness.
