# Task art-e7-chalk-portrait: CHALK — the first made citizen, the E7 batch's withheld 6th file, now unblocked by owner ruling #14 (ART SLOT)
FIRE-AUTHORED s1163 (attended review welcome) — **ONE FILE. This is the deliberately-withheld portrait from `art-e7-town-icons`, released by an owner ruling that landed after that batch generated.**
You are Codex with image_gen, running in the ART slot.
CODEX: model=gpt-5.6-sol effort=high

## Why — the batch shipped five and withheld the sixth ON PURPOSE, and the owner has now answered the exact question it was withheld on
**Unshipped proof (F-1044-4 art gate — cite the BACKLOG line):** `tasks/BACKLOG.md:1530` verbatim: *"**F-1160-1 ANSWERED (owner 2026-07-28, ruling #14): Chalk = option (c) VISIBLY MADE** … **E7 portrait batch 6th file UNBLOCKED** — art direction: assembled-not-grown, E7 materials (brass/signal-wire/chalk-slate), visible joins, warm eyes, engraved-house; imperfection is the lore."*
File-probe agrees (s1163, run this fire not inherited): `git ls-files | grep -Ei "chalk|civic-agent"` returns **ZERO**, and `assets/LEDGER.md` **row 62** records the E7 batch as *"CHALK and `icons-e7.png` remain out of scope"*. `reviews/era-art-audit.md:57` still owes her by name: *"Owed … `tf-civic-agent-e7.png`."*

**Read the shape of this task before you read its scope.** `art-e7-town-icons` (LEDGER row 62, drained `7873eaee`) deliberately refused to draw her, and its NO list says why: *"her visual species is not specified anywhere … that beat gets an owner word, not a fire's guess."* That was correct then. **The word has arrived.** You are not re-opening a fork — you are executing an answered one, and the answer is unusually specific about the ART, which is why this is a task and not another question.

