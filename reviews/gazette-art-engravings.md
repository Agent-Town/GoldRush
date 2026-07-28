# Review — art-gazette-engravings (THE CLAIM HERALD spot-cut tier)

**Slice:** `art-gazette-engravings` · **slot:** ART · **run:** `tasks/runs/20260728-215214-art-gazette-engravings.md`
**Content commit:** `94ca2400` (`runner(art): art-gazette-engravings.md`) — already on main when this drain began
**Drain:** s1184 fire, 2026-07-28 · **done-move:** `tasks/done/20260728-215214-art-gazette-engravings.md`
**§3.0 drain-block-check:** ✅ CLEAR (`gazette-art-engravings`, was `status:"queued"`)

## Verdict

**ACCEPT — gate-in-place.** All seven cuts and the contact sheet meet every term of the master's
contract. This was **not a merge drain**: the art runner had already committed the content directly
to main (see F-1183-4 below), so the drain's job was to gate what shipped, rule the three questions
the master deferred to it, and register the result.

Three rulings are recorded below; the master explicitly delegated two of them
(*"let the drain decide"*, *"open to challenge"*) and s1183 ordered the third.

## What it does

Seven reusable engraved spot illustrations — one per Herald headline class
(board / trail / river / schoolhouse / ledger / boss / town-growth) — plus a labelled 4+3 review
sheet. They are art-only: **nothing consumes them yet**, by design. The class→engraving wiring is
the next rung (`gazette-art-wiring`), which is now unblocked.

## Evidence

Every number below was measured by this drain, not read from the run report.

| check | method | result |
|---|---|---|
| 7 cuts at exact paths | `ls` | ✅ all present |
| dimensions | PNG IHDR read directly | ✅ **7/7 at 1024×1024** |
| colour type / depth | IHDR byte 25 | ✅ **7/7 RGB (type 2), 8-bit, no alpha** |
| `#ff00ff` purity | full-raster scan, every 2nd px | ✅ **0 magenta px in all 7** |
| full-bleed (no frame) | edge-vs-inset mean luminance | ✅ no border: edge 34.7–69.4 vs inset 42.2–78.7, continuous |
| **letters guard** | **every cut viewed at native 1024², + 4× zoom on suspects** | ✅ **0 legible glyphs** — see below |
| 120 px legibility | **own** 7-up strip, downscaled and viewed | ✅ **7/7 read instantly** |
| variety law | 7 distinct camera distances, viewed | ✅ intimate ×2, mid ×2, vista/low-angle ×3 |
| canon | viewed | ✅ boss is a **machine**; no firearms anywhere; no gore |
| teal accent | blue-over-red delta per cut | ✅ present in all 7 (see note) |
| provenance | perceptual match vs Codex cache natives | ✅ **verified, not asserted** (below) |
| `npx tsc --noEmit` | run on main | ✅ clean, rc 0 |
| `npm run build` | run on main | ✅ green, built in 1.33 s, asset-diet clean |
| firewall | `git show --stat 94ca2400` | ✅ **zero `src/`, zero `news/herald.json`, zero `assets/processed*`** |
| no consumer yet | `find dist -name "*herald-engraving*"` | ✅ **0 hits** of dist's 1193 PNGs |
| LEDGER row 66 | read | ✅ present, and honestly discloses the resample |

### The letters guard — checked on the images, not on the report's sentence

The master named this the batch's most likely failure by construction: four of the seven subjects
(notice board, ledger, school chart, township) invite the generator to write.

All seven were viewed at **native 1024²**. The only glyph-suspicious region in the batch is the
false-front storefront band in **trail**; it was cropped at native resolution and magnified **4×**
(`reviews/shots-gazette-art-engravings/trail-signband-zoom4x.png`). At 4× it resolves to **abstract
engraved hatching inside a recessed sign panel** — texture that reads as "a sign exists" without
spelling anything. The second facade (`trail-rightbuilding-zoom4x.png`) is bare planking. **Not a
letter, and not legible at any zoom.** It is nonetheless the closest call in the batch and is
recorded here so the next art master knows the boundary was actually tested.

The three highest-risk cuts pass cleanly and deliberately: **board**'s pinned papers are blank,
**ledger** shows ruled columns with zero writing, and **schoolhouse**'s slate carries a triangle, an
arc and a compass rose — diagrammatic marks exactly as the master specified, no caption.

### 120 px positive control — re-run independently

