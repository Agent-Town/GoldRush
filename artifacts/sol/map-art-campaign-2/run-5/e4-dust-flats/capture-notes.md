# Capture provenance

Final review uses `plain-paired.json`, `stations-paired.json` and `performance-paired.json`, the same seed and viewports. `paired-capture.mjs` routes the saved pre-edit transformed module for the before arm and the live module for after. When Vite changes its optimizer fingerprint, only that dependency URL is refreshed to the currently served identical module. No original source logic changes in the baseline.

The preliminary saved-module run failed on Vite 504 Outdated Optimize Dep. An early plain run was interrupted by a source HMR reload while evidence was still being authored. Both attempts were discarded as measurements and recaptured after source/metadata were stable. Raw logs and preliminary frames remain under `_raw/run-5/`; only final comparable frames are used in the boards.
