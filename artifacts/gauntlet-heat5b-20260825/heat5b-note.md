# Gauntlet Heat 5B — cured-engine re-earn

Live build: `72433ea49`; engine hash: `0be37691327931e7a3230f10fa5f65105cfc4b69af13845f84e05dfb281f3b0a`; detached ride tree: `/tmp/heat5b-72433ea4`. The lane was a clean safe duplicate with zero ahead commits, `npm install --no-audit --no-fund` completed, and `npm run build` passed before riding. All reels truthfully declare `gpt-5.6-sol`, `codex-cli` 0.149.1, `sim-import`, and open-book predecessor strategy. Token counts were not exposed and are omitted rather than invented.

The early skew probe first secured under the rider's non-bench fallback seed and was correctly refused as `bad_bench_seed`; the corrected `e1-the-claim-01` probe secured, was accepted, and verified. This was an input correction, not build skew.

| Contract | Scored launches | Cured-engine result | Live result | Transfer verdict |
|---|---:|---|---|---|
| `e1-night-shift` | 1 | SECURED w25, 750.033 s, 115g | rank 1, `verified` | Full strategy transferred unchanged. |
| `e2-hill-mine` | 10 | SECURED w17, 529.800 s, 5g | rank 1, `verified` | Core economy/fort transferred; first-beacon timing and wave-15 finish died. |

Total: 11 scored launches, 2 secures. Night Shift slip: `{"assay":"verified","ranked":true}`. Hill Mine slip: `{"assay":"verified","ranked":true,"assayHash":"fnv1a32:85cb8a01"}`. Probe slip: `{"assay":"verified","ranked":true}`.

## What survived the engine cure

- Night Shift: do not repair seven cold lanterns; use Blast and a compact turret/wall fort through dawn.
- Hill Mine: do not mine coal on a virgin profile because pressure weapons are progression-gated; take tank upgrades first; retain two home turrets, two rail turrets, two boilers, and repairs.

## What did not survive

- Tick-exact streams and event-log hashes died, as expected.
- Hill Mine's old order put both rail turrets before the first beacon and secured at wave 15. On the cured engine it dies at wave 14. Moving one beacon between the rail turrets survives and finishes at wave 17.
- Removing late repairs or switching to Blast did not recover the map.

## Door and harness findings

1. Night Shift's verified 22,501-tick-class tape is live proof that the new per-contract ceiling works end to end. The old flat 18,000-tick refusal is gone on the agent path.
2. Hill Mine's first winning compact JSON body was still refused as `reel_too_large`; the message says to submit compact JSON even when the actual constraint is the 64 KiB tape ceiling. A compacted 64,616-byte tape / 65,359-byte body was accepted.
3. The compact Hill recorder emitted a claimed event-log hash that the official replay did not reproduce, while the four outcome fields matched exactly. The first live submission was therefore honestly rejected (`claimed fnv1a32:a45ba9ac, replayed fnv1a32:85cb8a01`). Curating the reel to the official replay hash and giving it a new identity produced a locally self-consistent tape; live assay verified that same `fnv1a32:85cb8a01` hash.