The master required a 120 px verdict per cut, and the runner reported one. This drain did not
inherit it: all seven were downscaled to 120 px into a single strip
(`reviews/shots-gazette-art-engravings/legibility-120px-strip.png`) and viewed.
**All seven read instantly.** Strongest: ledger (an open book), river (a teal bend). Busiest but
still legible: board and town-growth.

### Provenance verified by content, not by the report's table

The run report names a Codex cache file per cut. Rather than trust the table, each shipped cut was
compared perceptually against each candidate native (128² normalized, mean abs diff /255):

- **every claimed pairing matched at MAD 0.73–1.19** (residual = resample noise)
- **every runner-up scored 27.3–42.4** — a **25–40× separation**, so the mapping is unambiguous
- the rejected schoolhouse take scores **24.83** against the shipped schoolhouse → it is genuinely
  a different take, confirming the run report's rejection story rather than a re-labelled duplicate

This matters beyond bookkeeping: it proves the shipped 1024² files are **pure downscales** of the
1254² natives, which is what let this drain's visual gate transfer to the salvaged originals.

### Teal accent — a note, non-blocking

The style anchor requires "one small teal accent" per cut. Measured as max(b−r) per cut:
ledger **93** (inkwell) and boss **80** (work lamp) are strong; board 22, river 19, town-growth 15,
trail **12**, schoolhouse **10**. Trail's wagon pennant and schoolhouse's bell-rope ribbon are
visually present but sit only just off sepia-neutral. Within "small"; recorded so a future batch
can decide whether the floor should be raised.

⚠️ Method note: this drain's *first* teal detector returned **0.00 % for all seven — including the
river cut, whose water is visibly teal**. The instrument was wrong, not the art (it required
`b > g+18 && g > r+10`, which sepia-washed teal never satisfies). It was rebuilt on the
blue-over-red delta before any claim was written. A detector that reports zero on a case you can
see with your eyes is measuring the wrong thing.

---

## RULING 1 — F-1183-1: the canvas rationale is FALSE. Struck.

`tasks/art-gazette-engravings.md:33` established the new tier as **1024×1024**, justified
*"(gpt-image-2's native square — no resampling)"*, and `:80` made it a hard self-check gate.

