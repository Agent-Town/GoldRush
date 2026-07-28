# Task art-e7-town-icons: THE E7 TOWNSFOLK — the signal era's cast, second batch off the pinned portrait convention (ART SLOT)
FIRE-AUTHORED s1160 (attended review welcome) — **ATTEMPT 2, re-authored s1160 with a CHANGED PREMISE after attempt 1 (`49d49007`) was correctly blocked at pre-flight by this task's own instrument control. The band was wrong; see the corrected guard below. Nothing was generated, nothing was modified — a model stop.**
You are Codex with image_gen, running in the ART slot.
CODEX: model=gpt-5.6-sol effort=high

## Why — the class-wide blocker is retired, and this rung's OWN spec-line blocker is STALE
**Unshipped proof (F-1044-4 art gate — cite the BACKLOG line):** `tasks/BACKLOG.md:789` reads verbatim **"E7 town-icons OWNER-BLOCKED (portrait convention)"** and **"Subsequent E7/E8/E9/E10 town-icons + roster rows author from the plan once the convention exists"**. File-probe agrees (s1160): `git ls-files | grep -E "tf-.*-e7|icons-e7"` returns **zero**, and no `tasks/art-e7-*-town-icons.md` master exists.

**That blocker is retired, class-wide, by the owner — not by me.** `BACKLOG:977` item ② verbatim: **"✅ CLOSED — ANSWERED BY THE OWNER 2026-07-27 … He ruled portraits 'match the plates' (verbatim at `tasks/art-batch-portrait-convention.md:3`) … **This unblocks the whole town-icons class E6–E10.**"** `BACKLOG:976`: *"✅ SUPERSEDED s1153: the gate IS satisfiable and the slot is REFILLED."* E6 then shipped it for real — `art-e6-town-icons` DRAINED `c7601082`, `assets/LEDGER.md` **row 61**, 7 files, convention held. **You are E7, the next rung of `reviews/era-art-audit.md` §E7 item 4.**

⚠️ **AND ONE MORE BLOCKER DIED WITHOUT ANYONE NOTICING — this is why the batch is 5 portraits and not 4.** `specs/epoch-saga/e7-signal-bundle.md:11` still ends the townsfolk line with *"a civic agent with a name, a desk, and a portrait (canon moment — **pending the Q3 lore answer**)"*. **That parenthetical is STALE by ten days.** The answer landed as an owner ruling and lives in the lore wiki (CLAUDE.md §9b — the source of truth for content facts):
- `lore/characters.md:14` verbatim: **"## CHALK — the first made citizen (CANON — owner 2026-07-18, ruling #13)"**
- `lore/story-arc.md:120` item 13: **"CHALK is canon — the first made citizen."**
- `lore/STORYBOOK.md:718` item 11: **"[CANON — owner 2026-07-18, ruling #13.]"**

**So the identity is settled. What is NOT settled is what she LOOKS like — and that is a different question, which is why she is out of scope below (see NO).** Do not resolve it by drawing her.

READ FIRST (paths, all on main):
- `assets/LEDGER.md` **row 60** — THE CONVENTION, written there expressly "for E6–E10 batches to cite". Obey it literally.
- `assets/LEDGER.md` **row 61** — the E6 batch that proved it, including the two findings you must honour (F-1154-2, F-1154-3, below).
- `tasks/art-e6-town-icons.md` — your immediate precedent; same shape, same firewall discipline.
- `assets/raw/tf-{assay-clerk,elder-rowan,mei,preacher,schoolteacher,storekeeper}.png` — the six E1 portraits = style ground truth **and your instrument-validation control**.
- `assets/raw/tf-combine-defector-e6.png` — the edit source for file 5. Do not modify it.
- `assets/contact-sheets/tf-e6-town-sheet.png` — the sheet whose shape yours mirrors.
- `specs/epoch-saga/e7-signal-bundle.md` **lines 8 + 11** — the buildings and the identities (quoted verbatim below).
- `lore/characters.md:47` — **ruling #11**, which assigns the era's three desks.
- `reviews/era-art-audit.md` **§E7 item 4** — the plan rung this fulfils.
- `docs/GOLD_RUSH_BRIEF.md` §9 + `docs/decisions/ADR-001` — canon.

