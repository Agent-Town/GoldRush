# fix-walk-cutout-pockets — the cream wedges die (lane-b; commit prefix "fix:")
ROLE: art processing. WORKDIR: lane-b (worktrees/lane-b). CODEX: model=gpt-5.6-sol effort=high
ATTENDED-AUTHORED 2026-07-13 — owner, on char-hero-sheet-walk8: "there are these artefacts from cutting out the sprites, these look really bad in game."

Pre-flight (LANE-SAFETY, runner-auto-commit aware): standard safe-dupe rules (lanes reset this morning; content-on-main authorization stands). If the stop-reason is an undrained sibling, report "LADDER-STALL: waiting on drain of <slice>" (fires re-queue, pre-authorized). Then `npm install --no-audit --no-fund`; `npm run build` green.

## WHY: several hero walk8 cells (and per LEDGER #33's standing caveat, likely other walk8/walk4 sets) carry OPAQUE parchment/cream wedges in the enclosed gaps (between walking legs, under arms) — background that the matte failed to clear because the region is enclosed by the figure. Task 044 hand-fixed 3 cells; the owner's gallery pass shows more. These read as white blobs in play.

## READ-FIRST: the owner's finding + assets/LEDGER.md #33 (known caveat: "magenta key gaps around lower legs/boots") + #35 (the rembg corrective re-extraction method — the venv path) + task 044's bounded flood-fill precedent (`git log --grep 'walk8 foot cleanup'`) · scripts/extract-alpha.mjs (--pocket-mean / enclosed-pocket removal + --interior-key) · logs/cast-sheets.html generation (scripts/cast-sheets.sh) for the audit surface.

## SCOPE:
1. AUDIT every processed walk8/walk4 cell (all characters): programmatic scan for opaque near-parchment/cream pixel regions ENCLOSED by figure alpha (flood-fill from cell border; any remaining opaque background-colored blob not reachable from the border = a pocket). Output the offender list (cell file + blob area px) to artifacts/fix-walk-cutout-pockets/audit.json — report the count BEFORE fixing.
2. FIX every offender: bounded pocket clear (alpha-out the enclosed background blob, feathered edge; the 044 method scaled up) — NEVER touching figure pixels (edge QA per cell: silhouette bbox unchanged ±1px). Regenerate the affected processed cells in place (raws untouched).
3. Verify: re-run the audit → zero offenders; regenerate logs/cast-sheets.html cells; spot-render 6 worst-before cells at 512px into artifacts/ for owner eyeball.
4. e2e: cast-motion-wiring + run-scene-animation-refresh + hero-pose-library UNMODIFIED-green (cell contents changed, geometry/keys did not). LEDGER: retire the #33 caveat line (mark POCKETS CLEARED 2026-07-13, evidence path) same-commit.

## Firewall
Touch ONLY: assets/processed/char-*-r*c*.png (offenders only), artifacts/fix-walk-cutout-pockets/, assets/LEDGER.md. NO raws, NO frames.json geometry, NO layer contracts, NO src/.

## Self-check
tsc + build green · the three named suites green both projects · audit.json shows 0 offenders post-fix · before/after strip. If you find yourself about to exit without changes, WRITE WHY into your report first.
END: READY-FOR-GATES + offender count before/after + worst-6 strip.
