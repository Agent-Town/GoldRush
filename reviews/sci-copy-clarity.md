# Review — sci-copy-clarity (F-0707-6 research-copy legibility)

**Drain:** s106 fire, drain 1 of PILE MODE. Source `save/sci-copy-clarity e9daf5a` (lane-a preserved s103).
**Verdict:** PASS — grafted to main.

## Graft method
Main had NOT drifted on any of sci-copy's target files since its base `15f8116`
(verified: `git diff --name-only 15f8116 main -- ResearchTree.ts DeathOverlay.ts sci-01 spec` = empty).
So a loss-free `git checkout save/sci-copy-clarity -- <files>` content-graft, NOT a blind merge.
Files: `src/meta/ResearchTree.ts`, `src/ui/DeathOverlay.ts`, `e2e/sci-01-research-loop.spec.ts`, `artifacts/sci-copy/`.

Note: sci-copy is NOT an ancestor of lane/m3 (sci-03) — both touch ResearchTree.ts as
genuinely separate work. This drain lands the legibility copy; sci-03's contract-tier
edits to ResearchTree.ts will be a serial 3-way graft in a later drain.

## Gate (native, port 5188, factory idle)
- `npx tsc --noEmit` — clean
- `npm run build` — green (1005 kB bundle, pre-existing chunk-size warning only)
- **sci-01-research-loop 12/12 both projects** — incl. "research node descriptions stay concrete" (the legibility guard), death-ledger research offer/persist, victory 2nd round, launch-node live effects, Chain Spark family gate, profile-scoped registry
- **sci-02-families-mastery 12/12 both projects** (adjacent regression — shared ResearchTree science infra intact)
- **boot probe 2/2** desktop + 390px — zero console/page errors (`reviews/shots-sci-copy/`)

## Findings
None blocking. Copy/legibility + DeathOverlay text change only; no mechanic change.
