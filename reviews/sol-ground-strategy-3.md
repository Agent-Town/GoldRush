# Drain review: `sol-ground-strategy-3`, Astra's run 10 holds Old Canal desktop and Twin Banks honestly; the ground-strategy series parks here

**Branch** `sol/map-art-campaign-2` at `4111e327d` · **merge** `ee60bb25f` · engine hash unchanged (`7bfbed8b`, no pin) · drained attended 2026-09-26 21:39Z in a detached chain worktree with the scratch store at `5793a96`; no deploy (scripts/attended/land.sh, config `sgs3`).

**Verdict: LANDED.**

## What it does
Astra's run 10 took the two authorizations its run-9 remaining list asked for. The committed strategy-2 driver, ridden once on Old Canal desktop, died at wave 18 (556.9 s, 67 gold, 6 repairs, one of eight pieces standing): the final funding correction did not carry the desktop win the previous revision had produced twice, so run 9's phone win stands as its historical result and there is no desktop proof. Twin Banks on the phone was diagnosed first (the unchanged driver dies at wave 17 on a funding excursion with six defenses intact) and then ridden once on a written changed premise, funding bounded to the home ring: the hero stayed near home and still died at wave 18 with all seven defenses standing and 28 gold. That is a hero-survival question beside an intact ring, not the attrition Old Canal showed. Twin Banks desktop was not run. The Incline control with the flag unset passes with bank, Book and byte-identical reload; the default path is unchanged; no balance changed. Astra's recommendation, verbatim: "Keep the default unchanged and restore-ground opt-in for the task's twelve-hold cohort. Do not change map balance from these holds alone. No new map was secured here." The attended session parks the series here.

## Evidence (Astra's run 10, base `8b034f0cf`, commits `591ecfc6c`, `b8396085a`, `4111e327d`; the drain's own gates are appended below)
| Row | Verdict | Wave | Sim s | HP | Gold | Repairs | Standing |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Old Canal desktop, committed strategy 2 | HELD | 18 | 556.933 | 0 | 67 | 6 | 1/8 |
| Twin Banks phone, unchanged diagnostic | HELD, excursion death | 17 | 518.400 | 0 | 80 | 0 | 6/6 |
| Twin Banks phone, changed premise (bounded funding) | HELD, died near home | 18 | 557.467 | 0 | 28 | 3 | 7/7 |
| Twin Banks desktop | not run (gate) | | | | | | |
| Incline desktop, flag unset | PASS with bank, Book, reload | 14 | | | | | |

## Merge classification
Base `8b034f0cf`; the branch touches `e2e/native-proofs/driver.ts` (the `restore-ground` branch: the bounded-funding rule), env-gated native rows, `artifacts/sol/play-proofs/run-10/**` (20 MB, largest blob 3.6 MB); no `src/**` or `assets/**`. LANE-TOUCHED only; hash unchanged.

## Findings
- **F-SGS3-1:** the committed driver loses the desktop win the penultimate revision had; the funding correction and the ring's collapse interact; a review of funding versus restoration timing before any further ride.
- **F-SGS3-2:** Twin Banks' hero dies beside an intact ring at waves 17 to 18; hero survival and a wave-1 build interruption are the open questions; not a balance matter on this evidence.
- **Series parked (attended):** three Astra runs, one phone win (Old Canal), the rest honest holds; per CLAUDE.md §7.5 no identical retry; the remaining holds go to the owner as a human-playtest or design question (F-PP-CAMPAIGN).

### Evidence (this drain's gates on the merged tree)
| Check | Result |
| --- | --- |
| tsc / build / e1 | `0 / 0 / 0` |
| law-pointer | `rc=0 law-pointer-guard — do the law surfaces still point at what they claim?` |
| named guards | `ℹ pass 137 ℹ fail 0` |
| the ledger battery | `rc=0 ℹ tests 1263 ℹ pass 1260 ℹ fail 0 ℹ skipped 3` |
| e2e both projects, --workers=1 | `rc=0   24 passed (1.9m)  21:20Z` |
| full npm run test:node-guards (before the pin) | `rc=0 ℹ tests 1037 ℹ pass 1032 ℹ fail 0 ℹ skipped 5 ℹ tests 87 ℹ pass 87 ℹ fail 0 ℹ skipped 0  21:39Z` |
| engine hash | `merged: 7bfbed8b0c6ecfff4ec3aa9457f74866bcc49c119a242631f2ac9b783a246551 (pinned 7bfbed8b0c6ecfff4ec3aa9457f74866bcc49c119a242631f2ac9b783a246551)` |
