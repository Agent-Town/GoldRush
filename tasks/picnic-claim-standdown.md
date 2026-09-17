# Task picnic-claim-standdown: the Picnic's three sandwiches fall in sequence, not together — a 20-second stand-down between stake claims (A21 ruled (a); scratch worktree implementer — Opus on the Anthropic subscription; commit prefix "feat:")

You are the implementer for Gold Rush, working in a scratch worktree cut from main by the attended session (never a lane while `tasks/CODEX-WALL` stands; never Codex).
READ FIRST: AGENTS.md; `artifacts/playability-first-wave-e2-e6/report.md` (the Picnic section: the killer is the hold rule, not damage — three Feral Toasters each hold a 3-u disc for the 6-s clock and `PicnicHoldSystem.update` declares the loss when all three are claimed at 14.5 s / 25.8 s / 37.0 s; two `src/` dials measured and rejected; the exact diff of the stand-down that works, measured to reach wave 2 with the unbuilt run still ending at 82 s, hero 80.4 HP); `docs/OWNER-DESK-2026-09-06.md` §A21 (RULED 2026-09-17); `src/systems/PicnicHoldSystem.ts` on main; `e2e/e6-picnic-opening.spec.ts` (its card words, incl. `:366` "first machines reach the meadow inside ten seconds", must stay TRUE and untouched); `e2e/playability-smoke.spec.ts` (the acceptance test).
Pre-flight: clean worktree cut from main; `npm run build` green before touching anything; `/opt/homebrew/bin` first on PATH (Node 26).

## Why (owner, verbatim)
2026-09-16 "yeah, we have tokens left - lets work on these failing contracts" → the first-wave master STOPPED on the Picnic because its cure was `src/`; 2026-09-17, choosing among the week's work with A21 listed under recommendation (a): "Lets do them all." · "All on the Anthropic subscription". Option (a) keeps the map, the card and the loss rule exactly as written and only makes the three falls serial.

## Scope
1. Apply the report's diff to `src/systems/PicnicHoldSystem.ts` as written (`PICNIC_CLAIM_STANDDOWN_SECONDS = 20`, `lastClaimAt`, the `pressureTarget` gate, the `update` stamp, the `reset`), with its comment naming F-PLAY-E6-1 and A21.
2. Prove it: the smoke for `e6-picnic` (`GR_PLAYABILITY_SMOKE=1 … -g "e6-picnic"`) green three runs on both projects; `e2e/e6-picnic-opening.spec.ts` unmodified-green both projects (the card's ten-second line still measures true); `e2e/e6-roster.spec.ts` green; the null floors re-recorded (`node scripts/null-floor-anchors.mjs`, then `--check`) and the Picnic's two pairs reported before → after (the unbuilt run must still LOSE — report the second it ends).
3. tsc, `npm run build`, plain boot of the Picnic with zero console/page errors desktop + 390 px, `computeEngineHash()` reported (`src` moves it; the drain pins).
4. Report `artifacts/picnic-claim-standdown/report.md`: the three-run smoke results, the floor deltas, the card check, the hash. If you find yourself about to exit without changes, WRITE WHY first.

## Firewall
Touch ONLY: `src/systems/PicnicHoldSystem.ts` (the diff), `assets/contracts/null-floors.json` (re-record), `artifacts/picnic-claim-standdown/**`. NO changes to: the Picnic's contract data, `e2e/e6-picnic-opening.spec.ts`, any other `src/`, `Balance.ts`, `assets/engine-era.json`, the ledger files.

## Self-check
Smoke 3/3 × 2 projects for e6-picnic; opening spec green unmodified; floors clean; the report.
End: READY-FOR-GATES + the smoke times, the floor deltas, the hash.
