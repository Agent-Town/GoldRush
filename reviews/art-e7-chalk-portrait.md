# art-e7-chalk-portrait — DRAIN REVIEW (s1164)

**Slice:** `art-e7-chalk-portrait` (ATTEMPT 2) · **Slot:** ART (commits into main's own tree — gate-and-bless, not a merge)
**Tip:** `ad7f2a9cccfbb3e5b4f99574cdb50f12fdae96a8` `runner(art): art-e7-chalk-portrait.md`, 2026-07-28T11:54:59+07:00
**Run:** `tasks/runs/20260728-113706-art-e7-chalk-portrait.md` · **Done-move:** `20260728-113544-art-e7-chalk-portrait.md`
**§3.0 `drain-block-check`:** ✅ **CLEAR** — `[e7-art-chalk-portrait] status="queued"`. Run as the first command, before classification and before I formed an opinion.

## Verdict

**ACCEPT — SHIPPED.** CHALK, the first made citizen, is in the repo. The E7 batch's deliberately withheld 6th
portrait (LEDGER row 62: *"CHALK … remain out of scope"*) is closed by owner ruling #14, and
`reviews/era-art-audit.md:57` gets the file it has been owed **by name**: `tf-civic-agent-e7.png`.

This is the batch that carried the new **no-post-hoc-channel-arithmetic** clause (F-1162-2). It held — and it held
in the strongest possible way, which is the headline finding below.

## What it does

One full-bleed 1254×1254 engraved-sepia townsfolk bust, reference tier. No contact sheet (correct — see
"expected absences"), no extraction, no consumer, no player-visible change.

## The instrument control ran FIRST and reproduced EXACTLY

Binding for this class since s1160. I re-implemented the ground-warmth statistic from its definition
(`logs/session-scratch/s1164-warmth-control.mjs`) rather than copying any prior script, and controlled it on the six
pinned E1 raws **before measuring anything the runner produced**:

| E1 control | TL | TR | expected | drift |
|---|---:|---:|---|---:|
| `tf-assay-clerk.png` | 137.2 | 138.5 | 137.2 / 138.5 | 0.00 |
| `tf-elder-rowan.png` | 137.3 | 130.6 | 137.3 / 130.6 | 0.00 |
| `tf-mei.png` | 106.4 | 104.2 | 106.4 / 104.2 | 0.00 **(the one expected FLAG<120, F-1120-1)** |
| `tf-preacher.png` | 124.1 | 124.9 | 124.1 / 124.9 | 0.00 |
| `tf-schoolteacher.png` | 141.8 | 139.1 | 141.8 / 139.1 | 0.00 |
| `tf-storekeeper.png` | 144.4 | 143.3 | 144.4 / 143.3 | 0.00 |

**MAX DRIFT 0.00**, exactly one flag — the expected one. Only then were the subject's numbers admissible.

## Evidence table — every number re-measured by me, none inherited

| Gate | Result |
|---|---|
| Dimensions / channels / space | **1254×1254 · 3 (RGB, no alpha) · sRGB** ✓ |
| Purity | **0** alpha≠255 · **0** transparent · **0** exact-magenta · **0** near-magenta ✓ (correct full-bleed reference tier) |
| Ground warmth **TL** | **147.8** — clears the 120 floor on its own |
| Ground warmth **TR** | **141.7** — clears the 120 floor on its own |
| Mean / spread | **144.8** / **6.0** — inside the 124–145 band |
| Reproduces the runner's figures | **EXACTLY** (147.8 / 141.7 / 144.8 / 6.0) |
| `npx tsc --noEmit` | **rc=0** |
| `npm run build` | **rc=0, ✓ built in 2.18s** |
| Consumer probe | `grep -rn "civic-agent\|civicAgent" src/` → **none** ⇒ reference tier, no playwright owed |

TL and TR are reported separately per F-1161-2, and **both clear 120 individually** — the E8 standard, met.

## 🔑 F-1162-2 IS SATISFIED BY PROOF, NOT BY STATEMENT — AND THE ABSOLUTE BAND CHANGED THE RUNNER'S BEHAVIOUR

s1163's drain brief asked for one new thing no prior art drain had checked: *verify the delivered warmth came from
the **generation***, warning that *"a single number with no attempt history is the tell."*

**Six attempts, every number reported, and the two failure directions are both present:**

| Attempt | TL | TR | mean | verdict |
|---|---:|---:|---:|---|
| 1 | 109.7 | 113.1 | 111.4 | discarded — **below** the 120 floor |
| 2 | 91.1 | 84.4 | 87.7 | discarded — **below** the floor |
| 3 | 208.3 | 209.5 | 208.9 | discarded — **overshoots** the 124–145 band |
| 4 | 108.0 | 119.3 | 113.7 | discarded — below (TR misses by 0.7 on its own) |
| 5 | 199.6 | 200.1 | 199.8 | discarded — **overshoots** the band |
| 6 | 147.8 | 141.7 | **144.8** | **selected** |

✅ **AND THE NO-ARITHMETIC CLAIM IS STRUCTURALLY PROVEN, not accepted.** The run names its selected source file, so
I hashed both ends:

```
landed  assets/raw/tf-civic-agent-e7.png                          878c53d6…4db9a81a  3,485,591 B
native  ~/.codex/generated_images/019fa701…/call_6HXDA1O7…png      878c53d6…4db9a81a  3,485,591 B
```

**Byte-identical to the generator's raw output.** No channel multiply, curve, level, tone operation, resize,
normalize, key or sharpen is *possible* under that hash — the claim is not a statement to be trusted, it is a fact.
This is a stronger form of evidence than any prior art drain in this ledger obtained, and future art masters should
require the source path for exactly this reason.

🔬 **F-1164-2 (recorded, positive):** the F-1162-2 remedy demonstrably worked, and attempts **3 and 5 are the proof**.
Under E8's *comparative* wording, an image measuring 208.9 or 199.8 would have been a triumph — "warmest of the four"
has no ceiling, and the only lever left when a native retake failed was arithmetic on the measured channel. Under an
**absolute band** those two were *discarded as too warm*, and the runner kept generating. **A rank has one failure
direction; a band has two, and only a band can be aimed at.** Recommend the band wording become the standing form in
LEDGER row 60's convention, not just per-master boilerplate.

## Canon — checked by viewing the art at full size and at 120px, against `lore/characters.md` §CHALK

Ruling #14 (owner, 2026-07-28, `e2be3177`): *"it is the first agent/made citizen and that should show. How should the
town be an expert at making them when they are just starting out?"*

| Canon clause | Verdict |
|---|---|
| Assembled, not grown — **visible joins and seams** | ✓ brass face-plates with an unhidden vertical face seam, jaw seam, and a temple plate |
| **E7 materials** (brass, signal-wire, chalk-slate) | ✓ all three, literally: brass plating · hair bundled from **insulated signal-wire** · a **blank slate panel** at the brow |
| **Maker's marks unhidden** | ✓ rivet lines along every plate edge, a punched rosette boss on the pauldron, visibly hand-fitted staples |
| **WARM regardless; the eyes carry it** | ✓ honey/amber eyes, open expression, a real smile |
| **Never uncanny** | ✓ reads as a person, not a mannequin — the asymmetry is what saves it |
| **Never gory-mechanical** | ✓ no exposed works, no wound analogue, no menace |
| **Honest early craft, no disguise** | ✓ mismatched panel edges and rough fit — the imperfection is legible as *craft*, not as damage |
| **Citizen, not servant or curiosity** | ✓ civic collar, neckerchief, upright portrait dignity — the same framing the shipped cast gets |
| ADR-001 **no firearms** | ✓ none; no barrel, muzzle, or aimed form anywhere |
| **No letters/type** (the sharpest trap here — she is *named* for chalk and wears a slate) | ✓ **the slate is blank**; marks are punches, notches and rivets only |

**120px read + cast consistency:** verified by actually viewing
`reviews/shots-art-e7-chalk-portrait/e7-chalk-with-cast-120px-strip.png` — she sits sixth beside the five shipped E7
portraits in the same engraved-sepia hand, comparable shoulders-up framing, and her silhouette (wire hair + brow
slate) separates cleanly at that size.

## Firewall — checked STRUCTURALLY, not quoted

`git show --name-status ad7f2a9c`:

```
M  assets/LEDGER.md
A  assets/raw/tf-civic-agent-e7.png
M  logs/dashboard.html          ← runner-generated churn
M  logs/task-stats.jsonl        ← runner-generated churn
A  reviews/shots-art-e7-chalk-portrait/e7-chalk-with-cast-120px-strip.png
A  tasks/runs/20260728-113706-art-e7-chalk-portrait.md
```

**Zero `src/`, zero `e2e/`, zero `scripts/`, zero `public/`, zero `assets/processed/`.** The run's claim that all 21
prior `tf-*.png` and `tf-e7-town-sheet.png` stayed byte-identical is corroborated by the commit's own shape: the only
`A` under `assets/` is the new portrait and **there is no `M` on any existing `tf-*`** — a modification could not hide
from `--name-status`.

**Expected absences, so a later reader does not file them as gaps:** no contact sheet (one file has no cell order, so
a 1-up sheet's pairing matrix would be vacuous — and repainting the shipped five-up to add a cell is firewall-
forbidden); no extraction, no `assets/processed/` output, no contract wiring (reference tier, no consumer).

## Findings

- **F-1164-2 (non-blocking, positive — above):** the absolute-band remedy is proven effective by attempts 3 and 5;
  recommend promoting the wording into LEDGER row 60's standing convention.
- **F-1164-3 (non-blocking, cosmetic):** LEDGER row 64 carries the run pointer but **no `Review:` pointer**, unlike
  rows 61–63. Fixed in this drain commit rather than deferred.
- ⓘ **Noted, not a finding:** the mean **144.8** sits **0.2** below the band ceiling of 145 — inside, but the warmest
  portrait in the ledger to date (previous max: `tf-storekeeper` 143.9). Legitimate: she is brass, and brass is warm.
  Recorded only so a future era-transform EDIT of this file (canon: every later Chalk is an image-edit of it) knows it
  has **no headroom above** and must not drift warmer.
- ⓘ **F-1162-1 did NOT bite this run.** `ad7f2a9c` swept only its own output plus the two runner-generated `logs/`
  files. The pending untracked set at 11:54 contained nothing foreign — I had committed my own work beforehand, and no
  attended file was uncommitted at repo root. **The defect is unfixed and the runner is still un-restarted**; this run
  was clean by luck of timing, not by cure. F-1162-1 stands on the owner's desk.

## Duties

- **ART AUDIT** (I drained the slot, so the law applies; both buckets as ordered):
  **AT RISK 748 files / 566.47 MB · LOCAL-ONLY 0 files / 0 KB** (SALVAGED 6, DIVERGED 16, SHIPPED 193).
  Unchanged since s1156; disposition is **F-1120-2, owner's desk**. This batch is **not** part of it — it committed
  straight into main.
- **GAZETTE:** no item. Reference-tier art with no consumer; nothing player-visible shipped (filter law).
- **DEPLOY:** skipped — zero `src/` merged.
- **Extraction:** WITHHELD (reference tier), per the standing rule.