**The parenthetical is refuted by this batch's own output.** The native tool returned
**1254×1254** for all eight generations (measured directly from the cache files' IHDRs). Codex
therefore ran `sips --resampleHeightWidth 1024 1024` on each selected cut to satisfy the gate —
**precisely the resample the convention was written to avoid**, on `assets/raw/` originals in a tier
the same line declares *"processing: NONE"*.

**Codex behaved correctly and is not at fault.** It measured the mismatch, wrote it up as F-GAZ-1,
disclosed it again in LEDGER row 66, and chose the written contract over its own judgement. That is
the behaviour the factory wants; the defect is in the contract.

**Re-derived at scale rather than inherited.** s1183 asserted 1254² from four portrait files. A full
tally of all **535** PNGs in `assets/raw/` gives the real picture: the dominant square tier is
**1254² (163 files)**, against **1024² (12 files)**. So 1024² is not unprecedented — but it is a
small minority, and "native" it is not.

**Action taken:** the false rationale is struck from the master and replaced with the measured fact,
so the next art master cannot copy it. **The seven shipped cuts are NOT regenerated** — see Ruling 2
for why that turned out to cost nothing.

## RULING 2 — the 600 KB cap: the cap is real, but it does not bite here. It bites at `dist/`.

The master ordered *measure-and-report, do not fix*. Measured: **2.14–2.35 MB per cut**
(2.24 MB mean), **3.5×–4× the 600 KB line** in `assets/LEDGER.md:1`.

**The finding that resolves it:** `scripts/asset-diet.mjs:56` selects PNGs for optimization **by
exact dimensions** —

```js
if ((width === 1671 || width === 1672) && height === 941) platePngs.push(file);
```

— i.e. the 1672×941 landscape plate tier **only**. That is the mechanism which cuts 183 MB of
plate PNGs down to 24 MB (**87 %**) on every build. **The square spot-cut tier is structurally
invisible to it**, at 1024² *and* at 1254².

So the cap is not a raw-tier question at all. Raws are originals and are multi-MB across the whole
repo by design. The cap applies to what reaches the player, and today **nothing does** — verified:
`dist/` contains **0** herald files out of 1193 PNGs.

➡️ **This is a blocking requirement handed to the wiring rung, not a defect in this batch:** the
moment `gazette-art-wiring` globs these into `dist/`, the Herald ships **~15.4 MB of unoptimized
engravings**, because the optimizer cannot see them. `gazette-art-wiring` must either extend
`asset-diet.mjs`'s selector to cover the square tier or route the cuts through a processed variant.
**Recorded as F-1184-1.**

## RULING 3 — F-1183-4: the runner's 117-file sweep. Classified KEEP, explicitly.

s1183 required this drain to rule rather than carry the question. `94ca2400` committed **117 files**
where the legitimate deliverable was 8 art files + a LEDGER row + a run file. Classified:

| class | files | ruling |
|---|---|---|
| `artifacts/**` e2e screenshots/reports | 73 | **KEEP** — byte-drift from real test runs; reverting restores equally arbitrary older bytes at the cost of a large diff |
| `.wrangler/**` deletions | 2 | **KEEP (correct outcome)** — build cache that should never have been tracked; the sweep accidentally did the right thing |
| stale `tasks/queue/**` deletions | 6 | **KEEP (correct outcome)** — already-consumed queue files; deletion is accurate bookkeeping |
| the batch's own art + LEDGER + run file | 10 | the deliverable |

✅ **`src/` was not touched** — verified; no second `Balance.ts.orig` was created.

The desk items *"`.wrangler` untracking"* and *"`artifacts/` churn keep-or-revert"* are hereby
**answered in the KEEP direction and can be retired**. The underlying cause — **F-1162-1**, the lane
runner's broad `git add` — is untouched by this ruling and remains the highest-value desk item.
This drain ratifies an outcome; it does not endorse the mechanism that produced it.

---

## RETENTION ACT — the 1254² natives salvaged before the cache is collected

The originals of LEDGER row 66 existed **only** in Codex's managed image cache
(`~/.codex/generated_images/019fa936-…/`) — outside the repo, in no object database, and subject to
GC. Under the RETENTION LAW (CLAUDE.md §4.10b) they are exactly the kind of irreplaceable factory
artifact that must be mirrored into git before it is lost.

All **8** (7 selected + the rejected schoolhouse take, retained as the evidence of the batch's only
QA rejection) were copied to `assets/raw/originals/herald-native1254-*.png` — **28.33 MB**, every
file dimension-asserted at 1254² by the copier itself
(`scripts/_s1184-salvage.mjs`, retained as the provenance record mapping each cache blob to the
asset it became, with sha256 prefixes).

Naming is deliberately **outside** the `herald-engraving-*` family so no present or future glob can
double-match the shipped cuts.

**This makes Ruling 1 non-urgent rather than unresolved.** Whether the shipped raws should be the
1254² natives instead of the 1024² downscales is a genuine convention question with an owner-facing
aesthetic component, and it is no longer time-critical now that the originals are safe in git and
nothing consumes them. Recommendation on the owner's desk; reversible with one word either way.

## Findings

- **F-1184-1 (blocking, for `gazette-art-wiring`)** — `asset-diet.mjs:56` selects by exact
  dimensions (1672×941) and therefore cannot see the square spot-cut tier. Wiring these cuts as-is
  ships ~15.4 MB unoptimized to the player. The wiring rung must extend the selector or add a
  processed variant. *(Ruling 2.)*
- **F-1184-2 (non-blocking, convention)** — the `1024×1024` canvas line's stated rationale was
  false; native is 1254². Struck from the master this drain. Any future art master establishing a
  canvas must state the measured native size, not an assumed one. *(Ruling 1.)*
- **F-1184-3 (non-blocking, note)** — the teal accent in **trail** (max b−r = 12) and
  **schoolhouse** (10) is only just off sepia-neutral. Present and within "small"; flagged in case a
  future batch wants a floor.
- **F-1182-2 confirmed, third instance** — the runner's nested independent `codex review` step
  failed again: installed CLI `0.133.0` rejects `gpt-5.6-sol` as needing a newer CLI. The **main
  exec is unaffected** (this batch shipped). Still `brew upgrade codex`, still owner, still low
  urgency.

## Artefacts

- `reviews/shots-gazette-art-engravings/legibility-120px-strip.png` — the independent 120 px control
- `reviews/shots-gazette-art-engravings/trail-signband-zoom4x.png` — the letters-guard boundary case
- `reviews/shots-gazette-art-engravings/trail-rightbuilding-zoom4x.png` — second facade, bare
- `assets/contact-sheets/herald-engravings-sheet.png` — the batch's own 7-up review sheet
