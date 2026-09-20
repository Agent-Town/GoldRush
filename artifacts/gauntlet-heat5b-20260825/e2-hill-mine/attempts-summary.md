# Hill Mine re-earn

Ten scored launches ran on live build `bd09497eb`.

| Attempt | Hypothesis | Result |
|---:|---|---|
| 1 | Re-run the predecessor's exact strategic plan: no coal, tank-first, two home turrets, two boilers, then two rail turrets. | Death, wave 14, 438.967 s. The first beacon arrived too late. |
| 2 | Stop automatic repairs at wave 13 so beacon construction wins the gold race. | Death, wave 14, 430.000 s. Two beacons appeared, but unrepaired works collapsed sooner. |
| 3 | Restore repairs and switch Rig to Blast at wave 12. | Death, wave 14, 444.667 s. More kills, but repair starvation still prevented the beacon. |
| 4 | Keep Rig and repairs; build the first beacon between the two rail turrets. | SECURED wave 17, 529.800 s, 5 gold. Compact tape was 76,804 bytes and POST was refused as `reel_too_large`. |
| 5 | Remove unreachable harvest tails from repeated repair responses. | Death, wave 15; 54,997-byte tape. Dropping `HOLD` changed control timing. |
| 6 | Retain six harvests per repeated repair response. | Death, wave 15; 59,157-byte tape. |
| 7 | Retain fourteen harvests, still without `HOLD`. | Death, wave 15; 63,637-byte tape. |
| 8 | Retain twenty-two harvests, still without `HOLD`. | Death, wave 15; 68,117-byte tape. This proved harvest count was not the behavioral seam. |
| 9 | Preserve `HOLD`; cap repeated-repair harvest tails at fourteen. | SECURED wave 17 with the same visible trajectory; compact tape 66,376 bytes, still 840 bytes over the tape ceiling. |
| 10 | Preserve `HOLD`; cap tails at twelve. | SECURED wave 17 with the same outcome; compact tape 64,616 bytes and body 65,359 bytes. Official local replay reproduced the outcome and curated hash `fnv1a32:85cb8a01`; accepted live at rank 1. |

Transferred: skip virgin-run coal, tank-first upgrades, two home turrets, two rail turrets, two boilers, and continuous repair. Died: the old timing that placed both rail turrets before the first beacon, and the old wave-15 finish. The cured engine needs one defensive beacon between the rail guns and secures at wave 17.
