## What it does
Astra's run 9 refines `restore-ground` on the changed premise its run-8 diagnosis named (the lowest-HP pick kept restoring a freshly destroyed beacon ahead of a turret): at equal urgency turrets come before beacons and support pieces; a piece wrecked twice within the current or previous wave is abandoned; from wave 16 the strongest standing turret is upgraded at the native price or an affordable replacement is bought at the home choke, guarded before wave 19. Old Canal on the phone passes on the final committed driver, with the bank-cell image that run 8 lacked. Old Canal on desktop secured wave 20 on both attempts (the first at 94.2 HP with 37 gold and 15 repairs; the second on a written changed premise about the upgrade approach radius), but both rides ran before the final funding correction entered the committed driver, and Astra declines to relabel them as final-revision proof: that proof is owed. Twin Banks on the phone holds at wave 17, dying on a failed funding excursion while its defenses stood, a different failure mode from Old Canal's attrition. The default driver is unchanged (Incline flag-unset passes; normalized syntax identical with the flag false). No balance changed.

## Evidence (Astra's run 9, base `8eddc7ad3`, commits `d02162b63` and `efe9d16ae`; the drain's own gates are appended below)
| Row | Result |
| --- | --- |
| Old Canal phone, final driver | PASS: wave 20, 600.133 s, 116.6 HP; bank, Book, byte-identical reload, bank-cell image captured |
| Old Canal desktop | attempt 1 PASS gameplay: wave 20, 600.133 s, 94.2 HP, 37 gold, 15 repairs, `restoration.spent=false`; attempt 2 (changed premise written first) PASS gameplay; both predate the final funding correction (F-SGS2-1) |
| Twin Banks phone | HELD: died wave 17 at 521.333 s, a failed funding excursion with the defenses intact (F-SGS2-2) |
| Twin Banks desktop | not run (the final-driver desktop gate) |
| Incline desktop, flag unset | PASS: wave 14, 577.333 s |
| default path | normalized-syntax equivalence with the flag specialized false; machine verification and driver hashes in the run folder |

## Merge classification
Base `8eddc7ad3`; the branch touches `e2e/native-proofs/driver.ts` (the `restore-ground` branch), env-gated native rows, `artifacts/sol/play-proofs/run-9/**` (25 MB, largest blob 2.0 MB); no `src/**` or `assets/**`. LANE-TOUCHED only; hash unchanged.

## Findings
- **F-SGS2-1:** the two desktop secures ran on the driver revision before the final funding correction; a single newly authorized desktop ride on the committed driver settles it (`sol-ground-strategy-3`, item 1).
- **F-SGS2-2:** Twin Banks phone dies at wave 17 on a funding excursion with the defenses intact: an excursion-safety question, not attrition; a diagnosis before any retry (`sol-ground-strategy-3`, item 2).
- F-SGS1-2 closed (the bank-cell image).
- Astra, verbatim: "Keep restore-ground opt-in. Do not change map balance from these holds alone."
