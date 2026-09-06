# Review: portraits-e5-e10-batch — the E6–E9 townsfolk processed and registered as speakers (lane-c worktree, Claude Opus 5 implementer, attended drain 2026-09-06 morning)

**Slice/branch/tip:** `portraits-e5-e10-batch` · `art/portraits-e5-e10` · commit `8b27115bb` on base `41b1e63cf` · merged to main: see the ledger row (first-parent merge; the only collision was the ledger).
**Verdict:** MERGED. 21 raw plates (`assets/raw/tf-*-e{6,7,8,9}.png`) processed into `assets/processed/townsfolk-<slug>.png` and registered as 21 era-suffixed `StorySpeakerId`s with canon names (Chalk, `civic-agent-e7`, is the only personal name, per ruling #13). One beat honestly re-keyed (`e9-water-ledger-opened`, clerk → canal reeve: water law is the reeve's office while E9's clerk line poles the packet-boat, `lore/STORYBOOK.md:542`); nine more are blocked by their own copy (third-person pronouns) and stay with the registered speakers until a copy revision; E5 and E10 have NO raw plates at all, and E8's He-3 assayer has none, so those are an art GENERATION task, not processing.

## What it does, and the premise it corrected (F-PORT-1)
The master asked for "the same extraction as the existing seven". Measured: the seven's raws (`townsfolk-elder.png`, 768² on a grey key, 46.22% key pixels) and the row-60 plates (1254², 0.00% key pixels) are different tiers; the extractor keys 0 of 147,456 px on the new plates, so a cut-out was never possible without segmentation. The lawful processing is the one LEDGER row 60 prescribes and `char-prospector-portrait.png` (one of the registered seven) already uses: `node scripts/extract-alpha.mjs --full-bleed --size 384`, alpha dropped. All 21 are 384×384, 3-channel, 0 transparent / 0 magenta pixels; corner-mean R−B (row 60's statistic) inside 124–145 for all 21, max drift vs raw 0.7, one corner under the 120 floor inherited from its raw (F-1154-2's case). Framing: the card crops `object-fit: cover` into 74×90, so only X moves the crop; all 21 centroids sit at 187–197 of 384, centred by `50% 42%`. Eyes-on at the true crop: 21 distinct busts, era cues clean, no letters, no firearms, no gore. All 27 raws byte-identical.

## Evidence
| Gate | Where | Result |
|---|---|---|
| tsc / build | worktree | clean / green (asset-diet green; the 21 add 7.75 MB to `dist/`, lazily fetched per card, none in the first load, none over the 600 KB rule) |
| `no-emdash-guard` | worktree | 1/1 |
| `ss-06` + `ss-07` + `ss-08` | worktree, own port 5303, one worker | 28/28 desktop + mobile 390 |
| `ss-09` + `ss-10` + `ss-11` | worktree | 35/36; the one red (`ss-11:185` mobile) re-ran PASS alone and `ss-11` alone is 14/14 both projects: contention under six implementers |
| Real-browser portrait probe | worktree | all 28 speakers resolve, 0 broken images, 384² / 512² natural, 74×90 rendered, 0 console/page errors |
| LEDGER | `assets/LEDGER.md` row 72 | the batch entry with per-portrait measured QA |
| Engine era | proven by construction: the two `src/story/**` files reverted give exactly the current pin; with them `ad9f284c…` on the lane | re-measured on the merged tree by the drain and pinned there (`src/story/**` is an engine input; PNGs move nothing) |
| Attended on the merged tree | see the drain commit and the ledger row | tsc, the halo guard re-pinned and run (F-PORT-4), the era pin, build, `ss-10` + `ss-08` at one worker on both projects |

Screenshots: `reviews/shots-portraits-e5-e10-batch/{mobile-390-e9-water-ledger-rekeyed,speaker-card-proof-28,portrait-card-crop-grid-21}.png`.

## Merge classification
Base `41b1e63cf`; main moved by the Canyon Works levers, the squall and bookkeeping, none touching these files. `assets/processed/townsfolk-*.png` (21), `reviews/shots-portraits-e5-e10-batch/*`: NEW. `src/story/speakers.ts`, `src/story/beats.ts` (one speaker id plus comment re-bases), `assets/LEDGER.md`: LANE-TOUCHED. `tasks/BACKLOG.md`: MAIN-MOVED, unioned. Attended in the drain commit: `scripts/halo-reextraction-check.mjs` denominator 1314 → 1335 (F-PORT-4).

## Findings
- **F-PORT-2 (copy revision owed, fire-authorable):** nine beats name a cast member but speak of them in the third person (`e6-steward-doorless-dome` "She says", `e6-defector-catalog`, `e7-chalk-first-filing` "Its first filing", `e7-mission-sent-column`, `e7-starship-countdown`, `e8-breach-drill`, `e9-grass-square-planted`, `e9-greenkeeper-outside`, `e9-first-swim`); re-attributing them is a copy change the firewall forbade. Five are legitimately the elder's or tavernkeeper's reports and stay.
- **F-PORT-2b (art generation, OWNER'S DESK for money):** no `tf-*-e5.png` and no `tf-*-e10.png` exist, and E8's He-3 assayer has no plate; E5 (F-SS06-1) and E10 (F-SS11-4) need generated portraits under the art pipeline (gpt-image via the ART slot), not processing.
- **F-PORT-3 (cured):** `src/story/beats.ts:1794` carried a body citation the E10 landing commit's re-base missed (`e8-riverward-launch at lines 1144-1153`, true value `1319-1327` then); corrected and all 14 in-file coordinates re-derived, 14/14 exact.
- **F-PORT-4 (cured by the drain):** `scripts/halo-reextraction-check.mjs` pinned 1314 processed PNGs; now 1335. The guard sits in no battery (referenced only in a comment); re-pinned and run green.
- **Owner-visible note:** the new full-bleed portraits fill the card frame with parchment while six of the seven are cut-outs on the card's brown; they read as one set (the Prospector's is already full-bleed), but the difference is visible in `speaker-card-proof-28.png`.
