# F-2725-1 attribution — paired Glow Mesa phone trials (2026-09-28T01:11Z, attended)

Protocol: the s2725 fire's `gr-glow-mesa-proof-attribution-1` (two paired phone trials, candidate/base then base/candidate, unchanged source and assertions), run by the attended session in detached arenas at the exact commits, each with its own `npx vite --port 5309 --strictPort --host 127.0.0.1`, `GR_NATIVE_PROOF=1`, `GR_CAPTURE_EXTERNAL_SERVER=1`, `--project=mobile-chrome --workers=1`, serial under `scripts/attended/dlock.sh`. Arenas: the tracked `assets/pilots` link re-pointed absolutely (F-ATT-9). Rows are the driver's own compact `row-mobile-chrome.json`; logs are the last 40 lines of each playwright run.

| Trial | Tree | secures | banks | Terminal |
|---|---|---|---|---|
| cand-1 | candidate cf9cd95c4 | PASS (Claim Secured at wave 8 / 248.4s sim, 72 HP, 3 buildings) | PASS | wave 8, HP 71.80000000000003 |
| base-1 | clean main 1ff7054fe | FAIL (runState=dead at wave 10 / 303.1s sim, 291 kills, 11 gold) | FAIL | wave 10, HP 0 |
| base-2 | clean main 1ff7054fe | PASS (Claim Secured at wave 8 / 245.2s sim, 122 HP, 3 buildings) | FAIL | wave 0, HP 100 |
| cand-2 | candidate cf9cd95c4 | PASS (Claim Secured at wave 8 / 252.0s sim, 91 HP, 3 buildings) | PASS | wave 8, HP 91.00000000000001 |

Verdict: paired phone trials of e2e/native-proofs/e6-glow-mesa.spec.ts (mobile-chrome, --workers=1, private vite on 127.0.0.1:5309, drain lock held, attended shell, Node 26.4.0): candidate cf9cd95c4 PASS 2/2 (secures at wave 8, banks, 72 and 91 HP); clean main 1ff7054fe with the UNCHANGED driver: one ride died at wave 10 before securing, the other secured wave 8 and failed only the old wave-12 bank floor; the same map on the same tree swings between a death and a wave-8 ending from ride to ride, so the fire's single wave-4 death is ride variance (the fire shell's load makes it likelier), not an effect of the driver change; the s2725 fire's wave-4 phone death did not reproduce in the attended shell and is attributed to ride variance under the fire shell's load, not to the driver change; root cause of that single ride remains unobserved.
