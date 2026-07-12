# wire-townsfolk-walk8-trio — preacher, schoolteacher, assay clerk step off their portraits (lane-d; commit prefix "feat:")
CODEX: model=gpt-5.6-sol effort=medium
ATTENDED-AUTHORED 2026-07-12.

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B <lane-branch> main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything. **RESET AUTHORIZATION (attended, 2026-07-12):** every lane-d (`lane/perf`) ahead commit through tip `28638634` (wire-hero-pose-library) is CONTENT-ON-MAIN via attended cherry-pick (`a14aed9e`). Ancestry will look ahead while every diff is a SAFE DUPE: `git checkout -B lane/perf main && git clean -fd` and PROCEED — do NOT re-STOP on aheadness.

## WHY: assets/LEDGER.md "2026-07-12 late — attended drain": `char preacher / schoolteacher / assay_clerk walk8 a+b — raw drained (6 sheets) — PENDING-PROCESSING; retires the bust stand-ins when wired`. These three are the LAST plaza actors on portrait_post bust fallbacks; the whole rest of the cast is fullBody walk8. Owner QA (2026-07-12) flagged the bust stand-ins repeatedly.

## READ-FIRST: assets/raw/char-preacher-sheet-walk8-a.png + -b (and schoolteacher, assay-clerk pairs — 6 sheets; inspect BEFORE processing) · scripts/extract-alpha.mjs + LEDGER Process notes (--key ff00ff --grid 8x4, 280x340 cells expected) · the Mei precedent END-TO-END: LEDGER entry #42 (seam-law: footline y≈334 vs cast 333, content-height bands) + her processed set + her townsfolk.ts entry · src/town/townsfolk.ts (TOWN_CAST_METROLOGY: tallAdult 1.02 for preacher, adult ~1.0 schoolteacher/assay_clerk — the metrology table is LAW; the three current portrait_post entries) · src/town/TownScene.ts fitSpriteToTexture + applyFullBodyFrame (how fullBody actors consume frames) · e2e/cast-motion-wiring.spec.ts (the gate you will UPDATE — see scope 4).

## SCOPE (each independently checkable):
1. SELECT one candidate per actor (a vs b) by visual QA: identity vs the townsfolk portrait (assets/raw/townsfolk-preacher.png etc.), 4 direction rows × 8 frames, no mirrors, no frame reuse, clean key, fully-clothed, no letters/firearms/gore. Record verdicts + reasons.
2. Process winners: `node scripts/extract-alpha.mjs --key ff00ff --grid 8x4` → cells + frames.json in assets/processed/. SEAM-LAW check per sheet vs the walk8 cast (LEDGER #42 model): footline within ~2px of 333, content height inside the adult band (schoolteacher/assay_clerk) and tall band (preacher ~tavernkeeper 306+); report the numbers.
3. Wire all three in src/town/townsfolk.ts as fullBody walk8 actors (Mei/tavernkeeper pattern), heights via the EXISTING TOWN_CAST_METROLOGY values (change NO table numbers), retiring their portrait_post bust fallbacks. Their loops/positions/barks stay as-is.
4. Update e2e/cast-motion-wiring.spec.ts EXPECTATIONS for exactly these three actors: presentation portrait_post → fitted fullBody (aspect band + metrology height assertions like the rest of the cast). Touch NO other actor's assertions. The WHOLE spec must then pass — including Mei's stand-still poll and the sheet-uniqueness set (three new unique prefixes join it).

## Firewall
Touch ONLY: assets/processed/ (new cells+frames.json), src/town/townsfolk.ts (the three actor entries), assets/LEDGER.md (retire the PENDING-PROCESSING line same-commit), e2e/cast-motion-wiring.spec.ts (ONLY the three actors' expectations). NO TownScene.ts runtime changes, NO metrology table changes, NO other actors, NO raw edits, NO layer-contract hero/enemy blocks.

## Self-check (evidence, not vibes)
`npx tsc --noEmit` + `npm run build` green · e2e/cast-motion-wiring.spec.ts green desktop+mobile-390 · town-t5-townsfolk + town-t1-square UNMODIFIED-green · zero console/page errors · a plaza screenshot with all three walking (artifacts/wire-townsfolk-walk8-trio/) · report footline/height table per sheet.
If you find yourself about to exit without changes, WRITE WHY into your report first — a silent no-op wastes a queue slot and a gate.
END: READY-FOR-GATES + report a/b selections, seam-law numbers, and confirmation the bust fallback path is retired for exactly three actors.
