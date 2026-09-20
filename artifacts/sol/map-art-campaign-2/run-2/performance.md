# Shared E5 performance, final source

Four same-page alternating runs per arm; 180 rAF samples each. Fast/slow partition at 13ms lies in the observed gap between 10.2 and 15.7ms. All raw samples retained. Unmatched modes are reported, not compared.

| Map | Width | Draw calls | Pooled p95 median before / after | Fast mode change | Slow mode change |
|---|---:|---|---|---:|---:|
| e5-deepwater-claim | 1280 | 75 / 78 | 8.95 / 9.45 ms | +5.59% | not paired |
| e5-deepwater-claim | 390 | 57 / 60 | 13.65 / 13.50 ms | -2.96% | -14.07% |
| e5-regatta | 1280 | 70 / 73 | 12.75 / 13.60 ms | +4.76% | -8.88% |
| e5-regatta | 390 | 57 / 60 | 8.90 / 8.40 ms | -5.62% | not paired |
| e5-stillwater | 1280 | 75 / 78 | 13.50 / 9.95 ms | +6.59% | -11.73% |
| e5-stillwater | 390 | 57 / 60 | 10.05 / 13.50 ms | -3.00% | -20.98% |
| e5-flotilla | 1280 | 84 / 87 | 8.40 / 8.70 ms | +3.57% | not paired |
| e5-flotilla | 390 | 57 / 60 | 9.60 / 10.00 ms | +2.08% | not paired |

All eight draw-call comparisons and all comparable p95 modes are within 15%. Stillwater phone has 3 fast / 1 slow samples before and 2 fast / 2 slow after: its pooled median is not a like-mode comparison. Flotilla phone has one unpaired 16.0 ms candidate sample; its paired fast mode is +2.08%, and its pooled median +4.17%. No sample is removed from the JSON.

Each arm is the same page and frozen simulation, with only the sea shader/opacity, apron routing and contact/silhouette draws switched. The original geometry/material is restored in the before arm, and the separate silhouette draw is hidden there. The game water animation continues to flow. Four 180-frame samples per arm, one browser at a time, after build/test processes ended.
