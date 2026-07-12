# cast-motion-wiring-e2e — every generated animation reaches the game; town cast goes FULL-BODY
ROLE: sprite pipeline + town wiring. WORKDIR: lane-b (worktrees/lane-b).
CODEX: model=gpt-5.6-sol effort=medium

## WHY (owner 2026-07-12, verbatim): "the new animations for the characters are not in the game yet… I can't see these in the game. Please fix that, we have to test this end to end as there are so many characters now. In Town all the characters are cut half — why not use the full body for them? I think you created full body animations for them, so lets use them."
Two facts: (1) the Seedance motion ladder + pose-library batches generated walk/pose material that never got extracted/wired; (2) town actors render half-body/bust presentation while full-body sheets exist.

## READ-FIRST
- assets/LEDGER (motion ladder rows: which characters have walk8/walk4/pose material RAW vs PROCESSED vs WIRED — the task's step 1 is this inventory, written into the report)
- assets/raw/ + assets/processed/ char-* sheets (hero/jumper walk4 a/b pairs visible in raw; walk8 cast per prior batches; Mei walk8 = 32 processed cells, reviews/art-sprite-production-07-newsie.md)
- scripts/extract-alpha.mjs (--key ff00ff --grid CxR — the extraction law), the sheet seam-law (footline alignment, height bands vs char-hero cells)
- src/town/townsfolk.ts TOWN_ACTORS + TownActorRuntime (town-t5 grammar), src/assets/generated.ts slot registry, SpriteAnimator
- reviews/town-t5.md (idle posts + youngster loop conventions)

## SCOPE
1. INVENTORY (report table): per character — generated? extracted? processed? wired where (run/town/neither)? THIS TABLE IS THE DELIVERABLE even where wiring is deferred.
2. EXTRACT+PROCESS the gap: any generated-but-unprocessed motion sheets (walk cycles, pose library) through extract-alpha per sheet law; measured self-QA (heights vs bands, key purity, no letters).
3. TOWN FULL-BODY PASS: every TOWN_ACTOR renders a FULL-BODY sprite (walk8 where sheets exist; walk4 fallback; static full-body pose where only poses exist). NO half-body/bust presentation anywhere in the town scene. Mei keeps her shipped walk8. Portraits remain for UI cards (ledger/barks) — this slice is the 3D scene only.
4. E2E: a town boot spec asserting every visible actor's sprite aspect (full-body height band, not bust) + walk animation frame-advance for at least 3 actors; both projects + 390px.
5. Anything whose ART is missing (not generated at all): list in the report as the follow-on generation batch — do NOT generate here (art lane's job; one batch in flight law).

## TOUCH-ONLY: assets/processed/* (new extractions), src/assets/generated.ts registrations, src/town/townsfolk.ts + TownActorRuntime presentation, one e2e, artifacts/, LEDGER rows.
## NO: run-scene hero/enemy sprites (shipped walk8 path untouched), image GENERATION, UI portrait cards, sim.
## SELF-CHECK: tsc; build; new spec + town-t1..t6 suites green BOTH projects; zero console; contact-sheet screenshot of the whole plaza cast full-body (the owner-eye artifact).
END: READY-FOR-GATES + the inventory table + the plaza contact sheet + the missing-generation list.
