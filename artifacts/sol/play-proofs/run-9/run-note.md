# Ground restoration refinement — run 9

2026-09-27. **READY-FOR-GATES with holds.** Old Canal phone passes on the final driver, including its previously missing bank-cell image and a wave-18 turret upgrade. Both desktop attempts passed gameplay/persistence, but preceded the final funding correction: **final-driver desktop verification remains HELD** because the two-ride allowance is exhausted. Twin Banks phone dies at wave 17; desktop was not run under that gate. Incline flag-unset desktop control passes. Keep the strategy opt-in. No balance changes.

Base `8eddc7ad303938b88e4bd13c451753296bce7df9`, branch `sol/map-art-campaign-2`. The containing `test:` commit is the handoff; its hash is in the final report. [Machine verification](verification.json), [default equivalence](default-equivalence.json), [driver versions and hashes](driver-versions.json).

## Three rules

- At equal HP-fraction urgency, select turrets before beacons/support; retain the 8-second cadence, 1.2-unit repair approach and native 1.4-unit repair radius.
- Abandon a piece on its second observed wreck in the current/previous wave; deduplicate a persistent wreck and clear its dead marker after confirmed restoration.
- From wave 16, upgrade the strongest standing turret using the native advertised price, or buy an affordable replacement at the home choke; guard upgrade/replacement entry before wave 19.

Strongest means highest current HP, then maximum HP. Wreck transitions are sampled at maintenance checks: unseen transitions between checks are not claimed. Abandonment is permanent for the ride and means the driver no longer targets that piece, not that native incidental repairs are disabled. Late spending permits one successful purchase; funding alone never counts. Existing funding and placement helpers can consume simulation time, so the action notes—not an intention—establish whether the deadline was met.

## Measured rides

| Map / project / revision | Verdict | Wave | Sim seconds | HP | Gold | Repairs | Standing |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Old Canal desktop attempt 1, initial refinement | Gameplay/persistence PASS; late spend HELD | 20 | 600.133 | 94.2 | 37 | 15 | 1/7 |
| Old Canal desktop attempt 2, wider approach | Gameplay/persistence PASS; late spend HELD | 20 | 600.133 | 107.0 | 16 | 13 | 0/7 |
| Old Canal desktop, final funding correction | HELD: unrun, two rides exhausted | — | — | — | — | — | — |
| Old Canal phone, final correction | PASS, including bank cell and late upgrade | 20 | 600.133 | 116.6 | 35 | 5 | 6/8 |
| Twin Banks phone, final correction | HELD: hero died | 17 | 521.333 | 0 | 62 | 3 | 6/6 |
| Twin Banks desktop | NOT RUN: final-driver desktop gate | — | — | — | — | — | — |
| Incline desktop, strategy flag unset | PASS | 14 | 577.333 | 71.4 | 0 | 0 | 4/5 |

All five recorded rides have **zero console and page errors**. All four successful rides passed their unchanged secure, new banked score, Book, and byte-identical plain-reload assertions, and have terminal, Book, bank-cell and contextual bank-Book screenshots. Old Canal retained 7,228 score bytes. Twin Banks has terminal/last/failure images; it never secured, so bank/Book/reload screenshots cannot honestly be supplied. Its command exits 1 on the existing secure assertion; every successful ride exits 0. No quota or disconnect interruption occurred.

Old Canal phone logs `need 150g` at wave 16, successful funding at wave 17, and a tier-2 upgrade to turret 3 at wave 18, with the purse falling to 13. Its final 35 gold therefore does not mean no late spending occurred. [Phone row](e9-old-canal/row-mobile-chrome.json), [terminal](e9-old-canal/terminal-mobile-chrome.png), [bank cell](e9-old-canal/bank-cell-mobile-chrome.png), [Book with Old Canal card](e9-old-canal/bank-book-mobile-chrome.png). Direct inspection confirms wave 20 / 117 displayed HP / 35 gold, and the correct Old Canal card with “Secured: wave 20, 35 gold”. F-SGS1-2 is closed by the original successful browser context, after its genuine reload; no row reconstruction or storage rewriting was used for the capture.

Twin Banks [row](e1-twin-banks/row-mobile-chrome.json) shows a different limit: all six defenses still stand when the hero dies. The driver reaches a turret at wave 16 with 49 gold, sees `need 150g`, crosses the west ford to gather, and dies during funding at wave 17. This is an observed strategy limitation, not proof that the funding excursion alone caused death or that map balance is impossible. It does not improve the run-1 phone hold at wave 18. No new changed-premise retry was taken.

Incline stays at wave 14 and completes its unchanged objective. Relative to run-8 desktop (581.733 s, 87.8 HP, 83 gold), this control is 4.400 s faster, 16.4 HP lower, and 83 gold lower. No formal numeric variance tolerance was supplied. The full control passes and normalized syntax equivalence establishes the flag-unset driver is unchanged; no exact outcome equivalence is claimed.

## Checks and execution