## THE CONVENTION (LEDGER row 60, binding — do not drift)
A townsfolk portrait is a small illustrated **BUST** in the engraved-sepia plate hand: warm etched linework, **parchment ground**, **shoulders-up**, character **reading clearly at ~120px**, **FULL-BLEED with NO `#ff00ff` key** (UI portraits, not sprite cells), filename `tf-<role>.png`, **processing: NONE**. Canvas **1254×1254 RGB, no alpha**.

**E7 palette rider** (from the two shipped E7 building batches, `BACKLOG:789`): **walnut / aged-brass / honey-gold glass / teal glow**. Warm the sepia toward brass, not toward the E6 atomic mint.

### ⚠️ THE GROUND-WARMTH GUARD — CORRECTED s1160 ATTEMPT 2, AFTER THIS TASK'S OWN CONTROL CAUGHT THE AUTHOR
**Attempt 1 (`49d49007`) was BLOCKED at pre-flight by the control below, before a single `image_gen` call — correct behaviour, and the run report is `tasks/runs/20260728-095121-art-e7-town-icons-preflight.md`. The task was wrong, not the runner.** It demanded a **130–145** band. **That band is measurably WRONG and was already retired**, and s1160 re-read `assets/LEDGER.md` **row 60** to confirm it rather than take the runner's word:

> 📌 Row 60, verbatim: *"**THE GROUND-WARMTH STATISTIC, PINNED s1155 (closes F-1154-2 …)**: the number is **mean (R − B) over the TL+TR 60×60 corners** — the TOP edge only, averaged across both top corners. **Flag below 120; the observed accepted range is 124–145.**"*
> And explicitly: *"**F-1154-2 recommended 'TL+TR, band 130–145' and that band is WRONG** — it retroactively fails two accepted portraits, `tf-preacher` (124.5, from the very batch that defined the convention) and `tf-appliance-wrangler` (124.6)."*

**So F-1154-2 was CLOSED at s1155, and this task does not discharge it — it nearly re-opened it.** The statistic half was right; the band half was a *recommendation* that s1155 had already run backward over decided cases and rejected. **The binding rule:**

> **GROUND WARMTH := mean of (R−B) over the TL 60×60 and TR 60×60 corners.**
> **GATE: flag below 120.** Accepted range across all 12 shipped `tf-*` portraits is **124–145**. Aim for the E6 batch's 131.6–144.2 as *style guidance*; **fail only below 120.**
> ⛔ **Never use a 4-corner or whole-image mean** — row 60 measured that it false-fails **10 of 11** accepted portraits. ⛔ **Never use a SINGLE corner** — appliance-wrangler spreads **13.9 points** across its own top edge (TL 131.6 / TR 117.7), so which corner you sampled would decide the verdict.

**VALIDATE THE INSTRUMENT BEFORE YOU TRUST IT — not optional, not ceremony.** Run your measurement code over the six E1 raws FIRST. **These are the measured truths it must reproduce (attempt 1 produced this table and it agrees with row 60, so it is now the expected result, not a hypothesis):**

