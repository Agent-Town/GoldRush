# DRAFT (UNQUEUED) — E7 + E10: landable eras (contracts claimable, bosses/finale off their debug flags)
> Authored by the saga-rehearsal interpretation leg 2026-07-22 as P0 correctives for F-REH-02 and F-REH-03 (reviews/saga-rehearsal-2026-07-22.md). NOT queued. Two independent slices — queue separately, one lane each. Companion to DRAFT-t6-t10-ceremonies.md: that draft builds the doors BETWEEN eras; this one makes the eras behind the doors landable. Both are needed before any era past E6 is player-real.

## ROLE / WORKDIR
Lane runner per slice; content + wiring only.

## WHY (evidence, dated 2026-07-22)
- All four epoch-7 contracts AND all four epoch-10 contracts ship `harvestAnchors: []`. `resolveActiveContract` treats zero anchors as unavailable (src/meta/ContractFamilies.ts:1125–1133) and opens The Claim instead — verified live in the rehearsal: `?contract=e7-relay-valley` and `?contract=e10-last-claim` both booted `the-claim` (run-all.log; ten minutes of "E7" footage are The Claim).
- THE ECHO runs only behind `&e7boss` on The Claim (e2e/e7-boss.spec.ts:8 — "production system on the stable Claim without broadening its live contract"). THE STATIC + finale run only behind `&e10static` / `__GR_TEST__.e10Finale` seams (e2e/e10-static-boss.spec.ts:3). Mistake #10 class (Debug-Gate Leftover): in a plain boot the PLAYER sees none of it.
- The finale's downstream chain is already sound once triggered (rehearsal, live: re-ink → river lever → The River charter → post-credits river vista per the 064 law).

## SCOPE
**Slice 1 — E7 lands (F-REH-02):**
1. Give `e7-relay-valley` (the flagship) real `harvestAnchors` consistent with its buildZones/lanes; it must boot directly and via board launch.
2. Attach THE ECHO to that contract in plain play (arrival wave per its spec), removing the `e7boss`-flag-only gating for the live contract while keeping the flag for the e2e harness on The Claim.
3. Decide-and-record for `e7-dead-band` / `e7-relay-rush` / `e7-echo-canyon`: either anchors or an explicit board-launch-only marker — one OWNER'S DESK line if design intent is unclear.

**Slice 2 — E10 lands (F-REH-03):**
1. Give `e10-last-claim` real `harvestAnchors`; direct boot + board launch.
2. THE STATIC engages on that contract in plain play (no `&e10static`), preserving the e2e flag path on The Claim.
3. The finale entry (re-ink offer → river lever) triggers from real play state (Static receded / science ceiling per spec), not only `e10Finale.close()`; the existing lever→River→post-credits chain is already verified and must not change.
4. Same decide-and-record for `e10-ember-shore` / `e10-archive-world` / `e10-river` (e10-river may be post-credits-only by design — record it).

## FIREWALL
TOUCH-ONLY: `assets/contracts/epoch-7-signal/contracts.json`, `assets/contracts/epoch-10-deepsky/contracts.json`, the minimal boss/finale gating reads (`src/` echo + e10 static entry conditions), the two eras' e2e specs. NO combat/economy edits, NO touching other epochs, NO removing the debug flags the e2e harness uses.

## SELF-CHECK / GATES (per slice)
- Plain boot `/?contract=<flagship>` (no debug) resolves to the flagship, not The Claim; briefing names the era's tile.
- Boss/Static arrives and plays its acts in plain play on that contract (new or extended e2e, no `&e7boss`/`&e10static` on the assertion path).
- Existing e7-boss / e10-static-boss specs stay green (flag path preserved). Adjacent suites unmodified-green.
- tsc, build, zero console/page errors, desktop + 390px, screenshots.
- The saga-rehearsal driver's E7/E10 segments then rehearse the REAL contracts — acceptance proof.

READY-FOR-GATES when queued + report: flagship boot proof, boss-arrival screenshot, flag-path e2e still green.
