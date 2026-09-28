# Browser failure attribution — phone HUD run 8

The original runs reported 48 failed cases: 43 also fail with the exact pre-cure CSS, two were HUD regressions now corrected, and three pass in the final stable-harness recheck. Of the 43 reproduced cases, 42 reach the same assertion line; desktop world-info notes at spec line 322 fails at a different assertion in the control. This establishes existing failures, not universal determinism or an all-green suite.

All existing tests and assertions are unchanged. Full errors, projects, timestamps and control/recheck results are in [failure-attribution.json](failure-attribution.json). The initial 60-case control was 16 pass / 42 fail / 2 skip; the targeted second control was 1 pass / 5 fail. The final CSS recheck was 24 pass / 6 fail / 2 skip. Its six failed cases have failing original-CSS controls.

| Case | Project | Original / control assertion line | Disposition |
|---|---|---|---|
| `audio-integration.spec.ts:80` | desktop-chrome | 89 / 89 | Existing failing case; HOLD |
| `audio-integration.spec.ts:80` | mobile-chrome | 89 / 89 | Existing failing case; HOLD |
| `bt-01-tiers.spec.ts:205` | desktop-chrome | 216 / 216 | Existing failing case; HOLD |
| `bt-01-tiers.spec.ts:430` | desktop-chrome | 443 / 443 | Existing failing case; HOLD |
| `bt-01-tiers.spec.ts:205` | mobile-chrome | 216 / 216 | Existing failing case; HOLD |
| `bt-01-tiers.spec.ts:430` | mobile-chrome | 443 / 443 | Existing failing case; HOLD |
| `e3-canyon-works.spec.ts:34` | mobile-chrome | 31 / passed | Final PASS; initial failure not reproduced |
| `e7-playbook-surface.spec.ts:33` | desktop-chrome | 49 / 49 | Existing failing case; HOLD |
| `e7-playbook-surface.spec.ts:33` | mobile-chrome | 49 / 49 | Existing failing case; HOLD |
| `e7-signal-systems.spec.ts:104` | desktop-chrome | 138 / 138 | Existing failing case; HOLD |
| `e7-signal-systems.spec.ts:104` | mobile-chrome | 138 / 138 | Existing failing case; HOLD |
| `feedback-fx.spec.ts:28` | desktop-chrome | 33 / 33 | Existing failing case; HOLD |
| `feedback-fx.spec.ts:28` | mobile-chrome | 33 / 33 | Existing failing case; HOLD |
| `locked-win.spec.ts:65` | mobile-chrome | 80 / passed | Corrected; final PASS |
| `m1-03-wave-pressure.spec.ts:31` | desktop-chrome | 35 / 35 | Existing failing case; HOLD |
| `m1-03-wave-pressure.spec.ts:31` | mobile-chrome | 35 / 35 | Existing failing case; HOLD |
| `m2-05b-overwhelm-valves.spec.ts:223` | mobile-chrome | 246 / 246 | Existing failing case; HOLD |
| `m2-06-arsenal-blast-charge.spec.ts:131` | desktop-chrome | 155 / 155 | Existing failing case; HOLD |
| `m2-06-arsenal-blast-charge.spec.ts:212` | desktop-chrome | 228 / 228 | Existing failing case; HOLD |
| `m2-06-arsenal-blast-charge.spec.ts:131` | mobile-chrome | 155 / 155 | Existing failing case; HOLD |
| `m4-06-embodiment.spec.ts:298` | desktop-chrome | 305 / 305 | Existing failing case; HOLD |
| `m4-06-embodiment.spec.ts:187` | mobile-chrome | 192 / passed | Corrected; final PASS |
| `m4-06-embodiment.spec.ts:298` | mobile-chrome | 305 / 305 | Existing failing case; HOLD |
| `mp-02-lockstep.spec.ts:183` | desktop-chrome | 908 / passed | Final PASS; initial failure not reproduced |
| `ss-01-beats.spec.ts:103` | desktop-chrome | 88 / 88 | Existing failing case; HOLD |
| `ss-01-beats.spec.ts:187` | desktop-chrome | 88 / 88 | Existing failing case; HOLD |
| `ss-01-beats.spec.ts:103` | mobile-chrome | 88 / 88 | Existing failing case; HOLD |
| `ss-01-beats.spec.ts:169` | mobile-chrome | 88 / 88 | Existing failing case; HOLD |
| `task-037-assay-bench-ungate.spec.ts:202` | mobile-chrome | 211 / 211 | Existing failing case; HOLD |
| `task-046-territory-ring-pacing.spec.ts:76` | mobile-chrome | 93 / 93 | Existing failing case; HOLD |
| `trail-guide.spec.ts:100` | desktop-chrome | 53 / 53 | Existing failing case; HOLD |
| `trail-guide.spec.ts:128` | desktop-chrome | 53 / 53 | Existing failing case; HOLD |
| `trail-guide.spec.ts:100` | mobile-chrome | 53 / 53 | Existing failing case; HOLD |
| `trail-guide.spec.ts:128` | mobile-chrome | 53 / 53 | Existing failing case; HOLD |
| `visual.spec.ts:113` | desktop-chrome | 118 / 118 | Existing failing case; HOLD |
| `visual.spec.ts:212` | desktop-chrome | 230 / 230 | Existing failing case; HOLD |
| `visual.spec.ts:113` | mobile-chrome | 118 / 118 | Existing failing case; HOLD |
| `visual.spec.ts:212` | mobile-chrome | 230 / 230 | Existing failing case; HOLD |
| `world-info-notes.spec.ts:196` | desktop-chrome | 98 / 98 | Existing failing case; HOLD |
| `world-info-notes.spec.ts:293` | desktop-chrome | 301 / 301 | Existing failing case; HOLD |
| `world-info-notes.spec.ts:322` | desktop-chrome | 98 / 339 | Existing failing case; HOLD |
| `world-info-notes.spec.ts:196` | mobile-chrome | 98 / 98 | Existing failing case; HOLD |
| `world-info-notes.spec.ts:293` | mobile-chrome | 301 / 301 | Existing failing case; HOLD |
| `world-info-notes.spec.ts:322` | mobile-chrome | 339 / 339 | Existing failing case; HOLD |
| `e9-seed-run-caravan.spec.ts:180` | mobile-chrome | 188 / passed | Final PASS; initial failure not reproduced |
| `e7-playbook-rows.spec.ts:218` | mobile-chrome | 249 / 249 | Existing failing case; HOLD |
| `en-02-e1-coverage.spec.ts:407` | desktop-chrome | 435 / 435 | Existing failing case; HOLD |
| `en-02-e1-coverage.spec.ts:407` | mobile-chrome | 435 / 435 | Existing failing case; HOLD |