| E1 control | expected TL+TR mean | vs the 120 floor |
|---|---:|---|
| `tf-assay-clerk.png` | ≈137.8 | pass |
| `tf-elder-rowan.png` | ≈134.0 | pass |
| `tf-mei.png` | ≈105.3 | **the ONE fail** (F-1120-1's known drift) |
| `tf-preacher.png` | ≈124.5 | pass — **accepted below 130; this is the case that killed the old band** |
| `tf-schoolteacher.png` | ≈140.4 | pass |
| `tf-storekeeper.png` | ≈143.9 | pass |

**Your instrument is correct only if it reproduces all six within ~±1 AND flags exactly one (`tf-mei`).** If it flags two, or none, it is wrong — fix it before measuring a single E7 file, and report the full control table in the run file.

## THE BATCH — 6 files EXACT (5 portraits + 1 sheet)
Identities are `specs/epoch-saga/e7-signal-bundle.md:11` verbatim: *"switchboard chief (E3 operator promoted — face-chain) · playbook librarian · drone keeper · tape courier kid (4th-generation newcomer line)"*. Desks are assigned by **owner ruling #11** (`lore/characters.md:47`): **chief = boards, defector = Exchange, Mei = news desk.**

In `assets/raw/`:
1. `tf-switchboard-chief-e7.png` — **runs the boards** (ruling #11). The spec calls her *"E3 operator promoted — face-chain"*; ✓ **verified s1160 that NO E3 operator portrait exists** (`git ls-files` shows 12 `tf-*.png`: six E1 + six E6, no E3), **so this is a FRESH generation, not an edit** — the face-chain is narrative here, not a source file. Headset over the ear, jack-cords in hand, the patient look of someone holding six conversations.
2. `tf-playbook-librarian-e7.png` — fresh. The Playbook Library is the **schoolhouse transform** (spec :8, *"card-catalog of punch-tapes — lessons become literal programs"*). A librarian with a tape-spool at the hip; the schoolteacher's warmth, a new trade.
3. `tf-drone-keeper-e7.png` — fresh. Spec :8, the Drone Coop is *"a dovecote for hover-drones; the m4-06 companion multiplied"*. **Keeper of BIRDS-that-are-machines** — a gauntlet, one small hover-drone settling on it like a pigeon. Warm, husbandry, never a handler-of-weapons.
4. `tf-tape-courier-e7.png` — fresh. *"tape courier kid (4th-generation newcomer line)"* — a **child**: satchel of punch-tape coils, run-flushed, cap askew. Illustrated and warm; the newcomer line's fourth face.
5. `tf-combine-defector-e7.png` — **THIS IS THE `<existing-tf-id>-e7.png` EDIT SET, and it is an image-EDIT, not a fresh gen** (consistency law: era transforms EDIT existing art). **Edit source = `assets/raw/tf-combine-defector-e6.png`.** Ruling #11 gives him **the Exchange** — the tavern annex grown into a switchboard hall. Aging pass: **one era step (~+8 years), ONE new era element** (a brass jack-cord or an operator's key at the collar). Same face, same framing, same hand: the mint-enamel suit is older, the tie still loose, the man now runs a switchboard hall instead of carrying a catalog. **If you cannot hold the identity through the edit, STOP and report rather than generating a stranger.**

In `assets/contact-sheets/`:
6. `tf-e7-town-sheet.png` — **five-up** contact sheet, **the five above in the order listed**, mirroring the E6 sheet's construction.

Style anchor **verbatim in every prompt**: `"Gold Rush townsfolk portrait, engraved-sepia plate hand: warm etched bust on parchment, shoulders-up, no letters, no gore, reads at 120px."`

## Canon riders (ADR-001 / brief §9) — E7 is the era made of TAPE AND BOARDS, so the letters risk is the highest of any batch yet
- **NO LETTERS, and this era attacks that rule from five directions at once.** Punch-tape ribbons, the library's card-catalog, the courier's tape coils, switchboard jack labels, the chief's patch-panel. **Every one of them renders as holes-only, blind-embossed, or blank.** Punch tape is *perfect* for this — it is literally holes; render it as holes and nothing else. **No titles, no words, no numerals, no legible type anywhere, including on cards, spines, tags and panels.**
- **No firearms, ever.** The drone keeper's hover-drones are **dovecote birds**, not ordnance: no barrels, muzzles, bores, mounts or aimed forms. Nothing in this batch is a weapon.
- **These are townsfolk, not enemies**; no peoples are ever the enemy. Illustrated and warm, never gory — **especially** the courier, who is a child.
- The chief and the librarian are working people at instruments, not operators-of-machinery-as-menace; keep the era's optimism.

## Self-QA — MEASURED, per file, in the run file (not eyeballed)
- **Instrument control FIRST** (see above): report the six E1 numbers and confirm the band + the `tf-mei` ≈104 reproduction. **Do not proceed if the control fails.**
- Canvas **1254×1254 RGB, no alpha** on all 6 (state measured dims + channel count). **0 transparent px, 0 exact- and near-magenta px** (correct full-bleed reference tier).
- **Reads at 120px: actually downscale each to 120px and view it** — distinct silhouette / face / headwear per role. Say that you did it, and save the strip to `reviews/shots-art-e7-town-icons/e7-portraits-120px-strip.png`.
- **Ground warmth per portrait = mean R−B over TL+TR 60×60, and it must clear the 120 floor** (report the number per file; aim for 124–145, and say so if any portrait lands below 124 even though that is not a fail).
- Framing consistent across the five (shoulders-up, comparable head size) — **the CONVENTION is the deliverable, not just the faces.**
- **Contact sheet order, verified not asserted (F-1154-3).** Row 60's file list was out of step with its own sheet and row 61 inherited the claim before a pairing matrix corrected it. So: **pair every cell against every raw (5×5 matrix), report the MAE for each true pairing AND the range for the 20 wrong pairings** — the wrong pairings are your positive control. State the sheet's true order as measured. A matrix you did not run reports nothing.
- `tf-combine-defector-e7` vs `tf-combine-defector-e6`: identity held; **name the aging cues and the single new era element**, and confirm the E6 source file is **byte-identical** after your run.
- Canon: no letters / no firearms / no gore — stated **per file**, checked at full size AND at 120px.

## FIREWALL
**TOUCH-ONLY:** `assets/raw/tf-{switchboard-chief,playbook-librarian,drone-keeper,tape-courier,combine-defector}-e7.png` (the 5) · `assets/contact-sheets/tf-e7-town-sheet.png` · `reviews/shots-art-e7-town-icons/` (QA strip only) · `assets/LEDGER.md` (one new row) · your run file under `tasks/runs/`.

**NO:**
- ❌ **`tf-civic-agent-e7.png` — CHALK. DO NOT DRAW HER.** The Q3 gate is retired (ruling #13, above) so her *identity* is canon, but **her visual species is not specified anywhere** — s1160 searched `lore/`, `specs/`, `docs/decisions/` and `reviews/era-art-audit.md` and found her described only in words (*"named for the elder's chalk … a desk at the claim office, a portrait on the ledger wall … warm by specification, a mind that cannot hunger … starts at rung 0"*). **What a MADE citizen's face is** — person, machinefolk, something else — is a first-of-kind canon call on the arc `ADR-003` calls *"the boldest lore claim the game makes, and it is now load-bearing"*, whose implication (3) names this very portrait as *"the second canon beat"*. **Generator proposes, contract disposes (Mistake #14): that beat gets an owner word, not a fire's guess.** It is on the OWNER'S DESK as of s1160.
- ❌ **`icons-e7.png` or ANY `#ff00ff`-keyed sheet** — different tier, its own rung. Exactly the E6 split.
- ❌ **No aging edit of `tf-mei`** this batch. Ruling #11 does give Mei the E7 news desk, but `tf-mei` is the **F-1120-1 convention outlier** (ground warmth ≈104 vs the 130–145 band, framed wider); editing it forward either propagates the drift or silently "corrects" a shipped face. **That is a decision, not a chore** — next rung, or attended.
- ❌ No extraction, no `extract-alpha`, no `assets/processed/` (**reference-tier law: no consumer exists**, so nothing is wired and no player-visible surface changes).
- ❌ No `src/**`, no `e2e/**`, no contracts, no `generated.ts`.
- ❌ Do not touch or regenerate the six E1 `tf-*.png` or the six E6 `tf-*-e6.png` — the defector's E7 is a NEW file derived from one; **the source stays byte-intact**.
- ❌ No E8–E10 portraits (later rungs).
- ❌ **Do not run the playwright suite or start a dev server.** Nothing here is testable that way, and s1160 measured the box at loadavg **6.65/16** with a full-suite inventory live in lane-d — a second heavy job would corrupt that measurement (Mistake #12).

One batch in flight (✓ verified s1160: `tasks/queue/art/` empty, `tasks/running/` holds only the lane-d job).

END: **READY-FOR-GATES** + the measured QA table (6 rows) + the instrument-control numbers + the 5×5 sheet pairing matrix + the LEDGER row + a one-line statement of whether the convention held or drifted.