**The ruling, owner-verbatim (`lore/characters.md:17`, ruling #14, 2026-07-28):**
> *"I am thinking that it is the first agent/made citizen and that should show. How should the town be an expert at making them when they are just starting out?"*

READ FIRST (paths, all on main):
- `lore/characters.md` **§CHALK, lines 14–17** — her FACTS, her ARC, and **HER FACE** (the binding art law; quoted in scope 1 below).
- `assets/LEDGER.md` **row 60** — THE CONVENTION, written expressly "for E6–E10 batches to cite", **and the pinned ground-warmth statistic**. Obey literally.
- `assets/LEDGER.md` **rows 62 + 63** — the E7 batch you are completing, and the E8 batch whose finding (F-1162-2) changed this master's warmth clause.
- `tasks/art-e7-town-icons.md` — your immediate precedent: same convention, same firewall discipline, same E7 palette rider.
- `assets/raw/tf-{assay-clerk,elder-rowan,mei,preacher,schoolteacher,storekeeper}.png` — the six E1 portraits = style ground truth **and your instrument-validation control**.
- `assets/raw/tf-{switchboard-chief,playbook-librarian,drone-keeper,tape-courier,combine-defector}-e7.png` — her five era-mates. **She must sit beside them as one of the cast, not as an exhibit.**
- `docs/decisions/ADR-003` — the agent-origin arc this portrait is a canon beat of.
- `docs/GOLD_RUSH_BRIEF.md` §9 + `docs/decisions/ADR-001` — canon.

## SCOPE 1 — THE PREMISE GATE. RUN IT FIRST, WRITE IT DOWN, AND IT MAY STOP THE TASK — A STOP HERE IS A SUCCESS, NOT A FAILURE.
**Do not call `image_gen` until all three checks below have passed and their results are in your run file.** s1162 authored a task whose every cited fact was true and which was still a no-op, because nothing in the chain tried to *observe* the thing it was curing; the lesson it wrote down is *"write the reproduction gate FIRST, and make it a STOP."* Yours is a three-line gate and it costs about a minute.

**(a) THE CANON IS STILL THERE AND STILL SAYS WHAT THIS TASK CLAIMS.** Read `lore/characters.md` §CHALK and quote the **HER FACE** paragraph verbatim into your run file. It must contain **"VISIBLY MADE"** and **"ruling #14"**. If it does not — if the line has moved, softened, or been superseded since 2026-07-28 — **STOP and report.** You would be drawing a species off a citation instead of a canon.

**(b) SHE IS STILL UNSHIPPED.** `git ls-files | grep -Ei "chalk|civic-agent"` must return **zero rows**. If anything comes back, **STOP and report what exists** — a second Chalk is worse than no Chalk.

**(c) YOUR INSTRUMENT REPRODUCES KNOWN ANSWERS** (the standing control; three batches have now run it and it has stopped one bad master already — `tasks/runs/20260728-095121-art-e7-town-icons-preflight.md`). Measure the six E1 raws with your own warmth code **before measuring anything you generate**:

| E1 control | expected TL+TR mean | vs the 120 floor |
|---|---:|---|
| `tf-assay-clerk.png` | ≈137.8 | pass |
| `tf-elder-rowan.png` | ≈134.0 | pass |
| `tf-mei.png` | ≈105.3 | **the ONE fail** (F-1120-1's known drift) |
| `tf-preacher.png` | ≈124.5 | pass — accepted below 130; the case that killed the old band |
| `tf-schoolteacher.png` | ≈140.4 | pass |
| `tf-storekeeper.png` | ≈143.9 | pass |

**Your instrument is correct only if it reproduces all six within ~±1 AND flags exactly one (`tf-mei`).** Two flags or none = the instrument is wrong; fix it before measuring a single generated pixel. Report the full control table.

## THE CONVENTION (LEDGER row 60, binding — do not drift)
A townsfolk portrait is a small illustrated **BUST** in the engraved-sepia plate hand: warm etched linework, **parchment ground**, **shoulders-up**, character **reading clearly at ~120px**, **FULL-BLEED with NO `#ff00ff` key** (UI portraits, not sprite cells), filename `tf-<role>.png`, **processing: NONE**. Canvas **1254×1254 RGB, no alpha**.

**E7 palette rider:** **walnut / aged-brass / honey-gold glass / teal glow**. Warm the sepia toward brass. She is of this era and made *from* it — see scope 2.

### THE GROUND-WARMTH GUARD — ABSOLUTE BAND, BOTH CORNERS, AND NO ARITHMETIC
> **GROUND WARMTH := mean of (R−B) over the TL 60×60 corner and the TR 60×60 corner.**
> **GATE: flag below 120.** Accepted range across all 17 shipped `tf-*` portraits is **124–145**; aim inside it.
> **Report TL and TR SEPARATELY as well as their mean (F-1161-2)**, and state the spread. E7's `tf-drone-keeper` passed on its mean while its TR alone read 122.5, and E8's four each cleared 120 on **both** corners individually — that is the standard now, so say whether yours does.
> ⛔ Never a 4-corner or whole-image mean (row 60 measured that it false-fails 10 of 11 accepted portraits). ⛔ Never a single corner.

⚠️ **NO POST-HOC CHANNEL ARITHMETIC. THIS CLAUSE IS NEW AND IT IS BINDING (F-1162-2, raised at the E8 drain s1162).** That batch met a *comparative* warmth requirement by applying a disclosed deterministic **+5.5% red-channel** multiply to an image that had **already passed the 120 floor** (121.4 → 135.4). The runner was honest and recorded every attempt — the fault was the master's, which demanded a portrait be *"the warmest of the four"*, a **ranking against three files that did not exist when she was generated**. The finding's rule: *"state warmth as an ABSOLUTE aimable band, never a rank against unmade siblings"*, because **a guard that can be satisfied by arithmetic on the very channel it measures has stopped measuring the art.**

**So, for this file:** the number must come from the GENERATION. Retake natively as often as you like and **report every attempt's number**. You may **NOT** apply per-channel multiplies, curves, levels, or any global tone operation to the delivered PNG. **If native generation cannot clear the 120 floor after five attempts, STOP and report the five numbers.** A stop is lawful here; a calibration is not. There is no sibling to be warmer than — the band above is the whole target.

## SCOPE 2 — THE ONE FILE
In `assets/raw/`:
1. `tf-civic-agent-e7.png` — **CHALK, the first made citizen. Fresh generation; there is no source to edit and no prior agent-face anywhere in the game.**

**The filename is `tf-civic-agent-e7.png`, not `tf-chalk-e7.png`** — that is the name `reviews/era-art-audit.md:57` owes and the name `art-e7-town-icons`'s NO list reserved, so it is the one that closes the audit row. Her canon NAME is CHALK; note the mapping in your LEDGER row.

**WHO SHE IS** (`lore/characters.md:15`, verbatim facts): *"the Calculating House's first-born (E7): a civic agent with a name, a desk at the claim office, and a portrait on the ledger wall — named for THE ELDER'S CHALK, the thing her chair held the morning she was gone (E2). Warm by specification (a mind that cannot hunger); starts at rung 0 … Its first act at the desk: filing rescue coordinates."*

**WHAT SHE LOOKS LIKE** (`lore/characters.md:17`, ruling #14 — this paragraph is the art brief, follow it clause by clause):
> *"**VISIBLY MADE** — F-1160-1 option (c), honest early craft, no disguise. Art law for her portrait and any later sprite: **assembled, not grown — visible joins and seams, materials the town actually has in E7 (brass, signal-wire, chalk-slate), maker's marks unhidden; WARM regardless (the eyes carry 'warm by specification'); never uncanny, never gory-mechanical; engraved-house voice.** The imperfection IS the lore: first of her kind, made by beginners, citizen in full."*

Render that as: a shoulders-up bust in the same hand as her five era-mates — **brass plate and signal-wire where a person has skin and hair, a chalk-slate panel where a person has a cheek or a brow, joins left visible and a little uneven, the seams honest rather than hidden.** She is at her desk's business: a civic clerk of the claim office. **Her eyes are the warmest thing in the frame** — that is not decoration, it is the canon's own instruction, and it is what keeps her a citizen instead of an object.

⚠️ **THE THREE WAYS THIS PORTRAIT CAN GO WRONG, in the order they are likely:**
1. **UNCANNY.** Explicitly forbidden by the ruling. No dead or blank eyes, no doll-stare, no skull-plate, no exposed jaw-mechanism, no horror register, nothing that reads as a corpse or a mask. **She is warm, alert and pleasant to meet.** If a candidate is technically on-brief but unsettling to look at, discard it and say so.
2. **POLISHED.** The ruling's whole point is *"how should the town be an expert at making them when they are just starting out?"* — so she is **honest early craft**: slightly asymmetric, hand-fitted, workshop-made by people learning. **Not sleek, not futuristic, not chrome-perfect.** A seamless android is as wrong as a monster.
3. **A SERVANT OR A CURIOSITY.** She is a **citizen in full** with a name, a desk and a portrait on the ledger wall. Not a tool, not a mascot, not an exhibit, not cowering, not comic. Rung 0 describes her *permissions*, never her dignity.

📌 **THIS FILE BECOMES A SOURCE.** Canon: *"Chalk stays as she was made, and wears it proudly"*, and her arc runs **E7 desk → aboard the Starship beside the Prospector (T7) → E10 keeps the Ark's manifest.** Every later Chalk is an image-EDIT of this file under the consistency law. **Make an identity that can be aged and re-lit without being redrawn:** clear silhouette, a memorable arrangement of joins, one or two unmistakable features that survive a 120px downscale.

## Canon riders (ADR-001 / brief §9) — and this batch's letters trap is the sharpest one yet
- ❌ **NO LETTERS — AND HER OWN NAME IS THE TRAP.** She is named for a piece of **chalk**, her materials include **chalk-slate**, and the ruling asks for **maker's marks unhidden**. A slate wants writing on it and a real maker's mark is stamped *text*. **Every one of those renders as blank, blind-embossed, or punched holes and nothing else.** No words, no numerals, no monograms, no serials, no legible type anywhere — not on her slate, not on her plate, not on the desk. **Maker's marks = punches, notches, rivet patterns, a struck rosette. Never characters.** E7 already fought this on five fronts and won; do not lose it on the sixth.
- ❌ **No firearms, ever** (ADR-001). Nothing on or near her is a weapon or reads as one.
- ✅ **Illustrated and warm, never gory** — and "never gory-mechanical" is stated in the ruling itself: no wounds, no exposed viscera-as-machinery, no damage.
- ✅ **Engraved-house voice** — the same etched sepia hand as all 17 shipped portraits. She is a *drawing in the town's book*, not a render.
- ✅ **She is townsfolk, not an enemy.** Nothing menacing, nothing military.

## NO CONTACT SHEET, AND HERE IS WHY (do not add one)
A contact sheet exists to prove **cell ORDER** against its raws — the F-1154-3 duty. **One file has no order**, so a 1-up sheet would prove nothing and a pairing matrix on it is vacuous. **Do not regenerate `tf-e7-town-sheet.png` either**: it is a shipped, drained artifact (LEDGER row 62) whose five-up order was measured and recorded, and repainting it to add a sixth cell would modify shipped art to no gate's benefit. **If an attended session later wants a six-up E7 sheet, that is its own rung.** Deliver the portrait and the 120px strip; nothing else.

## Self-QA — MEASURED, in the run file (not eyeballed)
- **Scope-1 gate results FIRST**: the verbatim HER FACE quote, the zero-rows probe output, and the six-row instrument control table.
- Canvas **1254×1254 RGB, no alpha** (state measured dims + channel count). **0 transparent px, 0 exact- and near-magenta px** (correct full-bleed reference tier).
- **Ground warmth: TL, TR, mean, and spread** — mean must clear the 120 floor; say whether **both corners individually** clear it, and whether the mean lands inside 124–145.
- **Every generation attempt's warmth number**, including discarded ones, and an explicit line: **"no channel arithmetic, curves, levels or tone operations were applied to the delivered file."**
- **Reads at 120px: actually downscale and view it**, and view it **beside the five shipped E7 portraits at 120px** — she must be instantly distinguishable *and* obviously the same hand. Save the six-up strip to `reviews/shots-art-e7-chalk-portrait/e7-chalk-with-cast-120px-strip.png` and say you looked.
- **Framing consistent with the five** (shoulders-up, comparable head size) — the CONVENTION is the deliverable as much as the face is.
- **The three failure modes, answered one by one, in your own words at full size AND at 120px:** is she uncanny? is she too polished? does she read as a citizen rather than a tool? **If any answer is uncomfortable, say so plainly** — an honest "this one is slightly uncanny and I discarded it" is worth more than a clean claim.
- Canon: no letters (name the slate/plate/marks and how each stayed blank) / no firearms / no gore.
- **Firewall proof:** confirm all 17 prior `tf-*.png` are byte-identical after your run, and that `tf-e7-town-sheet.png` is untouched.

## FIREWALL
**TOUCH-ONLY:** `assets/raw/tf-civic-agent-e7.png` (the one) · `reviews/shots-art-e7-chalk-portrait/` (QA strip only) · `assets/LEDGER.md` (one new row, **64**) · your run file under `tasks/runs/`.

**NO:**
- ❌ **Do not touch, repaint or regenerate `assets/contact-sheets/tf-e7-town-sheet.png`** or any other contact sheet (see above).
- ❌ **Do not touch or regenerate any of the 17 shipped `tf-*.png`.** She is a new file; every existing portrait stays byte-intact.
- ❌ **No `icons-e7.png`, no `#ff00ff`-keyed sheet, no sprite cells** — different tier, its own rung. She gets a bust and nothing else this batch.
- ❌ **No Chalk SPRITE, no walk sheet, no full body.** The ruling's art law covers *"her portrait and any later sprite"*, but the sprite is a later rung with its own contract.
- ❌ No extraction, no `extract-alpha`, no `assets/processed/` (**reference-tier law: no consumer exists** — `grep -rn 'tf-' src/` returns only `utf-8` — so nothing is wired and no player-visible surface changes).
- ❌ No `src/**`, no `e2e/**`, no contracts, no `generated.ts`, no `tasks/*` other than your own run file.
- ❌ No E8–E10 portraits, no aging edits, no He-3 assayer (owner-gated, F-1161-3).
- ❌ **Do not run the playwright suite or start a dev server.** Nothing here is testable that way, and a full-suite job has been live in lane-d for over two hours — a second heavy job corrupts that measurement (Mistake #12).

One batch in flight (✓ verified s1163: `tasks/queue/art/` empty; `tasks/running/` holds only the lane-d job).

END: **READY-FOR-GATES** + the scope-1 gate results + the measured QA table + every attempt's warmth number + the no-arithmetic statement + the three-failure-mode answers + the LEDGER row + one line on whether the convention held or drifted.