The corrected cases are Pause reachability (`locked-win`) and the Prospector portrait (`m4-06-embodiment`). Both pass on both projects. The non-reproducing initial cases are mobile Canyon Works (a concurrent-store Vite reload detached its canvas), desktop lockstep timing, and mobile Seed Run caravan timing. The latter two are reported as non-reproducing, without claiming a causal fix.

Other owners retain the failing story-state, wave/combat/statistics, ledgers, note-content, parity and Tape Reel contracts. The mobile Tape Reel patrol reaches the same hidden Save Tape assertion with both stylesheets; compact trace event excerpts and failure frames are preserved. Full local traces are ignored because each embeds about 200 MB of unchanged assets.

## E1 release follow-up

The release-owned suite reports **26 pass / 4 fail**. Both projects fail `harvestSluiceBudget` at `release-build.spec.ts:330` before the Build click; both reproduce at that same line with only this task's compiled media query removed from the same E1 build. The remaining two failures are the same four E4-named jumper PNGs identified in the pre-edit E1 build. No release assertion or runtime code outside the CSS changed. [Release JSON](e2e-release.json), [control JSON](e2e-release-control.json), [asset baseline proof](release-leak-baseline.txt).

The CSS-off release control is narrower than rebuilding the old revision: it removes exactly the 4,351-byte new media query while preserving the final build, assets and all owning assertions. Served CSS SHA-256 pairs are recorded per project in `release-control-*-chrome.json`.
