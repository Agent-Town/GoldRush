# Native River ending proof — run 7

2026-09-26. **READY-FOR-GATES. PASS desktop and 390 px phone. F-PP6-2 CLOSED for the player's ending.** Seed repaired; completed bank, Book and reload proven; a second pan and a second real earned lever leave the original score unchanged. County standings remain intentionally held for `river-assay-1`.

| Project | First gold time / value | Ceremony standings | Console / page errors | Raw enemies at 11.5 / 26.5 s |
| --- | --- | ---: | --- | --- |
| Desktop | 5.200000 s / 5 gold | 0 | 0 / 0 | 2 / 2 |
| Phone, 390×844 CSS px | 4.733333 s / 5 gold | 0 | 0 / 0 | 2 / 2 |

[Full finding, measurements and screenshots](e10-river/finding.md). [Pre-flight](preflight.md). Base `a9506add6` ([full hash](base.txt)), lane `sol/map-art-campaign-2`. The implementation and evidence are in the containing `test:` commit; its exact hash is reported in the final response.

## What changed and why

Only `seedEntries` in the shared driver changed: omit the fabricated wave-30 `e10-river` completion, and provide a proof-only dev-post opt-in. The existing Scoreboard control measures old-seed fresh completion false, fixed-seed true ([control](seed-measure.log)). `e2e/native-proofs/e10-river-ending.spec.ts` wraps the unchanged native River journey, observes score bytes and actual requests, and reuses the same page/profile for a second full earned finale. No production, assets, protected assertions, run-6 evidence, ledgers, tasks or spec documents changed. The task firewall excludes vault writes; this is the durable handoff.

The real re-pull required another Last Claim secure, not browser history. The [initial desktop attempt](initial-desktop/command.log) therefore honestly exited 1 at the unproved re-pull after its other measurements passed. Its complete evidence is preserved. The final paired instrument earns wave 8 twice per project; only the repeat's exact existing “NEW River row” rejection is expected, after strict unchanged-score/real-prelude/clean-browser assertions pass. Both final native commands exit 0 (2 passed each). Desktop's raw census was repeated during this instrument revision; both observations agree. Phone's was run once in the native proof.

## Commands and gates

The own strict-port Vite dev server runs at `http://127.0.0.1:5303`, PID 24669; stopped at closeout. All browser commands use `--workers=1`; desktop precedes phone; trace off. County requests are counted and answered locally, never published.

Native command, separately for `desktop-chrome` then `mobile-chrome`:

```sh
GR_NATIVE_PROOF=1 GR_NATIVE_RIVER_POST_PROBE=1 GR_CAPTURE_EXTERNAL_SERVER=1 \
GR_CAPTURE_BASE_URL=http://127.0.0.1:5303 npx playwright test \
e2e/native-proofs/e10-river-ending.spec.ts --project=<project> \
--workers=1 --reporter=line --output=artifacts/sol/play-proofs/run-7/e10-river/results-<project>
```

- Native desktop: **2 passed, exit 0**, 4.8 min ([log](desktop.log)).
- Native phone: **2 passed, exit 0**, 5.2 min ([log](mobile.log)).
- `npx tsc --noEmit`: **exit 0** ([log](tsc-final.log)).
- `npm run build`: **exit 0**, including TypeScript and asset diet; existing Vite/chunk/quantization warnings ([log](build-final.log)).
- Env-unset `npx playwright test --list --workers=1`: **exit 0**, 3,502 tests / 473 files ([list](default-list.log)). Collection does not itself prove skipping.
- Actual env-unset new-spec invocation, both projects: **4 skipped, exit 0** ([log](gate-unset.log)).
- Evidence/scope verifier: **PASS**, `python3 artifacts/sol/play-proofs/run-7/verify.py` ([result](verification.json)).
- `git diff --check`: **exit 0**.
- Existing unmodified `e2e/river-ending-score.spec.ts`, both projects, one worker: **6 passed, exit 0**, 1.8 min ([log](adjacent.log)).
- Direct image inspection: desktop first-gold pan and bank cell, phone first-gold pan and Book. Evidence captures the actual gold gain and required Book text; no broad visual acceptance is inferred.

## REMAINING LIST IN ORDER

1. **No implementation or proof work remains.**
2. `river-assay-1`: county-board / replay-assay work remains held (F-RES1-1/-6), outside this task.
3. Raw route's enemy spawns remain with F-RES1-3's owner; measured, not changed.
4. Phone role-label overflow visible in the pan screenshot is an out-of-scope UI observation, not a regression attribution.
