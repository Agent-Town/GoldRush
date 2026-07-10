# Task 068-sheet-extraction-fix: re-extract the six rejected walk8 sheets — no holes, no purple, no trapped sand (ART slot)
CODEX: model=gpt-5.5 effort=medium
**OWNER CONTACT-SHEET VERDICTS 2026-07-10 (verbatim): youngster-m "gaps in his legs, cut out pixels that are purple", same for youngster-f, tavernkeeper, storekeeper, elder; "hero has some background stuck between her legs in some frames"; "baron has a bit of green ground but looks good"; prospector PASS.**
DIAGNOSIS: extraction-stage defects, NOT generation — the approved take videos are the source of truth; do NOT regenerate any video. Two failure modes: (a) key/matting eating INTO character pixels (tan clothing ≈ sand/magenta tolerance) → transparent holes with purple fringes; (b) border-flood background removal cannot reach ENCLOSED background (between the hero's legs) → trapped sand.

You are Codex on Robin's Mac, repo root. READ FIRST: the 01-hero/05-town-cast run notes (`assets/motion-pilot/production-*/RUN-NOTE.md` — how extraction ran: /tmp imageio-ffmpeg, fps=2, 280×340 cells), the existing extraction scripting in those evidence dirs, `scripts/extract-alpha.mjs` (the sheet-level keyer, for reference).

## Scope
1. **Rebuild the matting step** (a /tmp venv or node script — NO repo dependencies): background removal must be (i) border-flood for the outer field, (ii) PLUS enclosed-region removal: any background-colored region fully inside the character hull goes transparent too, (iii) with a character-protection pass — pixels within the figure's color families (clothing/skin/hair sampled from the turnaround) are NEVER keyed regardless of tolerance. If color logic stays fragile, use a proper segmentation model locally (isolated /tmp install, e.g. rembg) — pick whichever passes the gates.
2. **Re-extract from the EXISTING selected videos** for: hero, elder, tavernkeeper, storekeeper, youngster-m, youngster-f (+ clean the baron's green ground patch in the same pass — his sheet is otherwise PASSED). Prospector untouched (owner-passed).
3. **Rebuild the six sheets** (`char-*-sheet-walk8.png`, same 4×8 `#ff00ff` grid geometry) + fresh contact sheets per character for the owner's re-verdict.
4. **MEASURED GATES per sheet (in the run note, numbers not adjectives):** zero pixels within tolerance of #ff00ff in any cell interior · zero fully-enclosed transparent regions inside the character silhouette (connected-component count) · zero enclosed background-colored blobs (the hero-legs class) · cell geometry unchanged (280×340 bottom-aligned; baron band preserved).

## Firewall
Touch ONLY: the six raw sheets + contact sheets + evidence dirs + LEDGER rows + run note + the /tmp extraction tooling. **NO video regeneration, NO src/, NO prospector/jumper sheets, NO processed-full cells (the walk8 flags are OFF for these characters — the 066 registry stays untouched until the owner re-verdicts).**
End: **READY-FOR-GATES** + six contact sheets + the per-sheet gate numbers.
