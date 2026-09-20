# Task 042 animation smoothness evidence

| Metric | Before | After |
|---|---:|---:|
| Hero fps | 9.50 | 9.50 |
| Hero units/cycle | 2.526 | 2.526 |
| Jumper fps | 9.50 | 4.28 |
| Jumper units/cycle | 1.137 | 2.526 |
| Fast scripted jumper fps | n/a | 8.55 |
| Fast scripted jumper units/cycle | n/a | 2.526 |
| Direction hysteresis | 10deg / 0ms | 10deg / 0ms |
| Hero frame interval avg | 99.6ms | 101.7ms |
| Jumper frame interval avg | 102.3ms | 226.7ms |
| Console/page errors | 0/0 | 0/0 |

Root causes found: fixed global walk fps made the 2.7 wu/s jumper run the same 9.5 fps cadence as the 6.0 wu/s hero, producing 1.137 wu/cycle versus the hero 2.526 wu/cycle; semantic walk clip changes and direction clip-object swaps also reset frame cursor to frame 0.
Fixed: runtime-speed-derived fps relation for hero/jumper slots, including scripted enemy speed; walk cursor preservation across walk restarts and orientation clip swaps; reset now clears cached walk phase; start/stop frame-blend holdoff is capped to base walk cadence so acceleration does not hide blending.
Filed only: no sheet/art defect found in this pass; no resolver change made because existing 10deg angular hysteresis and 540deg/s hero turn smoothing measured clean in VP-02/VP-02b.

Stress check: m2-01 stress leg passed both projects; after-sample draw calls 138, frameMs p95 16.70ms, avg 10.58ms, texture swaps/frame 0, errors 0/0.