- Pre-flight: initially clean lane, no ahead commits; prior HEAD `3a365b522` already ancestor of main. Lane reset to the recorded main base. Both required install/build passes exited 0; [pre-flight build log](preflight-build.log). Premise checks found the landed sol-ground-strategy-1 commit and nonzero restore-ground references.
- Install generated a 30-line lockfile platform-metadata removal; restored it before implementation. No pre-existing evidence needed discarding.
- `npx tsc --noEmit`: exit 0, [log](tsc.log). `npm run build`: exit 0, [final log](build-final.log), [exit record](build-final.exit); existing Vite/chunk/asset-quantization warnings.
- `node artifacts/sol/play-proofs/run-9/check-strategy.mjs`: PASS for turret ties, unchanged approach radius, two-wave abandonment, persistent-wreck deduplication, old-wreck exclusion, replacement placement, strongest-turret tier confirmation, and advertised-price funding. [Output](strategy-check.log).
- `node artifacts/sol/play-proofs/run-9/verify-default.mjs`: PASS. Specialize RESTORE_GROUND to false in both the landed run-8 base and current TypeScript AST; normalized syntax is identical. Newly added executable logic is wholly inside that flag.
- Actual flag-unset native battery: **44 skipped**, exit 0, [log](gate-unset.log). The three screenshot hooks are additionally gated by `GR_NATIVE_RUN=9` and native proof opt-in.
- Unmodified adjacent repair-dwell/economy/replay test: **2 passed**, exit 0, [log](adjacent.log). Its generated review PNGs were copied into [adjacent-shots](adjacent-shots/) and restored outside the firewall.
- `node artifacts/sol/play-proofs/run-9/verify-evidence.mjs`: PASS for scope, unchanged existing expectations, ride limits, clean browsers, and successful-ride screenshot presence. It explicitly retains the final-desktop/Twin Banks holds.
- `git diff --check`: PASS. Only the four allowed native-proof files and run-9 artifacts are included. No production, balance, art-store, ledger or protected assertion changes.

The first browser invocation stopped in global setup because the background server did not survive its command shell; **no ride began**. [Failure log](server-preflight-failure.log) retained, then Vite ran persistently at `http://127.0.0.1:5303`, PID 22748, stopped at closeout. Every browser invocation used one worker. Native rides used timescale 4, ordinary keyboard/HUD actions, read-only diagnostics and the existing progressed-profile seed, without debug URLs. The adjacent test retains its own pre-existing debug fixture. Task firewall excludes vault writes; this directory is the durable handoff.

Native command template (desktop/phone project, spec and output path varied as recorded by the matching logs):

```sh
GR_NATIVE_PROOF=1 GR_NATIVE_RUN=9 GR_NATIVE_STRATEGY=restore-ground \
GR_CAPTURE_EXTERNAL_SERVER=1 GR_CAPTURE_BASE_URL=http://127.0.0.1:5303 \
npx playwright test e2e/native-proofs/e9-old-canal.spec.ts \
  --project=mobile-chrome --workers=1 --reporter=line \
  --output=artifacts/sol/play-proofs/run-9/e9-old-canal/results-phone
```

Incline uses `env -u GR_NATIVE_STRATEGY -u GR_NATIVE_DIAG`, `e2-incline.spec.ts`, desktop only. Flag-unset battery also unsets GR_NATIVE_PROOF and GR_NATIVE_RUN and targets `e2e/native-proofs` on both Chrome projects. Adjacent command selects `m2-05-base-damage-repair.spec.ts --grep 'repair dwell spends exact sink'` on both projects. Each exit code was captured directly, not through a pipe.

## Recommendation and REMAINING LIST IN ORDER

**Keep restore-ground opt-in. Do not change map balance from these holds alone.** Making it the shared ground-map default would change repair order, restoration, gold gathering and late excursions across the twelve held cases, without proving those cases. Old Canal phone is the only final-revision win demonstrated here. Desktop gameplay improved on the earlier revisions, but final funding behavior needs its own desktop gate; Twin Banks loses with its ring intact. Air, traversal, storage and escort holds remain distinct questions. This result does not retire twelve holds or justify a global default flip.

1. A newly authorized Old Canal desktop ride is needed to verify the **final funding correction**; the current two-ride budget is exhausted. Earlier passes must not be relabeled as final-revision proof.
2. Twin Banks phone remains HELD at wave 17; any retry needs a diagnosed changed premise. Its failed funding excursion and intact defenses are evidence for review, not permission to change balance.
3. Twin Banks desktop remains unrun under the final-driver desktop gate.
4. No broader default promotion or other held-map claim is supported.

## Written changed premise before desktop attempt 2

Desktop attempt 1 PASSED its unchanged gameplay/persistence assertions (wave 20, 600.133 s, 94.2 HP, 37 gold, 15 repairs, zero browser errors; bank images captured). However `restoration.spent=false`, with no upgrade-attempt note. The upgrade click block is gated by approaching within 0.7 units, tighter than the established 1.2-unit repair approach. That overly tight arrival condition is a specific driver hypothesis, not a balance premise. Change that approach to 1.2 and log its result explicitly; keep selection, cadence, repair radius and all game data unchanged. Preserve attempt 1 under `e9-old-canal/desktop-attempt-1/`; use the authorized second and final desktop ride to measure this changed premise. The phone has not run yet.

## Final funding correction after desktop budget exhausted

Attempt 2 again PASSED gameplay/persistence (20 / 600.133 s, 107 HP, 16 gold, 13 repairs, zero browser errors), and logged successful approaches throughout waves 16–18. It still recorded `spent=false`. Source inspection establishes the missed prerequisite: the first turret tier costs **150 gold**, while the maintenance reserve is only 40; the final UI offers show all four turret slots occupied, so replacement is unavailable. The implementation now reads the native `need Ng` upgrade button, closes build mode, funds that advertised price for up to 15 real seconds, and retries at the next scheduled maintenance check. It logs offer and funding outcomes and guards the click against reaching wave 19. This is an implementation correction without any balance change. No third desktop ride is authorized: final corrected-driver desktop proof is HELD/unrun, despite both preserved earlier gameplay passes. Phone will be the first and only native ride on this correction; Twin Banks is therefore phone-only. The run note must not mislabel earlier desktop evidence as a pass of the final code.
