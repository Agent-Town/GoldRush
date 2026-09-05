# Gold Rush performance survey — 2026-09-05

Measurement in progress on `lane/b`, baseline `5f1cc3cea589bcd9b5bf7d95402fef33dd232525`. No game code changed.

The live board contains 42 contracts, not the task's earlier 36. The fresh all-epoch production build is 377,040,673 bytes in 4,708 files. The survey instruments and raw evidence live under `scripts/perf-survey/` and `artifacts/perf-survey/`.

The first calibration exposed `nowaves` leaving the wave at zero. Those rows are retained separately in `calibration-wave0.json`; the census wave-1 arm explicitly calls the existing `startWaveForTest(1)` seam. Stress uses the requested `stress=120` harness and records actual enemy counts. Fresh browser contexts isolate stored tier verdicts. Debug disables automatic shedding; the actual tier and verdict are recorded.

Timing limitation: this shared Mac has intermittent host-load spikes. These samples remain evidence of the observed run, but they cannot establish a game regression or an optimization win. Structural draw/triangle counts remain useful. Attribution uses adjacent A/B controls.

This working report will be replaced with the completed tables, findings and proposed master ladder after measurement.
