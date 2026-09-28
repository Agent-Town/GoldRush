# Deepwater Claim — PARTIAL: boss and full terminal journey proved, deck actions unproved

| Project / default | Secure wave | Sim seconds | HP | Purse | Repairs | Standing / total |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| desktop | 12 | 272.133 | 100 | 40 | 0 | 0/0 ground; 0/3 deck pads occupied |
| 390 px phone | 12 | 272.133 | 100 | 40 | 0 | 0/0 ground; 0/3 deck pads occupied |

Both unchanged native terminal tests **PASS**, paired direct exit 0. Both boot from the town Book, reach Claim Secured, retain a fresh wave-12 secured score, return to the Book and preserve the score byte for byte through a plain reload (7,223 bytes). Both have zero console/page errors. This is a proved terminal journey, but **PARTIAL for this task's deck-and-boss corrective**.

The native walker engages the Dredge-Queen with the ordinary rig's auto-fire. Desktop observes act 2 / zero paddles at 78.533 s and act 3 at 84.133 s; phone observes act 2 at 68.933 s and act 3 at 76.000 s. Final captures show `act2Locked=false`, `crewQuit=true`, `hulkPresent=true`, zero live paddles, five spill pickups and all escorts exited. No act remains closed. Desktop has 4 kills, phone 6. The rig caused damage through normal CombatSystem resolution; no debug bridge, direct damage or simulation writes.

**Persistence qualification:** final `persistentWreck=false` is not itself a failed write: `DredgeQueenBossSystem.persistWreck` calls `writeAtCeremony`, whereas the boolean is set only by `restorePersistentWreck` at a later birth. The ride captured the live hulk and persistent score, not the wreck store or a re-entered wreck. Persistent wreck restoration therefore remains **unproved**. Source intent is not substituted for an observation.

## Exact deck hold and final corrective

Both rides reached each authored pad (`bow`, `port`, `starboard`) but all three placement rows report null. The attempted `open-water` reanchor left the boat at `lagoon`; no carried-rider proof exists. The moored Claim Boat has `steerable=false`, so Regatta helm instructions do not apply.

Root cause: `BuildingContextPrompt.update` initially closes the deck `<details>` (`root.open = !deck`). The measured helper attempted its hidden child buttons and swallowed their timeout. **Owner: QA/native deck driver.** The final corrective `5f74a1483` opens the native `building-context-toggle` before each action and records any action refusal. This is source-checked and type/build-checked, but **not re-ridden**: these successful survival rides do not qualify for the task's restore-ground retry. Do not describe any pad as built on the strength of this unmeasured correction. No map F-ID and no balance recommendation.

The paired rides used driver SHA256 `ca1aa64184acc403823b075552f9f3910509d28ad63db18c0d3399b16a9f0c36` (commit `1b99e911b`); the final driver differs only in opening/reporting those deck actions. Exactly one default ride per project; no restoration or extra probe. Remaining: an authorized full ride validating pad builds, rider-carry, boss acts and direct wreck-store/re-entry persistence on the final driver.

[Desktop row](default/row-desktop-chrome.json) · [Phone row](default/row-mobile-chrome.json) · [Desktop objective](default/objective-desktop-chrome.json) · [Phone objective](default/objective-mobile-chrome.json). Terminal/Book/bank JPEG triplets are alongside the rows. Direct inspection of the desktop terminal confirms Claim Secured at wave 12, 100 HP, 40 gold and zero buildings.

Command: `python3 artifacts/sol/play-proofs/run-15/run-map.py e5-deepwater-claim`. [Exact command](default/command.json), [direct exit](default/command.exit); desktop then phone, one worker. Raw rows/logs: `~/.goldrush/play-proofs/run-15/default/e5-deepwater-claim/`.
