# wire-e2-enemy-walk4 — the E2 outlaws learn to walk (lane-c; commit prefix "feat:")
CODEX: model=gpt-5.6-sol effort=medium
ATTENDED-AUTHORED 2026-07-12.

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B <lane-branch> main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything. **RESET AUTHORIZATION (attended, 2026-07-12):** every lane-c ahead commit through tip `884ab88d` (e2-pressure-in-run) is CONTENT-ON-MAIN via attended cherry-picks this window (content-probed, not ancestry). Reset the lane-c branch to main per the safe-dupe rule and PROCEED — do NOT re-STOP on aheadness.

## WHY: assets/LEDGER.md "2026-07-12 late — attended drain": `char.e2 rail_tough / steam_wrecker / coal_thief walk4 a+b — raw drained (6 sheets) — PENDING-PROCESSING`. The E2 enemies shipped as gameplay but walk with placeholder/static art; their walk4 candidate sheets sit unprocessed in assets/raw/.

## READ-FIRST: assets/raw/char-railtough-sheet-walk4-a.png + -b (and steamwrecker, coalthief pairs — 6 sheets total; inspect them BEFORE processing) · scripts/extract-alpha.mjs header + assets/LEDGER.md "Process notes" (--key ff00ff --grid 4x4 convention) · the claim_jumper walk4 precedent: assets/processed/char-jumper-sheet-walk4-a-r*.png + its frames.json + its block in assets/layer-contracts/characters.v2.json + wherever SpriteAnimator registers jumper walk4 (src/assets/SpriteAnimator.ts / generated.ts) · how E2 contract enemies get their visuals (the e2 enemy defs).

## SCOPE (each independently checkable):
1. SELECT one candidate per enemy (a vs b) by visual QA: consistent identity across all 4 direction rows, no mirrors, no frame reuse, clean #ff00ff key, no letters/firearms/gore. Record the a/b verdict + reasons per enemy in the report and the LEDGER line.
2. Process each WINNER: `node scripts/extract-alpha.mjs --key ff00ff --grid 4x4` → per-cell PNGs + frames.json in assets/processed/ (jumper convention). Verify per-sheet: cell count 16/16, keyed fraction sane, footline/scale consistent with existing enemy sprites (report numbers — the seam-law check the LEDGER walk8 entries model).
3. Wire walk4 for rail_tough, steam_wrecker, coal_thief exactly as claim_jumper is wired (layer-contract entries + runtime registration + enable flags). E2 contracts show walking enemies in all four directions; non-E2 contracts unchanged.
4. e2e `e2e/wire-e2-enemy-walk4.spec.ts`: boot an E2 contract (debug-seeded wave ok), assert the three enemy types render with walk4 runtime active (diagnostics or texture-key probe), frames advance while moving, zero console/page errors, desktop + mobile-390. E1 contract probe: jumper unchanged.

## Firewall
Touch ONLY: assets/processed/ (new cells+frames.json), assets/layer-contracts/characters.v2.json (three new blocks), the minimal runtime registration (SpriteAnimator/generated registry + e2 enemy visual defs), assets/LEDGER.md (retire the PENDING-PROCESSING line same-commit), e2e/wire-e2-enemy-walk4.spec.ts. NO edits to raw sheets, NO jumper/hero/baron changes, NO sim/balance/damage changes, NO CombatSystem edits.

## Self-check (evidence, not vibes)
`npx tsc --noEmit` + `npm run build` green · new spec green desktop+mobile-390 · task-025-bandits-dont-swim + en-02-e1-coverage UNMODIFIED-green (E1 enemies untouched) · zero console/page errors · screenshots of each E2 enemy walking (4 directions visible across shots) in artifacts/wire-e2-enemy-walk4/.
If you find yourself about to exit without changes, WRITE WHY into your report first — a silent no-op wastes a queue slot and a gate.
END: READY-FOR-GATES + report a/b selections with reasons, cell counts, keyed fractions, and footline numbers.
