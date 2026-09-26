# Final-driver proof and Twin Banks excursion safety — run 10

2026-09-27. **READY-FOR-GATES with survival holds.** All authorized rides and checks are complete. Old Canal desktop failed on the committed strategy-2 driver. Twin Banks' diagnostic reproduced the excursion death; the changed-premise phone stayed near home but still died at wave 18. Its desktop gate therefore stays closed. Incline flag-unset control passes. **Keep restore-ground opt-in; no balance changes.**

Base `8b034f0cf4336cc80d966ad34821ecb8d45bbc36`, branch `sol/map-art-campaign-2`. Diagnosis and baseline evidence committed before implementation as `591ecfc6c`. The containing `test:` commit contains the funding guard and closeout; its hash is reported in the final response. [Committed driver hash](committed-driver.sha256), [changed driver hash](changed-driver.sha256), [machine evidence audit](verification.json).

## Measured rides

| Map / project / revision | Verdict | Wave | Sim seconds | HP | Gold | Repairs | Standing | Late spent |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| Old Canal desktop, committed strategy 2 | HELD: died | 18 | 556.933 | 0 | 67 | 6 | 1/8 | false |
| Twin Banks phone, unchanged diagnostic | HELD: died on funding excursion | 17 | 518.400 | 0 | 80 | 0 | 6/6 | false |
| Twin Banks phone, changed premise | HELD: died near home | 18 | 557.467 | 0 | 28 | 3 | 7/7 | false |
| Twin Banks desktop | NOT RUN: phone did not pass | — | — | — | — | — | — | — |
| Incline desktop, strategy flag unset | PASS | 14 | 573.067 | 101 | 0 | 0 | 4/5 | n/a |

All four recorded rides have **zero console and page errors**. The three failed rides exit 1 on the unchanged secure assertion; their terminal and failure images are retained. They never secured and therefore cannot supply bank/Book/reload evidence. Incline exits 0 and passes the new-score, Book, and byte-identical plain-reload assertions (7,226 score bytes), with terminal, Book, bank-cell and contextual bank-Book images. Direct image inspection agrees with the rows: Old Canal wave 18 / 67 gold; diagnostic phone wave 17; changed phone wave 18; Incline secured wave 14 / 101 HP / 0 gold.

Old Canal's funding offer was `need 150g` at wave 16 / 44 gold. Funding returned true in wave 17, but the defenses fell during the excursion; the next offer was `No tier` at 154 gold. No successful upgrade or replacement occurred. This is a failed final-driver proof, not a relabeling of run-9's earlier desktop wins. No second Old Canal ride was taken: this task's changed premise is specific to Twin Banks. [Old Canal finding](e9-old-canal/finding.md), [row](e9-old-canal/row-desktop-chrome.json).

## Twin Banks diagnosis in three lines

1. Run 9 died at wave 17, 30.551 units from home; the fresh diagnostic died at wave 17 / 518.400 s, 19.492 units from home after a 150-gold funding trip raised the purse only from 40 to 80.
2. All six defenses survived the diagnostic excursion; HP fell from 95 near home to zero after distant panning and a west-ford crossing. Source supports rushers and eligible wreckers; no stockpile meant no thief eligibility. Exact killing attacker and surviving class counts remain unknown.
3. The cutoff prevented late panning/crossing (maximum home distance 8.758 versus 23.650 units), but the changed ride still died near home at wave 18. Excursion safety alone is insufficient; this does not establish impossible balance.

[Diagnosis written before strategy](e1-twin-banks/diagnosis.md), [unchanged diagnostic row](e1-twin-banks/diagnostic/row-mobile-chrome.json), [changed row](e1-twin-banks/row-mobile-chrome.json), [comparison](diagnostic-comparison.json), [finding and adjacent limitation](e1-twin-banks/finding.md).

## One added rule

**Twin Banks only, inside restore-ground: from wave 14, refuse another unfunded journey or panning tick; keep already-funded actions and the existing home circuit.**

The implementation checks both funding observations, before a journey and during panning. A journey begun below wave 14 can finish before the next observation; this is not an interrupt inside walkTo. The guard fires on repair-reserve requests at 38/40 and 31/40 and the late 31/150 upgrade request. Keeping the existing 40-gold reserve means some otherwise affordable repairs can be deferred; changing reserve policy would be a second premise, so it was not done. Old Canal and other maps retain their funding behavior.

The changed ride acknowledges six builds but ends with seven pieces: a wave-1 palisade appeared after turret selection, an upgrade Digit2 input, and Space. This predates the cutoff and supports an existing build-selection/upgrade-interruption hypothesis, not a proven event-dispatch root cause. General build/input handling is outside the restore-ground-only firewall and was not changed. Standing counts come from the actual snapshot. Opening placements, upgrades and HP differed between the phone rides, so the extra 39.067 seconds cannot be attributed solely to this rule.

## Verification and execution

