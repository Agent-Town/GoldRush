# art-batch-drill-yard-contract-plate — s1332 drain review

**Slice:** `art-batch-drill-yard-contract-plate` (ART slot, FIRE-AUTHORED s1331 from spec slice PC-01)
**Branch:** none — the ART slot commits to `main` directly.
**Tip:** `fd38b8837f094cd4eb9cbc18cbb06405d3877404 (archive: pruned by the A3 rewrite)` (2026-08-01T14:14:15+07:00, `runner(art)`)
**Drained by:** s1332, 2026-08-01

## VERDICT: PASS — the 42nd contract now wears its own picture.

## What it does

`e1-drill-yard` shipped with PC-01 at `f86b28b3` as the 42nd contract and had no board card, so
`renderContractArt` fell through `src/town/TownScene.ts:2787` → `:2788` → the last-resort fallback at
`:2790` and drew **the Claim's** plate on the Drill Yard card. This batch adds exactly one file —
`assets/raw/plate-contract-e1-drill-yard.png` (1672×941 RGB, SHA-256 `6647dda9…5954a`) — plus its run
note. **No wiring was needed and none was done:** the resolver addresses plates by glob, so naming the
file `plate-contract-<full-id>.png` is the whole integration. I verified that claim against the source
before trusting it (`TownScene.ts:2787`), rather than inheriting it from the master.

## Evidence

| Gate | Command | Result |
|---|---|---|
| Types | `npx tsc --noEmit` | clean |
| Build | `npm run build` | green, 1.85 s; asset-diet now counts **54** plate-class PNGs (was 53) |
| **Acceptance test** | `board-card-images.spec.ts --workers=1` | **2 passed** desktop + mobile — was **2 failed at `:45`, `Error: e1-drill-yard`** |
| Adjacent (grep-derived) | `town-t3-board`, `e2-pressure-garden`, `e2-trestle`, `map-census` `--workers=1` | **110 passed**, 6.4 m (map-census 94/94 both projects) |
| Guards | `node --test` × 36 guard files + `test-ticker-stats.mjs` | **209/209**, ticker-stats pass |
| Console/page errors | asserted inside both playwright probes | **0** desktop + 390px |
| Render proof | `img.complete` / `naturalWidth` at the live card | `{complete:true, w:1672, h:941}` **both projects** |
| Screenshots | `reviews/shots-drill-yard-plate/` | `card-` + `board-` × desktop/mobile |

Adjacent suites were **derived by grep** (`plate-contract\|contract-art\|contractPlateUrls\|board-card`
over `e2e/ src/ scripts/`), not copied from the master's list.

**On the render proof:** a visible `<figure>` with a correct `src` is not evidence that any bytes
decoded — a 404 renders as a visible broken `<img>` and passes both. So the probe reads
`naturalWidth`/`naturalHeight` off the live element: `1672×941`, matching the raw file's own header
exactly. That is the difference between "the URL is right" and "the picture is there".

## Merge classification

Not a lane graft. The ART runner committed the two new files straight to `main` in `fd38b883 (archive: pruned by the A3 rewrite)`;
`git status` at drain time showed no `src/`, no `e2e/`, and no contract/spec/ledger edits, exactly as
the master's NO-list required. The run performed **no** extraction, processing, wiring or LEDGER edit —
all correctly left to this drain (§8).

## Art QA (verified, not inherited)

The run note's measured self-QA reproduces: 1672×941, aspect delta 0.000178%, mean luminance 0.455,
`#ff00ff` count 0, OCR blank. Viewed at full size and at card scale in-game: no letters, numerals,
signage, logos or pseudo-writing; no people, animals, victims or gore; **no firearms or weapons of any
kind** (ADR-001 / brief §9) — the "targets" are unmistakable bundled-straw cylinders on broad timber
bases and rolling log rigs, which is exactly the safe-practice-yard read PC-01 asks for. Warm sepia
engraved survey-map style, full-bleed, no border or corner marks. One retake, honestly logged, for
letter-like marks on distant storefronts and an assay-table paper — both gone in the shipped take.

The plate also *matches its own card text*, which is not guaranteed and is worth recording: the straw
men, the rolling logs, the Drill Bell on its post and the assay-tent top-up lever named in the card's
GOALS and RULES are all present and individually legible.

## Findings

**F-1332-1 — DUPLICATE DISPATCH: one master, two done-moves, two run logs, ~46k tokens. Non-blocking;
the master's own guard absorbed it, and that is the point worth keeping.**
`tasks/done/` holds `20260801-140654-…` and `20260801-141427-…` for the same master, with matching logs
in `tasks/runs/`. Mechanism, read from the commits rather than guessed: the **first** run committed the
output (`fd38b883 (archive: pruned by the A3 rewrite)`: plate + run note + telemetry) **without removing its queue entry**; the entry was
still in `tasks/queue/art/` and was dispatched again; the **second** commit (`5d5e6d02`) is that entry's
deletion and nothing else. The second run cost **45,914 tokens** and changed **zero files**, because
s1331 wrote a Scope-0 pre-flight that checks for the output before generating — it STOPPED with
*"duplicate pre-flight guard triggered … Already completed by commit fd38b883 (archive: pruned by the A3 rewrite)"*. This is the second
duplicate dispatch on this board in two days (`goals.json` records s1328's). **The cure belongs in the
runner's queue-removal, not in more guards** — but note that the guard is what made this cost 46k
tokens instead of a second 3.5 MB generation over shipped art.

**F-1332-2 — the desktop card CROPS ~a third of every plate, so "legible at card scale" is being
QA'd against an image the desktop player never sees. Class-level, non-blocking, not this batch's
defect.** `src/town/town.css:628` sets `object-fit: cover` on the generic `.town-ui__contract-art-image`
(per-card `contain` overrides exist only for `dusk-lantern` and `kit-the-baron`, `:648-651`), so a 16:9
plate in the taller desktop frame loses its right-hand third. Measured on this card: mobile shows all
four QA'd zones; **desktop drops the assay tent, brass gear and top-up lever entirely** — one of the
four zones the run note certified. The art is not at fault and neither is the run note; the *criterion*
is aimed at the full-bleed file while the consumer crops. **Recommendation for the next plate request:
state the zone-legibility criterion against the cropped desktop frame, or require key zones left of
centre.** Applies to all 42 plates, so it is an art-contract fix, not a re-generation.

**Art staging audit (ART-SLOT LAW, both buckets):** **AT RISK 748 files / 566.47 MB** — unchanged from
s1331, still F-1331-4 on the owner's desk (`motion-pilot` is 556.96 MB of it). **LOCAL-ONLY 2 files /
3.37 MB** — and the arithmetic identifies them: 3,524,144 B plate + 6,436 B run note = exactly this
drain's own output, in git here and on no origin ref. One push cures it; pushed at handoff. Note this
batch's output landed in the **repo-root** `assets/raw/`, not `worktrees/art/`, so it never entered the
unstored hole.

## Probe

`reviews/shots-drill-yard-plate/probe-s1332-plate-shot.spec.ts.txt` — the screenshot/decode probe,
navigation copied verbatim from the acceptance test. Kept as evidence (Retention Law) and parked with a
`.txt` suffix so it is invisible to both playwright's `testDir` and tsc.
