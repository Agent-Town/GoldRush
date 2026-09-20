# Review: browser-door-held-gold — the browser door publishes the held purse at the secure tick (lane-b sparse worktree, Claude Opus 5 implementer, attended drain 2026-09-06 morning)

**Slice/branch/tip:** `browser-door-held-gold` · `fix/browser-door-held-gold` · commits `c986fd8a8`, `45ccca875` on base `10266f9fb` · merged to main: see the ledger row.
**Verdict:** MERGED. F-2464-4 closed: both doors now mean one thing by `score.gold`, the purse held at the secure tick. Five browser sites moved from lifetime panning to the held purse (`recordRunScore` `Game.ts:7180`, the `run_secured` handler `:1849`, `runTapeOutcome` `:7520`, `RunManager.secureRun` `:325`, the browser instrument `assay-replay.mjs:100`), one consequential lookup (`:8512`), and the run summary labels the number "gold held" while GOLD PANNED stays its own labelled stat. Hash-neutral by construction and by measurement: the event-log hash is taken over the event log only (`RunTape.ts:276`) and its `gold` was always `economy.gold`; one browser reel recorded on both trees replays to the same `fnv1a32:fefb78c9` with `score.gold` 30 (panned) before and 5 (held) after.

## Evidence
| Gate | Where | Result |
|---|---|---|
| Hash neutrality | worktree, `artifacts/browser-door-held-gold/hash-neutrality.json` | the same deterministic reel on main and on HEAD: `fnv1a32:fefb78c9`, 995 ticks, held 5 / panned 30 at the secure; posted gold 30 → 5, reel outcome 30 → 5, snapshot 30 → 5 |
| `tape-01-run-tape` | worktree, both projects | 5/5 each, replays to its recorded hash |
| E1 null floors | worktree | 21/21 byte-identical (the eraStamp aside), 187 s |
| `scripts/board-tape-gold.test.mjs` | worktree | 4/4 (was 3/3): the new arm rides a real browser run to its secure tick and asserts what the door POSTS (5 held vs 30 panned), the county never contacted; proven to bite (30 vs 5 with the old expressions restored) |
| `assay-replay.test.mjs` + `assay-worker.test.mjs` | worktree | 17/17 (+1 browser-arm pin; the browser instrument's cure is guarded by a labelled source pin because no browser replay fixture can separate held from panned without diverging on replay) |
| tsc / build / `test:stats` / `test:accounts` / `test:mp` | worktree | 0 / 0 / 87 + 308/308 + 26 / 43 / 466 |
| Targeted guards | worktree | `no-emdash`, `source-pointer`, `citation-title`, `stale-ready-for-gates`, `findings-state`, `desk-declaration`, `desk-birth`, `ruling-propagation` green; `law-pointer-guard` and `engine-era-guard` red on the predicted pointer and pin (cured by the drain) |
| e2e | worktree, own port 5302, both projects | `tape-01` + `assay-auto-tape` + `standing-formula-explained` + `door-epic-submit` 18/2; `lb-01-county-standings` 24/4; the run-summary set 67/3; every red attributed: F-BDHG-1 is this slice's meaning change (`m1-08:144` asserts `${panned} gold`), F-BDHG-2/3 pre-existing by control, F-BDHG-4 a load flake |
| Engine era | worktree hash `9268da65…` | re-measured on the merged tree by the drain and pinned there |
| Attended on the merged tree | see the drain commit and the ledger row | tsc, `test:stats` both arms, the gold guard, `tape-01` + `standing-formula-explained` at one worker on both projects, the `m1-08:144` re-point, the pointer re-base |

Screenshots: `artifacts/browser-door-held-gold/shots/standing-formula-explained-{desktop,mobile}-chrome.png` ("Wave 10 · 0 gold held · secured in 05:00", GOLD PANNED above).

## Live rows
There are no human rows to re-assay: the banked board (49 verified rows over 32 contracts at 2026-09-05T21:16:55Z) carries agent profiles only; the owner's Baron reference tape lives in the sibling repo and was never submitted. The agent rows the gold drain named (mare-claim, echo-canyon) keep their old snapshot until their contract is re-assayed; Moth Season was re-assayed today through the ADR-004 verb and prints 200.

## Merge classification
Base `10266f9fb`; main moved by the squall, the relay grit, the story gaps and the gold cure in `Game.ts` and the door. `src/game/Game.ts`, `src/game/RunManager.ts` (host type widened to `{ log, gold }`), `src/ui/DeathOverlay.ts`, `scripts/assay-replay.mjs`, `scripts/assay-replay.test.mjs`, `scripts/board-tape-gold.test.mjs`: LANE-TOUCHED, unioned where main moved. `artifacts/browser-door-held-gold/*`: NEW. `tasks/BACKLOG.md`: MAIN-MOVED, unioned. Attended in the landing commit: `e2e/m1-08-wave18-corrections.spec.ts:144` re-pointed to `${gold} gold held` (F-BDHG-1), `scripts/fire.md`'s pointer re-based by the measured shift, `public/skill.md`'s clause narrowed to the same-tick case.

## Findings
- **F-BDHG-1 (cured by the drain):** one spec asserted the panned number in the standing row.
- **F-BDHG-2 / F-BDHG-3 (pre-existing, control-proven):** `assay-auto-tape:55` never banks the claim so its POST never fires; `lb-01-county-standings:387/:654`.
- **F-2464-1 follow-up (cured by the drain):** the skill.md clause overstated the same-tick rule.
- **Spec-owned screenshots** under `reviews/shots-standing-formula-explained/`, `artifacts/locked-win/`, `artifacts/m4-08-attribution/`, `artifacts/county-standings/`, `reviews/shots-fd*` will move on their next run (the label changed); not regenerated here.