- Pre-flight: no uncommitted user edits, no ahead commits, lane six commits behind main. Authorized branch reset to main; `git clean -fd` removed nothing. No evidence discarded. Both required install/build rounds exited 0. npm generated a 30-line lockfile platform-metadata removal; restored after each round before implementation. [Preserved pre-flight build](preflight-build.log). Landed-strategy and nonzero restore-ground premise checks passed.
- `npx tsc --noEmit`: exit 0, [log](tsc.log), [exit](tsc.exit).
- `npm run build`: exit 0, [log](build-final.log), [exit](build-final.exit). Existing Vite config/chunk and asset-quantization warnings only.
- `node artifacts/sol/play-proofs/run-10/check-funding.mjs`: PASS for wave-14 refusal, already-funded actions, crossing-threshold panning stop, pre-14 behavior, default behavior and Old Canal funding. [Log](funding-check.log).
- `node artifacts/sol/play-proofs/run-9/check-strategy.mjs`: PASS for the inherited selection, abandonment, radius, late replacement, strongest-turret upgrade and advertised-price funding rules. [Log](strategy-check.log).
- `node artifacts/sol/play-proofs/run-10/verify-default.mjs`: PASS; specialize RESTORE_GROUND to false in base and final TypeScript syntax trees and compare normalized output. [Result](default-equivalence.json).
- Final actual flag-unset native battery: **44 skipped**, exit 0; [log](gate-unset.log). Incline is the unmodified adjacent behavioral control and passed with the strategy flag unset.
- `node artifacts/sol/play-proofs/run-10/verify-evidence.mjs`: PASS for scope, unchanged expectations, ride counts, browser cleanliness and successful-ride screenshot presence. It does not convert failed survival rows into passes.
- `git diff 8b034f0cf --check`: PASS after trimming generated log and Playwright error-context whitespace. No production, balance, asset-store, protected assertion, task, spec or ledger changes.

Vite ran on the task series' `http://127.0.0.1:5303` with strict port, owned PID 96767, stopped at closeout. Every browser invocation used `--workers=1`, native keyboard/HUD input, timescale 4, the existing progressed-profile fixture and ordinary public live seed (no debug URL or seed override). Phone means Chromium Pixel 5 emulation at 390×844 CSS px, not a physical-device/touch-only certification. Traces off; screenshots and read-only diagnostics retained. No quota/disconnect interruption. The task's TOUCH-ONLY firewall excludes vault writes; this directory is the durable handoff.

Native command template (spec/project/output/log varied per row):

```sh
GR_NATIVE_PROOF=1 GR_NATIVE_RUN=10 GR_NATIVE_STRATEGY=restore-ground \
GR_CAPTURE_EXTERNAL_SERVER=1 GR_CAPTURE_BASE_URL=http://127.0.0.1:5303 \
npx playwright test e2e/native-proofs/e9-old-canal.spec.ts \
  --project=desktop-chrome --workers=1 --reporter=line \
  --output=artifacts/sol/play-proofs/run-10/e9-old-canal/results-desktop
```

Both Twin Banks phone rides add `GR_NATIVE_DIAG=1`, select `e1-twin-banks.spec.ts` / `mobile-chrome`, and use separate diagnostic/changed output folders. Diagnostic evidence was moved intact under `e1-twin-banks/diagnostic/` before the changed ride. Incline uses `env -u GR_NATIVE_STRATEGY -u GR_NATIVE_DIAG`, `GR_NATIVE_PROOF=1 GR_NATIVE_RUN=10`, `e2-incline.spec.ts` / desktop. The skip battery also unsets GR_NATIVE_PROOF and GR_NATIVE_RUN and selects both Chrome projects across `e2e/native-proofs`. Direct command exit codes are saved in `.exit` files, never taken from a pipe.

## Recommendation and remaining list in order

**Keep the default unchanged and restore-ground opt-in for the task's twelve-hold cohort. Do not change map balance from these holds alone.** No new map was secured here. Run-9's Old Canal phone win remains its historical result; it is not a desktop pass or evidence for promoting the shared strategy.

Strategy/driver questions remain: Old Canal restoration/funding timing; Twin Banks hero survival and interrupted build selection; the earlier Baron, Pressure Garden, Fairground, Dust Flats, Gusher County, Dome Basin and Seed Run survival/objective approaches. Boneyard's tow approach, the three orbital maps' air/braking/build routes, and Blackout Ridge's simultaneous storage-chain repair require specialized driver proof; the ground cutoff does not answer them. These are recommendations from the earlier [campaign inventory](../run-6/run-note.md), not fresh reruns.

Design/defect ownership is separate: Canyon Works' historical traversal block belongs to its corrective owner, and the River county-standings acceptance belongs to its own assay task. River's player-ending score/Book/reload issue was already closed by [run 7](../run-7/run-note.md); it must not be reopened from this old inventory. None of the new deaths proves a balance defect. Targeted human play/driver diagnosis should precede any design ruling.

1. Old Canal final-driver desktop wave-20/bank/Book/reload remains HELD; review funding versus ring collapse before another written-premise attempt.
2. Twin Banks wave-20 remains HELD; diagnose hero survival near intact defenses and the separately recorded wave-1 build interruption. A new strategy or broader input fix needs its own scoped task; no further phone retries were taken.
3. Twin Banks desktop remains NOT RUN until phone passes.
4. No shared-default promotion or retirement of the broader held-map cohort is supported.
