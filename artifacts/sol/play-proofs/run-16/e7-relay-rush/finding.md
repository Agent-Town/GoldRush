# Relay Rush — HELD, desktop objectives proved; phone Tape toggle blocked

Both desktop rides record a short movement-and-build tape through the visible Tape Reel. The tape contains a real turret placement at (-24,41), on relay-site-r2. Native beacons service r1 and r3. The default service captures reach two sites at sim 81.2 s and three at 137.467 s, before front three at 270 s. Both frozen terminal captures confirm **litAtDeadline=3, objectiveMet=true**.

The driver returns to the authored command stake and waits for the front to cover the player. One ordinary Replay click receives `interference-muted`: **refusals.playbooks=1**, `playbookUse.objective=suspended`, `objectiveMet=true`, successful `uses=0`. The default use capture is wave 6, actor (-24.374,40.692), front centre -28.8 with half-width 6. A refused/muted use is the intended objective; a successful replay is not claimed. Both tapes contain movement and one native turret build, with no injected recording.

| Desktop strategy | Death wave | Sim seconds | HP | Gold | Repairs | Standing | Deadline | Muted uses |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| default | 16 | 487.200 | 0 | 55 | 0 | 7/7 | 3/3 | 1 |
| restore-ground | 18 | 556.267 | 0 | 50 | 0 | 7/7 | 3/3 | 1 |

## Phone control hold

The phone's first Tape toggle remains visibly present but its native pointer hit is intercepted by the canvas. Eight bounded attempts fail before Record. The helper now handles upgrade overlays with native card clicks and stops after bounded attempts; it does not force events through the canvas. This reproduces Echo phone's hit-test symptom without another fourteen-minute wait.

The phone capture is an **alive abort**, not a game terminal: wave 2, 76.667 s, 77.6 HP, 50 gold, 0 works/repairs, no tape, 0 sites lit, no muted use, both objectives false. [Blocked control image](default/blocked-tape-mobile-chrome.jpg) shows the visible Tape Reel and live HUD. Row `finalSnapshot` here means failure-time snapshot; it must not be described as a win/death terminal. No phone bank/Book/reload, no survival retry because the objective was not exercised. Desktop alone qualifies for and receives one restore-ground ride.

All three rides have zero console/page errors. Both commands exit 1. **No F-PPH2 map-defect ID.** The repeated 390 px native hit-test failure is a concrete shared HUD/driver investigation, but this run does not establish that every human tap path is blocked or isolate a map fault. Follow-up owner QA/native mobile controls with HUD maintainer: inspect live bounds/clipping/hit targets and ordinary touch interaction under a new authorized proof; fix production UI only in its own scoped task if confirmed. Owner/F-PP-CAMPAIGN retains survival decisions. No balance or production change here.

Terminal counters come from pre-bank snapshots, not the cleared town state. Final desktop restore JPEG stays in-tree; default desktop JPEG moved to `~/.goldrush/play-proofs/run-16/default/e7-relay-rush/`. Phone's in-tree JPEG is explicitly the blocked, alive state. Full logs and samples remain external via row receipts.
