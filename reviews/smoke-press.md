# THE PRESS SMOKE — live deploy d2f9c11e, player-path walk (2026-07-18, attended)
Owner: "Maybe you could try to smoke test the Foundry or the Charter Press or both?" — this is the Press half. Method: scripted real-browser walk of the DEPLOY (which the e2e suite never touches — it gates localhost), screenshots per beat (reviews/smoke-press/01..06), console+page error capture. Script kept at e2e-smoke/press-smoke.spec.ts (reusable deploy smoke).

## Verdict: THE PRESS WORKS LIVE — one real finding at the edge
| Beat | Result |
|---|---|
| Press floor opens (?editor door, the Claim template) | ✅ panel, shelf, share section all render (01) |
| Stamp "Smoke Ridge" | ✅ stamped to shelf, provenance shown (02) |
| Share surface (CP-06 file+code import UI) | ✅ present (03); export-code capture MISSED by the script's selector guess — a smoke artifact, not a product finding (cp06 spec proves export/import round-trip) |
| THE LEVER: three choices and a press | ✅ (04) |
| Lever charter LAUNCHES AS A REAL RUN on the deploy | ✅ ALIVE — hero, HUD, encyclopedia toast firing (05) |
| THE RIVER direct boot (?contract=e10-river) | ❌ **F-SMOKE-1: black screen + `TypeError: Cannot read properties of undefined (reading 'place')`** (06) |

## F-SMOKE-1 analysis
e10-river's contract entry is a deliberate STUB (boardRow/briefing/tileParams only — the campaign ledger says "The River… the Charter Press authors it at CP-05"; its supported door is the pressed charter / post-credits hook, which the cp05 spec proves green). But the raw door is REACHABLE (it is in the owner's test-plan table) and throws instead of refusing. Zero-console law: every reachable door must boot or decline readably. → corrective task authored: lane-e10-river-boot-guard (ladder).

Console errors elsewhere on the whole walk: ZERO. Deploy asset loading, chunking, prod build behavior: clean.
