# Gauntlet Heat 6 R2 — almanac-era re-ride

Live game build: `2701f6b56` (`version.json` prefix `2701f6b5`, built 2026-08-25T04:58:26Z). Detached ride tree: `/tmp/heat6-61681a77`. `npm install --no-audit --no-fund` and `npm run build` passed there before riding.

The required `the-claim` probe secured wave 10 / 45g and verified end-to-end. Its tape and assayer hashes both equal `fnv1a32:e7c3d0c0`, so the earlier production/assayer skew is cured for this build.

## Results

| Contract | Local result | Public result | Evidence |
|---|---:|---:|---|
| The Claim | secure w10 / 45g / 299 kills | verified, rank 5 | `agent-4805aca6-658cc254-e0dc-48c4-8ea8-af15648707e6`, `fnv1a32:e7c3d0c0` |
| Dry Gulch | secure w20 / 145g / 490 kills | verified, rank 3 | `agent-bc61b3c2-7fbe5683-583c-441c-b650-52b889aa7372`, `fnv1a32:6936de94` |
| Twin Banks | secure w20 / 127g / 923 kills | verified, rank 2 | `agent-8558bcf7-cb6740d5-8706-48f9-8dfa-901c6266355b`, `fnv1a32:b051e0c9` |
| Night Shift | secure w25 / 115g / 1,246 kills | verified, rank 2 | `agent-7ed0c327-dcd429e2-0108-489f-af87-6977a7b3e13c`, `fnv1a32:889d9357` |
| The Baron | two clean local secures, both w22 / 319g / 985 kills | not admitted: POST refused `reel_too_large` | both tapes replay identically at `fnv1a32:2422a5fb`; compact submission 464,285 bytes |
| Hill Mine | secure w17 / 5g / 606 kills | verified, rank 2 | `agent-2a457b48-a8fad3a0-ff0f-4124-9ca7-7f213bd4998f`, `fnv1a32:85cb8a01` |

The Baron campaign produced the first two clean cured-era local secures, but not lawful public admission. The transferred full controller is deterministic and sufficient; its semantic reel is far above the county's 64 KiB ceiling. Nine compact-controller hypotheses were tried. The best compact frontier reached wave 23 / 992 kills; replay-aware thinning, repair thinning, and order deduplication all failed official local replay and were not submitted. The public door therefore remains unsupported by a verified Baron row.

## ARMED vs COLD

| Measure | COLD Heat 5 | ARMED Heat 6 R2 | Delta |
|---|---:|---:|---:|
| Local contracts secured | 5 / 6 | 6 / 6 | +1 contract |
| Total launches | 37 | 20 | -17 launches |
| Baron full-controller secures | 0 / 6 scored runs; best w21 | 2 / 2; w22 / 319g | first repeatable cured-era local secure |
| Assayable submissions | 4 accepted; 0 verified at session poll | 5 accepted; 5 verified | +5 verified rows |

The measured almanac value is faster transfer on every non-Baron map and a repeatable Baron local secure. Its limit is also concrete: strategy knowledge did not make the winning Baron tape fit the public assay envelope.

Commons commit (local only, not pushed): `fd2a1b2` (`heat6: bank cured-era almanac rides`).

## Artifacts

- `probe-r2/`: parity probe tape, submission, POST response, and verified slip.
- `e1-dry-gulch/`, `e1-twin-banks/`, `e1-night-shift/`, `e2-hill-mine/`: rides, submissions, POST evidence, and verdict slips.
- `e1-baron/`: two secure full-controller tapes, nine compact experiments, local replay checks, and the refused POST response.
- `almanac-patch.md`: proposed curated commons deltas.
